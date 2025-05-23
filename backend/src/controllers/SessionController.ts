import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import FindUserFromToken from "../services/AuthServices/FindUserFromToken";
import { SerializeUser } from "../helpers/SerializeUser";
import { createAccessToken, createRefreshToken } from "../helpers/CreateTokens";
import Company from "../models/Company";
import Setting from "../models/Setting";
import User from "../models/User";
import { logger } from "../utils/logger";
import NodeCache from '@cacheable/node-cache';

// Cache para tokens e sessões ativas
const tokenCache = new NodeCache({ stdTTL: 30 });
const activeSessionsCache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 24 horas

interface UserSession {
  sessionId: string;
  userId: number;
  companyId: number;
  loginTime: Date;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
}

// Função para gerenciar sessões ativas
const manageUserSessions = (userId: number, companyId: number, newSessionId: string, userAgent?: string, ipAddress?: string) => {
  const sessionKey = `user_sessions_${userId}`;
  const existingSessions: UserSession[] = activeSessionsCache.get(sessionKey) || [];
  
  // Filtrar sessões expiradas (mais de 24 horas)
  const validSessions = existingSessions.filter(session => {
    const timeDiff = Date.now() - session.lastActivity.getTime();
    return timeDiff < (24 * 60 * 60 * 1000); // 24 horas
  });
  
  // Adicionar nova sessão
  const newSession: UserSession = {
    sessionId: newSessionId,
    userId,
    companyId,
    loginTime: new Date(),
    lastActivity: new Date(),
    userAgent,
    ipAddress
  };
  
  validSessions.push(newSession);
  
  // Salvar sessões atualizadas
  activeSessionsCache.set(sessionKey, validSessions);
  
  // Retornar sessões anteriores para notificar logout
  return validSessions.filter(session => session.sessionId !== newSessionId);
};

// Função para remover sessão específica
const removeUserSession = (userId: number, sessionId: string) => {
  const sessionKey = `user_sessions_${userId}`;
  const existingSessions: UserSession[] = activeSessionsCache.get(sessionKey) || [];
  
  const updatedSessions = existingSessions.filter(session => session.sessionId !== sessionId);
  
  if (updatedSessions.length > 0) {
    activeSessionsCache.set(sessionKey, updatedSessions);
  } else {
    activeSessionsCache.del(sessionKey);
  }
};

// Função para atualizar atividade da sessão
export const updateSessionActivity = (userId: number, sessionId: string) => {
  const sessionKey = `user_sessions_${userId}`;
  const existingSessions: UserSession[] = activeSessionsCache.get(sessionKey) || [];
  
  const updatedSessions = existingSessions.map(session => {
    if (session.sessionId === sessionId) {
      return { ...session, lastActivity: new Date() };
    }
    return session;
  });
  
  activeSessionsCache.set(sessionKey, updatedSessions);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, sessionId } = req.body;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.connection.remoteAddress;

  logger.info(`Tentando autenticar usuário com email: ${email}, sessionId: ${sessionId}`);

  try {
    if (!email || !password) {
      logger.warn("Credenciais inválidas: Email ou senha faltando.");
      throw new AppError("ERR_INVALID_CREDENTIALS", 400);
    }

    if (!sessionId) {
      logger.warn("Session ID não fornecido.");
      throw new AppError("ERR_SESSION_ID_REQUIRED", 400);
    }

    const { token, serializedUser, refreshToken } = await AuthUserService({
      email,
      password
    });

    logger.info(`Usuário autenticado: ${serializedUser.id}, gerenciando sessões.`);

    // Gerenciar sessões ativas - obter sessões anteriores
    const previousSessions = manageUserSessions(
      serializedUser.id,
      serializedUser.companyId,
      sessionId,
      userAgent,
      ipAddress
    );

    SendRefreshToken(res, refreshToken);

    const io = getIO();
    
    // Notificar logout forçado para sessões anteriores
    if (previousSessions.length > 0) {
      logger.info(`Forçando logout de ${previousSessions.length} sessões anteriores para usuário ${serializedUser.id}`);
      
      previousSessions.forEach(session => {
        try {
          io.to(`company-${serializedUser.companyId}-mainchannel`).emit(
            `company-${serializedUser.companyId}-auth`,
            {
              action: "force_logout",
              user: { 
                id: serializedUser.id,
                email: serializedUser.email,
                companyId: serializedUser.companyId
              },
              sessionId: session.sessionId,
              message: "Sua conta foi acessada em outro dispositivo"
            }
          );
        } catch (socketError) {
          logger.error(`Erro ao notificar logout forçado para sessão ${session.sessionId}:`, socketError);
        }
      });
    }

    // Emitir evento de novo login bem-sucedido
    try {
      io.to(`company-${serializedUser.companyId}-mainchannel`).emit(
        `company-${serializedUser.companyId}-auth`,
        {
          action: "login_success",
          user: {
            id: serializedUser.id,
            email: serializedUser.email,
            companyId: serializedUser.companyId
          },
          sessionId: sessionId
        }
      );
    } catch (socketError) {
      logger.error('Erro ao emitir evento de login bem-sucedido:', socketError);
    }

    // Formatar resposta completa para o frontend
    const responseUser = {
      id: serializedUser.id,
      name: serializedUser.name,
      email: serializedUser.email,
      profile: serializedUser.profile,
      profilePic: serializedUser.profilePic,
      super: serializedUser.super,
      number: serializedUser.number,
      color: serializedUser.color,
      companyId: serializedUser.companyId,
      company: {
        id: serializedUser.company?.id,
        name: serializedUser.company?.name,
        dueDate: serializedUser.company?.dueDate,
        status: serializedUser.company?.status,
        settings: serializedUser.company?.settings || []
      },
      queues: serializedUser.queues || [],
      startWork: serializedUser.startWork || '',
      endWork: serializedUser.endWork || '',
      allTicket: serializedUser.allTicket || false
    };

    logger.info(`Login bem-sucedido para usuário ${serializedUser.id} com sessionId ${sessionId}`);

    return res.status(200).json({
      token,
      user: responseUser,
      sessionId
    });

  } catch (error) {
    logger.error(`Erro durante autenticação: ${error.message}`);
    throw new AppError(error.message, 401);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const { sessionId } = req.body;
  const authSessionId = req.headers['x-session-id'] as string;

  // Usar sessionId do header se não estiver no body
  const currentSessionId = sessionId || authSessionId;

  if (!token) {
    logger.warn("Token de refresh não encontrado no cookie.");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  if (!currentSessionId) {
    logger.warn("Session ID não fornecido para refresh token.");
    throw new AppError("ERR_SESSION_ID_REQUIRED", 400);
  }

  try {
    // Verificar se já existe um token válido em cache
    const cacheKey = `${token}_${currentSessionId}`;
    const cachedToken = tokenCache.get(cacheKey);
    if (cachedToken) {
      logger.info("Retornando token em cache");
      // Atualizar atividade da sessão
      const user = cachedToken.user;
      updateSessionActivity(user.id, currentSessionId);
      return res.json(cachedToken);
    }

    logger.info(`Tentando renovar token para sessionId: ${currentSessionId}`);
    const { user, newToken, refreshToken } = await RefreshTokenService(res, token);

    // Verificar se a sessão ainda é válida
    const sessionKey = `user_sessions_${user.id}`;
    const existingSessions: UserSession[] = activeSessionsCache.get(sessionKey) || [];
    const validSession = existingSessions.find(session => session.sessionId === currentSessionId);

    if (!validSession) {
      logger.warn(`Sessão inválida ou expirada: ${currentSessionId} para usuário ${user.id}`);
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Atualizar atividade da sessão
    updateSessionActivity(user.id, currentSessionId);

    // Armazenar o resultado em cache
    const result = { token: newToken, user, sessionId: currentSessionId };
    tokenCache.set(cacheKey, result);

    logger.info(`Token renovado para o usuário: ${user.id}, sessionId: ${currentSessionId}`);
    SendRefreshToken(res, refreshToken);

    return res.json(result);
  } catch (err) {
    logger.error(`Erro ao renovar o token: ${err.message}`);
    throw new AppError("ERR_TOKEN_RENEWAL_FAILED", 401);
  }
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const sessionId = req.headers['x-session-id'] as string;

  if (!token) {
    logger.warn("Token de refresh não encontrado no cookie ao tentar buscar dados do usuário.");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  try {
    logger.info("Buscando informações do usuário a partir do token...");
    const user = await FindUserFromToken(token);
    const { id, profile, super: superAdmin } = user;

    // Se há sessionId, atualizar atividade
    if (sessionId) {
      updateSessionActivity(id, sessionId);
    }

    logger.info(`Usuário encontrado: ${id}`);
    return res.json({ id, profile, super: superAdmin });
  } catch (err) {
    logger.error(`Erro ao buscar usuário pelo token: ${err.message}`);
    throw new AppError("ERR_INVALID_TOKEN", 401);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  const { sessionId } = req.body;
  const authSessionId = req.headers['x-session-id'] as string;

  // Usar sessionId do header se não estiver no body
  const currentSessionId = sessionId || authSessionId;

  logger.info(`Tentando desconectar o usuário: ${id}, sessionId: ${currentSessionId}`);

  const user = await User.findByPk(id);
  if (!user) {
    logger.warn(`Usuário não encontrado: ${id}`);
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Remover a sessão específica
  if (currentSessionId) {
    removeUserSession(Number(id), currentSessionId);
    logger.info(`Sessão ${currentSessionId} removida para usuário ${id}`);
  }

  // Verificar se ainda há sessões ativas
  const sessionKey = `user_sessions_${id}`;
  const remainingSessions: UserSession[] = activeSessionsCache.get(sessionKey) || [];
  
  // Se não há mais sessões ativas, atualizar status online
  if (remainingSessions.length === 0) {
    await user.update({ online: false });
    logger.info(`Usuário ${id} totalmente desconectado. Atualizando status online.`);
  } else {
    logger.info(`Usuário ${id} ainda possui ${remainingSessions.length} sessões ativas.`);
  }

  // Emitir evento de logout
  const io = getIO();
  try {
    io.to(`company-${user.companyId}-mainchannel`).emit(
      `company-${user.companyId}-auth`,
      {
        action: "logout",
        user: { 
          id: id,
          companyId: user.companyId
        },
        sessionId: currentSessionId
      }
    );
  } catch (socketError) {
    logger.error('Erro ao emitir evento de logout:', socketError);
  }

  res.clearCookie("jrt");
  logger.info("Cookie de refresh token removido.");

  return res.status(200).send();
};

export const impersonate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const { companyId } = req.params;
  const sessionId = req.headers['x-session-id'] as string || `impersonate_${Date.now()}`;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const user = await User.findOne({
    where: { companyId: Number(companyId), profile: "admin" },
    include: ["queues", { model: Company, include: [{ model: Setting }] }]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const newToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);
  const serializedUser = await SerializeUser(user);

  // Gerenciar sessão de impersonificação
  const previousSessions = manageUserSessions(
    serializedUser.id,
    serializedUser.companyId,
    sessionId,
    req.headers['user-agent'],
    req.ip
  );

  SendRefreshToken(res, refreshToken);

  const io = getIO();
  
  // Notificar outras sessões sobre impersonificação
  io.to(`user-${serializedUser.id}`).emit(
    `company-${serializedUser.companyId}-auth`,
    {
      action: "impersonated",
      user: {
        id: serializedUser.id,
        email: serializedUser.email,
        companyId: serializedUser.companyId,
        impersonated: true
      },
      sessionId: sessionId
    }
  );

  return res.status(200).json({
    token: newToken,
    user: serializedUser,
    sessionId
  });
};

// Endpoint adicional para listar sessões ativas (opcional - para debug/admin)
export const getActiveSessions = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  
  const sessionKey = `user_sessions_${id}`;
  const sessions: UserSession[] = activeSessionsCache.get(sessionKey) || [];
  
  // Remover informações sensíveis antes de retornar
  const safeSessions = sessions.map(session => ({
    sessionId: session.sessionId,
    loginTime: session.loginTime,
    lastActivity: session.lastActivity,
    userAgent: session.userAgent?.substring(0, 100), // Truncar para segurança
    ipAddress: session.ipAddress
  }));
  
  return res.json({
    sessions: safeSessions,
    totalSessions: sessions.length
  });
};