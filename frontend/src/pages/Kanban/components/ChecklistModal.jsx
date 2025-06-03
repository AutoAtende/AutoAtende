import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from "@mui/material/styles";
import {
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from "../../../helpers/toast";
import useAuth from "../../../hooks/useAuth";
import StandardModal from "../../../components/shared/StandardModal";
import api from '../../../services/api';
import CardAssigneeAvatar from './CardAssigneeAvatar';

const ChecklistModal = ({ open, card, onClose, companyId }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [checklistItems, setChecklistItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateSelect, setShowTemplateSelect] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    required: 0,
    requiredCompleted: 0
  });

  // Load checklist items when card changes
  useEffect(() => {
    if (card) {
      setChecklistItems(card.checklistItems || []);
      updateStats(card.checklistItems || []);
    }
  }, [card]);

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const { data } = await api.request({
          url: '/users/list',
          method: 'get'
        });
        setUsers(data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar usuários");
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Load checklist templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplateLoading(true);
        const { data } = await api.request({
          url: '/kanban/checklist-templates',
          method: 'get'
        });
        setTemplates(data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar templates de checklist");
      } finally {
        setTemplateLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const updateStats = (items) => {
    const total = items.length;
    const completed = items.filter(item => item.checked).length;
    const required = items.filter(item => item.required).length;
    const requiredCompleted = items.filter(item => item.required && item.checked).length;
    
    setStats({
      total,
      completed,
      required,
      requiredCompleted
    });
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;
    
    try {
      setLoading(true);
      const { data } = await api.request({
        url: `/kanban/cards/${card.id}/checklist-items`,
        method: 'post',
        data: {
          description: newItemText,
          required: false
        }
      });
      
      const updatedItems = [...checklistItems, data];
      setChecklistItems(updatedItems);
      updateStats(updatedItems);
      setNewItemText('');
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar item ao checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId, checked) => {
    try {
      const { data } = await api.request({
        url: `/kanban/checklist-items/${itemId}`,
        method: 'put',
        data: { checked }
      });
      
      const updatedItems = checklistItems.map(item => 
        item.id === itemId ? data : item
      );
      
      setChecklistItems(updatedItems);
      updateStats(updatedItems);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar item do checklist");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      setLoading(true);
      await api.request({
        url: `/kanban/checklist-items/${itemId}`,
        method: 'delete'
      });
      
      const updatedItems = checklistItems.filter(item => item.id !== itemId);
      setChecklistItems(updatedItems);
      updateStats(updatedItems);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir item do checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (itemId, userId) => {
    try {
      const { data } = await api.request({
        url: `/kanban/checklist-items/${itemId}`,
        method: 'put',
        data: { assignedUserId: userId }
      });
      
      const updatedItems = checklistItems.map(item => 
        item.id === itemId ? data : item
      );
      
      setChecklistItems(updatedItems);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atribuir usuário ao item");
    }
  };

  const handleToggleRequired = async (itemId, required) => {
    try {
      const { data } = await api.request({
        url: `/kanban/checklist-items/${itemId}`,
        method: 'put',
        data: { required }
      });
      
      const updatedItems = checklistItems.map(item => 
        item.id === itemId ? data : item
      );
      
      setChecklistItems(updatedItems);
      updateStats(updatedItems);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar item do checklist");
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      const { data } = await api.request({
        url: `/kanban/checklist-templates/${selectedTemplate}/apply/${card.id}`,
        method: 'post'
      });
      
      const updatedItems = [...checklistItems, ...data];
      setChecklistItems(updatedItems);
      updateStats(updatedItems);
      setSelectedTemplate('');
      setShowTemplateSelect(false);
      
      toast.success("Template aplicado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao aplicar template de checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(checklistItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setChecklistItems(items);
    
    try {
      await api.request({
        url: `/kanban/cards/${card.id}/reorder-checklist-items`,
        method: 'post',
        data: {
          items: items.map((item, index) => ({
            id: item.id,
            position: index
          }))
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao reordenar itens do checklist");
    }
  };

  const getItemBackgroundColor = (item, isDragging) => {
    if (isDragging) return alpha(theme.palette.action.selected, 0.8);
    if (item.checked) return alpha(theme.palette.success.light, 0.2);
    return theme.palette.background.paper;
  };

  const handleTemplateSelectToggle = () => {
    setShowTemplateSelect(!showTemplateSelect);
    setSelectedTemplate('');
  };

  const handleTemplateApply = () => {
    handleApplyTemplate();
  };

  const handleTemplateCancel = () => {
    setShowTemplateSelect(false);
    setSelectedTemplate('');
  };

  const handleAddKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title={`Checklist: ${card?.title || "Sem título"}`}
      subtitle={`Progresso: ${stats.completed}/${stats.total} completados${stats.required > 0 ? ` (${stats.requiredCompleted}/${stats.required} obrigatórios)` : ''}`}
      maxWidth="md"
      size="large"
      secondaryAction={{
        label: 'Fechar',
        onClick: onClose
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Paper 
          variant="outlined" 
          sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Progresso
            </Typography>
            <Typography variant="h6">
              {stats.completed}/{stats.total} completados
              {stats.required > 0 && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  ({stats.requiredCompleted}/{stats.required} obrigatórios)
                </Typography>
              )}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {templates.length > 0 && (
              showTemplateSelect ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Selecionar Template</InputLabel>
                    <Select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      label="Selecionar Template"
                      disabled={templateLoading}
                    >
                      {templates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button 
                    variant="contained" 
                    onClick={handleTemplateApply}
                    disabled={!selectedTemplate || loading}
                    size="small"
                  >
                    Aplicar
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleTemplateCancel}
                    size="small"
                  >
                    Cancelar
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleTemplateSelectToggle}
                >
                  Usar Template
                </Button>
              )
            )}
          </Box>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label="Novo Item"
            variant="outlined"
            fullWidth
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleAddKeyPress}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleAddItem}
            disabled={!newItemText.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Adicionar
          </Button>
        </Box>
      </Box>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="checklist-items">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                '& .MuiListItem-root': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }
              }}
            >
              {checklistItems.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="Nenhum item no checklist"
                    secondary="Adicione itens para começar a acompanhar tarefas"
                    primaryTypographyProps={{ align: 'center' }}
                    secondaryTypographyProps={{ align: 'center' }}
                  />
                </ListItem>
              ) : (
                checklistItems
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
                  .map((item, index) => (
                    <Draggable 
                      key={item.id} 
                      draggableId={item.id.toString()} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            bgcolor: getItemBackgroundColor(item, snapshot.isDragging),
                            borderRadius: snapshot.isDragging ? 1 : 0,
                            boxShadow: snapshot.isDragging ? 1 : 0,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.action.hover, 0.7)
                            }
                          }}
                        >
                          <ListItemIcon {...provided.dragHandleProps}>
                            <DragIcon sx={{ cursor: 'grab' }} />
                          </ListItemIcon>
                          
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={!!item.checked}
                              onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                            />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography
                                  sx={{
                                    textDecoration: item.checked ? 'line-through' : 'none',
                                    fontWeight: item.required ? 'bold' : 'normal'
                                  }}
                                >
                                  {item.description}
                                </Typography>
                                {item.required && (
                                  <Tooltip title="Item obrigatório">
                                    <InfoIcon 
                                      fontSize="small" 
                                      color="primary" 
                                      sx={{ ml: 1 }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                {item.assignedUser ? (
                                  <>
                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                      Atribuído para:
                                    </Typography>
                                    <CardAssigneeAvatar 
                                      user={item.assignedUser} 
                                      size="small" 
                                    />
                                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                                      {item.assignedUser.name}
                                    </Typography>
                                  </>
                                ) : (
                                  <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                                    <InputLabel>Atribuir para</InputLabel>
                                    <Select
                                      value=""
                                      onChange={(e) => handleAssignUser(item.id, e.target.value)}
                                      label="Atribuir para"
                                      displayEmpty
                                    >
                                      <MenuItem value="">
                                        <em>Ninguém</em>
                                      </MenuItem>
                                      {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                          {user.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              </Box>
                            }
                          />
                          
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title={item.required ? "Tornar opcional" : "Tornar obrigatório"}>
                                <Checkbox
                                  edge="end"
                                  checked={!!item.required}
                                  onChange={(e) => handleToggleRequired(item.id, e.target.checked)}
                                  icon={<InfoIcon color="disabled" />}
                                  checkedIcon={<InfoIcon color="primary" />}
                                />
                              </Tooltip>
                              <IconButton
                                edge="end"
                                onClick={() => handleDeleteItem(item.id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))
              )}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </StandardModal>
  );
};

export default ChecklistModal;