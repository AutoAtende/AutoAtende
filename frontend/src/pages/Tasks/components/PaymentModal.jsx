import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Receipt as ReceiptIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import moment from 'moment';

const PaymentModal = ({ open, onClose, onConfirm, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [paymentDate, setPaymentDate] = useState(moment().format('YYYY-MM-DD'));
  const [paymentNotes, setPaymentNotes] = useState('');
  const [sendReceipt, setSendReceipt] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      paymentDate,
      paymentNotes,
      sendReceipt
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? null : onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReceiptIcon color="primary" />
          <Typography variant="h6">{i18n.t('taskCharges.registerPayment')}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        <Grid container spacing={2} sx={{ mt: isMobile ? 0 : 1 }}>
          <Grid item xs={12}>
            <TextField
              label={i18n.t('taskCharges.paymentDate')}
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={i18n.t('taskCharges.paymentNotes')}
              multiline
              rows={isMobile ? 3 : 4}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              fullWidth
              disabled={loading}
              placeholder={i18n.t('taskCharges.paymentNotesPlaceholder')}
              margin="dense"
            />
            </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendReceipt}
                  onChange={(e) => setSendReceipt(e.target.checked)}
                  disabled={loading}
                />
              }
              label={i18n.t('taskCharges.sendReceipt')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: isMobile ? 2 : 1.5, flexDirection: isMobile ? 'column' : 'row' }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          fullWidth={isMobile}
          sx={{ mb: isMobile ? 1 : 0 }}
        >
          {i18n.t('buttons.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          fullWidth={isMobile}
        >
          {loading ? i18n.t('buttons.processing') : i18n.t('buttons.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;