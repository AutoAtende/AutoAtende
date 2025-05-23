import React, { useState } from 'react';
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
  Paper,
  List,
  ListItem,
  Divider,
  Alert,
  Grid,
  Chip,
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
import { i18n } from '../../../../translate/i18n';
import { VariablesReferencePanel } from '../VariablesReferencePanel';

const ConditionalNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [newCondition, setNewCondition] = useState({
    operator: '==',
    value: '',
    description: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  const operatorOptions = [
    { value: '==', label: 'Igual a (==)', description: 'Verifica se os valores são iguais' },
    { value: '!=', label: 'Diferente de (!=)', description: 'Verifica se os valores são diferentes' },
    { value: '>', label: 'Maior que (>)', description: 'Verifica se o valor é maior' },
    { value: '<', label: 'Menor que (<)', description: 'Verifica se o valor é menor' },
    { value: '>=', label: 'Maior ou igual a (>=)', description: 'Verifica se o valor é maior ou igual' },
    { value: '<=', label: 'Menor ou igual a (<=)', description: 'Verifica se o valor é menor ou igual' },
    { value: 'contains', label: 'Contém', description: 'Verifica se o texto contém o valor' },
    { value: 'startsWith', label: 'Começa com', description: 'Verifica se o texto começa com o valor' },
    { value: 'endsWith', label: 'Termina com', description: 'Verifica se o texto termina com o valor' },
    { value: 'regex', label: 'Expressão Regular', description: 'Verifica se o texto corresponde ao padrão' },
    // Novas opções para validações específicas
    { value: 'validCPF', label: 'CPF Válido', description: 'Verifica se o valor é um CPF válido' },
    { value: 'validCNPJ', label: 'CNPJ Válido', description: 'Verifica se o valor é um CNPJ válido' },
    { value: 'validEmail', label: 'Email Válido', description: 'Verifica se o valor é um email válido' }
  ];
  
  // Validação de dados
  const validateData = () => {
    let errors = {};
    
    // Verificar se há variável
    if (!nodeData.variable || nodeData.variable.trim() === '') {
      errors.variable = "O nome da variável é obrigatório";
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(nodeData.variable)) {
      errors.variable = "Nome da variável deve começar com letra e conter apenas letras, números e underscore";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVariableSelect = (event) => {
    const variable = event.target.value;
    
    // Atualizar apenas se for diferente da variável atual
    if (variable !== nodeData.variable) {
      onChange({
        ...nodeData,
        variable: variable
      });
    }
  };

  
  const handleAddCondition = () => {
    // Para operadores que não precisam de valor, permitimos adicionar sem valor
    const isNoValueOperator = ['validCPF', 'validCNPJ', 'validEmail'].includes(newCondition.operator);
    if (!isNoValueOperator && !newCondition.value.trim()) return;
    
    const conditions = nodeData.conditions || [];
    const newId = Date.now();
    
    onChange({
      ...nodeData,
      conditions: [
        ...conditions,
        { 
          id: newId, 
          value: newCondition.value,
          operator: newCondition.operator,
          description: newCondition.description || getDefaultDescriptionForOperator(newCondition.operator)
        }
      ]
    });
    
    // Resetar campos do formulário
    setNewCondition({
      operator: '==',
      value: '',
      description: ''
    });
  };
  
  const getDefaultDescriptionForOperator = (operator) => {
    switch(operator) {
      case 'validCPF': return 'Validar CPF';
      case 'validCNPJ': return 'Validar CNPJ';
      case 'validEmail': return 'Validar Email';
      default: return '';
    }
  };
  
  const handleRemoveCondition = (conditionId) => {
    const conditions = nodeData.conditions || [];
    
    onChange({
      ...nodeData,
      conditions: conditions.filter(condition => condition.id !== conditionId)
    });
  };
  
  const handleMoveCondition = (sourceIndex, destinationIndex) => {
    const conditions = [...(nodeData.conditions || [])];
    const [removed] = conditions.splice(sourceIndex, 1);
    conditions.splice(destinationIndex, 0, removed);
    
    onChange({
      ...nodeData,
      conditions: conditions
    });
  };
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    handleMoveCondition(
      result.source.index,
      result.destination.index
    );
  };
  
  const handleConditionChange = (conditionId, field, value) => {
    const conditions = nodeData.conditions || [];
    
    onChange({
      ...nodeData,
      conditions: conditions.map(condition =>
        condition.id === conditionId ? { ...condition, [field]: value } : condition
      )
    });
  };
  
  const handleVariableChange = (e) => {
    const variable = e.target.value;
    
    // Validação do nome da variável
    if (!variable || variable.trim() === '') {
      setValidationErrors({
        ...validationErrors,
        variable: "Nome da variável é obrigatório"
      });
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable)) {
      setValidationErrors({
        ...validationErrors,
        variable: "Nome da variável deve começar com letra e conter apenas letras, números e underscore"
      });
    } else {
      // Remover erro se existir
      if (validationErrors.variable) {
        const { variable, ...restErrors } = validationErrors;
        setValidationErrors(restErrors);
      }
    }
    
    onChange({
      ...nodeData,
      variable
    });
  };
  
  const handleDefaultValueChange = (e) => {
    onChange({
      ...nodeData,
      defaultValue: e.target.value
    });
  };
  
  const isFormValid = () => {
    return validateData();
  };
  
  const getOperatorLabel = (operatorValue) => {
    const operator = operatorOptions.find(op => op.value === operatorValue);
    return operator ? operator.label : operatorValue;
  };
  
  const isNoValueOperator = (operator) => {
    return ['validCPF', 'validCNPJ', 'validEmail'].includes(operator);
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
      
      {/* Substituir o campo de texto por um select quando existem variáveis */}
      {flowVariables && flowVariables.length > 0 ? (
        <>
          <Divider sx={{ my: 3 }} />
          <VariablesReferencePanel variables={flowVariables} />
          <FormControl fullWidth margin="normal">
            <InputLabel>{i18n.t('flowBuilder.properties.variable', 'Variável')}</InputLabel>
            <Select
              value={nodeData.variable || ''}
              onChange={handleVariableSelect}
              label={i18n.t('flowBuilder.properties.variable', 'Variável')}
              required
              error={!!validationErrors.variable}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="">
                <em>Selecione uma variável</em>
              </MenuItem>
              {flowVariables.map((variable) => (
                <MenuItem key={variable.name} value={variable.name}>
                  ${variable.name} - {variable.description}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.variable && (
              <FormHelperText error>{validationErrors.variable}</FormHelperText>
            )}
          </FormControl>
        </>
      ) : (
        <TextField
          fullWidth
          label={i18n.t('flowBuilder.properties.variable', 'Variável')}
          value={nodeData.variable || ''}
          onChange={handleVariableChange}
          margin="normal"
          placeholder="Ex: resposta_usuario"
          helperText={validationErrors.variable || "Nome da variável a ser avaliada nas condições"}
          required
          error={!!validationErrors.variable}
          InputLabelProps={{
            shrink: true,
          }}
        />
      )}
      
      <TextField
        fullWidth
        label="Valor padrão (opcional)"
        value={nodeData.defaultValue || ''}
        onChange={handleDefaultValueChange}
        margin="normal"
        placeholder="Valor para usar se a variável não existir"
        helperText="Este valor será usado se a variável não estiver definida"
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        {i18n.t('flowBuilder.properties.conditions', 'Condições')}
        <Tooltip title="Cada condição cria uma saída no nó. Se nenhuma condição for atendida, a saída padrão será usada.">
          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
        </Tooltip>
      </Typography>
      
      <Box sx={{ mb: 3, mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
  <Typography variant="subtitle2" gutterBottom>
    Adicionar Nova Condição
  </Typography>
  
  <Grid container direction="column" spacing={2}>
    <Grid item xs={12}>
      <FormControl fullWidth size="small">
        <InputLabel>Operador</InputLabel>
        <Select
          value={newCondition.operator}
          onChange={(e) => setNewCondition({...newCondition, operator: e.target.value})}
          label="Operador"
          InputLabelProps={{
            shrink: true,
          }}
        >
          {operatorOptions.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              <Tooltip title={op.description}>
                <Box component="span">{op.label}</Box>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        size="small"
        label="Valor"
        placeholder="Valor para comparação"
        value={newCondition.value}
        onChange={(e) => setNewCondition({...newCondition, value: e.target.value})}
        disabled={isNoValueOperator(newCondition.operator)}
        helperText={isNoValueOperator(newCondition.operator) ? "Não requer valor" : ""}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </Grid>
    
    <Grid item xs={12}>
      <TextField
        fullWidth
        size="small"
        label="Descrição (opcional)"
        placeholder="Descrição da condição"
        value={newCondition.description}
        onChange={(e) => setNewCondition({...newCondition, description: e.target.value})}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </Grid>
    
    <Grid item xs={12}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddCondition}
        disabled={!isNoValueOperator(newCondition.operator) && !newCondition.value.trim()}
        fullWidth
        startIcon={<AddIcon />}
      >
        Adicionar
      </Button>
    </Grid>
  </Grid>
</Box>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="conditions-list">
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
              {(nodeData.conditions || []).length === 0 ? (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    bgcolor: 'background.default' 
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma condição adicionada. Adicione condições acima para criar saídas no nó.
                  </Typography>
                </Paper>
              ) : (
                (nodeData.conditions || []).map((condition, index) => (
                  <Draggable 
                    key={condition.id} 
                    draggableId={condition.id.toString()} 
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
                          sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: 'move' }}>
                              <DragIndicatorIcon color="action" fontSize="small" />
                            </Box>
                            
                            <Chip 
                              label={`Condição ${index + 1}`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            
                            <Box sx={{ flex: 1 }} />
                            
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveCondition(condition.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Operador</InputLabel>
                                <Select
                                  value={condition.operator || '=='}
                                  onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
                                  label="Operador"
                                >
                                  {operatorOptions.map((op) => (
                                    <MenuItem key={op.value} value={op.value}>
                                      <Tooltip title={op.description}>
                                        <Box component="span">{op.label}</Box>
                                      </Tooltip>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Valor"
                                value={condition.value || ''}
                                onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                                disabled={isNoValueOperator(condition.operator)}
                                helperText={isNoValueOperator(condition.operator) ? "Não requer valor" : ""}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            </Grid>
                            
                            <Grid item xs={12} sm={5}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Descrição (opcional)"
                                value={condition.description || ''}
                                onChange={(e) => handleConditionChange(condition.id, 'description', e.target.value)}
                                placeholder="Descrição para identificar esta condição"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1, fontSize: '0.75rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CodeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                              <Typography variant="caption" component="code">
                                Se <strong>{nodeData.variable}</strong> {getOperatorLabel(condition.operator || '==')} 
                                {!isNoValueOperator(condition.operator) && (
                                  <> "<strong>{condition.value}</strong>"</>
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </ListItem>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      
      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Por favor, corrija os erros no formulário antes de salvar.
        </Alert>
      )}
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
          Como funciona:
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Este nó permite ramificar o fluxo com base no valor da variável <strong>{nodeData.variable || 'selecionada'}</strong>.
          Cada condição adicionada cria uma saída específica no nó. O fluxo seguirá pelo caminho da primeira condição atendida.
          Se nenhuma condição for atendida, o fluxo seguirá pela saída padrão "default".
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 'bold' }}>
          Dica:
        </Typography>
        <Typography variant="caption" color="text.secondary">
          A ordem das condições é importante. Use as alças de arrasto para reorganizar as condições conforme necessário.
          As condições são avaliadas de cima para baixo, e a primeira que corresponder será executada.
        </Typography>
      </Box>
    </Box>
  );
};

export default ConditionalNodeDrawer;