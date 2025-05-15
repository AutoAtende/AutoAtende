import React, { useState, useCallback, memo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Chip,
  Typography,
  Box,
  Avatar,
  useTheme,
  useMediaQuery,
  styled,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as ScheduleIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Notes as NotesIcon,
  AttachFile as AttachmentIcon,
  LockOutlined as PrivateIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon,
  PlayCircleOutline as InProgressIcon,
} from '@mui/icons-material';
import moment from 'moment';
import { i18n } from "../../../translate/i18n";

// Componentes estilizados
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 'calc(100vh - 250px)',
  overflow: 'auto',
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    maxHeight: 'calc(100vh - 200px)',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75),
    fontSize: '0.75rem',
  },
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  padding: theme.spacing(1.5, 1),
  position: 'sticky',
  top: 0,
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75),
    fontSize: '0.75rem',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    pending: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    inProgress: {
      bg: theme.palette.primary.light,
      color: theme.palette.primary.dark,
    },
    completed: {
      bg: theme.palette.success.light,
      color: theme.palette.success.dark,
    },
    overdue: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark,
    },
  };

  const defaultColor = colors.pending;
  const selectedColor = status && colors[status] ? colors[status] : defaultColor;

  return {
    backgroundColor: selectedColor.bg,
    color: selectedColor.color,
    fontWeight: 'bold',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
    [theme.breakpoints.down('sm')]: {
      height: '24px',
      '& .MuiChip-label': {
        padding: '0 4px',
        fontSize: '0.65rem',
      },
    },
  };
});

const StyledBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: 'none',
  padding: 0,
  height: 'auto',
  '& .MuiChip-label': {
    padding: '0 4px',
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiChip-label': {
      padding: '0 2px',
      fontSize: '0.65rem',
    },
  },
}));

