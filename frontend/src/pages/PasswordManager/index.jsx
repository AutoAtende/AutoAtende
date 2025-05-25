import React, { useState, useEffect } from 'react';
import {
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Box,
  Typography,
  Button
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  VpnKey as KeyIcon,
  Business as BusinessIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Componentes
import StandardPageLayout from '../../components/StandardPageLayout';
import { usePasswords } from '../../hooks/usePasswords';
import { useEmployers } from '../../hooks/useEmployers';
import { useTags } from '../../hooks/useTags';
import PasswordTable from './components/PasswordTable';
import PasswordFilter from './components/PasswordFilter';
import PasswordForm from './components/PasswordForm';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

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
  const [activeTab, setActiveTab] = useState(0);

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
      page: 0
    }));
  };

  const handleExport = async (employerId) => {
    if (!employerId) {
      setError('ID do empregador não disponível para exportação');
      return;
    }
    
    try {
      await exportPasswords.mutateAsync(employerId);
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

  // Filtrar senhas baseado na aba ativa (por empresa ou tag)
  const getFilteredPasswords = () => {
    switch (activeTab) {
      case 1: // Por empresa
        return passwords.filter(p => p.employer?.name);
      case 2: // Por tag
        return passwords.filter(p => p.tag?.name);
      default: // Todas
        return passwords;
    }
  };

  const filteredPasswords = getFilteredPasswords();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: "Atualizar",
      icon: isRefetching ? <CircularProgress size={20} /> : <RefreshIcon />,
      onClick: () => refetchPasswords(),
      variant: "outlined",
      color: "primary",
      disabled: isLoading,
      tooltip: "Atualizar lista de senhas"
    },
    {
      label: isMobile ? "Nova" : "Nova Senha",
      icon: <AddIcon />,
      onClick: () => setFormOpen(true),
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar nova senha"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todas (${passwords.length})`,
      icon: <KeyIcon />
    },
    {
      label: `Por Empresa (${passwords.filter(p => p.employer?.name).length})`,
      icon: <BusinessIcon />
    },
    {
      label: `Com Tags (${passwords.filter(p => p.tag?.name).length})`,
      icon: <FilterIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <StandardPageLayout
        title="Banco de Senhas"
        actions={pageActions}
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Pesquisar senhas..."
        showSearch={false} // Desabilitado pois a pesquisa está no filtro customizado
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={isLoading}
      >
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

        {/* Filtros customizados */}
        <Box sx={{ mb: 2 }}>
          <PasswordFilter
            selectedEmployer={filters.employerId}
            selectedTag={filters.tag}
            onEmployerChange={(value) => handleFilterChange('employerId', value)}
            onTagChange={(value) => handleFilterChange('tag', value)}
            onExport={handleExport}
            isLoading={isLoading}
          />
        </Box>

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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              textAlign: 'center'
            }}
          >
            <KeyIcon
              sx={{
                fontSize: 64,
                color: 'primary.main',
                opacity: 0.7,
                mb: 2
              }}
            />
            
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              Nenhuma senha encontrada
            </Typography>
            
            <Typography
              variant="body1"
              align="center" 
              color="text.secondary"
              sx={{ maxWidth: '500px', mb: 4 }}
            >
              Não há senhas cadastradas para os filtros selecionados.
              {!isMobile && ' Você pode adicionar uma nova senha ou ajustar os critérios de busca.'}
            </Typography>
            
            <Button
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              sx={{
                borderRadius: '28px',
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Adicionar Nova Senha
            </Button>
          </Box>
        ) : (
          <PasswordTable
            passwords={filteredPasswords}
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
      </StandardPageLayout>

      {/* Modais */}
      <PasswordForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={selectedPassword ? handleUpdatePassword : handleCreatePassword}
        employers={safeEmployers}
        tags={safeTags}
        initialData={selectedPassword}
        isEditing={!!selectedPassword}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeletePassword}
        passwordData={selectedPassword}
      />
    </>
  );
};

export default PasswordManager;