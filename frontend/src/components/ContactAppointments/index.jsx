import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper,
  Button,
  Collapse,
  IconButton,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from '@mui/material';
import { 
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarMonth as CalendarMonthIcon,
  VisibilityOutlined as VisibilityOutlinedIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { i18n } from '../../translate/i18n';
import { toast } from '../../helpers/toast';
import AgendamentoDetails from '../../pages/AgendamentoServicos/Agendamentos/AgendamentoDetails';

const ContactAppointments = ({ contactId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (contactId) {
      loadAppointments();
    }
  }, [contactId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/appointments', {
        params: { 
          contactId,
          // Buscar agendamentos dos últimos 30 dias e futuros
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
      
      // Ordena do mais recente para o mais antigo
      const sortedAppointments = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
        : [];
      
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      toast.error(i18n.t('contactAppointments.errors.load'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
    setDetailsModalOpen(false);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            py: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 1
            }
          }}
          onClick={toggleExpanded}
        >
          <Typography variant="subtitle1" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.primary.main,
            fontWeight: 'medium'
          }}>
            <CalendarMonthIcon sx={{ mr: 1, fontSize: 20 }} />
            {i18n.t('contactAppointments.title')} ({appointments.length})
          </Typography>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        {appointments.length === 0 ? (
          <Box 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: theme.palette.background.default,
              borderRadius: theme.shape.borderRadius,
              border: `1px dashed ${theme.palette.divider}`,
              minHeight: 100
            }}
          >
            <EventIcon sx={{ mb: 1, color: theme.palette.text.secondary, fontSize: 32 }} />
            <Typography variant="body2" color="textSecondary" align="center">
              {i18n.t('contactAppointments.noAppointments')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            maxHeight: 300, 
            overflowY: 'auto',
            pr: 1,
            ...theme.scrollbarStyles
          }}>
            {appointments.map((appointment) => (
              <Box 
                key={appointment.id} 
                sx={{ 
                  position: 'relative',
                  mb: 1,
                  '&:hover .view-button': {
                    opacity: 1
                  }
                }}
              >
                <AgendamentoDetails 
                  appointment={appointment} 
                  compact={true} 
                />
                
                <IconButton 
                  size="small" 
                  className="view-button"
                  onClick={() => handleOpenDetails(appointment)}
                  sx={{ 
                    position: 'absolute', 
                    right: 8, 
                    bottom: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText
                    }
                  }}
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Collapse>

      {/* Modal de Detalhes */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: 2
        }}>
          <Typography variant="h6">
            {i18n.t('contactAppointments.detailsTitle')}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedAppointment && (
            <AgendamentoDetails appointment={selectedAppointment} />
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDetails} 
            variant="contained"
            color="primary"
            sx={{ borderRadius: 8 }}
          >
            {i18n.t('contactAppointments.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContactAppointments;