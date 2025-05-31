import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

// MUI Components
import {
  Box,
  Avatar,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  useTheme
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
import StandardDataTable from "../../components/shared/StandardDataTable";

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

const Contacts = () => {
  const history = useHistory();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { Loading } = useLoading();
  const { makeRequest, setMakeRequest } = useContext(GlobalContext);
  
  // Refs
  const isMounted = useRef(true);

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

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
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
    setSelectedContacts([]);
  }, []);

  const handleOpenContactModal = useCallback(() => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  }, []);

  const handleEditContact = useCallback((contact) => {
    setSelectedContactId(contact.id);
    setContactModalOpen(true);
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

  const handleSelectionChange = useCallback((selectedItems) => {
    setSelectedContacts(selectedItems);
  }, []);

  // Configuração das colunas da tabela
  const columns = [
    {
      id: 'id',
      field: 'id',
      label: 'ID',
      width: '80px',
      render: (contact) => contact.id ? contact.id.toString().substr(0, 8) + '...' : 'N/A'
    },
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      minWidth: 200,
      render: (contact) => (
        <Box display="flex" alignItems="center" gap={1}>
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
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {contact?.name || "N/A"}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {user.isTricked === "enabled"
                ? formatSerializedId(contact?.number || '')
                : contact?.number
                  ? contact.number.slice(0, -4) + "****"
                  : "N/A"
              }
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'tags',
      field: 'tags',
      label: 'Tags',
      width: 200,
      render: (contact) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
      )
    },
    {
      id: 'status',
      field: 'active',
      label: 'Status',
      width: 120,
      render: (contact) => (
        <Chip
          label={contact.active === false ? 'Bloqueado' : 'Ativo'}
          size="small"
          color={contact.active === false ? 'error' : 'success'}
          variant="outlined"
        />
      )
    }
  ];

  // Ações da tabela
  const tableActions = [
    ...(user.profile !== 'user' ? [{
      label: "Iniciar Chat",
      icon: <WhatsAppIcon />,
      onClick: (contact) => handleStartChat(contact),
      color: "primary"
    }] : []),
    {
      label: "Editar",
      icon: <EditIcon />,
      onClick: (contact) => handleEditContact(contact),
      color: "primary"
    },
    {
      label: contact => contact.active === false ? "Desbloquear" : "Bloquear",
      icon: contact => contact.active === false ? <LockOpenIcon /> : <LockIcon />,
      onClick: (contact) => {
        setBlockingContact(contact);
        setConfirmBlockOpen(true);
      },
      color: contact => contact.active === false ? 'success' : 'error'
    },
    {
      label: "Excluir",
      icon: <DeleteIcon />,
      onClick: (contact) => {
        setConfirmOpen(true);
        setDeletingAllContact(null);
        setDeletingContact(contact);
      },
      color: "error"
    }
  ];

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

  // Handler para fechar modal
  const handleCloseContactModal = useCallback(() => {
    setContactModalOpen(false);
    setSelectedContactId(null);
    setMakeRequest(Math.random());
  }, [setMakeRequest]);

  // Handler para salvar contato
  const handleSaveContact = useCallback((savedContact) => {
    setMakeRequest(Math.random());
  }, [setMakeRequest]);

  // Ações do header da página
  const pageActions = [
    {
      label: "Adicionar",
      icon: <AddIcon />,
      onClick: handleOpenContactModal,
      variant: "contained",
      color: "primary",
      primary: true
    },
    {
      label: "Importar",
      icon: <ImportIcon />,
      onClick: () => setImportModalOpen(true),
      variant: "outlined",
      color: "primary"
    },
    {
      label: "Exportar",
      icon: <ExportIcon />,
      onClick: () => setExportModalOpen(true),
      variant: "outlined",
      color: "primary"
    },
    {
      label: "Excluir Todos",
      icon: <DeleteIcon />,
      onClick: () => {
        setConfirmOpen(true);
        setDeletingContact(null);
        setDeletingAllContact(contacts);
      },
      variant: "outlined",
      color: "error"
    }
  ];

  // Ações em massa
  const bulkActions = selectedContacts.length > 0 ? [
    {
      label: `Bloquear (${selectedContacts.length})`,
      icon: <LockIcon />,
      onClick: () => handleBulkAction('block'),
      variant: "outlined",
      color: 'error'
    },
    {
      label: `Desbloquear (${selectedContacts.length})`,
      icon: <LockOpenIcon />,
      onClick: () => handleBulkAction('unblock'),
      variant: "outlined",
      color: 'success'
    },
    {
      label: `Excluir (${selectedContacts.length})`,
      icon: <DeleteIcon />,
      onClick: () => handleBulkAction('delete'),
      variant: "outlined",
      color: 'error'
    }
  ] : [];

  return (
    <>
      <StandardPageLayout
        title="Contatos"
        subtitle={formattedCounter()}
        searchValue={searchParam}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar contatos..."
        showSearch={true}
        actions={[...pageActions, ...bulkActions]}
        loading={loading}
      >
        {/* Filtros */}
        <Box sx={{ 
          mb: 3,
          display: 'flex',
          gap: 2,
          alignItems: 'stretch',
          flexDirection: { xs: 'column', md: 'row' }
        }}>
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

        <StandardDataTable
          data={contacts}
          columns={columns}
          loading={loading}
          selectable={true}
          selectedItems={selectedContacts}
          onSelectionChange={handleSelectionChange}
          actions={tableActions}
          onRowClick={(contact) => handleEditContact(contact)}
          stickyHeader={true}
          size="small"
          hover={true}
          maxVisibleActions={3}
          emptyIcon={<ContactIcon />}
          emptyTitle="Nenhum contato encontrado"
          emptyDescription="Não há contatos cadastrados para os filtros selecionados. Adicione um novo contato ou ajuste os critérios de busca."
          emptyActionLabel="Adicionar Contato"
          onEmptyActionClick={handleOpenContactModal}
        />

        {/* Indicador de carregamento para scroll infinito */}
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Indicador de fim da lista */}
        {!hasMore && contacts.length > 0 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Todos os contatos foram carregados
            </Typography>
          </Box>
        )}
      </StandardPageLayout>

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
    </>
  );
};

export default Contacts;