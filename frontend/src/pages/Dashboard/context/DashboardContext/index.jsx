import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../../context/Auth/AuthContext';
import api from '../../../../services/api';
import { toast } from '../../../../helpers/toast';
import useDashboardData from '../../hooks/useDashboardData';

// Criar contexto
const DashboardContext = createContext();

// Provider do contexto
export const DashboardProvider = ({ children }) => {
  const dashboardData = useDashboardData();
  const { user } = useContext(AuthContext);
  
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
          
          // Aplicar as configurações carregadas
          if (response.data.defaultDateRange) {
            dashboardData.setDateRange(response.data.defaultDateRange);
          }
          
          if (response.data.defaultQueue) {
            dashboardData.setSelectedQueue(response.data.defaultQueue);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do dashboard:', error);
        // Silenciosamente falha e mantém as configurações padrão
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
      throw error;
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
      throw error;
    }
  };
  
  // Resetar configurações para o padrão
  const resetToDefault = async () => {
    try {
      const response = await api.post('/dashboard/settings/reset');
      if (response.data) {
        setDashboardSettings(response.data);
        
        // Aplicar as configurações padrão
        if (response.data.defaultDateRange) {
          dashboardData.setDateRange(response.data.defaultDateRange);
        }
        
        if (response.data.defaultQueue) {
          dashboardData.setSelectedQueue(response.data.defaultQueue);
        }
        
        toast.success('Configurações do dashboard resetadas');
      }
    } catch (error) {
      console.error('Erro ao resetar configurações do dashboard:', error);
      toast.error('Erro ao resetar configurações do dashboard');
      throw error;
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