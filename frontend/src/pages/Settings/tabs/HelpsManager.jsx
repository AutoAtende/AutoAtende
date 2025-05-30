import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Typography,
  Box,
  Stack,
  Alert
} from "@mui/material";
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  YouTube as YouTubeIcon,
  DeleteSweep as DeleteSweepIcon,
  Save as SaveIcon
} from "@mui/icons-material";

import StandardTable from "../../../components/shared/StandardTable";
import StandardModal from "../../../components/shared/StandardModal";
import StandardEmptyState from "../../../components/shared/StandardEmptyState";
import { toast } from "../../../helpers/toast";
import useHelps from "../../../hooks/useHelps";

const HelpsManager = () => {
  const { list, save, update, remove, removeAll } = useHelps();
  
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const [record, setRecord] = useState({
    id: undefined,
    title: '',
    description: '',
    video: ''
  });

  // Carregar ajudas
  const loadHelps = useCallback(async () => {
    setLoading(true);
    try {
      const helpList = await list();
      setRecords(helpList || []);
    } catch (error) {
      console.error('Erro ao carregar ajudas:', error);
      toast.error('Erro ao carregar lista de ajudas');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    loadHelps();
  }, [loadHelps]);

  // Handlers do modal
  const handleOpenModal = useCallback((help) => {
    if (help) {
      setRecord(help);
    } else {
      setRecord({
        id: undefined,
        title: '',
        description: '',
        video: ''
      });
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setRecord({
      id: undefined,
      title: '',
      description: '',
      video: ''
    });
  }, []);

  // Salvar ajuda
  const handleSubmit = useCallback(async () => {
    if (!record.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const helpData = {
        title: record.title.trim(),
        description: record.description.trim(),
        video: record.video.trim()
      };

      if (record.id) {
        await update({ ...helpData, id: record.id });
        toast.success('Ajuda atualizada com sucesso');
      } else {
        await save(helpData);
        toast.success('Ajuda criada com sucesso');
      }
      
      await loadHelps();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar ajuda:', error);
      toast.error('Erro ao salvar ajuda. Verifique se já existe uma ajuda com o mesmo título.');
    } finally {
      setLoading(false);
    }
  }, [record, update, save, loadHelps, handleCloseModal]);

  // Excluir ajuda
  const handleDelete = useCallback(async () => {
    if (!record.id) return;

    setLoading(true);
    try {
      await remove(record.id);
      toast.success('Ajuda excluída com sucesso');
      await loadHelps();
      setDeleteModalOpen(false);
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao excluir ajuda:', error);
      toast.error('Erro ao excluir ajuda');
    } finally {
      setLoading(false);
    }
  }, [record.id, remove, loadHelps, handleCloseModal]);

  // Excluir todas as ajudas
  const handleDeleteAll = useCallback(async () => {
    setLoading(true);
    try {
      await removeAll();
      toast.success('Todas as ajudas foram removidas');
      await loadHelps();
      setDeleteAllModalOpen(false);
    } catch (error) {
      console.error('Erro ao remover todas as ajudas:', error);
      toast.error('Erro ao remover todas as ajudas');
    } finally {
      setLoading(false);
    }
  }, [removeAll, loadHelps]);

  // Filtrar ajudas
  const filteredRecords = React.useMemo(() => {
    if (!searchValue.trim()) return records;
    
    return records.filter(help => 
      help.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
      help.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      help.video?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [records, searchValue]);

  // Configuração das colunas
  const columns = [
    {
      id: 'title',
      field: 'title',
      label: 'Título',
      primary: true,
      render: (row) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {row.title || '-'}
        </Typography>
      )
    },
    {
      id: 'description',
      field: 'description',
      label: 'Descrição',
      render: (row) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {row.description || '-'}
        </Typography>
      )
    },
    {
      id: 'video',
      field: 'video',
      label: 'Vídeo',
      render: (row) => row.video ? (
        <Box display="flex" alignItems="center" gap={1}>
          <YouTubeIcon color="error" fontSize="small" />
          <Typography variant="body2" noWrap>
            {row.video}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">-</Typography>
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
      onClick: (help) => {
        setRecord(help);
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
      title={record.id ? 'Editar Ajuda' : 'Nova Ajuda'}
      subtitle="Configure o tutorial ou ajuda do sistema"
      primaryAction={{
        label: 'Salvar',
        onClick: handleSubmit,
        disabled: !record.title.trim() || loading,
        icon: <SaveIcon />
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
          label="Título da Ajuda"
          placeholder="Ex: Como criar um ticket"
          value={record.title}
          onChange={(e) => setRecord(prev => ({ ...prev, title: e.target.value }))}
          error={!record.title.trim()}
          helperText={!record.title.trim() ? 'Título é obrigatório' : ''}
          variant="outlined"
        />
        
        <TextField
          fullWidth
          label="Descrição"
          placeholder="Descrição detalhada da ajuda"
          value={record.description}
          onChange={(e) => setRecord(prev => ({ ...prev, description: e.target.value }))}
          variant="outlined"
          multiline
          rows={3}
        />
        
        <TextField
          fullWidth
          label="Código do Vídeo YouTube"
          placeholder="Ex: dQw4w9WgXcQ"
          value={record.video}
          onChange={(e) => setRecord(prev => ({ ...prev, video: e.target.value }))}
          variant="outlined"
          InputProps={{
            startAdornment: <YouTubeIcon color="error" sx={{ mr: 1 }} />
          }}
          helperText="Informe apenas o ID do vídeo do YouTube (após o v= na URL)"
        />

        {record.video && (
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Preview:</strong> O vídeo será incorporado usando o ID: {record.video}
            </Typography>
          </Alert>
        )}
      </Stack>
    </StandardModal>
  );

  // Modal de confirmação de exclusão
  const renderDeleteModal = () => (
    <StandardModal
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      title="Confirmar Exclusão"
      subtitle={`Deseja realmente excluir a ajuda "${record.title}"?`}
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
        Esta ação não pode ser desfeita. A ajuda será removida permanentemente do sistema.
      </Typography>
    </StandardModal>
  );

  // Modal de confirmação para excluir todas
  const renderDeleteAllModal = () => (
    <StandardModal
      open={deleteAllModalOpen}
      onClose={() => setDeleteAllModalOpen(false)}
      title="Excluir Todas as Ajudas"
      subtitle="Esta ação irá remover todas as ajudas do sistema"
      primaryAction={{
        label: 'Excluir Todas',
        onClick: handleDeleteAll,
        color: 'error',
        icon: <DeleteSweepIcon />
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: () => setDeleteAllModalOpen(false)
      }}
      loading={loading}
    >
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Atenção!</strong> Esta ação irá remover todas as {records.length} ajudas cadastradas.
        </Typography>
      </Alert>
      <Typography color="text.secondary">
        Esta ação não pode ser desfeita. Todas as ajudas serão removidas permanentemente do sistema.
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
            Gerenciamento de Ajudas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure os tutoriais e ajudas disponíveis no sistema
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
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
            Nova Ajuda
          </Box>
          
          {records.length > 0 && (
            <Box
              component="button"
              onClick={() => setDeleteAllModalOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                bgcolor: 'transparent',
                color: 'error.main',
                border: 1,
                borderColor: 'error.main',
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.contrastText'
                }
              }}
            >
              <DeleteSweepIcon fontSize="small" />
              Limpar Todas
            </Box>
          )}
        </Stack>
      </Box>

      {/* Campo de busca */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Pesquisar ajudas..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          variant="outlined"
        />
      </Box>

      {/* Informação de contagem */}
      {records.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Total de {records.length} ajuda{records.length !== 1 ? 's' : ''} cadastrada{records.length !== 1 ? 's' : ''} no sistema.
          </Typography>
        </Alert>
      )}

      {/* Tabela */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {filteredRecords.length === 0 && !loading ? (
          searchValue ? (
            <StandardEmptyState
              type="search"
              title="Nenhuma ajuda encontrada"
              description={`Não foram encontradas ajudas que correspondam a "${searchValue}"`}
              primaryAction={{
                label: 'Limpar Pesquisa',
                onClick: () => setSearchValue('')
              }}
            />
          ) : (
            <StandardEmptyState
              type="default"
              title="Nenhuma ajuda cadastrada"
              description="Crie tutoriais e ajudas para orientar os usuários do sistema"
              primaryAction={{
                label: 'Criar Primeira Ajuda',
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
                title="Nenhuma ajuda encontrada"
                description="Não há ajudas cadastradas no sistema"
              />
            }
          />
        )}
      </Box>

      {renderFormModal()}
      {renderDeleteModal()}
      {renderDeleteAllModal()}
    </Box>
  );
};

export default HelpsManager;