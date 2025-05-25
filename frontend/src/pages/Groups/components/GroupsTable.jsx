import React, { useContext } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TablePagination,
  Skeleton
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
  DeleteForever as DeleteForeverIcon,
  AdminPanelSettings as AdminIcon,
  Group as ParticipantIcon,
  GetApp as ExtractIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { styled } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";

// Styled Components
const TableWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden', // Remove rolagem aqui
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.light,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.primary.contrastText,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    borderBottom: `2px solid ${theme.palette.primary.main}`
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer'
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.selected
  }
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8),
  textAlign: 'center',
  height: '400px'
}));

const GroupsTable = ({ 
  groups, 
  loading, 
  onEdit, 
  onDelete, 
  onRequests, 
  onForceDelete, 
  onExtractContacts 
}) => {
  const { user } = useContext(AuthContext);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [actionMenuAnchor, setActionMenuAnchor] = React.useState(null);
  const [selectedGroup, setSelectedGroup] = React.useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getParticipantsCount = (group) => {
    if (!group.participantsJson) return 0;
    return Array.isArray(group.participantsJson) ? group.participantsJson.length : 0;
  };

  const getGroupInitials = (name) => {
    if (!name) return "GP";
    const words = name.split(" ");
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const getUserRole = (group) => {
    try {
      if (group.userRole) {
        return group.userRole;
      }

      if (!group.participantsJson || !Array.isArray(group.participantsJson)) {
        return "unknown";
      }

      const hasAdmins = group.participantsJson.some(p => 
        p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin === true
      );

      if (!hasAdmins) {
        return "participant";
      }

      const adminParticipants = group.participantsJson.filter(p => 
        p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin === true
      );

      const adminRatio = adminParticipants.length / group.participantsJson.length;
      
      if (adminRatio > 0.5) {
        return "participant";
      }

      return group.userRole || "participant";
    } catch (error) {
      console.error("Erro ao verificar role do usuário:", error);
      return "unknown";
    }
  };

  const handleOpenMenu = (event, group) => {
    event.stopPropagation();
    setSelectedGroup(group);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setActionMenuAnchor(null);
    setSelectedGroup(null);
  };

  const handleMenuAction = (action) => {
    if (selectedGroup) {
      action(selectedGroup);
    }
    handleCloseMenu();
  };

  // Loading state
  if (loading && groups.length === 0) {
    return (
      <TableWrapper>
        <Box p={2}>
          {[...Array(5)].map((_, index) => (
            <Box key={index} display="flex" alignItems="center" mb={2}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box width="100%">
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="text" width="15%" height={20} />
              </Box>
            </Box>
          ))}
        </Box>
      </TableWrapper>
    );
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <TableWrapper>
        <EmptyStateContainer>
          <PeopleIcon style={{ fontSize: 60, color: '#ccc' }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {i18n.t("groups.noGroupsFound")}
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Sincronize seus grupos do WhatsApp para começar a gerenciá-los
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
          >
            Sincronizar Grupos
          </Button>
        </EmptyStateContainer>
      </TableWrapper>
    );
  }

  // Calcular paginação
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedGroups = groups.slice(startIndex, endIndex);

  return (
    <TableWrapper>
      <StyledTableContainer component={Paper}>
        <Table stickyHeader size="medium">
          <StyledTableHead>
            <TableRow>
              <TableCell>
                {i18n.t("groups.table.name")}
              </TableCell>
              <TableCell>
                Permissão
              </TableCell>
              <TableCell>
                {i18n.t("groups.table.participants")}
              </TableCell>
              <TableCell>
                {i18n.t("groups.table.createdAt")}
              </TableCell>
              <TableCell align="right">
                {i18n.t("groups.table.actions")}
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {paginatedGroups.map((group) => {
              const userRole = getUserRole(group);
              
              return (
                <StyledTableRow 
                  key={group.id}
                  onClick={() => onEdit?.(group)}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        src={group.profilePic ? `${process.env.REACT_APP_BACKEND_URL}${group.profilePic}` : undefined}
                        sx={{ 
                          width: 40,
                          height: 40,
                          backgroundColor: typeof group.id === 'string' ? 
                            `hsl(${group.id.charCodeAt(0) * 10}, 70%, 50%)` : 
                            '#128C7E',
                          marginRight: 2,
                          border: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        {getGroupInitials(group.subject)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {group.subject || 'Grupo sem nome'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {group.jid ? group.jid.split('@')[0] : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {userRole === "admin" && (
                      <Chip
                        icon={<AdminIcon />}
                        label="Administrador"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                    {userRole === "participant" && (
                      <Chip
                        icon={<ParticipantIcon />}
                        label="Participante"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                    {userRole === "unknown" && (
                      <Chip
                        label="Desconhecido"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PeopleIcon 
                        fontSize="small" 
                        color="action" 
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">
                        {getParticipantsCount(group)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {group.createdAt
                      ? format(parseISO(group.createdAt), "dd/MM/yyyy HH:mm")
                      : ""}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleOpenMenu(e, group)}
                      color="primary"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        count={groups.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={i18n.t("groups.table.rowsPerPage")}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} ${i18n.t("groups.table.of")} ${count}`
        }
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: '1px solid rgba(224, 224, 224, 1)',
          flexShrink: 0,
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            margin: '0',
          },
        }}
      />

      {/* Menu de Ações */}
      <Menu
        anchorEl={actionMenuAnchor}
        keepMounted
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleMenuAction(onEdit)}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Visualizar/Editar</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuAction(onExtractContacts)}>
          <ListItemIcon>
            <ExtractIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Extrair Contatos</ListItemText>
        </MenuItem>

        {selectedGroup && getUserRole(selectedGroup) === "admin" && (
          <>
            <Divider />
            <MenuItem onClick={() => handleMenuAction(onRequests)}>
              <ListItemIcon>
                <PersonAddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Solicitações</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleMenuAction(onDelete)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>
                Sair do Grupo
              </ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleMenuAction(onForceDelete)}>
              <ListItemIcon>
                <DeleteForeverIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main', fontWeight: 'bold' }}>
                Remover do Sistema
              </ListItemText>
            </MenuItem>
          </>
        )}

        {selectedGroup && getUserRole(selectedGroup) === "participant" && (
          <>
            <Divider />
            <MenuItem onClick={() => handleMenuAction(onForceDelete)}>
              <ListItemIcon>
                <DeleteForeverIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>
                Remover do Sistema
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </TableWrapper>
  );
};

export default GroupsTable;