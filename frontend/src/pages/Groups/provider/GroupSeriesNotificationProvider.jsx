import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Paper
} from "@mui/material";
import {
  AutoAwesome as AutoIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from "@mui/icons-material";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";
import { toast } from "../../../helpers/toast";

// Context para gerenciar notificações de séries de grupos
const GroupSeriesNotificationContext = createContext();

export const useGroupSeriesNotifications = () => {
  const context = useContext(GroupSeriesNotificationContext);
  if (!context) {
    throw new Error("useGroupSeriesNotifications deve ser usado dentro de GroupSeriesNotificationProvider");
  }
  return context;
};

export const GroupSeriesNotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user?.companyId) return;

    const socket = socketManager.GetSocket(user.companyId);
    
    if (socket) {
      // Listener para grupos criados automaticamente
      socket.on("auto-group-created", (data) => {
        const notification = {
          id: Date.now(),
          type: "group_created",
          timestamp: new Date(),
          data: data,
          severity: "success",
          title: "Novo Grupo Criado Automaticamente",
          message: `${data.newGroup.name} foi criado na série ${data.series}`,
          persistent: false,
          autoHide: 6000
        };
        
        addNotification(notification);
      });

      // Listener para grupos desativados
      socket.on("auto-group-deactivated", (data) => {
        const notification = {
          id: Date.now(),
          type: "group_deactivated",
          timestamp: new Date(),
          data: data,
          severity: "warning",
          title: "Grupo Desativado",
          message: `${data.group.name} foi desativado (capacidade esgotada)`,
          persistent: false,
          autoHide: 4000
        };
        
        addNotification(notification);
      });

      // Listener para estatísticas de monitoramento
      socket.on("group-monitoring-stats", (data) => {
        if (data.action === "monitoring_completed" && data.stats.errors?.length > 0) {
          const notification = {
            id: Date.now(),
            type: "monitoring_error",
            timestamp: new Date(),
            data: data,
            severity: "error",
            title: "Erros no Monitoramento",
            message: `${data.stats.errors.length} erro(s) detectado(s) durante o monitoramento`,
            persistent: true,
            autoHide: false
          };
          
          addNotification(notification);
        }
      });

      // Listener para séries próximas da capacidade
      socket.on("series-near-capacity", (data) => {
        const notification = {
          id: Date.now(),
          type: "series_warning",
          timestamp: new Date(),
          data: data,
          severity: "warning",
          title: "Série Próxima da Capacidade",
          message: `A série ${data.seriesName} está com ${data.occupancyPercentage}% de ocupação`,
          persistent: true,
          autoHide: false
        };
        
        addNotification(notification);
      });

      return () => {
        socket.off("auto-group-created");
        socket.off("auto-group-deactivated");
        socket.off("group-monitoring-stats");
        socket.off("series-near-capacity");
      };
    }
  }, [user?.companyId, socketManager]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Manter máximo 5
    setCurrentNotification(notification);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (currentNotification?.id === id) {
      setCurrentNotification(null);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setCurrentNotification(null);
  };

  const handleCopyInviteLink = (inviteLink) => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link de convite copiado!");
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "group_created":
        return (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                icon={<AutoIcon />}
                label={notification.data.series}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<GroupIcon />}
                label={`${notification.data.newGroup.name}`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
            
            {notification.data.oldGroup && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Grupo anterior: {notification.data.oldGroup.name} 
                ({notification.data.oldGroup.occupancy.toFixed(1)}% ocupado)
              </Typography>
            )}
            
            {notification.data.newGroup.inviteLink && (
              <Button
                size="small"
                startIcon={<LinkIcon />}
                onClick={() => handleCopyInviteLink(notification.data.newGroup.inviteLink)}
                sx={{ mt: 1 }}
              >
                Copiar Link do Novo Grupo
              </Button>
            )}
          </Box>
        );

      case "group_deactivated":
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              O grupo atingiu sua capacidade máxima de {notification.data.group.maxParticipants} participantes.
            </Typography>
            <Chip
              label={`${notification.data.group.participantCount}/${notification.data.group.maxParticipants} participantes`}
              size="small"
              color="error"
              variant="outlined"
            />
          </Box>
        );

      case "monitoring_error":
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              Erros detectados durante a verificação automática:
            </Typography>
            <Box sx={{ maxHeight: 100, overflow: 'auto' }}>
              {notification.data.stats.errors.slice(0, 3).map((error, index) => (
                <Typography key={index} variant="caption" display="block" color="error">
                  • {error}
                </Typography>
              ))}
              {notification.data.stats.errors.length > 3 && (
                <Typography variant="caption" color="textSecondary">
                  ... e mais {notification.data.stats.errors.length - 3} erro(s)
                </Typography>
              )}
            </Box>
          </Box>
        );

      case "series_warning":
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              A série está próxima da capacidade e pode precisar de atenção.
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip
                label={`${notification.data.occupancyPercentage}% ocupado`}
                size="small"
                color="warning"
                variant="outlined"
              />
              {notification.data.autoCreateEnabled ? (
                <Chip
                  icon={<CheckIcon />}
                  label="Auto-criação ativa"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<WarningIcon />}
                  label="Auto-criação desabilitada"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const contextValue = {
    notifications,
    currentNotification,
    addNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <GroupSeriesNotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Snackbar para notificação atual */}
      <Snackbar
        open={!!currentNotification}
        autoHideDuration={currentNotification?.autoHide || null}
        onClose={() => setCurrentNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        {currentNotification && (
          <Alert
            severity={currentNotification.severity}
            onClose={() => setCurrentNotification(null)}
            sx={{ 
              minWidth: 350,
              maxWidth: 500,
              '& .MuiAlert-message': { 
                width: '100%' 
              }
            }}
            action={
              <Box display="flex" alignItems="center" gap={1}>
                {!showDetails && (
                  <IconButton
                    size="small"
                    onClick={() => setShowDetails(true)}
                    color="inherit"
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                )}
                {showDetails && (
                  <IconButton
                    size="small"
                    onClick={() => setShowDetails(false)}
                    color="inherit"
                  >
                    <ExpandLessIcon />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => setCurrentNotification(null)}
                  color="inherit"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            }
          >
            <AlertTitle sx={{ mb: showDetails ? 1 : 0 }}>
              {currentNotification.title}
            </AlertTitle>
            <Typography variant="body2" gutterBottom>
              {currentNotification.message}
            </Typography>
            
            <Collapse in={showDetails}>
              <Box sx={{ mt: 1 }}>
                {renderNotificationContent(currentNotification)}
              </Box>
            </Collapse>
          </Alert>
        )}
      </Snackbar>

      {/* Lista de notificações persistentes (canto da tela) */}
      {notifications.filter(n => n.persistent && n.id !== currentNotification?.id).length > 0 && (
        <Paper
          sx={{
            position: 'fixed',
            top: 100,
            right: 16,
            width: 300,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1300,
            p: 1
          }}
          elevation={8}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">
              Alertas Ativos
            </Typography>
            <Button size="small" onClick={clearAllNotifications}>
              Limpar Todos
            </Button>
          </Box>
          
          {notifications
            .filter(n => n.persistent && n.id !== currentNotification?.id)
            .map((notification) => (
              <Alert
                key={notification.id}
                severity={notification.severity}
                size="small"
                onClose={() => removeNotification(notification.id)}
                sx={{ mb: 1, fontSize: '0.75rem' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" display="block">
                  {notification.message}
                </Typography>
              </Alert>
            ))}
        </Paper>
      )}
    </GroupSeriesNotificationContext.Provider>
  );
};

export default GroupSeriesNotificationProvider;