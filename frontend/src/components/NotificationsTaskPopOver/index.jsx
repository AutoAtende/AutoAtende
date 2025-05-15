// src/components/NotificationsTaskPopOver/index.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import useSound from "use-sound";
import { styled } from "@mui/material/styles";

import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  ListItemAvatar,
  Avatar,
  Divider,
  Tooltip
} from "@mui/material";
import {
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  Clear as ClearIcon,
  Notifications as NotificationsIcon
} from "@mui/icons-material";

import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import alertTaskSound from "../../assets/sound.mp3";
import { toast } from "../../helpers/toast";
import { useDate } from "../../hooks/useDate";
import notificationService from "../../services/NotificationService";

// Componentes estilizados com styled API do MUI 5
const TabContainer = styled('div')(({ theme }) => ({
  overflowY: "auto",
  maxHeight: 350,
  ...theme.scrollbarStyles,
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: "100%",
    maxWidth: 350,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      maxWidth: 270,
    },
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const NotificationText = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const HeaderIcon = styled(EventIcon)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const TaskTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
}));

const TaskDueDate = styled(Typography)(({ theme }) => ({
  marginTop: 4,
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

const TaskDescription = styled(Typography)(({ theme }) => ({
  marginTop: 4,
  fontSize: 14,
}));

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'isOverdue'
})(({ theme, isOverdue }) => ({
  padding: theme.spacing(1, 2),
  cursor: 'pointer',
  borderLeft: isOverdue 
    ? `4px solid ${theme.palette.error.main}` 
    : `4px solid ${theme.palette.primary.main}`,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const EmptyContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
}));

const StyledBadge2 = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 5,
    top: 5,
  },
}));

