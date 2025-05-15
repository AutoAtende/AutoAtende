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
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Button,
  LinearProgress,
  Fade,
  Pagination
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachMoney as AttachMoneyIcon,
  DesignServices as DesignServicesIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import { useSpring, animated } from 'react-spring';
import ServicoModal from './ServicoModal';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { api } from '../../../services/api';
import { toast } from '../../../helpers/toast';
import EmptyState from '../components/EmptyState';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const AnimatedBox = animated(Box);

const Servicos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
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

  const fetchServices = useCallback(async (searchParam = '') => {
    setLoading(true);
    try {
      console.log("Buscando serviços...");
      console.log("Parâmetros:", {
        searchParam,
        pageNumber: page,
        pageSize: itemsPerPage
      });
      
      const { data } = await api.get('/services', {
        params: { 
          searchParam,
          pageNumber: page,
          pageSize: itemsPerPage
        }
      });
      
      console.log("Resposta da API de serviços:", data);
      
      // Tratamento mais robusto para garantir que services seja sempre um array com profissionais
      let servicesData = [];
      let totalCount = 0;
      
      if (Array.isArray(data)) {
        servicesData = data;
        totalCount = data.length;
        console.log("Dados recebidos como array direto");
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.records)) {
          servicesData = data.records;
          totalCount = data.count || data.records.length;
          console.log("Dados recebidos como objeto com propriedade records");
        } else if (data.id && typeof data.id === 'number') {
          // Pode ser um objeto único
          servicesData = [data];
          totalCount = 1;
          console.log("Dados recebidos como objeto único");
        } else {
          // Tenta extrair um array de alguma propriedade
          for (const key in data) {
            if (Array.isArray(data[key])) {
              servicesData = data[key];
              totalCount = data[key].length;
              console.log(`Dados extraídos da propriedade ${key}`);
              break;
            }
          }
        }
      }
      
      // Processa cada serviço para garantir que o campo professionals exista
      servicesData = servicesData.map(service => ({
        ...service,
        professionals: Array.isArray(service.professionals) ? service.professionals : []
      }));
      
      console.log("Serviços processados:", servicesData);
      console.log("Total:", totalCount);
      
      setServices(servicesData);
      setCount(totalCount);
    } catch (err) {
      console.error('Erro detalhado ao carregar serviços:', err);
      toast.error('Erro ao carregar serviços');
      setServices([]); // Garante que não há dados antigos em caso de erro
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchServices(searchTerm);
  }, [fetchServices, searchTerm, page]);

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

  const handleOpenModal = (service = null) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setModalOpen(false);
    fetchServices(searchTerm);
  };

  const handleOpenConfirmDialog = (service) => {
    setSelectedService(service);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleDeleteService = async () => {
    if (!selectedService || !selectedService.id) {
      toast.error('Erro: Serviço não identificado');
      setConfirmDialogOpen(false);
      return;
    }

    try {
      await api.delete(`/services/${selectedService.id}`);
      toast.success('Serviço excluído com sucesso');
      fetchServices(searchTerm);
    } catch (err) {
      console.error('Erro ao excluir serviço:', err);
      toast.error('Erro ao excluir serviço');
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  // Adiciona logs para profissionais de cada serviço para debug
  useEffect(() => {
    if (services.length > 0) {
      console.log("Profissionais nos serviços:");
      services.forEach(service => {
        console.log(`Serviço: ${service.name}, Profissionais:`, service.professionals);
      });
    }
  }, [services]);

  // Renderização para dispositivos móveis
  const renderMobileView = () => {
    return (
      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} key={service.id}>
            <Card sx={{ borderRadius: 2, transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' } }} elevation={2} className="card-hover">
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: service.color || '#e0e0e0',
                        mr: 2,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                      aria-hidden="true"
                    />
                    <Box>
                      <Typography variant="subtitle1">{service.name || 'Serviço sem nome'}</Typography>
                      {service.description && (
                        <Typography variant="caption" color="text.secondary">
                          {service.description.length > 50
                            ? `${service.description.substring(0, 50)}...`
                            : service.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Chip
                    icon={service.active ? <CheckIcon /> : <CloseIcon />}
                    label={service.active ? "Ativo" : "Inativo"}
                    color={service.active ? "success" : "default"}
                    size="small"
                    sx={{ borderRadius: 16 }}
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {service.duration || 0} min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatCurrency(service.price)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                {Array.isArray(service.professionals) && service.professionals.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Profissionais:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {service.professionals.slice(0, 4).map((professional) => (
                        <Chip
                          key={professional.id}
                          label={professional.name}
                          size="small"
                          sx={{ borderRadius: 16 }}
                        />
                      ))}
                      {service.professionals.length > 4 && (
                        <Chip
                          label={`+${service.professionals.length - 4}`}
                          size="small"
                          sx={{ borderRadius: 16 }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenModal(service)}
                    aria-label={`Editar ${service.name}`}
                    sx={{ borderRadius: 8, textTransform: 'none' }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenConfirmDialog(service)}
                    aria-label={`Excluir ${service.name}`}
                    sx={{ borderRadius: 8, textTransform: 'none' }}
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
        <Table sx={{ minWidth: 650 }} size="medium" aria-label="tabela de serviços">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Serviço</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Duração</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Preço</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Profissionais</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id} hover sx={{ transition: 'all 0.2s ease', '&:hover': { backgroundColor: `${theme.palette.primary.lighter} !important` } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: service.color || '#e0e0e0',
                        mr: 2
                      }}
                      aria-hidden="true"
                    />
                    <Box>
                      <Typography variant="body2">{service.name || 'Serviço sem nome'}</Typography>
                      {service.description && (
                        <Typography variant="caption" color="textSecondary">
                          {service.description.length > 50
                            ? `${service.description.substring(0, 50)}...`
                            : service.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {service.duration || 0} min
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{formatCurrency(service.price)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Array.isArray(service.professionals) && service.professionals.length > 0 ? (
                      service.professionals.slice(0, 3).map((professional) => (
                        <Chip
                          key={professional.id}
                          label={professional.name}
                          size="small"
                          sx={{ borderRadius: 16 }}
                        />
                      ))
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Nenhum profissional associado
                      </Typography>
                    )}
                    {Array.isArray(service.professionals) && service.professionals.length > 3 && (
                      <Chip
                        label={`+${service.professionals.length - 3}`}
                        size="small"
                        sx={{ borderRadius: 16 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={service.active ? <CheckIcon /> : <CloseIcon />}
                    label={service.active ? "Ativo" : "Inativo"}
                    color={service.active ? "success" : "default"}
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
                      onClick={() => handleOpenModal(service)}
                      aria-label={`Editar ${service.name}`}
                      sx={{ borderRadius: 8, textTransform: 'none' }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenConfirmDialog(service)}
                      aria-label={`Excluir ${service.name}`}
                      sx={{ borderRadius: 8, textTransform: 'none' }}
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
          placeholder="Buscar serviços..."
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
            'aria-label': 'Buscar serviços',
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          aria-label="Adicionar novo serviço"
          sx={{ 
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: theme.shadows[3],
            padding: theme.spacing(1, 2),
            minWidth: { xs: '100%', sm: 'auto' }
          }}
        >
          Novo Serviço
        </Button>
      </Box>

      {loading && services.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 8 }}>
          <CircularProgress />
        </Box>
      ) : services.length === 0 ? (
        <Fade in timeout={500}>
          <Box>
            <EmptyState 
              title="Nenhum serviço encontrado"
              description={searchTerm ? 'Tente usar outros termos na busca' : 'Comece adicionando um novo serviço'}
              icon={<DesignServicesIcon sx={{ fontSize: 60 }} />}
              buttonText="Novo Serviço"
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

      <ServicoModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        service={selectedService} 
      />
      
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleDeleteService}
        title="Excluir Serviço"
        message="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
        severity="error"
      />
    </AnimatedBox>
  );
};

export default Servicos;