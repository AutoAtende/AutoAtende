import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import {
  Box,
  Typography,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TaskCard from './TaskCard';
import { i18n } from '../../../../translate/i18n';

const ColumnContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: 300,
  minWidth: 300,
  height: '100%',
  backgroundColor: theme?.palette?.background?.default || '#f5f5f5',
  borderRadius: theme?.shape?.borderRadius || '4px',
  [theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)']: {
    width: 280,
    minWidth: 280,
  },
  [theme?.breakpoints?.down?.('xs') || '@media (max-width: 380px)']: {
    width: 260,
    minWidth: 260,
  },
}));

const ColumnHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme?.spacing?.(1.5) || '12px',
  borderBottom: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
  [theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)']: {
    padding: theme?.spacing?.(1) || '8px',
  },
}));

const TaskList = styled(Box)(({ theme, isDraggingOver }) => ({
  padding: theme?.spacing?.(1) || '8px',
  flexGrow: 1,
  minHeight: 100,
  overflow: 'auto',
  backgroundColor: isDraggingOver
    ? theme?.palette?.action?.hover || '#f5f5f5'
    : 'transparent',
  transition: 'background-color 0.2s ease',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme?.palette?.divider || '#e0e0e0',
    borderRadius: '4px',
  },
}));

const TaskColumn = ({
  column,
  onTaskClick,
  onStatusToggle,
  onEditTask,
  onDeleteTask,
  canManageTask,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)');

  if (!column || !column.id) {
    return null;
  }

  const getHeaderColor = () => {
    switch (column.id) {
      case 'to-do':
        return theme?.palette?.info?.light || '#64b5f6';
      case 'in-progress':
        return theme?.palette?.warning?.light || '#ffb74d';
      case 'done':
        return theme?.palette?.success?.light || '#81c784';
      default:
        return theme?.palette?.primary?.light || '#90caf9';
    }
  };

  // Garantir que droppableId seja sempre uma string
  const droppableId = column.id ? column.id.toString() : `column-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <ColumnContainer elevation={1}>
      <ColumnHeader sx={{ backgroundColor: getHeaderColor() }}>
        <Typography variant={isMobile ? "body1" : "subtitle1"} fontWeight="bold">
          {column.title}
        </Typography>
        <Chip
          label={Array.isArray(column.taskIds) ? column.taskIds.length : 0}
          size="small"
          color={column.id === 'done' ? 'success' : column.id === 'in-progress' ? 'warning' : 'primary'}
        />
      </ColumnHeader>
      
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <TaskList
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            {...provided.droppableProps}
          >
            {Array.isArray(column.tasks) && column.tasks.length > 0 ? (
              column.tasks.map((task, index) => {
                if (!task || !task.id) return null;
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onClick={() => onTaskClick(task)}
                    onStatusToggle={() => onStatusToggle(task)}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task)}
                    canManage={typeof canManageTask === 'function' ? canManageTask(task) : false}
                  />
                );
              })
            ) : (
              <Box
                sx={{
                  height: 80,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: theme?.palette?.text?.secondary || '#757575',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  px: 1,
                }}
              >
                {i18n.t('tasks.kanban.emptyColumn')}
              </Box>
            )}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </ColumnContainer>
  );
};

export default TaskColumn;