const NotificationsTaskPopOver = () => {
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [play] = useSound(alertTaskSound);
  const soundAlertRef = useRef();
  const socketManager = useContext(SocketContext);
  const { dateToClient } = useDate();
  const [taskNotifications, setTaskNotifications] = useState([]);

  // Inicializa o serviço de notificações
  useEffect(() => {
    notificationService.initialize();
  }, []);
  
  // Configura o som de alerta
  useEffect(() => {
    soundAlertRef.current = play;
  }, [play]);

  // Carrega as tarefas pendentes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/task", {
          params: {
            pageNumber: 1,
            status: ["pending"],
            ownerId: user.id,
          },
        });
        
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
          setInvisible(false);
        } else {
          setTasks([]);
          setInvisible(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user.id]);

  // Configura o WebSocket para atualizações de tarefas
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const handleTaskUpdate = (data) => {
      console.log("Tarefa atualizada:", data);
      
      // Se a tarefa for atribuída ao usuário atual, atualiza a lista
      if (data.task && data.task.ownerId === user.id) {
        // Recarrega a lista de tarefas para garantir consistência
        refreshTasks();
        
        // Se for uma tarefa nova ou alterada para pendente, notifica
        if (data.action === "create" || 
            (data.action === "update" && data.task.status === "pending")) {
          notifyNewTask(data.task);
        }
      }
    };
    
    const handleTaskOverdue = (data) => {
      console.log("Tarefa vencida:", data);
      
      // Notifica apenas se a tarefa pertence ao usuário atual
      if (data.ownerId === user.id) {
        notifyOverdueTask(data);
      }
    };

    if (socket) {
      socket.on('task', handleTaskUpdate);
      socket.on('task-overdue', handleTaskOverdue);
    }

    return () => {
      if (socket) {
        socket.off('task', handleTaskUpdate);
        socket.off('task-overdue', handleTaskOverdue);
      }
    };
  }, [socketManager, user.id, play]);

  // Notifica sobre uma nova tarefa
  const notifyNewTask = (task) => {
    // Tocar som de notificação
    if (soundAlertRef.current) {
      soundAlertRef.current();
    }
    
    // Criar notificação no navegador
    const title = `Nova tarefa: ${task.title}`;
    const options = {
      body: task.description || "Sem descrição",
      icon: "/logo192.png",
      tag: `task-${task.id}`,
      renotify: true,
      requireInteraction: true
    };
    
    const onClick = (e) => {
      e.preventDefault();
      window.focus();
      history.push("/tasks");
    };
    
    const notification = notificationService.createNotification(title, options, onClick);
    
    if (notification) {
      setTaskNotifications(prev => {
        const filtered = prev.filter(n => n.tag !== `task-${task.id}`);
        return [...filtered, notification];
      });
    }
  };

  // Notifica sobre uma tarefa vencida
  const notifyOverdueTask = (task) => {
    // Tocar som de notificação
    if (soundAlertRef.current) {
      soundAlertRef.current();
    }
    
    // Criar notificação no navegador
    const formattedDate = task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy HH:mm") : "Sem data";
    const title = "Tarefa vencida!";
    const options = {
      body: `${task.title}\nVencimento: ${formattedDate}`,
      icon: "/logo192.png",
      tag: `task-overdue-${task.id}`,
      renotify: true,
      requireInteraction: true
    };
    
    const onClick = (e) => {
      e.preventDefault();
      window.focus();
      history.push("/tasks");
    };
    
    const notification = notificationService.createNotification(title, options, onClick);
    
    if (notification) {
      setTaskNotifications(prev => {
        const filtered = prev.filter(n => n.tag !== `task-overdue-${task.id}`);
        return [...filtered, notification];
      });
    }
  };

  // Atualiza a lista de tarefas
  const refreshTasks = async () => {
    try {
      const { data } = await api.get("/task", {
        params: {
          pageNumber: 1,
          status: ["pending"],
          ownerId: user.id,
        },
      });
      
      if (data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
        setInvisible(false);
      } else {
        setTasks([]);
        setInvisible(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Marca todas as tarefas como concluídas
  const handleCompleteAllTasks = async () => {
    try {
      await api.put("/task/complete-all", {
        ownerId: user.id
      });
      
      toast.success("Todas as tarefas foram marcadas como concluídas");
      
      // Limpa notificações
      notificationService.clearNotifications(taskNotifications);
      setTaskNotifications([]);
      
      // Atualiza a lista
      setTasks([]);
      setInvisible(true);
      setOpen(false);
      
    } catch (error) {
      console.error("Erro ao concluir tarefas:", error);
      toast.error("Erro ao concluir tarefas");
    }
  };

  // Abre o popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  // Fecha o popover
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  // Navega para uma tarefa específica
  const handleTaskClick = (task) => {
    history.push(`/tasks/${task.id}`);
    handleClose();
  };

  // Verifica se uma tarefa está vencida
  const isTaskOverdue = (task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        aria-label="Tarefas"
        size="large"
      >
        <StyledBadge2
          variant="dot"
          color="secondary"
          invisible={invisible}
        >
          <EventIcon style={{ color: "white" }} />
        </StyledBadge2>
      </IconButton>
      
      <StyledPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <HeaderContainer>
          <NotificationText>
            <HeaderIcon />
            <Typography variant="h6">Tarefas Pendentes</Typography>
          </NotificationText>
          {tasks.length > 0 && (
            <Tooltip title="Marcar todas como concluídas">
              <ClearButton 
                onClick={handleCompleteAllTasks} 
                size="small"
              >
                <ClearIcon />
              </ClearButton>
            </Tooltip>
          )}
        </HeaderContainer>
        
        {tasks.length > 0 ? (
          <List component={TabContainer}>
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <StyledListItem 
                  button 
                  onClick={() => handleTaskClick(task)}
                  isOverdue={isTaskOverdue(task)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {isTaskOverdue(task) ? 
                        <EventIcon color="error" /> : 
                        <EventAvailableIcon color="primary" />
                      }
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <TaskTitle>
                        {task.title}
                      </TaskTitle>
                    }
                    secondary={
                      <>
                        <TaskDueDate>
                          {task.dueDate ? (
                            <>
                              Vencimento: {dateToClient(task.dueDate)}
                              {isTaskOverdue(task) && (
                                <span style={{ color: 'red', fontWeight: 'bold' }}> (Atrasada)</span>
                              )}
                            </>
                          ) : "Sem data de vencimento"}
                        </TaskDueDate>
                        {task.description && (
                          <TaskDescription>
                            {task.description.length > 50 
                              ? `${task.description.substring(0, 50)}...` 
                              : task.description}
                          </TaskDescription>
                        )}
                      </>
                    }
                  />
                </StyledListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <EmptyContainer>
            <Typography>
              Não há tarefas pendentes
            </Typography>
          </EmptyContainer>
        )}
      </StyledPopover>
    </div>
  );
};

export default NotificationsTaskPopOver;