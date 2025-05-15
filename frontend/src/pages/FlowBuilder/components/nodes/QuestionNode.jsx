import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  QuestionAnswer as QuestionAnswerIcon, 
  List as ListIcon,
  Error as ErrorIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const QuestionNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.warning?.main || '#f59e0b';
  const options = data.options || [];
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
      id: `question_${Date.now()}`,
      type: 'questionNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.question')} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    // Lógica para abrir o drawer de edição do nó
    if (data.onEdit) {
      data.onEdit(id);
    }
  }, [id, data]);
  
  // Gera manipuladores adicionais para cada opção e para erro de validação
  const getAdditionalHandles = () => {
    const handles = [];
    
    // Adicionar handle para opções
    if (options.length > 0) {
      options.forEach((option, index) => {
        handles.push({
          id: `option-${option.id || index}`,
          type: 'source',
          position: Position.Right,
          data: { option, type: 'success' } // Adicionando tipo 'success' para cor verde
        });
      });
    }
    
    // Adicionar handle para erro de validação se necessário
    if (data.useValidationErrorOutput && 
        (data.inputType === 'email' || 
         data.inputType === 'cpf' || 
         data.inputType === 'cnpj' || 
         data.validationType === 'email' || 
         data.validationType === 'cpf' || 
         data.validationType === 'cnpj' || 
         data.validationType === 'regex')) {
      handles.push({
        id: 'validation-error',
        type: 'source',
        position: Position.Right,
        data: { type: 'error', description: 'Erro de validação' }
      });
    }
    
    return handles;
  };

  // Determinar qual validação está ativa
  const getActiveValidationType = () => {
    // Validação direta pelo tipo de entrada
    if (['email', 'cpf', 'cnpj'].includes(data.inputType)) {
      return data.inputType;
    }
    // Validação pelo tipo de validação selecionado
    if (['email', 'cpf', 'cnpj', 'regex'].includes(data.validationType)) {
      return data.validationType;
    }
    return null;
  };
  
  const activeValidationType = getActiveValidationType();
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="question"
      type={i18n.t('flowBuilder.nodes.question')}
      data={data}
      selected={selected}
      icon={QuestionAnswerIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      additionalHandles={getAdditionalHandles()}
    >
      {data.question && (
        <Box 
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: 1,
            p: 1,
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '32px',
            mb: 1
          }}
        >
          {data.question}
        </Box>
      )}
      
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
      {/* Informação de tipo de entrada/validação */}
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
        <Chip
          label={i18n.t(`flowBuilder.inputTypes.${data.inputType}`, data.inputType)}
          size="small"
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
            color: theme.palette.text.primary,
            height: '22px',
            fontSize: '0.75rem'
          }}
        />

        {activeValidationType && (
          <Chip
            label={i18n.t(`flowBuilder.validationTypes.${activeValidationType}`, `Validação: ${activeValidationType}`)}
            size="small"
            sx={{ 
              bgcolor: theme.palette.info.light,
              color: theme.palette.info.contrastText,
              height: '22px',
              fontSize: '0.75rem'
            }}
          />
        )}

        {data.useValidationErrorOutput && activeValidationType && (
          <Chip
            icon={<ErrorIcon style={{ fontSize: '14px' }} />}
            label={i18n.t('flowBuilder.validationErrorOutput', 'Saída para erro')}
            size="small"
            sx={{ 
              bgcolor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
              height: '22px',
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>
      
      {options.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          <ListIcon fontSize="small" sx={{ opacity: 0.7, mr: 0.5 }} />
          {options.slice(0, 3).map((option, index) => (
            <Chip
              key={index}
              label={option.text}
              size="small"
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
                color: theme.palette.text.primary,
                height: '22px',
                fontSize: '0.75rem'
              }}
            />
          ))}
          {options.length > 3 && (
            <Chip
              label={`+${options.length - 3}`}
              size="small"
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
                color: theme.palette.text.primary,
                height: '22px',
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>
      )}
      
      <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          ↳ {i18n.t('flowBuilder.outputs.title', 'Saídas')}:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
          {options.map((option, idx) => (
            <Typography key={idx} variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: theme.palette.success.main, // Verde para opções (correto)
                mr: 0.5 
              }} />
              {option.text || `${i18n.t('flowBuilder.outputs.option')} ${idx + 1}`} ({i18n.t('flowBuilder.outputs.right')})
            </Typography>
          ))}
          
          {/* Mostrar saída de erro de validação se estiver configurada */}
          {data.useValidationErrorOutput && activeValidationType && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: theme.palette.error.main, // Vermelho para erro de validação
                mr: 0.5 
              }} />
              {i18n.t('flowBuilder.outputs.validationError', 'Erro de validação')} ({i18n.t('flowBuilder.outputs.right')})
            </Typography>
          )}
          
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.info.main, // Cor padrão para outras respostas
              mr: 0.5 
            }} />
            {i18n.t('flowBuilder.outputs.otherResponses', 'Outras respostas')} ({i18n.t('flowBuilder.outputs.below')})
          </Typography>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(QuestionNode);