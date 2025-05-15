import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from "../helpers/toast";

const usePlanFeatures = () => {
  const [planFeatures, setPlanFeatures] = useState({
    useCampaigns: false,
    useKanban: false,
    useOpenAi: false,
    useIntegrations: false,
    useSchedules: false,
    useInternalChat: false,
    useExternalApi: false,
    useEmail: false,
    useOpenAIAssistants: false,
    useFlowBuilder: false,
    useAPIOfficial: false,
    useChatBotRules: false,
    storageLimit: 500,
    openAIAssistantsContentLimit: 100,
    isLoading: true,
    error: null
  });

  const [storageInfo, setStorageInfo] = useState({
    limit: 0,
    used: 0,
    remaining: 0,
    isLoading: true
  });

  const [assistantsContentInfo, setAssistantsContentInfo] = useState({
    limit: 0,
    used: 0,
    remaining: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchPlanFeatures = async () => {
      try {
        const { data } = await api.get('/plan-features');
        setPlanFeatures({
          ...data,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setPlanFeatures({
          ...planFeatures,
          isLoading: false,
          error: error?.message || 'Erro ao carregar recursos do plano'
        });
        console.error('Erro ao carregar recursos do plano:', error);
      }
    };

    fetchPlanFeatures();
  }, []);

  // Função para verificar se um recurso está disponível
  const hasFeature = (featureName) => {
    if (planFeatures.isLoading) return false;
    return planFeatures[featureName] === true;
  };

  // Obter informações de armazenamento
  const fetchStorageInfo = async () => {
    if (!hasFeature('storageLimit')) return;
    
    try {
      setStorageInfo({ ...storageInfo, isLoading: true });
      const { data } = await api.get('/storage-info');
      setStorageInfo({
        limit: data.limit,
        used: data.used,
        remaining: data.remaining,
        isLoading: false
      });
    } catch (error) {
      toast.error('Erro ao carregar informações de armazenamento');
      setStorageInfo({ ...storageInfo, isLoading: false });
    }
  };

  // Obter informações de conteúdo dos assistentes
  const fetchAssistantsContentInfo = async () => {
    if (!hasFeature('useOpenAIAssistants')) return;
    
    try {
      setAssistantsContentInfo({ ...assistantsContentInfo, isLoading: true });
      const { data } = await api.get('/assistants-content-info');
      setAssistantsContentInfo({
        limit: data.limit,
        used: data.used,
        remaining: data.remaining,
        isLoading: false
      });
    } catch (error) {
      toast.error('Erro ao carregar informações de conteúdo dos assistentes');
      setAssistantsContentInfo({ ...assistantsContentInfo, isLoading: false });
    }
  };

  return {
    planFeatures,
    hasFeature,
    storageInfo,
    fetchStorageInfo,
    assistantsContentInfo,
    fetchAssistantsContentInfo
  };
};

export default usePlanFeatures;