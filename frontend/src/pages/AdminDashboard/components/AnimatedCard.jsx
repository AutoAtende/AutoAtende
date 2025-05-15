import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { Card, useTheme, useMediaQuery } from '@mui/material';

const AnimatedCard = ({ children, delay = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  const springProps = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(20px)' 
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0px)' 
    },
    delay,
    config: { tension: 280, friction: 20 }
  });

  const hoverProps = useSpring({
    transform: isHovered 
      ? 'scale(1.02) translateY(-4px)' 
      : 'scale(1) translateY(0px)',
    boxShadow: isHovered 
      ? '0 8px 16px rgba(0,0,0,0.1)' 
      : '0 2px 4px rgba(0,0,0,0.05)',
    config: { tension: 300, friction: 20 }
  });

  return (
    <animated.div style={{
      ...springProps,
      ...(isMobile ? {} : hoverProps),
      width: '100%'
    }}>
      <Card
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        sx={{
          height: '100%',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            backgroundColor: theme.palette.background.default
          }
        }}
      >
        {children}
      </Card>
    </animated.div>
  );
};

export default AnimatedCard;