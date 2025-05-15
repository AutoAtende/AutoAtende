import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Skeleton
} from '@mui/material';
import {
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../../../helpers/toast';
import api from '../../../services/api';

const CompanyInvoices = ({ open, onClose, companyId }) => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const loadInvoices = async () => {
    if (!companyId) return;
  
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

  // Manipuladores para paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dados paginados para exibição
  const paginatedInvoices = invoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Renderização de linhas de skeleton durante carregamento
  const renderSkeletonRows = () => {
    return Array.from(new Array(5)).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" width={100} /></TableCell>
      </TableRow>
    ));
  };

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
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small" aria-label="tabela de faturas">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Vencimento</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <TableCell>
                      {format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(invoice.value)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Enviar por WhatsApp">
                          <IconButton
                            size="small"
                            disabled={sending}
                            onClick={() => handleSendInvoice(invoice, 'whatsapp')}
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Enviar por Email">
                          <IconButton
                            size="small"
                            disabled={sending}
                            onClick={() => handleSendInvoice(invoice, 'email')}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Nenhuma fatura encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {!loading && invoices.length > 0 && (
          <TablePagination
            component="div"
            count={invoices.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        )}
        
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