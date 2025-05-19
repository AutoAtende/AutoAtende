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
  FormHelperText,
  InputAdornment,
} from "@mui/material";

// Icons
import {
  AttachFile as AttachFileIcon,
  DeleteOutline as DeleteOutlineIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  Info as InfoIcon,
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

// Componente para campos de lista de contatos e tags
const SelectListOrTag = ({ values, errors, touched, setFieldValue, handleChange, contactLists, tagLists, disabled }) => {
  const listSelected = !!values.contactListId;
  const tagSelected = !!values.tagListId;

  return (
    <>
      <Grid item xs={12} md={4}>
        <FormControl
          variant="outlined"
          fullWidth
        >
          <InputLabel id="contactList-selection-label">
            {i18n.t("campaigns.dialog.form.contactList")}
          </InputLabel>
          <Select
            label={i18n.t("campaigns.dialog.form.contactList")}
            labelId="contactList-selection-label"
            id="contactListId"
            name="contactListId"
            value={values.contactListId}
            onChange={(e) => {
              handleChange(e);
              // Se selecionar uma lista, limpa a seleção de tag
              if (e.target.value) {
                setFieldValue("tagListId", "");
              }
            }}
            error={touched.contactListId && Boolean(errors.contactListId)}
            disabled={disabled || tagSelected}
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
          </Select>
          {tagSelected && (
            <FormHelperText>
              {i18n.t("campaigns.dialog.form.disabledByTag")}
            </FormHelperText>
          )}
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
  <Select
    label={i18n.t("campaigns.dialog.form.tagList")}
    labelId="tagList-selection-label"
    id="tagListId"
    name="tagListId"
    value={Array.isArray(values.tagListId) ? values.tagListId : []}
    onChange={(e) => {
      handleChange(e);
      // Se selecionar uma tag, limpa a seleção de lista
      if (e.target.value && e.target.value.length > 0) {
        setFieldValue("contactListId", "");
      }
    }}
    error={touched.tagListId && Boolean(errors.tagListId)}
    disabled={disabled || listSelected}
    multiple
    renderValue={(selected) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((value) => {
          const tagName = tagLists.find(tag => tag.id === value)?.name || value;
          return (
            <Chip key={value} label={tagName} size="small" />
          );
        })}
      </Box>
    )}
    InputLabelProps={{
      shrink: true,
    }}
  >
    {tagLists.map((tagList) => (
      <MenuItem key={tagList.id} value={tagList.id}>
        {tagList.name}
      </MenuItem>
    ))}
  </Select>
  {listSelected && (
    <FormHelperText>
      {i18n.t("campaigns.dialog.form.disabledByList")}
    </FormHelperText>
  )}
</FormControl>
      </Grid>
    </>
  );
};

// Schema de validação
const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("campaigns.validation.nameMin"))
    .max(50, i18n.t("campaigns.validation.nameMax"))
    .required(i18n.t("campaigns.validation.nameRequired")),
  whatsappId: Yup.string()
    .required(i18n.t("campaigns.validation.whatsappRequired")),
  campaignIdentifier: Yup.string()
    .max(50, i18n.t("campaigns.validation.identifierMax")),
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
  tagListId: [],
  fileListId: "",
  userId: "",
  queueId: "",
  statusTicket: "pending",
  openTicket: "disabled",
  campaignIdentifier: "", // Campo para identificador único
};

