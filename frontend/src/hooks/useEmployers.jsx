import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useEmployers = (searchParam = '') => {
  return useQuery(
    ['employers', searchParam],
    async () => {
      const { data } = await api.get('/employers', {
        params: {
          searchParam,
          limit: 9999 // Buscar todos os empregadores
        }
      });
      return data;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutos
      keepPreviousData: true
    }
  );
};