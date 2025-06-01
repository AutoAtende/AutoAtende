import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
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
    Divider,
    Paper
} from "@mui/material";
import { styled } from '@mui/material/styles';
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
    VisibilityOff as VisibilityOffIcon
} from "@mui/icons-material";

import StandardPageLayout from "../../../components/shared/StandardPageLayout";
import StandardTabContent from "../../../components/shared/StandardTabContent";
import StandardTable from "../../../components/shared/StandardTable";
import StandardEmptyState from "../../../components/shared/StandardEmptyState";
import StandardModal from "../../../components/shared/StandardModal";
import { toast } from "../../../helpers/toast";
import usePlans from "../../../hooks/usePlans";
import { i18n } from "../../../translate/i18n";

// Styled Components
const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: theme.palette.mode === 'dark' 
        ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
        : '0 2px 8px rgba(0, 0, 0, 0.08)',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        borderRadius: 16
    }
}));

const FeatureSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.action.hover,
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`
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
        .required('Valor é obrigatório'),
    storageLimit: Yup.number()
        .required('Limite de armazenamento é obrigatório')
        .min(100, 'Mínimo de 100 MB')
        .max(10000, 'Máximo de 10GB'),
    openAIAssistantsContentLimit: Yup.number()
        .required('Limite de conteúdo IA é obrigatório')
        .min(50, 'Mínimo de 50 MB')
        .max(1000, 'Máximo de 1GB')
});

// Componente de Formulário
const PlanForm = ({ 
    initialValues, 
    onSubmit, 
    onCancel, 
    onDelete,
    loading,
    isEditing 
}) => {
    return (
        <StandardTabContent
            title={isEditing ? "Editar Plano" : "Novo Plano"}
            description="Configure os limites e funcionalidades disponíveis no plano"
            icon={<AssignmentIcon />}
            variant="paper"
            actions={
                isEditing && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDelete(initialValues)}
                        disabled={loading}
                        sx={{ 
                            borderRadius: { xs: 3, sm: 2 },
                            minHeight: { xs: 48, sm: 40 }
                        }}
                    >
                        Excluir Plano
                    </Button>
                )
            }
        >
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={planValidationSchema}
                onSubmit={(values, { resetForm }) => {
                    // Ajustar formato do valor
                    const adjustedValues = {
                        ...values,
                        value: values.value.toString().replace(",", ".")
                    };
                    onSubmit(adjustedValues);
                    if (!isEditing) {
                        resetForm();
                    }
                }}
            >
                {({ values, errors, touched, setFieldValue }) => (
                    <Form>
                        {/* Informações Básicas */}
                        <FeatureSection>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusinessIcon color="primary" />
                                Informações Básicas
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Field
                                        as={TextField}
                                        name="name"
                                        label="Nome do Plano"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        error={touched.name && !!errors.name}
                                        helperText={touched.name && errors.name}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Field
                                        as={TextField}
                                        name="value"
                                        label="Valor (R$)"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        error={touched.value && !!errors.value}
                                        helperText={touched.value && errors.value}
                                        InputProps={{
                                            startAdornment: <MoneyIcon color="action" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={values.isVisible}
                                                onChange={(e) => setFieldValue("isVisible", e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Plano Visível"
                                    />
                                </Grid>
                            </Grid>
                        </FeatureSection>

                        {/* Limites de Recursos */}
                        <FeatureSection>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StorageIcon color="primary" />
                                Limites de Recursos
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={2}>
                                    <Field
                                        as={TextField}
                                        name="users"
                                        label="Usuários"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        error={touched.users && !!errors.users}
                                        helperText={touched.users && errors.users}
                                        InputProps={{
                                            startAdornment: <PeopleIcon color="action" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <Field
                                        as={TextField}
                                        name="connections"
                                        label="Conexões"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        error={touched.connections && !!errors.connections}
                                        helperText={touched.connections && errors.connections}
                                        InputProps={{
                                            startAdornment: <RouterIcon color="action" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <Field
                                        as={TextField}
                                        name="queues"
                                        label="Filas"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        error={touched.queues && !!errors.queues}
                                        helperText={touched.queues && errors.queues}
                                        InputProps={{
                                            startAdornment: <QueueIcon color="action" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Field
                                        as={TextField}
                                        name="storageLimit"
                                        label="Armazenamento (MB)"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        error={touched.storageLimit && !!errors.storageLimit}
                                        helperText={touched.storageLimit && errors.storageLimit}
                                        InputProps={{
                                            startAdornment: <StorageIcon color="action" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Field
                                        as={TextField}
                                        name="openAIAssistantsContentLimit"
                                        label="Limite Agentes IA (MB)"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        error={touched.openAIAssistantsContentLimit && !!errors.openAIAssistantsContentLimit}
                                        helperText={touched.openAIAssistantsContentLimit && errors.openAIAssistantsContentLimit}
                                        InputProps={{
                                            startAdornment: <AIIcon color="action" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </FeatureSection>

                        {/* Funcionalidades Principais */}
                        <FeatureSection>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssignmentIcon color="primary" />
                                Funcionalidades Principais
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Campanhas</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useCampaigns"
                                            label="Campanhas"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Agendamentos</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useSchedules"
                                            label="Agendamentos"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Chat Interno</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useInternalChat"
                                            label="Chat Interno"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                        <InputLabel>API Externa</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useExternalApi"
                                            label="API Externa"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Kanban</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useKanban"
                                            label="Kanban"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Email</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useEmail"
                                            label="Email"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Integrações</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useIntegrations"
                                            label="Integrações"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>WhiteLabel</InputLabel>
                                        <Field
                                            as={Select}
                                            name="whiteLabel"
                                            label="WhiteLabel"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FeatureSection>

                        {/* Funcionalidades de IA */}
                        <FeatureSection>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AIIcon color="primary" />
                                Inteligência Artificial
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>OpenAI</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useOpenAi"
                                            label="OpenAI"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Agentes IA</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useOpenAIAssistants"
                                            label="Agentes IA"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Flow Builder</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useFlowBuilder"
                                            label="Flow Builder"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>API Oficial</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useAPIOfficial"
                                            label="API Oficial"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Regras de ChatBot</InputLabel>
                                        <Field
                                            as={Select}
                                            name="useChatBotRules"
                                            label="Regras de ChatBot"
                                        >
                                            <MenuItem value={true}>Habilitado</MenuItem>
                                            <MenuItem value={false}>Desabilitado</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FeatureSection>

                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            mt: 3,
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'flex-end'
                        }}>
                            <Button
                                variant="outlined"
                                onClick={onCancel}
                                startIcon={<ClearIcon />}
                                disabled={loading}
                                sx={{ 
                                    borderRadius: { xs: 3, sm: 2 },
                                    minHeight: { xs: 48, sm: 40 }
                                }}
                            >
                                {isEditing ? 'Cancelar' : 'Limpar'}
                            </Button>
                            
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                disabled={loading}
                                sx={{ 
                                    borderRadius: { xs: 3, sm: 2 },
                                    minHeight: { xs: 48, sm: 40 }
                                }}
                            >
                                {isEditing ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </StandardTabContent>
    );
};

PlanForm.propTypes = {
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    loading: PropTypes.bool,
    isEditing: PropTypes.bool
};

// Componente Principal
export default function PlansManager() {
    const { list, save, update, remove } = usePlans();

    // Estados
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Estados de modais
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
        isVisible: false,
        whiteLabel: true,
        useOpenAIAssistants: true,
        useFlowBuilder: true,
        useAPIOfficial: true,
        useChatBotRules: true,
        storageLimit: 500,
        openAIAssistantsContentLimit: 100,
    };

    const [formValues, setFormValues] = useState(initialFormValues);

    // Carregar dados
    const loadPlans = useCallback(async () => {
        setLoading(true);
        try {
            const planList = await list();
            setRecords(planList || []);
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            toast.error('Não foi possível carregar a lista de planos');
        } finally {
            setLoading(false);
        }
    }, [list]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    // Filtrar registros
    const filteredRecords = useMemo(() => {
        if (!searchTerm) return records;
        
        return records.filter(record =>
            record.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [records, searchTerm]);

    // Handlers
    const handleSearch = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            if (isEditing && selectedPlan) {
                await update({ ...data, id: selectedPlan.id });
                toast.success('Plano atualizado com sucesso!');
            } else {
                await save(data);
                toast.success('Plano criado com sucesso!');
            }
            
            await loadPlans();
            handleCancel();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Não foi possível realizar a operação. Verifique se já existe um plano com o mesmo nome ou se os campos foram preenchidos corretamente');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = useCallback((plan) => {
        setSelectedPlan(plan);
        setFormValues({
            id: plan.id,
            name: plan.name || '',
            users: plan.users || 1,
            connections: plan.connections || 1,
            queues: plan.queues || 1,
            value: plan.value?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || '0,00',
            useCampaigns: plan.useCampaigns !== false,
            useSchedules: plan.useSchedules !== false,
            useInternalChat: plan.useInternalChat !== false,
            useExternalApi: plan.useExternalApi !== false,
            useKanban: plan.useKanban !== false,
            useOpenAi: plan.useOpenAi !== false,
            useIntegrations: plan.useIntegrations !== false,
            useEmail: plan.useEmail !== false,
            isVisible: plan.isVisible === true,
            whiteLabel: plan.whiteLabel !== false,
            useOpenAIAssistants: plan.useOpenAIAssistants !== false,
            useFlowBuilder: plan.useFlowBuilder !== false,
            useAPIOfficial: plan.useAPIOfficial !== false,
            useChatBotRules: plan.useChatBotRules !== false,
            storageLimit: plan.storageLimit || 500,
            openAIAssistantsContentLimit: plan.openAIAssistantsContentLimit || 100,
        });
        setIsEditing(true);
    }, []);

    const handleDelete = useCallback((plan) => {
        setSelectedPlan(plan);
        setDeleteModalOpen(true);
    }, []);

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await remove(selectedPlan.id);
            await loadPlans();
            toast.success('Plano removido com sucesso!');
            handleCancel();
        } catch (error) {
            console.error('Erro ao remover:', error);
            toast.error('Não foi possível remover o plano');
        } finally {
            setLoading(false);
            setDeleteModalOpen(false);
        }
    };

    const handleCancel = useCallback(() => {
        setSelectedPlan(null);
        setFormValues(initialFormValues);
        setIsEditing(false);
    }, [initialFormValues]);

    const handleCreateNew = useCallback(() => {
        handleCancel();
    }, [handleCancel]);

    // Preparar estatísticas
    const stats = useMemo(() => [
        {
            label: `${records.length} planos cadastrados`,
            icon: <AssignmentIcon />,
            color: 'primary'
        },
        {
            label: `${records.filter(r => r.isVisible).length} visíveis`,
            icon: <VisibilityIcon />,
            color: 'success'
        },
        {
            label: `${records.filter(r => !r.isVisible).length} ocultos`,
            icon: <VisibilityOffIcon />,
            color: 'warning'
        }
    ], [records]);

    // Preparar ações do header
    const headerActions = [
        {
            label: 'Novo Plano',
            icon: <AddIcon />,
            onClick: handleCreateNew,
            variant: 'contained',
            color: 'primary',
            primary: true
        }
    ];

    // Função auxiliar para renderizar status
    const renderStatus = (value) => value ? 'Sim' : 'Não';

    // Preparar colunas da tabela
    const columns = [
        {
            field: 'name',
            label: 'Plano',
            primary: true,
            render: (plan) => (
                <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {plan.name || '-'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
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
                    </Box>
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
                        R$ {plan.value ? plan.value.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '0,00'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'limits',
            label: 'Limites',
            render: (plan) => (
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                        <PeopleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        {plan.users || 0} usuários
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        <RouterIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        {plan.connections || 0} conexões
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        <QueueIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        {plan.queues || 0} filas
                    </Typography>
                </Box>
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
                const enabledFeatures = [];
                if (plan.useCampaigns) enabledFeatures.push('Campanhas');
                if (plan.useOpenAi) enabledFeatures.push('OpenAI');
                if (plan.useKanban) enabledFeatures.push('Kanban');
                if (plan.useSchedules) enabledFeatures.push('Agendamentos');
                
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
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            {enabledFeatures.slice(0, 3).map((feature, index) => (
                                <Chip 
                                    key={index}
                                    label={feature} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                />
                            ))}
                            {enabledFeatures.length > 3 && (
                                <Chip 
                                    label={`+${enabledFeatures.length - 3}`} 
                                    size="small" 
                                    color="primary"
                                    sx={{ fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    </Box>
                );
            }
        }
    ];

    // Preparar ações da tabela
    const tableActions = [
        {
            label: 'Editar',
            icon: <EditIcon />,
            onClick: handleEdit,
            color: 'primary'
        },
        {
            label: 'Excluir',
            icon: <DeleteIcon />,
            onClick: handleDelete,
            color: 'error',
            divider: true
        }
    ];

    return (
        <StandardPageLayout
            title="Gerenciamento de Planos"
            subtitle="Configure os planos de assinatura e funcionalidades disponíveis"
            actions={headerActions}
            showSearch
            searchValue={searchTerm}
            onSearchChange={handleSearch}
            searchPlaceholder="Buscar planos..."
        >
            {/* Formulário */}
            <PlanForm
                initialValues={formValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onDelete={handleDelete}
                loading={loading}
                isEditing={isEditing}
            />

            {/* Lista/Tabela */}
            <StandardTabContent
                title="Planos Cadastrados"
                description="Lista de todos os planos de assinatura disponíveis"
                icon={<AssignmentIcon />}
                stats={stats}
                variant="default"
            >
                {records.length === 0 && !loading ? (
                    <StandardEmptyState
                        type="plans"
                        title="Nenhum plano cadastrado"
                        description="Comece criando seu primeiro plano de assinatura"
                        primaryAction={{
                            label: 'Criar primeiro plano',
                            icon: <AddIcon />,
                            onClick: handleCreateNew
                        }}
                    />
                ) : (
                    <StandardTable
                        columns={columns}
                        data={filteredRecords}
                        actions={tableActions}
                        loading={loading}
                        emptyState={
                            <StandardEmptyState
                                type="search"
                                title="Nenhum plano encontrado"
                                description="Tente ajustar os termos de busca"
                            />
                        }
                        showEmptyState={filteredRecords.length === 0 && searchTerm}
                    />
                )}
            </StandardTabContent>

            {/* Modal de Confirmação - Excluir */}
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
                    onClick: () => setDeleteModalOpen(false),
                    disabled: loading
                }}
            >
                <Typography>
                    Tem certeza que deseja excluir o plano <strong>"{selectedPlan?.name}"</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Esta ação não pode ser desfeita e pode afetar empresas que utilizam este plano.
                </Typography>
            </StandardModal>
        </StandardPageLayout>
    );
}