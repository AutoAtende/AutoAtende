import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  Box,
  Slide,
  Fade,
  useMediaQuery,
  Divider,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Transição customizada para mobile (slide up) e desktop (fade)
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FadeTransition = React.forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

// Styled Components Mobile First
const StyledDialog = styled(Dialog)(({ theme, ismobile }) => ({
  '& .MuiDialog-paper': {
    borderRadius: ismobile ? '24px 24px 0 0' : 12,
    margin: ismobile ? '0' : theme.spacing(2),
    maxHeight: ismobile ? '95vh' : '90vh',
    width: ismobile ? '100vw' : 'auto',
    maxWidth: ismobile ? '100vw' : '600px',
    // Mobile: ocupa toda a largura e fica na parte inferior
    ...(ismobile && {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      top: 'auto',
      margin: 0,
      borderRadius: '24px 24px 0 0',
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 -8px 32px rgba(0, 0, 0, 0.5)' 
        : '0 -8px 32px rgba(0, 0, 0, 0.15)'
    }),
    // Desktop: centralizado com bordas arredondadas
    ...(!ismobile && {
      borderRadius: 12,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
        : '0 8px 32px rgba(0, 0, 0, 0.12)'
    })
  },
  '& .MuiBackdrop-root': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.7)' 
      : 'rgba(0, 0, 0, 0.5)'
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme, ismobile }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(ismobile ? 2 : 2.5, ismobile ? 2 : 3),
  paddingBottom: theme.spacing(1),
  position: 'relative',
  
  // Gradiente sutil no background do título
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  
  // Título sempre branco em ambos os temas
  color: '#ffffff',
  
  // Mobile: adiciona uma "alça" visual na parte superior
  ...(ismobile && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: theme.spacing(1),
      left: '50%',
      transform: 'translateX(-50%)',
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2
    }
  }),
  
  '& .MuiTypography-root': {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: ismobile ? '1.125rem' : '1.25rem',
    lineHeight: 1.3
  }
}));

const StyledDialogContent = styled(DialogContent)(({ theme, ismobile }) => ({
  padding: theme.spacing(ismobile ? 2 : 3),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(ismobile ? 2 : 2),
  backgroundColor: theme.palette.background.paper,
  
  // Scroll customizado
  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: 3
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent'
  }
}));

const StyledDialogActions = styled(DialogActions)(({ theme, ismobile }) => ({
  padding: theme.spacing(ismobile ? 2 : 2.5, ismobile ? 2 : 3),
  paddingTop: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
  
  // Mobile: botões em stack vertical
  ...(ismobile && {
    flexDirection: 'column-reverse',
    '& > *': {
      width: '100%',
      margin: 0,
      marginBottom: theme.spacing(1),
      '&:first-of-type': {
        marginBottom: 0
      }
    }
  }),
  
  // Desktop: botões em linha
  ...(!ismobile && {
    justifyContent: 'flex-end',
    '& > *': {
      minWidth: 100
    }
  })
}));

const ActionButton = styled(Button)(({ theme, ismobile, variant }) => ({
  borderRadius: ismobile ? 12 : 8,
  minHeight: ismobile ? 48 : 40,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: ismobile ? '1rem' : '0.875rem',
  
  ...(variant === 'contained' && {
    boxShadow: ismobile 
      ? theme.shadows[3] 
      : theme.shadows[1],
    '&:hover': {
      boxShadow: ismobile 
        ? theme.shadows[4] 
        : theme.shadows[2]
    }
  })
}));

const CloseButton = styled(IconButton)(({ theme, ismobile }) => ({
  color: '#ffffff',
  padding: theme.spacing(1),
  
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  
  // Mobile: usa ícone de voltar
  '& .MuiSvgIcon-root': {
    fontSize: ismobile ? '1.5rem' : '1.25rem'
  }
}));

