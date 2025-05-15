import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import CircularProgress from "@mui/material/CircularProgress";
import { Typography } from '@mui/material';
import ForwardIcon from '@mui/icons-material/Forward';
import ContactsIcon from '@mui/icons-material/Contacts';
import Tooltip from "@mui/material/Tooltip";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";

const ForwardMessageModal = ({ messages, onClose, modalOpen }) => {
    const [optionsContacts, setOptionsContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);
    const [newContact, setNewContact] = useState({});
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const [sending, setSending] = useState(false);
    const [messageSending, setMessageSending] = useState('');
    const history = useHistory();

    // Função para buscar contatos
    const fetchContacts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/contacts", {
                params: { searchParam }
            });
            setOptionsContacts(data.contacts);
        } catch (err) {
            toast.error("Erro ao carregar contatos: " + err);
        } finally {
            setLoading(false);
        }
    };

    // Carrega contatos iniciais ao abrir o modal
    useEffect(() => {
        if (modalOpen) {
            fetchContacts();
        }
    }, [modalOpen]);

    // Atualiza lista quando usuário digita
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (modalOpen && searchParam.length >= 3) {
                fetchContacts();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchParam, modalOpen]);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleForwardMessage = async (contact) => {
        if (!contact) {
            toast.error("Selecione um contato para encaminhar");
            return;
        }

        setSending(true);
        const filtered = [...new Set(messages.map(m => m.id))].map(id => 
            messages.find(m => m.id === id)
        );

        try {
            for (const message of filtered) {
                setMessageSending(message.id);
                await api.post('/message/forward', {
                    messageId: message.id, 
                    contactId: contact.id
                });
                await sleep(900);
            }
            toast.success("Mensagens encaminhadas com sucesso!");
            history.push('/tickets');
            handleClose();
        } catch (error) {
            toast.error("Erro ao encaminhar mensagens: " + error);
        } finally {
            setSending(false);
        }
    };

    const handleSelectOption = (e, newValue) => {
        if (newValue?.number) {
            setSelectedContact(newValue);
        } else if (newValue?.name) {
            setNewContact({ name: newValue.name });
            setContactModalOpen(true);
        }
    };

    const handleClose = () => {
        onClose();
        setSearchParam("");
        setSelectedContact(null);
        setSending(false);
        setOptionsContacts([]);
    };

    const filter = createFilterOptions({
        trim: true,
        limit: 10,
    });

    const renderOption = (props, option) => (
        <li {...props}>
            <ContactsIcon sx={{ mr: 1 }} />
            {option.number ? 
                `${option.name} - ${option.number}` : 
                `Criar contato: ${option.name}`
            }
        </li>
    );

    return (
        <>
            <ContactModal
                open={contactModalOpen}
                initialValues={newContact}
                onClose={() => setContactModalOpen(false)}
                onSave={(savedContact) => {
                    setSelectedContact(savedContact);
                    setContactModalOpen(false);
                }}
            />
            <Dialog 
                open={modalOpen} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {i18n.t("forwardModal.title")}
                </DialogTitle>
                <DialogContent dividers>
                    <Autocomplete
                        value={selectedContact}
                        onChange={handleSelectOption}
                        options={optionsContacts}
                        loading={loading}
                        fullWidth
                        clearOnBlur
                        autoHighlight
                        freeSolo
                        clearOnEscape
                        getOptionLabel={(option) => 
                            option.number ? `${option.name} - ${option.number}` : option.name
                        }
                        renderOption={renderOption}
                        filterOptions={(options, params) => {
                            const filtered = filter(options || [], params);
                            if (params.inputValue !== "" && !loading) {
                              filtered.push({
                                name: params.inputValue,
                                isNew: true,
                              });
                            }
                            return filtered;
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={i18n.t("forwardModal.fieldLabel")}
                                variant="outlined"
                                autoFocus
                                onChange={(e) => setSearchParam(e.target.value)}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading && (
                                                <CircularProgress color="inherit" size={20} />
                                            )}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    {sending && (
                        <Typography variant="body2" color="textSecondary">
                            Enviando mensagem {messageSending}...
                        </Typography>
                    )}
                    <Button
                        onClick={handleClose}
                        color="secondary"
                        disabled={sending}
                        variant="outlined"
                    >
                        {i18n.t("forwardModal.buttons.cancel")}
                    </Button>
                    <Tooltip title={i18n.t("forwardModal.buttons.forward")}>
                        <span>
                            <ButtonWithSpinner
                                variant="contained"
                                type="button"
                                disabled={!selectedContact || sending}
                                onClick={() => handleForwardMessage(selectedContact)}
                                color="primary"
                                loading={sending}
                                startIcon={<ForwardIcon />}
                            >
                                {i18n.t("forwardModal.buttons.forward")}
                            </ButtonWithSpinner>
                        </span>
                    </Tooltip>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ForwardMessageModal;