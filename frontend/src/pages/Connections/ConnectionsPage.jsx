import React, { useState, useEffect, useContext, useCallback } from "react";
import { toast } from "../../helpers/toast";
import { format, parseISO } from "date-fns";

// MUI Components
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Typography,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  useTheme
} from "@mui/material";

// Icons
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrCodeIcon,
  SignalCellular4Bar as ConnectedIcon,
  SignalCellularConnectedNoInternet0Bar as DisconnectedIcon,
  Refresh as RefreshIcon,
  WhatsApp as WhatsAppIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as DuplicateIcon,
  SwapHoriz as TransferIcon,
  Delete as ForceDeleteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

// Componentes
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import WhatsAppModal from "./components/WhatsAppModal";
import QrcodeModal from "./components/QRCodeModal";
import ActionButton from "./components/ActionButton";
import ImportProgressModal from './components/ImportProgressModal';

// Contexto, API e i18n
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { Can } from "../../components/Can";

const ConnectionsPage = () => {
  const theme = useTheme();
  
  // Estado para conexões e operações
  const [whatsApps, setWhatsApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [duplicating, setDuplicating] = useState(false); // Estado para controle de duplicação
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedImportWhatsApp, setSelectedImportWhatsApp] = useState(null);

  // Estado para diálogos de confirmação
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    action: null,
  });

  // Estado para transferência de tickets
  const [transferDialog, setTransferDialog] = useState({
    open: false,
    sourceWhatsAppId: null,
    targetWhatsAppId: "",
  });

  // Contexto de autenticação
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  // Buscar conexões com useCallback para permitir uso em dependências
  const fetchWhatsApps = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/whatsapp");
      if (Array.isArray(data)) {
        console.log("Conexões carregadas:", data.length);
        setWhatsApps(data);
      } else {
        console.error("API retornou dados inesperados:", data);
        setWhatsApps([]);
      }
    } catch (err) {
      console.error("Erro ao buscar conexões:", err);
      toast.error(i18n.t("connections.toasts.fetchError"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar conexões ao montar o componente
  useEffect(() => {
    fetchWhatsApps();
  }, [fetchWhatsApps]);

  // Configurar socket para atualizações em tempo real
  useEffect(() => {
    
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;
    
    const handleWhatsAppUpdate = (data) => {
        console.log('Evento de WhatsApp recebido:', data);
        
        // Atualização imediata do estado antes de buscar novamente
        if (data.action === "update" && data.whatsapp) {
            setWhatsApps(prevWhatsApps => {
                return prevWhatsApps.map(wa => 
                    wa.id === data.whatsapp.id ? { ...wa, ...data.whatsapp } : wa
                );
            });
        }
        
        // Buscar todos os dados atualizados
        fetchWhatsApps();
    };

    const handleSessionUpdate = (data) => {
        console.log('Evento de sessão recebido:', data);
        
        // Atualizar imediatamente se temos dados da sessão
        if (data.action === "update" && data.session) {
            setWhatsApps(prevWhatsApps => {
                return prevWhatsApps.map(wa => 
                    wa.id === data.session.id ? { ...wa, ...data.session } : wa
                );
            });
            
            // Se um QR Code foi gerado, mostrar automaticamente
            if (data.session.status === "QRCODE" || data.session.qrcode) {
                const relevantWhatsApp = whatsApps.find(wa => wa.id === data.session.id);
                if (relevantWhatsApp) {
                    handleOpenQrModal({...relevantWhatsApp, ...data.session});
                }
            }
        }
        
        // Buscar todos os dados atualizados
        fetchWhatsApps();
    };

    // Monitorar conexão do socket
    socket.on('connect', () => {
      console.log('Socket conectado');
      fetchWhatsApps(); // Atualiza dados quando o socket se conecta
    });

    socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    socket.on(`company-${companyId}-whatsapp`, handleWhatsAppUpdate);
    socket.on(`company-${companyId}-whatsappSession`, handleSessionUpdate);

    return () => {
      socket.off(`company-${companyId}-whatsapp`, handleWhatsAppUpdate);
      socket.off(`company-${companyId}-whatsappSession`, handleSessionUpdate);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socketManager, fetchWhatsApps]);

  // Handlers para operações com WhatsApp
  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = () => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
    fetchWhatsApps(); // Garantir dados atualizados após fechar o modal
  };

  const handleEditWhatsApp = (whatsApp) => {
    // Garantir que o color seja um valor válido antes de editar
    const whatsAppWithValidColor = {
      ...whatsApp,
      // Se a cor não é uma string hexadecimal válida, definir o valor padrão
      color: whatsApp.color && whatsApp.color.startsWith('#') ? whatsApp.color : "#7367F0"
    };
    
    setSelectedWhatsApp(whatsAppWithValidColor);
    setWhatsAppModalOpen(true);
  };

  const handleOpenQrModal = (whatsApp) => {
    // Garantir que o color seja um valor válido antes de abrir o QR code
    const whatsAppWithValidColor = {
      ...whatsApp,
      // Se a cor não é uma string hexadecimal válida, definir o valor padrão
      color: whatsApp.color && whatsApp.color.startsWith('#') ? whatsApp.color : "#7367F0"
    };

    setSelectedWhatsApp(whatsAppWithValidColor);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = () => {
    setQrModalOpen(false);
    setSelectedWhatsApp(null);
    fetchWhatsApps(); // Garantir dados atualizados após fechar o modal de QR
  };

  // Handlers para ações de conexão
  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      setLoading(true);
      await api.post(`/whatsappsession/${whatsAppId}`);

      // Atualizar localmente o status para PENDING para feedback visual imediato
      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.map(wa =>
          wa.id === whatsAppId ? { ...wa, status: "PENDING" } : wa
        )
      );

      toast.success(i18n.t("connections.toasts.connectionStarted"));
      await fetchWhatsApps();
    } catch (err) {
      console.error("Erro ao iniciar sessão:", err);
      toast.error(i18n.t("connections.toasts.startError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReconnect = async (whatsAppId) => {
    try {
      setLoading(true);
  
      // Feedback visual imediato
      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.map(wa =>
          wa.id === whatsAppId ? { ...wa, status: "PENDING" } : wa
        )
      );
  
      // Solicitar reconexão
      await api.post(`/whatsappsession/${whatsAppId}/reconnect`);
      toast.success(i18n.t("connections.toasts.reconnectRequested"));
  
      // Esperar um momento para o backend processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar dados específicos do WhatsApp
      const { data } = await api.get(`/whatsapp/${whatsAppId}`);
  
      // Atualizar dados locais
      if (data) {
        setWhatsApps(prevWhatsApps =>
          prevWhatsApps.map(wa =>
            wa.id === whatsAppId ? data : wa
          )
        );
        
        // Abrir QR code se disponível
        handleOpenQrModal(data);
      }
    } catch (err) {
      console.error("Erro ao reconectar:", err);
      toast.error(i18n.t("connections.toasts.reconnectError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async (whatsAppId) => {
    try {
      setLoading(true);
      await api.delete(`/whatsappsession/${whatsAppId}`);

      // Atualizar localmente o status para feedback visual imediato
      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.map(wa =>
          wa.id === whatsAppId ? { ...wa, status: "DISCONNECTED" } : wa
        )
      );

      toast.success(i18n.t("connections.toasts.disconnected"));
      await fetchWhatsApps();
    } catch (err) {
      console.error("Erro ao desconectar:", err);
      toast.error(i18n.t("connections.toasts.disconnectError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWhatsApp = async (whatsAppId) => {
    setLoading(true);
    try {
      await api.delete(`/whatsapp/${whatsAppId}`);

      // Atualização local para garantir uma resposta visual imediata
      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.filter(whatsApp => whatsApp.id !== whatsAppId)
      );

      toast.success(i18n.t("connections.toasts.deleted"));
      // Chamada para recarregar dados do servidor
      await fetchWhatsApps();
    } catch (err) {
      console.error("Erro ao excluir conexão:", err);

      // Verificar se é erro de tickets abertos
      if (err.response && err.response.status === 400 &&
        err.response.data && err.response.data.error === "ERR_OPEN_TICKETS_EXISTS") {
        toast.error(i18n.t("connections.toasts.deleteErrorTickets"));

        // Perguntar se deseja forçar a exclusão
        openConfirmDialog(
          i18n.t("connections.confirmationModal.forceDeleteTitle"),
          i18n.t("connections.confirmationModal.forceDeleteTicketsMessage"),
          () => handleForceDeleteWhatsApp(whatsAppId)
        );
      } else {
        toast.error(i18n.t("connections.toasts.deleteError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForceDeleteWhatsApp = async (whatsAppId) => {
    setLoading(true);
    try {
      await api.delete(`/whatsapp/${whatsAppId}?force=true`);

      // Atualização local para garantir uma resposta visual imediata
      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.filter(whatsApp => whatsApp.id !== whatsAppId)
      );

      toast.success(i18n.t("connections.toasts.deleted"));
      await fetchWhatsApps();
    } catch (err) {
      console.error("Erro ao forçar exclusão:", err);
      toast.error(i18n.t("connections.toasts.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateWhatsApp = async (whatsAppId) => {
    if (!whatsAppId) {
      toast.error("ID de conexão inválido");
      return;
    }
  
    setDuplicating(true);
    try {
      const { data } = await api.post(`/whatsapp/${whatsAppId}/duplicate`);
  
      // Pequena pausa para garantir processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recarregar todos os dados
      await fetchWhatsApps();
      
      toast.success(i18n.t("connections.toasts.duplicated"));
  
      // Se a duplicação for bem-sucedida e tivermos dados
      if (data && data.id) {
        // Esperar antes de abrir o QR Code
        setTimeout(() => {
          // Buscar os dados mais recentes antes de abrir o QR Code
          api.get(`/whatsapp/${data.id}`)
            .then(response => {
              if (response.data) {
                // Garantir que o color esteja definido corretamente
                const whatsApp = response.data;
                if (!whatsApp.color || typeof whatsApp.color !== 'string' || !whatsApp.color.startsWith('#')) {
                  whatsApp.color = "#7367F0";
                }
                handleOpenQrModal(whatsApp);
              }
            })
            .catch(err => console.error("Erro ao buscar dados para QR Code:", err));
        }, 1000);
      }
    } catch (err) {
      console.error("Erro ao duplicar WhatsApp:", err);
      toast.error(i18n.t("connections.toasts.duplicateError"));
      fetchWhatsApps();
    } finally {
      setDuplicating(false);
    }
  };

  const handleTransferTicketsAndDelete = async () => {
    try {
      const { sourceWhatsAppId, targetWhatsAppId } = transferDialog;

      if (!sourceWhatsAppId || !targetWhatsAppId) {
        toast.error(i18n.t("connections.toasts.transferError"));
        return;
      }

      // Indica que a operação está em andamento
      setLoading(true);

      // Chamada para API 
      await api.post(`/whatsapp/transfer/${sourceWhatsAppId}`, {
        newWhatsappId: targetWhatsAppId
      });

      // Atualização do estado local para feedback visual imediato
      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.filter(whatsApp => whatsApp.id !== sourceWhatsAppId)
      );

      toast.success(i18n.t("connections.toasts.transferSuccess"));
      setTransferDialog({ open: false, sourceWhatsAppId: null, targetWhatsAppId: "" });

      // Atualiza todos os dados do servidor
      await fetchWhatsApps();
    } catch (err) {
      console.error("Erro durante transferência:", err);
      toast.error(err?.response?.data?.error || i18n.t("connections.toasts.transferError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRestartAllWhatsApps = async () => {
    try {
      setLoading(true);
      await api.post(`/whatsapp-restart/`);

      // Atualizar localmente todos os status para PENDING
      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.map(wa => ({ ...wa, status: "PENDING" }))
      );

      toast.success(i18n.t("connections.toasts.restartSuccess"));
      await fetchWhatsApps();
    } catch (err) {
      console.error("Erro ao reiniciar todas as conexões:", err);
      toast.error(i18n.t("connections.toasts.restartError"));
    } finally {
      setLoading(false);
    }
  };

  const handleMonitorImport = (whatsApp) => {
    setSelectedImportWhatsApp(whatsApp);
    setImportModalOpen(true);
  };

  // Adicione esta função para fechar o modal de importação
  const handleCloseImportModal = () => {
    setImportModalOpen(false);
    setSelectedImportWhatsApp(null);
    // Recarregar os dados após o fechamento
    fetchWhatsApps();
  };

  // Handlers para diálogos de confirmação
  const openConfirmDialog = (title, message, action) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false,
    });
  };

  const confirmAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    closeConfirmDialog();
  };

  // Handlers para menu de ações
  const handleOpenMenu = (event, connectionId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedConnectionId(connectionId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedConnectionId(null);
  };

  // Abre o diálogo de transferência de tickets
  const openTransferDialog = (sourceWhatsAppId) => {
    setTransferDialog({
      open: true,
      sourceWhatsAppId,
      targetWhatsAppId: "",
    });
  };

  // Fecha o diálogo de transferência de tickets
  const closeTransferDialog = () => {
    setTransferDialog({
      open: false,
      sourceWhatsAppId: null,
      targetWhatsAppId: "",
    });
  };

  // Handler para mudança de WhatsApp de destino na transferência
  const handleChangeTargetWhatsApp = (e) => {
    setTransferDialog({
      ...transferDialog,
      targetWhatsAppId: e.target.value,
    });
  };

  // Componente de status para células da tabela
  const StatusCell = ({ whatsApp }) => {
    const status = whatsApp?.status?.toUpperCase();

    if (status === "CONNECTED") {
      return (
        <Tooltip title={i18n.t("connections.status.connected")}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ConnectedIcon sx={{ color: "success.main" }} />
          </Box>
        </Tooltip>
      );
    }

    if (status === "QRCODE" || status === "qrcode") {
      return (
        <Tooltip title={i18n.t("connections.status.qrcode")}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <QrCodeIcon sx={{ color: "info.main" }} />
          </Box>
        </Tooltip>
      );
    }

    if (status === "DISCONNECTED" || status === "PENDING") {
      return (
        <Tooltip title={i18n.t("connections.status.disconnected")}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DisconnectedIcon sx={{ color: "error.main" }} />
          </Box>
        </Tooltip>
      );
    }

    if (status === "OPENING") {
      return (
        <Tooltip title={i18n.t("connections.status.initializing")}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={24} color="warning" />
          </Box>
        </Tooltip>
      );
    }

    return (
      <Tooltip title={i18n.t("connections.status.unknown")}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DisconnectedIcon sx={{ color: "warning.main" }} />
        </Box>
      </Tooltip>
    );
  };

  // Componente para ações em cada conexão
  const ConnectionActions = ({ whatsApp }) => {
    const status = whatsApp?.status?.toUpperCase();

    // Para debug - sempre exibir o status real
    console.log(`WhatsApp ${whatsApp.id} status:`, status);

    if (status === "QRCODE" || status === "qrcode") {
        return (
            <ActionButton
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleOpenQrModal(whatsApp)}
                startIcon={<QrCodeIcon />}
            >
                {i18n.t("connections.buttons.qrCode")}
            </ActionButton>
        );
    }

    if (status === "DISCONNECTED" || status === "PENDING" || status === "OPENING") {
        return (
            <Box sx={{ display: "flex", gap: 1 }}>
                <ActionButton
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                >
                    {i18n.t("connections.buttons.tryAgain")}
                </ActionButton>
                <ActionButton
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleRequestReconnect(whatsApp.id)}
                >
                    {i18n.t("connections.buttons.newQr")}
                </ActionButton>
            </Box>
        );
    }

    if (status === "CONNECTED") {
      return (
        <ActionButton
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() =>
            openConfirmDialog(
              i18n.t("connections.confirmationModal.disconnectTitle"),
              i18n.t("connections.confirmationModal.disconnectMessage"),
              () => handleDisconnectWhatsApp(whatsApp.id)
            )
          }
        >
          {i18n.t("connections.buttons.disconnect")}
        </ActionButton>
      );
    }

    if (status === "OPENING") {
      return (
        <ActionButton 
          size="small" 
          variant="outlined" 
          disabled
        >
          {i18n.t("connections.buttons.connecting")}
        </ActionButton>
      );
    }

    return null;
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("connections.title")} ({whatsApps.length})</Title>
        <MainHeaderButtonsWrapper>
          <ActionButton
            variant="outlined"
            color="primary"
            onClick={handleRestartAllWhatsApps}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            {i18n.t("connections.buttons.restartAll")}
          </ActionButton>

          <Can
            role={user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <ActionButton
                variant="contained"
                color="primary"
                onClick={handleOpenWhatsAppModal}
                startIcon={<AddIcon />}
                disabled={loading}
              >
                {i18n.t("connections.buttons.add")}
              </ActionButton>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper sx={{ mt: 2, width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 180px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>{i18n.t("connections.table.name")}</TableCell>
                <TableCell>{i18n.t("connections.table.number")}</TableCell>
                <TableCell align="center">{i18n.t("connections.table.status")}</TableCell>
                <TableCell align="center">{i18n.t("connections.table.default")}</TableCell>
                <TableCell>{i18n.t("connections.table.lastUpdate")}</TableCell>
                <TableCell>{i18n.t("connections.table.session")}</TableCell>
                <TableCell align="center">{i18n.t("connections.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowSkeleton columns={7} />
              ) : whatsApps.length > 0 ? (
                whatsApps.map((whatsApp) => (
                  <TableRow key={whatsApp.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WhatsAppIcon sx={{ color: "#25d366" }} />
                        {whatsApp.name}
                      </Box>
                    </TableCell>
                    <TableCell>{whatsApp.number}</TableCell>
                    <TableCell align="center">
                      <StatusCell whatsApp={whatsApp} />
                    </TableCell>
                    <TableCell align="center">
                      {whatsApp.isDefault === 1 && (
                        <CheckCircleIcon sx={{ color: "success.main" }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {whatsApp.updatedAt &&
                        format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <ConnectionActions whatsApp={whatsApp} />
                    </TableCell>
                    <TableCell align="center">
                      <Can
                        role={user.profile}
                        perform="connections-page:addConnection"
                        yes={() => (
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditWhatsApp(whatsApp)}
                              color="primary"
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, whatsApp.id)}
                              disabled={loading}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary">
                      {i18n.t("connections.noConnections")}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Menu de ações */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleDuplicateWhatsApp(selectedConnectionId);
          }}
          disabled={duplicating || loading}
        >
          <ListItemIcon>
            {duplicating ?
              <CircularProgress size={20} color="primary" /> :
              <DuplicateIcon fontSize="small" />
            }
          </ListItemIcon>
          <ListItemText primary={i18n.t("connections.menu.duplicate")} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            openTransferDialog(selectedConnectionId);
          }}
          disabled={loading}
        >
          <ListItemIcon>
            <TransferIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("connections.menu.transferTickets")} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            openConfirmDialog(
              i18n.t("connections.confirmationModal.deleteTitle"),
              i18n.t("connections.confirmationModal.deleteMessage"),
              () => handleDeleteWhatsApp(selectedConnectionId)
            );
          }}
          disabled={loading}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("connections.menu.delete")} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            openConfirmDialog(
              i18n.t("connections.confirmationModal.forceDeleteTitle"),
              i18n.t("connections.confirmationModal.forceDeleteMessage"),
              () => handleForceDeleteWhatsApp(selectedConnectionId)
            );
          }}
          disabled={loading}
        >
          <ListItemIcon>
            <ForceDeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t("connections.menu.forceDelete")}
            primaryTypographyProps={{ color: 'error' }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            const whatsApp = whatsApps.find(w => w.id === selectedConnectionId);
            handleMonitorImport(whatsApp);
          }}
          disabled={loading}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Monitorar Importação" />
        </MenuItem>

      </Menu>

      {/* Modal de QR Code */}
      {qrModalOpen && selectedWhatsApp && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={selectedWhatsApp.id}
        />
      )}

      {/* Modal de WhatsApp */}
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={selectedWhatsApp?.id}
        onStartImportMonitoring={handleMonitorImport}
      />

      {importModalOpen && selectedImportWhatsApp && (
        <ImportProgressModal
          open={importModalOpen}
          onClose={handleCloseImportModal}
          whatsApp={selectedImportWhatsApp}
        />
      )}

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary">
            {i18n.t("cancel")}
          </Button>
          <Button onClick={confirmAction} color="secondary" autoFocus>
            {i18n.t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de transferência de tickets */}
      <Dialog
        open={transferDialog.open}
        onClose={closeTransferDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{i18n.t("connections.confirmationModal.transferTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {i18n.t("connections.confirmationModal.transferMessage")}
          </DialogContentText>

          {whatsApps.length > 1 ? (
            <FormControl fullWidth>
              <InputLabel id="target-whatsapp-label">WhatsApp</InputLabel>
              <Select
                labelId="target-whatsapp-label"
                value={transferDialog.targetWhatsAppId}
                onChange={handleChangeTargetWhatsApp}
                label="WhatsApp"
              >
                {whatsApps
                  .filter(w => w.id !== transferDialog.sourceWhatsAppId)
                  .map(whatsApp => (
                    <MenuItem key={whatsApp.id} value={whatsApp.id}>
                      {whatsApp.name} ({whatsApp.number})
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          ) : (
            <Typography color="text.secondary">
              {i18n.t("connections.transferTickets.noConnections")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTransferDialog} color="primary">
            {i18n.t("cancel")}
          </Button>
          <Button
            onClick={handleTransferTicketsAndDelete}
            color="secondary"
            disabled={!transferDialog.targetWhatsAppId || loading}
            autoFocus
          >
            {i18n.t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default ConnectionsPage;