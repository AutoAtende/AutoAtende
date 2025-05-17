import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Grid,
  TextField,
  CircularProgress,
  InputAdornment,
  FormHelperText
} from "@mui/material";
import {
  LocalOffer as TagIcon,
  Palette as ColorIcon
} from "@mui/icons-material";
import { ChromePicker } from "react-color";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import BaseModal from "../BaseModal";

const TagSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("tags.form.validation.nameMin"))
    .max(50, i18n.t("tags.form.validation.nameMax"))
    .required(i18n.t("tags.form.validation.nameRequired")),
  color: Yup.string()
    .required(i18n.t("tags.form.validation.colorRequired"))
});

const TagModal = ({ open, onClose, tagData, onSave }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    color: "#A4CCCC"
  });

  // Atualiza os valores iniciais quando o tagData mudar
  useEffect(() => {
    if (tagData) {
      setInitialValues({
        name: tagData.name || "",
        color: tagData.color || "#A4CCCC"
      });
    } else {
      setInitialValues({
        name: "",
        color: "#A4CCCC"
      });
    }
  }, [tagData]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (tagData) {
        // Atualizar tag existente
        await api.put(`/tags/${tagData.id}`, {
          name: values.name,
          color: values.color,
          kanban: tagData.kanban // Mantém o valor atual de kanban
        });
        toast.success(i18n.t("tags.form.success.update"));
      } else {
        // Criar nova tag
        await api.post("/tags", {
          name: values.name,
          color: values.color
        });
        toast.success(i18n.t("tags.form.success.create"));
      }
      
      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || i18n.t("tags.form.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={TagSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        handleSubmit,
        setFieldValue
      }) => {
        const modalActions = [
          {
            label: i18n.t("tags.form.buttons.cancel"),
            onClick: onClose,
            disabled: isSubmitting,
            color: "secondary",
            variant: "outlined"
          },
          {
            label: tagData 
              ? i18n.t("tags.form.buttons.update") 
              : i18n.t("tags.form.buttons.create"),
            onClick: handleSubmit,
            disabled: isSubmitting,
            color: "primary",
            variant: "contained",
            icon: isSubmitting ? <CircularProgress size={20} /> : null
          }
        ];

        return (
          <BaseModal
            open={open}
            onClose={onClose}
            title={tagData 
              ? i18n.t("tags.form.title.edit") 
              : i18n.t("tags.form.title.new")
            }
            actions={modalActions}
            maxWidth="sm"
            loading={isSubmitting}
          >
            <Form>
              <Grid container spacing={3} sx={{ p: 2 }}>
                <Grid item xs={12}>
                  <Field
                    name="name"
                    as={TextField}
                    label={i18n.t("tags.form.fields.name")}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TagIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    name="color"
                    as={TextField}
                    label={i18n.t("tags.form.fields.color")}
                    error={touched.color && Boolean(errors.color)}
                    helperText={touched.color && errors.color}
                    variant="outlined"
                    fullWidth
                    onClick={() => setColorPickerOpen(true)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ColorIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              backgroundColor: values.color,
                              cursor: "pointer",
                              border: "1px solid #ccc"
                            }}
                            onClick={() => setColorPickerOpen(true)}
                          />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  {colorPickerOpen && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 2000,
                        marginTop: 8
                      }}
                    >
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0
                        }}
                        onClick={() => setColorPickerOpen(false)}
                      />
                      <ChromePicker
                        color={values.color}
                        onChange={(color) => {
                          setFieldValue("color", color.hex);
                        }}
                      />
                    </div>
                  )}
                  
                  <FormHelperText>
                    {i18n.t("tags.form.colorHelp")}
                  </FormHelperText>
                </Grid>
              </Grid>
            </Form>
          </BaseModal>
        );
      }}
    </Formik>
  );
};

TagModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tagData: PropTypes.object,
  onSave: PropTypes.func
};

export default TagModal;