import { useState, useCallback, useRef } from 'react';

const useSwipeGesture = ({ onSwipeLeft, onSwipeRight, threshold = 50 }) => {
  const [swipeEnabled, setSwipeEnabled] = useState(true);
  const touchStartX = useRef(null);
  
  const handleTouchStart = useCallback((e) => {
    if (!swipeEnabled) return;
    if (e.touches && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    }
  }, [swipeEnabled]);
  
  const handleTouchEnd = useCallback((e) => {
    if (!swipeEnabled || touchStartX.current === null || !e.changedTouches || !e.changedTouches[0]) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;
    
    // Detectar direção do swipe
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe para a esquerda
        onSwipeLeft && onSwipeLeft();
      } else {
        // Swipe para a direita
        onSwipeRight && onSwipeRight();
      }
    }
    
    touchStartX.current = null;
  }, [swipeEnabled, threshold, onSwipeLeft, onSwipeRight]);
  
  const handleSwipe = useCallback((direction) => {
    if (direction === 'left') {
      onSwipeLeft && onSwipeLeft();
    } else if (direction === 'right') {
      onSwipeRight && onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight]);
  
  const enableSwipe = useCallback(() => {
    setSwipeEnabled(true);
  }, []);
  
  const disableSwipe = useCallback(() => {
    setSwipeEnabled(false);
  }, []);
  
  // Props para adicionar aos componentes
  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
  
  return {
    handleSwipe,
    swipeHandlers,
    enableSwipe,
    disableSwipe,
    isSwipeEnabled: swipeEnabled
  };
};

export default useSwipeGesture;
