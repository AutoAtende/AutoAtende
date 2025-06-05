import React, { useState, useEffect, useReducer, useContext } from "react";

import makeStyles from '@mui/styles/makeStyles';
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets, { getTicketsArrayByUser, getTicketsObjectByUser } from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { Can } from "../Can"; 

const useStyles = makeStyles((theme) => ({
  ticketsListWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  ticketsList: {
    flex: 1,
    maxHeight: "100%",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderTop: "2px solid rgba(0, 0, 0, 0.12)",
  },

  ticketsListHeader: {
    color: "rgb(67, 83, 105)",
    zIndex: 2,
    backgroundColor: "white",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ticketsCount: {
    fontWeight: "normal",
    color: "rgb(104, 121, 146)",
    marginLeft: "8px",
    fontSize: "14px",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_TICKETS") {
    const newTickets = action.payload;

    newTickets.forEach((ticket) => {
      const ticketIndex = state.findIndex((t) => t?.id === ticket.id);
      if (ticketIndex !== -1) {
        state[ticketIndex] = ticket;
        if (ticket.unreadMessages > 0) {
          state.unshift(state.splice(ticketIndex, 1)[0]);
        }
      } else {
        state.push(ticket);
      }
    });

    return [...state];
  }

  if (action.type === "RESET_UNREAD") {
    const ticketId = action.payload;

    const ticketIndex = state.findIndex((t) => t?.id === ticketId);
    if (ticketIndex !== -1) {
      state[ticketIndex].unreadMessages = 0;
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t?.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t?.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
      state.unshift(state.splice(ticketIndex, 1)[0]);
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_CONTACT") {
    const contact = action.payload;
    const ticketIndex = state.findIndex((t) => t?.contactId === contact.id);
    if (ticketIndex !== -1) {
      state[ticketIndex].contact = contact;
    }
    return [...state];
  }

  if (action.type === "DELETE_TICKET") {
    const ticketId = action.payload;
    const ticketIndex = state.findIndex((t) => t?.id === ticketId);
    if (ticketIndex !== -1) {
      state.splice(ticketIndex, 1);
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

/**
 * Verifica se um ticket é de grupo
 * @param {Object} ticket - Objeto do ticket
 * @returns {boolean} - true se for ticket de grupo, false se for individual
 */
const isGroupTicket = (ticket) => {
    if (!ticket) return false;
    
    // Verificação robusta para garantir que É grupo
    const isGroup = ticket.isGroup === true || 
                   ticket.isGroup === 1 || 
                   ticket.isGroup === "true" || 
                   ticket.isGroup === "1";
    
    console.log('TicketsListGroup - Ticket ID:', ticket.id, 'isGroup value:', ticket.isGroup, 'Is group:', isGroup);
    return isGroup;
};

/**
 * Filtra tickets para mostrar apenas grupos
 * @param {Array} tickets - Lista de tickets
 * @returns {Array} - Lista filtrada apenas com tickets de grupos
 */
const getGroupTickets = (tickets) => {
    return tickets.filter(isGroupTicket);
};

const TicketsListGroup = (props) => {
  const {
    status,
    searchParam,
    tags,
    users,
    showAll,
    selectedQueueIds,
    updateCount,
    style,
    setTabOpen,
    refreshTickets
  } = props;
  
  const classes = useStyles();
  const [pageNumber, setPageNumber] = useState(1);
  const [ticketsList, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const { profile, queues, allTicket } = user;

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [status, searchParam, dispatch, showAll, tags, users, selectedQueueIds, refreshTickets]);

  const { tickets, hasMore, loading } = useTickets({
    pageNumber,
    searchParam,
    status,
    showAll,
    tags: JSON.stringify(tags || []),
    users: JSON.stringify(users || []),
    queueIds: JSON.stringify(selectedQueueIds),
    user,
    makeRequestTicketList: refreshTickets
  });

  useEffect(() => {
    console.log('TicketsListGroup - Tickets recebidos:', tickets.length);
    console.log('TicketsListGroup - Tickets de grupo encontrados:', tickets.filter(isGroupTicket).length);
    console.log('TicketsListGroup - Tickets individuais (que DEVEM ser filtrados):', tickets.filter(t => !isGroupTicket(t)).length);
    
    // Filtrar apenas tickets de grupos
    const groupTickets = getGroupTickets(tickets);
    console.log('TicketsListGroup - Tickets de grupos após filtro:', groupTickets.length);
    
    dispatch({ type: "LOAD_TICKETS", payload: groupTickets });
  }, [tickets, status, searchParam, queues, profile, refreshTickets]);

  const shouldUpdateTicket = (ticket) =>
    (!ticket.userId || ticket.userId === user?.id || showAll) &&
    (!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

  const notBelongsToUserQueues = (ticket) => 
    ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1 || 
    (ticket.queueId === null && user.profile === "user");

  const onConnectTicketList = () => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;
    if (!socketManager?.GetSocket) return;
    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;
    if (status) {
      socket.emit("joinTickets", status);
    } else {
      socket.emit("joinNotification");
    }
  }

  const onCompanyTicket = (data) => {
    if (data.action === "updateUnread") {
      dispatch({
        type: "RESET_UNREAD",
        payload: data.ticketId,
      });
    }

    if (data.action === "update" && shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
      // Só atualiza se for um ticket de GRUPO
      if (isGroupTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET",
          payload: data.ticket,
        });
      }
    }

    if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
      dispatch({type: "DELETE_TICKET", payload: data.ticket?.id});
    }

    if (data.action === "delete") {
      dispatch({type: "DELETE_TICKET", payload: data?.ticketId});
    }

    if (data.action === "removeFromList") {
      dispatch({type: "DELETE_TICKET", payload: data.ticketId});
    }
  }

  const onCompanyAppMessage = (data) => {
    // Verifica se é um ticket de grupo usando função consistente
    if (!isGroupTicket(data.ticket)) {
      return; // Ignora se não for grupo
    }

    // Verifica permissões de fila para usuários
    const queueIds = queues?.map((q) => q.id);
    if (
      profile === "user" && allTicket === 'disabled' &&
      (queueIds.indexOf(data.ticket?.queue?.id) === -1 || data.ticket.queue === null)
    ) {
      return;
    }

    if (data.action === "create" && shouldUpdateTicket(data.ticket) && (status === undefined || data.ticket.status === status)) {
      dispatch({
        type: "UPDATE_TICKET_UNREAD_MESSAGES",
        payload: data.ticket,
      });
    }
  }

  const onCompanyContact = (data) => {
    if (data.action === "update") {
      dispatch({
        type: "UPDATE_TICKET_CONTACT",
        payload: data.contact,
      });
    }
  }

  useEffect(() => {
    if (!socketManager?.GetSocket) return;
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;

    socket.on("connect", onConnectTicketList);
    socket.on(`company-${companyId}-ticket`, onCompanyTicket);
    socket.on(`company-${companyId}-appMessage`, onCompanyAppMessage);
    socket.on(`company-${companyId}-contact`, onCompanyContact);

    return () => {
      if (status) {
        socket.emit("leaveTickets", status);
      } else {
        socket.emit("leaveNotification");
      }

      socket.off(`company-${companyId}-ticket`, onCompanyTicket);
      socket.off(`company-${companyId}-appMessage`, onCompanyAppMessage);
      socket.off(`company-${companyId}-contact`, onCompanyContact);
    };
  }, [status, showAll, user, selectedQueueIds, tags, users, profile, queues]);

  useEffect(() => {
    const filteredTickets = getTicketsArrayByUser(ticketsList, user);
    const count = filteredTickets.length; // Já está filtrado apenas com grupos
    
    console.log('TicketsListGroup - Atualizando contagem de grupos:', count);
    
    if (typeof updateCount === "function") {
      updateCount(count);
    }
  }, [ticketsList, updateCount, user]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const filteredTickets = getTicketsArrayByUser(ticketsList, user);

  return (
    <Paper className={classes.ticketsListWrapper} style={style}>
      <Paper
        square
        name="groups"
        elevation={0}
        className={classes.ticketsList}
        onScroll={handleScroll}
      >
        <List style={{ paddingTop: 0 }}>
          {filteredTickets.length === 0 && !loading ? (
            <div className={classes.noTicketsDiv}>
              <span className={classes.noTicketsTitle}>
                {i18n.t("ticketsList.noTicketsTitle")}
              </span>
              <p className={classes.noTicketsText}>
                {i18n.t("ticketsList.noTicketsMessage")}
              </p>
            </div>
          ) : (
            <>
              {filteredTickets
                .sort((a, b) => new Date(b?.updatedAt) - new Date(a?.updatedAt))
                .map((ticket) => (
                  <Can
                    key={ticket.id}
                    role={user.profile}
                    perform="ticket-options:spy"
                    yes={() => (
                      <TicketListItem setTabOpen={setTabOpen} ticket={ticket} />
                    )}
                    no={() => null}
                  />
                ))}
            </>
          )}
          {loading && <TicketsListSkeleton />}
        </List>
      </Paper>
    </Paper>
  );
};

export default TicketsListGroup;