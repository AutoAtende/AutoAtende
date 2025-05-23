import React, { useState, useEffect, useContext } from 'react';
import {
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
  Paper,
  Slider,
  Autocomplete,
  CircularProgress,
  Chip,
  Avatar,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  HourglassEmpty as InactivityIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Notifications as NotificationIcon,
  Stop as StopIcon,
  PersonAdd as TransferIcon,
  Refresh as ReengageIcon,
  Help as HelpIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';
import { AuthContext } from '../../../../context/Auth/AuthContext';
import api from '../../../../services/api';
import { toast } from '../../../../helpers/toast';
import { VariablesReferencePanel } from '../VariablesReferencePanel';

const InactivityNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queues, setQueues] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Estados para configurações de inatividade
  const [inactivityConfig, setInactivityConfig] = useState({
    timeoutMinutes: nodeData?.inactivityConfig?.timeoutMinutes || 5,
    warningTimeoutMinutes: nodeData?.inactivityConfig?.warningTimeoutMinutes || 3,
    maxWarnings: nodeData?.inactivityConfig?.maxWarnings || 2,
    action: nodeData?.inactivityConfig?.action || 'warning', // warning, end, transfer, reengage
    warningMessage: nodeData?.inactivityConfig?.warningMessage || 'Você ainda está aí? Por favor, responda para continuar.',
    endMessage: nodeData?.inactivityConfig?.endMessage || 'Conversa encerrada por inatividade.',
    reengageMessage: nodeData?.inactivityConfig?.reengageMessage || 'Vamos tentar novamente! Como posso ajudá-lo?',
    transferQueueId: nodeData?.inactivityConfig?.transferQueueId || null,
    transferMessage: nodeData?.inactivityConfig?.transferMessage || 'Transferindo você para um atendente devido à inatividade.',
    enableCustomTimeout: nodeData?.inactivityConfig?.enableCustomTimeout || false,
    useGlobalSettings: nodeData?.inactivityConfig?.useGlobalSettings || true,
    detectInactivityOn: nodeData?.inactivityConfig?.detectInactivityOn || 'all' // all, questions, menus
  });

  // Carregar filas disponíveis
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        setLoading(true);
        const response = await api.get('/queue');
        if (response.data && Array.isArray(response.data)) {
          setQueues(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar filas:", error);
        setError("Não foi possível carregar as filas disponíveis.");
        toast.error("Erro ao carregar filas");
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
  }, []);

  // Validação de dados
  const validateData = () => {
    let errors = {};

    if (inactivityConfig.timeoutMinutes < 1 || inactivityConfig.timeoutMinutes > 60) {
      errors.timeoutMinutes = "Timeout deve estar entre 1 e 60 minutos";
    }

    if (inactivityConfig.warningTimeoutMinutes < 1 || inactivityConfig.warningTimeoutMinutes >= inactivityConfig.timeoutMinutes) {
      errors.warningTimeoutMinutes = "Timeout de aviso deve ser menor que o timeout principal";
    }

    if (inactivityConfig.maxWarnings < 1 || inactivityConfig.maxWarnings > 5) {
      errors.maxWarnings = "Máximo de avisos deve estar entre 1 e 5";
    }

    if (inactivityConfig.action === 'transfer' && !inactivityConfig.transferQueueId) {
      errors.transferQueueId = "Selecione uma fila para transferência";
    }

    if (!inactivityConfig.warningMessage.trim()) {
      errors.warningMessage = "Mensagem de aviso é obrigatória";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Atualizar configuração
  const handleConfigChange = (field, value) => {
    const updatedConfig = {
      ...inactivityConfig,
      [field]: value
    };

    setInactivityConfig(updatedConfig);

    // Atualizar nodeData
    onChange({
      ...nodeData,
      inactivityConfig: updatedConfig
    });

    // Limpar erro específico se existir
    if (validationErrors[field]) {
      const { [field]: removedError, ...restErrors } = validationErrors;
      setValidationErrors(restErrors);
    }
  };

  // Obter fila selecionada
  const selectedQueue = queues.find(q => q.id === inactivityConfig.transferQueueId);

  // Renderizar configuração por ação
  const renderActionConfig = () => {
    switch (inactivityConfig.action) {
      case 'warning':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <NotificationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
              Configurações de Aviso
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Mensagem de Aviso"
              value={inactivityConfig.warningMessage}
              onChange={(e) => handleConfigChange('warningMessage', e.target.value)}
              margin="normal"
              required
              error={!!validationErrors.warningMessage}
              helperText={validationErrors.warningMessage || "Mensagem enviada quando detectada inatividade"}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Máximo de avisos: {inactivityConfig.maxWarnings}
              </Typography>
              <Slider
                value={inactivityConfig.maxWarnings}
                onChange={(e, value) => handleConfigChange('maxWarnings', value)}
                min={1}
                max={5}
                marks
                step={1}
                valueLabelDisplay="auto"
                error={!!validationErrors.maxWarnings}
              />
              {validationErrors.maxWarnings && (
                <Typography variant="caption" color="error">
                  {validationErrors.maxWarnings}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 'end':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <StopIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
              Configurações de Encerramento
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Mensagem de Encerramento"
              value={inactivityConfig.endMessage}
              onChange={(e) => handleConfigChange('endMessage', e.target.value)}
              margin="normal"
              placeholder="Mensagem enviada antes de encerrar por inatividade"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        );

      case 'transfer':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <TransferIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
              Configurações de Transferência
            </Typography>

            <Autocomplete
              fullWidth
              options={queues}
              loading={loading}
              value={selectedQueue || null}
              onChange={(event, newValue) => handleConfigChange('transferQueueId', newValue?.id || null)}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Fila de Destino" 
                  margin="normal"
                  variant="outlined"
                  required
                  error={!!validationErrors.transferQueueId}
                  helperText={validationErrors.transferQueueId || "Fila para onde transferir por inatividade"}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar 
                    sx={{
                      width: 30,
                      height: 30,
                      mr: 1,
                      bgcolor: option.color || '#7c3aed'
                    }}
                    alt={option.name}
                  >
                    {option.name.charAt(0).toUpperCase()}
                  </Avatar>
                  {option.name}
                </Box>
              )}
            />
            
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Mensagem de Transferência"
              value={inactivityConfig.transferMessage}
              onChange={(e) => handleConfigChange('transferMessage', e.target.value)}
              margin="normal"
              placeholder="Mensagem enviada antes da transferência"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        );

      case 'reengage':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <ReengageIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
              Configurações de Reengajamento
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Mensagem de Reengajamento"
              value={inactivityConfig.reengageMessage}
              onChange={(e) => handleConfigChange('reengageMessage', e.target.value)}
              margin="normal"
              placeholder="Mensagem para tentar reengajar o usuário"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    validateData();
  }, [inactivityConfig]);

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
      />

      {/* Alerta explicativo */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          my: 2, 
          backgroundColor: 'info.light', 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1
        }}
      >
        <InfoIcon color="info" sx={{ mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Detecção de Inatividade
          </Typography>
          <Typography variant="body2">
            Este nó monitora a inatividade do usuário e executa ações automáticas quando não há resposta dentro do tempo configurado.
          </Typography>
        </Box>
      </Paper>

      {/* Configurações gerais */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          <TimerIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
          Configurações de Tempo
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={!inactivityConfig.useGlobalSettings}
              onChange={(e) => handleConfigChange('useGlobalSettings', !e.target.checked)}
              color="primary"
            />
          }
          label="Usar configurações personalizadas"
          sx={{ mb: 2 }}
        />

        {!inactivityConfig.useGlobalSettings && (
          <>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Timeout principal: {inactivityConfig.timeoutMinutes} minuto(s)
              </Typography>
              <Slider
                value={inactivityConfig.timeoutMinutes}
                onChange={(e, value) => handleConfigChange('timeoutMinutes', value)}
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
                error={!!validationErrors.timeoutMinutes}
              />
              {validationErrors.timeoutMinutes && (
                <Typography variant="caption" color="error">
                  {validationErrors.timeoutMinutes}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Timeout de aviso: {inactivityConfig.warningTimeoutMinutes} minuto(s)
              </Typography>
              <Slider
                value={inactivityConfig.warningTimeoutMinutes}
                onChange={(e, value) => handleConfigChange('warningTimeoutMinutes', value)}
                min={1}
                max={inactivityConfig.timeoutMinutes - 1}
                step={1}
                valueLabelDisplay="auto"
                error={!!validationErrors.warningTimeoutMinutes}
              />
              <Typography variant="caption" color="text.secondary">
                Tempo antes do timeout principal para enviar avisos
              </Typography>
              {validationErrors.warningTimeoutMinutes && (
                <Typography variant="caption" color="error" display="block">
                  {validationErrors.warningTimeoutMinutes}
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* Detectar inatividade em */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Detectar inatividade em</InputLabel>
          <Select
            value={inactivityConfig.detectInactivityOn}
            onChange={(e) => handleConfigChange('detectInactivityOn', e.target.value)}
            label="Detectar inatividade em"
            InputLabelProps={{
              shrink: true,
            }}
          >
            <MenuItem value="all">Todos os tipos de nós</MenuItem>
            <MenuItem value="questions">Apenas em perguntas</MenuItem>
            <MenuItem value="menus">Apenas em menus</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Ação por inatividade */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Ação por Inatividade
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Ação</InputLabel>
          <Select
            value={inactivityConfig.action}
            onChange={(e) => handleConfigChange('action', e.target.value)}
            label="Ação"
            InputLabelProps={{
              shrink: true,
            }}
          >
            <MenuItem value="warning">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationIcon fontSize="small" sx={{ mr: 1 }} />
                Enviar aviso
              </Box>
            </MenuItem>
            <MenuItem value="end">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StopIcon fontSize="small" sx={{ mr: 1 }} />
                Encerrar conversa
              </Box>
            </MenuItem>
            <MenuItem value="transfer">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TransferIcon fontSize="small" sx={{ mr: 1 }} />
                Transferir para fila
              </Box>
            </MenuItem>
            <MenuItem value="reengage">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReengageIcon fontSize="small" sx={{ mr: 1 }} />
                Tentar reengajar
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {renderActionConfig()}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Por favor, corrija os erros no formulário antes de salvar.
        </Alert>
      )}

      {/* Variáveis disponíveis */}
      {flowVariables && flowVariables.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <VariablesReferencePanel variables={flowVariables} />
        </>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Este nó monitora automaticamente a inatividade durante a execução do fluxo. 
          Quando o usuário não responde dentro do tempo configurado, a ação selecionada será executada.
          As saídas do nó permitem controlar o fluxo após cada ação de inatividade.
        </Typography>
      </Box>
    </Box>
  );
};

export default InactivityNodeDrawer;