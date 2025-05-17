import React, { useContext, useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Can } from "../Can";

import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme, useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import { Menu, IconButton } from "@mui/material";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { Snackbar, Button } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import { cx } from '@emotion/css';
import { BiSend, BiTransfer } from 'react-icons/bi';
import TransferTicketModal from "../TransferTicketModal";
import ScheduleModal from "../ScheduleModal";
import ConfirmationModal from "../ConfirmationModal";
import usePlans from "../../hooks/usePlans";
import TicketMessagesExportDialog from "../TicketMessagesExportDialog";
import ShowTicketValueModal from "../ShowTicketValueModal";
import MenuItem from "@mui/material/MenuItem";
import TaskModal from "../../pages/Tasks/components/TaskModal";
import {
    Call as CallIcon,
    MoreVert as MoreVertRoundedIcon,
    Paid as PaidRoundedIcon,
    CheckCircle as CheckCircleRoundedIcon,
    PictureAsPdf as PictureAsPdfRoundedIcon,
    KeyboardReturn as KeyboardReturnRoundedIcon,
    SyncAlt as SyncAltRoundedIcon,
    ReplayCircleFilled as ReplayCircleFilledRoundedIcon,
    Event as EventRoundedIcon,
    HighlightOff as HighlightOffRoundedIcon,
    Api as ApiIcon,
    Assignment as AssignmentIcon,
    Email as EmailIcon
  } from '@mui/icons-material';

import EmailPdfModal from "../EmailPdfModal";
import { GlobalContext } from "../../context/GlobalContext";
import useSettings from "../../hooks/useSettings";
import ReasonSelectionModal from "../ReasonSelectionModal";
import QueueSelectionModal from "../QueueSelectionModal";
import TagsSelectionModal from "../TagsSelectionModal";

const useStyles = makeStyles(theme => ({
    actionButtons: {
        marginRight: 6,
        [theme.breakpoints.down('lg')]: {
            marginRight: 0,
        },
        flex: "none",
        alignSelf: "center",
        marginLeft: "auto",
        "& > *": {
            margin: theme.spacing(0.5),
        },
    },
    snackbar: {
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: theme.palette.primary.main,
        color: "white",
        borderRadius: 30,
        [theme.breakpoints.down('md')]: {
            fontSize: "0.8em",
        },
        [theme.breakpoints.up("md")]: {
            fontSize: "1em",
        },
    },
    callIcon: {
        transition: 'all 0.3s ease',
        '&:hover': {
            color: theme.palette.primary.main,
        },
    },
    
    callButton: {
        '&:hover .MuiSvgIcon-root': {
            color: theme.palette.primary.main,
        },
    },

    enabledCallIcon: {
        color: theme.palette.primary.main,
    },
    
    disabledCallIcon: {
        color: theme.palette.grey[400],
    },
    icons: {
        color: theme.palette.iconColor
    }
}));

