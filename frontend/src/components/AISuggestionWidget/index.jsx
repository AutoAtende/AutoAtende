import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Collapse,
  Alert,
  CircularProgress,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Fab
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ContentCopy as ContentCopyIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Send as SendIcon,
  AutoAwesome as AutoAwesomeIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from '../../helpers/toast';
import api from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import useSettings from '../../hooks/useSettings';
import StandardModal from '../shared/StandardModal';
import storage from "../../helpers/storage";

const PREFIX = 'AISuggestionWidget';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
  }
}));

const SuggestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4]
  }
}));

const ToneChip = styled(Chip)(({ theme, tone }) => {
  const colors = {
    formal: { bg: '#f3e5f5', color: '#7b1fa2' },
    casual: { bg: '#e8f5e8', color: '#2e7d32' },
    empathetic: { bg: '#fff3e0', color: '#ef6c00' },
    professional: { bg: '#e3f2fd', color: '#1565c0' }
  };
  
  const colorScheme = colors[tone] || colors.professional;
  
  return {
    backgroundColor: colorScheme.bg,
    color: colorScheme.color,
    fontWeight: 600,
    fontSize: '0.75rem'
  };
});

const AISuggestionWidget = ({ 
  ticketId, 
  onSuggestionSelect, 
  open,
  onClose 
}) => {
  const { user } = useContext(AuthContext);
  const { settings, getAll, loading: settingsLoading } = useSettings();
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [aiConfigReady, setAiConfigReady] = useState(false);
  
  // Estados para configurações locais (preferências do usuário)
  const [localConfig, setLocalConfig] = useState({
    contextLength: 20,
    maxSuggestions: 3,
    temperature: 0.7,
    maxTokens: 1500,
    confidenceThreshold: 0.7
  });

  // Função para buscar configuração específica por key
  const getSettingByKey = useCallback((key) => {
    if (!Array.isArray(settings) || settings.length === 0) {
      return null;
    }
    
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : null;
  }, [settings]);

  // Buscar configurações de IA
  const getAiSettings = useCallback(() => {
    const openAiKey = getSettingByKey('openAiKey');
    const openAiModel = getSettingByKey('openAiModel');
    
    return {
      openAiKey,
      openAiModel: openAiModel || 'gpt-4o' // valor padrão
    };
  }, [getSettingByKey]);

  // Carregar configurações quando o componente é montado ou aberto
  useEffect(() => {
    if (open && !settingsLoading && (!settings || settings.length === 0)) {
      const companyId = user?.companyId || localStorage.getItem("companyId");
      if (companyId) {
        getAll(companyId);
      }
    }
  }, [open, settingsLoading, settings, getAll, user?.companyId]);

  // Verificar se as configurações de IA estão prontas
  useEffect(() => {
    if (settings && settings.length > 0) {
      const { openAiKey } = getAiSettings();
      setAiConfigReady(!!openAiKey);
    }
  }, [settings, getAiSettings]);

  const loadLocalConfig = useCallback(() => {
    const savedConfig = storage.getItem('aiSuggestionConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setLocalConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Erro ao carregar configurações locais:', error);
      }
    }
  }, []);

  const saveLocalConfig = useCallback(() => {
    try {
      storage.setItem('aiSuggestionConfig', JSON.stringify(localConfig));
      setConfigOpen(false);
      toast.success('Configurações pessoais salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  }, [localConfig]);

  useEffect(() => {
    loadLocalConfig();
  }, [loadLocalConfig]);

  // Gerar sugestões usando configurações globais + locais
  const generateSuggestions = async () => {
    const { openAiKey, openAiModel } = getAiSettings();
    
    if (!openAiKey) {
      toast.error('Configurações de IA não encontradas. Configure a chave da OpenAI nas Configurações Gerais.');
      return;
    }

    setLoading(true);
    try {
      const requestConfig = {
        // Usar configurações globais como base
        model: openAiModel,
        apiKey: openAiKey, // Chave global
        // Permitir override local das configurações de comportamento
        maxSuggestions: localConfig.maxSuggestions,
        contextLength: localConfig.contextLength,
        temperature: localConfig.temperature,
        maxTokens: localConfig.maxTokens,
        confidenceThreshold: localConfig.confidenceThreshold,
        language: 'pt'
      };

      const response = await api.post(`/ai-suggestions/tickets/${ticketId}/generate`, requestConfig);

      if (response.data?.data?.suggestions) {
        setSuggestions(response.data.data.suggestions);
        toast.success('Sugestões geradas com sucesso!');
      } else {
        toast.warn('Nenhuma sugestão foi gerada para este ticket.');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      if (error.response?.status === 401) {
        toast.error('Chave da OpenAI inválida. Entre em contato com o administrador.');
      } else if (error.response?.status === 429) {
        toast.error('Limite de requisições atingido. Tente novamente em alguns minutos.');
      } else if (error.response?.status === 500) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (error.response?.status === 403) {
        toast.error('Acesso negado. Verifique suas permissões.');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao gerar sugestões');
      }
    } finally {
      setLoading(false);
    }
  };

  // Usar sugestão
  const handleUseSuggestion = async (suggestion) => {
    try {
      // Registrar que a sugestão foi usada (se feedback estiver habilitado)
      await api.post(`/ai-suggestions/${suggestion.id}/feedback`, {
        used: true,
        helpful: true
      });

      // Chamar callback para inserir texto no campo de resposta
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion.text);
      }

      toast.success('Sugestão aplicada!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao registrar feedback:', error);
      // Ainda permite usar a sugestão mesmo se o feedback falhar
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion.text);
      }
      if (onClose) onClose();
    }
  };

  // Copiar sugestão
  const handleCopySuggestion = async (suggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      toast.success('Sugestão copiada para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar sugestão');
    }
  };

  // Dar feedback
  const handleFeedback = async (suggestionId, helpful) => {
    try {
      await api.post(`/ai-suggestions/${suggestionId}/feedback`, {
        used: false,
        helpful
      });

      toast.success('Obrigado pelo feedback!');
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast.warn('Não foi possível registrar o feedback, mas obrigado!');
    }
  };

  // Atualizar configuração local
  const handleConfigChange = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  // Renderizar chip de categoria
  const renderCategoryChip = (category) => {
    const categoryLabels = {
      information: 'Informação',
      support: 'Suporte',
      sales: 'Vendas',
      follow_up: 'Acompanhamento',
      escalation: 'Escalação'
    };

    const categoryColors = {
      information: 'info',
      support: 'primary',
      sales: 'success',
      follow_up: 'warning',
      escalation: 'error'
    };

    return (
      <Chip
        label={categoryLabels[category] || category}
        color={categoryColors[category] || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  const renderMainContent = () => {
    // Mostrar loading se as configurações ainda estão carregando
    if (settingsLoading) {
      return (
        <Box textAlign="center" py={4}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1">
            Carregando configurações...
          </Typography>
        </Box>
      );
    }

    if (suggestions.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <PsychologyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma sugestão disponível
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Clique em "Gerar Sugestões" para obter recomendações de resposta baseadas no contexto da conversa.
          </Typography>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            onClick={generateSuggestions}
            disabled={loading}
            size="large"
          >
            {loading ? 'Gerando...' : 'Gerar Sugestões'}
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        {suggestions.map((suggestion, index) => (
          <SuggestionCard key={suggestion.id} elevation={1}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <ToneChip 
                    label={suggestion.tone} 
                    size="small" 
                    tone={suggestion.tone}
                  />
                  {renderCategoryChip(suggestion.category)}
                  <Chip 
                    label={`${Math.round(suggestion.confidence * 100)}%`} 
                    size="small" 
                    color={suggestion.confidence >= localConfig.confidenceThreshold ? "success" : "warning"}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Typography variant="body1" paragraph>
                {suggestion.text}
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="caption" color="textSecondary">
                    Explicação da sugestão
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="textSecondary">
                    {suggestion.reasoning}
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={() => handleUseSuggestion(suggestion)}
                    size="small"
                  >
                    Usar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopySuggestion(suggestion)}
                    size="small"
                  >
                    Copiar
                  </Button>
                </Box>

                <Box display="flex" gap={1}>
                  <Tooltip title="Útil">
                    <IconButton
                      size="small"
                      onClick={() => handleFeedback(suggestion.id, true)}
                      color="success"
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Não útil">
                    <IconButton
                      size="small"
                      onClick={() => handleFeedback(suggestion.id, false)}
                      color="error"
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </SuggestionCard>
        ))}
      </Box>
    );
  };

  const renderConfigContent = () => {
    const { openAiModel } = getAiSettings();
    
    return (
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Configuração Global:</strong> {openAiModel} configurado para toda a empresa.
            Aqui você pode ajustar suas preferências pessoais de comportamento da IA.
          </Typography>
        </Alert>

        <TextField
          label="Máximo de Sugestões"
          type="number"
          value={localConfig.maxSuggestions}
          onChange={(e) => handleConfigChange('maxSuggestions', parseInt(e.target.value) || 3)}
          inputProps={{ min: 1, max: 5 }}
          fullWidth
          helperText="Padrão da empresa: 3"
        />

        <TextField
          label="Tamanho do Contexto"
          type="number"
          value={localConfig.contextLength}
          onChange={(e) => handleConfigChange('contextLength', parseInt(e.target.value) || 20)}
          inputProps={{ min: 5, max: 50 }}
          fullWidth
          helperText="Número de mensagens para análise. Padrão: 20"
        />

        <TextField
          label="Criatividade (Temperature)"
          type="number"
          value={localConfig.temperature}
          onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value) || 0.7)}
          inputProps={{ min: 0.1, max: 1.0, step: 0.1 }}
          fullWidth
          helperText="0.1 = Conservador, 1.0 = Criativo. Padrão: 0.7"
        />

        <TextField
          label="Máximo de Tokens"
          type="number"
          value={localConfig.maxTokens}
          onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value) || 1500)}
          inputProps={{ min: 500, max: 4000 }}
          fullWidth
          helperText="Tamanho máximo da resposta. Padrão: 1500"
        />

        <TextField
          label="Limite de Confiança (%)"
          type="number"
          value={Math.round(localConfig.confidenceThreshold * 100)}
          onChange={(e) => handleConfigChange('confidenceThreshold', (parseInt(e.target.value) || 70) / 100)}
          inputProps={{ min: 10, max: 100, step: 5 }}
          fullWidth
          helperText="Mínimo de confiança para mostrar sugestões. Padrão: 70%"
        />

        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>💡 Dica:</strong> Estas configurações são salvas localmente no seu navegador e 
            não afetam outros usuários. Use configurações mais conservadoras para respostas mais precisas 
            ou mais criativas para respostas mais variadas.
          </Typography>
        </Alert>
      </Box>
    );
  };

  // Verificar se IA está configurada
  if (!aiConfigReady && !settingsLoading && settings && settings.length > 0) {
    return (
      <StandardModal
        open={open}
        onClose={onClose}
        title="IA Não Configurada"
        subtitle="Configure a chave da OpenAI para utilizar as sugestões de resposta"
        icon={WarningIcon}
        iconColor="#ff9800"
        maxWidth="sm"
        actions={[
          {
            label: 'Fechar',
            onClick: onClose,
            variant: 'outlined'
          },
          {
            label: 'Ir para Configurações',
            onClick: () => window.location.href = '/settings',
            variant: 'contained',
            startIcon: <SettingsIcon />
          }
        ]}
      >
        <Alert severity="warning">
          <Typography variant="body1">
            As configurações de Inteligência Artificial não foram encontradas. 
            Configure a chave da OpenAI nas Configurações Gerais para utilizar as sugestões de resposta.
          </Typography>
        </Alert>
      </StandardModal>
    );
  }

  const { openAiModel } = getAiSettings();

  const getMainModalActions = () => [
    {
      label: loading ? 'Gerando...' : 'Gerar Novas Sugestões',
      onClick: generateSuggestions,
      disabled: loading || settingsLoading,
      variant: 'outlined'
    },
    {
      label: 'Fechar',
      onClick: onClose,
      variant: 'contained'
    }
  ];

  const getConfigModalActions = () => [
    {
      label: 'Cancelar',
      onClick: () => setConfigOpen(false),
      variant: 'outlined'
    },
    {
      label: 'Salvar Preferências',
      onClick: saveLocalConfig,
      variant: 'contained'
    }
  ];

  return (
    <>
      {/* Modal Principal */}
      <StandardModal
        open={open}
        onClose={onClose}
        title="Sugestões de Resposta IA"
        subtitle={`Configuração: ${openAiModel} • Máx. ${localConfig.maxSuggestions} sugestões • Contexto: ${localConfig.contextLength} mensagens`}
        icon={PsychologyIcon}
        iconColor="#2196f3"
        maxWidth="md"
        fullWidth
        loading={loading || settingsLoading}
        loadingText={settingsLoading ? "Carregando configurações..." : "Gerando sugestões..."}
        actions={getMainModalActions()}
        disableBackdropClick={loading || settingsLoading}
        disableEscapeKeyDown={loading || settingsLoading}
      >
        {/* Informações sobre configuração global */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Configuração Ativa:</strong> {openAiModel} • 
            Máx. {localConfig.maxSuggestions} sugestões • 
            Contexto: {localConfig.contextLength} mensagens
            <IconButton 
              onClick={() => setConfigOpen(true)} 
              size="small" 
              sx={{ ml: 1 }}
              disabled={settingsLoading}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Typography>
        </Alert>

        {renderMainContent()}
      </StandardModal>

      {/* Modal de Configurações Pessoais */}
      <StandardModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title="Configurações Pessoais de IA"
        subtitle="Ajuste suas preferências pessoais de comportamento da IA"
        icon={SettingsIcon}
        iconColor="#666"
        maxWidth="sm"
        actions={getConfigModalActions()}
      >
        {renderConfigContent()}
      </StandardModal>
    </>
  );
};

export default AISuggestionWidget;