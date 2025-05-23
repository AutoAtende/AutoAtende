import React, { useState, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TablePagination
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
  DeleteForever as DeleteForeverIcon,
  AdminPanelSettings as AdminIcon,
  Group as ParticipantIcon,
  GetApp as ExtractIcon
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { useSpring, animated } from 'react-spring';
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";

const GroupsTable = ({ groups, loading, onEdit, onDelete, onRequests, onForceDelete, onExtractContacts }) => {
  const { user } = useContext(AuthContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

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
    setSelectedGroup(group);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setActionMenuAnchor(null);
  };

  const handleEdit = () => {
    onEdit(selectedGroup);
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDelete(selectedGroup);
    handleCloseMenu();
  };

  const handleForceDelete = () => {
    onForceDelete(selectedGroup);
    handleCloseMenu();
  };

  const handleRequests = () => {
    onRequests(selectedGroup);
    handleCloseMenu();
  };

  const handleExtractContacts = () => {
    if (onExtractContacts) {
      onExtractContacts(selectedGroup);
    }
    handleCloseMenu();
  };

  if (loading && groups.length === 0) {
    return (
      <Box p={2}>
        {[...Array(5)].map((_, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <Skeleton variant="circular" width={40} height={40} style={{ marginRight: 16 }} />
            <Box width="100%">
              <Skeleton variant="text" width="30%" height={24} />
              <Skeleton variant="text" width="15%" height={20} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <PeopleIcon style={{ fontSize: 60, color: '#ccc' }} />
        <Typography variant="h6" color="textSecondary">
          {i18n.t("groups.noGroupsFound")}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Sincronize seus grupos do WhatsApp para começar a gerenciá-los
        </Typography>
      </Box>
    );
  }

  // Calcular paginação corretamente
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedGroups = groups.slice(startIndex, endIndex);

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.light' }}>
                {i18n.t("groups.table.name")}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.light' }}>
                Permissão
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.light' }}>
                {i18n.t("groups.table.participants")}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.light' }}>
                {i18n.t("groups.table.createdAt")}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'primary.light' }}>
                {i18n.t("groups.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedGroups.map((group) => {
              const userRole = getUserRole(group);
              
              return (
                <TableRow key={group.id} hover sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            margin: '0',
          },
        }}
      />

      <Menu
        anchorEl={actionMenuAnchor}
        keepMounted
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseMenu}
      >
        {/* Ações disponíveis para todos */}
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Visualizar/Editar</ListItemText>
        </MenuItem>

        {/* Extrair contatos - disponível para todos os grupos */}
        <MenuItem onClick={handleExtractContacts}>
          <ListItemIcon>
            <ExtractIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Extrair Contatos</ListItemText>
        </MenuItem>

        {/* Ações apenas para administradores */}
        {selectedGroup && getUserRole(selectedGroup) === "admin" && (
          <>
            <Divider />
            <MenuItem onClick={handleRequests}>
              <ListItemIcon>
                <PersonAddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Solicitações</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Sair do Grupo" style={{ color: '#f44336' }} />
            </MenuItem>
            
            <MenuItem onClick={handleForceDelete}>
              <ListItemIcon>
                <DeleteForeverIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Remover do Sistema" style={{ color: '#f44336', fontWeight: 'bold' }} />
            </MenuItem>
          </>
        )}

        {/* Para participantes comuns, apenas remoção do sistema */}
        {selectedGroup && getUserRole(selectedGroup) === "participant" && (
          <>
            <Divider />
            <MenuItem onClick={handleForceDelete}>
              <ListItemIcon>
                <DeleteForeverIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Remover do Sistema" style={{ color: '#f44336' }} />
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default GroupsTable;