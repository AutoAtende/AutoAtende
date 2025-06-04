import React, { useState, useEffect, useCallback, useMemo } from "react";
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

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardDataTable from "../../components/shared/StandardDataTable";
import StandardEmptyState from "../../components/shared/StandardEmptyState";
import StandardModal from "../../components/shared/StandardModal";
import StandardTabContent from "../../components/shared/StandardTabContent";
import { toast } from "../../helpers/toast";
import usePlans from "../../hooks/usePlans";
import useAuth from "../../hooks/useAuth";
import { i18n } from "../../translate/i18n";

// Styled Components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}));

const FeatureSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.hover,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`
}));

const PlanCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-4px)'
  }
}));

// Schema de validação
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

// Componente Principal
const PlansManagementPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { list, save, update, remove } = usePlans();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Verificar se é super admin
  useEffect(() => {
    if (!user?.super) {
      toast.error("Acesso restrito a super administradores");
      // Redirecionar se necessário
    }
  }, [user]);

  // Carregar planos
  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const planList = await list();
      setPlans(Array.isArray(planList) ? planList : []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
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

  // Handlers
  const handleOpenModal = useCallback((plan = null) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormValues({
        ...plan,
        value: plan.value?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || '0,00'
      });
      setIsEditing(true);
    } else {
      setSelectedPlan(null);
      setFormValues(initialFormValues);
      setIsEditing(false);
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedPlan(null);
    setFormValues(initialFormValues);
    setIsEditing(false);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
      // Converter valor para formato aceito pelo backend
      const formattedValues = {
        ...values,
        value: values.value.toString().replace(",", ".")
      };

      if (isEditing && selectedPlan) {
        await update({ ...formattedValues, id: selectedPlan.id });
        toast.success('Plano atualizado com sucesso!');
      } else {
        await save(formattedValues);
        toast.success('Plano criado com sucesso!');
      }
      
      await loadPlans();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
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

  // Renderizar formulário no modal
  const renderPlanForm = () => (
    <Formik
      initialValues={formValues}
      validationSchema={planValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, isSubmitting, setFieldValue }) => (
        <Form>
          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                name="name"
                label="Nome do Plano"
                fullWidth
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                name="value"
                label="Valor (R$)"
                fullWidth
                error={touched.value && !!errors.value}
                helperText={touched.value && errors.value}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  )
                }}
              />
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
              <Field
                as={TextField}
                name="users"
                label="Usuários"
                type="number"
                fullWidth
                error={touched.users && !!errors.users}
                helperText={touched.users && errors.users}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Field
                as={TextField}
                name="connections"
                label="Conexões"
                type="number"
                fullWidth
                error={touched.connections && !!errors.connections}
                helperText={touched.connections && errors.connections}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RouterIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Field
                as={TextField}
                name="queues"
                label="Filas"
                type="number"
                fullWidth
                error={touched.queues && !!errors.queues}
                helperText={touched.queues && errors.queues}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QueueIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Field
                as={TextField}
                name="storageLimit"
                label="Armazenamento (MB)"
                type="number"
                fullWidth
                error={touched.storageLimit && !!errors.storageLimit}
                helperText={touched.storageLimit && errors.storageLimit}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorageIcon />
                    </InputAdornment>
                  )
                }}
              />
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
              <Field
                as={TextField}
                name="openAIAssistantsContentLimit"
                label="Limite de Conteúdo IA (MB)"
                type="number"
                fullWidth
                error={touched.openAIAssistantsContentLimit && !!errors.openAIAssistantsContentLimit}
                helperText={touched.openAIAssistantsContentLimit && errors.openAIAssistantsContentLimit}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AIIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  if (!user?.super) {
    return (
      <MainContainer>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Alert severity="error">
            Acesso restrito a super administradores
          </Alert>
        </Box>
      </MainContainer>
    );
  }

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
      <StandardTabContent
        variant="default"
      >
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

      {/* Modal de Criação/Edição */}
      <StandardModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Editar Plano" : "Novo Plano"}
        subtitle={isEditing ? "Atualize as informações do plano" : "Configure um novo plano de assinatura"}
        maxWidth="md"
        primaryAction={{
          label: isEditing ? 'Atualizar' : 'Criar',
          onClick: () => document.getElementById('plan-form-submit').click(),
          disabled: loading
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleCloseModal
        }}
      >
        {renderPlanForm()}
        <button
          id="plan-form-submit"
          type="submit"
          form="plan-form"
          style={{ display: 'none' }}
        />
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
          disabled: loading
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