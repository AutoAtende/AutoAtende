import React, { useState } from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { i18n } from "../../../translate/i18n";
import TaskHelpModal from './TaskHelpModal';

const TaskHelpIcon = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title={i18n.t('tasks.help.tooltip') || "Ajuda sobre a Gestão de Tarefas"}>
        <IconButton 
          onClick={handleOpen} 
          size="small"
          sx={{ 
            color: theme.palette.info.main,
            '&:hover': {
              backgroundColor: `${theme.palette.info.light}20`,
            }
          }}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      <TaskHelpModal open={open} onClose={handleClose} />
    </>
  );
};

export default TaskHelpIcon;