import React from 'react';
import { useSpring, animated, config } from 'react-spring';
import { Card, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const AnimatedKPI = ({ 
  icon: Icon, 
  title, 
  value, 
  color = 'primary',
  trend,
  suffix = "",
  subtitle,
  onClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  const animatedProps = useSpring({
    from: { number: 0, scale: 0.9, opacity: 0 },
    to: { 
      number: numericValue || 0,
      scale: 1,
      opacity: 1
    },
    config: {
      ...config.gentle,
      tension: 100,
      friction: 10
    }
  });

  const [hover, setHover] = useSpring(() => ({
    scale: 1,
    shadow: 1,
    config: config.wobbly
  }));

  const handleHover = (isHovered) => {
    setHover({
      scale: isHovered ? 1.02 : 1,
      shadow: isHovered ? 8 : 1
    });
  };

  return (
    <animated.div
      style={{
        transform: hover.scale.to(s => `scale(${s})`),
        boxShadow: hover.shadow.to(s => 
          `0px ${s * 2}px ${s * 4}px rgba(0,0,0,0.1)`
        )
      }}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          background: `linear-gradient(45deg, ${theme.palette[color].main} 30%, ${theme.palette[color].light} 90%)`,
          color: 'white',
          cursor: onClick ? 'pointer' : 'default',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Icon fontSize={isMobile ? "medium" : "large"} />
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              ml={1}
              sx={{ 
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                fontWeight: 500
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="baseline"
          >
            <animated.div style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              {animatedProps.number.to(n => {
                if (suffix === " R$") {
                  return `${n.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}${suffix}`;
                }
                if (suffix === "%") {
                  return `${n.toFixed(1)}${suffix}`;
                }
                return `${Math.round(n)}${suffix}`;
              })}
            </animated.div>

            {trend && (
              <Box 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}
              >
                {trend >= 0 ? 
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : 
                  <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />
                }
                <Typography variant="caption">
                  {trend >= 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.9,
                display: 'block',
                mt: 1 
              }}
            >
              {subtitle}
            </Typography>
          )}
        </CardContent>

        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            opacity: 0.1,
            transform: 'translate(20%, -20%)'
          }}
        >
          <Icon sx={{ fontSize: '8rem' }} />
        </Box>
      </Card>
    </animated.div>
  );
};

export default AnimatedKPI;