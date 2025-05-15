import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Menu as MenuIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const MenuNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const menuOptions = data.menuOptions || [];
  const nodeColor = theme.palette.primary.main; // Usando a cor primária para maior consistência
  const reactFlowInstance = useReactFlow();
  
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    reactFlowInstance.deleteElements({ nodes: [{ id }] });
  }, [id, reactFlowInstance]);
  
  const handleDuplicate = useCallback((event) => {
    event.stopPropagation();
    
    const position = reactFlowInstance.getNode(id).position;
    const newNode = {
      id: `menu_${Date.now()}`,
      type: 'menuNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || 'Menu'} (Duplicado)` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  // Gera manipuladores adicionais para cada opção do menu
  const getAdditionalHandles = () => {
    return menuOptions.map((option, index) => ({
      id: `menu-option-${option.id || index}`,
      type: 'source',
      position: Position.Right,
      data: { option }
    }));
  };
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="menu"
      type="Menu"
      data={data}
      selected={selected}
      icon={MenuIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      additionalHandles={getAdditionalHandles()}
    >
      {data.menuTitle && (
        <Box 
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: 1,
            p: 1,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          {data.menuTitle}
        </Box>
      )}
      
      {menuOptions.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuOptions.slice(0, 3).map((option, index) => (
            <Chip
              key={index}
              label={`${index + 1}. ${option.text}`}
              size="small"
              sx={{ 
                bgcolor: alpha(nodeColor, 0.1),
                color: nodeColor,
                height: '24px',
                fontSize: '0.75rem',
                justifyContent: 'flex-start'
              }}
            />
          ))}
          
          {menuOptions.length > 3 && (
            <Chip
              label={`+ ${menuOptions.length - 3} opções`}
              size="small"
              sx={{ 
                bgcolor: alpha(nodeColor, 0.1),
                color: nodeColor,
                height: '24px',
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
          Nenhuma opção configurada
        </Typography>
      )}
      
      <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          ↳ Este nó tem {menuOptions.length + 1} saídas:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
          {menuOptions.map((option, idx) => (
            <Typography key={idx} variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: theme.palette.success.main,
                mr: 0.5 
              }} />
              {option.text || `Opção ${idx + 1}`} ({i18n.t('flowBuilder.outputs.right')})
            </Typography>
          ))}
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.info.main,
              mr: 0.5 
            }} />
            {i18n.t('flowBuilder.outputs.noSelection', 'Nenhuma seleção')} ({i18n.t('flowBuilder.outputs.below')})
          </Typography>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(MenuNode);