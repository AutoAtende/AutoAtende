import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccessTime as AccessTimeIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const ScheduleNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.info?.main || '#0ea5e9';
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
      id: `schedule_${Date.now()}`,
      type: 'scheduleNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || 'Verificação de Horário'} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    if (data.onEdit) {
      data.onEdit(id);
    }
  }, [id, data]);
  
  // Schedule Node tem dois handles de saída: "dentro" e "fora"
  const getAdditionalHandles = () => {
    return [
      {
        id: 'dentro',
        type: 'source',
        position: Position.Right,
        data: { type: 'success' }
      },
      {
        id: 'fora',
        type: 'source',
        position: Position.Right,
        data: { type: 'error' }
      }
    ];
  };
  
  // Obter nome do grupo de horário, se existir
  const getHorarioGroupName = () => {
    return data.horarioGroupName || (data.horarioGroupId ? `Grupo ID: ${data.horarioGroupId}` : 'Todos os horários');
  };
  
  return (
    <BaseFlowNode
      id={id}
      type="Verificação de Horário"
      data={data}
      selected={selected}
      icon={AccessTimeIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      additionalHandles={getAdditionalHandles()}
      handles={{
        source: { enabled: false, position: null }, // Desativa a saída padrão na parte inferior
        target: { enabled: true, position: Position.Top } // Mantém a entrada na parte superior
      }}
    >
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {i18n.t('flowBuilder.scheduleNode.checkingTitle', 'Verificando horário de funcionamento')}
        </Typography>
        
        <Chip
          label={getHorarioGroupName()}
          size="small"
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
            color: theme.palette.text.primary,
            height: '22px',
            fontSize: '0.75rem'
          }}
        />
        
        <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary">
            ↳ {i18n.t('flowBuilder.outputs.title', 'Saídas')}:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: theme.palette.success.main,
                mr: 0.5 
              }} />
              {i18n.t('flowBuilder.scheduleNode.insideOutput', 'Dentro do horário')} ({i18n.t('flowBuilder.outputs.right')})
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: theme.palette.error.main,
                mr: 0.5 
              }} />
              {i18n.t('flowBuilder.scheduleNode.outsideOutput', 'Fora do horário')} ({i18n.t('flowBuilder.outputs.right')})
            </Typography>
          </Box>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(ScheduleNode);