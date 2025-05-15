import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  Notes as NotesIcon,
  AttachFile as AttachmentIcon,
  Update as UpdateIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Subject as SubjectIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  EventRepeat as RecurrenceIcon,
  LockOutlined as PrivateIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  BarChart as ChartIcon,
  AssignmentReturned as AssignmentReturnedIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import moment from 'moment';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";

const TaskTimeline = ({ taskId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/task/${taskId}/timeline`);
      setTimeline(Array.isArray(data) ? data : []);
      setError(null);

      // Buscar usuários para referência
      try {
        const userResponse = await api.get('/users');
        if (userResponse.data && Array.isArray(userResponse.data.users)) {
          setUsers(userResponse.data.users);
        }
      } catch (userErr) {
        console.error('Erro ao buscar usuários:', userErr);
      }
    } catch (err) {
      console.error(err);
      setError(i18n.t("tasks.timeline.fetchError"));
      toast.error(i18n.t("tasks.timeline.fetchError"));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTimeline();
  }, [taskId]);

  const getTimelineIcon = (action) => {
    switch (action) {
      // Eventos básicos de tarefa
      case 'task_created':
        return <AssignmentReturnedIcon color="primary" />;
      case 'task_updated':
        return <UpdateIcon color="primary" />;
      case 'task_deleted':
        return <DeleteIcon color="error" />;

      // Eventos de status
      case 'status_changed':
      case 'status_change':
        return <UpdateIcon color="info" />;
      case 'completed':
        return <CheckCircleIcon color="success" />;

      // Eventos de notas
      case 'note_added':
        return <NotesIcon color="info" />;
      case 'note_updated':
        return <NotesIcon color="info" />;
      case 'note_deleted':
        return <NotesIcon color="error" />;

      // Eventos de anexos
      case 'attachment_added':
        return <AttachmentIcon color="warning" />;
      case 'attachment_deleted':
        return <AttachmentIcon color="error" />;

      // Eventos de responsáveis e usuários
      case 'user_assigned':
      case 'user_unassigned':
      case 'responsible_changed':
      case 'responsible_change':
        return <PersonIcon color="primary" />;
      case 'users_added':
      case 'user_removed':
        return <GroupIcon color="primary" />;

      // Eventos de categorias e assuntos
      case 'category_changed':
        return <CategoryIcon color="secondary" />;
      case 'subject_associated':
      case 'subject_changed':
        return <SubjectIcon color="secondary" />;

      // Eventos de empresas
      case 'employer_associated':
      case 'employer_changed':
        return <BusinessIcon color="primary" />;

      // Eventos de cobrança e pagamento
      case 'charge_added':
      case 'charge_created':
        return <AttachMoneyIcon color="success" />;
      case 'payment_registered':
        return <PaymentIcon color="success" />;
      case 'charge_email_sent':
      case 'receipt_email_sent':
        return <EmailIcon color="primary" />;
      case 'charge_pdf_generated':
        return <PdfIcon color="primary" />;

      // Eventos de notificação
      case 'notification_sent':
      case 'notification_failed':
      case 'overdue_notification_sent':
      case 'overdue_notification_failed':
        return <EmailIcon color="info" />;

      // Eventos de recorrência
      case 'recurrence_configured':
      case 'recurrence_created':
      case 'recurrence_limit_reached':
      case 'recurrence_end_date_reached':
      case 'recurrence_child_created':
      case 'recurrence_series_updated':
      case 'recurrence_series_deleted':
        return <RecurrenceIcon color="secondary" />;

      // Eventos de privacidade
      case 'privacy_changed':
        return <PrivateIcon color="primary" />;

      // Eventos de relatório
      case 'report_generated':
      case 'financial_report_generated':
      case 'charge_stats_accessed':
        return <ChartIcon color="primary" />;

      // Outros eventos
      case 'due_date_changed':
        return <TimeIcon color="primary" />;
      case 'title_changed':
      case 'description_changed':
        return <UpdateIcon color="primary" />;

      default:
        return <UpdateIcon color="action" />;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return moment(date).format('DD/MM/YYYY HH:mm');
  };

  // Função para ajudar a renderizar detalhes de eventos específicos
  const renderEventDetails = (event) => {
    if (!event || !event.details) return null;
    
    const details = event.details;

    switch (event.action) {
      case 'note_added':
      case 'note_updated':
        return (
          <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, fontSize: '0.85rem' }}>
            {details.content || details.newContent || ''}
          </Typography>
        );
        
      case 'charge_added':
      case 'charge_created':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip 
              icon={<AttachMoneyIcon />} 
              label={`R$ ${parseFloat(details.chargeValue).toFixed(2)}`} 
              color="success" 
              variant="outlined" 
              size="small"
            />
          </Box>
        );
        
      case 'payment_registered':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip 
              icon={<PaymentIcon />} 
              label={`R$ ${parseFloat(details.chargeValue).toFixed(2)}`} 
              color="success" 
              size="small"
            />
          </Box>
        );
        
      case 'attachment_added':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip 
              icon={<AttachmentIcon />} 
              label={details.filename || ''} 
              variant="outlined" 
              size="small"
            />
          </Box>
        );
        
      default:
        return null;
    }
  };

  const getTimelineText = (event) => {
    // Garante que sempre temos um nome de usuário, mesmo que seja "Sistema"
    const userName = event.user?.name || i18n.t("tasks.timeline.system");
  
    switch (event.action) {
      case 'task_created':
        return i18n.t("tasks.timeline.taskCreated", { 
          name: userName,
          title: event.details?.title || ''
        });
  
      case 'task_updated':
        return i18n.t("tasks.timeline.taskUpdated", { name: userName });
      
      case 'task_deleted':
        return i18n.t("tasks.timeline.taskDeleted", { name: userName });
  
      case 'note_added':
        return i18n.t("tasks.timeline.noteAdded", { 
          name: userName,
          note: event.details?.content || ''
        });
  
      case 'note_updated':
        return i18n.t("tasks.timeline.noteUpdated", { 
          name: userName,
          note: event.details?.newContent || ''
        });
  
      case 'note_deleted':
        return i18n.t("tasks.timeline.noteDeleted", { 
          name: userName
        });
  
      case 'attachment_added':
        return i18n.t("tasks.timeline.attachmentAdded", { 
          name: userName, 
          filename: event.details?.filename || ''
        });
  
      case 'attachment_deleted':
        return i18n.t("tasks.timeline.attachmentDeleted", { 
          name: userName,
          filename: event.details?.filename || ''
        });
  
      case 'status_change':
      case 'status_changed':
        const newStatus = event.details?.newStatus || '';
        const isCompleted = newStatus === 'completed' || event.details?.done === true;
        
        return isCompleted ? 
          i18n.t("tasks.timeline.statusCompletedBy", { name: userName }) :
          i18n.t("tasks.timeline.statusPendingBy", { name: userName });
  
      case 'responsible_change':
      case 'responsible_changed':
        const oldResponsibleId = event.details?.oldResponsibleId || event.details?.oldResponsible;
        const newResponsibleId = event.details?.newResponsibleId || event.details?.newResponsible;
        
        const oldResponsible = users.find(u => u.id === oldResponsibleId)?.name || '';
        const newResponsible = users.find(u => u.id === newResponsibleId)?.name || '';
        
        return i18n.t("tasks.timeline.responsibleChanged", { 
          name: userName,
          oldResponsible,
          newResponsible
        });
  
      case 'users_added':
        const usersCount = event.details?.usersCount || 0;
        return i18n.t("tasks.timeline.usersAdded", { 
          name: userName,
          count: usersCount
        });
  
      case 'user_removed':
        const removedUserId = event.details?.removedUserId;
        const removedUser = users.find(u => u.id === removedUserId)?.name || '';
        return i18n.t("tasks.timeline.userRemoved", { 
          name: userName,
          removed: removedUser
        });
  
      case 'category_changed':
        return i18n.t("tasks.timeline.categoryChanged", { 
          name: userName,
          category: event.details?.category?.name || ''
        });
  
      case 'due_date_changed':
        return i18n.t("tasks.timeline.dueDateChanged", { 
          name: userName,
          date: event.details?.newDate ? 
            moment(event.details.newDate).format('DD/MM/YYYY HH:mm') : 
            i18n.t("tasks.timeline.noDate")
        });
  
      case 'title_changed':
        return i18n.t("tasks.timeline.titleChanged", { 
          name: userName,
          title: event.details?.newTitle || ''
        });
  
      case 'description_changed':
        return i18n.t("tasks.timeline.descriptionChanged", { 
          name: userName
        });
        
      case 'employer_associated':
        return i18n.t("tasks.timeline.employerAssociated", { 
          name: userName,
          employer: event.details?.employerName || 'Empresa'
        });
      
      case 'employer_changed':
        return i18n.t("tasks.timeline.employerChanged", { 
          name: userName,
          employer: event.details?.newEmployerId || 'Nova empresa'
        });
        
      case 'subject_associated':
        return i18n.t("tasks.timeline.subjectAssociated", { 
          name: userName,
          subject: event.details?.subjectName || 'Assunto'
        });
        
      case 'subject_changed':
        return i18n.t("tasks.timeline.subjectChanged", { 
          name: userName,
          subject: event.details?.newSubjectId || 'Novo assunto'
        });
        
      case 'charge_added':
      case 'charge_created':
        return i18n.t("tasks.timeline.chargeAdded", { 
          name: userName,
          value: event.details?.chargeValue ? `R$ ${parseFloat(event.details.chargeValue).toFixed(2)}` : 'valor'
        });
        
      case 'payment_registered':
        return i18n.t("tasks.timeline.paymentRegistered", { 
          name: userName,
          value: event.details?.chargeValue ? `R$ ${parseFloat(event.details.chargeValue).toFixed(2)}` : 'valor',
          date: event.details?.paymentDate ? moment(event.details.paymentDate).format('DD/MM/YYYY') : 'data'
        });
        
      case 'charge_email_sent':
        return i18n.t("tasks.timeline.chargeEmailSent", { 
          name: userName,
          email: event.details?.email || 'email'
        });
        
      case 'receipt_email_sent':
        return i18n.t("tasks.timeline.receiptEmailSent", { 
          name: userName,
          email: event.details?.email || 'email'
        });
        
      case 'charge_pdf_generated':
        return i18n.t("tasks.timeline.chargePdfGenerated", { 
          name: userName
        });
        
      case 'notification_sent':
        return i18n.t("tasks.timeline.notificationSent", { 
          name: userName,
          type: event.details?.notificationType || 'notificação'
        });
        
      case 'notification_failed':
        return i18n.t("tasks.timeline.notificationFailed", { 
          name: userName,
          reason: event.details?.reason || event.details?.error || 'erro'
        });
        
      case 'overdue_notification_sent':
        return i18n.t("tasks.timeline.overdueNotificationSent", { 
          name: userName,
          minutes: event.details?.minutesOverdue || '0'
        });
        
      case 'recurrence_configured':
        return i18n.t("tasks.timeline.recurrenceConfigured", { 
          name: userName,
          type: event.details?.recurrenceType || 'recorrência'
        });
        
      case 'recurrence_created':
        return i18n.t("tasks.timeline.recurrenceCreated", { 
          name: userName,
          childId: event.details?.childTaskId || 'nova tarefa'
        });
        
      case 'recurrence_child_created':
        return i18n.t("tasks.timeline.recurrenceChildCreated", { 
          name: userName,
          parentId: event.details?.parentTaskId || 'tarefa pai'
        });
        
      case 'recurrence_limit_reached':
        return i18n.t("tasks.timeline.recurrenceLimitReached", { 
          name: userName,
          count: event.details?.recurrenceCount || '0'
        });
        
      case 'recurrence_end_date_reached':
        return i18n.t("tasks.timeline.recurrenceEndDateReached", { 
          name: userName,
          date: event.details?.recurrenceEndDate ? moment(event.details.recurrenceEndDate).format('DD/MM/YYYY') : 'data'
        });
        
      case 'recurrence_series_updated':
        return i18n.t("tasks.timeline.recurrenceSeriesUpdated", { 
          name: userName,
          fields: Array.isArray(event.details?.updatedFields) ? event.details.updatedFields.join(', ') : 'campos'
        });
        
      case 'recurrence_series_deleted':
        return i18n.t("tasks.timeline.recurrenceSeriesDeleted", { 
          name: userName,
          count: event.details?.deletedCount || '0'
        });
        
      case 'report_generated':
        return i18n.t("tasks.timeline.reportGenerated", { 
          name: userName,
          type: event.details?.reportType || 'relatório'
        });
        
      case 'financial_report_generated':
        return i18n.t("tasks.timeline.financialReportGenerated", { 
          name: userName
        });
        
      default:
        return i18n.t("tasks.timeline.taskUpdated", { name: userName });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography color="error">{error}</Typography>
        <IconButton size="small" onClick={fetchTimeline}>
          <RefreshIcon />
        </IconButton>
      </Paper>
    );
  }

  if (timeline.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">
          {i18n.t("tasks.timeline.noEvents")}
        </Typography>
      </Paper>
    );
  }

  // Agrupar eventos por data para uma exibição mais organizada
  const groupEventsByDate = () => {
    const groups = {};
    
    timeline.forEach(event => {
      if (!event.createdAt) return;
      
      const date = moment(event.createdAt).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    
    return Object.entries(groups).map(([date, events]) => ({
      date,
      displayDate: moment(date).format('DD/MM/YYYY'),
      events
    }));
  };
  
  const groupedEvents = groupEventsByDate();

  return (
    <Box>
      {groupedEvents.map(group => (
        <Box key={group.date} sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              px: 2,
              py: 0.5,
              backgroundColor: theme.palette.background.default,
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              {group.displayDate}
            </Typography>
          </Box>
          
          <List>
            {group.events.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon>
                  {getTimelineIcon(event.action)}
                </ListItemIcon>
                <ListItemText
                  primary={getTimelineText(event)}
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {renderEventDetails(event)}
                      <Tooltip title={moment(event.createdAt).format('DD/MM/YYYY HH:mm:ss')}>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                          {moment(event.createdAt).format('HH:mm:ss')}
                        </Typography>
                      </Tooltip>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};

export default TaskTimeline;