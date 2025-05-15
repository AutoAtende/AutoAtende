import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Edit,
  Delete,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";

const TaskCategoryModal = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/task/category');

      if (data && data.success) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      } else {
        setCategories(Array.isArray(data) ? data : []);
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(i18n.t('taskCategories.errorLoading'));
      toast.error(i18n.t('taskCategories.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, fetchCategories]);

  const resetForm = () => {
    setName('');
    setEditingCategoryId(null);
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
      toast.error(i18n.t('taskCategories.nameRequired'));
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategoryId) {
        await api.put(`/task/category/${editingCategoryId}`, { name: name.trim() });
        toast.success(i18n.t('taskCategories.categoryUpdated'));
      } else {
        await api.post('/task/category', { name: name.trim() });
        toast.success(i18n.t('taskCategories.categoryCreated'));
      }

      resetForm();
      await fetchCategories();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(i18n.t('taskCategories.errorSaving'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setName(category.name);
    setEditingCategoryId(category.id);
  };

  const handleDelete = async (categoryId) => {
    if (!categoryId) return;

    try {
      setLoading(true);
      await api.delete(`/task/category/${categoryId}`);
      toast.success(i18n.t('taskCategories.categoryDeleted'));
      await fetchCategories();
      if (editingCategoryId === categoryId) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(i18n.t('taskCategories.errorDeleting'));
    } finally {
      setLoading(false);
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
        <Typography variant="h6">
          {i18n.t('taskCategories.manageCategories')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label={i18n.t('taskCategories.categoryName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              size="small"
              error={!name.trim()}
              helperText={!name.trim() && i18n.t('taskCategories.nameRequired')}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !name.trim()}
              startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {editingCategoryId ? i18n.t('buttons.update') : i18n.t('buttons.add')}
            </Button>
          </Box>
        </form>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Typography color="textSecondary" align="center">
            {i18n.t('taskCategories.noCategories')}
          </Typography>
        ) : (
          <List>
            {categories.map((category) => (
              <ListItem
                key={category.id}
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
                  primary={category.name}
                  secondary={`${category.tasksCount || 0} ${i18n.t('taskCategories.tasks')}`}
                />
                <ListItemSecondaryAction>
                  <Tooltip title={i18n.t('buttons.edit')}>
                    <IconButton
                      edge="end"
                      onClick={() => handleEdit(category)}
                      disabled={submitting}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={i18n.t('buttons.delete')}>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(category.id)}
                      disabled={submitting || (category.tasksCount > 0)}
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
        <Button onClick={handleClose} color="inherit">
          {i18n.t('buttons.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskCategoryModal;