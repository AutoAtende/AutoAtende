import React from "react";
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from "@mui/material";
import { AlertTriangle } from "lucide-react";

const DisconnectConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message,
  warningMessage,
  confirmLoading 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {warningMessage && (
          <Alert 
            severity="warning" 
            icon={<AlertTriangle className="w-5 h-5" />}
            className="mb-4"
          >
            {warningMessage}
          </Alert>
        )}
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={confirmLoading}>
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          color="primary" 
          variant="contained"
          disabled={confirmLoading}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisconnectConfirmationDialog;