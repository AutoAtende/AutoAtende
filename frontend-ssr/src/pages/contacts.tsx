'use client';

import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Checkbox,
  Stack,
  styled,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WhatsApp as WhatsAppIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ContactPhone as ContactIcon,
  Group as GroupIcon,
  CloudUpload as ImportIcon,
  CloudDownload as ExportIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/Auth/AuthContext';
import { api } from '../services/api';
import { toast } from '../helpers/toast';
import ContactModal from '../components/modals/ContactModal';
import NewTicketModal from '../components/modals/NewTicketModal';

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  margin: '0 auto',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const TableWrapper = styled(Paper)(({ theme }) => ({
  width: '100%',
  overflow: 'hidden',
}));

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  minHeight: '60px',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

interface Contact {
  id: string;
  name: string;
  number: string;
  email: string;
  active: boolean;
  profilePicUrl?: string;
  isGroup: boolean;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  companyId: string;
  createdAt: string;
}

const Contacts: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user: currentUser } = useContext(AuthContext);

  // Refs for infinite scroll
  const loadingRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchParam, setSearchParam] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Modal states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState<Contact | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [contactToBlock, setContactToBlock] = useState<Contact | null>(null);

  const isGroupView = activeTab === 1;
  const typeContact = isGroupView ? 'group' : 'private';

  const normalizeContactData = (contact: any): Contact => {
    if (!contact || typeof contact !== 'object') {
      return {
        id: '',
        name: 'N/A',
        number: '',
        email: '',
        active: true,
        profilePicUrl: '',
        isGroup: false,
        tags: [],
        companyId: '',
        createdAt: '',
      };
    }

    return {
      id: contact.id || '',
      name: contact.name || 'N/A',
      number: contact.number || '',
      email: contact.email || '',
      active: contact.active !== false,
      profilePicUrl: contact.profilePicUrl || '',
      isGroup: Boolean(contact.isGroup),
      tags: Array.isArray(contact.tags) ? contact.tags : [],
      companyId: contact.companyId || '',
      createdAt: contact.createdAt || '',
    };
  };

  const fetchContacts = useCallback(async (pageNum: number, isFirstLoad = false) => {
    if (loadingMore) return;

    try {
      if (isFirstLoad) {
        setLoading(true);
        setContacts([]);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const { data } = await api.get('/contacts/', {
        params: {
          searchParam: searchParam.trim(),
          typeContact: typeContact,
          pageNumber: pageNum,
          pageSize: 100,
        },
      });

      const normalizedContacts = Array.isArray(data?.contacts)
        ? data.contacts.map(normalizeContactData)
        : [];

      if (isFirstLoad) {
        setContacts(normalizedContacts);
      } else {
        setContacts(prev => [...prev, ...normalizedContacts]);
      }

      setContactsTotal(data?.count || 0);
      setHasMore(data?.hasMore || false);
      setCurrentPage(pageNum);

    } catch (err) {
      console.error('Error fetching contacts:', err);
      toast.error('Erro ao carregar contatos');
      if (isFirstLoad) {
        setContacts([]);
        setContactsTotal(0);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParam, loadingMore, typeContact]);

  useEffect(() => {
    setHasMore(true);
    fetchContacts(1, true);
  }, [searchParam, activeTab]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore || !loadingRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedContacts([]);
    setSearchParam('');
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParam(event.target.value.toLowerCase());
    setSelectedContacts([]);
  };

  const handleOpenContactModal = (contact?: Contact) => {
    setSelectedContact(contact || null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContact(null);
    setContactModalOpen(false);
    fetchContacts(1, true);
  };

  const handleStartChat = (contact: Contact) => {
    setContactTicket(contact);
    setNewTicketModalOpen(true);
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      await api.delete(`/contacts/${contactToDelete.id}`);
      toast.success('Contato excluído com sucesso');
      setDeleteModalOpen(false);
      setContactToDelete(null);
      fetchContacts(1, true);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Erro ao excluir contato');
    }
  };

  const handleBlockUnblockContact = async () => {
    if (!contactToBlock) return;

    try {
      const { data } = await api.put(`/contacts/toggle-block/${contactToBlock.id}`, { 
        active: !contactToBlock.active 
      });

      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactToBlock.id ? { ...contact, active: data.active } : contact
        )
      );

      toast.success(data.active ? 'Contato desbloqueado' : 'Contato bloqueado');
      setBlockModalOpen(false);
      setContactToBlock(null);
    } catch (error) {
      console.error('Error toggling contact status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const renderContactNumber = (contact: Contact) => {
    if (!contact.number) return 'N/A';
    
    const number = String(contact.number).trim();
    if (!number) return 'N/A';
    
    return number.length > 4 ? `${number.slice(0, -4)}****` : number;
  };

  const renderContactTags = (contact: Contact) => {
    if (!Array.isArray(contact.tags) || contact.tags.length === 0) {
      return (
        <Typography variant="caption" color="text.secondary">
          Sem tags
        </Typography>
      );
    }

    const validTags = contact.tags
      .filter(tag => tag && typeof tag === 'object' && tag.id && tag.name)
      .slice(0, 2);

    if (validTags.length === 0) {
      return (
        <Typography variant="caption" color="text.secondary">
          Sem tags
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {validTags.map((tag) => (
          <Chip
            key={tag.id}
            label={String(tag.name).substring(0, 15)}
            size="small"
            style={{
              backgroundColor: tag.color || '#666',
              color: '#fff',
              height: 20,
              fontSize: '0.7rem',
              maxWidth: '120px',
            }}
          />
        ))}
        {contact.tags.length > 2 && (
          <Chip
            label={`+${contact.tags.length - 2}`}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem', maxWidth: '50px' }}
          />
        )}
      </Box>
    );
  };

  const generateColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215).toString(16);
    return '#' + Array(6 - color.length + 1).join('0') + color;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSelectionChange = (contact: Contact, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contact]);
    } else {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts([...contacts]);
    } else {
      setSelectedContacts([]);
    }
  };

  return (
    <Container>
      <Header>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isGroupView ? 'Grupos' : 'Contatos'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contacts.length} de {contactsTotal} {isGroupView ? 'grupos' : 'contatos'}
            {selectedContacts.length > 0 && ` (${selectedContacts.length} selecionados)`}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          {!isGroupView && (
            <>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                size="small"
              >
                Importar
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                size="small"
              >
                Exportar
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenContactModal()}
          >
            {isGroupView ? 'Novo Grupo' : 'Novo Contato'}
          </Button>
        </Stack>
      </Header>

      <SearchBox>
        <TextField
          placeholder={`Buscar ${isGroupView ? 'grupos' : 'contatos'}...`}
          value={searchParam}
          onChange={handleSearch}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </SearchBox>

      <StyledTabs value={activeTab} onChange={handleTabChange}>
        <Tab
          label="Contatos"
          icon={<ContactIcon />}
          iconPosition="start"
        />
        <Tab
          label="Grupos"
          icon={<GroupIcon />}
          iconPosition="start"
        />
      </StyledTabs>

      {selectedContacts.length > 0 && !isGroupView && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<LockIcon />}
            >
              Bloquear ({selectedContacts.length})
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<LockOpenIcon />}
            >
              Desbloquear ({selectedContacts.length})
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Excluir ({selectedContacts.length})
            </Button>
          </Stack>
        </Box>
      )}

      <TableWrapper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {!isGroupView && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedContacts.length > 0 && selectedContacts.length < contacts.length}
                      checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                )}
                <TableCell>ID</TableCell>
                <TableCell>{isGroupView ? 'Nome do Grupo' : 'Nome'}</TableCell>
                {!isGroupView && <TableCell>Tags</TableCell>}
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isGroupView ? 4 : 6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Carregando {isGroupView ? 'grupos' : 'contatos'}...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isGroupView ? 4 : 6} align="center" sx={{ py: 4 }}>
                    {isGroupView ? <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} /> : <ContactIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />}
                    <Typography variant="h6" color="text.secondary">
                      Nenhum {isGroupView ? 'grupo' : 'contato'} encontrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchParam ? 'Tente ajustar os filtros de busca' : `Adicione o primeiro ${isGroupView ? 'grupo' : 'contato'}`}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    {!isGroupView && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedContacts.some(c => c.id === contact.id)}
                          onChange={(e) => handleSelectionChange(contact, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      {String(contact.id).length > 8 ? String(contact.id).substr(0, 8) + '...' : contact.id}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            bgcolor: generateColor(contact.number || contact.name),
                            width: 40,
                            height: 40
                          }}
                          src={!isGroupView ? contact.profilePicUrl || '' : ''}
                        >
                          {isGroupView ? <GroupIcon /> : getInitials(contact.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {contact.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {renderContactNumber(contact)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {!isGroupView && (
                      <TableCell>
                        {renderContactTags(contact)}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={contact.active ? 'Ativo' : 'Bloqueado'}
                        size="small"
                        color={contact.active ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="Iniciar Chat">
                          <IconButton
                            size="small"
                            onClick={() => handleStartChat(contact)}
                            color="primary"
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!isGroupView && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenContactModal(contact)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={contact.active ? 'Bloquear' : 'Desbloquear'}>
                              <IconButton
                                size="small"
                                color={contact.active ? 'error' : 'success'}
                                onClick={() => {
                                  setContactToBlock(contact);
                                  setBlockModalOpen(true);
                                }}
                              >
                                {contact.active ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setContactToDelete(contact);
                                  setDeleteModalOpen(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Infinite Scroll Loading */}
        {contacts.length > 0 && (
          <LoadingBox ref={loadingRef}>
            {hasMore ? (
              loadingMore ? (
                <>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Carregando mais {isGroupView ? 'grupos' : 'contatos'}...
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Role para carregar mais {isGroupView ? 'grupos' : 'contatos'}
                </Typography>
              )
            ) : (
              <Typography variant="body2" color="text.secondary">
                Todos os {isGroupView ? 'grupos' : 'contatos'} foram carregados ({contacts.length} de {contactsTotal})
              </Typography>
            )}
          </LoadingBox>
        )}
      </TableWrapper>

      {/* Contact Modal */}
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        contact={selectedContact}
      />

      {/* New Ticket Modal */}
      {newTicketModalOpen && contactTicket && (
        <NewTicketModal
          open={newTicketModalOpen}
          initialContact={contactTicket}
          onClose={(ticket) => {
            setNewTicketModalOpen(false);
            if (ticket && (ticket.uuid || ticket.id)) {
              router.push(`/tickets/${ticket.uuid || ticket.id}`);
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o contato <strong>{contactToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteContact} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={blockModalOpen} onClose={() => setBlockModalOpen(false)}>
        <DialogTitle>
          {contactToBlock?.active ? 'Bloquear' : 'Desbloquear'} Contato
        </DialogTitle>
        <DialogContent>
          <Typography>
            {contactToBlock?.active 
              ? `Tem certeza que deseja bloquear o contato ${contactToBlock?.name}?`
              : `Tem certeza que deseja desbloquear o contato ${contactToBlock?.name}?`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {contactToBlock?.active
              ? 'O contato será bloqueado e não poderá enviar mensagens.'
              : 'O contato será desbloqueado e poderá enviar mensagens novamente.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleBlockUnblockContact} 
            color={contactToBlock?.active ? 'error' : 'success'} 
            variant="contained"
          >
            {contactToBlock?.active ? 'Bloquear' : 'Desbloquear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Contacts;