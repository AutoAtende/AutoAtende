import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDashboardContext } from '../context/DashboardContext';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 500
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3)
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1)
}));

const DashboardConfigModal = ({ open, onClose }) => {
  const { 
    dashboardSettings, 
    updateDashboardSettings, 
    updateComponentVisibility,
    resetToDefault,
    queues,
    dateRange,
    setDateRange
  } = useDashboardContext();

  // Estado local para gerenciar as configurações antes de salvar
  const [localSettings, setLocalSettings] = useState({
    defaultDateRange: 7,
    defaultQueue: 'all',
    componentVisibility: {
      messagesCard: true,
      responseTimeCard: true,
      clientsCard: true,
      messagesByDayChart: true,
      messagesByUserChart: true,
      comparativeTable: true,
      prospectionTable: true,
      brazilMap: true,
    }
  });

  // Sincronizar estado local com as configurações do dashboard
  useEffect(() => {
    if (dashboardSettings) {
      setLocalSettings(dashboardSettings);
    }
  }, [dashboardSettings, open]);

  // Handler para alterações de visibilidade de componentes
  const handleVisibilityChange = (componentKey) => (event) => {
    const newVisibility = {
      ...localSettings.componentVisibility,
      [componentKey]: event.target.checked
    };
    
    setLocalSettings({
      ...localSettings,
      componentVisibility: newVisibility
    });
  };

  // Handler para alteração do intervalo de datas padrão
  const handleDateRangeChange = (event) => {
    setLocalSettings({
      ...localSettings,
      defaultDateRange: event.target.value
    });
  };

  // Handler para alteração da fila padrão
  const handleQueueChange = (event) => {
    setLocalSettings({
      ...localSettings,
      defaultQueue: event.target.value
    });
  };

  // Handler para salvar configurações
  const handleSaveSettings = async () => {
    try {
      // Atualizar configurações no backend
      await updateDashboardSettings(localSettings);
      
      // Aplicar configurações no frontend
      if (localSettings.defaultDateRange !== dateRange) {
        setDateRange(localSettings.defaultDateRange);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  // Handler para resetar para configurações padrão
  const handleResetSettings = async () => {
    try {
      await resetToDefault();
      onClose();
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
    }
  };

  const dateRangeOptions = [
    { value: 7, label: 'Últimos 7 dias' },
    { value: 15, label: 'Últimos 15 dias' },
    { value: 30, label: 'Últimos 30 dias' },
  ];

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Configurações do Dashboard</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <SectionTitle variant="h6">Preferências Gerais</SectionTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Período Padrão</InputLabel>
              <Select
                value={localSettings.defaultDateRange}
                onChange={handleDateRangeChange}
                label="Período Padrão"
              >
                {dateRangeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Setor Padrão</InputLabel>
              <Select
                value={localSettings.defaultQueue}
                onChange={handleQueueChange}
                label="Setor Padrão"
              >
                {queues.map(queue => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ mt: 2 }}>
          <SectionTitle variant="h6">Visibilidade dos Componentes</SectionTitle>
          <List>
            <ListItem>
              <ListItemText primary="Card de Mensagens Enviadas" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.messagesCard}
                onChange={handleVisibilityChange('messagesCard')}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Card de Tempo Médio de Resposta" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.responseTimeCard}
                onChange={handleVisibilityChange('responseTimeCard')}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Card de Clientes Interagidos" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.clientsCard}
                onChange={handleVisibilityChange('clientsCard')}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Gráfico de Mensagens por Dia" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.messagesByDayChart}
                onChange={handleVisibilityChange('messagesByDayChart')}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Gráfico de Mensagens por Usuário" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.messagesByUserChart}
                onChange={handleVisibilityChange('messagesByUserChart')}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Tabela Comparativa de Setores" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.comparativeTable}
                onChange={handleVisibilityChange('comparativeTable')}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Tabela de Prospecção por Usuário" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.prospectionTable}
                onChange={handleVisibilityChange('prospectionTable')}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Mapa de Atendimento por Estado" />
              <Switch
                edge="end"
                checked={localSettings.componentVisibility.brazilMap}
                onChange={handleVisibilityChange('brazilMap')}
              />
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleResetSettings} color="error">
          Resetar para Padrão
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSaveSettings} variant="contained" color="primary">
          Salvar Configurações
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default DashboardConfigModal;