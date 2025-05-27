import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../../context/Auth/AuthContext';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

const useDashboardData = () => {
  const { user } = useContext(AuthContext);
  // Estados
  const [dateRange, setDateRange] = useState(7);
  const [selectedQueue, setSelectedQueue] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [queues, setQueues] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dados do dashboard
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
    },
    monthlyMessages: [],
    monthlyTickets: []
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Carregar setores (queues)
        const queuesResponse = await api.get('/queue');
        const loadedQueues = [{ id: 'all', name: 'Todos' }, ...queuesResponse.data];
        setQueues(loadedQueues);
        
        // Carregar usuários
        const usersResponse = await api.get('/users/list');
        setUsers([{ id: 'all', name: 'Todos os Agentes' }, ...usersResponse.data]);
        
      } catch (error) {
        console.error('Erro ao carregar dados iniciais', error);
        setError('Erro ao carregar dados iniciais. Por favor, tente novamente.');
        toast.error('Erro ao carregar dados iniciais. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Recarregar dados quando mudar a faixa de data ou a queue selecionada
  useEffect(() => {
    if (queues.length > 0) {
      loadDashboardData();
    }
  }, [dateRange, selectedQueue, queues]);

  // Função para carregar os dados do dashboard
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calcular datas para o filtro
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - dateRange);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Seleção do endpoint com base na fila atual
      const queueId = selectedQueue === 'all' ? null : selectedQueue;
      let overviewEndpoint = `/dashboard/overview?startDate=${startDateStr}&endDate=${endDateStr}`;
      let queuesEndpoint = `/dashboard/queues?startDate=${startDateStr}&endDate=${endDateStr}`;
      
      if (queueId) {
        queuesEndpoint = `/dashboard/queues?startDate=${startDateStr}&endDate=${endDateStr}&queueId=${queueId}`;
      }
      
      // Carregar dados principais - sempre pegar o overview geral e também os dados específicos da queue
      const overviewResponse = await api.get(overviewEndpoint);
      const queueMetricsResponse = await api.get(queuesEndpoint);
      
      // Carregar dados de prospecção
      const prospectionResponse = await api.get(
        `/dashboard/agent-prospection?period=${dateRange === 7 ? 'semana' : dateRange === 15 ? 'quinzena' : 'mes'}`
      );

      // Carregar dados mensais de mensagens e tickets
      const monthlyMessagesResponse = await api.get(
        `/dashboard/monthly-messages?startDate=${startDateStr}&endDate=${endDateStr}`
      );

      const monthlyTicketsResponse = await api.get(
        `/dashboard/monthly-tickets?startDate=${startDateStr}&endDate=${endDateStr}`
      );
      
      // Verificar e inicializar dados para evitar erros
      const overviewData = overviewResponse.data || {};
      const queueMetricsData = queueMetricsResponse.data || {};
      const monthlyMessagesData = monthlyMessagesResponse.data || [];
      const monthlyTicketsData = monthlyTicketsResponse.data || [];
      
      // Se estamos em uma fila específica, usar os dados dela, senão usar os dados do overview geral
      let messagesCount = overviewData.totalMessages || 0;
      let avgResponseTime = overviewData.averageFirstResponseTime || 0;
      let clientsCount = overviewData.newContacts || 0;
      let messagesTrend = overviewData.messageTrend || 0;
      let responseTimeTrend = overviewData.responseTrend || 0;
      let clientsTrend = overviewData.clientTrend || 0;
      let messagesByDay = overviewData.messagesByDay || [];
      let contactMetrics = overviewData.contactMetrics || { total: 0, byState: {} };
      
      // Se temos uma fila selecionada e dados disponíveis para ela, atualizamos os valores
      if (queueId && queueMetricsData.ticketsByQueue && queueMetricsData.ticketsByQueue.length > 0) {
        const queueData = queueMetricsData.ticketsByQueue[0];
        messagesCount = queueData.count || 0;
        avgResponseTime = queueData.firstContactTime || 0;
        clientsCount = queueData.clients || 0;
        
        // Para filas específicas, não temos dados de contatos por estado
        contactMetrics = { total: 0, byState: {} };
      }
      
      const ticketsByUser = queueMetricsData.ticketsByUser || [];
      const ticketsByQueue = queueMetricsData.ticketsByQueue || [];
      
      // Processar dados recebidos
      const newData = {
        messagesCount,
        avgResponseTime: formatResponseTime(avgResponseTime),
        clientsCount,
        // Limitar os valores de tendência para evitar percentuais extremos
        messagesTrend: limitTrendValue(messagesTrend),
        responseTimeTrend: limitTrendValue(responseTimeTrend),
        clientsTrend: limitTrendValue(clientsTrend),
        messagesByDay: formatMessagesByDay(messagesByDay),
        messagesByUser: formatMessagesByUser(ticketsByUser),
        comparativeData: formatComparativeData(ticketsByQueue),
        prospectionData: prospectionResponse.data || [],
        contactMetrics,
        monthlyMessages: monthlyMessagesData,
        monthlyTickets: monthlyTicketsData
      };
      
      setDashboardData(newData);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard', error);
      setError('Erro ao carregar métricas do dashboard.');
      toast.error('Erro ao carregar métricas do dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const getColorScale = useCallback((value, max) => {
    const intensity = Math.pow(value / max, 0.5);
    const minIntensity = 0.4;
    const maxIntensity = 0.9;
    return `rgba(25, 118, 210, ${minIntensity + (intensity * (maxIntensity - minIntensity))})`;
  }, []);

  // Funções para formatação de dados
  const formatResponseTime = (minutes) => {
    if (!minutes) return '0m 00s';
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Limitar valores de tendência para evitar percentuais extremos
  const limitTrendValue = (trendValue, maxLimit = 200) => {
    if (trendValue === undefined || trendValue === null) return 0;
    if (trendValue > maxLimit) return maxLimit;
    if (trendValue < -maxLimit) return -maxLimit;
    return trendValue;
  };

  const formatMessagesByDay = (data) => {
    // Se não houver dados, retornar array vazio
    if (!data || data.length === 0) return [];

    // Ordenar por data
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Limitar aos últimos 7 dias
    const last7Days = sortedData.slice(-7);

    return last7Days;
  };

  const formatMessagesByUser = (data) => {
    if (!data || data.length === 0) return [];
    
    // Calcular o total de mensagens
    const total = data.reduce((sum, user) => sum + user.count, 0);
    
    // Mapear os dados e calcular o percentual
    return data.slice(0, 5).map(user => ({
      id: user.userId,
      name: user.userName,
      value: user.count,
      percentage: Math.round((user.count / total) * 100)
    }));
  };

  const formatComparativeData = (queueData) => {
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
  };

  // Retornar os dados e funções necessários
  return {
    isLoading,
    error,
    dateRange,
    setDateRange,
    selectedQueue,
    setSelectedQueue,
    selectedAgent,
    setSelectedAgent,
    queues,
    users,
    dashboardData,
    loadDashboardData,
    getDateRangeDisplay: () => {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - dateRange);
      
      const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      };
      
      return `${formatDate(pastDate)} - ${formatDate(today)}`;
    }
  };
};

export default useDashboardData;