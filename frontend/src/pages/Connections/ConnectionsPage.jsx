import React, { useState, useEffect, useContext, useCallback } from "react";
import { toast } from "../../helpers/toast";
import { format, parseISO } from "date-fns";

// MUI Components
import {
  Button,
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
  Chip,
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
  Router as RouterIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon
} from "@mui/icons-material";

// Componentes
import StandardPageLayout from "../../components/StandardPageLayout";
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
  const [duplicating, setDuplicating] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedImportWhatsApp, setSelectedImportWhatsApp] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchParam, setSearchParam] = useState("");

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

      if (data.action === "update" && data.whatsapp) {
        setWhatsApps(prevWhatsApps => {
          return prevWhatsApps.map(wa =>
            wa.id === data.whatsapp.id ? { ...wa, ...data.whatsapp } : wa
          );
        });
      }

      fetchWhatsApps();
    };

    const handleSessionUpdate = (data) => {
      console.log('Evento de sessão recebido:', data);

      if (data.action === "update" && data.session) {
        setWhatsApps(prevWhatsApps => {
          return prevWhatsApps.map(wa =>
            wa.id === data.session.id ? { ...wa, ...data.session } : wa
          );
        });

        if (data.session.status === "QRCODE" || data.session.qrcode) {
          const relevantWhatsApp = whatsApps.find(wa => wa.id === data.session.id);
          if (relevantWhatsApp) {
            handleOpenQrModal({ ...relevantWhatsApp, ...data.session });
          }
        }
      }

      fetchWhatsApps();
    };

    socket.on('connect', () => {
      console.log('Socket conectado');
      fetchWhatsApps();
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
    fetchWhatsApps();
  };

  const handleEditWhatsApp = (whatsApp) => {
    const whatsAppWithValidColor = {
      ...whatsApp,
      color: whatsApp.color && whatsApp.color.startsWith('#') ? whatsApp.color : "#7367F0"
    };

    setSelectedWhatsApp(whatsAppWithValidColor);
    setWhatsAppModalOpen(true);
  };

  const handleOpenQrModal = (whatsApp) => {
    const whatsAppWithValidColor = {
      ...whatsApp,
      color: whatsApp.color && whatsApp.color.startsWith('#') ? whatsApp.color : "#7367F0"
    };

    setSelectedWhatsApp(whatsAppWithValidColor);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = () => {
    setQrModalOpen(false);
    setSelectedWhatsApp(null);
    fetchWhatsApps();
  };

  // Handlers para ações de conexão
  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      setLoading(true);
      await api.post(`/whatsappsession/${whatsAppId}`);

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

      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.map(wa =>
          wa.id === whatsAppId ? { ...wa, status: "PENDING" } : wa
        )
      );

      await api.post(`/whatsappsession/${whatsAppId}/reconnect`);
      toast.success(i18n.t("connections.toasts.reconnectRequested"));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data } = await api.get(`/whatsapp/${whatsAppId}`);

      if (data) {
        setWhatsApps(prevWhatsApps =>
          prevWhatsApps.map(wa =>
            wa.id === whatsAppId ? data : wa
          )
        );

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

      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.filter(whatsApp => whatsApp.id !== whatsAppId)
      );

      toast.success(i18n.t("connections.toasts.deleted"));
      await fetchWhatsApps();
    } catch (err) {
      console.error("Erro ao excluir conexão:", err);

      if (err.response && err.response.status === 400 &&
        err.response.data && err.response.data.error === "ERR_OPEN_TICKETS_EXISTS") {
        toast.error(i18n.t("connections.toasts.deleteErrorTickets"));

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

      await new Promise(resolve => setTimeout(resolve, 500));

      await fetchWhatsApps();

      toast.success(i18n.t("connections.toasts.duplicated"));

      if (data && data.id) {
        setTimeout(() => {
          api.get(`/whatsapp/${data.id}`)
            .then(response => {
              if (response.data) {
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

      setLoading(true);

      await api.post(`/whatsapp/transfer/${sourceWhatsAppId}`, {
        newWhatsappId: targetWhatsAppId
      });

      setWhatsApps(prevWhatsApps =>
        prevWhatsApps.filter(whatsApp => whatsApp.id !== sourceWhatsAppId)
      );

      toast.success(i18n.t("connections.toasts.transferSuccess"));
      setTransferDialog({ open: false, sourceWhatsAppId: null, targetWhatsAppId: "" });

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

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
    setSelectedImportWhatsApp(null);
    fetchWhatsApps();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value);
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

  const openTransferDialog = (sourceWhatsAppId) => {
    setTransferDialog({
      open: true,
      sourceWhatsAppId,
      targetWhatsAppId: "",
    });
  };

  const closeTransferDialog = () => {
    setTransferDialog({
      open: false,
      sourceWhatsAppId: null,
      targetWhatsAppId: "",
    });
  };

  const handleChangeTargetWhatsApp = (e) => {
    setTransferDialog({
      ...transferDialog,
      targetWhatsAppId: e.target.value,
    });
  };

  // Filtrar conexões baseado na aba ativa e pesquisa
  const getFilteredConnections = () => {
    let filtered = whatsApps;

    // Filtro por pesquisa
    if (searchParam) {
      filtered = filtered.filter(wa =>
        wa.name.toLowerCase().includes(searchParam.toLowerCase()) ||
        wa.number.includes(searchParam)
      );
    }

    // Filtro por aba
    switch (activeTab) {
      case 1: // Conectadas
        return filtered.filter(wa => wa.status?.toUpperCase() === 'CONNECTED');
      case 2: // Desconectadas
        return filtered.filter(wa =>
          wa.status?.toUpperCase() === 'DISCONNECTED' ||
          wa.status?.toUpperCase() === 'PENDING'
        );
      case 3: // QR Code Pendente
        return filtered.filter(wa => wa.status?.toUpperCase() === 'QRCODE');
      default: // Todas
        return filtered;
    }
  };

  const filteredConnections = getFilteredConnections();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("connections.buttons.restartAll"),
      icon: <RefreshIcon />,
      onClick: handleRestartAllWhatsApps,
      variant: "outlined",
      color: "primary",
      disabled: loading,
      tooltip: "Reiniciar todas as conexões"
    }
  ];

  // Adicionar botão de adicionar apenas se tiver permissão
  if (user?.profile && ["admin", "superv"].includes(user.profile)) {
    pageActions.push({
      label: i18n.t("connections.buttons.add"),
      icon: <AddIcon />,
      onClick: handleOpenWhatsAppModal,
      variant: "contained",
      color: "primary",
      disabled: loading,
      tooltip: "Adicionar nova conexão"
    });
  }

  // Configuração das abas
  const tabs = [
    {
      label: `Todas (${whatsApps.length})`,
      icon: <RouterIcon />
    },
    {
      label: `Conectadas (${whatsApps.filter(wa => wa.status?.toUpperCase() === 'CONNECTED').length})`,
      icon: <LinkIcon />
    },
    {
      label: `Desconectadas (${whatsApps.filter(wa =>
        wa.status?.toUpperCase() === 'DISCONNECTED' ||
        wa.status?.toUpperCase() === 'PENDING'
      ).length})`,
      icon: <LinkOffIcon />
    },
    {
      label: `QR Pendente (${whatsApps.filter(wa => wa.status?.toUpperCase() === 'QRCODE').length})`,
      icon: <QrCodeIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Componente de status para células da tabela
  const StatusCell = ({ whatsApp }) => {
    const status = whatsApp?.status?.toUpperCase();

    if (status === "CONNECTED") {
      return (
        <Tooltip title={i18n.t("connections.status.connected")}>
          <Chip
            icon={<ConnectedIcon />}
            label="Conectado"
            color="success"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      );
    }

    if (status === "QRCODE" || status === "qrcode") {
      return (
        <Tooltip title={i18n.t("connections.status.qrcode")}>
          <Chip
            icon={<QrCodeIcon />}
            label="QR Code"
            color="info"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      );
    }

    if (status === "DISCONNECTED" || status === "PENDING") {
      return (
        <Tooltip title={i18n.t("connections.status.disconnected")}>
          <Chip
            icon={<DisconnectedIcon />}
            label="Desconectado"
            color="error"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      );
    }

    if (status === "OPENING") {
      return (
        <Tooltip title={i18n.t("connections.status.initializing")}>
          <Chip
            icon={<CircularProgress size={16} />}
            label="Conectando"
            color="warning"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      );
    }

    return (
      <Tooltip title={i18n.t("connections.status.unknown")}>
        <Chip
          icon={<DisconnectedIcon />}
          label="Desconhecido"
          color="default"
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  };

  // Componente para ações em cada conexão
  const ConnectionActions = ({ whatsApp }) => {
    const status = whatsApp?.status?.toUpperCase();

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

    // Renderizar conteúdo da página
    const renderContent = () => {
      if (loading && whatsApps.length === 0) {
        return (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        );
      }
  
      if (filteredConnections.length === 0 && !loading) {
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ height: '100%', p: 4 }}
          >
            <WhatsAppIcon sx={{ fontSize: 64, color: '#25d366', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {activeTab === 0
                ? i18n.t("connections.noConnections")
                : activeTab === 1
                  ? "Nenhuma conexão conectada"
                  : activeTab === 2
                    ? "Nenhuma conexão desconectada"
                    : "Nenhum QR Code pendente"
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              {searchParam
                ? "Tente usar outros termos na busca"
                : activeTab === 0
                  ? "Comece criando sua primeira conexão"
                  : "Não há conexões nesta categoria"
              }
            </Typography>
            {activeTab === 0 && (
              <Can
                role={user.profile}
                perform="connections-page:addConnection"
                yes={() => (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenWhatsAppModal}
                    sx={{ borderRadius: '28px', px: 3 }}
                  >
                    Criar Conexão
                  </Button>
                )}
              />
            )}
          </Box>
        );
      }
  
      return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
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
                {loading && whatsApps.length === 0 ? (
                  <TableRowSkeleton columns={7} />
                ) : (
                  filteredConnections.map((whatsApp) => (
                    <TableRow key={whatsApp.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <WhatsAppIcon sx={{ color: "#25d366" }} />
                          <Typography variant="body2" fontWeight="medium">
                            {whatsApp.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {whatsApp.number}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <StatusCell whatsApp={whatsApp} />
                      </TableCell>
                      <TableCell align="center">
                        {whatsApp.isDefault === 1 && (
                          <Tooltip title="Conexão padrão">
                            <CheckCircleIcon sx={{ color: "success.main" }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {whatsApp.updatedAt &&
                            format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                        </Typography>
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
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditWhatsApp(whatsApp)}
                                  color="primary"
                                  disabled={loading}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
  
                              <Tooltip title="Mais ações">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleOpenMenu(e, whatsApp.id)}
                                  disabled={loading}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    };


  return (
    <>
      <StandardPageLayout
        title={`${i18n.t("connections.title")} (${whatsApps.length})`}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder="Pesquisar conexões..."
        showSearch={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading && whatsApps.length === 0}
      >
        {renderContent()}
      </StandardPageLayout>

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

      {/* Modais */}
      {qrModalOpen && selectedWhatsApp && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={selectedWhatsApp.id}
        />
      )}

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

      {/* Diálogos de confirmação */}
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
    </>
  );
};

export default ConnectionsPage;