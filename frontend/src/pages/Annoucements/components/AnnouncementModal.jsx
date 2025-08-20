import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../../helpers/toast";
import { head } from "../../../utils/helpers";

import {
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  Box,
  Stack,
  Typography,
  Paper,
  Divider,
  ButtonGroup
} from "@mui/material";

import {
  AttachFile as AttachFileIcon,
  DeleteOutline as DeleteOutlineIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  HelpOutline as HelpOutlineIcon,
  Title as TitleIcon,
  TextFields as TextFieldsIcon,
  PriorityHigh as PriorityIcon,
  ToggleOn as StatusIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  FormatSize as FormatSizeIcon
} from "@mui/icons-material";

import BaseModal from "../../../components/BaseModal";
import BaseButton from "../../../components/BaseButton";
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";

const AnnouncementSchema = Yup.object().shape({
  title: Yup.string().required("Obrigatório"),
  text: Yup.string().required("Obrigatório"),
  priority: Yup.number().required("Obrigatório"),
  status: Yup.boolean().required("Obrigatório"),
});

// Componente de Editor Simples
const SimpleEditor = ({ value, onChange, error, helperText }) => {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Atualiza o valor após comando
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const insertImage = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      const selection = window.getSelection().toString();
      const text = selection || url;
      const linkHtml = `<a href="${url}" target="_blank">${text}</a>`;
      executeCommand('insertHTML', linkHtml);
    }
  };

  const formatHeading = () => {
    executeCommand('formatBlock', 'h3');
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Barra de ferramentas */}
      <Box sx={{ 
        p: 1, 
        backgroundColor: 'grey.50', 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap'
      }}>
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Negrito">
            <IconButton 
              onClick={() => executeCommand('bold')}
              size="small"
            >
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Itálico">
            <IconButton 
              onClick={() => executeCommand('italic')}
              size="small"
            >
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sublinhado">
            <IconButton 
              onClick={() => executeCommand('underline')}
              size="small"
            >
              <FormatUnderlinedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Título">
            <IconButton 
              onClick={formatHeading}
              size="small"
            >
              <FormatSizeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Lista com marcadores">
            <IconButton 
              onClick={() => executeCommand('insertUnorderedList')}
              size="small"
            >
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Lista numerada">
            <IconButton 
              onClick={() => executeCommand('insertOrderedList')}
              size="small"
            >
              <FormatListNumberedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Inserir imagem">
            <IconButton 
              onClick={insertImage}
              size="small"
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Inserir link">
            <IconButton 
              onClick={insertLink}
              size="small"
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Box>

      {/* Área de edição */}
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onBlur={handleContentChange}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        sx={{
          minHeight: 300,
          maxHeight: 500,
          overflow: 'auto',
          p: 2,
          outline: 'none',
          fontSize: '14px',
          lineHeight: 1.6,
          fontFamily: 'inherit',
          '&:focus': {
            backgroundColor: 'action.hover'
          },
          '& h1, & h2, & h3': {
            margin: '0.5em 0',
            color: 'primary.main'
          },
          '& p': {
            margin: '0.5em 0'
          },
          '& ul, & ol': {
            margin: '0.5em 0',
            paddingLeft: '2em'
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'underline'
          }
        }}
      />

      {error && (
        <Box sx={{ p: 1, color: 'error.main', fontSize: '0.75rem', backgroundColor: 'error.light' }}>
          {helperText}
        </Box>
      )}
    </Paper>
  );
};

