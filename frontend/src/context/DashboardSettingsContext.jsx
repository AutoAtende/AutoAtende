// src/context/DashboardSettingsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DashboardSettingsContext = createContext();

export const useDashboardSettings = () => useContext(DashboardSettingsContext);

export const DashboardSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar configurações do usuário
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obter configurações do backend
      const { data } = await api.get('/dashboard/settings');
      
      // Se não houver configurações, usar padrão
      if (!data) {
        setSettings(getDefaultSettings());
      } else {
        setSettings(data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar configurações do dashboard:', err);
      setError(err.message || 'Erro ao carregar configurações');
      // Em caso de erro, usar configurações padrão
      setSettings(getDefaultSettings());
      setLoading(false);
    }
  }, []);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings) => {
    try {
      await api.post('/dashboard/settings', newSettings);
      setSettings(newSettings);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      setError(err.message || 'Erro ao atualizar configurações');
      return false;
    }
  }, []);

  // Redefinir para configurações padrão
  const resetToDefault = useCallback(async () => {
    const defaultSettings = getDefaultSettings();
    
    try {
      await api.post('/dashboard/settings/reset');
      setSettings(defaultSettings);
      return true;
    } catch (err) {
      console.error('Erro ao redefinir configurações:', err);
      setError(err.message || 'Erro ao redefinir configurações');
      // Em caso de erro ao chamar a API, ainda definir para padrão localmente
      setSettings(defaultSettings);
      return false;
    }
  }, []);

  // Verificar se um componente está visível
  const isComponentVisible = useCallback((tabId, componentId) => {
    if (!settings || !settings.tabs) return true;
    
    const tab = settings.tabs.find(t => t.id === tabId);
    if (!tab) return true;
    
    const component = tab.components.find(c => c.id === componentId);
    if (!component) return true;
    
    return component.visible;
  }, [settings]);

  // Alternar visibilidade de um componente
  const toggleComponentVisibility = useCallback(async (tabId, componentId, visible) => {
    if (!settings || !settings.tabs) return false;
    
    const newSettings = { ...settings };
    const tabIndex = newSettings.tabs.findIndex(t => t.id === tabId);
    
    if (tabIndex === -1) return false;
    
    const componentIndex = newSettings.tabs[tabIndex].components.findIndex(c => c.id === componentId);
    
    if (componentIndex === -1) return false;
    
    newSettings.tabs[tabIndex].components[componentIndex].visible = visible;
    
    try {
      await updateSettings(newSettings);
      return true;
    } catch (err) {
      console.error('Erro ao alternar visibilidade:', err);
      return false;
    }
  }, [settings, updateSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Gerar configurações padrão
  const getDefaultSettings = () => {
    return {
      tabs: [
        {
          id: "overviewTab",
          components: [
            { id: "totalTicketsCard", visible: true },
            { id: "totalMessagesCard", visible: true },
            { id: "timeAvgCard", visible: true },
            { id: "newContactsCard", visible: true },
            { id: "dailyActivityChart", visible: true },
            { id: "ticketsStatusChart", visible: true },
            { id: "ratingCard", visible: true }
          ]
        },
        {
          id: "ticketsTab",
          components: [
            { id: "ticketsStatusChart", visible: true },
            { id: "ticketsQueueChart", visible: true },
            { id: "ticketsUserTable", visible: true },
            { id: "ticketsHourChart", visible: true },
            { id: "ticketsWeekdayChart", visible: true },
            { id: "resolutionTimeChart", visible: true },
            { id: "serviceMetricsCard", visible: true }
          ]
        },
        {
          id: "usersTab",
          components: [
            { id: "ticketsPerUserChart", visible: true },
            { id: "messagesPerUserChart", visible: true },
            { id: "resolutionTimePerUserChart", visible: true },
            { id: "ratingsChart", visible: true },
            { id: "performanceTable", visible: true },
            { id: "queueComparativoCard", visible: true },
            { id: "prospectionByAgentCard", visible: true }
          ]
        },
        {
          id: "contactsTab",
          components: [
            { id: "newContactsChart", visible: true },
            { id: "contactsWeekdayChart", visible: true },
            { id: "contactsHourChart", visible: true },
            { id: "tagsUsedChart", visible: true },
            { id: "contactsTable", visible: true }
          ]
        },
        {
          id: "queuesTab",
          components: [
            { id: "ticketsQueueChart", visible: true },
            { id: "waitTimeChart", visible: true },
            { id: "queueRatingsTable", visible: true },
            { id: "queueAnalysisChart", visible: true }
          ]
        },
        {
          id: "tagsTab",
          components: [
            { id: "mostUsedTagsChart", visible: true },
            { id: "resolutionTimeTagsChart", visible: true },
            { id: "tagsStatusChart", visible: true },
            { id: "tagsDetailTable", visible: true }
          ]
        }
      ]
    };
  };

  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    resetToDefault,
    isComponentVisible,
    toggleComponentVisibility
  };

  return (
    <DashboardSettingsContext.Provider value={value}>
      {children}
    </DashboardSettingsContext.Provider>
  );
};

export default DashboardSettingsContext;