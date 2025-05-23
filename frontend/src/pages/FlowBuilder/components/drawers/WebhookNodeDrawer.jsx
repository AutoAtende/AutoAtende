import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  InputAdornment,
  Tooltip,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  PlayArrow as TestIcon
} from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';
import api from '../../../../services/api';
import { toast } from '../../../../helpers/toast';

const WebhookNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [headers, setHeaders] = useState(nodeData.headers || {});
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Carregar dados do webhook ao montar o componente
  useEffect(() => {
    if (nodeData.nodeId) {
      loadWebhookData();
    }
  }, [nodeData.nodeId]);
  
  const loadWebhookData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/flow-builder/nodes/webhook/${nodeData.nodeId}`);
      if (data) {
        onChange({
          ...nodeData,
          ...data,
          headers: data.headers || {}
        });
        setHeaders(data.headers || {});
      }
    } catch (error) {
      console.error('Erro ao carregar dados do webhook:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const validateUrl = (url) => {
    if (!url) return "URL é obrigatória";
    try {
      new URL(url);
      return null;
    } catch (e) {
      return "URL inválida";
    }
  };
  
  const handleMethodChange = (e) => {
    onChange({
      ...nodeData,
      method: e.target.value
    });
  };
  
  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    
    const updatedHeaders = {
      ...headers,
      [newHeaderKey]: newHeaderValue
    };
    
    setHeaders(updatedHeaders);
    onChange({
      ...nodeData,
      headers: updatedHeaders
    });
    
    setNewHeaderKey('');
    setNewHeaderValue('');
  };
  
  const handleRemoveHeader = (key) => {
    const updatedHeaders = { ...headers };
    delete updatedHeaders[key];
    
    setHeaders(updatedHeaders);
    onChange({
      ...nodeData,
      headers: updatedHeaders
    });
  };
  
  const handleGenerateSecretKey = () => {
    const secretKey = Array(32)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('');
    
    onChange({
      ...nodeData,
      secretKey
    });
  };
  
  const handleUrlChange = (e) => {
    const url = e.target.value;
    const urlError = validateUrl(url);
    
    setValidationErrors({
      ...validationErrors,
      url: urlError
    });
    
    onChange({
      ...nodeData,
      url
    });
  };
  
  const handleTestWebhook = async () => {
    // Validar URL antes de testar
    const urlError = validateUrl(nodeData.url);
    if (urlError) {
      setTestResult({
        success: false,
        message: urlError
      });
      return;
    }
    
    setTestLoading(true);
    setTestResult(null);
    
    try {
      // Preparar body de teste
      const testBody = nodeData.method !== 'GET' ? JSON.stringify({
        test: true,
        timestamp: new Date().toISOString()
      }) : undefined;
      
      // Usar o endpoint correto do backend
      const { data } = await api.get('/flow-builder/nodes/webhook/test', {
        params: {
          url: nodeData.url,
          method: nodeData.method || 'GET',
          headers: Object.keys(headers).length > 0 ? JSON.stringify(headers) : undefined,
          body: testBody
        }
      });
      
      setTestResult({
        success: data.success,
        status: data.status,
        data: data.data
      });
    } catch (error) {
      console.error('Erro no teste do webhook:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || error.message || 'Erro ao testar webhook',
        error: error.message
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      if (!validateUrl(nodeData.url)) {
        return;
      }
      
      const { data } = await api.post(`/flow-builder/nodes/webhook/${nodeData.nodeId}`, {
        ...nodeData,
        headers,
        nodeId: nodeData.nodeId
      });
      
      toast.success('Configurações do webhook salvas com sucesso!');
      onChange(data);
    } catch (error) {
      console.error('Erro ao salvar webhook:', error);
      toast.error('Erro ao salvar configurações do webhook');
    }
  };
  
  const isFormValid = () => {
    return !validateUrl(nodeData.url);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Método HTTP</InputLabel>
        <Select
          value={nodeData.method || 'GET'}
          onChange={handleMethodChange}
          label="Método HTTP"
          InputLabelProps={{
            shrink: true,
          }}
        >
          <MenuItem value="GET">GET</MenuItem>
          <MenuItem value="POST">POST</MenuItem>
          <MenuItem value="PUT">PUT</MenuItem>
          <MenuItem value="PATCH">PATCH</MenuItem>
          <MenuItem value="DELETE">DELETE</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="URL"
        value={nodeData.url || ''}
        onChange={handleUrlChange}
        margin="normal"
        placeholder="https://exemplo.com/api/webhook"
        required
        error={!!validationErrors.url}
        helperText={validationErrors.url || ""}
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <TextField
        fullWidth
        label="Nome da variável para resposta"
        value={nodeData.variableName || ''}
        onChange={(e) => onChange({ ...nodeData, variableName: e.target.value })}
        margin="normal"
        placeholder="resposta_webhook"
        helperText="Nome da variável onde o resultado do webhook será armazenado (opcional)"
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          type="number"
          label="Timeout (ms)"
          value={nodeData.timeout || 10000}
          onChange={(e) => onChange({ ...nodeData, timeout: parseInt(e.target.value) || 10000 })}
          InputProps={{
            inputProps: { min: 1000, max: 60000 }
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          type="number"
          label="Tentativas"
          value={nodeData.retries || 3}
          onChange={(e) => onChange({ ...nodeData, retries: parseInt(e.target.value) || 3 })}
          InputProps={{
            inputProps: { min: 1, max: 10 }
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ flex: 1 }}
        />
      </Box>
      
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Headers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <TextField
              label="Nome"
              size="small"
              value={newHeaderKey}
              onChange={(e) => setNewHeaderKey(e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Valor"
              size="small"
              value={newHeaderValue}
              onChange={(e) => setNewHeaderValue(e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleAddHeader}
              disabled={!newHeaderKey.trim()}
            >
              <AddIcon />
            </Button>
          </Box>
          
          {Object.keys(headers).length > 0 ? (
            <Box sx={{ mb: 2 }}>
              {Object.entries(headers).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold' }}>
                    {key}:
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 2, fontSize: '0.875rem' }}>
                    {value}
                  </Typography>
                  <IconButton size="small" onClick={() => handleRemoveHeader(key)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nenhum header personalizado configurado
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
      
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon fontSize="small" color="action" />
            <Typography>Segurança</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Chave Secreta (HMAC)"
            value={nodeData.secretKey || ''}
            onChange={(e) => onChange({ ...nodeData, secretKey: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Gerar chave aleatória">
                    <IconButton onClick={handleGenerateSecretKey}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Usada para assinar requisições (HMAC SHA-256)"
          />
        </AccordionDetails>
      </Accordion>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2">Testar Webhook</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={testLoading ? <CircularProgress size={16} /> : <TestIcon />}
          onClick={handleTestWebhook}
          disabled={testLoading || !isFormValid()}
        >
          {testLoading ? 'Testando...' : 'Testar'}
        </Button>
      </Box>
      
      {testResult && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            bgcolor: testResult.success ? 'success.light' : 'error.light',
            color: testResult.success ? 'success.contrastText' : 'error.contrastText',
            mb: 2,
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {testResult.success 
              ? `Sucesso! Status: ${testResult.status}` 
              : `Erro: ${testResult.message}`}
          </Typography>
          
          {testResult.data && (
            <Box 
              sx={{ 
                p: 1, 
                bgcolor: 'rgba(0,0,0,0.1)', 
                borderRadius: 1, 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                overflowX: 'auto'
              }}
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </Box>
          )}
        </Paper>
      )}
      
      {!isFormValid() && (
        <Alert severity="warning" sx={{ my: 2 }}>
          Por favor, corrija os erros no formulário antes de salvar.
        </Alert>
      )}
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSave}
        disabled={!isFormValid()}
        sx={{ mt: 2, mb: 1 }}
      >
        Salvar Configurações
      </Button>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Este nó realiza uma chamada HTTP para um endpoint externo, podendo enviar e receber dados.
          A resposta do webhook pode ser armazenada em uma variável para uso posterior no fluxo.
        </Typography>
      </Box>
    </Box>
  );
};

export default WebhookNodeDrawer;