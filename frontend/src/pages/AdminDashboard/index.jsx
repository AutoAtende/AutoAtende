import React, { useState, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Tab,
  Tabs,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Fade,
  Alert,
  Badge,
  LinearProgress
} from '@mui/material';

import {
  RefreshRounded,
  DateRange,
  BusinessCenter,
  Group,
  AttachMoney,
  Speed,
  Message,
  Campaign,
  Assessment,
  CloudQueue,
  Storage,
  NetworkCheck,
  Warning,
  InfoOutlined,
  TrendingUp,
  CheckCircle,
  Schedule,
  Forum
} from '@mui/icons-material';

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Components
import AnimatedKPI from './components/AnimatedKPI'; 
import QualityMetricsCard from './components/QualityMetricsCard'; 
import ContactsMap from './components/ContactsMap'; 
import EngagementMetricsCard from './components/EngagementMetricsCard'; 
import SystemMetricsCard from './components/SystemMetricsCard'; 
import RevenueMetricsCard from './components/RevenueMetricsCard'; 
import CampaignMetricsCard from './components/CampaignMetricsCard'; 
import MessagingMetricsCard from './components/MessagingMetricsCard'; 
import PerformanceMetricsCard from './components/PerformanceMetricsCard';
import WhatsAppStatusCard from './components/WhatsAppStatusCard';

