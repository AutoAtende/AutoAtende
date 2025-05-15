import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import moment from 'moment';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import {SocketContext} from "../../../context/Socket/SocketContext";

const TaskNotes = ({ taskId, disabled }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const socketManager = useContext(SocketContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const handleApiError = (error) => {
    if (error.response?.data?.details) {
      return error.response.data.details;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    return 'Erro ao comunicar com o servidor. Tente novamente.';
  };

  const fetchNotes = async () => {
    if (!taskId) return;
    
    console.log('Iniciando busca de notas:', taskId);
    setLoading(true);
    try {
      const { data } = await api.get(`/task/${taskId}/notes`);
      console.log('Notas recebidas:', data);
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    
    const handleTaskUpdate = (data) => {
      if (data.taskId !== taskId) return;
      
      if (data.type === 'task-note-added' || 
          data.type === 'task-note-updated' || 
          data.type === 'task-note-deleted') {
        fetchNotes();
      }
    };
  
    socket?.on('task-update', handleTaskUpdate);
    return () => socket?.off('task-update', handleTaskUpdate);
  }, [socketManager, taskId]);

  useEffect(() => {
    if (taskId) {
      fetchNotes();
    }
  }, [taskId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
  
    setSubmitting(true);
    try {
      if (editingNoteId) {
        await api.put(`/task/${taskId}/notes/${editingNoteId}`, {
          content: newNote.trim()
        });
        toast.success('Nota atualizada com sucesso');
      } else {
        await api.post(`/task/${taskId}/notes`, {
          content: newNote.trim()
        });
        toast.success('Nota adicionada com sucesso');
      }
      
      setNewNote('');
      setEditingNoteId(null);
      await fetchNotes();
    } catch (err) {
      toast.error('Erro ao salvar nota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (note) => {
    setNewNote(note.content);
    setEditingNoteId(note.id);
    handleCloseMenu();
  };



  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/task/${taskId}/notes/${noteId}`);
      toast.success(i18n.t("tasks.notes.deleted"));
      await fetchNotes();
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("tasks.notes.deleteError"));
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (event, note) => {
    setSelectedNote(note);
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setSelectedNote(null);
    setMenuAnchor(null);
  };

  const handleCancel = () => {
    setNewNote('');
    setEditingNoteId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography color="error">{error}</Typography>
        <IconButton size="small" onClick={fetchNotes}>
          <RefreshIcon />
        </IconButton>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder={i18n.t("tasks.notes.placeholder")}
            value={newNote}
            spellCheck={true}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={disabled || submitting}
            size="small"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {editingNoteId && (
              <Button
                onClick={handleCancel}
                disabled={submitting}
                size={isMobile ? "small" : "medium"}
              >
                {i18n.t("buttons.cancel")}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={disabled || submitting || !newNote.trim()}
              startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
              size={isMobile ? "small" : "medium"}
            >
              {submitting 
                ? i18n.t("buttons.saving")
                : editingNoteId 
                  ? i18n.t("buttons.update")
                  : i18n.t("buttons.add")
              }
            </Button>
          </Box>
        </form>
      </Paper>

      {notes.length === 0 ? (
        <Typography color="textSecondary" align="center">
          {i18n.t("tasks.notes.empty")}
        </Typography>
      ) : (
        <List>
          {notes.map((note, index) => (
            <React.Fragment key={note.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {note.user?.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={moment(note.createdAt).format('DD/MM/YYYY HH:mm:ss')}>
                          <Typography variant="caption" color="textSecondary">
                            {moment(note.createdAt).fromNow()}
                          </Typography>
                        </Tooltip>
                        {!disabled && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, note)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="textPrimary"
                      sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                    >
                      {note.content}
                    </Typography>
                  }
                />
              </ListItem>
              {index < notes.length - 1 && <Divider variant="inset" />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEdit(selectedNote)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          {i18n.t("buttons.edit")}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedNote?.id)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          {i18n.t("buttons.delete")}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskNotes;