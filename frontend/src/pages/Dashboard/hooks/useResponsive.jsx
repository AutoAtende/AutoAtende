import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const useResponsive = () => {
  const theme = useTheme();
  
  // Breakpoints mais granulares
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  
  // Breakpoints compostos
  const isMobile = isXs;
  const isTablet = isSm || isMd;
  const isDesktop = isLg || isXl;
  
  // Orientação
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // Suporte a toque
  const [touchEnabled, setTouchEnabled] = useState(false);
  
  // Detectar tamanho de tela para melhor adaptação
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  // Detectar suporte a touch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasTouchSupport = 'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0 ||
                            navigator.msMaxTouchPoints > 0;
                            
    setTouchEnabled(hasTouchSupport);
    
    // Detecção de interação touch
    const handleTouchStart = () => {
      setTouchEnabled(true);
      // Remove os listeners depois da primeira detecção
      window.removeEventListener('touchstart', handleTouchStart);
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);
  
  // Monitorar mudanças de tamanho de tela
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return {
    // Breakpoints básicos
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Breakpoints compostos
    isMobile,
    isTablet,
    isDesktop,
    
    // Orientação
    isPortrait,
    isLandscape,
    
    // Capacidades do dispositivo
    touchEnabled,
    
    // Tamanho da tela
    screenSize
  };
};

export default useResponsive;