import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../helpers/toast";

// Material UI Components
import {
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from "@mui/icons-material";
import BaseModal from "../shared/BaseModal";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import EmployerCustomField from "../EmployerCustomField";

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  }
}));

const ModalContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2)
}));

const FieldsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

// Validation Schema
const NewEmployerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("inputErrors.tooShort"))
    .max(50, i18n.t("inputErrors.tooLong"))
    .required(i18n.t("inputErrors.required")),
  extraInfo: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required(i18n.t("inputErrors.required")),
      value: Yup.string().required(i18n.t("inputErrors.required"))
    })
  )
});

const NewEmployerModal = ({ open, onClose, onSave, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    if (initialData && initialData.id) {
      // Carregar dados da empresa, incluindo campos customizados
      const fetchEmployerDetails = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/employers/${initialData.id}`);
          setCustomFields(data.extraInfo || []);
        } catch (err) {
          toast.error(i18n.t("employerModal.errors.fetchDetails"));
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchEmployerDetails();
    } else {
      setCustomFields([]);
    }
  }, [initialData]);

  const handleSubmit = async (values, actions) => {
    try {
      setLoading(true);
      
      const payload = {
        ...values,
        extraInfo: customFields.filter(field => field.name && field.value)
      };

      if (initialData && initialData.id) {
        // Atualizar empresa existente
        const { data } = await api.put(`/employers/${initialData.id}`, payload);
        toast.success(i18n.t("employerModal.success.update"));
        onSave(data);
      } else {
        // Criar nova empresa
        const { data } = await api.post("/employers", payload);
        toast.success(i18n.t("employerModal.success.create"));
        onSave(data);
      }
      
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || i18n.t("employerModal.errors.generic")
      );
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
    }
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { name: "", value: "" }]);
  };

  const handleChangeCustomField = (index, field, value) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  const handleRemoveCustomField = (index) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
  };

  // Define as ações no formato esperado pelo BaseModal
  const modalActions = [
    {
      label: i18n.t("contactModal.buttons.cancel"),
      onClick: onClose,
      color: "secondary",
      disabled: loading,
      variant: "outlined",
      icon: <CancelIcon />
    },
    {
      label: initialData ? i18n.t("contactModal.buttons.okEdit") : i18n.t("contactModal.buttons.okAdd"),
      onClick: () => {
        // Aciona o submit do formulário
        const form = document.getElementById("employer-form");
        if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      },
      color: "primary",
      disabled: loading,
      variant: "contained",
      icon: loading ? <CircularProgress size={20} /> : <SaveIcon />
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={initialData ? i18n.t("employerModal.title.edit") : i18n.t("employerModal.title.add")}
      maxWidth="sm"
      actions={modalActions}
      loading={loading}
    >
      <Formik
        initialValues={{ 
          name: initialData?.name || "" 
        }}
        validationSchema={NewEmployerSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ touched, errors, isSubmitting, values }) => (
          <Form id="employer-form">
            <FormContainer>
              <ModalContent>
                <Field
                  as={TextField}
                  label={i18n.t("employerModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  fullWidth
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  {i18n.t("employerModal.form.customFields")}
                </Typography>
                
                <FieldsContainer>
                  {customFields.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" align="center" py={2}>
                      {i18n.t("employerModal.form.noCustomFields")}
                    </Typography>
                  ) : (
                    customFields.map((field, index) => (
                      <EmployerCustomField 
                        key={index}
                        field={field}
                        index={index}
                        handleChangeField={handleChangeCustomField}
                        handleRemoveField={handleRemoveCustomField}
                      />
                    ))
                  )}
                  
                  <Box sx={{ mt: 1 }}>
                    <Box 
                      component="button"
                      type="button"
                      onClick={handleAddCustomField}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: `1px solid ${theme => theme.palette.primary.main}`,
                        borderRadius: theme => theme.shape.borderRadius,
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: theme => theme.palette.primary.main,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontFamily: theme => theme.typography.fontFamily,
                        '&:hover': {
                          backgroundColor: theme => theme.palette.action.hover,
                        }
                      }}
                    >
                      <AddIcon fontSize="small" />
                      {i18n.t("employerModal.buttons.addField")}
                    </Box>
                  </Box>
                </FieldsContainer>
              </ModalContent>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </BaseModal>
  );
};

export default NewEmployerModal;