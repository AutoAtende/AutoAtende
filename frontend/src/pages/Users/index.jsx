import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { toast } from "../../helpers/toast";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  Chip
} from "@mui/material";

// Ícones
import StarIcon from "@mui/icons-material/Star";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from '@mui/icons-material/People';
import PersonOffIcon from '@mui/icons-material/PersonOff';

// Componentes
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardDataTable from "../../components/shared/StandardDataTable";
import ConfirmationModal from "../../components/ConfirmationModal";
import UserModal from "./components/UserModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const Users = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [userCounts, setUserCounts] = useState({ online: 0, offline: 0 });
  const [activeTab, setActiveTab] = useState(0);

  // Ref para o container de rolagem
  const scrollRef = useRef(null);
  const isLoadingRef = useRef(false);

  const socketManager = useContext(SocketContext);

  // Função para buscar usuários
  const fetchUsers = useCallback(async (pageNum = page, shouldReset = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    try {
      setLoading(true);
      let params = { 
        searchParam,
        pageNumber: pageNum,
        perPage
      };
  
      const { data } = await api.get("/users", { params });
      
      if (pageNum === 1 || shouldReset) {
        setUsers(Array.isArray(data.users) ? data.users : []);
      } else {
        setUsers(prev => [...prev, ...(Array.isArray(data.users) ? data.users : [])]);
      }
      
      setHasMore(data.users && data.users.length === perPage);
      
      setUserCounts({ 
        online: data.onlineCount || 0, 
        offline: data.offlineCount || 0 
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erro ao carregar usuários');
      if (pageNum === 1) {
        setUsers([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [searchParam, perPage]);

  useEffect(() => {
    fetchUsers(page, false);
  }, [fetchUsers, page]);

  useEffect(() => {
    setPage(1);
    fetchUsers(1, true);
  }, [searchParam, fetchUsers]);

  // Configuração do socket para atualizações de usuários
  useEffect(() => {
    const companyId = user?.companyId;
    const socket = socketManager.GetSocket(companyId);
  
    const handleUserUpdate = (data) => {
      if (data.action === "update" || data.action === "create" || data.action === "delete") {
        setPage(1);
        fetchUsers(1, true);
      }
    };
  
    if (socket) {
      socket.on(`company-${companyId}-user`, handleUserUpdate);
  
      return () => {
        socket.off(`company-${companyId}-user`, handleUserUpdate);
      };
    }
  }, [socketManager, fetchUsers, user]);

  // Handler para pesquisa
  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  // Handler para abrir o modal de adição de usuário
  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  // Handler para fechar o modal e atualizar a lista
  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
    setPage(1);
    fetchUsers(1, true);
  };

  // Handler para editar usuário
  const handleEditUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setUserModalOpen(true);
  };

  // Handler para deletar usuário
  const handleDeleteUser = async (userId) => {
    try {
      if (user.id === userId) {
        toast.error(i18n.t("users.toasts.cantDeleteYourself"));
        return;
      }
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
      setPage(1);
      fetchUsers(1, true);
    } catch (err) {
      toast.error(err);
    } finally {
      setDeletingUser(null);
      setConfirmModalOpen(false);
    }
  };

  // Função para obter rótulo do perfil do usuário
  const getProfileChip = (profile) => {
    const profiles = {
      user: { name: "Atendente", color: "primary" },
      admin: { name: "Administrador", color: "secondary" },
      superv: { name: "Supervisor", color: "warning" },
    };
    return profiles[profile] || { name: profile, color: "default" };
  };

  // Função para obter URL da imagem de perfil
  const getProfileImage = (user) => {
    if (user?.profilePic) {
      return `${process.env.REACT_APP_BACKEND_URL}/public/company${user?.companyId}/profile/${user?.profilePic}`;
    }
    return null;
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      id: 'id',
      field: 'id',
      label: 'ID',
      width: '60px',
      align: 'left'
    },
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      render: (user) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src={getProfileImage(user)}
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: user.color || theme.palette.grey[300]
            }}
          >
            {user.name && user.name[0] ? user.name[0].toUpperCase() : '?'}
          </Avatar>
          <Typography>
            {user.name}
            {user.super && (
              <StarIcon 
                fontSize="small" 
                sx={{ color: theme.palette.warning.main, ml: 0.5 }} 
              />
            )}
          </Typography>
        </Box>
      )
    },
    {
      id: 'email',
      field: 'email',
      label: 'Email',
      render: (user) => user.email
    },
    {
      id: 'profile',
      field: 'profile',
      label: 'Perfil',
      render: (user) => (
        <Chip
          label={getProfileChip(user.profile).name}
          color={getProfileChip(user.profile).color}
          size="small"
        />
      )
    },
    {
      id: 'status',
      field: 'online',
      label: 'Status',
      render: (user) => (
        <Chip
          label={user.online ? 'Online' : 'Offline'}
          color={user.online ? 'success' : 'default'}
          size="small"
          variant={user.online ? 'filled' : 'outlined'}
        />
      )
    }
  ];

  // Ações da tabela
  const tableActions = [
    {
      label: "Editar",
      icon: <EditIcon />,
      onClick: (user) => handleEditUser(user),
      color: "primary"
    },
    {
      label: "Excluir",
      icon: <DeleteOutlineIcon />,
      onClick: (user) => {
        setDeletingUser(user);
        setConfirmModalOpen(true);
      },
      color: "error"
    }
  ];

  // Filtrar usuários baseado na aba ativa
  const getFilteredUsers = () => {
    switch (activeTab) {
      case 1: // Online
        return users.filter(u => u.online);
      case 2: // Offline
        return users.filter(u => !u.online);
      default: // Todos
        return users;
    }
  };

  const filteredUsers = getFilteredUsers();

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("users.buttons.add"),
      icon: <PersonAddIcon />,
      onClick: handleOpenUserModal,
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar novo usuário"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `Todos (${users.length})`,
      icon: <PeopleIcon />
    },
    {
      label: `Online (${userCounts.online})`,
      icon: <PeopleIcon />
    },
    {
      label: `Offline (${userCounts.offline})`,
      icon: <PersonOffIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <StandardPageLayout
        title={i18n.t("users.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder={i18n.t("contacts.searchPlaceholder")}
        showSearch={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading && page === 1}
      >
        <StandardDataTable
          data={filteredUsers}
          columns={columns}
          loading={loading && page === 1}
          actions={tableActions}
          onRowClick={(user) => handleEditUser(user)}
          stickyHeader={true}
          size="small"
          hover={true}
          maxVisibleActions={2}
          emptyIcon={<PeopleIcon />}
          emptyTitle={
            activeTab === 0 
              ? "Nenhum usuário encontrado" 
              : activeTab === 1 
                ? "Nenhum usuário online"
                : "Nenhum usuário offline"
          }
          emptyDescription="Não há usuários cadastrados para os filtros selecionados."
          emptyActionLabel="Adicionar Usuário"
          onEmptyActionClick={handleOpenUserModal}
        />

        {/* Indicador de carregamento para rolagem infinita */}
        {loading && page > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </StandardPageLayout>

      {/* Modais */}
      {userModalOpen && (
        <UserModal
          open={userModalOpen}
          onClose={handleCloseUserModal}
          userId={selectedUser?.id}
        />
      )}

      {confirmModalOpen && (
        <ConfirmationModal
          title={`${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser?.name}?`}
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteUser(deletingUser.id)}
        >
          {i18n.t("users.confirmationModal.deleteMessage")}
        </ConfirmationModal>
      )}
    </>
  );
};

export default Users;