const AnnouncementModal = ({ open, onClose, announcementId, reload }) => {
  const attachmentFile = useRef(null);

  const initialState = {
    title: "",
    text: "",
    priority: 3,
    status: true,
  };

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(initialState);
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!announcementId) return;
      try {
        const { data } = await api.get(`/announcements/${announcementId}`);
        setAnnouncement((prevState) => ({
          ...prevState,
          ...data,
        }));
      } catch (err) {
        toast.error(err);
      }
    };
    fetchAnnouncement();
  }, [announcementId, open]);

  const handleClose = () => {
    setAnnouncement(initialState);
    setAttachment(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveAnnouncement = async (values, actions) => {
    try {
      const announcementData = { ...values };
  
      if (announcementId) {
        await api.put(`/announcements/${announcementId}`, announcementData);
        if (attachment) {
          await handleMediaUpload(announcementId);
        }
      } else {
        const { data } = await api.post("/announcements", announcementData);
        if (attachment) {
          await handleMediaUpload(data.id);
        }
      }
  
      toast.success(i18n.t("announcements.toasts.success"));
      if (typeof reload === "function") {
        reload();
      }
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Erro ao salvar o anúncio");
    } finally {
      if (actions?.setSubmitting) {
        actions.setSubmitting(false);
      }
    }
  };

  const handleMediaUpload = async (id) => {
    try {
      const formData = new FormData();
      formData.append("file", attachment);
      formData.append("type", attachment.type);
      await api.post(`/announcements/${id}/media-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (uploadError) {
      console.error("Erro no upload do arquivo:", uploadError);
      toast.error("Erro ao fazer upload do arquivo anexo");
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (announcement.mediaPath) {
      await api.delete(`/announcements/${announcement.id}/media-upload`);
      setAnnouncement((prev) => ({
        ...prev,
        mediaPath: null,
      }));
      toast.success(i18n.t("announcements.toasts.deleted"));
      if (typeof reload === "function") {
        reload();
      }
    }
    setConfirmModalOpen(false);
  };

  const hiddenFileInput = (
    <input
      type="file"
      accept=".png,.jpg,.jpeg"
      ref={attachmentFile}
      onChange={handleAttachmentFile}
      style={{ display: "none" }}
    />
  );

  // Ações do modal de confirmação
  const confirmDeleteActions = [
    {
      label: i18n.t("announcements.buttons.cancel"),
      onClick: () => setConfirmModalOpen(false),
      variant: "outlined",
      color: "primary"
    },
    {
      label: i18n.t("announcements.buttons.confirm"),
      onClick: deleteMedia,
      variant: "contained",
      color: "primary"
    }
  ];

  // Ações do modal principal
  const getModalActions = (isSubmitting) => {
    const actions = [];
    
    if (!attachment && !announcement.mediaPath) {
      actions.push({
        label: i18n.t("announcements.dialog.buttons.attach"),
        onClick: () => attachmentFile.current.click(),
        variant: "outlined",
        color: "primary",
        icon: <AttachFileIcon />,
        disabled: isSubmitting
      });
    }
    
    actions.push({
      label: i18n.t("announcements.dialog.buttons.cancel"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      icon: <CancelIcon />,
      disabled: isSubmitting
    });
    
    actions.push({
      label: announcementId
        ? i18n.t("announcements.dialog.buttons.edit")
        : i18n.t("announcements.dialog.buttons.add"),
      onClick: () => {},
      variant: "contained",
      color: "primary",
      icon: <SaveIcon />,
      disabled: isSubmitting,
      type: "submit"
    });
    
    return actions;
  };

  return (
    <>
      <BaseModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={i18n.t("announcements.confirmationModal.deleteTitle")}
        actions={confirmDeleteActions}
      >
        <Typography>
          {i18n.t("announcements.confirmationModal.deleteMessage")}
        </Typography>
      </BaseModal>

      {hiddenFileInput}
      
      <Formik
        initialValues={announcement}
        enableReinitialize
        validationSchema={AnnouncementSchema}
        onSubmit={handleSaveAnnouncement}
      >
        {({ touched, errors, isSubmitting, values, setFieldValue }) => (
          <Form>
            <BaseModal
              open={open}
              onClose={handleClose}
              title={announcementId
                ? i18n.t("announcements.dialog.edit")
                : i18n.t("announcements.dialog.add")}
              maxWidth="md"
              loading={isSubmitting}
              actions={getModalActions(isSubmitting)}
            >
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <TitleIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <InputLabel>{i18n.t("announcements.dialog.form.title")}</InputLabel>
                      <Tooltip title={i18n.t("announcements.tooltips.title")}>
                        <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Field
                      as={TextField}
                      name="title"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      variant="outlined"
                      fullWidth
                      placeholder="Digite o título do anúncio..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <TextFieldsIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <InputLabel>{i18n.t("announcements.dialog.form.text")}</InputLabel>
                      <Tooltip title={i18n.t("announcements.tooltips.text")}>
                        <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    
                    <SimpleEditor
                      value={values.text}
                      onChange={(content) => setFieldValue('text', content)}
                      error={touched.text && Boolean(errors.text)}
                      helperText={touched.text && errors.text}
                    />
                    
                    <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', display: 'block' }}>
                      💡 Dica: Use a barra de ferramentas para formatar o texto, inserir links e imagens
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Tooltip title={i18n.t("announcements.tooltips.priority")}>
                      <FormControl variant="outlined" fullWidth>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <PriorityIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          <InputLabel>{i18n.t("announcements.dialog.form.priority")}</InputLabel>
                        </Box>
                        <Field
                          as={Select}
                          name="priority"
                          error={touched.priority && Boolean(errors.priority)}
                        >
                          <MenuItem value={1}>🔴 Alta</MenuItem>
                          <MenuItem value={2}>🟡 Média</MenuItem>
                          <MenuItem value={3}>🟢 Baixa</MenuItem>
                        </Field>
                      </FormControl>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Tooltip title={i18n.t("announcements.tooltips.status")}>
                      <FormControl variant="outlined" fullWidth>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <StatusIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          <InputLabel>{i18n.t("announcements.dialog.form.status")}</InputLabel>
                        </Box>
                        <Field
                          as={Select}
                          name="status"
                          error={touched.status && Boolean(errors.status)}
                        >
                          <MenuItem value={true}>✅ Ativo</MenuItem>
                          <MenuItem value={false}>❌ Inativo</MenuItem>
                        </Field>
                      </FormControl>
                    </Tooltip>
                  </Grid>

                  {(announcement.mediaPath || attachment) && (
                    <Grid item xs={12}>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                      }}>
                        <AttachFileIcon />
                        <Typography variant="body2">
                          📎 Anexo: {attachment ? attachment.name : announcement.mediaName}
                        </Typography>
                        <Tooltip title={i18n.t("announcements.tooltips.removeAttachment")}>
                          <IconButton
                            onClick={() => setConfirmModalOpen(true)}
                            sx={{ color: 'error.main' }}
                            size="small"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </BaseModal>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AnnouncementModal;