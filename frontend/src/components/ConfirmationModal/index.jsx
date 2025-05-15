import React from "react";
import { styled } from "@mui/material/styles";
import {
  Button,
  DialogActions,
  DialogContent,
  Typography,
  Stack
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

import BaseModal from "../shared/BaseModal";
import { i18n } from "../../translate/i18n";

const StyledContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  minWidth: {
    xs: '280px',
    sm: '400px'
  }
}));

const StyledActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  gap: theme.spacing(1)
}));

const ConfirmationModal = ({ 
  title, 
  children, 
  open, 
  onClose, 
  onConfirm, 
  isShowConfirmButton = true, 
  message = null 
}) => {
  const handleConfirm = () => {
    onClose(false);
    onConfirm();
  };

  const actions = [
    {
      label: i18n.t("confirmationModal.buttons.cancel"),
      onClick: () => onClose(false),
      icon: <CloseIcon />,
      variant: "outlined",
      color: "primary"
    }
  ];

  if (isShowConfirmButton) {
    actions.push({
      label: i18n.t("confirmationModal.buttons.confirm"),
      onClick: handleConfirm,
      icon: <ThumbUpAltIcon />,
      variant: "contained",
      color: "secondary"
    });
  }

  return (
    <BaseModal
      open={open}
      onClose={() => onClose(false)}
      title={title}
      maxWidth="sm"
      actions={actions}
    >
      <StyledContent>
        <Typography variant="body1">
          {message || children}
        </Typography>
      </StyledContent>
    </BaseModal>
  );
};

export default ConfirmationModal;