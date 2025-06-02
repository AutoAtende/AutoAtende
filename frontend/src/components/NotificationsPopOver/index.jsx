import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { useTheme, styled } from "@mui/material/styles";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";

import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Badge from "@mui/material/Badge";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Import do novo componente NotificationTicketItem
import NotificationTicketItem from "./NotificationTicketItem";
import { i18n } from "../../translate/i18n";
import useSettings from "../../hooks/useSettings";
import useTickets from "../../hooks/useTickets";
import useNotificationSound from "../../hooks/useNotificationSound";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import Favicon from "react-favicon";
import { GlobalContext } from "../../context/GlobalContext";
import { toast } from "../../helpers/toast";
import notificationService from "../../services/NotificationService";
import api from "../../services/api";
import NotificationTicketMessagesDialog from "./NotificationTicketMessagesDialog";
import ConfirmationModal from "../ConfirmationModal";
import ReasonSelectionModal from "../TicketListItem/reasonSelectionModal";

// Estilos usando styled API do MUI 5
const TabContainer = styled('div')(({ theme }) => ({
  overflowY: "auto",
  maxHeight: 350,
  ...theme.scrollbarStyles,
  [theme.breakpoints.down('sm')]: {
    maxHeight: "calc(80vh - 100px)"
  }
}));

const PopoverPaper = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: "100%",
    maxWidth: 350,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      maxWidth: 270,
    },
  }
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
}));

const HeaderIcon = styled(WhatsAppIcon)(({ theme }) => ({
  marginRight: theme.spacing(1),
  verticalAlign: 'middle'
}));

const NotificationCount = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 'auto',
  color: theme.palette.primary.contrastText,
}));

const NotificationButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  color: theme.palette.primary.contrastText,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 5,
    top: 5,
  },
  marginTop: "-25px",
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2)
}));

