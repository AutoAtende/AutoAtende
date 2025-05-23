import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  QrCode as QrCodeIcon,
  ContentCopy as ContentCopyIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import { AuthContext } from '../../context/Auth/AuthContext';
import api from '../../services/api';
import QRCodeDialog from '../../components/QrCodeDialog';

const LandingPagesList = () => {
  const { user } = useContext(AuthContext);
  const history = useHistory(); // Hook para navegação programática
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
  
  // Função para criar nova landing page (navegação programática em vez de Link)
  const handleCreateNewPage = () => {    
    // Armazenar um valor no localStorage para indicar que é uma nova página
    localStorage.setItem("landingPageNew", "true");
    
    // Navegação direta para o editor
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
    setPage(newPage - 1); // Ajuste porque o componente de paginação começa em 1
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
  
  // Função para alternar entre modo de exibição (lista ou grade)
  const handleToggleViewMode = () => {
    const newMode = viewMode === 'list' ? 'grid' : 'list';
    setViewMode(newMode);
    localStorage.setItem('landingPagesViewMode', newMode);
  };
  
  // Renderizar conteúdo da página vazia
  const renderEmptyState = () => (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
      <QrCodeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Nenhuma landing page encontrada
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Crie sua primeira landing page para divulgar seu negócio ou coletar leads.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleCreateNewPage}
      >
        Criar nova Landing-Page
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Landing Pages
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="Buscar landing pages..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ width: '300px' }}
          />
          
          <Box display="flex" alignItems="center" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={filterActive === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterActive(true);
                    } else if (filterActive === true) {
                      setFilterActive(null);
                    } else {
                      setFilterActive(false);
                    }
                    setPage(0);
                  }}
                  color="primary"
                />
              }
              label="Somente ativas"
            />
            
            <Tooltip title={viewMode === 'list' ? 'Visualizar em grade' : 'Visualizar em lista'}>
              <IconButton onClick={handleToggleViewMode} color="primary">
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            
            {/* Botão para criar nova Landing Page */}
            <Tooltip title="Nova Landing Page">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateNewPage}
                sx={{ minWidth: 'auto' }}
              >
                Nova
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : landingPages.length === 0 ? (
        renderEmptyState()
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
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
                          sx={{ minWidth: '70px' }}
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
          </TableContainer>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
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
            
            <Pagination
              count={Math.ceil(totalPages / rowsPerPage)}
              page={page + 1}
              onChange={handleChangePage}
              color="primary"
            />
          </Box>
        </Paper>
      )}
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Excluir Landing Page</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta landing page? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de QR Code */}
      <QRCodeDialog
        open={qrCodeDialogOpen}
        landingPage={selectedPage}
        onClose={handleCloseQRCodeDialog}
      />
    </Container>
  );
};

export default LandingPagesList;