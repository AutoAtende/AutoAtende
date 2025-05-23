import React from 'react';
import PropTypes from 'prop-types';
import { Button, useMediaQuery, useTheme } from '@mui/material';
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
  // Estilo para garantir que o ícone fique centralizado no mobile
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    margin: 0,
  },
}));

const BaseButton = (props) => {
  const { 
    children, 
    icon, 
    mobileIcon, 
    ...rest 
  } = props;
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Se estiver em mobile e tiver mobileIcon definido, usa mobileIcon
  // Caso contrário, usa o ícone padrão (icon)
  const currentIcon = isMobile ? (mobileIcon || icon) : icon;
  
  return (
    <StyledButton
      {...rest}
      startIcon={currentIcon}
      aria-label={isMobile ? rest['aria-label'] || children : undefined}
    >
      {!isMobile && children}
    </StyledButton>
  );
};

BaseButton.propTypes = {
  children: PropTypes.node,
  /** Ícone a ser exibido em desktop e mobile (se mobileIcon não for definido) */
  icon: PropTypes.node,
  /** Ícone alternativo específico para mobile */
  mobileIcon: PropTypes.node,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  href: PropTypes.string,
  sx: PropTypes.object,
  /** Texto descritivo para acessibilidade quando apenas o ícone é exibido */
  'aria-label': PropTypes.string,
};

BaseButton.defaultProps = {
  variant: 'contained',
  size: 'medium',
};

export default BaseButton;