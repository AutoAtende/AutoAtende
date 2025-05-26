import React, { useState } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Paper
} from "@mui/material";
import {
  GetApp as DownloadIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { i18n } from "../../../translate/i18n";
import { toast } from "../../../helpers/toast";
import BaseModal from "../../../components/BaseModal";
import BasePageContent from "../../../components/BasePageContent";
import BaseButton from "../../../components/BaseButton";
import api from "../../../services/api";

const ExtractContactsFromGroupModal = ({ open, onClose, group }) => {
  const [extracting, setExtracting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [extractResult, setExtractResult] = useState(null);

  const handleExtractContacts = async () => {
    if (!group) return;

    setExtracting(true);
    try {
      // Usar os dados do grupo já disponíveis localmente
      const participants = group.participantsJson || [];
      
      if (participants.length === 0) {
        toast.error("Nenhum participante encontrado neste grupo");
        return;
      }

      // Simular extração usando dados locais
      const { data } = await api.post(`/groups/${group.id}/extract-local-contacts`, {
        participants: participants
      });

      setExtractResult({
        total: participants.length,
        admins: participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length,
        members: participants.filter(p => !p.admin || p.admin === 'member').length
      });

      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      }

      toast.success(`${participants.length} contatos extraídos com sucesso!`);
    } catch (err) {
      toast.error("Erro ao extrair contatos do grupo");
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleClose = () => {
    setDownloadUrl("");
    setExtractResult(null);
    onClose();
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

  if (!group) return null;

  const participants = group.participantsJson || [];
  const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
  const members = participants.filter(p => !p.admin || p.admin === 'member');

  const renderGroupInfo = () => (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar
          src={group.profilePic ? `${process.env.REACT_APP_BACKEND_URL}${group.profilePic}` : undefined}
          sx={{ width: 50, height: 50, mr: 2 }}
        >
          <GroupIcon />
        </Avatar>
        <Box>
          <Typography variant="h6">{group.subject}</Typography>
          <Typography variant="body2" color="textSecondary">
            {participants.length} participantes
          </Typography>
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <Chip
          icon={<AdminIcon />}
          label={`${admins.length} Administradores`}
          color="warning"
          variant="outlined"
        />
        <Chip
          icon={<PersonIcon />}
          label={`${members.length} Membros`}
          color="default"
          variant="outlined"
        />
      </Box>

      {!extracting && !extractResult && (
        <BaseButton
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExtractContacts}
          fullWidth
        >
          Extrair Contatos para Excel
        </BaseButton>
      )}

      {extracting && (
        <Box display="flex" alignItems="center" justifyContent="center" p={2}>
          <CircularProgress size={30} sx={{ mr: 2 }} />
          <Typography variant="body2">
            Extraindo contatos...
          </Typography>
        </Box>
      )}

      {extractResult && downloadUrl && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            {extractResult.total} contatos extraídos com sucesso!
          </Alert>
          
          <BaseButton
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            fullWidth
          >
            Baixar Arquivo Excel
          </BaseButton>
        </Box>
      )}
    </Paper>
  );

  const renderParticipantsPreview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Preview dos Participantes
      </Typography>
      
      <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
        <List dense>
          {admins.length > 0 && (
            <>
              <ListItem>
                <Typography variant="subtitle2" color="warning.main">
                  Administradores ({admins.length})
                </Typography>
              </ListItem>
              {admins.slice(0, 5).map((participant, index) => (
                <ListItem key={`admin-${index}`}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <AdminIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={participant.id.split('@')[0]}
                    secondary="Administrador"
                  />
                </ListItem>
              ))}
              {admins.length > 5 && (
                <ListItem>
                  <ListItemText
                    primary={`... e mais ${admins.length - 5} administradores`}
                    sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
              <Divider />
            </>
          )}

          {members.length > 0 && (
            <>
              <ListItem>
                <Typography variant="subtitle2" color="text.primary">
                  Membros ({members.length})
                </Typography>
              </ListItem>
              {members.slice(0, 10).map((participant, index) => (
                <ListItem key={`member-${index}`}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={participant.id.split('@')[0]}
                    secondary="Membro"
                  />
                </ListItem>
              ))}
              {members.length > 10 && (
                <ListItem>
                  <ListItemText
                    primary={`... e mais ${members.length - 10} membros`}
                    sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </>
          )}
        </List>
      </Paper>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Os contatos serão exportados com os números de telefone. 
          Administradores e membros serão identificados em colunas separadas.
        </Typography>
      </Alert>
    </Box>
  );

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={`Extrair Contatos - ${group.subject}`}
      actions={modalActions}
      maxWidth="md"
    >
      <BasePageContent>
        <Box>
          {renderGroupInfo()}
          {renderParticipantsPreview()}
        </Box>
      </BasePageContent>
    </BaseModal>
  );
};

export default ExtractContactsFromGroupModal;