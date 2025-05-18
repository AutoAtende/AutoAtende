import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";
import { styled } from '@mui/material/styles';
import { green, grey, red, blue, orange } from "@mui/material/colors";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import { i18n } from "../../translate/i18n";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import api from "../../services/api";
import WhatsMarkedWrapper from "../WhatsMarkedWrapper";
import { Tooltip, useMediaQuery, useTheme, Popover } from "@mui/material";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { toast } from "../../helpers/toast";
import { v4 as uuidv4 } from "uuid";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import AndroidIcon from "@mui/icons-material/Android";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConfirmationModal from "../ConfirmationModal";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import LabelIcon from '@mui/icons-material/Label';
import LockIcon from '@mui/icons-material/Lock';
import { Can } from "../Can";
import useSettings from "../../hooks/useSettings";
import ReasonSelectionModal from "./reasonSelectionModal";
import QueueSelectionModal from "../QueueSelectionModal";
import TagsSelectionModal from "../TagsSelectionModal";
import { GlobalContext } from "../../context/GlobalContext";
import TagsModal from "./TagsModal";
import TicketDetailsModal from "../TicketDetailsModal";
import InfoIcon from '@mui/icons-material/Info';

const getContrastColor = (hexColor) => {
    // Se não houver cor definida, use branco para fundo escuro padrão
    if (!hexColor) return "white";
    
    // Converte hex para RGB
    let r, g, b;
    
    // Se for uma cor no formato #RRGGBB
    if (hexColor.length === 7) {
        r = parseInt(hexColor.substring(1, 3), 16);
        g = parseInt(hexColor.substring(3, 5), 16);
        b = parseInt(hexColor.substring(5, 7), 16);
    } 
    // Se for uma cor no formato #RGB
    else if (hexColor.length === 4) {
        r = parseInt(hexColor.substring(1, 2) + hexColor.substring(1, 2), 16);
        g = parseInt(hexColor.substring(2, 3) + hexColor.substring(2, 3), 16);
        b = parseInt(hexColor.substring(3, 4) + hexColor.substring(3, 4), 16);
    } 
    // Caso seja outro formato ou inválido, use branco como padrão
    else {
        return "white";
    }
    
    // Calcula a luminância (fórmula comum para determinar brilho)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Se a cor de fundo for clara, use texto escuro, caso contrário use texto claro
    return luminance > 0.6 ? "#000000" : "#FFFFFF";
};

// Componentes estilizados usando styled API
const AvatarContainer = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'start',
    padding: 3,
    alignItems: 'center',
    position: 'relative',
    right: 5,
    top: 21
}));

const TicketContainer = styled(ListItem)(({ theme }) => ({
    position: "relative",
    height: "100px",
    paddingBottom: "16px"
}));

const PendingTicketContainer = styled('div')(({ theme }) => ({
    cursor: "unset",
}));

const NoTicketsDiv = styled('div')(({ theme }) => ({
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
}));

const NoTicketsText = styled(Typography)(({ theme }) => ({
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
}));

const NoTicketsTitle = styled(Typography)(({ theme }) => ({
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
}));

const ContactNameWrapper = styled('span')(({ ticket }) => ({
    display: "flex",
    justifyContent: "space-between",
    top: -15,
    marginBottom: ticket?.lastMessage ? '12px' : '0px' // Dynamic margin based on presence of message
}));

const LastMessageTime = styled(Typography)(({ theme }) => ({
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -15,
    fontSize: '9px',
}));

const ClosedBadge = styled(Badge)(({ theme }) => ({
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
}));

const ContactLastMessage = styled(Typography)(({ theme }) => ({
    maxWidth: "72%",
    top: -5, // Changed from -15 to -5 for better spacing
    fontSize: '12px',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    position: 'relative',
    marginTop: '10px', // Added margin to push down the last message
    zIndex: 1 // Lower z-index than badges
}));

const NewMessagesCount = styled(Badge)(({ theme }) => ({
    alignSelf: "center",
    marginRight: 0,
    marginLeft: "auto",
}));

const BadgeStyled = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        color: "white",
        backgroundColor: green[500],
        right: 5,
        top: 5
    }
}));

const AcceptButton = styled('div')(({ theme }) => ({
    position: "absolute",
    right: "108px",
}));

