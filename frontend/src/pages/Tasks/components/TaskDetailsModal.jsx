import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Repeat as RepeatIcon,
  Subject as SubjectIcon,
  Download as DownloadIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import moment from 'moment';
import { i18n } from "../../../translate/i18n";
import { SocketContext } from "../../../context/Socket/SocketContext";
import TaskNotes from './TaskNotes';
import TaskAttachments from './TaskAttachments';
import TaskTimeline from './TaskTimeline';
import AttachmentPreviewModal from './AttachmentPreviewModal';
import { fetchTaskDetails } from './TaskUtils';
import TaskChargeComponent from './TaskChargeComponent';

function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`task-tab-${index}`}
      sx={{ mt: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

const TaskDetailsModal = ({ open, onClose, task: initialTask, onStatusToggle, canEdit, onEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const socketManager = useContext(SocketContext);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [notesKey, setNotesKey] = useState(0);
  const [attachmentsKey, setAttachmentsKey] = useState(0);
  const [timelineKey, setTimelineKey] = useState(0);

  useEffect(() => {
    if (open && initialTask?.id) {
      setLoading(true);
      fetchTaskDetails(initialTask.id)
        .then(taskData => {
          if (taskData) {
            setTask(taskData);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, initialTask?.id]);

  useEffect(() => {
    if (!open || !task) return;

    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    
    const handleTaskUpdate = (data) => {
      if (data.taskId !== task?.id) return;
      
      switch(data.type) {
        case 'task-note-added':
        case 'task-note-updated':
        case 'task-note-deleted':
          setNotesKey(prev => prev + 1);
          break;
        case 'task-attachment-added':
        case 'task-attachment-deleted':
          setAttachmentsKey(prev => prev + 1);
          break;
        case 'task-updated':
        case 'task-status-updated':
          setTimelineKey(prev => prev + 1);
          fetchTaskDetails(task.id).then(taskData => {
            if (taskData) setTask(taskData);
          });
          break;
        default:
          break;
      }
    };

    socket?.on('task-update', handleTaskUpdate);
    return () => socket?.off('task-update', handleTaskUpdate);
  }, [socketManager, task?.id, open]);

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
  };

  const handlePreviewClick = (attachment) => {
    setSelectedAttachment(attachment);
    setPreviewOpen(true);
  };

  const handleClose = () => {
    setTask(null);
    setCurrentTab(0);
    onClose();
  };

  const handleTaskUpdate = (updatedTask) => {
    if (updatedTask) {
      setTask(updatedTask);
    }
  };

  // Verifica se a tarefa é atribuída a um grupo
  const isGroupTask = () => {
    return Array.isArray(task?.taskUsers) && task?.taskUsers.length > 1;
  };

  if (!open || !task) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ px: isMobile ? 2 : 3, pb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 1 
          }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ 
              fontSize: isMobile ? '1rem' : undefined,
              wordBreak: 'break-word',
              lineHeight: 1.2,
              pr: 1,
              maxWidth: 'calc(100% - 80px)',
            }}>
              {task.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              {canEdit && (
                <>
                  <Tooltip title={i18n.t("tasks.buttons.edit")}>
                    <IconButton size="small" onClick={onEdit}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={task.done ? i18n.t("tasks.buttons.markPending") : i18n.t("tasks.buttons.markDone")}>
                    <IconButton 
                      size="small"
                      onClick={() => onStatusToggle(task)}
                      color={task.done ? "success" : "default"}
                    >
                      {task.done ? <CheckCircleIcon /> : <PendingIcon />}
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />
        
        <DialogContent sx={{ px: isMobile ? 2 : 3, py: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mt: isMobile ? 0 : 1 }}>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontSize: isMobile ? '0.875rem' : undefined,
                    lineHeight: 1.5,
                  }}>
                    {task?.text || i18n.t("tasks.noDescription")}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    fontSize: isMobile ? '0.75rem' : undefined,
                  }}>
                    {task?.creator?.name && (
                      <Chip
                        icon={<PersonIcon sx={{ fontSize: isMobile ? '0.9rem' : undefined }} />}
                        label={`${i18n.t("tasks.creator")}: ${task.creator.name}`}
                        size={isMobile ? "small" : "medium"}
                        sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                      />
                    )}
                    
                    {/* Exibir chip diferente com base se é tarefa de grupo ou individual */}
                    {isGroupTask() ? (
                      <Chip
                        icon={<GroupIcon sx={{ fontSize: isMobile ? '0.9rem' : undefined }} />}
                        label={`${i18n.t("tasks.groupAssignment") || 'Grupo'}: ${task.taskUsers?.length || 0} ${i18n.t("tasks.users") || 'usuários'}`}
                        size={isMobile ? "small" : "medium"}
                        color="secondary"
                        sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                      />
                    ) : (
                      task?.responsible?.name && (
                        <Chip
                          icon={<PersonIcon sx={{ fontSize: isMobile ? '0.9rem' : undefined }} />}
                          label={`${i18n.t("tasks.responsible")}: ${task.responsible.name}`}
                          size={isMobile ? "small" : "medium"}
                          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                        />
                      )
                    )}

                    {task?.dueDate && (
                      <Chip
                        icon={<ScheduleIcon sx={{ fontSize: isMobile ? '0.9rem' : undefined }} />}
                        label={`${i18n.t("tasks.dueDate")}: ${moment(task.dueDate).format('DD/MM/YYYY HH:mm')}`}
                        size={isMobile ? "small" : "medium"}
                        sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                      />
                    )}

                    {task.hasCharge && (
                      <Chip
                        icon={<AttachMoneyIcon sx={{ fontSize: isMobile ? '0.9rem' : undefined }} />}
                        label={`${i18n.t("tasks.charge")}: R$ ${parseFloat(task.chargeValue).toFixed(2)} ${task.isPaid ? '(' + i18n.t("tasks.paid") + ')' : '(' + i18n.t("tasks.pending") + ')'}`}
                        size={isMobile ? "small" : "medium"}
                        color={task.isPaid ? "success" : "error"}
                        sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                      />
                    )}

                    {task.isRecurrent && (
                      <Chip
                        icon={<RefreshIcon sx={{ fontSize: isMobile ? '0.9rem' : undefined }} />}
                        label={`${i18n.t("tasks.recurrence.title")}: ${i18n.t(`tasks.recurrence.${task.recurrenceType}`) || task.recurrenceType}`}
                        size={isMobile ? "small" : "medium"}
                        color="info"
                        sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                      />
                    )}

                    {task.subject && (
                      <Chip
                        icon={<SubjectIcon sx={{ fontSize: isMobile ? '0.9rem' : undefined }} />}
                        label={`${i18n.t("tasks.subject")}: ${task.subject.name}`}
                        size={isMobile ? "small" : "medium"}
                        sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : false}
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    minHeight: isMobile ? 36 : 48,
                    '& .MuiTab-root': {
                      minHeight: isMobile ? 36 : 48,
                      fontSize: isMobile ? '0.75rem' : undefined,
                      py: isMobile ? 0.5 : undefined,
                    },
                  }}
                >
                  <Tab label={i18n.t("tasks.tabs.notes")} id="tab-0" aria-controls="tabpanel-0" />
                  <Tab label={i18n.t("tasks.tabs.attachments")} id="tab-1" aria-controls="tabpanel-1" />
                  <Tab label={i18n.t("tasks.tabs.timeline")} id="tab-2" aria-controls="tabpanel-2" />
                  <Tab label={i18n.t("tasks.tabs.charges")} id="tab-3" aria-controls="tabpanel-3" />
                  <Tab label={i18n.t("tasks.tabs.details")} id="tab-4" aria-controls="tabpanel-4" />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                  <TaskNotes 
                    key={`notes-${notesKey}`}
                    taskId={task.id} 
                    disabled={!canEdit}
                  />
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                  <TaskAttachments 
                    key={`attachments-${attachmentsKey}`}
                    taskId={task.id} 
                    canDelete={canEdit}
                    disabled={!canEdit}
                    onPreviewClick={handlePreviewClick}
                  />
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                  <TaskTimeline 
                    key={`timeline-${timelineKey}`}
                    taskId={task.id}
                  />
                </TabPanel>

                <TabPanel value={currentTab} index={3}>
                  <TaskChargeComponent 
                    task={task} 
                    onUpdate={handleTaskUpdate}
                    disabled={!canEdit}
                  />
                </TabPanel>

                <TabPanel value={currentTab} index={4}>
                  <Box>
                    {/* Informações da empresa */}
                    {task.employer && (
                      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {i18n.t("tasks.employerDetails") || "Detalhes da Empresa"}
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("tasks.employerName") || "Nome"}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                              {task.employer.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("tasks.employerEmail") || "Email"}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                              {task.employer.email || "--"}
                            </Typography>
                          </Grid>
                          {task.employer.number && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.employerPhone") || "Telefone"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {task.employer.number}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    )}

                    {/* Informações do solicitante */}
                    {(task.requesterName || task.requesterEmail) && (
                      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {i18n.t("tasks.requesterDetails") || "Detalhes do Solicitante"}
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          {task.requesterName && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.requesterName") || "Nome"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {task.requesterName}
                              </Typography>
                            </Grid>
                          )}
                          {task.requesterEmail && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.requesterEmail") || "Email"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {task.requesterEmail}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    )}

                    {/* Informações dos usuários do grupo */}
                    {isGroupTask() && (
                      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <GroupIcon sx={{ mr: 1 }} />
                          {i18n.t("tasks.groupMembers") || "Membros do Grupo"}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {task.taskUsers.map(taskUser => (
                            taskUser && taskUser.user ? (
                              <Chip
                                key={taskUser.userId}
                                icon={<PersonIcon />}
                                label={taskUser.user.name}
                                size={isMobile ? "small" : "medium"}
                                variant="outlined"
                              />
                            ) : null
                          ))}
                        </Box>
                      </Paper>
                    )}

                    {/* Informações de recorrência */}
                    {task.isRecurrent && (
                      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {i18n.t("tasks.recurrenceDetails") || "Detalhes de Recorrência"}
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("tasks.recurrenceType") || "Tipo"}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                              {i18n.t(`tasks.recurrence.${task.recurrenceType}`) || task.recurrenceType}
                            </Typography>
                          </Grid>
                          {task.recurrenceEndDate && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.recurrenceEndDate") || "Data de Término"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {moment(task.recurrenceEndDate).format('DD/MM/YYYY')}
                              </Typography>
                            </Grid>
                          )}
                          {task.recurrenceCount > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.recurrenceCount") || "Quantidade de Ocorrências"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {task.recurrenceCount}
                              </Typography>
                            </Grid>
                          )}
                          {task.nextOccurrenceDate && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.nextOccurrence") || "Próxima Ocorrência"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {moment(task.nextOccurrenceDate).format('DD/MM/YYYY')}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    )}

                    {/* Informações de cobrança */}
                    {task.hasCharge && (
                      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {i18n.t("tasks.chargeDetails") || "Detalhes da Cobrança"}
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("tasks.chargeValue") || "Valor"}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: isMobile ? '0.875rem' : undefined }}>
                              R$ {parseFloat(task.chargeValue).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("tasks.chargeStatus") || "Status"}:
                            </Typography>
                            <Typography variant="body1" color={task.isPaid ? "success.main" : "error.main"} sx={{ fontWeight: 'bold', fontSize: isMobile ? '0.875rem' : undefined }}>
                              {task.isPaid ? 
                                (i18n.t("tasks.paid") || "Pago") : 
                                (i18n.t("tasks.pending") || "Pendente")}
                            </Typography>
                          </Grid>
                          {task.isPaid && task.paymentDate && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.paymentDate") || "Data de Pagamento"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {moment(task.paymentDate).format('DD/MM/YYYY')}
                              </Typography>
                            </Grid>
                          )}
                          {task.isPaid && task.paymentRegisteredBy && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.paidBy") || "Registrado por"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {task.paymentRegisteredBy.name}
                              </Typography>
                            </Grid>
                          )}
                          {task.isPaid && task.paymentNotes && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary">
                                {i18n.t("tasks.paymentNotes") || "Observações de Pagamento"}:
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                                {task.paymentNotes}
                              </Typography>
                            </Grid>
                          )}
                          {task.chargeLink && (
                            <Grid item xs={12}>
                              <Button 
                                variant="outlined" 
                                startIcon={<DownloadIcon />} 
                                onClick={() => window.open(task.chargeLink, '_blank')}
                                size={isMobile ? "small" : "medium"}
                                sx={{ mt: 1 }}
                              >
                                {i18n.t("tasks.viewInvoice") || "Visualizar Fatura"}
                              </Button>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    )}

                    {/* Informações de categoria e privacidade */}
                    <Paper sx={{ p: isMobile ? 1.5 : 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {i18n.t("tasks.additionalInfo") || "Informações Adicionais"}
                      </Typography>
                      <Grid container spacing={isMobile ? 1 : 2}>
                        {task.taskCategory && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("tasks.category") || "Categoria"}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                              {task.taskCategory.name}
                            </Typography>
                          </Grid>
                        )}
                        {task.subject && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("tasks.subject") || "Assunto"}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                              {task.subject.name}
                            </Typography>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t("tasks.privacy") || "Privacidade"}:
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                            {task.isPrivate 
                              ? i18n.t("tasks.private") || "Privada" 
                              : i18n.t("tasks.public") || "Pública"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t("tasks.createdAt") || "Criada em"}:
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                            {moment(task.createdAt).format('DD/MM/YYYY HH:mm')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t("tasks.lastUpdate") || "Última Atualização"}:
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                            {moment(task.updatedAt).format('DD/MM/YYYY HH:mm')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t("tasks.status.title") || "Status"}:
                          </Typography>
                          <Typography variant="body1" color={task.done ? "success.main" : (task.inProgress ? "info.main" : "warning.main")} sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                            {task.done 
                              ? i18n.t("tasks.status.completed") || "Concluída" 
                              : task.inProgress 
                                ? i18n.t("tasks.status.inProgress") || "Em Progresso" 
                                : i18n.t("tasks.status.pending") || "Pendente"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </TabPanel>
              </Box>
            </>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: isMobile ? 2 : 3, py: 2 }}>
          <Button 
            onClick={handleClose} 
            variant="contained" 
            size={isMobile ? "small" : "medium"}
          >
            {i18n.t("tasks.buttons.close")}
          </Button>
        </DialogActions>
      </Dialog>

      <AttachmentPreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedAttachment(null);
        }}
        attachment={selectedAttachment}
        baseURL={process.env.REACT_APP_BACKEND_URL}
      />
    </>
  );
};

export default TaskDetailsModal;