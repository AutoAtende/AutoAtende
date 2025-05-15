import React, { useState, useEffect, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { useTheme, styled } from "@mui/material/styles";
import { AuthContext } from "../../../context/Auth/AuthContext";
import moment from "moment";
import { head } from "../../../utils/helpers";

// Material UI
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Divider,
  useMediaQuery,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

// Icons
import {
  AttachFile as AttachFileIcon,
  DeleteOutline as DeleteOutlineIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
} from "@mui/icons-material";

// Componentes
import BaseModal from "../../../components/shared/BaseModal";
import ConfirmationModal from "../../../components/ConfirmationModal";
import CampaignWarning from "../components/CampaignWarning";

// API
import api from "../../../services/api";

// Componentes estilizados
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`message-tabpanel-${index}`}
      aria-labelledby={`message-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.background.paper
    : theme.palette.primary.lighter,
  borderRadius: theme.shape.borderRadius,
  '& .MuiTab-root': {
    minHeight: 48,
  },
}));

// Schema de validação
const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("campaigns.validation.nameMin"))
    .max(50, i18n.t("campaigns.validation.nameMax"))
    .required(i18n.t("campaigns.validation.nameRequired")),
  whatsappId: Yup.string()
    .required(i18n.t("campaigns.validation.whatsappRequired")),
});

// Estado inicial
const initialState = {
  name: "",
  message1: "",
  message2: "",
  message3: "",
  message4: "",
  message5: "",
  confirmationMessage1: "",
  confirmationMessage2: "",
  confirmationMessage3: "",
  confirmationMessage4: "",
  confirmationMessage5: "",
  status: "INATIVA", // INATIVA, PROGRAMADA, EM_ANDAMENTO, CANCELADA, FINALIZADA,
  confirmation: false,
  scheduledAt: null,
  whatsappId: "",
  contactListId: "",
  tagListId: "",
  fileListId: "",
  userId: "",
  queueId: "",
  statusTicket: "pending",
  openTicket: "disabled",
};

const CampaignModal = ({ open, onClose, campaignId, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMounted = useRef(true);
  const attachmentFile = useRef(null);
  const { user } = useContext(AuthContext);
  const companyId = user.companyId;

  // Estados
  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [tagLists, setTagLists] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState([]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      if (!open) return;

      const promises = [];
      const controllers = [];

      // Criar AbortController para cada requisição
      const createController = () => {
        const controller = new AbortController();
        controllers.push(controller);
        return controller.signal;
      };

      // Buscar arquivos
      promises.push(
        api.get("/files/", {
          params: { companyId },
          signal: createController()
        })
          .then(({ data }) => {
            setFileList(data.files || []);
          })
          .catch(err => {
            if (!err.name === 'AbortError') {
              console.error("Error fetching files:", err);
              toast.error(i18n.t("campaigns.toasts.filesFetchError"));
            }
          })
      );

      // Buscar listas de contatos
      promises.push(
        api.get(`/contact-lists/list`, {
          params: { companyId },
          signal: createController()
        })
          .then(({ data }) => {
            setContactLists(data || []);
          })
          .catch(err => {
            if (!err.name === 'AbortError') {
              console.error("Error fetching contact lists:", err);
              toast.error(i18n.t("campaigns.toasts.contactListsFetchError"));
            }
          })
      );

      // Buscar conexões do WhatsApp
      promises.push(
        api.get(`/whatsapp`, {
          params: { companyId, session: 0 },
          signal: createController()
        })
          .then(({ data }) => {
            setWhatsapps(data || []);
          })
          .catch(err => {
            if (!err.name === 'AbortError') {
              console.error("Error fetching WhatsApp connections:", err);
              toast.error(i18n.t("campaigns.toasts.whatsappsFetchError"));
            }
          })
      );

      // Buscar tags
      promises.push(
        api.get(`/tags`, {
          params: { companyId },
          signal: createController()
        })
          .then(({ data }) => {
            const formattedTagLists = data.tags.map((tag) => ({
              id: tag.id,
              name: tag.name,
            }));
            setTagLists(formattedTagLists);
          })
          .catch(err => {
            if (!err.name === 'AbortError') {
              console.error("Error retrieving tags:", err);
            }
          })
      );

      promises.push(
        api.get(`/users/list`, {
          params: { companyId },
          signal: createController()
        })
          .then(({ data }) => {
            setUsers(data || []);
          })
          .catch(err => {
            if (!err.name === 'AbortError') {
              console.error("Error fetching users:", err);
            }
          })
      );

      promises.push(
        api.get(`/queue`, {
          signal: createController()
        })
          .then(({ data }) => {
            setQueues(data || []);
          })
          .catch(err => {
            if (!err.name === 'AbortError') {
              console.error("Error fetching queues:", err);
            }
          })
      );

      // Se for edição, buscar a campanha
      if (campaignId) {
        promises.push(
          api.get(`/campaigns/${campaignId}`, {
            signal: createController()
          })
            .then(({ data }) => {
              setCampaign((prev) => {
                let prevCampaignData = Object.assign({}, prev);

                Object.entries(data).forEach(([key, value]) => {
                  if (key === "scheduledAt" && value) {
                    prevCampaignData[key] = moment(value).format("YYYY-MM-DDTHH:mm");
                  } else {
                    prevCampaignData[key] = value === null ? "" : value;
                  }
                });

                return prevCampaignData;
              });
            })
            .catch(err => {
              if (!err.name === 'AbortError') {
                console.error("Error fetching campaign:", err);
                toast.error(i18n.t("campaigns.toasts.campaignFetchError"));
                onClose(); // Fechar modal em caso de erro na busca da campanha
              }
            })
        );
      }

      // Executar todas as promises
      await Promise.allSettled(promises);

      // Retornar função de limpeza para cancelar requisições pendentes
      return () => {
        controllers.forEach(controller => controller.abort());
      };
    };

    const cleanup = fetchResources();

    // Função de limpeza para o useEffect
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn && typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, [campaignId, open, companyId]);

  // Verificar se a campanha é editável
  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "INATIVA" ||
      campaign.status === "CANCELADA" ||
      (campaign.status === "PROGRAMADA" && moreThenAnHour);

    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  // Handlers
  const handleClose = () => {
    onClose();
    setCampaign(initialState);
    setMessageTab(0);
    setAttachment(null);
  };

  const handleTabChange = (event, newValue) => {
    setMessageTab(newValue);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      if (attachmentFile.current) {
        attachmentFile.current.value = null;
      }
    }

    if (campaign.mediaPath) {
      try {
        await api.delete(`/campaigns/${campaign.id}/media-upload`);
        setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
        toast.success(i18n.t("campaigns.toasts.mediaDeleted"));
      } catch (err) {
        toast.error(i18n.t("campaigns.toasts.mediaDeleteError"));
      }
    }

    setConfirmationOpen(false);
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(i18n.t("campaigns.toasts.cancelError"));
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "EM_ANDAMENTO" }));
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(i18n.t("campaigns.toasts.restartError"));
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      setIsSubmitting(true);

      // Validar se tem WhatsApp selecionado
      if (!values.whatsappId) {
        toast.error(i18n.t("campaigns.validation.whatsappRequired"));
        setIsSubmitting(false);
        return;
      }

      // Validar se tem lista de contatos ou tag selecionada
      if (!values.contactListId && !values.tagListId) {
        toast.error(i18n.t("campaigns.validation.contactsRequired"));
        setIsSubmitting(false);
        return;
      }

      // Validar se tem pelo menos uma mensagem preenchida
      const hasMessage = [
        values.message1,
        values.message2,
        values.message3,
        values.message4,
        values.message5
      ].some(msg => msg && msg.trim() !== '');

      if (!hasMessage) {
        toast.error(i18n.t("campaigns.validation.messageRequired"));
        setIsSubmitting(false);
        return;
      }

      // Formatar dados
      const dataValues = {};
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value) {
          dataValues[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });

      // Adicionar companyId
      dataValues.companyId = companyId;

      let campaignResponse;

      try {
        if (campaignId) {
          // Atualizar campanha existente
          const { data } = await api.put(`/campaigns/${campaignId}`, dataValues);
          campaignResponse = data;
        } else {
          // Criar nova campanha
          const { data } = await api.post("/campaigns", dataValues);
          campaignResponse = data;
        }
      } catch (error) {
        console.error("API Error:", error);
        const errorMsg = error.response?.data?.error || i18n.t("campaigns.toasts.saveError");
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Lidar com anexo/mídia
      if (attachment != null && campaignResponse.id) {
        try {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignResponse.id}/media-upload`, formData);
        } catch (mediaError) {
          console.error("Media upload error:", mediaError);
          toast.warning(i18n.t("campaigns.toasts.mediaError"));
          // Continuar mesmo com erro no upload da mídia
        }
      }

      toast.success(i18n.t("campaigns.toasts.success"));

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (err) {
      console.error("Save campaign error:", err);
      toast.error(i18n.t("campaigns.toasts.saveError"));
      setIsSubmitting(false);
    }
  };

  // Renderizar campo de mensagem
  const renderMessageField = (identifier, formikProps) => {
    const { values, touched, errors } = formikProps;
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        multiline
        variant="outlined"
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
        error={touched[identifier] && Boolean(errors[identifier])}
        helperText={
          (touched[identifier] && errors[identifier]) ||
          i18n.t("campaigns.dialog.form.messageHelp")
        }
        InputLabelProps={{
          shrink: true,
        }}
      />
    );
  };

  // Função para renderizar campo de mensagem de confirmação
  const renderConfirmationMessageField = (identifier, formikProps) => {
    const { values, touched, errors } = formikProps;
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        multiline
        variant="outlined"
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.confirmationPlaceholder")}
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
        error={touched[identifier] && Boolean(errors[identifier])}
        helperText={
          (touched[identifier] && errors[identifier]) ||
          i18n.t("campaigns.dialog.form.confirmationHelp")
        }
        InputLabelProps={{
          shrink: true,
        }}
      />
    );
  };

  // Ações disponíveis para o Modal
  const getModalActions = () => {
    const actions = [];

    // Botão de cancelar campanha (se estiver em andamento)
    if (campaign.status === "EM_ANDAMENTO") {
      actions.push({
        label: i18n.t("campaigns.dialog.buttons.cancel"),
        onClick: cancelCampaign,
        variant: "outlined",
        color: "error",
        disabled: isSubmitting,
      });
    }

    // Botão de reiniciar campanha (se estiver cancelada)
    if (campaign.status === "CANCELADA") {
      actions.push({
        label: i18n.t("campaigns.dialog.buttons.restart"),
        onClick: restartCampaign,
        variant: "outlined",
        color: "success",
        disabled: isSubmitting,
      });
    }

    // Botão de adicionar anexo
    if (!attachment && !campaign.mediaPath && campaignEditable) {
      actions.push({
        label: i18n.t("campaigns.dialog.buttons.attach"),
        onClick: () => attachmentFile.current.click(),
        variant: "outlined",
        color: "primary",
        disabled: isSubmitting,
        icon: <AttachFileIcon />,
      });
    }

    // Botão de fechar
    actions.push({
      label: i18n.t("campaigns.dialog.buttons.close"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      disabled: isSubmitting,
    });

    return actions;
  };

  return (
    <>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteMediaTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <div style={{ display: "none" }}>
        <input
          type="file"
          ref={attachmentFile}
          onChange={handleAttachmentFile}
        />
      </div>

      <BaseModal
        open={open}
        onClose={handleClose}
        title={
          campaignEditable
            ? campaignId
              ? i18n.t("campaigns.dialog.update")
              : i18n.t("campaigns.dialog.new")
            : i18n.t("campaigns.dialog.readonly")
        }
        maxWidth="md"
        actions={getModalActions()}
        loading={isSubmitting}
      >
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            handleSaveCampaign(values);
          }}
        >
          {(formikProps) => (
            <Form>
              <Box sx={{ mb: 3, mt: 2 }}>
                <CampaignWarning />
              </Box>

              <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                <Grid item xs={12} md={9}>
                  <Field
                    as={TextField}
                    label={i18n.t("campaigns.dialog.form.name")}
                    name="name"
                    error={formikProps.touched.name && Boolean(formikProps.errors.name)}
                    helperText={formikProps.touched.name && formikProps.errors.name}
                    variant="outlined"
                    fullWidth
                    disabled={!campaignEditable}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="confirmation-selection-label">
                      {i18n.t("campaigns.dialog.form.confirmation")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.confirmation")}
                      labelId="confirmation-selection-label"
                      id="confirmation"
                      name="confirmation"
                      error={formikProps.touched.confirmation && Boolean(formikProps.errors.confirmation)}
                      disabled={!campaignEditable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value={false}>{i18n.t("campaigns.dialog.form.disabled")}</MenuItem>
                      <MenuItem value={true}>{i18n.t("campaigns.dialog.form.enabled")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="contactList-selection-label">
                      {i18n.t("campaigns.dialog.form.contactList")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.contactList")}
                      labelId="contactList-selection-label"
                      id="contactListId"
                      name="contactListId"
                      error={formikProps.touched.contactListId && Boolean(formikProps.errors.contactListId)}
                      disabled={!campaignEditable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="">{i18n.t("campaigns.dialog.form.none")}</MenuItem>
                      {contactLists.map((contactList) => (
                        <MenuItem key={contactList.id} value={contactList.id}>
                          {contactList.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="tagList-selection-label">
                      {i18n.t("campaigns.dialog.form.tagList")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.tagList")}
                      labelId="tagList-selection-label"
                      id="tagListId"
                      name="tagListId"
                      error={formikProps.touched.tagListId && Boolean(formikProps.errors.tagListId)}
                      disabled={!campaignEditable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="">{i18n.t("campaigns.dialog.form.none")}</MenuItem>
                      {tagLists.map((tagList) => (
                        <MenuItem key={tagList.id} value={tagList.id}>
                          {tagList.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="whatsapp-selection-label" required>
                      {i18n.t("campaigns.dialog.form.whatsapp")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.whatsapp")}
                      labelId="whatsapp-selection-label"
                      id="whatsappId"
                      name="whatsappId"
                      error={formikProps.touched.whatsappId && Boolean(formikProps.errors.whatsappId)}
                      disabled={!campaignEditable}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="">{i18n.t("campaigns.dialog.form.none")}</MenuItem>
                      {whatsapps.map((whatsapp) => (
                        <MenuItem key={whatsapp.id} value={whatsapp.id}>
                          {whatsapp.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>


                <Grid item xs={12} md={6}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="user-selection-label">
                      {i18n.t("campaigns.dialog.form.user")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.user")}
                      labelId="user-selection-label"
                      id="userId"
                      name="userId"
                      disabled={!campaignEditable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="">{i18n.t("campaigns.dialog.form.none")}</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="queue-selection-label">
                      {i18n.t("campaigns.dialog.form.queue")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.queue")}
                      labelId="queue-selection-label"
                      id="queueId"
                      name="queueId"
                      disabled={!campaignEditable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="">{i18n.t("campaigns.dialog.form.none")}</MenuItem>
                      {queues.map((queue) => (
                        <MenuItem key={queue.id} value={queue.id}>
                          {queue.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="openTicket-selection-label">
                      {i18n.t("campaigns.dialog.form.openTicket")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.openTicket")}
                      labelId="openTicket-selection-label"
                      id="openTicket"
                      name="openTicket"
                      disabled={!campaignEditable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="disabled">{i18n.t("campaigns.dialog.form.disabled")}</MenuItem>
                      <MenuItem value="enabled">{i18n.t("campaigns.dialog.form.enabled")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    disabled={formikProps.values.openTicket === "disabled"}
                  >
                    <InputLabel id="statusTicket-selection-label">
                      {i18n.t("campaigns.dialog.form.statusTicket")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.statusTicket")}
                      labelId="statusTicket-selection-label"
                      id="statusTicket"
                      name="statusTicket"
                      disabled={!campaignEditable || formikProps.values.openTicket === "disabled"}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="pending">{i18n.t("campaigns.dialog.form.pending")}</MenuItem>
                      <MenuItem value="open">{i18n.t("campaigns.dialog.form.open")}</MenuItem>
                      <MenuItem value="closed">{i18n.t("campaigns.dialog.form.closed")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("campaigns.dialog.form.scheduledAt")}
                    name="scheduledAt"
                    error={formikProps.touched.scheduledAt && Boolean(formikProps.errors.scheduledAt)}
                    helperText={formikProps.touched.scheduledAt && formikProps.errors.scheduledAt}
                    variant="outlined"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    disabled={!campaignEditable}
                    value={formikProps.values.scheduledAt || ""}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    variant="outlined"
                    fullWidth
                  >
                    <InputLabel id="fileList-selection-label">
                      {i18n.t("campaigns.dialog.form.fileList")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.fileList")}
                      labelId="fileList-selection-label"
                      id="fileListId"
                      name="fileListId"
                      disabled={!campaignEditable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      <MenuItem value="">{i18n.t("campaigns.dialog.form.none")}</MenuItem>
                      {fileList.map((file) => (
                        <MenuItem key={file.id} value={file.id}>
                          {file.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Abas de mensagens */}
              <Box sx={{ mb: 2 }}>
                <StyledTabs
                  value={messageTab}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : "false"}
                  indicatorColor="primary"
                  textColor="primary"
                  centered={!isMobile}
                >
                  <Tab label={i18n.t("campaigns.dialog.tabs.message1")} />
                  <Tab label={i18n.t("campaigns.dialog.tabs.message2")} />
                  <Tab label={i18n.t("campaigns.dialog.tabs.message3")} />
                  <Tab label={i18n.t("campaigns.dialog.tabs.message4")} />
                  <Tab label={i18n.t("campaigns.dialog.tabs.message5")} />
                </StyledTabs>
              </Box>

              {/* Painéis de mensagens */}
              <TabPanel value={messageTab} index={0}>
                {formikProps.values.confirmation ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      {renderMessageField("message1", formikProps)}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderConfirmationMessageField("confirmationMessage1", formikProps)}
                    </Grid>
                  </Grid>
                ) : (
                  renderMessageField("message1", formikProps)
                )}
              </TabPanel>

              <TabPanel value={messageTab} index={1}>
                {formikProps.values.confirmation ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      {renderMessageField("message2", formikProps)}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderConfirmationMessageField("confirmationMessage2", formikProps)}
                    </Grid>
                  </Grid>
                ) : (
                  renderMessageField("message2", formikProps)
                )}
              </TabPanel>

              <TabPanel value={messageTab} index={2}>
                {formikProps.values.confirmation ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      {renderMessageField("message3", formikProps)}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderConfirmationMessageField("confirmationMessage3", formikProps)}
                    </Grid>
                  </Grid>
                ) : (
                  renderMessageField("message3", formikProps)
                )}
              </TabPanel>

              <TabPanel value={messageTab} index={3}>
                {formikProps.values.confirmation ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      {renderMessageField("message4", formikProps)}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderConfirmationMessageField("confirmationMessage4", formikProps)}
                    </Grid>
                  </Grid>
                ) : (
                  renderMessageField("message4", formikProps)
                )}
              </TabPanel>

              <TabPanel value={messageTab} index={4}>
                {formikProps.values.confirmation ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      {renderMessageField("message5", formikProps)}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderConfirmationMessageField("confirmationMessage5", formikProps)}
                    </Grid>
                  </Grid>
                ) : (
                  renderMessageField("message5", formikProps)
                )}
              </TabPanel>

              {/* Exibição de anexo */}
              {(campaign.mediaPath || attachment) && (
                <Box sx={{ mt: 2, p: 1, border: 1, borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachFileIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      {attachment != null ? attachment.name : campaign.mediaName}
                    </Typography>
                  </Box>

                  {campaignEditable && (
                    <IconButton
                      onClick={() => setConfirmationOpen(true)}
                      color="error"
                      size="small"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
                </Box>
              )}

              {/* Botão de salvar */}
              {(campaignEditable || campaign.status === "CANCELADA") && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={<SaveIcon />}
                  >
                    {campaignId
                      ? i18n.t("campaigns.dialog.buttons.edit")
                      : i18n.t("campaigns.dialog.buttons.add")}
                    {isSubmitting && (
                      <CircularProgress size={24} sx={{ ml: 1 }} />
                    )}
                  </Button>
                </Box>
              )}
            </Form>
          )}
        </Formik>
      </BaseModal>
    </>
  );
};

export default CampaignModal;