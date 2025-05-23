import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Slider,
  Tabs,
  Tab,
  Paper,
  Chip,
  Grid,
  Autocomplete,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  HourglassEmpty as InactivityIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  CleaningServices as CleanupIcon,
  Timer as TimerIcon,
  Notifications as NotificationIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { AuthContext } from '../../contexts/Auth/AuthContext';
import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { i18n } from '../../translate/i18n';

// Componente de TabPanel
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inactivity-tabpanel-${index}`}
      aria-labelledby={`inactivity-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const InactivitySettingsModal = ({ open, onClose, flowId }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [queues, setQueues] = useState([]);

  // Estados para configurações globais
  const [globalSettings, setGlobalSettings] = useState({
    enabled: true,
    defaultTimeoutMinutes: 5,
    defaultWarningTimeoutMinutes: 3,
    defaultMaxWarnings: 2,
    defaultAction: 'warning',
    defaultWarningMessage: 'Você ainda está aí? Por favor, responda para continuar.',
    defaultEndMessage: 'Conversa encerrada por inatividade.',
    defaultReengageMessage: 'Vamos tentar novamente! Como posso ajudá-lo?',
    defaultTransferMessage: 'Transferindo você para um atendente devido à inatividade.',
    cleanupInactiveAfterHours: 24,
    enableAutoCleanup: true,
    trackInactivityMetrics: true
  });

  // Estados para monitoramento
  const [activeExecutions, setActiveExecutions] = useState([]);
  const [inactivityStats, setInactivityStats] = useState({
    totalExecutions: 0,
    inactiveExecutions: 0,
    reengagedExecutions: 0,
    transferredExecutions: 0,
    endedExecutions: 0
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open, flowId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar configurações globais
      const settingsResponse = await api.get(`/flow-builder/${flowId}/inactivity/settings`);
      if (settingsResponse.data) {
        setGlobalSettings(prev => ({
          ...prev,
          ...settingsResponse.data
        }));
      }

      // Carregar filas
      const queuesResponse = await api.get('/queue');
      if (queuesResponse.data && Array.isArray(queuesResponse.data)) {
        setQueues(queuesResponse.data);
      }

      // Carregar execuções ativas
      if (tabValue === 1) {
        await loadActiveExecutions();
      }

      // Carregar estatísticas
      if (tabValue === 2) {
        await loadInactivityStats();
      }

    } catch (err) {
      console.error('Erro ao carregar dados de inatividade:', err);
      setError('Não foi possível carregar as configurações de inatividade.');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveExecutions = async () => {
    try {
      const response = await api.get(`/flow-builder/${flowId}/inactivity/active-executions`);
      if (response.data && Array.isArray(response.data)) {
        setActiveExecutions(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar execuções ativas:', err);
    }
  };

  const loadInactivityStats = async () => {
    try {
      const response = await api.get(`/flow-builder/${flowId}/inactivity/stats`);
      if (response.data) {
        setInactivityStats(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Carregar dados específicos da aba
    if (newValue === 1) {
      loadActiveExecutions();
    } else if (newValue === 2) {
      loadInactivityStats();
    }
  };

  const handleSettingChange = (field, value) => {
    setGlobalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      await api.put(`/flow-builder/${flowId}/inactivity/settings`, globalSettings);
      
      toast.success('Configurações de inatividade salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      toast.error('Erro ao salvar configurações de inatividade.');
    } finally {
      setSaving(false);
    }
  };

  const handleCleanupInactive = async () => {
    try {
      setLoading(true);
      
      const response = await api.post(`/flow-builder/${flowId}/inactivity/cleanup`);
      
      toast.success(`${response.data.cleaned || 0} execuções inativas foram limpas.`);
      
      // Recarregar dados
      await loadActiveExecutions();
      await loadInactivityStats();
      
    } catch (err) {
      console.error('Erro ao limpar execuções inativas:', err);
      toast.error('Erro ao limpar execuções inativas.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceEndExecution = async (executionId) => {
    try {
      await api.post(`/flow-builder/execution/${executionId}/force-end`);
      
      toast.success('Execução encerrada com sucesso!');
      
      // Recarregar execuções ativas
      await loadActiveExecutions();
      
    } catch (err) {
      console.error('Erro ao encerrar execução:', err);
      toast.error('Erro ao encerrar execução.');
    }
  };

  const getInactivityStatusColor = (status) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'inactive': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getInactivityStatusText = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'warning': return 'Aviso enviado';
      case 'inactive': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.primary.main, 0.05)
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InactivityIcon color="primary" />
          <Typography variant="h6">
            Configurações de Inatividade
          </Typography>
        </Box>
        
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab 
            icon={<SettingsIcon />} 
            label="Configurações" 
            id="inactivity-tab-0" 
            aria-controls="inactivity-tabpanel-0" 
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Monitoramento" 
            id="inactivity-tab-1" 
            aria-controls="inactivity-tabpanel-1" 
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Estatísticas" 
            id="inactivity-tab-2" 
            aria-controls="inactivity-tabpanel-2" 
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
        {/* Aba de Configurações */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {/* Configuração geral */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Configuração Geral
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={globalSettings.enabled}
                      onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Habilitar detecção de inatividade neste fluxo"
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={globalSettings.trackInactivityMetrics}
                      onChange={(e) => handleSettingChange('trackInactivityMetrics', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Rastrear métricas de inatividade"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Timeouts padrão */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  <TimerIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Timeouts Padrão
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    Timeout principal: {globalSettings.defaultTimeoutMinutes} minuto(s)
                  </Typography>
                  <Slider
                    value={globalSettings.defaultTimeoutMinutes}
                    onChange={(e, value) => handleSettingChange('defaultTimeoutMinutes', value)}
                    min={1}
                    max={60}
                    marks={[
                      { value: 1, label: '1m' },
                      { value: 5, label: '5m' },
                      { value: 10, label: '10m' },
                      { value: 30, label: '30m' },
                      { value: 60, label: '60m' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    Timeout de aviso: {globalSettings.defaultWarningTimeoutMinutes} minuto(s)
                  </Typography>
                  <Slider
                    value={globalSettings.defaultWarningTimeoutMinutes}
                    onChange={(e, value) => handleSettingChange('defaultWarningTimeoutMinutes', value)}
                    min={1}
                    max={globalSettings.defaultTimeoutMinutes - 1}
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    Máximo de avisos: {globalSettings.defaultMaxWarnings}
                  </Typography>
                  <Slider
                    value={globalSettings.defaultMaxWarnings}
                    onChange={(e, value) => handleSettingChange('defaultMaxWarnings', value)}
                    min={1}
                    max={5}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Mensagens padrão */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  <NotificationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Mensagens Padrão
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Mensagem de aviso"
                  value={globalSettings.defaultWarningMessage}
                  onChange={(e) => handleSettingChange('defaultWarningMessage', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Mensagem de encerramento"
                  value={globalSettings.defaultEndMessage}
                  onChange={(e) => handleSettingChange('defaultEndMessage', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Mensagem de reengajamento"
                  value={globalSettings.defaultReengageMessage}
                  onChange={(e) => handleSettingChange('defaultReengageMessage', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Mensagem de transferência"
                  value={globalSettings.defaultTransferMessage}
                  onChange={(e) => handleSettingChange('defaultTransferMessage', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Limpeza automática */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  <CleanupIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Limpeza Automática
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={globalSettings.enableAutoCleanup}
                      onChange={(e) => handleSettingChange('enableAutoCleanup', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Habilitar limpeza automática de execuções inativas"
                  sx={{ mb: 2 }}
                />

                {globalSettings.enableAutoCleanup && (
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>
                      Limpar após: {globalSettings.cleanupInactiveAfterHours} hora(s)
                    </Typography>
                    <Slider
                      value={globalSettings.cleanupInactiveAfterHours}
                      onChange={(e, value) => handleSettingChange('cleanupInactiveAfterHours', value)}
                      min={1}
                      max={168}
                      marks={[
                        { value: 1, label: '1h' },
                        { value: 24, label: '1d' },
                        { value: 72, label: '3d' },
                        { value: 168, label: '7d' }
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </TabPanel>

        {/* Aba de Monitoramento */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Execuções Ativas ({activeExecutions.length})
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadActiveExecutions}
                disabled={loading}
              >
                Atualizar
              </Button>
              
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<CleanupIcon />}
                onClick={handleCleanupInactive}
                disabled={loading}
              >
                Limpar Inativas
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : activeExecutions.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhuma execução ativa encontrada.
              </Typography>
            </Paper>
          ) : (
            <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
              {activeExecutions.map((execution) => (
                <ListItem
                  key={execution.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.paper'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {execution.contact?.name || execution.contact?.number || 'Contato'}
                        </Typography>
                        <Chip
                          size="small"
                          label={getInactivityStatusText(execution.inactivityStatus)}
                          sx={{
                            bgcolor: alpha(getInactivityStatusColor(execution.inactivityStatus), 0.1),
                            color: getInactivityStatusColor(execution.inactivityStatus),
                            borderColor: getInactivityStatusColor(execution.inactivityStatus)
                          }}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Iniciado: {new Date(execution.startedAt).toLocaleString()}
                        </Typography>
                        {execution.lastActivity && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Última atividade: {new Date(execution.lastActivity).toLocaleString()}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          Nó atual: {execution.currentNode?.label || execution.currentNode?.id || 'N/A'}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title="Encerrar execução">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleForceEndExecution(execution.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Aba de Estatísticas */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Estatísticas de Inatividade
            </Typography>
            
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadInactivityStats}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Atualizar
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {inactivityStats.totalExecutions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Execuções
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {inactivityStats.inactiveExecutions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Execuções Inativas
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {inactivityStats.reengagedExecutions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reengajadas
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {inactivityStats.transferredExecutions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transferidas
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Taxa de Reengajamento
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" color="success.main">
                      {inactivityStats.totalExecutions > 0 
                        ? ((inactivityStats.reengagedExecutions / inactivityStats.totalExecutions) * 100).toFixed(1)
                        : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      dos usuários foram reengajados com sucesso
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
        
        {tabValue === 0 && (
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SettingsIcon />}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        )}
      </DialogActions>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
    </Dialog>
  );
};

export default InactivitySettingsModal;