const TasksTable = memo(({
  tasks = [],
  onTaskClick,
  onStatusToggle,
  onEditTask,
  onDeleteTask,
  canManageTask,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Estados
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // Verificações de segurança para evitar erros
  const safeTasks = Array.isArray(tasks) ? tasks.filter(t => t && t.id) : [];

  // Handlers - memoizados com useCallback
  const handleOpenMenu = useCallback((event, task) => {
    if (!task) return;
    event.stopPropagation();
    setSelectedTask(task);
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedTask(null);
  }, []);

  const handleRowClick = useCallback((task) => {
    if (!task || !onTaskClick) return;
    onTaskClick(task);
  }, [onTaskClick]);

  const handleToggleExpand = useCallback((event, taskId) => {
    if (!taskId) return;
    event.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  }, []);

  const handleToggleStatus = useCallback((event, task) => {
    if (!task || !onStatusToggle) return;
    event.stopPropagation();
    
    // Criar uma cópia da tarefa com o status done invertido
    const updatedTask = {
      ...task,
      done: !task.done,
      // Se a tarefa está sendo marcada como concluída, também devemos desativar inProgress
      inProgress: task.done ? task.inProgress : false
    };
    
    // Chamar o callback com a tarefa atualizada
    onStatusToggle(updatedTask);
  }, [onStatusToggle]);

  // Nova função para alternar o status "em andamento"
  const handleToggleInProgress = useCallback((event, task) => {
    if (!task) return;
    event.stopPropagation();

    // Criamos uma cópia da tarefa com o status inProgress alternado
    const updatedTask = {
      ...task,
      inProgress: !task.inProgress,
      // Se a tarefa estava concluída e agora está em andamento, marcamos como não concluída
      done: task.inProgress ? task.done : false
    };

    // Usamos o mesmo handler de toggle de status para atualizar a tarefa
    if (onStatusToggle) {
      onStatusToggle(updatedTask);
    }
  }, [onStatusToggle]);

  // Formato da data de vencimento
  const formatDueDate = useCallback((dueDate) => {
    if (!dueDate) return '';

    try {
      const dueDateObj = moment(dueDate);
      if (!dueDateObj.isValid()) return '';

      const today = moment().startOf('day');

      if (dueDateObj.isSame(today, 'day')) {
        return i18n.t('tasks.dueToday');
      } else if (dueDateObj.isSame(today.clone().add(1, 'day'), 'day')) {
        return i18n.t('tasks.dueTomorrow');
      } else if (dueDateObj.isBefore(today)) {
        const days = today.diff(dueDateObj, 'days');
        return i18n.t('tasks.daysOverdue', { days });
      } else {
        return dueDateObj.format('DD/MM/YYYY');
      }
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  }, []);

  // Verificar se a tarefa está atrasada
  const isTaskOverdue = useCallback((task) => {
    if (!task || !task.dueDate || task.done) return false;
    try {
      return moment(task.dueDate).isValid() && moment(task.dueDate).isBefore(moment());
    } catch (error) {
      return false;
    }
  }, []);

  // Obter o status da tarefa
  const getTaskStatus = useCallback((task) => {
    if (!task) return 'pending';
    if (task.done) return 'completed';
    if (isTaskOverdue(task)) return 'overdue';
    if (task.inProgress) return 'inProgress';
    return 'pending';
  }, [isTaskOverdue]);

  // Obter a cor para a linha com base no status
  const getRowColor = useCallback((task) => {
    if (!task) return 'inherit';
    if (task.done) return theme.palette.action.hover;
    if (isTaskOverdue(task)) return theme.palette.error.light + '20'; // 20% de opacidade
    return 'inherit';
  }, [theme.palette.action.hover, theme.palette.error.light, isTaskOverdue]);

  // Obter as iniciais do nome para o avatar
  const getInitials = useCallback((name) => {
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
  }, []);

  // Renderizar indicadores para a tabela
  const renderTaskIndicators = useCallback((task) => {
    if (!task) return null;

    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
        {Array.isArray(task.notes) && task.notes.length > 0 && (
          <Tooltip title={i18n.t('tasks.indicators.notes', { count: task.notes.length }) || `${task.notes.length} notas`}>
            <StyledBadge
              icon={<NotesIcon fontSize="small" color="primary" />}
              label={task.notes.length}
              size="small"
            />
          </Tooltip>
        )}
        {Array.isArray(task.attachments) && task.attachments.length > 0 && (
          <Tooltip title={i18n.t('tasks.indicators.attachments', { count: task.attachments.length }) || `${task.attachments.length} anexos`}>
            <StyledBadge
              icon={<AttachmentIcon fontSize="small" color="primary" />}
              label={task.attachments.length}
              size="small"
            />
          </Tooltip>
        )}
        {task.hasCharge && (
          <Tooltip title={
            task.isPaid
              ? i18n.t('tasks.indicators.paid', { value: task.chargeValue }) || `Pago: R$ ${parseFloat(task.chargeValue).toFixed(2)}`
              : i18n.t('tasks.indicators.pendingPayment', { value: task.chargeValue }) || `Pendente: R$ ${parseFloat(task.chargeValue).toFixed(2)}`
          }>
            <AttachMoneyIcon fontSize="small" color={task.isPaid ? "success" : "error"} />
          </Tooltip>
        )}
        {task.isRecurrent && (
          <Tooltip title={i18n.t('tasks.indicators.recurrent') || 'Tarefa recorrente'}>
            <RefreshIcon fontSize="small" color="info" />
          </Tooltip>
        )}
      </Box>
    );
  }, []);

  if (loading && safeTasks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 2 }}>
      <StyledTableContainer>
        <Table stickyHeader aria-label="tarefas">
          <TableHead>
            <TableRow>
              <StyledHeaderCell width="40px" />
              <StyledHeaderCell>{i18n.t('tasks.columns.title')}</StyledHeaderCell>
              <StyledHeaderCell align="center" width={130}>{i18n.t('tasks.columns.status')}</StyledHeaderCell>
              {!isMobile && (
                <>
                  <StyledHeaderCell align="center" width={150}>{i18n.t('tasks.columns.dueDate')}</StyledHeaderCell>
                  <StyledHeaderCell align="center" width={180}>{i18n.t('tasks.columns.responsible')}</StyledHeaderCell>
                  {!isTablet && (
                    <StyledHeaderCell align="center" width={150}>{i18n.t('tasks.columns.category')}</StyledHeaderCell>
                  )}
                </>
              )}
              <StyledHeaderCell align="center" width={isMobile ? 100 : 150}>{i18n.t('tasks.columns.actions')}</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!safeTasks.length ? (
              <TableRow>
                <StyledTableCell colSpan={isMobile ? 4 : (isTablet ? 5 : 6)} align="center">
                  <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                    {i18n.t('tasks.empty.noTasks') || 'Nenhuma tarefa encontrada'}
                  </Typography>
                </StyledTableCell>
              </TableRow>
            ) : (
              safeTasks.map((task) => {
                if (!task || !task.id) return null;

                const taskId = String(task.id);
                const taskStatus = getTaskStatus(task);

                return (
                  <React.Fragment key={taskId}>
                    <TableRow
                      hover
                      onClick={() => handleRowClick(task)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: getRowColor(task),
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        }
                      }}
                    >
                      <StyledTableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleToggleExpand(e, taskId)}
                        >
                          {expandedRows[taskId] ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        </IconButton>
                      </StyledTableCell>

                      <StyledTableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {task.isPrivate && (
                              <Tooltip title={i18n.t('tasks.privateTask') || 'Tarefa privada (somente você pode ver)'}>
                                <PrivateIcon fontSize="small" color="action" />
                              </Tooltip>
                            )}
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 'medium',
                                textDecoration: task.done ? 'line-through' : 'none',
                                color: task.done ? 'text.secondary' : 'text.primary',
                                fontSize: isMobile ? '0.8rem' : 'inherit'
                              }}
                            >
                              {task.title || 'Sem título'}
                            </Typography>
                          </Box>
                          {renderTaskIndicators(task)}
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <StatusChip
                          label={i18n.t(`tasks.status.${taskStatus}`) || taskStatus}
                          status={taskStatus}
                          size="small"
                        />
                      </StyledTableCell>

                      {!isMobile && (
                        <>
                          <StyledTableCell align="center">
                            {task.dueDate ? (
                              <Tooltip title={task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY HH:mm') : ''}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <ScheduleIcon
                                    fontSize="small"
                                    color={isTaskOverdue(task) ? "error" : "action"}
                                  />
                                  <Typography
                                    variant="body2"
                                    color={isTaskOverdue(task) ? "error" : "textSecondary"}
                                    fontWeight={isTaskOverdue(task) ? "bold" : "normal"}
                                  >
                                    {formatDueDate(task.dueDate)}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                --
                              </Typography>
                            )}
                          </StyledTableCell>

                          <StyledTableCell align="center">
                            {task.assignmentType === 'group' && Array.isArray(task.taskUsers) && task.taskUsers.length > 1 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    fontSize: '0.75rem',
                                    marginRight: 1,
                                    bgcolor: theme.palette.secondary.main
                                  }}
                                >
                                  {task.taskUsers.length}
                                </Avatar>
                                <Typography variant="body2" noWrap>
                                  {i18n.t('tasks.group') || 'Grupo'} ({task.taskUsers.length})
                                </Typography>
                              </Box>
                            ) : task.responsible ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    fontSize: '0.75rem',
                                    marginRight: 1,
                                    bgcolor: theme.palette.primary.main
                                  }}
                                >
                                  {getInitials(task.responsible.name)}
                                </Avatar>
                                <Typography variant="body2" noWrap>
                                  {task.responsible.name}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                --
                              </Typography>
                            )}
                          </StyledTableCell>

                          {!isTablet && (
                            <StyledTableCell align="center">
                              {task.taskCategory ? (
                                <Chip
                                  size="small"
                                  label={task.taskCategory.name}
                                  icon={<CategoryIcon fontSize="small" />}
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  --
                                </Typography>
                              )}
                            </StyledTableCell>
                          )}
                        </>
                      )}

                      <StyledTableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          {typeof canManageTask === 'function' && canManageTask(task) && (
                            <>
                              {/* Botão para alternar entre "Em Andamento" e "Pendente" */}
                              <Tooltip title={task.inProgress ? i18n.t('tasks.buttons.markPending') || 'Marcar como Pendente' : i18n.t('tasks.buttons.markInProgress') || 'Marcar como Em Andamento'}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleToggleInProgress(e, task)}
                                  color={task.inProgress ? "info" : "default"}
                                  disabled={task.done} // Desabilita se a tarefa estiver concluída
                                >
                                  <InProgressIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={task.done ? i18n.t('tasks.buttons.markPending') : i18n.t('tasks.buttons.markDone')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleToggleStatus(e, task)}
                                  color={task.done ? "success" : "default"}
                                >
                                  {task.done ? <CheckCircleIcon /> : <PendingIcon />}
                                </IconButton>
                              </Tooltip>

                              {!isMobile && (
                                <>
                                  <Tooltip title={i18n.t('tasks.buttons.edit')}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onEditTask) onEditTask(task);
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={i18n.t('tasks.buttons.delete')}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onDeleteTask) onDeleteTask(task);
                                      }}
                                      color="error"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}

                              {isMobile && (
                                <Tooltip title={i18n.t('tasks.buttons.options')}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleOpenMenu(e, task)}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </Box>
                      </StyledTableCell>
                    </TableRow>

                    {/* Linha expandida para detalhes em dispositivos móveis */}
                    {isMobile && (
                      <TableRow>
                        <StyledTableCell colSpan={6} sx={{ padding: 0, border: 0 }}>
                          <Collapse in={expandedRows[taskId]} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: theme.palette.action.hover }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ScheduleIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  <strong>{i18n.t('tasks.columns.dueDate')}:</strong> {task.dueDate ? formatDueDate(task.dueDate) : '--'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PersonIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  <strong>{i18n.t('tasks.columns.responsible')}:</strong> {task.responsible ? task.responsible.name : '--'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CategoryIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  <strong>{i18n.t('tasks.columns.category')}:</strong> {task.taskCategory ? task.taskCategory.name : '--'}
                                </Typography>
                              </Box>
                              {task.hasCharge && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <AttachMoneyIcon color={task.isPaid ? "success" : "error"} sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    <strong>{i18n.t('tasks.charge')}:</strong> R$ {parseFloat(task.chargeValue).toFixed(2)}
                                    ({task.isPaid ? i18n.t("tasks.paid") : i18n.t("tasks.pending")})
                                  </Typography>
                                </Box>
                              )}
                              {task.isRecurrent && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <RefreshIcon color="info" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    <strong>{i18n.t('tasks.recurrence')}:</strong> {i18n.t(`tasks.recurrence.${task.recurrenceType}`) || task.recurrenceType}
                                  </Typography>
                                </Box>
                              )}
                              {task.text && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    <strong>{i18n.t('tasks.description')}:</strong> {task.text}
                                  </Typography>
                                </Box>
                              )}

                              {/* Área de ações para dispositivos móveis */}
                              {typeof canManageTask === 'function' && canManageTask(task) && (
                                <Box sx={{ display: 'flex', mt: 2, justifyContent: 'flex-end', gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onEditTask) onEditTask(task);
                                    }}
                                  >
                                    {i18n.t('tasks.buttons.edit')}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<DeleteIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onDeleteTask) onDeleteTask(task);
                                    }}
                                  >
                                    {i18n.t('tasks.buttons.delete')}
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Menu de contexto para ações em dispositivos móveis */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedTask && !selectedTask.done && (
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            handleCloseMenu();
            handleToggleInProgress(e, selectedTask);
          }}>
            <ListItemIcon>
              <InProgressIcon fontSize="small" color={selectedTask.inProgress ? "info" : "default"} />
            </ListItemIcon>
            <ListItemText primary={selectedTask.inProgress ? i18n.t('tasks.buttons.markPending') || 'Marcar como Pendente' : i18n.t('tasks.buttons.markInProgress') || 'Marcar como Em Andamento'} />
          </MenuItem>
        )}
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          handleCloseMenu();
          if (onEditTask && selectedTask) onEditTask(selectedTask);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t('tasks.buttons.edit')} />
        </MenuItem>
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          handleCloseMenu();
          if (onDeleteTask && selectedTask) onDeleteTask(selectedTask);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={i18n.t('tasks.buttons.delete')} sx={{ color: theme.palette.error.main }} />
        </MenuItem>
      </Menu>
    </Paper>
  );
});

export default TasksTable;