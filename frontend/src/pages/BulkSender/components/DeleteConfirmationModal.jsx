// src/pages/BulkSender/components/DeleteConfirmationModal.jsx
import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";

// Material UI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';

// Icons
import {
  DeleteOutline as DeleteOutlineIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Componentes base
import BaseButton from "../../../components/BaseButton";

// Componentes estilizados
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const WarningIconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const StyledWarningIcon = styled(WarningIcon)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.error.main,
}));

const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
  itemName,
  itemType = 'item',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Texto padrão com base no tipo
  const getDefaultText = () => {
    const defaults = {
      title: i18n.t(`delete.${itemType}.title`, { name: itemName || '' }),
      message: i18n.t(`delete.${itemType}.message`, { name: itemName || '' }),
    };
    
    return {
      title: title || defaults.title,
      message: message || defaults.message,
    };
  };
  
  const texts = getDefaultText();

  return (
    <StyledDialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {texts.title}
          </Typography>
        </Box>
        
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogHeader>
      
      <DialogContent>
        <WarningIconContainer>
          <StyledWarningIcon />
        </WarningIconContainer>
        
        <Typography variant="body1" align="center">
          {texts.message}
        </Typography>
        
        {itemName && (
          <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ mt: 2 }}>
            "{itemName}"
          </Typography>
        )}
        
        <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
          {i18n.t("delete.warning")}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 1 }}>
        <BaseButton
          variant="outlined"
          color="secondary"
          onClick={onClose}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {i18n.t("delete.cancel")}
        </BaseButton>
        <BaseButton
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteOutlineIcon />}
          sx={{ minWidth: 100 }}
        >
          {i18n.t("delete.confirm")}
        </BaseButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default DeleteConfirmationModal;