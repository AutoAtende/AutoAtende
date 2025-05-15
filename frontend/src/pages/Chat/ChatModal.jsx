import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { i18n } from "../../translate/i18n";
import { ChatUsersFilters } from "./ChatUsersFilters";

const ChatModal = ({ open, onClose, onSave, chat, type = 'new', loading }) => {
  // Estado do formulário 
  const [formData, setFormData] = useState({
    title: "",
    users: []
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
 
  // Reset form data quando o modal abre/fecha ou o tipo muda
  useEffect(() => {
    if (open) {
      if (type === 'edit' && chat) {
        // Clone profundo dos dados do chat para edição
        setFormData({
          title: chat.title || "",
          users: chat.users?.map(u => ({
            id: u.user.id,
            name: u.user.name
          })) || []
        });
      } else if (type === 'new') {
        // Inicializa formulário para novo chat
        setFormData({
          title: "",
          users: []
        });
      }
      // Limpa erros e estados de touch
      setErrors({});
      setTouchedFields({});
    }
  }, [open, chat, type]);
 
  // Validação do formulário
  const validate = useCallback(() => {
    const newErrors = {};
 
    if (!formData.title.trim()) {
      newErrors.title = i18n.t('chat.errors.titleRequired');
    }
 
    if (!formData.users.length) {
      newErrors.users = i18n.t('chat.errors.usersRequired');
    }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
 
  // Manipuladores de eventos otimizados
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marca todos os campos como touched para mostrar erros
    setTouchedFields({
      title: true,
      users: true
    });
    
    if (!validate()) {
      return;
    }
 
    try {
      await onSave(formData);
      // O fechamento é gerenciado pelo componente pai
    } catch (error) {
      console.error(error);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.error || i18n.t('chat.errors.save')
      }));
    }
  };
 
  const handleClose = () => {
    setFormData({
      title: "",
      users: []
    });
    setErrors({});
    setTouchedFields({});
    onClose();
  };
 
  const handleUserSelection = useCallback((selectedUsers) => {
    setFormData(prev => ({
      ...prev,
      users: selectedUsers
    }));
    
    setTouchedFields(prev => ({
      ...prev,
      users: true
    }));
    
    if (errors.users) {
      setErrors(prev => ({
        ...prev,
        users: undefined
      }));
    }
  }, [errors.users]);
 
  const handleTitleChange = useCallback((e) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      title: value
    }));
    
    setTouchedFields(prev => ({
      ...prev,
      title: true
    }));
    
    if (errors.title && value.trim()) {
      setErrors(prev => ({
        ...prev,
        title: undefined
      }));
    }
  }, [errors.title]);
 
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>
        {type === 'edit' 
          ? i18n.t('chat.editChat') 
          : i18n.t('chat.newChat')
        }
      </DialogTitle>
 
      <DialogContent>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              label={i18n.t('chat.title')}
              value={formData.title}
              onChange={handleTitleChange}
              error={touchedFields.title && Boolean(errors.title)}
              helperText={touchedFields.title && errors.title}
              disabled={loading}
              inputProps={{
                maxLength: 100
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <ChatUsersFilters
              onFiltered={handleUserSelection}
              initialSelectedUsers={formData.users}
              error={touchedFields.users && Boolean(errors.users)}
              helperText={touchedFields.users && errors.users}
              disabled={loading}
              open={open}
            />
          </Grid>
        </Grid>
      </DialogContent>
 
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          {i18n.t('chat.cancel')}
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {type === 'edit' 
            ? i18n.t('chat.save') 
            : i18n.t('chat.create')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
 };
 
 export default React.memo(ChatModal);