// CampaignReports.jsx - Versão com debug e correções
import React, { useState, useEffect, useContext, useRef } from "react";
import { styled } from "@mui/material/styles";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { useDate } from "../../../hooks/useDate";
import { AuthContext } from "../../../context/Auth/AuthContext";

// Material UI
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip,
  ButtonGroup,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle,
} from "@mui/material";

// Charts
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Icons
import {
  Assessment as AssessmentIcon,
  CalendarToday as CalendarTodayIcon,
  DateRange as DateRangeIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

// Componentes
import EmptyState from "../../../components/EmptyState";

// API
import api from "../../../services/api";
import { SocketContext } from "../../../context/Socket/SocketContext";

// Componentes estilizados
const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
  ...theme.scrollbarStyles,
  display: "flex",
  flexDirection: "column",
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StatCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 350,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const PeriodButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const dateRanges = [
  { id: 'today', label: 'campaigns.reports.filters.today', days: 1 },
  { id: 'week', label: 'campaigns.reports.filters.week', days: 7 },
  { id: 'month', label: 'campaigns.reports.filters.month', days: 30 },
  { id: 'quarter', label: 'campaigns.reports.filters.quarter', days: 90 },
];

const CampaignReports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { datetimeToClient } = useDate();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const companyId = user.companyId;

  // Estados
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('week');
  
  // Palette de cores
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.secondary.main,
  ];

  // Buscar lista de campanhas
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        
        const { data } = await api.get('/campaigns', {
          params: { 
            pageNumber: 1,
            pageSize: 100,
            companyId
          }
        });
        
        // Verificar se temos dados válidos
        if (data && Array.isArray(data.records)) {
          setCampaigns(data.records);
          
          // Verificar se há campanha na URL ou localStorage
          const params = new URLSearchParams(window.location.search);
          const campaignIdFromUrl = params.get('campaign');
          const campaignIdFromStorage = localStorage.getItem('selectedReportCampaign');
          
          if (campaignIdFromUrl) {
            setSelectedCampaign(campaignIdFromUrl);
          } else if (campaignIdFromStorage) {
            setSelectedCampaign(campaignIdFromStorage);
            localStorage.removeItem('selectedReportCampaign');
          }
        } else {
          console.error("Formato de resposta inválido:", data);
          setLoadError("Erro ao carregar campanhas: formato de resposta inválido");
          setCampaigns([]);
        }
      } catch (err) {
        console.error("Erro ao buscar campanhas:", err);
        setLoadError(`Erro ao carregar campanhas: ${err.message || "Erro desconhecido"}`);
        toast.error(i18n.t('campaigns.reports.errors.fetchCampaigns'));
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, [companyId]);

  // Buscar dados do relatório quando a campanha ou período mudar
  useEffect(() => {
    const fetchReportData = async () => {
      if (!selectedCampaign) return;
      
      try {
        setLoading(true);
        setLoadError(null);
        
        // Calcular datas com base no período selecionado
        const selectedRange = dateRanges.find(r => r.id === dateRange);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (selectedRange?.days || 7));
        
        const { data } = await api.get(`/campaigns/${selectedCampaign}/report`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        });
        
        // Validar estrutura dos dados
        if (!data) {
          throw new Error("Dados não recebidos da API");
        }
        
        // Verificamos as propriedades essenciais e fornecemos valores padrão se não existirem
        const validatedData = {
          stats: {
            total: data.stats?.total || 0,
            delivered: data.stats?.delivered || 0,
            read: data.stats?.read || 0,
            replied: data.stats?.replied || 0
          },
          statusDistribution: data.statusDistribution || {},
          dailyProgress: data.dailyProgress || [],
          campaignInfo: data.campaignInfo || {}
        };
        
        setReportData(validatedData);
      } catch (err) {
        console.error("Erro ao buscar dados do relatório:", err);
        setLoadError(`Erro ao carregar relatório: ${err.message || "Erro desconhecido"}`);
        toast.error(i18n.t('campaigns.reports.errors.fetchReportData'));
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedCampaign) {
      fetchReportData();
    }
  }, [selectedCampaign, dateRange]);

  // Configuração de socket para atualizações em tempo real
  useEffect(() => {
    if (selectedCampaign) {
      try {
        // Configurar ouvinte de socket para atualizações em tempo real
        const companyId = user.companyId;
        const socket = socketManager.GetSocket(companyId);
        
        if (socket) {
          socket.on(`company-${companyId}-campaign-progress`, (data) => {
            if (data.campaignId === parseInt(selectedCampaign)) {
              // Atualizar dados de relatório com as informações mais recentes
              setReportData((prevData) => {
                if (!prevData) return null;
                
                return {
                  ...prevData,
                  stats: {
                    ...prevData.stats,
                    delivered: data.delivered || prevData.stats.delivered,
                    read: data.confirmed || prevData.stats.read,
                    replied: data.confirmed || prevData.stats.replied
                  }
                };
              });
            }
          });
          
          return () => {
            socket.off(`company-${companyId}-campaign-progress`);
          };
        }
      } catch (error) {
        console.error("Erro ao configurar socket:", error);
      }
    }
  }, [selectedCampaign, user.companyId, socketManager]);

  // Funções auxiliares para formatar dados para os gráficos
  const getStatusDistribution = () => {
    if (!reportData || !reportData.statusDistribution) return [];
    
    try {
      return Object.entries(reportData.statusDistribution).map(([status, count]) => ({
        name: i18n.t(`campaigns.reports.status.${status.toLowerCase()}`) || status,
        value: count || 0
      }));
    } catch (error) {
      console.error("Erro ao processar distribuição de status:", error);
      return [];
    }
  };
  
  const getDailyProgress = () => {
    if (!reportData || !reportData.dailyProgress) return [];
    
    try {
      return reportData.dailyProgress.map(item => {
        let formattedDate;
        try {
          formattedDate = new Date(item.date).toLocaleDateString();
        } catch (e) {
          console.error("Erro ao formatar data:", e);
          formattedDate = item.date || "Data desconhecida";
        }
        
        return {
          date: formattedDate,
          delivered: item.delivered || 0,
          read: item.read || 0,
          replied: item.replied || 0
        };
      });
    } catch (error) {
      console.error("Erro ao processar progresso diário:", error);
      return [];
    }
  };
  
  // Handlers
  const handleCampaignChange = (event) => {
    setSelectedCampaign(event.target.value);
    // Limpar dados do relatório ao trocar de campanha
    setReportData(null);
    setLoadError(null);
  };
  
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Renderização condicional
  if (campaigns.length === 0 && !loading && !loadError) {
    return (
      <EmptyState
        type="campaigns"
        title={i18n.t('campaigns.reports.empty.title')}
        message={i18n.t('campaigns.reports.empty.message')}
        showButton={false}
        customIcon={AssessmentIcon}
      />
    );
  }

  return (
    <MainPaper elevation={0} variant="outlined">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {i18n.t('campaigns.reports.title')}
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="campaign-select-label">
                {i18n.t('campaigns.reports.selectCampaign')}
              </InputLabel>
              <Select
                labelId="campaign-select-label"
                value={selectedCampaign}
                onChange={handleCampaignChange}
                label={i18n.t('campaigns.reports.selectCampaign')}
                disabled={loading || campaigns.length === 0}
              >
                {campaigns.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <PeriodButtonGroup 
              color="primary" 
              size={isMobile ? "small" : "medium"}
              variant="outlined"
              fullWidth={isMobile}
              disabled={!selectedCampaign || loading}
            >
              {dateRanges.map((range) => (
                <Button 
                  key={range.id}
                  variant={dateRange === range.id ? "contained" : "outlined"}
                  onClick={() => handleDateRangeChange(range.id)}
                  startIcon={range.id === 'today' ? <CalendarTodayIcon /> : <DateRangeIcon />}
                >
                  {i18n.t(range.label)}
                </Button>
              ))}
            </PeriodButtonGroup>
          </Grid>
        </Grid>
      </Box>

      {loadError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
        >
          <AlertTitle>{i18n.t('campaigns.reports.errors.title')}</AlertTitle>
          {loadError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : !selectedCampaign ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {i18n.t('campaigns.reports.selectToView')}
          </Typography>
        </Box>
      ) : !reportData && !loadError ? (
        <EmptyState
          type="campaigns"
          title={i18n.t('campaigns.reports.noData.title')}
          message={i18n.t('campaigns.reports.noData.message')}
          showButton={false}
        />
      ) : reportData ? (
        <>
          {/* Estatísticas gerais */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <StatCard variant="outlined">
                <StatCardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {i18n.t('campaigns.reports.stats.total')}
                  </Typography>
                  <StatValue color="primary">
                    {reportData.stats.total}
                  </StatValue>
                </StatCardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <StatCard variant="outlined">
                <StatCardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {i18n.t('campaigns.reports.stats.delivered')}
                  </Typography>
                  <StatValue color="success">
                    {reportData.stats.delivered}
                  </StatValue>
                  <Typography variant="body2" color="textSecondary">
                    {reportData.stats.total > 0 ? 
                      Math.round((reportData.stats.delivered / reportData.stats.total) * 100) : 0}%
                  </Typography>
                </StatCardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <StatCard variant="outlined">
                <StatCardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {i18n.t('campaigns.reports.stats.read')}
                  </Typography>
                  <StatValue color="info">
                    {reportData.stats.read}
                  </StatValue>
                  <Typography variant="body2" color="textSecondary">
                    {reportData.stats.total > 0 ? 
                      Math.round((reportData.stats.read / reportData.stats.total) * 100) : 0}%
                  </Typography>
                </StatCardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <StatCard variant="outlined">
                <StatCardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {i18n.t('campaigns.reports.stats.replied')}
                  </Typography>
                  <StatValue color="warning">
                    {reportData.stats.replied}
                  </StatValue>
                  <Typography variant="body2" color="textSecondary">
                    {reportData.stats.total > 0 ? 
                      Math.round((reportData.stats.replied / reportData.stats.total) * 100) : 0}%
                  </Typography>
                </StatCardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Typography variant="h6" fontWeight={500} gutterBottom>
            {i18n.t('campaigns.reports.charts.title')}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  {i18n.t('campaigns.reports.charts.statusDistribution')}
                </Typography>
                <ChartContainer>
                  {getStatusDistribution().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                          data={getStatusDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => {
                            // Exibir label apenas para valores maiores que 0
                            if (percent * 100 < 0.1) return null;
                            return `${name}: ${(percent * 100).toFixed(1)}%`;
                          }}

                        >
                          {getStatusDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, i18n.t('campaigns.reports.charts.messages')]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="textSecondary">
                        {i18n.t('campaigns.reports.noChartData')}
                      </Typography>
                    </Box>
                  )}
                </ChartContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  {i18n.t('campaigns.reports.charts.dailyProgress')}
                </Typography>
                <ChartContainer>
                  {getDailyProgress().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getDailyProgress()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="delivered"
                          stroke={theme.palette.success.main}
                          name={i18n.t('campaigns.reports.charts.delivered')}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="read"
                          stroke={theme.palette.info.main}
                          name={i18n.t('campaigns.reports.charts.read')}
                        />
                        <Line
                          type="monotone"
                          dataKey="replied"
                          stroke={theme.palette.warning.main}
                          name={i18n.t('campaigns.reports.charts.replied')}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="textSecondary">
                        {i18n.t('campaigns.reports.noChartData')}
                      </Typography>
                    </Box>
                  )}
                </ChartContainer>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Detalhes adicionais */}
          {reportData.campaignInfo && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight={500} gutterBottom>
                {i18n.t('campaigns.reports.details.title')}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        {i18n.t('campaigns.reports.details.startedAt')}
                      </Typography>
                      <Typography>
                        {reportData.campaignInfo.startedAt 
                          ? datetimeToClient(reportData.campaignInfo.startedAt)
                          : i18n.t('campaigns.reports.details.notStarted')
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        {i18n.t('campaigns.reports.details.completedAt')}
                      </Typography>
                      <Typography>
                        {reportData.campaignInfo.completedAt 
                          ? datetimeToClient(reportData.campaignInfo.completedAt)
                          : i18n.t('campaigns.reports.details.notCompleted')
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        {i18n.t('campaigns.reports.details.status')}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          reportData.campaignInfo.status 
                            ? i18n.t(`campaigns.reports.status.${reportData.campaignInfo.status.toLowerCase()}`) 
                            : i18n.t('campaigns.reports.status.unknown')
                        }
                        color={
                          reportData.campaignInfo.status === 'FINALIZADA' 
                            ? 'success' 
                            : reportData.campaignInfo.status === 'CANCELADA'
                              ? 'error'
                              : 'primary'
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        {i18n.t('campaigns.reports.details.confirmation')}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          reportData.campaignInfo.confirmation 
                            ? i18n.t('campaigns.table.enabled')
                            : i18n.t('campaigns.table.disabled')
                        }
                        color={reportData.campaignInfo.confirmation ? 'primary' : 'default'}
                        variant={reportData.campaignInfo.confirmation ? 'filled' : 'outlined'}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      ) : null}
    </MainPaper>
  );
};

export default CampaignReports;