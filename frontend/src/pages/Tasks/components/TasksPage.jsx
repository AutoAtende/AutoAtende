import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  InputBase,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  ViewKanban as ViewKanbanIcon,
  ViewList as ViewListIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  SortByAlphaRounded as SortIcon,
  FilterAltOff as FilterAltOffIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import TasksTable from './TasksTable';
import TaskBoard from './TaskBoard';
import TaskFilters from './TaskFilters';
import TaskModal from './TaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import TaskCategoryModal from './TaskCategoryModal';
import TaskImportModal from './TaskImportModal';
import TaskReportsComponent from './TaskReportsComponent';
import TaskSubjectModal from './TaskSubjectModal';
import TaskActionsMenu from './TaskActionsMenu';
import TaskSortMenu from './TaskSortMenu';
import TaskExportMenu from './TaskExportMenu';
import ErrorBoundary from './ErrorBoundary';
import ChargesPage from './ChargesPage';
import FinancialReportModal from './FinancialReportModal';
import TaskHelpIcon from './TaskHelpIcon';

const StyledPageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StyledHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5),
  },
}));

const StyledHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  width: '100%',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

const StyledTabsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '4px',
  },
}));

const StyledActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginLeft: 'auto',
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    width: '100%',
    justifyContent: 'space-between',
    order: 2,
  },
}));

const StyledSearchBox = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: 250,
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    margin: theme.spacing(1, 0),
  },
}));

const StatusTab = styled(Box)(({ theme, active, color }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: active ? `${color}20` : 'transparent',
  color: active ? color : theme.palette.text.primary,
  fontWeight: active ? 600 : 400,
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: active ? `${color}30` : theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 1.5),
    fontSize: '0.85rem',
  }
}));

const TasksPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const tableContainerRef = useRef(null);
  const observer = useRef(null);
  
  const [viewMode, setViewMode] = useState(localStorage.getItem('tasksViewMode') || 'list');
  const [currentView, setCurrentView] = useState(localStorage.getItem('tasksViewMode') || 'list');
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('pending');
  const [searchText, setSearchText] = useState('');
  const [hasMore, setHasMore] = useState(true);
  
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
  const [actionsMenuAnchorEl, setActionsMenuAnchorEl] = useState(null);
  const [financialMenuAnchor, setFinancialMenuAnchor] = useState(null);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [openFinancialReportModal, setOpenFinancialReportModal] = useState(false);
  const [openSubjectModal, setOpenSubjectModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    status: '',
    userId: '',
    categoryId: '',
    hasAttachments: false,
    chargeStatus: '',
    isRecurrent: false,
    employerId: '',
    showDeleted: false
  });
  
  const [taskStats, setTaskStats] = useState({
    all: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  
  const [page, setPage] = useState(1);
  const [lastQuery, setLastQuery] = useState('');
  
  const tabs = [
    { id: 'pending', label: i18n.t('tasks.tabs.pending'), color: theme.palette.warning.main },
    { id: 'inProgress', label: i18n.t('tasks.tabs.inProgress'), color: theme.palette.info.main },
    { id: 'completed', label: i18n.t('tasks.tabs.completed'), color: theme.palette.success.main },
    { id: 'paid', label: i18n.t('tasks.tabs.paid') || 'Pagas', color: theme.palette.success.dark },
    { id: 'unpaid', label: i18n.t('tasks.tabs.unpaid') || 'Não Pagas', color: theme.palette.error.main },
    { id: 'recurrent', label: i18n.t('tasks.tabs.recurrent') || 'Recorrentes', color: theme.palette.secondary.main },
    { id: 'all', label: i18n.t('tasks.tabs.all'), color: theme.palette.primary.main },
    ...(user?.profile === 'admin' ? [
      { id: 'deleted', label: i18n.t('tasks.tabs.deleted') || 'Excluídas', color: theme.palette.grey[700] }
    ] : [])
  ];

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/task/category');
      if (response && response.data) {
        if (response.data && response.data.success) {
          setCategories(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          setCategories(Array.isArray(response.data) ? response.data : []);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  }, []);

  const fetchEmployers = useCallback(async () => {
    try {
      const response = await api.get('/employers');
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setEmployers(response.data);
        } else if (response.data.employers && Array.isArray(response.data.employers)) {
          setEmployers(response.data.employers);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  }, []);

  const fetchTaskStats = useCallback(async () => {
    try {
      if (!user || !user.profile) return;
      
      const { data } = await api.get('/task/status');
      
      if (data) {
        setTaskStats({
          all: data.all || 0,
          pending: data.pending || 0,
          inProgress: data.inProgress || 0,
          completed: data.completed || 0,
          paid: data.paid || 0,
          unpaid: data.unpaid || 0,
          recurrent: data.recurrent || 0
        });
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [user]);

  const getQueryParams = useCallback((pageNum = 1, isLoadingMore = false) => {
    let statusFilter = '';
    let chargeStatusFilter = '';
    let isRecurrentFilter = false;
    let showDeletedFilter = false;
    
    if (currentTab && !isLoadingMore) {
      switch (currentTab) {
        case 'all':
          // Todas as tarefas não excluídas
          statusFilter = '';
          chargeStatusFilter = '';
          isRecurrentFilter = false;
          showDeletedFilter = false;
          break;
        
        case 'pending':
          // Pendentes (to_do)
          statusFilter = 'false';  // done = false
          chargeStatusFilter = '';
          isRecurrentFilter = false;
          showDeletedFilter = false;
          break;
        
        case 'inProgress':
          // Em progresso
          statusFilter = 'inProgress';
          chargeStatusFilter = '';
          isRecurrentFilter = false;
          showDeletedFilter = false;
          break;
        
        case 'completed':
          // Concluídas
          statusFilter = 'true';  // done = true
          chargeStatusFilter = '';
          isRecurrentFilter = false;
          showDeletedFilter = false;
          break;
        
        case 'paid':
          // Tarefas cobradas (pagas)
          statusFilter = '';
          chargeStatusFilter = 'paid';
          isRecurrentFilter = false;
          showDeletedFilter = false;
          break;
        
        case 'unpaid':
          // Tarefas em cobrança (pendentes)
          statusFilter = '';
          chargeStatusFilter = 'pending';
          isRecurrentFilter = false;
          showDeletedFilter = false;
          break;
        
        case 'recurrent':
          // Tarefas recorrentes
          statusFilter = '';
          chargeStatusFilter = '';
          isRecurrentFilter = true;
          showDeletedFilter = false;
          break;
        
        case 'deleted':
          // Tarefas excluídas
          statusFilter = '';
          chargeStatusFilter = '';
          isRecurrentFilter = false;
          showDeletedFilter = true;
          break;
        
        default:
          statusFilter = '';
          chargeStatusFilter = '';
          isRecurrentFilter = false;
          showDeletedFilter = false;
          break;
      }
    }
    
    const params = {
      ...filters,
      status: statusFilter,
      chargeStatus: chargeStatusFilter,
      isRecurrent: isRecurrentFilter,
      search: searchText,
      pageNumber: pageNum || 1,
      pageSize: 50,
      showDeleted: showDeletedFilter
    };
    
    const queryString = JSON.stringify({...params, pageNumber: 1});
    
    return { params, queryString };
  }, [filters, currentTab, searchText]);

  const fetchTasks = useCallback(async (isLoadingMore = false) => {
    try {
      if (!isLoadingMore) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      
      const pageNum = isLoadingMore ? page : 1;
      const { params, queryString } = getQueryParams(pageNum, isLoadingMore);

      if (currentTab === 'deleted') {
        params.showDeleted = true;
      }
      
      if (isLoadingMore && queryString !== lastQuery) {
        setLoadingMore(false);
        return;
      }
      
      if (!isLoadingMore) {
        setLastQuery(queryString);
      }
      
      if (!user || !user.profile) {
        throw new Error('Usuário inválido');
      }
      
      const endpoint = user.profile === 'user' ? '/task/user' : '/task';
      
      const response = await api.get(endpoint, { params });
      
      if (!response || !response.data) {
        throw new Error('Resposta inválida da API');
      }
      
      const tasksArray = Array.isArray(response.data.tasks) 
        ? response.data.tasks.filter(t => t && t.id) 
        : [];
      const totalCount = response.data.count || 0;
      
      if (isLoadingMore) {
        setTasks(prevTasks => {
          const prevTasksArray = Array.isArray(prevTasks) ? prevTasks : [];
          const taskIds = new Set(prevTasksArray.filter(t => t && t.id).map(t => t.id));
          const newTasks = tasksArray.filter(task => !taskIds.has(task.id));
          return [...prevTasksArray, ...newTasks];
        });
      } else {
        setTasks(tasksArray);
        setPage(1);
      }
      
      const currentTasksCount = isLoadingMore ? 
        (Array.isArray(tasks) ? tasks.length : 0) + tasksArray.length : 
        tasksArray.length;
        
      setHasMore(tasksArray.length > 0 && currentTasksCount < totalCount);
      
      fetchTaskStats();
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setError(i18n.t('tasks.errors.loadFailed') || 'Erro ao carregar tarefas');
      toast.error(i18n.t('tasks.errors.loadFailed') || 'Erro ao carregar tarefas');
      setTasks(prev => Array.isArray(prev) ? prev : []);
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [user, getQueryParams, fetchTaskStats, tasks, page, lastQuery]);

  const loadMoreTasks = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      setPage(prevPage => prevPage + 1);
      fetchTasks(true);
    }
  }, [hasMore, loading, loadingMore, fetchTasks]);

  useEffect(() => {
    if (viewMode !== 'list') return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreTasks();
      }
    }, options);

    const observerTarget = document.getElementById('infinite-scroll-trigger');
    if (observerTarget) {
      observer.current.observe(observerTarget);
    }

    return () => {
      if (observer.current && observerTarget) {
        observer.current.unobserve(observerTarget);
      }
    };
  }, [loadMoreTasks, viewMode]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        await Promise.all([fetchCategories(), fetchTaskStats(), fetchEmployers()]);
        await fetchTasks();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setInitialLoading(false);
      }
    };
  
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [currentTab]);

  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId || !socketManager) return;

    try {
      const socket = socketManager.GetSocket(companyId);

      const handleTaskUpdate = (data) => {
        if (!data) return;
        
        switch(data.type) {
          case 'task-created':
          case 'task-updated':
          case 'task-deleted':
          case 'task-status-updated':
            console.log('[Tasks] Recebido evento de atualização:', data);
            fetchTasks();
            fetchTaskStats();
            break;
          default:
            break;
        }
      };

      if (socket) {
        socket.on('task-update', handleTaskUpdate);
        return () => socket.off('task-update', handleTaskUpdate);
      }
    } catch (error) {
      console.error('Erro ao configurar socket:', error);
    }
  }, [fetchTasks, fetchTaskStats, socketManager]);

  const handleViewModeChange = useCallback((mode) => {
    if (!mode) return;
    setViewMode(mode);
    setCurrentView(mode);
    localStorage.setItem('tasksViewMode', mode);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    if (!tabId) return;
    setCurrentTab(tabId);
  
    // Limpar os dados atuais para forçar nova requisição
    setTasks([]);
    setPage(1);
    setHasMore(true);
  
    // Ajustar o estado showDeleted ao mudar para a aba de excluídos
    if (tabId === 'deleted') {
      setShowDeleted(true);
    } else {
      setShowDeleted(false);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    if (!e || !e.target) return;
    setSearchText(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (!e) return;
    if (e.key === 'Enter') {
      setPage(1);
      setTasks([]);
      fetchTasks();
    }
  }, [fetchTasks]);

  const onFilterChange = useCallback((newFilters) => {
    if (!newFilters) return;
    setFilters(newFilters);
    setTasks([]);
    setPage(1);
    setHasMore(true);
  }, []);

  const handleTaskClick = useCallback((task) => {
    if (!task) return;
    setSelectedTask(task);
    setOpenDetailsModal(true);
  }, []);

  const handleOpenNewTask = useCallback(() => {
    setSelectedTask(null);
    setOpenTaskModal(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    if (!task) return;
    setSelectedTask(task);
    setOpenTaskModal(true);
  }, []);

  const handleDeleteTaskPrompt = useCallback((task) => {
    if (!task) return;
    setSelectedTask(task);
    setOpenConfirmModal(true);
  }, []);

  const handleDeleteTask = useCallback(async () => {
    if (!selectedTask || !selectedTask.id) return;

    try {
      await api.delete(`/task/${selectedTask.id}`);
      toast.success(i18n.t('tasks.notifications.deleted') || 'Tarefa excluída com sucesso');
      fetchTasks();
      fetchTaskStats();
      setOpenConfirmModal(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      toast.error(i18n.t('tasks.notifications.deleteError') || 'Erro ao excluir tarefa');
    }
  }, [selectedTask, fetchTasks, fetchTaskStats]);

  const handleStatusToggle = useCallback(async (task) => {
    if (!task || !task.id) return;
  
    // Salva os valores originais para possível reversão
    const originalTask = { ...task };
  
    try {
      let updatedTask;
  
      // Determina o novo estado da tarefa
      if ('inProgress' in task) {
        updatedTask = { ...task };
      } else {
        updatedTask = {
          ...task,
          done: !task.done,
          // Garante que inProgress seja false se a tarefa foi concluída
          inProgress: task.done ? task.inProgress : false
        };
        
        // Remove "em andamento" se tarefa foi marcada como concluída
        if (updatedTask.done) {
          updatedTask.inProgress = false;
        }
      }
  
      // Atualização otimista do estado local
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, ...updatedTask } : t
        )
      );
  
      // Chamada à API com apenas os campos necessários
      await api.put(`/task/${task.id}`, {
        done: updatedTask.done,
        inProgress: updatedTask.inProgress
      });
  
      // Feedback visual
      toast.success(i18n.t('tasks.notifications.statusUpdated') || 'Status atualizado com sucesso');
    } catch (err) {
      // Reverte para os valores originais em caso de erro
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === originalTask.id ? { ...t, ...originalTask } : t
        )
      );
      
      console.error('Erro ao atualizar status:', err);
      toast.error(i18n.t('tasks.notifications.updateError') || 'Erro ao atualizar status');
    }
  }, []);

  const canManageTask = useCallback((task) => {
    if (!task || !user) return false;
    const userId = user.id;
    return user.profile !== 'user' || task.creator?.id === userId || task.responsible?.id === userId;
  }, [user]);

  const handleOpenSortMenu = useCallback((event) => {
    setSortMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseSortMenu = useCallback(() => {
    setSortMenuAnchorEl(null);
  }, []);

  const handleOpenExportMenu = useCallback((event) => {
    setExportMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseExportMenu = useCallback(() => {
    setExportMenuAnchorEl(null);
  }, []);

  const handleOpenActionsMenu = useCallback((event) => {
    setActionsMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseActionsMenu = useCallback(() => {
    setActionsMenuAnchorEl(null);
  }, []);

  const handleOpenFinancialMenu = useCallback((event) => {
    setFinancialMenuAnchor(event.currentTarget);
  }, []);

  const handleCloseFinancialMenu = useCallback(() => {
    setFinancialMenuAnchor(null);
  }, []);

  const handleManageSubjects = useCallback(() => {
    setOpenSubjectModal(true);
    handleCloseActionsMenu();
  }, [handleCloseActionsMenu]);

  const handleSort = useCallback((criterion) => {
    if (!criterion) return;

    try {
      let sortedTasks = Array.isArray(tasks) ? [...tasks] : [];

      switch (criterion) {
        case 'dueDate':
          sortedTasks.sort((a, b) => {
            if (!a || !a.dueDate) return 1;
            if (!b || !b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          });
          break;
        case 'title':
          sortedTasks.sort((a, b) => {
            if (!a || !a.title) return 1;
            if (!b || !b.title) return -1;
            return a.title.localeCompare(b.title);
          });
          break;
        case 'category':
          sortedTasks.sort((a, b) => {
            const categoryA = a && a.taskCategory ? a.taskCategory.name : '';
            const categoryB = b && b.taskCategory ? b.taskCategory.name : '';
            return categoryA.localeCompare(categoryB);
          });
          break;
        default:
          break;
      }

      setTasks(sortedTasks);
    } catch (error) {
      console.error('Erro ao ordenar tarefas:', error);
    } finally {
      handleCloseSortMenu();
    }
  }, [tasks, handleCloseSortMenu]);

  const handleManageCategories = useCallback(() => {
    setOpenCategoryModal(true);
    handleCloseActionsMenu();
  }, [handleCloseActionsMenu]);

  const handleOpenImport = useCallback(() => {
    setOpenImportModal(true);
    handleCloseActionsMenu();
  }, [handleCloseActionsMenu]);

  const handleManageCharges = useCallback(() => {
    setCurrentView('charges');
    handleCloseFinancialMenu();
  }, [handleCloseFinancialMenu]);

  const handleOpenFinancialReport = useCallback(() => {
    setOpenFinancialReportModal(true);
    handleCloseFinancialMenu();
  }, [handleCloseFinancialMenu]);

  const handleGoToReports = useCallback(() => {
    setCurrentView('reports');
  }, []);

  const handleBackFromReports = useCallback(() => {
    setCurrentView(viewMode);
  }, [viewMode]);

  const renderMainContent = () => {
    if (currentView === 'reports') {
      return (
        <TaskReportsComponent onBackClick={handleBackFromReports} />
      );
    }

    if (currentView === 'charges') {
      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => setCurrentView(viewMode)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              {i18n.t('tasks.charges.title') || 'Gerenciar Cobranças'}
            </Typography>
          </Box>
          <ChargesPage />
        </Box>
      );
    }

    if (initialLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    const isCompletelyEmpty = 
      !loading && 
      (tasks.length === 0) && 
      !hasMore && 
      !Object.values(filters).some(v => v !== '' && v !== false);

    if (isCompletelyEmpty) {
      return (
        <Paper 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderRadius: 2,
            height: '30vh'
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {i18n.t('tasks.empty.title') || 'Nenhuma tarefa encontrada'}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {i18n.t('tasks.empty.description') || 'Clique no botão abaixo para adicionar uma nova tarefa'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenNewTask}
          >
            {i18n.t('tasks.buttons.add') || 'Adicionar Tarefa'}
          </Button>
        </Paper>
      );
    }

    return currentView === 'list' ? (
      <Box ref={tableContainerRef} sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <TasksTable 
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onStatusToggle={handleStatusToggle}
          Task
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTaskPrompt}
          canManageTask={canManageTask}
          loading={loading}
        />
        
        {hasMore && (
          <Box 
            id="infinite-scroll-trigger"
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              p: 2
            }}
          >
            {loadingMore ? <CircularProgress size={24} /> : <Typography variant="caption">Role para carregar mais</Typography>}
          </Box>
        )}
      </Box>
    ) : (
      <TaskBoard
        toggleFilters={() => setFiltersVisible(!filtersVisible)}
        filtersVisible={filtersVisible}
        filters={filters}
        setFilters={setFilters}
        onViewChange={() => handleViewModeChange('list')}
        onManageCategories={handleManageCategories}
      />
    );
  };

  return (
    <StyledPageContainer>
      <ErrorBoundary onReset={() => fetchTasks()} reloadOnError={true}>
        {currentView !== 'reports' && currentView !== 'charges' && (
          <StyledHeader>
            <StyledHeaderContent>
              <Typography variant={isMobile ? "h6" : "h5"} component="h1" sx={{ 
                fontWeight: 'bold', 
                mr: 2,
                flexShrink: 0
              }}>
                {i18n.t('tasks.title') || 'Tarefas'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <TaskHelpIcon />
              </Box>
              
              {!isMobile && (
                <StyledActions>
                  <StyledSearchBox>
                    <IconButton size="small" onClick={() => fetchTasks()}>
                      <SearchIcon fontSize="small" />
                    </IconButton>
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder={i18n.t('tasks.search') || 'Pesquisar'}
                      value={searchText}
                      onChange={handleSearchChange}
                      onKeyPress={handleKeyPress}
                      fullWidth
                    />
                  </StyledSearchBox>
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {currentView === 'list' && (
                      <Tooltip title={i18n.t('tasks.buttons.toggleFilters') || 'Mostrar/Ocultar Filtros'}>
                        <IconButton 
                          color={filtersVisible ? "primary" : "default"}
                          onClick={() => setFiltersVisible(!filtersVisible)}
                          size="small"
                        >
                          <FilterListIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title={i18n.t('tasks.buttons.reports') || "Relatórios"}>
                      <IconButton onClick={handleGoToReports} size="small">
                        <BarChartIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={i18n.t('tasks.buttons.finances') || "Finanças"}>
                      <IconButton onClick={handleOpenFinancialMenu} size="small">
                        <AttachMoneyIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {currentView === 'list' && (
                      <>
                        <Tooltip title={i18n.t('tasks.buttons.sort') || 'Ordenar'}>
                          <IconButton onClick={handleOpenSortMenu} size="small">
                            <SortIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={i18n.t('tasks.buttons.refresh') || 'Atualizar'}>
                          <IconButton onClick={() => fetchTasks()} disabled={loading} size="small">
                            {loading && !loadingMore ? <CircularProgress size={20} /> : <RefreshIcon />}
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    <Tooltip title={viewMode === 'list' ? i18n.t('tasks.buttons.kanbanView') || 'Visualização Kanban' : i18n.t('tasks.buttons.listView') || 'Visualização em Lista'}>
                    <IconButton onClick={() => handleViewModeChange(viewMode === 'list' ? 'kanban' : 'list')} size="small">
                        {viewMode === 'list' ? <ViewKanbanIcon /> : <ViewListIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={i18n.t('tasks.buttons.moreActions') || 'Mais Ações'}>
                      <IconButton onClick={handleOpenActionsMenu} size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenNewTask}
                      size={isTablet ? "small" : "medium"}
                    >
                      {i18n.t('tasks.buttons.add') || 'Adicionar'}
                    </Button>
                  </Box>
                </StyledActions>
              )}
            </StyledHeaderContent>
            
            {isMobile && (
              <>
                <StyledSearchBox>
                  <IconButton size="small" onClick={() => fetchTasks()}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={i18n.t('tasks.search') || 'Pesquisar'}
                    value={searchText}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    fullWidth
                  />
                </StyledSearchBox>
                
                <StyledActions>
                {currentView === 'list' && (
                    <Tooltip title={i18n.t('tasks.buttons.toggleFilters') || 'Filtros'}>
                      <IconButton 
                        color={filtersVisible ? "primary" : "default"}
                        onClick={() => setFiltersVisible(!filtersVisible)}
                        size="small"
                      >
                        <FilterListIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title={i18n.t('tasks.buttons.reports') || "Relatórios"}>
                    <IconButton onClick={handleGoToReports} size="small">
                    <BarChartIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={i18n.t('tasks.buttons.finances') || "Finanças"}>
                    <IconButton onClick={handleOpenFinancialMenu} size="small">
                      <AttachMoneyIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {currentView === 'list' && (
                    <Tooltip title={i18n.t('tasks.buttons.sort') || 'Ordenar'}>
                      <IconButton onClick={handleOpenSortMenu} size="small">
                        <SortIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title={i18n.t('tasks.buttons.refresh') || 'Atualizar'}>
                    <IconButton onClick={() => fetchTasks()} disabled={loading} size="small">
                      {loading && !loadingMore ? <CircularProgress size={16} /> : <RefreshIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={viewMode === 'list' ? i18n.t('tasks.buttons.kanbanView') || 'Kanban' : i18n.t('tasks.buttons.listView') || 'Lista'}>
                    <IconButton onClick={() => handleViewModeChange(viewMode === 'list' ? 'kanban' : 'list')} size="small">
                      {viewMode === 'list' ? <ViewKanbanIcon /> : <ViewListIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={i18n.t('tasks.buttons.moreActions') || 'Mais'}>
                    <IconButton onClick={handleOpenActionsMenu} size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={i18n.t('tasks.buttons.add') || 'Adicionar'}>
                    <IconButton
                      color="primary"
                      sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      }}
                      onClick={handleOpenNewTask}
                      size="small"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </StyledActions>
              </>
            )}
            
            {currentView === 'list' && (
              <StyledTabsContainer>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  overflowX: 'auto', 
                  py: 1,
                  width: '100%',
                  '&::-webkit-scrollbar': { height: '4px' },
                  '&::-webkit-scrollbar-track': { background: theme.palette.background.paper },
                  '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '4px' }
                }}>
                  {tabs.map((tab) => (
                    <StatusTab
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      active={currentTab === tab.id}
                      color={tab.color}
                    >
                      {tab.label}
                      <Chip 
                        size="small" 
                        label={taskStats[tab.id === 'all' ? 'all' : tab.id]}
                        sx={{ 
                          backgroundColor: currentTab === tab.id ? tab.color : 'rgba(0,0,0,0.08)',
                          color: currentTab === tab.id ? '#fff' : 'inherit',
                          fontWeight: 'bold',
                          height: 20,
                          '& .MuiChip-label': { px: 1, fontSize: '0.7rem' }
                        }}
                      />
                    </StatusTab>
                  ))}
                </Box>
              </StyledTabsContainer>
            )}
          </StyledHeader>
        )}
        
        {currentView === 'list' && filtersVisible && (
          <TaskFilters
            filters={filters}
            onFilterChange={onFilterChange}
            categories={categories}
            employers={employers}
            loading={loading}
            onApplyFilters={() => fetchTasks()}
          />
        )}
        
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => fetchTasks()}
                >
                  <RefreshIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          </Fade>
        )}
        
        {renderMainContent()}
        
        <TaskSortMenu
          anchorEl={sortMenuAnchorEl}
          open={Boolean(sortMenuAnchorEl)}
          onClose={handleCloseSortMenu}
          onSort={handleSort}
        />
        
        <TaskExportMenu
          anchorEl={exportMenuAnchorEl}
          open={Boolean(exportMenuAnchorEl)}
          onClose={handleCloseExportMenu}
          tasks={tasks}
          filters={filters}
        />
        
        <TaskActionsMenu
          anchorEl={actionsMenuAnchorEl}
          open={Boolean(actionsMenuAnchorEl)}
          onClose={handleCloseActionsMenu}
          onManageCategories={handleManageCategories}
          onImport={handleOpenImport}
          onManageCharges={handleManageCharges}
          onManageSubjects={handleManageSubjects}
        />

        <Menu
          anchorEl={financialMenuAnchor}
          open={Boolean(financialMenuAnchor)}
          onClose={handleCloseFinancialMenu}
        >
          <MenuItem onClick={handleManageCharges}>
            <ListItemIcon>
              <ReceiptIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t('tasks.charges.title') || 'Gerenciar Cobranças'} />
          </MenuItem>
          
          <MenuItem onClick={handleOpenFinancialReport}>
            <ListItemIcon>
              <BarChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t('tasks.financialReports.title') || 'Relatórios Financeiros'} />
          </MenuItem>
        </Menu>
        
        <TaskDetailsModal
          open={openDetailsModal}
          onClose={() => setOpenDetailsModal(false)}
          task={selectedTask}
          onStatusToggle={handleStatusToggle}
          canEdit={selectedTask ? canManageTask(selectedTask) : false}
          onEdit={() => handleEditTask(selectedTask)}
        />
        
        <TaskModal
          open={openTaskModal}
          onClose={() => {
            setOpenTaskModal(false);
            fetchTasks();
          }}
          task={selectedTask}
        />
        
        <ConfirmationModal
          open={openConfirmModal}
          onClose={() => setOpenConfirmModal(false)}
          onConfirm={handleDeleteTask}
          title={i18n.t('tasks.confirmations.delete.title') || 'Confirmar exclusão'}
          message={i18n.t('tasks.confirmations.delete.message') || 'Tem certeza que deseja excluir esta tarefa?'}
        />
        
        <TaskCategoryModal
          open={openCategoryModal}
          onClose={() => setOpenCategoryModal(false)}
          onSuccess={() => {
            fetchCategories();
            setOpenCategoryModal(false);
          }}
        />
        
        <TaskImportModal
          open={openImportModal}
          onClose={() => setOpenImportModal(false)}
          onSuccess={() => {
            fetchTasks();
            setOpenImportModal(false);
          }}
        />

        <FinancialReportModal
          open={openFinancialReportModal}
          onClose={() => setOpenFinancialReportModal(false)}
          employers={employers || []}
        />

        <TaskSubjectModal
          open={openSubjectModal}
          onClose={() => setOpenSubjectModal(false)}
          onSuccess={() => {
            loadInitialData();
            setOpenSubjectModal(false);
          }}
        />
      </ErrorBoundary>
    </StyledPageContainer>
  );
};

export default TasksPage;