import React, { useContext, useEffect, useState } from "react";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { Box, Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessagesList from "../MessagesList";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import { SocketContext } from "../../context/Socket/SocketContext";
import { GlobalContext } from "../../context/GlobalContext";
import { i18n } from "../../translate/i18n";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  mainWrapper: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: "0",
    marginRight: -drawerWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  mainWrapperShift: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },

  dialogContainer: {
    display: "flex",
    flexDirection: "column",
    height: "80vh",
    maxHeight: "calc(100vh - 64px)",
    overflow: "hidden",
  },

  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    minHeight: 0,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },

  headerContainer: {
    flexShrink: 0,
  },

  actionsContainer: {
    flexShrink: 0,
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

export default function TicketMessagesDialog({ open, handleClose, ticketId }) {
  const history = useHistory();
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});

  const socketManager = useContext(SocketContext);
  const { setMakeRequestTagTotalTicketPending, setMakeRequestTicketList } = useContext(GlobalContext);

  useEffect(() => {
    async function fetchTicket() {
      if (!open || !ticketId) return;
      
      setLoading(true);
      try {
        const { data } = await api.get(`/tickets/${ticketId}`);
        
        if (data) {
          setContact(data.contact || {});
          setTicket(data);
          setMakeRequestTagTotalTicketPending(Math.random());
          setMakeRequestTicketList(Math.random());
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Erro ao carregar ticket");
      } finally {
        setLoading(false);
      }
    }
    
    fetchTicket();
  }, [ticketId, open, setMakeRequestTagTotalTicketPending, setMakeRequestTicketList]);

  useEffect(() => {
    if (!open || !ticketId) return;
    
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    
    if (!socket) return;

    const onConnectTicketMessagesDialog = () => {
      socket.emit("joinChatBox", ticket?.id || ticketId);
    };

    const onCompanyTicketMessagesDialog = (data) => {
      if (!data) return;
      
      if (data.action === "update" && data.ticket) {
        setMakeRequestTagTotalTicketPending(Math.random());
        setMakeRequestTicketList(Math.random());
        setTicket(data.ticket);
      }

      if (data.action === "delete") {
        toast.success(i18n.t('tickets.inbox.ticketDeleteSuccessfully'));
        history.push("/tickets");
      }
    };

    const onCompanyContactMessagesDialog = (data) => {
      if (!data || !data.contact) return;
      
      if (data.action === "update") {
        setContact((prevState) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact };
          }
          return prevState;
        });
      }
    };

    socketManager.onConnect(onConnectTicketMessagesDialog);
    socket.on(`company-${companyId}-ticket`, onCompanyTicketMessagesDialog);
    socket.on(`company-${companyId}-contact`, onCompanyContactMessagesDialog);

    return () => {
      socket.off(`company-${companyId}-ticket`, onCompanyTicketMessagesDialog);
      socket.off(`company-${companyId}-contact`, onCompanyContactMessagesDialog);
    };
  }, [ticketId, ticket, history, open, socketManager, setMakeRequestTagTotalTicketPending, setMakeRequestTicketList]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const renderTicketInfo = () => {
    if (ticket && ticket.user !== undefined) {
      return (
        <TicketInfo
          contact={contact || {}}
          ticket={ticket}
          onClick={handleDrawerOpen}
        />
      );
    }
    return null;
  };

  const renderMessagesList = () => {
    if (!ticket || !ticket.id) return null;
    
    return (
      <Box className={classes.root}>
        <MessagesList
          ticket={ticket}
          ticketId={ticket.id}
          isGroup={ticket.isGroup || false}
        />
      </Box>
    );
  };

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={open}
      onClose={handleClose}
      PaperProps={{
        className: classes.dialogContainer,
      }}
    >
      <Box className={classes.headerContainer}>
        <TicketHeader loading={loading}>
          {renderTicketInfo()}
        </TicketHeader>
      </Box>
      
      <DialogContent className={classes.messagesContainer}>
        <ReplyMessageProvider>
          {renderMessagesList()}
        </ReplyMessageProvider>
      </DialogContent>
      
      <DialogActions className={classes.actionsContainer}>
        <Button onClick={handleClose} color="primary" variant="contained">
          {i18n.t('tickets.inbox.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}