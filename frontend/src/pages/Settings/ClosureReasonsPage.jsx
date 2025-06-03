import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  TextField,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Chip,
  useMediaQuery,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ReportProblem as ReasonIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  DeleteSweep as DeleteSweepIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import StandardTable from "../../components/shared/StandardTable";
import StandardModal from "../../components/shared/StandardModal";
import StandardEmptyState from "../../components/shared/StandardEmptyState";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import useAuth from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import api from "../../services/api";

// Styled Components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
}));

const ReasonCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)'
  }
}));

const StatsCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.divider}`,
  textAlign: 'center'
}));

// Schema de validação
const reasonValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  message: Yup.string()
    .max(500, 'Mensagem deve ter no máximo 500 caracteres')
});

// Valores iniciais
const initialFormValues = {
  name: '',
  message: ''
};

// Componente Principal
const ClosureReasonsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { getAll, update } = useSettings();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReason, setSelectedReason] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState(false);

  // Verificar se o recurso está habilitado
  const checkReasonEnabled = useCallback(async () => {
    try {
      const companyId = user?.companyId || localStorage.getItem("companyId");
      const settingsData = await getAll(companyId);
      
      if (Array.isArray(settingsData)) {
        const reasonSetting = settingsData.find(s => s?.key === "enableReasonWhenCloseTicket");
        setReasonEnabled(reasonSetting?.value === "enabled");
      }
    } catch (error) {
      console.error("Erro ao verificar configuração:", error);
    }
  }, [user?.companyId, getAll]);

  // Carregar motivos
  const loadReasons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/reasons');
      setReasons(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar motivos:', error);
      toast.error('Erro ao carregar motivos de encerramento');
      setReasons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkReasonEnabled();
    loadReasons();
  }, [checkReasonEnabled, loadReasons]);

  // Filtrar motivos
  const filteredReasons = useMemo(() => {
    if (!searchTerm) return reasons;
    
    return reasons.filter(reason => 
      reason?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason?.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reasons, searchTerm]);

  // Handlers
  const handleOpenModal = useCallback((reason = null) => {
    if (reason) {
      setSelectedReason(reason);
      setFormValues({
        name: reason.name || '',
        message: reason.message || ''
      });
      setIsEditing(true);
    } else {
      setSelectedReason(null);
      setFormValues(initialFormValues);
      setIsEditing(false);
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedReason(null);
    setFormValues(initialFormValues);
    setIsEditing(false);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
      if (isEditing && selectedReason) {
        await api.put(`/reasons/${selectedReason.id}`, {
          name: values.name.trim(),
          message: values.message.trim()
        });
        toast.success('Motivo atualizado com sucesso!');
      } else {
        await api.post('/reasons', {
          name: values.name.trim(),
          message: values.message.trim()
        });
        toast.success('Motivo criado com sucesso!');
      }
      
      await loadReasons();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar motivo:', error);
      const errorMsg = error?.response?.data?.error || 'Erro ao salvar motivo';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback((reason) => {
    setSelectedReason(reason);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!selectedReason?.id) return;
    
    setLoading(true);
    try {
      await api.delete(`/reasons/${selectedReason.id}`);
      await loadReasons();
      toast.success('Motivo excluído com sucesso!');
      setDeleteModalOpen(false);
      setSelectedReason(null);
    } catch (error) {
      console.error('Erro ao excluir motivo:', error);
      const errorMsg = error?.response?.data?.error || 'Erro ao excluir motivo';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = useCallback(() => {
    if (reasons.length === 0) {
      toast.info('Não há motivos para remover');
      return;
    }
    setDeleteAllModalOpen(true);
  }, [reasons.length]);

  const confirmDeleteAll = async () => {
    setLoading(true);
    try {
      // Deletar todos os motivos individualmente
      const deletePromises = reasons.map(reason => 
        api.delete(`/reasons/${reason.id}`)
      );
      
      await Promise.all(deletePromises);
      await loadReasons();
      toast.success('Todos os motivos foram removidos!');
      setDeleteAllModalOpen(false);
    } catch (error) {
      console.error('Erro ao remover todos os motivos:', error);
      toast.error('Erro ao remover todos os motivos');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableFeature = async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      // Desabilitar outras opções de encerramento
      await update({ key: "enableQueueWhenCloseTicket", value: "disabled", companyId });
      await update({ key: "enableTagsWhenCloseTicket", value: "disabled", companyId });
      
      // Habilitar motivos
      await update({ key: "enableReasonWhenCloseTicket", value: "enabled", companyId });
      
      setReasonEnabled(true);
      toast.success("Recurso de motivos de encerramento habilitado!");
    } catch (error) {
      console.error("Erro ao habilitar recurso:", error);
      toast.error("Erro ao habilitar recurso");
    } finally {
      setLoading(false);
    }
  };

  // Preparar estatísticas
  const stats = [
    {
      label: `${reasons.length} motivos cadastrados`,
      icon: <ReasonIcon />,
      color: 'primary'
    },
    {
      label: reasonEnabled ? "Recurso Ativo" : "Recurso Inativo",
      icon: reasonEnabled ? <CheckIcon /> : <WarningIcon />,
      color: reasonEnabled ? 'success' : 'warning'
    }
  ];

  // Preparar colunas da tabela
  const columns = [
    {
      field: 'name',
      label: 'Nome do Motivo',
      primary: true,
      render: (reason) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {reason?.name || '-'}
          </Typography>
          {reason?.message && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {reason.message.length > 100 
                ? `${reason.message.substring(0, 100)}...` 
                : reason.message
              }
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'usage',
      label: 'Uso',
      align: 'center',
      render: (reason) => (
        <Chip 
          label={reason.usageCount ? `${reason.usageCount} usos` : "Não utilizado"} 
          size="small" 
          variant="outlined"
          color={reason.usageCount ? "primary" : "default"}
        />
      )
    },
    {
      field: 'createdAt',
      label: 'Criado em',
      render: (reason) => (
        <Typography variant="body2" color="text.secondary">
          {reason?.createdAt 
            ? new Date(reason.createdAt).toLocaleDateString('pt-BR')
            : '-'
          }
        </Typography>
      )
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
      label: 'Excluir',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error',
      divider: true
    }
  ];

  // Se o recurso não estiver habilitado
  if (!reasonEnabled) {
    return (
      <StandardPageLayout
        title="Motivos de Encerramento"
        subtitle="Configure os motivos disponíveis para encerramento de tickets"
        showSearch={false}
      >
        <StandardTabContent
          title="Recurso Desabilitado"
          description="O recurso de motivos de encerramento não está ativo"
          icon={<WarningIcon />}
          variant="paper"
        >
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom fontWeight={600}>
              Recurso não habilitado
            </Typography>
            <Typography variant="body2">
              Para usar os motivos de encerramento, você precisa habilitar este recurso nas configurações gerais.
              Apenas uma opção de encerramento pode estar ativa por vez (Motivos, Filas ou Etiquetas).
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
              onClick={handleEnableFeature}
              disabled={loading}
            >
              Habilitar Motivos de Encerramento
            </Button>
          </Box>
        </StandardTabContent>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Motivos de Encerramento"
      subtitle="Configure os motivos disponíveis para encerramento de tickets"
      actions={[
        {
          label: 'Novo Motivo',
          icon: <AddIcon />,
          onClick: () => handleOpenModal(),
          variant: 'contained',
          color: 'primary',
          primary: true
        },
        {
          label: 'Limpar Todos',
          icon: <DeleteSweepIcon />,
          onClick: handleDeleteAll,
          variant: 'outlined',
          color: 'error',
          disabled: reasons.length === 0,
          tooltip: 'Remove todos os motivos cadastrados'
        }
      ]}
      showSearch
      searchValue={searchTerm}
      onSearchChange={(e) => setSearchTerm(e.target.value)}
      searchPlaceholder="Buscar motivos..."
    >
      {/* Estatísticas */}
      <StandardTabContent
        title="Visão Geral"
        description="Estatísticas e informações sobre os motivos de encerramento"
        icon={<ReasonIcon />}
        stats={stats}
        variant="paper"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h4" color="primary" fontWeight={600}>
                {reasons.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Motivos
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h4" color="success.main" fontWeight={600}>
                {reasons.filter(r => r.usageCount > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Motivos Utilizados
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h4" color="warning.main" fontWeight={600}>
                {reasons.filter(r => !r.usageCount).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nunca Utilizados
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CheckIcon color="success" fontSize="large" />
                <Typography variant="h6" color="success.main" fontWeight={600}>
                  Ativo
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Status do Recurso
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Alert severity="info">
          <Typography variant="body2">
            Os motivos de encerramento ajudam a categorizar e entender por que os tickets foram finalizados.
            Isso permite análises mais precisas sobre o atendimento e satisfação dos clientes.
          </Typography>
        </Alert>
      </StandardTabContent>

      {/* Lista de Motivos */}
      <StandardTabContent
        title="Motivos Cadastrados"
        description="Lista de todos os motivos disponíveis para encerramento"
        icon={<ReasonIcon />}
        variant="default"
      >
        {loading && reasons.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : reasons.length === 0 ? (
          <StandardEmptyState
            type="default"
            title="Nenhum motivo cadastrado"
            description="Crie motivos de encerramento para organizar o fechamento de tickets"
            primaryAction={{
              label: 'Criar Primeiro Motivo',
              icon: <AddIcon />,
              onClick: () => handleOpenModal()
            }}
          />
        ) : (
          <StandardTable
            columns={columns}
            data={filteredReasons}
            actions={tableActions}
            loading={loading}
            onRowClick={handleOpenModal}
            pagination
            initialRowsPerPage={10}
            hover
            emptyState={
              <StandardEmptyState
                type="search"
                title="Nenhum motivo encontrado"
                description={`Não foram encontrados motivos que correspondam a "${searchTerm}"`}
                primaryAction={{
                  label: 'Limpar Pesquisa',
                  onClick: () => setSearchTerm('')
                }}
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
        title={isEditing ? "Editar Motivo" : "Novo Motivo"}
        subtitle="Configure o motivo de encerramento de tickets"
        primaryAction={{
          label: isEditing ? 'Atualizar' : 'Criar',
          onClick: () => document.getElementById('reason-form-submit').click(),
          disabled: loading
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleCloseModal
        }}
      >
        <Formik
          initialValues={formValues}
          validationSchema={reasonValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form id="reason-form">
              <Stack spacing={3}>
                <Field
                  as={TextField}
                  name="name"
                  label="Nome do Motivo"
                  placeholder="Ex: Problema resolvido"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  autoFocus
                />
                
                <Field
                  as={TextField}
                  name="message"
                  label="Mensagem (Opcional)"
                  placeholder="Mensagem adicional sobre este motivo"
                  fullWidth
                  multiline
                  rows={3}
                  error={touched.message && !!errors.message}
                  helperText={touched.message && errors.message}
                />
              </Stack>
              
              <button
                id="reason-form-submit"
                type="submit"
                style={{ display: 'none' }}
              />
            </Form>
          )}
        </Formik>
      </StandardModal>

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
          Tem certeza que deseja excluir o motivo <strong>"{selectedReason?.name}"</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Esta ação não pode ser desfeita.
        </Typography>
      </StandardModal>

      {/* Modal de Confirmação - Excluir Todos */}
      <StandardModal
        open={deleteAllModalOpen}
        onClose={() => setDeleteAllModalOpen(false)}
        title="Limpar Todos os Motivos"
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
          Tem certeza que deseja remover <strong>todos os {reasons.length} motivos</strong> cadastrados?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Todos os motivos de encerramento serão perdidos permanentemente.
        </Typography>
      </StandardModal>
    </StandardPageLayout>
  );
};

export default ClosureReasonsPage;