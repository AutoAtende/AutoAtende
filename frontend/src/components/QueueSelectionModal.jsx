import React, { useState, useEffect } from "react";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Box,
    IconButton,
    InputAdornment,
    OutlinedInput
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../services/api";
import { toast } from "../helpers/toast";
import { i18n } from "../translate/i18n";
import BaseModal from "./BaseModal";

const QueueSelectionModal = ({ open, onClose, onConfirm }) => {
    const [queues, setQueues] = useState([]);
    const [selectedQueue, setSelectedQueue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQueues = async () => {
            try {
                const response = await api.get("/queue");
                setQueues(response.data);
            } catch (err) {
                toast.error("Erro ao carregar filas");
                console.error("Erro ao carregar filas:", err);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            loadQueues();
        }
    }, [open]);

    const handleConfirm = () => {
        if (selectedQueue) {
            onConfirm(selectedQueue);
        }
    };

    const handleClearSelection = () => {
        setSelectedQueue("");
    };

    const actions = [
        {
            label: i18n.t("ticket.buttons.cancel"),
            onClick: onClose,
            color: "secondary"
        },
        {
            label: i18n.t("ticket.buttons.confirm"),
            onClick: handleConfirm,
            variant: "contained",
            color: "primary",
            disabled: !selectedQueue
        }
    ];

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={i18n.t("ticket.queueModal.title")}
            actions={actions}
            maxWidth="sm"
        >
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <FormControl fullWidth required sx={{ mt: 2 }}>
                    <InputLabel id="select-queue-label">{i18n.t("ticket.queueModal.queue")}</InputLabel>
                    <Select
                        labelId="select-queue-label"
                        value={selectedQueue}
                        onChange={(e) => setSelectedQueue(e.target.value)}
                        input={
                            <OutlinedInput
                                endAdornment={
                                    selectedQueue && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="clear selection"
                                                onClick={handleClearSelection}
                                                edge="end"
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            />
                        }
                    >
                        {queues.map((queue) => (
                            <MenuItem key={queue.id} value={queue.id.toString()}>
                                {queue.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        </BaseModal>
    );
};

export default QueueSelectionModal;