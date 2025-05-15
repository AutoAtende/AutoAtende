// src/pages/EmailDashboard/components/EmailStats.jsx
import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Tabs, 
  Tab, 
  Button, 
  Divider,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Zoom,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import { 
  LineChart, 
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { i18n } from "../../../translate/i18n";
import EmailList from './EmailList';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    '&:hover': {
      color: theme.palette.primary.main,
      opacity: 1,
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightBold,
    },
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

/**
 * Componente para exibir estatísticas e gráficos de emails
 */
const EmailStats = ({
  sentEmails = [], // Valor padrão para evitar erro quando undefined
  scheduledEmails = [], // Valor padrão para evitar erro quando undefined
  onViewEmail,
  onRefresh,
  onExportPdf,
  onCancelScheduled,
  onReschedule,
  isMobile,
  isTablet
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chartType, setChartType] = useState('line');
  const [showAll, setShowAll] = useState(false);
  
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main
  ];
  
  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };
  
  // Dados para estatísticas
  const stats = useMemo(() => {
    // Total de emails
    const totalSent = sentEmails.length;
    const totalScheduled = scheduledEmails.length;
    
    // Status
    const sentStatus = sentEmails.reduce((acc, email) => {
      const status = email.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const scheduledStatus = scheduledEmails.reduce((acc, email) => {
      const status = email.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Taxa de sucesso
    const successRate = totalSent > 0 
      ? ((sentStatus.SENT || 0) / totalSent * 100).toFixed(1) 
      : 0;
    
    // Emails por dia da semana
    const emailsByDay = sentEmails.reduce((acc, email) => {
      if (!email.sentAt) return acc;
      const day = moment(email.sentAt).format('dddd');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalSent,
      totalScheduled,
      sentStatus,
      scheduledStatus,
      successRate,
      emailsByDay
    };
  }, [sentEmails, scheduledEmails]);
  
  // Dados para gráficos
  const chartData = useMemo(() => {
    // Dados para gráfico de linha - emails por dia
    const lineData = [];
    const startDate = moment().subtract(30, 'days');
    
    // Criar mapa de datas para os últimos 30 dias
    const dateMap = {};
    for (let i = 0; i < 30; i++) {
      const date = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
      dateMap[date] = 0;
    }
    
    // Preencher com dados reais
    sentEmails.forEach(email => {
      if (!email.sentAt) return;
      
      const date = moment(email.sentAt).format('YYYY-MM-DD');
      if (dateMap[date] !== undefined) {
        dateMap[date]++;
      }
    });
    
    // Converter para array
    Object.entries(dateMap).forEach(([date, count]) => {
      lineData.push({
        date,
        count,
        formattedDate: moment(date).format('DD/MM')
      });
    });
    
    // Dados para gráfico de pizza - status
    const pieData = [
      { name: i18n.t('email.status.sent'), value: stats.sentStatus.SENT || 0 },
      { name: i18n.t('email.status.error'), value: stats.sentStatus.ERROR || 0 },
      { name: i18n.t('email.status.pending'), value: stats.sentStatus.PENDING || 0 },
    ];
    
    // Dados para gráfico de barras - dias da semana
    const barData = Object.entries(stats.emailsByDay).map(([day, count]) => ({
      day,
      count,
      translatedDay: i18n.t(`email.days.${day.toLowerCase()}`)
    }));
    
    return {
      lineData,
      pieData,
      barData
    };
  }, [sentEmails, stats]);
  
  // Renderiza o gráfico correto com base no tipo selecionado
  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <LineChart data={chartData.lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: theme.palette.text.secondary, fontSize: isMobile ? 10 : 12 }} 
              tickMargin={10}
              interval={isMobile ? 4 : 2}
            />
            <YAxis 
              tick={{ fill: theme.palette.text.secondary, fontSize: isMobile ? 10 : 12 }} 
              tickMargin={10}
            />
            <RechartsTooltip 
              formatter={(value, name) => [`${value} ${i18n.t('email.chart.emails')}`, i18n.t('email.chart.count')]}
              labelFormatter={(label) => moment(label, 'DD/MM').format('DD/MM/YYYY')}
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: theme.shadows[4]
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke={theme.palette.primary.main} 
              strokeWidth={2} 
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
              name={i18n.t('email.chart.sentEmails')}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <PieChart>
            <Pie
              data={chartData.pieData}
              cx="50%"
              cy="50%"
              labelLine={!isMobile}
              outerRadius={isMobile ? 80 : 100}
              innerRadius={isMobile ? 30 : 50}
              fill={theme.palette.primary.main}
              dataKey="value"
              nameKey="name"
              label={!isMobile && ((entry) => entry.name)}
            >
              {chartData.pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value, name) => [`${value} ${i18n.t('email.chart.emails')}`, name]}
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: theme.shadows[4]
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <BarChart data={chartData.barData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="translatedDay" 
              tick={{ fill: theme.palette.text.secondary, fontSize: isMobile ? 10 : 12 }} 
              tickMargin={10}
            />
            <YAxis 
              tick={{ fill: theme.palette.text.secondary, fontSize: isMobile ? 10 : 12 }} 
              tickMargin={10}
            />
            <RechartsTooltip 
              formatter={(value, name) => [`${value} ${i18n.t('email.chart.emails')}`, i18n.t('email.chart.count')]}
              contentStyle={{ 
                backgroundColor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: theme.shadows[4]
              }}
            />
            <Bar 
              dataKey="count" 
              fill={theme.palette.primary.main} 
              barSize={isMobile ? 20 : 40}
              name={i18n.t('email.chart.sentEmails')}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant={isMobile ? "h6" : "h5"} component="h2">
          {i18n.t('email.title.emailList')}
        </Typography>
        
        <Box>
          <Tooltip title={i18n.t('email.tooltips.refresh')}>
            <IconButton onClick={onRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={i18n.t('email.tooltips.export')}>
            <IconButton onClick={() => onExportPdf && onExportPdf(sentEmails)} color="primary">
              <GetAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Cards de estatísticas */}
      <Box>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {i18n.t('email.stats.totalSent')}
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                  {stats.totalSent}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    {stats.sentStatus.SENT || 0} {i18n.t('email.stats.delivered')}
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {i18n.t('email.stats.totalScheduled')}
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                  {stats.totalScheduled}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    {scheduledEmails.filter(e => moment(e.sendAt).isAfter(moment())).length} {i18n.t('email.stats.pending')}
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {i18n.t('email.stats.successRate')}
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                  {stats.successRate}%
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    {stats.sentStatus.ERROR || 0} {i18n.t('email.stats.failed')}
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {i18n.t('email.stats.averagePerDay')}
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} component="div">
                  {stats.totalSent > 0 ? (stats.totalSent / 30).toFixed(1) : '0'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('email.stats.last30Days')}
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
        </Grid>
      </Box>
      
      {/* Gráficos */}
      <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            {i18n.t('email.chart.title')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={i18n.t('email.chart.lineChart')}>
              <IconButton 
                onClick={() => handleChartTypeChange('line')}
                color={chartType === 'line' ? 'primary' : 'default'}
                size="small"
              >
                <ShowChartIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={i18n.t('email.chart.barChart')}>
              <IconButton 
                onClick={() => handleChartTypeChange('bar')}
                color={chartType === 'bar' ? 'primary' : 'default'}
                size="small"
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={i18n.t('email.chart.pieChart')}>
              <IconButton 
                onClick={() => handleChartTypeChange('pie')}
                color={chartType === 'pie' ? 'primary' : 'default'}
                size="small"
              >
                <PieChartIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {renderChart()}
      </Paper>
      
      {/* Tabs para listas de emails */}
      <StyledTabs
        value={activeTab}
        onChange={handleTabChange}
        variant={isMobile ? "fullWidth" : "standard"}
        indicatorColor="primary"
        textColor="primary"
        aria-label={i18n.t('email.ariaLabels.emailLists')}
      >
        <Tab label={i18n.t('email.tabs.sent')} id="email-tab-0" aria-controls="email-tabpanel-0" />
        <Tab label={i18n.t('email.tabs.scheduled')} id="email-tab-1" aria-controls="email-tabpanel-1" />
      </StyledTabs>
      
      <Box role="tabpanel" id={`email-tabpanel-${activeTab}`} aria-labelledby={`email-tab-${activeTab}`}>
        {activeTab === 0 && (
          <EmailList 
            emails={sentEmails} 
            type="sent"
            onViewEmail={onViewEmail}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        )}
        
        {activeTab === 1 && (
          <EmailList 
            emails={scheduledEmails} 
            type="scheduled"
            onViewEmail={onViewEmail}
            onCancelScheduled={onCancelScheduled}
            onReschedule={onReschedule}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        )}
      </Box>
    </Box>
  );
};

export default React.memo(EmailStats);