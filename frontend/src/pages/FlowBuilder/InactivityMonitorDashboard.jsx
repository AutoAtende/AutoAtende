import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Badge,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  HourglassEmpty as InactivityIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Stop as StopIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/Auth/AuthContext';
import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { i18n } from '../../translate/i18n';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import MainHeaderButtonsWrapper from '../../components/MainHeaderButtonsWrapper';
import Title from '../../components/Title';

const InactivityMonitorDashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Estados de dados
  const [dashboardStats, setDashboardStats] = useState({
    totalActiveExecutions: 0,
    inactiveExecutions: 0,
    warningExecutions: 0,
    reengagedToday: 0,
    transferredToday: 0,
    endedToday: 0,
    averageInactivityTime: 0,
    reengagementRate: 0
  });

  const [executions, setExecutions] = useState([]);
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState('all');

  // Estados de paginação e filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');

  // Estados de modais
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Recarregar dados a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadDashboardData(true); // refresh silencioso
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  const loadDashboardData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      
      setError(null);

      // Carregar estatísticas do dashboard
      const [statsResponse, executionsResponse, flowsResponse] = await Promise.all([
        api.get('/flow-builder/inactivity/dashboard-stats'),
        api.get('/flow-builder/inactivity/executions', {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            search: searchTerm,
            status: statusFilter,
            flowId: selectedFlow !== 'all' ? selectedFlow : undefined,
            sortBy,
            sortOrder
          }
        }),
        api.get('/flow-builder/flows/list') // Lista simplificada de fluxos
      ]);

      if (statsResponse.data) {
        setDashboardStats(statsResponse.data);
      }

      if (executionsResponse.data) {
        setExecutions(executionsResponse.data.executions || []);
      }

      if (flowsResponse.data && Array.isArray(flowsResponse.data)) {
        setFlows(flowsResponse.data);
      }

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Não foi possível carregar os dados do dashboard.');
      toast.error('Erro ao carregar dados de inatividade.');
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, selectedFlow, sortBy, sortOrder]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    loadDashboardData();
  }, [page, rowsPerPage, searchTerm, statusFilter, selectedFlow, sortBy, sortOrder]);

  const handleForceEndExecution = async (executionId) => {
    try {
      await api.post(`/flow-builder/execution/${executionId}/force-end`);
      toast.success('Execução encerrada com sucesso!');
      loadDashboardData();
    } catch (err) {
      console.error('Erro ao encerrar execução:', err);
      toast.error('Erro ao encerrar execução.');
    }
  };

  const handleReengageExecution = async (executionId) => {
    try {
      await api.post(`/flow-builder/execution/${executionId}/reengage`);
      toast.success('Tentativa de reengajamento enviada!');
      loadDashboardData();
    } catch (err) {
      console.error('Erro ao reengajar execução:', err);
      toast.error('Erro ao tentar reengajar.');
    }
  };

  const handleCleanupInactive = async () => {
    try {
      setLoading(true);
      const response = await api.post('/flow-builder/inactivity/cleanup-all');
      toast.success(`${response.data.cleaned || 0} execuções inativas foram limpas.`);
      loadDashboardData();
    } catch (err) {
      console.error('Erro ao limpar execuções inativas:', err);
      toast.error('Erro ao limpar execuções inativas.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'inactive': return theme.palette.error.main;
      case 'ended': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'warning': return 'Aviso enviado';
      case 'inactive': return 'Inativo';
      case 'ended': return 'Encerrado';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon fontSize="small" />;
      case 'warning': return <WarningIcon fontSize="small" />;
      case 'inactive': return <ErrorIcon fontSize="small" />;
      case 'ended': return <StopIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = !searchTerm || 
      execution.contact?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      execution.contact?.number?.includes(searchTerm) ||
      execution.flow?.name?.toLowerCase()?.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    const matchesFlow = selectedFlow === 'all' || execution.flowId === selectedFlow;
    
    return matchesSearch && matchesStatus && matchesFlow;
  });

  if (loading && !refreshing) {
    return (
      <MainContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InactivityIcon />
            Monitor de Inatividade
            {refreshing && (
              <Badge color="primary" variant="dot">
                <RefreshIcon
                  sx={{
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
              </Badge>
            )}
          </Box>
        </Title>
        <MainHeaderButtonsWrapper>
          <Tooltip title="Atualizar dados">
            <IconButton
              onClick={() => loadDashboardData()}
              disabled={loading || refreshing}
              size={isMobile ? "small" : "medium"}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filtros">
            <IconButton
              onClick={() => setFilterDialogOpen(true)}
              size={isMobile ? "small" : "medium"}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Cards de estatísticas */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Execuções Ativas
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {dashboardStats.totalActiveExecutions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <PeopleIcon color="primary" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Inativas
                  </Typography>
                  <Typography variant="h4" color="error">
                    {dashboardStats.inactiveExecutions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                  <InactivityIcon color="error" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Com Aviso
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {dashboardStats.warningExecutions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <WarningIcon color="warning" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Taxa de Reengajamento
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {dashboardStats.reengagementRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  {dashboardStats.reengagementRate > 50 ? 
                    <TrendingUpIcon color="success" /> : 
                    <TrendingDownIcon color="error" />
                  }
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de execuções */}
      <Paper sx={{ m: 2, borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Execuções Monitoradas ({filteredExecutions.length})
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ width: isMobile ? 120 : 200 }}
              />
              
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={handleCleanupInactive}
                disabled={loading}
                startIcon={<DeleteIcon />}
              >
                {isMobile ? 'Limpar' : 'Limpar Inativas'}
              </Button>
            </Box>
          </Box>

          {/* Progresso de atualização */}
          {refreshing && (
            <LinearProgress sx={{ mb: 1 }} />
          )}
        </Box>

        <TableContainer>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Contato</TableCell>
                {!isMobile && <TableCell>Fluxo</TableCell>}
                <TableCell>Status</TableCell>
                {!isMobile && <TableCell>Última Atividade</TableCell>}
                <TableCell>Duração</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExecutions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((execution) => (
                <TableRow key={execution.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: getStatusColor(execution.status),
                          fontSize: '0.8rem'
                        }}
                      >
                        {execution.contact?.name?.charAt(0)?.toUpperCase() || 
                         execution.contact?.number?.slice(-2) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {execution.contact?.name || execution.contact?.number || 'Desconhecido'}
                        </Typography>
                        {execution.contact?.name && (
                          <Typography variant="caption" color="text.secondary">
                            {execution.contact.number}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {!isMobile && (
                    <TableCell>
                      <Typography variant="body2">
                        {execution.flow?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nó: {execution.currentNode?.label || execution.currentNode?.id || 'N/A'}
                      </Typography>
                    </TableCell>
                  )}

                  <TableCell>
                    <Chip
                      size="small"
                      icon={getStatusIcon(execution.status)}
                      label={getStatusText(execution.status)}
                      sx={{
                        bgcolor: alpha(getStatusColor(execution.status), 0.1),
                        color: getStatusColor(execution.status),
                        borderColor: getStatusColor(execution.status)
                      }}
                      variant="outlined"
                    />
                  </TableCell>

                  {!isMobile && (
                    <TableCell>
                      <Typography variant="body2">
                        {execution.lastActivity 
                          ? new Date(execution.lastActivity).toLocaleString()
                          : 'N/A'}
                      </Typography>
                    </TableCell>
                  )}

                  <TableCell>
                    <Typography variant="body2">
                      {execution.durationMinutes 
                        ? formatDuration(execution.durationMinutes)
                        : 'N/A'}
                    </Typography>
                    {execution.warningsSent > 0 && (
                      <Chip
                        size="small"
                        label={`${execution.warningsSent} avisos`}
                        color="warning"
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver detalhes">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedExecution(execution);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {execution.status === 'inactive' && (
                        <Tooltip title="Tentar reengajar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleReengageExecution(execution.id)}
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Encerrar execução">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleForceEndExecution(execution.id)}
                        >
                          <StopIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {filteredExecutions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma execução encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredExecutions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
        />
      </Paper>

      {/* Dialog de filtros */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filtros
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="warning">Com Aviso</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
                <MenuItem value="ended">Encerrado</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Fluxo</InputLabel>
              <Select
                value={selectedFlow}
                onChange={(e) => setSelectedFlow(e.target.value)}
                label="Fluxo"
              >
                <MenuItem value="all">Todos os Fluxos</MenuItem>
                {flows.map((flow) => (
                  <MenuItem key={flow.id} value={flow.id}>
                    {flow.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="lastActivity">Última Atividade</MenuItem>
                <MenuItem value="startedAt">Data de Início</MenuItem>
                <MenuItem value="durationMinutes">Duração</MenuItem>
                <MenuItem value="warningsSent">Número de Avisos</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Ordem</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Ordem"
              >
                <MenuItem value="desc">Decrescente</MenuItem>
                <MenuItem value="asc">Crescente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>
            Fechar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setFilterDialogOpen(false);
              setPage(0); // Reset para primeira página
            }}
          >
            Aplicar Filtros
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalhes da execução */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon />
              Detalhes da Execução
            </Box>
            <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedExecution && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Informações do Contato
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nome:</strong> {selectedExecution.contact?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Número:</strong> {selectedExecution.contact?.number || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedExecution.contact?.email || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Informações da Execução
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fluxo:</strong> {selectedExecution.flow?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nó Atual:</strong> {selectedExecution.currentNode?.label || selectedExecution.currentNode?.id || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong>{' '}
                    <Chip
                      size="small"
                      label={getStatusText(selectedExecution.status)}
                      color={selectedExecution.status === 'active' ? 'success' : 
                             selectedExecution.status === 'warning' ? 'warning' : 'error'}
                    />
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Informações de Tempo
                  </Typography>
                  <Typography variant="body2">
                    <strong>Iniciado em:</strong> {new Date(selectedExecution.startedAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Última Atividade:</strong>{' '}
                    {selectedExecution.lastActivity 
                      ? new Date(selectedExecution.lastActivity).toLocaleString()
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Duração Total:</strong>{' '}
                    {selectedExecution.durationMinutes 
                      ? formatDuration(selectedExecution.durationMinutes)
                      : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Informações de Inatividade
                  </Typography>
                  <Typography variant="body2">
                    <strong>Avisos Enviados:</strong> {selectedExecution.warningsSent || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tempo Inativo:</strong>{' '}
                    {selectedExecution.inactiveMinutes 
                      ? formatDuration(selectedExecution.inactiveMinutes)
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tentativas de Reengajamento:</strong> {selectedExecution.reengagementAttempts || 0}
                  </Typography>
                </Grid>

                {selectedExecution.variables && Object.keys(selectedExecution.variables).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Variáveis do Fluxo
                    </Typography>
                    <Box sx={{ 
                      bgcolor: 'background.default', 
                      p: 1, 
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto'
                    }}>
                      <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                        {JSON.stringify(selectedExecution.variables, null, 2)}
                      </pre>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Fechar
          </Button>
          {selectedExecution?.status === 'inactive' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={() => {
                handleReengageExecution(selectedExecution.id);
                setDetailDialogOpen(false);
              }}
            >
              Tentar Reengajar
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={() => {
              handleForceEndExecution(selectedExecution.id);
              setDetailDialogOpen(false);
            }}
          >
            Encerrar Execução
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB para dispositivos móveis */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => loadDashboardData()}
        >
          <RefreshIcon />
        </Fab>
      )}
    </MainContainer>
  );
};

export default InactivityMonitorDashboard;