import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Image as ImageIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const ImageNode = ({ id, data, selected }) => {
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
      id: `image_${Date.now()}`,
      type: 'imageNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.image')} (${i18n.t('flowBuilder.actions.duplicate')})` }
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
      nodeType="image"
      type={i18n.t('flowBuilder.nodes.image')}
      data={data}
      selected={selected}
      icon={ImageIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
    >
      {data.mediaUrl && (
        <Box 
          sx={{
            width: '100%',
            height: 100,
            borderRadius: 1,
            overflow: 'hidden',
            mb: 1,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.1)',
              zIndex: 1
            }
          }}
        >
          <img 
            src={data.mediaUrl} 
            alt={data.label || i18n.t('flowBuilder.preview')} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'relative',
              zIndex: 0
            }}
          />
        </Box>
      )}
      
      {data.caption && (
        <Tooltip title={data.caption} placement="top">
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
            }}
          >
            {data.caption}
          </Box>
        </Tooltip>
      )}
      
      {/* Informação sobre saídas */}
      <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          ↳ Este nó tem 1 saída:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Box component="span" sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: theme.palette.info.main
          }} />
          <Typography variant="caption">
            {i18n.t('flowBuilder.outputs.default')} ({i18n.t('flowBuilder.outputs.below')})
          </Typography>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(ImageNode);