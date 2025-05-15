import api from "../../services/api";
import cacheService from "../../services/cacheService";

const CACHE_KEY = 'helps_list';
const CACHE_VALIDITY = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

const useHelps = () => {
    const findAll = async (params) => {
        const { data } = await api.request({
            url: `/helps`,
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        // Verifica se há dados em cache válidos
        const cachedData = cacheService.get(CACHE_KEY);
        if (cachedData) {
            console.log("[useHelps] Utilizando dados em cache para helps/list");
            return cachedData;
        }

        // Se não houver cache válido, busca da API
        console.log("[useHelps] Buscando dados da API para helps/list");
        const { data } = await api.request({
            url: '/helps/list',
            method: 'GET',
            params
        });

        // Armazena os dados no cache
        cacheService.set(CACHE_KEY, data, CACHE_VALIDITY);
        
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/helps',
            method: 'POST',
            data
        });
        
        // Invalida o cache após salvar novos dados
        cacheService.invalidate(CACHE_KEY);
        
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/helps/${data.id}`,
            method: 'PUT',
            data
        });
        
        // Invalida o cache após atualizar dados
        cacheService.invalidate(CACHE_KEY);
        
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/helps/${id}`,
            method: 'DELETE'
        });
        
        // Invalida o cache após remover dados
        cacheService.invalidate(CACHE_KEY);
        
        return data;
    }

    const removeAll = async () => {
        const { data } = await api.request({
            url: '/helps/all',
            method: 'DELETE'
        });
        
        // Invalida o cache após remover todos os dados
        cacheService.invalidate(CACHE_KEY);
        
        return data;
    }

    // Função para forçar a atualização do cache
    const refreshCache = async () => {
        cacheService.invalidate(CACHE_KEY);
        return await list();
    }

    return {
        findAll,
        list,
        save,
        update,
        remove,
        removeAll,
        refreshCache
    }
}

export default useHelps;