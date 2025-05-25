import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  ContentCopy as ContentCopyIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

import StandardPageLayout from '../../components/StandardPageLayout';
import ConfirmationModal from '../../components/ConfirmationModal';
import QRCodeDialog from '../../components/QrCodeDialog';
import { toast } from "../../helpers/toast";
import { AuthContext } from '../../context/Auth/AuthContext';
import api from '../../services/api';

const LandingPagesList = () => {
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const companyId = localStorage.getItem("companyId") ? localStorage.getItem("companyId") : user?.companyId;
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [landingPages, setLandingPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('landingPagesViewMode') || 'list');
  
  // Função para criar nova landing page
  const handleCreateNewPage = () => {    
    localStorage.setItem("landingPageNew", "true");
    history.push('/landing-pages/edit/new');
  };
  
  // Função para carregar as landing pages
  const loadLandingPages = useCallback(async () => {
    try {
      setLoading(true);
      
      let queryParams = `page=${page + 1}&limit=${rowsPerPage}`;
      
      if (search) {
        queryParams += `&search=${encodeURIComponent(search)}`;
      }
      
      if (filterActive !== null) {
        queryParams += `&active=${filterActive}`;
      }
      
      const response = await api.get(`/landing-pages?${queryParams}`);
      
      setLandingPages(response.data.data || []);
      setTotalPages(response.data.total || 0);
      
    } catch (error) {
      console.error('Erro ao carregar landing pages:', error);
      toast.error('Erro ao carregar landing pages');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filterActive]);
  
  // Carregar landing pages na inicialização e quando os filtros mudarem
  useEffect(() => {
    loadLandingPages();
  }, [loadLandingPages]);
  
  // Alterações na paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Função para copiar URL da landing page
  const handleCopyUrl = (slug) => {
    if (!companyId) {
      toast.error('Company ID não encontrado');
      return;
    }
    const url = `${window.location.origin}/l/${companyId}/${slug}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('URL copiada com sucesso!');
      })
      .catch((error) => {
        toast.error('Erro ao copiar URL');
      });
  };

  // Funções para manipular o diálogo de exclusão
  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };
  
  // Função para excluir uma landing page
  const handleDelete = async () => {
    try {
      await api.delete(`/landing-pages/${deleteId}`);
      toast.success('Landing page excluída com sucesso!');
      loadLandingPages();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Erro ao excluir landing page:', error);
      toast.error('Erro ao excluir landing page');
    }
  };
  
  // Funções para manipular o diálogo de QR Code
  const handleOpenQRCodeDialog = (page) => {
    setSelectedPage(page);
    setQrCodeDialogOpen(true);
  };
  
  const handleCloseQRCodeDialog = () => {
    setQrCodeDialogOpen(false);
    setSelectedPage(null);
  };
  
  // Função para alternar o status ativo/inativo
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/landing-pages/${id}/toggle-active`);
      toast.success(`Landing page ${currentStatus ? 'desativada' : 'ativada'} com sucesso!`);
      loadLandingPages();
    } catch (error) {
      console.error('Erro ao alterar status da landing page:', error);
      toast.error('Erro ao alterar status da landing page');
    }
  };
  
  // Função para alternar entre modo de exibição
  const handleToggleViewMode = () => {
    const newMode = viewMode === 'list' ? 'grid' : 'list';
    setViewMode(newMode);
    localStorage.setItem('landingPagesViewMode', newMode);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0); // Reset para primeira página ao pesquisar
  };

  // Filtros para o cabeçalho
  const renderFilters = () => (
    <Box display="flex" alignItems="center" gap={2}>
      <FormControl size="small">
        <FormLabel component="legend" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
          Status
        </FormLabel>
        <Select
          value={filterActive === null ? 'all' : filterActive.toString()}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'all') {
              setFilterActive(null);
            } else {
              setFilterActive(value === 'true');
            }
            setPage(0);
          }}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="true">Ativas</MenuItem>
          <MenuItem value="false">Inativas</MenuItem>
        </Select>
      </FormControl>

      <Tooltip title={viewMode === 'list' ? 'Visualizar em grade' : 'Visualizar em lista'}>
        <IconButton onClick={handleToggleViewMode} color="primary">
          {viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
  
  // Renderizar conteúdo principal
  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (landingPages.length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
          <QrCodeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="textSecondary">
            {search ? "Nenhuma landing page encontrada" : "Nenhuma landing page criada"}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {search 
              ? "Tente ajustar sua pesquisa" 
              : "Crie sua primeira landing page para divulgar seu negócio ou coletar leads."
            }
          </Typography>
          {!search && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateNewPage}
            >
              Criar nova Landing Page
            </Button>
          )}
        </Box>
      );
    }

    return (
      <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>URL</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">QR Code</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {landingPages.map((page) => (
              <TableRow key={page.id} hover>
                <TableCell>
                  <Typography variant="body1" fontWeight={500}>
                    {page.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      /{companyId}/{page.slug}
                    </Typography>
                    <Tooltip title="Copiar URL">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyUrl(page.slug)}
                        color="primary"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={page.active ? "Clique para desativar" : "Clique para ativar"}>
                    <Chip 
                      label={page.active ? "Ativa" : "Inativa"}
                      size="small"
                      color={page.active ? "success" : "default"}
                      variant={page.active ? "filled" : "outlined"}
                      onClick={() => handleToggleActive(page.id, page.active)}
                      sx={{ minWidth: '70px', cursor: 'pointer' }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver QR Code">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenQRCodeDialog(page)}
                    >
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => history.push(`/landing-pages/edit/${page.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(page.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Paginação */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
              Itens por página:
            </Typography>
            <FormControl variant="outlined" size="small">
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Typography variant="body2" color="textSecondary">
            {landingPages.length} de {totalPages} landing pages
          </Typography>
        </Box>
      </TableContainer>
    );
  };

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: "Nova Landing Page",
      icon: <AddIcon />,
      onClick: handleCreateNewPage,
      variant: "contained",
      color: "primary",
      tooltip: "Criar nova landing page"
    }
  ];

  return (
    <>
      <StandardPageLayout
        title="Landing Pages"
        actions={pageActions}
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Buscar landing pages..."
        showSearch={true}
        loading={loading}
      >
        {/* Filtros adicionais */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          {renderFilters()}
        </Box>

        {renderContent()}
      </StandardPageLayout>
      
      {/* Modal de confirmação de exclusão */}
      {deleteDialogOpen && (
        <ConfirmationModal
          title="Excluir Landing Page"
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
        >
          <Typography>
            Tem certeza que deseja excluir esta landing page? Esta ação não pode ser desfeita.
          </Typography>
        </ConfirmationModal>
      )}
      
      {/* Diálogo de QR Code */}
      <QRCodeDialog
        open={qrCodeDialogOpen}
        landingPage={selectedPage}
        onClose={handleCloseQRCodeDialog}
      />
    </>
  );
};

export default LandingPagesList;