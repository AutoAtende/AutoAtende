import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../services/api";

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [cachedSettings, setCachedSettings] = useState({});
  
  const CACHE_EXPIRATION_TIME = 86400000; // 24 horas em milissegundos

  // Função para armazenar configurações em cache
  const cacheSettings = useCallback((companyId, settingsData) => {
    try {
      const cacheData = {
        timestamp: new Date().getTime(),
        settings: settingsData
      };
      localStorage.setItem(`whitelabel_settings_${companyId}`, JSON.stringify(cacheData));
      setCachedSettings(prev => ({
        ...prev,
        [companyId]: settingsData
      }));
    } catch (error) {
      console.error('Erro ao armazenar configurações no cache:', error);
    }
  }, []);

  // Função para obter configurações do cache
  const getSettingsFromCache = useCallback((companyId) => {
    try {
      // Verificar primeiro no estado
      if (cachedSettings[companyId]) {
        return cachedSettings[companyId];
      }
      
      // Se não estiver no estado, buscar do localStorage
      const cachedData = localStorage.getItem(`whitelabel_settings_${companyId}`);
      if (!cachedData) return null;
      
      const { timestamp, settings } = JSON.parse(cachedData);
      
      // Verificar se o cache expirou (24 horas)
      if (new Date().getTime() - timestamp > CACHE_EXPIRATION_TIME) {
        localStorage.removeItem(`whitelabel_settings_${companyId}`);
        return null;
      }
      
      // Atualizar o estado de cache
      setCachedSettings(prev => ({
        ...prev,
        [companyId]: settings
      }));
      
      return settings;
    } catch (error) {
      console.error('Erro ao recuperar configurações do cache:', error);
      return null;
    }
  }, [CACHE_EXPIRATION_TIME, cachedSettings]);

  const getPublicSetting = useCallback(async (key) => {
    try {
      setLoading(true);
      
      // Primeiro tenta buscar do cache (companyId 1 para configurações públicas)
      const cachedSettings = getSettingsFromCache("1");
      if (cachedSettings && cachedSettings[key] !== undefined) {
        return cachedSettings[key];
      }
      
      // Se não encontrar no cache, busca da API
      const { data } = await api.get(`/public-settings/${key}`);
      return data;
    } catch (err) {
      console.error(`Erro ao buscar configuração pública ${key}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSettingsFromCache]);

  const getAll = useCallback(async (companyId) => {
    try {
      setLoading(true);
      
      // Usar companyId do parâmetro ou padrão (1)
      const targetCompanyId = companyId || localStorage.getItem("companyId") || "1";
      
      // Verificar cache primeiro
      const cachedData = getSettingsFromCache(targetCompanyId);
      if (cachedData) {
        return cachedData;
      }
      
      // Adicionar parâmetro de companyId para buscar configurações específicas da empresa
      const { data } = await api.get("/settings", { 
        params: { companyId: targetCompanyId } 
      });
      
      // Processar dados recebidos
      const processedSettings = {};
      
      if (Array.isArray(data)) {
        data.forEach(setting => {
          if (setting && setting.key) {
            processedSettings[setting.key] = setting.value;
          }
        });
      }
      
      // Atualizar cache
      cacheSettings(targetCompanyId, processedSettings);
      
      return data;
    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSettingsFromCache, cacheSettings]);

  const getAllPublicSetting = useCallback(async (companyId) => {
    try {
      setLoading(true);
      
      // Usar companyId do parâmetro ou padrão (1)
      const targetCompanyId = companyId || localStorage.getItem("companyId") || "1";
      
      // Buscar configurações públicas
      const { data } = await api.get("/public-settings", { 
        params: { companyId: targetCompanyId } 
      });
      
      return data;
    } catch (err) {
      console.error("Erro ao buscar configurações públicas:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async ({ key, value, companyId }) => {
    try {
      setLoading(true);
      
      // Usar companyId do parâmetro ou padrão (1)
      const targetCompanyId = companyId || localStorage.getItem("companyId") || "1";
      
      const { data } = await api.put(`/settings/${key}`, {
        value
      }, {
        params: { companyId: targetCompanyId }
      });
      
      // Atualizar cache
      const cachedData = getSettingsFromCache(targetCompanyId);
      if (cachedData) {
        cachedData[key] = value;
        cacheSettings(targetCompanyId, cachedData);
      }
      
      return data;
    } catch (err) {
      console.error("Erro ao atualizar configuração:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSettingsFromCache, cacheSettings]);

  // Pré-carregar configurações gerais quando o contexto for montado
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId) {
      getAll(companyId)
        .then(data => {
          // Processar os dados se necessário
          if (Array.isArray(data)) {
            const newSettings = {};
            data.forEach(setting => {
              if (setting && setting.key) {
                newSettings[setting.key] = setting.value;
              }
            });
            setSettings(newSettings);
          }
        })
        .catch(error => {
          console.error("Erro ao carregar configurações iniciais:", error);
        });
    }
  }, [getAll]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        getAll,
        getAllPublicSetting,
        getPublicSetting,
        update
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings deve ser usado dentro de um SettingsProvider");
  }
  return context;
}

export default useSettings;