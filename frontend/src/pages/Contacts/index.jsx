import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { styled, useTheme, alpha } from "@mui/material/styles";

// MUI Components
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Avatar,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Checkbox,
  Grid,
  Skeleton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useMediaQuery
} from "@mui/material";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import DeleteForever from "@mui/icons-material/DeleteForeverOutlined";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Components
import ContactModal from "./components/ContactModal";
import NewTicketModal from "../../components/NewTicketModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import Title from "../../components/Title";
import { Can } from "../../components/Can";
import ContactsEmptyState from './components/ContactsEmptyState';
import ImportExportStepper from './components/ImportExportStepper';
import TagFilterComponent from './components/TagFilterComponent';

// Contexts
import { AuthContext } from "../../context/Auth/AuthContext";
import { GlobalContext } from "../../context/GlobalContext";

// Utils & Helpers
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import formatSerializedId from "../../utils/formatSerializedId";
import { useLoading } from "../../hooks/useLoading";

// Estilos Modernos
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  }
}));

const HeaderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const SearchAndActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    gap: theme.spacing(1.5),
  }
}));

// Tabela moderna com cabeçalho fixo
const ModernTableContainer = styled(TableContainer)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
}));

const TableHeader = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.primary.dark, 0.1)
    : alpha(theme.palette.primary.light, 0.1),
  zIndex: 11,
  position: "sticky",
  top: 0,
  '& th': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  }
}));

const ScrollableTableBody = styled(TableBody)(({ theme }) => ({
  overflowY: "auto",
  height: "100%",
}));

const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
  cursor: 'pointer',
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : 'inherit',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  // Efeito de transição suave
  transition: 'background-color 0.2s ease',
}));

const StyledTableCell = styled(TableCell)(({ theme, align }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  fontSize: '0.875rem',
  textAlign: align || 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  }
}));

const ActionsCell = styled(StyledTableCell)(({ theme }) => ({
  width: '120px',
  [theme.breakpoints.down('sm')]: {
    width: '60px',
  }
}));

// Actions Button Component
const ActionButtonsContainer = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(0.5),
  }
}));

// Componente de Contatos
const Contacts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { Loading } = useLoading();
  const { makeRequest, setMakeRequest } = useContext(GlobalContext);
  
  // Refs
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  // States
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, setContacts] = useState([]);
  const [contactsTotal, setContactsTotal] = useState('');
  const [hasMore, setHasMore] = useState(false);
  
  // Modal states
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [deletingAllContact, setDeletingAllContact] = useState(null);
  const [blockingContact, setBlockingContact] = useState(null);

  // Menu states
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [bulkActionMenuAnchor, setBulkActionMenuAnchor] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);

  // Bulk selection states
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [confirmBulkAction, setConfirmBulkAction] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');

  const [tagFilter, setTagFilter] = useState([]);

  const handleTagFilterChange = (selectedTagIds) => {
    setTagFilter(selectedTagIds);
    setPageNumber(1); // Reseta a paginação ao mudar o filtro
  };

  const handleSearch = useCallback(() => {
    const searchValue = searchInputRef.current.value.toLowerCase();
    setSearchParam(searchValue);
    setPageNumber(1);
  }, []);

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
    setAddMenuAnchor(null);
  };

  const handleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
    setActionMenuAnchor(null);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      Loading.turnOn();
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
      setMakeRequest(Math.random());
    } catch (err) {
      toast.error(err);
    } finally {
      Loading.turnOff();
      setDeletingContact(null);
      setActionMenuAnchor(null);
    }
  };

  const handleDeleteAllContact = async () => {
    try {
      Loading.turnOn();
      await api.delete("/contacts");
      toast.success(i18n.t("contacts.toasts.deletedAll"));
      setMakeRequest(Math.random());
    } catch (err) {
      toast.error(err);
    } finally {
      Loading.turnOff();
      setDeletingAllContact(null);
      setAddMenuAnchor(null);
    }
  };

  const handleBlockUnblockContact = async (contactId, active) => {
    try {
      Loading.turnOn();
      console.log(`Tentando ${active ? 'desbloquear' : 'bloquear'} contato ${contactId}. Valor atual de active: ${active}`);
      
      const { data } = await api.put(`/contacts/toggle-block/${contactId}`, { 
        active // Garante que enviamos um valor booleano explícito
      });
      
      console.log('Resposta da API:', data);
      console.log(`Novo valor de active recebido: ${data.active}`);
      
      // Atualiza a lista de contatos com o novo valor de active
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? {...contact, active: data.active} 
            : contact
        )
      );
      
      toast.success(
        data.active 
          ? i18n.t("contacts.toasts.unblocked")
          : i18n.t("contacts.toasts.blocked")
      );
      
      setBlockingContact(null);
      setConfirmBlockOpen(false);
      setActionMenuAnchor(null);
      
      // Recarrega a lista de contatos para garantir consistência
      setTimeout(() => {
        setMakeRequest(Math.random());
      }, 500);
    } catch (err) {
      console.error("Erro ao alterar status do contato:", err);
      toast.error(err.response?.data?.error || err.message);
    } finally {
      Loading.turnOff();
    }
  };

  const handleScroll = useCallback((e) => {
    if (!hasMore || loading) return;
    
    // Calcula quando o usuário chegou perto do final da tabela
    const element = tableRef.current;
    if (!element) return;
    
    const { scrollTop, scrollHeight, clientHeight } = element;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setPageNumber(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const fetchContacts = async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      const { data } = await api.get("/contacts/", {
        params: {
          searchParam,
          pageNumber,
          typeContact: "private",
          tagIds: tagFilter.length > 0 ? tagFilter.join(',') : undefined,
        },
      });
      
      if (isMounted.current) {
        setContactsTotal(data?.count || 0);
        if (pageNumber === 1) {
          setContacts(data?.contacts || []);
        } else {
          setContacts(prev => [...prev, ...(data?.contacts || [])]);
        }
        setHasMore(data?.hasMore || false);
        setLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error(err);
        setContacts([]);
        setLoading(false);
      }
    }
  };
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const input = searchInputRef.current;
    if (!input) return;

    const handleInput = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    };

    input.addEventListener('input', handleInput);

    return () => {
      input.removeEventListener('input', handleInput);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleSearch]);

  useEffect(() => {
    if (isMounted.current) {
      fetchContacts();
    }
  }, [searchParam, pageNumber, makeRequest, tagFilter]);

  useEffect(() => {
    // Reset selection when contacts change
    setSelectedContacts([]);
    setSelectAll(false);
  }, []);

  const handleSelectAll = (event) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      const allContactIds = contacts.map(contact => contact.id);
      setSelectedContacts(allContactIds);
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (event, contactId) => {
    event.stopPropagation();
    
    const selectedIndex = selectedContacts.indexOf(contactId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedContacts, contactId];
    } else {
      newSelected = selectedContacts.filter(id => id !== contactId);
    }

    setSelectedContacts(newSelected);

    // Update selectAll state based on whether all visible contacts are selected
    if (newSelected.length === contacts.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const handleBulkAction = (actionType) => {
    setBulkActionType(actionType);
    setConfirmBulkAction(true);
    setBulkActionMenuAnchor(null);
  };

  const executeBulkAction = async () => {
    if (selectedContacts.length === 0) {
      toast.info(i18n.t("contacts.toasts.noContactsSelected"));
      return;
    }

    try {
      Loading.turnOn();
      
      switch (bulkActionType) {
        case 'block':
          await api.post("/contacts/bulk-block", {
            contactIds: selectedContacts,
            active: false
          });
          toast.success(i18n.t("contacts.toasts.bulkBlocked"));
          break;
        case 'unblock':
          await api.post("/contacts/bulk-block", {
            contactIds: selectedContacts,
            active: true
          });
          toast.success(i18n.t("contacts.toasts.bulkUnblocked"));
          break;
        case 'delete':
          await api.post("/contacts/bulk-delete", {
            contactIds: selectedContacts
          });
          toast.success(i18n.t("contacts.toasts.bulkDeleted"));
          break;
        default:
          toast.error(i18n.t("contacts.toasts.unknownAction"));
      }
      
      // Clear selections and refresh data
      setSelectedContacts([]);
      setSelectAll(false);
      setMakeRequest(Math.random());
      
    } catch (err) {
      console.error(`Erro na ação em massa (${bulkActionType}):`, err);
      toast.error(err.response?.data?.error || i18n.t("contacts.toasts.bulkActionError"));
    } finally {
      Loading.turnOff();
      setConfirmBulkAction(false);
    }
  };

  const handleRowClick = (contact) => {
    setCurrentContact(contact);
    handleEditContact(contact.id);
  };

  const handleActionMenuOpen = (event, contact) => {
    event.stopPropagation();
    setCurrentContact(contact);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleStartChat = (contact) => {
    setContactTicket(contact);
    setNewTicketModalOpen(true);
    setActionMenuAnchor(null);
  };

  const getBulkActionConfirmationText = () => {
    switch (bulkActionType) {
      case 'block':
        return i18n.t("contacts.confirmationModal.bulkBlockMessage");
      case 'unblock':
        return i18n.t("contacts.confirmationModal.bulkUnblockMessage");
      case 'delete':
        return i18n.t("contacts.confirmationModal.bulkDeleteMessage");
      default:
        return i18n.t("contacts.confirmationModal.genericMessage");
    }
  };

  const getBulkActionConfirmationTitle = () => {
    switch (bulkActionType) {
      case 'block':
        return i18n.t("contacts.confirmationModal.bulkBlockTitle");
      case 'unblock':
        return i18n.t("contacts.confirmationModal.bulkUnblockTitle");
      case 'delete':
        return i18n.t("contacts.confirmationModal.bulkDeleteTitle");
      default:
        return i18n.t("contacts.confirmationModal.genericTitle");
    }
  };

  const renderSkeleton = () => {
    return Array(5).fill().map((_, index) => (
      <StyledTableRow key={`skeleton-${index}`}>
        <StyledTableCell padding="checkbox" align="center">
          <Skeleton variant="rectangular" width={20} height={20} />
        </StyledTableCell>
        <StyledTableCell>
          <Skeleton variant="text" width={50} />
        </StyledTableCell>
        <StyledTableCell>
          <Skeleton variant="text" width={150} />
        </StyledTableCell>
        <StyledTableCell>
          <Skeleton variant="text" width={120} />
        </StyledTableCell>
        <StyledTableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        </StyledTableCell>
        <ActionsCell>
          <Skeleton variant="circular" width={28} height={28} />
        </ActionsCell>
      </StyledTableRow>
    ));
  };

  // Contador formatado com selecionados
  const formattedCounter = () => {
    const baseText = `${contacts.length} ${i18n.t("contacts.subtitle")} ${contactsTotal}`;
    return selectedContacts.length > 0 
      ? `${baseText} (${selectedContacts.length} ${i18n.t("contacts.bulkActions.selectedContacts")})`
      : baseText;
  };

  return (
    <PageContainer>
      <HeaderContainer elevation={1}>
        <Title>{i18n.t("contacts.title")}</Title>
        {contacts?.length > 0 && (
          <Typography variant="subtitle1" color="textSecondary">
            {formattedCounter()}
          </Typography>
        )}

        <SearchAndActionsContainer>
          <Grid container spacing={2} alignItems="center">
            {/* Campo de busca - 40% */}
            <Grid item xs={12} md={4}>
              <TextField
                placeholder={i18n.t("contacts.searchPlaceholder")}
                inputRef={searchInputRef}
                defaultValue={searchParam}
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* Filtro de tags - 40% */}
            <Grid item xs={12} md={5}>
              <TagFilterComponent onFilterChange={handleTagFilterChange} />
            </Grid>
            
            {/* Botões de ação - 20% */}
            <Grid item xs={12} md={3}>
              <ActionButtonsContainer>
                <Can
                  role={user.profile}
                  perform="contacts-page:createContact"
                  yes={() => (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => setAddMenuAnchor(e.currentTarget)}
                      endIcon={<ArrowDropDownIcon />}
                      fullWidth={isTablet}
                    >
                      {i18n.t("contacts.buttons.manage")}
                    </Button>
                  )}
                />

                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedContacts.length === 0}
                  onClick={(e) => setBulkActionMenuAnchor(e.currentTarget)}
                  endIcon={<ArrowDropDownIcon />}
                  fullWidth={isTablet}
                >
                  {i18n.t("contacts.bulkActions.actions")}
                </Button>
              </ActionButtonsContainer>
            </Grid>
          </Grid>
        </SearchAndActionsContainer>
      </HeaderContainer>

      {/* Menu de Gerenciamento */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={() => setAddMenuAnchor(null)}
      >
        <MenuItem onClick={handleOpenContactModal}>
          <AddBoxOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
          {i18n.t("contacts.buttons.add")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmOpen(true);
            setDeletingContact(null);
            setDeletingAllContact(contacts);
            setAddMenuAnchor(null);
          }}
        >
          <DeleteForever sx={{ mr: 1, color: 'error.main' }} />
          {i18n.t("contacts.buttons.deleteAll")}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setImportModalOpen(true);
            setAddMenuAnchor(null);
          }}
        >
          <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
          {i18n.t("contacts.buttons.import")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setExportModalOpen(true);
            setAddMenuAnchor(null);
          }}
        >
          <CloudDownloadIcon sx={{ mr: 1, color: 'primary.main' }} />
          {i18n.t("contacts.buttons.export")}
        </MenuItem>
      </Menu>

      {/* Menu de Ações em Massa */}
      <Menu
        anchorEl={bulkActionMenuAnchor}
        open={Boolean(bulkActionMenuAnchor)}
        onClose={() => setBulkActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBulkAction('block')}>
          <LockIcon sx={{ mr: 1, color: 'error.main' }} />
          {i18n.t("contacts.bulkActions.block")}
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('unblock')}>
          <LockOpenIcon sx={{ mr: 1, color: 'success.main' }} />
          {i18n.t("contacts.bulkActions.unblock")}
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('delete')}>
          <DeleteForever sx={{ mr: 1, color: 'error.main' }} />
          {i18n.t("contacts.bulkActions.delete")}
        </MenuItem>
      </Menu>

      {/* Menu de Ações do Contato */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <Can
          role={user.profile}
          perform="contacts-page:createContact"
          yes={() => (
            currentContact && !currentContact.isGroup && (
              <MenuItem onClick={() => handleStartChat(currentContact)}>
                <WhatsAppIcon sx={{ mr: 1, color: 'primary.main' }} />
                {i18n.t("contacts.buttons.startChat")}
              </MenuItem>
            )
          )}
        />

{currentContact && !currentContact.isGroup && (
  <Can
    role={user.profile}
    perform="contacts-page:blockContact"
    yes={() => (
      <MenuItem onClick={() => {
        console.log("Estado atual do contato:", currentContact);
        console.log("Valor de active:", currentContact.active);
        setBlockingContact(currentContact);
        setConfirmBlockOpen(true);
        setActionMenuAnchor(null);
      }}>
        {/* Mudança aqui: verificação mais explícita do estado de active */}
        {currentContact.active === true || currentContact.active === undefined ? (
          <>
            <LockIcon sx={{ mr: 1, color: 'error.main' }} />
            {i18n.t("contacts.buttons.block")}
          </>
        ) : (
          <>
            <LockOpenIcon sx={{ mr: 1, color: 'success.main' }} />
            {i18n.t("contacts.buttons.unblock")}
          </>
        )}
      </MenuItem>
    )}
  />
)}

        {currentContact && !currentContact.isGroup && (
          <Can
            role={user.profile}
            perform="contacts-page:editContact"
            yes={() => (
              <MenuItem onClick={() => handleEditContact(currentContact.id)}>
                <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
                {i18n.t("contacts.buttons.edit")}
              </MenuItem>
            )}
          />
        )}

        <Can
          role={user.profile}
          perform="contacts-page:deleteContact"
          yes={() => (
            currentContact && (
              <MenuItem onClick={() => {
                setConfirmOpen(true);
                setDeletingAllContact(null);
                setDeletingContact(currentContact);
                setActionMenuAnchor(null);
              }}>
                <DeleteOutlineIcon sx={{ mr: 1, color: 'error.main' }} />
                {i18n.t("contacts.buttons.delete")}
              </MenuItem>
            )
          )}
        />
      </Menu>
  
      {/* Tabela de Contatos Moderna */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ModernTableContainer component={Paper} elevation={1}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflowY: 'auto' 
            }}
            ref={tableRef}
            onScroll={handleScroll}
          >
            <Table stickyHeader size="small">
              <TableHeader>
                <TableRow>
                  <StyledTableCell padding="checkbox" align="center">
                    <Checkbox
                      color="primary"
                      indeterminate={selectedContacts.length > 0 && selectedContacts.length < contacts.length}
                      checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                      onChange={handleSelectAll}
                      inputProps={{ 'aria-label': 'select all contacts' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{i18n.t("contacts.table.id")}</StyledTableCell>
                  <StyledTableCell>{i18n.t("contacts.table.name")}</StyledTableCell>
                  <StyledTableCell align="center">{i18n.t("contacts.table.number")}</StyledTableCell>
                  <StyledTableCell align="center">{i18n.t("contacts.table.tags")}</StyledTableCell>
                  <ActionsCell align="center">{i18n.t("contacts.table.actions")}</ActionsCell>
                </TableRow>
              </TableHeader>

              <ScrollableTableBody>
                {loading && contacts.length === 0 ? (
                  renderSkeleton()
                ) : contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <StyledTableRow
                      key={contact.id}
                      hover
                      selected={selectedContacts.indexOf(contact.id) !== -1}
                      onClick={() => handleRowClick(contact)}
                    >
                      <StyledTableCell padding="checkbox" align="center">
                        <Checkbox
                          color="primary"
                          checked={selectedContacts.indexOf(contact.id) !== -1}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleSelectContact(e, contact.id)}
                        />
                      </StyledTableCell>
                      
                      <StyledTableCell>
                        {contact.id.toString().substr(0, 8)}...
                      </StyledTableCell>
                      
                      <StyledTableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              bgcolor: generateColor(contact?.number),
                              width: 32,
                              height: 32
                            }}
                            src={contact.profilePicUrl}
                          >
                            {getInitials(contact?.name)}
                          </Avatar>
                          <Typography variant="body2" noWrap>
                            {contact?.name || "N/A"}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      
                      <StyledTableCell align="center">
                        {user.isTricked === "enabled"
                          ? formatSerializedId(contact?.number)
                          : contact?.number
                            ? contact.number.slice(0, -4) + "****"
                            : "N/A"
                        }
                      </StyledTableCell>
                      
                      <StyledTableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {contact?.tags?.length > 0 ? (
                            contact.tags.map((tag) => (
                              <Chip
                                key={tag.id}
                                label={tag.name}
                                size="small"
                                style={{
                                  backgroundColor: tag.color || '#666',
                                  color: '#fff',
                                  height: 20,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              {i18n.t("contacts.table.noTags")}
                            </Typography>
                          )}
                        </Box>
                      </StyledTableCell>
                      
                      <ActionsCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, contact)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </ActionsCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <StyledTableCell colSpan={6} align="center">
                      <Box sx={{ py: 4 }}>
                        <ContactsEmptyState 
                          onCreateNew={handleOpenContactModal}
                          isGroup={false}
                        />
                      </Box>
                    </StyledTableCell>
                  </TableRow>
                )}
                
                {loading && contacts.length > 0 && (
                  renderSkeleton()
                )}
              </ScrollableTableBody>
            </Table>
          </Box>
        </ModernTableContainer>
      </Box>
  
      {/* Modais */}
      {newTicketModalOpen && (
        <NewTicketModal
          modalOpen={newTicketModalOpen}
          initialContact={contactTicket}
          onClose={(ticket) => {
            setNewTicketModalOpen(false);
            if (ticket && (ticket.uuid || ticket.id)) {
              const ticketId = ticket.uuid || ticket.id;
              history.push(`/tickets/${ticketId}`);
            }
          }}
        />
      )}
  
      {contactModalOpen && (
        <ContactModal
          open={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedContactId(null);
            setMakeRequest(Math.random());
          }}
          contactId={selectedContactId}
          onSave={(savedContact) => {
            setMakeRequest(Math.random());
          }}
        />
      )}
  
      {confirmOpen && (
        <ConfirmationModal
          title={
            !contacts?.length 
              ? i18n.t("contacts.confirmationModal.deleteTitleNoHasContactCreated")
              : deletingContact
                ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?`
                : `${i18n.t("contacts.confirmationModal.deleteAllTitle")}`
          }
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          isShowConfirmButton={!!contacts?.length}
          onConfirm={() =>
            deletingContact
              ? handleDeleteContact(deletingContact.id)
              : handleDeleteAllContact(deletingAllContact)
          }
        >
          {!contacts?.length 
            ? i18n.t("contacts.confirmationModal.deleteTitleNoHasContactCreatedMessage")
            : deletingContact
              ? i18n.t("contacts.confirmationModal.deleteMessage")
              : i18n.t("contacts.confirmationModal.deleteAllMessage")
          }
        </ConfirmationModal>
      )}
  
{confirmBlockOpen && blockingContact && (
  <ConfirmationModal
    title={
      blockingContact.active === true || blockingContact.active === undefined
        ? `${i18n.t("contacts.confirmationModal.blockTitle")} ${blockingContact.name}?`
        : `${i18n.t("contacts.confirmationModal.unblockTitle")} ${blockingContact.name}?`
    }
    open={confirmBlockOpen}
    onClose={() => setConfirmBlockOpen(false)}
    onConfirm={() => handleBlockUnblockContact(
      blockingContact.id, 
      !(blockingContact.active === true || blockingContact.active === undefined)
    )}
  >
    {blockingContact.active === true || blockingContact.active === undefined
      ? i18n.t("contacts.confirmationModal.blockMessage")
      : i18n.t("contacts.confirmationModal.unblockMessage")}
  </ConfirmationModal>
)}

      {confirmBulkAction && (
        <ConfirmationModal
          title={getBulkActionConfirmationTitle()}
          open={confirmBulkAction}
          onClose={() => setConfirmBulkAction(false)}
          onConfirm={executeBulkAction}
        >
          {getBulkActionConfirmationText()}
        </ConfirmationModal>
      )}
  
      <ImportExportStepper
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        mode="import"
      />
  
      <ImportExportStepper
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        mode="export"
      />
    </PageContainer>
  );
};
  
export default Contacts;