// context/PublicSettingsContext/index.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import openApi from "../../services/api";

const PublicSettingsContext = createContext({});

const CACHE_EXPIRATION_TIME = 86400000; // 24 horas em milissegundos

export const PublicSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para normalizar URLs
  const normalizeUrl = useCallback((baseUrl, path) => {
    if (!path) return '';
    
    // Remove barras duplas e normaliza a URL
    const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove barras finais
    const cleanPath = path.replace(/^\/+/, ''); // Remove barras iniciais
    
    return `${cleanBaseUrl}/${cleanPath}`;
  }, []);

  // Função para verificar se arquivo existe
  const checkFileExists = useCallback(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Erro ao verificar arquivo:', url, error);
      return false;
    }
  }, []);

  // Função para processar as configurações recebidas
  const processSettings = useCallback(async (settingsArray) => {
    if (!Array.isArray(settingsArray)) return {};
    
    const processed = {};
    const baseUrl = process.env.REACT_APP_BACKEND_URL;
    
    for (const setting of settingsArray) {
      if (setting && setting.key && setting.value !== undefined) {
        // Processar URLs de imagens
        if (setting.key.includes("Logo") || setting.key.includes("Background")) {
          const fullUrl = normalizeUrl(baseUrl, `/public/${setting.value}`);
          
          // Verificar se o arquivo existe antes de definir
          const exists = await checkFileExists(fullUrl);
          if (exists) {
            processed[setting.key] = fullUrl;
          } else {
            console.warn(`Arquivo não encontrado: ${fullUrl}`);
            // Usar imagem padrão se o arquivo não existir
            if (setting.key.includes("Logo")) {
              processed[setting.key] = normalizeUrl(baseUrl, '/public/assets/vector/logo.svg');
            }
          }
        } else {
          processed[setting.key] = setting.value;
        }
        
        // Configurar título da página se appName estiver presente
        if (setting.key === "appName" && setting.value) {
          document.title = setting.value;
        }
      }
    }
    
    return processed;
  }, [normalizeUrl, checkFileExists]);

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
      const { data } = await openApi.get(`/public-settings/c/${companyId}`);
      
      // Processar e armazenar as configurações
      const processedSettings = await processSettings(data);
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