import React from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import { i18n } from "../translate/i18n";
import { isString } from '../utils/helpers';
import { useTheme } from "@mui/material/styles";
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton,
  Slide
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from "@mui/icons-material";

// Componente de toast avançado com tema MUI
const CustomToast = React.forwardRef((props, ref) => {
  const theme = useTheme();
  const { variant = 'default', message, action } = props;
  
  // Definir ícone baseado na variante
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircleIcon sx={{ mr: 1.5 }} />;
      case 'error':
        return <ErrorIcon sx={{ mr: 1.5 }} />;
      case 'warning':
        return <WarningIcon sx={{ mr: 1.5 }} />;
      case 'info':
      case 'loading':
        return <InfoIcon sx={{ mr: 1.5 }} />;
      default:
        return <InfoIcon sx={{ mr: 1.5 }} />;
    }
  };
  
  // Definir cor de fundo baseada na variante e no tema
  const getBackgroundColor = () => {
    const isDark = theme.palette.mode === 'dark';
    
    switch (variant) {
      case 'success':
        return isDark ? theme.palette.success.dark : theme.palette.success.light;
      case 'error':
        return isDark ? theme.palette.error.dark : theme.palette.error.light;
      case 'warning':
        return isDark ? theme.palette.warning.dark : theme.palette.warning.light;
      case 'info':
      case 'loading':
        return isDark ? theme.palette.info.dark : theme.palette.info.light;
      default:
        return isDark ? theme.palette.grey[800] : theme.palette.grey[200];
    }
  };
  
  // Definir cor do texto baseada na variante e no tema
  const getTextColor = () => {
    const isDark = theme.palette.mode === 'dark';
    
    switch (variant) {
      case 'success':
        return isDark ? theme.palette.success.contrastText : theme.palette.success.dark;
      case 'error':
        return isDark ? theme.palette.error.contrastText : theme.palette.error.dark;
      case 'warning':
        return isDark ? theme.palette.warning.contrastText : theme.palette.warning.dark;
      case 'info':
      case 'loading':
        return isDark ? theme.palette.info.contrastText : theme.palette.info.dark;
      default:
        return isDark ? theme.palette.grey[100] : theme.palette.grey[900];
    }
  };
  
  // Definir cor da borda baseada na variante
  const getBorderColor = () => {
    switch (variant) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
      case 'loading':
        return theme.palette.info.main;
      default:
        return theme.palette.divider;
    }
  };

  return (
    <Paper
      ref={ref}
      elevation={6}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 2),
        borderRadius: theme.shape.borderRadius * 1.5,
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        borderLeft: `4px solid ${getBorderColor()}`,
        boxShadow: theme.shadows[3],
        minWidth: '300px',
        maxWidth: '500px',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        {getIcon()}
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {message}
        </Typography>
      </Box>
      
      {action || (
        <IconButton 
          size="small" 
          aria-label="close" 
          color="inherit" 
          onClick={props.onClose}
          sx={{ 
            ml: 1,
            p: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
});

// Singleton para manter a referência
const toastSingleton = {
  enqueueSnackbar: () => {},
  closeSnackbar: () => {}
};

// Provedor atualizado com MUI 5
export const SnackbarContextProvider = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      Components={{
        default: CustomToast,
        error: CustomToast,
        warning: CustomToast,
        success: CustomToast,
        info: CustomToast,
        loading: CustomToast,
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      TransitionComponent={Slide}
      preventDuplicate
      autoHideDuration={5000}
      hideIconVariant
    >
      <SnackbarUpdater />
      {children}
    </SnackbarProvider>
  );
};

// Componente para atualizar o singleton
const SnackbarUpdater = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
  React.useEffect(() => {
    toastSingleton.enqueueSnackbar = enqueueSnackbar;
    toastSingleton.closeSnackbar = closeSnackbar;
  }, [enqueueSnackbar, closeSnackbar]);

  return null;
};

// Função de tradução de erros
const getErrorMessage = (content) => {
  if (!content) return i18n.t("contactModal.genericError");
  
  if (isString(content)) return content;
  
  if (content.response?.data?.error || content.response?.data?.message) {
    const errorMsg = content.response.data.error || content.response.data.message;
    return i18n.exists(`backendErrors.${errorMsg}`)
      ? i18n.t(`backendErrors.${errorMsg}`)
      : errorMsg;
  }
  
  return i18n.t("contactModal.genericError");
};

// API global de toast melhorada
export const toast = {
  error: (content, options = {}) => {
    return toastSingleton.enqueueSnackbar(getErrorMessage(content), { 
      variant: 'error',
      ...options
    });
  },
  success: (content, options = {}) => {
    return toastSingleton.enqueueSnackbar(getErrorMessage(content), { 
      variant: 'success',
      ...options
    });
  },
  warning: (content, options = {}) => {
    return toastSingleton.enqueueSnackbar(getErrorMessage(content), { 
      variant: 'warning',
      ...options
    });
  },
  info: (content, options = {}) => {
    return toastSingleton.enqueueSnackbar(getErrorMessage(content), { 
      variant: 'info',
      ...options
    });
  },
  loading: (content, options = {}) => {
    return toastSingleton.enqueueSnackbar(getErrorMessage(content), { 
      variant: 'info',
      persist: true,
      ...options
    });
  },
  dismiss: (key) => {
    toastSingleton.closeSnackbar(key);
  },
  closeAll: () => {
    toastSingleton.closeSnackbar();
  }
};

export default toast;