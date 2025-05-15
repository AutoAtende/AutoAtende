import { useEffect, useState, useCallback, useRef } from 'react';

// Hook para otimização de performance em dispositivos com recursos limitados
const usePerformanceOptimization = () => {
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);
  const [isReducedAnimations, setIsReducedAnimations] = useState(false);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [isDataSaverOn, setIsDataSaverOn] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isOffline, setIsOffline] = useState(false);
  
  // Medir o tempo de renderização
  const renderTimeRef = useRef({
    startTime: null,
    measurements: []
  });
  
  // Detectar dispositivos de baixa performance
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Verificações de desempenho do dispositivo
    const checkPerformance = () => {
      // Verificar via User Agent se é um dispositivo móvel
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Verificar se o dispositivo tem limitações de memória
      const deviceMemory = navigator.deviceMemory || 4; // 4GB é o padrão
      
      // Verificar número de núcleos de CPU
      const cpuCores = navigator.hardwareConcurrency || 4; // 4 cores é o padrão
      
      // Considerar de baixa performance se for um dispositivo móvel com memória limitada ou poucos núcleos
      setIsLowPerfDevice(
        isMobileDevice && (deviceMemory <= 2 || cpuCores <= 2)
      );
    };
    
    // Verificar preferências de redução de animação
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedAnimations(mediaQuery.matches);
      
      // Ouvir mudanças na preferência
      const handleChange = (e) => {
        setIsReducedAnimations(e.matches);
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback para navegadores mais antigos
        mediaQuery.addListener(handleChange);
      }
      
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    };
    
    // Verificar o status da bateria
    const checkBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          setIsLowBattery(battery.level <= 0.2 && !battery.charging);
          
          // Ouvir mudanças no status da bateria
          battery.addEventListener('levelchange', () => {
            setIsLowBattery(battery.level <= 0.2 && !battery.charging);
          });
          
          battery.addEventListener('chargingchange', () => {
            setIsLowBattery(battery.level <= 0.2 && !battery.charging);
          });
        } catch (error) {
          console.error('Erro ao verificar status da bateria:', error);
        }
      }
    };
    
    // Verificar modo de economia de dados
    const checkDataSaver = () => {
      if ('connection' in navigator && 'saveData' in navigator.connection) {
        setIsDataSaverOn(navigator.connection.saveData);
        
        // Atualizar tipo de conexão
        setConnectionType(navigator.connection.effectiveType || 'unknown');
        
        // Ouvir mudanças na conexão
        navigator.connection.addEventListener('change', () => {
          setIsDataSaverOn(navigator.connection.saveData);
          setConnectionType(navigator.connection.effectiveType || 'unknown');
        });
      }
    };
    
    // Verificar conectividade
    const checkConnectivity = () => {
      setIsOffline(!navigator.onLine);
      
      window.addEventListener('online', () => setIsOffline(false));
      window.addEventListener('offline', () => setIsOffline(true));
      
      return () => {
        window.removeEventListener('online', () => setIsOffline(false));
        window.removeEventListener('offline', () => setIsOffline(true));
      };
    };
    
    // Executar todas as verificações
    checkPerformance();
    const cleanupReducedMotion = checkReducedMotion();
    checkBatteryStatus();
    checkDataSaver();
    const cleanupConnectivity = checkConnectivity();
    
    return () => {
      cleanupReducedMotion && cleanupReducedMotion();
      cleanupConnectivity && cleanupConnectivity();
    };
  }, []);
  
  // Iniciar medição de tempo de renderização
  const startRenderTimeMeasurement = useCallback(() => {
    renderTimeRef.current.startTime = performance.now();
  }, []);
  
  // Finalizar medição de tempo de renderização
  const endRenderTimeMeasurement = useCallback((componentName) => {
    if (renderTimeRef.current.startTime === null) return;
    
    const endTime = performance.now();
    const duration = endTime - renderTimeRef.current.startTime;
    
    renderTimeRef.current.measurements.push({
      componentName,
      duration,
      timestamp: new Date().toISOString()
    });
    
    renderTimeRef.current.startTime = null;
    
    // Se a renderização for muito lenta, podemos considerar o dispositivo como de baixa performance
    if (duration > 100) {
      setIsLowPerfDevice(true);
    }
    
    return duration;
  }, []);
  
  // Obter todas as medições de tempo de renderização
  const getRenderTimeMeasurements = useCallback(() => {
    return [...renderTimeRef.current.measurements];
  }, []);
  
  // Limpar medições de tempo de renderização
  const clearRenderTimeMeasurements = useCallback(() => {
    renderTimeRef.current.measurements = [];
  }, []);
  
  return {
    isLowPerfDevice,
    isReducedAnimations,
    isLowBattery,
    isDataSaverOn,
    connectionType,
    isOffline,
    startRenderTimeMeasurement,
    endRenderTimeMeasurement,
    getRenderTimeMeasurements,
    clearRenderTimeMeasurements,
    // Configurações recomendadas com base nas detecções
    recommendations: {
      shouldUseVirtualization: isLowPerfDevice || (connectionType === '2g' || connectionType === 'slow-2g'),
      shouldReduceAnimations: isReducedAnimations || isLowPerfDevice || isLowBattery,
      shouldLazyLoadImages: isDataSaverOn || connectionType === '2g' || connectionType === 'slow-2g',
      shouldMinimizeUpdates: isLowPerfDevice || isLowBattery,
      shouldCacheResults: !isOffline && !(connectionType === '2g' || connectionType === 'slow-2g'),
    }
  };
};

export default usePerformanceOptimization;