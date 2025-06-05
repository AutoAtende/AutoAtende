import IORedis, { RedisOptions } from 'ioredis';
import * as dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

dotenv.config({ 
  path: process.env.NODE_ENV === 'test' 
    ? path.join(__dirname, '../../.env.test')
    : path.join(__dirname, '../../.env')
});

export interface BullConfig {
  connection: IORedis;
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: string;
      delay: number;
    };
    removeOnComplete: boolean;
    removeOnFail: boolean;
  };
}

// Configuração otimizada do Redis
export const redisConfig: RedisOptions = {
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  host: process.env.REDIS_HOST || 'localhost',
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableAutoPipelining: true,
  connectTimeout: 60000,
  enableReadyCheck: true,
  retryStrategy(times: number) {
    const delay = Math.min(times * 1000, 20000);
    logger.info(`Redis connection retry attempt ${times} with delay ${delay}ms`);
    if (times > 10) {
      logger.error('Redis connection failed after multiple retries');
      return null;
    }
    return delay;
  },
  commandTimeout: 60000,
  keepAlive: 30000,
  reconnectOnError: (err) => {
    logger.error('Redis reconnectOnError:', err);
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  lazyConnect: false,
  noDelay: true
};

export const redisConfigWorker: RedisOptions = {
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  host: process.env.REDIS_HOST || 'localhost',
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableAutoPipelining: false,
  connectTimeout: 60000,
  enableReadyCheck: true,
  retryStrategy(times: number) {
    const delay = Math.min(times * 1000, 20000);
    logger.info(`Redis connection retry attempt ${times} with delay ${delay}ms`);
    if (times > 10) {
      logger.error('Redis connection failed after multiple retries');
      return null;
    }
    return delay;
  },
  commandTimeout: 60000,
  keepAlive: 30000,
  reconnectOnError: (err) => {
    logger.error('Redis reconnectOnError:', err);
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  lazyConnect: false,
  noDelay: true
};

let redisClient: IORedis | null = null;
let redisClientWorker: IORedis | null = null;

export async function getRedisClientForWorker(): Promise<IORedis> {
  if (!redisClientWorker) {
    logger.info({
      ...redisConfigWorker,
      password: redisConfigWorker.password ? '[REDACTED]' : undefined,
      msg: 'Creating Redis client for worker with config'
    });
    
    redisClientWorker = new IORedis(redisConfigWorker);
    
    redisClientWorker.on('connect', () => {
      logger.info('Redis client for worker connected');
    });
    
    redisClientWorker.on('error', (err) => {
      logger.error('Redis client for worker error:', err);
    });
    
    // Adicionar eventos para maior observabilidade
    redisClientWorker.on('reconnecting', () => {
      logger.warn('Redis client for worker reconnecting');
    });
    
    redisClientWorker.on('close', () => {
      logger.warn('Redis client for worker connection closed');
    });
    
    redisClientWorker.on('end', () => {
      logger.warn('Redis client for worker connection ended');
      // Reset para permitir nova conexão se necessário
      redisClientWorker = null;
    });
  }
  return redisClientWorker;
}

export function createRedisClient(): IORedis {
  if (!redisClient) {
    logger.info({
      ...redisConfig,
      password: redisConfig.password ? '[REDACTED]' : undefined,
      msg: 'Creating Redis client with config'
    });
    
    redisClient = new IORedis({
      ...redisConfig,
      showFriendlyErrorStack: true
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });
    
    // Adicionar eventos para maior observabilidade
    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });
    
    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });
    
    redisClient.on('end', () => {
      logger.warn('Redis client connection ended');
      // Reset para permitir nova conexão se necessário
      redisClient = null;
    });
  }
  return redisClient;
}

export async function getRedisClient(): Promise<IORedis> {
  return await createRedisClient();
}

// Nova função para uso em instanciação de filas
export async function getRedisClientForQueue(): Promise<IORedis> {
  return await createRedisClient().duplicate();
}

// Configuração específica para BullMQ
export async function getBullConfig(): Promise<BullConfig> {
  const client = await createRedisClient();
  return {
    connection: client,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  };
}

export async function initRedis(): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.ping();
    logger.info('Redis connection verified successfully');
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    throw error;
  }
}

// Função para fechar a conexão (importante para desligamento limpo)
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed successfully');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
      // Forçar desconexão em caso de erro
      try {
        await redisClient.disconnect();
        logger.info('Redis disconnected forcefully');
      } catch (err) {
        logger.error('Failed to force disconnect Redis:', err);
      } finally {
        redisClient = null;
      }
    } finally {
      redisClient = null;
    }
  }
}


export default {
  redisConfig,
  getRedisClient,
  getRedisClientForQueue,
  getBullConfig,
  initRedis,
  closeRedisConnection
};