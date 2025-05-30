import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Stack,
  Chip,
  Card,
  CardContent,
  Alert
} from "@mui/material";
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as PlanIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from "@mui/icons-material";

import StandardTable from "../../../components/shared/StandardTable";
import StandardModal from "../../../components/shared/StandardModal";
import StandardEmptyState from "../../../components/shared/StandardEmptyState";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import usePlans from "../../../hooks/usePlans";
import { i18n } from "../../../translate/i18n";
import { useLoading } from "../../../hooks/useLoading";

const PlansManager = () => {
  const { user } = useContext(AuthContext);
  const { list, save, update, remove } = usePlans();
  
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const [record, setRecord] = useState({
    id: undefined,
    name: '',
    users: 0,
    connections: 0,
    queues: 0,
    value: 0,
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
  });

  // Carregar planos
  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const planList = await list();
      setRecords(planList || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar lista de planos');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Handlers do modal
  const handleOpenModal = useCallback((plan) => {
    if (plan) {
      setRecord({
        ...plan,
        value: plan.value?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || '0,00'
      });
    } else {
      setRecord({
        id: undefined,
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
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
      });
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setRecord({
      id: undefined,
      name: '',
      users: 0,
      connections: 0,
      queues: 0,
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
    });
  }, []);

  // Salvar plano
  const handleSubmit = useCallback(async () => {
    if (!record.name.trim()) {
      toast.error('Nome do plano é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const planData = {
        ...record,
        value: typeof record.value === 'string' 
          ? parseFloat(record.value.replace(',', '.')) 
          : record.value
      };

      if (record.id) {
        await update(planData);
        toast.success('Plano atualizado com sucesso');
      } else {
        await save(planData);
        toast.success('Plano criado com sucesso');
      }
      
      await loadPlans();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano. Verifique se já existe um plano com o mesmo nome.');
    } finally {
      setLoading(false);
    }
  }, [record, update, save, loadPlans, handleCloseModal]);

  // Excluir plano
  const handleDelete = useCallback(async () => {
    if (!record.id) return;

    setLoading(true);
    try {
      await remove(record.id);
      toast.success('Plano excluído com sucesso');
      await loadPlans();
      setDeleteModalOpen(false);
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir plano');
    } finally {
      setLoading(false);
    }
  }, [record.id, remove, loadPlans, handleCloseModal]);

  // Filtrar planos
  const filteredRecords = React.useMemo(() => {
    if (!searchValue.trim()) return records;
    
    return records.filter(plan => 
      plan.name?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [records, searchValue]);

  // Renderizar valor booleano
  const renderBoolean = useCallback((value) => {
    return value ? (
      <Chip icon={<CheckIcon />} label="Sim" color="success" size="small" />
    ) : (
      <Chip icon={<CancelIcon />} label="Não" color="default" size="small" />
    );
  }, []);

  // Configuração das colunas
  const columns = [
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      primary: true,
      render: (row) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {row.name || '-'}
        </Typography>
      )
    },
    {
      id: 'users',
      field: 'users',
      label: 'Usuários',
      align: 'center',
      render: (row) => row.users || '-'
    },
    {
      id: 'connections',
      field: 'connections',
      label: 'Conexões',
      align: 'center',
      render: (row) => row.connections || '-'
    },
    {
      id: 'queues',
      field: 'queues',
      label: 'Filas',
      align: 'center',
      render: (row) => row.queues || '-'
    },
    {
      id: 'value',
      field: 'value',
      label: 'Valor',
      align: 'center',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
          R$ {row.value ? row.value.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '0,00'}
        </Typography>
      )
    },
    {
      id: 'storageLimit',
      field: 'storageLimit',
      label: 'Armazenamento',
      align: 'center',
      render: (row) => `${row.storageLimit || 0} MB`
    },
    {
      id: 'isVisible',
      field: 'isVisible',
      label: 'Visível',
      align: 'center',
      render: (row) => renderBoolean(row.isVisible)
    }
  ];

  // Ações da tabela
  const actions = [
    {
      label: 'Editar',
      icon: <EditIcon />,
      onClick: handleOpenModal,
      color: 'primary'
    },
    {
      label: 'Excluir',
      icon: <DeleteIcon />,
      onClick: (plan) => {
        setRecord(plan);
        setDeleteModalOpen(true);
      },
      color: 'error',
      divider: true
    }
  ];

  // Modal de formulário
  const renderFormModal = () => (
    <StandardModal
      open={modalOpen}
      onClose={handleCloseModal}
      title={record.id ? 'Editar Plano' : 'Novo Plano'}
      subtitle="Configure os recursos e limites do plano"
      primaryAction={{
        label: 'Salvar',
        onClick: handleSubmit,
        disabled: !record.name.trim() || loading,
        icon: <SaveIcon />
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: handleCloseModal
      }}
      size="large"
      loading={loading}
    >
      <Box sx={{ pt: 1 }}>
        <Grid container spacing={3}>
          {/* Informações Básicas */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Informações Básicas</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome do Plano"
              value={record.name}
              onChange={(e) => setRecord(prev => ({ ...prev, name: e.target.value }))}
              error={!record.name.trim()}
              helperText={!record.name.trim() ? 'Nome é obrigatório' : ''}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Valor (R$)"
              value={record.value}
              onChange={(e) => setRecord(prev => ({ ...prev, value: e.target.value }))}
              placeholder="0,00"
            />
          </Grid>

          {/* Limites */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Limites</Typography>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Usuários"
              type="number"
              value={record.users}
              onChange={(e) => setRecord(prev => ({ ...prev, users: parseInt(e.target.value) || 0 }))}
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Conexões"
              type="number"
              value={record.connections}
              onChange={(e) => setRecord(prev => ({ ...prev, connections: parseInt(e.target.value) || 0 }))}
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Filas"
              type="number"
              value={record.queues}
              onChange={(e) => setRecord(prev => ({ ...prev, queues: parseInt(e.target.value) || 0 }))}
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Armazenamento (MB)"
              type="number"
              value={record.storageLimit}
              onChange={(e) => setRecord(prev => ({ ...prev, storageLimit: parseInt(e.target.value) || 0 }))}
            />
          </Grid>

          {/* Recursos */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Recursos Disponíveis</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <FormControlLabel
                  control={<Switch checked={record.useCampaigns} onChange={(e) => setRecord(prev => ({ ...prev, useCampaigns: e.target.checked }))} />}
                  label="Campanhas"
                />
                <FormControlLabel
                  control={<Switch checked={record.useSchedules} onChange={(e) => setRecord(prev => ({ ...prev, useSchedules: e.target.checked }))} />}
                  label="Agendamentos"
                />
                <FormControlLabel
                  control={<Switch checked={record.useInternalChat} onChange={(e) => setRecord(prev => ({ ...prev, useInternalChat: e.target.checked }))} />}
                  label="Chat Interno"
                />
                <FormControlLabel
                  control={<Switch checked={record.useExternalApi} onChange={(e) => setRecord(prev => ({ ...prev, useExternalApi: e.target.checked }))} />}
                  label="API Externa"
                />
              </Box>
              
              <Box display="flex" flexWrap="wrap" gap={2}>
                <FormControlLabel
                  control={<Switch checked={record.useKanban} onChange={(e) => setRecord(prev => ({ ...prev, useKanban: e.target.checked }))} />}
                  label="Kanban"
                />
                <FormControlLabel
                  control={<Switch checked={record.useOpenAi} onChange={(e) => setRecord(prev => ({ ...prev, useOpenAi: e.target.checked }))} />}
                  label="OpenAI"
                />
                <FormControlLabel
                  control={<Switch checked={record.useIntegrations} onChange={(e) => setRecord(prev => ({ ...prev, useIntegrations: e.target.checked }))} />}
                  label="Integrações"
                />
                <FormControlLabel
                  control={<Switch checked={record.useEmail} onChange={(e) => setRecord(prev => ({ ...prev, useEmail: e.target.checked }))} />}
                  label="E-mail"
                />
              </Box>
              
              <Box display="flex" flexWrap="wrap" gap={2}>
                <FormControlLabel
                  control={<Switch checked={record.whiteLabel} onChange={(e) => setRecord(prev => ({ ...prev, whiteLabel: e.target.checked }))} />}
                  label="White Label"
                />
                <FormControlLabel
                  control={<Switch checked={record.isVisible} onChange={(e) => setRecord(prev => ({ ...prev, isVisible: e.target.checked }))} />}
                  label="Visível"
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </StandardModal>
  );

  // Modal de confirmação de exclusão
  const renderDeleteModal = () => (
    <StandardModal
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      title="Confirmar Exclusão"
      subtitle={`Deseja realmente excluir o plano "${record.name}"?`}
      primaryAction={{
        label: 'Excluir',
        onClick: handleDelete,
        color: 'error',
        icon: <DeleteIcon />
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: () => setDeleteModalOpen(false)
      }}
      loading={loading}
    >
      <Typography color="text.secondary">
        Esta ação não pode ser desfeita. O plano será removido permanentemente do sistema.
      </Typography>
    </StandardModal>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      width: '100%'
    }}>
      {/* Header com ações */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Gerenciamento de Planos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure os planos disponíveis no sistema
          </Typography>
        </Box>
        
        <Box
          component="button"
          onClick={() => handleOpenModal()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }}
        >
          <AddIcon fontSize="small" />
          Novo Plano
        </Box>
      </Box>

      {/* Campo de busca */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Pesquisar planos..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          variant="outlined"
        />
      </Box>

      {/* Tabela */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {filteredRecords.length === 0 && !loading ? (
          searchValue ? (
            <StandardEmptyState
              type="search"
              title="Nenhum plano encontrado"
              description={`Não foram encontrados planos que correspondam a "${searchValue}"`}
              primaryAction={{
                label: 'Limpar Pesquisa',
                onClick: () => setSearchValue('')
              }}
            />
          ) : (
            <StandardEmptyState
              type="default"
              title="Nenhum plano cadastrado"
              description="Crie planos para definir recursos e limites para as empresas"
              primaryAction={{
                label: 'Criar Primeiro Plano',
                onClick: () => handleOpenModal()
              }}
            />
          )
        ) : (
          <StandardTable
            columns={columns}
            data={filteredRecords}
            loading={loading}
            actions={actions}
            onRowClick={handleOpenModal}
            pagination={true}
            initialRowsPerPage={10}
            stickyHeader={true}
            hover={true}
            showRowNumbers={true}
            emptyState={
              <StandardEmptyState
                type="default"
                title="Nenhum plano encontrado"
                description="Não há planos cadastrados no sistema"
              />
            }
          />
        )}
      </Box>

      {renderFormModal()}
      {renderDeleteModal()}
    </Box>
  );
};

export default PlansManager;