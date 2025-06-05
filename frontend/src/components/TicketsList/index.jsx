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
import { GlobalContext } from "../../context/GlobalContext";

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
            const ticketIndex = state.findIndex((t) => t?.id === ticket?.id);
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

    if (action.type === "UPDATE_TICKET_TAGS") {
        const ticket = action.payload;

        const ticketIndex = state.findIndex(t => t?.id === ticket?.id);
        if (ticketIndex !== -1) {
            state[ticketIndex].tags = ticket.tags;
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET") {
        const ticket = action.payload;

        const ticketIndex = state.findIndex((t) => t?.id === ticket?.id);
        if (ticketIndex !== -1) {
            state[ticketIndex] = ticket;
        } else {
            state.unshift(ticket);
        }

        return [...state];
    }

    if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
        const ticket = action.payload;

        const ticketIndex = state.findIndex((t) => t?.id === ticket?.id);
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
        const ticketIndex = state.findIndex((t) => t?.contactId === contact?.id);

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
 * Verifica se um ticket é individual (não é grupo)
 * @param {Object} ticket - Objeto do ticket
 * @returns {boolean} - true se for ticket individual, false se for grupo
 */
const isIndividualTicket = (ticket) => {
    if (!ticket) return false;
    
    // Verificação robusta para garantir que NÃO é grupo
    const isGroup = ticket.isGroup === true || 
                   ticket.isGroup === 1 || 
                   ticket.isGroup === "true" || 
                   ticket.isGroup === "1";
    
    console.log('TicketsList - Ticket ID:', ticket.id, 'isGroup value:', ticket.isGroup, 'Is individual:', !isGroup);
    return !isGroup;
};

/**
 * Filtra tickets para mostrar apenas tickets individuais (não grupos)
 * @param {Array} tickets - Lista de tickets
 * @returns {Array} - Lista filtrada apenas com tickets individuais
 */
const getIndividualTickets = (tickets) => {
    return tickets.filter(isIndividualTicket);
};

const TicketsList = (props) => {
    const {
        status,
        searchParam,
        tags,
        users,
        showAll,
        selectedQueueIds,
        updateCount,
        updateGroupCount,
        style,
        setTabOpen,
        refreshTickets,
        filterType,
    } = props;
    
    const classes = useStyles();
    const [pageNumber, setPageNumber] = useState(1);
    const [ticketsList, dispatch] = useReducer(reducer, []);
    const { user } = useContext(AuthContext);
    const { profile, queues, allTicket } = user;

    const socketManager = useContext(SocketContext);
    const { setMakeRequestTagTotalTicketPending, makeRequestTicketList } = useContext(GlobalContext);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [status, searchParam, dispatch, showAll, tags, users, selectedQueueIds, refreshTickets]);

    useEffect(() => {
        if (filterType === "search") {
            dispatch({ type: "RESET" });
            setPageNumber(1);
        }
    }, [tags, users, filterType]);

    const { tickets, hasMore, loading } = useTickets({
        pageNumber,
        searchParam,
        status,
        showAll: profile === "user" ? (status === "closed" ? false : showAll) : showAll,
        tags: tags ? JSON.stringify(tags) : "[]",
        users: users ? JSON.stringify(users) : "[]",
        queueIds: JSON.stringify(selectedQueueIds),
        dispatch,
        makeRequestTicketList,
        user,
        filterType
    });

    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        console.log('TicketsList - Tickets recebidos:', tickets.length);
        console.log('TicketsList - Tickets individuais:', tickets.filter(isIndividualTicket).length);
        console.log('TicketsList - Tickets de grupo (que DEVEM ser filtrados):', tickets.filter(t => !isIndividualTicket(t)).length);
        
        // Filtra APENAS tickets individuais (não grupos)
        const individualTickets = getIndividualTickets(tickets);
        console.log('TicketsList - Tickets individuais após filtro:', individualTickets.length);
        
        dispatch({ type: "LOAD_TICKETS", payload: individualTickets });
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
            // Só atualiza se for um ticket INDIVIDUAL (não grupo)
            if (isIndividualTicket(data.ticket)) {
                dispatch({
                    type: "UPDATE_TICKET",
                    payload: data.ticket,
                });
            }
        }

        if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
            dispatch({ type: "DELETE_TICKET", payload: data.ticket?.id });
        }

        if (data.action === "delete") {
            dispatch({ type: "DELETE_TICKET", payload: data?.ticketId });
        }

        if (data.action === "tagUpdate") {
            // Só atualiza tags se for ticket individual
            if (isIndividualTicket(data.ticket)) {
                dispatch({
                    type: "UPDATE_TICKET_TAGS",
                    payload: data.ticket,
                });
            }
        }

        if (data.action === "removeFromList") {
            dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
        }
    }

    const onCompanyAppMessage = (data) => {
        setMakeRequestTagTotalTicketPending(Math.random())

        // Ignora se for ticket de grupo
        if (!isIndividualTicket(data.ticket)) {
            return;
        }

        // Verifica se o perfil do usuário é "user" e se o ticket pertence a uma fila acessível e se o parâmetro 'allTicket' estiver desabilitado. 
        // Se não, a função retorna, evitando o processamento do ticket.
        const queueIds = queues?.map((q) => q.id);
        if (
            profile === "user" && allTicket === 'disabled' &&
            (queueIds.indexOf(data?.ticket?.queue?.id) === -1 ||
                data?.ticket?.queue === null)
        ) {
            if (allTicket === 'disabled') {
                return;
            }
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
    }, []);

    useEffect(() => {
        const filteredTickets = getTicketsArrayByUser(ticketsList, user);
        const nonGroup = filteredTickets.length; // Já está filtrado apenas individuais
        
        console.log('TicketsList - Atualizando contagem de tickets individuais:', nonGroup);
        
        if (typeof updateCount === "function") {
            updateCount(nonGroup);
        }

        // updateGroupCount não deve ser usado aqui, pois este componente só lida com tickets individuais
        if (typeof updateGroupCount === "function") {
            updateGroupCount(0); // Zero grupos neste componente
        }
    }, [ticketsList, updateCount, updateGroupCount, user]);

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

    const getFilteredTickets = (tickets) => {
        let filteredTickets = getTicketsArrayByUser(tickets, user);
        
        // Garantir que só tickets individuais passem por aqui
        filteredTickets = filteredTickets.filter(isIndividualTicket);
        
        // Aplicar filtro de pesquisa de texto
        if (searchParam) {
            filteredTickets = filteredTickets.filter(ticket => {
                const searchLower = searchParam.toLowerCase();
                const contactName = ticket.contact?.name?.toLowerCase() || "";
                const contactNumber = ticket.contact?.number || "";
                const ticketId = ticket.id.toString();
                
                return contactName.includes(searchLower) ||
                       contactNumber.includes(searchLower) ||
                       ticketId.includes(searchLower);
            });
        }
        
        // Aplicar filtro de tags
        if (tags && tags.length > 0) {
            filteredTickets = filteredTickets.filter(ticket => {
                if (!ticket.tags || ticket.tags.length === 0) return false;
                return ticket.tags.some(ticketTag => 
                    tags.includes(ticketTag.id)
                );
            });
        }
        
        // Aplicar filtro de usuários
        if (users && users.length > 0) {
            filteredTickets = filteredTickets.filter(ticket => {
                return users.includes(ticket.userId);
            });
        }
        
        return filteredTickets;
    };

    return (
        <Paper className={classes.ticketsListWrapper} style={style}>
            <Paper
                square
                name="individual-tickets"
                elevation={0}
                className={classes.ticketsList}
                onScroll={handleScroll}
            >
                <List style={{ paddingTop: 0 }}>
                    {getFilteredTickets(ticketsList).length === 0 && !loading ? (
                        <div className={classes.noTicketsDiv}>
                            <span className={classes.noTicketsTitle}>
                                {i18n.t("ticketsList.noTicketsTitle")}
                            </span>
                            <p className={classes.noTicketsText}>
                                {filterType === "search" && (searchParam || tags?.length > 0 || users?.length > 0)
                                    ? "Nenhum ticket encontrado com os filtros aplicados."
                                    : i18n.t("ticketsList.noTicketsMessage")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {getFilteredTickets(ticketsList)
                                .sort((a, b) => new Date(b?.updatedAt) - new Date(a?.updatedAt))
                                .map((ticket) => (
                                    <TicketListItem ticket={ticket} setTabOpen={setTabOpen} key={ticket.id} />
                                ))}
                        </>
                    )}
                    {loading && <TicketsListSkeleton />}
                </List>
            </Paper>
        </Paper>
    );
};

export default TicketsList;