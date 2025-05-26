import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { getJwtConfig } from "../config/auth";
import { TokenPayload, RequestUser } from "../@types/User";
import User from "../models/User";

// Lista de rotas que devem ser excluídas da autenticação
const EXCLUDED_PATHS = [
  '/public/',           // Arquivos estáticos públicos
  '/public-settings/',  // Configurações públicas
  '/health',           // Health check
  '/favicon.ico',      // Favicon
  '/robots.txt',       // Robots.txt
  '/auth/login',
  '/auth/refresh_token',
  '/auth/signup',
  '/auth/impersonate/:companyId',
];

// Função para verificar se a rota deve ser excluída da autenticação
const shouldExcludeFromAuth = (path: string): boolean => {
  return EXCLUDED_PATHS.some(excludedPath => {
    if (excludedPath.endsWith('/')) {
      return path.startsWith(excludedPath);
    }
    return path === excludedPath;
  });
};

// Versão assíncrona interna
const asyncAuth = async (req: Request, res: Response, next: NextFunction) => {
  const requestPath = req.originalUrl || req.path;
  const sessionId = req.headers['x-session-id'] as string;
  const authHeader = req.headers.authorization;

  // Verificar se a rota deve ser excluída da autenticação
  if (shouldExcludeFromAuth(requestPath)) {
    logger.debug(`[Auth] Rota excluída da autenticação: ${req.method} ${requestPath}`);
    return next();
  }

  // Para rotas que requerem autenticação, verificar se o token existe
  if (!authHeader) {
    logger.warn(`[Auth] Tentativa de acesso sem token: ${req.method} ${requestPath}`);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    logger.warn(`[Auth] Token vazio: ${req.method} ${requestPath}`);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  try {
    // Obter configuração JWT de forma assíncrona
    const { secret } = await getJwtConfig();
    
    const decoded = verify(token, secret) as TokenPayload;
    
    // Verificar se o token está expirado
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      logger.warn(`[Auth] Token expirado: ${req.method} ${requestPath}`);
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // VALIDAÇÃO CORRIGIDA: Verificar se está tentando acessar recursos de outra empresa
    const requestedCompanyId = req.params.companyId ? Number(req.params.companyId) : null;
    
    // Permitir acesso apenas se:
    // 1. É um usuário super da empresa 1 (acesso total)
    // 2. OU está acessando recursos da própria empresa
    // 3. OU não há companyId específico na requisição
    const isSuperUserFromCompany1 = decoded.super === true && decoded.companyId === 1;
    const isAccessingOwnCompany = !requestedCompanyId || requestedCompanyId === decoded.companyId;
    
    if (!isSuperUserFromCompany1 && !isAccessingOwnCompany) {
      logger.warn(`[Auth] Tentativa de acesso negado - Usuário: ${decoded.id}, CompanyId: ${decoded.companyId}, Super: ${decoded.super}, Tentando acessar empresa: ${requestedCompanyId}`);
      return res.status(403).json({ 
        status: 'ERRO', 
        error: 'Acesso negado a recursos de outra empresa' 
      });
    }

    // Log para debug de usuários super
    if (isSuperUserFromCompany1 && requestedCompanyId && requestedCompanyId !== decoded.companyId) {
      logger.info(`[Auth] Usuário super da empresa 1 (ID: ${decoded.id}) acessando empresa ${requestedCompanyId}`);
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
        logger.error(`[Auth] Usuário não encontrado para token: ${req.method} ${requestPath}`);
        throw new AppError("ERR_INVALID_USER", 401);
      }
      
      // Verificar se a versão do token é a atual
      if (dbUser.tokenVersion !== undefined && decoded.tokenVersion !== undefined && 
          dbUser.tokenVersion !== decoded.tokenVersion) {
        logger.warn(`[Auth] Versão de token inválida: ${req.method} ${requestPath}`);
        throw new AppError("ERR_SESSION_EXPIRED", 401);
      }
      
      // Verificar se o companyId do token corresponde ao do usuário no banco
      if (dbUser.companyId !== decoded.companyId) {
        logger.error(`[Auth] Token com companyId (${decoded.companyId}) diferente do usuário (${dbUser.companyId}): ${req.method} ${requestPath}`);
        throw new AppError("ERR_INVALID_COMPANY_TOKEN", 401);
      }
      
      // Atualizar status online (de forma não bloqueante)
      dbUser.update({ online: true }).catch(error => {
        logger.warn(`[Auth] Erro ao atualizar status online do usuário ${decoded.id}: ${error.message}`);
      });

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
    
    logger.debug(`[Auth] Usuário ${user.id} (${user.profile}) autenticado para: ${req.method} ${requestPath}`);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error(`[Auth] Erro de validação do token na rota ${req.method} ${requestPath}:`, err);
    throw new AppError("Invalid token. We'll try to assign a new one on next request", 403);
  }
};

// Wrapper para compatibilidade com Express
const isAuth = (req: Request, res: Response, next: NextFunction) => {
  asyncAuth(req, res, next).catch(next);
};

export default isAuth;