import React, { useState, useEffect } from "react";
import {
    FormControl,
    Chip,
    Box,
    Autocomplete,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";
import api from "../services/api";
import { toast } from "../helpers/toast";
import { i18n } from "../translate/i18n";
import BaseModal from "./BaseModal";

const TagsSelectionModal = ({ open, onClose, onConfirm }) => {
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTags = async () => {
            try {
                const response = await api.get("/tags");
                // Garanta que response.data seja um array
                if (Array.isArray(response.data)) {
                    setTags(response.data);
                } else {
                    console.error("Dados retornados não são um array:", response.data);
                    setTags([]); // Define tags como um array vazio em caso de erro
                }
            } catch (err) {
                toast.error("Erro ao carregar tags");
                console.error("Erro ao carregar tags:", err);
                setTags([]); // Define tags como um array vazio em caso de erro
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            loadTags();
            setSelectedTags([]);
        }
    }, [open]);

    const handleConfirm = () => {
        onConfirm(selectedTags);
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
            color: "primary"
        }
    ];

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={i18n.t("ticket.tagModal.title")}
            actions={actions}
            maxWidth="sm"
        >
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <Autocomplete
                        multiple
                        options={Array.isArray(tags) ? tags : []} // Garanta que options seja um array
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                            setSelectedTags(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label={i18n.t("ticket.tagModal.select")}
                                placeholder={i18n.t("ticket.tagModal.placeholder")}
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    key={index}
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    style={{
                                        backgroundColor: option.color || "#7C7C7C",
                                        color: "white"
                                    }}
                                />
                            ))
                        }
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Box
                                    component="span"
                                    sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: "50%",
                                        mr: 1,
                                        display: "inline-block",
                                        bgcolor: option.color || "#7C7C7C"
                                    }}
                                />
                                <Typography variant="body2">{option.name}</Typography>
                            </Box>
                        )}
                    />
                </FormControl>
            )}
        </BaseModal>
    );
};

export default TagsSelectionModal;