const NotificationsPopOver = (props) => {
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { settings } = useSettings();
  const companyFolder = `company${user.companyId}`;
  const defaultLogoFavicon = `${companyFolder}/logos/favicon.svg`;

  const ticketIdUrl = +history.location.pathname.split("/")[2];
  const ticketIdRef = useRef(ticketIdUrl);
  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const { profile, queues } = user;

  const [desktopNotifications, setDesktopNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [viewingTicketId, setViewingTicketId] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [closingTicketId, setClosingTicketId] = useState(null);

  const enableReasonWhenCloseTicket = settings.enableReasonWhenCloseTicket;
  const sendGreetingAccepted = settings.sendGreetingAccepted;

  const { tickets } = useTickets({ withUnreadMessages: "true" });
  
  // Hook personalizado para som de notificação
  const { playSound, testSound, isReady } = useNotificationSound(alertSound, props.volume || 0.5);

  const historyRef = useRef(history);
  
  const socketManager = useContext(SocketContext);
  const { 
    notifications, 
    setNotifications, 
    setMakeRequestTagTotalTicketPending, 
    setMakeRequestTicketList, 
    setMakeRequest, 
    setOpenTabTicket 
  } = useContext(GlobalContext);

  // Inicializa o serviço de notificações
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const initialized = notificationService.initialize();
        if (initialized) {
          console.log('Serviço de notificações inicializado com sucesso');
        }
      } catch (error) {
        console.error('Erro ao inicializar serviço de notificações:', error);
      }
    };
    
    initNotifications();
  }, []);

  // Atualiza notificações no contexto global
  useEffect(() => {
    setNotifications(tickets);
  }, [tickets, setNotifications]);

  // Atualiza referência de ticketId
  useEffect(() => {
    ticketIdRef.current = ticketIdUrl;
  }, [ticketIdUrl]);

  // Função para tocar som de notificação
  const handlePlaySound = useCallback(() => {
    try {
      if (props.volume > 0 && isReady()) {
        playSound();
        console.log('Som de notificação reproduzido');
      } else {
        console.warn('Som não pode ser reproduzido - volume:', props.volume, 'isReady:', isReady());
      }
    } catch (error) {
      console.error('Erro ao reproduzir som:', error);
    }
  }, [playSound, props.volume, isReady]);

  // Configuração de WebSocket
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId || !socketManager?.GetSocket) return;
    
    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;

    const onConnectNotificationsPopover = () => {
      socket.emit("joinNotification");
      console.log('Conectado às notificações via socket');
    };

    const onCompanyTicketNotificationsPopover = (data) => {
      console.log('Evento de ticket recebido:', data);
      
      if (data.action === "updateUnread" || data.action === "delete") {
        setNotifications(prevState => {
          const ticketIndex = prevState.findIndex(t => t.id === data.ticketId);
          if (ticketIndex !== -1) {
            const newState = [...prevState];
            newState.splice(ticketIndex, 1);
            return newState;
          }
          return prevState;
        });

        setDesktopNotifications(prevState => {
          const notificationIndex = prevState.findIndex(
            n => n.tag === String(data.ticketId)
          );
          if (notificationIndex !== -1) {
            const notificationToRemove = prevState[notificationIndex];
            notificationService.clearNotifications([notificationToRemove]);
            const newState = [...prevState];
            newState.splice(notificationIndex, 1);
            return newState;
          }
          return prevState;
        });
      } else if (data.action === "clearNotifications") {
        // Limpar todas as notificações quando vem do servidor
        setNotifications([]);
        notificationService.clearAllNotifications();
        setDesktopNotifications([]);
        console.log('Todas as notificações foram limpas via socket');
      }
    };
    
    const onCompanyAppMessageNotificationsPopover = (data) => {
      console.log('Mensagem recebida:', data);
      
      if (
        data.action === "create" &&
        !data.message.read &&
        (data.ticket.userId === user?.id || !data.ticket.userId)
      ) {
        setNotifications(prevState => {
          const ticketIndex = prevState.findIndex(t => t.id === data.ticket.id);
          if (ticketIndex !== -1) {
            const newState = [...prevState];
            newState[ticketIndex] = data.ticket;
            return newState;
          }
          return [data.ticket, ...prevState];
        });

        const shouldNotNotificate =
          (data.message.ticketId === ticketIdRef.current &&
            document.visibilityState === "visible") ||
          (data.ticket.userId && data.ticket.userId !== user?.id);

        if (shouldNotNotificate) return;

        handleNotifications(data);
      }
    };

    // Listener para resultado de limpar notificações
    const onClearNotificationsResult = (result) => {
      console.log('Resultado de limpar notificações:', result);
      if (result.success) {
        setNotifications([]);
        notificationService.clearAllNotifications();
        setDesktopNotifications([]);
        toast.success(result.message || "Notificações limpas com sucesso");
      } else {
        toast.error(result.error || "Erro ao limpar notificações");
      }
      setLoading(false);
    };

    socket.on("connect", onConnectNotificationsPopover);
    socket.on(`company-${companyId}-ticket`, onCompanyTicketNotificationsPopover);
    socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageNotificationsPopover);
    socket.on("clearNotificationsResult", onClearNotificationsResult);

    return () => {
      socket.off("connect", onConnectNotificationsPopover);
      socket.off(`company-${companyId}-ticket`, onCompanyTicketNotificationsPopover);
      socket.off(`company-${companyId}-appMessage`, onCompanyAppMessageNotificationsPopover);
      socket.off("clearNotificationsResult", onClearNotificationsResult);
    };
  }, [user, profile, queues, socketManager, setNotifications, handlePlaySound]);

  // Função para criar notificações
  const handleNotifications = (data) => {
    const { message, contact, ticket } = data;
  
    // Verificar se os objetos existem antes de acessar suas propriedades
    if (!message || !ticket || !contact) {
      console.warn("Dados incompletos para notificação:", data);
      return;
    }
  
    // Reproduzir som de alerta
    console.log('Reproduzindo som de notificação...');
    handlePlaySound();
  
    // Criar notificação apenas se tiver permissão
    const messageBody = message.body || i18n.t("notifications.newMessage");
    const formattedBody = `${messageBody} - ${format(new Date(), "HH:mm")}`;
    
    const onClick = (e) => {
      e.preventDefault();
      window.focus();
      historyRef.current.push(`/tickets/${ticket.uuid}`);
    };
  
    // Utiliza o serviço de notificações com verificações seguras
    const notification = notificationService.createTicketNotification(
      ticket,
      { ...message, body: formattedBody },
      contact,
      onClick
    );
  
    if (notification) {
      setDesktopNotifications((prevState) => {
        const notificationIndex = prevState.findIndex(
          (n) => n.tag === notification.tag
        );
        if (notificationIndex !== -1) {
          const newState = [...prevState];
          newState[notificationIndex] = notification;
          return newState;
        }
        return [notification, ...prevState];
      });
    }
  };

  // Solicitação explícita de permissão para notificações
  const requestNotificationPermission = async () => {
    try {
      await notificationService.requestPermissionExplicitly();
      toast.success("Permissão para notificações concedida!");
    } catch (error) {
      console.error("Erro ao solicitar permissão para notificações:", error);
      toast.error(error.message || "Erro ao solicitar permissão para notificações");
    }
  };

  const handleClick = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const handleClearAllNotifications = async () => {
    try {
      if (notifications.length === 0) {
        toast.info("Nenhuma notificação para limpar");
        return;
      }
      
      setLoading(true);
      
      // Usar socket para limpar notificações
      const companyId = localStorage.getItem("companyId");
      const socket = socketManager.GetSocket(companyId);
      
      if (socket) {
        console.log('Enviando comando para limpar notificações via socket...');
        socket.emit("clearNotifications");
      } else {
        // Fallback para API REST se socket não estiver disponível
        console.log('Socket não disponível, usando API REST...');
        await api.post("/notifications/clear");
        
        // Limpar notificações localmente
        setNotifications([]);
        notificationService.clearAllNotifications();
        setDesktopNotifications([]);
        
        toast.success("Notificações limpas com sucesso");
        setLoading(false);
      }
      
    } catch (err) {
      console.error("Erro ao limpar notificações:", err);
      toast.error(err.response?.data?.message || "Erro ao limpar notificações");
      setLoading(false);
    }
  };

  const handleTicketClick = async (ticket) => {
    try {
      handleClickAway();
      
      // Emitir evento para o socket marcar como lida
      const companyId = localStorage.getItem("companyId");
      const socket = socketManager.GetSocket(companyId);
      
      if (socket) {
        socket.emit("markTicketAsRead", { ticketId: ticket.id });
      }
      
      // Atualizar lista de notificações no estado local
      setNotifications(prevState => 
        prevState.filter(t => t.id !== ticket.id)
      );
      
      // Limpar notificação desktop se existir
      const desktopNotification = desktopNotifications.find(
        n => n.tag === String(ticket.id)
      );
      
      if (desktopNotification) {
        notificationService.clearNotifications([desktopNotification]);
        setDesktopNotifications(prevState => 
          prevState.filter(n => n.tag !== String(ticket.id))
        );
      }
      
      // Navegar para o ticket
      history.push(`/tickets/${ticket.uuid}`);
    } catch (err) {
      console.error("Erro ao processar clique na notificação:", err);
      toast.error("Erro ao abrir o ticket");
    }
  };

  const handleSpyTicket = async (ticketId) => {
    try {
      setLoading(true);
      
      // Buscar o ticket completo para garantir que ele existe
      const { data: ticketData } = await api.get(`/tickets/${ticketId}`);
      
      if (!ticketData) {
        toast.error("Ticket não encontrado");
        return;
      }
      
      setViewingTicketId(ticketId);
      setOpenTicketMessageDialog(true);
      handleClickAway();
    } catch (err) {
      console.error("Erro ao espiar ticket:", err);
      toast.error(err.response?.data?.message || "Erro ao espiar a conversa");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicketId) return;
    
    setLoading(true);
    try {
      await api.delete(`/tickets/${deletingTicketId}`);
      
      setMakeRequestTagTotalTicketPending(Math.random());
      setMakeRequestTicketList(Math.random());
      
      setNotifications(prevState => 
        prevState.filter(t => t.id !== deletingTicketId)
      );
      
      toast.success("Ticket excluído com sucesso");
    } catch (err) {
      console.error("Erro ao excluir ticket:", err);
      toast.error("Erro ao excluir o ticket");
    } finally {
      setLoading(false);
      setDeletingTicketId(null);
      setConfirmationOpen(false);
    }
  };

  const handleAcceptTicket = async (ticketId) => {
    setLoading(true);
    try {
      const ticket = notifications.find(t => t.id === ticketId);
      if (!ticket) {
        toast.error("Ticket não encontrado");
        return;
      }
      
      await api.put(`/tickets/${ticketId}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id
      });
      
      if (sendGreetingAccepted === "enabled" && !ticket?.isGroup) {
        const msg = `{{ms}}*{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`;
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: "",
          body: `\n${msg.trim()}`,
        };
        
        try {
          await api.post(`/messages/${ticketId}`, message);
        } catch (err) {
          console.error("Erro ao enviar mensagem de saudação:", err);
        }
      }
      
      setMakeRequestTagTotalTicketPending(Math.random());
      setMakeRequestTicketList(Math.random());
      
      setNotifications(prevState => 
        prevState.filter(t => t.id !== ticketId)
      );
      
      setOpenTabTicket({ tab: "open", makeRequest: Math.random() });
      
      toast.success("Ticket aceito com sucesso");
      
      if (ticket?.uuid) {
        history.push(`/tickets/${ticket?.uuid}`);
      }
    } catch (err) {
      console.error("Erro ao aceitar ticket:", err);
      toast.error("Erro ao aceitar o ticket");
    } finally {
      setLoading(false);
      handleClickAway();
    }
  };

  const handleRejectTicket = (ticketId) => {
    setClosingTicketId(ticketId);
    
    if (enableReasonWhenCloseTicket) {
      setReasonModalOpen(true);
    } else {
      handleCloseTicket(ticketId);
    }
    
    handleClickAway();
  };

  const handleCloseTicket = async (ticketId, reasonId = null) => {
    setLoading(true);
    try {
      const ticket = notifications.find(t => t.id === ticketId);
      if (!ticket) {
        toast.error("Ticket não encontrado");
        return;
      }
      
      const closeData = {
        status: "closed",
        userId: user?.id,
        queueId: ticket?.queue?.id,
      };
      
      if (reasonId) {
        closeData.reasonId = reasonId;
      }
      
      await api.put(`/tickets/${ticketId}`, closeData);
      
      setMakeRequestTagTotalTicketPending(Math.random());
      setMakeRequestTicketList(Math.random());
      
      setNotifications(prevState => 
        prevState.filter(t => t.id !== ticketId)
      );
      
      setTimeout(() => {
        setMakeRequest(Math.random());
      }, 1000);
      
      toast.success(reasonId
        ? "Ticket fechado com sucesso e motivo registrado"
        : "Ticket fechado com sucesso"
      );
    } catch (err) {
      console.error("Erro ao fechar o ticket:", err);
      toast.error("Erro ao fechar o ticket: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setClosingTicketId(null);
      setReasonModalOpen(false);
    }
  };

  const handleConfirmCloseTicket = (reasonId) => {
    handleCloseTicket(closingTicketId, reasonId);
  };

  const browserNotification = () => {
    document.title = theme.appName || "...";
    return (
      <Favicon
        animated={true}
        url={(theme?.appLogoFavicon) ? theme.appLogoFavicon : defaultLogoFavicon}
        alertCount={notifications.length}
        iconSize={195}
      />
    );
  };

  return (
    <>
      {browserNotification()}
      {loading && (
        <LoadingContainer>
          <CircularProgress size={24} />
        </LoadingContainer>
      )}
      <IconButton
        onClick={handleClick}
        ref={anchorEl}
        aria-label={i18n.t("notifications.title")}
        variant="contained"
        size="large"
      >
        <WhatsAppIcon style={{ color: "white" }} />
        {notifications.length > 0 && (
          <StyledBadge 
            variant="dot" 
            color="white"
          />
        )}
      </IconButton>
      <PopoverPaper
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleClickAway}
        sx={{
          [theme.breakpoints.down('sm')]: {
            '& .MuiBackdrop-root': {
              backgroundColor: '#ffffff'
            }
          }
        }}
      >
        <NotificationHeader>
          <Typography variant="h6" sx={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
            <HeaderIcon />
            {i18n.t("notifications.title")}
          </Typography>
          {!notificationService.hasPermission() && (
            <Tooltip title="Habilitar notificações do navegador">
              <NotificationButton 
                size="small" 
                color="white"
                onClick={requestNotificationPermission}
              >
                <NotificationsIcon fontSize="small" />
              </NotificationButton>
            </Tooltip>
          )}
          {notifications.length > 0 && (
            <Tooltip title="Limpar todas as notificações">
              <ClearButton 
                size="small" 
                color="white"
                onClick={handleClearAllNotifications}
                disabled={loading}
              >
                <ClearAllIcon fontSize="small" />
              </ClearButton>
            </Tooltip>
          )}
        </NotificationHeader>

        {notifications.length > 0 && (
          <NotificationCount>
            <Typography variant="subtitle2" color="textSecondary">
              {notifications.length} {notifications.length === 1 
                ? "notificação" 
                : "notificações"}
            </Typography>
          </NotificationCount>
        )}
        
        <List dense component={TabContainer}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText>Nenhuma notificação pendente</ListItemText>
            </ListItem>
          ) : (
            notifications.map((ticket) => (
              <NotificationTicketItem 
                key={ticket.id}
                ticket={ticket}
                onClick={() => handleTicketClick(ticket)}
                onAccept={handleAcceptTicket}
                onReject={handleRejectTicket}
                onSpy={handleSpyTicket}
                onDelete={(id) => {
                  setDeletingTicketId(id);
                  setConfirmationOpen(true);
                }}
                onClose={handleRejectTicket}
              />
            ))
          )}
        </List>
      </PopoverPaper>
      
      <NotificationTicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={viewingTicketId}
      />
      
      <ConfirmationModal
        title="Confirmar exclusão"
        open={confirmationOpen}
        onClose={() => {
          setConfirmationOpen(false);
          setDeletingTicketId(null);
        }}
        onConfirm={handleDeleteTicket}
      >
        Tem certeza que deseja excluir este ticket?
      </ConfirmationModal>
      
      {reasonModalOpen && (
        <ReasonSelectionModal
          open={reasonModalOpen}
          onClose={() => {
            setReasonModalOpen(false);
            setClosingTicketId(null);
          }}
          onConfirm={handleConfirmCloseTicket}
        />
      )}
    </>
  );
};

export default NotificationsPopOver;