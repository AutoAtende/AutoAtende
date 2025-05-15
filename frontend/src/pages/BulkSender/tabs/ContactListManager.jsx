// ContactListManager.jsx (versão atualizada)
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";
// Material UI
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
  useMediaQuery,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Chip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';

// Icons
import {
  FileUpload as FileUploadIcon,
  GetApp as DownloadIcon,
  People as PeopleIcon,
  ImportExport as ImportExportIcon,
  ContactPhone as ContactPhoneIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Componentes
import TableRowSkeleton from "../../../components/TableRowSkeleton";
import EmptyState from "../../../components/EmptyState";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import EditContactModal from "../modals/EditContactModal";

// API
import api from "../../../services/api";
import planilhaExemplo from "../../../assets/planilha.xlsx";

// Reducer para gerenciar os contatos
// ContactListManager.jsx (continuação)
const contactsReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CONTACTS":
      return action.payload;
    case "UPDATE_CONTACT":
      const contactIndex = state.findIndex(c => c.id === action.payload.id);
      if (contactIndex !== -1) {
        const newContacts = [...state];
        newContacts[contactIndex] = action.payload;
        return newContacts;
      }
      return [action.payload, ...state];
    case "DELETE_CONTACT":
      return state.filter(c => c.id !== action.payload);
    default:
      return state;
  }
};

const ContactListManager = ({ contactListId, onSuccess }) => {
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);
  const { user } = useContext(AuthContext);
  const companyId = user?.companyId;
  const socketManager = useContext(SocketContext);
  // Estados
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = React.useReducer(contactsReducer, []);
  const [contactCount, setContactCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactList, setContactList] = useState(null);

  // Fetch de dados da lista
  const fetchContactList = useCallback(async () => {
    if (!contactListId) return;
    
    try {
      const { data } = await api.get(`/contact-lists/${contactListId}`);
      setContactList(data);
    } catch (err) {
      toast.error(i18n.t("contactLists.toasts.fetchError"));
    }
  }, [contactListId]);

  // Carregar dados da lista de contatos
  useEffect(() => {
    if (contactListId) {
      fetchContactList();
    }
  }, [contactListId, fetchContactList]);

  // Fetch de contatos
  const fetchContacts = useCallback(async () => {
    if (!contactListId) return;
    
    try {
      setLoading(true);
      
      // Usar AbortController para cancelar requisição se o componente desmontar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout de 30s
      
      const { data } = await api.get("/contact-list-items", {
        params: {
          searchParam,
          pageNumber: pageNumber + 1,
          rowsPerPage,
          contactListId,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      dispatch({ type: "LOAD_CONTACTS", payload: data.contacts || [] });
      setContactCount(data.count || 0);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted due to timeout or component unmount');
      } else {
        console.error("Error fetching contacts:", err);
        toast.error(i18n.t("contactListItems.toasts.fetchError"));
      }
    } finally {
      setLoading(false);
    }
  }, [contactListId, searchParam, pageNumber, rowsPerPage]);

  // Efeito para buscar contatos quando os parâmetros mudam
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handlers
  const handleOpenImportMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleCloseImportMenu = () => {
    setMenuAnchorEl(null);
  };
  
  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
    handleCloseImportMenu();
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value.toLowerCase());
    setPageNumber(0);
  };

  const handleChangePage = (event, newPage) => {
    setPageNumber(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPageNumber(0);
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    try {
      await api.delete(`/contact-list-items/${selectedContact.id}`);
      toast.success(i18n.t("contactListItems.toasts.deleted"));
      dispatch({ type: "DELETE_CONTACT", payload: selectedContact.id });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error(i18n.t("contactListItems.toasts.deleteError"));
    } finally {
      setDeleteModalOpen(false);
      setSelectedContact(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      setLoading(true);
      
      // Usar Promise.allSettled para continuar mesmo com falhas
      const results = await Promise.allSettled(
        selectedContacts.map((id) => api.delete(`/contact-list-items/${id}`))
      );
      
      // Contar sucessos e falhas
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      
      if (successCount > 0) {
        if (failCount > 0) {
          toast.warning(i18n.t("contactListItems.toasts.partialDeleteSuccess", {
            success: successCount,
            failed: failCount
          }));
        } else {
          toast.success(i18n.t("contactListItems.toasts.deletedAll"));
        }
      } else {
        toast.error(i18n.t("contactListItems.toasts.deleteError"));
      }
      
      setSelectedContacts([]);
      fetchContacts();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error deleting contacts:", err);
      toast.error(i18n.t("contactListItems.toasts.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    setSelectedContacts(
      event.target.checked ? contacts.map((c) => c.id) : []
    );
  };

  const handleExportContacts = async () => {
    if (!contactListId) {
      toast.error(i18n.t("contactListManager.errors.noListSelected"));
      return;
    }
    
    try {
      const response = await api.get(`/contact-lists/${contactListId}/export`, {
        responseType: 'blob'
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contatos_lista_${contactListId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(i18n.t("contactListManager.toasts.exportSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("contactListManager.toasts.exportError"));
    } finally {
      handleCloseImportMenu();
    }
  };
  
  const handleImportContacts = async () => {
    if (!contactListId) {
      toast.error(i18n.t("contactListManager.errors.noListSelected"));
      return;
    }
    
    try {
      setImporting(true);
      await api.post(`/contact-lists/${contactListId}/import-contacts`);
      toast.success(i18n.t("contactListManager.toasts.importing"));
      
      if (onSuccess) {
        onSuccess();
      }
      
      fetchContacts();
    } catch (err) {
      toast.error(err.message || i18n.t("contactListManager.errors.importError"));
    } finally {
      setImporting(false);
      setImportDialogOpen(false);
    }
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !contactListId) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      setLoading(true);
      
      // Verificar o tipo e tamanho do arquivo
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(i18n.t("contactListManager.errors.invalidFileType"));
        setLoading(false);
        event.target.value = null;
        return;
      }
      
      // Limitar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(i18n.t("contactListManager.errors.fileTooLarge"));
        setLoading(false);
        event.target.value = null;
        return;
      }
      
      await api.post(`/contact-lists/${contactListId}/upload`, formData);
      toast.success(i18n.t("contactListManager.toasts.fileUploadSuccess"));
      
      // Informar ao usuário que o processamento será em segundo plano
      toast.info(i18n.t("contactListManager.toasts.processingInBackground"));
      
      // Atualizar a lista após um tempo para dar chance ao processamento
      setTimeout(() => {
        fetchContacts();
        if (onSuccess) {
          onSuccess();
        }
        setLoading(false);
      }, 3000);
    } catch (err) {
      console.error("File upload error:", err);
      toast.error(i18n.t("contactListManager.errors.fileUploadError"));
      setLoading(false);
    } finally {
      handleCloseImportMenu();
      event.target.value = null;
    }
  };

  useEffect(() => {
    if (!companyId || !contactListId) return;
    
    // Tentar obter o socket
    let socket;
    try {
      socket = socketManager.GetSocket(companyId);
    } catch (error) {
      console.error("Error getting socket:", error);
      return;
    }
    
    if (!socket) return;
    
    const handleContactListItemEvent = (data) => {
      if (!data) return;
      
      if (data.action === "reload") {
        // Recarregar a lista completa
        fetchContacts();
      } else if (data.action === "create" || data.action === "update") {
        // Atualizar um item específico
        dispatch({ 
          type: data.action === "create" ? "UPDATE_CONTACT" : "UPDATE_CONTACT", 
          payload: data.record 
        });
      } else if (data.action === "delete") {
        // Remover um item
        dispatch({ type: "DELETE_CONTACT", payload: data.id });
      }
    };
    
    // Inscrever no canal específico da lista
    const channelName = `company-${companyId}-ContactListItem-${contactListId}`;
    socket.on(channelName, handleContactListItemEvent);
    
    // Limpeza
    return () => {
      if (socket) {
        socket.off(channelName, handleContactListItemEvent);
      }
    };
  }, [companyId, contactListId, socketManager, fetchContacts]);

  // Renderizar interface de gerenciamento de contatos
  return (
    <>
      {/* Modais */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteContact}
        title={i18n.t("contactListItems.confirmationModal.deleteTitle")}
        message={i18n.t("contactListItems.confirmationModal.deleteMessage")}
        confirmationText={selectedContact?.name}
      />

      <EditContactModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedContact(null);
        }}
        contactId={selectedContact?.id}
        contactListId={contactListId}
        onSave={fetchContacts}
      />

      {/* Diálogo de confirmação para importar contatos */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {i18n.t("contactListItems.importDialog.title")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {i18n.t("contactListItems.importDialog.message")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setImportDialogOpen(false)}
            color="secondary"
            disabled={importing}
          >
            {i18n.t("contactListItems.importDialog.cancel")}
          </Button>
          <Button 
            onClick={handleImportContacts}
            color="primary"
            variant="contained"
            disabled={importing}
            startIcon={importing ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {i18n.t("contactListItems.importDialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Input de arquivo escondido */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.xls"
        style={{ display: "none" }}
      />

      {/* Barra de ferramentas */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 2
      }}>
        <TextField
          placeholder={i18n.t("contactListItems.searchPlaceholder")}
          size="small"
          value={searchParam}
          onChange={handleSearch}
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenImportMenu}
            startIcon={<ImportExportIcon />}
            size={isMobile ? "small" : "medium"}
          >
            {i18n.t("contactListItems.buttons.import")}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedContact(null);
              setEditModalOpen(true);
            }}
            startIcon={<AddIcon />}
            size={isMobile ? "small" : "medium"}
          >
            {i18n.t("contactListItems.buttons.add")}
          </Button>
        </Box>
      </Box>

      {/* Menu de importação */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseImportMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => fileInputRef.current?.click()}>
          <ListItemIcon>
            <FileUploadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>
            {i18n.t("contactListItems.buttons.importFile")}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleOpenImportDialog}>
          <ListItemIcon>
            <ContactPhoneIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>
            {i18n.t("contactListItems.buttons.importContacts")}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleExportContacts}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>
            {i18n.t("contactListItems.buttons.export")}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => window.open(planilhaExemplo, '_blank')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>
            {i18n.t("contactListItems.buttons.downloadTemplate")}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Barra de contatos selecionados */}
      {selectedContacts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              bgcolor: theme.palette.error.lighter
            }}
          >
            <Typography variant="body2" color="error">
              {selectedContacts.length} {i18n.t("contactListItems.selected")}
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
            >
              {i18n.t("contactListItems.buttons.deleteSelected")}
            </Button>
          </Paper>
        </Box>
      )}

      {/* Lista de contatos */}
      <TableContainer 
        component={Paper}
        variant="outlined"
        sx={{ 
          height: '100%',
          minHeight: 300,
          maxHeight: 500,
          overflow: 'auto',
          ...theme.scrollbarStyles
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedContacts.length > 0 && selectedContacts.length < contacts.length}
                  checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>{i18n.t("contactListItems.table.name")}</TableCell>
              <TableCell>{i18n.t("contactListItems.table.number")}</TableCell>
              <TableCell>{i18n.t("contactListItems.table.email")}</TableCell>
              <TableCell align="center">{i18n.t("contactListItems.table.status")}</TableCell>
              <TableCell align="right">{i18n.t("contactListItems.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && contacts.length === 0 ? (
              <TableRowSkeleton columns={6} />
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    {i18n.t("contactListItems.empty.noContacts")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  hover
                  selected={selectedContacts.includes(contact.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                    />
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.number}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      icon={contact.isWhatsappValid ? 
                        <CheckCircleIcon fontSize="small" /> : 
                        <CancelIcon fontSize="small" />
                      }
                      label={contact.isWhatsappValid ? 
                        i18n.t("contactListItems.valid") : 
                        i18n.t("contactListItems.invalid")
                      }
                      color={contact.isWhatsappValid ? "success" : "default"}
                      variant={contact.isWhatsappValid ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={i18n.t("contactListItems.buttons.edit")}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedContact(contact);
                          setEditModalOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={i18n.t("contactListItems.buttons.delete")}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedContact(contact);
                          setDeleteModalOpen(true);
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        count={contactCount}
        page={pageNumber}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage={i18n.t("contactListItems.table.rowsPerPage")}
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} ${i18n.t("contactListItems.table.of")} ${count}`
        }
        sx={{ mt: 1 }}
      />
    </>
  );
};

export default ContactListManager;