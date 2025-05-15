import { cacheLayer } from "../libs/cache";
import { logger } from "../utils/logger";

type JwtConfig = {
    secret: string | null;
    expiresIn: number;
    refreshSecret: string | null;
    refreshExpiresIn: number;
};

const CACHE_KEY_JWT_SECRET = "JWT_SECRET";
const CACHE_KEY_JWT_REFRESH_SECRET = "JWT_REFRESH_SECRET";

function generateSecret(length: number): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    let secret = "";
    for (let i = 0; i < length; i += 1) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        secret += charset[randomIndex];
    }
    return secret;
}

async function generateSecretIfNotExists(cacheKey: string): Promise<string> {
    let secret = await cacheLayer.get(cacheKey);
    if (!secret) {
        secret = generateSecret(32);
        await cacheLayer.set(cacheKey, secret);
        logger.debug(`[auth.ts] Generated ${cacheKey}: ${secret}`);
    } else {
        logger.debug(`[auth.ts] Loaded ${cacheKey}: ${secret}`);
    }
    return secret;
}

let jwtConfig: JwtConfig | null = null;

export const getJwtConfig = async (): Promise<JwtConfig> => {
    if (!jwtConfig) {
      const [secret, refreshSecret] = await Promise.all([
        generateSecretIfNotExists(CACHE_KEY_JWT_SECRET),
        generateSecretIfNotExists(CACHE_KEY_JWT_REFRESH_SECRET)
      ]);
      
      jwtConfig = {
        secret,
        expiresIn: 3600*5,
        refreshSecret,
        refreshExpiresIn: 3600*100
      };
    }
    
    return jwtConfig;
  };

export default getJwtConfig;
