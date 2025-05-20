import React, { useState, useRef, useEffect, useContext } from "react";
import { useTheme, styled } from "@mui/material/styles";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import useSound from "use-sound";

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
import useTickets from "../../hooks/useTickets";
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
  const [enableReasonWhenCloseTicket, setEnableReasonWhenCloseTicket] = useState(false);

  const { tickets } = useTickets({ withUnreadMessages: "true" });
  const [play] = useSound(alertSound, {volume: props.volume});
  const soundAlertRef = useRef();
  
  const historyRef = useRef(history);
  
  const socketManager = useContext(SocketContext);
  const { notifications, setNotifications, setMakeRequestTagTotalTicketPending, setMakeRequestTicketList, setMakeRequest, setOpenTabTicket } = useContext(GlobalContext);

  // Inicializa o serviço de notificações
  useEffect(() => {
    notificationService.initialize();
    
    // Verifica se a razão é obrigatória ao fechar ticket
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings/");
        const enableReason = data.find((s) => s.key === "enableReasonWhenCloseTicket");
        if (enableReason) {
          setEnableReasonWhenCloseTicket(enableReason.value === "true");
        }
      } catch (err) {
        console.error("Erro ao buscar configurações:", err);
      }
    };
    
    fetchSettings();
  }, []);

  // Configuração do som
  useEffect(() => {
    soundAlertRef.current = play;
  }, [play]);

  // Atualiza notificações no contexto global
  useEffect(() => {
    setNotifications(tickets);
  }, [tickets, setNotifications]);

  // Atualiza referência de ticketId
  useEffect(() => {
    ticketIdRef.current = ticketIdUrl;
  }, [ticketIdUrl]);

  // Configuração de WebSocket
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;
    if (!socketManager?.GetSocket) return;
    
    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;

    const onConnectNotificationsPopover = () => {
      socket.emit("joinNotification");
    };

    const onCompanyTicketNotificationsPopover = (data) => {
      if (data.action === "updateUnread" || data.action === "delete") {
        setNotifications(prevState => {
          const ticketIndex = prevState.findIndex(t => t.id === data.ticketId);
          if (ticketIndex !== -1) {
            prevState.splice(ticketIndex, 1);
            return [...prevState];
          }
          return prevState;
        });

        setDesktopNotifications(prevState => {
          const notificationIndex = prevState.findIndex(
            n => n.tag === String(data.ticketId)
          );
          if (notificationIndex !== -1) {
            notificationService.clearNotifications([prevState[notificationIndex]]);
            prevState.splice(notificationIndex, 1);
            return [...prevState];
          }
          return prevState;
        });
      }
    };
    
    const onCompanyAppMessageNotificationsPopover = (data) => {
      if (
        data.action === "create" &&
        !data.message.read &&
        (data.ticket.userId === user?.id || !data.ticket.userId)
      ) {
        setNotifications(prevState => {
          const ticketIndex = prevState.findIndex(t => t.id === data.ticket.id);
          if (ticketIndex !== -1) {
            prevState[ticketIndex] = data.ticket;
            return [...prevState];
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

    socket.on("connect", onConnectNotificationsPopover);
    socket.on(`company-${companyId}-ticket`, onCompanyTicketNotificationsPopover);
    socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageNotificationsPopover);

    return () => {
        socket.off(`company-${companyId}-ticket`, onCompanyTicketNotificationsPopover);
        socket.off(`company-${companyId}-appMessage`, onCompanyAppMessageNotificationsPopover);
    };
  }, [user, profile, queues, socketManager, setNotifications]);

  // Função para criar notificações
  const handleNotifications = (data) => {
    const { message, contact, ticket } = data;
  
    // Verificar se os objetos existem antes de acessar suas propriedades
    if (!message || !ticket || !contact) {
      console.warn("Dados incompletos para notificação:", data);
      return;
    }
  
    // Reproduzir som de alerta
    if (soundAlertRef.current) {
      soundAlertRef.current();
    }
  
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
          prevState[notificationIndex] = notification;
          return [...prevState];
        }
        return [notification, ...prevState];
      });
    }
  };

  // Solicitação explícita de permissão para notificações
  const requestNotificationPermission = () => {
    try {
      notificationService.requestPermissionExplicitly();
    } catch (error) {
      console.error("Erro ao solicitar permissão para notificações:", error);
      toast.error(i18n.t("notifications.permissionError"));
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
      if (notifications.length === 0) return;
      
      // Atualizar apenas o atributo unreadMessages para 0
      const companyId = localStorage.getItem("companyId");
      const socket = socketManager.GetSocket(companyId);
      
      // Em vez de atualizar os tickets individualmente,
      // emitimos um evento para o servidor para marcar todas as mensagens como lidas
      socket.emit("clearNotifications");
      
      // Limpar notificações no estado global
      setNotifications([]);
      
      // Limpar notificações do navegador
      notificationService.clearNotifications(desktopNotifications);
      setDesktopNotifications([]);
      
      toast.success(i18n.t("notifications.cleared"));
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("notifications.clearError"));
    }
  };

  const handleTicketClick = async (ticket) => {
    try {
      handleClickAway();
      
      // Emitir evento para o socket marcar como lida
      const companyId = localStorage.getItem("companyId");
      const socket = socketManager.GetSocket(companyId);
      
      if (socket) {
        socket.emit("company-ticket-notification", {
          action: "updateUnread",
          ticketId: ticket.id
        });
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
      toast.error(i18n.t("notifications.clickError") || "Erro ao abrir o ticket");
    }
  };

  // Função modificada para não usar o contexto problemático
  const handleSpyTicket = async (ticketId) => {
    try {
      // Antes de abrir o modal, precisamos garantir que temos um ticket válido
      setLoading(true);
      
      // Buscar o ticket completo para garantir que ele existe
      const { data: ticketData } = await api.get(`/tickets/${ticketId}`);
      
      if (!ticketData) {
        toast.error("Ticket não encontrado");
        return;
      }
      
      // Configurar o ID do ticket para o diálogo
      setViewingTicketId(ticketId);
      setOpenTicketMessageDialog(true);
      handleClickAway();
    } catch (err) {
      console.error("Erro ao espiar ticket:", err);
      toast.error(err.response?.data?.message || "Erro ao espiar a conversa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicketId) return;
    
    setLoading(true);
    try {
      await api.delete(`/tickets/${deletingTicketId}`);
      
      // Atualizar contadores
      setMakeRequestTagTotalTicketPending(Math.random());
      setMakeRequestTicketList(Math.random());
      
      // Remover da lista de notificações
      setNotifications(prevState => 
        prevState.filter(t => t.id !== deletingTicketId)
      );
      
      toast.success(i18n.t("notifications.ticketDeleted") || "Ticket excluído com sucesso");
    } catch (err) {
      console.error("Erro ao excluir ticket:", err);
      toast.error(i18n.t("notifications.deleteError") || "Erro ao excluir o ticket");
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
      
      // Enviar mensagem de saudação se configurado
      let settingIndex = null;
      try {
        const { data } = await api.get("/settings/");
        settingIndex = data.find((s) => s.key === "sendGreetingAccepted");
      } catch (err) {
        console.error("Erro ao buscar configurações:", err);
      }
      
      if (settingIndex?.value === "enabled" && !ticket?.isGroup) {
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
      
      // Atualizar contadores
      setMakeRequestTagTotalTicketPending(Math.random());
      setMakeRequestTicketList(Math.random());
      
      // Remover da lista de notificações
      setNotifications(prevState => 
        prevState.filter(t => t.id !== ticketId)
      );
      
      // Muda para a aba ATENDENDO
      setOpenTabTicket({ tab: "open", makeRequest: Math.random() });
      
      toast.success(i18n.t("notifications.ticketAccepted") || "Ticket aceito com sucesso");
      
      // Navegar para o ticket
      if (ticket?.uuid) {
        history.push(`/tickets/${ticket?.uuid}`);
      }
    } catch (err) {
      console.error("Erro ao aceitar ticket:", err);
      toast.error(i18n.t("notifications.acceptError") || "Erro ao aceitar o ticket");
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
      
      // Atualizar contadores
      setMakeRequestTagTotalTicketPending(Math.random());
      setMakeRequestTicketList(Math.random());
      
      // Remover da lista de notificações
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
      <>
        <Favicon
          animated={true}
          url={(theme?.appLogoFavicon) ? theme.appLogoFavicon : defaultLogoFavicon}
          alertCount={notifications.length}
          iconSize={195}
        />
      </>
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
        {notifications.length > 0 ? (
          <StyledBadge 
            variant="dot" 
            color="secondary"
          />
        ) : ""}
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
    // Adicionando estilos personalizados para mobile
    [theme.breakpoints.down('sm')]: {
      '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }}
>
        {/* Cabeçalho estilizado */}
        <NotificationHeader>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <HeaderIcon />
            {i18n.t("notifications.title")}
          </Typography>
          {!notificationService.hasPermission() && (
            <Tooltip title={i18n.t("notifications.enableNotifications")}>
              <NotificationButton 
                size="small" 
                onClick={requestNotificationPermission}
              >
                <NotificationsIcon fontSize="small" />
              </NotificationButton>
            </Tooltip>
          )}
          {notifications.length > 0 && (
            <Tooltip title={i18n.t("notifications.clearAll")}>
              <ClearButton 
                size="small" 
                onClick={handleClearAllNotifications}
              >
                <ClearAllIcon fontSize="small" />
              </ClearButton>
            </Tooltip>
          )}
        </NotificationHeader>

        {/* Contador de notificações */}
        {notifications.length > 0 && (
          <NotificationCount>
            <Typography variant="subtitle2" color="textSecondary">
              {notifications.length} {notifications.length === 1 
                ? i18n.t("notifications.message") 
                : i18n.t("notifications.messages")}
            </Typography>
          </NotificationCount>
        )}
        
        <List dense component={TabContainer}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText>{i18n.t("notifications.noTickets")}</ListItemText>
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
      
      {/* Diálogo para espiar mensagens */}
      <NotificationTicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={viewingTicketId}
      />
      
      {/* Modal de confirmação para exclusão */}
      <ConfirmationModal
        title={i18n.t("notifications.confirmDeleteTitle") || "Confirmar exclusão"}
        open={confirmationOpen}
        onClose={() => {
          setConfirmationOpen(false);
          setDeletingTicketId(null);
        }}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("notifications.confirmDeleteMessage") || "Tem certeza que deseja excluir este ticket?"}
      </ConfirmationModal>
      
      {/* Modal para selecionar motivo de encerramento */}
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