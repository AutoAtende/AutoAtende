import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  MoneyOff as MoneyOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AuthContext } from '../../../context/Auth/AuthContext';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import moment from 'moment';

// Modal para registrar pagamento
const PaymentModal = ({ open, onClose, onConfirm, loading }) => {
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
    <Dialog open={open} onClose={loading ? null : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReceiptIcon color="primary" />
          <Typography variant="h6">{i18n.t('taskCharges.registerPayment')}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label={i18n.t('taskCharges.paymentDate')}
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={i18n.t('taskCharges.paymentNotes')}
              multiline
              rows={3}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              fullWidth
              disabled={loading}
              placeholder={i18n.t('taskCharges.paymentNotesPlaceholder')}
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
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {i18n.t('buttons.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {loading ? i18n.t('buttons.processing') : i18n.t('buttons.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente principal de cobranças
const TaskChargeComponent = ({ task, onUpdate, disabled = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);

  const [chargeValue, setChargeValue] = useState('');
  const [hasCharge, setHasCharge] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  // Atualizar estado com base nas propriedades da tarefa
  useEffect(() => {
    if (task) {
      setHasCharge(task.hasCharge || false);
      setIsPaid(task.isPaid || false);
      setChargeValue(task.chargeValue ? task.chargeValue.toString() : '');
    }
  }, [task]);

  // Função para adicionar cobrança à tarefa
  const handleAddCharge = async () => {
    if (!chargeValue || parseFloat(chargeValue) <= 0) {
      toast.error(i18n.t('taskCharges.invalidValue'));
      return;
    }

    setLoading(true);
    try {
      // Fazer requisição à API para adicionar cobrança
      const response = await api.post(`/task/${task.id}/charge`, {
        chargeValue: parseFloat(chargeValue)
      });

      toast.success(i18n.t('taskCharges.chargeAdded'));

      // Atualizar o estado local
      setHasCharge(true);
      setIsPaid(false);

      // Notificar o componente pai
      if (onUpdate) {
        onUpdate(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao adicionar cobrança:', error);
      setError(error.response?.data?.error || i18n.t('taskCharges.errorAddingCharge'));
      toast.error(error.response?.data?.error || i18n.t('taskCharges.errorAddingCharge'));
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar PDF da cobrança
  const handleGeneratePDF = async () => {
    setActionLoading(true);
    try {
      const response = await api.get(`/task/${task.id}/charge/pdf`);
      
      const pdfUrl = response.data.data.url;
      window.open(pdfUrl, '_blank');
      
      toast.success(i18n.t('taskCharges.pdfGenerated'));
      
      // Atualizar o componente pai se necessário
      if (onUpdate) {
        // Recarregar a tarefa para obter o link do PDF atualizado
        const updatedTask = await api.get(`/task/${task.id}`);
        onUpdate(updatedTask.data);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError(error.response?.data?.error || i18n.t('taskCharges.errorGeneratingPDF'));
      toast.error(error.response?.data?.error || i18n.t('taskCharges.errorGeneratingPDF'));
    } finally {
      setActionLoading(false);
    }
  };

  // Função para enviar cobrança por email
  const handleSendEmail = async () => {
    setActionLoading(true);
    try {
      await api.post(`/task/${task.id}/charge/email`);
      toast.success(i18n.t('taskCharges.emailSent'));
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setError(error.response?.data?.error || i18n.t('taskCharges.errorSendingEmail'));
      toast.error(error.response?.data?.error || i18n.t('taskCharges.errorSendingEmail'));
    } finally {
      setActionLoading(false);
    }
  };

  // Função para abrir modal de registro de pagamento
  const handleOpenPaymentModal = () => {
    setOpenPaymentModal(true);
  };

  // Função para registrar pagamento
  const handleRegisterPayment = async (paymentData) => {
    setActionLoading(true);
    try {
      const response = await api.post(`/task/${task.id}/charge/payment`, paymentData);
      
      toast.success(i18n.t('taskCharges.paymentRegistered'));
      
      // Atualizar o estado local
      setIsPaid(true);
      
      // Fechar o modal
      setOpenPaymentModal(false);
      
      // Notificar o componente pai
      if (onUpdate) {
        onUpdate(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      setError(error.response?.data?.error || i18n.t('taskCharges.errorRegisteringPayment'));
      toast.error(error.response?.data?.error || i18n.t('taskCharges.errorRegisteringPayment'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          {i18n.t('taskCharges.title')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!hasCharge ? (
        // Formulário para adicionar cobrança
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {i18n.t('taskCharges.addChargeDescription')}
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                label={i18n.t('taskCharges.value')}
                value={chargeValue}
                onChange={(e) => setChargeValue(e.target.value)}
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading || disabled}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAddCharge}
                disabled={loading || disabled || !chargeValue || parseFloat(chargeValue) <= 0}
                startIcon={loading ? <CircularProgress size={20} /> : <AttachMoneyIcon />}
              >
                {loading ? i18n.t('buttons.processing') : i18n.t('taskCharges.addCharge')}
              </Button>
            </Grid>
          </Grid>

          {task.employerId ? null : (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {i18n.t('taskCharges.noEmployerWarning')}
            </Alert>
          )}
        </Box>
      ) : (
        // Informações e ações para cobrança existente
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">{i18n.t('taskCharges.value')}</Typography>
              <Typography variant="h5">R$ {parseFloat(chargeValue).toFixed(2)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">{i18n.t('taskCharges.status')}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {isPaid ? (
                  <>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body1" color="success.main">
                      {i18n.t('taskCharges.paid')}
                    </Typography>
                  </>
                ) : (
                  <>
                    <MoneyOffIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="body1" color="error">
                      {i18n.t('taskCharges.pending')}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>

            {isPaid && task.paymentDate && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">{i18n.t('taskCharges.paymentDate')}</Typography>
                <Typography variant="body1">
                  {moment(task.paymentDate).format('DD/MM/YYYY')}
                </Typography>
                {task.paymentNotes && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>{i18n.t('taskCharges.notes')}</Typography>
                    <Typography variant="body2">{task.paymentNotes}</Typography>
                  </>
                )}
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={isPaid ? 6 : 4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGeneratePDF}
                disabled={actionLoading || disabled}
                startIcon={actionLoading ? <CircularProgress size={20} /> : <PdfIcon />}
              >
                {i18n.t('taskCharges.generatePDF')}
              </Button>
            </Grid>

            <Grid item xs={12} sm={isPaid ? 6 : 4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSendEmail}
                disabled={actionLoading || disabled || (!task.requesterEmail && !task.employer?.email)}
                startIcon={actionLoading ? <CircularProgress size={20} /> : <EmailIcon />}
              >
                {i18n.t('taskCharges.sendEmail')}
              </Button>
            </Grid>

            {!isPaid && (
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleOpenPaymentModal}
                  disabled={actionLoading || disabled}
                  startIcon={actionLoading ? <CircularProgress size={20} /> : <ReceiptIcon />}
                >
                  {i18n.t('taskCharges.registerPayment')}
                </Button>
              </Grid>
            )}
          </Grid>

          {(!task.requesterEmail && !task.employer?.email) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {i18n.t('taskCharges.noEmailWarning')}
            </Alert>
          )}
        </Box>
      )}

      <PaymentModal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        onConfirm={handleRegisterPayment}
        loading={actionLoading}
      />
    </Paper>
  );
};

export default TaskChargeComponent;