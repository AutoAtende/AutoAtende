import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PlayArrow as PlayArrowIcon, Link as LinkIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const TypebotNode = ({ id, data, selected }) => {
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
      id: `typebot_${Date.now()}`,
      type: 'typebotNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.typebot')} (${i18n.t('flowBuilder.actions.duplicate')})` }
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
      type={i18n.t('flowBuilder.nodes.typebot')}
      data={data}
      selected={selected}
      icon={PlayArrowIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
    >
      {data?.typebotIntegration?.name && (
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
          {data.typebotIntegration.name}
        </Box>
      )}
      
      {data?.typebotIntegration?.typebotUrl && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5, 
          mt: 1,
          fontSize: '0.75rem',
          color: theme.palette.text.secondary
        }}>
          <LinkIcon fontSize="small" />
          <Typography variant="caption" noWrap>
            {data.typebotIntegration.typebotUrl}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
        <Chip
          label={i18n.t('flowBuilder.nodes.automatedFlow')}
          size="small"
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
            color: theme.palette.text.primary,
            height: '22px',
            fontSize: '0.75rem'
          }}
        />
      </Box>
    </BaseFlowNode>
  );
};

export default memo(TypebotNode);