import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 4,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  // Garantir compatibilidade com tema claro/escuro
  color: theme.palette.mode === 'dark' 
    ? theme.palette.primary.contrastText 
    : undefined,
  '&.MuiButton-contained': {
    boxShadow: theme.shadows[2],
  },
  '&.MuiButton-outlined': {
    borderWidth: '1px',
  },
  transition: theme.transitions.create([
    'background-color',
    'box-shadow',
    'border-color',
    'color',
  ], {
    duration: theme.transitions.duration.short,
  }),
}));

const BaseButton = (props) => {
  const { children, ...rest } = props;
  return <StyledButton {...rest}>{children}</StyledButton>;
};

BaseButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  href: PropTypes.string,
  sx: PropTypes.object,
};

export default BaseButton;