const TicketActionButtons = ({
    ticket,
    showSelectMessageCheckbox,
    selectedMessages,
    forwardMessageModalOpen,
    setForwardMessageModalOpen,
    handleCloseTicket
}) => {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();
    const isMounted = useRef(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const ticketOptionsMenuOpen = Boolean(anchorEl);
    const { user } = useContext(AuthContext);
    const { setCurrentTicket } = useContext(TicketsContext);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [contactId, setContactId] = useState(null);
    const [open, setOpen] = useState(false);
    const formRef = useRef(null);
    const [glApiModalOpen, setGlApiModalOpen] = useState(false);
    const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
    const [showSchedules, setShowSchedules] = useState(false);
    const [showTicketLogOpen, setShowTicketLogOpen] = useState(false);
    const [setValueModalOpen, setSetValueModalOpen] = useState(false);
    const [ticketValue, setTicketValue] = useState(ticket.value || '');
    const [ticketSku, setTicketSku] = useState(ticket.sku || '');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [enableTicketValueAndSku, setEnableTicketValueAndSku] = useState(false);
    const [enableUPSix, setEnableUPSix] = useState(false);
    const [enableUPSixWebphone, setEnableUPSixWebphone] = useState(false);

    const { getPlanCompany } = usePlans();
    const { getCachedSetting } = useSettings();
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskCategories, setTaskCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [emailPdfModalOpen, setEmailPdfModalOpen] = useState(false);
    
    // Adicionando estados para os modais de fechamento
    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [queueModalOpen, setQueueModalOpen] = useState(false);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [selectedQueueId, setSelectedQueueId] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [enableQueueWhenCloseTicket, setEnableQueueWhenCloseTicket] = useState(false);
    const [enableTagsWhenCloseTicket, setEnableTagsWhenCloseTicket] = useState(false);
    const [enableReasonWhenCloseTicket, setEnableReasonWhenCloseTicket] = useState(false);

    const { setMakeRequest, setOpenTabTicket, setMakeRequestTagTotalTicketPending, setMakeRequestTicketList } = useContext(GlobalContext);

    useEffect(() => {
        const fetchTaskCategories = async () => {
            try {
                const response = await api.get('/task/category');
                setTaskCategories(response.data);
            } catch (error) {
                console.error('Error fetching task categories:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await api.get('/users/list');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchTaskCategories();
        fetchUsers();
    }, []);

    useEffect(async () => {
        async function fetchData() {
            const companyId = user.companyId;
            const planConfigs = await getPlanCompany(undefined, companyId);
            setShowSchedules(planConfigs.plan.useSchedules);
            setOpenTicketMessageDialog(false);
        }

        await fetchData();
        setShowTicketLogOpen(false);
    }, []);

    useEffect(async () => {
        const enableTicketValueAndSku = await getCachedSetting("enableTicketValueAndSku");
        const enableUPSix = await getCachedSetting("enableUPSix");
        const enableUPSixWebphone = await getCachedSetting("enableUPSixWebphone");
        if (enableTicketValueAndSku) {
            setEnableTicketValueAndSku(enableTicketValueAndSku?.value || "enabled");
        }
        if(enableUPSix) {
            setEnableUPSix(enableUPSix?.value || "enabled");
            if(enableUPSixWebphone) {
                setEnableUPSixWebphone(enableUPSixWebphone?.value || "enabled");
            }
        }
    }, []);


    // Adicionar useEffect para buscar as configurações de fechamento de ticket
    useEffect(async () => {
        try {
            const enableQueueSetting = await getCachedSetting("enableQueueWhenCloseTicket");
            if (enableQueueSetting) {
                setEnableQueueWhenCloseTicket(enableQueueSetting.value === "enabled");
            }

            const enableTagsSetting = await getCachedSetting("enableTagsWhenCloseTicket");
            if (enableTagsSetting) {
                setEnableTagsWhenCloseTicket(enableTagsSetting.value === "enabled");
            }
            
            const enableReasonSetting = await getCachedSetting("enableReasonWhenCloseTicket");
            if (enableReasonSetting) {
                setEnableReasonWhenCloseTicket(enableReasonSetting.value === "enabled");
            }
        } catch (error) {
            console.error("Erro ao buscar configurações de fechamento de ticket:", error);
        }
    }, []);

    const handleOpenTicketOptionsMenu = e => {
        setAnchorEl(e.currentTarget);
    };

    const handleCloseTicketOptionsMenu = e => {
        setAnchorEl(null);
    };

    const handleOpenSetValueModal = () => {
        setTicketValue(ticketValue);
        setTicketSku(ticketSku);
        setSetValueModalOpen(true);
    };

    const handleOpenScheduleModal = () => {
        setContactId(ticket.contact.id);
        setScheduleModalOpen(true);
        handleCloseTicketOptionsMenu();
    };

    const handleCloseScheduleModal = () => {
        setScheduleModalOpen(false);
        setContactId(null);
    };

    const handleOpenTransferModal = (e) => {
        setTransferTicketModalOpen(true);
        handleCloseTicketOptionsMenu();
    };

    const handleCloseTransferTicketModal = () => {
        if (isMounted.current) {
            setTransferTicketModalOpen(false);
        }
    };

    const handleOpenConfirmationModal = (e) => {
        setConfirmationOpen(true);
        handleCloseTicketOptionsMenu();
    };

    const handleDeleteTicket = async () => {
		try {
			await api.delete(`/tickets/${ticket.id}`);
			toast.success(i18n.t("tickets.inbox.ticketDeleteSuccessfully"));
			setConfirmationOpen(false);
			
			// Atualiza a lista após deletar
			if (typeof setMakeRequest === 'function') {
				setMakeRequest(Math.random());
			}
		} catch (err) {
			console.error("Error deleting ticket:", err);
			toast.error(err.response?.data?.error || 'Ocorreu um erro ao excluir o ticket');
		}
    };

    const handleUpdateTicketValueAndSKu = async (ticketValue, ticketSku) => {
        try {
            setLoading(true);
            await api.put(`/tickets/value/${ticket.id}`, {
                value: ticketValue,
                sku: ticketSku
            });
            toast.success(i18n.t('ticket.sku.updatedTicketValueSuccessSku'));
            setLoading(false);
            history.push(`/tickets/`);
            history.push(`/tickets/${ticket.uuid}`);
        } catch (err) {
            setLoading(false);
            toast.error(err);
        } finally {
            setSetValueModalOpen(false);
        }
    };

    const handleOpenModalForward = () => {
        if (selectedMessages.length === 0) {
            toast.error({ response: { data: { message: i18n.t('ticket.noMessagesSelected') } } });
            return;
        }
        setForwardMessageModalOpen(true);
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUpdateTicketStatus = async (e, status, userId) => {
        setLoading(true);
        setSnackbarOpen(false);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: status,
                userId: userId || null,
                sendFarewellMessage: true,
                useIntegration: status === "closed" ? false : ticket.useIntegration,
                promptId: status === "closed" ? false : ticket.promptId,
                integrationId: status === "closed" ? false : ticket.integrationId
            });
    
            setLoading(false);
            if (status === "open") {
                setMakeRequest(Math.random());
                setMakeRequestTagTotalTicketPending(Math.random());
                setCurrentTicket({ ...ticket, code: "#open" });
            } else {
                setMakeRequest(Math.random());
                setMakeRequestTagTotalTicketPending(Math.random());
                setCurrentTicket({ id: null, code: null });
                history.push("/tickets");
            }
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.error || 'Erro ao atualizar o ticket');
        }
    };

    const handleCall = async () => {
        // Se já estiver em execução, não permite nova chamada
        if (loading) {
            return;
        }
        
        console.log('Iniciando chamada...');
        
        // Validações com logs detalhados
        if (!ticket.company?.urlPBX) {
            console.error('Erro: URL do PBX não configurada', { company: ticket.company });
            toast.error('URL do PBX não configurada');
            return;
        }
        
        if (!ticket.user?.ramal) {
            console.error('Erro: Ramal não configurado', { user: ticket.user });
            toast.error('Ramal não configurado');
            return;
        }
        
        if (!ticket.contact?.number) {
            console.error('Erro: Número do contato não disponível', { contact: ticket.contact });
            toast.error('Número do contato não disponível');
            return;
        }
        
        console.log('Dados da chamada:', {
            urlPBX: ticket.company.urlPBX,
            ramal: ticket.user.ramal,
            numero: ticket.contact.number,
            ticketId: ticket.id
        });
        
        const baseUrl = `${ticket.company?.urlPBX}/discar_chatbot.php`;
        const params = new URLSearchParams({
            exten: ticket.user?.ramal,
            phone: ticket.contact?.number.replace(/\D/g, ''),
            nome_rede_social: ticket.id.toString()
        });
        
        const fullUrl = `${baseUrl}?${params.toString()}`;
        console.log('URL da chamada:', fullUrl);
        
        setLoading(true);
        
        try {
            console.log('Iniciando requisição ao PBX...');
            
            // Cria uma Promise com timeout de 12 segundos
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Timeout ao tentar conectar com o PBX'));
                }, 12000);
            });
            
            // Executa a requisição com timeout
            const callRecordId = await Promise.race([
                api.get(fullUrl),
                timeoutPromise
            ]);
            
            console.log('Resposta da chamada:', callRecordId);
            toast.success('Conexão com PBX estabelecida');
            
            try {
                await api.put(`/tickets/${ticket.id}/record/${callRecordId}`);
                console.log('Registro da chamada atualizado');
                toast.success('Registro da chamada atualizado com sucesso');
            } catch (err) {
                console.error('Erro ao atualizar registro da chamada:', err);
                toast.error('Erro ao atualizar registro da chamada');
                setLoading(false);
                return;
            }
            toast.success('Chamada iniciada com sucesso');
        } catch (err) {
            console.error('Erro ao conectar com PBX:', err);
            if (err.message === 'Timeout ao tentar conectar com o PBX') {
                toast.error('A chamada não foi atendida ou o PBX não está corretamente configurado.');
            } else {
                toast.error('Erro ao conectar com PBX. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleCloseTicketWithoutFarewellMsg = async (e, status, userId) => {
        setLoading(true);
        setSnackbarOpen(false);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: status,
                userId: userId || null,
                sendFarewellMessage: false,
                useIntegration: false,
                promptId: null,
                integrationId: null
            });
    
            setLoading(false);
            setCurrentTicket({ id: null, code: null });
            history.push("/tickets");
    
            if (setMakeRequest) {
                setMakeRequest(Math.random());
            }
            if (setMakeRequestTagTotalTicketPending) {
                setMakeRequestTagTotalTicketPending(Math.random());
            }
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.error || 'Erro ao fechar o ticket');
        }
    };

    const handleResolveClick = () => {
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleCloseTaskModal = () => {
        setTaskModalOpen(false);
    };

    const handleOpenTaskModal = () => {
        setTaskModalOpen(true);
        handleCloseTicketOptionsMenu();
    };
      
    const getInitialTaskText = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        return `Relacionada ao ticket #${ticket.id}, no dia ${dateStr}, hora ${timeStr}.\n\n`;
    };
      
    const handleOpenEmailPdfModal = () => {
        setEmailPdfModalOpen(true);
        handleCloseTicketOptionsMenu();
    };

    const handleCloseEmailPdfModal = () => {
        setEmailPdfModalOpen(false);
    };

    const handleEmailPdfSent = () => {
        toast.success(i18n.t("ticket.emailPdf.success"));
        handleCloseEmailPdfModal();
    };
    
    // Funções para o fechamento de ticket com as novas opções
    const closeTicket = async (reasonId = null, queueId = null, tags = []) => {
        setLoading(true);
        try {
            const closeData = {
                status: "closed",
                userId: user?.id,
                queueId: !ticket.queue || !ticket.queue.id ? queueId : ticket.queue.id,
            };

            if (reasonId) {
                closeData.reasonId = reasonId;
            }

            const { data } = await api.put(`/tickets/${ticket.id}`, closeData);
            
            // Se houver tags selecionadas, aplicá-las ao ticket
            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    await api.put(`/ticket-tags/${ticket.id}/${tag.id}`);
                }
            }
            
            setLoading(false);
            setCurrentTicket({ id: null, code: null });
            history.push("/tickets");
            
            if (data.status === "closed") {
                setMakeRequestTagTotalTicketPending(Math.random());
                setMakeRequestTicketList(Math.random());
                toast.success("Ticket fechado com sucesso");
                setTimeout(() => {
                    setMakeRequest(Math.random());
                }, 1000);
            } else {
                toast.error("Erro ao fechar o ticket");
            }
        } catch (err) {
            setLoading(false);
            console.error("Erro ao fechar o ticket:", err);
            toast.error("Erro ao fechar o ticket: " + (err.response?.data?.error || err.message));
        } finally {
            setReasonModalOpen(false);
            setQueueModalOpen(false);
            setTagModalOpen(false);
        }
    };

    const handleCloseTicketInternal = async () => {
        // Verificar qual configuração está ativa e abrir o modal correspondente
        if (enableQueueWhenCloseTicket && (!ticket.queue || !ticket.queue.id)) {
            // Só abre o modal de fila se o ticket não tiver fila definida
            setQueueModalOpen(true);
        } else if (enableTagsWhenCloseTicket) {
            setTagModalOpen(true);
        } else if (enableReasonWhenCloseTicket) {
            setReasonModalOpen(true);
        } else {
            // Se nenhuma opção estiver ativa, fechar ticket diretamente
            await closeTicket();
        }
    };

    // Funções para tratar as seleções nos modais
    const handleQueueSelected = async (queueId) => {
        await closeTicket(null, queueId, null);
    };

    const handleTagsSelected = async (tags) => {
        await closeTicket(null, null, tags);
    };

    const handleReasonSelected = async (reasonId) => {
        await closeTicket(reasonId, null, null);
    };

    return (
        <>
            {openTicketMessageDialog && (
                <TicketMessagesExportDialog
                    open={openTicketMessageDialog}
                    handleClose={() => setOpenTicketMessageDialog(false)}
                    ticketId={ticket.id}
                />
            )}

            <div className={classes.actionButtons}>
                <IconButton 
                    onClick={handleCall}
                    className={classes.callButton}
                    disabled={!ticket.company?.urlPBX || !ticket.user?.ramal || !ticket.contact?.number}
                >
                    <CallIcon 
                        className={cx(
                            classes.callIcon,
                            ticket.company?.urlPBX && ticket.user?.ramal && ticket.contact?.number 
                                ? classes.enabledCallIcon 
                                : classes.disabledCallIcon
                        )}
                    />
                </IconButton>

                <IconButton onClick={handleClick} size="large">
                    <MoreVertRoundedIcon sx={{ color: theme.palette.primary.main }}/>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseTicketOptionsMenu}
                >
                    {ticket.status === "open" && (
                        <>
                            <Tooltip title={i18n.t("ticketsList.buttons.exportAsPdf")} placement="left">
                                <MenuItem onClick={() => { handleCloseTicketOptionsMenu(); setOpenTicketMessageDialog(true); }}>
                                    <PictureAsPdfRoundedIcon sx={{ color: theme.palette.primary.main }} />
                                </MenuItem>
                            </Tooltip>

                            {!ticket.isGroup && (
                                <Tooltip title={i18n.t("ticket.emailPdf.title")} placement="left">
                                    <MenuItem onClick={handleOpenEmailPdfModal}>
                                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                                    </MenuItem>
                                </Tooltip>
                            )}
                        </>
                    )}

                    {!ticket.isGroup && enableTicketValueAndSku === "enabled" && ticket.status === "open" && (
                        <Tooltip title={i18n.t('ticket.menuItem.sku')} placement="left">
                            <MenuItem onClick={() => { handleCloseTicketOptionsMenu(); handleOpenSetValueModal(); }}>
                                <PaidRoundedIcon sx={{ color: theme.palette.primary.main }} />
                            </MenuItem>
                        </Tooltip>
                    )}

                    {ticket.status === "closed" && (
                        <MenuItem onClick={e => { handleCloseTicketOptionsMenu(); handleUpdateTicketStatus(e, "open", user?.id); }}>
                            <ButtonWithSpinner
                                loading={loading}
                                startIcon={<ReplayCircleFilledRoundedIcon />}
                                size="small"
                            >
                                {i18n.t("messagesList.header.buttons.reopen")}
                            </ButtonWithSpinner>
                        </MenuItem>
                        )}

                        {(ticket.status === "open" || ticket.status === "group") && (
                            <>
                                {!showSelectMessageCheckbox ? (
                                    <>
                                        <Tooltip title={i18n.t("messagesList.header.buttons.return")} placement="left">
                                            <MenuItem onClick={e => { handleCloseTicketOptionsMenu(); handleUpdateTicketStatus(e, "pending", null); }}>
                                                <KeyboardReturnRoundedIcon sx={{ color: theme.palette.primary.main }} />
                                            </MenuItem>
                                        </Tooltip>
                                        <Tooltip title={i18n.t("messagesList.header.buttons.resolve")} placement="left">
                                            <MenuItem onClick={() => { handleCloseTicketOptionsMenu(); handleCloseTicketInternal(); }}>
                                                <CheckCircleRoundedIcon sx={{ color: theme.palette.primary.main }} />
                                            </MenuItem>
                                        </Tooltip>
    
                                        <Can
                                            role={user.profile}
                                            perform="ticket-options:transferTicket"
                                            yes={() => (
                                                <Tooltip title={i18n.t('ticket.menuItem.transfer')} placement="left">
                                                    <MenuItem onClick={handleOpenTransferModal}>
                                                        <SyncAltRoundedIcon sx={{ color: theme.palette.primary.main }} />
                                                    </MenuItem>
                                                </Tooltip>
                                            )}
                                        />
    
                                        {showSchedules && !ticket.isGroup && (
                                            <Tooltip title={i18n.t('ticket.menuItem.schedule')} placement="left">
                                                <MenuItem onClick={handleOpenScheduleModal}>
                                                    <EventRoundedIcon sx={{ color: theme.palette.primary.main }} />
                                                </MenuItem>
                                            </Tooltip>
                                        )}
    
                                        <Can
                                            role={user.profile}
                                            perform="ticket-options:deleteTicket"
                                            yes={() => (
                                                <Tooltip title={i18n.t('ticket.menuItem.deleteTicket')} placement="left">
                                                    <MenuItem onClick={handleOpenConfirmationModal}>
                                                        <HighlightOffRoundedIcon sx={{ color: theme.palette.primary.main }} />
                                                    </MenuItem>
                                                </Tooltip>
                                            )}
                                        />
    
                                        <Tooltip title={i18n.t('ticket.menuItem.createTask')} placement="left">
                                            <MenuItem onClick={handleOpenTaskModal}>
                                                <AssignmentIcon sx={{ color: theme.palette.primary.main }} />
                                            </MenuItem>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <MenuItem onClick={handleOpenModalForward}>
                                        <ButtonWithSpinner
                                            loading={loading}
                                            startIcon={<BiSend />}
                                            size="small"
                                        >
                                            {i18n.t("messageOptionsMenu.forwardbutton")}
                                        </ButtonWithSpinner>
                                    </MenuItem>
                                )}
                            </>
                        )}
                    </Menu>
                    {ticket.status === "pending" && (
                        <ButtonWithSpinner
                            loading={loading}
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
                        >
                            {i18n.t("messagesList.header.buttons.accept")}
                        </ButtonWithSpinner>
                    )}
                </div>
    
                {taskModalOpen && (
                    <TaskModal
                        open={taskModalOpen}
                        onClose={handleCloseTaskModal}
                        task=""
                        initialText={getInitialTaskText()}
                        currentUser={user}
                    />
                )}
    
    {confirmationOpen && (
                    <ConfirmationModal
                        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")} #${ticket.id}?`}
                        open={confirmationOpen}
                        onClose={setConfirmationOpen}
                        onConfirm={handleDeleteTicket}
                    >
                        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
                    </ConfirmationModal>
                )}
    
                {setValueModalOpen && (
                    <ShowTicketValueModal
                        open={setValueModalOpen}
                        onClose={() => setSetValueModalOpen(false)}
                        onSave={(ticketValue, ticketSku) => {
                            handleUpdateTicketValueAndSKu(ticketValue, ticketSku);
                        }}
                        ticket={ticket}
                        ticketValue={ticketValue}
                        ticketSku={ticketSku}
                    />
                )}
    
                {transferTicketModalOpen && (
                    <TransferTicketModal
                        modalOpen={transferTicketModalOpen}
                        onClose={handleCloseTransferTicketModal}
                        ticketid={ticket.id}
                        contactId={ticket?.contact?.id}
                    />
                )}
    
                {scheduleModalOpen && (
                    <ScheduleModal
                        open={scheduleModalOpen}
                        onClose={handleCloseScheduleModal}
                        aria-labelledby="form-dialog-title"
                        contactId={contactId}
                    />
                )}
    
                {emailPdfModalOpen && (
                    <EmailPdfModal
                        open={emailPdfModalOpen}
                        handleClose={handleCloseEmailPdfModal}
                        ticketId={ticket.id}
                        onSend={handleEmailPdfSent}
                    />
                )}
    
                {snackbarOpen && (
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleSnackbarClose}
                        message={i18n.t("messagesList.confirm.resolveWithMessage")}
                        ContentProps={{
                            className: classes.snackbar,
                        }}
                        action={
                            <>
                                <Button color="secondary" size="small" onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)}>
                                    {i18n.t("messagesList.confirm.yes")}
                                </Button>
                                <Button color="secondary" size="small" onClick={e => handleCloseTicketWithoutFarewellMsg(e, "closed", user?.id)}>
                                    {i18n.t("messagesList.confirm.no")}
                                </Button>
                            </>
                        }
                        className={classes.snackbar}
                    />
                )}

                {/* Adicionar os modais para fechamento de ticket */}
                {reasonModalOpen && (
                    <ReasonSelectionModal
                        open={reasonModalOpen}
                        onClose={() => setReasonModalOpen(false)}
                        onConfirm={handleReasonSelected}
                    />
                )}

                {queueModalOpen && (
                    <QueueSelectionModal
                        open={queueModalOpen}
                        onClose={() => setQueueModalOpen(false)}
                        onConfirm={handleQueueSelected}
                    />
                )}

                {tagModalOpen && (
                    <TagsSelectionModal
                        open={tagModalOpen}
                        onClose={() => setTagModalOpen(false)}
                        onConfirm={handleTagsSelected}
                    />
                )}
            </>
        );
    };
    
    export default TicketActionButtons;