const TicketQueueColor = styled('span')(({ theme }) => ({
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
}));

const TicketInfo = styled(Box)(({ theme }) => ({
    position: "relative",
    top: 0
}));

const TicketInfo1 = styled(Box)(({ theme, isSmallScreen }) => ({
    position: "relative",
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    display: "flex",
    top: 24,
    right: 0,
    zIndex: 2, // Ensure it stays above the message
    marginBottom: 12, // Add space between badges and message
    maxWidth: isSmallScreen ? "80%" : "100%" // Limitar largura em telas pequenas
}));

const BadgesRow = styled('div')(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 6, // Increased from 4 to 6
    gap: 4,
    zIndex: 2,
    position: 'relative' // Added to control positioning more explicitly
}));

const TagsRow = styled('div')(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 6, // Increased from 4 to 6
    marginTop: 2,
    gap: 4,
    zIndex: 2,
    position: 'relative' // Added to control positioning more explicitly
}));

const TagsPopoverContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: 300,
    gap: 5,
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper
}));

const PopoverTagBadge = styled('span')(({ bgcolor }) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 22, // Aumentado para melhor visibilidade
    borderRadius: 10,
    fontSize: 11, // Aumentado para melhor legibilidade
    padding: "4px 8px", // Aumentado para mais espaço
    marginRight: 4,
    marginBottom: 4,
    color: getContrastColor(bgcolor), // Função para determinar a cor do texto
    backgroundColor: bgcolor || "#7C7C7C",
    fontWeight: 500,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
}));

const StandardBadgeStyled = styled('span')(({ bgcolor }) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 16,
    borderRadius: 10,
    fontSize: 10,
    padding: "2px 6px",
    marginRight: 2,
    color: "white",
    backgroundColor: bgcolor || "#7C7C7C"
}));

const MoreDetailsBadge = styled('span')(({ theme }) => ({
    minWidth: 'auto',
    height: 22,
    borderRadius: 10,
    fontSize: 11,
    padding: "2px 6px",
    backgroundColor: "#3f51b5",
    color: "white",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
}));

const ViewTagsBadge = styled('span')(({ theme }) => ({
    minWidth: 'auto',
    height: 16,
    borderRadius: 10,
    fontSize: 10,
    padding: "2px 6px",
    backgroundColor: "#5c6bc0",
    color: "white",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    '&:hover': {
        backgroundColor: "#3f51b5"
    }
}));

const MoreTagsButton = styled('span')(({ theme }) => ({
    minWidth: 'auto',
    height: 16,
    borderRadius: 10,
    fontSize: 10,
    padding: "2px 6px",
    backgroundColor: "#757575",
    color: "white",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
}));

const ActionButtons = styled('div')(({ theme }) => ({
    display: "flex",
    position: "absolute",
    right: 0,
    top: -30,
    gap: 4,
    zIndex: 3 // Maior que os badges para ficar por cima
}));

const ActionButtonsAlt = styled('div')(({ theme }) => ({
    display: "flex",
    position: "absolute",
    right: -14,
    top: -45,
    gap: 4,
    zIndex: 3 // Maior que os badges para ficar por cima
}));

const ActionIconButton = styled('div')(({ color }) => ({
    color: color || "#1976d2", // Cor padrão primária
    cursor: "pointer",
    padding: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 23,
    width: 23,
    minWidth: 23,
    maxWidth: 23,
    minHeight: 23,
    maxHeight: 23,
    borderRadius: 50,
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor: 'white',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
}));

const TicketStatusBadge = styled('div')(({ bgcolor }) => ({
    display: "flex",
    position: "absolute",
    right: 16,
    top: "50%", 
    transform: "translateY(-50%)", 
    backgroundColor: bgcolor || "#7C7C7C",
    padding: "4px 8px",
    borderRadius: 16,
    color: "white",
    alignItems: "center",
    fontSize: 12,
    fontWeight: 500,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
}));

