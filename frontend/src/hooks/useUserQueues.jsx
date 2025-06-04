import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/Auth/AuthContext';
import { toast } from '../helpers/toast';

/**
 * Hook personalizado para gerenciar as filas do usuário
 * @param {boolean} autoLoad - Se deve carregar automaticamente as filas
 * @returns {Object} Objeto com filas, estado de loading e funções de controle
 */
const useUserQueues = (autoLoad = true) => {
  const { user } = useContext(AuthContext);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAllTicketAccess, setHasAllTicketAccess] = useState(false);

  /**
   * Carrega as filas do usuário atual
   */
  const loadUserQueues = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Primeiro verifica se o usuário tem acesso a todos os tickets
      if (user.allTicket === "enabled") {
        setHasAllTicketAccess(true);
        // Se tem acesso total, busca todas as filas ativas da empresa
        const { data } = await api.get('/queue', {
          params: {
            includeInactive: false
          }
        });
        setQueues(data || []);
      } else {
        setHasAllTicketAccess(false);
        // Busca apenas as filas que o usuário tem acesso
        const { data } = await api.get(`/users/${user.id}/queues`);
        
        if (data && data.queues) {
          // Filtra apenas filas ativas
          const activeQueues = data.queues.filter(queue => queue.isActive !== false);
          setQueues(activeQueues);
        } else {
          setQueues([]);
        }
      }

    } catch (err) {
      console.error('Erro ao carregar filas do usuário:', err);
      setError('Erro ao carregar filas disponíveis');
      
      if (err.response?.status !== 404) {
        toast.error('Erro ao carregar suas filas disponíveis');
      }
      
      setQueues([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.allTicket]);

  /**
   * Verifica se o usuário tem acesso a uma fila específica
   * @param {number} queueId - ID da fila a verificar
   * @returns {boolean} Se tem acesso à fila
   */
  const hasQueueAccess = useCallback((queueId) => {
    if (hasAllTicketAccess) {
      return true;
    }
    
    return queues.some(queue => queue.id === queueId);
  }, [queues, hasAllTicketAccess]);

  /**
   * Busca uma fila específica por ID
   * @param {number} queueId - ID da fila
   * @returns {Object|null} Objeto da fila ou null se não encontrada
   */
  const getQueueById = useCallback((queueId) => {
    return queues.find(queue => queue.id === queueId) || null;
  }, [queues]);

  /**
   * Retorna apenas filas ativas
   * @returns {Array} Array de filas ativas
   */
  const getActiveQueues = useCallback(() => {
    return queues.filter(queue => queue.isActive !== false);
  }, [queues]);

  /**
   * Força um reload das filas
   */
  const reloadQueues = useCallback(() => {
    loadUserQueues();
  }, [loadUserQueues]);

  // Carrega automaticamente se autoLoad for true
  useEffect(() => {
    if (autoLoad && user?.id) {
      loadUserQueues();
    }
  }, [autoLoad, user?.id, loadUserQueues]);

  // Recarrega quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      setQueues([]);
      setError(null);
      if (autoLoad) {
        loadUserQueues();
      }
    }
  }, [user?.id, autoLoad, loadUserQueues]);

  return {
    queues,
    loading,
    error,
    hasAllTicketAccess,
    loadUserQueues,
    hasQueueAccess,
    getQueueById,
    getActiveQueues,
    reloadQueues,
    totalQueues: queues.length
  };
};

export default useUserQueues;