// Componente Principal
const StandardModal = ({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  actions = [],
  primaryAction,
  secondaryAction,
  size = 'medium', // 'small', 'medium', 'large', 'fullscreen'
  variant = 'default', // 'default', 'form', 'confirmation'
  loading = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  fullScreenMobile = true,
  maxWidth = 'sm',
  dividers = true,
  contentProps = {},
  titleProps = {},
  actionsProps = {},
  TransitionComponent,
  ...dialogProps
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isFullScreenMobile = fullScreenMobile && isXs;

  // Definir tamanhos baseados na prop size
  const getMaxWidth = () => {
    if (isFullScreenMobile) return false;
    
    const sizes = {
      small: 'xs',
      medium: 'sm', 
      large: 'md',
      fullscreen: false
    };
    return sizes[size] || maxWidth;
  };

  // Preparar ações padrão
  const allActions = [];
  
  if (primaryAction) {
    allActions.push({
      ...primaryAction,
      variant: primaryAction.variant || 'contained',
      color: primaryAction.color || 'primary',
      primary: true
    });
  }
  
  if (secondaryAction) {
    allActions.push({
      ...secondaryAction,
      variant: secondaryAction.variant || 'outlined',
      color: secondaryAction.color || 'primary',
      primary: false
    });
  }
  
  allActions.push(...actions);

  // Determinar transição
  const transition = TransitionComponent || (isMobile ? SlideTransition : FadeTransition);

  const handleClose = (event, reason) => {
    if (!closeOnBackdrop && reason === 'backdropClick') return;
    if (!closeOnEscape && reason === 'escapeKeyDown') return;
    onClose?.(event, reason);
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={transition}
      fullScreen={isFullScreenMobile}
      fullWidth={!isFullScreenMobile}
      maxWidth={getMaxWidth()}
      ismobile={isMobile ? 1 : 0}
      scroll="paper"
      {...dialogProps}
    >
      {/* Título */}
      <StyledDialogTitle 
        ismobile={isMobile ? 1 : 0}
        {...titleProps}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              color: '#ffffff',
              fontWeight: 600,
              fontSize: isMobile ? '1.125rem' : '1.25rem'
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: isMobile ? '0.875rem' : '0.8125rem',
                mt: 0.5
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {showCloseButton && (
          <CloseButton
            onClick={(e) => handleClose(e, 'closeButton')}
            ismobile={isMobile ? 1 : 0}
            size="small"
          >
            {isMobile ? <BackIcon /> : <CloseIcon />}
          </CloseButton>
        )}
      </StyledDialogTitle>

      {/* Divisor opcional */}
      {dividers && (
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      )}

      {/* Conteúdo */}
      <StyledDialogContent
        ismobile={isMobile ? 1 : 0}
        dividers={dividers}
        {...contentProps}
      >
        {children}
      </StyledDialogContent>

      {/* Ações */}
      {allActions.length > 0 && (
        <StyledDialogActions
          ismobile={isMobile ? 1 : 0}
          {...actionsProps}
        >
          {allActions.map((action, index) => (
            <ActionButton
              key={index}
              variant={action.variant}
              color={action.color}
              onClick={action.onClick}
              disabled={action.disabled || loading}
              startIcon={action.icon}
              ismobile={isMobile ? 1 : 0}
              loading={action.loading}
              fullWidth={isMobile}
              sx={action.sx}
            >
              {action.label}
            </ActionButton>
          ))}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

StandardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      color: PropTypes.string,
      disabled: PropTypes.bool,
      loading: PropTypes.bool,
      icon: PropTypes.node,
      sx: PropTypes.object
    })
  ),
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    icon: PropTypes.node,
    sx: PropTypes.object
  }),
  secondaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    icon: PropTypes.node,
    sx: PropTypes.object
  }),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'fullscreen']),
  variant: PropTypes.oneOf(['default', 'form', 'confirmation']),
  loading: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  fullScreenMobile: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  dividers: PropTypes.bool,
  contentProps: PropTypes.object,
  titleProps: PropTypes.object,
  actionsProps: PropTypes.object,
  TransitionComponent: PropTypes.elementType
};

export default StandardModal;