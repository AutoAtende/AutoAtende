import React, { useState, useEffect, useContext } from "react";
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
  CircularProgress
} from "@mui/material";

// Material UI Icons
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  DeleteOutline as DeleteIcon,
  DeleteForever as DeleteForeverIcon
} from "@mui/icons-material";

// Context
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

// Components
import GroupsTable from "./components/GroupsTable";
import CreateGroupModal from "./components/CreateGroupModal";
import GroupInfoModal from "./components/GroupInfoModal";
import JoinGroupModal from "./components/JoinGroupModal";
import GroupRequestsModal from "./components/GroupRequestsModal";
import BaseModal from "../../components/shared/BaseModal";

// Services
import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmForceDelete, setConfirmForceDelete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });

  useEffect(() => {
    fetchGroups(1);
    // Configura o socket para receber atualizações dos grupos
    const socket = socketManager.GetSocket(user.companyId);

    if (socket) {
      socket.on("group", (data) => {
        if (data.action === "create") {
          setGroups((prevGroups) => [data.group, ...prevGroups]);
          setTotalGroups((prevTotal) => prevTotal + 1);
        }
        
        if (data.action === "update") {
          setGroups((prevGroups) =>
            prevGroups.map((group) => {
              if (group.id === data.group.id) {
                return data.group;
              }
              return group;
            })
          );
        }
        
        if (data.action === "delete") {
          setGroups((prevGroups) =>
            prevGroups.filter((group) => group.id !== data.groupId)
          );
          setTotalGroups((prevTotal) => prevTotal - 1);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("group");
      }
    };
  }, [user.companyId, socketManager]);

  const fetchGroups = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/groups", {
        params: { searchParam, pageNumber: page },
      });
      setGroups(page === 1 ? data.groups : [...groups, ...data.groups]);
      setTotalGroups(data.count);
      setHasMore(data.hasMore);
      setPageNumber(page);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroups(1);
    setRefreshing(false);
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value);
    if (e.target.value === "") {
      fetchGroups(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchGroups(1);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    // Recarrega a lista de grupos após criar um novo
    fetchGroups(1);
  };

  const handleOpenInfoModal = (group) => {
    setSelectedGroup(group);
    setOpenInfoModal(true);
  };

  const handleCloseInfoModal = () => {
    setSelectedGroup(null);
    setOpenInfoModal(false);
    // Recarrega a lista de grupos após editar
    fetchGroups(1);
  };

  const handleOpenJoinModal = () => {
    setOpenJoinModal(true);
  };

  const handleCloseJoinModal = () => {
    setOpenJoinModal(false);
    // Recarrega a lista de grupos após ingressar
    fetchGroups(1);
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
      // Recarrega a lista de grupos após excluir
      fetchGroups(1);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleForceDeleteGroup = async () => {
    try {
      await api.delete(`/groups/${selectedGroup.id}?forceDelete=true`);
      toast.success(i18n.t("groups.groupForceDeleted"));
      handleCloseForceDeleteConfirm();
      // Recarrega a lista de grupos após excluir
      fetchGroups(1);
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

  const renderTabContent = () => {
    switch (tab) {
      case 0: // Lista de Grupos
        return (
          <GroupsTable 
            groups={groups}
            loading={loading}
            onEdit={handleOpenInfoModal}
            onDelete={handleOpenDeleteConfirm}
            onRequests={handleOpenRequestsModal}
            onForceDelete={handleOpenForceDeleteConfirm}
          />
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
      case 2: // Solicitações
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

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center">
          <GroupIcon style={{ marginRight: 8 }} />
          <Typography variant="h5" component="h1">
            {i18n.t("groups.title")}
          </Typography>
        </Box>
      </MainHeader>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box p={2} display="flex" alignItems="center" justifyContent="space-between" bgcolor="primary.main" color="primary.contrastText">
          <Box flex={1} display="flex" alignItems="center">
            <TextField
              placeholder={i18n.t("groups.searchPlaceholder")}
              fullWidth
              variant="outlined"
              size="small"
              value={searchParam}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1,
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
            <IconButton onClick={handleRefresh} disabled={refreshing} color="inherit" sx={{ ml: 1 }}>
              {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
            </IconButton>
          </Box>

          <Can
            role={user.profile}
            perform="groups:create"
            yes={() => (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateModal}
                sx={{ ml: 2 }}
              >
                {i18n.t("groups.newGroup")}
              </Button>
            )}
          />
        </Box>

        <Tabs
          value={tab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
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
          <Tab label={i18n.t("groups.tabs.requests")} />
        </Tabs>
        <Divider />

        <Box sx={{ p: 0 }}>
          <animated.div style={fadeIn}>
            {renderTabContent()}
          </animated.div>
        </Box>
      </Paper>

      {/* Modais */}
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