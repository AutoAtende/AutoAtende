import { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { AuthContext } from '../../../context/Auth/AuthContext';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

// Debounce customizado
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Cache simples no frontend
class FrontendCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Limite máximo de entradas
  }

  set(key, data, ttlMinutes = 3) {
    // Remove entradas antigas se exceder o limite
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

const frontendCache = new FrontendCache();

const useDashboardData = () => {
  const { user } = useContext(AuthContext);
  
  // Estados principais
  const [dateRange, setDateRange] = useState(7);
  const [selectedQueue, setSelectedQueue] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [queues, setQueues] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para controle de carregamento individual
  const [loadingStates, setLoadingStates] = useState({
    overview: false,
    queues: false,
    prospection: false,
    contacts: false
  });

  // Dados do dashboard separados para carregamento individual
  const [dashboardData, setDashboardData] = useState({
    messagesCount: 0,
    avgResponseTime: '0m 00s',
    clientsCount: 0,
    messagesTrend: 0,
    responseTimeTrend: 0,
    clientsTrend: 0,
    messagesByDay: [],
    messagesByUser: [],
    comparativeData: [],
    prospectionData: [],
    contactMetrics: { 
      total: 0, 
      byState: {} 
    }
  });

  // Referências para cancelar requests
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // Debounce dos filtros para evitar muitas chamadas
  const debouncedDateRange = useDebounce(dateRange, 500);
  const debouncedSelectedQueue = useDebounce(selectedQueue, 300);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Gerar chave de cache
  const generateCacheKey = useCallback((endpoint, params) => {
    return `${endpoint}_${JSON.stringify(params)}_${user?.companyId}`;
  }, [user?.companyId]);

  // Função otimizada para fazer requests com cache e abort
  const makeRequest = useCallback(async (endpoint, params = {}, cacheMinutes = 3) => {
    const cacheKey = generateCacheKey(endpoint, params);
    
    // Verificar cache primeiro
    const cached = frontendCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Cancelar request anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await api.get(endpoint, {
        params,
        signal: abortControllerRef.current.signal
      });

      // Verificar se o componente ainda está montado
      if (!mountedRef.current) return null;

      // Salvar no cache
      frontendCache.set(cacheKey, response.data, cacheMinutes);
      
      return response.data;
    } catch (error) {
      if (error.name === 'CancelledError' || error.code === 'ERR_CANCELED') {
        return null; // Request cancelado, não é erro
      }
      throw error;
    }
  }, [generateCacheKey]);

  // Carregar dados iniciais (filas e usuários) - executa apenas uma vez
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Carregar em paralelo com cache
        const [queuesData, usersData] = await Promise.all([
          makeRequest('/queue', {}, 10), // Cache por mais tempo
          makeRequest('/users/list', {}, 10)
        ]);

        if (!isMounted) return;

        if (queuesData) {
          const loadedQueues = [{ id: 'all', name: 'Todos' }, ...queuesData];
          setQueues(loadedQueues);
        }

        if (usersData) {
          const loadedUsers = [{ id: 'all', name: 'Todos os Agentes' }, ...usersData];
          setUsers(loadedUsers);
        }

      } catch (error) {
        if (!isMounted) return;
        
        console.error('Erro ao carregar dados iniciais', error);
        setError('Erro ao carregar dados iniciais. Por favor, tente novamente.');
        toast.error('Erro ao carregar dados iniciais. Por favor, tente novamente.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [makeRequest]);

  // Função otimizada para carregar overview
  const loadOverviewData = useCallback(async () => {
    if (!queues.length) return;

    setLoadingStates(prev => ({ ...prev, overview: true }));

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - debouncedDateRange);
      
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const overviewData = await makeRequest('/dashboard/overview', params, 2);
      
      if (!overviewData || !mountedRef.current) return;

      // Atualizar apenas os dados do overview
      setDashboardData(prev => ({
        ...prev,
        messagesCount: overviewData.totalMessages || 0,
        avgResponseTime: formatResponseTime(overviewData.averageFirstResponseTime || 0),
        clientsCount: overviewData.newContacts || 0,
        messagesTrend: limitTrendValue(overviewData.messageTrend || 0),
        responseTimeTrend: limitTrendValue(overviewData.responseTrend || 0),
        clientsTrend: limitTrendValue(overviewData.clientTrend || 0),
        messagesByDay: formatMessagesByDay(overviewData.messagesByDay || []),
        contactMetrics: overviewData.contactMetrics || { total: 0, byState: {} }
      }));

    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Erro ao carregar overview', error);
      toast.error('Erro ao carregar visão geral.');
    } finally {
      if (mountedRef.current) {
        setLoadingStates(prev => ({ ...prev, overview: false }));
      }
    }
  }, [debouncedDateRange, queues.length, makeRequest]);

  // Função otimizada para carregar dados de filas
  const loadQueuesData = useCallback(async () => {
    if (!queues.length) return;

    setLoadingStates(prev => ({ ...prev, queues: true }));

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - debouncedDateRange);
      
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      // Adicionar queueId se não for 'all'
      if (debouncedSelectedQueue !== 'all') {
        params.queueId = debouncedSelectedQueue;
      }

      const queueMetricsData = await makeRequest('/dashboard/queues', params, 2);
      
      if (!queueMetricsData || !mountedRef.current) return;

      // Atualizar dados relacionados às filas
      setDashboardData(prev => ({
        ...prev,
        messagesByUser: formatMessagesByUser(queueMetricsData.ticketsByUser || []),
        comparativeData: formatComparativeData(queueMetricsData.ticketsByQueue || [])
      }));

      // Se fila específica selecionada, atualizar métricas principais
      if (debouncedSelectedQueue !== 'all' && queueMetricsData.ticketsByQueue?.length > 0) {
        const queueData = queueMetricsData.ticketsByQueue[0];
        setDashboardData(prev => ({
          ...prev,
          messagesCount: queueData.count || 0,
          avgResponseTime: formatResponseTime(queueData.firstContactTime || 0),
          clientsCount: queueData.clients || 0,
          contactMetrics: { total: 0, byState: {} } // Reset para fila específica
        }));
      }

    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Erro ao carregar dados de filas', error);
      toast.error('Erro ao carregar dados de filas.');
    } finally {
      if (mountedRef.current) {
        setLoadingStates(prev => ({ ...prev, queues: false }));
      }
    }
  }, [debouncedDateRange, debouncedSelectedQueue, queues.length, makeRequest]);

  // Função otimizada para carregar dados de prospecção
  const loadProspectionData = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, prospection: true }));

    try {
      const periodMap = {
        7: 'semana',
        15: 'quinzena',
        30: 'mes'
      };

      const prospectionData = await makeRequest('/dashboard/agent-prospection', {
        period: periodMap[debouncedDateRange] || 'semana'
      }, 5);

      if (!prospectionData || !mountedRef.current) return;

      setDashboardData(prev => ({
        ...prev,
        prospectionData: prospectionData || []
      }));

    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Erro ao carregar dados de prospecção', error);
      toast.error('Erro ao carregar dados de prospecção.');
    } finally {
      if (mountedRef.current) {
        setLoadingStates(prev => ({ ...prev, prospection: false }));
      }
    }
  }, [debouncedDateRange, makeRequest]);

  // Carregar dados quando os filtros mudarem (com debounce)
  useEffect(() => {
    if (queues.length === 0) return;
    
    // Carregar dados em paralelo para melhor performance
    Promise.all([
      loadOverviewData(),
      loadQueuesData(),
      loadProspectionData()
    ]);
  }, [debouncedDateRange, debouncedSelectedQueue, loadOverviewData, loadQueuesData, loadProspectionData]);

  // Função pública para recarregar todos os dados
  const loadDashboardData = useCallback(async () => {
    if (queues.length === 0) return;
    
    // Limpar cache para forçar reload
    frontendCache.clear();
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadOverviewData(),
        loadQueuesData(),
        loadProspectionData()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [loadOverviewData, loadQueuesData, loadProspectionData, queues.length]);

  // Funções auxiliares memoizadas
  const formatResponseTime = useCallback((minutes) => {
    if (!minutes) return '0m 00s';
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }, []);

  const limitTrendValue = useCallback((trendValue, maxLimit = 200) => {
    if (trendValue === undefined || trendValue === null) return 0;
    if (trendValue > maxLimit) return maxLimit;
    if (trendValue < -maxLimit) return -maxLimit;
    return trendValue;
  }, []);

  const formatMessagesByDay = useCallback((data) => {
    if (!data || data.length === 0) return [];
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedData.slice(-7); // Últimos 7 dias
  }, []);

  const formatMessagesByUser = useCallback((data) => {
    if (!data || data.length === 0) return [];
    
    const total = data.reduce((sum, user) => sum + user.count, 0);
    
    return data.slice(0, 5).map(user => ({
      id: user.userId,
      name: user.userName,
      value: user.count,
      percentage: Math.round((user.count / total) * 100)
    }));
  }, []);

  const formatComparativeData = useCallback((queueData) => {
    if (!queueData || queueData.length === 0) return [];
    
    return queueData.map(queue => ({
      id: queue.queueId,
      name: queue.queueName,
      messages: queue.count,
      avgTime: formatResponseTime(queue.avgResolutionTime || 0),
      clients: queue.clients || 0,
      responseRate: `${queue.responseRate || 0}%`,
      firstContact: formatResponseTime(queue.firstContactTime || 0)
    }));
  }, [formatResponseTime]);

  // Função memoizada para display de datas
  const getDateRangeDisplay = useMemo(() => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - dateRange);
    
    const formatDate = (date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    return `${formatDate(pastDate)} - ${formatDate(today)}`;
  }, [dateRange]);

  // Verificar se está carregando
  const isCurrentlyLoading = useMemo(() => {
    return isLoading || Object.values(loadingStates).some(state => state);
  }, [isLoading, loadingStates]);

  // Handlers otimizados com useCallback
  const handleDateRangeChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
  }, []);

  const handleQueueChange = useCallback((newQueue) => {
    setSelectedQueue(newQueue);
  }, []);

  const handleAgentChange = useCallback((newAgent) => {
    setSelectedAgent(newAgent);
  }, []);

  // Limpar cache quando necessário
  const clearCache = useCallback(() => {
    frontendCache.clear();
  }, []);

  // Retornar os dados e funções necessários
  return {
    // Estados principais
    isLoading: isCurrentlyLoading,
    error,
    
    // Filtros
    dateRange,
    setDateRange: handleDateRangeChange,
    selectedQueue,
    setSelectedQueue: handleQueueChange,
    selectedAgent,
    setSelectedAgent: handleAgentChange,
    
    // Dados
    queues,
    users,
    dashboardData,
    
    // Estados de carregamento específicos
    loadingStates,
    
    // Funções
    loadDashboardData,
    clearCache,
    getDateRangeDisplay,
    
    // Utilitários
    formatResponseTime,
    limitTrendValue
  };
};

export default useDashboardData;