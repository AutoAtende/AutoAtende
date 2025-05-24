import React, { memo, useCallback, useState, useEffect } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip, Avatar, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import api from '../../../../services/api';
import { i18n } from "../../../../translate/i18n";
import { toast } from "../../../../helpers/toast";

const AttendantNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.info?.main || '#0ea5e9';
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
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
      id: `attendant_${Date.now()}`,
      type: 'attendantNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { 
        ...data, 
        label: `${data.label || i18n.t('flowBuilder.nodes.attendant')} (${i18n.t('flowBuilder.actions.duplicate')})`,
        endFlowFlag: true // Garantir que o nó duplicado também é terminal
      }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    if (data.onEdit) {
      data.onEdit(id);
    }
  }, [id, data]);
  
  useEffect(() => {
    // Carregar usuários com suas filas para exibição no nó
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carregar usuários
        const response = await api.get('/flow-builder/nodes/attendant/users');
        
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          
          // Extrair todas as filas únicas dos usuários
          const allQueues = [];
          response.data.users.forEach(user => {
            if (user.queues && Array.isArray(user.queues)) {
              user.queues.forEach(queue => {
                if (!allQueues.some(q => q.id === queue.id)) {
                  allQueues.push(queue);
                }
              });
            }
          });
          
          setQueues(allQueues);
        } else {
          console.error("Formato de resposta inesperado:", response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados de atendentes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Encontrar o usuário e a fila selecionados
  const selectedUser = data.assignedUserId ? 
    users.find(user => user.id === data.assignedUserId) : null;
    
  const selectedQueue = data.queueId ? 
    queues.find(queue => queue.id === data.queueId) : null;
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="attendant"
      type={i18n.t('flowBuilder.nodes.attendant')}
      data={data}
      selected={selected}
      icon={PersonAddIcon}
      color={nodeColor}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
      handles={{
        source: { enabled: false }, // Desabilitar saída pois é um nó terminal
        target: { enabled: true, position: Position.Top }
      }}
      isTerminal={true} // Definir como terminal
    >
      <Box sx={{ mt: 1 }}>
        {selectedUser && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              avatar={
                <Avatar 
                  sx={{ bgcolor: selectedUser.color || (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)') }}
                  alt={selectedUser.name}
                >
                  {selectedUser.name.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={selectedUser.name}
              size="small"
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
                color: theme.palette.text.primary,
                fontSize: '0.75rem'
              }}
            />
          </Box>
        )}
        
        {selectedQueue && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={selectedQueue.name}
              size="small"
              sx={{ 
                height: '20px',
                fontSize: '0.7rem',
                bgcolor: selectedQueue.color ? `${selectedQueue.color}20` : 'default',
                color: selectedQueue.color,
                border: `1px solid ${selectedQueue.color}`
              }}
            />
          </Box>
        )}
        
        {data.timeoutSeconds && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {i18n.t('flowBuilder.properties.timeout')}: {data.timeoutSeconds} {i18n.t('flowBuilder.units.seconds')}
          </Typography>
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

export default memo(AttendantNode);