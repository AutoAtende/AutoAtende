import React, { useState, useEffect, useCallback, memo } from 'react';
import { styled } from '@mui/material/styles';
import { 
  LinearProgress, 
  Typography,
  Box 
} from '@mui/material';

import BaseModal from "../shared/BaseModal";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";

const StyledContent = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
}));

const StyledProgress = styled(LinearProgress)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  }
}));

const StatusMessage = memo(({ sending, message, error }) => (
  <>
    <Typography variant="body1" gutterBottom>
      {sending ? i18n.t("email.dueDateNotification.sending") : message}
    </Typography>
    {error && (
      <Typography 
        color="error" 
        variant="body2" 
        gutterBottom
        sx={{ mt: 1 }}
      >
        {error}
      </Typography>
    )}
  </>
));

const ProgressIndicator = memo(({ progress }) => (
  <>
    <StyledProgress variant="determinate" value={progress} />
    <Typography 
      variant="body2" 
      align="center" 
      color="textSecondary"
      sx={{ mt: 1 }}
    >
      {`${Math.round(progress)}%`}
    </Typography>
  </>
));

const DueDateEmailModal = ({ open, onClose }) => {
  const [state, setState] = useState({
    progress: 0,
    sending: false,
    message: '',
    error: null
  });

  const handleClose = useCallback(() => {
    if (!state.sending) {
      onClose();
    }
  }, [state.sending, onClose]);

  useEffect(() => {
    if (!open) return;

    setState({
      progress: 0,
      sending: true,
      message: '',
      error: null
    });

    const eventSource = new EventSource(
      `${process.env.REACT_APP_BACKEND_URL}/email/services/sendDueDate`
    );

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setState(prev => ({
          ...prev,
          progress: data.progress || prev.progress,
          message: data.message || prev.message,
          sending: !data.completed,
        }));

        if (data.completed) {
          eventSource.close();
          toast.success(i18n.t("email.dueDateNotification.success"));
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    const handleError = (err) => {
      console.error("SSE Error:", err);
      setState(prev => ({
        ...prev,
        error: i18n.t("email.dueDateNotification.error"),
        sending: false
      }));
      eventSource.close();
      toast.error(i18n.t("email.dueDateNotification.error"));
    };

    eventSource.onmessage = handleMessage;
    eventSource.onerror = handleError;

    return () => {
      eventSource.close();
    };
  }, [open]);

  const modalActions = [
    {
      label: i18n.t("email.dueDateNotification.close"),
      onClick: handleClose,
      disabled: state.sending,
      color: "primary",
      variant: "contained"
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={i18n.t("email.dueDateNotification.title")}
      actions={modalActions}
      maxWidth="sm"
    >
      <StyledContent>
        <StatusMessage 
          sending={state.sending}
          message={state.message}
          error={state.error}
        />
        <ProgressIndicator progress={state.progress} />
      </StyledContent>
    </BaseModal>
  );
};

export default memo(DueDateEmailModal);