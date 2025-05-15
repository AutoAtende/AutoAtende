import React, { useState, useEffect, useCallback, useRef } from "react";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  timerBox: {
    display: "flex",
    marginLeft: 10,
    marginRight: 10,
    alignItems: "center",
    gap: theme.spacing(1),
    minWidth: '120px',
    justifyContent: 'center',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    // Melhorias para iOS
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(4px)',
    zIndex: 5, // Garantir que esteja acima de outros elementos
  },
  visualizer: {
    width: '50px',
    height: '20px',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2px'
  },
  bar: {
    width: '3px',
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    transformOrigin: 'bottom',
    animation: '$pulse 1s infinite'
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scaleY(0.3)"
    },
    "50%": {
      transform: "scaleY(0.8)"
    },
    "100%": {
      transform: "scaleY(0.3)"
    }
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: theme.palette.error.main,
    animation: '$blink 1s infinite'
  },
  "@keyframes blink": {
    "0%": {
      opacity: 1
    },
    "50%": {
      opacity: 0.4
    },
    "100%": {
      opacity: 1
    }
  },
  timerText: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: theme.palette.text.primary,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    // Melhorias para leitura em dispositivos móveis
    textShadow: '0 0.5px 0px rgba(255,255,255,0.8)',
    letterSpacing: '0.5px',
  },
  // Adicionado estilos específicos para iOS
  iosTimer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '6px 12px',
    minWidth: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  }
}));

const RecordingTimer = ({ isIOS = false }) => {
  const classes = useStyles();
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0, totalSeconds: 0 });
  const intervalRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const bars = Array(5).fill(null);
  const [mounted, setMounted] = useState(false);

  // Função de formatação de tempo com memoização
  const addZero = useCallback(n => n < 10 ? "0" + n : n, []);

  // Inicializar estado de montagem
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  // Limpar temporizadores ao desmontar
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Implementação fixa do timer, usando apenas um método para todos os dispositivos
  useEffect(() => {
    // Limpar timers existentes
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Garantir referência de tempo atualizada
    startTimeRef.current = Date.now();
    
    // Criar função de atualização
    const updateTimer = () => {
      if (!mounted) return;
      
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      
      setTimer({ 
        minutes, 
        seconds,
        totalSeconds: elapsedSeconds
      });
    };
    
    // Usar setInterval para todos os dispositivos - mais confiável
    intervalRef.current = setInterval(updateTimer, 500);
    
    // Atualização imediata
    updateTimer();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mounted]);

  return (
    <div className={`${classes.timerBox} ${isIOS ? classes.iosTimer : ''}`}>
      <div className={classes.recordingDot} />
      <span className={classes.timerText}>
        {`${addZero(timer.minutes)}:${addZero(timer.seconds)}`}
      </span>
      {!isIOS && (
        <div className={classes.visualizer}>
          {bars.map((_, index) => (
            <div
              key={index}
              className={classes.bar}
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`
              }}
            />
          ))}
        </div>
      )}
      {isIOS && (
        <span style={{ 
          fontSize: '12px', 
          color: '#666',
          marginLeft: '4px',
          fontWeight: 'bold'
        }}>
          gravando...
        </span>
      )}
    </div>
  );
};

export default RecordingTimer;