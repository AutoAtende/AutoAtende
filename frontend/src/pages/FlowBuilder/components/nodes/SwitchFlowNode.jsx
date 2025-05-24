import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SwapCalls as SwapCallsIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const SwitchFlowNode = ({ id, data, selected }) => {
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
      id: `switchflow_${Date.now()}`,
      type: 'switchFlowNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.switchFlow')} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    // Lógica para abrir o drawer de edição do nó
    console.log('Edit node', id);
  }, [id]);
  
  return (
    <BaseFlowNode
      id={id}
      type={i18n.t('flowBuilder.nodes.switchFlow')}
      data={data}
      selected={selected}
      icon={SwapCallsIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      handles={{
        source: { enabled: false },
        target: { enabled: true, position: Position.Top }
      }}
    >
      {data.targetFlowId && (
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
          {i18n.t('flowBuilder.properties.flow')}: {data.targetFlowName || `ID ${data.targetFlowId}`}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
        {data.transferVariables && (
          <Chip
            label={i18n.t('flowBuilder.actions.transferVariables')}
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
    </BaseFlowNode>
  );
};

export default memo(SwitchFlowNode);