'use client';

import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { Person as PersonIcon, Close as CloseIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import { toast } from '../../helpers/toast';

interface Queue {
  id: number;
  name: string;
  color: string;
}

interface NewTicketModalProps {
  open: boolean;
  onClose: (ticket?: any) => void;
}

const NewTicketModal: React.FC<NewTicketModalProps> = ({ open, onClose }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactNumber: '',
    contactName: '',
    queueId: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleQueueChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      queueId: event.target.value
    }));
    
    if (errors.queueId) {
      setErrors(prev => ({
        ...prev,
        queueId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Número do contato é obrigatório';
    } else if (!/^\d{10,15}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Número deve ter entre 10 e 15 dígitos';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Nome do contato é obrigatório';
    }

    if (!formData.queueId) {
      newErrors.queueId = 'Fila é obrigatória';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem inicial é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const ticketData = {
        contactNumber: formData.contactNumber.replace(/\D/g, ''),
        contactName: formData.contactName.trim(),
        queueId: parseInt(formData.queueId),
        message: formData.message.trim(),
        userId: user?.id,
      };

      const { data } = await api.post('/tickets', ticketData);
      
      toast.success('Ticket criado com sucesso!');
      onClose(data);
      
      // Reset form
      setFormData({
        contactNumber: '',
        contactName: '',
        queueId: '',
        message: '',
      });
      setErrors({});
      
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form
      setFormData({
        contactNumber: '',
        contactName: '',
        queueId: '',
        message: '',
      });
      setErrors({});
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(event.target.value);
    setFormData(prev => ({
      ...prev,
      contactNumber: formatted
    }));
    
    if (errors.contactNumber) {
      setErrors(prev => ({
        ...prev,
        contactNumber: ''
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon color="primary" />
          <Typography variant="h6">Novo Ticket</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Número do Contato"
            value={formData.contactNumber}
            onChange={handlePhoneChange}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber || 'Ex: (11) 99999-9999'}
            placeholder="(11) 99999-9999"
            fullWidth
            disabled={loading}
            inputProps={{
              maxLength: 15
            }}
          />

          <TextField
            label="Nome do Contato"
            value={formData.contactName}
            onChange={handleInputChange('contactName')}
            error={!!errors.contactName}
            helperText={errors.contactName}
            fullWidth
            disabled={loading}
          />

          <FormControl fullWidth error={!!errors.queueId} disabled={loading}>
            <InputLabel>Fila</InputLabel>
            <Select
              value={formData.queueId}
              label="Fila"
              onChange={handleQueueChange}
            >
              {user?.queues?.map((queue: Queue) => (
                <MenuItem key={queue.id} value={queue.id.toString()}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      bgcolor={queue.color}
                    />
                    {queue.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.queueId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.queueId}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Mensagem Inicial"
            value={formData.message}
            onChange={handleInputChange('message')}
            error={!!errors.message}
            helperText={errors.message}
            multiline
            rows={3}
            fullWidth
            disabled={loading}
            placeholder="Digite a primeira mensagem do ticket..."
          />

          {Object.keys(errors).length > 0 && (
            <Alert severity="error">
              Por favor, corrija os erros acima antes de continuar.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonIcon />}
        >
          {loading ? 'Criando...' : 'Criar Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTicketModal;