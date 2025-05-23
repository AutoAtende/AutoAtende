import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Event as EventIcon, 
  Info as InfoIcon, 
  Code as CodeIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';
import api from '../../../../services/api';

const AppointmentNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para campos do formulário
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);
  
  // Carregar dados do nó se existir
  useEffect(() => {
    const fetchNodeData = async () => {
      if (nodeData.id) {
        try {
          setLoading(true);
          setError(null);
          
          const response = await api.get(`/flow-builder/appointment-node/${nodeData.id}`);
          
          if (response.data && response.data.configuration) {
            setWelcomeMessage(response.data.configuration.welcomeMessage || '');
            setTimeoutMinutes(response.data.configuration.timeoutMinutes || 30);
          }
        } catch (err) {
          console.error("Erro ao carregar dados do nó de agendamento:", err);
          setError("Não foi possível carregar os dados do nó de agendamento.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    // Inicializar com dados do nodeData se estiver disponível
    if (nodeData.configuration) {
      setWelcomeMessage(nodeData.configuration.welcomeMessage || '');
      setTimeoutMinutes(nodeData.configuration.timeoutMinutes || 30);
    } else {
      // Se não tiver dados, definir valores padrão
      setWelcomeMessage('Bem-vindo ao sistema de agendamento!');
      setTimeoutMinutes(30);
    }
    
    fetchNodeData();
  }, [nodeData.id, nodeData.configuration]);
  
  // Atualizar dados do nó
  const handleUpdateNodeData = () => {
    const configuration = {
      welcomeMessage,
      timeoutMinutes
    };
    
    onChange({
      ...nodeData,
      configuration,
      endFlowFlag: true // Sempre é um nó terminal
    });
  };
  
  // Atualizar os campos do formulário
  const handleWelcomeMessageChange = (e) => {
    setWelcomeMessage(e.target.value);
    handleUpdateNodeData();
  };
  
  const handleTimeoutChange = (e, newValue) => {
    setTimeoutMinutes(newValue);
    handleUpdateNodeData();
  };
  
  return (
    <Box sx={{ p: 2 }}>      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        variant="outlined"
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
            {i18n.t('flowBuilder.appointment.terminalDescription', 'Ao iniciar o agendamento, o fluxo é encerrado. Nenhuma conexão de saída será processada.')}
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Configurações do Agendamento
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Mensagem de Boas-vindas"
          value={welcomeMessage}
          onChange={handleWelcomeMessageChange}
          margin="normal"
          variant="outlined"
          placeholder="Mensagem que será exibida no início do processo de agendamento"
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>
            Tempo limite (minutos): {timeoutMinutes}
          </Typography>
          <Slider
            value={timeoutMinutes}
            onChange={handleTimeoutChange}
            aria-labelledby="timeout-slider"
            valueLabelDisplay="auto"
            step={5}
            marks
            min={5}
            max={60}
          />
          <Typography variant="caption" color="text.secondary">
            Tempo máximo para o contato concluir o processo de agendamento
          </Typography>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Divider sx={{ mt: 3, mb: 2 }} />
      
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          O nó de agendamento permite que seus contatos agendem horários através do chatbot. Ele inicia um fluxo de conversação guiado para coleta de informações e seleção de datas e horários disponíveis.
        </Typography>
      </Box>
    </Box>
  );
};

export default AppointmentNodeDrawer;