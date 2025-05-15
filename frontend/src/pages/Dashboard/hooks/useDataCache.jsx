import { useState, useEffect, useCallback } from 'react';
import isEqual from 'lodash/isEqual';

const useDataCache = (cacheKey, ttl = 300000) => { // ttl default: 5 min
  const [cachedData, setCachedData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isDataStale, setIsDataStale] = useState(true);
  
  // Carregar cache do localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      
      const storedCache = localStorage.getItem(`cache_${cacheKey}`);
      
      if (storedCache) {
        try {
          const { data, timestamp } = JSON.parse(storedCache);
          const now = new Date().getTime();
          
          // Verificar se os dados do cache ainda são válidos
          if (data && timestamp && (now - timestamp < ttl)) {
            setCachedData(data);
            setLastUpdated(timestamp);
            setIsDataStale(false);
          } else {
            // Dados expirados
            setIsDataStale(true);
            // Mantenha os dados antigos até que novos dados cheguem
            if (data) {
              setCachedData(data);
              setLastUpdated(timestamp);
            }
          }
        } catch (parseError) {
          // Se houver erro no parse do JSON, limpar cache corrompido
          console.error('Cache corrompido:', parseError);
          clearCache();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cache:', error);
      clearCache();
    }
  }, [cacheKey, ttl]);
  
  // Atualizar o cache
  const updateCachedData = useCallback((newData) => {
    if (!newData) return;
    if (typeof window === 'undefined') return;
    
    // Verificar se os dados são realmente diferentes antes de atualizar
    if (isEqual(cachedData, newData)) return;
    
    const now = new Date().getTime();
    
    try {
      // Atualizar estado local
      setCachedData(newData);
      setLastUpdated(now);
      setIsDataStale(false);
      
      // Persistir no localStorage
      localStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
        data: newData,
        timestamp: now
      }));
    } catch (error) {
      console.error('Erro ao atualizar cache:', error);
    }
  }, [cacheKey, cachedData]);
  
  // Limpar cache
  const clearCache = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.removeItem(`cache_${cacheKey}`);
      setCachedData(null);
      setLastUpdated(null);
      setIsDataStale(true);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }, [cacheKey]);
  
  // Verificar expiração do cache uma única vez com timeout
  useEffect(() => {
    if (!lastUpdated || typeof window === 'undefined') return;
    
    // Calcular quando o cache expirará
    const expiryTime = lastUpdated + ttl;
    const now = new Date().getTime();
    const timeUntilExpiry = Math.max(0, expiryTime - now);
    
    // Configurar um único timeout para o momento exato da expiração
    let timeoutId;
    if (timeUntilExpiry > 0) {
      timeoutId = setTimeout(() => {
        setIsDataStale(true);
      }, timeUntilExpiry);
    } else {
      setIsDataStale(true);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastUpdated, ttl]);
  
  return {
    cachedData,
    setCachedData: updateCachedData,
    isDataStale,
    lastUpdated,
    clearCache
  };
};

export default useDataCache;