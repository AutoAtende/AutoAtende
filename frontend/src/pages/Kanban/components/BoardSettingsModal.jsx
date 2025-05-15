import React, { useState, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  TextField,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormControlLabel,
  Divider,
  Box,
  Button,
  Dialog,
  IconButton,
  useTheme,
  useMediaQuery,
  FormControl,
  FormHelperText,
  CircularProgress
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Message as MessageIcon,
  Repeat as RepeatIcon,
  Schedule as ScheduleIcon,
  ToggleOn as ToggleOnIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Campaign as CampaignIcon,
  WhatsApp as WhatsAppIcon
} from "@mui/icons-material";
import PropTypes from "prop-types";
import { toast } from "../../../helpers/toast";
import api from "../../../services/api";
import BaseModal from "../../../components/shared/BaseModal";
import { AuthContext } from "../../../context/Auth/AuthContext";
import moment from "moment";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { i18n } from "../../../translate/i18n";

// Componentes estilizados
const StyledListItem = styled(ListItem)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor,
  color: "white",
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  transition: "all 0.3s ease",
  "&:hover": {
    filter: "brightness(1.1)",
  },
}));

const StyledInputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: "100%",
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(18),
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const FileInputLabel = styled("label")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  gap: theme.spacing(1),
}));

const HiddenFileInput = styled("input")({
  display: "none",
});

const FileDisplayBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(1),
}));

