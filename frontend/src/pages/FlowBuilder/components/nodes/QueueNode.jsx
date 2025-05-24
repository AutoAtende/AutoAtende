import React, { memo, useCallback, useState, useEffect } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { QueuePlayNext as QueuePlayNextIcon, Code as CodeIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import api from '../../../../services/api';
import { i18n } from "../../../../translate/i18n";

const QueueNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.secondary?.dark || '#7c3aed';
  const [queues, setQueues] = useState([]);
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
      id: `queue_${Date.now()}`,
      type: 'queueNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.queue')} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    // Lógica para abrir o drawer de edição do nó
    console.log('Edit node', id);
  }, [id]);
  
  useEffect(() => {
    // Carregar filas disponíveis (apenas para visualização no nó)
    const fetchQueues = async () => {
      try {
        const response = await api.get('/queue');
        if (response.data && Array.isArray(response.data)) {
          setQueues(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar filas:", error);
      }
    };

    fetchQueues();
  }, []);

  // Encontrar a fila selecionada
  const selectedQueue = data.queueId ? 
    queues.find(queue => queue.id === data.queueId) : null;
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="queue"
      type={i18n.t('flowBuilder.nodes.queue')}
      data={data}
      selected={selected}
      icon={QueuePlayNextIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      handles={{
        source: { enabled: false }, // Desabilitar saída pois é um nó terminal
        target: { enabled: true, position: Position.Top }
      }}
      isTerminal={true} // Definir como nó terminal
    >
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" display="block">
          {i18n.t('flowBuilder.queue.transferTo')}
        </Typography>
        
        {selectedQueue && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              avatar={
                <Avatar 
                  sx={{ bgcolor: selectedQueue.color || theme.palette.secondary.main }}
                  alt={selectedQueue.name}
                >
                  {selectedQueue.name.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={selectedQueue.name}
              size="small"
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
                color: theme.palette.text.primary,
                fontSize: '0.75rem'
              }}
            />
          </Box>
        )}
        
        {/* Informação sobre ser terminal */}
        <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {i18n.t('flowBuilder.nodes.terminalNode', 'Este é um nó terminal - o fluxo encerra aqui')}
          </Typography>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(QueueNode);