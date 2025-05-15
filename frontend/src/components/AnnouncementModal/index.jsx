import React, { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../helpers/toast";
import { head } from "../../utils/helpers";
import { green } from "@mui/material/colors";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import {
  Button,
  DialogActions,
  DialogContent,
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
  Stack
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

import BaseModal from "../shared/BaseModal";
import ConfirmationModal from "../ConfirmationModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const FormWrapper = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
});

const LabelWithHelp = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const EditorWrapper = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .ck-editor__editable': {
    minHeight: '400px !important', // Aumentando altura mínima
    maxHeight: '600px !important', // Aumentando altura máxima
    fontSize: '14px',
    padding: '1rem',
    backgroundColor: '#ffffff',
    [theme.breakpoints.down('sm')]: {
      minHeight: '300px !important',
    }
  },
  '& .ck-toolbar': {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  },
  '& .ck-content': {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
  },
}));

const AttachmentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
}));

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

  const [confirmationOpen, setConfirmationOpen] = useState(false);
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

  const modalActions = [
    !attachment && !announcement.mediaPath && (
      <Tooltip title={i18n.t("announcements.tooltips.attachment")}>
        <Button
          color="primary"
          onClick={() => attachmentFile.current.click()}
          variant="outlined"
          startIcon={<AttachFileIcon />}
        >
          {i18n.t("announcements.dialog.buttons.attach")}
        </Button>
      </Tooltip>
    ),
    <Tooltip title={i18n.t("announcements.tooltips.cancel")}>
      <Button
        onClick={handleClose}
        color="secondary"
        variant="outlined"
        startIcon={<CancelIcon />}
      >
        {i18n.t("announcements.dialog.buttons.cancel")}
      </Button>
    </Tooltip>,
    <Tooltip title={i18n.t("announcements.tooltips.save")}>
      <Button
        type="submit"
        color="primary"
        variant="contained"
        startIcon={<SaveIcon />}
      >
        {announcementId
          ? i18n.t("announcements.dialog.buttons.edit")
          : i18n.t("announcements.dialog.buttons.add")}
      </Button>
    </Tooltip>
  ].filter(Boolean);

  return (
    <>
      <ConfirmationModal
        title={i18n.t("announcements.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      {hiddenFileInput}
      
      <BaseModal
        open={open}
        onClose={handleClose}
        title={announcementId
          ? i18n.t("announcements.dialog.edit")
          : i18n.t("announcements.dialog.add")}
        maxWidth="md"
      >
        <Formik
          initialValues={announcement}
          enableReinitialize
          validationSchema={AnnouncementSchema}
          onSubmit={handleSaveAnnouncement}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent>
                <FormWrapper>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <LabelWithHelp>
                        <TitleIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <InputLabel>{i18n.t("announcements.dialog.form.title")}</InputLabel>
                        <Tooltip title={i18n.t("announcements.tooltips.title")}>
                          <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
                        </Tooltip>
                      </LabelWithHelp>
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
                      <LabelWithHelp>
                        <TextFieldsIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <InputLabel>{i18n.t("announcements.dialog.form.text")}</InputLabel>
                        <Tooltip title={i18n.t("announcements.tooltips.text")}>
                          <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
                        </Tooltip>
                      </LabelWithHelp>
                      <EditorWrapper>
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
                      </EditorWrapper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Tooltip title={i18n.t("announcements.tooltips.priority")}>
                        <FormControl variant="outlined" fullWidth>
                          <LabelWithHelp>
                            <PriorityIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <InputLabel>{i18n.t("announcements.dialog.form.priority")}</InputLabel>
                          </LabelWithHelp>
                          <Field
                            as={Select}
                            name="priority"
                            label={i18n.t("announcements.dialog.form.priority")}
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
                          <LabelWithHelp>
                            <StatusIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <InputLabel>{i18n.t("announcements.dialog.form.status")}</InputLabel>
                          </LabelWithHelp>
                          <Field
                            as={Select}
                            name="status"
                            label={i18n.t("announcements.dialog.form.status")}
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
                        <AttachmentWrapper>
                          <Button startIcon={<AttachFileIcon />}>
                            {attachment ? attachment.name : announcement.mediaName}
                          </Button>
                          <Tooltip title={i18n.t("announcements.tooltips.removeAttachment")}>
                            <IconButton
                              onClick={() => setConfirmationOpen(true)}
                              color="secondary"
                              size="small"
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </AttachmentWrapper>
                      </Grid>
                    )}
                  </Grid>
                </FormWrapper>
              </DialogContent>

              <DialogActions>
                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{ 
                    p: 2,
                    position: 'relative'
                  }}
                >
                  {modalActions}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: green[500],
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px'
                      }}
                    />
                  )}
                </Stack>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </BaseModal>
    </>
  );
};

export default AnnouncementModal;