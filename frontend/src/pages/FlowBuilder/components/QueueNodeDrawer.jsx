import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Avatar,
  Alert,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { QueuePlayNext as QueuePlayNextIcon, Info as InfoIcon, Code as CodeIcon } from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';

const QueueNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carregar filas disponíveis para atendimento
    const fetchQueues = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/queue');
        if (response.data && Array.isArray(response.data)) {
          setQueues(response.data);
          
          // Se já existe uma fila selecionada, encontrá-la na lista
          if (nodeData.queueId) {
            const queue = response.data.find(q => q.id === nodeData.queueId);
            if (queue) {
              setSelectedQueue(queue);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar filas:", error);
        setError("Não foi possível carregar a lista de filas.");
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
  }, [nodeData.queueId]);

  const handleQueueChange = (event, newValue) => {
    setSelectedQueue(newValue);
    onChange({
      ...nodeData,
      queueId: newValue ? newValue.id : null,
      queueName: newValue ? newValue.name : null
    });
  };

  const validateForm = () => {
    return !!selectedQueue;
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        InputLabelProps={{
          shrink: true,
      }}
      />

      {/* Alerta indicando que é um nó terminal */}
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
            {i18n.t('flowBuilder.queue.terminalDescription', 'Quando o atendimento é transferido para uma fila, o fluxo é encerrado. O ticket ficará pendente na fila selecionada.')}
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          fullWidth
          options={queues}
          loading={loading}
          value={selectedQueue}
          onChange={handleQueueChange}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label={i18n.t('flowBuilder.queue.selectQueue', 'Selecione a Fila')} 
              margin="normal"
              variant="outlined"
              error={!selectedQueue}
              helperText={!selectedQueue ? i18n.t('flowBuilder.queue.queueRequired', 'Fila é obrigatória') : ""}
              required
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
                sx={{
                  width: 30,
                  height: 30,
                  mr: 1,
                  bgcolor: option.color || '#7c3aed'
                }}
                alt={option.name}
              >
                {option.name.charAt(0).toUpperCase()}
              </Avatar>
              {option.name}
            </Box>
          )}
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Divider sx={{ mt: 3, mb: 2 }} />
      
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {i18n.t('flowBuilder.queue.helpText', 'Nota: O nó de fila transfere a conversa para uma fila específica. O fluxo será encerrado e o ticket ficará pendente na fila selecionada.')}
        </Typography>
      </Box>
    </Box>
  );
};

export default QueueNodeDrawer;