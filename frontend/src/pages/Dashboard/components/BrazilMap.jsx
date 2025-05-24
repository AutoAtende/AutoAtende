import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// Usar os statePathData e stateNames já existentes do arquivo original
// (não incluídos aqui para economizar espaço)
import { statePathData, stateNames } from './data/BrazilMapData'; // Arquivo separado com os dados

const MapContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const MapWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  minHeight: '350px',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));

const LegendContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1)
  }
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.8rem',
  color: theme.palette.text.secondary
}));

const ColorBox = styled(Box)(({ theme, bgcolor }) => ({
  width: 12,
  height: 12,
  backgroundColor: bgcolor,
  marginRight: theme.spacing(0.5),
  borderRadius: 2
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1)
  }
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center'
}));

const BrazilMap = ({ contactMetrics, title = "Distribuição de Contatos por Estado" }) => {
  const theme = useTheme();

  // Calcular estatísticas e cores dos estados
  const { stateColors, maxContacts, totalContacts, topStates } = useMemo(() => {
    if (!contactMetrics?.byState) {
      return { 
        stateColors: {}, 
        maxContacts: 0, 
        totalContacts: 0, 
        topStates: [] 
      };
    }

    const states = Object.entries(contactMetrics.byState);
    const maxValue = Math.max(...states.map(([_, data]) => data.count));
    const total = states.reduce((sum, [_, data]) => sum + data.count, 0);

    // Calcular cores baseadas na intensidade
    const colors = {};
    states.forEach(([stateCode, data]) => {
      if (data.count === 0) {
        colors[stateCode] = theme.palette.grey[200];
      } else {
        const intensity = data.count / maxValue;
        const alpha = 0.3 + (intensity * 0.7); // Entre 0.3 e 1.0
        colors[stateCode] = `rgba(25, 118, 210, ${alpha})`;
      }
    });

    // Top 3 estados
    const sortedStates = states
      .filter(([_, data]) => data.count > 0)
      .sort(([_, a], [__, b]) => b.count - a.count)
      .slice(0, 3);

    return {
      stateColors: colors,
      maxContacts: maxValue,
      totalContacts: total,
      topStates: sortedStates
    };
  }, [contactMetrics, theme]);

  if (!contactMetrics?.byState) {
    return (
      <MapContainer>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Nenhum dado de contatos por estado disponível
        </Typography>
      </MapContainer>
    );
  }

  return (
    <MapContainer>
      <MapWrapper>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 900"
          style={{ 
            width: '100%',
            height: '100%',
            maxHeight: '400px'
          }}
        >
          <g transform="translate(50,30) scale(1.1)">
            {Object.entries(statePathData).map(([stateCode, pathD]) => {
              const stateData = contactMetrics.byState[stateCode];
              const stateCount = stateData?.count || 0;
              const stateName = stateNames[stateCode];
              const fillColor = stateColors[stateCode] || theme.palette.grey[200];
              
              return (
                <Tooltip
                  key={stateCode}
                  title={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {stateName}
                      </Typography>
                      <Typography variant="body2">
                        {stateCount.toLocaleString()} contatos
                      </Typography>
                      {totalContacts > 0 && (
                        <Typography variant="caption">
                          {((stateCount / totalContacts) * 100).toFixed(1)}% do total
                        </Typography>
                      )}
                    </Box>
                  }
                  placement="top"
                  arrow
                >
                  <path
                    id={stateCode.toLowerCase()}
                    d={pathD}
                    fill={fillColor}
                    stroke={theme.palette.grey[400]}
                    strokeWidth="0.8"
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = 'brightness(0.85)';
                      e.target.style.strokeWidth = '1.5';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'brightness(1)';
                      e.target.style.strokeWidth = '0.8';
                    }}
                  />
                </Tooltip>
              );
            })}
          </g>
        </svg>
      </MapWrapper>

      {/* Legenda */}
      <LegendContainer>
        <LegendItem>
          <ColorBox bgcolor={theme.palette.grey[200]} />
          <Typography variant="caption">Sem contatos</Typography>
        </LegendItem>
        <LegendItem>
          <ColorBox bgcolor="rgba(25, 118, 210, 0.3)" />
          <Typography variant="caption">Poucos contatos</Typography>
        </LegendItem>
        <LegendItem>
          <ColorBox bgcolor="rgba(25, 118, 210, 0.7)" />
          <Typography variant="caption">Muitos contatos</Typography>
        </LegendItem>
        <LegendItem>
          <ColorBox bgcolor="rgba(25, 118, 210, 1)" />
          <Typography variant="caption">Máximo de contatos</Typography>
        </LegendItem>
      </LegendContainer>

      {/* Estatísticas */}
      <StatsContainer>
        <StatItem>
          <Typography variant="h6" color="primary">
            {totalContacts.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total de Contatos
          </Typography>
        </StatItem>
        
        {topStates.length > 0 && (
          <StatItem>
            <Typography variant="h6" color="primary">
              {stateNames[topStates[0][0]]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Estado com Mais Contatos ({topStates[0][1].count.toLocaleString()})
            </Typography>
          </StatItem>
        )}
        
        <StatItem>
          <Typography variant="h6" color="primary">
            {Object.values(contactMetrics.byState).filter(state => state.count > 0).length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Estados Ativos
          </Typography>
        </StatItem>
      </StatsContainer>
    </MapContainer>
  );
};

export default BrazilMap;