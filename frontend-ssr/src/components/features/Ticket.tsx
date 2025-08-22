'use client';

import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  styled,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import { SocketContext } from '../../context/SocketContext';

const TicketContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const TicketHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: 'none',
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flex: 1,
}));

const ContactDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
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

const MessageBubble = styled(Box)<{ fromMe: boolean }>(({ theme, fromMe }) => ({
  maxWidth: '70%',
  margin: theme.spacing(0.5, 0),
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.spacing(2),
  backgroundColor: fromMe ? theme.palette.primary.main : theme.palette.background.paper,
  color: fromMe ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: fromMe ? 'flex-end' : 'flex-start',
  boxShadow: theme.shadows[1],
  wordBreak: 'break-word',
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  opacity: 0.7,
  marginTop: theme.spacing(0.5),
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

const MessageInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
}));

interface Message {
  id: string;
  body: string;
  fromMe: boolean;
  createdAt: string;
  mediaUrl?: string;
  mediaType?: string;
  quotedMsg?: {
    id: string;
    body: string;
  };
}

interface Contact {
  id: string;
  name: string;
  number: string;
  profilePicUrl?: string;
}

interface User {
  id: string;
  name: string;
}

interface Queue {
  id: string;
  name: string;
  color: string;
}

interface TicketData {
  id: string;
  uuid: string;
  status: 'open' | 'pending' | 'closed';
  contact: Contact;
  user?: User;
  queue?: Queue;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TicketProps {
  ticketId: string;
}

const Ticket: React.FC<TicketProps> = ({ ticketId }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tickets/${ticketId}`);
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${ticketId}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchMessages();
    }
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await api.post(`/messages/${ticketId}`, {
        body: newMessage.trim(),
      });
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'closed':
        return theme.palette.grey[500];
      default:
        return theme.palette.text.secondary;
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

  const formatMessageTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR });
  };

  const formatTicketTime = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (loading) {
    return (
      <TicketContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Carregando ticket...
          </Typography>
        </Box>
      </TicketContainer>
    );
  }

  if (!ticket) {
    return (
      <TicketContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="h6" color="text.secondary">
            Ticket não encontrado
          </Typography>
        </Box>
      </TicketContainer>
    );
  }

  return (
    <TicketContainer>
      <TicketHeader>
        <ContactInfo>
          <Avatar
            src={ticket.contact.profilePicUrl}
            alt={ticket.contact.name}
            sx={{ width: 48, height: 48 }}
          >
            {ticket.isGroup ? <GroupIcon /> : <PersonIcon />}
          </Avatar>
          
          <ContactDetails>
            <Typography variant="h6" component="div">
              {ticket.contact.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={getStatusLabel(ticket.status)}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(ticket.status) + '20',
                  color: getStatusColor(ticket.status),
                }}
              />
              {ticket.queue && (
                <Chip
                  label={ticket.queue.name}
                  size="small"
                  sx={{
                    backgroundColor: ticket.queue.color + '20',
                    color: ticket.queue.color,
                  }}
                />
              )}
              {ticket.user && (
                <Typography variant="caption" color="text.secondary">
                  Atribuído a: {ticket.user.name}
                </Typography>
              )}
            </Box>
          </ContactDetails>
        </ContactInfo>

        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <AssignmentIcon sx={{ mr: 1 }} />
            Atribuir ticket
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <CloseIcon sx={{ mr: 1 }} />
            Fechar ticket
          </MenuItem>
        </Menu>
      </TicketHeader>

      <MessagesContainer>
        <List sx={{ p: 0 }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.fromMe ? 'flex-end' : 'flex-start',
                py: 0.5,
              }}
            >
              <MessageBubble fromMe={message.fromMe}>
                <Typography variant="body2" component="div">
                  {message.body}
                </Typography>
                <MessageTime>
                  {formatMessageTime(message.createdAt)}
                </MessageTime>
              </MessageBubble>
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {ticket.status === 'open' && (
        <InputContainer>
          <IconButton size="small">
            <AttachFileIcon />
          </IconButton>
          
          <MessageInput
            multiline
            maxRows={4}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
          />
          
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </InputContainer>
      )}
    </TicketContainer>
  );
};

export default Ticket;