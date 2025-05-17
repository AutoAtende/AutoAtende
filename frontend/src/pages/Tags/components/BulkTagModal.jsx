import React from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    CircularProgress,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import {
    Add as AddIcon,
    Numbers as NumbersIcon,
    Pattern as PatternIcon,
    ViewKanban as KanbanIcon
} from "@mui/icons-material";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import BaseModal from "../../../components/BaseModal";

const namePatterns = [
    { value: "tag_{n}", label: i18n.t("tags.bulk.patterns.tag") },
    { value: "ticket_{n}", label: i18n.t("tags.bulk.patterns.ticket") },
    { value: "prioridade_{n}", label: i18n.t("tags.bulk.patterns.priority") },
    { value: "status_{n}", label: i18n.t("tags.bulk.patterns.status") },
    { value: "depto_{n}", label: i18n.t("tags.bulk.patterns.department") },
    { value: "dia_{n}", label: i18n.t("tags.bulk.patterns.day") }
];

const BulkTagSchema = Yup.object().shape({
    quantity: Yup.number()
        .min(1, i18n.t("tags.bulk.validation.quantity.min"))
        .max(100, i18n.t("tags.bulk.validation.quantity.max"))
        .required(i18n.t("tags.bulk.validation.quantity.required")),
    namePattern: Yup.string()
        .required(i18n.t("tags.bulk.validation.pattern.required")),
    kanban: Yup.boolean()
});

const BulkTagModal = ({ open, onClose, onSave }) => {
    const initialValues = {
        quantity: 1,
        namePattern: "tag_{n}",
        kanban: false
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await api.post("/tags/bulk-create", values);
            toast.success(i18n.t("tags.notifications.bulkCreated"));
            if (onSave) onSave();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || i18n.t("tags.notifications.bulkError"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={BulkTagSchema}
            onSubmit={handleSubmit}
        >
            {({ values, errors, touched, isSubmitting, handleSubmit }) => {
                const modalActions = [
                    {
                        label: i18n.t("tags.bulk.buttons.cancel"),
                        onClick: onClose,
                        disabled: isSubmitting,
                        color: "secondary",
                        variant: "outlined"
                    },
                    {
                        label: i18n.t("tags.bulk.buttons.create"),
                        onClick: handleSubmit,
                        disabled: isSubmitting,
                        color: "primary",
                        variant: "contained",
                        icon: isSubmitting ? 
                            <CircularProgress size={20} /> : 
                            <AddIcon />
                    }
                ];

                return (
                    <BaseModal
                        open={open}
                        onClose={onClose}
                        title={i18n.t("tags.bulk.title")}
                        helpText={i18n.t("tags.bulk.help")}
                        maxWidth="sm"
                        loading={isSubmitting}
                        actions={modalActions}
                    >
                        <Form>
                            <Grid container spacing={3} sx={{ p: 2 }}>
                                <Grid item xs={12}>
                                    <Field
                                        name="quantity"
                                        as={TextField}
                                        label={i18n.t("tags.bulk.form.quantity")}
                                        type="number"
                                        error={touched.quantity && Boolean(errors.quantity)}
                                        helperText={touched.quantity && errors.quantity}
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <NumbersIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>{i18n.t("tags.bulk.form.pattern")}</InputLabel>
                                        <Field
                                            name="namePattern"
                                            as={Select}
                                            label={i18n.t("tags.bulk.form.pattern")}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <PatternIcon />
                                                </InputAdornment>
                                            }
                                        >
                                            {namePatterns.map((pattern) => (
                                                <MenuItem key={pattern.value} value={pattern.value}>
                                                    {pattern.label}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Field
                                                name="kanban"
                                                as={Switch}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <KanbanIcon />
                                                {i18n.t("tags.bulk.form.kanban")}
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

export default BulkTagModal;