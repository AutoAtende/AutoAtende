import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { TableContainer, Table, TableBody, TableRow, TableCell } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

import { parseISO, format } from "date-fns";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
    timestamp: {
        minWidth: 250
    }
}));

const MessageHistoryModal = ({open, onClose, oldMessages}) => {
    const classes = useStyles();

    return (
        <Dialog
            open={open}
            onClose={() => onClose(false)}
            aria-labelledby="dialog-title"
        >
            <DialogTitle id="dialog-title">{i18n.t("messageHistoryModal.title")}</DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table aria-label="message-history-table">
                        <TableBody>
                            {oldMessages && oldMessages.map((oldMessage) => (
                                <TableRow
                                    key={oldMessage.id}
                                >
                                    <TableCell component="th" scope="row">
                                        {oldMessage.body}
                                    </TableCell>
                                    <TableCell align="right" className={classes.timestamp}>
                                        {format(parseISO(oldMessage.createdAt), "dd/MM HH:mm")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button
                    autoFocus
                    onClick={() => onClose(false)}
                >
                    {i18n.t("messageHistoryModal.close")}
                </Button>
            </DialogActions>

        </Dialog>
    );
};

export default MessageHistoryModal;
