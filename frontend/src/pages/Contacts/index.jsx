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
import StandardPageLayout from "../../components/StandardPageLayout";
import StandardDataTable from "../../components/StandardDataTable";

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

  const fetchContacts = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      const { data } = await api.get("/contacts/", {
        params: {
          searchParam,
          typeContact: "private",
          tagIds: tagFilter.length > 0 ? tagFilter.join(',') : undefined,
        },
      });
      
      if (isMounted.current) {
        setContactsTotal(data?.count || 0);
        setContacts(data?.contacts || []);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Erro ao buscar contatos:", err);
        toast.error("Erro ao carregar contatos");
        setContacts([]);
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
    setSearchParam(event.target.value.toLowerCase());
    setSelectedContacts([]);
  }, []);

  const handleTagFilterChange = useCallback((selectedTagIds) => {
    setTagFilter(selectedTagIds);
  }, []);

  const handleOpenContactModal = useCallback(() => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  }, []);

  const handleEditContact = useCallback((contact) => {
    setSelectedContactId(contact.id);
    setContactModalOpen(true);
  }, []);

  const handleCloseContactModal = useCallback(() => {
    setContactModalOpen(false);
    setSelectedContactId(null);
    setMakeRequest(Math.random());
  }, [setMakeRequest]);

  const handleStartChat = useCallback((contact) => {
    setContactTicket(contact);
    setNewTicketModalOpen(true);
  }, []);

  const handleDeleteContact = useCallback(async (contactId) => {
    try {
      Loading.turnOn();
      await api.delete(`/contacts/${contactId}`);
      toast.success("Contato excluído com sucesso");
      setMakeRequest(Math.random());
    } catch (err) {
      toast.error("Erro ao excluir contato");
    } finally {
      Loading.turnOff();
      setDeletingContact(null);
      setConfirmOpen(false);
    }
  }, [Loading, setMakeRequest]);

  const handleBlockUnblockContact = useCallback(async (contactId, active) => {
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
    if (selectedContacts.length === 0) return;

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
      toast.error("Erro na ação em massa");
    } finally {
      Loading.turnOff();
      setConfirmBulkAction(false);
    }
  }, [selectedContacts, bulkActionType, Loading, setMakeRequest]);

  // Configuração das colunas
  const columns = [
    {
      id: 'id',
      field: 'id',
      label: 'ID',
      width: 80,
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

  // Ações da tabela condicionais
  const getTableActions = (contact) => {
    const actions = [];

    if (user.profile !== 'user' && !contact.isGroup) {
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

    if (!contact.isGroup) {
      actions.push({
        label: contact.active === false ? "Desbloquear" : "Bloquear",
        icon: contact.active === false ? <LockOpenIcon /> : <LockIcon />,
        onClick: (contact) => {
          setBlockingContact(contact);
          setConfirmBlockOpen(true);
        },
        color: contact.active === false ? 'success' : 'error'
      });
    }

    actions.push({
      label: "Excluir",
      icon: <DeleteIcon />,
      onClick: (contact) => {
        setDeletingContact(contact);
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

  const formattedCounter = () => {
    const baseText = `${contacts.length} de ${contactsTotal} contatos`;
    return selectedContacts.length > 0 
      ? `${baseText} (${selectedContacts.length} selecionados)`
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
          actions={contacts.length > 0 ? getTableActions(contacts[0]) : []}
          onRowClick={(contact) => handleEditContact(contact)}
          stickyHeader={true}
          size="small"
          hover={true}
          maxVisibleActions={3}
          emptyIcon={<ContactIcon />}
          emptyTitle="Nenhum contato encontrado"
          emptyDescription="Não há contatos cadastrados para os filtros selecionados."
          emptyActionLabel="Adicionar Contato"
          onEmptyActionClick={handleOpenContactModal}
          customRowRenderer={(contact, index, columns) => (
            <>
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.id || colIndex}
                  align={column.align || 'left'}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  {column.render ? column.render(contact, index) : contact[column.field] || '-'}
                </TableCell>
              ))}
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  {getTableActions(contact).slice(0, 3).map((action, actionIndex) => (
                    <Tooltip key={actionIndex} title={action.label}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          action.onClick(contact);
                        }}
                        color={action.color || 'default'}
                        sx={{ padding: '4px' }}
                      >
                        {action.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              </TableCell>
            </>
          )}
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

      {confirmOpen && (
        <ConfirmationModal
          title={`Excluir ${deletingContact?.name}?`}
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
            blockingContact.active === false
              ? `Desbloquear ${blockingContact.name}?`
              : `Bloquear ${blockingContact.name}?`
          }
          open={confirmBlockOpen}
          onClose={() => setConfirmBlockOpen(false)}
          onConfirm={() => handleBlockUnblockContact(
            blockingContact.id, 
            !blockingContact.active
          )}
        >
          {blockingContact.active === false
            ? "O contato será desbloqueado e poderá enviar mensagens novamente."
            : "O contato será bloqueado e não poderá enviar mensagens."}
        </ConfirmationModal>
      )}

      {confirmBulkAction && (
        <ConfirmationModal
          title={`${bulkActionType === 'block' ? 'Bloquear' : bulkActionType === 'unblock' ? 'Desbloquear' : 'Excluir'} Contatos`}
          open={confirmBulkAction}
          onClose={() => setConfirmBulkAction(false)}
          onConfirm={executeBulkAction}
        >
          {`Deseja ${bulkActionType === 'block' ? 'bloquear' : bulkActionType === 'unblock' ? 'desbloquear' : 'excluir'} ${selectedContacts.length} contato(s) selecionado(s)?`}
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