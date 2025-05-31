import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../../../helpers/toast';
import { AuthContext } from '../../../context/Auth/AuthContext';
import api from '../../../services/api';

// Componentes
import StandardDataTable from '../../../components/shared/StandardDataTable';

const CompanyInvoices = ({ open, onClose, companyId }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [invoices, setInvoices] = useState([]);

  const loadInvoices = async () => {
    if (!companyId || !user) return;
  
    setLoading(true);
    try {
      const { data } = await api.get(`/companies/${companyId}/invoices`);
      setInvoices(data);
    } catch (error) {
      toast.error('Erro ao carregar faturas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadInvoices();
    }
  }, [open, companyId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Vencido';
      default:
        return status;
    }
  };

  const handleSendInvoice = async (invoice, type) => {
    setSending(true);
    try {
      await api.post(`/companies/${companyId}/send-invoice-${type}`, {
        invoiceId: invoice.id
      });
      toast.success(`Fatura enviada por ${type === 'email' ? 'e-mail' : 'WhatsApp'}`);
    } catch (error) {
      toast.error(`Erro ao enviar fatura por ${type === 'email' ? 'e-mail' : 'WhatsApp'}`);
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  // Configuração das colunas
  const columns = [
    {
      id: 'dueDate',
      field: 'dueDate',
      label: 'Vencimento',
      width: 150,
      render: (invoice) => (
        format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: ptBR })
      )
    },
    {
      id: 'value',
      field: 'value',
      label: 'Valor',
      width: 120,
      render: (invoice) => (
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(invoice.value)
      )
    },
    {
      id: 'status',
      field: 'status',
      label: 'Status',
      width: 120,
      render: (invoice) => (
        <Chip
          label={getStatusLabel(invoice.status)}
          color={getStatusColor(invoice.status)}
          size="small"
        />
      )
    }
  ];

  // Ações da tabela
  const tableActions = [
    {
      label: "Enviar por WhatsApp",
      icon: <WhatsAppIcon />,
      onClick: (invoice) => handleSendInvoice(invoice, 'whatsapp'),
      color: "success",
      disabled: sending
    },
    {
      label: "Enviar por Email",
      icon: <EmailIcon />,
      onClick: (invoice) => handleSendInvoice(invoice, 'email'),
      color: "primary",
      disabled: sending
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <MoneyIcon color="primary" />
            <Typography variant="h6">Faturas</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <StandardDataTable
          data={invoices}
          columns={columns}
          loading={loading}
          actions={tableActions}
          stickyHeader={false}
          size="small"
          hover={true}
          maxVisibleActions={2}
          emptyIcon={<MoneyIcon />}
          emptyTitle="Nenhuma fatura encontrada"
          emptyDescription="Não há faturas cadastradas para esta empresa."
          pagination={false} // Desabilitar paginação para modais
        />
        
        {sending && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompanyInvoices;