import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { getJwtConfig } from "../config/auth";
import { updateSessionActivity } from "../controllers/SessionController";
import { TokenPayload, RequestUser } from "../@types/User";
import User from "../models/User";

// Versão assíncrona interna
const asyncAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-session-id'] as string;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn(`[Auth] Tentativa de acesso sem token: ${req.method} ${req.originalUrl}`);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    // Obter configuração JWT de forma assíncrona
    const { secret } = await getJwtConfig();
    
    const decoded = verify(token, secret) as TokenPayload;
    
    // Verificar se o token está expirado
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      logger.warn(`[Auth] Token expirado: ${req.method} ${req.originalUrl}`);
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // NOVA VALIDAÇÃO: Verificar se está tentando acessar recursos de outra empresa
    const requestedCompanyId = req.params.companyId ? Number(req.params.companyId) : null;
    
    if (requestedCompanyId && requestedCompanyId !== decoded.companyId) {
      logger.warn(`Tentativa de acesso a recursos da empresa ${requestedCompanyId} com token da empresa ${decoded.companyId}`);
      return res.status(403).json({ 
        status: 'ERRO', 
        error: 'Acesso negado a recursos de outra empresa' 
      });
    }
    
    // Criar objeto de usuário para o request
    const user: RequestUser = {
      id: decoded.id,
      profile: decoded.profile,
      isSuper: decoded.super,
      companyId: decoded.companyId
    };
    
    // Verificar se o usuário existe e está ativo
    try {
      const dbUser = await User.findByPk(decoded.id);
      
      if (!dbUser) {
        logger.error(`[Auth] Usuário não encontrado para token: ${req.method} ${req.originalUrl}`);
        throw new AppError("ERR_INVALID_USER", 401);
      }
      
      // Verificar se a versão do token é a atual
      if (dbUser.tokenVersion !== undefined && decoded.tokenVersion !== undefined && 
          dbUser.tokenVersion !== decoded.tokenVersion) {
        logger.warn(`[Auth] Versão de token inválida: ${req.method} ${req.originalUrl}`);
        throw new AppError("ERR_SESSION_EXPIRED", 401);
      }
      
      // Verificar se o companyId do token corresponde ao do usuário no banco
      if (dbUser.companyId !== decoded.companyId) {
        logger.error(`[Auth] Token com companyId (${decoded.companyId}) diferente do usuário (${dbUser.companyId}): ${req.method} ${req.originalUrl}`);
        throw new AppError("ERR_INVALID_COMPANY_TOKEN", 401);
      }
      
      // Atualizar status online
      await dbUser.update({ online: true });

      // Atualizar atividade da sessão
      if (sessionId) {
        updateSessionActivity(Number(user.id), sessionId);
      } 
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`[Auth] Erro ao verificar usuário: ${error.message}`);
      throw new AppError("ERR_AUTH_CHECK_FAILED", 500);
    }

    // Atribuir ao request
    req.user = user;
    req.tokenData = decoded;
    req.companyId = decoded.companyId;
    
    logger.info(`[Auth] Usuário ${user.id} (${user.profile}) acessou: ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error(`[Auth] Erro de validação do token na rota ${req.method} ${req.originalUrl}:`, err);
    throw new AppError("Invalid token. We'll try to assign a new one on next request", 403);
  }
};

// Wrapper para compatibilidade com Express
const isAuth = (req: Request, res: Response, next: NextFunction) => {
  asyncAuth(req, res, next).catch(next);
};

export default isAuth;