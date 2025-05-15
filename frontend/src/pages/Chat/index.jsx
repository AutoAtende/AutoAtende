import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Grid, Alert, Snackbar } from '@mui/material';
import { SocketContext } from '../../context/Socket/SocketContext';
import { AuthContext } from '../../context/Auth/AuthContext';
import api from '../../services/api';
import { toast } from '../../helpers/toast';
import { i18n } from "../../translate/i18n";

import ChatList from './ChatList';
import ChatMessages from './ChatMessages';
import ChatModal from './ChatModal';
import ErrorBoundary from '../../components/ErrorBoundary';

const Chat = () => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('new');
  const [editingChat, setEditingChat] = useState(null);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, hasMore: false });
  const [messagesPageInfo, setMessagesPageInfo] = useState({ pageNumber: 1, hasMore: false });
  const [error, setError] = useState(null);

  // Refs
  const socketInitialized = useRef(false);
  const retryTimeoutRef = useRef(null);
  const loadingRef = useRef(false);

  // Contextos
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const companyId = localStorage.getItem("companyId");

  // Carregar chats - com mecanismo de retry otimizado
  const loadChats = useCallback(async (retry = true) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      setError(null);
      console.log(`Carregando chats - página ${pageInfo.pageNumber}`);

      const { data } = await api.get('/chats', {
        params: { pageNumber: pageInfo.pageNumber }
      });

      console.log(`Chats carregados: ${data.records?.length}`);

      setChats(prev => {
        if (pageInfo.pageNumber === 1) {
          return data.records || [];
        } else {
          // Evita duplicações ao carregar mais páginas
          const newChats = [...prev];
          data.records?.forEach(chat => {
            if (!newChats.some(c => c.id === chat.id)) {
              newChats.push(chat);
            }
          });
          return newChats;
        }
      });

      setPageInfo(prev => ({
        ...prev,
        hasMore: data.hasMore || false
      }));

      // Limpa qualquer timeout de retry pendente
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    } catch (error) {
      console.error("Erro ao carregar chats:", error);
      setError(i18n.t('chat.errors.load'));
      toast.error(i18n.t('chat.errors.load'));

      // Implementa retry automático se solicitado
      if (retry) {
        retryTimeoutRef.current = setTimeout(() => {
          loadChats(true);
        }, 5000); // Tenta novamente após 5 segundos
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [pageInfo.pageNumber]);

  // Carregar mensagens de um chat específico
  const loadMessages = useCallback(async (chatId) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      setError(null);
      console.log(`Carregando mensagens do chat ${chatId} - página ${messagesPageInfo.pageNumber}`);

      const { data } = await api.get(`/chats/${chatId}/messages`, {
        params: { pageNumber: messagesPageInfo.pageNumber }
      });

      console.log(`Mensagens carregadas: ${data.records?.length}`);

      setMessages(prev => {
        if (messagesPageInfo.pageNumber === 1) {
          return data.records || [];
        } else {
          // Para mensagens, adicionamos no início para manter a ordem cronológica
          return [...data.records, ...prev];
        }
      });

      setMessagesPageInfo(prev => ({
        ...prev,
        hasMore: data.hasMore || false
      }));

      // Marca mensagens como lidas
      await api.post(`/chats/${chatId}/read`, { userId: user.id });

    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      setError(i18n.t('chat.errors.loadMessages'));
      toast.error(i18n.t('chat.errors.loadMessages'));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [messagesPageInfo.pageNumber, user.id]);

  // Funções para paginação
  const handleLoadMore = useCallback(() => {
    if (!pageInfo.hasMore || loading || loadingRef.current) return;

    setPageInfo(prev => ({
      ...prev,
      pageNumber: prev.pageNumber + 1
    }));
  }, [pageInfo.hasMore, loading]);

  const handleLoadMoreMessages = useCallback(() => {
    if (!messagesPageInfo.hasMore || loading || loadingRef.current) return;

    setMessagesPageInfo(prev => ({
      ...prev,
      pageNumber: prev.pageNumber + 1
    }));
  }, [messagesPageInfo.hasMore, loading]);

  // Selecionar chat
  const handleSelectChat = useCallback(async (chat) => {
    // Verifica se já é o chat selecionado para evitar recarregamento desnecessário
    if (selectedChat?.id === chat.id) return;

    setSelectedChat(chat);
    setMessagesPageInfo({ pageNumber: 1, hasMore: false });
    setMessages([]);

    await loadMessages(chat.id);

    // Entrar na sala de socket para este chat
    if (socketManager && companyId) {
      const socket = socketManager.GetSocket(companyId);
      if (socket) {
        // Sai da sala do chat anterior
        if (selectedChat?.id) {
          socket.emit("leaveChatRoom", selectedChat.id);
        }
        console.log(`Entrando na sala do chat ${chat.id}`);
        socket.emit("joinChatRoom", chat.id);
      }
    }
  }, [loadMessages, socketManager, companyId, selectedChat]);

  // Enviar mensagem
  const handleSendMessage = async (message, file) => {
    if ((!message || !message.trim()) && !file) return;

    try {
      const formData = new FormData();
      if (message) formData.append('message', message);
      if (file) {
        formData.append('media', file);
        formData.append('typeArch', 'internalChat');
      }

      console.log(`Enviando mensagem para o chat ${selectedChat.id}`);
      const { data } = await api.post(`/chats/${selectedChat.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Atualiza imediatamente as mensagens na interface
      setMessages(prev => [...prev, data]);

      // Atualiza o último status do chat
      setChats(prev => prev.map(chat =>
        chat.id === selectedChat.id
          ? {
            ...chat,
            lastMessage: data.message || i18n.t('chat.mediaMessage'),
            updatedAt: new Date()
          }
          : chat
      ));

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(i18n.t('chat.errors.messageSendFailed'));
    }
  };

  // Deletar chat
  const handleDeleteChat = async (chatId) => {
    try {
      setLoading(true);
      console.log(`Deletando chat ${chatId}`);
      await api.delete(`/chats/${chatId}`);

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }

      toast.success(i18n.t('chat.success.delete'));
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
      toast.error(i18n.t('chat.errors.delete'));
    } finally {
      setLoading(false);
    }
  };

  // Editar chat
  const handleEditChat = useCallback((chat) => {
    setModalType('edit');
    setEditingChat(chat);
    setShowModal(true);
  }, []);

  // Novo chat
  const handleNewChat = useCallback(() => {
    setModalType('new');
    setEditingChat(null);
    setShowModal(true);
  }, []);

  // Fechar modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    // Aguarda a animação de fechamento do modal antes de resetar os dados
    setTimeout(() => {
      setEditingChat(null);
      setModalType('new');
    }, 300);
  }, []);

  // Salvar chat (criar/editar)
  const handleSaveChat = async (chatData) => {
    try {
      setLoading(true);

      if (modalType === 'edit' && editingChat) {
        console.log(`Editando chat ${editingChat.id}`, chatData);
        const { data } = await api.put(`/chats/${editingChat.id}`, chatData);

        setChats(prev => prev.map(chat =>
          chat.id === data.id ? data : chat
        ));

        if (selectedChat?.id === data.id) {
          setSelectedChat(data);
        }

        toast.success(i18n.t('chat.success.update'));
      } else {
        console.log(`Criando novo chat`, chatData);
        const { data } = await api.post('/chats', chatData);

        // Verificação para evitar duplicação
        setChats(prev => {
          if (prev.some(c => c.id === data.id)) {
            return prev;
          }
          return [data, ...prev];
        });
        
        toast.success(i18n.t('chat.success.create'));
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar chat:', error);
      const errorMessage = error.response?.data?.error || i18n.t('chat.errors.save');
      toast.error(errorMessage);
      throw error; // Propaga o erro para o componente do modal
    } finally {
      setLoading(false);
    }
  };

  // Carrega chats iniciais
  useEffect(() => {
    loadChats();

    // Cleanup para evitar vazamento de memória
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [loadChats]);

  // Carrega mais chats quando a página muda
  useEffect(() => {
    if (pageInfo.pageNumber > 1) {
      loadChats(false);
    }
  }, [pageInfo.pageNumber, loadChats]);

  // Carrega mais mensagens quando a página muda
  useEffect(() => {
    if (messagesPageInfo.pageNumber > 1 && selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [messagesPageInfo.pageNumber, selectedChat, loadMessages]);

  // Configura socket listeners - com prevenção de loops e duplicação de eventos
  useEffect(() => {
    if (!socketManager || !companyId || socketInitialized.current) return;

    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;

    socketInitialized.current = true;
    console.log("Socket inicializado para chat interno");

    const handleChatEvent = (data) => {
      console.log(`Evento de chat recebido: ${data.action}`);

      if (data.action === "create") {
        setChats(prev => {
          // Verifica se o chat já existe para evitar duplicidade

          if (!data?.record?.id) return prev;

          if (prev.some(chat => chat?.id === data.record.id)) return prev;
          return [data.record, ...prev];
        });
      }
      else if (data.action === "update") {
        setChats(prev => {
          // Verifica se realmente houve mudança antes de atualizar
          const chatIndex = prev.findIndex(chat => chat?.id === data.record?.id);
          if (chatIndex === -1) return prev;

          // Verifica se os dados são diferentes antes de atualizar
          if (JSON.stringify(prev[chatIndex]) === JSON.stringify(data.record)) {
            return prev; // Sem mudanças, retorna o array original
          }

          const newChats = [...prev];
          newChats[chatIndex] = data.record;
          return newChats;
        });

        if (selectedChat?.id === data.record.id) {
          // Evita atualizar se não houve mudança real
          if (JSON.stringify(selectedChat) !== JSON.stringify(data.record)) {
            setSelectedChat(data.record);
          }
        }
      }
      else if (data.action === "delete") {
        setChats(prev => prev.filter(chat => chat.id !== data.id));

        if (selectedChat?.id === data.id) {
          setSelectedChat(null);
          setMessages([]);
        }
      }
      else if (data.action === "new-message") {
        // Só atualiza mensagens se o chat estiver selecionado
        if (selectedChat?.id === data.message.chatId) {
          // Verifica duplicação antes de adicionar
          setMessages(prev => {
            if (prev.some(msg => msg.id === data.message.id)) return prev;
            return [...prev, data.message];
          });

          // Marca como lida se o usuário atual estiver visualizando o chat
          api.post(`/chats/${data.message.chatId}/read`, { userId: user.id })
            .catch(err => console.error("Erro ao marcar mensagem como lida:", err));
        }

        // Atualiza o chat na lista com a última mensagem
        setChats(prev => {
          const chatIndex = prev.findIndex(chat => chat.id === data.message.chatId);
          if (chatIndex === -1) return prev;

          const updatedChat = {
            ...prev[chatIndex],
            lastMessage: data.message.message || i18n.t('chat.mediaMessage'),
            updatedAt: data.message.createdAt || new Date()
          };

          // Se o chat não estiver selecionado, incrementa unreads
          if (selectedChat?.id !== data.message.chatId) {
            updatedChat.users = updatedChat.users.map(u => {
              if (u.userId === user.id) {
                return { ...u, unreads: (u.unreads || 0) + 1 };
              }
              return u;
            });
          }

          // Move o chat para o início da lista
          const newChats = prev.filter(chat => chat.id !== data.message.chatId);
          return [updatedChat, ...newChats];
        });
      }
      else if (data.action === "messages-read") {
        if (data.userId === user.id && selectedChat?.id === data.chatId) {
          // Atualiza o contador de não lidas no chat atual
          setChats(prev => {
            const chatIndex = prev.findIndex(chat => chat.id === data.chatId);
            if (chatIndex === -1) return prev;

            const updatedChat = { ...prev[chatIndex] };
            updatedChat.users = updatedChat.users.map(u => {
              if (u.userId === user.id) {
                return { ...u, unreads: 0 };
              }
              return u;
            });

            const newChats = [...prev];
            newChats[chatIndex] = updatedChat;
            return newChats;
          });
        }
      }
    };

    // Registra os listeners de eventos uma única vez
    socket.on(`company-${companyId}-chat`, handleChatEvent);
    socket.on(`company-${companyId}-chat-user-${user.id}`, handleChatEvent);
    console.log("Listeners de eventos de chat registrados");

    // Limpeza ao desmontar
    return () => {
      socket.off(`company-${companyId}-chat`, handleChatEvent);
      socket.off(`company-${companyId}-chat-user-${user.id}`, handleChatEvent);

      // Deixa a sala do chat atual se existir
      if (selectedChat?.id) {
        socket.emit("leaveChatRoom", selectedChat.id);
      }

      socketInitialized.current = false;
      console.log("Listeners de eventos de chat removidos");
    };
}, [socketManager, companyId, user.id, selectedChat]);

// Notificar o servidor quando o componente for desmontado ou o chat selecionado mudar
useEffect(() => {
  return () => {
    if (socketManager && companyId && selectedChat?.id) {
      const socket = socketManager.GetSocket(companyId);
      if (socket) {
        console.log(`Saindo da sala do chat ${selectedChat.id}`);
        socket.emit("leaveChatRoom", selectedChat.id);
      }
    }
  };
}, [selectedChat, socketManager, companyId]);

return (
  <ErrorBoundary>
    <Box sx={{ height: '100%', display: 'flex', p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onChatSelect={handleSelectChat}
            onEditChat={handleEditChat}
            onDeleteChat={handleDeleteChat}
            onNewChat={handleNewChat}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedChat ? (
            <ChatMessages
              chat={selectedChat}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
              handleLoadMore={handleLoadMoreMessages}
              pageInfo={messagesPageInfo}
            />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 3
              }}
            >
              <Typography color="textSecondary">
                {i18n.t('chat.selectChat')}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <ChatModal
        open={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveChat}
        chat={editingChat}
        type={modalType}
        loading={loading}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  </ErrorBoundary>
);
};

export default Chat;