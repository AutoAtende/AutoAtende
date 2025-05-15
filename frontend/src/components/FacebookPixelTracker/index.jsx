import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import FacebookPixelService from '../../services/facebookPixel';

const FacebookPixelTracker = () => {
  const history = useHistory();

  useEffect(() => {
    // Registra pageview quando a rota muda
    if (FacebookPixelService.isInitialized()) {
      FacebookPixelService.trackPageView();
    }
  }, [history]);

  // Este componente não renderiza nada, apenas monitora mudanças de rota
  return null;
};

export default FacebookPixelTracker;