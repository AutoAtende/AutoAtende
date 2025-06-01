import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

/**
 * @typedef {Object} PlanFeatures
 * @property {boolean} useCampaigns - Se campanhas estão habilitadas
 * @property {boolean} useKanban - Se o Kanban está habilitado
 * @property {boolean} useOpenAi - Se o OpenAI está habilitado
 * @property {boolean} useIntegrations - Se as integrações estão habilitadas
 * @property {boolean} useSchedules - Se os agendamentos estão habilitados
 * @property {boolean} useInternalChat - Se o chat interno está habilitado
 * @property {boolean} useExternalApi - Se a API externa está habilitada
 * @property {boolean} useEmail - Se o e-mail está habilitado
 * @property {boolean} useOpenAIAssistants - Se os assistentes da OpenAI estão habilitados
 * @property {boolean} useFlowBuilder - Se o construtor de fluxo está habilitado
 * @property {boolean} useAPIOfficial - Se a API oficial está habilitada
 * @property {boolean} useChatBotRules - Se as regras de chatbot estão habilitadas
 * @property {number} storageLimit - Limite de armazenamento em MB
 * @property {number} openAIAssistantsContentLimit - Limite de conteúdo para assistentes da OpenAI
 * @property {boolean} isLoading - Se os recursos estão sendo carregados
 * @property {string|null} error - Mensagem de erro, se houver
 */

/**
 * @typedef {Object} StorageInfo
 * @property {number} limit - Limite total de armazenamento
 * @property {number} used - Armazenamento utilizado
 * @property {number} remaining - Armazenamento restante
 * @property {boolean} isLoading - Se as informações estão sendo carregadas
 */

/**
 * @typedef {Object} AssistantsContentInfo
 * @property {number} limit - Limite total de conteúdo
 * @property {number} used - Conteúdo utilizado
 * @property {number} remaining - Conteúdo restante
 * @property {boolean} isLoading - Se as informações estão sendo carregadas
 */

/**
 * Hook personalizado para gerenciar recursos do plano
 * @returns {Object} - Retorna estado e funções para gerenciar recursos
 * @property {PlanFeatures} planFeatures - Recursos disponíveis no plano
 * @property {function(string): boolean} hasFeature - Verifica se um recurso está disponível
 * @property {StorageInfo} storageInfo - Informações de armazenamento
 * @property {function(): Promise<void>} fetchStorageInfo - Busca informações de armazenamento
 * @property {AssistantsContentInfo} assistantsContentInfo - Informações de conteúdo dos assistentes
 * @property {function(): Promise<void>} fetchAssistantsContentInfo - Busca informações de conteúdo dos assistentes
 */

usePlanFeatures.propTypes = {
  // O hook não recebe props, mas documentamos o objeto de retorno
  return: PropTypes.shape({
    planFeatures: PropTypes.shape({
      useCampaigns: PropTypes.bool.isRequired,
      useKanban: PropTypes.bool.isRequired,
      useOpenAi: PropTypes.bool.isRequired,
      useIntegrations: PropTypes.bool.isRequired,
      useSchedules: PropTypes.bool.isRequired,
      useInternalChat: PropTypes.bool.isRequired,
      useExternalApi: PropTypes.bool.isRequired,
      useEmail: PropTypes.bool.isRequired,
      useOpenAIAssistants: PropTypes.bool.isRequired,
      useFlowBuilder: PropTypes.bool.isRequired,
      useAPIOfficial: PropTypes.bool.isRequired,
      useChatBotRules: PropTypes.bool.isRequired,
      storageLimit: PropTypes.number.isRequired,
      openAIAssistantsContentLimit: PropTypes.number.isRequired,
      isLoading: PropTypes.bool.isRequired,
      error: PropTypes.string,
    }).isRequired,
    hasFeature: PropTypes.func.isRequired,
    storageInfo: PropTypes.shape({
      limit: PropTypes.number.isRequired,
      used: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
      isLoading: PropTypes.bool.isRequired,
    }).isRequired,
    fetchStorageInfo: PropTypes.func.isRequired,
    assistantsContentInfo: PropTypes.shape({
      limit: PropTypes.number.isRequired,
      used: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
      isLoading: PropTypes.bool.isRequired,
    }).isRequired,
    fetchAssistantsContentInfo: PropTypes.func.isRequired,
  })
};

export default usePlanFeatures;