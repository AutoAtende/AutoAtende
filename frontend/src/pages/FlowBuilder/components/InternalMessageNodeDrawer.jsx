import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Divider,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Comment as CommentIcon,
  Code as CodeIcon,
  ContentPaste as ContentPasteIcon
} from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import { VariablesReferencePanel } from './VariablesReferencePanel';

const InternalMessageNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedVariable, setSelectedVariable] = useState(nodeData.selectedVariable || '');
  const [message, setMessage] = useState(nodeData.message || '');
  
  // Validação de dados
  const validateData = () => {
    let errors = {};
    
    // Verificar se há mensagem
    if (!message || message.trim() === '') {
      errors.message = "A mensagem interna é obrigatória";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  useEffect(() => {
    validateData();
  }, [message, selectedVariable]);
  
  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Validação da mensagem
    if (!newMessage || newMessage.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        message: "A mensagem interna é obrigatória"
      });
    } else {
      // Remover erro se existir
      if (validationErrors.message) {
        const { message, ...restErrors } = validationErrors;
        setValidationErrors(restErrors);
      }
    }
    
    // Garantir que a mensagem seja atualizada no nodeData
    onChange({
      ...nodeData,
      message: newMessage
    });
    
    // Para depuração
    console.log("Atualizando mensagem:", newMessage);
  };
  
  const handleVariableChange = (e) => {
    const variable = e.target.value;
    setSelectedVariable(variable);
    
    onChange({
      ...nodeData,
      selectedVariable: variable
    });
  };
  
  const insertVariableIntoMessage = () => {
    if (!selectedVariable) return;
    
    const variableText = `\${${selectedVariable}}`;
    const cursorPosition = document.getElementById('internal-message-field').selectionStart;
    
    // Inserir a variável na posição do cursor
    const newMessage = 
      message.substring(0, cursorPosition) + 
      variableText + 
      message.substring(cursorPosition);
    
    setMessage(newMessage);
    
    onChange({
      ...nodeData,
      message: newMessage
    });
  };
  
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
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Selecione uma variável
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Variável</InputLabel>
          <Select
            value={selectedVariable}
            onChange={handleVariableChange}
            label="Variável"
            InputLabelProps={{
              shrink: true,
          }}
          >
            <MenuItem value="">
              <em>Selecione uma variável</em>
            </MenuItem>
            {flowVariables && flowVariables.map((variable) => (
              <MenuItem key={variable.name} value={variable.name}>
                ${variable.name} - {variable.description || 'Sem descrição'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Tooltip title="Inserir variável na mensagem">
          <span>
            <IconButton 
              color="primary" 
              onClick={insertVariableIntoMessage}
              disabled={!selectedVariable}
              sx={{ mt: 2 }}
            >
              <ContentPasteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      
      <TextField
        id="internal-message-field"
        fullWidth
        multiline
        rows={5}
        label="Mensagem Interna"
        value={message}
        onChange={handleMessageChange}
        margin="normal"
        placeholder="Digite a mensagem interna que será registrada no ticket. Você pode usar variáveis no formato ${variavel}."
        required
        error={!!validationErrors.message}
        helperText={validationErrors.message || ''}
        InputLabelProps={{
          shrink: true,
      }}
      />
      
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mt: 3, 
          bgcolor: 'background.default',
          borderRadius: 1 
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Pré-visualização da mensagem
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          {message ? (
            <Typography variant="body2">
              {message.replace(/\$\{([^}]+)\}/g, (match, varName) => {
                return <Chip 
                  size="small" 
                  label={varName} 
                  color="primary" 
                  icon={<CodeIcon />} 
                  sx={{ mx: 0.5 }}
                />;
              })}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              A pré-visualização da mensagem aparecerá aqui
            </Typography>
          )}
        </Box>
      </Paper>
      
      {flowVariables && flowVariables.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <VariablesReferencePanel variables={flowVariables} />
        </>
      )}
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Este nó cria uma mensagem interna no ticket, visível apenas para os atendentes. 
          Você pode incluir valores de variáveis do fluxo na mensagem interna para fornecer 
          contexto adicional para o atendimento.
        </Typography>
      </Box>
    </Box>
  );
};

export default InternalMessageNodeDrawer;