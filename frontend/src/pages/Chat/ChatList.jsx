import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  Chip,
  Skeleton
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  ChatBubbleOutline
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { i18n } from "../../translate/i18n";

const ChatList = ({
  chats,
  selectedChat,
  onChatSelect,
  onEditChat,
  onDeleteChat,
  onNewChat,
  loading
}) => {
  // Estado para controle de interação
  const [currentSelectedChat, setCurrentSelectedChat] = useState(null);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, chatId: null });

  // Sincroniza o chat selecionado com o estado interno
  useEffect(() => {
    if (selectedChat) {
      setCurrentSelectedChat(selectedChat);
    }
  }, [selectedChat]);

  // Handlers otimizados com useCallback
  const handleDeleteClick = useCallback((e, chatId) => {
    e.stopPropagation();
    setDeleteDialog({ open: true, chatId });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteDialog.chatId) {
      onDeleteChat(deleteDialog.chatId);
    }
    setDeleteDialog({ open: false, chatId: null });
  }, [deleteDialog.chatId, onDeleteChat]);

  const handleEditClick = useCallback((e, chat) => {
    e.stopPropagation();
    onEditChat(chat);
  }, [onEditChat]);

  // Funções auxiliares
  const getAvatarLetters = useCallback((title) => {
    if (!title) return '??';
    
    return title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const formatLastMessageTime = useCallback((date) => {
    if (!date) return '';
    
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" color="primary">
          {i18n.t('chat.conversations')}
        </Typography>
        <Tooltip title={i18n.t('chat.newChat')}>
          <IconButton 
            color="primary" 
            onClick={onNewChat}
            aria-label={i18n.t('chat.newChat')}
          >
            <PersonAdd />
          </IconButton>
        </Tooltip>
      </Box>

      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: 6
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 3
          }
        }}
      >
        {loading && chats.length === 0 ? (
          // Esqueletos durante o carregamento
          Array.from(new Array(3)).map((_, index) => (
            <ListItem key={`skeleton-${index}`} sx={{ mb: 1 }}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton width="60%" />}
                secondary={<Skeleton width="80%" />}
              />
            </ListItem>
          ))
        ) : (
          // Lista de chats
          chats.map((chat) => {
            const isSelected = selectedChat?.id === chat.id;
            const isHovered = chat.id === hoveredChatId;
            const unreadsCount = chat.users?.reduce((acc, u) => acc + (u.unreads || 0), 0) || 0;

            return (
              <Fade in timeout={300} key={chat.id}>
                <ListItem
                  button
                  selected={isSelected}
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                  onClick={() => onChatSelect(chat)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: isSelected ? 'primary.main' : 'grey.400',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {getAvatarLetters(chat.title)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" noWrap>
                          {chat.title}
                        </Typography>
                        {unreadsCount > 0 && (
                          <Chip
                            size="small"
                            color="secondary"
                            label={unreadsCount}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: '180px' }}
                        >
                          {chat.lastMessage || i18n.t('chat.noMessages')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatLastMessageTime(chat.updatedAt)}
                        </Typography>
                      </Box>
                    }
                  />

                  <Box
                    sx={{
                      opacity: isHovered || isSelected ? 1 : 0,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleEditClick(e, chat)}
                      aria-label={i18n.t('chat.edit')}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteClick(e, chat.id)}
                      aria-label={i18n.t('chat.delete')}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              </Fade>
            );
          })
        )}

        {chats.length === 0 && !loading && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="text.secondary"
            p={4}
          >
            <ChatBubbleOutline sx={{ fontSize: 48, mb: 2 }} />
            <Typography>
              {i18n.t('chat.empty.noConversations')}
            </Typography>
          </Box>
        )}
      </List>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, chatId: null })}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default React.memo(ChatList);