import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PropTypes from 'prop-types';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Alert,
  Paper,
  CircularProgress,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  IconButton
} from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Router as RouterIcon,
  Queue as QueueIcon,
  Storage as StorageIcon,
  SmartToy as AIIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ContentCopy as CopyIcon
} from "@mui/icons-material";

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardDataTable from "../../components/shared/StandardDataTable";
import StandardEmptyState from "../../components/shared/StandardEmptyState";
import StandardModal from "../../components/shared/StandardModal";
import StandardTabContent from "../../components/shared/StandardTabContent";
import { toast } from "../../helpers/toast";
import usePlans from "../../hooks/usePlans";
import useAuth from "../../hooks/useAuth";

// Styled Components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
}));

// Schema de validação CORRIGIDO
const planValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  users: Yup.number()
    .required('Número de usuários é obrigatório')
    .min(1, 'Deve permitir pelo menos 1 usuário')
    .max(999, 'Máximo de 999 usuários'),
  connections: Yup.number()
    .required('Número de conexões é obrigatório')
    .min(1, 'Deve permitir pelo menos 1 conexão')
    .max(999, 'Máximo de 999 conexões'),
  queues: Yup.number()
    .required('Número de filas é obrigatório')
    .min(1, 'Deve permitir pelo menos 1 fila')
    .max(999, 'Máximo de 999 filas'),
  value: Yup.string()
    .required('Valor é obrigatório')
    .matches(/^\d+([.,]\d{1,2})?$/, 'Formato inválido. Use: 99,99 ou 99.99'),
  storageLimit: Yup.number()
    .required('Limite de armazenamento é obrigatório')
    .min(100, 'Mínimo de 100 MB')
    .max(10000, 'Máximo de 10 GB'),
  openAIAssistantsContentLimit: Yup.number()
    .required('Limite de conteúdo IA é obrigatório')
    .min(50, 'Mínimo de 50 MB')
    .max(1000, 'Máximo de 1 GB')
});

// Valores iniciais do formulário
const initialFormValues = {
  name: '',
  users: 1,
  connections: 1,
  queues: 1,
  value: '0,00',
  useCampaigns: true,
  useSchedules: true,
  useInternalChat: true,
  useExternalApi: true,
  useKanban: true,
  useOpenAi: true,
  useIntegrations: true,
  useEmail: true,
  isVisible: true,
  whiteLabel: true,
  useOpenAIAssistants: true,
  useFlowBuilder: true,
  useAPIOfficial: true,
  useChatBotRules: true,
  storageLimit: 500,
  openAIAssistantsContentLimit: 100,
};

