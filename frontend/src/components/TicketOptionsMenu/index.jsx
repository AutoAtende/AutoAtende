import React, { useContext, useEffect, useRef, useState } from "react";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";
import { toast } from "../../helpers/toast";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import { GlobalContext } from "../../context/GlobalContext";
import ScheduleModal from "../ScheduleModal";
import ReasonSelectionModal from "../ReasonSelectionModal";
import QueueSelectionModal from "../QueueSelectionModal";
import TagsSelectionModal from "../TagsSelectionModal";
import useSettings from "../../hooks/useSettings";

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
	const [contactId, setContactId] = useState(null);
    
    // Adicionando estados para os modais de fechamento
    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [queueModalOpen, setQueueModalOpen] = useState(false);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [enableQueueWhenCloseTicket, setEnableQueueWhenCloseTicket] = useState(false);
    const [enableTagsWhenCloseTicket, setEnableTagsWhenCloseTicket] = useState(false);
    const [enableReasonWhenCloseTicket, setEnableReasonWhenCloseTicket] = useState(false);
    const [loading, setLoading] = useState(false);
    const { getCachedSetting } = useSettings();

	const { setMakeRequest, setOpenTabTicket, setMakeRequestTagTotalTicketPending, setMakeRequestTicketList } = useContext(GlobalContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);
    
    // Adicionar useEffect para buscar as configurações de fechamento de ticket
    useEffect(() => {
        const fetchSettings = async () => {
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
                console.error("Erro ao buscar configurações:", error);
            }
        };

        fetchSettings();
    }, []);

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

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	const handleOpenTransferModal = e => {
		setTransferTicketModalOpen(true);
		handleClose();
	};

	const handleCloseTransferTicketModal = () => {
		if (isMounted.current) {
			setTransferTicketModalOpen(false);
		}
	};

	const handleOpenScheduleModal = () => {
		handleClose();
		setContactId(ticket.contact.id);
		setScheduleModalOpen(true);
	}

	const handleCloseScheduleModal = () => {
		setScheduleModalOpen(false);
		setContactId(null);
	}
    
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
            
            if (data.status === "closed") {
                if (setMakeRequestTagTotalTicketPending) {
                    setMakeRequestTagTotalTicketPending(Math.random());
                }
                if (setMakeRequestTicketList) {
                    setMakeRequestTicketList(Math.random());
                }
                if (setMakeRequest) {
                    setMakeRequest(Math.random());
                }
                toast.success("Ticket fechado com sucesso");
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
            setTagModalOpen(false);
        }
    };

    const handleCloseTicket = () => {
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
            closeTicket();
        }
        handleClose();
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
			<Menu
				id="menu-appbar"
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				keepMounted
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				<MenuItem onClick={handleOpenScheduleModal}>
					{i18n.t("ticketOptionsMenu.schedule")}
				</MenuItem>
				<MenuItem onClick={handleOpenTransferModal}>
					{i18n.t("ticketOptionsMenu.transfer")}
				</MenuItem>
                {ticket.status === "open" && (
                    <MenuItem onClick={handleCloseTicket}>
                        {i18n.t("ticketOptionsMenu.close")}
                    </MenuItem>
                )}
				<Can
					role={user.profile}
					perform="ticket-options:deleteTicket"
					yes={() => (
						<MenuItem onClick={handleOpenConfirmationModal}>
							{i18n.t("ticketOptionsMenu.delete")}
						</MenuItem>
					)}
				/>
			</Menu>
			<ConfirmationModal
				title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
					ticket.id
				} ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
					ticket.contact.name
				}?`}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteTicket}
			>
				{i18n.t("ticketOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<TransferTicketModal
				modalOpen={transferTicketModalOpen}
				onClose={handleCloseTransferTicketModal}
				ticketid={ticket.id}
				contactId={ticket?.contact?.id}
			/>
			<ScheduleModal
				open={scheduleModalOpen}
				onClose={handleCloseScheduleModal}
				aria-labelledby="form-dialog-title"
				contactId={contactId}
			/>
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

export default TicketOptionsMenu;