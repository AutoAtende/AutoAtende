import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react';
import { Box, Container, Typography, Grid, Paper, Select, MenuItem, FormControl, Button, IconButton, Tooltip, Skeleton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarToday, FileDownload, Settings as SettingsIcon, Refresh } from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import { useLoading } from "../../hooks/useLoading";
import Title from '../../components/Title';
import DashboardCard from './components/DashboardCard';
import ComponentVisibilityControl from './components/ComponentVisibilityControl';
import { useDashboardContext } from './context/DashboardContext';

// Lazy loading para componentes pesados
const BarChartComponent = lazy(() => import('./components/BarChartComponent'));
const DonutChartComponent = lazy(() => import('./components/DonutChartComponent'));
const ComparativeTable = lazy(() => import('./components/ComparativeTable'));
const ProspectionTable = lazy(() => import('./components/ProspectionTable'));
const BrazilMap = lazy(() => import('./components/BrazilMap'));
const DashboardConfigModal = lazy(() => import('./components/DashboardConfigModal'));
const ExcelExportService = lazy(() => import('./services/ExcelExportService'));

// Componente de loading personalizado
const ChartSkeleton = memo(() => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" height={40} width="40%" sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={200} />
  </Box>
));

const TableSkeleton = memo(() => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" height={40} width="40%" sx={{ mb: 2 }} />
    {[...Array(5)].map((_, index) => (
      <Skeleton key={index} variant="text" height={30} sx={{ mb: 1 }} />
    ))}
  </Box>
));

// Styled Components otimizados
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  minHeight: '100vh',
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'space-between',
  },
}));

const DateFilter = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 15px',
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'white',
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  boxShadow: 'none',
  cursor: 'pointer',
}));

const QueueButton = styled(Button)(({ theme, active }) => ({
  borderRadius: '20px',
  minWidth: 'auto',
  padding: '6px 12px',
  fontSize: '0.85rem',
  textTransform: 'none',
  fontWeight: 'normal',
  color: active ? theme.palette.common.white : theme.palette.text.secondary,
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[200],
  marginRight: theme.spacing(1.25),
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.grey[300],
  },
}));

const ChartsPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.5),
  boxShadow: theme.shadows[1],
  height: '100%',
}));

const ChartHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: theme.spacing(2.5),
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const ExportButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: 'white',
  borderRadius: theme.shape.borderRadius,
  padding: '10px 16px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
}));

const RefreshButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}));

// Data range options
const DATE_RANGES = [
  { value: 7, label: 'Últimos 7 dias' },
  { value: 15, label: 'Últimos 15 dias' },
  { value: 30, label: 'Últimos 30 dias' },
];

// Componente memoizado para os cards de métricas
const MetricsCards = memo(({ dashboardData, dateRange, isComponentVisible, getComparisonPeriodText }) => (
  <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
    {isComponentVisible('messagesCard') && (
      <Grid item xs={12} md={4}>
        <DashboardCard
          icon="paper-plane"
          title="Mensagens Enviadas"
          value={dashboardData.messagesCount.toLocaleString()}
          subtitle="Total no período"
          trend={dashboardData.messagesTrend}
          trendText={`${Math.abs(dashboardData.messagesTrend)}% em relação à ${getComparisonPeriodText(dateRange)}`}
          visibilityControl={<ComponentVisibilityControl componentKey="messagesCard" />}
        />
      </Grid>
    )}
    
    {isComponentVisible('responseTimeCard') && (
      <Grid item xs={12} md={4}>
        <DashboardCard
          icon="clock"
          title="Tempo Médio de Resposta"
          value={dashboardData.avgResponseTime}
          subtitle="Após primeira mensagem do cliente"
          trend={dashboardData.responseTimeTrend}
          trendText={`${Math.abs(dashboardData.responseTimeTrend)}% em relação à ${getComparisonPeriodText(dateRange)}`}
          invertTrend={true}
          visibilityControl={<ComponentVisibilityControl componentKey="responseTimeCard" />}
        />
      </Grid>
    )}
    
    {isComponentVisible('clientsCard') && (
      <Grid item xs={12} md={4}>
        <DashboardCard
          icon="users"
          title="Clientes Interagidos"
          value={dashboardData.clientsCount.toLocaleString()}
          subtitle="No período selecionado"
          trend={dashboardData.clientsTrend}
          trendText={`${Math.abs(dashboardData.clientsTrend)}% em relação à ${getComparisonPeriodText(dateRange)}`}
          visibilityControl={<ComponentVisibilityControl componentKey="clientsCard" />}
        />
      </Grid>
    )}
  </Grid>
));

