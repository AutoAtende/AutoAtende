import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  InfoOutlined,
  PeopleAlt
} from '@mui/icons-material';
import BrazilMap from './BrazilMap';

const AnimatedTotal = ({ total }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: total,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 }
  });

  return (
    <animated.div>
      {number.to(n => Math.floor(n).toLocaleString())}
    </animated.div>
  );
};

const ContactsMap = ({ metrics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hoveredState, setHoveredState] = useState(null);

  useEffect(() => {
    console.log('ContactsMap received metrics:', metrics);
  }, [metrics]);

  const getStateColor = (stateCode) => {
    if (!metrics?.contactMetrics?.byState) {
      return theme.palette.grey[200];
    }
  
    const stateData = metrics.contactMetrics.byState[stateCode];
    if (!stateData || !stateData.count) {
      return theme.palette.grey[200];
    }
  
    const allCounts = Object.values(metrics.contactMetrics.byState)
      .map(state => state.count || 0)
      .filter(count => count > 0);
    
    const maxCount = Math.max(...allCounts);
    if (maxCount === 0) return theme.palette.grey[200];
    
    const intensity = Math.pow(stateData.count / maxCount, 0.5);
    const minIntensity = 0.4;
    const maxIntensity = 0.9;
    const calculatedIntensity = minIntensity + (intensity * (maxIntensity - minIntensity));
    
    return `rgba(25, 118, 210, ${calculatedIntensity})`;
  };

  if (!metrics || !metrics.contactMetrics) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }}>
          Carregando dados do mapa...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 3, 
        position: 'relative',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.01)'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <PeopleAlt sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" color="primary">
            Distribuição de Contatos
          </Typography>
        </Box>
        <Tooltip title="Visualização da distribuição geográfica dos contatos">
          <IconButton size="small">
            <InfoOutlined />
          </IconButton>
        </Tooltip>
      </Box>

      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          p: 2,
          bgcolor: theme.palette.background.default,
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <Typography variant="h5" component="div">
          Total de Contatos: {' '}
          <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
            <AnimatedTotal total={metrics.contactMetrics.total || 0} />
          </Box>
        </Typography>
      </Box>

      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: isMobile ? '300px' : '400px'
        }}
      >
        <BrazilMap 
          contactMetrics={metrics.contactMetrics}
          getStateColor={getStateColor}
          onStateHover={setHoveredState}
          hoveredState={hoveredState}
        />
      </Box>

      <Box 
        sx={{ 
          mt: 2,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 2,
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 20,
              height: 20,
              backgroundColor: theme.palette.grey[200],
              borderRadius: '4px',
              border: `1px solid ${theme.palette.divider}`
            }}
          />
          <Typography variant="caption">Sem contatos</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 20,
              height: 20,
              background: `linear-gradient(to right, rgba(25, 118, 210, 0.4), rgba(25, 118, 210, 0.9))`,
              borderRadius: '4px',
              border: `1px solid ${theme.palette.divider}`
            }}
          />
          <Typography variant="caption">Concentração de contatos</Typography>
        </Box>
      </Box>

      {hoveredState && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            zIndex: 1000
          }}
        >
          <Typography variant="subtitle2">
            {hoveredState.name}
          </Typography>
          <Typography variant="h6">
            {hoveredState.count.toLocaleString()} contatos
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ContactsMap;