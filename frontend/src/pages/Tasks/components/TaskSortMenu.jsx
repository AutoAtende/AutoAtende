import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { SortByAlpha as SortIcon } from '@mui/icons-material';
import { i18n } from "../../../translate/i18n";

const TaskSortMenu = ({ anchorEl, open, onClose, onSort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: isMobile ? 150 : 180
        }
      }}
    >
      <MenuItem onClick={() => {onSort('dueDate'); onClose();}}>
        <ListItemIcon>
          <SortIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={i18n.t('tasks.sort.dueDate') || 'Data de Vencimento'} />
      </MenuItem>
      <MenuItem onClick={() => {onSort('title'); onClose();}}>
        <ListItemIcon>
          <SortIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={i18n.t('tasks.sort.title') || 'Título'} />
      </MenuItem>
      <MenuItem onClick={() => {onSort('category'); onClose();}}>
        <ListItemIcon>
          <SortIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={i18n.t('tasks.sort.category') || 'Categoria'} />
      </MenuItem>
    </Menu>
  );
};

export default TaskSortMenu;