import { useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '../context/Auth/AuthContext';
import api from '../services/api';
import { toast } from '../helpers/toast';
import { i18n } from '../translate/i18n';

/**
 * Hook personalizado para gerenciar tarefas no AutoAtende
 * @param {Object} initialFilters - Filtros iniciais para busca de tarefas
 * @returns {Object} Retorna funções e estados para gerenciar tarefas
 */
export const useAutoTasks = (initialFilters = {}) => {
  const { user } = useContext(AuthContext);
  
  // Estados
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [totalTasks, setTotalTasks] = useState(0);

  // Validações robustas
  const validateTaskData = (taskData) => {
    const errors = [];
    
    if (!taskData || typeof taskData !== 'object') {
      return 'Dados da tarefa inválidos';
    }
    
    if (!taskData.title?.trim()) {
      errors.push(i18n.t("tasks.validations.titleRequired") || "Título é obrigatório");
    }
    
    if (!taskData.taskCategoryId) {
      errors.push(i18n.t("tasks.validations.categoryRequired") || "Categoria é obrigatória");
    }
    
    return errors.length > 0 ? errors.join(', ') : null;
  };

  // Reset do estado
  const resetState = useCallback(() => {
    setTasks([]);
    setSelectedTask(null);
    setLoading(false);
    setSubmitting(false);
    setError(null);
    setTotalTasks(0);
  }, []);

  // Função principal de busca com melhor tratamento de erros
  const fetchTasks = useCallback(async (filters = {}) => {
    // Previne requisições desnecessárias se não houver usuário ou companyId
    if (!user?.id || !user?.companyId) {
      setError('Usuário não autenticado corretamente');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '/task/user';
      if (user.profile === 'admin' || user.super) {
        endpoint = '/task';
      } else if (user.profile === 'superv') {
        endpoint = '/task/supervisor';
      }

      // Garante que os filtros são um objeto válido
      const safeFilters = typeof filters === 'object' ? filters : {};

      const response = await api.get(endpoint, { params: safeFilters });
      
      // Validação mais robusta da resposta
      if (!response?.data) {
        throw new Error('Resposta vazia do servidor');
      }
      
      // Trata diferentes formatos de resposta
      if (Array.isArray(response.data)) {
        setTasks(response.data);
        setTotalTasks(response.data.length);
      } else if (response.data.tasks && Array.isArray(response.data.tasks)) {
        setTasks(response.data.tasks);
        setTotalTasks(response.data.count || response.data.tasks.length);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.fetchFailed") || "Falha ao buscar tarefas";
      setError(errorMsg);
      toast.error(errorMsg);
      // Mantém a lista anterior em caso de erro
      setTasks(prev => prev || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Criar tarefa com melhor tratamento de erros
  const createTask = async (taskData) => {
    const validationError = validateTaskData(taskData);
    if (validationError) {
      toast.error(validationError);
      throw new Error(validationError);
    }

    setSubmitting(true);
    try {
      // Certifica-se de incluir o companyId se não estiver presente
      const payload = {
        ...taskData,
        companyId: taskData.companyId || user.companyId
      };

      const { data } = await api.post('/task', payload);
      
      // Se a resposta for bem-sucedida, atualiza a lista de tarefas
      if (data) {
        setTasks(prev => [data, ...prev]);
        toast.success(i18n.t("tasks.success.created") || "Tarefa criada com sucesso");
      }
      
      return data;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.createFailed") || "Falha ao criar tarefa";
      toast.error(errorMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Atualizar tarefa com melhor tratamento de erros
  const updateTask = async (taskId, taskData) => {
    if (!taskId) {
      const error = "ID da tarefa não fornecido";
      toast.error(error);
      throw new Error(error);
    }
    
    const validationError = validateTaskData(taskData);
    if (validationError) {
      toast.error(validationError);
      throw new Error(validationError);
    }

    setSubmitting(true);
    try {
      const { data } = await api.put(`/task/${taskId}`, taskData);
      
      // Atualiza a tarefa na lista localmente para evitar nova requisição
      setTasks(prev => 
        prev.map(task => task.id === taskId ? { ...task, ...data } : task)
      );
      
      // Se a tarefa atualizada é a selecionada, atualiza também
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({...selectedTask, ...data});
      }
      
      toast.success(i18n.t("tasks.success.updated") || "Tarefa atualizada com sucesso");
      return data;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.updateFailed") || "Falha ao atualizar tarefa";
      toast.error(errorMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status com melhor tratamento de erros
  const toggleTaskStatus = async (taskId) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      toast.error("Tarefa não encontrada");
      return;
    }

    try {
      // Atualiza localmente primeiro para resposta mais rápida
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      );
      
      // Se é a tarefa selecionada, atualiza também
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({...selectedTask, done: !selectedTask.done});
      }
      
      const updatedTask = await api.put(`/task/${taskId}`, { ...task, done: !task.done });
      
      toast.success(i18n.t("tasks.success.statusUpdated") || "Status atualizado com sucesso");
      return updatedTask.data;
    } catch (error) {
      console.error('Erro ao alterar status da tarefa:', error);
      const errorMsg = error.response?.data?.error || error.message || i18n.t("tasks.errors.updateFailed") || "Falha ao alterar status";
      
      // Reverte a atualização local em caso de erro
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, done: task.done } : t)
      );
      
      // Reverte também a tarefa selecionada se necessário
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({...selectedTask, done: task.done});
      }
      
      toast.error(errorMsg);
      throw error;
    }
  };

  // Deletar tarefa com melhor tratamento de erros
  const deleteTask = async (taskId) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return;
    }
    
    setSubmitting(true);
    try {
      await api.delete(`/task/${taskId}`);
      
      // Remove a tarefa da lista localmente
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Se a tarefa excluída era a selecionada, limpa a seleção
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
      
      toast.success(i18n.t("tasks.success.deleted") || "Tarefa excluída com sucesso");
      return true;
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.deleteFailed") || "Falha ao excluir tarefa";
      toast.error(errorMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Notas com melhor tratamento de erros
  const addNote = async (taskId, content) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return;
    }
    
    if (!content || !content.trim()) {
      const errorMsg = i18n.t("tasks.validations.noteRequired") || "Conteúdo da nota é obrigatório";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data } = await api.post(`/task/${taskId}/notes`, { content: content.trim() });
      toast.success(i18n.t("tasks.success.noteAdded") || "Nota adicionada com sucesso");
      return data;
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.addNoteFailed") || "Falha ao adicionar nota";
      toast.error(errorMsg);
      throw err;
    }
  };

  const getNotes = async (taskId) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return [];
    }
    
    try {
      const { data } = await api.get(`/task/${taskId}/notes`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.getNotesFailed") || "Falha ao buscar notas";
      toast.error(errorMsg);
      return [];
    }
  };

  const updateNote = async (taskId, noteId, content) => {
    if (!taskId || !noteId) {
      toast.error("ID da tarefa ou da nota não fornecido");
      return;
    }
    
    if (!content || !content.trim()) {
      const errorMsg = i18n.t("tasks.validations.noteRequired") || "Conteúdo da nota é obrigatório";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data } = await api.put(`/task/${taskId}/notes/${noteId}`, { content: content.trim() });
      toast.success(i18n.t("tasks.success.noteUpdated") || "Nota atualizada com sucesso");
      return data;
    } catch (err) {
      console.error('Erro ao atualizar nota:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.updateNoteFailed") || "Falha ao atualizar nota";
      toast.error(errorMsg);
      throw err;
    }
  };

  const deleteNote = async (taskId, noteId) => {
    if (!taskId || !noteId) {
      toast.error("ID da tarefa ou da nota não fornecido");
      return;
    }

    try {
      await api.delete(`/task/${taskId}/notes/${noteId}`);
      toast.success(i18n.t("tasks.success.noteDeleted") || "Nota excluída com sucesso");
      return true;
    } catch (err) {
      console.error('Erro ao excluir nota:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.deleteNoteFailed") || "Falha ao excluir nota";
      toast.error(errorMsg);
      throw err;
    }
  };

  // Anexos com melhor tratamento de erros
  const addAttachment = async (taskId, file) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return;
    }
    
    if (!file) {
      const errorMsg = i18n.t("tasks.validations.fileRequired") || "Arquivo é obrigatório";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Validação básica de tamanho e tipo do arquivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const errorMsg = i18n.t("tasks.validations.fileTooLarge") || "Arquivo muito grande (máximo 10MB)";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post(`/task/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          // Opcional: implementar barra de progresso aqui
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progresso: ${percentCompleted}%`);
        }
      });
      toast.success(i18n.t("tasks.success.attachmentAdded") || "Anexo adicionado com sucesso");
      return data;
    } catch (err) {
      console.error('Erro ao adicionar anexo:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.addAttachmentFailed") || "Falha ao adicionar anexo";
      toast.error(errorMsg);
      throw err;
    }
  };

  const getAttachments = async (taskId) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return [];
    }
    
    try {
      const { data } = await api.get(`/task/${taskId}/attachments`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Erro ao buscar anexos:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.getAttachmentsFailed") || "Falha ao buscar anexos";
      toast.error(errorMsg);
      return [];
    }
  };

  const deleteAttachment = async (taskId, attachmentId) => {
    if (!taskId || !attachmentId) {
      toast.error("ID da tarefa ou do anexo não fornecido");
      return;
    }

    try {
      await api.delete(`/task/${taskId}/attachments/${attachmentId}`);
      toast.success(i18n.t("tasks.success.attachmentDeleted") || "Anexo excluído com sucesso");
      return true;
    } catch (err) {
      console.error('Erro ao excluir anexo:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.deleteAttachmentFailed") || "Falha ao excluir anexo";
      toast.error(errorMsg);
      throw err;
    }
  };

  // Timeline com melhor tratamento de erros
  const getTimeline = async (taskId) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return [];
    }
    
    try {
      const { data } = await api.get(`/task/${taskId}/timeline`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Erro ao buscar timeline:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.getTimelineFailed") || "Falha ao buscar timeline";
      toast.error(errorMsg);
      return [];
    }
  };

  // Usuários do grupo com melhor tratamento de erros
  const addGroupUsers = async (taskId, userIds) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return;
    }
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      const errorMsg = i18n.t("tasks.validations.usersRequired") || "Selecione pelo menos um usuário";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data } = await api.post(`/task/${taskId}/users`, { userIds });
      toast.success(i18n.t("tasks.success.usersAdded") || "Usuários adicionados com sucesso");
      return data;
    } catch (err) {
      console.error('Erro ao adicionar usuários:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.addUsersFailed") || "Falha ao adicionar usuários";
      toast.error(errorMsg);
      throw err;
    }
  };

  const removeGroupUser = async (taskId, userId) => {
    if (!taskId || !userId) {
      toast.error("ID da tarefa ou do usuário não fornecido");
      return;
    }

    try {
      await api.delete(`/task/${taskId}/users/${userId}`);
      toast.success(i18n.t("tasks.success.userRemoved") || "Usuário removido com sucesso");
      return true;
    } catch (err) {
      console.error('Erro ao remover usuário:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.removeUserFailed") || "Falha ao remover usuário";
      toast.error(errorMsg);
      throw err;
    }
  };

  // Obter uma tarefa específica com melhor tratamento de erros
  const getTaskById = async (taskId) => {
    if (!taskId) {
      toast.error("ID da tarefa não fornecido");
      return null;
    }
    
    try {
      const { data } = await api.get(`/task/${taskId}`);
      if (data) {
        setSelectedTask(data);
      }
      return data;
    } catch (err) {
      console.error('Erro ao buscar tarefa:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.getTaskFailed") || "Falha ao buscar detalhes da tarefa";
      toast.error(errorMsg);
      return null;
    }
  };

  // Tarefas recorrentes com melhor tratamento de erros
  const createRecurrentTask = async (taskData, recurrenceConfig) => {
    const validationError = validateTaskData(taskData);
    if (validationError) {
      toast.error(validationError);
      throw new Error(validationError);
    }
    
    if (!recurrenceConfig || !recurrenceConfig.type) {
      const errorMsg = i18n.t("tasks.validations.recurrenceRequired") || "Configuração de recorrência é obrigatória";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    setSubmitting(true);
    try {
      const payload = {
        ...taskData,
        companyId: taskData.companyId || user.companyId,
        isRecurrent: true,
        recurrenceType: recurrenceConfig.type,
        recurrenceEndDate: recurrenceConfig.endDate || null,
        recurrenceCount: recurrenceConfig.count || null
      };

      const { data } = await api.post('/task', payload);
      
      toast.success(i18n.t("tasks.success.recurrentCreated") || "Tarefa recorrente criada com sucesso");
      return data;
    } catch (err) {
      console.error('Erro ao criar tarefa recorrente:', err);
      const errorMsg = err.response?.data?.error || err.message || i18n.t("tasks.errors.createRecurrentFailed") || "Falha ao criar tarefa recorrente";
      toast.error(errorMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Efeito para carregar tarefas iniciais
  useEffect(() => {
    if (initialFilters && typeof initialFilters === 'object') {
      fetchTasks(initialFilters);
    }
  }, [fetchTasks, initialFilters]);

  return {
    // Estados
    tasks,
    selectedTask,
    loading,
    submitting,
    error,
    totalTasks,
    
    // Funções principais
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getTaskById,
    
    // Notas
    addNote,
    getNotes,
    updateNote,
    deleteNote,
    
    // Anexos
    addAttachment,
    getAttachments,
    deleteAttachment,
    
    // Timeline
    getTimeline,
    
    // Usuários
    addGroupUsers,
    removeGroupUser,
    
    // Tarefas recorrentes
    createRecurrentTask,
    
    // UI
    setSelectedTask,
    resetState
  };
};

// PropTypes para os objetos utilizados
export const TaskPropTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  dueDate: PropTypes.string,
  color: PropTypes.string,
  done: PropTypes.bool.isRequired,
  companyId: PropTypes.number.isRequired,
  taskCategoryId: PropTypes.number,
  createdBy: PropTypes.number.isRequired,
  responsibleUserId: PropTypes.number,
  creator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    profile: PropTypes.string
  }),
  responsible: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    profile: PropTypes.string
  }),
  taskCategory: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  })),
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  isRecurrent: PropTypes.bool,
  recurrenceType: PropTypes.string,
  recurrenceEndDate: PropTypes.string,
  recurrenceCount: PropTypes.number,
  hasCharge: PropTypes.bool,
  chargeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isPaid: PropTypes.bool,
  paymentDate: PropTypes.string,
  paymentNotes: PropTypes.string,
  inProgress: PropTypes.bool,
  isPrivate: PropTypes.bool,
  requesterName: PropTypes.string,
  requesterEmail: PropTypes.string,
  contactId: PropTypes.number,
  subjectId: PropTypes.number,
  contact: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string
  }),
  subject: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  })
};

