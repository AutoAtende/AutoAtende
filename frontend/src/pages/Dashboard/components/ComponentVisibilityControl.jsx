import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDashboardContext } from '../context/DashboardContext';

const ComponentVisibilityControl = ({ componentKey, tooltipVisible = 'Mostrar', tooltipHidden = 'Ocultar' }) => {
  const { dashboardSettings, updateComponentVisibility } = useDashboardContext();

  // Verificar se o componente está visível
  const isVisible = dashboardSettings?.componentVisibility?.[componentKey] !== false;

  // Handler para alternar visibilidade
  const toggleVisibility = async () => {
    try {
      await updateComponentVisibility(componentKey, !isVisible);
    } catch (error) {
      console.error('Erro ao alternar visibilidade do componente:', error);
    }
  };

  return (
    <Tooltip title={isVisible ? tooltipHidden : tooltipVisible}>
      <IconButton onClick={toggleVisibility} size="small" sx={{ color: 'text.secondary' }}>
        {isVisible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

export default ComponentVisibilityControl;