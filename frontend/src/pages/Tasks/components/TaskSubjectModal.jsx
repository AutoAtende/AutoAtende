import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add as AddIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";

const TaskSubjectModal = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref para controlar se o componente está montado
  const isMounted = useRef(true);
  // Ref para controlar se precisamos fazer uma requisição
  const shouldFetch = useRef(false);
  
  const fetchSubjects = useCallback(async () => {
    if (!isMounted.current || loading) return;
    
    try {
      setLoading(true);
      console.log('Iniciando requisição para buscar assuntos');
      
      const response = await api.get('/task/subject');
      console.log('Resposta da API subjects:', response?.data);
      
      if (!isMounted.current) return;
      
      if (response && response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          setSubjects(response.data.data);
        } else if (Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          setSubjects([]);
        }
      } else {
        setSubjects([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar assuntos:', error);
      
      if (!isMounted.current) return;
      
      setError(i18n.t('taskSubjects.errorLoading') || 'Erro ao carregar assuntos');
      toast.error(error.response?.data?.error || 'Erro ao carregar assuntos');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []); // Removido 'loading' e 'open' do array de dependências para evitar loop

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Se o modal estiver aberto e não estivermos carregando, busque os assuntos
    if (open && !loading && shouldFetch.current) {
      shouldFetch.current = false;
      fetchSubjects();
    }
    
    // Se o modal foi aberto, marque que devemos buscar os assuntos
    if (open) {
      shouldFetch.current = true;
    }
  }, [open, loading, fetchSubjects]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingSubjectId(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!name.trim()) {
      toast.error(i18n.t('taskSubjects.nameRequired') || 'Nome do assunto é obrigatório');
      return;
    }

    setSubmitting(true);
    try {
      console.log(`${editingSubjectId ? 'Atualizando' : 'Criando'} assunto: ${name}`);
      
      if (editingSubjectId) {
        const response = await api.put(`/task/subject/${editingSubjectId}`, { 
          name: name.trim(), 
          description: description.trim() 
        });
        console.log('Resposta da atualização:', response.data);
        toast.success(i18n.t('taskSubjects.subjectUpdated') || 'Assunto atualizado com sucesso');
      } else {
        const response = await api.post('/task/subject', { 
          name: name.trim(), 
          description: description.trim() 
        });
        console.log('Resposta da criação:', response.data);
        toast.success(i18n.t('taskSubjects.subjectCreated') || 'Assunto criado com sucesso');
      }

      resetForm();
      
      // Adicionar pequeno delay antes de recarregar os dados
      setTimeout(() => {
        if (isMounted.current) {
          shouldFetch.current = true;
          fetchSubjects();
          
          // Chamar o callback de sucesso para atualizar dados no componente pai
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess();
          }
        }
      }, 300);
    } catch (error) {
      console.error('Erro ao salvar assunto:', error);
      
      // Verificar se o componente ainda está montado
      if (!isMounted.current) return;
      
      const errorDetail = error.response?.data?.error || '';
      const errorMessage = errorDetail || 
                         i18n.t('taskSubjects.errorSaving') || 
                         'Erro ao salvar assunto';
      
      console.error(`Detalhes do erro: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      // Verificar se o componente ainda está montado
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  };

  const handleEdit = (subject) => {
    if (!subject) return;
    
    setName(subject.name || '');
    setDescription(subject.description || '');
    setEditingSubjectId(subject.id);
  };

  const handleDelete = async (subjectId) => {
    if (!subjectId) return;
    
    // Confirmar antes de excluir
    const confirmDelete = window.confirm(
      i18n.t('taskSubjects.confirmDelete') || 'Tem certeza que deseja excluir este assunto?'
    );
    
    if (!confirmDelete) return;

    try {
      setLoading(true);
      console.log(`Excluindo assunto: ${subjectId}`);
      
      const response = await api.delete(`/task/subject/${subjectId}`);
      console.log('Resposta da exclusão:', response.data);
      
      toast.success(i18n.t('taskSubjects.subjectDeleted') || 'Assunto excluído com sucesso');
      
      // Verificar se o componente ainda está montado
      if (!isMounted.current) return;
      
      // Se estiver editando o assunto que foi excluído, resetar o formulário
      if (editingSubjectId === subjectId) {
        resetForm();
      }
      
      // Atualizar a lista localmente para resposta mais rápida
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      
      // Chamar o callback de sucesso para atualizar dados no componente pai
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao excluir assunto:', error);
      
      // Verificar se o componente ainda está montado
      if (!isMounted.current) return;
      
      // Tratamento especial para caso de assunto em uso
      if (error.response?.data?.tasksCount) {
        toast.error(
          i18n.t('taskSubjects.cannotDeleteUsed') || 
          `Não é possível excluir este assunto pois está sendo usado em ${error.response.data.tasksCount} tarefas`
        );
      } else {
        const errorMessage = error.response?.data?.error || 
                           i18n.t('taskSubjects.errorDeleting') || 
                           'Erro ao excluir assunto';
        toast.error(errorMessage);
      }
    } finally {
      // Verificar se o componente ainda está montado
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CategoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {i18n.t('taskSubjects.manageSubjects') || 'Gerenciar Assuntos'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              autoFocus
              fullWidth
              label={i18n.t('taskSubjects.subjectName') || 'Nome do Assunto'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              size="small"
              margin="normal"
              error={!name.trim()}
              helperText={!name.trim() && (i18n.t('taskSubjects.nameRequired') || 'Nome é obrigatório')}
            />
            
            <TextField
              fullWidth
              label={i18n.t('taskSubjects.subjectDescription') || 'Descrição (opcional)'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              size="small"
              margin="normal"
              multiline
              rows={2}
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              {editingSubjectId && (
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  sx={{ mr: 1 }}
                  disabled={submitting}
                  onClick={resetForm}
                >
                  {i18n.t('buttons.cancel') || 'Cancelar'}
                </Button>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting || !name.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
              >
                {editingSubjectId ? (i18n.t('buttons.update') || 'Atualizar') : (i18n.t('buttons.add') || 'Adicionar')}
              </Button>
            </Box>
          </Box>
        </form>

        <Divider sx={{ mt: 2, mb: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          {i18n.t('taskSubjects.subjectsList') || 'Lista de Assuntos'}
          {!loading && subjects.length > 0 && (
            <Typography component="span" color="textSecondary" variant="body2" sx={{ ml: 1 }}>
              ({subjects.length})
            </Typography>
          )}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : subjects.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
            {i18n.t('taskSubjects.noSubjects') || 'Nenhum assunto cadastrado'}
          </Typography>
        ) : (
          <List>
            {subjects.map((subject) => (
              <ListItem
                key={subject.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">{subject.name}</Typography>
                  }
                  secondary={
                    subject.description || 
                    <Typography variant="caption" color="textSecondary" fontStyle="italic">
                      {i18n.t('taskSubjects.noDescription') || 'Sem descrição'}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title={i18n.t('buttons.edit') || 'Editar'}>
                    <IconButton
                      edge="end"
                      onClick={() => handleEdit(subject)}
                      disabled={submitting}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={i18n.t('buttons.delete') || 'Excluir'}>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(subject.id)}
                      disabled={submitting}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={submitting}>
          {i18n.t('buttons.close') || 'Fechar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskSubjectModal;