import React, { useState, useEffect, useContext, useCallback } from "react";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import moment from "moment";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
  Container,
  TableContainer,
  useTheme as useMuiTheme,
  Alert,
  Collapse,
  Fab
} from "@mui/material";

import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  DeleteSweep as DeleteSweepIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import InvoicePreview from "../../components/InvoicePreview";
import api from "../../services/api";

const Financeiro = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkActionBarOpen, setBulkActionBarOpen] = useState(false);

  const isAdmin = user?.id === 1;

  useEffect(() => {
    loadInvoices();
  }, [user]);

  useEffect(() => {
    setBulkActionBarOpen(selectedInvoices.length > 0);
  }, [selectedInvoices]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (!isAdmin) {
        params.companyId = user.companyId;
      }

      const { data } = await api.get("/invoices/list", { params });

      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.error("Formato de resposta inválido:", data);
        setInvoices([]);
      }
    } catch (err) {
      console.error("Erro ao carregar faturas:", err);
      if (err.response?.status === 403) {
        toast.error(i18n.t("financial.accessDenied"));
      } else {
        toast.error(i18n.t("financial.errorLoadingInvoices"));
      }
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const selectableInvoices = invoices
        .filter(invoice => invoice.status !== "paid")
        .map(invoice => invoice.id);
      setSelectedInvoices(selectableInvoices);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleBulkDelete = async () => {
    setConfirmLoading(true);
    try {
      await api.post("/invoices/bulk-delete", { ids: selectedInvoices });
      toast.success(i18n.t("financial.invoicesDeleted", { count: selectedInvoices.length }));
      setSelectedInvoices([]);
      loadInvoices();
      setBulkDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("financial.errorDeletingInvoices"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoiceForView(invoice);
    setViewInvoiceModalOpen(true);
  };

  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmLoading(true);
    try {
      await api.delete(`/invoices/${selectedInvoice.id}`);
      toast.success(i18n.t("financial.invoiceDeleted"));
      loadInvoices();
      setDeleteModalOpen(false);
    } catch (err) {
      console.log(err);
      toast.error(i18n.t("financial.errorDeletingInvoice"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSendEmail = async (invoice) => {
    try {
      await api.post(`/invoices/${invoice.id}/send-email`);
      toast.success(i18n.t("financial.emailSent"));
    } catch (err) {
      console.log(err);
      toast.error(i18n.t("financial.errorSendingEmail"));
    }
  };

  const handleSendWhatsapp = async (invoice) => {
    try {
      await api.post(`/invoices/${invoice.id}/send-whatsapp`);
      toast.success(i18n.t("financial.whatsappSent"));
    } catch (err) {
      console.log(err);
      toast.error(i18n.t("financial.errorSendingWhatsapp"));
    }
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const getStatusColor = (invoice) => {
    if (invoice.status === "paid") return "success.main";
    return moment(invoice.dueDate).isBefore(moment(), "day")
      ? "error.main"
      : "warning.main";
  };

  const getStatusText = (status, dueDate) => {
    if (status === "paid") return i18n.t("financial.status.paid");
    return moment(dueDate).isBefore(moment(), "day")
      ? i18n.t("financial.status.overdue")
      : i18n.t("financial.status.pending");
  };

  const isValidDate = (date) => {
    return date && moment(date).isValid();
  };

  const renderMobileCard = (invoice) => (
    <Paper
      key={invoice.id}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          #{invoice.id}
        </Typography>
        {isAdmin && invoice.status !== "paid" && (
          <Checkbox
            checked={selectedInvoices.includes(invoice.id)}
            onChange={() => handleSelectInvoice(invoice.id)}
            color="primary"
          />
        )}
      </Box>
      
      {isAdmin && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {invoice.company?.name}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(invoice.value)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: getStatusColor(invoice),
            fontWeight: 'bold'
          }}
        >
          {getStatusText(invoice.status, invoice.dueDate)}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {i18n.t("financial.dueDate")}: {isValidDate(invoice.dueDate)
          ? moment(invoice.dueDate).format("DD/MM/YYYY")
          : "Data não informada"}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
        <IconButton 
          onClick={() => handleViewInvoice(invoice)}
          color="primary"
          size="small"
        >
          <ReceiptIcon />
        </IconButton>
        
        {isAdmin ? (
          <>
            <IconButton
              onClick={() => handleSendEmail(invoice)}
              color="primary"
              size="small"
            >
              <EmailIcon />
            </IconButton>
            <IconButton
              onClick={() => handleSendWhatsapp(invoice)}
              color="primary"
              size="small"
            >
              <WhatsAppIcon />
            </IconButton>
            <IconButton
              onClick={() => handleDeleteClick(invoice)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </>
        ) : invoice.status !== "paid" && (
          <Button
            variant="contained"
            size="small"
            onClick={() => handlePayment(invoice)}
          >
            {i18n.t("financial.pay")}
          </Button>
        )}
      </Box>
    </Paper>
  );

  const renderActionButtons = (invoice) => {
    if (isAdmin) {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={i18n.t("financial.viewInvoice")}>
            <IconButton
              size="small"
              onClick={() => handleViewInvoice(invoice)}
              color="primary"
            >
              <ReceiptIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={i18n.t("financial.sendEmail")}>
            <IconButton
              size="small"
              onClick={() => handleSendEmail(invoice)}
              color="primary"
            >
              <EmailIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={i18n.t("financial.sendWhatsapp")}>
            <IconButton
              size="small"
              onClick={() => handleSendWhatsapp(invoice)}
              color="primary"
            >
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={i18n.t("financial.deleteInvoice")}>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(invoice)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={i18n.t("financial.viewInvoice")}>
            <IconButton
              size="small"
              onClick={() => handleViewInvoice(invoice)}
              color="primary"
            >
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handlePayment(invoice)}
            disabled={invoice.status === "paid"}
          >
            {i18n.t("financial.pay")}
          </Button>
        </Box>
      );
    }
  };

  if (!user) {
    return (
      <MainContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("financial.title")}</Title>
      </MainHeader>
      
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
        {isMobile ? (
          <Box>
            {isAdmin && selectedInvoices.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  {selectedInvoices.length} {i18n.t("financial.selected")}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={() => setBulkDeleteModalOpen(true)}
                >
                  {i18n.t("financial.deleteSelected")}
                </Button>
              </Box>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : invoices.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {i18n.t("financial.noInvoices")}
                </Typography>
              </Paper>
            ) : (
              invoices.map(invoice => renderMobileCard(invoice))
            )}
          </Box>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {isAdmin && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedInvoices.length > 0 && selectedInvoices.length < invoices.filter(inv => inv.status !== "paid").length}
                          checked={selectedInvoices.length > 0 && selectedInvoices.length === invoices.filter(inv => inv.status !== "paid").length}
                          onChange={handleSelectAll}
                          color="primary"
                        />
                      </TableCell>
                    )}
                    {isAdmin && <TableCell>{i18n.t("financial.company")}</TableCell>}
                    <TableCell>{i18n.t("financial.tableInvoice")}</TableCell>
                    <TableCell>{i18n.t("financial.value")}</TableCell>
                    <TableCell>{i18n.t("financial.dueDate")}</TableCell>
                    <TableCell>{i18n.t("financial.status.tableHeader")}</TableCell>
                    <TableCell align="center">{i18n.t("financial.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRowSkeleton columns={isAdmin ? 7 : 6} />
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          {i18n.t("financial.noInvoices")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        {isAdmin && (
                          <TableCell padding="checkbox">
                            {invoice.status !== "paid" && (
                              <Checkbox
                                checked={selectedInvoices.includes(invoice.id)}
                                onChange={() => handleSelectInvoice(invoice.id)}
                                color="primary"
                              />
                            )}
                          </TableCell>
                        )}
                        {isAdmin && <TableCell>{invoice.company?.name}</TableCell>}
                        <TableCell>#{invoice.id}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(invoice.value)}
                        </TableCell>
                        <TableCell>
                          {isValidDate(invoice.dueDate)
                            ? moment(invoice.dueDate).format("DD/MM/YYYY")
                            : "Data não informada"}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: getStatusColor(invoice),
                              fontWeight: 'bold'
                            }}
                          >
                            {getStatusText(invoice.status, invoice.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {renderActionButtons(invoice)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      {/* Bulk Action Bar */}
      {isAdmin && (
        <Collapse in={bulkActionBarOpen}>
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              py: 2,
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: 1,
              borderColor: 'divider',
              zIndex: theme.zIndex.appBar,
            }}
            elevation={8}
          >
            <Typography variant="body1">
              {selectedInvoices.length} {i18n.t("financial.selected")}
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setBulkDeleteModalOpen(true)}
            >
              {i18n.t("financial.deleteSelected")}
            </Button>
          </Paper>
        </Collapse>
      )}

      {/* Modals */}
      {selectedInvoice && (
        <SubscriptionModal
          open={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedInvoice(null);
            loadInvoices();
          }}
          Invoice={selectedInvoice}
        />
      )}

      {selectedInvoiceForView && (
        <InvoicePreview
          open={viewInvoiceModalOpen}
          onClose={() => {
            setViewInvoiceModalOpen(false);
            setSelectedInvoiceForView(null);
          }}
          invoice={selectedInvoiceForView}
          payerCompany={selectedInvoiceForView.company}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{i18n.t("financial.confirmDelete")}</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography>{i18n.t("financial.deleteWarning")}</Typography>
          </Alert>
          <Typography variant="body1" gutterBottom>
            {i18n.t("financial.deleteConfirmation")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {i18n.t("financial.invoice")}: #{selectedInvoice?.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {i18n.t("financial.value")}:{" "}
            {selectedInvoice &&
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(selectedInvoice.value)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            color="inherit"
            disabled={confirmLoading}
          >
            {i18n.t("financial.cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={confirmLoading}
            startIcon={confirmLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {i18n.t("financial.confirmDelete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{i18n.t("financial.confirmBulkDelete")}</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography>
              {i18n.t("financial.bulkDeleteWarning", { count: selectedInvoices.length })}
            </Typography>
          </Alert>
          <Typography variant="body1" gutterBottom>
            {i18n.t("financial.bulkDeleteConfirmation")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {i18n.t("financial.selectedInvoices")}: {selectedInvoices.length}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setBulkDeleteModalOpen(false)}
            color="inherit"
            disabled={confirmLoading}
          >
            {i18n.t("financial.cancel")}
          </Button>
          <Button
            onClick={handleBulkDelete}
            color="error"
            variant="contained"
            disabled={confirmLoading}
            startIcon={confirmLoading ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
          >
            {i18n.t("financial.confirmBulkDelete")}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Financeiro;