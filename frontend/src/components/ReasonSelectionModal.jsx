import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    IconButton,
    InputAdornment,
    OutlinedInput
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../services/api";
import { toast } from "../helpers/toast";

const ReasonSelectionModal = ({ open, onClose, onConfirm }) => {
    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReasons = async () => {
            try {
                const response = await api.get("/reasons");
                setReasons(response.data);
            } catch (err) {
                toast.error("Erro ao carregar motivos de encerramento");
                console.error("Erro ao carregar motivos de encerramento:", err);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            loadReasons();
        }
    }, [open]);

    const handleConfirm = () => {
        if (selectedReason) {
            onConfirm(selectedReason);
            onClose();
        }
    };

    const handleClearSelection = () => {
        setSelectedReason("");
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Motivo do encerramento</DialogTitle>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <FormControl fullWidth required>
                        <InputLabel id="select-reason-label">Razão</InputLabel>
                        <Select
                            labelId="select-reason-label"
                            value={selectedReason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            input={
                                <OutlinedInput
                                    endAdornment={
                                        selectedReason && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="clear selection"
                                                    onClick={handleClearSelection}
                                                    edge="end"
                                                    style={{ marginRight: 'auto' }}
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                    style={{ paddingRight: 40 }}
                                />
                            }
                        >
                            {reasons.map((reason) => (
                                <MenuItem key={reason.id} value={reason.id.toString()}>
                                    {reason.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    color="primary"
                    disabled={!selectedReason}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReasonSelectionModal;
