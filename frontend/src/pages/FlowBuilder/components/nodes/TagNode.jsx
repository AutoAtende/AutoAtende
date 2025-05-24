import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LocalOffer as LocalOfferIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const TagNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.success?.main || '#10b981';
  const reactFlowInstance = useReactFlow();
  
  // Remover logs desnecessários
  // console.log('TagNode renderizado com data:', data);
  
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    reactFlowInstance.deleteElements({ nodes: [{ id }] });
  }, [id, reactFlowInstance]);
  
  const handleDuplicate = useCallback((event) => {
    event.stopPropagation();
    
    // Clone the current node
    const position = reactFlowInstance.getNode(id).position;
    const newNode = {
      id: `tag_${Date.now()}`,
      type: 'tagNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.tag.title')} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    if (data.onEdit) {
      data.onEdit(id, data);
    }
  }, [id, data]);

  // Verificação mais segura para tags e operação
  const tags = data?.tags || [];
  const hasTags = Array.isArray(tags) && tags.length > 0;
  const operation = data?.operation || 'add';
  const operationText = operation === 'add' 
    ? i18n.t('flowBuilder.nodes.tag.addOperation') 
    : i18n.t('flowBuilder.nodes.tag.removeOperation');
  
  // Remover logs desnecessários
  // console.log('TagNode tags:', tags);
  // console.log('TagNode hasTags:', hasTags);
  
  return (
    <BaseFlowNode
      id={id}
      type={i18n.t('flowBuilder.nodes.tag.title')}
      data={data}
      selected={selected}
      icon={LocalOfferIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
    >
      <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
        {operationText}
      </Typography>
      
      {/* Tag chips */}
      {hasTags ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={tag.id || `tag-${index}`}
              label={tag.name || 'Tag sem nome'}
              size="small"
              icon={<LocalOfferIcon style={{ fontSize: '14px' }} />}
              sx={{ 
                bgcolor: alpha(nodeColor, 0.1),
                color: nodeColor,
                height: '22px',
                fontSize: '0.75rem'
              }}
            />
          ))}
          {tags.length > 3 && (
            <Chip
              label={`+${tags.length - 3}`}
              size="small"
              sx={{ 
                bgcolor: alpha(nodeColor, 0.1),
                color: nodeColor,
                height: '22px',
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ 
          fontStyle: 'italic', 
          fontSize: '0.75rem', 
          mt: 1 
        }}>
          {i18n.t('flowBuilder.nodes.tag.noTagsSelected')}
        </Typography>
      )}
    </BaseFlowNode>
  );
};

export default memo(TagNode);