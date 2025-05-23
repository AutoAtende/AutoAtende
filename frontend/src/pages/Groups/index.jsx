import React, { useState, useEffect, useContext, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useSpring, animated } from 'react-spring';
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";

// Material UI Components
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";

// Material UI Icons
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  DeleteOutline as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  CloudSync as SyncIcon,
  AdminPanelSettings as AdminIcon,
  People as ParticipantIcon
} from "@mui/icons-material";

// Context
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

// Base Components - remover BasePageHeader
import BaseModal from "../../components/shared/BaseModal";

// Components
import GroupsTable from "./components/GroupsTable";
import CreateGroupModal from "./components/CreateGroupModal";
import GroupInfoModal from "./components/GroupInfoModal";
import JoinGroupModal from "./components/JoinGroupModal";
import GroupRequestsModal from "./components/GroupRequestsModal";
import SyncGroupsModal from "./components/SyncGroupsModal";
import ExtractContactsTab from "./components/ExtractContactsTab";
import ImportContactsTab from "./components/ImportContactsTab";
import ExtractContactsFromGroupModal from "./components/ExtractContactsFromGroupModal";

// Services
import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";
import { Can } from "../../components/Can";

const Groups = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openRequestsModal, setOpenRequestsModal] = useState(false);
  const [openSyncModal, setOpenSyncModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmForceDelete, setConfirmForceDelete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);
  const [whatsappConnections, setWhatsappConnections] = useState([]);
  const [openExtractModal, setOpenExtractModal] = useState(false);

  const handleOpenExtractModal = (group) => {
    setSelectedGroup(group);
    setOpenExtractModal(true);
  };

  const handleCloseExtractModal = () => {
    setSelectedGroup(null);
    setOpenExtractModal(false);
  };

  // Animation
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });

  // Debounce para pesquisa
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchGroups = useCallback(async (page = 1, search = "", reset = true) => {
    if (page === 1) setLoading(true);
    
    try {
      const { data } = await api.get("/groups", {
        params: { 
          searchParam: search, 
          pageNumber: page,
          limit: 20
        },
      });
      
      if (reset || page === 1) {
        setGroups(data.groups);
      } else {
        setGroups(prev => [...prev, ...data.groups]);
      }
      
      setTotalGroups(data.count);
      setHasMore(data.hasMore);
      setPageNumber(page);

      if (data.count === 0 && whatsappConnections.length > 0) {
        setNeedsSync(true);
      } else {
        setNeedsSync(false);
      }
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }, [whatsappConnections.length]);

  useEffect(() => {
    checkWhatsAppConnections();
  }, []);

  useEffect(() => {
    if (whatsappConnections.length >= 0) {
      fetchGroups(1, searchParam);
    }
  }, [whatsappConnections, fetchGroups]);

  useEffect(() => {
    const socket = socketManager.GetSocket(user.companyId);

    if (socket) {
      const handleGroupUpdate = (data) => {
        if (data.action === "create") {
          setGroups((prevGroups) => [data.group, ...prevGroups]);
          setTotalGroups((prevTotal) => prevTotal + 1);
        }

        if (data.action === "update") {
          setGroups((prevGroups) =>
            prevGroups.map((group) => {
              if (group.id === data.group.id) {
                return { ...group, ...data.group };
              }
              return group;
            })
          );
        }

        if (data.action === "delete") {
          setGroups((prevGroups) =>
            prevGroups.filter((group) => group.id !== data.groupId)
          );
          setTotalGroups((prevTotal) => Math.max(prevTotal - 1, 0));
        }
      };

      socket.on("group", handleGroupUpdate);

      return () => {
        socket.off("group", handleGroupUpdate);
      };
    }
  }, [user.companyId, socketManager]);

  const checkWhatsAppConnections = async () => {
    try {
      const { data } = await api.get("/whatsapp");
      const connectedWhatsApps = data.filter(w => w.status === "CONNECTED");
      setWhatsappConnections(connectedWhatsApps);

      if (connectedWhatsApps.length === 0) {
        setNeedsSync(false);
      }
    } catch (err) {
      console.error("Erro ao verificar conexões WhatsApp:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      checkWhatsAppConnections(),
      fetchGroups(1, searchParam, true)
    ]);
    setRefreshing(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchParam(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      fetchGroups(1, value, true);
    }, 500);
    
    setSearchTimeout(newTimeout);
  };

  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const handleOpenSyncModal = () => {
    setOpenSyncModal(true);
  };

  const handleCloseSyncModal = () => {
    setOpenSyncModal(false);
  };

  const handleSyncComplete = () => {
    setNeedsSync(false);
    fetchGroups(1, searchParam, true);
    toast.success("Grupos sincronizados com sucesso!");
  };

  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    fetchGroups(1, searchParam, true);
  };

  const handleOpenInfoModal = (group) => {
    setSelectedGroup(group);
    setOpenInfoModal(true);
  };

  const handleCloseInfoModal = () => {
    setSelectedGroup(null);
    setOpenInfoModal(false);
    fetchGroups(1, searchParam, true);
  };

  const handleOpenJoinModal = () => {
    setOpenJoinModal(true);
  };

  const handleCloseJoinModal = () => {
    setOpenJoinModal(false);
    fetchGroups(1, searchParam, true);
  };

  const handleOpenRequestsModal = (group) => {
    setSelectedGroup(group);
    setOpenRequestsModal(true);
  };

  const handleCloseRequestsModal = () => {
    setSelectedGroup(null);
    setOpenRequestsModal(false);
  };

  const handleOpenDeleteConfirm = (group) => {
    setSelectedGroup(group);
    setConfirmDelete(true);
  };

  const handleCloseDeleteConfirm = () => {
    setSelectedGroup(null);
    setConfirmDelete(false);
  };

  const handleOpenForceDeleteConfirm = (group) => {
    setSelectedGroup(group);
    setConfirmForceDelete(true);
  };

  const handleCloseForceDeleteConfirm = () => {
    setSelectedGroup(null);
    setConfirmForceDelete(false);
  };

  const handleDeleteGroup = async () => {
    try {
      await api.delete(`/groups/${selectedGroup.id}`);
      toast.success(i18n.t("groups.groupDeleted"));
      handleCloseDeleteConfirm();
      fetchGroups(1, searchParam, true);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleForceDeleteGroup = async () => {
    try {
      await api.delete(`/groups/${selectedGroup.id}?forceDelete=true`);
      toast.success(i18n.t("groups.groupForceDeleted"));
      handleCloseForceDeleteConfirm();
      fetchGroups(1, searchParam, true);
    } catch (err) {
      toast.error(err);
    }
  };

  const deleteModalActions = [
    {
      label: i18n.t("cancel"),
      onClick: handleCloseDeleteConfirm,
      variant: "outlined",
      color: "primary"
    },
    {
      label: i18n.t("delete"),
      onClick: handleDeleteGroup,
      variant: "contained",
      color: "error",
      icon: <DeleteIcon />
    }
  ];

  const forceDeleteModalActions = [
    {
      label: i18n.t("cancel"),
      onClick: handleCloseForceDeleteConfirm,
      variant: "outlined",
      color: "primary"
    },
    {
      label: i18n.t("groups.forceDelete"),
      onClick: handleForceDeleteGroup,
      variant: "contained",
      color: "error",
      icon: <DeleteForeverIcon />
    }
  ];

  const renderSyncPrompt = () => {
    if (!needsSync || whatsappConnections.length === 0) return null;

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <SyncIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Sincronizar Grupos do WhatsApp
              </Typography>
              <Typography variant="body2">
                Encontramos {whatsappConnections.length} conexão(ões) WhatsApp ativa(s).
                Sincronize para importar todos os grupos existentes.
              </Typography>
            </Box>
          </Box>
          <IconButton
            color="secondary"
            onClick={handleOpenSyncModal}
            sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
          >
            <SyncIcon />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  const renderWhatsAppStatus = () => {
    if (whatsappConnections.length === 0) {
      return (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Nenhuma conexão WhatsApp encontrada
          </Typography>
          <Typography variant="body2">
            Para gerenciar grupos, você precisa ter pelo menos uma conexão WhatsApp ativa.
            Configure uma conexão WhatsApp primeiro.
          </Typography>
        </Alert>
      );
    }

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Conexões WhatsApp ativas: {whatsappConnections.length}
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {whatsappConnections.map((conn) => (
            <Chip
              key={conn.id}
              label={conn.name}
              size="small"
              color="success"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderTabContent = () => {
    switch (tab) {
      case 0: // Lista de Grupos
        return (
          <Box>
            {renderSyncPrompt()}
            {renderWhatsAppStatus()}
            <GroupsTable
              groups={groups}
              loading={loading}
              onEdit={handleOpenInfoModal}
              onDelete={handleOpenDeleteConfirm}
              onRequests={handleOpenRequestsModal}
              onForceDelete={handleOpenForceDeleteConfirm}
              onExtractContacts={handleOpenExtractModal}
            />
          </Box>
        );

      case 1: // Convites
        return (
          <Box p={3} textAlign="center">
            <Typography variant="body1" mb={3}>
              {i18n.t("groups.joinByInviteDescription")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenJoinModal}
            >
              {i18n.t("groups.joinByInvite")}
            </Button>
          </Box>
        );

      case 2: // Extração de Contatos
        return <ExtractContactsTab />;

      case 3: // Importação de Contatos
        return <ImportContactsTab />;

      case 4: // Solicitações
        return (
          <Box p={3} textAlign="center">
            <Typography variant="body1">
              {i18n.t("groups.selectGroupToSeeRequests")}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  const getGroupStats = () => {
    const adminGroups = groups.filter(group => {
      return group.userRole === "admin";
    }).length;

    const participantGroups = groups.filter(group => {
      return group.userRole === "participant";
    }).length;

    return { adminGroups, participantGroups };
  };

  const { adminGroups, participantGroups } = getGroupStats();

  // Cleanup timeout na desmontagem
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          <Box display="flex" alignItems="center">
            <GroupIcon style={{ marginRight: 8 }} />
            {i18n.t("groups.title")}
          </Box>
        </Title>
        {groups.length > 0 && (
          <Box ml={2} display="flex" gap={1}>
            <Chip
              icon={<AdminIcon />}
              label={`${adminGroups} Admin`}
              size="small"
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<ParticipantIcon />}
              label={`${participantGroups} Participante`}
              size="small"
              color="default"
              variant="outlined"
            />
          </Box>
        )}
      </MainHeader>

      <Box sx={{ p: 2 }}>
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column' }}>
        <Box p={2} display="flex" alignItems="center" justifyContent="space-between" bgcolor="primary.main" color="primary.contrastText">
          <Box flex={1} display="flex" alignItems="center">
            <TextField
              placeholder={i18n.t("groups.searchPlaceholder")}
              fullWidth
              variant="outlined"
              size="small"
              value={searchParam}
              onChange={handleSearch}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                maxWidth: 300,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1} ml={2}>
            <Tooltip title="Atualizar">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing} 
                sx={{ 
                  bgcolor: 'primary.dark',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.main' },
                  '&:disabled': { bgcolor: 'action.disabled', color: 'action.disabled' }
                }}
              >
                {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>

            {whatsappConnections.length > 0 && (
              <Tooltip title="Sincronizar grupos do WhatsApp">
                <IconButton 
                  onClick={handleOpenSyncModal} 
                  sx={{ 
                    bgcolor: 'primary.dark',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                >
                  <SyncIcon />
                </IconButton>
              </Tooltip>
            )}

            <Can
              role={user.profile}
              perform="groups:create"
              yes={() => (
                <Tooltip title={i18n.t("groups.newGroup")}>
                  <IconButton
                    onClick={handleOpenCreateModal}
                    sx={{ 
                      bgcolor: 'secondary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'secondary.dark' }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            />
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiTab-root': {
              fontWeight: 500,
              py: 1.5
            }
          }}
        >
          <Tab label={i18n.t("groups.tabs.list")} />
          <Tab label={i18n.t("groups.tabs.invites")} />
          <Tab label="Extrair Contatos" />
          <Tab label="Importar Contatos" />
          <Tab label={i18n.t("groups.tabs.requests")} />
        </Tabs>
        <Divider />

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <animated.div style={{ ...fadeIn, height: '100%' }}>
            {renderTabContent()}
          </animated.div>
        </Box>
      </Paper>
    </Box>

      {/* Modais */}
      <SyncGroupsModal
        open={openSyncModal}
        onClose={handleCloseSyncModal}
        onComplete={handleSyncComplete}
      />

      {selectedGroup && (
        <ExtractContactsFromGroupModal
          open={openExtractModal}
          onClose={handleCloseExtractModal}
          group={selectedGroup}
        />
      )}

      <CreateGroupModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
      />

      {selectedGroup && (
        <GroupInfoModal
          open={openInfoModal}
          onClose={handleCloseInfoModal}
          group={selectedGroup}
        />
      )}

      <JoinGroupModal
        open={openJoinModal}
        onClose={handleCloseJoinModal}
      />

      {selectedGroup && (
        <GroupRequestsModal
          open={openRequestsModal}
          onClose={handleCloseRequestsModal}
          group={selectedGroup}
        />
      )}

      {/* Confirmar exclusão */}
      <BaseModal
        open={confirmDelete}
        onClose={handleCloseDeleteConfirm}
        title={i18n.t("groups.deleteConfirmTitle")}
        actions={deleteModalActions}
      >
        <Typography>
          {i18n.t("groups.deleteConfirmMessage", { name: selectedGroup?.subject })}
        </Typography>
      </BaseModal>

      {/* Confirmar exclusão forçada */}
      <BaseModal
        open={confirmForceDelete}
        onClose={handleCloseForceDeleteConfirm}
        title={i18n.t("groups.forceDeleteConfirmTitle")}
        actions={forceDeleteModalActions}
      >
        <Typography variant="body1" paragraph>
          {i18n.t("groups.forceDeleteConfirmMessage", { name: selectedGroup?.subject })}
        </Typography>
        <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
          {i18n.t("groups.forceDeleteWarning")}
        </Typography>
      </BaseModal>
    </MainContainer>
  );
};

export default Groups;