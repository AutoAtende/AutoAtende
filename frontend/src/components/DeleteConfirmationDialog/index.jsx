import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  warningContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.error.light,
    borderRadius: theme.shape.borderRadius,
    "& .MuiSvgIcon-root": {
      color: theme.palette.error.main,
    },
  },
  detailsContainer: {
    marginTop: theme.spacing(2),
  },
  actionsContainer: {
    padding: theme.spacing(2),
    gap: theme.spacing(1),
  },
  warningIcon: {
    fontSize: 32,
  },
  buttonProgress: {
    color: theme.palette.error.main,
  }
}));

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  warningMessage,
  confirmationMessage,
  additionalDetails = [],
  confirmLoading = false,
}) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <div className={classes.warningContainer}>
          <WarningIcon className={classes.warningIcon} />
          <Typography variant="h6">{warningMessage}</Typography>
        </div>
        
        <Typography variant="body1" gutterBottom>
          {confirmationMessage}
        </Typography>

        {additionalDetails.length > 0 && (
          <div className={classes.detailsContainer}>
            {additionalDetails.map((detail, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                color="textSecondary"
                gutterBottom
              >
                {detail.label}: {detail.value}
              </Typography>
            ))}
          </div>
        )}
      </DialogContent>

      <DialogActions className={classes.actionsContainer}>
        <Button
          onClick={!confirmLoading ? onClose : undefined}
          color="inherit"
          disabled={confirmLoading}
          startIcon={<CloseIcon />}
          aria-label={i18n.t("deleteConfirmationDialog.cancelButton")}
        >
          {i18n.t("deleteConfirmationDialog.cancelButton")}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={confirmLoading}
          endIcon={
            confirmLoading ? (
              <CircularProgress 
                size={20} 
                className={classes.buttonProgress}
              />
            ) : (
              <DeleteIcon />
            )
          }
          aria-label={i18n.t("deleteConfirmationDialog.confirmButton")}
        >
          {i18n.t("deleteConfirmationDialog.confirmButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;