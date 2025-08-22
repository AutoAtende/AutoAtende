'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Badge,
  Paper,
  Divider,
  CircularProgress,
  styled
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Message as MessageIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';

const TicketsContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const TicketsList = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: 0,
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: 3,
  },
}));

const TicketItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const TicketButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '20',
    borderRight: `4px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '30',
    },
  },
}));

const TicketContent = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const TicketHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
}));

const ContactName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
}));

const LastMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
}));

const TicketInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(0.5),
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  height: 20,
  fontSize: '0.7rem',
  fontWeight: 500,
  ...(status === 'open' && {
    backgroundColor: theme.palette.success.main + '20',
    color: theme.palette.success.main,
  }),
  ...(status === 'pending' && {
    backgroundColor: theme.palette.warning.main + '20',
    color: theme.palette.warning.main,
  }),
  ...(status === 'closed' && {
    backgroundColor: theme.palette.grey[500] + '20',
    color: theme.palette.grey[600],
  }),
}));

interface Ticket {
  id: string;
  uuid: string;
  status: 'open' | 'pending' | 'closed';
  contact: {
    id: string;
    name: string;
    profilePicUrl?: string;
  };
  user?: {
    id: string;
    name: string;
  };
  queue?: {
    id: string;
    name: string;
    color: string;
  };
  lastMessage?: string;
  lastMessageAt: string;
  unreadMessages: number;
  isGroup: boolean;
  updatedAt: string;
}

interface TicketsManagerProps {
  tab: string;
  tabOpen: string;
  searchParam: string;
  showAllTickets: boolean;
  selectedQueueIds: number[];
  refreshing: boolean;
  onUpdateOpenCount: (count: number) => void;
  onUpdatePendingCount: (count: number) => void;
  onUpdateGroupOpenCount: (count: number) => void;
  onUpdateGroupPendingCount: (count: number) => void;
}

const TicketsManager: React.FC<TicketsManagerProps> = ({
  tab,
  tabOpen,
  searchParam,
  showAllTickets,
  selectedQueueIds,
  refreshing,
  onUpdateOpenCount,
  onUpdatePendingCount,
  onUpdateGroupOpenCount,
  onUpdateGroupPendingCount,
}) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: ptBR });
    } else if (isYesterday(messageDate)) {
      return 'Ontem';
    } else {
      return format(messageDate, 'dd/MM', { locale: ptBR });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'pending':
        return 'Pendente';
      case 'closed':
        return 'Fechado';
      default:
        return status;
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/tickets';
      const params = new URLSearchParams();
      
      // Define status baseado na aba ativa
      if (tab === 'open') {
        params.append('status', tabOpen === 'pending' ? 'pending' : 'open');
      } else if (tab === 'closed') {
        params.append('status', 'closed');
      } else if (tab === 'group') {
        params.append('status', tabOpen === 'pending' ? 'pending' : 'open');
        params.append('isGroup', 'true');
      }
      
      // Adiciona filtros
      if (searchParam) {
        params.append('searchParam', searchParam);
      }
      
      if (selectedQueueIds.length > 0) {
        params.append('queueIds', selectedQueueIds.join(','));
      }
      
      if (showAllTickets) {
        params.append('showAll', 'true');
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const { data } = await api.get(endpoint);
      setTickets(data.tickets || []);
      
      // Atualiza contadores
      const openTickets = data.tickets?.filter((t: Ticket) => t.status === 'open' && !t.isGroup) || [];
      const pendingTickets = data.tickets?.filter((t: Ticket) => t.status === 'pending' && !t.isGroup) || [];
      const groupOpenTickets = data.tickets?.filter((t: Ticket) => t.status === 'open' && t.isGroup) || [];
      const groupPendingTickets = data.tickets?.filter((t: Ticket) => t.status === 'pending' && t.isGroup) || [];
      
      onUpdateOpenCount(openTickets.length);
      onUpdatePendingCount(pendingTickets.length);
      onUpdateGroupOpenCount(groupOpenTickets.length);
      onUpdateGroupPendingCount(groupPendingTickets.length);
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [tab, tabOpen, searchParam, showAllTickets, selectedQueueIds, refreshing]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicketId(ticket.uuid);
    router.push(`/tickets/${ticket.uuid}`);
  };

  const renderTicket = (ticket: Ticket) => (
    <TicketItem key={ticket.id} disablePadding>
      <TicketButton
        selected={selectedTicketId === ticket.uuid}
        onClick={() => handleTicketClick(ticket)}
      >
        <ListItemAvatar>
          <Badge
            badgeContent={ticket.unreadMessages}
            color="error"
            max={99}
            invisible={ticket.unreadMessages === 0}
          >
            <Avatar
              src={ticket.contact.profilePicUrl}
              alt={ticket.contact.name}
              sx={{ width: 48, height: 48 }}
            >
              {ticket.isGroup ? (
                <GroupIcon />
              ) : (
                <PersonIcon />
              )}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        
        <TicketContent>
          <TicketHeader>
            <ContactName variant="subtitle2">
              {ticket.contact.name}
            </ContactName>
            <Typography variant="caption" color="text.secondary">
              {formatMessageTime(ticket.lastMessageAt)}
            </Typography>
          </TicketHeader>
          
          <LastMessage variant="body2">
            {ticket.lastMessage || 'Sem mensagens'}
          </LastMessage>
          
          <TicketInfo>
            <Box display="flex" gap={0.5} alignItems="center">
              <StatusChip
                label={getStatusLabel(ticket.status)}
                size="small"
                status={ticket.status}
              />
              
              {ticket.queue && (
                <Chip
                  label={ticket.queue.name}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: ticket.queue.color + '20',
                    color: ticket.queue.color,
                  }}
                />
              )}
            </Box>
            
            {ticket.user && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {ticket.user.name}
                </Typography>
              </Box>
            )}
          </TicketInfo>
        </TicketContent>
      </TicketButton>
    </TicketItem>
  );

  if (loading) {
    return (
      <TicketsContainer>
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Carregando tickets...
          </Typography>
        </Box>
      </TicketsContainer>
    );
  }

  return (
    <TicketsContainer>
      <TicketsList>
        {tickets.length > 0 ? (
          tickets.map(renderTicket)
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" align="center">
              Nenhum ticket encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {searchParam ? 
                'Tente ajustar os filtros de pesquisa' : 
                'Não há tickets para exibir no momento'
              }
            </Typography>
          </Box>
        )}
      </TicketsList>
    </TicketsContainer>
  );
};

export default TicketsManager;