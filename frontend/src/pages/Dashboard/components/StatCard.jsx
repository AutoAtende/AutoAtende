// src/pages/Dashboard/components/StatCard.jsx
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,  
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { animated, useSpring, config } from 'react-spring';
import useResponsive from '../hooks/useResponsive';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Componente para animação de números
const AnimatedNumber = ({ 
  n, 
  prefix = "", 
  suffix = "", 
  duration = 1500, 
  decimals = 0,
  threshold = 1000 
}) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: n || 0 },
    delay: 200,
    config: { 
      tension: 140,
      friction: 20,
      duration 
    }
  });
  
  return (
    <animated.span>
      {number.to(num => {
        // Formatar para números grandes
        if (num > threshold && decimals === 0) {
          if (num > 999999) {
            return `${prefix}${(num / 1000000).toFixed(1)}M${suffix}`;
          }
          if (num > 9999) {
            return `${prefix}${(num / 1000).toFixed(1)}K${suffix}`;
          }
          return `${prefix}${Math.floor(num).toLocaleString()}${suffix}`;
        }
        return `${prefix}${num.toFixed(decimals)}${suffix}`;
      })}
    </animated.span>
  );
};

// Componente de card de estatística com animação
const StatCard = ({ 
  title, 
  value = 0, 
  prefix = "", 
  suffix = "", 
  decimals = 0, 
  icon = null, 
  color = "primary",
  tabId,
  componentId,
  subtitle = "",
  info = "",
  ...props 
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const { isComponentVisible } = useDashboardSettings();
  const [isHovered, setIsHovered] = useState(false);
  
  const visible = isComponentVisible(tabId, componentId);
  
  // Animação para o card
  const cardAnimation = useSpring({
    transform: isHovered ? 'translateY(-8px)' : 'translateY(0px)',
    boxShadow: isHovered 
      ? '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)' 
      : '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    config: config.gentle
  });
  
  // Animação para o ícone
  const iconAnimation = useSpring({
    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
    config: { tension: 300, friction: 10 }
  });
  
  const iconBgAnimation = useSpring({
    backgroundColor: isHovered 
      ? alpha(theme.palette[color].main, 0.3) 
      : alpha(theme.palette[color].main, 0.15),
    config: { tension: 300, friction: 20 }
  });

  // Se o componente não estiver visível, não renderize nada
  if (!visible) {
    return null;
  }
  
  // Mapear string de cor para cores do tema
  const getColorFromTheme = (colorName) => {
    const colorMap = {
      primary: theme.palette.primary,
      secondary: theme.palette.secondary,
      success: theme.palette.success,
      error: theme.palette.error,
      warning: theme.palette.warning,
      info: theme.palette.info
    };
    
    return colorMap[colorName] || theme.palette.primary;
  };
  
  const themeColor = getColorFromTheme(color);
  
  return (
    <animated.div
      style={cardAnimation}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          border: `1px solid ${alpha(themeColor.main, 0.12)}`,
          background: `linear-gradient(145deg, ${alpha(themeColor.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          ...props.sx
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && (
                <animated.div style={{ ...iconBgAnimation, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, marginRight: 12 }}>
                  <animated.div style={iconAnimation}>
                    {React.cloneElement(icon, { 
                      style: { 
                        fontSize: 28,
                        color: themeColor.main
                      }
                    })}
                  </animated.div>
                </animated.div>
              )}
              <Box>
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  color="textSecondary"
                  sx={{ fontWeight: 'medium', lineHeight: 1.2 }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="textSecondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {info && (
              <Tooltip title={info} arrow placement="top">
                <IconButton size="small" sx={{ ml: 1, color: 'text.secondary' }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Box sx={{ position: 'relative', mt: 1 }}>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="div" 
              sx={{ 
                fontWeight: 'bold', 
                color: themeColor.main,
                lineHeight: 1.1,
                mb: 0.5
              }}
            >
              <AnimatedNumber 
                n={value} 
                prefix={prefix} 
                suffix={suffix} 
                decimals={decimals} 
              />
            </Typography>
          </Box>
          
          {/* Seção para indicador de tendência (opcional) */}
          {props.trend && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mt: 1
            }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: props.trendDirection === 'up' 
                    ? alpha(theme.palette.success.main, 0.1)
                    : props.trendDirection === 'down'
                      ? alpha(theme.palette.error.main, 0.1)
                      : alpha(theme.palette.grey[500], 0.1),
                  color: props.trendDirection === 'up'
                    ? theme.palette.success.main
                    : props.trendDirection === 'down'
                      ? theme.palette.error.main
                      : theme.palette.grey[600]
                }}
              >
                {props.trendIcon}
                <Typography
                  variant="caption"
                  sx={{ 
                    fontWeight: 'bold',
                    ml: 0.5
                  }}
                >
                  {props.trend}
                </Typography>
              </Box>
              
              {props.trendLabel && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {props.trendLabel}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
        
        {/* Barra de progresso no inferior */}
        {props.progress !== undefined && (
          <Box
            sx={{
              height: 4,
              width: `${Math.min(Math.max(props.progress, 0), 100)}%`,
              bgcolor: themeColor.main,
              position: 'absolute',
              bottom: 0,
              left: 0,
              transition: 'width 1s ease-in-out'
            }}
          />
        )}
      </Card>
    </animated.div>
  );
};

export default StatCard;