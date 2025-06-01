import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import {
    TextField,
    Typography,
    Box,
    Grid,
    Button,
    Chip,
    Alert
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Clear as ClearIcon,
    DeleteSweep as DeleteSweepIcon,
    Add as AddIcon,
    YouTube as YouTubeIcon,
    Help as HelpIcon,
    Cancel as CancelIcon,
    PlayCircleOutline as PlayIcon
} from "@mui/icons-material";

import StandardPageLayout from "../../../components/shared/StandardPageLayout";
import StandardTabContent from "../../../components/shared/StandardTabContent";
import StandardTable from "../../../components/shared/StandardTable";
import StandardEmptyState from "../../../components/shared/StandardEmptyState";
import StandardModal from "../../../components/shared/StandardModal";
import { toast } from "../../../helpers/toast";
import useHelps from "../../../hooks/useHelps";

// Styled Components
const FormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.palette.mode === 'dark' 
        ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
        : '0 2px 8px rgba(0, 0, 0, 0.08)',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        borderRadius: 16
    }
}));

const VideoPreview = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    borderRadius: 8,
    marginTop: theme.spacing(1)
}));

// Schema de validação
const helpValidationSchema = Yup.object().shape({
    title: Yup.string()
        .required('Título é obrigatório')
        .min(3, 'Título deve ter pelo menos 3 caracteres')
        .max(100, 'Título deve ter no máximo 100 caracteres'),
    description: Yup.string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres'),
    video: Yup.string()
        .matches(
            /^[a-zA-Z0-9_-]{11}$/,
            'Código do vídeo deve ter 11 caracteres (ID do YouTube)'
        )
});

// Componente de Formulário
const HelpForm = ({ 
    initialValues, 
    onSubmit, 
    onCancel, 
    loading,
    isEditing 
}) => {
    const getYouTubeUrl = (videoId) => {
        return videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
    };

    return (
        <FormContainer>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpIcon color="primary" />
                {isEditing ? "Editar Ajuda" : "Nova Ajuda"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure vídeos de ajuda e documentação para os usuários
            </Typography>

            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={helpValidationSchema}
                onSubmit={(values, { resetForm }) => {
                    onSubmit(values);
                    if (!isEditing) {
                        resetForm();
                    }
                }}
            >
                {({ values, errors, touched }) => (
                    <Form>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Field
                                    as={TextField}
                                    name="title"
                                    label="Título da Ajuda"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    error={touched.title && !!errors.title}
                                    helperText={touched.title && errors.title}
                                    InputProps={{
                                        startAdornment: <HelpIcon color="action" sx={{ mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Field
                                    as={TextField}
                                    name="video"
                                    label="ID do Vídeo YouTube"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    error={touched.video && !!errors.video}
                                    helperText={touched.video && errors.video || "Ex: dQw4w9WgXcQ (11 caracteres)"}
                                    InputProps={{
                                        startAdornment: <YouTubeIcon color="error" sx={{ mr: 1 }} />
                                    }}
                                />
                                {values.video && !errors.video && (
                                    <VideoPreview>
                                        <PlayIcon color="primary" />
                                        <Typography variant="body2">
                                            <a 
                                                href={getYouTubeUrl(values.video)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                Ver vídeo no YouTube
                                            </a>
                                        </Typography>
                                    </VideoPreview>
                                )}
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Field
                                    as={TextField}
                                    name="description"
                                    label="Descrição"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={3}
                                    error={touched.description && !!errors.description}
                                    helperText={touched.description && errors.description}
                                />
                            </Grid>
                        </Grid>

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
        </FormContainer>
    );
};

HelpForm.propTypes = {
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    isEditing: PropTypes.bool
};

// Componente Principal
function HelpsManager() {
    const { list, save, update, remove, removeAll } = useHelps();

    // Estados
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHelp, setSelectedHelp] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Estados de modais
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);

    // Valores iniciais do formulário
    const initialFormValues = useMemo(() => ({
        title: '',
        description: '',
        video: ''
    }), []);

    const [formValues, setFormValues] = useState(initialFormValues);

    // Carregar dados
    const loadHelps = useCallback(async () => {
        setLoading(true);
        try {
            const helpList = await list();
            console.log('Ajudas carregadas:', helpList); // Debug
            setRecords(Array.isArray(helpList) ? helpList : []);
        } catch (error) {
            console.error('Erro ao carregar ajudas:', error);
            toast.error('Não foi possível carregar a lista de ajudas');
            setRecords([]); // Garantir que sempre seja um array
        } finally {
            setLoading(false);
        }
    }, [list]);

    useEffect(() => {
        loadHelps();
    }, [loadHelps]);

    // Filtrar registros
    const filteredRecords = useMemo(() => {
        if (!searchTerm) return records;
        
        return records.filter(record =>
            record?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record?.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [records, searchTerm]);

    // Handlers
    const handleSearch = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            if (isEditing && selectedHelp) {
                await update({ ...data, id: selectedHelp.id });
                toast.success('Ajuda atualizada com sucesso!');
            } else {
                await save(data);
                toast.success('Ajuda criada com sucesso!');
            }
            
            await loadHelps();
            handleCancel();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar. Verifique se já existe uma ajuda com o mesmo título.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = useCallback((help) => {
        setSelectedHelp(help);
        setFormValues({
            title: help?.title || '',
            description: help?.description || '',
            video: help?.video || ''
        });
        setIsEditing(true);
    }, []);

    const handleDelete = useCallback((help) => {
        setSelectedHelp(help);
        setDeleteModalOpen(true);
    }, []);

    const confirmDelete = async () => {
        if (!selectedHelp?.id) {
            toast.error('Erro: ID da ajuda não encontrado');
            return;
        }

        setLoading(true);
        try {
            await remove(selectedHelp.id);
            await loadHelps();
            toast.success('Ajuda removida com sucesso!');
            handleCancel();
        } catch (error) {
            console.error('Erro ao remover:', error);
            toast.error('Erro ao remover ajuda');
        } finally {
            setLoading(false);
            setDeleteModalOpen(false);
        }
    };

    const handleDeleteAll = useCallback(() => {
        if (records.length === 0) {
            toast.info('Não há ajudas para remover');
            return;
        }
        setDeleteAllModalOpen(true);
    }, [records.length]);

    const confirmDeleteAll = async () => {
        setLoading(true);
        try {
            await removeAll();
            await loadHelps();
            toast.success('Todas as ajudas foram removidas');
            handleCancel();
        } catch (error) {
            console.error('Erro ao remover todas:', error);
            toast.error('Erro ao remover todas as ajudas');
        } finally {
            setLoading(false);
            setDeleteAllModalOpen(false);
        }
    };

    const handleCancel = useCallback(() => {
        setSelectedHelp(null);
        setFormValues(initialFormValues);
        setIsEditing(false);
    }, [initialFormValues]);

    const handleCreateNew = useCallback(() => {
        handleCancel();
    }, [handleCancel]);

    // Preparar estatísticas
    const stats = useMemo(() => [
        {
            label: `${records.length} ajudas cadastradas`,
            icon: <HelpIcon />,
            color: 'primary'
        },
        {
            label: `${records.filter(r => r?.video).length} com vídeo`,
            icon: <YouTubeIcon />,
            color: 'error'
        }
    ], [records]);

    // Preparar ações do header
    const headerActions = useMemo(() => [
        {
            label: 'Nova Ajuda',
            icon: <AddIcon />,
            onClick: handleCreateNew,
            variant: 'contained',
            color: 'primary',
            primary: true
        },
        {
            label: 'Limpar Todas',
            icon: <DeleteSweepIcon />,
            onClick: handleDeleteAll,
            variant: 'outlined',
            color: 'error',
            disabled: records.length === 0,
            tooltip: 'Remove todas as ajudas cadastradas'
        }
    ], [handleCreateNew, handleDeleteAll, records.length]);

    // Preparar colunas da tabela
    const columns = useMemo(() => [
        {
            field: 'title',
            label: 'Título',
            primary: true,
            render: (help) => (
                <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {help?.title || '-'}
                    </Typography>
                    {help?.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {help.description.length > 100 
                                ? `${help.description.substring(0, 100)}...` 
                                : help.description
                            }
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'video',
            label: 'Vídeo',
            align: 'center',
            render: (help) => (
                help?.video ? (
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <YouTubeIcon fontSize="small" color="error" />
                        <Chip 
                            label="Disponível" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                        />
                    </Box>
                ) : (
                    <Chip 
                        label="Sem vídeo" 
                        size="small" 
                        color="default" 
                        variant="outlined"
                    />
                )
            )
        },
        {
            field: 'createdAt',
            label: 'Criado em',
            render: (help) => (
                <Typography variant="body2" color="text.secondary">
                    {help?.createdAt 
                        ? new Date(help.createdAt).toLocaleDateString('pt-BR')
                        : '-'
                    }
                </Typography>
            )
        }
    ], []);

    // Preparar ações da tabela
    const tableActions = useMemo(() => [
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
    ], [handleEdit, handleDelete]);

    return (
        <StandardPageLayout
            title="Gerenciamento de Ajudas"
            subtitle="Configure vídeos tutoriais e documentação para ajudar os usuários"
            actions={headerActions}
            showSearch
            searchValue={searchTerm}
            onSearchChange={handleSearch}
            searchPlaceholder="Buscar ajudas..."
        >
            {/* Formulário */}
            <HelpForm
                initialValues={formValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
                isEditing={isEditing}
            />

            {/* Lista/Tabela */}
            <StandardTabContent
                title="Ajudas Cadastradas"
                description="Lista de todas as ajudas disponíveis no sistema"
                icon={<HelpIcon />}
                stats={stats}
                variant="default"
            >
                {records.length === 0 && !loading ? (
                    <StandardEmptyState
                        type="helps"
                        title="Nenhuma ajuda cadastrada"
                        description="Comece criando sua primeira ajuda para orientar os usuários"
                        primaryAction={{
                            label: 'Criar primeira ajuda',
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
                                title="Nenhuma ajuda encontrada"
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
                    Tem certeza que deseja excluir a ajuda <strong>"{selectedHelp?.title}"</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Esta ação não pode ser desfeita.
                </Typography>
            </StandardModal>

            {/* Modal de Confirmação - Excluir Todas */}
            <StandardModal
                open={deleteAllModalOpen}
                onClose={() => setDeleteAllModalOpen(false)}
                title="Limpar Todas as Ajudas"
                primaryAction={{
                    label: 'Confirmar',
                    onClick: confirmDeleteAll,
                    color: 'error',
                    disabled: loading
                }}
                secondaryAction={{
                    label: 'Cancelar',
                    onClick: () => setDeleteAllModalOpen(false),
                    disabled: loading
                }}
            >
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography fontWeight={600}>
                        Atenção! Esta ação é irreversível.
                    </Typography>
                </Alert>
                <Typography>
                    Tem certeza que deseja remover <strong>todas as {records.length} ajudas</strong> cadastradas?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Todos os vídeos e documentações serão perdidos permanentemente.
                </Typography>
            </StandardModal>
        </StandardPageLayout>
    );
}

export default HelpsManager;