import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
import BaseButton from './BaseButton';

const EmptyContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(5),
  textAlign: 'center',
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  // Garantir adaptação ao tema escuro
  border: `1px solid ${theme.palette.divider}`,
}));

const IconContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Adaptação para tema claro/escuro
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.primary.dark
    : theme.palette.primary.lighter || theme.palette.primary.light,
  color: theme.palette.primary.main,
}));

const BaseEmptyState = ({
  icon,
  title,
  message,
  buttonText,
  onAction,
  showButton = true,
}) => {
  return (
    <EmptyContainer elevation={0} variant="outlined">
      <IconContainer>
        {icon}
      </IconContainer>
      
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="textSecondary" 
        sx={{ maxWidth: 500 }}
      >
        {message}
      </Typography>
      
      {showButton && buttonText && (
        <BaseButton
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{ mt: 3 }}
        >
          {buttonText}
        </BaseButton>
      )}
    </EmptyContainer>
  );
};

BaseEmptyState.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  onAction: PropTypes.func,
  showButton: PropTypes.bool,
};

export default BaseEmptyState;