// Componente memoizado para os gráficos
const ChartsSection = memo(({ dashboardData, isComponentVisible, loadingStates }) => (
  <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
    {isComponentVisible('messagesByDayChart') && (
      <Grid item xs={12} md={6}>
        <ChartsPaper>
          <ChartHeader>
            <Typography variant="h6">Mensagens por Dia</Typography>
            <ComponentVisibilityControl componentKey="messagesByDayChart" />
          </ChartHeader>
          <Suspense fallback={<ChartSkeleton />}>
            {loadingStates.overview ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <BarChartComponent data={dashboardData.messagesByDay} />
            )}
          </Suspense>
        </ChartsPaper>
      </Grid>
    )}
    
    {isComponentVisible('messagesByUserChart') && (
      <Grid item xs={12} md={6}>
        <ChartsPaper>
          <ChartHeader>
            <Typography variant="h6">Mensagens por Usuário</Typography>
            <ComponentVisibilityControl componentKey="messagesByUserChart" />
          </ChartHeader>
          <Suspense fallback={<ChartSkeleton />}>
            {loadingStates.queues ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <DonutChartComponent data={dashboardData.messagesByUser} />
            )}
          </Suspense>
        </ChartsPaper>
      </Grid>
    )}
  </Grid>
));

// Componente memoizado para as tabelas
const TablesSection = memo(({ dashboardData, isComponentVisible, loadingStates }) => (
  <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
    {isComponentVisible('comparativeTable') && (
      <Grid item xs={12} md={6}>
        <ChartsPaper>
          <ChartHeader>
            <Typography variant="h6">Comparativo de Setores</Typography>
            <ComponentVisibilityControl componentKey="comparativeTable" />
          </ChartHeader>
          <Suspense fallback={<TableSkeleton />}>
            {loadingStates.queues ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <ComparativeTable data={dashboardData.comparativeData} />
            )}
          </Suspense>
        </ChartsPaper>
      </Grid>
    )}
    
    {isComponentVisible('prospectionTable') && (
      <Grid item xs={12} md={6}>
        <ChartsPaper>
          <ChartHeader>
            <Typography variant="h6">Prospecção por Usuário</Typography>
            <ComponentVisibilityControl componentKey="prospectionTable" />
          </ChartHeader>
          <Suspense fallback={<TableSkeleton />}>
            {loadingStates.prospection ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <ProspectionTable 
                data={dashboardData.prospectionData} 
                compareMode={true}
              />
            )}
          </Suspense>
        </ChartsPaper>
      </Grid>
    )}
  </Grid>
));

// Componente memoizado para o mapa do Brasil
const BrazilMapSection = memo(({ dashboardData, selectedQueue, isComponentVisible, loadingStates }) => {
  if (selectedQueue !== 'all' || !isComponentVisible('brazilMap')) {
    return null;
  }

  return (
    <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
      <Grid item xs={12}>
        <ChartsPaper>
          <ChartHeader>
            <Typography variant="h6">Distribuição de Contatos por Estado</Typography>
            <ComponentVisibilityControl componentKey="brazilMap" />
          </ChartHeader>
          <Suspense fallback={<ChartSkeleton />}>
            {loadingStates.overview ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <BrazilMap 
                contactMetrics={dashboardData.contactMetrics}
                title=""
              />
            )}
          </Suspense>
        </ChartsPaper>
      </Grid>
    </Grid>
  );
});

