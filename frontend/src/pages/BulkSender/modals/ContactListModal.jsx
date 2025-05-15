import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";


// Material UI
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

// Icons
import {
  Save as SaveIcon,
} from "@mui/icons-material";

// Componentes
import BaseModal from "../../../components/shared/BaseModal";

// API
import api from "../../../services/api";

// Schema de validação
const ContactListSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("contactListsValidation.nameMin"))
    .max(50, i18n.t("contactListsValidation.nameMax"))
    .required(i18n.t("contactListsValidation.nameRequired")),
});

const ContactListModal = ({ open, onClose, contactListId }) => {
  const { user } = useContext(AuthContext);
  const companyId = user.companyId;

  // Estados
  const [contactList, setContactList] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados da lista de contatos
  useEffect(() => {
    if (!open || !contactListId) {
      setContactList({ name: "" });
      return;
    }

    const fetchContactList = async () => {
      try {
        const { data } = await api.get(`/contact-lists/${contactListId}`);
        setContactList(prevState => ({
          ...prevState,
          ...data
        }));
      } catch (err) {
        toast.error(i18n.t("contactLists.toasts.fetchError"));
      }
    };

    fetchContactList();
  }, [contactListId, open]);

  // Handler
  const handleSaveContactList = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Adicionar companyId
      const contactListData = { ...values, companyId };
      
      if (contactListId) {
        // Atualizar
        await api.put(`/contact-lists/${contactListId}`, contactListData);
        toast.success(i18n.t("contactLists.toasts.edited"));
      } else {
        // Criar
        await api.post("/contact-lists", contactListData);
        toast.success(i18n.t("contactLists.toasts.added"));
      }
      
      onClose();
    } catch (err) {
      toast.error(i18n.t("contactLists.toasts.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={contactListId 
        ? i18n.t("contactLists.dialog.edit") 
        : i18n.t("contactLists.dialog.add")
      }
      maxWidth="xs"
      actions={[
        {
          label: i18n.t("contactLists.dialog.cancel"),
          onClick: onClose,
          variant: "outlined",
          color: "secondary",
          disabled: isSubmitting,
        }
      ]}
    >
      <Formik
        initialValues={contactList}
        enableReinitialize={true}
        validationSchema={ContactListSchema}
        onSubmit={(values) => {
          handleSaveContactList(values);
        }}
      >
        {({ errors, touched, isSubmitting: formikSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              label={i18n.t("contactLists.dialog.name")}
              name="name"
              autoFocus
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
              variant="outlined"
              margin="dense"
              fullWidth
            />
            
            <Button
              type="submit"
              color="primary"
              disabled={isSubmitting}
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<SaveIcon />}
            >
              {contactListId
                ? i18n.t("contactLists.dialog.okEdit")
                : i18n.t("contactLists.dialog.okAdd")}
              {isSubmitting && (
                <CircularProgress size={24} sx={{ ml: 1 }} />
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </BaseModal>
  );
};

export default ContactListModal;