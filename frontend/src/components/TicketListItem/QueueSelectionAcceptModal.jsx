import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Queue as QueueIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { i18n } from '../../translate/i18n';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    minWidth: 400,
    maxWidth: 500,
  },
}));

const QueueOption = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5),
  '&::before': {
    content: '""',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: color || theme.palette.grey[400],
    flexShrink: 0,
  },
}));

const QueueSelectionAcceptModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  ticket,
  userQueues = [],
  loading = false 
}) => {
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [availableQueues, setAvailableQueues] = useState([]);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [error, setError] = useState('');

  // Carregar filas disponíveis para o usuário
  const loadUserQueues = useCallback(async () => {
    if (!open) return;
    
    try {
      setLoadingQueues(true);
      setError('');
      
      // Se já temos as filas do usuário via props, usar elas
      if (userQueues && userQueues.length > 0) {
        const activeQueues = userQueues.filter(queue => queue.isActive !== false);
        setAvailableQueues(activeQueues);
        return;
      }

      // Caso contrário, buscar do backend
      const { data } = await api.get('/queue');
      const activeQueues = data.filter(queue => queue.isActive !== false);
      setAvailableQueues(activeQueues);
      
    } catch (err) {
      console.error('Erro ao carregar filas:', err);
      setError('Erro ao carregar filas disponíveis');
      toast.error('Erro ao carregar filas disponíveis');
    } finally {
      setLoadingQueues(false);
    }
  }, [open, userQueues]);

  useEffect(() => {
    loadUserQueues();
  }, [loadUserQueues]);

  // Reset do modal quando abrir/fechar
  useEffect(() => {
    if (open) {
      setSelectedQueueId('');
      setError('');
    }
  }, [open]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setSelectedQueueId('');
      setError('');
      onClose();
    }
  }, [loading, onClose]);

  const handleConfirm = useCallback(async () => {
    if (!selectedQueueId) {
      setError('Selecione uma fila para prosseguir');
      return;
    }

    try {
      await onConfirm(parseInt(selectedQueueId));
    } catch (err) {
      console.error('Erro ao aceitar ticket:', err);
      setError('Erro ao aceitar o ticket. Tente novamente.');
    }
  }, [selectedQueueId, onConfirm]);

  const handleQueueChange = useCallback((event) => {
    setSelectedQueueId(event.target.value);
    setError('');
  }, []);

  const renderQueueOption = (queue) => (
    <QueueOption color={queue.color}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {queue.name}
      </Typography>
    </QueueOption>
  );

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6" component="span">
            Selecionar Fila do Atendimento
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {ticket && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Contato:</strong> {ticket.contact?.name || 'Não informado'}
              <br />
              <strong>Número:</strong> {ticket.contact?.number || 'Não informado'}
            </Typography>
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Este ticket não possui uma fila definida. Selecione uma fila para aceitar o atendimento.
        </Typography>

        {loadingQueues ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : availableQueues.length === 0 ? (
          <Alert severity="warning">
            Nenhuma fila disponível. Verifique suas permissões ou entre em contato com o administrador.
          </Alert>
        ) : (
          <FormControl fullWidth variant="outlined" error={!!error}>
            <InputLabel id="queue-select-label">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QueueIcon fontSize="small" />
                Selecione uma fila
              </Box>
            </InputLabel>
            <Select
              labelId="queue-select-label"
              value={selectedQueueId}
              onChange={handleQueueChange}
              label="Selecione uma fila"
              disabled={loading}
            >
              {availableQueues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id.toString()}>
                  {renderQueueOption(queue)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {availableQueues.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {availableQueues.length} fila(s) disponível(is)
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<CloseIcon />}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedQueueId || loading || loadingQueues}
          startIcon={loading ? <CircularProgress size={16} /> : <AssignmentIcon />}
        >
          {loading ? 'Aceitando...' : 'Aceitar Atendimento'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

QueueSelectionAcceptModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  ticket: PropTypes.object,
  userQueues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    isActive: PropTypes.bool
  })),
  loading: PropTypes.bool
};

export default QueueSelectionAcceptModal;