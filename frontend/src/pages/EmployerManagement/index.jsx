import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { toast } from "../../helpers/toast";
import { styled } from '@mui/material/styles';
import { 
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Divider,
  Grid
} from '@mui/material';
import { 
  Business as BusinessIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

import StandardPageLayout from '../../components/shared/StandardPageLayout';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmployerList from './components/EmployerList';
import EmployerReport from './components/EmployerReport';
import NewEmployerModal from '../../components/NewEmployerModal';
import api from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import { i18n } from "../../translate/i18n";
import { format } from 'date-fns';

// Styled Components
const CustomFieldItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(5),
  textAlign: 'center',
  minHeight: 400
}));

const EmployerManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const isMounted = useRef(true);

  // Estados principais
  const [employers, setEmployers] = useState([]);
  const [selectedEmployers, setSelectedEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchParam, setSearchParam] = useState('');
  const [uploading, setUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Estados de paginação e scroll infinito
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados de modais
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [newEmployerModalOpen, setNewEmployerModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [detailedEmployer, setDetailedEmployer] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Estatísticas
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    recentlyAdded: 0
  });

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Função para normalizar dados do employer
  const normalizeEmployerData = (employer) => {
    if (!employer || typeof employer !== 'object') {
      return {
        id: '',
        name: 'N/A',
        positionsCount: 0,
        createdAt: null,
        isActive: true
      };
    }

    return {
      id: employer.id || '',
      name: employer.name || 'N/A',
      positionsCount: employer.positionsCount || 0,
      createdAt: employer.createdAt || null,
      isActive: employer.isActive !== false,
      ...employer
    };
  };

  // Fetch employers com paginação para scroll infinito
  const fetchEmployers = useCallback(async (page = 1, isNewSearch = false) => {
    if (!isMounted.current || (loading && !loadingMore)) return;
    
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const { data } = await api.get('/employers', {
        params: {
          searchParam,
          page: page,
          limit: 20
        },
      });
      
      if (isMounted.current) {
        const normalizedEmployers = Array.isArray(data?.employers) 
          ? data.employers.map(normalizeEmployerData)
          : [];
        
        if (page === 1 || isNewSearch) {
          setEmployers(normalizedEmployers);
        } else {
          setEmployers(prev => [...prev, ...normalizedEmployers]);
        }
        
        setTotalCount(data?.count || 0);
        setHasMore(normalizedEmployers.length === 20);
        setPageNumber(page);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Erro ao buscar empresas:", err);
        toast.error(i18n.t("employerManagement.errors.fetchEmployers") || "Erro ao carregar empresas");
        if (page === 1) {
          setEmployers([]);
          setTotalCount(0);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchParam, loading, loadingMore]);

  // Buscar estatísticas separadamente
  const fetchStatistics = useCallback(async () => {
    try {
      const { data } = await api.get('/employers/statistics');
      if (isMounted.current) {
        setStatistics(data || {
          total: 0,
          active: 0,
          recentlyAdded: 0
        });
      }
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
      if (isMounted.current) {
        setStatistics({
          total: 0,
          active: 0,
          recentlyAdded: 0
        });
      }
    }
  }, []);

  // Effect para carregar dados iniciais
  useEffect(() => {
    setPageNumber(1);
    setHasMore(true);
    fetchEmployers(1, true);
    fetchStatistics();
  }, [searchParam]);

  // Configurar o socket para atualizações em tempo real
  useEffect(() => {
    const companyId = user?.companyId;
    const socket = window.socket;

    if (socket && companyId) {
      const eventName = `company-${companyId}-employer`;
      
      const handleSocketUpdate = (data) => {
        if (data.action === 'create' || data.action === 'update' || data.action === 'delete' || data.action === 'import') {
          // Refresh data on any employer change
          setPageNumber(1);
          setHasMore(true);
          fetchEmployers(1, true);
          fetchStatistics();
        }
      };

      socket.on(eventName, handleSocketUpdate);

      return () => {
        socket.off(eventName, handleSocketUpdate);
      };
    }
  }, [fetchEmployers, fetchStatistics, user]);

  // Handlers
  const handleSearch = useCallback((value) => {
    setSearchParam(value.toLowerCase());
    setSelectedEmployers([]);
    setPageNumber(1);
    setHasMore(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setPageNumber(1);
    setHasMore(true);
    setSelectedEmployers([]);
    fetchEmployers(1, true);
    fetchStatistics();
  }, [fetchEmployers, fetchStatistics]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      fetchEmployers(pageNumber + 1);
    }
  }, [hasMore, loading, loadingMore, pageNumber, fetchEmployers]);

  const handleAdd = useCallback(() => {
    setSelectedEmployer(null);
    setNewEmployerModalOpen(true);
  }, []);

  const handleEdit = useCallback((employer) => {
    setSelectedEmployer(normalizeEmployerData(employer));
    setNewEmployerModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (employerId) => {
    if (!employerId) return;
    
    try {
      setLoading(true);
      await api.delete(`/employers/${employerId}`);
      toast.success(i18n.t("employerManagement.success.delete") || "Empresa excluída com sucesso");
      setConfirmModalOpen(false);
      setSelectedEmployer(null);
      handleRefresh();
    } catch (err) {
      console.error('Erro ao excluir empresa:', err);
      const errorMsg = err.response?.data?.error || i18n.t("employerManagement.errors.delete") || "Erro ao excluir empresa";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [handleRefresh]);

  const handleConfirmDelete = useCallback((employer) => {
    setSelectedEmployer(normalizeEmployerData(employer));
    setConfirmModalOpen(true);
  }, []);

  const handleViewDetails = useCallback(async (employer) => {
    try {
      setLoadingDetails(true);
      const { data } = await api.get(`/employers/${employer.id}`);
      setDetailedEmployer(data);
      setViewModalOpen(true);
    } catch (err) {
      console.error('Erro ao buscar detalhes da empresa:', err);
      toast.error(i18n.t("employerManagement.errors.fetchDetails") || "Erro ao carregar detalhes");
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const handleSaveEmployer = useCallback(() => {
    setNewEmployerModalOpen(false);
    setSelectedEmployer(null);
    handleRefresh();
  }, [handleRefresh]);

  const handleCloseEmployerModal = useCallback(() => {
    setNewEmployerModalOpen(false);
    setSelectedEmployer(null);
  }, []);

  const handleFileImport = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(extension)) {
      toast.error(i18n.t("employerManagement.errors.invalidFileFormat") || "Formato de arquivo inválido");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const { data } = await api.post('/employers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.imported > 0) {
        toast.success(i18n.t("employerManagement.success.import", { count: data.imported }) || `${data.imported} empresas importadas com sucesso`);
      }
      if (data.duplicates > 0) {
        toast.info(i18n.t("employerManagement.info.duplicates", { count: data.duplicates }) || `${data.duplicates} duplicatas encontradas`);
      }
      if (data.errors && data.errors.length > 0) {
        console.error('Erros na importação:', data.errors);
        toast.warning(i18n.t("employerManagement.warnings.importErrors") || "Alguns erros ocorreram durante a importação");
      }

      handleRefresh();
    } catch (error) {
      console.error(error);
      toast.error(i18n.t("employerManagement.errors.import") || "Erro ao importar empresas");
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [handleRefresh]);

  const handleImportClick = useCallback(() => {
    document.getElementById('import-file-input').click();
  }, []);

  // Renderizar conteúdo baseado na aba ativa
  const renderContent = () => {
    if (currentTab === 0) {
      // Tab de listagem de empresas
      if (employers.length === 0 && !searchParam && !loading) {
        return (
          <EmptyStateContainer>
            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="textSecondary" gutterBottom fontWeight={600}>
              {i18n.t("employerManagement.emptyState.title") || "Nenhuma empresa cadastrada"}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph sx={{ maxWidth: 400 }}>
              {i18n.t("employerManagement.emptyState.message") || "Comece adicionando sua primeira empresa para organizar os contatos."}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ mt: 2 }}
            >
              {i18n.t("employerManagement.buttons.add") || "Adicionar Empresa"}
            </Button>
          </EmptyStateContainer>
        );
      }

      return (
        <EmployerList
          employers={employers}
          loading={loading}
          loadingMore={loadingMore}
          statistics={statistics}
          searchParam={searchParam}
          totalCount={totalCount}
          hasMore={hasMore}
          selectedEmployers={selectedEmployers}
          uploading={uploading}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onImport={handleFileImport}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleConfirmDelete}
          onSelectionChange={setSelectedEmployers}
        />
      );
    }

    // Tab de relatórios
    return <EmployerReport employers={employers} />;
  };

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("employerManagement.buttons.import") || "Importar",
      icon: uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />,
      onClick: handleImportClick,
      variant: "outlined",
      color: "primary",
      disabled: uploading,
      tooltip: "Importar empresas via arquivo CSV/Excel"
    },
    {
      label: i18n.t("employerManagement.buttons.add") || "Adicionar",
      icon: <AddIcon />,
      onClick: handleAdd,
      variant: "contained",
      color: "primary",
      primary: true,
      tooltip: "Adicionar nova empresa"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: i18n.t("employerManagement.tabs.employers") || "Empresas",
      icon: <BusinessIcon />
    },
    {
      label: i18n.t("employerManagement.tabs.report") || "Relatórios",
      icon: <AssignmentIcon />
    }
  ];

  const formattedCounter = () => {
    const selectedCount = Array.isArray(selectedEmployers) ? selectedEmployers.length : 0;
    const baseText = `${employers.length} de ${totalCount} empresas`;
    return selectedCount > 0 
      ? `${baseText} (${selectedCount} selecionadas)`
      : baseText;
  };

  return (
    <>
      <StandardPageLayout
        title={i18n.t("employerManagement.title") || "Gestão de Empresas"}
        subtitle={currentTab === 0 ? formattedCounter() : "Relatórios e análises"}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={(e) => handleSearch(e.target.value)}
        searchPlaceholder="Buscar empresas..."
        showSearch={currentTab === 0}
        tabs={tabs}
        activeTab={currentTab}
        onTabChange={(e, newValue) => {
          setCurrentTab(newValue);
          if (newValue === 0) {
            // Resetar dados ao voltar para a aba de empresas
            setPageNumber(1);
            setHasMore(true);
            setSelectedEmployers([]);
          }
        }}
        loading={loading}
      >
        {renderContent()}
      </StandardPageLayout>

      {/* Input oculto para importação de arquivos */}
      <input
        id="import-file-input"
        type="file"
        accept=".csv,.xls,.xlsx"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />

      {/* Modal de Criação/Edição */}
      {newEmployerModalOpen && (
        <NewEmployerModal
          open={newEmployerModalOpen}
          onClose={handleCloseEmployerModal}
          onSave={handleSaveEmployer}
          initialData={selectedEmployer}
        />
      )}

      {/* Modal de Detalhes */}
      {viewModalOpen && (
        <Dialog 
          open={viewModalOpen} 
          onClose={() => setViewModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {i18n.t("employerManagement.viewDetails.title") || "Detalhes da Empresa"}
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => setViewModalOpen(false)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {loadingDetails ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : detailedEmployer ? (
              <Box>
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="textSecondary">
                      {i18n.t("employerManagement.viewDetails.name") || "Nome"}
                    </Typography>
                    <Typography variant="h6">
                      {detailedEmployer.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="textSecondary">
                      {i18n.t("employerManagement.viewDetails.createdAt") || "Criada em"}
                    </Typography>
                    <Typography variant="h6">
                      {detailedEmployer.createdAt ? format(new Date(detailedEmployer.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  {i18n.t("employerManagement.viewDetails.customFields") || "Campos Personalizados"}
                </Typography>
                
                {detailedEmployer.extraInfo && detailedEmployer.extraInfo.length > 0 ? (
                  detailedEmployer.extraInfo.map((field, index) => (
                    <CustomFieldItem key={index}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {field.name}
                      </Typography>
                      <Typography variant="body1">
                        {field.value}
                      </Typography>
                    </CustomFieldItem>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    {i18n.t("employerManagement.viewDetails.noCustomFields") || "Nenhum campo personalizado cadastrado"}
                  </Typography>
                )}
                
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button 
                    onClick={() => {
                      setViewModalOpen(false);
                      handleEdit(detailedEmployer);
                    }}
                    variant="contained" 
                    color="primary"
                    startIcon={<EditIcon />}
                  >
                    {i18n.t("employerManagement.buttons.edit") || "Editar"}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography color="error">
                {i18n.t("employerManagement.errors.noData") || "Dados não encontrados"}
              </Typography>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmModalOpen && selectedEmployer && (
        <ConfirmationModal
          title={i18n.t("employerManagement.deleteConfirm.title") || "Confirmar Exclusão"}
          open={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setSelectedEmployer(null);
          }}
          onConfirm={() => handleDelete(selectedEmployer.id)}
        >
          <Typography>
            {i18n.t("employerManagement.deleteConfirm.message") || "Esta ação não pode ser desfeita. Deseja continuar?"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Empresa: <strong>{selectedEmployer.name}</strong>
          </Typography>
        </ConfirmationModal>
      )}
    </>
  );
};

export default EmployerManagement;