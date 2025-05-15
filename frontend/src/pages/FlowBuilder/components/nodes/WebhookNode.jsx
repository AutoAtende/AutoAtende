import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { Http as HttpIcon, DataObject as DataObjectIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const WebhookNode = ({ id, data, selected }) => {
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
      id: `webhook_${Date.now()}`,
      type: 'webhookNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.webhook')} (${i18n.t('flowBuilder.actions.duplicate')})` }
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
      nodeType="webhook"
      type={i18n.t('flowBuilder.nodes.webhook')}
      data={data}
      selected={selected}
      icon={HttpIcon}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
    >
      {data.url && (
        <Box 
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.05)',
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
          {data.url}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
        <Chip
          label={data.method || 'GET'}
          size="small"
          sx={{ 
            bgcolor: 'rgba(0, 0, 0, 0.07)',
            color: 'text.primary',
            height: '22px',
            fontSize: '0.75rem'
          }}
        />
        
        {data.variableName && (
          <Chip
            icon={<DataObjectIcon style={{ fontSize: '14px' }} />}
            label={data.variableName}
            size="small"
            sx={{ 
              bgcolor: 'rgba(0, 0, 0, 0.07)',
              color: 'text.primary',
              height: '22px',
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>
    </BaseFlowNode>
  );
};

export default memo(WebhookNode);