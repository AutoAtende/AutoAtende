import React, { useState } from "react";
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
  TablePagination,
  Tooltip,
  CircularProgress,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
  DeleteForever as DeleteForeverIcon
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { useSpring, animated } from 'react-spring';
import { i18n } from "../../../translate/i18n";

const GroupsTable = ({ groups, loading, onEdit, onDelete, onRequests, onForceDelete }) => {
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
          {i18n.t("groups.createGroupsMessage")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("groups.table.name")}</TableCell>
              <TableCell>{i18n.t("groups.table.participants")}</TableCell>
              <TableCell>{i18n.t("groups.table.createdAt")}</TableCell>
              <TableCell align="right">{i18n.t("groups.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((group) => (
                <TableRow key={group.id} hover>
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
                          {group.subject}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {group.jid ? group.jid.split('@')[0] : ''}
                        </Typography>
                      </Box>
                    </Box>
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
                      ? format(parseISO(group.createdAt), "dd/MM/yyyy")
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
              ))}
          </TableBody>
        </Table>
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
          sx={{
            display: 'flex',
            justifyContent: 'center',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: '0',
            },
          }}
        />
      </TableContainer>

      <Menu
        anchorEl={actionMenuAnchor}
        keepMounted
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{i18n.t("groups.actions.edit")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRequests}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{i18n.t("groups.actions.requests")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("groups.actions.delete")} style={{ color: '#f44336' }} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleForceDelete}>
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("groups.actions.forceDelete")} style={{ color: '#f44336', fontWeight: 'bold' }} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GroupsTable;