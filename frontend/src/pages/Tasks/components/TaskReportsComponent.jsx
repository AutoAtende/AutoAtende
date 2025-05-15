import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TaskReportsPage from './TaskReportsPage';
import { i18n } from "../../../translate/i18n";

const TaskReportsComponent = ({ onBackClick }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">
          {i18n.t('tasks.reports.title') || 'Relatórios de Tarefas'}
        </Typography>
      </Box>
      <TaskReportsPage />
    </Box>
  );
};

export default TaskReportsComponent;