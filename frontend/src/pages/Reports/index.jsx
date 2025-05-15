import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  AssessmentOutlined,
  PictureAsPdfOutlined,
  BarChartOutlined,
  GetAppOutlined
} from '@mui/icons-material';

// Componentes personalizados
import FilterPanel from './components/FilterPanel';
import DataTableTab from './components/DataTableTab';
import ExportTab from './components/ExportTab';
import ChartsTab from './components/ChartsTab';
import ExportCsvTab from './components/ExportCsvTab';

// API e hooks
import api from "../../services/api";
import useDebouncedCallback from '../../hooks/useDebouncedCallback';
import { i18n } from "../../translate/i18n";

// Interface TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, width: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Função para props do tab
function a11yProps(index) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

const ReportPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    userId: '',
    queueIds: [],
    tagIds: [],
    status: '',
    searchParam: '',
    employerId: '',
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [chartData, setChartData] = useState({
    ticketsByQueue: [],
    ticketsByStatus: [],
    ticketsByDate: []
  });
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState([]);

  // Animações com react-spring
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });

  // Carregar dados de usuários (atendentes) no início
  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users/list');
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(i18n.t('reports.errors.usersLoadFailed'));
      setShowSnackbar(true);
    }
  }, []);

  // Carregar dados de filas no início
  const loadQueues = useCallback(async () => {
    try {
      const { data } = await api.get('/queue');
      setQueues(data || []);
    } catch (err) {
      console.error('Erro ao carregar filas:', err);
      setError(i18n.t('reports.errors.queuesLoadFailed'));
      setShowSnackbar(true);
    }
  }, []);

  // Construir parâmetros da consulta
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    // Parâmetros obrigatórios
    params.append('startDate', filters.startDate);
    params.append('endDate', filters.endDate);
    
    // Parâmetros opcionais
    if (filters.userId) {
      params.append('userId', filters.userId);
    }
    
    if (filters.queueIds && filters.queueIds.length > 0) {
      params.append('queueIds', JSON.stringify(filters.queueIds));
    }
    
    if (filters.tagIds && filters.tagIds.length > 0) {
      params.append('tagIds', JSON.stringify(filters.tagIds));
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.employerId) {
      params.append('employerId', filters.employerId);
    }
    
    if (filters.searchParam) {
      params.append('searchParam', filters.searchParam);
    }
    
    // Parâmetros de paginação e ordenação
    params.append('pageNumber', filters.pageNumber);
    params.append('pageSize', filters.pageSize);
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);
    
    return params;
  }, [filters]);

  // Função para carregar dados da tabela
  const loadTableData = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildQueryParams();
      
      console.log("Carregando tabela com parâmetros:", Object.fromEntries(params));
      
      const { data } = await api.get(`/reports?${params.toString()}`);
      setTickets(data.tickets || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(i18n.t('reports.errors.loadFailed'));
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Função para carregar dados dos gráficos
  const loadChartData = useCallback(async () => {
    if (tabValue !== 2) return; // Só carrega se estiver na aba de gráficos
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Parâmetros obrigatórios
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
      
      // Parâmetros opcionais
      if (filters.userId) {
        params.append('userId', filters.userId);
      }
      
      if (filters.queueIds && filters.queueIds.length > 0) {
        params.append('queueIds', JSON.stringify(filters.queueIds));
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.employerId) {
        params.append('employerId', filters.employerId);
      }
      
      params.append('aggregation', 'day'); // dia, semana, mês

      console.log("Carregando gráficos com parâmetros:", Object.fromEntries(params));

      const { data } = await api.get(`/reports/charts?${params.toString()}`);
      setChartData(data);
    } catch (err) {
      console.error('Erro ao carregar dados de gráficos:', err);
      setError(i18n.t('reports.errors.chartLoadFailed'));
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.userId, filters.queueIds, filters.status, filters.employerId, tabValue]);

  // Função para carregar resumo
  const loadSummaryData = useCallback(async () => {
    if (tabValue !== 1 && tabValue !== 2 && tabValue !== 3) return; // Só carrega para as abas relevantes
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Parâmetros obrigatórios
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
      
      // Parâmetros opcionais
      if (filters.userId) {
        params.append('userId', filters.userId);
      }
      
      if (filters.queueIds && filters.queueIds.length > 0) {
        params.append('queueIds', JSON.stringify(filters.queueIds));
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.employerId) {
        params.append('employerId', filters.employerId);
      }
      
      console.log("Carregando resumo com parâmetros:", Object.fromEntries(params));

      const { data } = await api.get(`/reports/summary?${params.toString()}`);
      setSummaryData(data);
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
      setError(i18n.t('reports.errors.summaryLoadFailed'));
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.userId, filters.queueIds, filters.status, filters.employerId, tabValue]);

  // Debounce da pesquisa
  const debouncedSearch = useDebouncedCallback((value) => {
    setFilters(prev => ({ ...prev, searchParam: value, pageNumber: 1 }));
  }, 500);

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (name, value) => {
    console.log(`Alterando filtro: ${name} = `, value);
    
    if (name === 'searchParam') {
      debouncedSearch(value);
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
      
      // Resetar paginação quando mudar filtros
      if (name !== 'pageNumber' && name !== 'pageSize') {
        setFilters(prev => ({ ...prev, pageNumber: 1 }));
      }
    }
  };

  // Função para mudança de abas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Carregar usuários e filas ao montar o componente
  useEffect(() => {
    loadUsers();
    loadQueues();
  }, [loadUsers, loadQueues]);

  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  // Carregar dados dos gráficos quando mudar de aba ou filtros
  useEffect(() => {
    if (tabValue === 2) {
      loadChartData();
    }
  }, [tabValue, loadChartData]);

  // Carregar dados de resumo quando mudar de aba ou filtros
  useEffect(() => {
    if (tabValue === 1 || tabValue === 2 || tabValue === 3) {
      loadSummaryData();
    }
  }, [tabValue, loadSummaryData]);

  return (
    <animated.div style={fadeIn}>
      {/* Container com margens adequadas */}
      <Box sx={{ width: '100%', p: 3, maxWidth: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {i18n.t('reports.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {i18n.t('reports.description')}
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <FilterPanel 
            filters={filters} 
            onFilterChange={handleFilterChange}
            users={users}
            queues={queues}
          />
        </Paper>

        <Paper elevation={3}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "fullWidth" : "standard"}
            aria-label="report tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab 
              icon={<AssessmentOutlined />} 
              label={isMobile ? null : i18n.t('reports.tabs.data')} 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<PictureAsPdfOutlined />} 
              label={isMobile ? null : i18n.t('reports.tabs.export')} 
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<BarChartOutlined />} 
              label={isMobile ? null : i18n.t('reports.tabs.charts')} 
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<GetAppOutlined />} 
              label={isMobile ? null : i18n.t('reports.tabs.exportCsv')} 
              {...a11yProps(3)} 
            />
          </Tabs>

          {loading && tabValue !== 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          <TabPanel value={tabValue} index={0}>
            <DataTableTab 
              tickets={tickets} 
              totalCount={totalCount}
              filters={filters}
              onFilterChange={handleFilterChange}
              loading={loading}
              users={users}
              queues={queues}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ExportTab 
              filters={filters} 
              tickets={tickets} 
              summaryData={summaryData}
              onFilterChange={handleFilterChange}
              loading={loading}
              users={users}
              queues={queues}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ChartsTab 
              chartData={chartData}
              summaryData={summaryData}
              filters={filters}
              onFilterChange={handleFilterChange}
              loading={loading}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <ExportCsvTab 
              filters={filters}
              onFilterChange={handleFilterChange}
              loading={loading}
              users={users}
              queues={queues}
            />
          </TabPanel>
        </Paper>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowSnackbar(false)}
        >
          <Alert 
            onClose={() => setShowSnackbar(false)} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </animated.div>
  );
};

export default ReportPage;