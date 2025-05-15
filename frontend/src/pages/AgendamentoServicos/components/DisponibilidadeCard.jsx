import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Chip, 
  Tooltip,
  useTheme,
  Divider
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestaurantMenu as RestaurantMenuIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const DisponibilidadeCard = ({ 
  availability, 
  onEdit, 
  onDelete,
  animationDelay = 0
}) => {
  const theme = useTheme();
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: animationDelay,
    config: { tension: 280, friction: 60 }
  });

  return (
    <AnimatedBox style={fadeIn}>
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box 
          sx={{ 
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: availability.active ? 'primary.lighter' : 'action.disabledBackground',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="medium">
              {availability.startTime} - {availability.endTime}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!availability.active && (
              <Chip 
                label="Inativo" 
                size="small" 
                color="default"
              />
            )}
            
            <Tooltip title="Editar disponibilidade" arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(availability)}
                sx={{ 
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'primary.lighter' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Excluir disponibilidade" arrow>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(availability)}
                sx={{ 
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'error.lighter' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body2">
            Duração dos slots: <strong>{availability.slotDuration} minutos</strong>
          </Typography>
          
          {availability.startLunchTime && availability.endLunchTime && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: 'background.default'
            }}>
              <RestaurantMenuIcon fontSize="small" sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="body2">
                Intervalo: <strong>{availability.startLunchTime} - {availability.endLunchTime}</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </AnimatedBox>
  );
};

DisponibilidadeCard.propTypes = {
  availability: PropTypes.shape({
    id: PropTypes.number,
    weekday: PropTypes.number,
    weekdayLabel: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    startLunchTime: PropTypes.string,
    endLunchTime: PropTypes.string,
    slotDuration: PropTypes.number,
    active: PropTypes.bool
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  animationDelay: PropTypes.number
};

export default DisponibilidadeCard;