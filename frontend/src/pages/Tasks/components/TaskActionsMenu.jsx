import React, { useContext } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Subject as SubjectIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { i18n } from "../../../translate/i18n";
import { AuthContext } from '../../../context/Auth/AuthContext';

const TaskActionsMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  onManageCategories, 
  onImport, 
  onManageCharges, 
  onManageSubjects
}) => {
  const { user } = useContext(AuthContext);
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
    >
      <MenuItem onClick={onImport}>
        <ListItemIcon>
          <CloudUploadIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={i18n.t('tasks.import.title') || 'Importar Tarefas'} />
      </MenuItem>
      
      <MenuItem onClick={onManageCategories}>
        <ListItemIcon>
          <CategoryIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={i18n.t('taskCategories.manageCategories') || 'Gerenciar Categorias'} />
      </MenuItem>
      
      <MenuItem onClick={onManageSubjects}>
        <ListItemIcon>
          <SubjectIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={i18n.t('taskSubjects.manageSubjects') || 'Gerenciar Assuntos'} />
      </MenuItem>
      
      <MenuItem onClick={onManageCharges}>
        <ListItemIcon>
          <AttachMoneyIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={i18n.t('tasks.charges.title') || 'Gerenciar Cobranças'} />
      </MenuItem>
    </Menu>
  );
};

export default TaskActionsMenu;