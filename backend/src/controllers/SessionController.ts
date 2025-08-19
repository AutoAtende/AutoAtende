import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/optimizedSocket";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import FindUserFromToken from "../services/AuthServices/FindUserFromToken";
import { SerializeUser } from "../helpers/SerializeUser";
import { createAccessToken, createRefreshToken } from "../helpers/CreateTokens";
import Company from "../models/Company";
import Setting from "../models/Setting";
import User from "../models/User";
import { logger } from "../utils/logger"; // Assumindo que você tenha um logger configurado
import NodeCache from '@cacheable/node-cache';
const tokenCache = new NodeCache({ stdTTL: 30 }); 

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  logger.info(`Tentando autenticar usuário com email: ${email}`);

  try {
    if (!email || !password) {
      logger.warn("Credenciais inválidas: Email ou senha faltando.");
      throw new AppError("ERR_INVALID_CREDENTIALS", 400);
    }

    const { token, serializedUser, refreshToken } = await AuthUserService({
      email,
      password
    });

    logger.info(`Usuário autenticado: ${serializedUser.id}, enviando refresh token.`);
    SendRefreshToken(res, refreshToken);

    // Objeto para o socket
    const socketUser = {
      id: serializedUser.id,
      email: serializedUser.email,
      companyId: serializedUser.companyId
    };

    const io = getIO();
    logger.info(`Emitindo evento de autenticação para a empresa: ${serializedUser.companyId}`);
    
    try {
      io.to(`company-${serializedUser.companyId}-mainchannel`).emit(
        `company-${serializedUser.companyId}-auth`, 
        {
          action: "update",
          user: socketUser,
          timestamp: Date.now() // ÚNICA ALTERAÇÃO: adicionar timestamp
        }
      );
    } catch (socketError) {
      logger.error('Erro ao emitir evento socket:', socketError);
    }

    // Formata resposta completa para o frontend
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

    // Retorna resposta padronizada
    return res.status(200).json({
      token,
      user: responseUser
    });

  } catch (error) {
    logger.error(`Erro durante autenticação: ${error.message}`);
    throw new AppError(error.message, 401);
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    logger.warn("Token de refresh não encontrado no cookie.");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  try {
    // Verifica se já existe um token válido em cache
    const cachedToken = tokenCache.get(token);
    if (cachedToken) {
      logger.info("Retornando token em cache");
      return res.json(cachedToken);
    }

    logger.info("Tentando renovar token...");
    const { user, newToken, refreshToken } = await RefreshTokenService(res, token);

    // Armazena o resultado em cache
    const result = { token: newToken, user };
    tokenCache.set(token, result);

    logger.info(`Token renovado para o usuário: ${user.id}, enviando novo refresh token.`);
    SendRefreshToken(res, refreshToken);

    return res.json(result);
  } catch (err) {
    logger.error(`Erro ao renovar o token: ${err.message}`);
    throw new AppError("ERR_TOKEN_RENEWAL_FAILED", 401);
  }
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    logger.warn("Token de refresh não encontrado no cookie ao tentar buscar dados do usuário.");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  try {
    logger.info("Buscando informações do usuário a partir do token...");
    const user = await FindUserFromToken(token);
    const { id, profile, super: superAdmin } = user;

    logger.info(`Usuário encontrado: ${id}`);
    return res.json({ id, profile, super: superAdmin });
  } catch (err) {
    logger.error(`Erro ao buscar usuário pelo token: ${err.message}`);
    throw new AppError("ERR_INVALID_TOKEN", 401);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;

  logger.info(`Tentando desconectar o usuário: ${id}`);

  const user = await User.findByPk(id);
  if (!user) {
    logger.warn(`Usuário não encontrado: ${id}`);
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  await user.update({ online: false });
  logger.info(`Usuário ${id} desconectado. Atualizando status online.`);

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

  SendRefreshToken(res, refreshToken);

  const io = getIO();
  io.to(`user-${serializedUser.id}`).emit(
    `company-${serializedUser.companyId}-auth`,
    {
      action: "update",
      user: {
        id: serializedUser.id,
        email: serializedUser.email,
        companyId: serializedUser.companyId,
        impersonated: true
      }
    }
  );

  return res.status(200).json({
    token: newToken,
    user: serializedUser
  });
};