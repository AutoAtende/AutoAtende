import { sign } from "jsonwebtoken";
import { getJwtConfig } from "../config/auth";
import { SafeUser } from '../@types/User';
import { logger } from '../utils/logger';

export const createAccessToken = async (user: SafeUser): Promise<string> => {
  const { secret, expiresIn } = (await getJwtConfig());

  logger.info("Iniciando a criação do Access Token...");
  logger.info(`Criando token para o usuário: { id: ${user.id}, username: ${user.name}, super: ${user.super}, companyId: ${user.companyId} }`);

  const accessToken = sign(
    {
      id: user.id,
      username: user.name,
      profile: user.profile,
      super: user.super,
      companyId: user.companyId
    },
    secret,
    { expiresIn }
  );

  logger.info(`Access Token criado com sucesso para o usuário ${user.name} (expira em ${expiresIn}).`);
  return accessToken;
};

export const createRefreshToken = async (user: SafeUser): Promise<string> => {
  const { refreshSecret, refreshExpiresIn } = (await getJwtConfig());

  logger.info("Iniciando a criação do Refresh Token...");
  logger.info(`Criando refresh token para o usuário: { id: ${user.id}, tokenVersion: ${user.tokenVersion}, companyId: ${user.companyId} }`);

  const refreshToken = sign(
    { 
      id: user.id,
      tokenVersion: user.tokenVersion,
      companyId: user.companyId 
    },
    refreshSecret,
    { expiresIn: refreshExpiresIn }
  );

  logger.info(`Refresh Token criado com sucesso para o usuário ${user.name} (expira em ${refreshExpiresIn}).`);
  return refreshToken;
};