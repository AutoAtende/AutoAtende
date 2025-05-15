// src/pages/Chat/ChatPopover.jsx
import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { toast } from "../../helpers/toast";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  Popover
} from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";

import api from "../../services/api";
import { isArray } from "../../utils/helpers";
import { SocketContext } from "../../context/Socket/SocketContext";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";
import notifySound from "../../assets/chat_notify.mp3";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";
import notificationService from "../../services/NotificationService";

// Componentes estilizados com styled API do MUI 5
const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  maxHeight: 300,
  maxWidth: 500,
  padding: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const LoadingContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
}));

const ChatTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  display: 'block',
}));

const ChatMessage = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  display: 'block',
}));

const ChatTime = styled(Typography)(({ theme }) => ({
  fontSize: 12,
}));

const UnreadIndicator = styled(Typography)(({ theme }) => ({
  fontSize: 12, 
  color: "#f44336", 
  display: "block",
  fontWeight: "bold"
}));

const StatusDot = styled('div')(({ theme }) => ({
  position: "absolute",
  left: 5,
  top: 10,
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#f44336"
}));

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => !['isUnread', 'isEven'].includes(prop)
})(({ theme, isUnread, isEven }) => ({
  border: "1px solid #eee",
  cursor: "pointer",
  position: "relative",
  transition: "background-color 0.2s ease",
  backgroundColor: isUnread 
    ? "#e3f2fd" 
    : isEven 
      ? "#ededed" 
      : "white",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  }
}));

const NoChats = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 5,
    top: 5,
  },
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS":
      const chats = action.payload;
      
      if (!isArray(chats)) {
        return state;
      }
      
      // Remove chats duplicados e atualiza os existentes
      const updatedState = [...state];
      const newChats = [];
      
      chats.forEach((chat) => {
        const chatIndex = updatedState.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          updatedState[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });

      return [...updatedState, ...newChats];

    case "UPDATE_CHATS":
      const chat = action.payload;
      const chatIndex = state.findIndex((u) => u.id === chat.id);

      if (chatIndex !== -1) {
        const updatedState = [...state];
        updatedState[chatIndex] = chat;
        return updatedState;
      } else {
        return [chat, ...state];
      }

    case "DELETE_CHAT":
      const chatId = action.payload;
      return state.filter(chat => chat.id !== chatId);

    case "RESET":
      return [];

    case "CHANGE_CHAT":
      const chatData = action.payload.chat || action.payload.record;
      
      if (!chatData?.id) {
        return state;
      }
      
      const existingChatIndex = state.findIndex((u) => u.id === chatData.id);
      
      if (existingChatIndex !== -1) {
        const updatedState = [...state];
        updatedState[existingChatIndex] = {
          ...updatedState[existingChatIndex],
          ...chatData,
          users: chatData.users || updatedState[existingChatIndex].users
        };
        return updatedState;
      } else {
        if (chatData && Object.keys(chatData).length > 0) {
          return [chatData, ...state];
        }
        return state;
      }
    
    case "SET_UNREAD":
      const { chatId: unreadChatId, userId, value } = action.payload;
      const unreadChatIndex = state.findIndex((u) => u.id === unreadChatId);
      
      if (unreadChatIndex !== -1) {
        const updatedState = [...state];
        const chat = { ...updatedState[unreadChatIndex] };
        
        if (chat.users) {
          chat.users = chat.users.map(user => {
            if (user.userId === userId) {
              return { ...user, unreads: value };
            }
            return user;
          });
        }
        
        updatedState[unreadChatIndex] = chat;
        return updatedState;
      }
      return state;
    
    case "ADD_NEW_MESSAGE":
      const { chatId: msgChatId, message, senderId } = action.payload;
      const msgChatIndex = state.findIndex((u) => u.id === msgChatId);
      
      if (msgChatIndex !== -1) {
        const updatedState = [...state];
        const chat = { ...updatedState[msgChatIndex] };
        
        // Atualiza a última mensagem
        chat.lastMessage = message.message || "Nova mídia recebida";
        chat.updatedAt = message.createdAt || new Date();
        
        // Incrementa o contador de não lidas
        if (chat.users && senderId !== action.payload.currentUserId) {
          chat.users = chat.users.map(user => {
            if (user.userId === action.payload.currentUserId) {
              return { ...user, unreads: (user.unreads || 0) + 1 };
            }
            return user;
          });
        }
        
        // Remove o chat atual da lista para reinseri-lo no topo
        updatedState.splice(msgChatIndex, 1);
        
        // Retorna o chat atualizado no topo da lista
        return [chat, ...updatedState];
      }
      return state;
      
    default:
      return state;
  }
};

