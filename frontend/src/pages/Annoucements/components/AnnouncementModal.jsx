import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../../helpers/toast";
import { head } from "../../../utils/helpers";
import { green } from "@mui/material/colors";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
  Typography
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
  ToggleOn as StatusIcon
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

const AnnouncementModal = ({ open, onClose, announcementId, reload }) => {
  const editorRef = useRef(null);
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
      const announcementData = {
        ...values,
        text: editorRef.current?.getData() || values.text,
      };
  
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

  const editorConfiguration = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'blockQuote',
      'insertTable',
      'undo',
      'redo'
    ],
    language: 'pt-br',
    table: {
      contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
    },
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

  // Ações do modal de confirmação de exclusão de anexo
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
    
    // Botão de anexo (somente se não houver anexo)
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
    
    // Botão de cancelar
    actions.push({
      label: i18n.t("announcements.dialog.buttons.cancel"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      icon: <CancelIcon />,
      disabled: isSubmitting
    });
    
    // Botão de salvar
    actions.push({
      label: announcementId
        ? i18n.t("announcements.dialog.buttons.edit")
        : i18n.t("announcements.dialog.buttons.add"),
      onClick: () => {}, // Formik controla o envio do formulário
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
      {/* Modal de confirmação para exclusão de anexo */}
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
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                      sx={{ mt: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TextFieldsIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <InputLabel>{i18n.t("announcements.dialog.form.text")}</InputLabel>
                      <Tooltip title={i18n.t("announcements.tooltips.text")}>
                        <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Box sx={{ 
                      mt: 2,
                      '& .ck-editor__editable': {
                        minHeight: '400px !important',
                        maxHeight: '600px !important',
                        fontSize: '14px',
                        padding: '1rem',
                        backgroundColor: '#ffffff'
                      },
                      '& .ck-toolbar': {
                        borderColor: 'divider',
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      },
                      '& .ck-content': {
                        borderColor: 'divider',
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                      }
                    }}>
                      <CKEditor
                        editor={ClassicEditor}
                        config={editorConfiguration}
                        data={values.text}
                        onReady={editor => {
                          editorRef.current = editor;
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFieldValue('text', data);
                        }}
                      />
                      {touched.text && errors.text && (
                        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                          {errors.text}
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Tooltip title={i18n.t("announcements.tooltips.priority")}>
                      <FormControl variant="outlined" fullWidth>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PriorityIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          <InputLabel>{i18n.t("announcements.dialog.form.priority")}</InputLabel>
                        </Box>
                        <Field
                          as={Select}
                          name="priority"
                          error={touched.priority && Boolean(errors.priority)}
                        >
                          <MenuItem value={1}>Alta</MenuItem>
                          <MenuItem value={2}>Média</MenuItem>
                          <MenuItem value={3}>Baixa</MenuItem>
                        </Field>
                      </FormControl>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Tooltip title={i18n.t("announcements.tooltips.status")}>
                      <FormControl variant="outlined" fullWidth>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StatusIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          <InputLabel>{i18n.t("announcements.dialog.form.status")}</InputLabel>
                        </Box>
                        <Field
                          as={Select}
                          name="status"
                          error={touched.status && Boolean(errors.status)}
                        >
                          <MenuItem value={true}>Ativo</MenuItem>
                          <MenuItem value={false}>Inativo</MenuItem>
                        </Field>
                      </FormControl>
                    </Tooltip>
                  </Grid>

                  {(announcement.mediaPath || attachment) && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: 'background.default' 
                      }}>
                        <BaseButton 
                          variant="text"
                          startIcon={<AttachFileIcon />}
                        >
                          {attachment ? attachment.name : announcement.mediaName}
                        </BaseButton>
                        <Tooltip title={i18n.t("announcements.tooltips.removeAttachment")}>
                          <IconButton
                            onClick={() => setConfirmModalOpen(true)}
                            color="error"
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