// index.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';
import { AuthContext } from '../../../../context/Auth/AuthContext';
import TaskKanbanView from './TaskKanbanView';
import TaskCategoryKanbanView from './TaskCategoryKanbanView';

const TaskBoard = ({
  onViewChange,
  filtersVisible,
  toggleFilters,
  filters,
  setFilters,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);

  const safeFilters = filters || {};
  
  const [kanbanMode, setKanbanMode] = useState(localStorage.getItem('kanbanMode') || 'status');

  const handleKanbanModeChange = (event, newMode) => {
    if (!newMode) return;
    setKanbanMode(newMode);
    localStorage.setItem('kanbanMode', newMode);
  };
  
  return (
    <Box>
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={kanbanMode}
          onChange={handleKanbanModeChange}
          variant="fullWidth"
        >
          <Tab 
            label={i18n.t('tasks.kanban.statusMode')} 
            value="status"
          />
          <Tab 
            label={i18n.t('tasks.kanban.categoryMode')} 
            value="category"
          />
        </Tabs>
      </Box>
      
      {kanbanMode === 'status' ? (
        <TaskKanbanView 
          onViewChange={onViewChange}
          filtersVisible={filtersVisible}
          toggleFilters={toggleFilters}
          filters={safeFilters}
          setFilters={setFilters}
        />
      ) : (
        <TaskCategoryKanbanView 
          onViewChange={onViewChange}
          filtersVisible={filtersVisible}
          toggleFilters={toggleFilters}
          filters={safeFilters}
          setFilters={setFilters}
        />
      )}
    </Box>
  );
};

export default TaskBoard;