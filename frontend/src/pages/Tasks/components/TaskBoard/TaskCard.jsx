import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachmentIcon,
  Notes as NotesIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  LockOutlined as PrivateIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import { i18n } from "../../../../translate/i18n";

const TaskCardContainer = styled(Card)(({ theme, isdragging, isoverdue, iscompleted }) => ({
  marginBottom: theme?.spacing?.(1) || '8px',
  borderLeft: `4px solid ${
    iscompleted === 'true' 
      ? theme?.palette?.success?.main || '#4caf50' 
      : isoverdue === 'true'
        ? theme?.palette?.error?.main || '#f44336' 
        : theme?.palette?.primary?.main || '#1976d2'
  }`,
  backgroundColor: isdragging === 'true' 
    ? theme?.palette?.action?.selected || '#e3f2fd' 
    : iscompleted === 'true'
      ? theme?.palette?.action?.hover || '#f5f5f5'
      : theme?.palette?.background?.paper || '#ffffff',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 8px rgba(0, 0, 0, 0.1)`,
  },
  [theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)']: {
    marginBottom: theme?.spacing?.(0.75) || '6px',
  },
}));

const TaskCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme?.spacing?.(1.5) || '12px',
  '&:last-child': {
    paddingBottom: theme?.spacing?.(1.5) || '12px',
  },
  [theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)']: {
    padding: theme?.spacing?.(1) || '8px',
    '&:last-child': {
      paddingBottom: theme?.spacing?.(1) || '8px',
    },
  },
}));

const TaskCardTitle = styled(Typography)(({ theme, iscompleted }) => ({
  fontWeight: 'bold',
  marginBottom: theme?.spacing?.(1) || '8px',
  ...(iscompleted === 'true' && {
    textDecoration: 'line-through',
    color: theme?.palette?.text?.secondary || '#757575',
  }),
  [theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)']: {
    fontSize: '0.85rem',
    marginBottom: theme?.spacing?.(0.5) || '4px',
  },
}));

const TaskLabelRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme?.spacing?.(0.5) || '4px',
  gap: theme?.spacing?.(0.5) || '4px',
  fontSize: '0.75rem',
  color: theme?.palette?.text?.secondary || '#757575',
  [theme?.breakpoints?.down?.('sm') || '@media (max-width: 600px)']: {
    fontSize: '0.7rem',
    marginBottom: theme?.spacing?.(0.25) || '2px',
  },
}));

const TaskCard = ({
  task,
  index,
  onClick,
  onStatusToggle,
  onEdit,
  onDelete,
  canManage,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Verifica se a tarefa é válida
  if (!task || !task.id) {
    return null;
  }

// Verifica se a tarefa está atrasada
const isOverdue = task.dueDate && 
!task.done && 
moment(task.dueDate).isValid() && 
moment(task.dueDate).isBefore(moment());

// Formata a data de vencimento
const formatDueDate = (date) => {
  if (!date) return '';
  
  try {
    const dueDate = moment(date);
    if (!dueDate.isValid()) return '';
    
    const today = moment().startOf('day');
    
    if (dueDate.isSame(today, 'day')) {
      return i18n.t('tasks.today');
    } else if (dueDate.isSame(today.clone().add(1, 'day'), 'day')) {
      return i18n.t('tasks.tomorrow');
    } else if (dueDate.isBefore(today)) {
      const days = today.diff(dueDate, 'days');
      return i18n.t('tasks.daysOverdue', { days });
    } else {
      return dueDate.format('DD/MM/YYYY');
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

// Obtém iniciais do nome para o avatar
const getInitials = (name) => {
  if (!name) return '?';
  try {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  } catch (error) {
    return '?';
  }
};

// Garantir que task.id seja um valor válido para a propriedade draggableId
const draggableId = task.id ? task.id.toString() : `task-${index}-${Math.random().toString(36).substr(2, 9)}`;

return (
  <Draggable draggableId={draggableId} index={index}>
    {(provided, snapshot) => (
      <TaskCardContainer
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        isdragging={snapshot.isDragging ? 'true' : 'false'}
        isoverdue={isOverdue ? 'true' : 'false'}
        iscompleted={task.done ? 'true' : 'false'}
        elevation={snapshot.isDragging ? 3 : 1}
        onClick={onClick}
      >
        <TaskCardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
            <TaskCardTitle 
              variant="body2" 
              iscompleted={task.done ? 'true' : 'false'}
              noWrap
              sx={{ 
                maxWidth: canManage ? (isMobile ? '70%' : '80%') : '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {task.isPrivate && (
                  <Tooltip title={i18n.t('tasks.privateTask') || 'Tarefa privada (somente você pode ver)'}>
                    <PrivateIcon fontSize="small" color="action" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
                  </Tooltip>
                )}
                <Typography variant="body2" fontWeight="medium" fontSize={isMobile ? '0.8rem' : 'inherit'}>
                  {task.title}
                </Typography>
              </Box>
            </TaskCardTitle>
            {canManage && (
              <Box onClick={(e) => e.stopPropagation()}>
                <Tooltip title={task.done ? i18n.t('tasks.markPending') : i18n.t('tasks.markDone')}>
                  <IconButton 
                    size={isMobile ? "small" : "medium"} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStatusToggle) onStatusToggle();
                    }}
                    color={task.done ? 'success' : 'default'}
                    sx={{ padding: isMobile ? 0.3 : undefined }}
                  >
                    {task.done ? <CheckCircleIcon fontSize={isMobile ? "small" : "medium"} /> : <PendingIcon fontSize={isMobile ? "small" : "medium"} />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* Informações da tarefa */}
          <Box sx={{ mb: isMobile ? 0.5 : 1 }}>
            {/* Responsável */}
            {task.responsible && (
              <TaskLabelRow>
                <PersonIcon fontSize="inherit" color="action" />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: isMobile ? 16 : 20, 
                      height: isMobile ? 16 : 20, 
                      fontSize: isMobile ? '0.6rem' : '0.75rem',
                      marginRight: 0.5,
                      bgcolor: theme?.palette?.primary?.main || '#1976d2'
                    }}
                  >
                    {getInitials(task.responsible.name)}
                  </Avatar>
                  <Typography variant="caption" noWrap fontSize={isMobile ? '0.7rem' : 'inherit'}>
                    {task.responsible.name}
                  </Typography>
                </Box>
              </TaskLabelRow>
            )}

            {/* Categoria */}
            {task.taskCategory && (
              <TaskLabelRow>
                <CategoryIcon fontSize="inherit" color="action" />
                <Typography variant="caption" noWrap fontSize={isMobile ? '0.7rem' : 'inherit'}>
                  {task.taskCategory.name}
                </Typography>
              </TaskLabelRow>
            )}

            {/* Data de vencimento */}
            {task.dueDate && (
              <TaskLabelRow>
                <ScheduleIcon fontSize="inherit" color={isOverdue ? "error" : "action"} />
                <Typography 
                  variant="caption" 
                  color={isOverdue ? "error" : "textSecondary"}
                  fontWeight={isOverdue ? "bold" : "normal"}
                  fontSize={isMobile ? '0.7rem' : 'inherit'}
                >
                  {formatDueDate(task.dueDate)}
                </Typography>
              </TaskLabelRow>
            )}
          </Box>

          {/* Rodapé com indicadores e ações */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* Indicador de notas */}
              {Array.isArray(task.notes) && task.notes.length > 0 && (
                <Tooltip title={i18n.t('tasks.hasNotes', { count: task.notes.length })}>
                  <Badge badgeContent={task.notes.length} color="primary" max={99} sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: isMobile ? 14 : 18, minWidth: isMobile ? 14 : 18 } }}>
                    <NotesIcon fontSize={isMobile ? "small" : "medium"} color="action" sx={{ fontSize: isMobile ? '0.9rem' : '1.2rem' }} />
                  </Badge>
                </Tooltip>
              )}

              {/* Indicador de anexos */}
              {Array.isArray(task.attachments) && task.attachments.length > 0 && (
                <Tooltip title={i18n.t('tasks.hasAttachments', { count: task.attachments.length })}>
                  <Badge badgeContent={task.attachments.length} color="secondary" max={99} sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: isMobile ? 14 : 18, minWidth: isMobile ? 14 : 18 } }}>
                    <AttachmentIcon fontSize={isMobile ? "small" : "medium"} color="action" sx={{ fontSize: isMobile ? '0.9rem' : '1.2rem' }} />
                  </Badge>
                </Tooltip>
              )}

              {/* Indicador de cobrança */}
              {task.hasCharge && (
                <Tooltip title={
                  task.isPaid 
                    ? i18n.t('tasks.indicators.paid', { value: task.chargeValue }) || `Pago: R$ ${parseFloat(task.chargeValue).toFixed(2)}`
                    : i18n.t('tasks.indicators.pendingPayment', { value: task.chargeValue }) || `Pendente: R$ ${parseFloat(task.chargeValue).toFixed(2)}`
                }>
                  <AttachMoneyIcon 
                    fontSize={isMobile ? "small" : "medium"} 
                    color={task.isPaid ? "success" : "error"} 
                    sx={{ fontSize: isMobile ? '0.9rem' : '1.2rem' }}
                  />
                </Tooltip>
              )}

              {/* Indicador de recorrência */}
              {task.isRecurrent && (
                <Tooltip title={i18n.t('tasks.indicators.recurrent') || 'Tarefa recorrente'}>
                  <RefreshIcon fontSize={isMobile ? "small" : "medium"} color="info" sx={{ fontSize: isMobile ? '0.9rem' : '1.2rem' }} />
                </Tooltip>
              )}
            </Box>

            {/* Ações */}
            {canManage && (
              <Box onClick={(e) => e.stopPropagation()}>
                <Tooltip title={i18n.t('tasks.buttons.edit')}>
                  <IconButton size={isMobile ? "small" : "medium"} onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit();
                  }} sx={{ padding: isMobile ? 0.3 : undefined }}>
                    <EditIcon fontSize={isMobile ? "small" : "medium"} sx={{ fontSize: isMobile ? '0.9rem' : '1.2rem' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={i18n.t('tasks.buttons.delete')}>
                  <IconButton size={isMobile ? "small" : "medium"} onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete();
                  }} color="error" sx={{ padding: isMobile ? 0.3 : undefined }}>
                    <DeleteIcon fontSize={isMobile ? "small" : "medium"} sx={{ fontSize: isMobile ? '0.9rem' : '1.2rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </TaskCardContent>
      </TaskCardContainer>
    )}
  </Draggable>
);
};

export default TaskCard;