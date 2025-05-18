import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import openApi from "../services/api";

// Criação do contexto
const PublicSettingsContext = createContext({});

// Configuração do tempo de expiração do cache
const CACHE_EXPIRATION_TIME = 86400000; // 24 horas em milissegundos

export const PublicSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para armazenar configurações em cache
  const cacheSettings = useCallback((companyId, settingsData) => {
    try {
      const cacheData = {
        timestamp: new Date().getTime(),
        settings: settingsData
      };
      localStorage.setItem(`public_settings_${companyId}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao armazenar configurações públicas no cache:', error);
    }
  }, []);

  // Função para obter configurações do cache
  const getSettingsFromCache = useCallback((companyId) => {
    try {
      const cachedData = localStorage.getItem(`public_settings_${companyId}`);
      if (!cachedData) return null;
      
      const { timestamp, settings } = JSON.parse(cachedData);
      
      // Verificar se o cache expirou
      if (new Date().getTime() - timestamp > CACHE_EXPIRATION_TIME) {
        localStorage.removeItem(`public_settings_${companyId}`);
        return null;
      }
      
      return settings;
    } catch (error) {
      console.error('Erro ao recuperar configurações públicas do cache:', error);
      return null;
    }
  }, []);

  // Função para processar as configurações recebidas
  const processSettings = useCallback((settingsArray) => {
    if (!Array.isArray(settingsArray)) return {};
    
    const processed = {};
    settingsArray.forEach(setting => {
      if (setting && setting.key && setting.value !== undefined) {
        // Processar URLs de imagens
        if (setting.key.includes("Logo") || setting.key.includes("Background")) {
          processed[setting.key] = process.env.REACT_APP_BACKEND_URL + "/public/" + setting.value;
        } else {
          processed[setting.key] = setting.value;
        }
        
        // Configurar título da página se appName estiver presente
        if (setting.key === "appName" && setting.value) {
          document.title = setting.value;
        }
      }
    });
    
    return processed;
  }, []);

  // Função principal para carregar as configurações públicas
  const loadPublicSettings = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter ID da empresa atual do localStorage
      const companyId = localStorage.getItem("companyId") || localStorage.getItem("lastCompanyId") || "1";
      
      // Verificar cache primeiro se não forçar a atualização
      if (!forceRefresh) {
        const cachedSettings = getSettingsFromCache(companyId);
        if (cachedSettings) {
          setSettings(cachedSettings);
          setLoading(false);
          return cachedSettings;
        }
      }
      
      // Buscar da API
      const { data } = await openApi.get("/public-settings", { 
        params: { companyId } 
      });
      
      // Processar e armazenar as configurações
      const processedSettings = processSettings(data);
      setSettings(processedSettings);
      
      // Armazenar em cache
      cacheSettings(companyId, processedSettings);
      
      setLoading(false);
      return processedSettings;
    } catch (err) {
      console.error("Erro ao carregar configurações públicas:", err);
      setError(err);
      setLoading(false);
      return {};
    }
  }, [cacheSettings, getSettingsFromCache, processSettings]);

  // Carregar configurações iniciais
  useEffect(() => {
    loadPublicSettings();
  }, [loadPublicSettings]);

  // Monitorar mudanças no companyId no localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "companyId" || e.key === "lastCompanyId") {
        loadPublicSettings(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadPublicSettings]);

  return (
    <PublicSettingsContext.Provider
      value={{
        publicSettings: settings,
        publicSettingsLoading: loading,
        publicSettingsError: error,
        loadPublicSettings,
      }}
    >
      {children}
    </PublicSettingsContext.Provider>
  );
};

export function usePublicSettings() {
  const context = useContext(PublicSettingsContext);
  if (!context) {
    throw new Error("usePublicSettings deve ser usado dentro de um PublicSettingsProvider");
  }
  return context;
}

export default usePublicSettings;