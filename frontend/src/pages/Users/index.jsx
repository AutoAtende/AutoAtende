import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { toast } from "../../helpers/toast";
import { styled } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery
} from "@mui/material";

// Ícones
import StarIcon from "@mui/icons-material/Star";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";

// Componentes
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";
import UserModal from "./components/UserModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

// Styled Components
const PageWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  flex: 1
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  }
}));

const HeaderTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const StatusBadge = styled(Box)(({ theme, online }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: online ? theme.palette.success.light : theme.palette.grey[200],
  color: online ? theme.palette.success.dark : theme.palette.grey[700],
  '& .dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: online ? theme.palette.success.main : theme.palette.grey[500],
    marginRight: theme.spacing(1)
  }
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    flexDirection: 'column'
  }
}));

const ContentArea = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 250px)'
}));

const FooterArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const Users = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  // Ref para o container de rolagem
  const scrollRef = useRef(null);
  // Flag para evitar chamadas duplicadas
  const isLoadingRef = useRef(false);

  const socketManager = useContext(SocketContext);

  // Função para buscar usuários
  const fetchUsers = useCallback(async (pageNum = page, shouldReset = false) => {
    // Evita múltiplas chamadas simultâneas
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
      
      // Se for a primeira página ou shouldReset for true, substitui os dados, senão, concatena
      if (pageNum === 1 || shouldReset) {
        setUsers(Array.isArray(data.users) ? data.users : []);
      } else {
        setUsers(prev => [...prev, ...(Array.isArray(data.users) ? data.users : [])]);
      }
      
      // Verifica se há mais dados para carregar
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

  // Effect para carregar usuários quando a página mudar
  useEffect(() => {
    fetchUsers(page, false);
  }, [fetchUsers, page]);

  // Efeito para resetar e recarregar quando o termo de busca mudar
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
        // Resetar para a primeira página quando houver atualização via socket
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
  
  // Handler de rolagem para carregar mais dados
  const handleScroll = useCallback(() => {
    if (!hasMore || loading || isLoadingRef.current) return;
    
    const container = scrollRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Carrega mais dados quando chegar a 80% do scroll
    if (scrollHeight - scrollTop - clientHeight < clientHeight * 0.2) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, loading]);
  
  // Adiciona e remove o event listener de scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

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
    return profiles[profile]?.name || profile;
  };

  // Função para obter URL da imagem de perfil
  const getProfileImage = (user) => {
    if (user?.profilePic) {
      return `${process.env.REACT_APP_BACKEND_URL}/public/company${user?.companyId}/profile/${user?.profilePic}`;
    }
    return null;
  };

  return (
    <MainContainer>
      <PageWrapper>
        <PageHeader>
          <HeaderTitle>
            <Title color="primary">
              {i18n.t("users.title")}
            </Title>
            <Box display="flex" gap={2}>
              <StatusBadge online>
                <span className="dot" />
                {i18n.t("users.status.online")}: {userCounts.online}
              </StatusBadge>
              <StatusBadge>
                <span className="dot" />
                {i18n.t("users.status.offline")}: {userCounts.offline}
              </StatusBadge>
            </Box>
          </HeaderTitle>

          <HeaderActions>
            <TextField
              placeholder={i18n.t("contacts.searchPlaceholder")}
              value={searchParam}
              onChange={handleSearch}
              size="small"
              fullWidth={isMobile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenUserModal}
              startIcon={<PersonAddIcon />}
              fullWidth={isMobile}
            >
              {i18n.t("users.buttons.add")}
            </Button>
          </HeaderActions>
        </PageHeader>

        <ContentArea>
          <ScrollableContainer ref={scrollRef}>
            {loading && page === 1 ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Perfil</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getProfileChip(user.profile)}</TableCell>
                          <TableCell>
                            <StatusBadge online={user.online}>
                              <span className="dot" />
                              {user.online ? 'Online' : 'Offline'}
                            </StatusBadge>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={i18n.t("users.buttons.edit")}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditUser(user)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={i18n.t("users.buttons.delete")}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeletingUser(user);
                                  setConfirmModalOpen(true);
                                }}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Nenhum usuário encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* Indicador de carregamento para rolagem infinita */}
            {loading && page > 1 && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}
          </ScrollableContainer>
          
          {hasMore && !loading && users.length > 0 && (
            <FooterArea>
              <Typography variant="body2" color="textSecondary">
                Role para baixo para carregar mais
              </Typography>
            </FooterArea>
          )}
        </ContentArea>
      </PageWrapper>

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
    </MainContainer>
  );
};

export default Users;