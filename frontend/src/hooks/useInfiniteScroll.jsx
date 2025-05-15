// useInfiniteScroll.jsx
import { useState, useEffect, useCallback } from 'react';

const useInfiniteScroll = ({ fetchMore, initialPage = 0, limit = 10 }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchMore(0, limit);
      
      if (response.items && Array.isArray(response.items)) {
        setItems(response.items);
        setHasMore(response.items.length === limit);
        setPage(1);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, limit]);

  // Carrega dados iniciais ao montar o componente
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await fetchMore(page, limit);
      
      if (response.items && Array.isArray(response.items)) {
        setItems(prevItems => [...prevItems, ...response.items]);
        setHasMore(response.items.length === limit);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar mais itens:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, limit, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    loadInitialData();
  }, [loadInitialData]);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    reset
  };
};

export default useInfiniteScroll;