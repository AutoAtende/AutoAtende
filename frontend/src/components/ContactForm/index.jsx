import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../helpers/toast";
import { green } from "@mui/material/colors";

// Material UI Components
import {
  Button,
  TextField,
  CircularProgress,
  Grid,
  InputAdornment,
  Box,
  Stack,
  Tooltip
} from "@mui/material";

// Material UI Icons
import {
  PersonOutline as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";

// Translations & Services
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

// Styled Components
const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SubmitButtonWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
}));

const ButtonProgress = styled(CircularProgress)(({ theme }) => ({
  color: green[500],
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: -12,
  marginLeft: -12,
}));

// Validation Schema
const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  number: Yup.string()
    .min(8, "Too Short!")
    .max(50, "Too Long!"),
  email: Yup.string()
    .email("Invalid email"),
});

export function ContactForm({ initialContact, onSave, onCancel }) {
  const [contact, setContact] = useState(initialContact);

  useEffect(() => {
    setContact(initialContact);
  }, [initialContact]);

  const handleSaveContact = async values => {
    try {
      if (contact.id) {
        await api.put(`/contacts/${contact.id}`, values);
      } else {
        const { data } = await api.post("/contacts", values);
        if (onSave) {
          onSave(data);
        }
      }
      toast.success(i18n.t("contactModal.success"));
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Formik
      initialValues={contact}
      enableReinitialize={true}
      validationSchema={ContactSchema}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          handleSaveContact(values);
          actions.setSubmitting(false);
        }, 400);
      }}
    >
      {({ values, errors, touched, isSubmitting }) => (
        <Form>
          <FormContainer>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("contactModal.form.name")}
                  name="name"
                  autoFocus
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("contactModal.form.number")}
                  name="number"
                  error={touched.number && Boolean(errors.number)}
                  helperText={touched.number && errors.number}
                  placeholder="5513912344321"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("contactModal.form.email")}
                  name="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  placeholder="Email address"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Tooltip title={i18n.t("contactModal.buttons.cancel")}>
                    <Button
                      onClick={onCancel}
                      color="secondary"
                      disabled={isSubmitting}
                      variant="outlined"
                      fullWidth
                      startIcon={<CancelIcon />}
                    >
                      {i18n.t("contactModal.buttons.cancel")}
                    </Button>
                  </Tooltip>

                  <SubmitButtonWrapper>
                    <Tooltip 
                      title={contact.id 
                        ? i18n.t("contactModal.buttons.okEdit")
                        : i18n.t("contactModal.buttons.okAdd")
                      }
                    >
                      <Button
                        type="submit"
                        color="primary"
                        disabled={isSubmitting}
                        variant="contained"
                        fullWidth
                        startIcon={<SaveIcon />}
                      >
                        {contact.id
                          ? i18n.t("contactModal.buttons.okEdit")
                          : i18n.t("contactModal.buttons.okAdd")}
                      </Button>
                    </Tooltip>
                    {isSubmitting && <ButtonProgress size={24} />}
                  </SubmitButtonWrapper>
                </Stack>
              </Grid>
            </Grid>
          </FormContainer>
        </Form>
      )}
    </Formik>
  );
}

export default ContactForm;