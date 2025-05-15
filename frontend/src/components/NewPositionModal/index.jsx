import React from 'react';
import { styled } from "@mui/material/styles";
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';

// Material UI Components
import {
    TextField,
    Button,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Stack
} from '@mui/material';

// Material UI Icons
import {
    Close as CloseIcon,
    Save as SaveIcon,
    Work as WorkIcon
} from '@mui/icons-material';

// Custom Components
import BaseModal from "../shared/BaseModal";

// Services & Translations
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from '../../services/api';

// Styled Components
const FormContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    }
}));

const ButtonProgress = styled(CircularProgress)({
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
});

// Validation Schema
const NewPositionSchema = Yup.object().shape({
    name: Yup.string()
        .required(i18n.t("newPositionModal.validation.required"))
});

const NewPositionModal = ({ open, onClose, onSave, employerId }) => {
    if (!employerId) return null;

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const { data } = await api.post('/positions', {
                name: values.name,
                employerId
            });
            onSave(data);
            toast.success(i18n.t("newPositionModal.success"));
            onClose();
        } catch (err) {
            toast.error(i18n.t("newPositionModal.error"));
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const modalActions = [
        <Tooltip title={i18n.t("newPositionModal.buttons.cancel")} key="cancel">
            <Button
                onClick={onClose}
                color="secondary"
                variant="outlined"
                startIcon={<CloseIcon />}
            >
                {i18n.t("newPositionModal.buttons.cancel")}
            </Button>
        </Tooltip>,
        <Tooltip title={i18n.t("newPositionModal.buttons.save")} key="save">
            <span>
                <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    startIcon={<SaveIcon />}
                >
                    {i18n.t("newPositionModal.buttons.save")}
                </Button>
            </span>
        </Tooltip>
    ];

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={i18n.t("newPositionModal.title")}
            maxWidth="sm"
            actions={modalActions}
        >
            <Formik
                initialValues={{ name: '' }}
                validationSchema={NewPositionSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form>
                        <FormContainer>
                            <Field
                                as={TextField}
                                autoFocus
                                name="name"
                                label={i18n.t("newPositionModal.form.name")}
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <WorkIcon sx={{ color: 'primary.main' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {isSubmitting && (
                                <ButtonProgress size={24} />
                            )}
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </BaseModal>
    );
};

export default NewPositionModal;