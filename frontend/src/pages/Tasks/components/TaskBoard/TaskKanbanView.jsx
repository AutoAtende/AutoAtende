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
import TaskColumn from './TaskColumn';
import { AuthContext } from "../../../../context/Auth/AuthContext";
import { SocketContext } from "../../../../context/Socket/SocketContext";
import { i18n } from "../../../../translate/i18n";
import api from '../../../../services/api';
import { toast } from "../../../../helpers/toast";
import { reorderTasks, moveBetweenColumns } from './utils';
import TaskDetailsModal from '../TaskDetailsModal';
import TaskModal from '../TaskModal';
import ConfirmationModal from '../../../../components/ConfirmationModal';

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

const TaskKanbanView = ({
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
  
  const [columns, setColumns] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [columnOrder, setColumnOrder] = useState(['to-do', 'in-progress', 'done']);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const categoryResponse = await api.get('/task/category');
      const categoriesData = categoryResponse.data?.data || categoryResponse.data || [];
      
      if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
        setLoading(false);
        setError(i18n.t('tasks.kanban.noCategories'));
        return;
      }
      
      const validCategories = categoriesData.filter(cat => cat && cat.id);
      setCategories(validCategories);
      
      const categoryIds = validCategories.map(cat => cat.id.toString());
      setColumnOrder(['to-do', 'in-progress', 'done']);
  
      const params = {
        ...filters,
        showAll: 'true',
        pageSize: 9999
      };
  
      const endpoint = user?.profile === 'user' ? '/task/user' : '/task';
  
      const taskResponse = await api.get(endpoint, { params });
      const tasks = taskResponse.data.tasks || [];
  
      const validTasks = tasks.filter(task => task && task.id);
  
      const columnsData = {
        'to-do': {
          id: 'to-do',
          title: i18n.t('tasks.kanban.todo'),
          taskIds: validTasks.filter(task => !task.done && !task.inProgress).map(task => task && task.id ? task.id.toString() : ''),
          tasks: validTasks.filter(task => !task.done && !task.inProgress),
        },
        'in-progress': {
          id: 'in-progress',
          title: i18n.t('tasks.kanban.inProgress'),
          taskIds: validTasks.filter(task => !task.done && task.inProgress).map(task => task && task.id ? task.id.toString() : ''),
          tasks: validTasks.filter(task => !task.done && task.inProgress),
        },
        'done': {
          id: 'done',
          title: i18n.t('tasks.kanban.done'),
          taskIds: validTasks.filter(task => task.done).map(task => task && task.id ? task.id.toString() : ''),
          tasks: validTasks.filter(task => task.done),
        },
      };
  
      setColumns(columnsData);
    } catch (err) {
      console.error('Erro ao carregar dados do Kanban:', err);
      setError(i18n.t('tasks.kanban.loadError'));
      toast.error(i18n.t('tasks.kanban.loadError'));
    } finally {
      setLoading(false);
    }
  }, [filters, user?.profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    const socket = socketManager?.GetSocket?.(companyId);
    
    const handleTaskUpdate = (data) => {
      if (!data) return;
      
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

  const handleDragEnd = async (result) => {
    if (!result) return;
    
    const { source, destination, draggableId } = result;

    if (!draggableId || !source || !destination) {
      console.error('Dados inválidos recebidos do evento de drag-and-drop');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      const sourceColumn = source.droppableId ? columns[source.droppableId] : null;
      if (!sourceColumn) {
        console.warn('Coluna de origem não encontrada:', source.droppableId);
        return;
      }
      
      if (source.droppableId === destination.droppableId) {
        const newColumns = { ...columns };
        const column = newColumns[source.droppableId];
        if (!column) return;
        
        const newTaskIds = reorderTasks(
          column.taskIds,
          source.index,
          destination.index
        );

        newColumns[source.droppableId] = {
          ...column,
          taskIds: newTaskIds,
        };

        setColumns(newColumns);
      } else {
        const taskId = draggableId;
        if (!taskId) {
          console.error('ID da tarefa é nulo ou indefinido');
          return;
        }
        
        const task = sourceColumn.tasks.find(
          (t) => t && t.id && t.id.toString() === taskId
        );
        
        if (!task) {
          console.error('Tarefa não encontrada para o ID:', taskId);
          return;
        }

        let done = false;
        let inProgress = false;

        if (destination.droppableId === 'done') {
          done = true;
        } else if (destination.droppableId === 'in-progress') {
          inProgress = true;
        }

        const newColumns = moveBetweenColumns(
          columns,
          source,
          destination,
          draggableId
        );
        setColumns(newColumns);

        await api.put(`/task/${taskId}`, {
          ...task,
          done,
          inProgress
        });

        toast.success(i18n.t('tasks.notifications.statusUpdated'));
      }
    } catch (err) {
      console.error('Erro ao atualizar posição da tarefa:', err);
      toast.error(i18n.t('tasks.notifications.updateError'));
      fetchData();
    }
  };

  const handleTaskClick = (task) => {
    if (!task) return;
    setSelectedTask(task);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedTask(null);
    setOpenDetailsModal(false);
  };

  const handleOpenTaskModal = (task = null) => {
    setSelectedTask(task);
    setOpenTaskModal(true);
  };
  
  const handleCloseTaskModal = () => {
    setSelectedTask(null);
    setOpenTaskModal(false);
    fetchData();
  };

  const handleStatusToggle = async (task) => {
    if (!task || !task.id) return;
    
    try {
      // Se a tarefa possui a propriedade inProgress, vamos usar essa propriedade
      // caso contrário, apenas alternamos o status done
      if ('inProgress' in task) {
        // A tarefa foi atualizada com o campo inProgress (vindo de TasksTable)
        await api.put(`/task/${task.id}`, task);
      } else {
        // Comportamento original: alternar apenas o status done
        const updatedTask = { ...task, done: !task.done };
        
        // Se a tarefa está sendo marcada como concluída, também remova o status "em andamento"
        if (updatedTask.done && updatedTask.inProgress) {
          updatedTask.inProgress = false;
        }
        
        await api.put(`/task/${task.id}`, updatedTask);
      }
      
      fetchData();
      toast.success(i18n.t('tasks.notifications.statusUpdated'));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error(i18n.t('tasks.notifications.updateError'));
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask || !selectedTask.id) return;
    
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenTaskModal()}
          size={isMobile ? "small" : "medium"}
          sx={{ width: isMobile ? '100%' : 'auto' }}
        >
          {i18n.t('tasks.buttons.add')}
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <KanbanContainer>
          {columns && columnOrder && columnOrder.map((columnId) => {
            const column = columns[columnId];
            if (!column) return null;
            
            return (
              <TaskColumn
                key={column.id || columnId}
                column={column}
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
    </>
  );
};

export default TaskKanbanView;