const TicketListItem = ({ ticket, handleClose, setTabOpen }) => {
    const [loading, setLoading] = useState(false);
    const [ticketUser, setTicketUser] = useState(null);
    const [tag, setTag] = useState(null);
    const [whatsAppName, setWhatsAppName] = useState(null);

    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [selectedReasonId, setSelectedReasonId] = useState(null);
    const [tagsModalOpen, setTagsModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [queueModalOpen, setQueueModalOpen] = useState(false);
    const [tagsSelectionModalOpen, setTagsSelectionModalOpen] = useState(false);
    
    // Estado para o popover de tags
    const [tagsAnchorEl, setTagsAnchorEl] = useState(null);
    const openTagsPopover = Boolean(tagsAnchorEl);

    const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
    const { ticketId } = useParams();
    const isMounted = useRef(true);
    const { setCurrentTicket } = useContext(TicketsContext);
    const { user } = useContext(AuthContext);
    const { profile, spy } = user;
    const [lastInteractionLabel, setLastInteractionLabel] = useState('');
    const intervalRef = useRef(null);

    const { settings } = useSettings();
    const history = useHistory();

    const displayContactInfo = settings?.displayContactInfo;
    const enableReasonWhenCloseTicket = settings?.enableReasonWhenCloseTicket;
    const enableQueueWhenClosingTicket = settings?.enableQueueWhenCloseTicket;
    const enableTagsWhenClosingTicket = settings?.enableTagsWhenCloseTicket;
    const sendGreetingAccepted = settings?.sendGreetingAccepted;
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const { setMakeRequest, setOpenTabTicket, setMakeRequestTagTotalTicketPending, setMakeRequestTicketList } = useContext(GlobalContext);

    const handleOpenTagsModal = (e) => {
        if (e) e.stopPropagation();
        setTagsModalOpen(true);
    };

    const handleOpenDetailsModal = (e) => {
        if (e) e.stopPropagation();
        setDetailsModalOpen(true);
    };
    
    // Funções para gerenciar o popover de tags
    const handleTagsHoverOpen = (event) => {
        setTagsAnchorEl(event.currentTarget);
    };
    
    const handleTagsHoverClose = () => {
        setTagsAnchorEl(null);
    };

    const closeTicket = async (reasonId = null, queueId = null, tags = []) => {
        setLoading(true);
        try {
            const closeData = {
                status: "closed",
                userId: user?.id,
                queueId: queueId || ticket?.queue?.id,
            };

            if (reasonId) {
                closeData.reasonId = reasonId;
            }

            if (tags && tags.length > 0) {
                closeData.tags = tags;
            }

            const { data } = await api.put(`/tickets/${ticket.id}`, closeData);

            if (data.status === "closed") {
                setMakeRequestTagTotalTicketPending(Math.random())
                setMakeRequestTicketList(Math.random())
                toast.success(reasonId
                    ? "Ticket fechado com sucesso e motivo registrado"
                    : "Ticket fechado com sucesso"
                );
                setTimeout(() => {
                    setMakeRequest(Math.random());
                }, 1000);
                history.push(`/tickets/`)
            } else {
                toast.error("Erro ao fechar o ticket");
            }
        } catch (err) {
            console.error("Erro ao fechar o ticket:", err);
            toast.error("Erro ao fechar o ticket: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
            setReasonModalOpen(false);
            setQueueModalOpen(false);
            setTagsSelectionModalOpen(false);
        }
    };

    const handleCloseTicket = async () => {
        if (enableQueueWhenClosingTicket) {
            setQueueModalOpen(true);
        } else if (enableTagsWhenClosingTicket) {
            setTagsSelectionModalOpen(true);
        } else if (enableReasonWhenCloseTicket) {
            setReasonModalOpen(true);
        } else {
            await closeTicket();
        }
    };

    const handleSelectQueue = async (queueId) => {
        if (enableTagsWhenClosingTicket) {
            setTagsSelectionModalOpen(true);
        } else if (enableReasonWhenCloseTicket) {
            setReasonModalOpen(true);
        } else {
            await closeTicket(null, queueId);
        }
        setQueueModalOpen(false);
    };

    const handleSelectTags = async (tags) => {
        if (enableReasonWhenCloseTicket) {
            setSelectedTags(tags);
            setReasonModalOpen(true);
        } else {
            await closeTicket(null, selectedQueueId, tags);
        }
        setTagsSelectionModalOpen(false);
    };

    const [selectedQueueId, setSelectedQueueId] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);

    const handleConfirmReason = async (reasonId) => {
        await closeTicket(reasonId, selectedQueueId, selectedTags);
    };

    useEffect(() => {
        if (ticket.userId && ticket.user) {
            setTicketUser(ticket.user.name);
        }

        if (ticket.whatsappId && ticket.whatsapp) {
            setWhatsAppName(ticket.whatsapp.name);
        }

        setTag(ticket?.tags);

        return () => {
            isMounted.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const renderLastInteractionLabel = () => {
            let labelColor = '';
            let labelText = '';
            if (!ticket.lastMessage) return '';
            const lastInteractionDate = parseISO(ticket.updatedAt);
            const currentDate = new Date();
            const timeDifference = currentDate - lastInteractionDate;
            const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutesDifference = Math.floor(timeDifference / (1000 * 60));
            if (minutesDifference >= 3 && minutesDifference <= 10) {
                labelText = `(${minutesDifference} m atrás)`;
                labelColor = 'green';
            } else if (minutesDifference >= 30 && minutesDifference < 60) {
                labelText = `(${minutesDifference} m atrás)`;
                labelColor = 'Orange';
            } else if (minutesDifference > 60 && hoursDifference < 24) {
                labelText = `(${hoursDifference} h atrás)`;
                labelColor = 'red';
            } else if (hoursDifference >= 24) {
                labelText = `(${Math.floor(hoursDifference / 24)} dias atrás)`;
                labelColor = 'red';
            }
            return { labelText, labelColor };
        };

        const updateLastInteractionLabel = () => {
            const { labelText, labelColor } = renderLastInteractionLabel();
            setLastInteractionLabel(
                <Badge
                    style={{ color: labelColor }}
                >
                    {labelText}
                </Badge>
            );
            setTimeout(updateLastInteractionLabel, 30 * 1000);
        };

        updateLastInteractionLabel();
    }, [ticket]);

    const getLastMessage = (message) => {
        if (!message)
            return '';
        if (message.length > 20)
            return message.substring(0, 20) + '...';

        return message;
    }

    const handleSendMessage = async (id) => {
        const msg = `{{ms}}*{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`;
        const message = {
            read: 1,
            fromMe: true,
            mediaUrl: "",
            body: `\n${msg.trim()}`,
        };
        try {
            await api.post(`/messages/${id}`, message);
        } catch (err) {
            toast.error(err);
        }
    };

    const handleAcepptTicket = async (id) => {
        if (setTabOpen) {
            setTabOpen("open");
        }

        setLoading(true);
        try {
            await api.put(`/tickets/${id}`, {
                status: "open",
                userId: user?.id,
                queueId: ticket?.queue?.id
            });
            setMakeRequestTagTotalTicketPending(Math.random())
            setMakeRequestTicketList(Math.random())
        } catch (err) {
            setLoading(false);
            toast.error(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }
        

        if (sendGreetingAccepted === "enabled" && !ticket?.isGroup) {
            handleSendMessage(ticket?.id);
        }

        /** Muda para a aba ATENDENDO */
        setOpenTabTicket({ tab: "open", makeRequest: Math.random() });

        if (ticket?.uuid) {
            history.push(`/tickets/${ticket?.uuid}`);
        } else {
            history.push(`/tickets`);
        }
    };

    const handleSelectTicket = (ticket) => {
        const code = uuidv4();
        const { id, uuid } = ticket;
        setCurrentTicket({ id, uuid, code });
    };

    const handleSpyTicket = (e) => {
        e.stopPropagation(); // Evita que o evento de clique se propague para o ListItem
        setOpenTicketMessageDialog(true);
    };

    const handleOpenConfirmationModal = e => {
        setConfirmationOpen(true);
        if (handleClose) {
            handleClose();
        }
    };

    const handleDeleteTicket = async () => {
        setLoading(true);
        try {
            await api.delete(`/tickets/${ticket.id}`);
            setMakeRequestTagTotalTicketPending(Math.random())
            setMakeRequestTicketList(Math.random())
        } catch (err) {
            toast.error(err);
        }
    };

    // Componente para renderizar badges padronizadas
    const StandardBadge = ({ text, color }) => (
        <StandardBadgeStyled
            bgcolor={color || "#7C7C7C"}
        >
            {text}
        </StandardBadgeStyled>
    );



    // Renderizar tags para o popover
    const renderTagsForPopover = () => {
        if (!ticket.tags || ticket.tags.length === 0) {
            return (
                <Typography variant="body2" color="textSecondary">
                    Nenhuma tag disponível
                </Typography>
            );
        }
    
        return ticket.tags.map(tag => (
            <PopoverTagBadge
                key={tag.id}
                bgcolor={tag.color}
            >
                {tag.name.toUpperCase()}
            </PopoverTagBadge>
        ));
    };

    const renderTicketInfo = () => {
        // Em telas pequenas, mostra apenas o badge "Mais detalhes"
        if (isSmallScreen) {
            return (
                <BadgesRow>
                    <MoreDetailsBadge onClick={handleOpenDetailsModal}>
                        <InfoIcon fontSize="small" style={{ fontSize: 14, marginRight: 4 }} />
                        Mais detalhes
                    </MoreDetailsBadge>
                </BadgesRow>
            );
        }

        // Em telas maiores, mostra apenas as badges principais e "Ver tags"
        return (
            <>
                <BadgesRow>
                    {ticketUser && (
                        <StandardBadge
                            text={ticketUser}
                            color={ticket.user?.color || "#111B21"}
                        />
                    )}

                    {ticket.whatsappId && (
                        <StandardBadge
                            text={whatsAppName}
                            color={ticket.whatsapp?.color || "#ae2012"}
                        />
                    )}

                    {ticket.queue?.name !== null && (
                        <StandardBadge
                            text={ticket.queue?.name || "Sem fila"}
                            color={ticket.queue?.color || "#7C7C7C"}
                        />
                    )}

                    {ticket.chatbot && (
                        <Tooltip title="Chatbot">
                            <AndroidIcon
                                fontSize="small"
                                style={{ color: grey[700], marginRight: 5 }}
                            />
                        </Tooltip>
                    )}

                    {ticket.tags && ticket.tags.length > 0 && (
                        <ViewTagsBadge
                            onMouseEnter={handleTagsHoverOpen}
                            onClick={handleOpenTagsModal}
                        >
                            <LabelIcon fontSize="small" style={{ fontSize: 10, marginRight: 2 }} />
                            Ver tags ({ticket.tags.length})
                        </ViewTagsBadge>
                    )}
                </BadgesRow>

                <Popover
    id="tags-popover"
    open={openTagsPopover}
    anchorEl={tagsAnchorEl}
    onClose={handleTagsHoverClose}
    disableRestoreFocus
    anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
    }}
    transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
    }}
    PaperProps={{
        onMouseLeave: handleTagsHoverClose,
        sx: { 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'visible' // Para permitir que a borda fique visível
        }
    }}
>
    <TagsPopoverContent>
        {renderTagsForPopover()}
    </TagsPopoverContent>
</Popover>

                <ActionButtons>
                    {ticket.status === "open" && (
                        <Tooltip title="Finalizar Atendimento">
                            <ActionIconButton color={green[700]} onClick={async () => {
                                await handleCloseTicket(ticket.id);
                                if (setTabOpen) setTabOpen("open");
                            }}>
                                <CheckCircleOutlineIcon fontSize="small" />
                            </ActionIconButton>
                        </Tooltip>
                    )}
                    {ticket.status === "pending" && (
                        <>
                            <Tooltip title="Iniciar Atendimento">
                                <ActionIconButton color={green[700]} onClick={async () => {
                                    await handleAcepptTicket(ticket.id);
                                    if (setTabOpen) setTabOpen("open");
                                }}>
                                    <ThumbUpAltOutlinedIcon fontSize="small" />
                                </ActionIconButton>
                            </Tooltip>
                            <Can
                                role={user.profile}
                                perform="ticket-options:spy"
                                yes={() => (
                                    <Tooltip title="Espiar Conversa">
                                        <ActionIconButton color={blue[700]} onClick={handleSpyTicket}>
                                            <VisibilityIcon fontSize="small" />
                                        </ActionIconButton>
                                    </Tooltip>
                                )}
                            />
                            <Can
                                role={user.profile}
                                perform="ticket-options:reject"
                                yes={() => (
                                    <Tooltip title="Recusar Atendimento">
                                        <ActionIconButton color={orange[700]} onClick={async () => {
                                            await handleCloseTicket(ticket.id);
                                        }}>
                                            <ThumbDownAltOutlinedIcon fontSize="small" />
                                        </ActionIconButton>
                                    </Tooltip>
                                )}
                            />
                            <Can
                                role={user.profile}
                                perform="ticket-options:deleteTicket"
                                yes={() => (
                                    <Tooltip title="Deletar Entrada">
                                        <ActionIconButton color={red[700]} onClick={() => {
                                            handleOpenConfirmationModal(ticket.id);
                                        }}>
                                            <DeleteOutlineOutlinedIcon fontSize="small" />
                                        </ActionIconButton>
                                    </Tooltip>
                                )}
                            />
</>
                    )}
                </ActionButtons>
            </>
        );
    };

    return (
        <React.Fragment key={ticket.id}>
            {!!reasonModalOpen && <ReasonSelectionModal
                open={reasonModalOpen}
                onClose={() => setReasonModalOpen(false)}
                onConfirm={handleConfirmReason}
            />}
            <TicketMessagesDialog
                open={openTicketMessageDialog}
                handleClose={() => setOpenTicketMessageDialog(false)}
                ticketId={ticket.id}
            ></TicketMessagesDialog>
            <TicketContainer
                dense
                button
                onClick={(e) => {
                    if (ticket.status === "pending") return;
                    handleSelectTicket(ticket);
                }}
                selected={ticketId && +ticketId === ticket.id}
                className={clsx({
                    [PendingTicketContainer]: ticket.status === "pending",
                })}
            >
                <Tooltip
                    arrow
                    placement="right"
                    title={ticket.queue?.name || "Sem fila"}
                >
                    <TicketQueueColor
                        style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
                    ></TicketQueueColor>
                </Tooltip>
                <AvatarContainer sx={{
                    marginLeft: isSameDay(parseISO(ticket.updatedAt), new Date()) && '11px',
                    position: isSameDay(parseISO(ticket.updatedAt), new Date()) && 'relative',
                    right: isSameDay(parseISO(ticket.updatedAt), new Date()) && '9px',
                    marginBottom: !ticket.lastMessage && '20px'
                }}>
                    <NewMessagesCount
                        badgeContent={ticket.unreadMessages ? ticket.unreadMessages : null}
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: green[500],
                                color: 'white'
                            }
                        }}
                    >
                        <Avatar
                            imgProps={{ loading: "lazy" }}
                            sx={{
                                backgroundColor: generateColor(ticket?.contact?.number),
                                color: "white",
                                fontWeight: "bold",
                                position: !isSameDay(parseISO(ticket.updatedAt), new Date()) && 'relative',
                                right: !isSameDay(parseISO(ticket.updatedAt), new Date()) && '4px'
                            }} src={ticket?.contact?.profilePicUrl}>{getInitials(ticket?.contact?.name || "")}</Avatar>
                            </NewMessagesCount>
                    {ticket.lastMessage && (
                        <>
                            <LastMessageTime sx={{ position: 'relative', top: '2px' }}>
                                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                                ) : (
                                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                                )}
                            </LastMessageTime>
                            <br />
                        </>
                    )}
                </AvatarContainer>
                <ListItemText sx={{ top: -15 }}
                    disableTypography
                    primary={
                        <ContactNameWrapper ticket={ticket} sx={{ top: -15 }}>
                            <Typography
                                noWrap
                                component="span"
                                variant="body2"
                                color="textPrimary"
                            >
                                {ticket.channel === "whatsapp" && (
                                    <Tooltip title={`${ticket.channel} - Atendente: ${ticketUser}`} sx={{ top: -15 }}>
                                        <WhatsAppIcon fontSize="small" sx={{ top: -15, color: "#30D24E" }} />
                                    </Tooltip>
                                )}
                                {ticket.channel === "instagram" && (
                                    <Tooltip title={`${ticket.channel} - Atendente: ${ticketUser}`} sx={{ top: -15 }}>
                                        <InstagramIcon fontSize="small" sx={{ top: -15, color: "#F60078" }} />
                                    </Tooltip>
                                )}
                                {ticket.channel === "facebook" && (
                                    <Tooltip title={`${ticket.channel} - Atendente: ${ticketUser}`} sx={{ top: -15 }}>
                                        <FacebookIcon fontSize="small" sx={{ top: -15, color: "#4867AA" }} />
                                    </Tooltip>
                                )}{' '}
                                <Typography
                                    noWrap
                                    component='span'
                                    variant='body2'
                                    color='textPrimary'
                                >
                                    <strong>{displayContactInfo === 'enabled' ? ticket.contact?.number : ticket.contact?.name} {lastInteractionLabel}</strong>
                                </Typography>
                            </Typography>
                            <ListItemSecondaryAction sx={{ left: 73 }}>
                                <TicketInfo1 isSmallScreen={isSmallScreen}>{renderTicketInfo()}</TicketInfo1>
                            </ListItemSecondaryAction>
                        </ContactNameWrapper>
                    }
                    secondary={
                        <ContactNameWrapper ticket={ticket} sx={{ top: -15 }}>
                            <ContactLastMessage sx={{ top: -15 }}>
                                {ticket.contact?.presence !== "available" ? (
                                    <>
                                        {ticket.contact ? i18n.t(`presence.${ticket.contact.presence}`) : ""}
                                    </>
                                ) : (
                                    <>
                                        {ticket.lastMessage?.includes('data:image/png;base64') ?
                                            <WhatsMarkedWrapper> Localização</WhatsMarkedWrapper> :
                                            <WhatsMarkedWrapper>{getLastMessage(ticket.lastMessage)}</WhatsMarkedWrapper>}
                                    </>
                                )}
                            </ContactLastMessage>
                        </ContactNameWrapper>
                    }
                />
                <ListItemSecondaryAction>
                    {ticket.status === "closed" && (
                        <Tooltip title="Atendimento Finalizado">
                            <TicketStatusBadge
                                bgcolor={ticket.queue?.color || "#7C7C7C"}
                            >
                                <LockIcon fontSize="small" sx={{ fontSize: 14, marginRight: 0.5 }} />
                            </TicketStatusBadge>
                        </Tooltip>
                    )}
                </ListItemSecondaryAction>
            </TicketContainer>
            <Divider variant="inset" component="li" />

            {/* Modal para exibir todas as tags */}
            {ticket.tags && ticket.tags.length > 0 && (
                <TagsModal
                    open={tagsModalOpen}
                    onClose={() => setTagsModalOpen(false)}
                    tags={ticket.tags}
                    ticketId={ticket.id}
                />
            )}

            {/* Modal para exibir detalhes do ticket em telas pequenas */}
            <TicketDetailsModal
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                ticket={ticket}
                ticketUser={ticketUser}
                whatsAppName={whatsAppName}
                handleAcepptTicket={handleAcepptTicket}
                handleCloseTicket={handleCloseTicket}
                handleSpyTicket={handleSpyTicket}
                handleDeleteTicket={handleDeleteTicket}
                handleOpenConfirmationModal={handleOpenConfirmationModal}
                user={user}
                confirmationOpen={confirmationOpen}
                setConfirmationOpen={setConfirmationOpen}
                setTabOpen={setTabOpen}
            />

            {/* Modais para processo de fechamento de ticket */}
            {queueModalOpen && (
                <QueueSelectionModal
                    open={queueModalOpen}
                    onClose={() => setQueueModalOpen(false)}
                    onSelect={(queueId) => {
                        setSelectedQueueId(queueId);
                        handleSelectQueue(queueId);
                    }}
                    title={i18n.t("ticketOptionsMenu.queueModal.title")}
                />
            )}

            {tagsSelectionModalOpen && (
                <TagsSelectionModal
                    open={tagsSelectionModalOpen}
                    onClose={() => setTagsSelectionModalOpen(false)}
                    onSelect={handleSelectTags}
                    ticketTags={ticket.tags}
                />
            )}

            <ConfirmationModal
                title={`${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${ticket.contact?.name}?`}
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                onConfirm={handleDeleteTicket}
            >
                {i18n.t("ticketOptionsMenu.confirmationModal.message")}
            </ConfirmationModal>
        </React.Fragment>
    );
};

export default TicketListItem;