import React from 'react';
import { Box, Paper, Typography, useTheme, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ResponsiveContainer } from 'recharts';
import { VisibilityOff } from '@mui/icons-material';
import useResponsive from '../hooks/useResponsive';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';
import VisibilityToggle from './VisibilityToggle';

const ResponsiveChart = ({ 
  title, 
  children, 
  height = 300, 
  actions = null, 
  minHeight = 250,
  isEmpty = false,
  emptyMessage = "Nenhum dado disponível",
  tabId,
  componentId,
  ...props 
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const { isComponentVisible } = useDashboardSettings();
  
  const visible = isComponentVisible(tabId, componentId);

  if (!visible) {
    return null;
  }
  
  return (
    <Paper 
      sx={{ 
        height: '100%',
        borderRadius: 1,
        boxShadow: theme.shadows[2],
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
        ...props.sx
      }}
      elevation={1}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: isMobile ? 1.5 : 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ fontWeight: isMobile ? 'medium' : 'bold' }}
          >
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {actions && actions}
            <VisibilityToggle 
              tabId={tabId} 
              componentId={componentId} 
              visible={true} 
            />
          </Box>
        </Box>
      )}
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          p: isMobile ? 1 : 2,
          minHeight: minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isEmpty ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={height || "100%"}>
            {children}
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default ResponsiveChart;