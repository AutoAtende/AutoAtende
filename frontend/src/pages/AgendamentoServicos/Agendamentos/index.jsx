import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Fade,
  ButtonGroup,
  Button,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  ViewAgenda as ViewAgendaIcon,
  Close as CloseIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { debounce } from 'lodash';
import { api } from '../../../services/api';
import { toast } from '../../../helpers/toast';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import CalendarView from '../components/CalendarView';
import MobileListView from '../components/MobileListView';
import AgendamentoDetails from './AgendamentoDetails';
import AgendamentoModal from './AgendamentoModal';

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const Agendamentos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState(isMobile ? 'list' : 'calendar');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmDialogProps, setConfirmDialogProps] = useState({
    title: '',
    message: '',
    severity: 'warning'
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Efeito para definir a visualização baseada no tamanho da tela
  useEffect(() => {
    setView(isMobile ? 'list' : 'calendar');
  }, [isMobile]);

  // Formata a data para YYYY-MM-DD
  const formattedDate = useMemo(() => {
    return selectedDate.format('YYYY-MM-DD');
  }, [selectedDate]);

  // Busca os agendamentos
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Para visualização de calendário, busca o mês inteiro
      let startDate, endDate;

      if (view === 'calendar') {
        startDate = dayjs(selectedDate).startOf('month').format('YYYY-MM-DD');
        endDate = dayjs(selectedDate).endOf('month').format('YYYY-MM-DD');
      } else {
        // Para visualização de lista ou cards, busca apenas o dia selecionado
        startDate = formattedDate;
        endDate = formattedDate;
      }

      const { data } = await api.get('/appointments', {
        params: {
          startDate,
          endDate,
          status: statusFilter || undefined,
          searchParam: searchTerm,
          pageSize: 1000
        }
      });

      // Tratamento mais robusto para diferentes formatos de resposta
      let appointmentsData = [];

      if (Array.isArray(data)) {
        appointmentsData = data;
      } else if (data && Array.isArray(data.records)) {
        appointmentsData = data.records;
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Caso seja retornado um único objeto
        appointmentsData = [data];
      }

      setAppointments(appointmentsData);

    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      toast.error('Erro ao carregar agendamentos');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter, searchTerm, view, formattedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(dayjs(date));
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleOpenCreateModal = () => {
    setSelectedAppointment(null);
    setCreateModalOpen(true);
  };

  const handleOpenDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setDetailsModalOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handleOpenConfirmDialog = (action, appointment, props = {}) => {
    setSelectedAppointment(appointment);
    setConfirmAction(() => action);
    setConfirmDialogProps({
      title: props.title || 'Confirmar ação',
      message: props.message || 'Tem certeza que deseja realizar esta ação?',
      severity: props.severity || 'warning'
    });
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const handleConfirmDialogAction = async () => {
    if (confirmAction) {
      await confirmAction();
      handleCloseConfirmDialog();
    }
  };

  const handleAppointmentAction = (action, appointment) => {
    switch (action) {
      case 'confirm':
        updateAppointmentStatus(appointment, 'confirmed');
        break;
      case 'complete':
        updateAppointmentStatus(appointment, 'completed');
        break;
      case 'noshow':
        updateAppointmentStatus(appointment, 'no_show');
        break;
      case 'cancel':
        handleOpenConfirmDialog(
          () => updateAppointmentStatus(appointment, 'cancelled', 'Cancelado pelo administrador'),
          appointment,
          {
            title: 'Cancelar Agendamento',
            message: 'Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.',
            severity: 'error'
          }
        );
        break;
      default:
        break;
    }
  };

  const updateAppointmentStatus = async (appointment, status, cancellationReason = '') => {
    try {
      const data = { status };

      if (status === 'cancelled' && cancellationReason) {
        data.cancellationReason = cancellationReason;
      }

      await api.put(`/appointments/${appointment.id}`, data);

      setSnackbarMessage(`Agendamento ${status === 'confirmed' ? 'confirmado' :
        status === 'completed' ? 'concluído' :
          status === 'cancelled' ? 'cancelado' :
            status === 'no_show' ? 'marcado como não compareceu' : 'atualizado'} com sucesso`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      fetchAppointments();
    } catch (err) {
      console.error('Erro ao atualizar status do agendamento:', err);
      setSnackbarMessage('Erro ao atualizar status do agendamento');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <AnimatedBox style={fadeIn}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1, width: '100%' }}>
          <TextField
            placeholder="Buscar agendamentos..."
            variant="outlined"
            size="small"
            onChange={handleSearchChange}
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 250 },
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
              ) : null,
              'aria-label': 'Buscar agendamentos',
            }}
          />

          {!isMobile && (
            <ButtonGroup size="small">
              <Button
                variant={view === 'cards' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('cards')}
                startIcon={<ViewAgendaIcon />}
              >
                Cards
              </Button>
              <Button
                variant={view === 'calendar' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('calendar')}
                startIcon={<CalendarViewMonthIcon />}
              >
                Calendário
              </Button>
            </ButtonGroup>
          )}
        </Box>
      </Box>

      {loading && appointments.length === 0 ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress color="primary" />
        </Box>
      ) : appointments.length === 0 ? (
        <Fade in timeout={500}>
          <Box>
            <EmptyState
              title="Nenhum agendamento encontrado"
              description={
                statusFilter
                  ? `Não há agendamentos com status "${statusFilter}" para esta data`
                  : 'Não há agendamentos para esta data'
              }
              icon={<EventIcon sx={{ fontSize: 60 }} />}
            />
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={500}>
          <Box>
            {isMobile ? (
              // Visualização Mobile (Lista)
              <MobileListView
                appointments={appointments}
                loading={loading}
                onDateChange={handleDateChange}
                onAppointmentAction={handleAppointmentAction}
                selectedDate={selectedDate}
              />
            ) : view === 'calendar' ? (
              // Visualização Calendário (Desktop)
              <CalendarView
                appointments={appointments}
                loading={loading}
                onViewChange={handleViewChange}
                onDateChange={handleDateChange}
                onAppointmentClick={handleOpenDetailsModal}
                onAppointmentAction={handleAppointmentAction}
                selectedDate={selectedDate}
              />
            ) : (
              // Visualização Cards (Desktop - mantém o layout existente)
              // Aqui você pode manter o código atual da visualização em cards
              <div>
                {/* Mantenha o código existente para visualização em cards */}
              </div>
            )}
          </Box>
        </Fade>
      )}

      {/* Modal de Detalhes do Agendamento */}
      {detailsModalOpen && selectedAppointment && (
        <AgendamentoDetails
          open={detailsModalOpen}
          onClose={handleCloseModal}
          appointment={selectedAppointment}
        />
      )}

      {/* Modal de Criar/Editar Agendamento */}
      <AgendamentoModal
        open={createModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
        selectedDate={selectedDate.toDate()}
      />

      {/* Dialog de Confirmação */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDialogAction}
        title={confirmDialogProps.title}
        message={confirmDialogProps.message}
        severity={confirmDialogProps.severity}
      />

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AnimatedBox>
  );
};

export default Agendamentos;