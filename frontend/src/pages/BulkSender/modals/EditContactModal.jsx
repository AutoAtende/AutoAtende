import React, { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";

// Material UI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";

// Icons
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon
} from "@mui/icons-material";

// API
import api from "../../../services/api";

// Schema de validação
const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("contactListItems.validation.nameMin"))
    .max(50, i18n.t("contactListItems.validation.nameMax"))
    .required(i18n.t("contactListItems.validation.nameRequired")),
  number: Yup.string()
    .min(8, i18n.t("contactListItems.validation.numberMin"))
    .max(50, i18n.t("contactListItems.validation.numberMax"))
    .required(i18n.t("contactListItems.validation.numberRequired")),
  email: Yup.string()
    .email(i18n.t("contactListItems.validation.emailInvalid"))
});

const EditContactModal = ({ open, onClose, contactId, contactListId, onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const companyId = user?.companyId;
  
  // Estados
  const [loading, setLoading] = useState(false);
  
  // Formulário
  const formik = useFormik({
    initialValues: {
      name: "",
      number: "",
      email: ""
    },
    validationSchema: ContactSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const contactData = {
          ...values,
          companyId,
          contactListId
        };
        
        if (contactId) {
          // Atualizar contato existente
          await api.put(`/contact-list-items/${contactId}`, contactData);
          toast.success(i18n.t("contactListItems.toasts.updated"));
        } else {
          // Criar novo contato
          await api.post("/contact-list-items", contactData);
          toast.success(i18n.t("contactListItems.toasts.added"));
        }
        
        if (onSave) {
          onSave();
        }
        
        onClose();
      } catch (err) {
        toast.error(i18n.t("contactListItems.toasts.saveError"));
      } finally {
        setLoading(false);
      }
    }
  });

  // Carregar dados do contato ao abrir o modal para edição
  useEffect(() => {
    const fetchContact = async () => {
      if (!contactId) return;
      
      try {
        setLoading(true);
        const { data } = await api.get(`/contact-list-items/${contactId}`);
        
        formik.setValues({
          name: data.name || "",
          number: data.number || "",
          email: data.email || ""
        });
      } catch (err) {
        toast.error(i18n.t("contactListItems.toasts.fetchError"));
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (open && contactId) {
      fetchContact();
    } else if (open && !contactId) {
      formik.resetForm();
    }
  }, [contactId, open]); // Removido formik das dependências

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          <Typography variant="h6">
            {contactId 
              ? i18n.t("contactListItems.modal.editTitle") 
              : i18n.t("contactListItems.modal.addTitle")
            }
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                fullWidth
                label={i18n.t("contactListItems.modal.name")}
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={loading}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={i18n.t("contactListItems.modal.number")}
                name="number"
                value={formik.values.number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.number && Boolean(formik.errors.number)}
                helperText={
                  (formik.touched.number && formik.errors.number) || 
                  i18n.t("contactListItems.modal.numberHelp")
                }
                placeholder="5513912344321"
                disabled={loading}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={i18n.t("contactListItems.modal.email")}
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                placeholder="email@exemplo.com"
                disabled={loading}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {i18n.t("contactListItems.modal.cancel")}
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {contactId
              ? i18n.t("contactListItems.modal.saveChanges")
              : i18n.t("contactListItems.modal.add")
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditContactModal;