// src/components/VisibilityToggle.jsx
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';

const VisibilityToggle = ({ tabId, componentId, visible = true, size = 'small' }) => {
  const { toggleComponentVisibility } = useDashboardSettings();

  const handleToggle = async () => {
    try {
      await toggleComponentVisibility(tabId, componentId, !visible);
    } catch (error) {
      console.error('Erro ao alternar visibilidade:', error);
    }
  };

  return (
    <Tooltip title={visible ? "Ocultar componente" : "Mostrar componente"}>
      <IconButton 
        onClick={handleToggle} 
        size={size}
        color={visible ? "inherit" : "primary"}
      >
        {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

export default VisibilityToggle;