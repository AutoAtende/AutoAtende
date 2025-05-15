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

const ColumnHeader = styled(Box)(({ theme, bgcolor }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme?.spacing?.(1.5) || '12px',
  borderBottom: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
  backgroundColor: bgcolor || theme?.palette?.primary?.light || '#90caf9',
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

// Função para gerar uma cor baseada no nome da categoria
const generateCategoryColor = (name) => {
  if (!name) return '#4caf50';
  
  // Cores disponíveis para categorias
  const colors = [
    '#4caf50', // verde
    '#2196f3', // azul
    '#ff9800', // laranja
    '#9c27b0', // roxo
    '#e91e63', // rosa
    '#00bcd4', // ciano
    '#3f51b5', // indigo
    '#795548', // marrom
    '#607d8b', // azul cinza
    '#ff5722', // laranja escuro
  ];
  
  // Cálculo simples para escolher uma cor baseada no nome
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  
  return colors[sum % colors.length];
};

const TaskCategoryColumn = ({
  category,
  tasks,
  onTaskClick,
  onStatusToggle,
  onEditTask,
  onDeleteTask,
  canManageTask,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)');

  // Garantir que a categoria seja válida e tenha um ID
  if (!category || !category.id) {
    return null;
  }

  // Garantir uma string para droppableId
  const droppableId = category.id ? category.id.toString() : `category-${Math.random().toString(36).substr(2, 9)}`;

  // Gerar cor baseada no nome da categoria
  const categoryColor = generateCategoryColor(category.name);
  
  // Garantir que tasks é um array válido
  const safeTasks = Array.isArray(tasks) ? tasks.filter(task => task && task.id) : [];

  return (
    <ColumnContainer elevation={1}>
      <ColumnHeader bgcolor={categoryColor + '33'}>
        <Typography variant={isMobile ? "body1" : "subtitle1"} fontWeight="bold" noWrap sx={{ maxWidth: isMobile ? 180 : 220 }}>
          {category.name}
        </Typography>
        <Chip
          label={safeTasks.length}
          size="small"
          sx={{ backgroundColor: categoryColor, color: 'white' }}
        />
      </ColumnHeader>
      
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <TaskList
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            {...provided.droppableProps}
          >
            {safeTasks.length > 0 ? (
              safeTasks.map((task, index) => (
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
              ))
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
                {i18n.t('tasks.kanban.emptyCategoryColumn')}
              </Box>
            )}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </ColumnContainer>
  );
};

export default TaskCategoryColumn;