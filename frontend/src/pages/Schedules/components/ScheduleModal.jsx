import React, { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useSpring, animated } from "react-spring";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Typography,
  Box,
  FormHelperText,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Paper,
  alpha
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachFile as AttachIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  AccessTime as ClockIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Repeat as RepeatIcon,
  EventRepeat as RecurrenceIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  InsertEmoticon as EmojiIcon,
  AddPhotoAlternate as ImageIcon,
  WhatsApp as WhatsAppIcon
} from "@mui/icons-material";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import { head } from "../../../utils/helpers";
import MessageVariablesPicker from "../../../components/MessageVariablesPicker";
import { ScheduleContactSelect } from "./ScheduleContactSelect";
import { toast } from "../../../helpers/toast";
import moment from "moment";
import "moment/locale/pt-br"; // Importa localização para o moment

moment.locale("pt-br");

// Esquema de validação sem usar 'when'
const validationSchema = Yup.object().shape({
  body: Yup.string()
    .required(i18n.t("schedules.validation.bodyRequired"))
    .min(5, i18n.t("schedules.validation.bodyMinLength")),
  contactId: Yup.mixed()
    .required(i18n.t("schedules.validation.contactRequired")),
  sendAt: Yup.date()
    .min(new Date(), i18n.t("schedules.validation.futureDateRequired"))
    .required(i18n.t("schedules.validation.sendAtRequired")),
  whatsappId: Yup.number()
    .required(i18n.t("schedules.validation.whatsappRequired")),
  recurrence: Yup.object().shape({
    enabled: Yup.boolean(),
    pattern: Yup.string(),
    endDate: Yup.date().nullable()
  })
});