const BoardSettingsModal = ({ open, onClose, setMakeRequest }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [recurrentMessage, setRecurrentMessage] = useState("");
  const [selectedRptDays, setSelectedRptDays] = useState("0");
  const [tagSwitchValues, setTagSwitchValues] = useState({});
  const [initialSwitchValues, setInitialSwitchValues] = useState({});
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandContent, setExpandContent] = useState(false);
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [scheduleValues, setScheduleValues] = useState({
    active: false,
    sendAt: new Date(new Date().setHours(18, 0, 0, 0)), // Default para 18:00 do dia atual
    recurrence: {
      enabled: false,
      pattern: "daily",
      endDate: moment().add(30, 'days').toDate() // 30 dias a partir de hoje
    }
  });

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];

      const initialSwitchValues = {};
      fetchedTags.forEach((tag) => {
        initialSwitchValues[tag.id] = tag.actCamp === 1;
      });

      setTags(fetchedTags);
      setInitialSwitchValues(initialSwitchValues);
    } catch (error) {
      toast.error(error);
    }
  };

  // Carregar conexões WhatsApp
  const fetchWhatsapps = async () => {
    try {
      const { data } = await api.get("/whatsapp/");
      // Filtrar apenas as conexões conectadas
      const activeWhatsapps = data.filter(whatsapp => whatsapp.status === "CONNECTED");
      setWhatsapps(activeWhatsapps);
      
      // Se houver apenas uma conexão, selecioná-la automaticamente
      if (activeWhatsapps.length === 1) {
        setSelectedWhatsapp(activeWhatsapps[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("kanban.boardSettings.whatsappLoadError"));
    }
  };

  useEffect(() => {
    if (open) {
      fetchTags();
      fetchWhatsapps();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTag) {
      setSelectedRptDays(
        selectedTag.rptDays ? selectedTag.rptDays.toString() : "0"
      );
    }
  }, [selectedTag]);

  const fetchTagInfo = async (tagId) => {
    try {
      const response = await api.get(`/tags/${tagId}`);
      const tagInfo = response.data;
      setRecurrentMessage(tagInfo.msgR || "");
      setSelectedRptDays(tagInfo.rptDays?.toString() || "0");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleTagClick = async (tag) => {
    if (selectedTag?.id === tag.id) {
      setSelectedTag(null);
      setExpandContent(false);
    } else {
      setSelectedTag(tag);
      await fetchTagInfo(tag.id);
      setTagSwitchValues(initialSwitchValues);
      setExpandContent(true);
      
      // Resetar valores de agendamento ao mudar de tag
      setScheduleValues({
        active: false,
        sendAt: new Date(new Date().setHours(18, 0, 0, 0)),
        recurrence: {
          enabled: false,
          pattern: "daily",
          endDate: moment().add(30, 'days').toDate()
        }
      });
      
      // Resetar whatsapp selecionado
      if (whatsapps.length === 1) {
        setSelectedWhatsapp(whatsapps[0].id);
      } else {
        setSelectedWhatsapp("");
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (selectedTag) {
        const tagData = {
          msgR: recurrentMessage,
          rptDays: parseInt(selectedRptDays),
          actCamp: tagSwitchValues[selectedTag.id] ? 1 : 0,
        };

        await api.put(`/tags/${selectedTag.id}`, tagData);

        if (fileToUpload) {
          const formData = new FormData();
          formData.append("file", fileToUpload);

          await api.post(`/tags/${selectedTag.id}/media-upload`, formData);
          setSelectedTag({ ...selectedTag, mediaName: fileToUpload.name });

          // Limpe o arquivo selecionado após o envio
          setFileToUpload(null);
        }
        
        // Criar agendamento se ativado
        if (scheduleValues.active && selectedWhatsapp) {
          // Primeiro buscamos os contatos que estão nesta lane (tag)
          const { data: tickets } = await api.get('/kanban', {
            params: { 
              queueId: selectedTag.queueId || '',
              viewType: 'active'
            }
          });
          
          // Filtrar tickets que possuem a tag selecionada
          const ticketsWithTag = tickets.tickets.filter(ticket => 
            ticket.tags.some(tag => tag.id === selectedTag.id)
          );
          
          if (ticketsWithTag.length > 0) {
            // Para cada ticket, criar um agendamento
            for (const ticket of ticketsWithTag) {
              const contact = ticket.contact;
              
              if (!contact || !contact.id) continue;
              
              // Dados do agendamento
              const scheduleData = {
                body: recurrentMessage,
                contactId: contact.id,
                whatsappId: selectedWhatsapp,
                sendAt: moment(scheduleValues.sendAt).format('YYYY-MM-DD HH:mm:ss'),
                recurrenceType: scheduleValues.recurrence.enabled ? scheduleValues.recurrence.pattern : 'none',
                recurrenceEndDate: scheduleValues.recurrence.enabled 
                  ? moment(scheduleValues.recurrence.endDate).format('YYYY-MM-DD HH:mm:ss') 
                  : null,
                campId: selectedTag.id,
                daysR: parseInt(selectedRptDays)
              };
              
              // Verificar se já existe agendamento para este contato com esta tag
              const { data: existingSchedules } = await api.get("/schedules", {
                params: { 
                  contactId: contact.id,
                  campId: selectedTag.id 
                },
              });
              
              // Se já existir agendamento, atualizá-lo, caso contrário criar um novo
              if (existingSchedules.schedules && existingSchedules.schedules.length > 0) {
                const existingSchedule = existingSchedules.schedules[0];
                await api.put(`/schedules/${existingSchedule.id}`, scheduleData);
              } else {
                await api.post("/schedules", scheduleData);
              }
            }
            
            toast.success(`Agendamentos criados para ${ticketsWithTag.length} contatos na tag ${selectedTag.name}`);
          } else {
            toast.info(`Não há contatos na tag ${selectedTag.name} para agendar mensagens`);
          }
        }
        
        toast.success("Configurações salvas com sucesso!");
        if (setMakeRequest){
          setMakeRequest(Math.random());
        }
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFile = async () => {
    try {
      await api.delete(`/tags/${selectedTag.id}/media-upload`);
      setSelectedTag({ ...selectedTag, mediaName: null });
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error);
    }
  };

  const modalActions = [
    {
      label: "Fechar",
      onClick: onClose,
      variant: "outlined",
      color: "primary",
      icon: <CancelIcon />
    }
  ];

  const selectedTagActions = selectedTag ? [
    {
      label: saving ? "Salvando..." : "Salvar",
      onClick: handleSave,
      variant: "contained",
      color: "primary",
      icon: saving ? <CircularProgress size={20} /> : <SaveIcon />,
      disabled: saving || (scheduleValues.active && !selectedWhatsapp)
    },
    {
      label: "Cancelar",
      onClick: () => setSelectedTag(null),
      variant: "outlined",
      color: "secondary",
      icon: <CancelIcon />,
      disabled: saving
    }
  ] : [];

  const deleteModalActions = [
    {
      label: "Confirmar",
      onClick: handleDeleteFile,
      variant: "contained",
      color: "error",
      icon: <DeleteIcon />
    },
    {
      label: "Cancelar",
      onClick: () => setIsDeleteModalOpen(false),
      variant: "outlined",
      color: "primary",
      icon: <CancelIcon />
    }
  ];
  
  // Recurrence patterns
  const recurrencePatterns = [
    { value: "daily", label: "Diariamente" },
    { value: "weekly", label: "Semanalmente" },
    { value: "biweekly", label: "Quinzenalmente" },
    { value: "monthly", label: "Mensalmente" },
    { value: "quarterly", label: "Trimestralmente" },
    { value: "semiannually", label: "Semestralmente" },
    { value: "yearly", label: "Anualmente" }
  ];

  return (
    <>
      <BaseModal
        open={open}
        onClose={onClose}
        title="Configurações do Quadro de Campanha"
        actions={modalActions}
        maxWidth="md"
      >
        <Box sx={{ maxHeight: isMobile ? 'calc(100vh - 180px)' : '650px', overflow: 'auto' }}>
          <Typography variant="h6" align="center" gutterBottom>
            <CampaignIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lista de Quadros
          </Typography>

          <List component="nav" sx={{ width: '100%' }}>
            {tags.map((tag) => (
              <Box key={tag.id}>
                <StyledListItem
                  button
                  onClick={() => handleTagClick(tag)}
                  bgcolor={tag.color}
                >
                  <ListItemText primary={tag.name} />
                  {selectedTag?.id === tag.id ? <ExpandLess /> : <ExpandMore />}
                </StyledListItem>

                <Collapse
                  in={selectedTag?.id === tag.id}
                  timeout="auto"
                  unmountOnExit
                >
                  <StyledInputContainer>
                    <Divider />
                    
                    <FormSection>
                      <SectionHeading variant="h6">
                        <MessageIcon />
                        Campanha Recorrente
                      </SectionHeading>
                      
                      <TextField
                        label="Mensagem Recorrente"
                        variant="outlined"
                        multiline
                        fullWidth
                        rows={4}
                        value={recurrentMessage}
                        onChange={(e) => setRecurrentMessage(e.target.value)}
                        InputProps={{
                          startAdornment: <MessageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </FormSection>

                    <FormSection>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <RepeatIcon color="primary" />
                        <InputLabel>Repetir a cada:</InputLabel>
                      </Box>
                      
                      <Select
                        value={selectedRptDays}
                        onChange={(e) => setSelectedRptDays(e.target.value)}
                        fullWidth
                      >
                        {Array.from({ length: 31 }, (_, index) => index).map(
                          (number) => (
                            <MenuItem key={number} value={number.toString()}>
                              {number} {number === 1 ? 'dia' : 'dias'}
                            </MenuItem>
                          )
                        )}
                      </Select>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        0 = Não Repetir
                      </Typography>
                    </FormSection>

                    <FormSection>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={tagSwitchValues[tag.id] || false}
                            onChange={(e) =>
                              setTagSwitchValues({
                                ...tagSwitchValues,
                                [tag.id]: e.target.checked,
                              })
                            }
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ToggleOnIcon sx={{ mr: 1 }} />
                            <Typography>
                              {tagSwitchValues[tag.id]
                                ? "Campanha Ativa"
                                : "Campanha Inativa"}
                            </Typography>
                          </Box>
                        }
                      />
                    </FormSection>

                    {selectedTag && (
                      <FormSection>
                        <SectionHeading variant="h6">
                          <AttachFileIcon />
                          Arquivo de Mídia
                        </SectionHeading>
                        
                        {selectedTag.mediaName ? (
                          <FileDisplayBox>
                            <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {selectedTag.mediaName}
                            </Typography>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => setIsDeleteModalOpen(true)}
                              startIcon={<DeleteIcon />}
                              size={isMobile ? "small" : "medium"}
                            >
                              Excluir
                            </Button>
                          </FileDisplayBox>
                        ) : (
                          <FileInputLabel htmlFor="file-upload">
                            <HiddenFileInput
                              id="file-upload"
                              type="file"
                              accept=".png,.jpg,.jpeg,.mp4,.mp3,.ogg"
                              onChange={(e) => setFileToUpload(e.target.files[0])}
                            />
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<AttachFileIcon />}
                              size={isMobile ? "small" : "medium"}
                            >
                              Escolher Arquivo
                            </Button>
                            {fileToUpload && (
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {fileToUpload.name.length > 20
                                  ? `${fileToUpload.name.substring(0, 20)}...`
                                  : fileToUpload.name}
                              </Typography>
                            )}
                          </FileInputLabel>
                        )}
                      </FormSection>
                    )}
                    
                    {/* Seção de Agendamento de Mensagens */}
                    <FormSection>
                      <SectionHeading variant="h6">
                        <ScheduleIcon />
                        Agendamento de Mensagens
                      </SectionHeading>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={scheduleValues.active}
                            onChange={(e) => setScheduleValues({
                              ...scheduleValues,
                              active: e.target.checked
                            })}
                            color="primary"
                          />
                        }
                        label="Criar agendamentos para esta tag"
                      />
                      
                      {scheduleValues.active && (
                        <>
                          {/* Seleção de WhatsApp */}
                          <FormControl 
                            fullWidth 
                            sx={{ mt: 2 }}
                            error={scheduleValues.active && !selectedWhatsapp}
                          >
                            <InputLabel id="whatsapp-select-label">
                              Selecione a Conexão WhatsApp
                            </InputLabel>
                            <Select
                              labelId="whatsapp-select-label"
                              id="whatsapp-select"
                              value={selectedWhatsapp}
                              onChange={(e) => setSelectedWhatsapp(e.target.value)}
                              label="Selecione a Conexão WhatsApp"
                            >
                              {whatsapps.map((whatsapp) => (
                                <MenuItem key={whatsapp.id} value={whatsapp.id}>
                                  <Box display="flex" alignItems="center">
                                    <WhatsAppIcon sx={{ mr: 1, color: whatsapp.color || 'primary.main' }} />
                                    {whatsapp.name}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                            {scheduleValues.active && !selectedWhatsapp && (
                              <FormHelperText>
                                Selecione uma conexão WhatsApp para enviar as mensagens
                              </FormHelperText>
                            )}
                          </FormControl>
                          
                          {/* Horário de envio */}
                          <Box sx={{ mt: 2 }}>
                            <LocalizationProvider 
                              dateAdapter={AdapterDateFns}
                              adapterLocale={ptBR}
                            >
                              <DateTimePicker
                                label="Horário de Envio"
                                value={scheduleValues.sendAt}
                                onChange={(date) => setScheduleValues({
                                  ...scheduleValues,
                                  sendAt: date
                                })}
                                renderInput={(props) => (
                                  <TextField
                                    {...props}
                                    fullWidth
                                    helperText="Hora que as mensagens serão enviadas"
                                  />
                                )}
                                minDateTime={new Date()}
                              />
                            </LocalizationProvider>
                          </Box>
                          
                          {/* Recorrência */}
                          <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={scheduleValues.recurrence.enabled}
                                  onChange={(e) => setScheduleValues({
                                    ...scheduleValues,
                                    recurrence: {
                                      ...scheduleValues.recurrence,
                                      enabled: e.target.checked
                                    }
                                  })}
                                  color="primary"
                                />
                              }
                              label="Habilitar recorrência"
                            />
                            
                            {scheduleValues.recurrence.enabled && (
                              <>
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                  <InputLabel>
                                    Padrão de Recorrência
                                  </InputLabel>
                                  <Select
                                    value={scheduleValues.recurrence.pattern}
                                    onChange={(e) => setScheduleValues({
                                      ...scheduleValues,
                                      recurrence: {
                                        ...scheduleValues.recurrence,
                                        pattern: e.target.value
                                      }
                                    })}
                                    label="Padrão de Recorrência"
                                  >
                                    {recurrencePatterns.map(pattern => (
                                      <MenuItem key={pattern.value} value={pattern.value}>
                                        {pattern.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                
                                <Box sx={{ mt: 2 }}>
                                  <LocalizationProvider 
                                    dateAdapter={AdapterDateFns}
                                    adapterLocale={ptBR}
                                  >
                                    <DateTimePicker
                                      label="Data Final da Recorrência"
                                      value={scheduleValues.recurrence.endDate}
                                      onChange={(date) => setScheduleValues({
                                        ...scheduleValues,
                                        recurrence: {
                                          ...scheduleValues.recurrence,
                                          endDate: date
                                        }
                                      })}
                                      renderInput={(props) => (
                                        <TextField
                                          {...props}
                                          fullWidth
                                          helperText="Data final para mensagens recorrentes"
                                        />
                                      )}
                                      minDateTime={scheduleValues.sendAt}
                                    />
                                  </LocalizationProvider>
                                </Box>
                              </>
                            )}
                          </Box>
                        </>
                      )}
                    </FormSection>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      {selectedTagActions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant}
                          color={action.color}
                          onClick={action.onClick}
                          startIcon={action.icon}
                          disabled={action.disabled}
                          size={isMobile ? "small" : "medium"}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Box>
                  </StyledInputContainer>
                </Collapse>
              </Box>
            ))}
          </List>
        </Box>
      </BaseModal>

      {isDeleteModalOpen && (
        <BaseModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmar Exclusão"
          actions={deleteModalActions}
          maxWidth="xs"
        >
          <Typography variant="body1" gutterBottom>
            Deseja realmente excluir o arquivo anexado?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta ação não pode ser desfeita.
          </Typography>
        </BaseModal>
      )}
    </>
  );
};

BoardSettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setMakeRequest: PropTypes.func,
};

export default BoardSettingsModal;