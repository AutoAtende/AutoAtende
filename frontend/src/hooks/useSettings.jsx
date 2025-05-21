import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { AuthContext } from "../context/Auth/AuthContext";

import api, { openApi } from "../services/api";

// Criação do contexto
const SettingsContext = createContext({});

// Configuração do tempo de expiração do cache
const CACHE_EXPIRATION_TIME = 86400000; // 24 horas em milissegundos

export const SettingsProvider = ({ children }) => {
  const { isAuth } = useContext(AuthContext);
  // Estado principal para armazenar as configurações como array (compatível com código existente)
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Função para armazenar configurações em cache
  const cacheSettings = useCallback((companyId, settingsData) => {
    try {
      const cacheData = {
        timestamp: new Date().getTime(),
        settings: settingsData
      };
      localStorage.setItem(`whitelabel_settings_${companyId}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao armazenar configurações no cache:', error);
    }
  }, []);

  // Função para obter configurações do cache
  const getSettingsFromCache = useCallback((companyId) => {
    try {
      const cachedData = localStorage.getItem(`whitelabel_settings_${companyId}`);
      if (!cachedData) return null;
      
      const { timestamp, settings } = JSON.parse(cachedData);
      
      // Verificar se o cache expirou
      if (new Date().getTime() - timestamp > CACHE_EXPIRATION_TIME) {
        localStorage.removeItem(`whitelabel_settings_${companyId}`);
        return null;
      }
      
      return settings;
    } catch (error) {
      console.error('Erro ao recuperar configurações do cache:', error);
      return null;
    }
  }, []);

  // Função para obter uma configuração pública específica
  const getPublicSetting = useCallback(async (key) => {
    try {
      setLoading(true);
      
      // Tenta buscar do cache primeiro (companyId 1 para configurações públicas)
      const cachedData = getSettingsFromCache("1");
      const settingArray = Array.isArray(cachedData) ? cachedData : [];
      const cachedSetting = settingArray.find(s => s.key === key);
      
      if (cachedSetting) {
        return cachedSetting.value;
      }
      
      // Se não encontrar no cache, busca da API
      const { data } = await openApi.get(`/public-settings/${key}`);
      return data;
    } catch (err) {
      console.error(`Erro ao buscar configuração pública ${key}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSettingsFromCache]);

  // Função para obter todas as configurações
  const getAll = useCallback(async (companyId) => {
    try {
      setLoading(true);
      
      // Usar companyId do parâmetro ou padrão
      const targetCompanyId = companyId || localStorage.getItem("companyId") || "1";
      
      // Verificar cache primeiro
      const cachedSettings = getSettingsFromCache(targetCompanyId);
      if (cachedSettings && Array.isArray(cachedSettings)) {
        setSettings(cachedSettings);
        return cachedSettings;
      }
      if(isAuth) {
      // Buscar da API com parâmetro de companyId
      const { data } = await api.get(`/settings/c/${targetCompanyId}`);
      
      // Garantir que os dados estão no formato correto (array)
      const settingsArray = Array.isArray(data) ? data : [];
      
      // Salvar no cache e atualizar estado
      cacheSettings(targetCompanyId, settingsArray);
      setSettings(settingsArray);
      
      return settingsArray;
      } else {
        const { data } = await openApi.get(`/public-settings/c/${targetCompanyId}`);
        return data;
      }


    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getSettingsFromCache, cacheSettings]);

  // Função para obter todas as configurações públicas
  const getAllPublicSetting = useCallback(async (companyId) => {
    try {
      setLoading(true);
      
      // Usar companyId do parâmetro ou padrão
      const targetCompanyId = companyId || localStorage.getItem("companyId") || "1";
      
      // Buscar configurações públicas
      const { data } = await openApi.get(`/public-settings/c/${targetCompanyId}`);
      
      return data;
    } catch (err) {
      console.error("Erro ao buscar configurações públicas:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para atualizar uma configuração
  const update = useCallback(async ({ key, value, companyId }) => {
    try {
      setLoading(true);
      
      // Usar companyId do parâmetro ou padrão
      const targetCompanyId = companyId || localStorage.getItem("companyId") || "1";
      
      const { data } = await api.put(`/settings/c/${targetCompanyId}/k/${key}`, {
        value
      });
      
      // Atualizar cache e estado
      const cachedSettings = getSettingsFromCache(targetCompanyId);
      if (cachedSettings && Array.isArray(cachedSettings)) {
        const updatedSettings = cachedSettings.map(setting => 
          setting.key === key ? { ...setting, value } : setting
        );
        cacheSettings(targetCompanyId, updatedSettings);
        
        // Atualizar estado
        setSettings(prevSettings => 
          prevSettings.map(setting => 
            setting.key === key ? { ...setting, value } : setting
          )
        );
      }
      
      return data;
    } catch (err) {
      console.error("Erro ao atualizar configuração:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSettingsFromCache, cacheSettings]);

  // Funções de Webhook mantidas da versão nova
  const updateWebhook = async (data) => {
    await api.request({
      url: `/queueIntegration/create_or_update`,
      method: 'POST',
      data
    });
  };
  
  const deleteWebhookByparamName = async (paramName) => {
    await api.request({
      url: `/queueIntegration/deleteWebhookByparamName`,
      method: 'POST',
      data: {
        paramName
      }
    });
  };
  
  const getWebhook = async (paramName) => {
    const { data } = await api.request({
      url: `/queueIntegration/getWebhook`,
      method: 'POST',
      data: {
        paramName
      }
    });
    return data;
  };

  // Pré-carregar configurações quando o contexto for montado
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId) {
      getAll(companyId).catch(error => {
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
        update,
        updateWebhook,
        deleteWebhookByparamName,
        getWebhook
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