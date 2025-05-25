import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { toast } from "../../helpers/toast";
import { styled } from '@mui/material/styles';
import { 
  TextField,
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

import StandardPageLayout from '../../components/StandardPageLayout';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmployerList from './components/EmployerList';
import EmployerReport from './components/EmployerReport';
import NewEmployerModal from '../../components/NewEmployerModal';
import api from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import { i18n } from "../../translate/i18n";
import { format } from 'date-fns';

// Styled component para o container de rolagem
const ScrollableContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  maxHeight: 'calc(100vh - 250px)',
  display: 'flex',
  flexDirection: 'column'
}));

const CustomFieldItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const EmployerManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  
  // Ref para o container de rolagem
  const scrollRef = useRef(null);

  // Estados
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [newEmployerModalOpen, setNewEmployerModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [detailedEmployer, setDetailedEmployer] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    recentlyAdded: 0
  });

  const fetchEmployers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/employers', {
        params: { 
          searchParam: searchTerm,
          page,
          limit: rowsPerPage,
        }
      });
  
      if (data.employers && Array.isArray(data.employers)) {
        // Se for a primeira página, substitui os dados, senão, concatena
        if (page === 0) {
          setEmployers(data.employers);
        } else {
          setEmployers(prev => [...prev, ...data.employers]);
        }
        
        setTotalCount(data.count);
        
        // Verifica se há mais dados para carregar
        setHasMore(data.employers.length === rowsPerPage && (page + 1) * rowsPerPage < data.count);
      } else {
        if (page === 0) {
          setEmployers([]);
        }
        setTotalCount(0);
        setHasMore(false);
      }
  
      try {
        const statsResponse = await api.get('/employers/statistics');
        setStatistics(statsResponse.data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setStatistics({
          total: 0,
          active: 0,
          recentlyAdded: 0
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("employerManagement.errors.fetchEmployers"));
      if (page === 0) {
        setEmployers([]);
      }
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, rowsPerPage]);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  // Função para lidar com o scroll
  const handleScroll = useCallback(() => {
    if (!hasMore || loading) return;
    
    const container = scrollRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Carrega mais dados quando chegar a 80% do scroll
    if (scrollHeight - scrollTop - clientHeight < clientHeight * 0.2) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, loading]);

  // Adicionar event listener para o scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  // Configurar o socket para atualizações em tempo real
  useEffect(() => {
    const companyId = user.companyId;
    const socket = window.socket;

    if (socket) {
      socket.on(`company-${companyId}-employer`, (data) => {
        if (data.action === 'create' || data.action === 'update' || data.action === 'delete' || data.action === 'import') {
          // Refresh data on any employer change
          setPage(0);
          fetchEmployers();
        }
      });

      return () => {
        socket.off(`company-${companyId}-employer`);
      };
    }
  }, [fetchEmployers, user]);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/employers/${id}`);
      toast.success(i18n.t("employerManagement.success.delete"));
      setConfirmModalOpen(false);
      // Resetar para a primeira página ao excluir
      setPage(0);
      await fetchEmployers();
    } catch (err) {
      console.error('Error deleting:', err);
      const errorMsg = err.response?.data?.error || i18n.t("employerManagement.errors.delete");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (employer) => {
    try {
      setLoadingDetails(true);
      const { data } = await api.get(`/employers/${employer.id}`);
      setDetailedEmployer(data);
      setViewModalOpen(true);
    } catch (err) {
      console.error('Error fetching employer details:', err);
      toast.error(i18n.t("employerManagement.errors.fetchDetails"));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenModal = (employer = null) => {
    if (employer) {
      setSelectedEmployer({
        id: employer.id,
        name: employer.name
      });
    } else {
      setSelectedEmployer(null);
    }
    setNewEmployerModalOpen(true);
  };

  const handleCloseModal = () => {
    setNewEmployerModalOpen(false);
    setSelectedEmployer(null);
  };

  const handleSaveEmployer = (data) => {
    setPage(0); // Resetar para a primeira página após salvar
    fetchEmployers();
  };

  const handleConfirmDelete = (employer) => {
    setSelectedEmployer(employer);
    setConfirmModalOpen(true);
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(extension)) {
      toast.error(i18n.t("employerManagement.errors.invalidFileFormat"));
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
        toast.success(i18n.t("employerManagement.success.import", { count: data.imported }));
      }
      if (data.duplicates > 0) {
        toast.info(i18n.t("employerManagement.info.duplicates", { count: data.duplicates }));
      }
      if (data.errors.length > 0) {
        console.error('Erros na importação:', data.errors);
        toast.warning(i18n.t("employerManagement.warnings.importErrors"));
      }

      // Resetar para a primeira página após importar
      setPage(0);
      await fetchEmployers();
    } catch (error) {
      console.error(error);
      toast.error(i18n.t("employerManagement.errors.import"));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0); // Resetar para a primeira página ao pesquisar
  };

  const renderContent = () => {
    if (loading && page === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (currentTab === 0) {
      if (employers.length === 0 && !searchTerm) {
        return (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
            <BusinessIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {i18n.t("employerManagement.emptyState.title")}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {i18n.t("employerManagement.emptyState.message")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              {i18n.t("employerManagement.buttons.add")}
            </Button>
          </Box>
        );
      }

      return (
        <ScrollableContainer ref={scrollRef}>
          <EmployerList
            employers={employers}
            loading={loading && page === 0}
            statistics={statistics}
            page={0}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={() => {}}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            onSearch={(value) => {
              setSearchTerm(value);
              setPage(0);
            }}
            onRefresh={() => {
              setPage(0);
              fetchEmployers();
            }}
            onImport={handleFileImport}
            onAdd={() => handleOpenModal()}
            onEdit={handleOpenModal}
            onDelete={handleConfirmDelete}
            onViewDetails={handleViewDetails}
            uploading={uploading}
          />
          
          {/* Indicador de carregamento para rolagem infinita */}
          {loading && page > 0 && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </ScrollableContainer>
      );
    }

    return <EmployerReport employers={employers} />;
  };

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("employerManagement.buttons.import"),
      icon: uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />,
      onClick: () => document.getElementById('import-file-input').click(),
      variant: "outlined",
      color: "primary",
      disabled: uploading,
      tooltip: "Importar empresas via arquivo CSV/Excel"
    },
    {
      label: i18n.t("employerManagement.buttons.add"),
      icon: <AddIcon />,
      onClick: () => handleOpenModal(),
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar nova empresa"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: i18n.t("employerManagement.tabs.employers"),
      icon: <BusinessIcon />
    },
    {
      label: i18n.t("employerManagement.tabs.report"),
      icon: <AssignmentIcon />
    }
  ];

  return (
    <>
      <StandardPageLayout
        title={i18n.t("employerManagement.title")}
        actions={pageActions}
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Pesquisar empresas..."
        showSearch={true}
        tabs={tabs}
        activeTab={currentTab}
        onTabChange={(e, newValue) => {
          setCurrentTab(newValue);
          setPage(0);
        }}
        loading={loading && page === 0}
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
      <NewEmployerModal
        open={newEmployerModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEmployer}
        initialData={selectedEmployer}
      />

      {/* Modal de Detalhes */}
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
              {i18n.t("employerManagement.viewDetails.title")}
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
                    {i18n.t("employerManagement.viewDetails.name")}
                  </Typography>
                  <Typography variant="h6">
                    {detailedEmployer.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {i18n.t("employerManagement.viewDetails.createdAt")}
                  </Typography>
                  <Typography variant="h6">
                    {detailedEmployer.createdAt ? format(new Date(detailedEmployer.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                {i18n.t("employerManagement.viewDetails.customFields")}
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
                  {i18n.t("employerManagement.viewDetails.noCustomFields")}
                </Typography>
              )}
              
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button 
                  onClick={() => {
                    setViewModalOpen(false);
                    handleOpenModal(detailedEmployer);
                  }}
                  variant="contained" 
                  color="primary"
                  startIcon={<EditIcon />}
                >
                  {i18n.t("employerManagement.buttons.edit")}
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography color="error">
              {i18n.t("employerManagement.errors.noData")}
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      {confirmModalOpen && (
        <ConfirmationModal
          title={i18n.t("employerManagement.deleteConfirm.title")}
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDelete(selectedEmployer?.id)}
        >
          <Typography>
            {i18n.t("employerManagement.deleteConfirm.message")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Empresa: {selectedEmployer?.name}
          </Typography>
        </ConfirmationModal>
      )}
    </>
  );
};

export default EmployerManagement;