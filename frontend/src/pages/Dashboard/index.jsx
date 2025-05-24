import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Container, Typography, Grid, Paper, Select, MenuItem, FormControl, Button, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarToday, FileDownload, Settings as SettingsIcon } from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import { useLoading } from "../../hooks/useLoading";
import Title from '../../components/Title';
import DashboardCard from './components/DashboardCard';
import BarChartComponent from './components/BarChartComponent';
import DonutChartComponent from './components/DonutChartComponent';
import ComparativeTable from './components/ComparativeTable';
import ProspectionTable from './components/ProspectionTable';
import BrazilMap from './components/BrazilMap';
import ComponentVisibilityControl from './components/ComponentVisibilityControl';
import DashboardConfigModal from './components/DashboardConfigModal';
import { useDashboardContext } from './context/DashboardContext';
import ExcelExportService from './services/ExcelExportService';

// Styled Components
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

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
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

const DateFilterIcon = styled(CalendarToday)(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  color: theme.palette.primary.main,
  fontSize: '1rem',
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

const ConfigButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[700],
  marginLeft: theme.spacing(1.25),
}));

// Data range options
const DATE_RANGES = [
  { value: 7, label: 'Últimos 7 dias' },
  { value: 15, label: 'Últimos 15 dias' },
  { value: 30, label: 'Últimos 30 dias' },
];

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
    loadDashboardData
  } = useDashboardContext();
  
  // Estado para controlar a abertura do modal de configurações
  const [configModalOpen, setConfigModalOpen] = useState(false);
  
  // Verificar se um componente deve ser exibido
  const isComponentVisible = (componentKey) => {
    return dashboardSettings?.componentVisibility?.[componentKey] !== false;
  };
  
  // Handler para mudança de faixa de data
  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };
  
  // Handler para exportação para Excel
  const handleExportToExcel = () => {
    Loading.turnOn();
    toast.info('Exportando dados para Excel...');
    
    try {
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
      Loading.turnOff();
    }
  };

  const getComparisonPeriodText = (period) => {
    const periodMap = {
      7: 'semana anterior',
      15: 'quinzena anterior',
      30: 'mês anterior',
    };
    return periodMap[period] || 'período anterior';
  };

  return (
    <StyledContainer maxWidth={false}>
      <PageHeader>
        <Title variant="h1">Análise de Performance Operacional</Title>
        <FiltersContainer>
          <DateFilter>
            <DateFilterIcon />
            {getDateRangeDisplay()}
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
          
          <Tooltip title="Configurações do Dashboard">
            <ConfigButton onClick={() => setConfigModalOpen(true)}>
              <SettingsIcon />
            </ConfigButton>
          </Tooltip>
        </FiltersContainer>
      </PageHeader>

      <Box sx={{ mb: 2.5, display: 'flex', flexWrap: 'wrap' }}>
        {queues.map((queue) => (
          <QueueButton
            key={queue.id}
            active={selectedQueue === queue.id}
            onClick={() => setSelectedQueue(queue.id)}
          >
            {queue.name}
          </QueueButton>
        ))}
      </Box>

      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <Typography variant="h6" color="text.secondary">
            Carregando dados...
          </Typography>
        </Box>
      ) : error ? (
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

          {/* Gráficos */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            {isComponentVisible('messagesByDayChart') && (
              <Grid item xs={12} md={6}>
                <ChartsPaper>
                  <ChartHeader>
                    <Typography variant="h6">
                      Mensagens por Dia
                    </Typography>
                    <ComponentVisibilityControl componentKey="messagesByDayChart" />
                  </ChartHeader>
                  <BarChartComponent data={dashboardData.messagesByDay} />
                </ChartsPaper>
              </Grid>
            )}
            
            {isComponentVisible('messagesByUserChart') && (
              <Grid item xs={12} md={6}>
                <ChartsPaper>
                  <ChartHeader>
                    <Typography variant="h6">
                      Mensagens por Usuário
                    </Typography>
                    <ComponentVisibilityControl componentKey="messagesByUserChart" />
                  </ChartHeader>
                  <DonutChartComponent data={dashboardData.messagesByUser} />
                </ChartsPaper>
              </Grid>
            )}
          </Grid>

          {/* Mapa do Brasil - Apenas para aba "TODOS" */}
          {selectedQueue === 'all' && isComponentVisible('brazilMap') && (
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid item xs={12}>
                <ChartsPaper>
                  <ChartHeader>
                    <Typography variant="h6">
                      Distribuição de Contatos por Estado
                    </Typography>
                    <ComponentVisibilityControl componentKey="brazilMap" />
                  </ChartHeader>
                  <BrazilMap 
                    contactMetrics={dashboardData.contactMetrics}
                    title=""
                  />
                </ChartsPaper>
              </Grid>
            </Grid>
          )}

          {/* Tabelas */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            {isComponentVisible('comparativeTable') && (
              <Grid item xs={12} md={6}>
                <ChartsPaper>
                  <ChartHeader>
                    <Typography variant="h6">
                      Comparativo de Setores
                    </Typography>
                    <ComponentVisibilityControl componentKey="comparativeTable" />
                  </ChartHeader>
                  <ComparativeTable data={dashboardData.comparativeData} />
                </ChartsPaper>
              </Grid>
            )}
            
            {isComponentVisible('prospectionTable') && (
              <Grid item xs={12} md={6}>
                <ChartsPaper>
                  <ChartHeader>
                    <Typography variant="h6">
                      Prospecção por Usuário
                    </Typography>
                    <ComponentVisibilityControl componentKey="prospectionTable" />
                  </ChartHeader>
                  <ProspectionTable 
                    data={dashboardData.prospectionData} 
                    compareMode={true}  // Ativar modo de comparação
                  />
                </ChartsPaper>
              </Grid>
            )}
          </Grid>

          {/* Footer com Botão de Exportação */}
          <FooterContainer>
            <ExportButton startIcon={<FileDownload />} onClick={handleExportToExcel}>
              Exportar para Excel
            </ExportButton>
          </FooterContainer>
        </>
      )}
      
      {/* Modal de Configurações do Dashboard */}
      <DashboardConfigModal 
        open={configModalOpen} 
        onClose={() => setConfigModalOpen(false)} 
      />
    </StyledContainer>
  );
};

export default Dashboard;