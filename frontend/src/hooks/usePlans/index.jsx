import { useRef } from 'react';

import api, { openApi } from "../../services/api";

// Configurações de cache
const CACHE_TTL_PLAN = 86400000; // 24 horas
const CACHE_TTL_RESOURCES = 300000; // 5 minutos para recursos dinâmicos
const CACHE_TTL_LIST = 86400000; // 24 horas para listagem de planos

const usePlans = () => {
    const planCache = useRef({});
    const resourceCache = useRef({});
    const planListCache = useRef({});

    // Helpers de cache
    const getCachedData = (cacheKey, cacheRef, ttl) => {
        const cached = cacheRef.current[cacheKey];
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        return null;
    };

    const getLocalStorageCache = (key, ttl) => {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        try {
            const { timestamp, data } = JSON.parse(item);
            return Date.now() - timestamp < ttl ? data : null;
        } catch (error) {
            console.error('Erro ao analisar cache:', error);
            localStorage.removeItem(key);
            return null;
        }
    };

    const setLocalStorageCache = (key, data) => {
        try {
            const cacheItem = { timestamp: Date.now(), data };
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.error('Erro ao salvar no cache:', error);
        }
    };

    // Funções originais com cache
    const getPlanList = async (params = {}, forceUpdate = false) => {
        const cacheKey = `planList-${JSON.stringify(params)}`;
        
        if (!forceUpdate) {
            const localStorageData = getLocalStorageCache(cacheKey, CACHE_TTL_LIST);
            if (localStorageData) return localStorageData;

            const memoryData = getCachedData(cacheKey, planListCache, CACHE_TTL_LIST);
            if (memoryData) return memoryData;
        }

        try {
            const { data } = await api.request({
                url: '/plans/list',
                method: 'GET',
                params
            });

            setLocalStorageCache(cacheKey, data);
            planListCache.current[cacheKey] = { timestamp: Date.now(), data };
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar lista de planos:', error);
            throw error;
        }
    };

    const list = async (params) => {
        const { data } = await api.request({
            url: '/plans/all',
            method: 'GET',
            params
        });
        return data;
    };

    const finder = async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'GET'
        });
        return data;
    };

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/plans',
            method: 'POST',
            data
        });
        return responseData;
    };

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/plans/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    };

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'DELETE'
        });
        return data;
    };

    const getPlanCompany = async (params, id, forceUpdate = false) => {
        const cacheKey = `planCompany-${id}`;
        
        if (!forceUpdate) {
            const cached = getLocalStorageCache(cacheKey, CACHE_TTL_PLAN);
            if (cached) return cached;
        }

        try {
            const { data } = await api.get(`/companies/listPlan/${id}`, {
                params
            });
            
            setLocalStorageCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error("Erro ao obter plano da empresa:", error);
            throw error;
        }
    };

    // Funções de recursos com cache
    const hasFeature = async (featureName, forceUpdate = false) => {
        try {
            const features = await getFeatures(forceUpdate);
            return features[featureName] === true;
        } catch (error) {
            console.error(`Erro ao verificar recurso ${featureName}:`, error);
            return false;
        }
    };

    const getFeatures = async (forceUpdate = false) => {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return {};

        const cacheKey = `features-${companyId}`;
        
        if (!forceUpdate) {
            const cached = getLocalStorageCache(cacheKey, CACHE_TTL_PLAN);
            if (cached) return cached;
        }

        try {
            const planData = await getPlanCompany(undefined, companyId, forceUpdate);
            const features = {
                useCampaigns: planData?.plan?.useCampaigns || false,
                useKanban: planData?.plan?.useKanban || false,
                useOpenAi: planData?.plan?.useOpenAi || false,
                useIntegrations: planData?.plan?.useIntegrations || false,
                useSchedules: planData?.plan?.useSchedules || false,
                useInternalChat: planData?.plan?.useInternalChat || false,
                useExternalApi: planData?.plan?.useExternalApi || false,
                useEmail: planData?.plan?.useEmail || false,
                whiteLabel: planData?.plan?.whiteLabel || false,
                useOpenAIAssistants: planData?.plan?.useOpenAIAssistants || false,
                useFlowBuilder: planData?.plan?.useFlowBuilder || false,
                useAPIOfficial: planData?.plan?.useAPIOfficial || false,
                useChatBotRules: planData?.plan?.useChatBotRules || false,
                storageLimit: planData?.plan?.storageLimit || 500,
                openAIAssistantsContentLimit: planData?.plan?.openAIAssistantsContentLimit || 100
            };

            setLocalStorageCache(cacheKey, features);
            return features;
        } catch (error) {
            console.error("Erro ao obter recursos do plano:", error);
            return {};
        }
    };

    const getStorageInfo = async (forceUpdate = false) => {
        const cacheKey = 'storageInfo';
        
        if (!forceUpdate) {
            const cached = getCachedData(cacheKey, resourceCache, CACHE_TTL_RESOURCES);
            if (cached) return cached;
        }

        try {
            const { data } = await api.request({
                url: '/storage-info',
                method: 'GET'
            });
            
            resourceCache.current[cacheKey] = { timestamp: Date.now(), data };
            return data;
        } catch (error) {
            console.error("Erro ao obter informações de armazenamento:", error);
            return { limit: 0, used: 0, remaining: 0 };
        }
    };

    const getAssistantsContentInfo = async (forceUpdate = false) => {
        const cacheKey = 'assistantsContent';
        
        if (!forceUpdate) {
            const cached = getCachedData(cacheKey, resourceCache, CACHE_TTL_RESOURCES);
            if (cached) return cached;
        }

        try {
            const { data } = await api.request({
                url: '/assistants-content-info',
                method: 'GET'
            });
            
            resourceCache.current[cacheKey] = { timestamp: Date.now(), data };
            return data;
        } catch (error) {
            console.error("Erro ao obter informações de conteúdo:", error);
            return { limit: 0, used: 0, remaining: 0 };
        }
    };

    return {
        // Funções originais
        getPlanList: (params) => getPlanList(params, false),
        list,
        save,
        update,
        finder,
        remove,
        getPlanCompany: (params, id) => getPlanCompany(params, id, false),
        
        // Funções de recursos
        hasFeature: (featureName) => hasFeature(featureName, false),
        getFeatures: () => getFeatures(false),
        getStorageInfo: () => getStorageInfo(false),
        getAssistantsContentInfo: () => getAssistantsContentInfo(false),
        
        // Forçar atualizações
        forceUpdatePlanList: (params) => getPlanList(params, true),
        forceUpdateFeatures: () => getFeatures(true),
        forceUpdateStorageInfo: () => getStorageInfo(true),
        forceUpdateAssistantsContent: () => getAssistantsContentInfo(true)
    };
};

export default usePlans;