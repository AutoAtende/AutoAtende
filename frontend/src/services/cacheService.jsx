// src/services/cacheService.js

/**
 * Serviço de cache para o AutoAtende
 * Permite armazenar dados em memória com validade configurável
 */
class CacheService {
    constructor() {
      this.caches = {};
    }
  
    /**
     * Define dados em um cache específico
     * @param {string} cacheKey - Chave para identificar o cache
     * @param {any} data - Dados a serem armazenados
     * @param {number} validity - Validade em milissegundos (padrão: 24 horas)
     */
    set(cacheKey, data, validity = 24 * 60 * 60 * 1000) {
      this.caches[cacheKey] = {
        data,
        timestamp: Date.now(),
        validity
      };
      
      // Registra operação de cache para depuração
      console.log(`[CacheService] Dados armazenados em cache: ${cacheKey}`);
    }
  
    /**
     * Obtém dados de um cache específico se ainda for válido
     * @param {string} cacheKey - Chave do cache para buscar
     * @returns {any|null} - Dados do cache ou null se expirado/inexistente
     */
    get(cacheKey) {
      const cache = this.caches[cacheKey];
      
      if (!cache) {
        console.log(`[CacheService] Cache não encontrado: ${cacheKey}`);
        return null;
      }
      
      const isValid = Date.now() - cache.timestamp < cache.validity;
      
      if (!isValid) {
        console.log(`[CacheService] Cache expirado: ${cacheKey}`);
        return null;
      }
      
      console.log(`[CacheService] Utilizando dados do cache: ${cacheKey}`);
      return cache.data;
    }
  
    /**
     * Verifica se um cache específico existe e está válido
     * @param {string} cacheKey - Chave do cache para verificar
     * @returns {boolean} - Verdadeiro se o cache existir e for válido
     */
    isValid(cacheKey) {
      const cache = this.caches[cacheKey];
      if (!cache) return false;
      
      return Date.now() - cache.timestamp < cache.validity;
    }
  
    /**
     * Invalida um cache específico
     * @param {string} cacheKey - Chave do cache para invalidar
     */
    invalidate(cacheKey) {
      if (this.caches[cacheKey]) {
        delete this.caches[cacheKey];
        console.log(`[CacheService] Cache invalidado: ${cacheKey}`);
      }
    }
  
    /**
     * Invalida todos os caches
     */
    invalidateAll() {
      this.caches = {};
      console.log(`[CacheService] Todos os caches foram invalidados`);
    }
  }
  
  // Exporta uma única instância do serviço para ser compartilhada
  export default new CacheService();