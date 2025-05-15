import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  Avatar,
  Alert,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Info as InfoIcon, Code as CodeIcon } from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

const AttendantNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formValidation, setFormValidation] = useState({ isValid: true, message: '' });
  
  // Filas disponíveis para o usuário selecionado
  const userQueues = selectedUser?.queues || [];
  
  // Carregar usuários disponíveis
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar usuários com suas filas
        const response = await api.get('/flow-builder/nodes/attendant/users');
        
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          
          // Se já existe um usuário selecionado, encontrá-lo na lista
          if (nodeData.assignedUserId) {
            const user = response.data.users.find(u => u.id === nodeData.assignedUserId);
            if (user) {
              setSelectedUser(user);
              
              // Se já tem uma fila selecionada, verificar se o usuário tem acesso
              if (nodeData.queueId && user.queues) {
                const queue = user.queues.find(q => q.id === nodeData.queueId);
                if (queue) {
                  setSelectedQueue(queue);
                } else {
                  // Se o usuário não tem acesso a esta fila, limpar seleção
                  setSelectedQueue(null);
                  onChange({
                    ...nodeData,
                    queueId: null
                  });
                }
              }
            }
          }
        } else {
          console.error("Formato de resposta inesperado:", response.data);
          setError("Formato de resposta inesperado do servidor.");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar usuários");
        setError("Não foi possível carregar os dados. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nodeData.assignedUserId, nodeData.queueId]);

  const handleUserChange = (event, newValue) => {
    setSelectedUser(newValue);
    
    // Quando o usuário muda, verificar se a fila atual é válida
    if (newValue) {
      // Verificar se o usuário tem filas
      if (newValue.queues && newValue.queues.length > 0) {
        // Verificar se a fila atual está entre as do usuário
        const currentQueueStillValid = selectedQueue && 
                                      newValue.queues.some(q => q.id === selectedQueue.id);
        
        if (!currentQueueStillValid) {
          // Limpar a seleção de fila
          setSelectedQueue(null);
        }
        
        onChange({
          ...nodeData,
          assignmentType: 'manual', // Sempre manual conforme requisito
          assignedUserId: newValue.id,
          queueId: currentQueueStillValid ? selectedQueue.id : null
        });
      } else {
        // Usuário sem filas
        setSelectedQueue(null);
        onChange({
          ...nodeData,
          assignmentType: 'manual',
          assignedUserId: newValue.id,
          queueId: null
        });
      }
    } else {
      // Nenhum usuário selecionado
      setSelectedQueue(null);
      onChange({
        ...nodeData,
        assignmentType: 'manual',
        assignedUserId: null,
        queueId: null
      });
    }
    
    validateForm(newValue);
  };

  const handleQueueChange = (event, newValue) => {
    setSelectedQueue(newValue);
    onChange({
      ...nodeData,
      queueId: newValue ? newValue.id : null
    });
  };

  const validateForm = (user = selectedUser) => {
    // Validação: usuário é obrigatório para atribuição manual
    if (!user) {
      setFormValidation({ 
        isValid: false, 
        message: i18n.t('flowBuilder.attendant.attendantRequired', "É necessário selecionar um atendente")
      });
      return false;
    }
    
    setFormValidation({ isValid: true, message: '' });
    return true;
  };

  const handleTimeoutChange = (event) => {
    const value = parseInt(event.target.value, 10);
    // Validação de valores numéricos
    if (isNaN(value) || value < 0) {
      return;
    }
    onChange({
      ...nodeData,
      timeoutSeconds: value
    });
  };

  // Sempre mantemos endFlowFlag como true para o nó de atendente
  useEffect(() => {
    if (nodeData.endFlowFlag !== true) {
      onChange({
        ...nodeData,
        endFlowFlag: true
      });
    }
  }, [nodeData.endFlowFlag, onChange]);
  
  return (
    <Box sx={{ p: 2 }}>      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        placeholder="Ex: Transferir para atendente"
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      {/* Campo oculto para assignmentType, sempre manual */}
      <input 
        type="hidden" 
        name="assignmentType"
        value="manual"
      />
      
      {/* Seleção de atendente */}
      <Autocomplete
        fullWidth
        options={users}
        loading={loading}
        value={selectedUser}
        onChange={handleUserChange}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label={i18n.t('flowBuilder.attendant.selectAttendant', 'Selecione o Atendente')} 
            margin="normal"
            variant="outlined"
            error={!formValidation.isValid}
            helperText={!formValidation.isValid ? formValidation.message : ""}
            required={true}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
            <Avatar 
              sx={{ width: 30, height: 30, mr: 1, bgcolor: option.color || '#7367F0' }}
              alt={option.name}
            >
              {option.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              {option.name}
              <Typography variant="caption" color="text.secondary" display="block">
                {option.profile}
              </Typography>
            </Box>
            {option.online && (
              <Chip 
                label={i18n.t('online')} 
                size="small" 
                color="success" 
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}
      />
      
      {/* Seleção de fila - aparece somente se um atendente estiver selecionado e tiver filas */}
      {selectedUser && userQueues.length > 0 && (
        <Autocomplete
          fullWidth
          options={userQueues}
          loading={loading}
          value={selectedQueue}
          onChange={handleQueueChange}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label={i18n.t('flowBuilder.attendant.selectQueue', 'Selecione a Fila')} 
              margin="normal"
              variant="outlined"
              helperText={i18n.t('flowBuilder.attendant.queueHelp', 'Selecione uma das filas que este atendente tem acesso')}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
              <Box 
                sx={{ 
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  mr: 1,
                  bgcolor: option.color || '#7367F0'
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                {option.name}
              </Box>
            </Box>
          )}
        />
      )}
      
      {/* Mensagem quando o usuário não tem filas */}
      {selectedUser && userQueues.length === 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {i18n.t('flowBuilder.attendant.noQueues', 'Este atendente não tem acesso a nenhuma fila.')}
        </Alert>
      )}
      
      <TextField
        fullWidth
        type="number"
        label={i18n.t('flowBuilder.attendant.timeout', 'Timeout (segundos)')}
        value={nodeData.timeoutSeconds || ''}
        onChange={handleTimeoutChange}
        margin="normal"
        InputProps={{ inputProps: { min: 0 } }}
        helperText={i18n.t('flowBuilder.attendant.timeoutHelp', 'Tempo máximo de espera para atendimento')}
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      {/* Mensagem explicativa sobre comportamento de nó terminal */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          my: 2, 
          backgroundColor: 'info.light', 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1
        }}
      >
        <InfoIcon color="info" sx={{ mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {i18n.t('flowBuilder.nodes.terminalNodeTitle', 'Nó Terminal')}
          </Typography>
          <Typography variant="body2">
            {i18n.t('flowBuilder.attendant.terminalDescription', 'Ao transferir para um atendente, o fluxo será automaticamente encerrado. Nenhuma conexão de saída será processada.')}
          </Typography>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Divider sx={{ mt: 3, mb: 2 }} />
      
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {i18n.t('flowBuilder.attendant.helpText', 'Nota: O nó de atendente transfere a conversa para um atendente humano específico. Após selecionar o atendente, você pode escolher a fila para a qual o ticket será direcionado.')}
        </Typography>
      </Box>
    </Box>
  );
};

export default AttendantNodeDrawer;