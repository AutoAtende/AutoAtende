import { Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { i18n } from "../../../../translate/i18n";
import CloseIcon from '@mui/icons-material/Close';
import React from 'react'
import { Container } from "./style";

export const ConfirmationModal = ({ title, message, onClose, onConfirm }) => {
    return (
        <Container>
            <DialogTitle id="confirm-dialog">{title}</DialogTitle>
            <DialogContent dividers>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={() => onClose(false)} startIcon={<CloseIcon />}>
                    {i18n.t("confirmationModal.buttons.cancel")}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        onClose();
                        onConfirm();
                    }}
                    startIcon={<ThumbUpAltIcon />}
                    color="secondary"
                >
                    {i18n.t("confirmationModal.buttons.confirm")}
                </Button>
            </DialogActions>
        </Container>
    )
}