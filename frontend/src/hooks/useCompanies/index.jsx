
import api from "../../services/api";
import PropTypes from 'prop-types';

/**
 * @typedef {Object} CompanyData
 * @property {string} name - Nome da empresa
 * @property {string} phone - Telefone da empresa
 * @property {number} planId - ID do plano da empresa
 * @property {string} dueDate - Data de vencimento no formato YYYY-MM-DD
 * @property {string} recurrence - Recorrência do pagamento (ex: 'monthly', 'yearly')
 * @property {string} email - E-mail da empresa
 * @property {string} document - CNPJ/CPF da empresa
 * @property {boolean} [status=true] - Status da empresa (ativo/inativo)
 */

/**
 * @typedef {Object} ScheduleData
 * @property {string} id - ID da empresa
 * @property {Array} schedules - Array de horários
 */

/**
 * Hook personalizado para gerenciar empresas
 * @returns {Object} - Retorna funções para manipulação de empresas
 * @property {Function} save - Cria uma nova empresa
 * @property {Function} update - Atualiza os dados de uma empresa
 * @property {Function} remove - Remove uma empresa
 * @property {Function} list - Lista todas as empresas (apenas dados básicos)
 * @property {Function} find - Busca os detalhes de uma empresa específica
 * @property {Function} findAll - Lista todas as empresas (apenas dados básicos)
 * @property {Function} updateSchedules - Atualiza os horários de uma empresa
 */

const useCompanies = () => {
    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/companies',
            method: 'POST',
            data: {
                name: data.name,
                phone: data.phone,
                planId: data.planId,
                dueDate: data.dueDate,
                recurrence: data.recurrence,
                email: data.email,
                document: data.document,
                status: data.status || true
            }
        });
        return responseData;
    }

    const findAll = async () => {
        const { data } = await api.request({
            url: `/companies/basic/list`, // Nova rota
            method: 'GET'
        });
        return data;
    }

    const list = async () => {
        const { data } = await api.request({
            url: `/companies/basic/list`, // Nova rota
            method: 'GET'
        });
        return data;
    }

    const find = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}/details`, // Nova rota que inclui mais detalhes
            method: 'GET'
        });
        return data;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}/info`, // Nova rota
            method: 'PUT',
            data: {
                name: data.name,
                phone: data.phone,
                planId: data.planId,
                dueDate: data.dueDate,
                recurrence: data.recurrence,
                email: data.email,
                document: data.document,
                status: data.status
            }
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const updateSchedules = async (data) => {
        try {
          const response = await api.put(`/companies/${data.id}/schedules`, {
            schedules: data.schedules
          });
          return response.data;
        } catch (error) {
          console.error(error);
          throw error;
        }
      };

    return {
        save,
        update,
        remove,
        list,
        find,
        findAll,
        updateSchedules
    }
}

// Definindo PropTypes para o hook
useCompanies.propTypes = {
  save: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  list: PropTypes.func.isRequired,
  find: PropTypes.func.isRequired,
  findAll: PropTypes.func.isRequired,
  updateSchedules: PropTypes.func.isRequired,
};

// Documentando os parâmetros e retornos das funções
/**
 * @type {Object}
 * @property {Function} save - Cria uma nova empresa
 * @param {CompanyData} data - Dados da empresa a ser criada
 * @returns {Promise<Object>} Dados da empresa criada
 * 
 * @property {Function} update - Atualiza uma empresa existente
 * @param {CompanyData & {id: number}} data - Dados da empresa a ser atualizada (inclui o ID)
 * @returns {Promise<Object>} Dados da empresa atualizada
 * 
 * @property {Function} remove - Remove uma empresa
 * @param {number} id - ID da empresa a ser removida
 * @returns {Promise<Object>} Resposta da API
 * 
 * @property {Function} list - Lista todas as empresas
 * @returns {Promise<Array>} Lista de empresas
 * 
 * @property {Function} find - Busca os detalhes de uma empresa
 * @param {number} id - ID da empresa
 * @returns {Promise<Object>} Dados detalhados da empresa
 * 
 * @property {Function} findAll - Lista todas as empresas (apenas dados básicos)
 * @returns {Promise<Array>} Lista de empresas
 * 
 * @property {Function} updateSchedules - Atualiza os horários de uma empresa
 * @param {ScheduleData} data - Dados dos horários
 * @returns {Promise<Object>} Resposta da API
 */

export default useCompanies;