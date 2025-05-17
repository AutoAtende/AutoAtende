import React from 'react';
import { Box, Container, Typography, Grid, Paper, Select, MenuItem, FormControl, Button, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarToday, ChevronLeft, ChevronRight, FileDownload } from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import { useLoading } from "../../hooks/useLoading";
import DashboardCard from './components/DashboardCard';
import BarChartComponent from './components/BarChartComponent';
import DonutChartComponent from './components/DonutChartComponent';
import ComparativeTable from './components/ComparativeTable';
import ProspectionTable from './components/ProspectionTable';
import useDashboardData from './hooks/useDashboardData';
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  borderRadius: '20px',
  minWidth: 'auto',
  padding: '6px 12px',
  fontSize: '0.85rem',
  textTransform: 'none',
  fontWeight: 'normal',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.grey[200],
  marginRight: theme.spacing(1.25),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'normal',
  },
}));

const ChartsPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.5),
  boxShadow: theme.shadows[1],
  height: '100%',
}));

const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const Pagination = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const PageButton = styled(Button)(({ theme, active }) => ({
  minWidth: '30px',
  width: '30px',
  height: '30px',
  padding: 0,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.primary.main : 'white',
  color: active ? 'white' : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.grey[100],
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
    selectedAgent,
    setSelectedAgent,
    queues,
    users,
    dashboardData,
    getDateRangeDisplay
  } = useDashboardData();

  // Converter selectedQueue para índice da aba
  const selectedTab = queues.findIndex(q => q.id === selectedQueue);
  
  // Handler para mudança de aba
  const handleTabChange = (event, newValue) => {
    setSelectedQueue(queues[newValue]?.id || 'all');
  };
  
  // Handler para mudança de faixa de data
  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };
  
  // Handler para mudança de agente
  const handleAgentChange = (event) => {
    setSelectedAgent(event.target.value);
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

  return (
    <StyledContainer maxWidth={false}>
      <PageHeader>
        <PageTitle variant="h1">Dashboard de Desempenho</PageTitle>
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
          <FormControl size="small">
            <Select
              value={selectedAgent}
              onChange={handleAgentChange}
              variant="outlined"
              sx={{ 
                minWidth: 180, 
                bgcolor: 'white',
                fontSize: '0.9rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.grey[300]
                }
              }}
            >
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FiltersContainer>
      </PageHeader>

      <StyledTabs 
        value={selectedTab > -1 ? selectedTab : 0} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {queues.map((queue, index) => (
          <StyledTab key={queue.id} label={queue.name} />
        ))}
      </StyledTabs>

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
            <Grid item xs={12} md={4}>
              <DashboardCard
                icon="paper-plane"
                title="Mensagens Enviadas"
                value={dashboardData.messagesCount.toLocaleString()}
                subtitle="Total no período"
                trend={dashboardData.messagesTrend}
                trendText={`${Math.abs(dashboardData.messagesTrend)}% em relação à semana anterior`}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DashboardCard
                icon="clock"
                title="Tempo Médio de Resposta"
                value={dashboardData.avgResponseTime}
                subtitle="Após primeira mensagem do cliente"
                trend={dashboardData.responseTimeTrend}
                trendText={`${Math.abs(dashboardData.responseTimeTrend)}% em relação à semana anterior`}
                invertTrend={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DashboardCard
                icon="users"
                title="Clientes Interagidos"
                value={dashboardData.clientsCount.toLocaleString()}
                subtitle="No período selecionado"
                trend={dashboardData.clientsTrend}
                trendText={`${Math.abs(dashboardData.clientsTrend)}% em relação à semana anterior`}
              />
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <ChartsPaper>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Mensagens por Dia
                  <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', cursor: 'pointer' }}>
                    &#8942;
                  </Box>
                </Typography>
                <BarChartComponent data={dashboardData.messagesByDay} />
              </ChartsPaper>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartsPaper>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Mensagens por Agente
                  <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', cursor: 'pointer' }}>
                    &#8942;
                  </Box>
                </Typography>
                <DonutChartComponent data={dashboardData.messagesByUser} />
              </ChartsPaper>
            </Grid>
          </Grid>

          {/* Tabelas */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <ChartsPaper>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Atendimento vs Comercial
                  <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', cursor: 'pointer' }}>
                    &#8942;
                  </Box>
                </Typography>
                <ComparativeTable data={dashboardData.comparativeData} />
              </ChartsPaper>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartsPaper>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Prospecção por Agente
                  <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', cursor: 'pointer' }}>
                    &#8942;
                  </Box>
                </Typography>
                <ProspectionTable data={dashboardData.prospectionData} />
              </ChartsPaper>
            </Grid>
          </Grid>

          {/* Footer com Paginação e Botão de Exportação */}
          <FooterContainer>
            <ExportButton startIcon={<FileDownload />} onClick={handleExportToExcel}>
              Exportar para Excel
            </ExportButton>
          </FooterContainer>
        </>
      )}
    </StyledContainer>
  );
};

export default Dashboard;