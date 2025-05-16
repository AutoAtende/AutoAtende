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
  useTheme
} from "@mui/material";

import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Receipt as ReceiptIcon,
  DeleteSweep as DeleteSweepIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from "@mui/icons-material";

// Componentes Base
import BasePage from "../../components/BasePage";
import BasePageHeader from "../../components/BasePageHeader";
import BasePageContent from "../../components/BasePageContent";
import BasePageFooter from "../../components/BasePageFooter";
import BaseButton from "../../components/BaseButton";
import BaseModal from "../../components/BaseModal";
import BaseEmptyState from "../../components/BaseEmptyState";

// Componentes específicos da aplicação
import SubscriptionModal from "../../components/SubscriptionModal";
import InvoicePreview from "../../components/InvoicePreview";
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
  const isAdmin = user?.profile === "admin" && user?.isSuper === true;

  useEffect(() => {
    loadInvoices();
    if (isAdmin) {
      loadCompanies();
    }
  }, [user, selectedCompany, statusFilter]);

  const loadCompanies = async () => {
    try {
      const { data } = await api.get("/companies/list");
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

  // Botões para o cabeçalho da página
  const headerActions = [
    ...(isAdmin && selectedInvoices.length > 0 ? [
      {
        label: i18n.t("financial.deleteSelected"),
        onClick: () => setBulkDeleteModalOpen(true),
        icon: <DeleteSweepIcon />,
        variant: "contained",
        color: "error"
      }
    ] : []),
    {
      label: i18n.t("financial.filter"),
      onClick: () => setFilterModalOpen(true),
      icon: <FilterListIcon />,
      variant: "outlined"
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
          <BaseButton
            variant="contained"
            size="small"
            onClick={() => handlePayment(invoice)}
          >
            {i18n.t("financial.pay")}
          </BaseButton>
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
            <BaseButton
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handlePayment(invoice)}
            >
              {i18n.t("financial.pay")}
            </BaseButton>
          )}
        </Box>
      );
    }
  };

  // Conteúdo da tabela para desktop
  const renderTableContent = () => (
    <TableContainer>
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
          {filteredInvoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">
                  {i18n.t("financial.noInvoices")}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredInvoices.map((invoice) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Componente de estado vazio
  const emptyStateProps = {
    icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
    title: i18n.t("financial.noInvoicesTitle"),
    message: i18n.t("financial.noInvoicesMessage"),
    showButton: false
  };

  if (!user) {
    return (
      <BasePage>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </BasePage>
    );
  }

  return (
    <BasePage
      title={i18n.t("financial.title")}
      headerContent={
        <BasePageHeader
          onSearch={handleSearch}
          searchValue={searchValue}
          searchPlaceholder={i18n.t("financial.searchPlaceholder")}
          showSearch={true}
          actions={headerActions}
        />
      }
    >
      <BasePageContent
        loading={loading}
        empty={!loading && filteredInvoices.length === 0}
        emptyProps={emptyStateProps}
      >
        {isMobile ? (
          <Box sx={{ p: 2 }}>
            {filteredInvoices.map(invoice => renderMobileCard(invoice))}
          </Box>
        ) : (
          renderTableContent()
        )}
      </BasePageContent>

      {/* Filtro Modal */}
      <BaseModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title={i18n.t("financial.filterTitle")}
        actions={[
          {
            label: i18n.t("financial.apply"),
            onClick: handleFilterApply,
            variant: "contained",
            color: "primary"
          },
          {
            label: i18n.t("financial.cancel"),
            onClick: () => setFilterModalOpen(false),
            variant: "outlined",
            color: "inherit"
          }
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={statusFilter === "all"} 
                onChange={() => setStatusFilter("all")}
              />
            }
            label={i18n.t("financial.filterAllStatus")}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={statusFilter === "pending"} 
                onChange={() => setStatusFilter("pending")}
              />
            }
            label={i18n.t("financial.status.pending")}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={statusFilter === "paid"} 
                onChange={() => setStatusFilter("paid")}
              />
            }
            label={i18n.t("financial.status.paid")}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={statusFilter === "overdue"} 
                onChange={() => setStatusFilter("overdue")}
              />
            }
            label={i18n.t("financial.status.overdue")}
          />
        </Box>
      </BaseModal>

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
      <BaseModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={i18n.t("financial.confirmDelete")}
        actions={[
          {
            label: i18n.t("financial.confirmDelete"),
            onClick: handleConfirmDelete,
            variant: "contained",
            color: "error",
            disabled: confirmLoading,
            icon: confirmLoading ? <CircularProgress size={20} /> : <DeleteIcon />
          },
          {
            label: i18n.t("financial.cancel"),
            onClick: () => setDeleteModalOpen(false),
            variant: "outlined",
            color: "inherit",
            disabled: confirmLoading
          }
        ]}
        maxWidth="sm"
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
      </BaseModal>

      {/* Modal de Confirmação de Exclusão em Massa */}
      <BaseModal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title={i18n.t("financial.confirmBulkDelete")}
        actions={[
          {
            label: i18n.t("financial.confirmBulkDelete"),
            onClick: handleBulkDelete,
            variant: "contained",
            color: "error",
            disabled: confirmLoading,
            icon: confirmLoading ? <CircularProgress size={20} /> : <DeleteSweepIcon />
          },
          {
            label: i18n.t("financial.cancel"),
            onClick: () => setBulkDeleteModalOpen(false),
            variant: "outlined",
            color: "inherit",
            disabled: confirmLoading
          }
        ]}
        maxWidth="sm"
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
      </BaseModal>
    </BasePage>
  );
};

export default Financeiro;