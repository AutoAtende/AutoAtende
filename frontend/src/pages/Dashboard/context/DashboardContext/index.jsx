import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../../../services/api';
import { toast } from '../../../../helpers/toast';
import useDashboardData from '../../hooks/useDashboardData';

// Criar contexto
const DashboardContext = createContext();

// Provider do contexto
export const DashboardProvider = ({ children }) => {
  const dashboardData = useDashboardData();
  
  // Estado para configurações do dashboard
  const [dashboardSettings, setDashboardSettings] = useState({
    defaultDateRange: 7,
    defaultQueue: 'all',
    componentVisibility: {
      messagesCard: true,
      responseTimeCard: true,
      clientsCard: true,
      messagesByDayChart: true,
      messagesByUserChart: true,
      comparativeTable: true,
      prospectionTable: true
    }
  });
  
  // Carregar configurações do dashboard
  useEffect(() => {
    const loadDashboardSettings = async () => {
      try {
        const response = await api.get('/dashboard/settings');
        if (response.data) {
          setDashboardSettings(prevSettings => ({
            ...prevSettings,
            ...response.data
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do dashboard:', error);
      }
    };
    
    loadDashboardSettings();
  }, []);
  
  // Atualizar configurações do dashboard
  const updateDashboardSettings = async (newSettings) => {
    try {
      const response = await api.post('/dashboard/settings', newSettings);
      if (response.data) {
        setDashboardSettings(prevSettings => ({
          ...prevSettings,
          ...newSettings
        }));
        toast.success('Configurações do dashboard atualizadas');
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações do dashboard:', error);
      toast.error('Erro ao atualizar configurações do dashboard');
    }
  };
  
  // Atualizar visibilidade de componentes
  const updateComponentVisibility = async (componentKey, isVisible) => {
    try {
      const newVisibility = {
        ...dashboardSettings.componentVisibility,
        [componentKey]: isVisible
      };
      
      const response = await api.patch('/dashboard/settings/components', {
        componentVisibility: newVisibility
      });
      
      if (response.data) {
        setDashboardSettings(prevSettings => ({
          ...prevSettings,
          componentVisibility: newVisibility
        }));
        toast.success('Visibilidade do componente atualizada');
      }
    } catch (error) {
      console.error('Erro ao atualizar visibilidade do componente:', error);
      toast.error('Erro ao atualizar visibilidade do componente');
    }
  };
  
  // Resetar configurações para o padrão
  const resetToDefault = async () => {
    try {
      const response = await api.post('/dashboard/settings/reset');
      if (response.data) {
        setDashboardSettings(response.data);
        toast.success('Configurações do dashboard resetadas');
      }
    } catch (error) {
      console.error('Erro ao resetar configurações do dashboard:', error);
      toast.error('Erro ao resetar configurações do dashboard');
    }
  };
  
  return (
    <DashboardContext.Provider
      value={{
        ...dashboardData,
        dashboardSettings,
        updateDashboardSettings,
        updateComponentVisibility,
        resetToDefault
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext deve ser usado dentro de um DashboardProvider');
  }
  return context;
};

export default DashboardContext;