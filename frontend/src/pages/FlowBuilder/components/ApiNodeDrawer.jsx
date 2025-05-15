import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ApiOutlined as ApiIcon,
  Code as CodeIcon,
  PlayArrow as TestIcon,
  Key as KeyIcon,
  FilterAlt as FilterIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

// Componente para exibir o conteúdo de acordo com a aba selecionada
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ApiNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [headers, setHeaders] = useState(nodeData.headers || {});
  const [queryParams, setQueryParams] = useState(nodeData.queryParams || {});
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

useEffect(() => {
  const loadApiNodeData = async () => {
    if (nodeData.nodeId) {
      try {
        const { data } = await api.get(`/flow-builder/nodes/api/${nodeData.nodeId}`);
        // Atualizar estado com dados carregados
        setHeaders(data.headers || {});
        setQueryParams(data.queryParams || {});
        onChange(data);
      } catch (error) {
        console.error('Erro ao carregar configurações do nó API:', error);
      }
    }
  };

  loadApiNodeData();
}, [nodeData.nodeId]);
  
  const validateUrl = (url) => {
    if (!url) return i18n.t('flowBuilder.validation.urlRequired');
    try {
      new URL(url);
      return null;
    } catch (e) {
      return i18n.t('flowBuilder.validation.invalidUrl');
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleMethodChange = (e) => {
    onChange({
      ...nodeData,
      method: e.target.value
    });
  };
  
  const handleContentTypeChange = (e) => {
    onChange({
      ...nodeData,
      contentType: e.target.value
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
      url: url
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
  
  const handleAddQueryParam = () => {
    if (!newParamKey.trim()) return;
    
    const updatedParams = {
      ...queryParams,
      [newParamKey]: newParamValue
    };
    
    setQueryParams(updatedParams);
    onChange({
      ...nodeData,
      queryParams: updatedParams
    });
    
    setNewParamKey('');
    setNewParamValue('');
  };
  
  const handleRemoveQueryParam = (key) => {
    const updatedParams = { ...queryParams };
    delete updatedParams[key];
    
    setQueryParams(updatedParams);
    onChange({
      ...nodeData,
      queryParams: updatedParams
    });
  };
  
  const handleTestRequest = async () => {
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
      // Preparar os parâmetros para o teste
      const testParams = {
        url: nodeData.url,
        method: nodeData.method || 'GET',
        headers: JSON.stringify(headers),
        timeout: nodeData.timeout || 10000
      };
      
      // Adicionar body se não for GET
      if (nodeData.method !== 'GET' && nodeData.body) {
        try {
          if (nodeData.contentType === 'application/json') {
            const parsedBody = JSON.parse(nodeData.body);
            testParams.body = JSON.stringify(parsedBody);
          } else {
            testParams.body = nodeData.body;
          }
        } catch (error) {
          // Em caso de erro de parse, usar como texto
          testParams.body = nodeData.body;
        }
      }
      
      // Usar a API do backend para testar
      const { data } = await api.post('/flow-builder/nodes/api/test', {
        params: testParams
      });
      
      setTestResult({
        success: data.success,
        status: data.status,
        statusText: data.statusText || '',
        data: data.data,
        headers: data.headers
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response 
          ? `Erro ${error.response.status}: ${error.response.statusText}`
          : `Erro: ${error.message || 'Erro desconhecido'}`,
        data: error.response ? error.response.data : null
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const generateUrlWithParams = () => {
    if (!nodeData.url) return '';
    
    let url = nodeData.url;
    
    if (Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, value);
      });
      url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    }
    
    return url;
  };
  
  const isFormValid = () => {
    return !validateUrl(nodeData.url);
  };
  
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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Básico" id="api-tab-0" aria-controls="api-tabpanel-0" />
          <Tab label="Headers" id="api-tab-1" aria-controls="api-tabpanel-1" />
          <Tab label="Corpo (Body)" id="api-tab-2" aria-controls="api-tabpanel-2" />
          <Tab label="Parâmetros" id="api-tab-3" aria-controls="api-tabpanel-3" />
          <Tab label="Avançado" id="api-tab-4" aria-controls="api-tabpanel-4" />
          <Tab label="Testes" id="api-tab-5" aria-controls="api-tabpanel-5" />
        </Tabs>
      </Box>
      
      {/* Aba Básico */}
      <TabPanel value={tabValue} index={0}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Método HTTP</InputLabel>
          <Select
            value={nodeData.method || 'GET'}
            onChange={handleMethodChange}
            label="Método HTTP"
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
            <MenuItem value="HEAD">HEAD</MenuItem>
            <MenuItem value="OPTIONS">OPTIONS</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="URL"
          value={nodeData.url || ''}
          onChange={handleUrlChange}
          margin="normal"
          placeholder="https://exemplo.com/api/recurso"
          required
          error={!!validationErrors.url}
          helperText={validationErrors.url || (Object.keys(queryParams).length > 0 ? `URL final: ${generateUrlWithParams()}` : '')}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <TextField
          fullWidth
          label="Nome da variável para resposta"
          value={nodeData.responseVariable || ''}
          onChange={(e) => onChange({ ...nodeData, responseVariable: e.target.value })}
          margin="normal"
          placeholder="resposta_api"
          helperText="Nome da variável onde a resposta da API será armazenada para uso posterior"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </TabPanel>
      
      {/* Aba Headers */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <TextField
            label="Nome"
            size="small"
            value={newHeaderKey}
            onChange={(e) => setNewHeaderKey(e.target.value)}
            sx={{ flex: 1 }}
            placeholder="Authorization"
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
            placeholder="Bearer token123"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleAddHeader}
            disabled={!newHeaderKey.trim()}
            size="small"
          >
            <AddIcon />
          </Button>
        </Box>
        
        {Object.keys(headers).length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {Object.entries(headers).map(([key, value]) => (
              <Box key={key} sx={{
                display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
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
        
        <Divider sx={{ my: 2 }} />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Content-Type</InputLabel>
          <Select
            value={nodeData.contentType || 'application/json'}
            onChange={handleContentTypeChange}
            label="Content-Type"
          >
            <MenuItem value="application/json">application/json</MenuItem>
            <MenuItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</MenuItem>
            <MenuItem value="multipart/form-data">multipart/form-data</MenuItem>
            <MenuItem value="text/plain">text/plain</MenuItem>
            <MenuItem value="text/html">text/html</MenuItem>
            <MenuItem value="application/xml">application/xml</MenuItem>
          </Select>
        </FormControl>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Nota: O header Content-Type definido aqui será enviado automaticamente com a requisição.
        </Typography>
      </TabPanel>
      
      {/* Aba Corpo (Body) */}
      <TabPanel value={tabValue} index={2}>
        {nodeData.method === 'GET' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Requisições GET não possuem corpo (body).
          </Alert>
        ) : (
          <>
            <TextField
              fullWidth
              label="Corpo da Requisição"
              multiline
              rows={10}
              value={nodeData.body || ''}
              onChange={(e) => onChange({ ...nodeData, body: e.target.value })}
              margin="normal"
              placeholder={nodeData.contentType === 'application/json' ? '{\n  "chave": "valor"\n}' : 'chave=valor&outra=valor2'}
              InputProps={{
                style: { fontFamily: 'monospace', fontSize: '0.9rem' }
              }}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {nodeData.contentType === 'application/json' 
                ? 'Informe um objeto JSON válido.' 
                : 'Informe o corpo da requisição no formato adequado para o Content-Type selecionado.'}
            </Typography>
            
            {nodeData.contentType === 'application/json' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={nodeData.parseVariables || false}
                    onChange={(e) => onChange({ ...nodeData, parseVariables: e.target.checked })}
                    color="primary"
                  />
                }
                label="Substituir variáveis no corpo (${variavel})"
                sx={{ mt: 2 }}
              />
            )}
          </>
        )}
      </TabPanel>
      
      {/* Aba Parâmetros de Query */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <TextField
            label="Nome"
            size="small"
            value={newParamKey}
            onChange={(e) => setNewParamKey(e.target.value)}
            sx={{ flex: 1 }}
            placeholder="page"
          />
          <TextField
            label="Valor"
            size="small"
            value={newParamValue}
            onChange={(e) => setNewParamValue(e.target.value)}
            sx={{ flex: 1 }}
            placeholder="1"
          />
          <Button 
            variant="contained" 
            onClick={handleAddQueryParam}
            disabled={!newParamKey.trim()}
            size="small"
          >
            <AddIcon />
          </Button>
        </Box>
        
        {Object.keys(queryParams).length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {Object.entries(queryParams).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold' }}>
                  {key}:
                </Typography>
                <Typography variant="body2" sx={{ flex: 2, fontSize: '0.875rem' }}>
                  {value}
                </Typography>
                <IconButton size="small" onClick={() => handleRemoveQueryParam(key)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nenhum parâmetro de query configurado
          </Typography>
        )}
        
        <FormControlLabel
          control={
            <Switch
              checked={nodeData.paramsFromVariables || false}
              onChange={(e) => onChange({ ...nodeData, paramsFromVariables: e.target.checked })}
              color="primary"
            />
          }
          label="Permitir adicionar parâmetros a partir de variáveis"
          sx={{ mt: 2 }}
        />
        
        {nodeData.paramsFromVariables && (
          <TextField
            fullWidth
            label="Variável com parâmetros adicionais"
            value={nodeData.paramsVariable || ''}
            onChange={(e) => onChange({ ...nodeData, paramsVariable: e.target.value })}
            margin="normal"
            placeholder="query_params"
            helperText="Nome da variável que contém um objeto com parâmetros adicionais"
          />
        )}
      </TabPanel>
      
      {/* Aba Avançado */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Timeout e Retry
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="number"
              label="Timeout (ms)"
              value={nodeData.timeout || 10000}
              onChange={(e) => onChange({ ...nodeData, timeout: parseInt(e.target.value) || 10000 })}
              InputProps={{
                inputProps: { min: 1000, max: 60000 }
              }}
              sx={{ flex: 1 }}
            />
            <TextField
              type="number"
              label="Tentativas"
              value={nodeData.retries || 1}
              onChange={(e) => onChange({ ...nodeData, retries: parseInt(e.target.value) || 1 })}
              InputProps={{
                inputProps: { min: 1, max: 5 }
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <FilterIcon sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
            Filtragem de Resposta
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={nodeData.useResponseFilter || false}
                onChange={(e) => onChange({ ...nodeData, useResponseFilter: e.target.checked })}
                color="primary"
              />
            }
            label="Filtrar dados da resposta"
            sx={{ mb: 2 }}
          />
          
          {nodeData.useResponseFilter && (
            <TextField
              fullWidth
              label="Caminho do JSON (JSONPath)"
              value={nodeData.responseFilterPath || ''}
              onChange={(e) => onChange({ ...nodeData, responseFilterPath: e.target.value })}
              margin="normal"
              placeholder="$.data.items[0].id"
              helperText="Extrair apenas um valor específico da resposta (ex: $.data.items)"
            />
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <KeyIcon sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
            Autenticação
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Autenticação</InputLabel>
            <Select
              value={nodeData.authType || 'none'}
              onChange={(e) => onChange({ ...nodeData, authType: e.target.value })}
              label="Tipo de Autenticação"
            >
              <MenuItem value="none">Nenhuma</MenuItem>
              <MenuItem value="basic">Basic Auth</MenuItem>
              <MenuItem value="bearer">Bearer Token</MenuItem>
              <MenuItem value="apiKey">API Key</MenuItem>
            </Select>
          </FormControl>
          
          {nodeData.authType === 'basic' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Usuário"
                value={nodeData.authUser || ''}
                onChange={(e) => onChange({ ...nodeData, authUser: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={nodeData.authPassword || ''}
                onChange={(e) => onChange({ ...nodeData, authPassword: e.target.value })}
                margin="normal"
              />
            </Box>
          )}
          
          {nodeData.authType === 'bearer' && (
            <TextField
              fullWidth
              label="Token"
              value={nodeData.authToken || ''}
              onChange={(e) => onChange({ ...nodeData, authToken: e.target.value })}
              margin="normal"
              placeholder="seu_token_aqui"
            />
          )}
          
          {nodeData.authType === 'apiKey' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nome da API Key"
                value={nodeData.apiKeyName || ''}
                onChange={(e) => onChange({ ...nodeData, apiKeyName: e.target.value })}
                margin="normal"
                placeholder="X-API-KEY"
              />
              <TextField
                fullWidth
                label="Valor da API Key"
                value={nodeData.apiKeyValue || ''}
                onChange={(e) => onChange({ ...nodeData, apiKeyValue: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Enviar em</InputLabel>
                <Select
                  value={nodeData.apiKeyIn || 'header'}
                  onChange={(e) => onChange({ ...nodeData, apiKeyIn: e.target.value })}
                  label="Enviar em"
                >
                  <MenuItem value="header">Header</MenuItem>
                  <MenuItem value="query">Query Parameter</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </TabPanel>
      
      {/* Aba Testes */}
      <TabPanel value={tabValue} index={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2">Testar Requisição</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={testLoading ? <CircularProgress size={16} /> : <TestIcon />}
            onClick={handleTestRequest}
            disabled={testLoading || !nodeData.url}
          >
            {testLoading ? 'Executando...' : 'Testar'}
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
                ? `Sucesso! Status: ${testResult.status} ${testResult.statusText}` 
                : `Erro: ${testResult.message}`}
            </Typography>
            
            {(testResult.data || testResult.headers) && (
              <Box>
                <Accordion sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'text.primary' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Resultado da Requisição</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box 
                      sx={{ 
                        p: 1, 
                        bgcolor: 'background.default', 
                        borderRadius: 1, 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem',
                        maxHeight: '300px',
                        overflow: 'auto'
                      }}
                    >
                      <pre style={{ margin: 0 }}>
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </Paper>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          <CodeIcon sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
          Mapeamento de Resposta
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configurações para determinar o fluxo com base na resposta da API
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Condição de Sucesso</InputLabel>
          <Select
            value={nodeData.successCondition || 'statusCode'}
            onChange={(e) => onChange({ ...nodeData, successCondition: e.target.value })}
            label="Condição de Sucesso"
          >
            <MenuItem value="statusCode">Status Code 2xx</MenuItem>
            <MenuItem value="custom">Expressão Personalizada</MenuItem>
          </Select>
        </FormControl>
        
        {nodeData.successCondition === 'custom' && (
          <TextField
            fullWidth
            label="Expressão de Sucesso"
            value={nodeData.successExpression || ''}
            onChange={(e) => onChange({ ...nodeData, successExpression: e.target.value })}
            margin="normal"
            placeholder="response.status === 200 && response.data.success === true"
            helperText="Expressão JavaScript para avaliar o sucesso da requisição"
          />
        )}
        
        <FormControlLabel
          control={
            <Switch
            checked={nodeData.storeErrorResponse || true}
            onChange={(e) => onChange({ ...nodeData, storeErrorResponse: e.target.checked })}
            color="primary"
          />
        }
        label="Armazenar resposta mesmo em caso de erro"
        sx={{ mt: 2 }}
      />
      
      <TextField
        fullWidth
        label="Variável para código de status"
        value={nodeData.statusVariable || ''}
        onChange={(e) => onChange({ ...nodeData, statusVariable: e.target.value })}
        margin="normal"
        placeholder="status_code"
        helperText="Nome da variável onde o código de status da resposta será armazenado (opcional)"
      />
    </TabPanel>
    
    {!isFormValid() && (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Por favor, corrija os erros no formulário antes de salvar.
      </Alert>
    )}
    
    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Este nó realiza uma requisição HTTP para uma API externa e processa a resposta.
        A saída "success" é acionada para respostas bem-sucedidas, enquanto a saída "error" é usada para falhas.
        A resposta da API pode ser armazenada em uma variável para uso posterior no fluxo.
      </Typography>
    </Box>
  </Box>
);
};

export default ApiNodeDrawer;