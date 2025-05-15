/** 
 * @TercioSantos-1 |
 * api/get/todas as configurações de 1 empresa |
 * api/get/1 configuração específica |
 * api/put/atualização de 1 configuração |
 */
import api, { openApi } from "../services/api";


const useCompanySettings = () => {

    const getAllFirst = async () => {//
        const { data } = await openApi.request({
            url: `/company-settings-all`,
            method: 'GET'
        });

        return data;
    }

    const getAll = async (companyId) => {
        const { data } = await api.request({
            url: `/company-settings/${companyId}`,
            method: 'GET'
        });

        return data;
    }

   const get = async (params) => {
        const { data } = await api.request({
            url: '/company-settings-one',
            method: 'GET',
            params
        });
        return data;
    } 

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: '/company-settings',
            method: 'PUT',
            data
        });
        return responseData;
    }

    return {
        getAllFirst,
        getAll,
        get,
        update
    }
}

export default useCompanySettings;