const CampaignModal = ({ open, onClose, campaignId, onSuccess, duplicateFromId = null }) => {
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
  const [loadingData, setLoadingData] = useState(false);

  // Limpar estado ao fechar o modal
  const resetState = () => {
    setCampaign(initialState);
    setMessageTab(0);
    setAttachment(null);
    setIsSubmitting(false);
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Efeito para abrir/fechar modal
  useEffect(() => {
    if (open) {
      // Reinicializar estado ao abrir o modal para evitar dados de campanhas anteriores
      if (!campaignId && !duplicateFromId) {
        resetState();
      }
    }
  }, [open, campaignId, duplicateFromId]);

  useEffect(() => {
    const fetchResources = async () => {
      if (!open) return;

      try {
        setLoadingData(true);

        // Criar promises para todos os recursos
        const [
          filesResponse,
          contactListsResponse,
          whatsappsResponse,
          tagsResponse,
          usersResponse,
          queuesResponse
        ] = await Promise.all([
          api.get("/files/", { params: { companyId } }),
          api.get(`/contact-lists/list`, { params: { companyId } }),
          api.get(`/whatsapp`, { params: { companyId, session: 0 } }),
          api.get(`/tags`, { params: { companyId } }),
          api.get(`/users/list`, { params: { companyId } }),
          api.get(`/queue`)
        ]);

        if (isMounted.current) {
          setFileList(filesResponse.data.files || []);
          setContactLists(contactListsResponse.data || []);
          setWhatsapps(whatsappsResponse.data || []);

          // Formatar tags
          const formattedTagLists = tagsResponse.data.tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));
          setTagLists(formattedTagLists);

          setUsers(usersResponse.data || []);
          setQueues(queuesResponse.data || []);
        }

        // Se for edição ou duplicação, buscar a campanha
        if (campaignId || duplicateFromId) {
          const targetId = campaignId || duplicateFromId;
          const { data } = await api.get(`/campaigns/${targetId}`);

          if (isMounted.current) {
            const newCampaignData = Object.assign({}, initialState);

            Object.entries(data).forEach(([key, value]) => {
              if (key === "scheduledAt" && value) {
                newCampaignData[key] = moment(value).format("YYYY-MM-DDTHH:mm");
              } else {
                newCampaignData[key] = value === null ? "" : value;
              }
              if (key === "tagListId") {
                // Verificar se temos originalTagListIds para usar no lugar de tagListId
                if (data.originalTagListIds && Array.isArray(data.originalTagListIds)) {
                  newCampaignData[key] = data.originalTagListIds;
                } else if (value !== null) {
                  // Converter para array se for um valor único
                  newCampaignData[key] = Array.isArray(value) ? value : [value];
                } else {
                  newCampaignData[key] = [];
                }
              }
            });

            // Se for duplicação, limpar alguns campos e alterar o nome
            if (duplicateFromId) {
              newCampaignData.id = null;
              newCampaignData.name = `${newCampaignData.name} (cópia)`;
              newCampaignData.status = "INATIVA";
              newCampaignData.mediaPath = null;
              newCampaignData.mediaName = null;

              // Gerar identificador único para a campanha duplicada
              newCampaignData.campaignIdentifier = `${newCampaignData.campaignIdentifier || ''}_copy_${Date.now().toString().substr(-6)}`;
            }

            setCampaign(newCampaignData);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar recursos:", err);
        toast.error(i18n.t("campaigns.toasts.resourcesError"));
      } finally {
        if (isMounted.current) {
          setLoadingData(false);
        }
      }
    };

    if (open) {
      fetchResources();
    }
  }, [campaignId, open, companyId, duplicateFromId]);

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
    if (isSubmitting) return;
    onClose();
    resetState();
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
if (!values.contactListId && (!values.tagListId || values.tagListId.length === 0)) {
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

      // Restante da função permanece igual
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
              : duplicateFromId
                ? i18n.t("campaigns.dialog.duplicate")
                : i18n.t("campaigns.dialog.new")
            : i18n.t("campaigns.dialog.readonly")
        }
        maxWidth="md"
        actions={getModalActions()}
        loading={loadingData}
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
                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={3}>
                  <Field
                    as={TextField}
                    label={i18n.t("campaigns.dialog.form.identifier")}
                    name="campaignIdentifier"
                    error={formikProps.touched.campaignIdentifier && Boolean(formikProps.errors.campaignIdentifier)}
                    helperText={
                      (formikProps.touched.campaignIdentifier && formikProps.errors.campaignIdentifier) ||
                      i18n.t("campaigns.dialog.form.identifierHelp")
                    }
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    disabled={!campaignEditable}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* Contatos e Tags */}
                <SelectListOrTag
                  values={formikProps.values}
                  errors={formikProps.errors}
                  touched={formikProps.touched}
                  setFieldValue={formikProps.setFieldValue}
                  handleChange={formikProps.handleChange}
                  contactLists={contactLists}
                  tagLists={tagLists}
                  disabled={!campaignEditable && campaign.status !== "CANCELADA"}
                />

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
                    disabled={isSubmitting || loadingData}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  >
                    {campaignId
                      ? i18n.t("campaigns.dialog.buttons.edit")
                      : i18n.t("campaigns.dialog.buttons.add")}
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