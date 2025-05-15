import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { getJwtConfig } from "../config/auth";
import { TokenPayload, RequestUser } from "../@types/User";

// Versão assíncrona interna
const asyncAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  logger.info(`[Auth] Rota acessada: ${req.method} ${req.originalUrl}`);

  if (!authHeader) {
    logger.warn(`[Auth] Tentativa de acesso sem token: ${req.method} ${req.originalUrl}`);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    // Obter configuração JWT de forma assíncrona
    const { secret } = await getJwtConfig();
    
    const decoded = verify(token, secret) as TokenPayload;
    const user: RequestUser = {
      id: decoded.id,
      profile: decoded.profile,
      isSuper: decoded.super,
      companyId: decoded.companyId
    };

    req.user = user;
    req.tokenData = decoded;
    logger.info(`[Auth] Usuário ${user.id} (${user.profile}) acessou: ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    logger.error(`[Auth] Erro de validação do token na rota ${req.method} ${req.originalUrl}:`, err);
    next(new AppError("Invalid token. We'll try to assign a new one on next request", 403));
  }
};

// Wrapper para compatibilidade com Express
const isAuth = (req: Request, res: Response, next: NextFunction) => {
  asyncAuth(req, res, next).catch(next);
};

export default isAuth;