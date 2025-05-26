import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Paper
} from "@mui/material";
import {
  CloudSync as SyncIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  People as ParticipantIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { i18n } from "../../../translate/i18n";
import { toast } from "../../../helpers/toast";
import BaseModal from "../../../components/BaseModal";
import BasePageContent from "../../../components/BasePageContent";
import { SocketContext } from "../../../context/Socket/SocketContext";
import { AuthContext } from "../../../context/Auth/AuthContext";
import api from "../../../services/api";

const SyncGroupsModal = ({ open, onClose, onComplete }) => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [syncResult, setSyncResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState("initial"); // initial, syncing, completed, error

  useEffect(() => {
    if (open && user?.companyId) {
      const socket = socketManager.GetSocket(user.companyId);
      
      if (socket) {
        const handleSyncGroups = (data) => {
          switch (data.action) {
            case "start":
              setSyncing(true);
              setStep("syncing");
              setSyncStatus(data.status);
              setSyncProgress({ current: 0, total: 0 });
              break;
              
            case "progress":
              setSyncStatus(data.status);
              if (data.progress) {
                setSyncProgress(data.progress);
              }
              break;
              
            case "complete":
              setSyncing(false);
              setStep("completed");
              setSyncResult(data.result);
              setSyncStatus(data.status);
              if (data.result?.errors?.length > 0) {
                setErrors(data.result.errors);
              }
              break;
              
            case "error":
              setSyncing(false);
              setStep("error");
              setSyncStatus("Erro na sincronização");
              setErrors([data.error]);
              break;
          }
        };

        socket.on("sync-groups", handleSyncGroups);

        return () => {
          socket.off("sync-groups", handleSyncGroups);
        };
      }
    }
  }, [open, user?.companyId, socketManager]);

  const handleStartSync = async () => {
    try {
      setSyncing(true);
      setStep("syncing");
      setSyncStatus("Iniciando sincronização...");
      setErrors([]);
      setSyncResult(null);
      
      await api.post("/groups/sync");
    } catch (error) {
      toast.error("Erro ao iniciar sincronização de grupos");
      setSyncing(false);
      setStep("error");
      setErrors([error.message || "Erro desconhecido"]);
    }
  };

  const handleClose = () => {
    if (!syncing) {
      setSyncStatus("");
      setSyncProgress({ current: 0, total: 0 });
      setSyncResult(null);
      setErrors([]);
      setStep("initial");
      onClose();
    }
  };

  const handleComplete = () => {
    onComplete();
    handleClose();
  };

  const renderProgress = () => {
    if (syncProgress.total > 0) {
      const percentage = Math.round((syncProgress.current / syncProgress.total) * 100);
      return (
        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Progresso: {syncProgress.current} de {syncProgress.total}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={percentage} />
        </Box>
      );
    }
    return null;
  };

  const renderSyncResult = () => {
    if (!syncResult) return null;

    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {i18n.t("groups.sync.results")}
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <GroupIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={`${syncResult.totalGroups} grupos encontrados`}
              secondary="Total de grupos descobertos nas conexões WhatsApp"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary={`${syncResult.newGroups} novos grupos`}
              secondary="Grupos adicionados ao sistema"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <SyncIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary={`${syncResult.updatedGroups} grupos atualizados`}
              secondary="Grupos já existentes que foram sincronizados"
            />
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem>
            <ListItemIcon>
              <AdminIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{syncResult.adminGroups} grupos como admin</span>
                  <Chip label="Gerenciamento completo" size="small" color="warning" />
                </Box>
              }
              secondary="Você pode gerenciar completamente estes grupos"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ParticipantIcon color="default" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{syncResult.participantGroups} grupos como participante</span>
                  <Chip label="Extração de contatos" size="small" color="default" />
                </Box>
              }
              secondary="Você pode extrair contatos destes grupos"
            />
          </ListItem>
        </List>
      </Paper>
    );
  };

  const renderErrors = () => {
    if (errors.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Alguns grupos não puderam ser sincronizados:
        </Alert>
        
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2" color="error" paragraph>
              • {error}
            </Typography>
          ))}
        </Paper>
      </Box>
    );
  };

  const getModalActions = () => {
    switch (step) {
      case "initial":
        return [
          {
            label: i18n.t("cancel"),
            onClick: handleClose,
            variant: "outlined",
            color: "secondary",
            icon: <CloseIcon />
          },
          {
            label: "Sincronizar Grupos",
            onClick: handleStartSync,
            variant: "contained",
            color: "primary",
            disabled: syncing,
            icon: <SyncIcon />
          }
        ];
        
      case "syncing":
        return [
          {
            label: "Sincronizando...",
            onClick: () => {},
            variant: "contained",
            color: "primary",
            disabled: true,
            icon: <CircularProgress size={20} />
          }
        ];
        
      case "completed":
        return [
          {
            label: "Concluir",
            onClick: handleComplete,
            variant: "contained",
            color: "primary",
            icon: <CheckIcon />
          }
        ];
        
      case "error":
        return [
          {
            label: "Tentar Novamente",
            onClick: () => setStep("initial"),
            variant: "outlined",
            color: "primary",
            icon: <SyncIcon />
          },
          {
            label: "Fechar",
            onClick: handleClose,
            variant: "contained",
            color: "secondary",
            icon: <CloseIcon />
          }
        ];
        
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "initial":
        return (
          <BasePageContent
            empty={true}
            emptyProps={{
              icon: <SyncIcon />,
              title: "Sincronizar Grupos do WhatsApp",
              message: "Esta ação irá sincronizar todos os grupos do WhatsApp com o sistema. Os grupos serão organizados de acordo com suas permissões.",
              showButton: false
            }}
          >
            <Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AdminIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Grupos como Administrador"
                    secondary="Gerenciamento completo: editar, adicionar/remover participantes, configurações"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ParticipantIcon color="default" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Grupos como Participante"
                    secondary="Funcionalidades limitadas: visualizar e extrair contatos"
                  />
                </ListItem>
              </List>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Este processo pode levar alguns minutos dependendo da quantidade de grupos.
              </Alert>
            </Box>
          </BasePageContent>
        );

      case "syncing":
        return (
          <BasePageContent>
            <Box>
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <CircularProgress size={60} />
              </Box>
              
              <Typography variant="body1" align="center" gutterBottom>
                {syncStatus}
              </Typography>
              
              {renderProgress()}
            </Box>
          </BasePageContent>
        );

      case "completed":
        return (
          <BasePageContent>
            <Box>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <CheckIcon color="success" sx={{ fontSize: 60 }} />
              </Box>
              
              <Typography variant="h6" align="center" gutterBottom>
                Sincronização Concluída!
              </Typography>
              
              <Typography variant="body2" align="center" color="textSecondary" paragraph>
                {syncStatus}
              </Typography>
              
              {renderSyncResult()}
              {renderErrors()}
            </Box>
          </BasePageContent>
        );

      case "error":
        return (
          <BasePageContent>
            <Box>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <ErrorIcon color="error" sx={{ fontSize: 60 }} />
              </Box>
              
              <Typography variant="h6" align="center" gutterBottom color="error">
                Erro na Sincronização
              </Typography>
              
              <Typography variant="body2" align="center" color="textSecondary" paragraph>
                {syncStatus}
              </Typography>
              
              {renderErrors()}
            </Box>
          </BasePageContent>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Sincronizar Grupos do WhatsApp"
      actions={getModalActions()}
      maxWidth="md"
    >
      {renderStepContent()}
    </BaseModal>
  );
};

export default SyncGroupsModal;