export default function ChatPopover() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(true);
  const { datetimeToClient } = useDate();
  const [play] = useSound(notifySound);
  const soundAlertRef = useRef();
  const socketManager = useContext(SocketContext);
  const socketInitialized = useRef(false);
  const userId = user?.id;
  const [chatNotifications, setChatNotifications] = useState([]);

  // Inicializa o serviço de notificações
  useEffect(() => {
    notificationService.initialize();
  }, []);

  // Inicializa o sistema de som
  useEffect(() => {
    soundAlertRef.current = play;
  }, [play]);

  // Reseta o estado quando o termo de busca muda
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  // Carrega os chats iniciais
  useEffect(() => {
    const fetchChats = async () => {
      if (window.location.pathname === "/login") return;
      
      setLoading(true);
      try {
        const { data } = await api.get("/chats/", {
          params: { searchParam, pageNumber },
        });
        
        if (data && data.records) {
          dispatch({ type: "LOAD_CHATS", payload: data.records });
          setHasMore(data.hasMore || false);
        }
      } catch (err) {
        console.error("Erro ao carregar chats:", err);
        toast.error("Erro ao carregar conversas");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [searchParam, pageNumber]);

  // Configura os listeners de socket
  useEffect(() => {
    if (!userId || socketInitialized.current) return;
    
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    
    if (!socket) {
      console.error("Socket não disponível para ChatPopover");
      return;
    }
    
    socketInitialized.current = true;

    const onCompanyChatPopover = (data) => {
      if (data.action === "new-message") {
        // Verifica se o chat já existe no estado
        const existingChat = chats.find(chat => chat.id === data.message?.chatId);
        
        if (existingChat) {
          // Reproduz som de notificação
          if (data.message.senderId !== userId && soundAlertRef.current) {
            soundAlertRef.current();
          }
          
          // Atualiza o chat existente
          if (data.message.senderId !== userId) {
            setInvisible(false); // Torna o indicador de notificação visível
            
            // Cria notificação desktop se não estiver na página de chat
            if (window.location.pathname.indexOf("/chats/") === -1) {
              createChatNotification(existingChat, data.message);
            }
            
            // Incrementa o contador de não lidas
            dispatch({
              type: "SET_UNREAD",
              payload: {
                chatId: data.message.chatId,
                userId,
                value: (existingChat.users?.find(u => u.userId === userId)?.unreads || 0) + 1
              }
            });
          }
          
          // Atualiza o chat com a nova mensagem
          dispatch({
            type: "ADD_NEW_MESSAGE",
            payload: {
              chatId: data.message.chatId,
              message: data.message,
              senderId: data.message.senderId,
              currentUserId: userId
            }
          });
        } else {
          // Se não existir, carrega novamente os chats
          const fetchChats = async () => {
            try {
              const { data: chatsData } = await api.get("/chats/", {
                params: { pageNumber: 1 },
              });
              if (chatsData && chatsData.records) {
                dispatch({ type: "LOAD_CHATS", payload: chatsData.records });
              }
            } catch (err) {
              console.error("Erro ao recarregar chats:", err);
            }
          };
          fetchChats();
        }
      } else if (data.action === "update" || data.action === "create") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      } else if (data.action === "delete") {
        dispatch({ type: "DELETE_CHAT", payload: data.id });
      } else if (data.action === "messages-read") {
        if (data.userId === userId) {
          dispatch({
            type: "SET_UNREAD",
            payload: {
              chatId: data.chatId,
              userId,
              value: 0
            }
          });
        }
      }
    };

    socket.on(`company-${companyId}-chat`, onCompanyChatPopover);
    socket.on(`company-${companyId}-chat-user-${userId}`, onCompanyChatPopover);

    return () => {
      socket.off(`company-${companyId}-chat`, onCompanyChatPopover);
      socket.off(`company-${companyId}-chat-user-${userId}`, onCompanyChatPopover);
      socketInitialized.current = false;
    };
  }, [socketManager, userId, chats, play]);

  // Cria notificação para mensagens de chat
  const createChatNotification = (chat, message) => {
    // Verifica se a notificação para este chat já existe
    const existingNotification = chatNotifications.find(n => n.tag === `chat-${chat.id}`);
    if (existingNotification) {
      notificationService.clearNotifications([existingNotification]);
    }
    
    const messageBody = message.message || "Nova mensagem";
    const title = `${chat.title || "Chat"}: Nova mensagem`;
    
    const options = {
      body: messageBody,
      icon: "/logo192.png",
      tag: `chat-${chat.id}`,
      renotify: true,
      requireInteraction: true
    };

    const onClick = (e) => {
      e.preventDefault();
      window.focus();
      window.location.href = `/chats/${chat.uuid}`;
    };

    const notification = notificationService.createNotification(title, options, onClick);
    
    if (notification) {
      setChatNotifications(prev => {
        const filtered = prev.filter(n => n.tag !== `chat-${chat.id}`);
        return [...filtered, notification];
      });
    }
  };

  // Atualiza a visibilidade do indicador de não lidas
  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users || []) {
          if (chatUser.userId === userId) {
            unreadsCount += chatUser.unreads || 0;
          }
        }
      }
    }
    setInvisible(!unreadsCount);
  }, [chats, userId]);

  // Marca mensagens como lidas
  const markMessagesAsRead = async (chatId) => {
    try {
      await api.post(`/chats/${chatId}/read`, { userId });
      
      // Atualiza o estado local para refletir que as mensagens foram lidas
      dispatch({
        type: "SET_UNREAD",
        payload: {
          chatId,
          userId,
          value: 0
        }
      });
      
      // Limpa notificações relacionadas a este chat
      const notificationsToRemove = chatNotifications.filter(n => n.tag === `chat-${chatId}`);
      notificationService.clearNotifications(notificationsToRemove);
      setChatNotifications(prev => prev.filter(n => n.tag !== `chat-${chatId}`));
      
    } catch (error) {
      console.error("Erro ao marcar mensagens como lidas:", error);
    }
  };

  // Carrega mais chats
  const loadMore = () => {
    if (hasMore && !loading) {
      setPageNumber((prevState) => prevState + 1);
    }
  };

  // Detecta quando o usuário chegou ao final da lista
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  // Abre o popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Fecha o popover e marca mensagens como lidas
  const handleClose = () => {
    // Se houver chats com mensagens não lidas, marca-os como lidos
    if (chats.length > 0) {
      chats.forEach(chat => {
        const userInChat = chat.users?.find(u => u.userId === userId);
        if (userInChat && userInChat.unreads > 0) {
          markMessagesAsRead(chat.id);
        }
      });
    }
    
    setAnchorEl(null);
  };

  // Navega para a página do chat e marca mensagens como lidas
  const goToMessages = (chat) => {
    markMessagesAsRead(chat.id);
    window.location.href = `/chats/${chat.uuid}`;
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        color={invisible ? "default" : "inherit"}
        size="large"
      >
        <StyledBadge 
          color="secondary" 
          variant="dot" 
          invisible={invisible}
          overlap="circular"
        >
          <ForumIcon style={{ color: "white" }} />
        </StyledBadge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MainPaper
          variant="outlined"
          onScroll={handleScroll}
        >
          {loading && (
            <LoadingContainer>
              <CircularProgress size={24} />
              <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                Carregando conversas...
              </Typography>
            </LoadingContainer>
          )}
          
          <List
            component="nav"
            aria-label="conversas internas"
            sx={{ minWidth: 300 }}
          >
            {isArray(chats) && chats.length > 0 ? (
              chats.map((item, key) => {
                // Encontra o usuário atual no chat para verificar mensagens não lidas
                const currentUserInChat = item.users?.find(u => u.userId === userId);
                const hasUnreads = currentUserInChat && currentUserInChat.unreads > 0;
                
                return (
                  <StyledListItem
                    key={key}
                    isUnread={hasUnreads}
                    isEven={key % 2 === 0}
                    onClick={() => goToMessages(item)}
                    button
                  >
                    {hasUnreads && (
                      <StatusDot />
                    )}
                    <ListItemText
                      primary={
                        <ChatTitle
                          sx={{ fontWeight: hasUnreads ? 'bold' : 'normal' }}
                        >
                          {item.title || "Chat sem título"}
                        </ChatTitle>
                      }
                      secondary={
                        <>
                          <ChatMessage
                            sx={{ fontWeight: hasUnreads ? 'bold' : 'normal' }}
                          >
                            {item.lastMessage || "Sem mensagens"}
                          </ChatMessage>
                          <ChatTime>
                            {datetimeToClient(item.updatedAt)}
                          </ChatTime>
                          {hasUnreads && (
                            <UnreadIndicator>
                              {currentUserInChat.unreads} {currentUserInChat.unreads === 1 ? 'mensagem não lida' : 'mensagens não lidas'}
                            </UnreadIndicator>
                          )}
                        </>
                      }
                    />
                  </StyledListItem>
                );
              })
            ) : (
              <NoChats>
                <Typography variant="body1">
                  {i18n.t("mainDrawer.appBar.notRegister")}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                  Inicie uma nova conversa no menu Chat
                </Typography>
              </NoChats>
            )}
          </List>
        </MainPaper>
      </Popover>
    </div>
  );
}