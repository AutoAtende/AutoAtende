import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, PlayArrow as PlayArrowIcon, Code as CodeIcon } from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';
import { VariablesReferencePanel } from '../VariablesReferencePanel';

const TypebotNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [showToken, setShowToken] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Valor inicial para tipologia padrão
  const typebotIntegration = nodeData.typebotIntegration || {
    name: "",
    typebotUrl: "",
    typebotId: "",
    typebotToken: "",
    saveTypebotResponse: false
  };
  
  const validateData = () => {
    let errors = {};
    
    if (!typebotIntegration.name || typebotIntegration.name.trim() === '') {
      errors.name = i18n.t('flowBuilder.validation.nameRequired');
    }
    
    if (!typebotIntegration.typebotUrl || typebotIntegration.typebotUrl.trim() === '') {
      errors.typebotUrl = i18n.t('flowBuilder.validation.urlRequired');
    } else {
      try {
        new URL(typebotIntegration.typebotUrl);
      } catch (e) {
        errors.typebotUrl = i18n.t('flowBuilder.validation.invalidUrl');
      }
    }
    
    if (!typebotIntegration.typebotId || typebotIntegration.typebotId.trim() === '') {
      errors.typebotId = i18n.t('flowBuilder.validation.typebotIdRequired');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleToggleToken = () => {
    setShowToken(!showToken);
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
  
  const handleTypebotUrlChange = (e) => {
    const typebotUrl = e.target.value;
    if (!typebotUrl || typebotUrl.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        typebotUrl: i18n.t('flowBuilder.validation.urlRequired')
      });
    } else {
      try {
        new URL(typebotUrl);
        const { typebotUrl: _, ...restErrors } = validationErrors;
        setValidationErrors(restErrors);
      } catch (e) {
        setValidationErrors({
          ...validationErrors,
          typebotUrl: i18n.t('flowBuilder.validation.invalidUrl')
        });
      }
    }
    
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        typebotUrl
      }
    });
  };
  
  const handleTypebotIdChange = (e) => {
    const typebotId = e.target.value;
    if (!typebotId || typebotId.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        typebotId: i18n.t('flowBuilder.validation.typebotIdRequired')
      });
    } else {
      const { typebotId: _, ...restErrors } = validationErrors;
      setValidationErrors(restErrors);
    }
    
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        typebotId
      }
    });
  };
  
  const handleTypebotTokenChange = (e) => {
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        typebotToken: e.target.value
      }
    });
  };
  
  const handleSaveResponseChange = (e) => {
    onChange({
      ...nodeData,
      typebotIntegration: {
        ...typebotIntegration,
        saveTypebotResponse: e.target.checked
      }
    });
  };
  
  const isFormValid = () => {
    return validateData();
  };
  
  return (
    <Box sx={{ p: 2 }}>      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.typebot.name')}
          value={typebotIntegration.name || ''}
          onChange={handleNameChange}
          margin="normal"
          required
          error={!!validationErrors.name}
          helperText={validationErrors.name || ''}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.typebot.typebotUrl')}
          value={typebotIntegration.typebotUrl || ''}
          onChange={handleTypebotUrlChange}
          margin="normal"
          required
          error={!!validationErrors.typebotUrl}
          helperText={validationErrors.typebotUrl || i18n.t('flowBuilder.typebot.typebotUrlHelp')}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.typebot.typebotId')}
          value={typebotIntegration.typebotId || ''}
          onChange={handleTypebotIdChange}
          margin="normal"
          required
          error={!!validationErrors.typebotId}
          helperText={validationErrors.typebotId || ''}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.typebot.typebotToken')}
          value={typebotIntegration.typebotToken || ''}
          onChange={handleTypebotTokenChange}
          margin="normal"
          type={showToken ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle token visibility"
                  onClick={handleToggleToken}
                  edge="end"
                >
                  {showToken ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            shrink: true,
          }}
          helperText={i18n.t('flowBuilder.typebot.typebotTokenHelp')}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={typebotIntegration.saveTypebotResponse || false}
              onChange={handleSaveResponseChange}
              color="primary"
            />
          }
          label={i18n.t('flowBuilder.typebot.saveResponse')}
          sx={{ mt: 2 }}
        />
      </Box>
      
      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {i18n.t('flowBuilder.validation.fixErrors')}
        </Alert>
      )}
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {i18n.t('flowBuilder.typebot.helpText')}
        </Typography>
      </Box>
    </Box>
  );
};

export default TypebotNodeDrawer;