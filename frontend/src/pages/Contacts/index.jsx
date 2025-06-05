import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Avatar,
  Chip,
  Typography,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  Stack
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
  ContactPhone as ContactIcon,
  Group as GroupIcon
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

  // Refs para infinite scroll
  const isMounted = useRef(true);
  const observerRef = useRef();
  const loadingRef = useRef();

  // States principais
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [tagFilter, setTagFilter] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Tabs state
  const [activeTab, setActiveTab] = useState(0);

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

  // Configuração das abas
  const tabs = [
    { label: "Contatos", icon: <ContactIcon /> },
    { label: "Grupos", icon: <GroupIcon /> }
  ];

  // Determinar se estamos visualizando grupos ou contatos
  const isGroupView = activeTab === 1;
  const typeContact = isGroupView ? "group" : "private";

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
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
      active: contact.active !== false,
      tags: Array.isArray(contact.tags) ? contact.tags : [],
      profilePicUrl: contact.profilePicUrl || '',
      isGroup: Boolean(contact.isGroup),
      ...contact
    };
  };

  // Função fetchContacts corrigida para paginação adequada
  const fetchContacts = useCallback(async (pageNum, isFirstLoad = false) => {
    if (!isMounted.current || loadingMore) return;

    try {
      console.log(`🔄 Carregando página ${pageNum} - First Load: ${isFirstLoad} - Type: ${typeContact}`);
      
      if (isFirstLoad) {
        setLoading(true);
        setContacts([]);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const { data } = await api.get("/contacts/", {
        params: {
          searchParam: searchParam.trim(),
          typeContact: typeContact,
          tagIds: Array.isArray(tagFilter) && tagFilter.length > 0 ? tagFilter.join(',') : undefined,
          pageNumber: pageNum, // Usar pageNumber em vez de page
          pageSize: 100 // Definir pageSize explicitamente
        },
      });

      if (isMounted.current) {
        const normalizedContacts = Array.isArray(data?.contacts)
          ? data.contacts.map(normalizeContactData)
          : [];

        console.log(`✅ Recebidos ${normalizedContacts.length} contatos na página ${pageNum}`);
        console.log(`📊 Total: ${data?.count}, HasMore: ${data?.hasMore}`);

        if (isFirstLoad) {
          setContacts(normalizedContacts);
        } else {
          setContacts(prev => [...prev, ...normalizedContacts]);
        }

        setContactsTotal(data?.count || 0);
        setHasMore(data?.hasMore || false);
        setCurrentPage(pageNum);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("❌ Erro ao buscar contatos:", err);
        toast.error("Erro ao carregar contatos");
        if (isFirstLoad) {
          setContacts([]);
          setContactsTotal(0);
          setHasMore(false);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchParam, tagFilter, loadingMore, typeContact]);

  // Effect para carregar dados iniciais quando filtros ou aba mudam
  useEffect(() => {
    console.log('🔄 Recarregando dados - filtros ou aba mudaram');
    setHasMore(true);
    fetchContacts(1, true);
  }, [searchParam, tagFilter, makeRequest, activeTab]);

  // Intersection Observer para infinite scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore || !loadingRef.current) {
      console.log('🚫 Observer não criado:', { hasMore, loading, loadingMore, hasRef: !!loadingRef.current });
      return;
    }

    console.log('👁️ Criando Intersection Observer para página', currentPage + 1);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        console.log('👁️ Observer disparado:', { 
          isIntersecting: entry.isIntersecting, 
          hasMore, 
          loading, 
          loadingMore,
          nextPage: currentPage + 1
        });

        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          console.log(`🚀 Carregando próxima página: ${currentPage + 1}`);
          fetchContacts(currentPage + 1, false);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(loadingRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, currentPage, fetchContacts]);

  // Handlers
  const handleSearchChange = useCallback((event) => {
    const value = event?.target?.value || '';
    console.log('🔍 Mudança de busca:', value);
    setSearchParam(value.toLowerCase());
    setSelectedContacts([]);
  }, []);

  const handleTagFilterChange = useCallback((selectedTagIds) => {
    const normalizedTagIds = Array.isArray(selectedTagIds) ? selectedTagIds : [];
    console.log('🏷️ Mudança de filtro de tags:', normalizedTagIds);
    setTagFilter(normalizedTagIds);
    setSelectedContacts([]);
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    console.log('📑 Mudança de aba:', newValue);
    setActiveTab(newValue);
    setSelectedContacts([]);
    setSearchParam('');
    setTagFilter([]);
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
          contact.id === contactId ? { ...contact, active: data.active } : contact
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
        .slice(0, 3);

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
      label: isGroupView ? 'Nome do Grupo' : 'Nome',
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
              src={!isGroupView ? normalizedContact.profilePicUrl || '' : ''}
            >
              {isGroupView ? <GroupIcon /> : getInitials(normalizedContact.name)}
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
    }
  ];

  // Adicionar coluna de tags apenas para contatos individuais
  if (!isGroupView) {
    columns.push({
      id: 'tags',
      field: 'tags',
      label: 'Tags',
      width: 200,
      render: renderContactTags
    });
  }

  // Adicionar coluna de status
  columns.push({
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
  });

  // Ações da tabela
  const getTableActions = useCallback((contact) => {
    const actions = [];
    const normalizedContact = normalizeContactData(contact);

    // Ação de iniciar chat (para todos os tipos)
    actions.push({
      label: "Iniciar Chat",
      icon: <WhatsAppIcon />,
      onClick: () => handleStartChat(normalizedContact),
      color: "primary"
    });

    // Ações específicas para contatos individuais
    if (user?.profile !== 'user' && !normalizedContact.isGroup) {
      actions.push({
        label: "Editar",
        icon: <EditIcon />,
        onClick: () => handleEditContact(normalizedContact),
        color: "primary"
      });

      actions.push({
        label: normalizedContact.active ? "Bloquear" : "Desbloquear",
        icon: normalizedContact.active ? <LockIcon /> : <LockOpenIcon />,
        onClick: () => {
          setBlockingContact(normalizedContact);
          setConfirmBlockOpen(true);
        },
        color: normalizedContact.active ? 'error' : 'success',
        divider: true
      });

      actions.push({
        label: "Excluir",
        icon: <DeleteIcon />,
        onClick: () => {
          setDeletingContact(normalizedContact);
          setConfirmOpen(true);
        },
        color: "error"
      });
    }

    return actions;
  }, [user, handleStartChat, handleEditContact]);

  // Ações do header
  const pageActions = [
    {
      label: isGroupView ? "Adicionar Grupo" : "Adicionar",
      icon: <AddIcon />,
      onClick: handleOpenContactModal,
      variant: "contained",
      color: "primary",
      primary: true
    }
  ];

  // Adicionar ações de importar/exportar apenas para contatos individuais
  if (!isGroupView) {
    pageActions.push(
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
    );
  }

  // Ações em massa (apenas para contatos individuais)
  const bulkActions = !isGroupView && Array.isArray(selectedContacts) && selectedContacts.length > 0 ? [
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
    const itemType = isGroupView ? 'grupos' : 'contatos';
    const baseText = `${contacts.length} de ${contactsTotal} ${itemType}`;
    return selectedCount > 0
      ? `${baseText} (${selectedCount} selecionados)`
      : baseText;
  };

  // COMPONENTE CUSTOMIZADO para renderizar conteúdo após a tabela
  const renderTableFooter = () => {
    if (contacts.length === 0) return null;

    return (
      <>
        {/* Elemento observado para scroll infinito */}
        {hasMore && (
          <Box
            ref={loadingRef}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
              minHeight: '60px',
              width: '100%',
              backgroundColor: 'background.paper',
              borderTop: '1px solid',
              borderTopColor: 'divider'
            }}
          >
            {loadingMore ? (
              <>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Carregando mais {isGroupView ? 'grupos' : 'contatos'}...
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Role para carregar mais {isGroupView ? 'grupos' : 'contatos'}
              </Typography>
            )}
          </Box>
        )}

        {/* Indicador de fim dos dados */}
        {!hasMore && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: 2,
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderTopColor: 'divider'
          }}>
            <Typography variant="body2" color="textSecondary">
              Todos os {isGroupView ? 'grupos' : 'contatos'} foram carregados ({contacts.length} de {contactsTotal})
            </Typography>
          </Box>
        )}
      </>
    );
  };

  return (
    <>
      <StandardPageLayout
        title={isGroupView ? "Grupos" : "Contatos"}
        subtitle={formattedCounter()}
        showSearch={true}
        searchValue={searchParam}
        onSearchChange={handleSearchChange}
        searchPlaceholder={`Buscar ${isGroupView ? 'grupos' : 'contatos'}...`}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        actions={[...pageActions, ...bulkActions]}
        loading={loading}
      >
        {/* Filtros na mesma linha que a pesquisa - apenas para contatos */}
        {!isGroupView && (
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mb: 3, alignItems: { sm: 'center' } }}
          >
            {/* Filtro de tags com mesmo estilo da pesquisa */}
            <Box sx={{ 
              width: { xs: '100%', sm: '300px' },
              flexShrink: 0 
            }}>
              <TagFilterComponent
                onFilterChange={handleTagFilterChange}
                size="small"
                placeholder="Filtrar por tags..."
              />
            </Box>
          </Stack>
        )}

        {/* Container principal com scroll controlado */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          minHeight: 0
        }}>
          {/* Tabela de contatos/grupos */}
          <StandardDataTable
            data={contacts}
            columns={columns}
            loading={loading}
            selectable={!isGroupView} // Apenas contatos individuais são selecionáveis
            selectedItems={selectedContacts}
            onSelectionChange={setSelectedContacts}
            actions={getTableActions}
            stickyHeader={false}
            size="small"
            hover={true}
            maxVisibleActions={2}
            emptyIcon={isGroupView ? <GroupIcon /> : <ContactIcon />}
            emptyTitle={`Nenhum ${isGroupView ? 'grupo' : 'contato'} encontrado`}
            emptyDescription={`Não há ${isGroupView ? 'grupos' : 'contatos'} cadastrados para os filtros selecionados.`}
            emptyActionLabel={`Adicionar ${isGroupView ? 'Grupo' : 'Contato'}`}
            onEmptyActionClick={handleOpenContactModal}
            containerProps={{
              sx: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                '& .MuiTable-root': {
                  flex: 1
                }
              }
            }}
          />

          {/* Footer da tabela com elementos do infinite scroll */}
          {renderTableFooter()}
        </Box>

        {/* Debug info (desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ 
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: 1,
            borderRadius: 1,
            fontSize: '0.75rem',
            zIndex: 9999
          }}>
            <div>📑 Aba: {isGroupView ? 'Grupos' : 'Contatos'}</div>
            <div>📄 Página: {currentPage}</div>
            <div>📊 Items: {contacts.length}/{contactsTotal}</div>
            <div>➡️ HasMore: {hasMore ? '✅' : '❌'}</div>
            <div>🔄 Loading: {loading ? '✅' : '❌'}</div>
            <div>⏳ LoadingMore: {loadingMore ? '✅' : '❌'}</div>
            <div>👁️ Observer: {loadingRef.current ? '✅' : '❌'}</div>
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
              history.push(`/tickets/${ticket.uuid || ticket.id}`);
            }
          }}
        />
      )}

      {/* Modal de contato apenas para contatos individuais */}
      {contactModalOpen && !isGroupView && (
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

      {/* Modais de importação/exportação apenas para contatos */}
      {importModalOpen && !isGroupView && (
        <ImportExportStepper
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          mode="import"
        />
      )}

      {exportModalOpen && !isGroupView && (
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