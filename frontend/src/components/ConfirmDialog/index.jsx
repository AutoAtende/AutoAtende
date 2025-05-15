import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  severity,
  fullWidth,
  maxWidth
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Configurações baseadas na severidade
  const getSeverityConfig = () => {
    switch (severity) {
      case 'error':
        return {
          icon: <ErrorIcon color="error" fontSize="large" />,
          color: theme.palette.error.main,
          textColor: theme.palette.error.main
        };
      case 'warning':
        return {
          icon: <WarningIcon sx={{ color: theme.palette.warning.main }} fontSize="large" />,
          color: theme.palette.warning.main,
          textColor: theme.palette.warning.main
        };
      case 'success':
        return {
          icon: <CheckCircleIcon color="success" fontSize="large" />,
          color: theme.palette.success.main,
          textColor: theme.palette.success.main
        };
      case 'info':
      default:
        return {
          icon: <InfoIcon color="info" fontSize="large" />,
          color: theme.palette.info.main,
          textColor: theme.palette.info.main
        };
    }
  };

  const { icon, color, textColor } = getSeverityConfig();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      PaperProps={{
        sx: { borderRadius: { xs: 0, sm: 2 } }
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: textColor
        }}
      >
        {title}

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Fechar diálogo"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' }, 
          gap: 2,
          mb: 2,
          mt: 1
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', 
            mb: { xs: 1, sm: 0 } 
          }}>
            {icon}
          </Box>
          
          <DialogContentText
            id="confirm-dialog-description"
            sx={{ 
              textAlign: { xs: 'center', sm: 'left' } 
            }}
          >
            {message}
          </DialogContentText>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        gap: 1,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          fullWidth={fullScreen}
          sx={{ 
            minWidth: { xs: '100%', sm: 120 },
            minHeight: 40
          }}
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={onConfirm}
          color={severity === 'error' ? 'error' : 'primary'}
          variant="contained"
          fullWidth={fullScreen}
          autoFocus
          sx={{ 
            minWidth: { xs: '100%', sm: 120 },
            minHeight: 40 
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  fullWidth: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl'])
};

ConfirmDialog.defaultProps = {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  severity: 'info',
  fullWidth: true,
  maxWidth: 'sm'
};

export default ConfirmDialog;