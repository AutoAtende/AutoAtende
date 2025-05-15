import React from 'react';
import { 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  Divider, 
  Paper, 
  Grid,
  Stack,
  useTheme
} from '@mui/material';
import { 
  Event as EventIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassTop as HourglassTopIcon,
  EventBusy as EventBusyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { i18n } from '../../../translate/i18n';

// Mapas para labels e ícones de status
const STATUS_LABELS = {
  'pending': 'Pendente',
  'confirmed': 'Confirmado',
  'completed': 'Concluído',
  'cancelled': 'Cancelado',
  'noshow': 'Não Compareceu'
};

const STATUS_ICONS = {
  'pending': <HourglassTopIcon />,
  'confirmed': <CheckIcon />,
  'completed': <CheckCircleIcon />,
  'cancelled': <CancelIcon />,
  'noshow': <EventBusyIcon />
};

const STATUS_COLORS = {
  'pending': '#FFA000',  // Âmbar
  'confirmed': '#4CAF50', // Verde
  'completed': '#2196F3', // Azul
  'cancelled': '#F44336',  // Vermelho
  'noshow': '#9E9E9E'      // Cinza
};

// Esse componente pode ser usado em vários contextos
const AgendamentoDetails = ({ appointment, simplified = false, compact = false }) => {
  const theme = useTheme();
  
  if (!appointment) return null;
  
  const formattedDate = dayjs(appointment.scheduledAt).format('DD/MM/YYYY');
  const formattedTime = dayjs(appointment.scheduledAt).format('HH:mm');
  const status = appointment.status || 'pending';
  
  // Versão compacta (para listagens)
  if (compact) {
    return (
      <Box 
        sx={{ 
          p: 1.5, 
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          mb: 1,
          position: 'relative',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderColor: theme.palette.primary.main,
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '4px', 
            height: '100%', 
            backgroundColor: STATUS_COLORS[status],
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4
          }} 
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {formattedDate} - {formattedTime}
          </Typography>
          <Chip 
            size="small"
            icon={STATUS_ICONS[status]} 
            label={STATUS_LABELS[status]}
            sx={{ 
              backgroundColor: STATUS_COLORS[status] + '20',
              color: STATUS_COLORS[status],
              fontWeight: 'medium',
              fontSize: '0.7rem'
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          <strong>{i18n.t("agendamentoDetails.service")}:</strong> {appointment.service?.name || '-'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          <strong>{i18n.t("agendamentoDetails.professional")}:</strong> {appointment.professional?.name || '-'}
        </Typography>
        
        {appointment.duration && (
          <Typography variant="body2" color="text.secondary">
            <strong>{i18n.t("agendamentoDetails.duration")}:</strong> {appointment.duration} min
          </Typography>
        )}
      </Box>
    );
  }
  
  // Versão simplificada (para exibição em cards ou outros componentes)
  if (simplified) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '4px', 
            height: '100%', 
            backgroundColor: STATUS_COLORS[status] 
          }} 
        />
        
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              {i18n.t("agendamentoDetails.title")}
            </Typography>
            
            <Chip 
              icon={STATUS_ICONS[status]} 
              label={STATUS_LABELS[status]}
              size="small"
              sx={{ 
                backgroundColor: STATUS_COLORS[status],
                color: '#fff',
                fontWeight: 'medium'
              }}
            />
          </Box>
          
          <Divider />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimerIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body1">
              <strong>{formattedDate}</strong> às <strong>{formattedTime}</strong>
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body1">
              <strong>{i18n.t("agendamentoDetails.service")}:</strong> {appointment.service?.name || '-'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body1">
              <strong>{i18n.t("agendamentoDetails.professional")}:</strong> {appointment.professional?.name || '-'}
            </Typography>
          </Box>
          
          {appointment.notes && (
            <Box sx={{ 
              mt: 1, 
              p: 1, 
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
              border: `1px dashed ${theme.palette.divider}`
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "{appointment.notes}"
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    );
  }

  // Versão completa (para modal ou detalhamento)
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          {i18n.t("agendamentoDetails.title")}
        </Typography>
        <Chip 
          icon={STATUS_ICONS[status]} 
          label={STATUS_LABELS[status]}
          sx={{ 
            backgroundColor: STATUS_COLORS[status],
            color: '#fff',
            fontWeight: 'bold'
          }}
        />
      </Box>
      
      <Grid container spacing={3}>
        {/* Dados do Agendamento */}
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
              height: '100%',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: theme.palette.primary.main,
              fontWeight: 'bold'
            }}>
              <TimerIcon sx={{ mr: 1 }} /> 
              {i18n.t("agendamentoDetails.appointmentData")}
            </Typography>
            
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {i18n.t("agendamentoDetails.date")}:
                </Typography>
                <Typography variant="body1">
                  {formattedDate}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {i18n.t("agendamentoDetails.time")}:
                </Typography>
                <Typography variant="body1">
                  {formattedTime}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {i18n.t("agendamentoDetails.duration")}:
                </Typography>
                <Typography variant="body1">
                  {appointment.duration || 0} {i18n.t("agendamentoDetails.minutes")}
                </Typography>
              </Box>
              
              {appointment.cancellationReason && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {i18n.t("agendamentoDetails.cancellationReason")}:
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    {appointment.cancellationReason}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
        
        {/* Dados do Serviço e Profissional */}
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
              height: '100%',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: theme.palette.primary.main,
              fontWeight: 'bold'
            }}>
              <BusinessIcon sx={{ mr: 1 }} /> 
              {i18n.t("agendamentoDetails.serviceAndProfessional")}
            </Typography>
            
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {i18n.t("agendamentoDetails.service")}:
                </Typography>
                <Typography variant="body1">
                  {appointment.service?.name || i18n.t("agendamentoDetails.notSpecified")}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {i18n.t("agendamentoDetails.professional")}:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {appointment.professional?.profileImage && (
                    <Avatar 
                      src={appointment.professional.profileImage} 
                      alt={appointment.professional?.name || i18n.t("agendamentoDetails.professional")}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                  )}
                  <Typography variant="body1">
                    {appointment.professional?.name || i18n.t("agendamentoDetails.notSpecified")}
                  </Typography>
                </Box>
              </Box>
              
              {appointment.service?.price && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {i18n.t("agendamentoDetails.price")}:
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                    R$ {parseFloat(appointment.service.price).toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
        
        {/* Observações */}
        {(appointment.notes || appointment.customerNotes) && (
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.primary.main,
                fontWeight: 'bold'
              }}>
                <NotesIcon sx={{ mr: 1 }} /> 
                {i18n.t("agendamentoDetails.notes")}
              </Typography>
              
              {appointment.notes && (
                <Box sx={{ mb: appointment.customerNotes ? 2 : 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {i18n.t("agendamentoDetails.staffNotes")}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    paragraph 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 1,
                      border: '1px dashed rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {appointment.notes}
                  </Typography>
                </Box>
              )}
              
              {appointment.customerNotes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {i18n.t("agendamentoDetails.customerNotes")}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    paragraph
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 1,
                      border: '1px dashed rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {appointment.customerNotes}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
        
        {/* Ticket vinculado */}
        {appointment.ticketId && (
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.primary.main,
                fontWeight: 'bold'
              }}>
                <InfoIcon sx={{ mr: 1 }} /> 
                {i18n.t("agendamentoDetails.linkedTicket")}
              </Typography>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {i18n.t("agendamentoDetails.ticketId")}:
                </Typography>
                <Typography variant="body1">
                  #{appointment.ticketId}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AgendamentoDetails;