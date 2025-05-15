import React, { useState, useEffect, useCallback, lazy, Suspense, useContext, useMemo, useRef } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { GlobalContext } from "../../context/GlobalContext";
import api from "../../services/api";
import { generateDemoData } from "./utils/demoData";
import DemoIcon from "../../components/Icons/DemoIcon";
import { alpha, useTheme } from "@mui/material/styles";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import SwipeableViews from "react-swipeable-views";
import DashboardSettingsModal from './components/DashboardSettingsModal';
import { debounce } from 'lodash';

// Material UI
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  IconButton,
  Grid,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  CircularProgress,
  Fade,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Backdrop,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Skeleton,
  Zoom,
  FormControlLabel,
  Switch,
  Slide
} from "@mui/material";
import { subDays } from "date-fns";

// Custom Hooks
import useResponsive from "./hooks/useResponsive";
import useDataCache from "./hooks/useDataCache";
import useSwipeGesture from "./hooks/useSwipeGesture";

// Ícones
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  Contacts as ContactsIcon,
  Queue as QueueIcon,
  LocalOffer as TagIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Help as HelpIcon,
  DateRange as DateRangeIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Cached as CachedIcon,
  InfoOutlined as InfoIcon,
  BrightnessAuto as ThemeIcon,
  NavigateBefore as BeforeIcon,
  NavigateNext as NextIcon,
  Close as CloseIcon,
  TouchApp as TouchAppIcon,
  Error as ErrorIcon,
  PersonAdd as PersonAddIcon
} from "@mui/icons-material";

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3,
            textAlign: 'center'
          }}
        >
          <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Oops! Algo deu errado.
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Ocorreu um erro ao carregar o dashboard. Por favor, tente novamente.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            sx={{ mt: 2 }}
          >
            Recarregar
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Lazy load dos componentes de abas para melhorar performance
const OverviewTab = lazy(() => import("./tabs/OverviewTab"));
const TicketsTab = lazy(() => import("./tabs/TicketsTab"));
const UsersTab = lazy(() => import("./tabs/UsersTab"));
const ContactsTab = lazy(() => import("./tabs/ContactsTab"));
const QueuesTab = lazy(() => import("./tabs/QueuesTab"));
const TagsTab = lazy(() => import("./tabs/TagsTab"));

// HOC para adicionar loading states aos componentes com Suspense
const withLoadingFallback = (Component) => (props) => (
  <Suspense
    fallback={
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={180} sx={{ borderRadius: 1, mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1, mb: 2 }} />
        <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
          <Skeleton variant="rectangular" width="50%" height={80} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="50%" height={80} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    }
  >
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  </Suspense>
);

// Componentes de abas com loading fallback
const LazyOverviewTab = withLoadingFallback(OverviewTab);
const LazyTicketsTab = withLoadingFallback(TicketsTab);
const LazyUsersTab = withLoadingFallback(UsersTab);
const LazyContactsTab = withLoadingFallback(ContactsTab);
const LazyQueuesTab = withLoadingFallback(QueuesTab);
const LazyTagsTab = withLoadingFallback(TagsTab);

