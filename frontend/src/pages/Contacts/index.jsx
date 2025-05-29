import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import PropTypes from 'prop-types';

// MUI Components
import {
  Box,
  Avatar,
  Chip,
  Typography,
  Checkbox,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  useTheme,
  Paper,
  Button
} from "@mui/material";

// MUI Icons
import {
  Add as AddIcon,
  CloudUpload as ImportIcon,
  CloudDownload as ExportIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  WhatsApp as WhatsAppIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ContactPhone as ContactIcon,
  Search as SearchIcon
} from "@mui/icons-material";

// Standard Components
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardEmptyState from "../../components/shared/StandardEmptyState";

// Existing Components
import ContactModal from "./components/ContactModal";
import NewTicketModal from "../../components/NewTicketModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TagFilterComponent from './components/TagFilterComponent';
import ImportExportStepper from './components/ImportExportStepper';
import { Can } from "../../components/Can";

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

// Componente de Ações do Contato - Simplificado e Seguro
const ContactActions = React.memo(({ contact, user, onStartChat, onBlock, onEdit, onDelete }) => {
  const handleStartChat = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clicou em iniciar chat para:', contact.name);
    if (onStartChat && typeof onStartChat === 'function') {
      onStartChat(contact);
    }
  }, [contact, onStartChat]);

  const handleBlock = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clicou em bloquear para:', contact.name);
    if (onBlock && typeof onBlock === 'function') {
      onBlock(contact);
    }
  }, [contact, onBlock]);

  const handleEdit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clicou em editar contato ID:', contact.id);
    if (onEdit && typeof onEdit === 'function') {
      onEdit(contact.id);
    }
  }, [contact.id, onEdit]);

  const handleDelete = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clicou em excluir para:', contact.name);
    if (onDelete && typeof onDelete === 'function') {
      onDelete(contact);
    }
  }, [contact, onDelete]);

  // Verificações de segurança
  if (!contact || typeof contact !== 'object') {
    console.error('ContactActions: contact inválido', contact);
    return null;
  }

  if (!user || typeof user !== 'object') {
    console.error('ContactActions: user inválido', user);
    return null;
  }

  return (
    <Stack direction="row" spacing={0.5}>
      {user.profile !== 'user' && !contact.isGroup && (
        <Tooltip title="Iniciar Chat" arrow>
          <IconButton
            size="small"
            color="primary"
            onClick={handleStartChat}
            aria-label="Iniciar chat"
          >
            <WhatsAppIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {!contact.isGroup && (
        <Tooltip 
          title={contact.active === false ? "Desbloquear" : "Bloquear"} 
          arrow
        >
          <IconButton
            size="small"
            color={contact.active === false ? 'success' : 'error'}
            onClick={handleBlock}
            aria-label={contact.active === false ? "Desbloquear" : "Bloquear"}
          >
            {contact.active === false 
              ? <LockOpenIcon fontSize="small" /> 
              : <LockIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Editar" arrow>
        <IconButton
          size="small"
          color="primary"
          onClick={handleEdit}
          aria-label="Editar contato"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Excluir" arrow>
        <IconButton
          size="small"
          color="error"
          onClick={handleDelete}
          aria-label="Excluir contato"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
});

ContactActions.displayName = 'ContactActions';

ContactActions.propTypes = {
  contact: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onStartChat: PropTypes.func.isRequired,
  onBlock: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// Componente de Item de Contato - Simplificado e Seguro
const ContactItem = React.memo(({ 
  contact, 
  user, 
  selected, 
  onSelect, 
  onStartChat, 
  onBlock, 
  onEdit, 
  onDelete,
  showCheckbox = false 
}) => {
  const theme = useTheme();

  const handleRowClick = useCallback((e) => {
    // Previne clique quando é em um botão de ação
    const target = e.target;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('.MuiIconButton-root')) {
      return;
    }
    // Não faz nada no clique da linha por enquanto
  }, []);

  const handleCheckboxChange = useCallback((e) => {
    e.stopPropagation();
    if (onSelect && typeof onSelect === 'function') {
      onSelect(contact, !selected);
    }
  }, [contact, selected, onSelect]);

  // Verificações de segurança
  if (!contact || typeof contact !== 'object') {
    console.error('ContactItem: contact inválido', contact);
    return null;
  }

  if (!user || typeof user !== 'object') {
    console.error('ContactItem: user inválido', user);
    return null;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: selected ? 'action.selected' : 'background.paper',
        '&:hover': {
          backgroundColor: 'action.hover',
          transform: 'translateY(-1px)',
          boxShadow: 2
        },
        borderRadius: 2,
        border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent'
      }}
      onClick={handleRowClick}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {showCheckbox && (
          <Checkbox
            checked={Boolean(selected)}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            color="primary"
          />
        )}

        <Avatar
          sx={{
            bgcolor: generateColor(contact?.number || ''),
            width: 40,
            height: 40
          }}
          src={contact.profilePicUrl || ''}
        >
          {getInitials(contact?.name || 'N/A')}
        </Avatar>

        <Box flex={1} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap fontWeight={600}>
            {contact?.name || "N/A"}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            {user.isTricked === "enabled"
              ? formatSerializedId(contact?.number || '')
              : contact?.number
                ? contact.number.slice(0, -4) + "****"
                : "N/A"
            }
          </Typography>
          <Typography variant="caption" color="textSecondary">
            ID: {contact.id ? contact.id.toString().substr(0, 8) + '...' : 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            {contact?.tags?.length > 0 ? (
              contact.tags.slice(0, 2).map((tag) => (
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
                Sem tags
              </Typography>
            )}
            {contact?.tags?.length > 2 && (
              <Chip
                label={`+${contact.tags.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          {/* Status */}
          <Chip
            label={contact.active === false ? 'Bloqueado' : 'Ativo'}
            size="small"
            color={contact.active === false ? 'error' : 'success'}
            variant="outlined"
          />
        </Box>

        <ContactActions
          contact={contact}
          user={user}
          onStartChat={onStartChat}
          onBlock={onBlock}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Box>
    </Paper>
  );
});

ContactItem.displayName = 'ContactItem';

ContactItem.propTypes = {
  contact: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onStartChat: PropTypes.func.isRequired,
  onBlock: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showCheckbox: PropTypes.bool
};

const Contacts = () => {
  const history = useHistory();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { Loading } = useLoading();
  const { makeRequest, setMakeRequest } = useContext(GlobalContext);
  
  // Refs
  const isMounted = useRef(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // States
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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

  // Bulk selection states
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [confirmBulkAction, setConfirmBulkAction] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');

  const [tagFilter, setTagFilter] = useState([]);

  // Configurar Intersection Observer para scroll infinito
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    const callback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && !loading && contacts.length > 0) {
        setPageNumber(prev => prev + 1);
      }
    };

    observerRef.current = new IntersectionObserver(callback, options);
    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, contacts.length]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleTagFilterChange = useCallback((selectedTagIds) => {
    setTagFilter(selectedTagIds);
    setPageNumber(1);
    setContacts([]);
  }, []);

  const handleSearchChange = useCallback((event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchParam(searchValue);
    setPageNumber(1);
    setContacts([]);
    setSelectedContacts([]); // Limpar seleção ao filtrar
  }, []);

  const handleOpenContactModal = useCallback(() => {
    console.log('Abrindo modal para novo contato');
    setSelectedContactId(null);
    setContactModalOpen(true);
  }, []);

  const handleEditContact = useCallback((contactId) => {
    console.log('handleEditContact chamado com ID:', contactId);
    console.log('Tipo do contactId:', typeof contactId);
    
    if (!contactId) {
      console.error('ID do contato é inválido:', contactId);
      toast.error('ID do contato inválido');
      return;
    }

    try {
      setSelectedContactId(contactId);
      setContactModalOpen(true);
      console.log('Modal de edição configurado para abrir com ID:', contactId);
    } catch (error) {
      console.error('Erro ao configurar modal de edição:', error);
      toast.error('Erro ao abrir modal de edição');
    }
  }, []);

  const handleDeleteContact = useCallback(async (contactId) => {
    try {
      Loading.turnOn();
      await api.delete(`/contacts/${contactId}`);
      toast.success("Contato excluído com sucesso");
      setMakeRequest(Math.random());
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
      toast.error(err.response?.data?.error || err.message || "Erro ao excluir contato");
    } finally {
      Loading.turnOff();
      setDeletingContact(null);
      setConfirmOpen(false);
    }
  }, [Loading, setMakeRequest]);

  const handleDeleteAllContact = useCallback(async () => {
    try {
      Loading.turnOn();
      await api.delete("/contacts");
      toast.success("Todos os contatos foram excluídos");
      setMakeRequest(Math.random());
    } catch (err) {
      console.error("Erro ao excluir todos os contatos:", err);
      toast.error(err.response?.data?.error || err.message || "Erro ao excluir contatos");
    } finally {
      Loading.turnOff();
      setDeletingAllContact(null);
      setConfirmOpen(false);
    }
  }, [Loading, setMakeRequest]);

  const handleBlockUnblockContact = useCallback(async (contactId, active) => {
    try {
      Loading.turnOn();
      
      const { data } = await api.put(`/contacts/toggle-block/${contactId}`, { 
        active
      });
      
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? {...contact, active: data.active} 
            : contact
        )
      );
      
      toast.success(
        data.active 
          ? "Contato desbloqueado"
          : "Contato bloqueado"
      );
      
    } catch (err) {
      console.error("Erro ao alterar status do contato:", err);
      toast.error(err.response?.data?.error || err.message || "Erro ao alterar status");
    } finally {
      Loading.turnOff();
      setBlockingContact(null);
      setConfirmBlockOpen(false);
    }
  }, [Loading]);

  const fetchContacts = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
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
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Erro ao buscar contatos:", err);
        toast.error(err.response?.data?.error || err.message || "Erro ao carregar contatos");
        if (pageNumber === 1) {
          setContacts([]);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchParam, pageNumber, tagFilter]);

  useEffect(() => {
    if (isMounted.current) {
      fetchContacts();
    }
  }, [fetchContacts, makeRequest]);

  const handleBulkAction = useCallback((actionType) => {
    setBulkActionType(actionType);
    setConfirmBulkAction(true);
  }, []);

  const executeBulkAction = useCallback(async () => {
    if (selectedContacts.length === 0) {
      toast.info("Nenhum contato selecionado");
      return;
    }

    try {
      Loading.turnOn();
      
      switch (bulkActionType) {
        case 'block':
          await api.post("/contacts/bulk-block", {
            contactIds: selectedContacts.map(contact => contact.id),
            active: false
          });
          toast.success("Contatos bloqueados em massa");
          break;
        case 'unblock':
          await api.post("/contacts/bulk-block", {
            contactIds: selectedContacts.map(contact => contact.id),
            active: true
          });
          toast.success("Contatos desbloqueados em massa");
          break;
        case 'delete':
          await api.post("/contacts/bulk-delete", {
            contactIds: selectedContacts.map(contact => contact.id)
          });
          toast.success("Contatos excluídos em massa");
          break;
        default:
          toast.error("Ação desconhecida");
      }
      
      setSelectedContacts([]);
      setMakeRequest(Math.random());
      
    } catch (err) {
      console.error(`Erro na ação em massa (${bulkActionType}):`, err);
      toast.error(err.response?.data?.error || "Erro na ação em massa");
    } finally {
      Loading.turnOff();
      setConfirmBulkAction(false);
    }
  }, [selectedContacts, bulkActionType, Loading, setMakeRequest]);

  const handleStartChat = useCallback((contact) => {
    setContactTicket(contact);
    setNewTicketModalOpen(true);
  }, []);

  const handleContactSelect = useCallback((contact, isSelected) => {
    setSelectedContacts(prev => {
      if (isSelected) {
        return [...prev, contact];
      } else {
        return prev.filter(c => c.id !== contact.id);
      }
    });
  }, []);

  const handleSelectAllContacts = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedContacts([...contacts]);
    } else {
      setSelectedContacts([]);
    }
  }, [contacts]);

  const getBulkActionConfirmationText = () => {
    switch (bulkActionType) {
      case 'block':
        return `Deseja bloquear ${selectedContacts.length} contato(s) selecionado(s)?`;
      case 'unblock':
        return `Deseja desbloquear ${selectedContacts.length} contato(s) selecionado(s)?`;
      case 'delete':
        return `Deseja excluir ${selectedContacts.length} contato(s) selecionado(s)? Esta ação não pode ser desfeita.`;
      default:
        return "Confirma esta ação em massa?";
    }
  };

  const getBulkActionConfirmationTitle = () => {
    switch (bulkActionType) {
      case 'block':
        return "Bloquear Contatos";
      case 'unblock':
        return "Desbloquear Contatos";
      case 'delete':
        return "Excluir Contatos";
      default:
        return "Confirmar Ação";
    }
  };

  // Contador formatado com selecionados
  const formattedCounter = () => {
    const baseText = `${contacts.length} de ${contactsTotal} contatos`;
    return selectedContacts.length > 0 
      ? `${baseText} (${selectedContacts.length} selecionados)`
      : baseText;
  };

  // Handler para fechar modal com debug
  const handleCloseContactModal = useCallback(() => {
    console.log('Fechando modal de contato');
    setContactModalOpen(false);
    setSelectedContactId(null);
    setMakeRequest(Math.random());
  }, [setMakeRequest]);

  // Handler para salvar contato com debug
  const handleSaveContact = useCallback((savedContact) => {
    console.log('Contato salvo:', savedContact);
    setMakeRequest(Math.random());
  }, [setMakeRequest]);

  // Ações do header da página
  const pageActions = [
    {
      label: "Adicionar",
      icon: <AddIcon />,
      onClick: handleOpenContactModal,
      primary: true
    },
    {
      label: "Importar",
      icon: <ImportIcon />,
      onClick: () => setImportModalOpen(true)
    },
    {
      label: "Exportar",
      icon: <ExportIcon />,
      onClick: () => setExportModalOpen(true)
    },
    {
      label: "Excluir Todos",
      icon: <DeleteIcon />,
      onClick: () => {
        setConfirmOpen(true);
        setDeletingContact(null);
        setDeletingAllContact(contacts);
      },
      color: 'error'
    }
  ];

  // Ações em massa
  const bulkActions = selectedContacts.length > 0 ? [
    {
      label: `Bloquear (${selectedContacts.length})`,
      icon: <LockIcon />,
      onClick: () => handleBulkAction('block'),
      color: 'error'
    },
    {
      label: `Desbloquear (${selectedContacts.length})`,
      icon: <LockOpenIcon />,
      onClick: () => handleBulkAction('unblock'),
      color: 'success'
    },
    {
      label: `Excluir (${selectedContacts.length})`,
      icon: <DeleteIcon />,
      onClick: () => handleBulkAction('delete'),
      color: 'error'
    }
  ] : [];

  // Debug dos states do modal
  useEffect(() => {
    console.log('Estados do modal:', {
      contactModalOpen,
      selectedContactId,
      contactId: selectedContactId
    });
  }, [contactModalOpen, selectedContactId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StandardPageLayout
        title="Contatos"
        subtitle={formattedCounter()}
        showSearch={false}
        actions={[...pageActions, ...bulkActions]}
      >
        {/* Filtros */}
        <Box sx={{ 
          mb: 3,
          display: 'flex',
          gap: 2,
          alignItems: 'stretch',
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Campo de busca */}
          <Box sx={{ 
            flex: { md: '1 1 60%' },
            width: { xs: '100%', md: 'auto' }
          }}>
            <TextField
              placeholder="Buscar contatos..."
              value={searchParam}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  height: 40
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 3, sm: 2 },
                  height: 40
                }
              }}
            />
          </Box>
          
          {/* Filtro de tags */}
          <Box sx={{ 
            flex: { md: '1 1 40%' },
            width: { xs: '100%', md: 'auto' },
            maxWidth: { md: '300px' },
            '& .MuiOutlinedInput-root': {
              height: 40
            }
          }}>
            <TagFilterComponent 
              onFilterChange={handleTagFilterChange} 
              size="small"
              placeholder="Filtrar por tags..."
            />
          </Box>
        </Box>

        {/* Controles de seleção */}
        {contacts.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Checkbox
              indeterminate={selectedContacts.length > 0 && selectedContacts.length < contacts.length}
              checked={contacts.length > 0 && selectedContacts.length === contacts.length}
              onChange={(e) => handleSelectAllContacts(e.target.checked)}
            />
            <Typography variant="body2">
              {selectedContacts.length > 0 
                ? `${selectedContacts.length} de ${contacts.length} selecionados`
                : "Selecionar todos"
              }
            </Typography>
          </Box>
        )}

        {/* Debug info */}
        <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem' }}>
          Debug: Modal Open: {contactModalOpen ? 'SIM' : 'NÃO'} | Selected ID: {selectedContactId || 'NENHUM'}
        </Box>

        {/* Lista de Contatos com scroll infinito */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading && contacts.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : contacts.length === 0 ? (
            <StandardEmptyState 
              type="contatos"
              primaryAction={{
                label: "Adicionar Contato",
                icon: <AddIcon />,
                onClick: handleOpenContactModal
              }}
              secondaryAction={{
                label: "Importar Contatos",
                icon: <ImportIcon />,
                onClick: () => setImportModalOpen(true)
              }}
            />
          ) : (
            <>
              {contacts.map((contact, index) => (
                <ContactItem
                  key={`contact-${contact.id}-${index}`}
                  contact={contact}
                  user={user}
                  selected={selectedContacts.some(c => c.id === contact.id)}
                  onSelect={handleContactSelect}
                  onStartChat={handleStartChat}
                  onBlock={(contact) => {
                    setBlockingContact(contact);
                    setConfirmBlockOpen(true);
                  }}
                  onEdit={handleEditContact}
                  onDelete={(contact) => {
                    setConfirmOpen(true);
                    setDeletingAllContact(null);
                    setDeletingContact(contact);
                  }}
                  showCheckbox={true}
                />
              ))}

              {/* Indicador de carregamento para scroll infinito */}
              {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {/* Elemento para ativar o scroll infinito */}
              <div ref={loadMoreRef} style={{ height: 20, margin: '10px 0' }} />

              {/* Indicador de fim da lista */}
              {!hasMore && contacts.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Todos os contatos foram carregados
                  </Typography>
                </Box>
              )}
            </>
          )}
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

        {/* Modal de Contato com debugging */}
        {contactModalOpen && (
          <ContactModal
            key={`contact-modal-${selectedContactId || 'new'}`}
            open={contactModalOpen}
            onClose={handleCloseContactModal}
            contactId={selectedContactId}
            onSave={handleSaveContact}
          />
        )}

        {confirmOpen && (
          <ConfirmationModal
            title={
              !contacts?.length 
                ? "Nenhum contato cadastrado"
                : deletingContact
                  ? `Excluir ${deletingContact.name}?`
                  : "Excluir todos os contatos?"
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
              ? "Não há contatos cadastrados para excluir."
              : deletingContact
                ? "Esta ação não pode ser desfeita. Deseja continuar?"
                : "Esta ação irá excluir TODOS os contatos e não pode ser desfeita. Deseja continuar?"
            }
          </ConfirmationModal>
        )}

        {confirmBlockOpen && blockingContact && (
          <ConfirmationModal
            title={
              blockingContact.active === true || blockingContact.active === undefined
                ? `Bloquear ${blockingContact.name}?`
                : `Desbloquear ${blockingContact.name}?`
            }
            open={confirmBlockOpen}
            onClose={() => setConfirmBlockOpen(false)}
            onConfirm={() => handleBlockUnblockContact(
              blockingContact.id, 
              !(blockingContact.active === true || blockingContact.active === undefined)
            )}
          >
            {blockingContact.active === true || blockingContact.active === undefined
              ? "O contato será bloqueado e não poderá enviar mensagens."
              : "O contato será desbloqueado e poderá enviar mensagens novamente."}
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

        {importModalOpen && (
          <ImportExportStepper
            open={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            mode="import"
          />
        )}

        {exportModalOpen && (
          <ImportExportStepper
            open={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
            mode="export"
          />
        )}
      </StandardPageLayout>
    </Box>
  );
};

Contacts.propTypes = {};

export default Contacts;