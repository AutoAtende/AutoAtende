import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from "../../../../context/Auth/AuthContext";
import { SocketContext } from "../../../../context/Socket/SocketContext";
import { i18n } from "../../../../translate/i18n";
import api from '../../../../services/api';
import { toast } from "../../../../helpers/toast";
import TaskDetailsModal from '../TaskDetailsModal';
import TaskModal from '../TaskModal';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import TaskCategoryModal from '../TaskCategoryModal';
import TaskCategoryColumn from './TaskCategoryColumn';

const KanbanContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(100vh - 200px)',
  overflowX: 'auto',
  padding: theme.spacing(1),
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 180px)',
    padding: theme.spacing(0.5),
    gap: theme.spacing(1),
  },
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '4px',
  },
  scrollbarWidth: 'thin',
}));

const TaskCategoryKanbanView = ({
  onViewChange,
  filtersVisible,
  toggleFilters,
  filters,
  setFilters,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState([]);
  
  // Função para carregar as categorias e tarefas
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar categorias
      const categoryResponse = await api.get('/task/category');
      const categoriesData = categoryResponse.data?.data || categoryResponse.data || [];
      
      if (categoriesData.length === 0) {
        setLoading(false);
        setError(i18n.t('tasks.kanban.noCategories'));
        return;
      }
      
      // Filtramos para garantir que só existam categorias válidas
      const validCategories = categoriesData.filter(cat => cat && cat.id);
      setCategories(validCategories);
      
      // Garantir que todos os IDs sejam strings para evitar problemas
      const categoryIds = validCategories.map(cat => cat.id.toString());
      setCategoryOrder(categoryIds);
  
      // Buscar tarefas com filtros aplicados
      const params = {
        ...filters,
        showAll: 'true', // Sempre buscar todas para o modo Kanban
        pageSize: 9999    // Valor grande para obter todas as tarefas
      };
  
      // Modificar o endpoint de acordo com o perfil do usuário
      let endpoint = '/task';
      if (user.profile === 'user') {
        endpoint = '/task/user';
      }
  
      const taskResponse = await api.get(endpoint, { params });
      const tasksData = taskResponse.data.tasks || [];
  
      // Filtrar tarefas inválidas
      const validTasks = tasksData.filter(task => task && task.id);
      setTasks(validTasks);
      
    } catch (err) {
      console.error('Erro ao carregar dados do Kanban:', err);
      setError(i18n.t('tasks.kanban.loadError'));
      toast.error(i18n.t('tasks.kanban.loadError'));
    } finally {
      setLoading(false);
    }
  }, [filters, user.profile]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Configurar socket para atualizações em tempo real
  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    const socket = socketManager.GetSocket(companyId);
    
    const handleTaskUpdate = (data) => {
      switch(data.type) {
        case 'task-created':
        case 'task-updated':
        case 'task-deleted':
        case 'task-status-updated':
          console.log('[Kanban] Recebido evento de atualização:', data);
          fetchData();
          break;
        default:
          break;
      }
    };
  
    if (socket) {
      socket.on('task-update', handleTaskUpdate);
      return () => socket.off('task-update', handleTaskUpdate);
    }
  }, [socketManager, fetchData]);

  // Função para lidar com o drag and drop
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Verificar se o item foi solto em uma área válida
    if (!draggableId || !source || !destination) {
      console.error('Dados inválidos recebidos do evento de drag-and-drop');
      return;
    }

    // Se a posição não mudou, não fazer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Verificar se o draggableId é válido
      if (!draggableId) {
        console.error('ID da tarefa é nulo ou indefinido');
        return;
      }
      
      // Obter a tarefa que foi arrastada
      const taskId = draggableId ? draggableId.toString() : null;
      if (!taskId) {
        console.error('ID da tarefa inválido');
        return;
      }
      const task = tasks.find(t => t && t.id && t.id.toString() === taskId);
      
      if (!task) {
        console.error('Tarefa não encontrada para o ID:', taskId);
        return;
      }

      // Verificar se o destino é válido
      if (!destination.droppableId) {
        console.error('ID da categoria de destino é nulo ou indefinido');
        return;
      }

      // Obter a categoria de destino (convertendo para número, pois o droppableId é string)
      const newCategoryId = parseInt(destination.droppableId, 10);
      
      // Se a categoria não mudou, apenas atualizar a ordem visualmente
      if (parseInt(source.droppableId, 10) === newCategoryId) {
        // Aqui você poderia implementar a reordenação dentro da mesma categoria
        // se for um requisito futuro
        return;
      }

      // Atualizar visualmente as tarefas
      const updatedTasks = tasks.map(t => {
        if (t && t.id && t.id.toString() === taskId) {
          return { ...t, taskCategoryId: newCategoryId };
        }
        return t;
      });
      
      setTasks(updatedTasks);

      // Atualizar a categoria da tarefa no servidor
      await api.put(`/task/${taskId}`, {
        ...task,
        taskCategoryId: newCategoryId
      });

      toast.success(i18n.t('tasks.notifications.categoryUpdated'));
    } catch (err) {
      console.error('Erro ao atualizar categoria da tarefa:', err);
      toast.error(i18n.t('tasks.notifications.updateError'));
      // Reverter para o estado anterior em caso de erro
      fetchData();
    }
  };

  // Função para abrir o modal de detalhes da tarefa
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setOpenDetailsModal(true);
  };

  // Função para fechar o modal de detalhes
  const handleCloseDetailsModal = () => {
    setSelectedTask(null);
    setOpenDetailsModal(false);
  };

  // Função para abrir o modal de criação/edição de tarefa
  const handleOpenTaskModal = (task = null) => {
    setSelectedTask(task);
    setOpenTaskModal(true);
  };
  
  // Função para fechar o modal de criação/edição
  const handleCloseTaskModal = () => {
    setSelectedTask(null);
    setOpenTaskModal(false);
    fetchData(); // Recarrega as tarefas
  };

  // Função para alternar status da tarefa
  const handleStatusToggle = async (task) => {
    try {
      const updatedTask = { ...task, done: !task.done };
      await api.put(`/task/${task.id}`, updatedTask);
      fetchData();
      toast.success(i18n.t('tasks.notifications.statusUpdated'));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error(i18n.t('tasks.notifications.updateError'));
    }
  };

  // Função para excluir tarefa
  const handleDeleteTask = async () => {
    try {
      await api.delete(`/task/${selectedTask.id}`);
      toast.success(i18n.t('tasks.notifications.deleted'));
      fetchData();
      setOpenConfirmModal(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      toast.error(i18n.t('tasks.notifications.deleteError'));
    }
  };

  // Função para gerenciar categorias
  const handleManageCategories = () => {
    setOpenCategoryModal(true);
  };

  // Verificar se o usuário pode gerenciar a tarefa
  const canManageTask = (task) => {
    if (!task || !user) return false;
    const userId = user.id;
    return user.profile !== 'user' || task.creator?.id === userId || task.responsible?.id === userId;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <IconButton
            aria-label="retry"
            color="inherit"
            size="small"
            onClick={fetchData}
          >
            <RefreshIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  // Organizar tarefas por categoria
  const tasksByCategory = {};
  categories.forEach(category => {
    if (category && category.id) {
      tasksByCategory[category.id] = tasks.filter(task => task && task.taskCategoryId === category.id);
    }
  });

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? 1 : 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={i18n.t('tasks.toggleView')}>
            <IconButton onClick={onViewChange} size={isMobile ? "small" : "medium"}>
              <ViewListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={i18n.t('tasks.toggleFilters')}>
            <IconButton onClick={toggleFilters} size={isMobile ? "small" : "medium"}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          width: isMobile ? '100%' : 'auto',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleManageCategories}
            size={isMobile ? "small" : "medium"}
          >
            {i18n.t('taskCategories.manageCategories')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenTaskModal()}
            size={isMobile ? "small" : "medium"}
          >
            {i18n.t('tasks.buttons.add')}
          </Button>
        </Box>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <KanbanContainer>
          {categoryOrder.map((categoryId) => {
            const category = categories.find(c => c && c.id && c.id.toString() === categoryId);
            if (!category) return null;
            
            const categoryTasks = tasksByCategory[category.id] || [];
            
            return (
              <TaskCategoryColumn
                key={category.id}
                category={category}
                tasks={categoryTasks}
                onTaskClick={handleTaskClick}
                onStatusToggle={handleStatusToggle}
                onEditTask={handleOpenTaskModal}
                onDeleteTask={(task) => {
                  setSelectedTask(task);
                  setOpenConfirmModal(true);
                }}
                canManageTask={canManageTask}
              />
            );
          })}
        </KanbanContainer>
      </DragDropContext>

      {/* Modais reutilizados dos componentes existentes */}
      <TaskDetailsModal
        open={openDetailsModal}
        onClose={handleCloseDetailsModal}
        task={selectedTask}
        onStatusToggle={handleStatusToggle}
        canEdit={selectedTask ? canManageTask(selectedTask) : false}
        onEdit={() => handleOpenTaskModal(selectedTask)}
      />

      <TaskModal
        open={openTaskModal}
        onClose={handleCloseTaskModal}
        task={selectedTask}
      />

      <ConfirmationModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={handleDeleteTask}
        title={i18n.t('tasks.confirmations.delete.title')}
        message={i18n.t('tasks.confirmations.delete.message')}
      />

      <TaskCategoryModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        onSuccess={() => {
          fetchData();
          setOpenCategoryModal(false);
        }}
      />
    </>
  );
};

export default TaskCategoryKanbanView;