const Dashboard = () => {
  const { Loading } = useLoading();
  const {
    isLoading,
    error,
    dateRange,
    setDateRange,
    selectedQueue,
    setSelectedQueue,
    queues,
    dashboardData,
    getDateRangeDisplay,
    dashboardSettings,
    loadDashboardData,
    loadingStates,
    clearCache
  } = useDashboardContext();
  
  // Estado para controlar a abertura do modal de configurações
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Verificar se um componente deve ser exibido (memoizado)
  const isComponentVisible = useCallback((componentKey) => {
    return dashboardSettings?.componentVisibility?.[componentKey] !== false;
  }, [dashboardSettings?.componentVisibility]);
  
  // Handler para mudança de faixa de data (memoizado)
  const handleDateRangeChange = useCallback((event) => {
    setDateRange(event.target.value);
  }, [setDateRange]);

  // Handler para mudança de fila (memoizado)
  const handleQueueChange = useCallback((queueId) => {
    setSelectedQueue(queueId);
  }, [setSelectedQueue]);

  // Handler para refresh manual
  const handleRefresh = useCallback(async () => {
    clearCache();
    await loadDashboardData();
    toast.success('Dados atualizados com sucesso!');
  }, [clearCache, loadDashboardData]);
  
  // Handler para exportação para Excel (memoizado)
  const handleExportToExcel = useCallback(async () => {
    setIsExporting(true);
    toast.info('Exportando dados para Excel...');
    
    try {
      // Importar dinamicamente o serviço de exportação
      const ExcelExportServiceModule = await import('./services/ExcelExportService');
      const ExcelExportService = ExcelExportServiceModule.default;
      
      // Formatar dados para exportação
      const dataToExport = ExcelExportService.formatDashboardDataForExport(dashboardData);
      
      // Exportar para Excel
      const result = ExcelExportService.exportMultipleSheetsToExcel(
        dataToExport, 
        `dashboard-autoatende-${new Date().toISOString().split('T')[0]}`
      );
      
      if (result) {
        toast.success('Dados exportados com sucesso!');
      } else {
        toast.error('Falha ao exportar dados.');
      }
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      toast.error('Erro ao exportar para Excel. Por favor, tente novamente.');
    } finally {
      setIsExporting(false);
    }
  }, [dashboardData]);

  // Função para obter texto do período de comparação (memoizada)
  const getComparisonPeriodText = useMemo(() => {
    const periodMap = {
      7: 'semana anterior',
      15: 'quinzena anterior',
      30: 'mês anterior',
    };
    return (period) => periodMap[period] || 'período anterior';
  }, []);

  // Renderizar botões de fila (memoizado)
  const queueButtons = useMemo(() => (
    <Box sx={{ mb: 2.5, display: 'flex', flexWrap: 'wrap' }}>
      {queues.map((queue) => (
        <QueueButton
          key={queue.id}
          active={selectedQueue === queue.id}
          onClick={() => handleQueueChange(queue.id)}
        >
          {queue.name}
        </QueueButton>
      ))}
    </Box>
  ), [queues, selectedQueue, handleQueueChange]);

  // Verificar se há algum carregamento em andamento
  const hasAnyLoading = useMemo(() => {
    return isLoading || Object.values(loadingStates).some(state => state);
  }, [isLoading, loadingStates]);

  return (
    <StyledContainer maxWidth={false}>
      <PageHeader>
        <Title variant="h1">Análise de Performance Operacional</Title>
        <FiltersContainer>
          <DateFilter>
            <CalendarToday sx={{ mr: 0.5, color: 'primary.main', fontSize: '1rem' }} />
            {getDateRangeDisplay}
          </DateFilter>
          <FormControl size="small">
            <Select
              value={dateRange}
              onChange={handleDateRangeChange}
              variant="outlined"
              sx={{ 
                minWidth: 150, 
                bgcolor: 'white',
                fontSize: '0.9rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.grey[300]
                }
              }}
            >
              {DATE_RANGES.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Tooltip title="Atualizar Dados">
            <RefreshButton 
              onClick={handleRefresh} 
              disabled={hasAnyLoading}
              size="small"
            >
              <Refresh />
            </RefreshButton>
          </Tooltip>
          
          <Tooltip title="Configurações do Dashboard">
            <IconButton 
              onClick={() => setConfigModalOpen(true)}
              sx={{ color: 'grey.700' }}
              size="small"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </FiltersContainer>
      </PageHeader>

      {queueButtons}

      {error ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Cards de Métricas */}
          <MetricsCards 
            dashboardData={dashboardData}
            dateRange={dateRange}
            isComponentVisible={isComponentVisible}
            getComparisonPeriodText={getComparisonPeriodText}
          />

          {/* Gráficos */}
          <ChartsSection 
            dashboardData={dashboardData}
            isComponentVisible={isComponentVisible}
            loadingStates={loadingStates}
          />

          {/* Tabelas */}
          <TablesSection 
            dashboardData={dashboardData}
            isComponentVisible={isComponentVisible}
            loadingStates={loadingStates}
          />

          {/* Mapa do Brasil */}
          <BrazilMapSection 
            dashboardData={dashboardData}
            selectedQueue={selectedQueue}
            isComponentVisible={isComponentVisible}
            loadingStates={loadingStates}
          />

          {/* Footer com Botão de Exportação */}
          <FooterContainer>
            <ExportButton 
              startIcon={<FileDownload />} 
              onClick={handleExportToExcel}
              disabled={isExporting || hasAnyLoading}
            >
              {isExporting ? 'Exportando...' : 'Exportar para Excel'}
            </ExportButton>
          </FooterContainer>
        </>
      )}
      
      {/* Modal de Configurações do Dashboard */}
      <Suspense fallback={<div />}>
        <DashboardConfigModal 
          open={configModalOpen} 
          onClose={() => setConfigModalOpen(false)} 
        />
      </Suspense>
    </StyledContainer>
  );
};

export default memo(Dashboard);