const ScheduleModal = ({
  open,
  onClose,
  scheduleId,
  contactId,
  reload,
  cleanContact,
  initialWhatsAppId // Novo parâmetro opcional para WhatsApp inicial
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const messageInputRef = useRef();
  const attachmentFile = useRef(null);

  // Estados locais
  const [initialValues, setInitialValues] = useState({
    body: "",
    contactId: contactId || "",
    contact: null,
    sendAt: new Date(Date.now() + 30 * 60000), // 30 minutos no futuro
    whatsappId: initialWhatsAppId || "", // Novo campo para WhatsApp
    recurrence: {
      enabled: false,
      pattern: "daily",
      endDate: null
    }
  });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [whatsapps, setWhatsapps] = useState([]); // Estado para armazenar as conexões WhatsApp

  // Animação da entrada do modal
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 280, friction: 20 }
  });

  // Carregar conexões WhatsApp
  useEffect(() => {
    const fetchWhatsapps = async () => {
      try {
        const { data } = await api.get("/whatsapp/");
        // Filtrar apenas as conexões conectadas
        const activeWhatsapps = data.filter(whatsapp => whatsapp.status === "CONNECTED");
        setWhatsapps(activeWhatsapps);

        // Se houver apenas uma conexão, selecioná-la automaticamente
        if (activeWhatsapps.length === 1 && !initialValues.whatsappId) {
          setInitialValues(prev => ({
            ...prev,
            whatsappId: activeWhatsapps[0].id
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error(i18n.t("schedules.toasts.whatsappLoadError"));
      }
    };

    fetchWhatsapps();
  }, []);

  // Carregar dados de agendamento existente
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!scheduleId) return;

      try {
        setInitialLoading(true);
        const { data } = await api.get(`/schedules/${scheduleId}`);

        // Formatar recorrência corretamente
        const recurrenceEnabled = data.recurrenceType !== "none" && !!data.recurrenceType;

        setInitialValues({
          ...data,
          contact: data.contact,
          sendAt: new Date(data.sendAt),
          whatsappId: data.whatsappId || "",
          recurrence: {
            enabled: recurrenceEnabled,
            pattern: recurrenceEnabled ? data.recurrenceType : "daily",
            endDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null
          }
        });
      } catch (err) {
        console.error(err);
        toast.error(i18n.t("schedules.toasts.loadError"));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSchedule();
  }, [scheduleId]);

  // Carregar dados do contato se contactId estiver definido
  useEffect(() => {
    if (contactId) {
      const fetchContact = async () => {
        try {
          const { data } = await api.get(`/contacts/${contactId}`);
          setInitialValues(prev => ({
            ...prev,
            contactId,
            contact: data
          }));
        } catch (err) {
          console.error(err);
          toast.error(i18n.t("schedules.toasts.contactLoadError"));
        }
      };
      fetchContact();
    }
  }, [contactId]);

  // Salvar agendamento
  const handleSaveSchedule = async (values, { setSubmitting, resetForm, setErrors }) => {
    // Validações manuais para recorrência
    const validationErrors = {};

    if (values.recurrence.enabled) {
      // Validar padrão de recorrência
      if (!values.recurrence.pattern) {
        validationErrors["recurrence"] = {
          ...validationErrors["recurrence"],
          pattern: i18n.t("schedules.validation.patternRequired")
        };
      }

      // Validar data final
      if (!values.recurrence.endDate) {
        validationErrors["recurrence"] = {
          ...validationErrors["recurrence"],
          endDate: i18n.t("schedules.validation.endDateRequired")
        };
      } else if (values.recurrence.endDate < values.sendAt) {
        validationErrors["recurrence"] = {
          ...validationErrors["recurrence"],
          endDate: i18n.t("schedules.validation.endDateAfterSendAt")
        };
      }
    }

    // Se houver erros, não prosseguir
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    try {
      setLoading(true);

      // Formatar valores para o formato esperado pela API
      const scheduleData = {
        body: values.body,
        contactId: values.contactId,
        whatsappId: values.whatsappId, // Inclui o ID do WhatsApp na requisição
        sendAt: moment(values.sendAt).format('YYYY-MM-DD HH:mm:ss'),
        recurrenceType: values.recurrence.enabled ? values.recurrence.pattern : 'none',
        recurrenceEndDate: values.recurrence.enabled && values.recurrence.endDate
          ? moment(values.recurrence.endDate).format('YYYY-MM-DD HH:mm:ss')
          : null
      };

      // Incluir campos de mídia se existirem no registro atual
      if (initialValues.mediaPath) {
        scheduleData.mediaPath = initialValues.mediaPath;
      }

      if (initialValues.mediaName) {
        scheduleData.mediaName = initialValues.mediaName;
      }

      // Salvar via API - criar novo ou atualizar existente
      let savedSchedule;
      if (scheduleId) {
        const { data } = await api.put(`/schedules/${scheduleId}`, scheduleData);
        savedSchedule = data;
        toast.success(i18n.t("schedules.toasts.updated"));
      } else {
        const { data } = await api.post("/schedules", scheduleData);
        savedSchedule = data;
        toast.success(i18n.t("schedules.toasts.created"));
      }

      // Upload de arquivo se existir
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);

        try {
          await api.post(
            `/schedules/${savedSchedule.id}/media-upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        } catch (err) {
          console.error('Erro no upload:', err);
          toast.error(i18n.t("schedules.toasts.attachmentError"));
        }
      }

      // Recarregar dados
      if (typeof reload === "function") {
        reload();
      }

      // Limpar contato se necessário
      if (contactId && typeof cleanContact === "function") {
        cleanContact();
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        i18n.t("schedules.toasts.saveError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Manipulação de anexos
  const handleAttachmentFile = e => {
    const file = head(e.target.files);
    if (file) {
      // Validar tamanho do arquivo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(i18n.t("schedules.toasts.fileSizeError"));
        return;
      }
      setAttachment(file);
    }
  };

  const handleDeleteAttachment = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (scheduleId && initialValues.mediaPath) {
      try {
        await api.delete(`/schedules/${scheduleId}/media-upload`);
        setInitialValues(prev => ({ ...prev, mediaPath: null, mediaName: null }));
        toast.success(i18n.t("schedules.toasts.attachmentDeleted"));
      } catch (err) {
        console.error(err);
        toast.error(i18n.t("schedules.toasts.attachmentDeleteError"));
      }
    }
  };

  // Inserir variáveis na mensagem
  const handleClickMessageVar = (msgVar, setFieldValue) => {
    const el = messageInputRef.current;
    if (!el) return;

    const firstHalfText = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos = el.selectionStart + msgVar.length;

    setFieldValue("body", `${firstHalfText}${msgVar}${secondHalfText}`);

    setTimeout(() => {
      messageInputRef.current.focus();
      messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }, 100);
  };

  // Padrões de recorrência traduzidos
  const recurrencePatterns = useMemo(() => [
    { value: "daily", label: i18n.t("schedules.recurrence.daily") },
    { value: "weekly", label: i18n.t("schedules.recurrence.weekly") },
    { value: "biweekly", label: i18n.t("schedules.recurrence.biweekly") },
    { value: "monthly", label: i18n.t("schedules.recurrence.monthly") },
    { value: "quarterly", label: i18n.t("schedules.recurrence.quarterly") },
    { value: "semiannually", label: i18n.t("schedules.recurrence.semiannually") },
    { value: "yearly", label: i18n.t("schedules.recurrence.yearly") }
  ], []);

  // Renderização condicional - loading
  if (initialLoading) {
    return (
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={400}
            flexDirection="column"
            gap={2}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="textSecondary">
              {i18n.t("schedules.loading")}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      scroll="paper"
      PaperProps={{
        component: animated.div,
        style: fadeIn,
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: fullScreen ? "100%" : "auto",
          maxHeight: fullScreen ? "100%" : "90vh"
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          px: { xs: 2, sm: 3 },
          py: 2,
          position: "sticky",
          top: 0,
          zIndex: 1100
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <ScheduleIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {scheduleId
                ? i18n.t("schedules.form.titleEdit")
                : i18n.t("schedules.form.titleAdd")}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            disabled={loading}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={handleSaveSchedule}
        validateOnMount={false}
        validateOnChange={true}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
          handleChange,
          handleBlur,
          isValid
        }) => (
          <Form style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <DialogContent
              dividers
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: theme.palette.background.default,
                overflowY: "auto",
                flex: 1,
                "&::-webkit-scrollbar": {
                  width: "8px",
                  height: "8px"
                },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: "4px",
                  backgroundColor: alpha(theme.palette.primary.main, 0.2)
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3)
                }
              }}
            >
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Contato */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: (touched.contactId && errors.contactId) ?
                        theme.palette.error.main : undefined
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={2}
                    >
                      <PersonIcon
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {i18n.t("schedules.form.contactSection")}
                      </Typography>
                    </Box>

                    <ScheduleContactSelect
                      initialContact={values.contact}
                      onFiltered={(contact) => {
                        setFieldValue("contactId", contact?.id || "");
                        setFieldValue("contact", contact);
                      }}
                    />

                    {touched.contactId && errors.contactId && (
                      <FormHelperText error sx={{ mt: 1 }}>
                        {errors.contactId}
                      </FormHelperText>
                    )}
                  </Paper>
                </Grid>

                {/* Conexão WhatsApp */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: (touched.whatsappId && errors.whatsappId) ?
                        theme.palette.error.main : undefined,
                      height: '100%'
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={2}
                    >
                      <WhatsAppIcon
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {i18n.t("schedules.form.whatsappSection")}
                      </Typography>
                    </Box>

                    <FormControl
                      fullWidth
                      error={touched.whatsappId && Boolean(errors.whatsappId)}
                    >
                      <InputLabel id="whatsapp-select-label">
                        {i18n.t("schedules.form.selectWhatsapp")}
                      </InputLabel>
                      <Select
                        labelId="whatsapp-select-label"
                        id="whatsapp-select"
                        value={values.whatsappId}
                        onChange={(e) => setFieldValue("whatsappId", e.target.value)}
                        label={i18n.t("schedules.form.selectWhatsapp")}
                        sx={{ borderRadius: 2 }}
                        MenuProps={{
                          PaperProps: {
                            style: { maxHeight: isMobile ? 300 : 500 }
                          }
                        }}
                      >
                        {whatsapps.map((whatsapp) => (
                          <MenuItem key={whatsapp.id} value={whatsapp.id}>
                            <Box display="flex" alignItems="center">
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  bgcolor: whatsapp.color || theme.palette.primary.main,
                                  mr: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <WhatsAppIcon sx={{ color: 'white', fontSize: 14 }} />
                              </Box>
                              {whatsapp.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.whatsappId && errors.whatsappId && (
                        <FormHelperText error>
                          {errors.whatsappId}
                        </FormHelperText>
                      )}
                    </FormControl>

                    {whatsapps.length === 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <InfoIcon
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          {i18n.t("schedules.form.noActiveWhatsapp")}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Mensagem */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: (touched.body && errors.body) ?
                        theme.palette.error.main : undefined
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={2}
                    >
                      <MessageIcon
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {i18n.t("schedules.form.messageSection")}
                      </Typography>
                    </Box>

                    <TextField
                      multiline
                      rows={isMobile ? 4 : 5}
                      fullWidth
                      name="body"
                      placeholder={i18n.t("schedules.form.messagePlaceholder")}
                      value={values.body}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.body && Boolean(errors.body)}
                      helperText={touched.body && errors.body}
                      inputRef={messageInputRef}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />

                    <Box
                      mt={2}
                      display="flex"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                        <MessageVariablesPicker
                          onClick={(value) => handleClickMessageVar(value, setFieldValue)}
                        />
                      </Box>

                      <Box display="flex" gap={1}>
                        <Tooltip title={i18n.t("schedules.form.insertEmoji")}>
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                              borderRadius: 1
                            }}
                          >
                            <EmojiIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={i18n.t("schedules.form.uploadImage")}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => attachmentFile.current.click()}
                            disabled={!!attachment || !!initialValues.mediaPath}
                            sx={{
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                              borderRadius: 1
                            }}
                          >
                            <ImageIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Campo de upload oculto */}
                    <input
                      type="file"
                      ref={attachmentFile}
                      style={{ display: "none" }}
                      onChange={handleAttachmentFile}
                      accept="image/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />

                    {/* Mostrar arquivo anexado */}
                    {(attachment || initialValues.mediaPath) && (
                      <Paper
                        variant="outlined"
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          sx={{
                            maxWidth: "calc(100% - 40px)",
                            overflow: "hidden"
                          }}
                        >
                          <AttachIcon
                            color="primary"
                            fontSize="small"
                            sx={{ mr: 1, flexShrink: 0 }}
                          />
                          <Typography variant="body2" noWrap sx={{ textOverflow: "ellipsis" }}>
                            {attachment ? attachment.name : initialValues.mediaName}
                          </Typography>
                        </Box>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleDeleteAttachment}
                          sx={{ ml: 1, flexShrink: 0 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    )}
                  </Paper>
                </Grid>

                {/* Agendamento */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: (touched.sendAt && errors.sendAt) ?
                        theme.palette.error.main : undefined
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={2}
                    >
                      <ClockIcon
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {i18n.t("schedules.form.scheduleSection")}
                      </Typography>
                    </Box>

                    {/* Substituição do DateTimePicker por campo nativo */}
                    <TextField
                      type="datetime-local"
                      fullWidth
                      name="sendAt"
                      label={i18n.t("schedules.form.sendAt")}
                      value={moment(values.sendAt).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        setFieldValue("sendAt", newDate);
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: moment(new Date()).format('YYYY-MM-DDTHH:mm')
                      }}
                      error={touched.sendAt && Boolean(errors.sendAt)}
                      helperText={touched.sendAt && errors.sendAt}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2
                        }
                      }}
                    />

                    <Box mt={2}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        component="div"
                        sx={{
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <HelpIcon
                          fontSize="small"
                          sx={{ mr: 0.5, opacity: 0.7, flexShrink: 0 }}
                        />
                        {i18n.t("schedules.form.sendAtHelp")}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Recorrência */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: (
                        errors?.recurrence?.pattern || errors?.recurrence?.endDate
                      ) ? theme.palette.error.main : undefined
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={2}
                    >
                      <RepeatIcon
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {i18n.t("schedules.form.recurrenceSection")}
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.recurrence.enabled}
                          onChange={(e) => {
                            setFieldValue("recurrence.enabled", e.target.checked);

                            // Se habilitando, definir data final padrão para 30 dias depois
                            if (e.target.checked && !values.recurrence.endDate) {
                              const endDate = new Date(values.sendAt);
                              endDate.setDate(endDate.getDate() + 30);
                              setFieldValue("recurrence.endDate", endDate);
                            }
                          }}
                          color="primary"
                        />
                      }
                      label={i18n.t("schedules.form.enableRecurrence")}
                    />

                    {values.recurrence.enabled && (
                      <Box mt={2} display="flex" flexDirection="column" gap={2}>
                        <FormControl
                          fullWidth
                          error={errors?.recurrence?.pattern ? true : false}
                        >
                          <InputLabel>
                            {i18n.t("schedules.form.recurrencePattern")}
                          </InputLabel>
                          <Select
                            value={values.recurrence.pattern}
                            onChange={(e) => {
                              setFieldValue("recurrence.pattern", e.target.value);
                            }}
                            label={i18n.t("schedules.form.recurrencePattern")}
                            MenuProps={{
                              PaperProps: {
                                sx: { borderRadius: 2 }
                              }
                            }}
                            sx={{ borderRadius: 2 }}
                          >
                            {recurrencePatterns.map(pattern => (
                              <MenuItem key={pattern.value} value={pattern.value}>
                                <Box display="flex" alignItems="center">
                                  <RecurrenceIcon
                                    fontSize="small"
                                    sx={{ mr: 1, opacity: 0.7 }}
                                  />
                                  {pattern.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                          {errors?.recurrence?.pattern && (
                            <FormHelperText error>{errors.recurrence.pattern}</FormHelperText>
                          )}
                        </FormControl>

                        {/* Substituição do DateTimePicker por campo nativo */}
                        <TextField
                          type="datetime-local"
                          fullWidth
                          name="recurrence.endDate"
                          label={i18n.t("schedules.form.recurrenceEndDate")}
                          value={values.recurrence.endDate ? moment(values.recurrence.endDate).format('YYYY-MM-DDTHH:mm') : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null;
                            setFieldValue("recurrence.endDate", newDate);
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            min: moment(values.sendAt).format('YYYY-MM-DDTHH:mm')
                          }}
                          error={errors?.recurrence?.endDate ? true : false}
                          helperText={errors?.recurrence?.endDate || ''}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2
                            }
                          }}
                        />

                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="div"
                          sx={{
                            display: "flex",
                            alignItems: "flex-start"
                          }}
                        >
                          <InfoIcon
                            fontSize="small"
                            sx={{ mr: 0.5, mt: 0.2, opacity: 0.7, flexShrink: 0 }}
                          />
                          <span>{i18n.t("schedules.form.recurrenceHelp")}</span>
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                bgcolor: theme.palette.background.paper,
                position: "sticky",
                bottom: 0,
                zIndex: 1000,
                borderTop: `1px solid ${theme.palette.divider}`,
                flexWrap: "wrap",
                gap: 1,
                justifyContent: isMobile ? "center" : "space-between"
              }}
            >
              <Button
                onClick={onClose}
                color="inherit"
                disabled={loading || isSubmitting}
                startIcon={<CancelIcon />}
                variant="outlined"
                sx={{ borderRadius: 2 }}
                size={isMobile ? "small" : "medium"}
              >
                {i18n.t("schedules.buttons.cancel")}
              </Button>

              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={loading || isSubmitting || !isValid || !values.contactId || !values.body || !values.whatsappId}
                startIcon={loading || isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 }
                }}
                size={isMobile ? "small" : "medium"}
              >
                {scheduleId
                  ? i18n.t("schedules.buttons.save")
                  : i18n.t("schedules.buttons.create")}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

ScheduleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  scheduleId: PropTypes.number,
  contactId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initialWhatsAppId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reload: PropTypes.func,
  cleanContact: PropTypes.func
};

export default ScheduleModal;