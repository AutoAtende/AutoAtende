import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Comment as CommentIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const InternalMessageNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.secondary?.main || '#9333ea'; // Cor roxa para diferenciar
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
      id: `internalMessage_${Date.now()}`,
      type: 'internalMessageNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || 'Mensagem Interna'} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    if (data.onEdit) {
      data.onEdit(id);
    }
  }, [id, data]);
  
  // Função para exibir uma prévia da mensagem com formatação para variáveis
  const renderMessagePreview = () => {
    if (!data.message) return 'Sem mensagem configurada';
    
    // Substituir as variáveis por chips ou destacar de alguma forma
    const parts = data.message.split(/(\$\{[^}]+\})/g);
    
    return parts.map((part, index) => {
      if (part.match(/\$\{[^}]+\}/)) {
        // É uma variável
        const varName = part.match(/\$\{([^}]+)\}/)[1];
        return (
          <Chip
            key={index}
            size="small"
            label={varName}
            color="secondary"
            variant="outlined"
            icon={<CodeIcon style={{ fontSize: '0.8rem' }} />}
            sx={{ 
              height: '20px', 
              fontSize: '0.7rem',
              mx: 0.5,
              my: 0.25
            }}
          />
        );
      }
      
      // É texto normal
      return part;
    });
  };
  
  return (
    <BaseFlowNode
      id={id}
      type="Mensagem Interna"
      data={data}
      selected={selected}
      icon={CommentIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
    >
      <Box 
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: 1,
          p: 1,
          fontSize: '0.75rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          minHeight: '32px',
          mb: 1,
          lineHeight: 1.3
        }}
      >
        {renderMessagePreview()}
      </Box>
      
      {data.selectedVariable && (
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
          <Chip
            icon={<CodeIcon style={{ fontSize: '14px' }} />}
            label={data.selectedVariable}
            size="small"
            sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
              color: theme.palette.text.primary,
              height: '22px',
              fontSize: '0.75rem'
            }}
          />
        </Box>
      )}
    </BaseFlowNode>
  );
};

export default memo(InternalMessageNode);