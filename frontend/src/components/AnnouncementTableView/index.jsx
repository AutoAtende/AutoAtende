// components/AnnouncementTableView.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  tableRow: {
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  priorityChip: {
    minWidth: 80,
  },
  statusChip: {
    minWidth: 70,
  },
  actionsCell: {
    whiteSpace: 'nowrap',
    width: '1%', // Makes the cell as narrow as possible
  },
  truncatedText: {
    maxWidth: 300,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconButton: {
    padding: 6,
    '&:not(:last-child)': {
      marginRight: theme.spacing(1),
    },
  },
}));

const AnnouncementTableView = ({ 
  announcements,
  onEdit,
  onDelete,
  onView,
}) => {
  const classes = useStyles();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return 'error';
      case 2:
        return 'warning';
      case 3:
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1:
        return 'Alta';
      case 2:
        return 'Média';
      case 3:
        return 'Baixa';
      default:
        return 'Baixa';
    }
  };

  const handleRowClick = (announcement) => {
    onView(announcement);
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{i18n.t("announcements.table.title")}</TableCell>
          <TableCell>{i18n.t("announcements.table.text")}</TableCell>
          <TableCell align="center">{i18n.t("announcements.table.priority")}</TableCell>
          <TableCell align="center">{i18n.t("announcements.table.status")}</TableCell>
          <TableCell align="center">{i18n.t("announcements.table.mediaName")}</TableCell>
          <TableCell align="center">{i18n.t("announcements.table.createdAt")}</TableCell>
          <TableCell align="right">{i18n.t("announcements.table.actions")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {announcements.map((announcement) => (
          <TableRow
            key={announcement.id}
            className={classes.tableRow}
            hover
            onClick={() => handleRowClick(announcement)}
          >
            <TableCell>
              <Typography variant="body2" className={classes.truncatedText}>
                {announcement.title}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" className={classes.truncatedText}>
                {announcement.text.replace(/<[^>]*>/g, '')}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={getPriorityLabel(announcement.priority)}
                color={getPriorityColor(announcement.priority)}
                size="small"
                className={classes.priorityChip}
              />
            </TableCell>
            <TableCell align="center">
              <Chip
                label={announcement.status ? 'Ativo' : 'Inativo'}
                color={announcement.status ? 'success' : 'default'}
                size="small"
                className={classes.statusChip}
              />
            </TableCell>
            <TableCell align="center">
              {announcement.mediaName || '-'}
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2">
                {moment(announcement.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </TableCell>
            <TableCell align="right" className={classes.actionsCell}>
              <Box onClick={(e) => e.stopPropagation()}>
                <Tooltip title={i18n.t("announcements.buttons.view")}>
                  <IconButton
                    size="small"
                    onClick={() => onView(announcement)}
                    className={classes.iconButton}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={i18n.t("announcements.buttons.edit")}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(announcement)}
                    className={classes.iconButton}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={i18n.t("announcements.buttons.delete")}>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(announcement)}
                    className={classes.iconButton}
                    color="error"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AnnouncementTableView;