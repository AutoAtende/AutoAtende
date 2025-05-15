import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    MenuItem,
    Select,
    TextField,
    Grid,
    Typography,
    Dialog,
    DialogContent,
    DialogTitle,
    InputLabel
} from "@mui/material";
import * as Yup from "yup";
import makeStyles from '@mui/styles/makeStyles';
import { Formik, Form, Field } from 'formik';
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import { ButtonGroup } from "./styles";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing(2),
    },
    button: {
        marginTop: theme.spacing(2),
        alignSelf: "flex-end",
    },
}));

const GlpiModal = ({ onClose, open }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const initialValues = { title: '', message: '', status: 0 };

    const handleCreateTicket = async (values, { resetForm }) => {
        if (!values.status) {
            toast.error("O status de urgência é obrigatório.")
            return
        }
        setLoading(true);
        try {
            const response = await api.get("/authUser");
            if (response?.data?.sessionToken) {
                const sessionToken = response.data.sessionToken;
                await api.post('/creatTicket', {
                    title: values.title,
                    message: values.message,
                    sessionToken,
                    status: values.status
                });
                resetForm();
                onClose(); // Close the modal after creating the ticket
            }
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const GlpiSchema = Yup.object().shape({
        title: Yup.string()
            .required("O título é obrigatório"),
        message: Yup.string().required("A descrição é obrigatório"),
        status: Yup.string().required("O status de urgência é obrigatório.")
    });


    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent>
                <Formik
                    initialValues={initialValues}
                    validationSchema={GlpiSchema}
                    onSubmit={handleCreateTicket}
                >
                    {({ values, handleChange, touched, errors }) => (
                        <Form className={classes.root}>
                            <Typography variant="h6">{i18n.t("ticket.glpi.title")}</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("ticket.glpi.titleField")}
                                        name="title"
                                        variant="outlined"
                                        fullWidth
                                        margin="dense"
                                        error={touched.title && Boolean(errors.title)}
                                        helperText={touched.title && errors.title}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("ticket.glpi.descriptionField")}
                                        name="message"
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        fullWidth
                                        margin="dense"
                                        error={touched.message && Boolean(errors.message)}
                                        helperText={touched.message && errors.message}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl name="status" fullWidth>
                                        <InputLabel id="contactList-selection-label">{i18n.t("ticket.glpi.urgency.title")}</InputLabel>
                                        <Field
                                            as={Select}
                                            name="status"
                                            label='Urgência'
                                            labelId="contactList-selection-label"
                                            onChange={handleChange}
                                            displayEmpty
                                            variant="outlined"
                                        >
                                            <MenuItem value={5}>{i18n.t("ticket.glpi.urgency.veryHigh")}</MenuItem>
                                            <MenuItem value={4}>{i18n.t("ticket.glpi.urgency.high")}</MenuItem>
                                            <MenuItem value={3}>{i18n.t("ticket.glpi.urgency.medium")}</MenuItem>
                                            <MenuItem value={2}>{i18n.t("ticket.glpi.urgency.low")}</MenuItem>
                                            <MenuItem value={1}>{i18n.t("ticket.glpi.urgency.veryLow")}</MenuItem>
                                        </Field>
                                    </FormControl>
                                </Grid>
                                <ButtonGroup>
                                    <Button
                                        variant="outlined"
                                        onClick={onClose}
                                        color="secondary"
                                        startIcon={<CloseIcon />}
                                    >
                                        {i18n.t("ticket.glpi.buttons.cancel")}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        disabled={loading}
                                        startIcon={<SaveIcon />}
                                    >
                                        {loading ? i18n.t("ticket.glpi.buttons.creatingTicket") : i18n.t("ticket.glpi.buttons.createTicket")}
                                    </Button>
                                </ButtonGroup>
                            </Grid>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default GlpiModal;
