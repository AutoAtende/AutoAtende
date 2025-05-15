import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { i18n } from '../../translate/i18n';
import { ButtonGroup, DialogTitle } from "./style";
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import CloseIcon from '@mui/icons-material/Close';

const ShowTicketValueModal = ({ open, onClose, onSave, ticket, ticketValue, ticketSku }) => {
  const [value, setValue] = useState(ticketValue ? Number(ticketValue) : 0); // Ensure initial value is a number
  const [sku, setSku] = useState(ticketSku);

  const handleValueChange = (e) => setValue(e.target.value);
  const handleSkuChange = (e) => setSku(e.target.value);

  const handleSave = () => {
    onSave(value, sku); // Pass the formatted value for saving
    onClose();
  };

  useEffect(() => {
    if (ticketValue) {
      setValue(Number(ticketValue)); // Format initial value
    }
    if (ticketSku) {
      setSku(ticketSku);
    }
  }, [ticketValue, ticketSku]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle>{i18n.t('ticket.sku.skuValue')}</DialogTitle>
        <TextField
          autoFocus
          margin="dense"
          id="value"
          label="Valor"
          type="text"
          fullWidth
          value={value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/\D/g, '');
            const formattedValue = (Number(rawValue) / 100).toFixed(2);
            setValue(formattedValue);
          }}
        />
        <p style={{ marginTop: '15px' }}/>
        <DialogTitle>{i18n.t('ticket.sku.skuCode')}</DialogTitle>
        <TextField
          margin="dense"
          id="sku"
          label="SKU"
          type="text"
          fullWidth
          value={sku}
          onChange={handleSkuChange}
        />
      </DialogContent>
        <ButtonGroup>
          <Button
            onClick={onClose}
            color="secondary"
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            {i18n.t("newTicketModal.buttons.cancel")}
          </Button>
          <Button
            variant="contained"
            type="button"
            onClick={handleSave}
            color="primary"
            startIcon={<PriceCheckIcon />}
          >
            {i18n.t("newTicketModal.buttons.ok")}
          </Button>
        </ButtonGroup>
    </Dialog>
  );
};

export default ShowTicketValueModal;