// Componente Principal CORRIGIDO
const PlansManagementPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { list, save, update, remove } = usePlans();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Ref para o Formik
  const formikRef = useRef();

  // Estados
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0); // Para forçar reset do formulário

  console.log("🔄 PlansManagementPage - Renderizando");

  // Carregar planos
  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      console.log("📋 Carregando planos...");
      const planList = await list();
      setPlans(Array.isArray(planList) ? planList : []);
      console.log("✅ Planos carregados:", planList);
    } catch (error) {
      console.error('❌ Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Filtrar planos
  const filteredPlans = useMemo(() => {
    if (!searchTerm) return plans;
    
    return plans.filter(plan =>
      plan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plans, searchTerm]);

  // CORRIGIDO: Preparar valores iniciais do formulário
  const getInitialValues = useCallback((plan) => {
    if (plan) {
      return {
        ...plan,
        value: plan.value?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || '0,00'
      };
    }
    return initialFormValues;
  }, []);

  // CORRIGIDO: Handlers do modal
  const handleOpenModal = useCallback((plan = null) => {
    console.log("🔧 Abrindo modal:", plan ? "edição" : "criação");
    
    setSelectedPlan(plan);
    setIsEditing(!!plan);
    setModalKey(prev => prev + 1); // Força reset do Formik
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    console.log("❌ Fechando modal");
    
    setModalOpen(false);
    setSelectedPlan(null);
    setIsEditing(false);
    
    // Reset após animação de fechamento
    setTimeout(() => {
      setModalKey(prev => prev + 1);
    }, 300);
  }, []);

  // CORRIGIDO: Handler de submit
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log("💾 Submetendo formulário:", values);
      setLoading(true);
      
      // Converter valor para formato aceito pelo backend
      const formattedValues = {
        ...values,
        value: values.value.toString().replace(",", ".")
      };

      if (isEditing && selectedPlan) {
        console.log("✏️ Atualizando plano:", selectedPlan.id);
        await update({ ...formattedValues, id: selectedPlan.id });
        toast.success('Plano atualizado com sucesso!');
      } else {
        console.log("➕ Criando novo plano");
        await save(formattedValues);
        toast.success('Plano criado com sucesso!');
      }
      
      await loadPlans();
      resetForm();
      handleCloseModal();
      
      console.log("✅ Operação concluída com sucesso");
    } catch (error) {
      console.error('❌ Erro ao salvar plano:', error);
      const errorMsg = error?.response?.data?.error || 'Erro ao salvar plano';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback((plan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!selectedPlan?.id) return;
    
    setLoading(true);
    try {
      await remove(selectedPlan.id);
      await loadPlans();
      toast.success('Plano removido com sucesso!');
      setDeleteModalOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao remover plano:', error);
      toast.error('Erro ao remover plano');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPlan = useCallback((plan) => {
    const newPlan = {
      ...plan,
      name: `${plan.name} (Cópia)`,
      id: undefined
    };
    handleOpenModal(newPlan);
  }, [handleOpenModal]);

  // CORRIGIDO: Handler para submit via botão externo
  const handleExternalSubmit = useCallback(() => {
    console.log("🚀 Submit externo acionado");
    if (formikRef.current) {
      console.log("📝 Executando handleSubmit do Formik");
      formikRef.current.handleSubmit();
    } else {
      console.warn("⚠️ Ref do Formik não encontrada");
    }
  }, []);

  // Preparar colunas da tabela
  const columns = [
    {
      field: 'name',
      label: 'Plano',
      primary: true,
      render: (plan) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {plan.name}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            <Chip 
              label={plan.isVisible ? 'Visível' : 'Oculto'} 
              size="small" 
              color={plan.isVisible ? 'success' : 'default'}
              variant="outlined"
            />
            {plan.whiteLabel && (
              <Chip 
                label="WhiteLabel" 
                size="small" 
                color="secondary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )
    },
    {
      field: 'value',
      label: 'Valor',
      align: 'center',
      render: (plan) => (
        <Box display="flex" alignItems="center" justifyContent="center">
          <MoneyIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" fontWeight={600}>
            R$ {plan.value?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || '0,00'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'limits',
      label: 'Limites',
      render: (plan) => (
        <Stack spacing={0.5}>
          <Box display="flex" alignItems="center">
            <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{plan.users || 0} usuários</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <RouterIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{plan.connections || 0} conexões</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <QueueIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{plan.queues || 0} filas</Typography>
          </Box>
        </Stack>
      )
    },
    {
      field: 'storage',
      label: 'Armazenamento',
      align: 'center',
      render: (plan) => (
        <Box>
          <Typography variant="body2">
            {plan.storageLimit || 0} MB
          </Typography>
          <Typography variant="caption" color="text.secondary">
            IA: {plan.openAIAssistantsContentLimit || 0} MB
          </Typography>
        </Box>
      )
    },
    {
      field: 'features',
      label: 'Funcionalidades',
      render: (plan) => {
        const features = [];
        if (plan.useCampaigns) features.push('Campanhas');
        if (plan.useOpenAi) features.push('OpenAI');
        if (plan.useKanban) features.push('Kanban');
        if (plan.useSchedules) features.push('Agendamentos');
        
        const totalFeatures = [
          plan.useCampaigns, plan.useSchedules, plan.useInternalChat,
          plan.useExternalApi, plan.useKanban, plan.useOpenAi,
          plan.useIntegrations, plan.useEmail, plan.useOpenAIAssistants,
          plan.useFlowBuilder, plan.useAPIOfficial, plan.useChatBotRules
        ].filter(Boolean).length;
        
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {totalFeatures}/12 ativas
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
              {features.slice(0, 3).map((feature, index) => (
                <Chip 
                  key={index}
                  label={feature} 
                  size="small" 
                  variant="outlined"
                />
              ))}
              {features.length > 3 && (
                <Chip 
                  label={`+${features.length - 3}`} 
                  size="small" 
                  color="primary"
                />
              )}
            </Stack>
          </Box>
        );
      }
    }
  ];

  // Ações da tabela
  const tableActions = [
    {
      label: 'Editar',
      icon: <EditIcon />,
      onClick: handleOpenModal,
      color: 'primary'
    },
    {
      label: 'Copiar',
      icon: <CopyIcon />,
      onClick: handleCopyPlan,
      color: 'default'
    },
    {
      label: 'Excluir',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error',
      divider: true
    }
  ];

  // Estatísticas
  const stats = [
    {
      label: `${plans.length} planos cadastrados`,
      icon: <AssignmentIcon />,
      color: 'primary'
    },
    {
      label: `${plans.filter(p => p.isVisible).length} visíveis`,
      icon: <VisibilityIcon />,
      color: 'success'
    },
    {
      label: `${plans.filter(p => !p.isVisible).length} ocultos`,
      icon: <VisibilityOffIcon />,
      color: 'warning'
    }
  ];

  // CORRIGIDO: Renderizar formulário com conexão correta ao botão externo
  const renderPlanForm = () => {
    const initialValues = getInitialValues(selectedPlan);
    
    console.log("📝 Renderizando formulário com valores:", initialValues);
    
    return (
      <Formik
        key={modalKey} // Força reset quando mudado
        innerRef={formikRef} // REF IMPORTANTE para acesso externo
        initialValues={initialValues}
        validationSchema={planValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validateOnMount={true} // IMPORTANTE: valida no mount
      >
        {({ values, errors, touched, isSubmitting, setFieldValue, isValid, dirty }) => {
          console.log("🔍 Estado do Formik:", { isValid, dirty, isSubmitting, errors });
          
          return (
            <Form>
              <Grid container spacing={3}>
                {/* Informações Básicas */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Informações Básicas
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="name">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Nome do Plano"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="value">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Valor (R$)"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.isVisible}
                        onChange={(e) => setFieldValue("isVisible", e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Plano Visível para Clientes"
                  />
                </Grid>

                {/* Limites */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Limites de Recursos
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="users">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Usuários"
                        type="number"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PeopleIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="connections">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Conexões"
                        type="number"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <RouterIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="queues">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Filas"
                        type="number"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <QueueIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Field name="storageLimit">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Armazenamento (MB)"
                        type="number"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <StorageIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Funcionalidades */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Funcionalidades
                  </Typography>
                </Grid>
                
                {[
                  { key: 'useCampaigns', label: 'Campanhas' },
                  { key: 'useSchedules', label: 'Agendamentos' },
                  { key: 'useInternalChat', label: 'Chat Interno' },
                  { key: 'useExternalApi', label: 'API Externa' },
                  { key: 'useKanban', label: 'Kanban' },
                  { key: 'useEmail', label: 'Email' },
                  { key: 'useIntegrations', label: 'Integrações' },
                  { key: 'whiteLabel', label: 'WhiteLabel' },
                  { key: 'useOpenAi', label: 'OpenAI' },
                  { key: 'useOpenAIAssistants', label: 'Agentes IA' },
                  { key: 'useFlowBuilder', label: 'Flow Builder' },
                  { key: 'useAPIOfficial', label: 'API Oficial' },
                  { key: 'useChatBotRules', label: 'Regras de ChatBot' }
                ].map((feature) => (
                  <Grid item xs={12} sm={6} md={4} key={feature.key}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values[feature.key]}
                          onChange={(e) => setFieldValue(feature.key, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={feature.label}
                    />
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Field name="openAIAssistantsContentLimit">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        label="Limite de Conteúdo IA (MB)"
                        type="number"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AIIcon />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    );
  };

  console.log("🎨 Renderizando PlansManagementPage");

  return (
    <StandardPageLayout
      title="Gerenciamento de Planos"
      subtitle="Configure os planos de assinatura e funcionalidades disponíveis"
      actions={[
        {
          label: 'Novo Plano',
          icon: <AddIcon />,
          onClick: () => handleOpenModal(),
          variant: 'contained',
          color: 'primary',
          primary: true
        }
      ]}
      showSearch
      searchValue={searchTerm}
      onSearchChange={(e) => setSearchTerm(e.target.value)}
      searchPlaceholder="Buscar planos..."
    >
      <StandardTabContent variant="default">
        {loading && plans.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : plans.length === 0 ? (
          <StandardEmptyState
            type="default"
            title="Nenhum plano cadastrado"
            description="Comece criando seu primeiro plano de assinatura"
            primaryAction={{
              label: 'Criar Primeiro Plano',
              icon: <AddIcon />,
              onClick: () => handleOpenModal()
            }}
          />
        ) : (
          <StandardDataTable
            columns={columns}
            data={filteredPlans}
            actions={tableActions}
            loading={loading}
            emptyState={
              <StandardEmptyState
                type="search"
                title="Nenhum plano encontrado"
                description="Tente ajustar os termos de busca"
              />
            }
            stickyHeader={false}
          />
        )}
      </StandardTabContent>

      {/* CORRIGIDO: Modal de Criação/Edição */}
      <StandardModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Editar Plano" : "Novo Plano"}
        subtitle={isEditing ? "Atualize as informações do plano" : "Configure um novo plano de assinatura"}
        maxWidth="md"
        primaryAction={{
          label: isEditing ? 'Atualizar' : 'Criar',
          onClick: handleExternalSubmit, // CORRIGIDO: conectado ao Formik
          disabled: loading,
          icon: loading ? <CircularProgress size={20} /> : <SaveIcon />
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleCloseModal
        }}
      >
        {renderPlanForm()}
      </StandardModal>

      {/* Modal de Confirmação de Exclusão */}
      <StandardModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        primaryAction={{
          label: 'Excluir',
          onClick: confirmDelete,
          color: 'error',
          disabled: loading,
          icon: loading ? <CircularProgress size={20} /> : <DeleteIcon />
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setDeleteModalOpen(false)
        }}
      >
        <Typography>
          Tem certeza que deseja excluir o plano <strong>"{selectedPlan?.name}"</strong>?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Esta ação não pode ser desfeita e pode afetar empresas que utilizam este plano.
        </Alert>
      </StandardModal>
    </StandardPageLayout>
  );
};

export default PlansManagementPage;