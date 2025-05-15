import { useQuery } from 'react-query';
import api from '../services/api';

export const useTags = (searchParam = '') => {
  return useQuery(
    ['tags', searchParam],
    async () => {
      const { data } = await api.get('/tags/list', {
        params: {
          searchParam
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