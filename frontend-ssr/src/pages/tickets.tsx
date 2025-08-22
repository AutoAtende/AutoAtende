'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  styled,
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  InputBase,
  IconButton,
  Tooltip,
  Divider,
  Button
} from '@mui/material';
import {
  Chat as ChatIcon,
  DoneAll as DoneAllIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/Auth/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { QueueSelectedProvider } from '../context/QueuesSelectedContext';
import TicketsManager from '../components/features/TicketsManager';
import Ticket from '../components/features/Ticket';
import NewTicketModal from '../components/modals/NewTicketModal';
import TicketsQueueSelect from '../components/features/TicketsQueueSelect';

const Container = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  height: 'calc(100vh - 64px)',
  overflow: 'hidden',
}));

const ChatPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const ContactsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const MessagesWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  flex: 1,
}));

const WelcomeMsg = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
  flexDirection: 'column',
}));

const LogoImg = styled('img')(({ theme }) => ({
  margin: '0 auto',
  width: '200px',
  maxHeight: '120px',
  opacity: 0.6,
  filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
}));

const TabsHeader = styled(Paper)(({ theme }) => ({
  flex: 'none',
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

const TicketOptionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const SearchInputWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  borderRadius: 20,
  padding: 4,
  marginRight: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  paddingLeft: theme.spacing(1),
  color: theme.palette.text.primary,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1),
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
  },
}));

const TabStyled = styled(Tab)(({ theme }) => ({
  minWidth: 60,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

interface TicketsProps {}

const Tickets: React.FC<TicketsProps> = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [searchParam, setSearchParam] = useState('');
  const [tab, setTab] = useState('open');
  const [tabOpen, setTabOpen] = useState('open');
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupOpenCount, setGroupOpenCount] = useState(0);
  const [groupPendingCount, setGroupPendingCount] = useState(0);
  
  const userQueueIds = user?.queues?.map((q: any) => q.id) || [];
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds);
  
  const ticketId = params?.ticketId as string;

  useEffect(() => {
    if (user?.profile?.toUpperCase() === 'ADMIN') {
      setShowAllTickets(true);
    }
  }, [user]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (event: React.SyntheticEvent, newValue: string) => {
    setTabOpen(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchedTerm = event.target.value.toLowerCase();
    setSearchParam(searchedTerm);
  };

  const handleRefreshTickets = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCloseOrOpenTicket = (ticket?: any) => {
    setNewTicketModalOpen(false);
    if (ticket?.uuid) {
      router.push(`/tickets/${ticket.uuid}`);
    }
  };

  const renderTicketsManager = () => (
    <ContactsWrapper>
      <TabsHeader elevation={0} square>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="inherit"
        >
          <Tooltip title="Tickets Abertos" arrow>
            <TabStyled
              value="open"
              icon={<ChatIcon />}
              label={
                <Badge
                  badgeContent={openCount + pendingCount}
                  color="primary"
                  max={999}
                />
              }
            />
          </Tooltip>
          
          <Tooltip title="Grupos" arrow>
            <TabStyled
              value="group"
              icon={<GroupIcon />}
              label={
                <Badge
                  badgeContent={groupOpenCount + groupPendingCount}
                  color="primary"
                  max={999}
                />
              }
            />
          </Tooltip>
          
          <Tooltip title="Tickets Fechados" arrow>
            <TabStyled
              value="closed"
              icon={<DoneAllIcon />}
            />
          </Tooltip>
          
          <Tooltip title="Pesquisar" arrow>
            <TabStyled
              value="search"
              icon={<SearchIcon />}
            />
          </Tooltip>
        </Tabs>
      </TabsHeader>

      <TicketOptionsBox>
        <Box display="flex" alignItems="center" gap={1}>
          {tab === 'search' ? (
            <SearchInputWrapper>
              <SearchIcon sx={{ color: 'text.secondary', ml: 1, alignSelf: 'center' }} />
              <SearchInput
                placeholder="Pesquisar tickets..."
                onChange={handleSearch}
                value={searchParam}
              />
            </SearchInputWrapper>
          ) : (
            <>
              <Tooltip title="Atualizar" arrow>
                <IconButton
                  onClick={handleRefreshTickets}
                  color="primary"
                  size="small"
                >
                  <RefreshIcon className={refreshing ? 'rotating' : ''} />
                </IconButton>
              </Tooltip>

              {(user?.allTicket === 'enabled' || user?.profile === 'admin') && (
                <Tooltip title={showAllTickets ? 'Ocultar Todos' : 'Ver Todos'} arrow>
                  <IconButton
                    onClick={() => setShowAllTickets(!showAllTickets)}
                    color="primary"
                    size="small"
                  >
                    {showAllTickets ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Novo Ticket" arrow>
                <IconButton
                  onClick={() => setNewTicketModalOpen(true)}
                  color="primary"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        <TicketsQueueSelect
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues || []}
          onChange={setSelectedQueueIds}
        />
      </TicketOptionsBox>

      {/* Sub-tabs for open tickets */}
      {tab === 'open' && (
        <TabsHeader elevation={0} square>
          <Tabs
            value={tabOpen}
            onChange={handleChangeTabOpen}
            variant="fullWidth"
            indicatorColor="primary"
          >
            <Tab
              label={
                <Badge badgeContent={openCount} color="primary" max={999}>
                  Atribuídos
                </Badge>
              }
              value="open"
            />
            <Tab
              label={
                <Badge badgeContent={pendingCount} color="secondary" max={999}>
                  Pendentes
                </Badge>
              }
              value="pending"
            />
          </Tabs>
        </TabsHeader>
      )}

      <TicketsManager
        tab={tab}
        tabOpen={tabOpen}
        searchParam={searchParam}
        showAllTickets={showAllTickets}
        selectedQueueIds={selectedQueueIds}
        refreshing={refreshing}
        onUpdateOpenCount={setOpenCount}
        onUpdatePendingCount={setPendingCount}
        onUpdateGroupOpenCount={setGroupOpenCount}
        onUpdateGroupPendingCount={setGroupPendingCount}
      />
    </ContactsWrapper>
  );

  const renderWelcomeMessage = () => (
    <WelcomeMsg elevation={0}>
      <Box textAlign="center">
        <LogoImg src="/logo.png" alt="Logo" />
        <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
          Selecione um ticket para começar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Escolha um ticket da lista ao lado para visualizar a conversa
        </Typography>
      </Box>
    </WelcomeMsg>
  );

  return (
    <QueueSelectedProvider>
      <Container>
        <ChatPaper elevation={1}>
          <Grid container spacing={0} sx={{ height: '100%' }}>
            <Grid item xs={12} md={4} sx={{ height: '100%' }}>
              {renderTicketsManager()}
            </Grid>
            <Grid item xs={12} md={8} sx={{ height: '100%' }}>
              <MessagesWrapper>
                {ticketId ? (
                  <Ticket ticketId={ticketId} />
                ) : (
                  renderWelcomeMessage()
                )}
              </MessagesWrapper>
            </Grid>
          </Grid>
        </ChatPaper>
      </Container>

      {newTicketModalOpen && (
        <NewTicketModal
          open={newTicketModalOpen}
          onClose={handleCloseOrOpenTicket}
        />
      )}
    </QueueSelectedProvider>
  );
};

export default Tickets;