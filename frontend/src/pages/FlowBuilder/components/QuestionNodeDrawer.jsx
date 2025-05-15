import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Info as InfoIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { i18n } from '../../../translate/i18n';
import { VariablesReferencePanel } from './VariablesReferencePanel';
const QuestionNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [newOption, setNewOption] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Validação de dados
  const validateData = () => {
    let errors = {};
    
    // Verificar se há pergunta
    if (!nodeData.question || nodeData.question.trim() === '') {
      errors.question = "A pergunta é obrigatória";
    }
    
    // Verificar se há nome de variável
    if (!nodeData.variableName || nodeData.variableName.trim() === '') {
      errors.variableName = "Nome da variável é obrigatório";
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(nodeData.variableName)) {
      errors.variableName = "Nome da variável deve começar com letra e conter apenas letras, números e underscore";
    }
    
    // Se for tipo opções, deve ter pelo menos uma opção
    if (nodeData.inputType === 'options' && (!nodeData.options || nodeData.options.length === 0)) {
      errors.options = "É necessário adicionar pelo menos uma opção";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    const options = nodeData.options || [];
    const newId = Date.now();
    
    onChange({
      ...nodeData,
      options: [
        ...options,
        { id: newId, text: newOption, value: newOption }
      ]
    });
    
    setNewOption('');
    
    // Remover erro de opções se existir
    if (validationErrors.options) {
      const { options, ...restErrors } = validationErrors;
      setValidationErrors(restErrors);
    }
  };
  
  const handleRemoveOption = (optionId) => {
    const options = nodeData.options || [];
    
    onChange({
      ...nodeData,
      options: options.filter(option => option.id !== optionId)
    });
    
    // Verificar se precisa adicionar erro de opções
    if (options.length <= 1 && nodeData.inputType === 'options') {
      setValidationErrors({
        ...validationErrors,
        options: "É necessário adicionar pelo menos uma opção"
      });
    }
  };
  
  const handleMoveOption = (sourceIndex, destinationIndex) => {
    const options = [...(nodeData.options || [])];
    const [removed] = options.splice(sourceIndex, 1);
    options.splice(destinationIndex, 0, removed);
    
    onChange({
      ...nodeData,
      options: options
    });
  };
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    handleMoveOption(
      result.source.index,
      result.destination.index
    );
  };
  
  const handleOptionTextChange = (optionId, text) => {
    const options = nodeData.options || [];
    
    onChange({
      ...nodeData,
      options: options.map(option =>
        option.id === optionId ? { ...option, text, value: text } : option
      )
    });
  };
  
  const handleInputTypeChange = (e) => {
    const newInputType = e.target.value;
    
    // Se mudar para tipo validado, configurar validação apropriada
    let validationType = nodeData.validationType;
    if (['email', 'cpf', 'cnpj'].includes(newInputType)) {
      validationType = newInputType;
    }
    
    onChange({
      ...nodeData,
      inputType: newInputType,
      validationType: validationType,
      // Limpar opções se mudar para tipo de entrada livre
      ...(['text', 'number', 'email', 'phone', 'cpf', 'cnpj'].includes(newInputType) ? { options: [] } : {})
    });
    
    // Verificar se precisa adicionar erro de opções
    if (newInputType === 'options' && (!nodeData.options || nodeData.options.length === 0)) {
      setValidationErrors({
        ...validationErrors,
        options: "É necessário adicionar pelo menos uma opção"
      });
    } else if (validationErrors.options) {
      const { options, ...restErrors } = validationErrors;
      setValidationErrors(restErrors);
    }
  };
  
  const handleValidationTypeChange = (e) => {
    const validationType = e.target.value;
    
    onChange({
      ...nodeData,
      validationType
    });
  };
  
  const handleVariableNameChange = (e) => {
    const variableName = e.target.value;
    
    // Validação do nome da variável
    if (!variableName || variableName.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        variableName: "Nome da variável é obrigatório"
      });
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variableName)) {
      setValidationErrors({
        ...validationErrors,
        variableName: "Nome da variável deve começar com letra e conter apenas letras, números e underscore"
      });
    } else {
      // Remover erro se existir
      if (validationErrors.variableName) {
        const { variableName, ...restErrors } = validationErrors;
        setValidationErrors(restErrors);
      }
    }
    
    onChange({
      ...nodeData,
      variableName
    });
  };
  
  const handleQuestionChange = (e) => {
    const question = e.target.value;
    
    // Validação da pergunta
    if (!question || question.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        question: "A pergunta é obrigatória"
      });
    } else {
      // Remover erro se existir
      if (validationErrors.question) {
        const { question, ...restErrors } = validationErrors;
        setValidationErrors(restErrors);
      }
    }
    
    onChange({
      ...nodeData,
      question
    });
  };
  
  const handleRequiredToggle = (e) => {
    onChange({
      ...nodeData,
      required: e.target.checked
    });
  };

  const handleUseValidationErrorOutputToggle = (e) => {
    onChange({
      ...nodeData,
      useValidationErrorOutput: e.target.checked
    });
  };
  
  const isFormValid = () => {
    return validateData();
  };
  
  // Obter descrição do tipo de validação
  const getValidationTypeDescription = (type) => {
    switch(type) {
      case 'none': return "Sem validação específica";
      case 'email': return "Verifica se é um endereço de email válido";
      case 'cpf': return "Verifica se é um CPF válido (com validação de dígitos)";
      case 'cnpj': return "Verifica se é um CNPJ válido (com validação de dígitos)";
      case 'regex': return "Validação personalizada com expressão regular";
      default: return "";
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configuração de Pergunta
      </Typography>
      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Pergunta"
        multiline
        rows={3}
        value={nodeData.question || ''}
        onChange={handleQuestionChange}
        margin="normal"
        placeholder="Digite a pergunta que será enviada ao contato"
        required
        error={!!validationErrors.question}
        helperText={validationErrors.question || ''}
      />
      
      <TextField
        fullWidth
        label="Nome da variável"
        value={nodeData.variableName || ''}
        onChange={handleVariableNameChange}
        margin="normal"
        placeholder="Ex: resposta_cliente"
        helperText={validationErrors.variableName || "Nome da variável onde a resposta será armazenada"}
        required
        error={!!validationErrors.variableName}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo de entrada</InputLabel>
        <Select
          value={nodeData.inputType || 'options'}
          onChange={handleInputTypeChange}
          label="Tipo de entrada"
        >
          <MenuItem value="options">Opções (escolha múltipla)</MenuItem>
          <MenuItem value="text">Texto livre</MenuItem>
          <MenuItem value="number">Número</MenuItem>
          <MenuItem value="email">E-mail</MenuItem>
          <MenuItem value="phone">Telefone</MenuItem>
          <MenuItem value="cpf">CPF</MenuItem>
          <MenuItem value="cnpj">CNPJ</MenuItem>
          <MenuItem value="media">Mídia (imagem, arquivo)</MenuItem>
        </Select>
      </FormControl>
      
      {/* Tipo de validação adicional */}
      {['text', 'number', 'phone'].includes(nodeData.inputType || '') && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de validação</InputLabel>
          <Select
            value={nodeData.validationType || 'none'}
            onChange={handleValidationTypeChange}
            label="Tipo de validação"
          >
            <MenuItem value="none">Sem validação específica</MenuItem>
            <MenuItem value="email">Validar como email</MenuItem>
            <MenuItem value="cpf">Validar como CPF</MenuItem>
            <MenuItem value="cnpj">Validar como CNPJ</MenuItem>
            <MenuItem value="regex">Expressão regular</MenuItem>
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {getValidationTypeDescription(nodeData.validationType || 'none')}
          </Typography>
        </FormControl>
      )}
      
      <FormControlLabel
        control={
          <Switch
            checked={nodeData.required || false}
            onChange={handleRequiredToggle}
            color="primary"
          />
        }
        label="Resposta obrigatória"
        sx={{ mt: 2, mb: 0.5 }}
      />

      {/* Opção para usar saída de erro de validação */}
      {['email', 'cpf', 'cnpj', 'regex'].includes(nodeData.inputType || nodeData.validationType) && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={nodeData.useValidationErrorOutput || false}
                onChange={handleUseValidationErrorOutputToggle}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" mr={0.5}>Usar saída para erro de validação</Typography>
                <Tooltip title="Quando ativado, cria uma saída lateral específica para casos onde a validação falha, permitindo criar fluxos diferentes para respostas inválidas" arrow>
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
            }
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 4 }}>
            Cria uma saída adicional específica para erros de validação
          </Typography>
        </Box>
      )}
      
      {nodeData.inputType === 'options' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Opções de resposta
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Digite uma opção"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
              error={!!validationErrors.options}
              helperText={validationErrors.options || ''}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddOption}
              disabled={!newOption.trim()}
              sx={{ ml: 1 }}
            >
              <AddIcon />
            </Button>
          </Box>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="options-list">
              {(provided) => (
                <List 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ 
                    p: 0,
                    '& > li': {
                      mb: 1
                    }
                  }}
                >
                  {(nodeData.options || []).map((option, index) => (
                    <Draggable 
                      key={option.id} 
                      draggableId={option.id.toString()} 
                      index={index}
                    >
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          disablePadding
                          sx={{ display: 'block' }}
                        >
                          <Paper
                            variant="outlined"
                            sx={{ p: 1, display: 'flex', alignItems: 'center' }}
                          >
                            <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: 'move' }}>
                              <DragIndicatorIcon color="action" fontSize="small" />
                            </Box>
                            <TextField
                              fullWidth
                              size="small"
                              value={option.text}
                              onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                            />
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveOption(option.id)}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
      
      {['text', 'number', 'email', 'phone', 'cpf', 'cnpj'].includes(nodeData.inputType || '') && (
        <Box sx={{ mt: 2 }}>
          {nodeData.validationType === 'regex' && (
            <TextField
              fullWidth
              label="Validação (Regex)"
              value={nodeData.validationRegex || ''}
              onChange={(e) => onChange({ ...nodeData, validationRegex: e.target.value })}
              margin="normal"
              placeholder="Expressão regular para validação (ex: ^[0-9]{5}-[0-9]{3}$)"
            />
          )}
          
          <TextField
            fullWidth
            label="Mensagem de erro"
            value={nodeData.errorMessage || ''}
            onChange={(e) => onChange({ ...nodeData, errorMessage: e.target.value })}
            margin="normal"
            placeholder="Mensagem exibida quando a resposta não for válida"
          />
          
          {nodeData.inputType === 'media' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Configurações de Mídia
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de Mídia Aceito</InputLabel>
                <Select
                  value={nodeData.mediaType || 'all'}
                  onChange={(e) => onChange({ ...nodeData, mediaType: e.target.value })}
                  label="Tipo de Mídia Aceito"
                >
                  <MenuItem value="all">Qualquer tipo</MenuItem>
                  <MenuItem value="image">Apenas imagens</MenuItem>
                  <MenuItem value="audio">Apenas áudios</MenuItem>
                  <MenuItem value="video">Apenas vídeos</MenuItem>
                  <MenuItem value="file">Apenas documentos</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Formatos permitidos"
                value={nodeData.allowedFormats ? nodeData.allowedFormats.join(', ') : ''}
                onChange={(e) => {
                  const formatsText = e.target.value;
                  const formats = formatsText
                    .split(',')
                    .map(f => f.trim().toLowerCase())
                    .filter(f => f);
                  
                  onChange({
                    ...nodeData,
                    allowedFormats: formats.length > 0 ? formats : undefined
                  });
                }}
                margin="normal"
                placeholder="jpg, png, pdf, doc (separados por vírgula)"
                helperText="Deixe em branco para permitir qualquer formato"
              />
              
              <TextField
                fullWidth
                type="number"
                label="Tamanho máximo (bytes)"
                value={nodeData.maxFileSize || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  onChange({
                    ...nodeData,
                    maxFileSize: isNaN(value) || value <= 0 ? undefined : value
                  });
                }}
                margin="normal"
                placeholder="Ex: 10485760 (10MB)"
                helperText="Deixe em branco para usar o tamanho padrão do sistema"
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Box>
          )}
        </Box>
      )}
      
      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Por favor, corrija os erros no formulário antes de salvar.
        </Alert>
      )}
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Este nó envia uma pergunta ao contato e captura a resposta. A resposta
          será armazenada na variável especificada e pode ser usada em nodes subsequentes.
          {nodeData.useValidationErrorOutput && (
            <Box component="span" display="block" mt={1}>
              Uma saída adicional para erro de validação será criada, permitindo criar fluxos diferentes
              para respostas que não passarem na validação.
            </Box>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default QuestionNodeDrawer;