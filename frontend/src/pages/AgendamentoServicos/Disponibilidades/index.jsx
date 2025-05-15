// Disponibilidades/index.jsx (refatorado)
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  IconButton,
  CircularProgress,
  Tooltip,
  Alert,
  useMediaQuery,
  useTheme,
  Button,
  LinearProgress,
  Fade,
  TextField,
  InputAdornment,
  Avatar,
  Badge,
  Chip,
  Collapse
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import {
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  FilterAlt as FilterIcon,
  Weekend as WeekendIcon,
  HourglassEmpty as HourglassEmptyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { toast } from '../../../helpers/toast';
import { api } from '../../../services/api';
import DisponibilidadeModal from './DisponibilidadeModal';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { DIAS_SEMANA } from '../constants';
import EmptyState from '../components/EmptyState';
import { debounce } from 'lodash';
import { ensureCompleteImageUrl } from '../../../utils/images';
import DisponibilidadeCard from '../components/DisponibilidadeCard';

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const Disponibilidades = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDays, setExpandedDays] = useState({});

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
    }, 500),
    []
  );

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/professionals', {
        params: { 
          active: true,
          searchParam: searchTerm
        }
      });
      
      // Tratamento robusto da resposta
      let professionalsList = [];
      if (Array.isArray(data)) {
        professionalsList = data;
      } else if (data && data.records && Array.isArray(data.records)) {
        professionalsList = data.records;
      } else if (data && typeof data === 'object') {
        professionalsList = [data];
      }
      
      setProfessionals(professionalsList);
      
      // Selecionar o primeiro profissional por padrão se não houver um selecionado
      if (professionalsList.length > 0 && !selectedProfessionalId) {
        setSelectedProfessionalId(professionalsList[0].id);
      } else if (professionalsList.length > 0 && selectedProfessionalId) {
        // Verifica se o profissional selecionado ainda existe na lista
        const profissionalAindaExiste = professionalsList.some(p => p.id === selectedProfessionalId);
        if (!profissionalAindaExiste) {
          setSelectedProfessionalId(professionalsList[0].id);
        }
      } else if (professionalsList.length === 0) {
        // Se não houver profissionais, limpa a seleção
        setSelectedProfessionalId(null);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  }, [selectedProfessionalId, searchTerm]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals, searchTerm]);

  const fetchAvailabilities = useCallback(async () => {
    if (!selectedProfessionalId) return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/professionals/${selectedProfessionalId}/availabilities`);
      
      let availabilitiesData = [];
      if (Array.isArray(data)) {
        availabilitiesData = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.records)) {
          availabilitiesData = data.records;
        } else if (Object.values(data).some(Array.isArray)) {
          const arrayProp = Object.entries(data).find(([_, value]) => Array.isArray(value));
          availabilitiesData = arrayProp ? arrayProp[1] : [];
        } else {
          availabilitiesData = [data];
        }
      } else {
        availabilitiesData = [];
      }
      
      setAvailabilities(availabilitiesData);
      
      // Inicializa o estado de expansão para cada dia da semana
      const initialExpanded = {};
      DIAS_SEMANA.forEach(day => {
        // Verifica se há disponibilidades para este dia
        const hasAvailabilities = availabilitiesData.some(a => a.weekday === day.value);
        // Expande automaticamente os dias que possuem disponibilidades
        initialExpanded[day.value] = hasAvailabilities;
      });
      setExpandedDays(initialExpanded);
    } catch (error) {
      console.error('Erro ao carregar disponibilidades:', error);
      toast.error('Erro ao carregar disponibilidades');
      setAvailabilities([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProfessionalId]);

  useEffect(() => {
    if (selectedProfessionalId) {
      fetchAvailabilities();
    }
  }, [selectedProfessionalId, fetchAvailabilities]);

  const handleChangeProfessional = (_, newValue) => {
    setSelectedProfessionalId(newValue);
  };

  const handleOpenModal = (availability = null) => {
    if (availability) {
      // Se não for um objeto completo de disponibilidade, apenas com weekday, cria um novo
      if (!availability.id) {
        const newAvailability = {
          weekday: availability.weekday,
          weekdayLabel: DIAS_SEMANA.find(d => d.value === availability.weekday)?.label || '',
          // Outros valores padrão poderiam vir aqui
        };
        setSelectedAvailability(newAvailability);
      } else {
        setSelectedAvailability(availability);
      }
    } else {
      setSelectedAvailability(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAvailability(null);
    setModalOpen(false);
    fetchAvailabilities();
  };

  const handleOpenConfirmDialog = (availability) => {
    setSelectedAvailability(availability);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleDeleteAvailability = async () => {
    if (!selectedAvailability || !selectedAvailability.id) {
      toast.error('Erro: Disponibilidade não identificada');
      setConfirmDialogOpen(false);
      return;
    }

    try {
      await api.delete(`/availabilities/${selectedAvailability.id}`);
      toast.success('Disponibilidade excluída com sucesso');
      fetchAvailabilities();
    } catch (error) {
      console.error('Erro ao excluir disponibilidade:', error);
      toast.error('Erro ao excluir disponibilidade');
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleToggleDay = (dayValue) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayValue]: !prev[dayValue]
    }));
  };

  const renderAvailabilitiesByDay = () => {
    return (
      <Grid container spacing={3}>
        {DIAS_SEMANA.map((day) => {
          const dayAvailabilities = availabilities.filter(a => a.weekday === day.value);
          const hasAvailabilities = dayAvailabilities.length > 0;
          const isExpanded = expandedDays[day.value];
          
          return (
            <Grid item xs={12} md={isTablet ? 12 : 6} lg={4} key={day.value}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: hasAvailabilities ? 'primary.lighter' : 'background.paper',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleToggleDay(day.value)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {hasAvailabilities ? (
                      <Badge 
                        badgeContent={dayAvailabilities.length} 
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <WeekendIcon color="primary" />
                      </Badge>
                    ) : (
                      <HourglassEmptyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    )}
                    <Typography variant="subtitle1" fontWeight="medium">
                      {day.label}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon fontSize="small" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal({ weekday: day.value, weekdayLabel: day.label });
                      }}
                      sx={{ 
                        mr: 1,
                        borderRadius: 8,
                        textTransform: 'none'
                      }}
                    >
                      Adicionar
                    </Button>
                    
                    {isExpanded ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </Box>
                </Box>
                
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box 
                    sx={{ 
                      p: 2,
                      minHeight: hasAvailabilities ? 'auto' : 100,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: hasAvailabilities ? 'flex-start' : 'center',
                      gap: 2
                    }}
                  >
                    {hasAvailabilities ? (
                      dayAvailabilities.map((availability, index) => (
                        <DisponibilidadeCard
                          key={availability.id}
                          availability={availability}
                          onEdit={handleOpenModal}
                          onDelete={handleOpenConfirmDialog}
                          animationDelay={index * 100}
                        />
                      ))
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        opacity: 0.7
                      }}>
                        <HourglassEmptyIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography color="text.secondary" align="center">
                          Nenhuma disponibilidade cadastrada
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <AnimatedBox style={fadeIn}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Buscar profissionais..."
          variant="outlined"
          size="small"
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
          disabled={!selectedProfessionalId}
          aria-label="Adicionar nova disponibilidade"
          sx={{ 
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: theme.shadows[3],
            padding: theme.spacing(1, 2),
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          Nova Disponibilidade
        </Button>
      </Box>

      <Paper 
        sx={{ 
          width: '100%', 
          mb: 3, 
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'
        }}
        elevation={2}
      >
        {loading && (
          <Box sx={{ width: '100%', position: 'absolute' }}>
            <LinearProgress color="primary" />
          </Box>
        )}
        
        <Tabs
          value={selectedProfessionalId || ''}
          onChange={handleChangeProfessional}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="profissionais para configuração de disponibilidade"
        >
          {professionals.map(professional => (
            <Tab 
              key={professional.id} 
              value={professional.id} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={ensureCompleteImageUrl(professional.profileImage)}
                    alt={professional.name}
                    sx={{
                      width: 28,
                      height: 28
                    }}
                  />
                  <Typography variant="body2" noWrap>
                    {professional.name}
                  </Typography>
                </Box>
              }
              aria-label={`Disponibilidades de ${professional.name}`}
            />
          ))}
        </Tabs>
      </Paper>

      {loading && availabilities.length === 0 && professionals.length > 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 8 }}>
          <CircularProgress />
        </Box>
      ) : professionals.length === 0 ? (
        <Fade in timeout={500}>
          <Box>
            <EmptyState 
              title="Nenhum profissional encontrado"
              description={
                searchTerm 
                  ? "Tente usar outros termos na busca" 
                  : "É necessário cadastrar profissionais antes de configurar as disponibilidades"
              }
              icon={<AccessTimeIcon sx={{ fontSize: 60 }} />}
              buttonText="Ir para Profissionais"
              onButtonClick={() => window.location.href = '#/agendamento/profissionais'}
            />
          </Box>
        </Fade>
      ) : selectedProfessionalId && (
        <Fade in timeout={500}>
          <Box>
            {renderAvailabilitiesByDay()}
          </Box>
        </Fade>
      )}

      {modalOpen && selectedProfessionalId && (
        <DisponibilidadeModal
          open={modalOpen}
          onClose={handleCloseModal}
          availability={selectedAvailability}
          professionalId={selectedProfessionalId}
        />
      )}

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleDeleteAvailability}
        title="Excluir Disponibilidade"
        message="Tem certeza que deseja excluir esta disponibilidade? Esta ação não pode ser desfeita."
        severity="error"
      />
    </AnimatedBox>
  );
};

export default Disponibilidades;