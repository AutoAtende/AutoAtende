// TaskModal.jsx (continuação)
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import TaskCategoryModal from './TaskCategoryModal';
import TaskSubjectModal from './TaskSubjectModal';
import { AuthContext } from "../../../context/Auth/AuthContext";

const StyledContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const TaskModal = ({ open, onClose, task, initialText = '' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const isRegularUser = user?.profile === 'user';
  
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openSubjectModal, setOpenSubjectModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState(null); 
  // Estados adicionais para acordeões
  const [expandedCharge, setExpandedCharge] = useState(false);
  const [expandedRecurrence, setExpandedRecurrence] = useState(false);
  
  // Estado do formulário - sempre inicializado com valores padrão
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    dueDate: '',
    categoryId: '',
    assignmentType: 'individual',
    responsibleUserId: '',
    groupUsers: [],
    done: false,
    employerId: '',
    subjectId: '',
    requesterName: '',
    requesterEmail: '',
    isPrivate: false,
    // Campos de cobrança
    hasCharge: false,
    chargeValue: '',
    isPaid: false,
    paymentDate: '',
    paymentNotes: '',
    // Campos de recorrência
    isRecurrent: false,
    recurrenceType: 'daily',
    recurrenceEndDate: '',
    recurrenceCount: ''
  });

  // Função para carregar dados iniciais - usando useCallback para memoização
  const loadInitialData = useCallback(async () => {
    if (!open) return;
  
    setLoading(true);
    setError(null);
    
    try {
      // Carregar usuários
      const usersResponse = await api.get('/users/list');
      console.log('Resposta da API users:', usersResponse?.data);
      
      let usersData = [];
      if (usersResponse && usersResponse.data) {
        if (Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data;
        } else if (usersResponse.data.users && Array.isArray(usersResponse.data.users)) {
          usersData = usersResponse.data.users;
        }
      }
      setUsers(usersData);
      
      // Carregar categorias
      const categoriesResponse = await api.get('/task/category');
      console.log('Resposta da API categories:', categoriesResponse?.data);
      
      let categoriesData = [];
      if (categoriesResponse && categoriesResponse.data) {
        if (categoriesResponse.data.success && Array.isArray(categoriesResponse.data.data)) {
          categoriesData = categoriesResponse.data.data;
        } else if (Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data;
        }
      }
      setCategories(categoriesData);
      
      // Carregar assuntos
      const subjectsResponse = await api.get('/task/subject');
      console.log('Resposta da API subjects:', subjectsResponse?.data);
      
      let subjectsData = [];
      if (subjectsResponse && subjectsResponse.data) {
        if (subjectsResponse.data.success && Array.isArray(subjectsResponse.data.data)) {
          subjectsData = subjectsResponse.data.data;
        } else if (Array.isArray(subjectsResponse.data)) {
          subjectsData = subjectsResponse.data;
        }
      }
      setSubjects(subjectsData);
      
      // Carregar empresas
      const employersResponse = await api.get('/employers', {
        params: {
            searchParam: '',
            page: 0,
            limit: 999999
        }
      });
      console.log('Resposta da API employers:', employersResponse?.data);
      
      let employersData = [];
      if (employersResponse && employersResponse.data) {
        if (Array.isArray(employersResponse.data)) {
          employersData = employersResponse.data;
        } else if (employersResponse.data.employers && Array.isArray(employersResponse.data.employers)) {
          employersData = employersResponse.data.employers;
        }
      }
      setEmployers(employersData);
      
      console.log('Dados carregados com sucesso:', {
        users: usersData.length,
        categories: categoriesData.length,
        subjects: subjectsData.length,
        employers: employersData.length
      });
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err);
      if (err.response) {
        console.error('Detalhes do erro:', {
          status: err.response.status,
          data: err.response.data
        });
      }
      toast.error(i18n.t("tasks.modal.loadError") || 'Erro ao carregar dados');
      
      // Em caso de erro, inicializar com arrays vazios
      setUsers([]);
      setCategories([]);
      setSubjects([]);
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  }, [open]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (open) {
      loadInitialData().catch(error => {
        console.error('Erro ao carregar dados iniciais:', error);
        toast.error('Falha ao carregar dados necessários para o formulário');
      });
    }
  }, [open, loadInitialData]);

  // Efeito para resetar erros quando o modal é fechado
  useEffect(() => {
    if (!open) {
      setShowErrors(false);
    }
  }, [open]);

  // Efeito para inicializar o formulário com os dados da tarefa ou com valores padrão
  useEffect(() => {
    // Definir valores padrão
    const defaultValues = {
      title: '',
      text: initialText || '',
      dueDate: '',
      categoryId: '',
      assignmentType: 'individual',
      responsibleUserId: isRegularUser && user?.id ? user.id : '',
      groupUsers: [],
      done: false,
      employerId: '',
      subjectId: '',
      requesterName: '',
      requesterEmail: '',
      isPrivate: false,
      // Campos de cobrança
      hasCharge: false,
      chargeValue: '',
      isPaid: false,
      paymentDate: '',
      paymentNotes: '',
      // Campos de recorrência
      isRecurrent: false,
      recurrenceType: 'daily',
      recurrenceEndDate: '',
      recurrenceCount: ''
    };

    // Se temos uma tarefa existente, usar seus valores
    if (task && open) {
      try {
        // Verificar se a tarefa tem usuários de grupo
        const hasTaskUsers = Array.isArray(task.taskUsers) && task.taskUsers.length > 0;
        
        // Determinar se é uma tarefa de grupo ou individual
        const assignmentType = hasTaskUsers && task.taskUsers.length > 1 ? 'group' : 'individual';
        
        // Extrair IDs de usuários do grupo de forma segura
        const groupUsers = hasTaskUsers
          ? task.taskUsers.map(tu => tu && tu.userId ? tu.userId : null).filter(Boolean)
          : [];

        setFormData({
          title: task.title || '',
          text: task.text || '',
          dueDate: task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate.substring(0, 10) : '') : '',
          categoryId: task.taskCategoryId || '',
          assignmentType: assignmentType,
          responsibleUserId: task.responsibleUserId || '',
          groupUsers: groupUsers,
          done: Boolean(task.done),
          inProgress: Boolean(task.inProgress),
          employerId: task.employerId || '',
          subjectId: task.subjectId || '',
          requesterName: task.requesterName || '',
          requesterEmail: task.requesterEmail || '',
          isPrivate: Boolean(task.isPrivate),
          // Campos de cobrança
          hasCharge: Boolean(task.hasCharge),
          chargeValue: task.chargeValue ? task.chargeValue.toString() : '',
          isPaid: Boolean(task.isPaid),
          paymentDate: task.paymentDate ? (typeof task.paymentDate === 'string' ? task.paymentDate.substring(0, 10) : '') : '',
          paymentNotes: task.paymentNotes || '',
          // Campos de recorrência
          isRecurrent: Boolean(task.isRecurrent),
          recurrenceType: task.recurrenceType || 'daily',
          recurrenceEndDate: task.recurrenceEndDate ? (typeof task.recurrenceEndDate === 'string' ? task.recurrenceEndDate.substring(0, 10) : '') : '',
          recurrenceCount: task.recurrenceCount ? task.recurrenceCount.toString() : ''
        });

        // Expandir os acordeões se a tarefa tiver cobrança ou recorrência
        setExpandedCharge(Boolean(task.hasCharge));
        setExpandedRecurrence(Boolean(task.isRecurrent));
      } catch (error) {
        console.error('Erro ao inicializar formulário com dados da tarefa:', error);
        setFormData(defaultValues);
      }
    } else if (open) {
      // Para nova tarefa, usar valores padrão
      setFormData(defaultValues);
    }
  }, [task, open, initialText, isRegularUser, user]);

  // Função para atualizar o estado do formulário
  const handleInputChange = (field) => (event) => {
    if (!event || !event.target) return;
    
    try {
      // Tratamento especial para o campo groupUsers que é um array
      if (field === 'groupUsers') {
        setFormData(prev => ({
          ...prev,
          [field]: event.target.value
        }));
      } else {
        const value = event.target.value;
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } catch (error) {
      console.error(`Erro ao atualizar campo ${field}:`, error);
    }
  };

  // Handler para atualizar o checkbox de privacidade
  const handleCheckboxChange = (field) => (event) => {
    if (!event || !event.target) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  // Handler para atualizar o campo de empresa (Autocomplete)
  const handleEmployerChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      employerId: newValue ? newValue.id : ''
    }));
  };

  // Função para encontrar empresa pelo ID
  const findEmployerById = (employerId) => {
    if (!employerId) return null;
    
    // Garantir que employers seja um array
    if (!Array.isArray(employers) || employers.length === 0) {
      return null;
    }
    
    // Buscar empresa por ID, tratando como string para garantir comparação correta
    const employer = employers.find(e => {
      if (!e || e.id === undefined) return false;
      return String(e.id) === String(employerId);
    });
    
    return employer || null;
  };

  // Função para validar o formulário
  const validateForm = () => {
    setShowErrors(true);

    // Validações obrigatórias
    if (!formData.title?.trim()) {
      toast.error(i18n.t("tasks.notifications.titleRequired") || 'Título é obrigatório');
      return false;
    }
    if (!formData.categoryId) {
      toast.error(i18n.t("tasks.notifications.categoryRequired") || 'Categoria é obrigatória');
      return false;
    }
    
    // Validação com base no tipo de atribuição
    if (formData.assignmentType === 'individual' && !formData.responsibleUserId) {
      toast.error(i18n.t("tasks.notifications.userRequired") || 'Responsável é obrigatório');
      return false;
    }
    
    if (formData.assignmentType === 'group' && 
        (!Array.isArray(formData.groupUsers) || formData.groupUsers.length === 0)) {
      toast.error(i18n.t("tasks.notifications.usersRequired") || 'Selecione pelo menos um usuário para o grupo');
      return false;
    }
    
    // Validações para campos de cobrança
    if (formData.hasCharge && !formData.chargeValue) {
      toast.error(i18n.t("tasks.notifications.chargeValueRequired") || 'Valor da cobrança é obrigatório');
      return false;
    }
    
    // Validações para campos de recorrência
    if (formData.isRecurrent && !formData.recurrenceType) {
      toast.error(i18n.t("tasks.notifications.recurrenceTypeRequired") || 'Tipo de recorrência é obrigatório');
      return false;
    }

    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setSubmitLoading(true);
    let success = false;
    
    try {
      // Preparar os dados para envio
      const data = {
        title: formData.title ? formData.title.trim() : '',
        text: formData.text ? formData.text.trim() : '',
        dueDate: formData.dueDate || null,
        taskCategoryId: formData.categoryId,
        // Para tarefas de grupo, enviamos null como responsibleUserId
        responsibleUserId: formData.assignmentType === 'individual' ? formData.responsibleUserId : null,
        // Enviamos o array de userIds apenas para tarefas de grupo
        userIds: formData.assignmentType === 'group' && Array.isArray(formData.groupUsers) ? formData.groupUsers : [],
        done: Boolean(formData.done),
        inProgress: Boolean(formData.inProgress),
        // Garantir que todos os campos são enviados
        employerId: formData.employerId || null,
        subjectId: formData.subjectId || null,
        requesterName: formData.requesterName ? formData.requesterName.trim() : null,
        requesterEmail: formData.requesterEmail ? formData.requesterEmail.trim() : null,
        isPrivate: Boolean(formData.isPrivate),
        // Campos de cobrança
        hasCharge: Boolean(formData.hasCharge),
        chargeValue: formData.hasCharge && formData.chargeValue ? parseFloat(formData.chargeValue) : null,
        isPaid: Boolean(formData.isPaid),
        paymentDate: formData.isPaid ? (formData.paymentDate || new Date().toISOString().split('T')[0]) : null,
        paymentNotes: formData.paymentNotes ? formData.paymentNotes.trim() : null,
        // Campos de recorrência
        isRecurrent: Boolean(formData.isRecurrent),
        recurrenceType: formData.isRecurrent ? formData.recurrenceType : null,
        recurrenceEndDate: formData.isRecurrent && formData.recurrenceEndDate ? formData.recurrenceEndDate : null,
        recurrenceCount: formData.isRecurrent && formData.recurrenceCount ? parseInt(formData.recurrenceCount) : null,
        // Garantir que companyId seja incluído
        companyId: user.companyId
      };
      
      console.log('Dados da tarefa a enviar:', data);
      
      // Enviar a requisição adequada (PUT para edição, POST para criação)
      if (task && task.id) {
        const response = await api.put(`/task/${task.id}`, data);
        console.log('Resposta da atualização:', response.data);
        toast.success(i18n.t("tasks.notifications.updated") || 'Tarefa atualizada com sucesso');
      } else {
        const response = await api.post('/task', data);
        console.log('Resposta da criação:', response.data);
        toast.success(i18n.t("tasks.notifications.created") || 'Tarefa criada com sucesso');
      }
      
      success = true;
    } catch (err) {
      console.error('Erro ao submeter tarefa:', err);
      
      // Extrair mensagem de erro detalhada
      let errorMessage = i18n.t("tasks.notifications.submitError") || 'Erro ao salvar tarefa';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        console.error('Erro da API:', err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Se houver detalhes adicionais
      if (err.response?.data?.details) {
        console.error('Detalhes do erro:', err.response.data.details);
        errorMessage += `: ${err.response.data.details}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
      
      // Apenas se a operação foi bem sucedida
      if (success) {
        try {
          // Primeiro limpar o formulário
          setFormData({
            title: '',
            text: '',
            dueDate: '',
            categoryId: '',
            assignmentType: 'individual',
            responsibleUserId: '',
            groupUsers: [],
            done: false,
            employerId: '',
            subjectId: '',
            requesterName: '',
            requesterEmail: '',
            isPrivate: false,
            hasCharge: false,
            chargeValue: '',
            isPaid: false,
            paymentDate: '',
            paymentNotes: '',
            isRecurrent: false,
            recurrenceType: 'daily',
            recurrenceEndDate: '',
            recurrenceCount: ''
          });
          setShowErrors(false);
          setExpandedCharge(false);
          setExpandedRecurrence(false);
        } catch (cleanError) {
          console.error('Erro ao limpar formulário:', cleanError);
        }
        
        // Depois fechar o modal e atualizar a lista no componente pai
        if (typeof onClose === 'function') {
          try {
            onClose();
          } catch (closeError) {
            console.error('Erro ao fechar modal:', closeError);
          }
        }
      }
    }
  };

  // Função para fechar o modal e resetar o estado
  const handleClose = () => {
    try {
      // Limpar o estado de forma segura antes de fechar
      setFormData({
        title: '',
        text: '',
        dueDate: '',
        categoryId: '',
        assignmentType: 'individual',
        responsibleUserId: '',
        groupUsers: [],
        done: false,
        employerId: '',
        subjectId: '',
        requesterName: '',
        requesterEmail: '',
        isPrivate: false,
        hasCharge: false,
        chargeValue: '',
        isPaid: false,
        paymentDate: '',
        paymentNotes: '',
        isRecurrent: false,
        recurrenceType: 'daily',
        recurrenceEndDate: '',
        recurrenceCount: ''
      });
      setShowErrors(false);
      setExpandedCharge(false);
      setExpandedRecurrence(false);
    } catch (error) {
      console.error('Erro ao limpar formulário:', error);
    } finally {
      // Garantir que o modal é fechado mesmo em caso de erro
      if (typeof onClose === 'function') {
        try {
          onClose();
        } catch (closeError) {
          console.error('Erro ao fechar modal:', closeError);
        }
      }
    }
  };

  // Evitar renderização se o modal não estiver aberto
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={loading || submitLoading ? undefined : handleClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {task ? i18n.t("tasks.modal.edit") || 'Editar Tarefa' : i18n.t("tasks.modal.add") || 'Adicionar Tarefa'}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading || submitLoading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <StyledContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={i18n.t("tasks.form.title") || 'Título'}
                fullWidth
                value={formData.title || ''}
                onChange={handleInputChange('title')}
                required
                size="small"
                disabled={submitLoading}
                error={showErrors && !formData.title?.trim()}
                helperText={showErrors && !formData.title?.trim() && (i18n.t("tasks.form.titleRequired") || 'Título é obrigatório')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label={i18n.t("tasks.form.description") || 'Descrição'}
                fullWidth
                multiline
                rows={4}
                value={formData.text || ''}
                onChange={handleInputChange('text')}
                size="small"
                disabled={submitLoading}
              />
            </Grid>

            {/* Campos de empresa e assunto */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={Array.isArray(employers) ? employers : []}
                getOptionLabel={(option) => option?.name || ''}
                value={findEmployerById(formData.employerId)}
                onChange={handleEmployerChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={i18n.t("tasks.form.employer") || 'Empresa'}
                    size="small"
                    fullWidth
                    placeholder="Digite para buscar..."
                  />
                )}
                disabled={submitLoading}
                loading={loading}
                loadingText="Carregando..."
                noOptionsText="Nenhuma empresa encontrada"
                clearOnBlur={false}
                clearOnEscape
                blurOnSelect
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>{i18n.t("tasks.form.subject") || 'Assunto'}</InputLabel>
                <Select
                  value={formData.subjectId || ''}
                  onChange={handleInputChange('subjectId')}
                  label={i18n.t("tasks.form.subject") || 'Assunto'}
                  disabled={submitLoading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5,
                      },
                    },
                  }}
                  endAdornment={
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSubjectModal(true);
                      }}
                      sx={{ mr: 2 }}
                      disabled={submitLoading}
                    >
                      <AddIcon />
                    </IconButton>
                  }
                >
                  <MenuItem value="">
                    <em>{i18n.t("tasks.form.selectSubject") || 'Selecione um assunto'}</em>
                  </MenuItem>
                  {Array.isArray(subjects) && subjects.map((subject) => (
                    subject && subject.id ? (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ) : null
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Campos de solicitante */}
            <Grid item xs={12} md={6}>
              <TextField
                label={i18n.t("tasks.form.requesterName") || 'Nome do Solicitante'}
                fullWidth
                value={formData.requesterName || ''}
                onChange={handleInputChange('requesterName')}
                size="small"
                disabled={submitLoading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={i18n.t("tasks.form.requesterEmail") || 'Email do Solicitante'}
                fullWidth
                type="email"
                value={formData.requesterEmail || ''}
                onChange={handleInputChange('requesterEmail')}
                size="small"
                disabled={submitLoading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={i18n.t("tasks.form.dueDate") || 'Data de Vencimento'}
                type="date"
                fullWidth
                value={formData.dueDate || ''}
                onChange={handleInputChange('dueDate')}
                InputLabelProps={{ shrink: true }}
                size="small"
                disabled={submitLoading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                size="small"
                error={showErrors && !formData.categoryId}
              >
                <InputLabel>{i18n.t("tasks.form.category") || 'Categoria'}</InputLabel>
                <Select
                  value={formData.categoryId || ''}
                  onChange={handleInputChange('categoryId')}
                  label={i18n.t("tasks.form.category") || 'Categoria'}
                  disabled={submitLoading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5,
                      },
                    },
                  }}
                  endAdornment={
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCategoryModal(true);
                      }}
                      sx={{ mr: 2 }}
                      disabled={submitLoading}
                    >
                      <AddIcon />
                    </IconButton>
                  }
                >
                  <MenuItem value="">
                    <em>{i18n.t("tasks.form.selectCategory") || 'Selecione uma categoria'}</em>
                  </MenuItem>
                  {Array.isArray(categories) && categories.map((category) => (
                    category && category.id ? (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ) : null
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tipo de atribuição (individual ou grupo) */}
            {!isRegularUser && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{i18n.t("tasks.form.assignmentType") || 'Tipo de Atribuição'}</InputLabel>
                  <Select
                    value={formData.assignmentType || 'individual'}
                    onChange={handleInputChange('assignmentType')}
                    label={i18n.t("tasks.form.assignmentType") || 'Tipo de Atribuição'}
                    disabled={submitLoading}
                    startAdornment={
                      formData.assignmentType === 'group' ? (
                        <GroupIcon color="secondary" sx={{ mr: 1 }} />
                      ) : null
                    }
                  >
                    <MenuItem value="individual">
                      {i18n.t("tasks.form.individual") || 'Individual'}
                    </MenuItem>
                    <MenuItem value="group">
                      {i18n.t("tasks.form.group") || 'Grupo'}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Seleção de responsável ou grupo de usuários */}
            <Grid item xs={12} md={6}>
              {formData.assignmentType === 'individual' ? (
                <FormControl
                  fullWidth
                  size="small"
                  error={showErrors && !formData.responsibleUserId}
                >
                  <InputLabel>{i18n.t("tasks.form.responsible") || 'Responsável'}</InputLabel>
                  <Select
                    value={formData.responsibleUserId || ''}
                    onChange={handleInputChange('responsibleUserId')}
                    label={i18n.t("tasks.form.responsible") || 'Responsável'}
                    disabled={submitLoading || isRegularUser}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 4.5,
                        },
                      },
                    }}
                  >
<MenuItem value="">
                      <em>{i18n.t("tasks.form.selectResponsible") || 'Selecione um responsável'}</em>
                    </MenuItem>
                    {isRegularUser ? (
                      <MenuItem value={user?.id || ''}>
                        {user?.name || 'Usuário atual'}
                      </MenuItem>
                    ) : (
                      Array.isArray(users) && users.map((u) => (
                        u && u.id ? (
                          <MenuItem key={u.id} value={u.id}>
                            {u.name}
                          </MenuItem>
                        ) : null
                      ))
                    )}
                  </Select>
                </FormControl>
              ) : (
                <FormControl 
                  fullWidth 
                  size="small"
                  error={showErrors && (!Array.isArray(formData.groupUsers) || formData.groupUsers.length === 0)}
                >
                  <InputLabel>{i18n.t("tasks.form.groupUsers") || 'Usuários do Grupo'}</InputLabel>
                  <Select
                    multiple
                    value={Array.isArray(formData.groupUsers) ? formData.groupUsers : []}
                    onChange={handleInputChange('groupUsers')}
                    label={i18n.t("tasks.form.groupUsers") || 'Usuários do Grupo'}
                    disabled={submitLoading || isRegularUser}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 4.5,
                        },
                      },
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const foundUser = Array.isArray(users) ? users.find(u => u && u.id === value) : null;
                          return (
                            <Chip
                              key={value}
                              label={foundUser?.name || 'Usuário'}
                              size="small"
                              onDelete={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newSelected = selected.filter(id => id !== value);
                                setFormData(prev => ({
                                  ...prev,
                                  groupUsers: newSelected
                                }));
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {Array.isArray(users) && users.map((u) => (
                      u && u.id ? (
                        <MenuItem key={u.id} value={u.id}>
                          <Checkbox checked={Array.isArray(formData.groupUsers) && formData.groupUsers.includes(u.id)} />
                          {u.name}
                        </MenuItem>
                      ) : null
                    ))}
                  </Select>
                  {showErrors && (!Array.isArray(formData.groupUsers) || formData.groupUsers.length === 0) && (
                    <Typography variant="caption" color="error">
                      {i18n.t("tasks.form.groupUsersRequired") || 'Selecione pelo menos um usuário para o grupo'}
                    </Typography>
                  )}
                </FormControl>
              )}
            </Grid>

            <Grid item xs={12}>
              <Accordion 
                expanded={expandedCharge} 
                onChange={() => setExpandedCharge(!expandedCharge)}
                disabled={submitLoading}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachMoneyIcon color="primary" />
                    <Typography>{i18n.t("tasks.form.chargeInfo") || 'Informações de Cobrança'}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(formData.hasCharge)}
                            onChange={handleCheckboxChange('hasCharge')}
                            disabled={submitLoading}
                          />
                        }
                        label={i18n.t("tasks.form.hasCharge") || 'Esta tarefa possui cobrança'}
                      />
                    </Grid>
                    
                    {formData.hasCharge && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label={i18n.t("tasks.form.chargeValue") || 'Valor'}
                            fullWidth
                            type="number"
                            value={formData.chargeValue || ''}
                            onChange={handleInputChange('chargeValue')}
                            size="small"
                            disabled={submitLoading}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            }}
                            error={showErrors && formData.hasCharge && !formData.chargeValue}
                            helperText={showErrors && formData.hasCharge && !formData.chargeValue && 
                              (i18n.t("tasks.form.chargeValueRequired") || 'Valor da cobrança é obrigatório')}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(formData.isPaid)}
                                onChange={handleCheckboxChange('isPaid')}
                                disabled={submitLoading}
                              />
                            }
                            label={i18n.t("tasks.form.isPaid") || 'Pagamento já realizado'}
                          />
                        </Grid>
                        
                        {formData.isPaid && (
                          <>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label={i18n.t("tasks.form.paymentDate") || 'Data de Pagamento'}
                                type="date"
                                fullWidth
                                value={formData.paymentDate || ''}
                                onChange={handleInputChange('paymentDate')}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                disabled={submitLoading}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <TextField
                                label={i18n.t("tasks.form.paymentNotes") || 'Observações de Pagamento'}
                                fullWidth
                                value={formData.paymentNotes || ''}
                                onChange={handleInputChange('paymentNotes')}
                                size="small"
                                disabled={submitLoading}
                              />
                            </Grid>
                          </>
                        )}
                      </>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion
                expanded={expandedRecurrence}
                onChange={() => setExpandedRecurrence(!expandedRecurrence)}
                disabled={submitLoading}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <RefreshIcon color="primary" />
                    <Typography>{i18n.t("tasks.form.recurrenceTitle") || 'Configuração de Recorrência'}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(formData.isRecurrent)}
                            onChange={handleCheckboxChange('isRecurrent')}
                            disabled={submitLoading}
                          />
                        }
                        label={i18n.t("tasks.form.isRecurrent") || 'Esta tarefa é recorrente'}
                      />
                    </Grid>
                    
                    {formData.isRecurrent && (
                      <>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{i18n.t("tasks.form.recurrenceType") || 'Periodicidade'}</InputLabel>
                            <Select
                              value={formData.recurrenceType || 'daily'}
                              onChange={handleInputChange('recurrenceType')}
                              label={i18n.t("tasks.form.recurrenceType") || 'Periodicidade'}
                              disabled={submitLoading}
                            >
                              <MenuItem value="daily">{i18n.t("tasks.recurrence.daily") || 'Diária'}</MenuItem>
                              <MenuItem value="weekly">{i18n.t("tasks.recurrence.weekly") || 'Semanal'}</MenuItem>
                              <MenuItem value="biweekly">{i18n.t("tasks.recurrence.biweekly") || 'Quinzenal'}</MenuItem>
                              <MenuItem value="monthly">{i18n.t("tasks.recurrence.monthly") || 'Mensal'}</MenuItem>
                              <MenuItem value="quarterly">{i18n.t("tasks.recurrence.quarterly") || 'Trimestral'}</MenuItem>
                              <MenuItem value="semiannual">{i18n.t("tasks.recurrence.semiannual") || 'Semestral'}</MenuItem>
                              <MenuItem value="annual">{i18n.t("tasks.recurrence.annual") || 'Anual'}</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            label={i18n.t("tasks.form.recurrenceEndDate") || 'Data de Término'}
                            type="date"
                            fullWidth
                            value={formData.recurrenceEndDate || ''}
                            onChange={handleInputChange('recurrenceEndDate')}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            disabled={submitLoading}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            label={i18n.t("tasks.form.recurrenceCount") || 'Quantidade de Ocorrências'}
                            fullWidth
                            type="number"
                            value={formData.recurrenceCount || ''}
                            onChange={handleInputChange('recurrenceCount')}
                            size="small"
                            disabled={submitLoading}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            {i18n.t("tasks.form.recurrenceInfo") || 'Você pode definir um término por data ou quantidade de ocorrências. Se ambos forem preenchidos, o que ocorrer primeiro será considerado.'}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(formData.done)}
                      onChange={handleCheckboxChange('done')}
                      disabled={submitLoading}
                    />
                  }
                  label={i18n.t("tasks.form.completed") || 'Concluída'}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(formData.isPrivate)}
                      onChange={handleCheckboxChange('isPrivate')}
                      disabled={submitLoading}
                    />
                  }
                  label={i18n.t("tasks.form.private") || 'Privada'}
                />
                {formData.isPrivate && (
                  <Typography variant="caption" color="text.secondary">
                    {i18n.t("tasks.form.privateInfo") || 'Somente você poderá ver esta tarefa'}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </StyledContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading || submitLoading}
        >
          {i18n.t("tasks.buttons.cancel") || 'Cancelar'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || submitLoading}
          startIcon={submitLoading ? <CircularProgress size={20} /> : null}
        >
          {submitLoading ? (i18n.t("tasks.buttons.saving") || 'Salvando...') : (i18n.t("tasks.buttons.save") || 'Salvar')}
        </Button>
      </DialogActions>

      {openCategoryModal && (
        <TaskCategoryModal
          open={openCategoryModal}
          onClose={() => setOpenCategoryModal(false)}
          onSuccess={() => {
            loadInitialData();
            setOpenCategoryModal(false);
          }}
        />
      )}

      {openSubjectModal && (
        <TaskSubjectModal
          open={openSubjectModal}
          onClose={() => setOpenSubjectModal(false)}
          onSuccess={() => {
            loadInitialData();
            setOpenSubjectModal(false);
          }}
        />
      )}
    </Dialog>
  );
};

export default TaskModal;