// Hooks and Utils
import { useAdminDashboard } from './hooks/useAdminDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { i18n } from "../../translate/i18n";
import { formatCurrency, formatNumber } from '../../utils/formatters';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  
  const { 
    metrics, 
    loading, 
    error, 
    refresh, 
    lastUpdate,
    getColorScale,
    getStatusColor
  } = useAdminDashboard();

  // Animação de entrada da página
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 }
  });

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Renderiza os KPIs principais
  const renderMainKPIs = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <AnimatedKPI
          icon={BusinessCenter}
          title={i18n.t("adminDashboard.metrics.activeCompanies")}
          value={metrics?.companiesActive || 0}
          suffix=""
          trend={12}
          color="primary"
          subtitle={`${formatNumber(metrics?.totalCompanies || 0)} ${i18n.t("adminDashboard.metrics.total")}`}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <AnimatedKPI
          icon={Group}
          title={i18n.t("adminDashboard.metrics.activeUsers")}
          value={metrics?.usersActive7Days || 0}
          suffix=""
          trend={8}
          color="success"
          subtitle={`${formatNumber(metrics?.usersActive30Days || 0)} ${i18n.t("adminDashboard.metrics.lastMonth")}`}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <AnimatedKPI
          icon={AttachMoney}
          title={i18n.t("adminDashboard.metrics.monthlyRevenue")}
          value={metrics?.revenueMetrics?.monthlyRevenue || 0}
          suffix=" R$"
          trend={15}
          color="info"
          subtitle={formatCurrency(metrics?.revenueMetrics?.annualRevenue || 0)}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <AnimatedKPI
          icon={Speed}
          title={i18n.t("adminDashboard.metrics.avgResponseTime")}
          value={metrics?.serviceMetrics?.response?.averageTime || 0}
          suffix=" min"
          color="warning"
          subtitle={`${formatNumber(metrics?.serviceMetrics?.response?.pendingRate || 0)}% ${i18n.t("adminDashboard.metrics.pending")}`}
        />
      </Grid>
    </Grid>
  );

  // Renderiza métricas gerais
  const renderGeneralMetrics = () => (
    <Grid container spacing={3}>
      {/* KPIs Principais */}
      {renderMainKPIs()}

      {/* Mapa de Contatos e Engajamento */}
      <Grid item xs={12} md={8}>
        <ContactsMap 
          metrics={metrics}
          getColorScale={getColorScale}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <EngagementMetricsCard 
          metrics={metrics?.engagementMetrics}
          getColorScale={getColorScale}
        />
      </Grid>

      {/* Sistema de Mensagens e Campanhas */}
      <Grid item xs={12} md={6}>
        <MessagingMetricsCard 
          metrics={metrics?.whatsappMetrics}
          getColorScale={getColorScale}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CampaignMetricsCard 
          metrics={metrics?.campaignMetrics}
          getColorScale={getColorScale}
        />
      </Grid>

      {/* Métricas de Qualidade */}
      <Grid item xs={12}>
        <QualityMetricsCard 
          quality={metrics?.serviceMetrics?.quality}
          getStatusColor={getStatusColor}
        />
      </Grid>
    </Grid>
  );

  // Renderiza métricas financeiras
  const renderFinancialMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <RevenueMetricsCard 
          metrics={metrics?.revenueMetrics}
          getColorScale={getColorScale}
        />
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            {i18n.t("adminDashboard.financialMetrics.projection")}
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.revenueMetrics?.projection || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={(date) => format(new Date(date), 'MMM/yy', { locale: ptBR })}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
                <ChartTooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="projected"
                  name={i18n.t("adminDashboard.financialMetrics.projectedRevenue")}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name={i18n.t("adminDashboard.financialMetrics.actualRevenue")}
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            {i18n.t("adminDashboard.financialMetrics.planDistribution")}
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.revenueMetrics?.planDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label
                >
                  {metrics?.revenueMetrics?.planDistribution?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColorScale(entry.value, metrics.revenueMetrics.annualRevenue)} 
                    />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // Renderiza métricas do sistema
  const renderSystemMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SystemMetricsCard 
          metrics={metrics?.systemMetrics}
          getStatusColor={getStatusColor}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <WhatsAppStatusCard 
          metrics={metrics?.whatsappMetrics}
          getStatusColor={getStatusColor}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <PerformanceMetricsCard 
          metrics={metrics?.systemMetrics}
          getColorScale={getColorScale}
        />
      </Grid>
    </Grid>
  );

  if (loading && !metrics) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {i18n.t("adminDashboard.loadingMessage")}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
      >
        <Alert
          severity="error"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleRefresh}
            >
              <RefreshRounded />
            </IconButton>
          }
        >
          {i18n.t("adminDashboard.fetchError")}
        </Alert>
      </Box>
    );
  }

  return (
    <animated.div style={fadeIn}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexDirection={isMobile ? 'column' : 'row'}
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" component="h1">
              {i18n.t("adminDashboard.title")}
            </Typography>
            {lastUpdate && (
              <Chip
                size="small"
                label={format(lastUpdate, 'HH:mm')}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={2}
            width={isMobile ? '100%' : 'auto'}
          >
            <Tooltip title={i18n.t("adminDashboard.refreshTooltip")}>
              <IconButton
                onClick={handleRefresh}
                color="primary"
                disabled={loading}
              >
                <RefreshRounded />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant={isMobile ? 'fullWidth' : 'standard'}
            scrollButtons={!isMobile}
            allowScrollButtonsMobile
          >
            <Tab 
              label={i18n.t("adminDashboard.tabs.overview")} 
              icon={<Assessment />}
              iconPosition="start"
            />
            <Tab 
              label={i18n.t("adminDashboard.tabs.financial")} 
              icon={<AttachMoney />}
              iconPosition="start"
            />
            <Tab 
              label={i18n.t("adminDashboard.tabs.system")} 
              icon={<Storage />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <br />
        <br />

        {/* Tab Content */}
        <Box sx={{ position: 'relative', minHeight: 500 }}>
          <Fade in={currentTab === 0} timeout={500}>
            <Box sx={{ display: currentTab === 0 ? 'block' : 'none' }}>
              {renderGeneralMetrics()}
            </Box>
          </Fade>

          <Fade in={currentTab === 1} timeout={500}>
          <Box sx={{ display: currentTab === 1 ? 'block' : 'none' }}>
              {renderFinancialMetrics()}
            </Box>
          </Fade>

          <Fade in={currentTab === 2} timeout={500}>
            <Box sx={{ display: currentTab === 2 ? 'block' : 'none' }}>
              {renderSystemMetrics()}
            </Box>
          </Fade>
        </Box>

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="textSecondary">
              {i18n.t("adminDashboard.updatingMessage")}
            </Typography>
          </Box>
        )}

        {/* Snackbar para feedback de atualização */}
        {lastUpdate && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 9998
            }}
          >
            <Chip
              icon={<CloudQueue />}
              label={i18n.t("adminDashboard.lastUpdate", {
                time: format(lastUpdate, 'HH:mm:ss')
              })}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Container>
    </animated.div>
  );
};

export default AdminDashboard;