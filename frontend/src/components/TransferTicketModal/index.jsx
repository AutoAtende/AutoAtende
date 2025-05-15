import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  Grid, 
  ListItemText, 
  Typography, 
  CircularProgress
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { toast } from "../../helpers/toast";
import useQueues from "../../hooks/useQueues";
import { AuthContext } from "../../context/Auth/AuthContext";
import BaseModal from "../shared/BaseModal";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
  online: {
    fontSize: 11,
    color: "#25d366",
  },
  offline: {
    fontSize: 11,
    color: "#e1306c",
  },
  contentContainer: {
    marginTop: theme.spacing(2)
  }
}));

const filterOptions = createFilterOptions({
  trim: true,
});

const TransferTicketModal = ({ modalOpen, onClose, ticketid, contactId }) => {
  const classes = useStyles();
  const history = useHistory();
  const [options, setOptions] = useState([]);
  const [queues, setQueues] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const { findAll: findAllQueues } = useQueues();
  const isMounted = useRef(true);
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const { user } = useContext(AuthContext);
  const { companyId, whatsappId } = user;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => setWhatsapps(data));
      };

      if (whatsappId !== null && whatsappId !== undefined) {
        setSelectedWhatsapp(whatsappId);
      }

      if (user.queues.length === 1) {
        setSelectedQueue(user.queues[0].id);
      }
      fetchContacts();
      setLoading(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setAllQueues(list);
        setQueues(list);
      };
      loadQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toast.error(err);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedUser(null);
  };

  const getConnectionId = (whatsappId) => {
    if (user?.profile === 'user' && user?.whatsapp?.id) {
      return user?.whatsapp?.id;
    }
    return whatsappId;
  };

  const handleSaveTicket = async () => {
    if (!ticketid) return;
    if (!selectedQueue || selectedQueue === "") return;
    setLoading(true);
    try {
      let data = {};

      if (selectedUser) {
        data.userId = selectedUser.id;
      }

      if (selectedQueue && selectedQueue !== null) {
        data.queueId = selectedQueue;

        if (!selectedUser) {
          data.status = "pending";
          data.userId = null;
        }
      }

      if (selectedWhatsapp) {
        data.whatsappId = getConnectionId(selectedWhatsapp);
      }

      Object.assign(data, { isTransfer: true });
      Object.assign(data, { contactId });

      await api.put(`/tickets/${ticketid}`, data);

      history.push(`/tickets`);
    } catch (err) {
      setLoading(false);
      toast.error(err);
    }
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

  // Definindo as ações para o BaseModal
  const modalActions = [
    {
      label: i18n.t("transferTicketModal.buttons.cancel"),
      onClick: handleClose,
      color: "secondary",
      variant: "outlined",
      disabled: loading
    },
    {
      label: i18n.t("transferTicketModal.buttons.ok"),
      onClick: handleSaveTicket,
      color: "primary",
      variant: "contained",
      disabled: loading
    }
  ];

  return (
    <BaseModal
      open={modalOpen}
      onClose={handleClose}
      title={i18n.t("transferTicketModal.title")}
      actions={modalActions}
      loading={loading}
      maxWidth="md"
    >
      <div className={classes.contentContainer}>
        <Autocomplete
          style={{ width: '100%', marginBottom: 20 }}
          getOptionLabel={(option) => option?.name || ""}
          onChange={(e, newValue) => {
            setSelectedUser(newValue);
            if (newValue && Array.isArray(newValue.queues)) {
              setQueues(newValue.queues);
            } else {
              setQueues(allQueues);
              setSelectedQueue("");
            }
          }}
          options={options || []}
          filterOptions={filterOptions}
          freeSolo
          autoHighlight
          noOptionsText={i18n.t("transferTicketModal.noOptions")}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={i18n.t("transferTicketModal.fieldLabel")}
              variant="outlined"
              autoFocus
              onChange={(e) => setSearchParam(e.target.value)}
              InputProps={{
                ...params.InputProps,
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
        <FormControl variant="outlined" className={classes.maxWidth}>
          <InputLabel>
            {i18n.t("transferTicketModal.fieldQueueLabel")}
          </InputLabel>
          <Select
            value={selectedQueue}
            onChange={(e) => setSelectedQueue(e.target.value)}
            label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
          >
            {queues.map((queue) => (
              <MenuItem key={queue.id} value={queue.id}>
                {queue.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* CONEXAO */}
        <Grid container spacing={2} style={{ marginTop: "15px" }}>
          <Grid xs={12} item>
            {!!user.whatsapp?.id && user?.profile === 'user' ? (
              <Alert severity="info" icon={false}>Conexão: <b>{user?.whatsapp?.name}</b></Alert>
            ) :
              <>
                <Select
                  required
                  fullWidth
                  displayEmpty
                  variant="outlined"
                  value={selectedWhatsapp}
                  onChange={(e) => {
                    setSelectedWhatsapp(e.target.value);
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
                  renderValue={() => {
                    if (selectedWhatsapp === "") {
                      return i18n.t("transferTicketModal.fieldConnectionSelect");
                    }
                    const whatsapp = whatsapps.find(
                      (w) => w.id === selectedWhatsapp
                    );
                    return whatsapp?.name;
                  }}
                >
                  {whatsapps?.length > 0 &&
                    whatsapps.map((whatsapp, key) => (
                      <MenuItem dense key={key} value={whatsapp.id}>
                        <ListItemText
                          primary={
                            <>
                              {/* {IconChannel(whatsapp.channel)} */}
                              <Typography
                                component="span"
                                style={{
                                  fontSize: 14,
                                  marginLeft: "10px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  lineHeight: "2",
                                }}
                              >
                                {whatsapp?.name}
                                {getConnectionDefault(whatsapp)} &nbsp;{" "}
                                <p
                                  className={
                                    whatsapp?.status === "CONNECTED"
                                      ? classes.online
                                      : classes.offline
                                  }
                                >
                                  ({getStatusConnectionName(whatsapp?.status)})
                                </p>
                              </Typography>
                            </>
                          }
                        />
                      </MenuItem>
                    ))}
                </Select>
              </>
            }
          </Grid>
        </Grid>
      </div>
    </BaseModal>
  );
};

export default TransferTicketModal;