const Dashboard = () => {
  const theme = useTheme();
  // Breakpoints mais granulares para uma experiência mais fluida
  const {
    isMobile,
    isTablet,
    isLandscape,
    isDesktop,
    screenSize,
    touchEnabled
  } = useResponsive();

  const { user } = useContext(AuthContext);
  const { drawerOpen } = useContext(GlobalContext);
  const history = useHistory();

  // Estado principal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Estados para o modo de demonstração
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoNotification, setShowDemoNotification] = useState(false);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Flag para controlar o carregamento inicial
  const isFirstRender = useRef(true);
  // Flag para controlar se os dados já foram carregados
  const dataLoaded = useRef(false);
  // Flag de atualização de filtros
  const [filtersChanged, setFiltersChanged] = useState(false);

  // Estado debounced para datas
  const [debouncedDates, setDebouncedDates] = useState({ startDate, endDate });

  // Implementar debounce para as atualizações de datas
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDates({ startDate, endDate });
      setFiltersChanged(true);
    }, 500); // 500ms de debounce

    return () => {
      clearTimeout(handler);
    };
  }, [startDate, endDate]);

  // Gestos para navegação por swipe
  const {
    handleSwipe,
    swipeHandlers,
    enableSwipe,
    disableSwipe
  } = useSwipeGesture({
    onSwipeLeft: () => handleTabChange(null, Math.min(activeTab + 1, 5)),
    onSwipeRight: () => handleTabChange(null, Math.max(activeTab - 1, 0))
  });

  // Cache inteligente de dados
  const {
    cachedData,
    setCachedData,
    isDataStale,
    lastUpdated,
    clearCache
  } = useDataCache('dashboard-data', 5 * 60 * 1000); // 5 minutos TTL

  // Estados para dados do dashboard
  const [overviewData, setOverviewData] = useState(null);
  const [ticketsData, setTicketsData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [contactsData, setContactsData] = useState(null);
  const [queuesData, setQueuesData] = useState(null);
  const [tagsData, setTagsData] = useState(null);
  const [demoData, setDemoData] = useState(null);
  
  // Estados para dados específicos do ContactsTab
  const [prospectionData, setProspectionData] = useState([]);
  const [prospectionTotals, setProspectionTotals] = useState({ clients: 0, messages: 0 });
  const [queueList, setQueueList] = useState([]);
  const [comparativoData, setComparativoData] = useState(null);

  // Função para atualizar múltiplos estados de dados de uma vez
  const setAllDataStates = useCallback((data) => {
    if (!data) return;
    
    setOverviewData(data.overview || null);
    setTicketsData(data.tickets || null);
    setUsersData(data.users || null);
    setContactsData(data.contacts || null);
    setQueuesData(data.queues || null);
    setTagsData(data.tags || null);
    
    if (data.prospection) {
      setProspectionData(data.prospection || []);
    }
    
    if (data.queueList) {
      setQueueList(data.queueList || []);
    }
    
    if (data.comparativo) {
      setComparativoData(data.comparativo || null);
    }
    
    if (data.prospection) {
      const clientsTotal = data.prospection.reduce((sum, item) => sum + (item.clients || 0), 0);
      const messagesTotal = data.prospection.reduce((sum, item) => sum + (item.messages || 0), 0);
      setProspectionTotals({ clients: clientsTotal, messages: messagesTotal });
    }
  }, []);

  // Fetch API otimizado para requisições simples
  const fetchWithTimeout = useCallback(async (url, options = {}, timeout = 10000) => {
    // Configurar timeout simples
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Requisição para ${url} excedeu o tempo limite.`)), timeout)
    );

    try {
      const fetchPromise = api.get(url, options);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return response;
    } catch (error) {
      console.error(`Erro ao fazer requisição para ${url}:`, error);
      throw error;
    }
  }, []);

  // Função para obter dados da visão geral
  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await fetchWithTimeout("/dashboard/overview", {
        params: {
          startDate: debouncedDates.startDate.toISOString(),
          endDate: debouncedDates.endDate.toISOString()
        }
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados da visão geral:", error);
      setError("Não foi possível carregar os dados da visão geral.");
      return null;
    }
  }, [debouncedDates.startDate, debouncedDates.endDate, fetchWithTimeout]);

  // Função para obter dados de tickets
  const fetchTicketsData = useCallback(async () => {
    try {
      const { data } = await fetchWithTimeout("/dashboard/tickets", {
        params: {
          startDate: debouncedDates.startDate.toISOString(),
          endDate: debouncedDates.endDate.toISOString()
        }
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados de tickets:", error);
      setError("Não foi possível carregar os dados de tickets.");
      return null;
    }
  }, [debouncedDates.startDate, debouncedDates.endDate, fetchWithTimeout]);

  // Função para obter dados de usuários
  const fetchUsersData = useCallback(async () => {
    try {
      const { data } = await fetchWithTimeout("/dashboard/users", {
        params: {
          startDate: debouncedDates.startDate.toISOString(),
          endDate: debouncedDates.endDate.toISOString()
        }
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados de usuários:", error);
      setError("Não foi possível carregar os dados de usuários.");
      return null;
    }
  }, [debouncedDates.startDate, debouncedDates.endDate, fetchWithTimeout]);

  // Função para obter dados de contatos
  const fetchContactsData = useCallback(async () => {
    try {
      const { data } = await fetchWithTimeout("/dashboard/contacts", {
        params: {
          startDate: debouncedDates.startDate.toISOString(),
          endDate: debouncedDates.endDate.toISOString()
        }
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados de contatos:", error);
      setError("Não foi possível carregar os dados de contatos.");
      return null;
    }
  }, [debouncedDates.startDate, debouncedDates.endDate, fetchWithTimeout]);

  // Função para obter dados de prospecção
  const fetchProspectionData = useCallback(async (period = 'hoje') => {
    try {
      const { data } = await fetchWithTimeout("/dashboard/agent-prospection", { 
        params: { period } 
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados de prospecção:", error);
      return [];
    }
  }, [fetchWithTimeout]);

  // Função para obter dados comparativos entre filas
  const fetchComparativoData = useCallback(async (queue1Id, queue2Id) => {
    if (!queue1Id || !queue2Id) return null;
    
    try {
      const { data } = await fetchWithTimeout("/dashboard/queues-comparison", {
        params: { queue1Id, queue2Id }
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar comparativo:", error);
      return null;
    }
  }, [fetchWithTimeout]);

  // Função para obter lista de filas/setores
  const fetchQueueList = useCallback(async () => {
    try {
      // Atualizando a rota conforme solicitado para /queues
      const { data } = await fetchWithTimeout("/queue");
      return data;
    } catch (error) {
      console.error("Erro ao buscar lista de filas:", error);
      return [];
    }
  }, [fetchWithTimeout]);

  // Função para obter dados de filas
  const fetchQueuesData = useCallback(async () => {
    try {
      const { data } = await fetchWithTimeout("/dashboard/queues", {
        params: {
          startDate: debouncedDates.startDate.toISOString(),
          endDate: debouncedDates.endDate.toISOString()
        }
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados de filas:", error);
      setError("Não foi possível carregar os dados de filas.");
      return null;
    }
  }, [debouncedDates.startDate, debouncedDates.endDate, fetchWithTimeout]);

  // Função para obter dados de tags
  const fetchTagsData = useCallback(async () => {
    try {
      const { data } = await fetchWithTimeout("/dashboard/tags", {
        params: {
          startDate: debouncedDates.startDate.toISOString(),
          endDate: debouncedDates.endDate.toISOString()
        }
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados de tags:", error);
      setError("Não foi possível carregar os dados de tags.");
      return null;
    }
  }, [debouncedDates.startDate, debouncedDates.endDate, fetchWithTimeout]);

  // Função simplificada para buscar todos os dados
const fetchAllData = useCallback(async () => {
  // Evitar buscas desnecessárias
  if (loading && !isFirstRender.current) return;
  
  setLoading(true);
  setError(null);

  try {
    // Verificar cache primeiro
    if (cachedData && !isDataStale && Object.keys(cachedData).length > 0) {
      setAllDataStates(cachedData);
      setLoading(false);
      dataLoaded.current = true;
      return;
    }

    // Usar Promise.all para buscar todos os dados juntos
    const [
      overviewResult, 
      ticketsResult, 
      usersResult, 
      contactsResult, 
      queuesResult, 
      tagsResult,
      prospectionResult,
      queueListResult
    ] = await Promise.all([
      fetchOverview(),
      fetchTicketsData(),
      fetchUsersData(),
      fetchContactsData(),
      fetchQueuesData(),
      fetchTagsData(),
      fetchProspectionData(),
      fetchQueueList()
    ]);

    // Atualizar estados individuais
    if (overviewResult) setOverviewData(overviewResult);
    if (ticketsResult) setTicketsData(ticketsResult);
    if (usersResult) setUsersData(usersResult);
    if (queuesResult) setQueuesData(queuesResult);
    if (tagsResult) setTagsData(tagsResult);
    if (contactsResult) setContactsData(contactsResult);
    
    if (prospectionResult && prospectionResult.length > 0) {
      setProspectionData(prospectionResult);
      
      // Calcular totais para prospecção
      const clientsTotal = prospectionResult.reduce((sum, item) => sum + (item.clients || 0), 0);
      const messagesTotal = prospectionResult.reduce((sum, item) => sum + (item.messages || 0), 0);
      setProspectionTotals({ clients: clientsTotal, messages: messagesTotal });
    }
    
    if (queueListResult && queueListResult.length > 0) {
      setQueueList(queueListResult);
    }

    // Removido o trecho que buscava automaticamente o comparativo entre filas
    // Agora essa busca será feita somente sob demanda quando o usuário solicitar

    // Atualizar cache
    const newCachedData = {
      overview: overviewResult,
      tickets: ticketsResult,
      users: usersResult,
      contacts: contactsResult,
      queues: queuesResult,
      tags: tagsResult,
      prospection: prospectionResult || [],
      queueList: queueListResult || [],
      // Não incluímos o comparativoData no cache, pois agora será buscado sob demanda
    };
    
    setCachedData(newCachedData);
    dataLoaded.current = true;
    setFiltersChanged(false);
    
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    setError("Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.");
  } finally {
    setLoading(false);
    isFirstRender.current = false;
  }
}, [
  loading, fetchOverview, fetchTicketsData, fetchUsersData,
  fetchContactsData, fetchQueuesData, fetchTagsData,
  fetchProspectionData, fetchQueueList,
  setCachedData, setAllDataStates, isDataStale, cachedData
]);
  // Função para ativar/desativar o modo de demonstração
  const toggleDemoMode = useCallback(() => {
    if (!isDemoMode) {
      // Modo de demonstração - gerar dados fictícios
      try {
        const data = generateDemoData();
        
        // Usar função unificada para atualizar todos os estados
        setDemoData(data);
        
        // Mapeamento específico para o formato esperado por setAllDataStates
        const mappedData = {
          overview: data.overviewData,
          tickets: data.ticketsData,
          users: data.usersData,
          contacts: data.contactsData,
          queues: data.queuesData,
          tags: data.tagsData,
          prospection: data.contactsData?.prospecaoData || [],
          queueList: data.contactsData?.queuesData || [],
          comparativo: data.contactsData?.comparativoData || null
        };
        
        setAllDataStates(mappedData);
        
        // Calcular totais para prospecção
        if (data.contactsData?.prospecaoData) {
          const prospecaoData = data.contactsData.prospecaoData || [];
          const clientsTotal = prospecaoData.reduce((sum, item) => sum + (item.clients || 0), 0);
          const messagesTotal = prospecaoData.reduce((sum, item) => sum + (item.messages || 0), 0);
          setProspectionTotals({ clients: clientsTotal, messages: messagesTotal });
        }

        setShowDemoNotification(true);
      } catch (error) {
        console.error("Erro ao gerar dados de demonstração:", error);
        setError("Não foi possível ativar o modo de demonstração.");
      }
    } else {
      setShowDemoNotification(false);
      // Limpar dados de demonstração ao desativar o modo demo
      setDemoData(null);
      // Recarregar dados reais
      fetchAllData();
    }
    
    setIsDemoMode(!isDemoMode);
  }, [isDemoMode, fetchAllData, setAllDataStates]);

  // Obtenção dos dados para a renderização dos componentes
  const getCurrentData = useMemo(() => {
    // Estruturas vazias para dados faltantes
    const emptyData = {
      overview: {
        totalTickets: 0,
        totalMessages: 0,
        averageResolutionTime: 0,
        averageRating: 0,
        ticketsByStatus: [],
        newContacts: 0,
        ticketsByDay: [],
        messagesByDay: []
      },
      tickets: {
        ticketsByStatus: [],
        ticketsByQueue: [],
        ticketsByUser: [],
        ticketsByHour: [],
        ticketsByWeekday: [],
        averageResolutionTimeByQueue: [],
        averageFirstResponseTime: 0
      },
      users: {
        ticketsPerUser: [],
        messagesPerUser: [],
        avgResolutionTimePerUser: [],
        ratingsPerUser: [],
        ratingDistribution: []
      },
      contacts: {
        prospecaoData: [],
        comparativoData: null,
        queuesData: [],
        newContactsByDay: [],
        contactsWithMostTickets: [],
        contactsByHour: [],
        contactsByWeekday: [],
        mostUsedTags: []
      },
      queues: {
        ticketsByQueue: [],
        queueWaitTimes: [],
        queueResolutionTimes: [],
        queueRatings: []
      },
      tags: {
        mostUsedTags: [],
        tagResolutionTimes: [],
        tagsByTicketStatus: []
      }
    };

    // Dados para modo de demonstração vs. modo normal
    if (isDemoMode) {
      if (!demoData) {
        return {
          overviewData: emptyData.overview,
          ticketsData: emptyData.tickets,
          usersData: emptyData.users,
          contactsData: emptyData.contacts,
          queuesData: emptyData.queues,
          tagsData: emptyData.tags,
          prospectionData: [],
          queueList: [],
          comparativoData: null
        };
      }

      // No modo demo, usa dados de demonstração
      return {
        overviewData: demoData.overviewData || emptyData.overview,
        ticketsData: demoData.ticketsData || emptyData.tickets,
        usersData: demoData.usersData || emptyData.users,
        contactsData: demoData.contactsData || emptyData.contacts,
        queuesData: demoData.queuesData || emptyData.queues,
        tagsData: demoData.tagsData || emptyData.tags,
        prospectionData: demoData.contactsData?.prospecaoData || [],
        queueList: demoData.contactsData?.queuesData || [],
        comparativoData: demoData.contactsData?.comparativoData || null
      };
    }

    // No modo normal, usa dados da API
    return {
      overviewData: overviewData || emptyData.overview,
      ticketsData: ticketsData || emptyData.tickets,
      usersData: usersData || emptyData.users,
      contactsData: contactsData || emptyData.contacts,
      queuesData: queuesData || emptyData.queues,
      tagsData: tagsData || emptyData.tags,
      prospectionData: prospectionData || [],
      queueList: queueList || [],
      comparativoData: comparativoData || null
    };
  }, [
    isDemoMode, demoData,
    overviewData, ticketsData, usersData,
    contactsData, queuesData, tagsData,
    prospectionData, queueList, comparativoData
  ]);

  // Efeito para carregar dados apenas quando necessário
  useEffect(() => {
    // Carregar dados apenas na montagem inicial ou quando ocorrer mudança de filtros
    if (
      (isFirstRender.current && !dataLoaded.current && !isDemoMode) || 
      (filtersChanged && !isDemoMode)
    ) {
      fetchAllData();
    }
    
    // Definir isFirstRender como false após a primeira execução
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    
    // Carregar demo data se necessário
    if (isDemoMode && !demoData && isFirstRender.current) {
      const generatedData = generateDemoData();
      setDemoData(generatedData);
      
      // Mapear para o formato esperado por setAllDataStates
      const mappedData = {
        overview: generatedData.overviewData,
        tickets: generatedData.ticketsData,
        users: generatedData.usersData,
        contacts: generatedData.contactsData,
        queues: generatedData.queuesData,
        tags: generatedData.tagsData,
        prospection: generatedData.contactsData?.prospecaoData || [],
        queueList: generatedData.contactsData?.queuesData || [],
        comparativo: generatedData.contactsData?.comparativoData || null
      };
      
      setAllDataStates(mappedData);
      
      if (generatedData.contactsData?.prospecaoData) {
        const prospecaoData = generatedData.contactsData.prospecaoData || [];
        const clientsTotal = prospecaoData.reduce((sum, item) => sum + (item.clients || 0), 0);
        const messagesTotal = prospecaoData.reduce((sum, item) => sum + (item.messages || 0), 0);
        setProspectionTotals({ clients: clientsTotal, messages: messagesTotal });
      }
    }
    
    isFirstRender.current = false;
  }, [
    debouncedDates, 
    isDemoMode, 
    fetchAllData, 
    demoData,
    filtersChanged
  ]);

  // Melhoria na experiência do usuário em dispositivos móveis
  useEffect(() => {
    if (isMobile) {
      // Fechar filtros automaticamente após a seleção em dispositivos móveis
      if (showFilters) {
        const timer = setTimeout(() => {
          setShowFilters(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isMobile, showFilters]);

  // Habilitar/desabilitar gestos de swipe com base na aba ativa
  useEffect(() => {
    if (isMobile) {
      enableSwipe();
    } else {
      disableSwipe();
    }

    return () => disableSwipe();
  }, [isMobile, activeTab, enableSwipe, disableSwipe]);

  // Handler para mudança de abas com animações
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleStartDateChange = (e) => {
    try {
      const newDate = new Date(e.target.value);
      if (newDate > endDate) {
        setError("A data inicial não pode ser posterior à data final");
        return;
      }
      setStartDate(newDate);
      setError(null);
    } catch (error) {
      console.error("Erro ao processar data inicial:", error);
      setError("Data inicial inválida");
    }
  };

  const handleEndDateChange = (e) => {
    try {
      const newDate = new Date(e.target.value);
      if (newDate < startDate) {
        setError("A data final não pode ser anterior à data inicial");
        return;
      }
      if (newDate > new Date()) {
        setError("A data final não pode ser futura");
        return;
      }
      setEndDate(newDate);
      setError(null);
    } catch (error) {
      console.error("Erro ao processar data final:", error);
      setError("Data final inválida");
    }
  };

  // Função para atualizar dados
  const refreshData = useCallback(() => {
    if (isDemoMode) {
      // No modo demo, regeneramos os dados fictícios para simular uma atualização
      try {
        const refreshedDemoData = generateDemoData();
        setDemoData(refreshedDemoData);
        
        // Mapear para o formato esperado por setAllDataStates
        const mappedData = {
          overview: refreshedDemoData.overviewData,
          tickets: refreshedDemoData.ticketsData,
          users: refreshedDemoData.usersData,
          contacts: refreshedDemoData.contactsData,
          queues: refreshedDemoData.queuesData,
          tags: refreshedDemoData.tagsData,
          prospection: refreshedDemoData.contactsData?.prospecaoData || [],
          queueList: refreshedDemoData.contactsData?.queuesData || [],
          comparativo: refreshedDemoData.contactsData?.comparativoData || null
        };
        
        setAllDataStates(mappedData);
        
        // Calcular totais para prospecção
        if (refreshedDemoData.contactsData?.prospecaoData) {
          const prospecaoData = refreshedDemoData.contactsData.prospecaoData || [];
          const clientsTotal = prospecaoData.reduce((sum, item) => sum + (item.clients || 0), 0);
          const messagesTotal = prospecaoData.reduce((sum, item) => sum + (item.messages || 0), 0);
          setProspectionTotals({ clients: clientsTotal, messages: messagesTotal });
        }
        
        setShowDemoNotification(true);
      } catch (error) {
        console.error("Erro ao regenerar dados de demonstração:", error);
        setError("Não foi possível atualizar os dados de demonstração.");
      }
    } else {
      // No modo normal, limpa o cache e busca dados da API
      clearCache();
      setFiltersChanged(true); // Forçar atualização
      fetchAllData();
    }
  }, [isDemoMode, fetchAllData, clearCache, setAllDataStates]);

  // Controle de Drawer de filtros
  const toggleFilterDrawer = useCallback(() => {
    setFilterDrawerOpen(!filterDrawerOpen);
  }, [filterDrawerOpen]);

  // Toggle para o menu principal
  const toggleMenu = useCallback(() => {
    setMenuOpen(!menuOpen);
  }, [menuOpen]);

  // Toggle para o painel de filtros
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Speed Dial de ações rápidas
  const handleSpeedDialOpen = useCallback(() => {
    setSpeedDialOpen(true);
  }, []);

  const handleSpeedDialClose = useCallback(() => {
    setSpeedDialOpen(false);
  }, []);

  // Funções de atualização para os componentes do ContactsTab
  const updateProspectionPeriod = useCallback((period) => {
    if (isDemoMode) return;
    fetchProspectionData(period).then(data => {
      if (data && data.length > 0) {
        setProspectionData(data);
        
        // Calcular totais para prospecção
        const clientsTotal = data.reduce((sum, item) => sum + (item.clients || 0), 0);
        const messagesTotal = data.reduce((sum, item) => sum + (item.messages || 0), 0);
        setProspectionTotals({ clients: clientsTotal, messages: messagesTotal });
      }
    });
  }, [isDemoMode, fetchProspectionData]);
// Função para atualizar o comparativo entre filas
const updateComparativoQueues = useCallback((queue1Id, queue2Id) => {
  if (isDemoMode) return Promise.resolve(); // Retorna uma Promise resolvida no modo demo
  
  // Retorna a Promise para que possamos encadear .then() e .finally()
  return fetchComparativoData(queue1Id, queue2Id)
    .then(data => {
      if (data) {
        setComparativoData(data);
      }
      return data;
    })
    .catch(error => {
      console.error("Erro ao buscar comparativo:", error);
      // Retornar Promise rejeitada para que o componente filho saiba que ocorreu um erro
      return Promise.reject(error);
    });
}, [isDemoMode, fetchComparativoData]);

  // Componentes das abas com badges e ícones para melhoria da experiência
  const tabs = [
    {
      label: "Visão Geral",
      icon: <DashboardIcon />,
      component: <LazyOverviewTab data={getCurrentData.overviewData} touchEnabled={touchEnabled} />,
      badge: null,
      color: theme.palette.primary.main
    },
    {
      label: "Conversas",
      icon: <TicketIcon />,
      component: <LazyTicketsTab data={getCurrentData.ticketsData} touchEnabled={touchEnabled} />,
      badge: getCurrentData.ticketsData?.ticketsByStatus?.find(s => s?.status === 'open')?.count || null,
      color: theme.palette.info.main
    },
    {
      label: "Atendentes",
      icon: <PeopleIcon />,
      component: <LazyUsersTab data={getCurrentData.usersData} touchEnabled={touchEnabled} currentDates={debouncedDates} />,
      badge: getCurrentData.usersData?.ticketsPerUser?.length || null,
      color: theme.palette.success.main
    },
    {
      label: "Contatos",
      icon: <ContactsIcon />,
      component: <LazyContactsTab 
        data={getCurrentData.contactsData}
        prospectionData={getCurrentData.prospectionData}
        prospectionTotals={prospectionTotals}
        queues={getCurrentData.queueList}
        comparativoData={getCurrentData.comparativoData}
        updateProspectionPeriod={updateProspectionPeriod}
        updateComparativoQueues={updateComparativoQueues}
        touchEnabled={touchEnabled} 
        isDemoMode={isDemoMode}
      />,
      badge: null,
      color: theme.palette.warning.main
    },
    {
      label: "Filas",
      icon: <QueueIcon />,
      component: <LazyQueuesTab data={getCurrentData.queuesData} touchEnabled={touchEnabled} />,
      badge: null,
      color: theme.palette.secondary.main
    },
    {
      label: "Tags",
      icon: <TagIcon />,
      component: <LazyTagsTab data={getCurrentData.tagsData} touchEnabled={touchEnabled} />,
      badge: null,
      color: theme.palette.error.main
    }
  ];

  // Renderização com filtros visuais aprimorados para mobile
  const renderFilters = useCallback(() => {
    // Versão mobile dos filtros
    if (isMobile) {
      return (
        <Drawer
          anchor="bottom"
          open={filterDrawerOpen}
          onClose={toggleFilterDrawer}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '80vh'
            }
          }}
        >
          <Box sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Filtrar por Data</Typography>
              <IconButton onClick={toggleFilterDrawer} aria-label="Fechar filtros">
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider />

            <TextField
              label="Data Inicial"
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={handleStartDateChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="normal"
              InputProps={{
                sx: { fontSize: '1rem', py: 1.5 }
              }}
            />

            <TextField
              label="Data Final"
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={handleEndDateChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="normal"
              InputProps={{
                sx: { fontSize: '1rem', py: 1.5 }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={toggleFilterDrawer}
                sx={{ height: 48, minWidth: 120 }}
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setFiltersChanged(true);
                  fetchAllData();
                  toggleFilterDrawer();
                }}
                startIcon={<RefreshIcon />}
                sx={{ height: 48, minWidth: 120 }}
              >
                Aplicar
              </Button>
            </Box>

            {lastUpdated && (
              <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', mt: 1 }}>
                Última atualização: {formatDistanceToNow(new Date(lastUpdated), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </Typography>
            )}
          </Box>
        </Drawer>
      );
    }

    // Versão desktop dos filtros
    return (
      <Box sx={{
        mb: 3,
        mt: 2,
        display: showFilters ? 'block' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                label="Data Inicial"
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={handleStartDateChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: { fontSize: '1rem', py: 1.5 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label="Data Final"
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={handleEndDateChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: { fontSize: '1rem', py: 1.5 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  onClick={refreshData}
                  color="primary"
                  size="large"
                  aria-label="Atualizar dados"
                  sx={{
                    bgcolor: theme.palette.primary.lighter || alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                    width: 48,
                    height: 48
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {lastUpdated && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'right', mt: 1, mr: 1 }}>
              Última atualização: {formatDistanceToNow(new Date(lastUpdated), {
                addSuffix: true,
                locale: ptBR
              })}
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }, [
    isMobile, filterDrawerOpen, showFilters, startDate, endDate, lastUpdated, theme,
    toggleFilterDrawer, handleStartDateChange, handleEndDateChange, fetchAllData, refreshData
  ]);

  // Estado vazio aprimorado para dispositivos móveis
  const renderEmptyState = useCallback(() => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          p: isMobile ? 2 : 3,
          py: 4
        }}
      >
        <Zoom in={true} timeout={300}>
          <Box sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: '50%',
            mb: 2
          }}>
            <DashboardIcon
              sx={{
                fontSize: isMobile ? 48 : 60,
                color: 'text.secondary',
              }}
            />
          </Box>
        </Zoom>

        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom fontWeight="medium">
          Sem dados para exibir
        </Typography>

        <Typography
          variant="body2"
          color="textSecondary"
          paragraph
          sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}
        >
          Não foram encontradas métricas para o período selecionado.
          Altere o intervalo de datas ou tente o modo de demonstração.
        </Typography>

        <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: 350, mx: 'auto' }}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DateRangeIcon />}
              onClick={isMobile ? toggleFilterDrawer : toggleFilters}
              fullWidth
              size={isMobile ? "large" : "medium"}
              sx={{ height: isMobile ? 48 : 40 }}
            >
              Mudar Datas
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DemoIcon />}
              onClick={toggleDemoMode}
              fullWidth
              size={isMobile ? "large" : "medium"}
              sx={{ height: isMobile ? 48 : 40 }}
            >
              {isDemoMode ? 'Desativar Demo' : 'Modo Demo'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }, [
    isMobile, isDemoMode, theme,
    toggleFilterDrawer, toggleFilters, toggleDemoMode
  ]);

  // Menu lateral aprimorado para dispositivos maiores
  const renderSideMenu = useCallback(() => {
    return (
      <Drawer
        anchor={isMobile ? "bottom" : "left"}
        open={menuOpen}
        onClose={toggleMenu}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 280,
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            maxHeight: isMobile ? '80vh' : '100vh'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" component="div">
            Dashboard
          </Typography>
          <IconButton onClick={toggleMenu} aria-label="Fechar menu">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <List>
          {tabs.map((tab, index) => (
            <ListItem
              button
              key={index}
              onClick={() => {
                setActiveTab(index);
                toggleMenu();
              }}
              selected={activeTab === index}
              sx={{
                minHeight: 56,
                py: 0.5,
                px: 3,
                color: activeTab === index ? tab.color : 'text.primary',
                '&.Mui-selected': {
                  bgcolor: alpha(tab.color, 0.1),
                }
              }}
            >
              <ListItemIcon sx={{
                color: activeTab === index ? tab.color : 'text.secondary',
                minWidth: 42
              }}>
                {tab.badge ? (
                  <Badge badgeContent={tab.badge} color="error" max={99}>
                    {tab.icon}
                  </Badge>
                ) : (
                  tab.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{ fontWeight: activeTab === index ? 'medium' : 'normal' }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List>
          <ListItem button onClick={toggleFilterDrawer}>
            <ListItemIcon>
              <DateRangeIcon />
            </ListItemIcon>
            <ListItemText primary="Filtrar por Data" />
          </ListItem>

          <ListItem button onClick={toggleDemoMode}>
            <ListItemIcon>
              <DemoIcon />
            </ListItemIcon>
            <ListItemText primary={isDemoMode ? "Desativar Modo Demo" : "Ativar Modo Demo"} />
          </ListItem>

          <ListItem button onClick={refreshData}>
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText primary="Atualizar Dados" />
          </ListItem>
        </List>

        {lastUpdated && (
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Typography variant="caption" color="textSecondary">
              Última atualização: {formatDistanceToNow(new Date(lastUpdated), {
                addSuffix: true,
                locale: ptBR
              })}
            </Typography>
          </Box>
        )}
      </Drawer>
    );
  }, [
    isMobile, menuOpen, activeTab, tabs, isDemoMode, lastUpdated,
    toggleMenu, toggleFilterDrawer, toggleDemoMode, refreshData
  ]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.default',
        position: 'relative'
      }}
      {...swipeHandlers}
    >
      {/* Menu Lateral */}
      {renderSideMenu()}

      {/* Drawer de Filtros */}
      {renderFilters()}

      {/* Cabeçalho */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: isMobile ? 2 : 3,
          py: isMobile ? 1.5 : 2,
          borderBottom: 1,
          borderColor: 'divider',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size={isMobile ? "medium" : "small"}
            edge="start"
            onClick={toggleMenu}
            sx={{ mr: isMobile ? 1 : 1.5 }}
            aria-label="Abrir menu"
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            component="h1"
            sx={{ fontWeight: 'bold' }}
            noWrap
          >
            Dashboard de Métricas
          </Typography>

          {isDemoMode && (
            <Chip
              label="Modo Demo"
              color="primary"
              size="small"
              sx={{ ml: 1.5, display: { xs: 'none', sm: 'flex' } }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isDemoMode && isMobile && (
            <Chip
              label="Demo"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
          )}

          {!isMobile && (
            <>
              <Tooltip title={isDemoMode ? "Desativar Modo Demo" : "Ativar Modo Demo"}>
                <IconButton
                  onClick={toggleDemoMode}
                  color={isDemoMode ? "primary" : "default"}
                  aria-label={isDemoMode ? "Desativar Modo Demo" : "Ativar Modo Demo"}
                  sx={{
                    mr: 1,
                    ...(isDemoMode && {
                      bgcolor: theme.palette.primary.lighter || alpha(theme.palette.primary.main, 0.1),
                    })
                  }}
                >
                  <DemoIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Filtrar por Data">
                <IconButton
                  onClick={toggleFilters}
                  color={showFilters ? "primary" : "default"}
                  aria-label="Filtrar por data"
                >
                  <DateRangeIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Configurações do Dashboard">
                <IconButton
                  onClick={() => setSettingsModalOpen(true)}
                  aria-label="Configurações do dashboard"
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="Atualizar">
            <IconButton
              onClick={refreshData}
              aria-label="Atualizar dados"
              sx={{ mr: { xs: 0, sm: 1 } }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Mensagem de erro */}
      {error && !isDemoMode && (
        <Alert
          severity="error"
          sx={{ mx: 2, mt: 2 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Notificação de Modo Demo */}
      <Snackbar
        open={showDemoNotification}
        autoHideDuration={5000}
        onClose={() => setShowDemoNotification(false)}
        anchorOrigin={{
          vertical: isMobile ? 'top' : 'bottom',
          horizontal: 'center'
        }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={() => setShowDemoNotification(false)}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
          elevation={6}
        >
          {isDemoMode ? 'Modo de demonstração ativado - Exibindo dados fictícios' : 'Modo de demonstração desativado'}
        </Alert>
      </Snackbar>

      {/* Abas desktop */}
      {!isMobile && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isTablet ? "scrollable" : "fullWidth"}
            scrollButtons={isTablet ? "auto" : false}
            allowScrollButtonsMobile
            TabIndicatorProps={{
              sx: {
                height: 3,
                borderRadius: 3
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.badge ? (
                  <Badge
                    badgeContent={tab.badge}
                    color="error"
                    max={99}
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                  >
                    {tab.icon}
                  </Badge>
                ) : tab.icon}
                iconPosition="start"
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: activeTab === index ? 'bold' : 'normal',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: alpha(tab.color, 0.05),
                    color: tab.color
                  },
                  ...(activeTab === index && {
                    color: tab.color
                  })
                }}
                aria-label={tab.label}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Conteúdo principal */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
          width: '100%',
          pb: isMobile ? 7 : 0 // Espaço para a navegação inferior
        }}
      >
        {loading && !isDemoMode ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3
            }}
          >
            <CircularProgress color="primary" size={isMobile ? 40 : 48} thickness={4} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Carregando métricas...
            </Typography>
          </Box>
        ) : !getCurrentData.overviewData ? (
          renderEmptyState()
        ) : (
          <ErrorBoundary>
            <SwipeableViews
              index={activeTab}
              onChangeIndex={handleTabChange}
              disabled={!isMobile}
              resistance
              animateHeight
              containerStyle={{ height: '100%' }}
            >
              {tabs.map((tab, index) => (
                <Fade key={index} in={activeTab === index} timeout={300}>
                  <Box sx={{
                    height: '100%',
                    display: activeTab === index ? 'block' : 'none',
                    overflow: 'auto'
                  }}>
                    {tab.component}
                  </Box>
                </Fade>
              ))}
            </SwipeableViews>
          </ErrorBoundary>
        )}
      </Box>

      {/* Barra de navegação mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            borderTop: 1,
            borderColor: 'divider',
            boxShadow: 3
          }}
          elevation={3}
        >
          <BottomNavigation
            value={activeTab}
            onChange={(event, newValue) => {
              setActiveTab(newValue);
            }}
            showLabels
            sx={{
              height: 64,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 0,
                maxWidth: 84,
                padding: '6px 8px 8px',
                transition: 'all 0.2s ease-in-out',
              },
              '& .Mui-selected': {
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease-in-out'
                }
              }
            }}
          >
            {tabs.map((tab, index) => (
              <BottomNavigationAction
                key={index}
                label={tab.label}
                icon={tab.badge ? (
                  <Badge
                    badgeContent={tab.badge}
                    color="error"
                    max={99}
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                  >
                    {tab.icon}
                  </Badge>
                ) : tab.icon}
                sx={{
                  color: activeTab === index ? tab.color : 'text.secondary',
                  '&.Mui-selected': {
                    color: tab.color
                  }
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      {/* Ações rápidas para dispositivos móveis */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Ações rápidas"
          sx={{ position: 'fixed', bottom: 76, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={handleSpeedDialClose}
          onOpen={handleSpeedDialOpen}
          open={speedDialOpen}
          direction="up"
          FabProps={{
            sx: {
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              width: 56,
              height: 56
            }
          }}
        >
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Atualizar"
            tooltipOpen={isTablet}
            onClick={() => {
              refreshData();
              handleSpeedDialClose();
            }}
            FabProps={{
              sx: {
                width: 48,
                height: 48,
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }
            }}
          />
          <SpeedDialAction
            icon={<DateRangeIcon />}
            tooltipTitle="Filtrar por Data"
            tooltipOpen={isTablet}
            onClick={() => {
              toggleFilterDrawer();
              handleSpeedDialClose();
            }}
            FabProps={{
              sx: {
                width: 48,
                height: 48,
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }
            }}
          />
          <SpeedDialAction
            icon={<DemoIcon />}
            tooltipTitle={isDemoMode ? "Desativar Demo" : "Ativar Demo"}
            tooltipOpen={isTablet}
            onClick={() => {
              toggleDemoMode();
              handleSpeedDialClose();
            }}
            FabProps={{
              sx: {
                width: 48,
                height: 48,
                ...(isDemoMode && {
                  bgcolor: theme.palette.primary.lighter || alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }),
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }
            }}
          />
        </SpeedDial>
      )}

      {/* Backdrop para SpeedDial */}
      <Backdrop open={speedDialOpen} onClick={handleSpeedDialClose} />

      {/* Tutorial de gestos (mostrado apenas na primeira visita) */}
      {isMobile && touchEnabled && (
        <Snackbar
          open={activeTab === 0 && touchEnabled}
          autoHideDuration={5000}
          onClose={() => disableSwipe()}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ mb: 8 }}
        >
          <Alert
            severity="info"
            icon={<TouchAppIcon />}
            sx={{ width: '100%' }}
          >
            Deslize para navegar entre as abas
          </Alert>
        </Snackbar>
      )}

      <DashboardSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;