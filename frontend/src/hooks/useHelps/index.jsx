import api from "../../services/api";
import cacheService from "../../services/cacheService";

const CACHE_KEY = 'helps_list';
const CACHE_VALIDITY = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

const useHelps = () => {
    const findAll = async (params = {}) => {
        try {
            const { data } = await api.request({
                url: `/helps`,
                method: 'GET',
                params
            });
            return data;
        } catch (error) {
            console.error('[useHelps] Erro ao buscar helps:', error);
            throw error;
        }
    };

    const list = async (params = {}) => {
        try {
            // Verifica se há dados em cache válidos
            const cachedData = cacheService.get(CACHE_KEY);
            if (cachedData) {
                console.log("[useHelps] Utilizando dados em cache para helps/list");
                return Array.isArray(cachedData) ? cachedData : [];
            }

            // Se não houver cache válido, busca da API
            console.log("[useHelps] Buscando dados da API para helps/list");
            const { data } = await api.request({
                url: '/helps/list',
                method: 'GET',
                params
            });

            // Garantir que sempre retorna um array
            const helpsList = Array.isArray(data) ? data : [];

            // Armazena os dados no cache
            cacheService.set(CACHE_KEY, helpsList, CACHE_VALIDITY);
            
            return helpsList;
        } catch (error) {
            console.error('[useHelps] Erro ao buscar lista de helps:', error);
            // Retorna array vazio em caso de erro
            return [];
        }
    };

    const save = async (data) => {
        try {
            const { data: responseData } = await api.request({
                url: '/helps',
                method: 'POST',
                data
            });
            
            // Invalida o cache após salvar novos dados
            cacheService.invalidate(CACHE_KEY);
            
            return responseData;
        } catch (error) {
            console.error('[useHelps] Erro ao salvar help:', error);
            throw error;
        }
    };

    const update = async (data) => {
        try {
            const { data: responseData } = await api.request({
                url: `/helps/${data.id}`,
                method: 'PUT',
                data
            });
            
            // Invalida o cache após atualizar dados
            cacheService.invalidate(CACHE_KEY);
            
            return responseData;
        } catch (error) {
            console.error('[useHelps] Erro ao atualizar help:', error);
            throw error;
        }
    };

    const remove = async (id) => {
        try {
            const { data } = await api.request({
                url: `/helps/${id}`,
                method: 'DELETE'
            });
            
            // Invalida o cache após remover dados
            cacheService.invalidate(CACHE_KEY);
            
            return data;
        } catch (error) {
            console.error('[useHelps] Erro ao remover help:', error);
            throw error;
        }
    };

    const removeAll = async () => {
        try {
            const { data } = await api.request({
                url: '/helps/all/clear',
                method: 'DELETE'
            });
            
            // Invalida o cache após remover todos os dados
            cacheService.invalidate(CACHE_KEY);
            
            return data;
        } catch (error) {
            console.error('[useHelps] Erro ao remover todas as helps:', error);
            throw error;
        }
    };

    // Função para forçar a atualização do cache
    const refreshCache = async () => {
        try {
            cacheService.invalidate(CACHE_KEY);
            return await list();
        } catch (error) {
            console.error('[useHelps] Erro ao atualizar cache:', error);
            return [];
        }
    };

    return {
        findAll,
        list,
        save,
        update,
        remove,
        removeAll,
        refreshCache
    };
};

export default useHelps;