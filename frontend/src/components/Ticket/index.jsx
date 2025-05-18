import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import { toast } from "../../helpers/toast";
import clsx from "clsx";

import { Paper } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/material/styles/useTheme';

import ContactDrawer from "../ContactDrawer";
import MessageInput from "../MessageInputCustom/";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import TicketActionButtons from "../TicketActionButtons";
import TicketListItem from "../TicketListItem";
import MessagesListComponent from "../MessagesList";
import api from "../../services/api";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { EditMessageProvider } from "../../context/EditingMessage/EditingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TagsContainer } from "../TagsContainer";
import { SocketContext } from "../../context/Socket/SocketContext";
import ReasonSelectionModal from "../TicketListItem/reasonSelectionModal";
import { GlobalContext } from "../../context/GlobalContext";
import useSettings from "../../hooks/useSettings";
import { i18n } from "../../translate/i18n";
import { NotificationWarningMessageUser } from "./styles";

const drawerWidth = 320; // Largura do drawer

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
}));

const Ticket = () => {
    const { ticketId } = useParams();
    const history = useHistory();
    const classes = useStyles();
    const theme = useTheme();

    const { user } = useContext(AuthContext);

    const [drawerRightOpen, setDrawerRightOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contact, setContact] = useState({});
    const [ticket, setTicket] = useState({});
    const [showSelectMessageCheckbox, setShowSelectMessageCheckbox] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [forwardMessageModalOpen, setForwardMessageModalOpen] = useState(false);
    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const { setDrawerOpen } = useContext(GlobalContext);
    const socketManager = useContext(SocketContext);
    const { settings } = useSettings();

    useEffect(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/tickets/u/" + ticketId);
            const { queueId } = data;
            const { queues } = user;

            setContact(data.contact);
            setTicket(data);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
            toast.error(err);
        }
    }, [ticketId, user, history]);

    useEffect(() => {
        const companyId = localStorage.getItem("companyId");
        const socket = socketManager.GetSocket(companyId);

        const onConnectTicket = () => {
            socket.emit("joinChatBox", ticket?.id);
        }

        socketManager.onConnect(onConnectTicket);

        const onCompanyTicket = (data) => {
            console.log("onCompanyTicket", data);

            if (data.action === "update" && data.ticket.id === ticket.id) {
                setTicket(data.ticket);
            }

            if (data.action === "delete" && data.ticketId === ticket.id) {
                history.push("/tickets");
            }
        };

        const onCompanyContact = (data) => {
            if (data.action === "update") {
                setContact((prevState) => {
                    if (prevState.id === data.contact?.id) {
                        return { ...prevState, ...data.contact };
                    }
                    return prevState;
                });
            }
        };

        socket.on(`company-${companyId}-ticket`, onCompanyTicket);
        socket.on(`company-${companyId}-contact`, onCompanyContact);

        return () => {
            socket.off(`company-${companyId}-ticket`, onCompanyTicket);
            socket.off(`company-${companyId}-contact`, onCompanyContact);
        };
    }, [ticketId, ticket, history, socketManager]);

    const closeTicket = async (reasonId = null) => {
        setLoading(true);
        try {
            const closeData = {
                status: "closed",
                userId: user?.id,
                queueId: ticket?.queue?.id,
            };

            if (reasonId) {
                closeData.reasonId = reasonId;
            }

            const { data } = await api.put(`/tickets/${ticket.id}`, closeData);

            if (data.status === "closed") {
                toast.success(reasonId
                    ? "Ticket fechado com sucesso e motivo registrado"
                    : "Ticket fechado com sucesso"
                );
            } else {
                toast.error("Erro ao fechar o ticket");
            }
        } catch (err) {
            console.error("Erro ao fechar o ticket:", err);
            toast.error("Erro ao fechar o ticket: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
            if (setReasonModalOpen) {
                setReasonModalOpen(false);
            }
            if (setTabOpen) {
                 setTabOpen("closed");
            }
            history.push(`/tickets/`);
        }
    };

    const handleCloseTicket = async () => {
        const enableReasonWhenCloseTicket = settings?.enableReasonWhenCloseTicket;
        if (enableReasonWhenCloseTicket?.value === 'enabled') {
            if (setReasonModalOpen) {
                setReasonModalOpen(true);
            }
        } else {
            await closeTicket();
        }
    };

    const handleDrawerOpen = () => {
        setDrawerRightOpen(true);
        setDrawerOpen(false)
    };

    const handleDrawerClose = () => {
        setDrawerRightOpen(false);
        setDrawerOpen(true)
    };

    const renderTicketInfo = () => {
        if (ticket.user !== undefined) {
            return (
                <TicketInfo
                    contact={contact}
                    ticket={ticket}
                    onClick={handleDrawerOpen}
                />
            );
        }
    };

    const renderMessagesList = () => {
        return (
            <>
                <MessagesListComponent
                    ticket={ticket}
                    ticketId={ticket.id}
                    isGroup={ticket.isGroup}
                    showSelectMessageCheckbox={showSelectMessageCheckbox}
                    setShowSelectMessageCheckbox={setShowSelectMessageCheckbox}
                    setSelectedMessagesList={setSelectedMessages}
                    selectedMessagesList={selectedMessages}
                    forwardMessageModalOpen={forwardMessageModalOpen}
                    setForwardMessageModalOpen={setForwardMessageModalOpen}
                />
                <MessageInput ticketId={ticket.id} ticketStatus={ticket.status} />
            </>
        );
    };

    return (
        <div className={classes.root} id="drawer-container">
            <Paper
                variant="outlined"
                elevation={0}
                className={clsx(classes.mainWrapper, {
                    [classes.mainWrapperShift]: drawerRightOpen,
                })}
            >
                <TicketHeader loading={loading}>
                    <div id="TicketHeader">
                        {renderTicketInfo()}
                    </div>
                    {!ticket?.isForceDeleteConnection && <TicketActionButtons
                        ticket={ticket}
                        showSelectMessageCheckbox={showSelectMessageCheckbox}
                        selectedMessages={selectedMessages}
                        forwardMessageModalOpen={forwardMessageModalOpen}
                        setForwardMessageModalOpen={setForwardMessageModalOpen}
                        handleCloseTicket={handleCloseTicket}
                    />}
                </TicketHeader>
                <TagsContainer ticket={ticket} />
                {ticket?.isForceDeleteConnection && <NotificationWarningMessageUser>{i18n.t('ticket.notifications.notificationWarningMessageUser')}</NotificationWarningMessageUser>}
                <ReplyMessageProvider>
                    <EditMessageProvider>
                        {renderMessagesList()}
                    </EditMessageProvider>
                </ReplyMessageProvider>
            </Paper>
            <ContactDrawer
                open={drawerRightOpen}
                handleDrawerClose={handleDrawerClose}
                contact={contact}
                loading={loading}
                ticket={ticket}
                isGroup={ticket?.isGroup}
            />
            {!!reasonModalOpen && <ReasonSelectionModal
                open={reasonModalOpen}
                onClose={() => setReasonModalOpen(false)}
                onConfirm={(selectedReasonId) => closeTicket(selectedReasonId)}
            />}
        </div>
    );
};

export default Ticket;