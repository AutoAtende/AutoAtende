import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { AuthContext } from '../../../context/Auth/AuthContext';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';
import moment from 'moment';

const FinancialReportModal = ({ open, onClose, employers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(AuthContext);

  const [filters, setFilters] = useState({
    employerId: '',
    startDate: moment().startOf('year').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [report, setReport] = useState({
    summary: {
      totalValue: 0,
      pendingValue: 0,
      paidValue: 0,
      totalCharges: 0,
      pendingCharges: 0,
      paidCharges: 0,
      paidInPeriodValue: 0,
      currency: 'BRL'
    },
    period: {
      startDate: new Date(),
      endDate: new Date()
    },
    byEmployer: [],
    byMonth: {
      charges: [],
      payments: []
    }
  });
  
// No método fetchReport
// No método fetchReport
const fetchReport = async () => {
  if (!user?.companyId) return;

  setLoading(true);
  try {
    const params = { ...filters };
    const response = await api.get('/task/charges/report', { params });
    
    // Tratar possíveis formatos de resposta da API
    let reportData;
    if (response.data?.data) {
      reportData = response.data.data;
    } else if (response.data) {
      reportData = response.data;
    } else {
      throw new Error('Formato de resposta inválido');
    }
    
    // Garantir que todos os valores numéricos são realmente números
    if (reportData.summary) {
      Object.keys(reportData.summary).forEach(key => {
        if (typeof reportData.summary[key] === 'string') {
          reportData.summary[key] = parseFloat(reportData.summary[key]) || 0;
        }
      });
    }
    
    // Processar dados do gráfico de barras para garantir formato correto
    if (reportData.byMonth && reportData.byMonth.charges) {
      reportData.byMonth.charges = reportData.byMonth.charges.map(item => ({
        ...item,
        totalValue: typeof item.totalValue === 'string' ? parseFloat(item.totalValue) || 0 : (item.totalValue || 0),
        month: item.month ? moment(item.month).format('MMM/YY') : ''
      }));
    }
    
    if (reportData.byMonth && reportData.byMonth.payments) {
      reportData.byMonth.payments = reportData.byMonth.payments.map(item => ({
        ...item,
        totalValue: typeof item.totalValue === 'string' ? parseFloat(item.totalValue) || 0 : (item.totalValue || 0),
        month: item.month ? moment(item.month).format('MMM/YY') : ''
      }));
    }
    
    if (reportData.byEmployer) {
      reportData.byEmployer = reportData.byEmployer.map(item => ({
        ...item,
        totalValue: typeof item.totalValue === 'string' ? parseFloat(item.totalValue) || 0 : (item.totalValue || 0),
        employerName: item.employerName || 'Empresa não informada'
      }));
    }
    
    setReport(reportData);
    setError(null);
    
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    setError(error.response?.data?.error || i18n.t('taskCharges.errorLoadingReport'));
    // Manter o relatório atual ou inicializar com valores vazios
    setReport(prev => prev || {
      summary: {
        totalValue: 0,
        pendingValue: 0,
        paidValue: 0,
        totalCharges: 0,
        pendingCharges: 0,
        paidCharges: 0,
        paidInPeriodValue: 0,
        currency: 'BRL'
      },
      period: {
        startDate: filters.startDate ? new Date(filters.startDate) : new Date(),
        endDate: filters.endDate ? new Date(filters.endDate) : new Date()
      },
      byEmployer: [],
      byMonth: {
        charges: [],
        payments: []
      }
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (open) {
      fetchReport();
    }
  }, [open]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setFilters({
      employerId: '',
      startDate: moment().startOf('year').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD')
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Cores para os gráficos
  const colors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main
  };

  // Formatador de valores
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        p: isMobile ? 2 : 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <BarChartIcon color="primary" />
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {i18n.t('taskCharges.financialReport')}
          </Typography>
        </Box>
        {isMobile && (
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: isMobile ? 1.5 : 3, pt: isMobile ? 0 : 2 }}>
        {/* Filtros */}
        <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 3, mt: isMobile ? 1 : 0 }}>
          <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{i18n.t('taskCharges.employer')}</InputLabel>
                <Select
                  value={filters.employerId}
                  onChange={handleFilterChange('employerId')}
                  label={i18n.t('taskd.charges.employer')}
                >
                  <MenuItem value="">
                    <em>{i18n.t('tasks.charges.allEmployers')}</em>
                  </MenuItem>
                  {employers.map((employer) => (
                    <MenuItem key={employer.id} value={employer.id}>
                      {employer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label={i18n.t('taskCharges.startDate')}
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange('startDate')}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label={i18n.t('taskCharges.endDate')}
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange('endDate')}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction={isMobile ? "row" : "column"} spacing={1} sx={{ width: '100%' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApplyFilters}
                  startIcon={<SearchIcon />}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                >
                  {isMobile ? "" : i18n.t('tasks.buttons.filter')}
                  {isMobile && <SearchIcon />}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<RefreshIcon />}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                >
                  {isMobile ? "" : i18n.t('tasks.buttons.clear')}
                  {isMobile && <RefreshIcon />}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : report ? (
          <Box>
            {/* Cards de resumo */}
            <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" noWrap>
                    {i18n.t('taskCharges.totalValue')}
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: 'primary.main' }}>
                    {formatCurrency(report.summary.totalValue)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {`${report.summary.totalCharges} ${i18n.t('taskCharges.charges')}`}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" noWrap>
                    {i18n.t('taskCharges.pendingValue')}
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: 'error.main' }}>
                    {formatCurrency(report.summary.pendingValue)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {`${report.summary.pendingCharges} ${i18n.t('taskCharges.charges')}`}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" noWrap>
                    {i18n.t('taskCharges.paidValue')}
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: 'success.main' }}>
                    {formatCurrency(report.summary.paidValue)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {`${report.summary.paidCharges} ${i18n.t('taskCharges.charges')}`}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" noWrap>
                    {i18n.t('taskCharges.paidInPeriod')}
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: 'warning.main' }}>
                    {formatCurrency(report.summary.paidInPeriodValue)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {`${moment(report.period.startDate).format('DD/MM/YYYY')} - ${moment(report.period.endDate).format('DD/MM/YYYY')}`}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Tabs para visualização mobile */}
            {isMobile && (
              <Paper sx={{ mb: 2 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="Por Empresa" />
                  <Tab label="Por Mês" />
                  <Tab label="Comparativo" />
                </Tabs>
              </Paper>
            )}

            {/* Gráficos */}
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* Cobranças por Empresa */}
              {(!isMobile || activeTab === 0) && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: isMobile ? 1.5 : 2, height: isMobile ? 250 : 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {i18n.t('taskCharges.chargesByEmployer')}
                    </Typography>
                    {report.byEmployer && report.byEmployer.length > 0 ? (
                      <ResponsiveContainer width="100%" height={isMobile ? "85%" : "85%"}>
                        <BarChart
                          data={report.byEmployer}
                          margin={{ 
                            top: 5, 
                            right: isMobile ? 5 : 30, 
                            left: isMobile ? 5 : 20, 
                            bottom: 5 
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="employerName" 
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                            tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
                          />
                          <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                          <Bar dataKey="totalValue" name={i18n.t('taskCharges.value')} fill={colors.primary} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
                        <Typography variant="body2" color="textSecondary">
                          {i18n.t('taskCharges.noDataAvailable')}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Cobranças por Mês */}
              {(!isMobile || activeTab === 1) && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: isMobile ? 1.5 : 2, height: isMobile ? 250 : 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {i18n.t('taskCharges.chargesByMonth')}
                    </Typography>
                    {report.byMonth && report.byMonth.charges && report.byMonth.charges.length > 0 ? (
                      <ResponsiveContainer width="100%" height={isMobile ? "85%" : "85%"}>
                        <LineChart
                          data={report.byMonth.charges.map(item => ({
                            ...item,
                            month: moment(item.month).format('MMM/YY')
                          }))}
                          margin={{ 
                            top: 5, 
                            right: isMobile ? 5 : 30, 
                            left: isMobile ? 5 : 20, 
                            bottom: 5 
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
                          <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                          <Line 
                            type="monotone" 
                            dataKey="totalValue" 
                            name={i18n.t('taskCharges.charges')} 
                            stroke={colors.primary} 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
                        <Typography variant="body2" color="textSecondary">
                          {i18n.t('taskCharges.noDataAvailable')}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Pagamentos por Mês */}
              {(!isMobile || activeTab === 2) && (
                <Grid item xs={12}>
                  <Paper sx={{ p: isMobile ? 1.5 : 2, height: isMobile ? 250 : 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                    {i18n.t('taskCharges.paymentsVsCharges')}
                    </Typography>
                    {report.byMonth && report.byMonth.payments && report.byMonth.payments.length > 0 ? (
                      <ResponsiveContainer width="100%" height={isMobile ? "85%" : "85%"}>
                        <BarChart
                          data={[
                            ...report.byMonth.charges.map(item => ({
                              month: moment(item.month).format('MMM/YY'),
                              charges: item.totalValue,
                              payments: 0
                            })),
                            ...report.byMonth.payments.map(item => ({
                              month: moment(item.month).format('MMM/YY'),
                              payments: item.totalValue,
                              charges: 0
                            }))
                          ].reduce((acc, item) => {
                            const existingItem = acc.find(i => i.month === item.month);
                            if (existingItem) {
                              existingItem.charges += item.charges;
                              existingItem.payments += item.payments;
                            } else {
                              acc.push(item);
                            }
                            return acc;
                          }, []).sort((a, b) => moment(a.month, 'MMM/YY').diff(moment(b.month, 'MMM/YY')))}
                          margin={{ 
                            top: 5, 
                            right: isMobile ? 5 : 30, 
                            left: isMobile ? 5 : 20, 
                            bottom: 5 
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
                          <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                          <Bar dataKey="charges" name={i18n.t('taskCharges.charges')} fill={colors.primary} />
                          <Bar dataKey="payments" name={i18n.t('taskCharges.payments')} fill={colors.success} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
                        <Typography variant="body2" color="textSecondary">
                          {i18n.t('taskCharges.noDataAvailable')}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="body1" color="textSecondary">
              {i18n.t('taskCharges.selectFiltersAndSearch')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: isMobile ? 2 : 1.5 }}>
        <Button 
          onClick={onClose} 
          color="primary" 
          variant={isMobile ? "contained" : "text"}
          fullWidth={isMobile}
        >
          {i18n.t('buttons.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinancialReportModal;