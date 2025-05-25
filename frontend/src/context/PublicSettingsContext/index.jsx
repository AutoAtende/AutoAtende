import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { openApi } from "../../services/api";

// Criação do contexto
const PublicSettingsContext = createContext({});

// Configuração do tempo de expiração do cache
const CACHE_EXPIRATION_TIME = 86400000; // 24 horas em milissegundos

// Valores padrão para configurações críticas
const DEFAULT_SETTINGS = {
  appName: "AutoAtende",
  allowSignup: "enabled",
  copyright: "AutoAtende",
  loginPosition: "right",
  signupPosition: "right",
  iconColorLight: "#0693E3",
  iconColorDark: "#39ACE7",
  primaryColorLight: "#0000FF",
  primaryColorDark: "#39ACE7",
  secondaryColorLight: "#0000FF",
  secondaryColorDark: "#39ACE7",
  chatlistLight: "#eeeeee",
  chatlistDark: "#1C2E36",
};

export const PublicSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  // Função para armazenar configurações em cache
  const cacheSettings = useCallback((companyId, settingsData) => {
    try {
      const cacheData = {
        timestamp: new Date().getTime(),
        settings: settingsData
      };
      localStorage.setItem(`public_settings_${companyId}`, JSON.stringify(cacheData));
      console.log(`Configurações públicas armazenadas em cache para companyId ${companyId}`);
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
      
      console.log(`Configurações públicas recuperadas do cache para companyId ${companyId}`);
      return settings;
    } catch (error) {
      console.error('Erro ao recuperar configurações públicas do cache:', error);
      return null;
    }
  }, []);

  // Função para processar as configurações recebidas
  const processSettings = useCallback((settingsArray) => {
    if (!Array.isArray(settingsArray)) return DEFAULT_SETTINGS;
    
    const processed = {...DEFAULT_SETTINGS};
    
    settingsArray.forEach(setting => {
      if (setting && setting.key && setting.value !== undefined) {
        // Processar URLs de imagens
        if (setting.key.includes("Logo") || setting.key.includes("Background")) {
          processed[setting.key] = process.env.REACT_APP_BACKEND_URL + "/public/" + setting.value;
        } else {
          processed[setting.key] = setting.value;
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
      
      console.log(`Buscando configurações públicas para companyId ${companyId} via API`);
      
      // Buscar da API
      try {
        const { data } = await openApi.get(`/public-settings/c/${companyId}`);
        
        // Processar e armazenar as configurações
        const processedSettings = processSettings(data);
        setSettings(processedSettings);
        
        // Armazenar em cache
        cacheSettings(companyId, processedSettings);
        
        // Configurar título da página se appName estiver presente
        if (processedSettings.appName) {
          document.title = processedSettings.appName;
        }
        
        setFetchAttempts(0); // Resetar contagem após sucesso
        setLoading(false);
        return processedSettings;
      } catch (err) {
        // Se houve erro na API, incrementar contador e usar valores padrão
        setFetchAttempts(prev => prev + 1);
        console.warn(`Erro ao buscar configurações públicas (tentativa ${fetchAttempts + 1}): ${err.message}`);
        
        // Usar valores padrão
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
        return DEFAULT_SETTINGS;
      }
    } catch (err) {
      console.error("Erro ao carregar configurações públicas:", err);
      setError(err);
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return DEFAULT_SETTINGS;
    }
  }, [cacheSettings, getSettingsFromCache, processSettings, fetchAttempts]);

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

  // Carregar configurações iniciais
  useEffect(() => {
    loadPublicSettings().catch(error => {
      console.error("Erro no carregamento inicial de configurações públicas:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Implementar lógica de retry com backoff exponencial para casos onde a API falha
  useEffect(() => {
    if (fetchAttempts > 0 && fetchAttempts < 5) {
      const delay = Math.min(30000, 1000 * Math.pow(2, fetchAttempts - 1));
      console.log(`Agendando nova tentativa de buscar configurações públicas em ${delay}ms`);
      
      const retryTimeout = setTimeout(() => {
        loadPublicSettings(true);
      }, delay);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [fetchAttempts, loadPublicSettings]);

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