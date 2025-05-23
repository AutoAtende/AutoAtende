import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Slider,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff, Psychology as PsychologyIcon, Info as InfoIcon, Code as CodeIcon } from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';

const OpenAINodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Opções de voz
  const voiceOptions = [
    { value: "texto", label: "Texto" },
    { value: "pt-BR-FranciscaNeural", label: "Francisa" },
    { value: "pt-BR-AntonioNeural", label: "Antônio" },
    { value: "pt-BR-BrendaNeural", label: "Brenda" },
    { value: "pt-BR-DonatoNeural", label: "Donato" },
    { value: "pt-BR-ElzaNeural", label: "Elza" },
    { value: "pt-BR-FabioNeural", label: "Fábio" },
    { value: "pt-BR-GiovannaNeural", label: "Giovanna" },
    { value: "pt-BR-HumbertoNeural", label: "Humberto" },
    { value: "pt-BR-JulioNeural", label: "Julio" },
    { value: "pt-BR-LeilaNeural", label: "Leila" },
    { value: "pt-BR-LeticiaNeural", label: "Letícia" },
    { value: "pt-BR-ManuelaNeural", label: "Manuela" },
    { value: "pt-BR-NicolauNeural", label: "Nicolau" },
    { value: "pt-BR-ValerioNeural", label: "Valério" },
    { value: "pt-BR-YaraNeural", label: "Yara" },
  ];
  
  // Valor inicial para tipologia padrão
  const typebotIntegration = nodeData.typebotIntegration || {
    name: "",
    prompt: "",
    voice: "texto",
    voiceKey: "",
    voiceRegion: "",
    maxTokens: 100,
    temperature: 1,
    apiKey: "",
    maxMessages: 10
  };
  
  const validateData = () => {
    let errors = {};
    
    if (!typebotIntegration.name || typebotIntegration.name.trim() === '') {
      errors.name = i18n.t('flowBuilder.validation.nameRequired');
    }
    
    if (!typebotIntegration.apiKey || typebotIntegration.apiKey.trim() === '') {
      errors.apiKey = i18n.t('flowBuilder.validation.apiKeyRequired');
    }
    
    if (!typebotIntegration.prompt || typebotIntegration.prompt.trim() === '') {
      errors.prompt = i18n.t('flowBuilder.validation.promptRequired');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleToggleApiKey = () => {
    setShowApiKey(!showApiKey);
  };
  
  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!name || name.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        name: i18n.t('flowBuilder.validation.nameRequired')
      });
    } else {
      const { name: _, ...restErrors } = validationErrors;
      setValidationErrors(restErrors);
    }
    
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        name
      }
    });
  };
  
  const handleApiKeyChange = (e) => {
    const apiKey = e.target.value;
    if (!apiKey || apiKey.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        apiKey: i18n.t('flowBuilder.validation.apiKeyRequired')
      });
    } else {
      const { apiKey: _, ...restErrors } = validationErrors;
      setValidationErrors(restErrors);
    }
    
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        apiKey
      }
    });
  };
  
  const handlePromptChange = (e) => {
    const prompt = e.target.value;
    if (!prompt || prompt.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        prompt: i18n.t('flowBuilder.validation.promptRequired')
      });
    } else {
      const { prompt: _, ...restErrors } = validationErrors;
      setValidationErrors(restErrors);
    }
    
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        prompt
      }
    });
  };
  
  const handleVoiceChange = (e) => {
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        voice: e.target.value
      }
    });
  };
  
  const handleValueChange = (field, value) => {
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        [field]: value
      }
    });
  };
  
  const handleTemperatureChange = (_, newValue) => {
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        temperature: newValue
      }
    });
  };
  
  const isFormValid = () => {
    return validateData();
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        <PsychologyIcon sx={{ mr: 1, fontSize: '1.2rem', verticalAlign: 'text-bottom' }} />
        {i18n.t('flowBuilder.nodes.openai')}
      </Typography>
      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
      />
      
      <Divider sx={{ my: 2 }} />

      {/* Alerta indicando que é um nó terminal */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
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
            {i18n.t('flowBuilder.nodes.terminalNodeTitle', 'Nó Terminal')}
          </Typography>
          <Typography variant="body2">
            {i18n.t('flowBuilder.nodes.openaiTerminalDescription', 'Este nó finaliza o fluxo. Quando uma conversa chega a este ponto, será transferida para a OpenAI e não continuará no fluxo.')}
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.openai.name')}
          value={typebotIntegration.name || ''}
          onChange={handleNameChange}
          margin="normal"
          required
          error={!!validationErrors.name}
          helperText={validationErrors.name || ''}
        />
        
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.openai.apiKey')}
          value={typebotIntegration.apiKey || ''}
          onChange={handleApiKeyChange}
          margin="normal"
          required
          error={!!validationErrors.apiKey}
          helperText={validationErrors.apiKey || ''}
          type={showApiKey ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleToggleApiKey}
                  edge="end"
                >
                  {showApiKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.openai.prompt')}
          value={typebotIntegration.prompt || ''}
          onChange={handlePromptChange}
          margin="normal"
          multiline
          rows={5}
          required
          error={!!validationErrors.prompt}
          helperText={validationErrors.prompt || i18n.t('flowBuilder.openai.promptHelp')}
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>{i18n.t('flowBuilder.openai.voice')}</InputLabel>
          <Select
            value={typebotIntegration.voice || 'texto'}
            onChange={handleVoiceChange}
            label={i18n.t('flowBuilder.openai.voice')}
          >
            {voiceOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {typebotIntegration.voice !== 'texto' && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={i18n.t('flowBuilder.openai.voiceKey')}
                value={typebotIntegration.voiceKey || ''}
                onChange={(e) => handleValueChange('voiceKey', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={i18n.t('flowBuilder.openai.voiceRegion')}
                value={typebotIntegration.voiceRegion || ''}
                onChange={(e) => handleValueChange('voiceRegion', e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>
        )}
        
        <Typography gutterBottom sx={{ mt: 2 }}>
          {i18n.t('flowBuilder.openai.temperature')} ({typebotIntegration.temperature})
        </Typography>
        <Slider
          value={typebotIntegration.temperature || 1}
          min={0}
          max={2}
          step={0.1}
          onChange={handleTemperatureChange}
          aria-labelledby="temperature-slider"
          valueLabelDisplay="auto"
        />
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label={i18n.t('flowBuilder.openai.maxTokens')}
              value={typebotIntegration.maxTokens || 100}
              onChange={(e) => handleValueChange('maxTokens', parseInt(e.target.value, 10) || 100)}
              margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label={i18n.t('flowBuilder.openai.maxMessages')}
              value={typebotIntegration.maxMessages || 10}
              onChange={(e) => handleValueChange('maxMessages', parseInt(e.target.value, 10) || 10)}
              margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
        </Grid>
      </Box>
      
      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {i18n.t('flowBuilder.validation.fixErrors')}
        </Alert>
      )}
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {i18n.t('flowBuilder.openai.helpText')}
        </Typography>
      </Box>
    </Box>
  );
};

export default OpenAINodeDrawer;