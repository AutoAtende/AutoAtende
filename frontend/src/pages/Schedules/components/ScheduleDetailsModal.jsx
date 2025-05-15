import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSpring, animated } from "react-spring";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  useMediaQuery,
  Divider,
  Paper,
  Tooltip,
  CircularProgress,
  alpha
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  Repeat as RepeatIcon,
  Send as SendIcon,
  Person as PersonIcon,
  AttachFile as AttachIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WhatsApp as WhatsAppIcon,
  ErrorOutline as ErrorIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
  GetApp as DownloadIcon
} from "@mui/icons-material";
import { i18n } from "../../../translate/i18n";
import moment from "moment";
import "moment/locale/pt-br";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";

moment.locale("pt-br");

// Componente para o chip de status
const StatusChip = ({ status }) => {
  const theme = useTheme();
  
  // Configuração do chip baseada no status
  const getStatusConfig = () => {
    switch (status) {
      case "ENVIADA":
        return {
          label: i18n.t("schedules.scheduleDetails.status.sent"),
          color: "success",
          icon: <CheckIcon fontSize="small" />
        };
      case "PENDENTE":
      case "AGENDADA":
        return {
          label: i18n.t("schedules.scheduleDetails.status.pending"),
          color: "warning",
          icon: <PendingIcon fontSize="small" />
        };
      case "ERRO":
        return {
          label: i18n.t("schedules.scheduleDetails.status.error"),
          color: "error",
          icon: <ErrorIcon fontSize="small" />
        };
      case "PROCESSANDO":
        return {
          label: i18n.t("schedules.scheduleDetails.status.processing"),
          color: "info",
          icon: <CircularProgress size={12} thickness={4} />
        };
      case "CANCELADA":
        return {
          label: i18n.t("schedules.scheduleDetails.status.cancelled"),
          color: "default",
          icon: <CloseIcon fontSize="small" />
        };
      default:
        return {
          label: status || i18n.t("schedules.scheduleDetails.status.unknown"),
          color: "default",
          icon: <ScheduleIcon fontSize="small" />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      sx={{ 
        fontWeight: "medium",
        px: 1
      }}
    />
  );
};

StatusChip.propTypes = {
  status: PropTypes.string
};

// Componente de linha de informação
const InfoRow = ({ icon: Icon, title, value, highlighted }) => {
  const theme = useTheme();
  
  return (
    <Box 
      display="flex" 
      alignItems="flex-start" 
      mb={2}
      sx={{
        transition: "all 0.2s ease",
        "&:hover": {
          transform: highlighted ? "translateX(4px)" : "none"
        }
      }}
    >
      <Icon 
        color="primary" 
        sx={{ 
          mr: 2, 
          mt: 0.5,
          opacity: 0.8,
          flexShrink: 0
        }} 
      />
      <Box>
        <Typography 
          variant="caption" 
          color="textSecondary"
          sx={{ fontWeight: "medium" }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body1" 
          component="div"
          sx={{ 
            color: highlighted ? "primary.main" : "text.primary",
            fontWeight: highlighted ? "medium" : "regular",
            wordBreak: "break-word"
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  highlighted: PropTypes.bool
};

InfoRow.defaultProps = {
  highlighted: false
};

const ScheduleDetailsModal = ({ open, onClose, schedule, onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [downloading, setDownloading] = useState(false);
  const [whatsappData, setWhatsappData] = useState(null);

  // Busca as informações da conexão WhatsApp quando o modal é aberto
  useEffect(() => {
    const fetchWhatsappData = async () => {
      if (schedule && schedule.whatsappId) {
        try {
          const { data } = await api.get(`/whatsapp/${schedule.whatsappId}`);
          setWhatsappData(data);
        } catch (err) {
          console.error("Erro ao buscar dados do WhatsApp", err);
          setWhatsappData(null);
        }
      } else {
        setWhatsappData(null);
      }
    };

    if (open) {
      fetchWhatsappData();
    }
  }, [schedule, open]);

  // Animação de entrada
  const fadeIn = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: { tension: 280, friction: 20 }
  });

  // Baixar anexo se disponível
  const handleDownloadAttachment = async () => {
    if (!schedule || !schedule.mediaPath) return;
    
    try {
      setDownloading(true);
      
      // Construir URL para download
      const response = await api.get(`/schedules/${schedule.id}/download-media`, {
        responseType: "blob"
      });
      
      // Criar URL para o blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", schedule.mediaName || "attachment");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Liberar URL do objeto
      setTimeout(() => window.URL.revokeObjectURL(url), 0);
    } catch (error) {
      console.error(error);
      toast.error(i18n.t("schedules.scheduleDetails.downloadError"));
    } finally {
      setDownloading(false);
    }
  };

  // Formatar tipo de recorrência
  const formatRecurrence = (type) => {
    switch (type) {
      case "daily":
        return i18n.t("schedules.scheduleDetails.recurrence.daily");
      case "weekly":
        return i18n.t("schedules.scheduleDetails.recurrence.weekly");
      case "biweekly":
        return i18n.t("schedules.scheduleDetails.recurrence.biweekly");
      case "monthly":
        return i18n.t("schedules.scheduleDetails.recurrence.monthly");
      case "quarterly":
        return i18n.t("schedules.scheduleDetails.recurrence.quarterly");
      case "semiannually":
        return i18n.t("schedules.scheduleDetails.recurrence.semiannually");
      case "yearly":
        return i18n.t("schedules.scheduleDetails.recurrence.yearly");
      default:
        return i18n.t("schedules.scheduleDetails.recurrence.none");
    }
  };

  if (!schedule) return null;

  const canEdit = schedule.status !== "ENVIADA" && schedule.status !== "PROCESSANDO";
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        component: animated.div,
        style: fadeIn,
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          overflow: "hidden",
          height: isMobile ? "100%" : "auto",
          display: "flex",
          flexDirection: "column"
        }
      }}
    >
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          color: "white",
          py: 2,
          px: { xs: 2, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box display="flex" alignItems="center">
          <ScheduleIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {i18n.t("schedules.scheduleDetails.title")}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <StatusChip status={schedule.status} />
          <IconButton size="small" onClick={onClose} sx={{ ml: 1, color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent 
        sx={{ 
          p: { xs: 2, sm: 3 },
          bgcolor: theme.palette.background.default,
          overflow: "auto",
          flex: 1
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ 
                p: 2, 
                borderRadius: 2,
                height: "100%"
              }}
            >
              <Box 
                display="flex" 
                alignItems="center" 
                mb={2}
              >
                <PersonIcon 
                  color="primary" 
                  sx={{ mr: 1 }} 
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  {i18n.t("schedules.scheduleDetails.contactInfo")}
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  py: 1, 
                  borderRadius: 1,
                  border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  px: 2,
                  mb: 2,
                  wordBreak: "break-word"
                }}
              >
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                >
                  {schedule.contact?.name}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center",
                    mt: 0.5,
                    wordBreak: "break-all"
                  }}
                >
                  <WhatsAppIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7, flexShrink: 0 }} />
                  {schedule.contact?.number}
                </Typography>
              </Box>
              
              {/* Conexão WhatsApp utilizada */}
              {whatsappData && (
                <Box 
                  sx={{ 
                    py: 1, 
                    borderRadius: 1,
                    border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                    bgcolor: alpha(theme.palette.success.main, 0.03),
                    px: 2,
                    mb: 2
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ fontWeight: "medium", mb: 0.5 }}
                  >
                    {i18n.t("schedules.scheduleDetails.whatsappConnection")}
                  </Typography>
                  
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: whatsappData.color || theme.palette.success.main,
                        mr: 1,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                      {whatsappData.name}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              <InfoRow
                icon={TimeIcon}
                title={i18n.t("schedules.scheduleDetails.createdAt")}
                value={moment(schedule.createdAt).format("DD/MM/YYYY HH:mm")}
              />
              
              <InfoRow
                icon={ScheduleIcon}
                title={i18n.t("schedules.scheduleDetails.sendAt")}
                value={moment(schedule.sendAt).format("DD/MM/YYYY HH:mm")}
                highlighted
              />
              
              {schedule.sentAt && (
                <InfoRow
                  icon={SendIcon}
                  title={i18n.t("schedules.scheduleDetails.sentAt")}
                  value={moment(schedule.sentAt).format("DD/MM/YYYY HH:mm")}
                  highlighted
                />
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ 
                p: 2, 
                borderRadius: 2,
                height: "100%"
              }}
            >
              <Box 
                display="flex" 
                alignItems="center" 
                mb={2}
              >
                <RepeatIcon 
                  color="primary" 
                  sx={{ mr: 1 }} 
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  {i18n.t("schedules.scheduleDetails.details")}
                </Typography>
              </Box>
              
              <InfoRow
                icon={RepeatIcon}
                title={i18n.t("schedules.scheduleDetails.recurrence.title")}
                value={formatRecurrence(schedule.recurrenceType)}
              />
              
              {schedule.recurrenceType !== "none" && schedule.recurrenceEndDate && (
                <InfoRow
                  icon={TodayIcon}
                  title={i18n.t("schedules.scheduleDetails.recurrenceEnd")}
                  value={moment(schedule.recurrenceEndDate).format("DD/MM/YYYY HH:mm")}
                />
              )}
              
              {(schedule.user && schedule.user.name) && (
                <InfoRow
                  icon={PersonIcon}
                  title={i18n.t("schedules.scheduleDetails.createdBy")}
                  value={schedule.user.name}
                />
              )}
              
              {schedule.status === "ERRO" && (
                <Box 
                  sx={{ 
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1
                  }}
                >
                  <ErrorIcon color="error" sx={{ mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="error">
                      {i18n.t("schedules.scheduleDetails.errorTitle")}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {i18n.t("schedules.scheduleDetails.errorMessage")}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ 
                p: 2, 
                borderRadius: 2
              }}
            >
              <Box 
                display="flex" 
                alignItems="center" 
                mb={2}
              >
                <SendIcon 
                  color="primary" 
                  sx={{ mr: 1 }} 
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  {i18n.t("schedules.scheduleDetails.message")}
                </Typography>
              </Box>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }}
              >
                <Typography 
                  variant="body1" 
                  component="div" 
                  sx={{ 
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                >
                  {schedule.body}
                </Typography>
              </Paper>
              
              {(schedule.mediaPath || schedule.mediaName) && (
                <Box mt={2}>
                  <Box 
                    display="flex" 
                    alignItems="center"
                    mb={1}
                  >
                    <AttachIcon 
                      color="primary" 
                      sx={{ mr: 1, opacity: 0.7 }} 
                    />
                    <Typography variant="body2" fontWeight="medium">
                      {i18n.t("schedules.scheduleDetails.attachment")}
                    </Typography>
                  </Box>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      borderColor: alpha(theme.palette.primary.main, 0.2)
                    }}
                  >
                    <Box display="flex" alignItems="center" sx={{ maxWidth: "calc(100% - 40px)" }}>
                      <AttachIcon 
                        color="primary" 
                        fontSize="small" 
                        sx={{ mr: 1, opacity: 0.7, flexShrink: 0 }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: "break-all",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {schedule.mediaName}
                      </Typography>
                    </Box>
                    
                    <Tooltip title={i18n.t("schedules.scheduleDetails.buttons.download")}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={handleDownloadAttachment}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <CircularProgress size={20} thickness={4} />
                        ) : (
                          <DownloadIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: { xs: 1.5, sm: 2 },
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexWrap: "wrap",
          gap: 1,
          justifyContent: isMobile ? "center" : "space-between"
        }}
      >
        <Button 
          onClick={onClose} 
          variant="outlined"
          color="inherit"
          startIcon={<CloseIcon />}
          sx={{ borderRadius: 2 }}
          size={isMobile ? "small" : "medium"}
        >
          {i18n.t("schedules.scheduleDetails.buttons.close")}
        </Button>
        
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent={isMobile ? "center" : "flex-end"}>
          {canEdit && (
            <Button 
              onClick={onEdit} 
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              sx={{ borderRadius: 2 }}
              size={isMobile ? "small" : "medium"}
            >
              {i18n.t("schedules.scheduleDetails.buttons.edit")}
            </Button>
          )}
          
          <Button 
            onClick={onDelete}
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
            size={isMobile ? "small" : "medium"}
          >
            {i18n.t("schedules.scheduleDetails.buttons.delete")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

ScheduleDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  schedule: PropTypes.shape({
    id: PropTypes.number,
    status: PropTypes.string,
    body: PropTypes.string,
    contact: PropTypes.shape({
      name: PropTypes.string,
      number: PropTypes.string
    }),
    user: PropTypes.shape({
      name: PropTypes.string
    }),
    whatsappId: PropTypes.number,
    sendAt: PropTypes.string,
    sentAt: PropTypes.string,
    createdAt: PropTypes.string,
    recurrenceType: PropTypes.string,
    recurrenceEndDate: PropTypes.string,
    mediaPath: PropTypes.string,
    mediaName: PropTypes.string
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default ScheduleDetailsModal;