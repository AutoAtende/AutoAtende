import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Http as HttpIcon, DataObject as DataObjectIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const WebhookNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.secondary?.main || '#9333ea';
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
  
  // Webhook Node pode ter handle de erro
  const getAdditionalHandles = () => {
    return [{
      id: 'error',
      type: 'source',
      position: Position.Right,
      data: { type: 'error' }
    }];
  };
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="webhook"
      type={i18n.t('flowBuilder.nodes.webhook')}
      data={data}
      selected={selected}
      icon={HttpIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      additionalHandles={getAdditionalHandles()}
    >
      {data.url && (
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
          {data.url}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
        <Chip
          label={data.method || 'GET'}
          size="small"
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
            color: theme.palette.text.primary,
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
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
              color: theme.palette.text.primary,
              height: '22px',
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>
      
      {/* Informação sobre saídas */}
      <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          ↳ Este nó tem 2 saídas:
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
            {i18n.t('flowBuilder.outputs.success')} ({i18n.t('flowBuilder.outputs.below')})
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.error.main,
              mr: 0.5 
            }} />
            {i18n.t('flowBuilder.outputs.error')} ({i18n.t('flowBuilder.outputs.right')})
          </Typography>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(WebhookNode);