import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Tooltip
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { format } from 'date-fns';
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import BaseModal from "../../../components/BaseModal";
import BasePageContent from "../../../components/BasePageContent";
import BaseButton from "../../../components/BaseButton";

const GroupRequestsModal = ({ open, onClose, group }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);

  useEffect(() => {
    if (open && group) {
      loadRequests();
    }
  }, [open, group]);

  const loadRequests = async () => {
    if (!group) return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/groups/${group.id}/requests`);
      setRequests(data);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRequests();
    } finally {
      setRefreshing(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleApprove = async (participantId) => {
    setProcessingIds(prev => [...prev, participantId]);
    try {
      await api.put(`/groups/${group.id}/requests`, {
        participants: [participantId],
        action: "approve"
      });
      
      // Remove a solicitação aprovada da lista
      setRequests(requests.filter(r => r.jid !== participantId));
      toast.success(i18n.t("groups.participantApproved"));
    } catch (err) {
      toast.error(err);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== participantId));
    }
  };

  const handleReject = async (participantId) => {
    setProcessingIds(prev => [...prev, participantId]);
    try {
      await api.put(`/groups/${group.id}/requests`, {
        participants: [participantId],
        action: "reject"
      });
      
      // Remove a solicitação rejeitada da lista
      setRequests(requests.filter(r => r.jid !== participantId));
      toast.success(i18n.t("groups.participantRejected"));
    } catch (err) {
      toast.error(err);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== participantId));
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp * 1000);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "";
    }
  };

  const modalActions = [
    {
      label: i18n.t("close"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      icon: <CloseIcon />
    }
  ];

  const renderModalTitle = () => (
    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
      <Typography variant="h6">
        {i18n.t("groups.pendingRequests")} - {group?.subject}
      </Typography>
      <Tooltip title={i18n.t("refresh")}>
        <IconButton onClick={handleRefresh} disabled={refreshing || loading} size="small" color="inherit">
          {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderEmptyState = () => (
    <BasePageContent
      empty={true}
      emptyProps={{
        icon: <PersonAddIcon />,
        title: i18n.t("groups.noRequests"),
        message: i18n.t("groups.requestsDescription"),
        showButton: false
      }}
    />
  );

  const renderRequestsList = () => (
    <BasePageContent>
      <Paper variant="outlined">
        <List>
          {requests.map((request, index) => (
            <React.Fragment key={request.jid}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    {request.jid.split('@')[0].charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={request.jid.split('@')[0]}
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t("groups.requestedAt")}: {formatTimestamp(request.requestedTimestamp)}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Box display="flex" gap={1}>
                    <Tooltip title={i18n.t("groups.approve")}>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => handleApprove(request.jid)}
                        disabled={processingIds.includes(request.jid)}
                      >
                        {processingIds.includes(request.jid) ? (
                          <CircularProgress size={24} />
                        ) : (
                          <ApproveIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={i18n.t("groups.reject")}>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleReject(request.jid)}
                        disabled={processingIds.includes(request.jid)}
                      >
                        <RejectIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < requests.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      <Box mt={3} p={1}>
        <Box display="flex" alignItems="center">
          <InfoIcon color="info" style={{ marginRight: 8 }} />
          <Typography variant="body2" color="textSecondary">
            {i18n.t("groups.requestsInfo")}
          </Typography>
        </Box>
      </Box>
    </BasePageContent>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <BasePageContent loading={true} />
      );
    }

    if (requests.length === 0) {
      return renderEmptyState();
    }

    return renderRequestsList();
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={renderModalTitle()}
      actions={modalActions}
      loading={loading}
      maxWidth="md"
    >
      {renderContent()}
    </BaseModal>
  );
};

export default GroupRequestsModal;