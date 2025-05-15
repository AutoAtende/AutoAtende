import React, { useContext, useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../helpers/toast";
import { styled } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  FormHelperText,
  Alert,
  Chip,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  MicNone as MicIcon,
  Stop as StopIcon,
  AttachFileOutlined as AttachFileOutlinedIcon,
} from "@mui/icons-material";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import MicRecorder from "../../helpers/mic-recorder/mic-recorder";
import BaseModal from "../BaseModal";
import BaseButton from "../BaseButton";

// Estilos com MUI 5 styled
const BtnWrapper = styled('div')({
  position: "relative",
});

const ButtonProgress = styled(CircularProgress)(({ theme }) => ({
  color: green[500],
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: -12,
  marginLeft: -12,
}));

const MultFieldLine = styled('div')(({ theme }) => ({
  display: "flex",
  "& > *:not(:last-child)": {
    marginRight: theme.spacing(1),
  },
}));

const PaperContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
  gap: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
  },
}));

const VariableContainer = styled('section')(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(1.5),
}));

const MessageInfoContainer = styled('section')(({ theme }) => ({
  position: "relative",
  top: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
}));

const AttachmentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const AttachmentContainer = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const QuickMessageSchema = Yup.object().shape({
  shortcode: Yup.string().required("Obrigatório"),
  message: Yup.string(),
});

const QuickMessageDialog = ({
  open,
  onClose,
  quickMessageId,
  reload,
  setMakeRequest,
}) => {
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const initialState = {
    shortcode: "",
    message: "",
    geral: false,
    status: true,
  };

  const [quickMessage, setQuickMessage] = useState(initialState);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);

  const messageInputRef = useRef(null);
  const attachmentFile = useRef(null);
  const recorderRef = useRef(null);

  const handleButtonClick = () => {
    // Focar no campo de texto quando o botão for clicado
    messageInputRef.current && messageInputRef.current.focus();
  };

  const getQuickMessage = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/quick-messages/${quickMessageId}`);
      setQuickMessage(data);
      setLoading(false);
    } catch (err) {
      toast.error(err);
      setLoading(false);
    }
  };

  // Função para obter a variável correta com base no campo
  const getVariableToAdd = (field) => {
    switch (field) {
      case "first_name":
        return "{primeiro_nome}";
      case "complete_name":
        return "{nome_completo}";
      case "greeting":
        return "{saudacao}";
      case "protocolNumber":
        return "{protocolo}";
      case "date":
        return "{data}";
      case "hour":
        return "{hora}";
      default:
        return "";
    }
  };

  const onHandleClickAddVariableText = ({ field, setValues, values }) => {
    const textarea = document.getElementById("textarea_info");

    if (textarea) {
      const { selectionStart, selectionEnd } = textarea;
      const variableToAdd = getVariableToAdd(field);
      const currentValue = values.message || "";

      const updatedValue =
        currentValue.substring(0, selectionStart) +
        variableToAdd +
        currentValue.substring(selectionEnd);

      setValues({
        ...values,
        message: updatedValue,
      });

      setTimeout(() => {
        // Defina a posição do cursor após a variável adicionada
        const newCursorPosition = selectionStart + variableToAdd.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    } else {
      setValues({
        ...values,
        message: (values.message || "") + getVariableToAdd(field),
      });
    }

    handleButtonClick();
  };

  useEffect(() => {
    if (quickMessageId) {
      getQuickMessage();
    }
  }, [quickMessageId]);

  useEffect(() => {
    const recorder = new MicRecorder({ bitRate: 128 });
    recorderRef.current = recorder;

    return () => {
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
    };
  }, []);

  const handleClose = () => {
    setQuickMessage(initialState);
    setAttachment(null);
    setAudioBlob(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaType('file');
      setAttachment(file);
    }
  };

  const saveMedia = async (attachment, audioBlob, data) => {
    if (attachment || audioBlob) {
      const formData = new FormData();
      formData.append("typeArch", "quickMessage");
      
      if (attachment) {
        formData.append("file", attachment);
      } else if (audioBlob) {
        formData.append("file", audioBlob, "audio.mp3");
      }
      
      await api.post(`/quick-messages/${data?.id}/media-upload`, formData);
    }
  };

  const handleSaveQuickMessage = async (values, actions) => {
    try {
      setLoading(true);
      const mediaPath = attachment?.name || quickMessage?.mediaPath;
      
      const quickMessageData = {
        ...values,
        isMedia: (!!audioBlob || attachment || mediaPath) ? true : false,
        mediaPath: !!audioBlob ? "audio.mp3" : mediaPath ? mediaPath : null,
        mediaType: mediaType || quickMessage?.mediaType,
        mediaName: values?.mediaName || attachment?.name || quickMessage?.mediaName || mediaPath || 'Arquivo de mídia',
      };
      
      let data;
      
      if (quickMessageId) {
        const response = await api.put(
          `/quick-messages/${quickMessageId}`,
          quickMessageData
        );
        data = response.data;
      } else {
        const response = await api.post("/quick-messages", quickMessageData);
        data = response.data;
      }
      
      await saveMedia(attachment, audioBlob, data);
      
      toast.success(i18n.t("quickMessages.toasts.success"));
      
      if (setMakeRequest) {
        setMakeRequest(Math.random());
      }
      
      if (typeof reload === "function") {
        reload();
      }
      
      setLoading(false);
      handleClose();
    } catch (err) {
      setLoading(false);
      toast.error(err);
      actions.setSubmitting(false);
    }
  };

  const deleteMedia = async () => {
    if (attachment || audioBlob) {
      setAttachment(null);
      setAudioBlob(null);
      if (attachmentFile.current) {
        attachmentFile.current.value = null;
      }
    }

    if (quickMessage.mediaPath) {
      try {
        setLoading(true);
        await api.delete(`/quick-messages/${quickMessage.id}/media-upload`);
        setQuickMessage((prev) => ({ ...prev, mediaPath: null, mediaType: null, mediaName: null }));
        toast.success(i18n.t("quickMessages.toasts.deleted"));
        
        if (typeof reload === "function") {
          reload();
        }
        
        if (setMakeRequest) {
          setMakeRequest(Math.random());
        }
        
      } catch (error) {
        toast.error(error.message || "Erro ao excluir mídia");
      } finally {
        setLoading(false);
      }
    }
    
    setConfirmationOpen(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setMediaType('audio');
    recorderRef.current.start().catch((e) => {
      console.error(e);
      setIsRecording(false);
      toast.error("Erro ao iniciar a gravação");
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    recorderRef.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        setAudioBlob(blob);
        setMediaType('audio');
      })
      .catch((e) => {
        console.error(e);
        toast.error("Erro ao finalizar a gravação");
      });
  };

  const modalActions = [
    {
      label: i18n.t("quickMessages.buttons.cancel"),
      onClick: handleClose,
      color: "secondary",
      variant: "outlined",
      disabled: loading
    },
    {
      label: quickMessageId
        ? i18n.t("quickMessages.buttons.edit")
        : i18n.t("quickMessages.buttons.add"),
      onClick: null, // Será tratado pelo formulário
      color: "primary",
      variant: "contained",
      disabled: loading,
      type: "submit"
    }
  ];

  return (
    <>
      {confirmationOpen && (
        <ConfirmationModal
          title={i18n.t("quickMessages.confirmationModal.deleteTitle")}
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={deleteMedia}
        >
          {i18n.t("quickMessages.confirmationModal.deleteMessage")}
        </ConfirmationModal>
      )}
      
      <BaseModal
        open={open}
        onClose={handleClose}
        title={
          quickMessageId
            ? i18n.t("quickMessages.dialog.edit")
            : i18n.t("quickMessages.dialog.add")
        }
        loading={loading}
      >
        <Formik
          initialValues={quickMessage}
          enableReinitialize={true}
          validationSchema={QuickMessageSchema}
          onSubmit={(values, actions) => {
            handleSaveQuickMessage(values, actions);
          }}
        >
          {({ touched, errors, isSubmitting, values, setValues }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert
                    icon={false}
                    color="info"
                    severity="info"
                    sx={{ mb: 2 }}
                  >
                    Se você anexar um arquivo ou gravar um áudio, o campo de texto
                    para a resposta se torna opcional.
                  </Alert>
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label={i18n.t("quickMessages.dialog.shortcode")}
                    name="shortcode"
                    error={touched.shortcode && Boolean(errors.shortcode)}
                    helperText={touched.shortcode && errors.shortcode}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label={i18n.t("quickMessages.dialog.message")}
                    name="message"
                    multiline
                    rows={5}
                    error={touched.message && Boolean(errors.message)}
                    helperText={touched.message && errors.message}
                    variant="outlined"
                    fullWidth
                    inputRef={messageInputRef}
                    id="textarea_info"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <VariableContainer>
                    <PaperContainer>
                      <Chip
                        label="Primeiro nome"
                        onClick={() =>
                          onHandleClickAddVariableText({
                            field: "first_name",
                            setValues,
                            values,
                          })
                        }
                        color="primary"
                      />
                      <Chip
                        label="Nome completo"
                        onClick={() =>
                          onHandleClickAddVariableText({
                            field: "complete_name",
                            setValues,
                            values,
                          })
                        }
                        color="primary"
                      />
                      <Chip
                        label="Saudação"
                        onClick={() =>
                          onHandleClickAddVariableText({
                            field: "greeting",
                            setValues,
                            values,
                          })
                        }
                        color="primary"
                      />
                      <Chip
                        label="Data"
                        onClick={() =>
                          onHandleClickAddVariableText({
                            field: "date",
                            setValues,
                            values,
                          })
                        }
                        color="primary"
                      />
                      <Chip
                        label="Hora"
                        onClick={() =>
                          onHandleClickAddVariableText({
                            field: "hour",
                            setValues,
                            values,
                          })
                        }
                        color="primary"
                      />
                    </PaperContainer>
                  </VariableContainer>
                </Grid>
                
                <Grid item xs={12}>
                  <MessageInfoContainer>
                    <Alert severity="info" icon={false}>
                      Fique atento: ao usar as variáveis <b>"Primeiro nome"</b>{" "}
                      e <b>"Nome completo"</b>, caso o contato não tenha um nome
                      definido, o número do contato será utilizado no lugar. A
                      variável "Saudação" enviará "Bom dia", "Boa tarde" ou "Boa
                      noite", de acordo com o horário em que a mensagem for
                      enviada.
                    </Alert>
                  </MessageInfoContainer>
                </Grid>

                {(profile === "admin" || profile === "supervisor") && (
                  <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="geral-label">
                        {i18n.t("quickMessages.dialog.geral")}
                      </InputLabel>
                      <Field
                        as={Select}
                        name="geral"
                        labelId="geral-label"
                        label={i18n.t("quickMessages.dialog.geral")}
                      >
                        <MenuItem value={true}>
                          {i18n.t("quickMessages.dialog.yes")}
                        </MenuItem>
                        <MenuItem value={false}>
                          {i18n.t("quickMessages.dialog.no")}
                        </MenuItem>
                      </Field>
                    </FormControl>
                    <FormHelperText>
                      {i18n.t("quickMessages.dialog.geralHelper")}
                    </FormHelperText>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <input
                    type="file"
                    ref={attachmentFile}
                    style={{ display: "none" }}
                    onChange={handleAttachmentFile}
                  />
                  <Grid container spacing={2}>
                    <Grid item>
                      <BaseButton
                        color="primary"
                        variant="contained"
                        startIcon={<AttachFileOutlinedIcon />}
                        onClick={() => attachmentFile.current.click()}
                        disabled={loading}
                      >
                        {i18n.t("quickMessages.buttons.attach")}
                      </BaseButton>
                    </Grid>
                    <Grid item>
                      <BaseButton
                        color="primary"
                        variant="contained"
                        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                        onClick={
                          isRecording
                            ? handleStopRecording
                            : handleStartRecording
                        }
                        disabled={loading}
                      >
                        {isRecording
                          ? i18n.t("quickMessages.buttons.stopRecording")
                          : i18n.t("quickMessages.buttons.startRecording")}
                      </BaseButton>
                    </Grid>
                  </Grid>
                </Grid>
                
                {(attachment || audioBlob || quickMessage.mediaPath) && (
                  <Grid item xs={12}>
                    <AttachmentPaper variant="outlined">
                      <AttachmentContainer>
                      <Grid item>
                          <Typography variant="body1">
                            {attachment
                              ? attachment.name
                              : audioBlob
                              ? i18n.t("quickMessages.dialog.recordedAudio")
                              : quickMessage.mediaName}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <IconButton
                            onClick={() => setConfirmationOpen(true)}
                            size="small"
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </AttachmentContainer>
                    </AttachmentPaper>
                  </Grid>
                )}

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <BaseButton
                    onClick={handleClose}
                    color="secondary"
                    variant="outlined"
                    disabled={loading || isSubmitting}
                  >
                    {i18n.t("quickMessages.buttons.cancel")}
                  </BaseButton>
                  <BtnWrapper>
                    <BaseButton
                      type="submit"
                      color="primary"
                      disabled={loading || isSubmitting}
                      variant="contained"
                    >
                      {quickMessageId
                        ? i18n.t("quickMessages.buttons.edit")
                        : i18n.t("quickMessages.buttons.add")}
                    </BaseButton>
                    {(loading || isSubmitting) && (
                      <ButtonProgress size={24} />
                    )}
                  </BtnWrapper>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </BaseModal>
    </>
  );
};

export default QuickMessageDialog;