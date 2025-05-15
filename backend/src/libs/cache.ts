import * as crypto from "crypto";
import { getRedisClient } from '../config/redis';
import { logger } from "../utils/logger";

// Não precisamos mais declarar e inicializar uma nova conexão
// Vamos usar a conexão centralizada de config/redis

type RedisSetOptions = 
  | ["EX" | "PX", number]
  | ["NX" | "XX"]
  | ["KEEPTTL"];

function encryptParams(params: any) {
  const str = JSON.stringify(params);
  return crypto.createHash("sha256").update(str).digest("base64");
}

// Não é mais necessário criar uma nova conexão, apenas obter a existente
export async function getClient() {
  return await getRedisClient();
}

export async function setFromParams(
  key: string,
  params: any,
  value: string,
  options?: RedisSetOptions
) {
  const finalKey = `${key}:${encryptParams(params)}`;
  return set(finalKey, value, options);
}

export async function getFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`;
  return get(finalKey);
}

export async function delFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`;
  return del(finalKey);
}

export async function set(
  key: string,
  value: string,
  options?: RedisSetOptions
): Promise<"OK" | null> {
  try {
    const client = await getClient();
    if (options) {
      return client.set(key, value, ...(options as any));
    }
    return client.set(key, value);
  } catch (error) {
    logger.error(`Erro ao definir chave ${key} no cache:`, error);
    return null;
  }
}

export async function get(key: string): Promise<string | null> {
  try {
    const client = await getClient();
    return client.get(key);
  } catch (error) {
    logger.error(`Erro ao obter chave ${key} do cache:`, error);
    return null;
  }
}

export async function getKeys(pattern: string): Promise<string[]> {
  try {
    const client = await getClient();
    return client.keys(pattern);
  } catch (error) {
    logger.error(`Erro ao obter chaves com padrão ${pattern} do cache:`, error);
    return [];
  }
}

export async function del(key: string): Promise<number> {
  try {
    const client = await getClient();
    return client.del(key);
  } catch (error) {
    logger.error(`Erro ao excluir chave ${key} do cache:`, error);
    return 0;
  }
}

export async function delFromPatternR(pattern: string): Promise<void> {
  try {
    const all = await getKeys(pattern);
    if (all.length > 0) {
      logger.debug(`Excluindo ${all.length} chaves com padrão ${pattern}`);
      const client = await getClient();
      // Otimização: usar pipeline para deletar múltiplas chaves de uma vez
      if (all.length > 10) {
        const pipeline = client.pipeline();
        all.forEach(key => pipeline.del(key));
        await pipeline.exec();
      } else {
        // Para poucas chaves, deletar individualmente é mais simples
        for (let item of all) {
          await del(item);
        }
      }
    }
  } catch (error) {
    logger.error(`Erro ao excluir chaves com padrão ${pattern} do cache:`, error);
  }
}

export const init = async (): Promise<void> => {
  try {
    // Verificar se a conexão está funcionando
    const client = await getClient();
    await client.ping();
    logger.info('Camada de cache inicializada com sucesso');
  } catch (error) {
    logger.error('Falha ao inicializar camada de cache:', error);
    throw error;
  }
};

export const cacheLayer = {
  init,
  set,
  setFromParams,
  get,
  getFromParams,
  getKeys,
  del,
  delFromParams,
  delFromPatternR,
};