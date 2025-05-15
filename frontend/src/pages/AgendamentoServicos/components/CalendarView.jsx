// components/CalendarView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Grid, 
  Divider,
  Tooltip,
  useTheme,
  Badge,
  ButtonGroup,
  Button,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Chip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  ViewAgenda as ViewAgendaIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  ViewList as ViewListIcon,
  Today as TodayIcon,
  EventBusy as EventBusyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassTop as HourglassTopIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useSpring, animated } from 'react-spring';

import AgendamentoDetails from '../Agendamentos/AgendamentoDetails';

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const CalendarView = ({ 
  appointments, 
  loading, 
  onViewChange, 
  onDateChange,
  onAppointmentClick,
  onAppointmentAction,
  selectedDate
}) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(dayjs(selectedDate));
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(dayjs(selectedDate));
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Gera os dias do calendário para o mês atual
  useEffect(() => {
    const days = [];
    const firstDay = currentMonth.startOf('month');
    const daysInMonth = currentMonth.daysInMonth();
    
    // Adiciona dias do mês anterior para preencher a primeira semana
    const firstDayOfWeek = firstDay.day();
    if (firstDayOfWeek > 0) {
      const prevMonth = currentMonth.subtract(1, 'month');
      const daysInPrevMonth = prevMonth.daysInMonth();
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.unshift({
          date: prevMonth.date(daysInPrevMonth - i),
          isCurrentMonth: false
        });
      }
    }
    
    // Adiciona dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: currentMonth.date(i),
        isCurrentMonth: true
      });
    }
    
    // Adiciona dias do próximo mês para completar a última semana
    const lastDay = currentMonth.date(daysInMonth);
    const lastDayOfWeek = lastDay.day();
    
    if (lastDayOfWeek < 6) {
      const nextMonth = currentMonth.add(1, 'month');
      
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        days.push({
          date: nextMonth.date(i),
          isCurrentMonth: false
        });
      }
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  // Avança para o próximo mês
  const nextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  // Retorna para o mês anterior
  const prevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  // Ir para o mês atual
  const goToToday = () => {
    const today = dayjs();
    setCurrentMonth(today);
    setSelectedDay(today);
    onDateChange(today);
  };

  // Seleciona um dia e carrega os agendamentos
  const handleDayClick = (day) => {
    setSelectedDay(day.date);
    onDateChange(day.date);
  };

  // Abre o menu de opções para um agendamento
  const handleAppointmentMenu = (event, appointment) => {
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

  // Filtra os agendamentos para o dia selecionado
  const dailyAppointments = useMemo(() => {
    if (!appointments || !selectedDay) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = dayjs(appointment.scheduledAt);
      return appointmentDate.format('YYYY-MM-DD') === selectedDay.format('YYYY-MM-DD');
    });
  }, [appointments, selectedDay]);

  // Agrupa agendamentos por dia para o mês atual
  const appointmentsByDay = useMemo(() => {
    const result = {};
    
    appointments?.forEach(appointment => {
      const day = dayjs(appointment.scheduledAt).format('YYYY-MM-DD');
      
      if (!result[day]) {
        result[day] = [];
      }
      
      result[day].push(appointment);
    });
    
    return result;
  }, [appointments]);

  const getAppointmentStatusColor = (status) => {
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

  // Renderiza os dias da semana
  const renderWeekDays = () => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <Grid container>
        {weekDays.map((day, index) => (
          <Grid item xs key={index} sx={{ textAlign: 'center' }}>
            <Typography 
              variant="subtitle2" 
              fontWeight="bold"
              color={index === 0 || index === 6 ? 'error' : 'text.primary'}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderiza os dias do calendário
  const renderCalendarDays = () => {
    return (
      <Grid container>
        {calendarDays.map((day, index) => {
          const dayKey = day.date.format('YYYY-MM-DD');
          const isSelected = selectedDay && dayKey === selectedDay.format('YYYY-MM-DD');
          const isToday = day.date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
          const hasAppointments = appointmentsByDay[dayKey] && appointmentsByDay[dayKey].length > 0;
          
          return (
            <Grid item xs key={index}>
              <Box
                onClick={() => handleDayClick(day)}
                sx={{
                  height: 90,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1,
                  backgroundColor: isSelected
                    ? 'primary.lighter'
                    : day.isCurrentMonth
                      ? 'background.paper'
                      : 'action.hover',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'primary.lighter',
                    borderColor: 'primary.main',
                  },
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: isToday ? 'primary.main' : 'transparent',
                  color: isToday ? 'primary.contrastText' : 'text.primary',
                  opacity: day.isCurrentMonth ? 1 : 0.5,
                  fontWeight: hasAppointments ? 'bold' : 'normal',
                  mb: 0.5,
                  mx: 'auto'
                }}>
                  <Typography variant="body2">
                    {day.date.format('D')}
                  </Typography>
                </Box>
                
                {hasAppointments && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 0.5,
                    alignItems: 'center'
                  }}>
                    {appointmentsByDay[dayKey].length <= 2 
                      ? appointmentsByDay[dayKey].map((appointment, i) => (
                          <Tooltip 
                            key={i} 
                            title={`${appointment.service?.name} - ${dayjs(appointment.scheduledAt).format('HH:mm')}`}
                            arrow
                          >
                            <Box
                              sx={{
                                width: '90%',
                                height: 16,
                                borderRadius: 1,
                                backgroundColor: appointment.service?.color || getAppointmentStatusColor(appointment.status),
                                opacity: 0.8,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                              }}
                            />
                          </Tooltip>
                        ))
                      : (
                        <Badge 
                          badgeContent={appointmentsByDay[dayKey].length} 
                          color="primary"
                          sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                        >
                          <Box
                            sx={{
                              width: '90%',
                              height: 16,
                              borderRadius: 1,
                              backgroundColor: 'primary.main',
                              opacity: 0.8
                            }}
                          />
                        </Badge>
                      )
                    }
                  </Box>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Renderiza a lista de agendamentos para o dia selecionado
  const renderDayAppointments = () => {
    if (dailyAppointments.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3 
        }}>
          <EventBusyIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
          <Typography color="text.secondary">
            Não há agendamentos para este dia
          </Typography>
        </Box>
      );
    }
    
    // Ordena agendamentos por horário
    const sortedAppointments = [...dailyAppointments].sort((a, b) => {
      return dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt));
    });
    
    return (
      <Box sx={{ p: 2 }}>
        {sortedAppointments.map((appointment) => (
          <Paper
            key={appointment.id}
            elevation={1}
            sx={{
              p: 1.5,
              mb: 1.5,
              borderRadius: 1,
              cursor: 'pointer',
              borderLeft: '4px solid',
              borderColor: appointment.service?.color || getAppointmentStatusColor(appointment.status),
              '&:hover': {
                boxShadow: 3,
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => handleViewDetails(appointment)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2">
                  {dayjs(appointment.scheduledAt).format('HH:mm')} - {appointment.service?.name || 'Serviço não especificado'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliente: {appointment.contact?.name || 'Cliente não especificado'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profissional: {appointment.professional?.name || 'Profissional não especificado'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={
                    appointment.status === 'pending' ? 'Pendente' :
                    appointment.status === 'confirmed' ? 'Confirmado' :
                    appointment.status === 'completed' ? 'Concluído' :
                    appointment.status === 'cancelled' ? 'Cancelado' : 'Não Compareceu'
                  }
                  sx={{ 
                    backgroundColor: getAppointmentStatusColor(appointment.status),
                    color: '#fff',
                    mr: 1
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleAppointmentMenu(e, appointment)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <AnimatedBox style={fadeIn}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Cabeçalho do calendário */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={prevMonth} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 2 }}>
              {currentMonth.format('MMMM YYYY')}
            </Typography>
            <IconButton onClick={nextMonth} size="small">
              <ChevronRight />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={goToToday}
              sx={{ borderRadius: 4 }}
            >
              Hoje
            </Button>
            
            <ButtonGroup size="small" sx={{ ml: 2 }}>
              <Tooltip title="Visualização em Cards" arrow>
                <Button 
                  variant="outlined"
                  onClick={() => onViewChange('cards')}
                >
                  <ViewAgendaIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Visualização em Calendário" arrow>
                <Button 
                  variant="contained"
                  onClick={() => onViewChange('calendar')}
                >
                  <CalendarViewMonthIcon fontSize="small" />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Box>
        </Box>
        
        {/* Corpo do calendário */}
        <Box sx={{ height: '70vh', display: 'flex', overflow: 'hidden' }}>
          {/* Calendário */}
          <Box sx={{ flex: 2, p: 1, overflow: 'auto' }}>
            <Box sx={{ mb: 1 }}>
              {renderWeekDays()}
            </Box>
            {renderCalendarDays()}
          </Box>
          
          {/* Lista de agendamentos para o dia selecionado */}
          <Box sx={{ 
            flex: 1, 
            borderLeft: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              backgroundColor: 'primary.lighter'
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Agendamentos {selectedDay?.format('DD/MM/YYYY')}
              </Typography>
            </Box>
            <Box sx={{ overflow: 'auto', flex: 1 }}>
              {renderDayAppointments()}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Menu de opções do agendamento */}
      <Popper
        open={Boolean(menuAnchorEl)}
        anchorEl={menuAnchorEl}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper elevation={3} sx={{ mt: 1, width: 200 }}>
              <ClickAwayListener onClickAway={handleCloseMenu}>
                <MenuList autoFocusItem>
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
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* Modal de detalhes do agendamento */}
      {selectedAppointment && (
        <AgendamentoDetails
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          appointment={selectedAppointment}
        />
      )}
    </AnimatedBox>
  );
};

export default CalendarView;