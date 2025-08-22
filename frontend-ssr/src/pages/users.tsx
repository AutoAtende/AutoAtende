'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PersonOff as PersonOffIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/Auth/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { api } from '../services/api';
import { toast } from '../helpers/toast';
import UserModal from '../components/modals/UserModal';

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  margin: '0 auto',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const TableWrapper = styled(Paper)(({ theme }) => ({
  width: '100%',
  overflow: 'hidden',
}));

const StatusChip = styled(Chip)<{ online: boolean }>(({ theme, online }) => ({
  backgroundColor: online ? theme.palette.success.main : theme.palette.grey[300],
  color: online ? theme.palette.success.contrastText : theme.palette.text.secondary,
}));

const ProfileChip = styled(Chip)<{ profile: string }>(({ theme, profile }) => ({
  backgroundColor: 
    profile === 'admin' ? theme.palette.error.main :
    profile === 'superv' ? theme.palette.warning.main :
    theme.palette.primary.main,
  color: theme.palette.getContrastText(
    profile === 'admin' ? theme.palette.error.main :
    profile === 'superv' ? theme.palette.warning.main :
    theme.palette.primary.main
  ),
}));

interface User {
  id: string;
  name: string;
  email: string;
  profile: 'admin' | 'superv' | 'user';
  online: boolean;
  profilePic?: string;
  super?: boolean;
  companyId: string;
  queues: Array<{ id: string; name: string }>;
  createdAt: string;
}

interface UserCounts {
  online: number;
  offline: number;
  total: number;
}

const Users: React.FC = () => {
  const theme = useTheme();
  const { user: currentUser } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userCounts, setUserCounts] = useState<UserCounts>({ online: 0, offline: 0, total: 0 });

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        searchParam,
        page: page + 1,
        limit: rowsPerPage,
      };
      
      const { data } = await api.get('/users', { params });
      
      setUsers(data.users || []);
      setUserCounts({
        online: data.onlineCount || 0,
        offline: data.offlineCount || 0,
        total: data.total || 0,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchParam, page, rowsPerPage]);

  // Socket listener for real-time updates
  useEffect(() => {
    if (!currentUser?.companyId || !socketManager) return;

    const socket = socketManager.GetSocket(currentUser.companyId);
    if (!socket) return;

    const handleUserUpdate = (data: any) => {
      if (data.action === 'update' || data.action === 'create' || data.action === 'delete') {
        fetchUsers();
      }
    };

    socket.on(`company-${currentUser.companyId}-user`, handleUserUpdate);

    return () => {
      socket.off(`company-${currentUser.companyId}-user`, handleUserUpdate);
    };
  }, [socketManager, currentUser, fetchUsers]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParam(event.target.value);
    setPage(0);
  };

  const handleOpenUserModal = (user?: User) => {
    setSelectedUser(user || null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (currentUser?.id === userToDelete.id) {
      toast.error('Você não pode excluir a si mesmo');
      return;
    }

    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success('Usuário excluído com sucesso');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const getProfileLabel = (profile: string) => {
    switch (profile) {
      case 'admin':
        return 'Administrador';
      case 'superv':
        return 'Supervisor';
      case 'user':
        return 'Atendente';
      default:
        return profile;
    }
  };

  const getProfileImage = (user: User) => {
    if (user.profilePic) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/company${user.companyId}/profile/${user.profilePic}`;
    }
    return undefined;
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    switch (activeTab) {
      case 1: // Online
        filtered = users.filter(u => u.online);
        break;
      case 2: // Offline
        filtered = users.filter(u => !u.online);
        break;
      default: // All
        filtered = users;
        break;
    }
    
    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container>
      <Header>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os usuários da sua empresa
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenUserModal()}
        >
          Novo Usuário
        </Button>
      </Header>

      <SearchBox>
        <TextField
          placeholder="Pesquisar usuários..."
          value={searchParam}
          onChange={handleSearch}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </SearchBox>

      <StyledTabs value={activeTab} onChange={handleTabChange}>
        <Tab
          label={`Todos (${userCounts.total})`}
          icon={<PeopleIcon />}
          iconPosition="start"
        />
        <Tab
          label={`Online (${userCounts.online})`}
          icon={<PeopleIcon />}
          iconPosition="start"
        />
        <Tab
          label={`Offline (${userCounts.offline})`}
          icon={<PersonOffIcon />}
          iconPosition="start"
        />
      </StyledTabs>

      <TableWrapper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Carregando usuários...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Nenhum usuário encontrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchParam ? 'Tente ajustar os filtros de busca' : 'Adicione o primeiro usuário'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={getProfileImage(user)}
                          sx={{ width: 32, height: 32 }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {user.name}
                            {user.super && (
                              <StarIcon
                                fontSize="small"
                                sx={{ color: 'warning.main', ml: 0.5 }}
                              />
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <ProfileChip
                        label={getProfileLabel(user.profile)}
                        size="small"
                        profile={user.profile}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={user.online ? 'Online' : 'Offline'}
                        size="small"
                        online={user.online}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenUserModal(user)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Linhas por página:"
        />
      </TableWrapper>

      {/* User Modal */}
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;