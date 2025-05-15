import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { i18n } from "../../translate/i18n";

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => {
  // Previne fechamento acidental ao clicar fora do dialog
  const handleClose = (event, reason) => {
    if (reason === 'backdropClick') return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {title || i18n.t("chat.deleteConfirmTitle")}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {message || i18n.t("chat.deleteConfirmMessage")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {i18n.t("chat.cancel")}
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          autoFocus
        >
          {i18n.t("chat.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DeleteConfirmationDialog);