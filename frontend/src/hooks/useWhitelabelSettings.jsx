import React, { useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import useAuth from "./useAuth";
import useSettings from "./useSettings";
import api from "../services/api";

// Hook personalizado para gerenciar as configurações de whitelabel por empresa
export function useWhitelabelSettings() {
  const { user } = useAuth();
  const { getAll, getAllPublicSetting } = useSettings();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para processar as configurações recebidas
  const processSettings = (settingsArray) => {
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
      }
    });
    
    return processed;
  };

  // Função para obter configurações do cache
  const getSettingsFromCache = (companyId) => {
    try {
      const CACHE_EXPIRATION_TIME = 86400000; // 24 horas
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
  };

  // Função para armazenar configurações em cache
  const cacheSettings = (companyId, settings) => {
    try {
      const cacheData = {
        timestamp: new Date().getTime(),
        settings: settings
      };
      localStorage.setItem(`whitelabel_settings_${companyId}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao armazenar configurações no cache:', error);
    }
  };

  // Função para carregar as configurações específicas para a empresa atual
  const loadSettings = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter ID da empresa atual
      const companyId = user?.companyId || localStorage.getItem("companyId") || "1";
      
      // Verificar cache primeiro
      if (!forceRefresh) {
        const cachedSettings = getSettingsFromCache(companyId);
        if (cachedSettings) {
          setSettings(cachedSettings);
          setLoading(false);
          return cachedSettings;
        }
      }
      
      // Se não houver cache ou forceRefresh=true, buscar da API
      let settingsData;
      
      // Se o usuário estiver autenticado, usar getAll (que inclui configurações privadas)
      if (user?.id) {
        settingsData = await getAll(companyId);
      } else {
        // Para usuários não autenticados (tela de login), usar apenas configurações públicas
        settingsData = await getAllPublicSetting(companyId);
      }
      
      // Processar e armazenar as configurações
      const processedSettings = processSettings(settingsData);
      setSettings(processedSettings);
      
      // Armazenar em cache
      cacheSettings(companyId, processedSettings);
      
      setLoading(false);
      return processedSettings;
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
      setError(err);
      setLoading(false);
      return {};
    }
  };

  // Função para atualizar uma configuração específica
const updateSetting = async (key, value) => {
  try {
    const companyId = user?.companyId || localStorage.getItem("companyId");

    if (!companyId || !key) {
      throw new Error("Parâmetros 'companyId' ou 'key' ausentes.");
    }

    // Ajusta a chamada ao endpoint conforme a rota do backend
    await api.put(`/settings/c/${companyId}/k/${key}`, { value });

    // Atualiza o estado local
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Atualiza o cache local
    const cachedSettings = getSettingsFromCache(companyId);
    if (cachedSettings) {
      cachedSettings[key] = value;
      cacheSettings(companyId, cachedSettings);
    }

    return true;
  } catch (err) {
    console.error("Erro ao atualizar configuração:", err);
    return false;
  }
};


  // Carregar configurações iniciais
  useEffect(() => {
    loadSettings();
  }, [user?.companyId]); // Recarregar quando a empresa do usuário mudar

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSetting
  };
}

export default useWhitelabelSettings;