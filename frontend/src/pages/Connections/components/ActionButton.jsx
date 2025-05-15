import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const ActionButton = ({ 
  color = "primary", 
  variant = "outlined", 
  size = "small",
  disabled = false, 
  loading = false,
  onClick, 
  children, 
  startIcon,
  ...props 
}) => (
  <Button
    size={size}
    variant={variant}
    color={color}
    onClick={onClick}
    disabled={disabled || loading}
    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
    sx={{ position: 'relative', ...props.sx }}
    {...props}
  >
    {children}
  </Button>
);

export default ActionButton;