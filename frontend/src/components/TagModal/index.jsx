import React, { useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    CircularProgress,
    InputAdornment
} from "@mui/material";
import {
    Save as SaveIcon,
    Add as AddIcon,
    Label as LabelIcon,
    Palette as PaletteIcon,
    ViewKanban as KanbanIcon
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { ChromePicker } from "react-color";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import BaseModal from "../shared/BaseModal";

const useStyles = makeStyles((theme) => ({
    colorPicker: {
        width: '100% !important',
        marginTop: theme.spacing(2),
        '& > div': {
            width: '100% !important'
        }
    },
    formContainer: {
        padding: theme.spacing(2)
    }
}));

const TagSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, i18n.t("tags.modal.form.name.error.min"))
        .required(i18n.t("tags.modal.form.name.error.required")),
    color: Yup.string()
        .required(i18n.t("tags.modal.form.color.error.required")),
    kanban: Yup.boolean()
});

const TagModal = ({ open, onClose, tagData, onSave }) => {
    const classes = useStyles();
    
    // Para fins de depuração (remover após a correção)
    console.log("TagModal - tagData:", tagData);

    const initialValues = {
        name: tagData?.name || "",
        color: tagData?.color || "#000000",
        kanban: tagData?.kanban === 1 || tagData?.kanban === true
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const dataToSend = {
                name: values.name.trim(),
                color: values.color,
                kanban: values.kanban ? 1 : 0
            };
    
            if (tagData?.id) {
                await api.put(`/tags/${tagData.id}`, dataToSend);
                toast.success(i18n.t("tags.messages.success.update"));
            } else {
                await api.post("/tags", dataToSend);
                toast.success(i18n.t("tags.messages.success.create"));
            }
            
            if (onSave) onSave();
            onClose();
        } catch (err) {
            console.error('Error details:', err.response?.data);
            toast.error(err.response?.data?.error || i18n.t("tags.messages.error.create"));
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={TagSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true} // Importante para atualizar o formulário quando tagData muda
        >
            {({ values, errors, touched, setFieldValue, isSubmitting, handleSubmit }) => {
                const modalActions = [
                    {
                        label: i18n.t("tags.modal.buttons.cancel"),
                        onClick: onClose,
                        disabled: isSubmitting,
                        color: "secondary",
                        variant: "outlined"
                    },
                    {
                        label: tagData?.id 
                            ? i18n.t("tags.modal.buttons.update")
                            : i18n.t("tags.modal.buttons.create"),
                        onClick: handleSubmit,
                        disabled: isSubmitting,
                        color: "primary",
                        variant: "contained",
                        icon: isSubmitting ? 
                            <CircularProgress size={20} /> : 
                            tagData?.id ? <SaveIcon /> : <AddIcon />
                    }
                ];

                return (
                    <BaseModal
                        open={open}
                        onClose={onClose}
                        title={tagData?.id 
                            ? i18n.t("tags.modal.title.edit")
                            : i18n.t("tags.modal.title.add")}
                        helpText={i18n.t("tags.modal.help.content")}
                        maxWidth="sm"
                        loading={isSubmitting}
                        actions={modalActions}
                    >
                        <Form>
                            <Grid container spacing={3} className={classes.formContainer}>
                                <Grid item xs={12}>
                                    <Field
                                        name="name"
                                        as={TextField}
                                        label={i18n.t("tags.modal.form.name.label")}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LabelIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label={i18n.t("tags.modal.form.color.label")}
                                        variant="outlined"
                                        fullWidth
                                        value={values.color}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PaletteIcon />
                                                </InputAdornment>
                                            ),
                                            readOnly: true
                                        }}
                                    />
                                    <ChromePicker
                                        color={values.color}
                                        onChange={(color) => setFieldValue("color", color.hex)}
                                        disableAlpha
                                        styles={{
                                            default: {
                                                picker: {
                                                    width: '100%',
                                                    marginTop: '16px',
                                                    boxSizing: 'border-box',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={values.kanban}
                                                onChange={(e) => 
                                                    setFieldValue("kanban", e.target.checked)
                                                }
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <KanbanIcon />
                                                {i18n.t("tags.modal.form.kanban.label")}
                                            </div>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Form>
                    </BaseModal>
                );
            }}
        </Formik>
    );
};

export default TagModal;