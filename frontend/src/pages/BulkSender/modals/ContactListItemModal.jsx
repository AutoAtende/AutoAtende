import React, { useState, useEffect, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";

// Material UI
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

// Icons
import {
  Save as SaveIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

// Componentes
import BaseModal from "../../../components/shared/BaseModal";

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

const ContactListItemModal = ({
  open,
  onClose,
  contactId,
  contactListId,
  reload,
}) => {
  const { user } = useContext(AuthContext);
  const companyId = user?.companyId;
  const isMounted = useRef(true);

  // Estado
  const [contact, setContact] = useState({
    name: "",
    number: "",
    customMessage: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Buscar contato para edição
  useEffect(() => {
    const fetchContact = async () => {
      if (!contactId) return;

      try {
        const { data } = await api.get(`/contact-list-items/${contactId}`);
        if (isMounted.current) {
          setContact(data);
        }
      } catch (err) {
        toast.error(i18n.t("contactListItems.toasts.fetchError"));
      }
    };

    if (open && contactId) {
      fetchContact();
    } else if (open && !contactId) {
      setContact({
        name: "",
        number: "",
        customMessage: "",
        email: "",
      });
    }
  }, [contactId, open]);

  // Handler para salvar contato
  const handleSaveContact = async (values) => {
    setIsSubmitting(true);
    
    try {
      const contactData = {
        ...values,
        companyId,
        contactListId,
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
      
      if (reload) {
        reload();
      }
      
      onClose();
    } catch (err) {
      toast.error(i18n.t("contactListItems.toasts.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={contactId
        ? i18n.t("contactListItems.modal.editTitle")
        : i18n.t("contactListItems.modal.addTitle")
      }
      maxWidth="md"
      actions={[
        {
          label: i18n.t("contactListItems.modal.cancel"),
          onClick: onClose,
          disabled: isSubmitting,
          variant: "outlined",
          color: "secondary",
        }
      ]}
    >
      <Formik
        initialValues={contact}
        enableReinitialize={true}
        validationSchema={ContactSchema}
        onSubmit={(values) => {
          handleSaveContact(values);
        }}
      >
        {({ errors, touched, values }) => (
          <Form>
            <Box mb={4}>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                {i18n.t("contactListItems.modal.mainInfo")}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactListItems.modal.name")}
                    name="name"
                    autoFocus
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactListItems.modal.number")}
                    name="number"
                    error={touched.number && Boolean(errors.number)}
                    helperText={touched.number && errors.number || i18n.t("contactListItems.modal.numberHelp")}
                    placeholder="5513912344321"
                    variant="outlined"
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactListItems.modal.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    placeholder="email@exemplo.com"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactListItems.modal.customMessage")}
                    name="customMessage"
                    error={touched.customMessage && Boolean(errors.customMessage)}
                    helperText={touched.customMessage && errors.customMessage}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {contactId
                  ? i18n.t("contactListItems.modal.saveChanges")
                  : i18n.t("contactListItems.modal.add")
                }
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </BaseModal>
  );
};

export default ContactListItemModal;