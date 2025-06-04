import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import {
  TextField,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  useMediaQuery,
  Link
} from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
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
  PlayCircleOutline as PlayIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import StandardTable from "../../components/shared/StandardTable";
import StandardEmptyState from "../../components/shared/StandardEmptyState";
import StandardModal from "../../components/shared/StandardModal";
import { toast } from "../../helpers/toast";
import useHelps from "../../hooks/useHelps";
import useAuth from "../../hooks/useAuth";
import { i18n } from "../../translate/i18n";

// Styled Components
const FormContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
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

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  textDecoration: 'none',
  color: theme.palette.primary.main,
  '&:hover': {
    textDecoration: 'underline'
  }
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

// Valores iniciais
const initialFormValues = {
  title: '',
  description: '',
  video: ''
};

// Componente Principal
const HelpsManagementPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { list, save, update, remove, removeAll, refreshCache } = useHelps();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados
  const [loading, setLoading] = useState(false);
  const [helps, setHelps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Estados de modais
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);

  // Verificar se é super admin - apenas uma vez
  useEffect(() => {
    if (user && user.super === false) {
      toast.error("Acesso restrito a super administradores");
    }
  }, [user?.super]);

  // Carregar ajudas - com controle de carregamento inicial
  const loadHelps = useCallback(async () => {
    if (loading) return; // Evita múltiplas chamadas simultâneas
    
    setLoading(true);
    try {
      console.log('[HelpsManagementPage] Iniciando carregamento de helps');
      const helpList = await list();
      console.log('[HelpsManagementPage] Helps carregadas:', helpList);
      
      const safeHelpList = Array.isArray(helpList) ? helpList : [];
      setHelps(safeHelpList);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Erro ao carregar ajudas:', error);
      toast.error('Erro ao carregar lista de ajudas');
      setHelps([]);
      setInitialLoadComplete(true);
    } finally {
      setLoading(false);
    }
  }, [list]); // Dependência fixa

  // Carregar uma única vez na inicialização
  useEffect(() => {
    if (!initialLoadComplete && user?.super) {
      loadHelps();
    }
  }, [loadHelps, initialLoadComplete, user?.super]);

  // Filtrar ajudas - otimizado
  const filteredHelps = useMemo(() => {
    if (!Array.isArray(helps) || helps.length === 0) return [];
    
    if (!searchTerm.trim()) return helps;
    
    const term = searchTerm.toLowerCase().trim();
    return helps.filter(help => {
      if (!help) return false;
      
      const title = help.title?.toLowerCase() || '';
      const description = help.description?.toLowerCase() || '';
      
      return title.includes(term) || description.includes(term);
    });
  }, [helps, searchTerm]);

  // Função para obter URL do YouTube
  const getYouTubeUrl = useCallback((videoId) => {
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
  }, []);

  // Handlers
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      const submitData = {
        title: values.title?.trim() || '',
        description: values.description?.trim() || '',
        video: values.video?.trim() || ''
      };
      
      if (isEditing && selectedHelp?.id) {
        await update({ ...submitData, id: selectedHelp.id });
        toast.success('Ajuda atualizada com sucesso!');
      } else {
        await save(submitData);
        toast.success('Ajuda criada com sucesso!');
      }
      
      // Recarregar dados
      await loadHelps();
      
      if (!isEditing) {
        resetForm();
      } else {
        handleCancel();
      }
    } catch (error) {
      console.error('Erro ao salvar ajuda:', error);
      const errorMsg = error?.response?.data?.error || 'Erro ao salvar ajuda';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleEdit = useCallback((help) => {
    if (!help) return;
    
    setSelectedHelp(help);
    setFormValues({
      title: help.title || '',
      description: help.description || '',
      video: help.video || ''
    });
    setIsEditing(true);
  }, []);

  const handleDelete = useCallback((help) => {
    if (!help?.id) return;
    
    setSelectedHelp(help);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!selectedHelp?.id || loading) return;
    
    setLoading(true);
    try {
      await remove(selectedHelp.id);
      await loadHelps();
      toast.success('Ajuda removida com sucesso!');
      setDeleteModalOpen(false);
      setSelectedHelp(null);
    } catch (error) {
      console.error('Erro ao remover ajuda:', error);
      toast.error('Erro ao remover ajuda');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = useCallback(() => {
    if (!Array.isArray(helps) || helps.length === 0) {
      toast.info('Não há ajudas para remover');
      return;
    }
    setDeleteAllModalOpen(true);
  }, [helps]);

  const confirmDeleteAll = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await removeAll();
      await loadHelps();
      toast.success('Todas as ajudas foram removidas');
      setDeleteAllModalOpen(false);
    } catch (error) {
      console.error('Erro ao remover todas as ajudas:', error);
      toast.error('Erro ao remover todas as ajudas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    setSelectedHelp(null);
    setFormValues(initialFormValues);
    setIsEditing(false);
  }, []);

  const handleRefreshCache = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await refreshCache();
      await loadHelps();
      toast.success('Cache atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cache:', error);
      toast.error('Erro ao atualizar cache');
    } finally {
      setLoading(false);
    }
  }, [refreshCache, loadHelps, loading]);

  // Preparar estatísticas - seguro
  const stats = useMemo(() => {
    const helpsCount = Array.isArray(helps) ? helps.length : 0;
    const videosCount = Array.isArray(helps) 
      ? helps.filter(h => h?.video?.trim()).length 
      : 0;
    
    return [
      {
        label: `${helpsCount} ajudas cadastradas`,
        icon: <HelpIcon />,
        color: 'primary'
      },
      {
        label: `${videosCount} com vídeo`,
        icon: <YouTubeIcon />,
        color: 'error'
      }
    ];
  }, [helps]);

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
        help?.video?.trim() ? (
          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
            <YouTubeIcon fontSize="small" color="error" />
            <StyledLink 
              href={getYouTubeUrl(help.video)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Ver vídeo
              <OpenInNewIcon fontSize="small" />
            </StyledLink>
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
  ], [getYouTubeUrl]);

  // Ações da tabela
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

  // Verificação de acesso
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
      title="Gerenciamento de Ajudas"
      subtitle="Configure vídeos tutoriais e documentação para ajudar os usuários"
      actions={[
        {
          label: 'Atualizar Cache',
          icon: <RefreshIcon />,
          onClick: handleRefreshCache,
          variant: 'outlined',
          color: 'primary',
          tooltip: 'Força atualização do cache de ajudas',
          disabled: loading
        },
        {
          label: 'Limpar Todas',
          icon: <DeleteSweepIcon />,
          onClick: handleDeleteAll,
          variant: 'outlined',
          color: 'error',
          disabled: loading || !Array.isArray(helps) || helps.length === 0,
          tooltip: 'Remove todas as ajudas cadastradas'
        }
      ]}
      showSearch
      searchValue={searchTerm}
      onSearchChange={(e) => setSearchTerm(e.target.value)}
      searchPlaceholder="Buscar ajudas..."
    >
      {/* Formulário de Criação/Edição */}
      <StandardTabContent
        variant="default"
      >
        <Formik
          enableReinitialize
          initialValues={formValues}
          validationSchema={helpValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting, resetForm }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Field
                    as={TextField}
                    name="title"
                    label="Título da Ajuda"
                    variant="outlined"
                    fullWidth
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
                    error={touched.video && !!errors.video}
                    helperText={touched.video && errors.video || "Ex: dQw4w9WgXcQ (11 caracteres)"}
                    InputProps={{
                      startAdornment: <YouTubeIcon color="error" sx={{ mr: 1 }} />
                    }}
                  />
                  {values.video && !errors.video && (
                    <VideoPreview>
                      <PlayIcon color="primary" />
                      <StyledLink 
                        href={getYouTubeUrl(values.video)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Ver vídeo no YouTube
                        <OpenInNewIcon fontSize="small" />
                      </StyledLink>
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
                justifyContent: 'flex-end'
              }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (isEditing) {
                      handleCancel();
                    } else {
                      resetForm();
                    }
                  }}
                  startIcon={<ClearIcon />}
                  disabled={loading || isSubmitting}
                >
                  {isEditing ? 'Cancelar' : 'Limpar'}
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading || isSubmitting}
                >
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </StandardTabContent>

      {/* Lista de Ajudas */}
      <StandardTabContent
        title="Ajudas Cadastradas"
        description="Lista de todas as ajudas disponíveis no sistema"
        icon={<HelpIcon />}
        stats={stats}
        variant="default"
      >
        {loading && !initialLoadComplete ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !Array.isArray(helps) || helps.length === 0 ? (
          <StandardEmptyState
            type="default"
            title="Nenhuma ajuda cadastrada"
            description="Comece criando sua primeira ajuda para orientar os usuários"
            primaryAction={{
              label: 'Criar primeira ajuda',
              icon: <AddIcon />,
              onClick: () => {
                setFormValues(initialFormValues);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <StandardTable
            columns={columns}
            data={filteredHelps}
            actions={tableActions}
            loading={loading}
            onRowClick={handleEdit}
            pagination
            initialRowsPerPage={10}
            hover
            emptyState={
              <StandardEmptyState
                type="search"
                title="Nenhuma ajuda encontrada"
                description="Tente ajustar os termos de busca"
              />
            }
            stickyHeader={false}
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
          onClick: () => setDeleteModalOpen(false)
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
          onClick: () => setDeleteAllModalOpen(false)
        }}
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography fontWeight={600}>
            Atenção! Esta ação é irreversível.
          </Typography>
        </Alert>
        <Typography>
          Tem certeza que deseja remover <strong>todas as {Array.isArray(helps) ? helps.length : 0} ajudas</strong> cadastradas?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Todos os vídeos e documentações serão perdidos permanentemente.
        </Typography>
      </StandardModal>
    </StandardPageLayout>
  );
};

HelpsManagementPage.propTypes = {};

export default HelpsManagementPage;