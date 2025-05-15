import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Event as EventIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const AppointmentNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.success?.main || '#10b981';
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
      id: `appointment_${Date.now()}`,
      type: 'appointmentNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { 
        ...data, 
        label: `${data.label || 'Agendamento'} (${i18n.t('flowBuilder.actions.duplicate')})`,
        endFlowFlag: true // Garantir que o nó duplicado também é terminal
      }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    if (data.onEdit) {
      data.onEdit(id);
    }
  }, [id, data]);

  // Obter detalhes da configuração, se disponível
  const timeoutMinutes = data.configuration?.timeoutMinutes || 30;
  const welcomeMessage = data.configuration?.welcomeMessage || '';
  
  return (
    <BaseFlowNode
      id={id}
      type={i18n.t('flowBuilder.nodes.appointment', 'Agendamento')}
      data={data}
      selected={selected}
      icon={EventIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      handles={{
        source: { enabled: false }, // Desabilitar saída pois é um nó terminal
        target: { enabled: true, position: Position.Top }
      }}
      isTerminal={true} // Definir como terminal
    >
      {welcomeMessage && (
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
          {welcomeMessage}
        </Box>
      )}
      
      <Chip
        label={`Tempo limite: ${timeoutMinutes} min`}
        size="small"
        sx={{ 
          height: '22px',
          fontSize: '0.75rem',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
          color: theme.palette.text.primary,
        }}
      />
      
      <Box 
        sx={{ 
          mt: 2,
          pt: 1,
          borderTop: `1px dashed ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Chip
          label={i18n.t('flowBuilder.appointment.endFlow', 'Inicia agendamento')}
          size="small"
          color="success"
          variant="outlined"
          sx={{ height: '20px', fontSize: '0.7rem' }}
        />
      </Box>
    </BaseFlowNode>
  );
};

export default memo(AppointmentNode);