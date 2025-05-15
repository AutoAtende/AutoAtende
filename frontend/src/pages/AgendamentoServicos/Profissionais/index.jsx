import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  TextField, 
  InputAdornment,
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Button,
  LinearProgress,
  Fade,
  Pagination
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import ProfissionalModal from './ProfissionalModal';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { api } from '../../../services/api';
import { toast } from '../../../helpers/toast';
import '../AgendamentoStyles.css';
import EmptyState from '../components/EmptyState';
import { ensureCompleteImageUrl } from '../../../utils/images';
// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const Profissionais = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const itemsPerPage = 20;

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  const fetchProfessionals = useCallback(async (searchParam = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/professionals', {
        params: { 
          searchParam,
          pageNumber: page,
          pageSize: itemsPerPage
        }
      });
      
      // Tratamento mais robusto da resposta da API
      let professionalsData = [];
      if (data && data.records && Array.isArray(data.records)) {
        professionalsData = data.records;
      } else if (Array.isArray(data)) {
        professionalsData = data;
      }
      
      setProfessionals(professionalsData);
      setCount(data.count || professionalsData.length || 0);
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
      toast.error('Erro ao carregar profissionais');
      setProfessionals([]); // Garante que não há dados antigos em caso de erro
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProfessionals(searchTerm);
  }, [fetchProfessionals, searchTerm, page]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(1); // Volta para a primeira página quando buscar
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleOpenModal = (professional = null) => {
    setSelectedProfessional(professional);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProfessional(null);
    setModalOpen(false);
    fetchProfessionals(searchTerm);
  };

  const handleOpenConfirmDialog = (professional) => {
    setSelectedProfessional(professional);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleDeleteProfessional = async () => {
    if (!selectedProfessional || !selectedProfessional.id) {
      toast.error('Erro: Profissional não identificado');
      setConfirmDialogOpen(false);
      return;
    }

    try {
      await api.delete(`/professionals/${selectedProfessional.id}`);
      toast.success('Profissional excluído com sucesso');
      fetchProfessionals(searchTerm);
    } catch (err) {
      console.error('Erro ao excluir profissional:', err);
      toast.error('Erro ao excluir profissional');
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  // Renderização para dispositivos móveis
  const renderMobileView = () => {
    return (
      <Grid container spacing={2}>
        {professionals.map((professional) => (
          <Grid item xs={12} sm={6} key={professional.id}>
            <Card sx={{ 
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }} 
              elevation={2}
              className="card-hover"
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      src={professional.profileImage}
                      alt={professional.name || 'Profissional'}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">{professional.name || 'Sem nome'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {professional.email || professional.phone || 'Sem contato'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip
                    icon={professional.active ? <CheckIcon /> : <CloseIcon />}
                    label={professional.active ? "Ativo" : "Inativo"}
                    color={professional.active ? "success" : "default"}
                    size="small"
                    sx={{ borderRadius: 16 }}
                  />
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {professional.email || "-"}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Telefone:</strong> {professional.phone || "-"}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Serviços:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {professional.services && professional.services.length > 0 ? (
                      professional.services.map((service) => (
                        <Chip
                          key={service.id}
                          label={service.name}
                          size="small"
                          sx={{
                            backgroundColor: service.color || '#f0f0f0',
                            color: service.color ? '#fff' : 'text.primary',
                            borderRadius: 16
                          }}
                        />
                      ))
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Nenhum serviço associado
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenModal(professional)}
                    aria-label={`Editar ${professional.name}`}
                    sx={{ 
                      borderRadius: 8,
                      textTransform: 'none'
                    }}
                  >
                    Editar
                  </Button>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenConfirmDialog(professional)}
                    aria-label={`Excluir ${professional.name}`}
                    sx={{ 
                      borderRadius: 8,
                      textTransform: 'none'
                    }}
                  >
                    Excluir
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderização para desktop
  const renderDesktopView = () => {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }} elevation={2}>
        <Table sx={{ minWidth: 650 }} size="medium" aria-label="tabela de profissionais">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Profissional
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                E-mail
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Telefone
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Serviços
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {professionals.map((professional) => (
              <TableRow 
                key={professional.id} 
                hover 
                className="table-row-hover"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.lighter} !important`
                  }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={ensureCompleteImageUrl(professional.profileImage)}
                      alt={professional.name || 'Profissional'}
                      sx={{ mr: 2, width: 40, height: 40 }}
                    />
                    <Typography variant="body2">{professional.name || 'Sem nome'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{professional.email || "-"}</TableCell>
                <TableCell>{professional.phone || "-"}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {professional.services && professional.services.length > 0 ? (
                      professional.services.slice(0, 3).map((service) => (
                        <Chip
                          key={service.id}
                          label={service.name}
                          size="small"
                          sx={{
                            backgroundColor: service.color || '#f0f0f0',
                            color: service.color ? '#fff' : 'text.primary',
                            borderRadius: 16
                          }}
                        />
                      ))
                    ) : (
                      <Typography color="textSecondary" variant="body2">
                        Nenhum serviço associado
                      </Typography>
                    )}
                    {professional.services && professional.services.length > 3 && (
                      <Chip
                        label={`+${professional.services.length - 3}`}
                        size="small"
                        sx={{ borderRadius: 16 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={professional.active ? <CheckIcon /> : <CloseIcon />}
                    label={professional.active ? "Ativo" : "Inativo"}
                    color={professional.active ? "success" : "default"}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 16 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenModal(professional)}
                      aria-label={`Editar ${professional.name}`}
                      sx={{ 
                        borderRadius: 8,
                        textTransform: 'none'
                      }}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenConfirmDialog(professional)}
                      aria-label={`Excluir ${professional.name}`}
                      sx={{ 
                        borderRadius: 8,
                        textTransform: 'none'
                      }}
                    >
                      Excluir
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <AnimatedBox style={fadeIn}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Buscar profissionais..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ 
            flex: 1,
            minWidth: { xs: '100%', sm: 300, md: 350 },
            maxWidth: { sm: 500 },
            backgroundColor: 'background.paper',
            borderRadius: 1
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => debouncedSearch('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : (
              <InputAdornment position="end">
                <IconButton size="small">
                  <FilterIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            'aria-label': 'Buscar profissionais',
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          aria-label="Adicionar novo profissional"
          sx={{ 
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: theme.shadows[3],
            padding: theme.spacing(1, 2),
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          Novo Profissional
        </Button>
      </Box>

      {loading && professionals.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 8 }}>
          <CircularProgress />
        </Box>
      ) : professionals.length === 0 ? (
        <Fade in timeout={500}>
          <Box>
            <EmptyState 
              title="Nenhum profissional encontrado"
              description={searchTerm ? 'Tente usar outros termos na busca' : 'Comece adicionando um novo profissional'}
              icon={<PersonIcon sx={{ fontSize: 60 }} />}
              buttonText="Novo Profissional"
              onButtonClick={() => handleOpenModal()}
            />
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={500}>
          <Box>
            {isMobile ? renderMobileView() : renderDesktopView()}
            
            {count > itemsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <Pagination 
                  count={Math.ceil(count / itemsPerPage)} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        </Fade>
      )}

      <ProfissionalModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        professional={selectedProfessional} 
      />
      
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleDeleteProfessional}
        title="Excluir Profissional"
        message="Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita."
        severity="error"
      />
    </AnimatedBox>
  );
};

export default Profissionais;