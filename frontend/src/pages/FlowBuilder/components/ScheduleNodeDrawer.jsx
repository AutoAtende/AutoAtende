import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import useAuth from '../../../hooks/useAuth';
import HorarioManager from './HorarioManager';
import HorarioGroupManager from './HorarioGroupManager';

// Interface para TabPanel
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

const ScheduleNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const theme = useTheme();
  const { user: loggedInUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [formState, setFormState] = useState({
    label: nodeData?.label || 'Verificação de Horário',
    horarioGroupId: nodeData?.horarioGroupId || null,
    horarioGroupName: nodeData?.horarioGroupName || null
  });
  const [errors, setErrors] = useState({});
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [managerTabValue, setManagerTabValue] = useState(0);
  const [visibleErrors, setVisibleErrors] = useState(false);

  // Verificar permissão para gerenciar horários
  const canManageSchedules = loggedInUser && (
    loggedInUser.profile === "admin" || 
    loggedInUser.super === true || 
    loggedInUser.canManageSchedulesNodesData === true
  );

  // Carregar grupos de horários de forma mais controlada
  const loadGroups = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const { data } = await api.get('/horario-groups');
      
      if (data && Array.isArray(data.groups)) {
        setGroups(data.groups);
      } else {
        setGroups([]);
        console.warn('Formato de dados inválido na resposta da API de grupos');
        toast.warning('A resposta da API não contém grupos válidos');
      }
    } catch (error) {
      console.error('Erro ao carregar grupos de horários:', error);
      setGroups([]);
      const errorMessage = error.response?.data?.error || 'Não foi possível carregar a lista de grupos de horários';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loading]);
  
  // Carregar dados iniciais apenas na montagem do componente
  useEffect(() => {
    if (groups.length === 0 && !loading) {
      loadGroups();
    }
  }, []); // Sem dependências para evitar recarregamentos

  // Propagar mudanças para o componente pai de forma controlada
  useEffect(() => {
    if (onChange) {
      onChange({
        ...nodeData,
        ...formState
      });
    }
  }, [formState]);

  // Atualizar formState quando nodeData mudar
  useEffect(() => {
    if (nodeData) {
      setFormState({
        label: nodeData.label || 'Verificação de Horário',
        horarioGroupId: nodeData.horarioGroupId || null,
        horarioGroupName: nodeData.horarioGroupName || null
      });
    }
  }, [nodeData]);

  // Validar formulário principal
  const validateMainForm = () => {
    const newErrors = {};
    
    if (!formState.label || formState.label.trim() === '') {
      newErrors.label = 'O nome do nó é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manipulador para mudanças nos campos do formulário principal
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Função para selecionar um grupo
  const handleSelectGroup = (event) => {
    const groupId = event.target.value ? Number(event.target.value) : null;
    
    // Encontrar o nome do grupo selecionado
    let groupName = null;
    if (groupId) {
      const selectedGroup = groups.find(g => g.id === groupId);
      if (selectedGroup) {
        groupName = selectedGroup.name;
      }
    }
    
    // Atualizar formState com o ID e nome do grupo
    setFormState(prev => ({
      ...prev,
      horarioGroupId: groupId,
      horarioGroupName: groupName
    }));
  };

  // Abrir modal de gerenciamento
  const handleOpenManager = () => {
    setManagerDialogOpen(true);
  };

  // Fechar modal de gerenciamento
  const handleCloseManager = () => {
    setManagerDialogOpen(false);
  };

  // Mudar aba no modal de gerenciamento
  const handleManagerTabChange = (event, newValue) => {
    setManagerTabValue(newValue);
  };

  // Callback para quando grupos são atualizados
  const handleGroupsUpdated = useCallback(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
        Configurações do Nó de Verificação de Horário
        
        {canManageSchedules && (
          <Tooltip title="Gerenciar Horários e Grupos">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={handleOpenManager}
              sx={{ ml: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}
      </Typography>
      
      {visibleErrors && Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Por favor, corrija os seguintes erros:</Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
            {Object.entries(errors).map(([field, message]) => (
              <Box component="li" key={field}>
                <Typography variant="body2">{message}</Typography>
              </Box>
            ))}
          </Box>
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Nome do Nó"
          value={formState.label || ''}
          onChange={handleChange('label')}
          variant="outlined"
          error={!!errors.label}
          helperText={errors.label}
          margin="normal"
          required
        />
        
        <TextField
          select
          fullWidth
          label="Grupo de Horários"
          value={formState.horarioGroupId || ''}
          onChange={handleSelectGroup}
          variant="outlined"
          margin="normal"
          helperText="Selecione um grupo de horários para verificação"
        >
          <MenuItem value="">
            <em>Nenhum (verificar todos os horários)</em>
          </MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.name} {group.isDefault ? " (Padrão)" : ""}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InfoIcon fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
          Como funciona:
        </Typography>
        <Typography variant="body2">
          <strong>Verificação automática de horários:</strong>
        </Typography>
        <Box component="ul" sx={{ mt: 1 }}>
          <Box component="li">
            <Typography variant="body2">
              Este nó verifica automaticamente os horários do grupo selecionado para o dia atual.
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              Se nenhum grupo estiver selecionado, verifica todos os horários cadastrados.
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              Se não houver horários definidos para hoje: Saída "fora"
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              Se dia trabalhado = sim:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Box component="li">
                <Typography variant="body2">Dentro do horário → Saída "dentro"</Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">Fora do horário → Saída "fora"</Typography>
              </Box>
            </Box>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              Se dia trabalhado = não (folga):
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Box component="li">
                <Typography variant="body2">Dentro do horário → Saída "fora" (lógica invertida)</Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">Fora do horário → Saída "dentro" (lógica invertida)</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modal para gerenciamento de horários e grupos */}
      {managerDialogOpen && (
        <Dialog
          open={managerDialogOpen}
          onClose={handleCloseManager}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              height: { xs: '100%', sm: 'auto' },
              maxHeight: { xs: '100%', sm: '90vh' }
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6">Gerenciamento de Horários</Typography>
              <IconButton onClick={handleCloseManager}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Tabs 
              value={managerTabValue} 
              onChange={handleManagerTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Horários" />
              <Tab label="Grupos" />
            </Tabs>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              <TabPanel value={managerTabValue} index={0}>
                <HorarioManager 
                  onGroupsUpdated={handleGroupsUpdated} 
                  groups={groups}
                />
              </TabPanel>
              <TabPanel value={managerTabValue} index={1}>
                <HorarioGroupManager 
                  onGroupsUpdated={handleGroupsUpdated} 
                />
              </TabPanel>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.default
            }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseManager}
                fullWidth
              >
                Fechar
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default ScheduleNodeDrawer;