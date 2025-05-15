import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { usePasswords } from '../../hooks/usePasswords';
import { useEmployers } from '../../hooks/useEmployers';
import { useTags } from '../../hooks/useTags';
import PasswordTable from './components/PasswordTable';
import PasswordFilter from './components/PasswordFilter';
import PasswordForm from './components/PasswordForm';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import EmptyState from './components/EmptyState';

const PasswordManager = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [filters, setFilters] = useState({
    employerId: '',
    tag: null,
    page: 0,
    pageSize: 10
  });
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Hooks para dados de empregadores e tags
  const { data: employersData, isLoading: isLoadingEmployers } = useEmployers();
  const { data: tagsData, isLoading: isLoadingTags } = useTags();

  // Usar o hook de senhas para obter dados com paginação
  const { usePasswordsQuery, createPassword, updatePassword, deletePassword, exportPasswords } = usePasswords();
  
  const {
    data: passwordsData,
    isLoading: isLoadingPasswords,
    refetch: refetchPasswords,
    isRefetching
  } = usePasswordsQuery(filters);

  // Limpa o erro após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCreatePassword = async (data) => {
    if (!data) {
      setError('Dados de senha inválidos para criação');
      return;
    }
    
    try {
      await createPassword.mutateAsync(data);
      setFormOpen(false);
      // Refetch na página atual após criar
      refetchPasswords();
    } catch (err) {
      setError(`Erro ao criar senha: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleUpdatePassword = async (data) => {
    if (!selectedPassword || !selectedPassword.id) {
      setError('ID da senha não disponível para atualização');
      return;
    }
    
    try {
      const formattedData = {
        ...data,
        employerId: data.employerId ? String(data.employerId) : ''
      };

      await updatePassword.mutateAsync({ 
        id: selectedPassword.id, 
        data: formattedData 
      });
      
      setFormOpen(false);
      setSelectedPassword(null);
      // Refetch na página atual após atualizar
      refetchPasswords();
    } catch (err) {
      setError(`Erro ao atualizar senha: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeletePassword = async () => {
    if (!selectedPassword || !selectedPassword.id) {
      setError('ID da senha não disponível para exclusão');
      return;
    }
    
    try {
      await deletePassword.mutateAsync(selectedPassword.id);
      setDeleteModalOpen(false);
      setSelectedPassword(null);
      // Refetch na página atual após excluir
      refetchPasswords();
    } catch (err) {
      setError(`Erro ao excluir senha: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleEdit = (password) => {
    if (!password || !password.id) {
      setError('Senha inválida para edição');
      return;
    }
    setSelectedPassword(password);
    setFormOpen(true);
  };

  const handleDelete = (password) => {
    if (!password || !password.id) {
      setError('Senha inválida para exclusão');
      return;
    }
    setSelectedPassword(password);
    setDeleteModalOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedPassword(null);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedPassword(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      // Resetar paginação quando filtros mudam
      ...(filterName !== 'page' && filterName !== 'pageSize' ? { page: 0 } : {})
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handlePageSizeChange = (pageSize) => {
    setFilters(prev => ({
      ...prev,
      pageSize,
      page: 0 // Reset para primeira página quando muda o tamanho
    }));
  };

  const handleExport = async (employerId) => {
    if (!employerId) {
      setError('ID do empregador não disponível para exportação');
      return;
    }
    
    try {
      await exportPasswords.mutateAsync(employerId);
      // Sucesso tratado via toast (já implementado)
    } catch (err) {
      setError(`Erro ao exportar senhas: ${err.message || 'Erro desconhecido'}`);
    }
  };

  // Garantir que temos arrays válidos para os selects
  const safeEmployers = Array.isArray(employersData?.employers) ? employersData.employers : [];
  const safeTags = Array.isArray(tagsData) ? tagsData : [];
  const passwords = passwordsData?.passwords || [];
  const totalPasswords = passwordsData?.total || 0;

  // Verifica se não há dados após o carregamento inicial
  const isLoading = isLoadingPasswords || isRefetching;
  const isEmpty = !isLoading && passwords.length === 0;
  const showEmptyState = isEmpty && filters.page === 0 && !filters.employerId && !filters.tag;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography 
          variant="h6" 
          component="h1"
          sx={{
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'
          }}
        >
          Banco de Senhas
        </Typography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => refetchPasswords()}
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            {isRefetching ? <CircularProgress size={20} /> : 'Atualizar'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
            disableElevation
          >
            {isMobile ? 'Nova' : 'Nova Senha'}
          </Button>
        </Box>
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Filtros */}
      <PasswordFilter
        selectedEmployer={filters.employerId}
        selectedTag={filters.tag}
        onEmployerChange={(value) => handleFilterChange('employerId', value)}
        onTagChange={(value) => handleFilterChange('tag', value)}
        onExport={handleExport}
        isLoading={isLoading}
      />

      {/* Estatísticas */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          px: 1
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {totalPasswords > 0 ? (
            `Total: ${totalPasswords} senha${totalPasswords !== 1 ? 's' : ''}`
          ) : (
            isLoading ? 'Carregando senhas...' : 'Nenhuma senha encontrada'
          )}
        </Typography>
      </Box>
      
      {/* Estado vazio ou tabela de senhas */}
      {showEmptyState ? (
        <EmptyState onCreateNew={() => setFormOpen(true)} />
      ) : (
        <PasswordTable
          passwords={passwords}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          totalCount={totalPasswords}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handlePageSizeChange}
          currentPage={filters.page}
          rowsPerPage={filters.pageSize}
        />
      )}

      {/* Modal de formulário */}
      <PasswordForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={selectedPassword ? handleUpdatePassword : handleCreatePassword}
        employers={safeEmployers}
        tags={safeTags}
        initialData={selectedPassword}
        isEditing={!!selectedPassword}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeletePassword}
        passwordData={selectedPassword}
      />
    </Box>
  );
};

export default PasswordManager;