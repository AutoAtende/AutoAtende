import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Stack
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  FilterAlt as FilterAltIcon
} from '@mui/icons-material';
import { AuthContext } from '../../../context/Auth/AuthContext';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import moment from 'moment';
import PaymentModal from './PaymentModal';
import FinancialReportModal from './FinancialReportModal';

const ChargesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(AuthContext);

  // Estados
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [charges, setCharges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    employerId: '',
    startDate: '',
    endDate: ''
  });
  const [employers, setEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState(!isMobile);

  // Buscar empresas
  const fetchEmployers = useCallback(async () => {
    if (!user?.companyId) return;

    setLoadingEmployers(true);
    try {
      const response = await api.get('/employers');
      setEmployers(response.data?.employers || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoadingEmployers(false);
    }
  }, [user?.companyId]);

  // Buscar cobranças
  const fetchCharges = useCallback(async () => {
    if (!user?.companyId) return;

    setLoading(true);
    try {
      const endpoint = tabValue === 0 ? '/task/charges/pending' : '/task/charges/paid';
      
      const params = {
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        ...filters
      };

      const response = await api.get(endpoint, { params });
      
      setCharges(response.data?.data || []);
      setTotalCount(response.data?.count || 0);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
      setError(error.response?.data?.error || i18n.t('taskCharges.errorLoadingCharges'));
      setCharges([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, tabValue, page, rowsPerPage, filters]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  // Buscar cobranças quando os filtros, página ou tab mudam
  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  // Mudança de tab
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  // Mudança de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Mudança de linhas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Alteração de filtros
  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setPage(0);
    fetchCharges();
    if (isMobile) {
      setExpandedFilters(false);
    }
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({
      employerId: '',
      startDate: '',
      endDate: ''
    });
    setPage(0);
  };

  // Gerar PDF da cobrança
  const handleGeneratePDF = async (taskId) => {
    setActionLoading(true);
    try {
      const response = await api.get(`/task/${taskId}/charge/pdf`);
      
      const pdfUrl = response.data.data.url;
      window.open(pdfUrl, '_blank');
      
      toast.success(i18n.t('taskCharges.pdfGenerated'));
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error(error.response?.data?.error || i18n.t('taskCharges.errorGeneratingPDF'));
    } finally {
      setActionLoading(false);
    }
  };

  // Enviar cobrança por email
  const handleSendEmail = async (taskId) => {
    setActionLoading(true);
    try {
      await api.post(`/task/${taskId}/charge/email`);
      toast.success(i18n.t('taskCharges.emailSent'));
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error(error.response?.data?.error || i18n.t('taskCharges.errorSendingEmail'));
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir modal de pagamento
  const handleOpenPaymentModal = (charge) => {
    setSelectedCharge(charge);
    setOpenPaymentModal(true);
  };

  // Registrar pagamento
  const handleRegisterPayment = async (paymentData) => {
    if (!selectedCharge) return;

    setActionLoading(true);
    try {
      await api.post(`/task/${selectedCharge.id}/charge/payment`, paymentData);
      
      toast.success(i18n.t('taskCharges.paymentRegistered'));
      setOpenPaymentModal(false);
      
      // Recarregar cobranças
      fetchCharges();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error(error.response?.data?.error || i18n.t('taskCharges.errorRegisteringPayment'));
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir relatório financeiro
  const handleOpenReport = () => {
    setOpenReportModal(true);
  };

  // Renderização de card para visualização mobile
  const renderChargeCard = (charge) => (
    <Card sx={{ mb: 2, width: '100%' }} key={charge.id}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {charge.title}
        </Typography>
        
        {charge.employer ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {charge.employer.name}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" fontStyle="italic" sx={{ mb: 1 }}>
            {i18n.t('taskCharges.noEmployer')}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            {i18n.t('taskCharges.value')}:
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 'bold',
              color: tabValue === 0 ? 'error.main' : 'success.main' 
            }}
          >
            R$ {parseFloat(charge.chargeValue).toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            {tabValue === 0 ? i18n.t('taskCharges.dueDate') : i18n.t('taskCharges.paymentDate')}:
          </Typography>
          {tabValue === 0 ? (
            charge.dueDate ? (
              <Chip
                label={moment(charge.dueDate).format('DD/MM/YYYY')}
                color={moment(charge.dueDate).isBefore(moment()) ? "error" : "default"}
                size="small"
              />
            ) : (
              <Typography variant="body2" color="textSecondary" fontStyle="italic">
                {i18n.t('taskCharges.noDueDate')}
              </Typography>
            )
          ) : (
            <Chip
              label={moment(charge.paymentDate).format('DD/MM/YYYY')}
              color="success"
              size="small"
            />
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 1, pt: 0, justifyContent: 'space-around' }}>
        <Tooltip title={i18n.t('taskCharges.generatePDF')}>
          <IconButton
            size="small"
            onClick={() => handleGeneratePDF(charge.id)}
            disabled={actionLoading}
          >
            <PdfIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={i18n.t('taskCharges.sendEmail')}>
          <span>
            <IconButton
              size="small"
              onClick={() => handleSendEmail(charge.id)}
              disabled={actionLoading || (!charge.requesterEmail && !charge.employer?.email)}
            >
              <EmailIcon />
            </IconButton>
          </span>
        </Tooltip>
        
        {tabValue === 0 && (
          <Tooltip title={i18n.t('taskCharges.registerPayment')}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleOpenPaymentModal(charge)}
              disabled={actionLoading}
            >
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Paper sx={{ mb: 2, p: isMobile ? 1.5 : 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant={isMobile ? "h6" : "h5"} component="h1">
            {i18n.t('taskCharges.chargesManagement')}
          </Typography>
          <Box sx={{ ml: 'auto', mt: isMobile ? 1 : 0, width: isMobile ? '100%' : 'auto' }}>
            <Tooltip title={i18n.t('taskCharges.financialReport')}>
              <Button
                variant="outlined"
                startIcon={<BarChartIcon />}
                onClick={handleOpenReport}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                {isMobile ? '' : i18n.t('taskCharges.report')}
                {isMobile && <BarChartIcon />}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab 
            icon={<MoneyOffIcon />} 
            label={isMobile ? "" : i18n.t('taskCharges.pendingCharges')} 
            iconPosition="start"
            aria-label={i18n.t('taskCharges.pendingCharges')}
          />
          <Tab 
            icon={<ReceiptIcon />} 
            label={isMobile ? "" : i18n.t('taskCharges.paidCharges')} 
            iconPosition="start"
            aria-label={i18n.t('taskCharges.paidCharges')}
          />
        </Tabs>

        {/* Toggle para filtros em dispositivos móveis */}
        {isMobile && (
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth 
            onClick={() => setExpandedFilters(!expandedFilters)}
            startIcon={<FilterAltIcon />}
            sx={{ mb: 2 }}
          >
            {expandedFilters ? i18n.t('buttons.hideFilters') : i18n.t('buttons.showFilters')}
          </Button>
        )}

        {/* Filtros */}
        {(expandedFilters || !isMobile) && (
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{i18n.t('tasks.charges.employer')}</InputLabel>
                <Select
                  value={filters.employerId}
                  onChange={handleFilterChange('employerId')}
                  label={i18n.t('tasks.charges.employer')}
                  disabled={loadingEmployers}
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
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={2}>
              <Stack direction={isMobile ? "row" : "column"} spacing={1} sx={{ height: '100%' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApplyFilters}
                  startIcon={<SearchIcon />}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                >
                  {i18n.t('tasks.buttons.filter')}
                </Button>
                <Tooltip title={i18n.t('tasks.buttons.clearFilters')}>
                  <IconButton onClick={handleClearFilters} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Versão para dispositivos móveis - Cards */}
        {isMobile ? (
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : charges.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ py: 3 }}>
                {tabValue === 0
                  ? i18n.t('taskCharges.noPendingCharges')
                  : i18n.t('taskCharges.noPaidCharges')}
              </Typography>
            ) : (
              charges.map(charge => renderChargeCard(charge))
            )}
          </Box>
        ) : (
          /* Versão para desktop - Tabela */
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size={isTablet ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>{i18n.t('taskCharges.task')}</TableCell>
                  <TableCell>{i18n.t('tasks.charges.employer')}</TableCell>
                  <TableCell align="right">{i18n.t('taskCharges.value')}</TableCell>
                  {tabValue === 0 ? (
                    <TableCell>{i18n.t('taskCharges.dueDate')}</TableCell>
                  ) : (
                    <TableCell>{i18n.t('taskCharges.paymentDate')}</TableCell>
                  )}
                  <TableCell align="center">{i18n.t('taskCharges.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={40} sx={{ my: 3 }} />
                    </TableCell>
                  </TableRow>
                ) : charges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                     <Typography variant="body1" sx={{ py: 3 }}>
                       {tabValue === 0
                         ? i18n.t('taskCharges.noPendingCharges')
                         : i18n.t('taskCharges.noPaidCharges')}
                     </Typography>
                   </TableCell>
                 </TableRow>
               ) : (
                 charges.map((charge) => (
                   <TableRow key={charge.id}>
                     <TableCell>
                       <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                         {charge.title}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       {charge.employer ? (
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                           <Typography variant="body2">
                             {charge.employer.name}
                           </Typography>
                         </Box>
                       ) : (
                         <Typography variant="body2" color="textSecondary" fontStyle="italic">
                           {i18n.t('taskCharges.noEmployer')}
                         </Typography>
                       )}
                     </TableCell>
                     <TableCell align="right">
                       <Typography 
                         variant="body2" 
                         sx={{ 
                           fontWeight: 'bold',
                           color: tabValue === 0 ? 'error.main' : 'success.main' 
                         }}
                       >
                         R$ {parseFloat(charge.chargeValue).toFixed(2)}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       {tabValue === 0 ? (
                         charge.dueDate ? (
                           <Chip
                             label={moment(charge.dueDate).format('DD/MM/YYYY')}
                             color={moment(charge.dueDate).isBefore(moment()) ? "error" : "default"}
                             size="small"
                           />
                         ) : (
                           <Typography variant="body2" color="textSecondary" fontStyle="italic">
                             {i18n.t('taskCharges.noDueDate')}
                           </Typography>
                         )
                       ) : (
                         <Chip
                           label={moment(charge.paymentDate).format('DD/MM/YYYY')}
                           color="success"
                           size="small"
                         />
                       )}
                     </TableCell>
                     <TableCell align="center">
                       <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                         <Tooltip title={i18n.t('taskCharges.generatePDF')}>
                           <IconButton
                             size="small"
                             onClick={() => handleGeneratePDF(charge.id)}
                             disabled={actionLoading}
                           >
                             <PdfIcon />
                           </IconButton>
                         </Tooltip>
                         
                         <Tooltip title={i18n.t('taskCharges.sendEmail')}>
                           <span>
                             <IconButton
                               size="small"
                               onClick={() => handleSendEmail(charge.id)}
                               disabled={actionLoading || (!charge.requesterEmail && !charge.employer?.email)}
                             >
                               <EmailIcon />
                             </IconButton>
                           </span>
                         </Tooltip>
                         
                         {tabValue === 0 && (
                           <Tooltip title={i18n.t('taskCharges.registerPayment')}>
                             <IconButton
                               size="small"
                               color="success"
                               onClick={() => handleOpenPaymentModal(charge)}
                               disabled={actionLoading}
                             >
                               <ReceiptIcon />
                             </IconButton>
                           </Tooltip>
                         )}
                       </Box>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </TableContainer>
        )}

       <TablePagination
         component="div"
         count={totalCount}
         page={page}
         onPageChange={handleChangePage}
         rowsPerPage={rowsPerPage}
         onRowsPerPageChange={handleChangeRowsPerPage}
         labelRowsPerPage={isMobile ? "" : i18n.t('taskCharges.rowsPerPage')}
         labelDisplayedRows={({ from, to, count }) =>
           `${from}-${to} ${i18n.t('taskCharges.of')} ${count}`
         }
         rowsPerPageOptions={isMobile ? [5, 10, 25] : [10, 25, 50, 100]}
       />
     </Paper>

     {/* Modais */}
     <PaymentModal
       open={openPaymentModal}
       onClose={() => setOpenPaymentModal(false)}
       onConfirm={handleRegisterPayment}
       loading={actionLoading}
     />

     <FinancialReportModal
       open={openReportModal}
       onClose={() => setOpenReportModal(false)}
       employers={employers}
     />
   </Box>
 );
};

export default ChargesPage;