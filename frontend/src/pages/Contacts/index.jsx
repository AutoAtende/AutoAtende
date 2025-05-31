import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Avatar,
  Chip,
  Typography,
  CircularProgress,
  useTheme,
  TableCell,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Add as AddIcon,
  CloudUpload as ImportIcon,
  CloudDownload as ExportIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  WhatsApp as WhatsAppIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ContactPhone as ContactIcon
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

// Contexts
import { AuthContext } from "../../context/Auth/AuthContext";
import { GlobalContext } from "../../context/GlobalContext";

// Utils & Helpers
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import formatSerializedId from "../../utils/formatSerializedId";
import { useLoading } from "../../hooks/useLoading";

const Contacts = () => {
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { Loading } = useLoading();
  const { makeRequest, setMakeRequest } = useContext(GlobalContext);
  
  // Refs
  const isMounted = useRef(true);

  // States
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [tagFilter, setTagFilter] = useState([]);
  
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
  const [blockingContact, setBlockingContact] = useState(null);
  const [confirmBulkAction, setConfirmBulkAction] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Função auxiliar para validar e normalizar dados de contato
  const normalizeContactData = (contact) => {
    if (!contact || typeof contact !== 'object') {
      return {
        id: '',
        name: 'N/A',
        number: '',
        email: '',
        active: true,
        tags: [],
        profilePicUrl: '',
        isGroup: false
      };
    }

    return {
      id: contact.id || '',
      name: contact.name || 'N/A',
      number: contact.number || '',
      email: contact.email || '',
      active: contact.active !== false, // Assume ativo por padrão
      tags: Array.isArray(contact.tags) ? contact.tags : [],
      profilePicUrl: contact.profilePicUrl || '',
      isGroup: Boolean(contact.isGroup),
      ...contact // Mantém outras propriedades
    };
  };

  const fetchContacts = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      const { data } = await api.get("/contacts/", {
        params: {
          searchParam,
          typeContact: "private",
          tagIds: Array.isArray(tagFilter) && tagFilter.length > 0 ? tagFilter.join(',') : undefined,
        },
      });
      
      if (isMounted.current) {
        // Normalizar dados antes de definir estado
        const normalizedContacts = Array.isArray(data?.contacts) 
          ? data.contacts.map(normalizeContactData)
          : [];
        
        setContactsTotal(data?.count || 0);
        setContacts(normalizedContacts);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Erro ao buscar contatos:", err);
        toast.error("Erro ao carregar contatos");
        setContacts([]);
        setContactsTotal(0);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [searchParam, tagFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, makeRequest]);

  // Handlers
  const handleSearchChange = useCallback((event) => {
    const value = event?.target?.value || '';
    setSearchParam(value.toLowerCase());
    setSelectedContacts([]);
  }, []);

  const handleTagFilterChange = useCallback((selectedTagIds) => {
    // Garantir que sempre seja um array
    const normalizedTagIds = Array.isArray(selectedTagIds) ? selectedTagIds : [];
    setTagFilter(normalizedTagIds);
  }, []);

  const handleOpenContactModal = useCallback(() => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  }, []);

  const handleEditContact = useCallback((contact) => {
    if (contact && contact.id) {
      setSelectedContactId(contact.id);
      setContactModalOpen(true);
    }
  }, []);

  const handleCloseContactModal = useCallback(() => {
    setContactModalOpen(false);
    setSelectedContactId(null);
    setMakeRequest(Math.random());
  }, [setMakeRequest]);

  const handleStartChat = useCallback((contact) => {
    const normalizedContact = normalizeContactData(contact);
    setContactTicket(normalizedContact);
    setNewTicketModalOpen(true);
  }, []);

  const handleDeleteContact = useCallback(async (contactId) => {
    if (!contactId) return;
    
    try {
      Loading.turnOn();
      await api.delete(`/contacts/${contactId}`);
      toast.success("Contato excluído com sucesso");
      setMakeRequest(Math.random());
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
      toast.error("Erro ao excluir contato");
    } finally {
      Loading.turnOff();
      setDeletingContact(null);
      setConfirmOpen(false);
    }
  }, [Loading, setMakeRequest]);

  const handleBlockUnblockContact = useCallback(async (contactId, active) => {
    if (!contactId) return;
    
    try {
      Loading.turnOn();
      const { data } = await api.put(`/contacts/toggle-block/${contactId}`, { active });
      
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId ? {...contact, active: data.active} : contact
        )
      );
      
      toast.success(data.active ? "Contato desbloqueado" : "Contato bloqueado");
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      toast.error("Erro ao alterar status");
    } finally {
      Loading.turnOff();
      setBlockingContact(null);
      setConfirmBlockOpen(false);
    }
  }, [Loading]);

  const handleBulkAction = useCallback((actionType) => {
    setBulkActionType(actionType);
    setConfirmBulkAction(true);
  }, []);

  const executeBulkAction = useCallback(async () => {
    if (!Array.isArray(selectedContacts) || selectedContacts.length === 0) return;

    try {
      Loading.turnOn();
      
      const contactIds = selectedContacts
        .filter(contact => contact && contact.id)
        .map(contact => contact.id);
      
      if (contactIds.length === 0) {
        toast.error("Nenhum contato válido selecionado");
        return;
      }
      
      switch (bulkActionType) {
        case 'block':
          await api.post("/contacts/bulk-block", {
            contactIds,
            active: false
          });
          toast.success("Contatos bloqueados em massa");
          break;
        case 'unblock':
          await api.post("/contacts/bulk-block", {
            contactIds,
            active: true
          });
          toast.success("Contatos desbloqueados em massa");
          break;
        case 'delete':
          await api.post("/contacts/bulk-delete", {
            contactIds
          });
          toast.success("Contatos excluídos em massa");
          break;
        default:
          toast.error("Ação desconhecida");
      }
      
      setSelectedContacts([]);
      setMakeRequest(Math.random());
    } catch (err) {
      console.error("Erro na ação em massa:", err);
      toast.error("Erro na ação em massa");
    } finally {
      Loading.turnOff();
      setConfirmBulkAction(false);
    }
  }, [selectedContacts, bulkActionType, Loading, setMakeRequest]);

  // Função auxiliar para renderizar ID seguro
  const renderContactId = (contact) => {
    if (!contact || !contact.id) return 'N/A';
    
    const idString = String(contact.id);
    return idString.length > 8 ? idString.substr(0, 8) + '...' : idString;
  };

  // Função auxiliar para renderizar número seguro
  const renderContactNumber = (contact) => {
    try {
      if (!contact || contact.number === undefined || contact.number === null) return "N/A";
      
      const number = String(contact.number).trim();
      if (!number) return "N/A";
      
      if (user?.isTricked === "enabled") {
        return formatSerializedId(number);
      }
      
      return number.length > 4 ? `${number.slice(0, -4)}****` : number;
    } catch (error) {
      console.error("Erro ao formatar número do contato:", error);
      return "N/A";
    }
  };

  // Função auxiliar para renderizar tags seguro
  const renderContactTags = useCallback((contact) => {
    try {
      if (!contact || !Array.isArray(contact?.tags) || contact.tags.length === 0) {
        return (
          <Typography variant="caption" color="textSecondary">
            Sem tags
          </Typography>
        );
      }

      const validTags = contact.tags
        .filter(tag => tag && typeof tag === 'object' && tag.id && tag.name)
        .slice(0, 3); // Limita a 3 tags para performance
      
      if (validTags.length === 0) {
        return (
          <Typography variant="caption" color="textSecondary">
            Sem tags
          </Typography>
        );
      }

      const visibleTags = validTags.slice(0, 2);
      const hasMore = validTags.length > 2;

      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {visibleTags.map((tag) => (
            <Chip
              key={`${tag.id}-${tag.name}`}
              label={String(tag.name).substring(0, 15)}
              size="small"
              style={{
                backgroundColor: tag.color || '#666',
                color: '#fff',
                height: 20,
                fontSize: '0.7rem',
                maxWidth: '120px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            />
          ))}
          {hasMore && (
            <Chip
              label={`+${validTags.length - 2}`}
              size="small"
              variant="outlined"
              sx={{ 
                height: 20, 
                fontSize: '0.7rem',
                maxWidth: '50px'
              }}
            />
          )}
        </Box>
      );
    } catch (error) {
      console.error('Erro ao renderizar tags:', error);
      return (
        <Typography variant="caption" color="error">
          Erro ao carregar tags
        </Typography>
      );
    }
  }, []);

  // Configuração das colunas
  const columns = [
    {
      id: 'id',
      field: 'id',
      label: 'ID',
      width: 80,
      render: renderContactId
    },
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      minWidth: 200,
      render: (contact) => {
        const normalizedContact = normalizeContactData(contact);
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                bgcolor: generateColor(normalizedContact.number || normalizedContact.name),
                width: 40,
                height: 40
              }}
              src={normalizedContact.profilePicUrl || ''}
            >
              {getInitials(normalizedContact.name)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {normalizedContact.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {renderContactNumber(normalizedContact)}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'tags',
      field: 'tags',
      label: 'Tags',
      width: 200,
      render: renderContactTags
    },
    {
      id: 'status',
      field: 'active',
      label: 'Status',
      width: 120,
      render: (contact) => {
        const normalizedContact = normalizeContactData(contact);
        
        return (
          <Chip
            label={normalizedContact.active ? 'Ativo' : 'Bloqueado'}
            size="small"
            color={normalizedContact.active ? 'success' : 'error'}
            variant="outlined"
          />
        );
      }
    }
  ];

  // Ações da tabela condicionais
  const getTableActions = (contact) => {
    const actions = [];
    const normalizedContact = normalizeContactData(contact);

    if (user?.profile !== 'user' && !normalizedContact.isGroup) {
      actions.push({
        label: "Iniciar Chat",
        icon: <WhatsAppIcon />,
        onClick: (contact) => handleStartChat(contact),
        color: "primary"
      });
    }

    actions.push({
      label: "Editar",
      icon: <EditIcon />,
      onClick: (contact) => handleEditContact(contact),
      color: "primary"
    });

    if (!normalizedContact.isGroup) {
      actions.push({
        label: normalizedContact.active ? "Bloquear" : "Desbloquear",
        icon: normalizedContact.active ? <LockIcon /> : <LockOpenIcon />,
        onClick: (contact) => {
          setBlockingContact(normalizeContactData(contact));
          setConfirmBlockOpen(true);
        },
        color: normalizedContact.active ? 'error' : 'success'
      });
    }

    actions.push({
      label: "Excluir",
      icon: <DeleteIcon />,
      onClick: (contact) => {
        setDeletingContact(normalizeContactData(contact));
        setConfirmOpen(true);
      },
      color: "error"
    });

    return actions;
  };

  // Ações do header
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
      variant: "outlined"
    },
    {
      label: "Exportar",
      icon: <ExportIcon />,
      onClick: () => setExportModalOpen(true),
      variant: "outlined"
    }
  ];

  // Ações em massa
  const bulkActions = Array.isArray(selectedContacts) && selectedContacts.length > 0 ? [
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

  const formattedCounter = () => {
    const selectedCount = Array.isArray(selectedContacts) ? selectedContacts.length : 0;
    const baseText = `${contacts.length} de ${contactsTotal} contatos`;
    return selectedCount > 0 
      ? `${baseText} (${selectedCount} selecionados)`
      : baseText;
  };

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
        {/* Filtro de tags */}
        <Box sx={{ mb: 3, maxWidth: 300 }}>
          <TagFilterComponent 
            onFilterChange={handleTagFilterChange} 
            size="small"
            placeholder="Filtrar por tags..."
          />
        </Box>

        <StandardDataTable
          data={contacts}
          columns={columns}
          loading={loading}
          selectable={true}
          selectedItems={selectedContacts}
          onSelectionChange={setSelectedContacts}
          actions={getTableActions}
          stickyHeader={true}
          size="small"
          hover={true}
          maxVisibleActions={3}
          emptyIcon={<ContactIcon />}
          emptyTitle="Nenhum contato encontrado"
          emptyDescription="Não há contatos cadastrados para os filtros selecionados."
          emptyActionLabel="Adicionar Contato"
          onEmptyActionClick={handleOpenContactModal}
        />
      </StandardPageLayout>

      {/* Modais */}
      {newTicketModalOpen && (
        <NewTicketModal
          modalOpen={newTicketModalOpen}
          initialContact={contactTicket}
          onClose={(ticket) => {
            setNewTicketModalOpen(false);
            if (ticket && (ticket.uuid || ticket.id)) {
              history.push(`/tickets/${ticket.uuid || ticket.id}`);
            }
          }}
        />
      )}

      {contactModalOpen && (
        <ContactModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          contactId={selectedContactId}
          onSave={() => setMakeRequest(Math.random())}
        />
      )}

      {confirmOpen && deletingContact && (
        <ConfirmationModal
          title={`Excluir ${deletingContact.name}?`}
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => handleDeleteContact(deletingContact.id)}
        >
          Esta ação não pode ser desfeita. Deseja continuar?
        </ConfirmationModal>
      )}

      {confirmBlockOpen && blockingContact && (
        <ConfirmationModal
          title={
            blockingContact.active
              ? `Bloquear ${blockingContact.name}?`
              : `Desbloquear ${blockingContact.name}?`
          }
          open={confirmBlockOpen}
          onClose={() => setConfirmBlockOpen(false)}
          onConfirm={() => handleBlockUnblockContact(
            blockingContact.id, 
            !blockingContact.active
          )}
        >
          {blockingContact.active
            ? "O contato será bloqueado e não poderá enviar mensagens."
            : "O contato será desbloqueado e poderá enviar mensagens novamente."}
        </ConfirmationModal>
      )}

      {confirmBulkAction && (
        <ConfirmationModal
          title={`${bulkActionType === 'block' ? 'Bloquear' : bulkActionType === 'unblock' ? 'Desbloquear' : 'Excluir'} Contatos`}
          open={confirmBulkAction}
          onClose={() => setConfirmBulkAction(false)}
          onConfirm={executeBulkAction}
        >
          {`Deseja ${bulkActionType === 'block' ? 'bloquear' : bulkActionType === 'unblock' ? 'desbloquear' : 'excluir'} ${Array.isArray(selectedContacts) ? selectedContacts.length : 0} contato(s) selecionado(s)?`}
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