import React, { useState, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

// Material UI Components
import {
  Button,
  TextField,
  CircularProgress,
  ListItemText,
  MenuItem,
  Select,
  Alert,
  Typography,
  InputAdornment,
  Box,
  Stack
} from "@mui/material";

// Material UI Icons
import {
  WhatsApp,
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  QueuePlayNext as QueueIcon,
  PhoneInTalk as ConnectionIcon
} from "@mui/icons-material";

// Custom Components
import BaseModal from "../shared/BaseModal";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import ShowTicketOpen from "../ShowTicketOpenModal";

// Contexts, Services & Helpers
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

// Styled Components
const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  }
}));

const StatusText = styled(Typography)(({ theme, online }) => ({
  fontSize: 11,
  color: online ? theme.palette.success.main : theme.palette.error.main,
  marginLeft: theme.spacing(1)
}));

const ConnectionName = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  marginLeft: theme.spacing(1),
  display: "inline-flex",
  alignItems: "center",
  lineHeight: "2"
}));

const ModalContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2)
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  marginTop: theme.spacing(3)
}));

const filter = createFilterOptions({
  trim: true,
});

const NewTicketModal = ({ modalOpen, onClose, initialContact }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [newContact, setNewContact] = useState({});
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [showTicketOpenModal, setShowTicketOpenModal] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");

  const { user } = useContext(AuthContext);
  const { companyId, whatsappId } = user;

  useEffect(() => {
    if (initialContact?.id !== undefined) {
      setOptions([initialContact]);
      setSelectedContact(initialContact);
    }
  }, [initialContact]);

  useEffect(() => {
    setLoading(true);
    if (whatsappId !== null && whatsappId !== undefined) {
      setSelectedWhatsapp(whatsappId);
    }
    if (user?.queues?.length === 1) {
      setSelectedQueue(user?.queues[0]?.id);
    }
    api
      .get(`/whatsapp`, { params: { companyId, session: 0 } })
      .then(({ data }) => setWhatsapps(data))
      .finally(() => setLoading(false));
  }, [companyId, whatsappId, user?.queues]);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchContacts = async () => {
      try {
        const { data } = await api.get("/contacts/list", {
          params: { searchParam },
        });
        setOptions(data);
      } catch (err) {
        toast.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedContact(null);
    setShowTicketOpenModal(false);
    setUserTicketOpen("");
    setQueueTicketOpen("");
  };

  const handleCloseTicketOpenModal = () => {
    setShowTicketOpenModal(false);
  };

  const getConnectionId = (whatsappId) => {
    if (user?.profile === 'user' && user?.whatsapp?.id) {
      return user?.whatsapp?.id;
    }
    return whatsappId;
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    if (selectedWhatsapp === "") {
      toast.error("Selecione uma Conexão");
      return;
    }
  
    setLoading(true);
    try {
      const queueId = selectedQueue !== "" ? selectedQueue : null;
      const whatsappId = selectedWhatsapp !== "" ? selectedWhatsapp : null;
      
      const { data } = await api.post("/tickets", {
        contactId: contactId,
        queueId,
        whatsappId: getConnectionId(whatsappId),
        userId: user?.id,
        status: "open",
      });
  
      // Verificação aprimorada para tickets existentes
      if (data.ticketExists) {
        const ticket = data.ticket;
        
        if (ticket && ticket.userId === user.id) {
          toast.error("Você já possui um atendimento em andamento com este contato!");
          onClose();
          return;
        }
        
        if (ticket && ticket.user && ticket.queue) {
          setUserTicketOpen(ticket.user.name);
          setQueueTicketOpen(ticket.queue.name);
          setShowTicketOpenModal(true);
          return;
        }
      }
  
      // Se chegou aqui, o ticket foi criado com sucesso
      toast.success("Ticket criado com sucesso!");
      onClose(data.ticket);
  
    } catch (err) {
      console.error("Erro ao salvar ticket:", err);
      toast.error(err.response?.data?.error || "Ocorreu um erro ao salvar o ticket!");
    } finally {
      setLoading(false);
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

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
  };

  const handleAddNewContactTicket = (contact) => {
    if (contact && contact.id) {
      // Atualizando o selectedContact para garantir que temos o contato correto
      setSelectedContact(contact);
      handleSaveTicket(contact.id);
    } else {
      toast.error("Não foi possível obter o ID do contato");
    }
  };

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }
    return filtered;
  };

  const renderOptionLabel = (option) => {
    if (option?.number) {
      return `${option?.name} - ${option?.number}`;
    }
    return `${i18n.t("newTicketModal.add")} ${option?.name}`;
  };

  const getStatusConnectionName = (status) => {
    if (status === "CONNECTED") return i18n.t("newTicketModal.statusConnected");
    return i18n.t("newTicketModal.statusDeconnected");
  };

  const getConnectionDefault = (whatsapp) => {
    if (whatsapp?.isDefault)
      return `(${i18n.t("newTicketModal.connectionDefault")})`;
    return null;
  };

  const renderContactSearch = () => {
    if (initialContact?.id !== undefined) return null;

    return (
      <Autocomplete
        fullWidth
        options={options}
        loading={loading}
        clearOnBlur
        autoHighlight
        freeSolo
        clearOnEscape
        getOptionLabel={renderOptionLabel}
        filterOptions={createAddContactOption}
        onChange={handleSelectOption}
        renderInput={(params) => (
          <TextField
            {...params}
            label={i18n.t("newTicketModal.fieldLabel")}
            variant="outlined"
            autoFocus
            onChange={(e) => setSearchParam(e.target.value)}
            onKeyPress={(e) => {
              if (loading || !selectedContact) return;
              if (e.key === "Enter") {
                handleSaveTicket(selectedContact.id);
              }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
    );
  };

  return (
    <>
      {contactModalOpen && (
        <ContactModal
          open={contactModalOpen}
          initialValues={newContact}
          onClose={handleCloseContactModal}
          onSave={handleAddNewContactTicket}
        />
      )}
      
      <ShowTicketOpen
        isOpen={showTicketOpenModal}
        handleClose={handleCloseTicketOpenModal}
        user={userTicketOpen}
        queue={queueTicketOpen}
      />

      <BaseModal
        open={modalOpen}
        onClose={handleClose}
        title={i18n.t("newTicketModal.title")}
        maxWidth="sm"
        fullWidth
      >
        <FormContainer>
          <ModalContent>
            {renderContactSearch()}
            
            <Select
              required
              fullWidth
              displayEmpty
              variant="outlined"
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <QueueIcon color="primary" />
                </InputAdornment>
              }
              renderValue={() => {
                if (selectedQueue === "") {
                  return i18n.t("newTicketModal.queue");
                }
                const queue = user?.queues?.find(q => q?.id === selectedQueue);
                return queue?.name;
              }}
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              {user?.queues?.length > 0 && user?.queues?.map((queue, key) => (
                <MenuItem dense key={key} value={queue?.id}>
                  <ListItemText primary={queue?.name} />
                </MenuItem>
              ))}
            </Select>

            {!!user.whatsapp?.id && user?.profile === 'user' ? (
              <Alert 
                severity="info" 
                icon={<ConnectionIcon />}
              >
                Conexão: <b>{user?.whatsapp?.name}</b>
              </Alert>
            ) : (
              <Select
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedWhatsapp}
                onChange={(e) => setSelectedWhatsapp(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <WhatsApp color="primary" />
                  </InputAdornment>
                }
                renderValue={() => {
                  if (selectedWhatsapp === "") {
                    return i18n.t("newTicketModal.conn");
                  }
                  const whatsapp = whatsapps?.find(w => w?.id === selectedWhatsapp);
                  return whatsapp?.name;
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
              >
                {whatsapps?.length > 0 && whatsapps?.map((whatsapp, key) => (
                  <MenuItem dense key={key} value={whatsapp?.id}>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center">
                          <ConnectionName>
                            {whatsapp?.name}
                            {getConnectionDefault(whatsapp)}
                          </ConnectionName>
                          <StatusText online={whatsapp?.status === "CONNECTED"}>
                            ({getStatusConnectionName(whatsapp?.status)})
                          </StatusText>
                        </Stack>
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
            )}
          </ModalContent>

          <ButtonsContainer>
            <Button
              onClick={handleClose}
              color="secondary"
              disabled={loading}
              variant="outlined"
              startIcon={<CloseIcon />}
            >
              {i18n.t("newTicketModal.buttons.cancel")}
            </Button>
            <ButtonWithSpinner
              variant="contained"
              type="button"
              disabled={!selectedContact}
              onClick={() => handleSaveTicket(selectedContact?.id)}
              loading={loading}
              startIcon={<SaveIcon />}
            >
              {i18n.t("newTicketModal.buttons.ok")}
            </ButtonWithSpinner>
          </ButtonsContainer>
        </FormContainer>
      </BaseModal>
    </>
  );
};

export default NewTicketModal;