import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  Chip,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

const HorarioGroupManager = ({ onGroupsUpdated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [errors, setErrors] = useState({});
  const [visibleErrors, setVisibleErrors] = useState(false);
  
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    isDefault: false
  });
  
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
  
  useEffect(() => {
    const loadInitialData = async () => {
      await loadGroups();
    };
    loadInitialData();
  }, []);
  
  // Manipuladores para o formulário de grupo
  const handleGroupFormChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    setGroupForm((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleOpenGroupForm = (group = null) => {
    // Limpar erros
    setErrors({});
    setVisibleErrors(false);
    
    if (group) {
      setCurrentGroup(group);
      setGroupForm({
        name: group.name,
        description: group.description || '',
        isDefault: group.isDefault || false
      });
    } else {
      setCurrentGroup(null);
      setGroupForm({
        name: "",
        description: "",
        isDefault: false
      });
    }
    setGroupFormOpen(true);
  };
  
  const handleCloseGroupForm = () => {
    setGroupFormOpen(false);
    setCurrentGroup(null);
    setErrors({});
    setVisibleErrors(false);
  };
  
  const validateGroupForm = () => {
    const errors = {};
    
    if (!groupForm.name || groupForm.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }
    
    return errors;
  };
  
  const handleSaveGroup = async () => {
    const formErrors = validateGroupForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setVisibleErrors(true);
      
      // Mostrar toast com resumo dos erros
      toast.error(`Por favor, corrija os seguintes erros: ${Object.values(formErrors).join(', ')}`);
      return;
    }
    
    try {
      setLoading(true);
      
      if (currentGroup) {
        // Atualizar grupo existente
        await api.put(`/horario-groups/${currentGroup.id}`, groupForm);
        toast.success('Grupo de horários atualizado com sucesso!');
      } else {
        // Criar novo grupo
        await api.post('/horario-groups', groupForm);
        toast.success('Grupo de horários criado com sucesso!');
      }
      
      // Recarregar a lista de grupos
      await loadGroups();
      if (onGroupsUpdated) {
        onGroupsUpdated();
      }
      
      // Fechar o formulário
      handleCloseGroupForm();
    } catch (error) {
      console.error('Erro ao salvar grupo de horários:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar grupo de horários';
      toast.error(errorMessage);
      
      // Mostrar erros de validação se houver
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setVisibleErrors(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteGroup = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo de horários?')) {
      try {
        setLoading(true);
        
        await api.delete(`/horario-groups/${id}`);
        toast.success('Grupo de horários excluído com sucesso!');
        
        // Recarregar a lista de grupos
        await loadGroups();
        if (onGroupsUpdated) {
          onGroupsUpdated();
        }
      } catch (error) {
        console.error('Erro ao excluir grupo de horários:', error);
        let errorMessage = 'Erro ao excluir grupo de horários';
        
        // Verificar mensagens de erro específicas
        if (error.response?.data?.error) {
          if (error.response.data.error.includes('possui horários vinculados')) {
            errorMessage = 'Este grupo não pode ser excluído pois possui horários vinculados';
          } else if (error.response.data.error.includes('grupo padrão')) {
            errorMessage = 'Não é possível excluir o grupo padrão';
          } else {
            errorMessage = error.response.data.error;
          }
        }
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenGroupForm()}
          disabled={loading}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Novo Grupo
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 3, 
          bgcolor: alpha(theme.palette.background.default, 0.5),
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1
        }}>
          <GroupIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            Nenhum grupo de horários cadastrado
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Adicione um novo grupo para organizar seus horários
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenGroupForm()}
          >
            Adicionar Grupo
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: 2,
          maxHeight: isMobile ? '100%' : '400px', 
          overflow: 'auto'
        }}>
          {groups.map((group) => (
            <Paper
              key={group.id}
              elevation={2}
              sx={{
                p: 2,
                bgcolor: theme.palette.background.paper,
                borderRadius: 1,
                borderLeft: group.isDefault 
                  ? `4px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {group.name}
                  </Typography>
                  {group.isDefault && (
                    <Chip 
                      label="Padrão" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                <Box>
                  <Tooltip title="Editar grupo" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenGroupForm(group)}
                      color="primary"
                      disabled={loading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={group.isDefault ? "Grupos padrão não podem ser excluídos" : "Excluir grupo"} arrow>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGroup(group.id)}
                        color="error"
                        disabled={group.isDefault || loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
              
              {group.description && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {group.description}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}
      
      {/* Modal de criação/edição de grupo */}
      <Dialog 
        open={groupFormOpen} 
        onClose={handleCloseGroupForm}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {currentGroup ? 'Editar Grupo de Horários' : 'Novo Grupo de Horários'}
          <IconButton size="small" onClick={handleCloseGroupForm}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {visibleErrors && Object.keys(errors).length > 0 && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, mt: 1 }}
            >
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
          
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nome do Grupo"
              value={groupForm.name}
              onChange={handleGroupFormChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Descrição (opcional)"
              multiline
              rows={3}
              value={groupForm.description}
              onChange={handleGroupFormChange('description')}
              margin="normal"
            />
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={groupForm.isDefault}
                    onChange={handleGroupFormChange('isDefault')}
                    color="primary"
                  />
                }
                label="Definir como Grupo Padrão"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                O grupo padrão será selecionado automaticamente para novos horários.
                Apenas um grupo pode ser definido como padrão.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={handleCloseGroupForm} 
            color="inherit" 
            disabled={loading}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveGroup} 
            color="primary" 
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HorarioGroupManager;