import { useState, useCallback, useRef, useEffect } from 'react';

// Hook para virtualização de grandes listas - otimização de performance
const useVirtualizedList = (
  items = [], 
  itemHeight = 50, 
  visibleItems = 10, 
  buffer = 3
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(visibleItems * itemHeight);
  const containerRef = useRef(null);
  
  // Total da altura da lista virtual
  const totalHeight = items.length * itemHeight;
  
  // Calculando os itens visíveis baseado na posição do scroll
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length - 1, 
    Math.floor((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  // Lista de itens a serem renderizados
  const visibleItemsList = items.slice(startIndex, endIndex + 1);
  
  // Posições para os itens virtualizados
  const offsetY = startIndex * itemHeight;
  
  // Handler para eventos de scroll
  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    setScrollTop(scrollTop);
  }, []);
  
  // Atualizar a altura do container quando a ref é atribuída
  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      setContainerHeight(height);
    }
  }, [containerRef]);
  
  return {
    containerRef,
    handleScroll,
    visibleItemsList,
    offsetY,
    totalHeight,
    startIndex,
    endIndex
  };
};

export default useVirtualizedList;