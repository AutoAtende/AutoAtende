import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { 
  TextField,
  Typography,
  Box,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ReportProblem as ReasonIcon
} from '@mui/icons-material';

import StandardTable from "../../../components/shared/StandardTable";
import StandardModal from "../../../components/shared/StandardModal";
import StandardEmptyState from "../../../components/shared/StandardEmptyState";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";
import useSettings from "../../../hooks/useSettings";
import api from "../../../services/api";
import { useLoading } from "../../../hooks/useLoading";

const Reason = () => {
  const { user } = useContext(AuthContext);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReason, setCurrentReason] = useState({ id: null, name: '', message: '' });
  const [searchValue, setSearchValue] = useState('');

  // Carregar motivos de encerramento
  const loadReasons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/reasons');
      setReasons(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar motivos:', error);
      toast.error('Erro ao carregar motivos de encerramento');
      setReasons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReasons();
  }, [loadReasons]);

  // Handlers do modal
  const handleOpenModal = useCallback((reason = { id: null, name: '', message: '' }) => {
    setCurrentReason(reason);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setCurrentReason({ id: null, name: '', message: '' });
  }, []);

  // Salvar motivo
  const handleSave = useCallback(async () => {
    if (!currentReason.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      
      if (currentReason.id) {
        await api.put(`/reasons/${currentReason.id}`, {
          name: currentReason.name.trim(),
          message: currentReason.message.trim()
        });
        toast.success('Motivo atualizado com sucesso');
      } else {
        await api.post('/reasons', {
          name: currentReason.name.trim(),
          message: currentReason.message.trim()
        });
        toast.success('Motivo criado com sucesso');
      }
      
      await loadReasons();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar motivo:', error);
      const errorMessage = error?.response?.data?.error || 'Erro ao salvar motivo';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentReason, loadReasons, handleCloseModal]);

  // Excluir motivo
  const handleDelete = useCallback(async (reason) => {
    if (!window.confirm(`Tem certeza que deseja excluir o motivo "${reason.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/reasons/${reason.id}`);
      toast.success('Motivo excluído com sucesso');
      await loadReasons();
    } catch (error) {
      console.error('Erro ao excluir motivo:', error);
      const errorMessage = error?.response?.data?.error || 'Erro ao excluir motivo';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadReasons]);

  // Filtrar motivos com base na pesquisa
  const filteredReasons = React.useMemo(() => {
    if (!searchValue.trim()) return reasons;
    
    return reasons.filter(reason => 
      reason.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      reason.message?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [reasons, searchValue]);

  // Configuração das colunas da tabela
  const columns = [
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      primary: true,
      render: (reason) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {reason.name || '-'}
        </Typography>
      )
    },
    {
      id: 'message',
      field: 'message', 
      label: 'Mensagem',
      render: (reason) => (
        <Typography variant="body2" color="text.secondary">
          {reason.message || '-'}
        </Typography>
      )
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
      onClick: handleDelete,
      color: 'error',
      divider: true
    }
  ];

  // Modal de formulário
  const renderModal = () => (
    <StandardModal
      open={modalOpen}
      onClose={handleCloseModal}
      title={currentReason.id ? 'Editar Motivo' : 'Novo Motivo'}
      subtitle="Configure o motivo de encerramento de tickets"
      primaryAction={{
        label: 'Salvar',
        onClick: handleSave,
        disabled: !currentReason.name.trim() || loading
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: handleCloseModal
      }}
      loading={loading}
    >
      <Stack spacing={3} sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          label="Nome do Motivo"
          placeholder="Ex: Problema resolvido"
          value={currentReason.name}
          onChange={(e) => setCurrentReason(prev => ({ ...prev, name: e.target.value }))}
          error={!currentReason.name.trim()}
          helperText={!currentReason.name.trim() ? 'Nome é obrigatório' : ''}
          variant="outlined"
        />
        
        <TextField
          fullWidth
          label="Mensagem (Opcional)"
          placeholder="Mensagem adicional sobre este motivo"
          value={currentReason.message}
          onChange={(e) => setCurrentReason(prev => ({ ...prev, message: e.target.value }))}
          variant="outlined"
          multiline
          rows={3}
        />
      </Stack>
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
            Motivos de Encerramento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os motivos disponíveis para encerramento de tickets
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
          Novo Motivo
        </Box>
      </Box>

      {/* Campo de busca */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Pesquisar motivos..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          variant="outlined"
        />
      </Box>

      {/* Tabela */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {filteredReasons.length === 0 && !loading ? (
          searchValue ? (
            <StandardEmptyState
              type="search"
              title="Nenhum motivo encontrado"
              description={`Não foram encontrados motivos que correspondam a "${searchValue}"`}
              primaryAction={{
                label: 'Limpar Pesquisa',
                onClick: () => setSearchValue('')
              }}
            />
          ) : (
            <StandardEmptyState
              type="default"
              title="Nenhum motivo cadastrado"
              description="Crie motivos de encerramento para organizar o fechamento de tickets"
              primaryAction={{
                label: 'Criar Primeiro Motivo',
                onClick: () => handleOpenModal()
              }}
            />
          )
        ) : (
          <StandardTable
            columns={columns}
            data={filteredReasons}
            loading={loading}
            actions={actions}
            onRowClick={(reason) => handleOpenModal(reason)}
            pagination={true}
            initialRowsPerPage={10}
            stickyHeader={true}
            hover={true}
            emptyState={
              <StandardEmptyState
                type="default"
                title="Nenhum motivo encontrado"
                description="Não há motivos de encerramento cadastrados"
              />
            }
          />
        )}
      </Box>

      {renderModal()}
    </Box>
  );
};

export default Reason;