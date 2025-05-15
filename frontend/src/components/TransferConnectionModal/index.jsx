import React, { useState, useEffect } from 'react';
import makeStyles from "@mui/styles/makeStyles";
import { 
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon
} from "@mui/icons-material";
import { i18n } from "../../translate/i18n";
import BaseModal from "../shared/BaseModal";

const useStyles = makeStyles((theme) => ({
  warningContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.warning.light,
    borderRadius: theme.shape.borderRadius,
    "& .MuiSvgIcon-root": {
      color: theme.palette.warning.main,
    },
  },
  formContainer: {
    marginTop: theme.spacing(3),
  },
  warningIcon: {
    fontSize: 32,
  },
  buttonProgress: {
    color: theme.palette.primary.main,
  },
  contentContainer: {
    marginTop: theme.spacing(2)
  }
}));

const TransferConnectionModal = ({ 
  open, 
  onClose, 
  sourceWhatsAppId,
  whatsApps,
  onConfirm,
  loading 
}) => {
  const classes = useStyles();
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [availableConnections, setAvailableConnections] = useState([]);

  useEffect(() => {
    const filteredConnections = whatsApps.filter(
      whatsApp => whatsApp.id !== sourceWhatsAppId
    );
    setAvailableConnections(filteredConnections);
  }, [whatsApps, sourceWhatsAppId]);

  const handleConfirm = () => {
    if (!selectedConnectionId) return;
    onConfirm(selectedConnectionId);
  };

  const handleClose = () => {
    setSelectedConnectionId('');
    onClose();
  };

  const sourceWhatsApp = whatsApps.find(wa => wa.id === sourceWhatsAppId);

  // Definindo ações para o BaseModal
  const modalActions = [
    {
      label: i18n.t("transferTicketsModal.buttons.cancel"),
      onClick: handleClose,
      color: "inherit",
      variant: "text",
      disabled: loading,
      icon: <CloseIcon />
    },
    {
      label: i18n.t("transferTicketsModal.buttons.confirm"),
      onClick: handleConfirm,
      color: "primary",
      variant: "contained",
      disabled: !selectedConnectionId || loading,
      icon: loading ? <CircularProgress size={20} className={classes.buttonProgress} /> : <SwapIcon />
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={i18n.t("transferTicketsModal.title") || "Transferir Conexão"}
      actions={modalActions}
      loading={loading}
      maxWidth="sm"
    >
      <div className={classes.contentContainer}>
        <div className={classes.warningContainer}>
          <WarningIcon className={classes.warningIcon} />
          <Typography variant="h6">
            {i18n.t("transferTicketsModal.warning")}
          </Typography>
        </div>
        
        <Typography variant="body1" gutterBottom>
          {i18n.t("transferTicketsModal.description")}
        </Typography>

        {sourceWhatsApp && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Conexão de origem: {sourceWhatsApp.name} ({sourceWhatsApp.number})
            </Typography>
          </Box>
        )}

<Alert severity="info" style={{ marginBottom: '16px' }}>
  <AlertTitle>Informação sobre a transferência</AlertTitle>
  <Typography variant="body2">
    Se já existirem tickets para os mesmos contatos na conexão de destino, o sistema mesclará automaticamente 
    os históricos de conversa. Todas as mensagens serão preservadas.
  </Typography>
</Alert>

        <FormControl fullWidth className={classes.formContainer}>
          <InputLabel>
            {i18n.t("transferTicketsModal.selectLabel")}
          </InputLabel>
          <Select
            value={selectedConnectionId}
            onChange={(e) => setSelectedConnectionId(e.target.value)}
            label={i18n.t("transferTicketsModal.selectLabel")}
          >
            {availableConnections.map((connection) => (
              <MenuItem key={connection.id} value={connection.id}>
                {connection.name} ({connection.number})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </BaseModal>
  );
};

export default TransferConnectionModal;