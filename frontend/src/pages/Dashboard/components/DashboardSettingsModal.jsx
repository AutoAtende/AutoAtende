// src/components/DashboardSettingsModal.jsx
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
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Typography,
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  Settings,
  Visibility,
  VisibilityOff,
  Refresh
} from '@mui/icons-material';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';

const DashboardSettingsModal = ({ open, onClose }) => {
  const {
    settings,
    loading,
    updateSettings,
    resetToDefault,
    fetchSettings
  } = useDashboardSettings();

  const [localSettings, setLocalSettings] = useState(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings({ ...settings });
    }
  }, [settings]);

  const handleToggleComponent = (tabIndex, componentIndex) => {
    if (!localSettings) return;

    const newSettings = { ...localSettings };
    newSettings.tabs[tabIndex].components[componentIndex].visible = 
      !newSettings.tabs[tabIndex].components[componentIndex].visible;
    
    setLocalSettings(newSettings);
  };

  const handleToggleAllInTab = (tabIndex, visible) => {
    if (!localSettings) return;

    const newSettings = { ...localSettings };
    newSettings.tabs[tabIndex].components.forEach(comp => {
      comp.visible = visible;
    });
    
    setLocalSettings(newSettings);
  };

  const handleSave = async () => {
    if (!localSettings) return;
    
    try {
      await updateSettings(localSettings);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      // Exibir mensagem de erro
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefault();
      await fetchSettings();
      onClose();
    } catch (error) {
      console.error("Erro ao redefinir configurações:", error);
      // Exibir mensagem de erro
    }
  };

  if (loading || !localSettings) {
    return null;
  }

  const tabNameMap = {
    "overviewTab": "Visão Geral",
    "ticketsTab": "Conversas",
    "usersTab": "Atendentes",
    "contactsTab": "Contatos",
    "queuesTab": "Filas",
    "tagsTab": "Tags"
  };

  const componentNameMap = {
    // Visão Geral
    "totalTicketsCard": "Total de Conversas",
    "totalMessagesCard": "Total de Mensagens",
    "timeAvgCard": "Tempo Médio",
    "newContactsCard": "Novos Contatos",
    "dailyActivityChart": "Atividade Diária",
    "ticketsStatusChart": "Status das Conversas",
    "ratingCard": "Avaliação Média",
    
    // Conversas
    "ticketsQueueChart": "Conversas por Fila",
    "ticketsUserTable": "Atendentes com Mais Conversas",
    "ticketsHourChart": "Conversas por Hora",
// continuação do src/components/DashboardSettingsModal.jsx
"ticketsWeekdayChart": "Conversas por Dia da Semana",
"resolutionTimeChart": "Tempo de Resolução",
"serviceMetricsCard": "Métricas de Atendimento",

// Atendentes
"ticketsPerUserChart": "Conversas por Atendente",
"messagesPerUserChart": "Mensagens por Atendente",
"resolutionTimePerUserChart": "Tempo de Resolução por Atendente",
"ratingsChart": "Avaliações",
"performanceTable": "Desempenho Geral",

// Contatos
"newContactsChart": "Novos Contatos por Dia",
"contactsWeekdayChart": "Contatos por Dia da Semana",
"contactsHourChart": "Contatos por Hora",
"tagsUsedChart": "Tags Mais Usadas",
"contactsTable": "Contatos com Mais Conversas",
"prospectionByAgentCard": "Prospecção por Usuário",
"queueComparativoCard": "Comparativo entre Setores",

// Filas
"waitTimeChart": "Tempo de Espera por Fila",
"queueRatingsTable": "Avaliação por Fila",
"queueAnalysisChart": "Análise Comparativa",

// Tags
"mostUsedTagsChart": "Tags Mais Utilizadas",
"resolutionTimeTagsChart": "Tempo de Resolução por Tag",
"tagsStatusChart": "Tags por Status",
"tagsDetailTable": "Detalhamento das Tags"
};

return (
<Dialog 
  open={open} 
  onClose={onClose}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Settings sx={{ mr: 1 }} />
      Configurações de Visualização do Dashboard
      <Tooltip title="Redefinir para padrão">
        <IconButton 
          onClick={handleReset} 
          size="small" 
          sx={{ ml: 'auto' }}
        >
          <Refresh />
        </IconButton>
      </Tooltip>
    </Box>
  </DialogTitle>
  <DialogContent dividers>
    {localSettings.tabs.map((tab, tabIndex) => (
      <Accordion key={tab.id} defaultExpanded={tabIndex === 0}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {tabNameMap[tab.id] || tab.id}
            </Typography>
            <Box sx={{ display: 'flex', ml: 2 }}>
              <Tooltip title="Mostrar tudo">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAllInTab(tabIndex, true);
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ocultar tudo">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAllInTab(tabIndex, false);
                  }}
                  sx={{ ml: 1 }}
                >
                  <VisibilityOff fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {tab.components.map((component, componentIndex) => (
              <React.Fragment key={component.id}>
                <ListItem>
                  <ListItemIcon>
                    {component.visible ? 
                      <Visibility color="primary" /> : 
                      <VisibilityOff color="action" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary={componentNameMap[component.id] || component.id} 
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={component.visible}
                      onChange={() => handleToggleComponent(tabIndex, componentIndex)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {componentIndex < tab.components.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose} color="inherit">
      Cancelar
    </Button>
    <Button 
      onClick={handleSave} 
      variant="contained" 
      color="primary"
    >
      Salvar Configurações
    </Button>
  </DialogActions>
</Dialog>
);
};

export default DashboardSettingsModal;