export const FiltersPropTypes = PropTypes.shape({
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  status: PropTypes.string,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  search: PropTypes.string,
  hasAttachments: PropTypes.bool,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
  categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chargeStatus: PropTypes.string,
  isRecurrent: PropTypes.bool
});

export const NotePropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  content: PropTypes.string.isRequired,
  taskId: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string
});

export const AttachmentPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  filename: PropTypes.string.isRequired,
  originalName: PropTypes.string.isRequired,
  mimeType: PropTypes.string.isRequired,
  size: PropTypes.number,
  path: PropTypes.string,
  filePath: PropTypes.string,
  taskId: PropTypes.number.isRequired,
  uploadedBy: PropTypes.number,
  uploader: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string
});

export const TimelineEventPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  action: PropTypes.string.isRequired,
  details: PropTypes.object,
  taskId: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string
});

export const RecurrenceConfigPropTypes = PropTypes.shape({
  type: PropTypes.oneOf(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual']).isRequired,
  endDate: PropTypes.string,
  count: PropTypes.number
});

// PropTypes para o retorno do hook
export const UseAutoTasksReturnPropTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape(TaskPropTypes)).isRequired,
  selectedTask: PropTypes.shape(TaskPropTypes),
  loading: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  error: PropTypes.string,
  totalTasks: PropTypes.number.isRequired,
  
  fetchTasks: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
  toggleTaskStatus: PropTypes.func.isRequired,
  getTaskById: PropTypes.func.isRequired,
  
  addNote: PropTypes.func.isRequired,
  getNotes: PropTypes.func.isRequired,
  updateNote: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
  
  addAttachment: PropTypes.func.isRequired,
  getAttachments: PropTypes.func.isRequired,
  deleteAttachment: PropTypes.func.isRequired,
  
  getTimeline: PropTypes.func.isRequired,
  
  addGroupUsers: PropTypes.func.isRequired,
  removeGroupUser: PropTypes.func.isRequired,
  
  createRecurrentTask: PropTypes.func.isRequired,
  
  setSelectedTask: PropTypes.func.isRequired,
  resetState: PropTypes.func.isRequired
};