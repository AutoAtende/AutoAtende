import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  useTheme,
  Paper,
  Button,
  Grid
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassTop as HourglassTopIcon,
  EventBusy as EventBusyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Event as EventIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useSpring, animated } from 'react-spring';

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const MobileListView = ({ 
  appointments, 
  loading, 
  onDateChange,
  onAppointmentAction,
  selectedDate
}) => {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Abre o menu de opções para um agendamento
  const handleOpenMenu = (event, appointment) => {
    event.stopPropagation();
    setSelectedAppointment(appointment);
    setMenuAnchorEl(event.currentTarget);
  };

  // Fecha o menu de opções
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // Exibe os detalhes de um agendamento
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
    handleCloseMenu();
  };

  // Ações do menu de opções
  const handleAppointmentAction = (action) => {
    if (selectedAppointment) {
      onAppointmentAction(action, selectedAppointment);
    }
    handleCloseMenu();
  };

  // Função para agrupar agendamentos por data
  const appointmentsByDate = React.useMemo(() => {
    const groupedData = {};
    
    appointments.forEach(appointment => {
      const dateStr = dayjs(appointment.scheduledAt).format('YYYY-MM-DD');
      
      if (!groupedData[dateStr]) {
        groupedData[dateStr] = [];
      }
      
      groupedData[dateStr].push(appointment);
    });
    
    // Ordena as datas
    return Object.keys(groupedData)
      .sort((a, b) => dayjs(a).diff(dayjs(b)))
      .map(date => ({
        date,
        dateFormatted: dayjs(date).format('DD/MM/YYYY'),
        isToday: dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
        appointments: groupedData[date].sort((a, b) => 
          dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt))
        )
      }));
  }, [appointments]);

  // Retorna a cor baseada no status do agendamento
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'confirmed':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.info.main;
      case 'cancelled':
        return theme.palette.error.main;
      case 'noshow':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  // Status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'noshow': return 'Não Compareceu';
      default: return 'Desconhecido';
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <HourglassTopIcon fontSize="small" />;
      case 'confirmed': return <CheckCircleIcon fontSize="small" />;
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      case 'noshow': return <EventBusyIcon fontSize="small" />;
      default: return <HourglassTopIcon fontSize="small" />;
    }
  };

  return (
    <AnimatedBox style={fadeIn}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon sx={{ mr: 1 }} />
          Agendamentos
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EventIcon />}
            onClick={() => onDateChange(dayjs())}
          >
            Hoje
          </Button>
        </Box>
      </Box>
      
      {appointmentsByDate.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <EventBusyIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
          <Typography color="text.secondary" align="center">
            Não há agendamentos disponíveis
          </Typography>
        </Paper>
      ) : (
        <List sx={{ p: 0 }}>
          {appointmentsByDate.map((group) => (
            <Paper 
              key={group.date} 
              elevation={1} 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                overflow: 'hidden',
                border: group.isToday ? `1px solid ${theme.palette.primary.main}` : 'none'
              }}
            >
              <Box 
                sx={{ 
                  p: 1.5, 
                  backgroundColor: group.isToday ? 'primary.lighter' : 'background.default',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                  {group.isToday ? "Hoje" : group.dateFormatted}
                  <Chip 
                    label={group.appointments.length}
                    size="small"
                    color={group.isToday ? "primary" : "default"}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              
              <List disablePadding>
                {group.appointments.map((appointment) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem
                      button
                      onClick={() => handleToggleExpand(appointment.id)}
                      sx={{
                        borderLeft: '4px solid',
                        borderColor: appointment.service?.color || getStatusColor(appointment.status)
                      }}
                    >
                      <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" />
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                              {dayjs(appointment.scheduledAt).format('HH:mm')} - {appointment.service?.name || 'Sem serviço'}
                            </Typography>
                            <Box>
                              <Chip
                                size="small"
                                icon={getStatusIcon(appointment.status)}
                                label={getStatusLabel(appointment.status)}
                                sx={{ 
                                  backgroundColor: getStatusColor(appointment.status),
                                  color: '#fff',
                                  mr: 1
                                }}
                              />
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={(e) => handleOpenMenu(e, appointment)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'text-bottom' }} />
                            {appointment.contact?.name || 'Cliente não especificado'}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {expandedId === appointment.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Box>
                    </ListItem>
                    <Collapse in={expandedId === appointment.id} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Profissional:
                            </Typography>
                            <Typography variant="body2">
                              {appointment.professional?.name || 'Não especificado'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Duração:
                            </Typography>
                            <Typography variant="body2">
                              {appointment.duration || 0} minutos
                            </Typography>
                          </Grid>
                          {appointment.notes && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Observações:
                              </Typography>
                              <Typography variant="body2">
                                {appointment.notes}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            Ver detalhes
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          ))}
        </List>
      )}

      {/* Menu de opções do agendamento */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleViewDetails(selectedAppointment)}>
          <EventIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalhes
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAppointmentAction('confirm')}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
          Confirmar
        </MenuItem>
        <MenuItem onClick={() => handleAppointmentAction('complete')}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
          Concluir
        </MenuItem>
        <MenuItem onClick={() => handleAppointmentAction('cancel')}>
          <CancelIcon fontSize="small" sx={{ mr: 1, color: theme.palette.error.main }} />
          Cancelar
        </MenuItem>
        <MenuItem onClick={() => handleAppointmentAction('noshow')}>
          <HourglassTopIcon fontSize="small" sx={{ mr: 1, color: theme.palette.grey[500] }} />
          Não compareceu
        </MenuItem>
      </Menu>
    </AnimatedBox>
  );
};

export default MobileListView;