import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import { toast } from '../helpers/toast';
import { i18n } from '../translate/i18n';

/**
 * Hook para listagem de usuários com filtros
 * @param {Object} options Opções de configuração
 * @param {number} options.companyId ID da empresa (opcional)
 * @param {string} options.profile Perfil para filtrar (user, admin, superv)
 * @param {boolean} options.excludeAdmin Excluir administradores da lista
 * @returns {Object} Retorna funções e estados para gerenciar usuários
 */
export const useUsersList = ({ 
  companyId = null, 
  profile = null,
  excludeAdmin = false 
} = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (companyId) {
        params.companyId = companyId;
      }
      if (excludeAdmin) {
        params.excludeAdmin = true;
      }

      const { data } = await api.get('/users/simple-list', { params });
      
      // Filtra os usuários com base no profile se especificado
      let filteredUsers = data;
      if (profile) {
        filteredUsers = data.filter(user => user.profile === profile);
      }
      
      setUsers(filteredUsers);
    } catch (err) {
      const errorMsg = err.response?.data?.error || i18n.t('users.errors.fetchList');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [companyId, profile, excludeAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserById = useCallback((userId) => {
    return users.find(user => user.id === userId) || null;
  }, [users]);

  const filterUsersByIds = useCallback((userIds) => {
    return users.filter(user => userIds.includes(user.id));
  }, [users]);

  const getUsersByProfile = useCallback((profileType) => {
    return users.filter(user => user.profile === profileType);
  }, [users]);

  const getSelectOptions = useCallback(() => {
    return users.map(user => ({
      value: user.id,
      label: user.name
    }));
  }, [users]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    filterUsersByIds,
    getUsersByProfile,
    getSelectOptions
  };
};

// PropTypes para os objetos utilizados
export const UserPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  profile: PropTypes.string.isRequired
});

// PropTypes para as opções do hook
export const UseUsersListOptionsPropTypes = PropTypes.shape({
  companyId: PropTypes.number,
  profile: PropTypes.oneOf(['user', 'admin', 'superv']),
  excludeAdmin: PropTypes.bool
});

// PropTypes para o retorno do hook
export const UseUsersListReturnPropTypes = {
  users: PropTypes.arrayOf(UserPropTypes).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  fetchUsers: PropTypes.func.isRequired,
  getUserById: PropTypes.func.isRequired,
  filterUsersByIds: PropTypes.func.isRequired,
  getUsersByProfile: PropTypes.func.isRequired,
  getSelectOptions: PropTypes.func.isRequired
};