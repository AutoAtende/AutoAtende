import React, { useState, useEffect } from 'react';
import { Card, Typography, Slider, Button } from '@mui/material';
import { Timer, Refresh } from '@mui/icons-material';
import api from '../../services/api';

const RefreshIntervalControl = ({ onIntervalChange }) => {
  const [interval, setInterval] = useState(60); // 1 minuto por padrão
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const response = await api.get('/zdash/cache-config');
      setInterval(response.data.refreshInterval);
    } catch (error) {
      console.error('Error loading cache config:', error);
    }
  };

  const handleChange = async (newValue) => {
    setIsLoading(true);
    try {
      await api.post('/zdash/cache-config', {
        refreshInterval: newValue
      });
      setInterval(newValue);
      onIntervalChange?.(newValue);
    } catch (error) {
      console.error('Error updating refresh interval:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const marks = [
    { value: 60, label: '1m' },
    { value: 300, label: '5m' },
    { value: 600, label: '10m' },
    { value: 1800, label: '30m' }
  ];

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="text-gray-500" />
          <Typography variant="h6">Intervalo de Atualização</Typography>
        </div>
        <Button
          startIcon={<Refresh />}
          onClick={() => handleChange(interval)}
          disabled={isLoading}
        >
          Aplicar
        </Button>
      </div>
      
      <Slider
        value={interval}
        onChange={(_, newValue) => setInterval(newValue)}
        min={60}
        max={1800}
        step={null}
        marks={marks}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value/60}min`}
      />
    </Card>
  );
};

export default RefreshIntervalControl;