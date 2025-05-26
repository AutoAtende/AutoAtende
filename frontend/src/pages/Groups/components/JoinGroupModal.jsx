import React, { useState } from "react";
import {
  TextField,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Alert,
  Button
} from "@mui/material";
import {
  Link as LinkIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import BaseModal from "../../../components/BaseModal";
import BaseButton from "../../../components/BaseButton";
import BasePageContent from "../../../components/BasePageContent";

const JoinGroupModal = ({ open, onClose }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setInviteCode("");
    setGroupInfo(null);
    setErrors({});
    onClose();
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setInviteCode(value);
    
    // Limpa erros quando o usuário digita
    if (errors.inviteCode) {
      setErrors({ ...errors, inviteCode: undefined });
    }
    
    // Limpa as informações do grupo quando o código muda
    if (groupInfo) {
      setGroupInfo(null);
    }
    
    // Se incluir a URL completa, extrai apenas o código
    if (value.includes('chat.whatsapp.com/')) {
      const code = value.split('chat.whatsapp.com/')[1];
      setInviteCode(code);
    }
  };

  const checkGroupInfo = async () => {
    // Validação
    if (!inviteCode || inviteCode.trim() === "") {
      setErrors({ inviteCode: i18n.t("groups.errors.inviteCodeRequired") });
      return;
    }
    
    setChecking(true);
    try {
      const cleanCode = inviteCode.replace("https://chat.whatsapp.com/", "");
      const { data } = await api.get(`/groups/invite/${cleanCode}`);
      setGroupInfo(data);
    } catch (err) {
      toast.error(err);
      setErrors({ inviteCode: i18n.t("groups.errors.invalidInviteCode") });
    } finally {
      setChecking(false);
    }
  };

  const handleJoinGroup = async () => {
    // Validação
    if (!inviteCode || inviteCode.trim() === "") {
      setErrors({ inviteCode: i18n.t("groups.errors.inviteCodeRequired") });
      return;
    }
    
    setLoading(true);
    try {
      const cleanCode = inviteCode.replace("https://chat.whatsapp.com/", "");
      await api.post("/groups/join", { code: cleanCode });
      toast.success(i18n.t("groups.joinSuccess"));
      handleClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modalActions = [
    {
      label: i18n.t("cancel"),
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      disabled: loading,
      icon: <CancelIcon />
    },
    {
      label: loading ? i18n.t("joining") : i18n.t("groups.join"),
      onClick: handleJoinGroup,
      variant: "contained",
      color: "primary",
      disabled: loading || checking,
      icon: loading ? <CircularProgress size={20} /> : <ArrowForwardIcon />
    }
  ];

  const renderContent = () => {
    if (!groupInfo) {
      return (
        <BasePageContent>
          <Box>
            <Typography variant="body1" gutterBottom>
              {i18n.t("groups.joinGroupDescription")}
            </Typography>
            
            <Box display="flex" mb={3} gap={1}>
              <TextField
                label={i18n.t("groups.inviteCode")}
                placeholder="https://chat.whatsapp.com/AbCdEfGhIjK123456789"
                value={inviteCode}
                onChange={handleCodeChange}
                fullWidth
                error={Boolean(errors.inviteCode)}
                helperText={errors.inviteCode}
                variant="outlined"
                disabled={loading || checking}
              />
              
              <BaseButton
                variant="contained"
                color="primary"
                onClick={checkGroupInfo}
                disabled={loading || checking || !inviteCode}
                sx={{ minWidth: 100 }}
              >
                {checking ? <CircularProgress size={24} /> : i18n.t("groups.check")}
              </BaseButton>
            </Box>
          </Box>
        </BasePageContent>
      );
    }

    return (
      <BasePageContent>
        <Box>
          <Typography variant="body1" gutterBottom>
            {i18n.t("groups.joinGroupDescription")}
          </Typography>
          
          <Box display="flex" mb={3} gap={1}>
            <TextField
              label={i18n.t("groups.inviteCode")}
              placeholder="https://chat.whatsapp.com/AbCdEfGhIjK123456789"
              value={inviteCode}
              onChange={handleCodeChange}
              fullWidth
              error={Boolean(errors.inviteCode)}
              helperText={errors.inviteCode}
              variant="outlined"
              disabled={loading || checking}
            />
            
            <BaseButton
              variant="contained"
              color="primary"
              onClick={checkGroupInfo}
              disabled={loading || checking || !inviteCode}
              sx={{ minWidth: 100 }}
            >
              {checking ? <CircularProgress size={24} /> : i18n.t("groups.check")}
            </BaseButton>
          </Box>
          
          <Alert severity="info" icon={<LinkIcon />} sx={{ mb: 2 }}>
            {i18n.t("groups.groupInfoFound")}
          </Alert>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {groupInfo.subject}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {i18n.t("groups.createdBy")}: {groupInfo.creator?.split('@')[0] || i18n.t("groups.unknown")}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {i18n.t("groups.participants")}: {groupInfo.size || 0}
            </Typography>
            
            {groupInfo.desc && (
              <Box mt={2}>
                <Typography variant="body2">
                  {groupInfo.desc}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </BasePageContent>
    );
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={i18n.t("groups.joinGroup")}
      actions={modalActions}
      loading={loading}
    >
      {renderContent()}
    </BaseModal>
  );
};

export default JoinGroupModal;