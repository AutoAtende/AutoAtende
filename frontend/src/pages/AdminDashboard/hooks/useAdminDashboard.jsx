import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material';
import api from '../../../services/api';

export const useAdminDashboard = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const getColorScale = useCallback((value, max) => {
    const intensity = Math.pow(value / max, 0.5);
    const minIntensity = 0.4;
    const maxIntensity = 0.9;
    return `rgba(25, 118, 210, ${minIntensity + (intensity * (maxIntensity - minIntensity))})`;
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      healthy: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main
    };
    return colors[status] || theme.palette.grey[500];
  }, [theme]);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/metrics');
      
      if (!data.contactMetrics?.byState) {
        throw new Error('Invalid contact metrics data');
      }

      setMetrics(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics,
    lastUpdate,
    getColorScale,
    getStatusColor
  };
};