import React, { useState, useEffect, useContext } from "react";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import moment from "moment";

import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableBody,
  TableContainer,
  Paper,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Receipt as ReceiptIcon,
  DeleteSweep as DeleteSweepIcon,
  FilterList as FilterListIcon
} from "@mui/icons-material";

// Componentes
import StandardPageLayout from "../../components/StandardPageLayout";
import SubscriptionModal from "../../components/SubscriptionModal";
import InvoicePreview from "../../components/InvoicePreview";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";

const Financeiro = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Verificar se o usuário é super administrador
  const isAdmin = user?.profile === "admin" && user?.super === true;

  useEffect(() => {
    loadInvoices();
    if (isAdmin) {
      loadCompanies();
    }
  }, [user, selectedCompany, statusFilter]);

  const loadCompanies = async () => {
    try {
      const { data } = await api.get("/companies/basic/list");
      setCompanies(data);
    } catch (err) {
      console.error("Erro ao carregar empresas:", err);
      toast.error(i18n.t("financial.errorLoadingCompanies"));
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter !== "all" ? statusFilter : undefined
      };
      
      if (isAdmin && selectedCompany) {
        params.companyId = selectedCompany;
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

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchInvoice = 
      invoice.id.toString().includes(searchValue) || 
      (invoice.detail && invoice.detail.toLowerCase().includes(searchValue.toLowerCase())) ||
      (invoice.company?.name && invoice.company.name.toLowerCase().includes(searchValue.toLowerCase()));
    
    return searchInvoice;
  });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const selectableInvoices = filteredInvoices
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
      console.error(err);
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
      console.error(err);
      toast.error(i18n.t("financial.errorSendingEmail"));
    }
  };

  const handleSendWhatsapp = async (invoice) => {
    try {
      await api.post(`/invoices/${invoice.id}/send-whatsapp`);
      toast.success(i18n.t("financial.whatsappSent"));
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("financial.errorSendingWhatsapp"));
    }
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const handleFilterApply = () => {
    loadInvoices();
    setFilterModalOpen(false);
  };

  const getStatusColor = (invoice) => {
    if (invoice.status === "paid") return "success.main";
    return moment(invoice.dueDate, "DD-MM-YYYY").isBefore(moment(), "day")
      ? "error.main"
      : "warning.main";
  };

  const getStatusText = (status, dueDate) => {
    if (status === "paid") return i18n.t("financial.status.paid");
    return moment(dueDate, "DD-MM-YYYY").isBefore(moment(), "day")
      ? i18n.t("financial.status.overdue")
      : i18n.t("financial.status.pending");
  };

  const isValidDate = (date) => {
    return date && moment(date, "DD-MM-YYYY").isValid();
  };

  // Configuração das ações do cabeçalho
  const pageActions = [
    ...(isAdmin && selectedInvoices.length > 0 ? [
      {
        label: i18n.t("financial.deleteSelected"),
        onClick: () => setBulkDeleteModalOpen(true),
        icon: <DeleteSweepIcon />,
        variant: "contained",
        color: "error",
        tooltip: `Excluir ${selectedInvoices.length} fatura(s) selecionada(s)`
      }
    ] : []),
    {
      label: i18n.t("financial.filter"),
      onClick: () => setFilterModalOpen(true),
      icon: <FilterListIcon />,
      variant: "outlined",
      color: "primary",
      tooltip: "Filtrar faturas"
    }
  ];

  // Renderização do card para dispositivos móveis
  const renderMobileCard = (invoice) => (
    <Paper
      key={invoice.id}
      sx={{
        p: 2,
        mb: 2,
        position: 'relative'
      }}
      variant="outlined"
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
      
      {isAdmin && invoice.company && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {invoice.company.name}
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
          ? moment(invoice.dueDate, "DD-MM-YYYY").format("DD/MM/YYYY")
          : i18n.t("financial.noDate")}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
        <Tooltip title={i18n.t("financial.viewInvoice")}>
          <IconButton 
            onClick={() => handleViewInvoice(invoice)}
            color="primary"
            size="small"
          >
            <ReceiptIcon />
          </IconButton>
        </Tooltip>
        
        {isAdmin ? (
          <>
            <Tooltip title={i18n.t("financial.sendEmail")}>
              <IconButton
                onClick={() => handleSendEmail(invoice)}
                color="primary"
                size="small"
              >
                <EmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("financial.sendWhatsapp")}>
              <IconButton
                onClick={() => handleSendWhatsapp(invoice)}
                color="primary"
                size="small"
              >
                <WhatsAppIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.t("financial.deleteInvoice")}>
              <IconButton
                onClick={() => handleDeleteClick(invoice)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : invoice.status !== "paid" && (
          <Button
            variant="contained"
            size="small"
            onClick={() => handlePayment(invoice)}
            color="primary"
          >
            {i18n.t("financial.pay")}
          </Button>
        )}
      </Box>
    </Paper>
  );

  // Renderização dos botões de ação para a tabela
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
          {invoice.status !== "paid" && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handlePayment(invoice)}
            >
              {i18n.t("financial.pay")}
            </Button>
          )}
        </Box>
      );
    }
  };

  // Conteúdo da tabela para desktop e mobile
  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (filteredInvoices.length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
          <ReceiptIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchValue ? "Nenhuma fatura encontrada" : i18n.t("financial.noInvoicesTitle")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchValue ? "Tente ajustar sua pesquisa" : i18n.t("financial.noInvoicesMessage")}
          </Typography>
        </Box>
      );
    }

    if (isMobile) {
      return (
        <Box sx={{ p: 2 }}>
          {filteredInvoices.map(invoice => renderMobileCard(invoice))}
        </Box>
      );
    }

    return (
      <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {isAdmin && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedInvoices.length > 0 && 
                      selectedInvoices.length < filteredInvoices.filter(inv => inv.status !== "paid").length
                    }
                    checked={
                      selectedInvoices.length > 0 && 
                      selectedInvoices.length === filteredInvoices.filter(inv => inv.status !== "paid").length &&
                      filteredInvoices.filter(inv => inv.status !== "paid").length > 0
                    }
                    onChange={handleSelectAll}
                    color="primary"
                  />
                </TableCell>
              )}
              <TableCell>{i18n.t("financial.id")}</TableCell>
              {isAdmin && <TableCell>{i18n.t("financial.company")}</TableCell>}
              <TableCell>{i18n.t("financial.value")}</TableCell>
              <TableCell>{i18n.t("financial.dueDate")}</TableCell>
              <TableCell>{i18n.t("financial.status.tableHeader")}</TableCell>
              <TableCell align="center">{i18n.t("financial.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
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
                <TableCell>#{invoice.id}</TableCell>
                {isAdmin && <TableCell>{invoice.company?.name || ""}</TableCell>}
                <TableCell>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(invoice.value)}
                </TableCell>
                <TableCell>
                  {isValidDate(invoice.dueDate)
                    ? moment(invoice.dueDate, "DD-MM-YYYY").format("DD/MM/YYYY")
                    : i18n.t("financial.noDate")}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (!user) {
    return (
      <StandardPageLayout title={i18n.t("financial.title")}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      </StandardPageLayout>
    );
  }

  return (
    <>
      <StandardPageLayout
        title={i18n.t("financial.title")}
        actions={pageActions}
        searchValue={searchValue}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("financial.searchPlaceholder")}
        showSearch={true}
        loading={loading}
      >
        {renderContent()}
      </StandardPageLayout>

      {/* Modal de Filtros */}
      <Dialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1 }}>
          {i18n.t("financial.filterTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Filtro de Status */}
            <FormControl fullWidth>
              <InputLabel>{i18n.t("financial.status.tableHeader")}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={i18n.t("financial.status.tableHeader")}
              >
                <MenuItem value="all">{i18n.t("financial.filterAllStatus")}</MenuItem>
                <MenuItem value="pending">{i18n.t("financial.status.pending")}</MenuItem>
                <MenuItem value="paid">{i18n.t("financial.status.paid")}</MenuItem>
                <MenuItem value="overdue">{i18n.t("financial.status.overdue")}</MenuItem>
              </Select>
            </FormControl>

            {/* Filtro de Empresa (apenas para admins) */}
            {isAdmin && (
              <FormControl fullWidth>
                <InputLabel>{i18n.t("financial.company")}</InputLabel>
                <Select
                  value={selectedCompany || ""}
                  onChange={(e) => setSelectedCompany(e.target.value || null)}
                  label={i18n.t("financial.company")}
                >
                  <MenuItem value="">{i18n.t("financial.allCompanies")}</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1 }}>
          <Button onClick={() => setFilterModalOpen(false)} color="inherit">
            {i18n.t("financial.cancel")}
          </Button>
          <Button
            onClick={handleFilterApply}
            variant="contained"
            color="primary"
          >
            {i18n.t("financial.apply")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Pagamento */}
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

      {/* Modal de Visualização de Fatura */}
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

      {/* Modal de Confirmação de Exclusão */}
      {deleteModalOpen && (
        <ConfirmationModal
          title={i18n.t("financial.confirmDelete")}
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        >
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
        </ConfirmationModal>
      )}

      {/* Modal de Confirmação de Exclusão em Massa */}
      {bulkDeleteModalOpen && (
        <ConfirmationModal
          title={i18n.t("financial.confirmBulkDelete")}
          open={bulkDeleteModalOpen}
          onClose={() => setBulkDeleteModalOpen(false)}
          onConfirm={handleBulkDelete}
        >
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
        </ConfirmationModal>
      )}
    </>
  );
};

export default Financeiro;