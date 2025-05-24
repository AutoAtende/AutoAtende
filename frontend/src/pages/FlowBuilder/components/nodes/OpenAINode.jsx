import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SmartToy as SmartToyIcon, Psychology as PsychologyIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const OpenAINode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.info?.dark || '#0ea5e9';
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
      id: `openai_${Date.now()}`,
      type: 'openaiNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.openai')} (${i18n.t('flowBuilder.actions.duplicate')})` }
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
      type={i18n.t('flowBuilder.nodes.openai')}
      data={data}
      selected={selected}
      icon={PsychologyIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      handles={{
        source: { enabled: false }, // Desabilitando a saída
        target: { enabled: true, position: Position.Top }
      }}
      isTerminal={true} // Indica que é um nó terminal
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
      
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
        {data?.typebotIntegration?.voice && data.typebotIntegration.voice !== "texto" && (
          <Chip
            icon={<SmartToyIcon style={{ fontSize: '14px' }} />}
            label={i18n.t('flowBuilder.nodes.withVoice')}
            size="small"
            sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
              color: theme.palette.text.primary,
              height: '22px',
              fontSize: '0.75rem'
            }}
          />
        )}
        
        {data?.typebotIntegration?.maxMessages && (
          <Chip
            label={`${i18n.t('flowBuilder.properties.maxMessages')}: ${data.typebotIntegration.maxMessages}`}
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

      <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {i18n.t('flowBuilder.nodes.terminalNode', 'Este é um nó terminal - o fluxo encerra aqui')}
        </Typography>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(OpenAINode);