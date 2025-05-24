import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { CallSplit as CallSplitIcon } from '@mui/icons-material';
import { Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const ConditionalNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const conditions = data.conditions || [];
  const reactFlowInstance = useReactFlow();
  
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    reactFlowInstance.deleteElements({ nodes: [{ id }] });
  }, [id, reactFlowInstance]);
  
  const handleDuplicate = useCallback((event) => {
    event.stopPropagation();
    
    // Clone the current node
    const position = reactFlowInstance.getNode(id).position;
    const newNode = {
      id: `conditional_${Date.now()}`,
      type: 'conditionalNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.conditional')} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    // Lógica para abrir o drawer de edição do nó
    console.log('Edit node', id);
  }, [id]);
  
  // Gera manipuladores adicionais para cada condição
  const getAdditionalHandles = () => {
    return conditions.map((condition, index) => ({
      id: `condition-${condition.id}`,
      type: 'source',
      position: Position.Right,
      data: { condition }
    }));
  };

  // Verifica se a condição é de tipo especial que não requer valor
  const isNoValueOperator = (operator) => {
    return ['validCPF', 'validCNPJ', 'validEmail'].includes(operator);
  };
  
  // Renderiza uma descrição amigável para condições especiais
  const getConditionDisplayText = (condition) => {
    if (isNoValueOperator(condition.operator)) {
      switch(condition.operator) {
        case 'validCPF': return 'CPF Válido';
        case 'validCNPJ': return 'CNPJ Válido';
        case 'validEmail': return 'Email Válido';
        default: return condition.value || '';
      }
    }
    return condition.value || '';
  };
  
  // Contar total de saídas
  const totalOutputs = conditions.length + 1; // +1 para a saída padrão
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="conditional"
      type={i18n.t('flowBuilder.nodes.conditional')}
      data={data}
      selected={selected}
      icon={CallSplitIcon}
      color={theme.palette.warning?.main || '#f59e0b'}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      additionalHandles={getAdditionalHandles()}
    >
      {data.variableName && (
        <Typography variant="caption" color="text.secondary" sx={{ 
          display: 'block', 
          mb: 1,
          bgcolor: alpha(theme.palette.info.light, 0.2),
          px: 1,
          py: 0.5,
          borderRadius: 0.5,
          display: 'flex',
          alignItems: 'center',
          width: 'fit-content'
        }}>
          <CodeIcon fontSize="inherit" sx={{ mr: 0.5, opacity: 0.7 }} />
          {i18n.t('flowBuilder.properties.variable')}: <Box component="span" sx={{ fontWeight: 'bold', ml: 0.5 }}>${data.variableName}</Box>
        </Typography>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {i18n.t('flowBuilder.properties.conditions')}:
      </Typography>
      
      {conditions.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {conditions.slice(0, 3).map((condition, index) => (
            <Chip
              key={index}
              label={getConditionDisplayText(condition)}
              size="small"
              sx={{ 
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                height: '24px',
                fontSize: '0.75rem',
              }}
            />
          ))}
          
          {conditions.length > 3 && (
            <Chip
              label={`+${conditions.length - 3}`}
              size="small"
              sx={{ 
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                height: '24px',
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
          {i18n.t('flowBuilder.messages.noConditions', 'Nenhuma condição definida')}
        </Typography>
      )}
      
      {/* Informação sobre saídas */}
      <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          ↳ Este nó tem {totalOutputs} saídas:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
          {conditions.map((condition, idx) => (
            <Typography key={idx} variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: theme.palette.warning.main,
                mr: 0.5 
              }} />
              {condition.description || getConditionDisplayText(condition) || `${i18n.t('flowBuilder.outputs.condition')} ${idx + 1}`} ({i18n.t('flowBuilder.outputs.right')})
            </Typography>
          ))}
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.info.main,
              mr: 0.5 
            }} />
            {i18n.t('flowBuilder.outputs.default')} ({i18n.t('flowBuilder.outputs.below')})
          </Typography>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(ConditionalNode);