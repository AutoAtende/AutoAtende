import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import {
  Grid,
  Paper,
  FormControl,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Switch,
  TextField,
  MenuItem,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  useMediaQuery,
  Tooltip,
  Avatar,
  Stack,
  Chip
} from "@mui/material";
import { i18n } from "../../../translate/i18n";
import {
  Settings as SettingsIcon,
  AssessmentOutlined,
  LocalOffer as TagIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Support as SupportIcon,
  SettingsApplications as AppSettingsIcon,
  Timeline as TimelineIcon,
  CheckCircleOutline as CheckIcon,
  FileCopy as FileCopyIcon,
  BusinessCenter as BusinessIcon,
  Tune as TuneIcon,
  Build as BuildIcon
} from "@mui/icons-material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faGears,
  faRobot,
  faServer,
  faEnvelope,
  faList,
  faFileExport,
  faTicketAlt,
  faUsers,
  faBuilding,
  faDatabase
} from "@fortawesome/free-solid-svg-icons";
import { copyToClipboard } from "../../../helpers/copyToClipboard";
import { toast } from "../../../helpers/toast";
import OnlyForSuperUser from "../../../components/OnlyForSuperUser";
import { AuthContext } from "../../../context/Auth/AuthContext";
import StandardTabContent from "../../../components/shared/StandardTabContent";

// Constantes
const openAiModels = [
  { value: "o1-preview", label: "O1 Preview" },
  { value: "o1-mini", label: "O1 Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
];

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  margin: theme.spacing(1, 0),
  transition: 'all 0.3s ease-in-out',
  borderRadius: 12,
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 16
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  minHeight: 48,
  '&.Mui-selected': {
    fontWeight: 600
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: 56,
    borderRadius: 12
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '1.125rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginTop: theme.spacing(2)
  }
}));

const CategoryDivider = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

const StyledBadge = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 36,
  height: 36,
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

// Componente principal
const Options = ({
  settings,
  enableReasonWhenCloseTicketChanged,
  onSettingChange,
  pendingChanges
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  const [user] = useContext(AuthContext);

  // Estado inicial das configurações - COMPLETO
  const getInitialConfigState = useCallback(() => {
    return {
      // Configurações gerais
      openAiModel: "gpt-4",
      enableAudioTranscriptions: "disabled",
      openAiKey: "",
      userRating: "disabled",
      scheduleType: "disabled",
      quickMessages: i18n.t("optionsPage.byCompany") || "company",
      allowSignup: "disabled",
      CheckMsgIsGroup: "disabled",
      sendGreetingAccepted: "disabled",
      settingsTransfTicket: "disabled",
      sendGreetingMessageOneQueues: "enabled",
      downloadLimit: "64",
      sendEmailWhenRegister: "disabled",
      sendMessageWhenRegister: "disabled",
      enableReasonWhenCloseTicket: "disabled",
      enableUseOneTicketPerConnection: "disabled",
      callSuport: "enabled",
      trialExpiration: "3",
      displayContactInfo: "enabled",
      enableTicketValueAndSku: "disabled",
      sendQueuePosition: "disabled",
      settingsUserRandom: "disabled",
      displayBusinessInfo: "disabled",
      enableSaveCommonContacts: "disabled",
      displayProfileImages: "enabled",
      enableQueueWhenCloseTicket: "disabled",
      enableTagsWhenCloseTicket: "disabled",
      enableSatisfactionSurvey: "disabled",
      
      // Integrações
      enableUPSix: "disabled",
      enableUPSixWebphone: "disabled",
      enableUPSixNotifications: "disabled",
      enableOfficialWhatsapp: "disabled",
      enableMetaPixel: "disabled",
      metaPixelId: '',
      
      // SMTP
      smtpauthType: "",
      usersmtpauthType: "",
      clientsecretsmtpauthType: "",
      smtpPortType: "",
      
      // Suporte
      waSuportType: "",
      msgSuportType: "",
      
      // Campanhas e Marketing
      enableCampaigns: "disabled",
      enableBulkMessages: "disabled",
      
      // Chatbot e IA
      enableChatbot: "disabled",
      enableOpenAIAssistants: "disabled",
      enableFlowBuilder: "disabled",
      enableAutoReply: "disabled",
      
      // Recursos avançados
      enableKanban: "disabled",
      enableInternalChat: "disabled",
      enableAPI: "disabled",
      enableWebhooks: "disabled",
      enableCSVImport: "disabled",
      enableReports: "disabled",
      enableDashboard: "disabled",
      
      // Notificações
      enableEmailNotifications: "disabled",
      enableSMSNotifications: "disabled",
      enablePushNotifications: "disabled",
      enableDesktopNotifications: "disabled",
      
      // Arquivos e mídia
      enableFileUpload: "enabled",
      maxFileSize: "10",
      allowedFileTypes: "image/*,application/pdf,text/*",
      enableImageOptimization: "disabled",
      enableAudioMessages: "enabled",
      enableVideoMessages: "enabled",
      
      // Segurança
      enableTwoFactor: "disabled",
      enableSessionTimeout: "disabled",
      sessionTimeoutMinutes: "30",
      enableIPWhitelist: "disabled",
      ipWhitelist: "",
      enableAuditLog: "disabled",
      
      // Personalização
      enableCustomCSS: "disabled",
      customCSS: "",
      enableWhiteLabel: "disabled",
      companyName: "",
      companyLogo: "",
      
      // Conexões
      maxConnections: "5",
      enableMultipleConnections: "enabled",
      enableConnectionRotation: "disabled",
      connectionTimeoutSeconds: "30",
      
      // Filas
      maxQueues: "10",
      enableQueuePriority: "disabled",
      enableQueueTransfer: "enabled",
      enableQueueStats: "enabled",
      
      // Tickets
      enableTicketHistory: "enabled",
      enableTicketNotes: "enabled",
      enableTicketTags: "enabled",
      enableTicketPriority: "disabled",
      enableTicketSLA: "disabled",
      ticketAutoCloseHours: "24",
      
      // Contatos
      enableContactMerge: "disabled",
      enableContactImport: "enabled",
      enableContactExport: "enabled",
      enableContactCustomFields: "disabled",
      
      // Mensagens
      enableMessageSearch: "enabled",
      enableMessageForward: "enabled",
      enableMessageReply: "enabled",
      enableMessageQuote: "enabled",
      enableMessageTranslation: "disabled",
      
      // Analytics
      enableAnalytics: "disabled",
      enableGoogleAnalytics: "disabled",
      googleAnalyticsId: "",
      enableHotjar: "disabled",
      hotjarId: "",
      
      // Backup
      enableAutoBackup: "disabled",
      backupFrequency: "daily",
      backupRetentionDays: "30",
      
      // Performance
      enableCache: "enabled",
      cacheTimeoutMinutes: "10",
      enableCompression: "enabled",
      enableCDN: "disabled",
      
      // Logs
      enableAccessLog: "disabled",
      enableErrorLog: "enabled",
      logRetentionDays: "7",
      logLevel: "error"
    };
  }, []);

  // Estado para armazenar configurações
  const [configState, setConfigState] = useState(getInitialConfigState);

  // Carregar configurações iniciais
  useEffect(() => {
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      console.warn("Settings não é um array válido:", settings);
      return;
    }

    try {
      const settingsMap = {};
      settings.forEach(setting => {
        if (setting && setting.key) {
          settingsMap[setting.key] = setting.value;
        }
      });

      // Usar Object.assign para atualizar o estado
      setConfigState(prevState => {
        const newState = Object.assign({}, prevState);

        Object.keys(newState).forEach(key => {
          let settingKey = key;

          // Mapeamento de chaves
          const keyMapping = {
            'openAiModel': 'openaiModel',
            'smtpauthType': 'smtpauth',
            'usersmtpauthType': 'usersmtpauth',
            'clientsecretsmtpauthType': 'clientsecretsmtpauth',
            'smtpPortType': 'smtpport',
            'waSuportType': 'wasuport',
            'msgSuportType': 'msgsuport'
          };

          if (keyMapping[key]) {
            settingKey = keyMapping[key];
          }

          if (settingsMap[settingKey] !== undefined) {
            newState[key] = String(settingsMap[settingKey] || newState[key] || "");
          }
        });

        return newState;
      });
    } catch (error) {
      console.error("Erro ao processar configurações:", error);
    }
  }, [settings, getInitialConfigState]);

  // Atualizar configuração local e notificar alteração
  const handleConfigChange = useCallback((key, value, notifyBackend = true) => {
    setConfigState(prev => {
      const newState = Object.assign({}, prev);
      newState[key] = value;
      return newState;
    });

    // Mapeamento de chaves para o backend
    const keyMapping = {
      'openAiModel': 'openaiModel',
      'smtpauthType': 'smtpauth',
      'usersmtpauthType': 'usersmtpauth',
      'clientsecretsmtpauthType': 'clientsecretsmtpauth',
      'smtpPortType': 'smtpport',
      'waSuportType': 'wasuport',
      'msgSuportType': 'msgsuport'
    };

    const backendKey = keyMapping[key] || key;

    if (notifyBackend) {
      onSettingChange(backendKey, value);
    }

    if (key === 'enableReasonWhenCloseTicket' && typeof enableReasonWhenCloseTicketChanged === 'function') {
      enableReasonWhenCloseTicketChanged(value);
    }
  }, [onSettingChange, enableReasonWhenCloseTicketChanged]);

  const handleSwitchChange = useCallback((key, checked) => {
    const value = checked ? "enabled" : "disabled";
    handleConfigChange(key, value);
  }, [handleConfigChange]);

  const handleMutuallyExclusiveOption = useCallback(async (enabledKey, value) => {
    if (value === "enabled") {
      const exclusiveOptions = {
        enableQueueWhenCloseTicket: ["enableTagsWhenCloseTicket", "enableReasonWhenCloseTicket"],
        enableTagsWhenCloseTicket: ["enableQueueWhenCloseTicket", "enableReasonWhenCloseTicket"],
        enableReasonWhenCloseTicket: ["enableQueueWhenCloseTicket", "enableTagsWhenCloseTicket"]
      };

      if (exclusiveOptions[enabledKey]) {
        const optionsToDisable = exclusiveOptions[enabledKey];

        optionsToDisable.forEach(key => {
          if (configState[key] === "enabled") {
            handleConfigChange(key, "disabled");
          }
        });

        toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive") || "Apenas uma opção de encerramento pode estar ativa");
      }
    }

    handleConfigChange(enabledKey, value);
  }, [configState, handleConfigChange]);

  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // Preparar tabs
  const tabs = useMemo(() => [
    { label: i18n.t("optionsPage.general") || "Configurações Gerais", icon: React.createElement(SettingsIcon) },
    { label: i18n.t("optionsPage.integrations") || "Integrações", icon: React.createElement(FontAwesomeIcon, { icon: faServer }) },
    { label: i18n.t("optionsPage.advanced") || "Avançado", icon: React.createElement(BuildIcon) },
    { label: "Recursos", icon: React.createElement(TuneIcon) },
    { label: "Segurança", icon: React.createElement(FontAwesomeIcon, { icon: faDatabase }) }
  ], []);

  // Componente de configurações gerais - COMPLETO
  const GeneralConfigSection = useMemo(() => {
    const GeneralConfigComponent = () => (
      <Box>
        <SectionTitle variant="h6">
          <BusinessIcon color="primary" />
          {i18n.t("optionsPage.general_params") || "Parâmetros Gerais"}
        </SectionTitle>

        <OnlyForSuperUser
          yes={() => (
            <React.Fragment>
              <StyledPaper elevation={2}>
                <Box sx={{ p: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <TextField
                          select
                          label={i18n.t("optionsPage.trialExpiration") || "Expiração do Trial"}
                          value={configState.trialExpiration || "3"}
                          size="small"
                          onChange={(e) => handleConfigChange("trialExpiration", e.target.value)}
                          variant="outlined"
                          margin="normal"
                          InputProps={{
                            startAdornment: (
                              <Box mr={1}>
                                <FontAwesomeIcon icon={faBuilding} style={{ color: theme.palette.primary.main }} />
                              </Box>
                            ),
                          }}
                        >
                          <MenuItem value="3">3 {i18n.t("optionsPage.days") || "dias"}</MenuItem>
                          <MenuItem value="7">7 {i18n.t("optionsPage.days") || "dias"}</MenuItem>
                          <MenuItem value="9">9 {i18n.t("optionsPage.days") || "dias"}</MenuItem>
                          <MenuItem value="15">15 {i18n.t("optionsPage.days") || "dias"}</MenuItem>
                          <MenuItem value="30">30 {i18n.t("optionsPage.days") || "dias"}</MenuItem>
                        </TextField>
                        <FormHelperText>
                          {i18n.t("optionsPage.trialExpirationHelp") || "Tempo de duração do período de teste"}
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <TextField
                          select
                          label="Máximo de Conexões"
                          value={configState.maxConnections || "5"}
                          size="small"
                          onChange={(e) => handleConfigChange("maxConnections", e.target.value)}
                          variant="outlined"
                          margin="normal"
                        >
                          <MenuItem value="1">1 conexão</MenuItem>
                          <MenuItem value="3">3 conexões</MenuItem>
                          <MenuItem value="5">5 conexões</MenuItem>
                          <MenuItem value="10">10 conexões</MenuItem>
                          <MenuItem value="20">20 conexões</MenuItem>
                          <MenuItem value="50">50 conexões</MenuItem>
                        </TextField>
                        <FormHelperText>
                          Número máximo de conexões WhatsApp por empresa
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <TextField
                          select
                          label="Máximo de Filas"
                          value={configState.maxQueues || "10"}
                          size="small"
                          onChange={(e) => handleConfigChange("maxQueues", e.target.value)}
                          variant="outlined"
                          margin="normal"
                        >
                          <MenuItem value="5">5 filas</MenuItem>
                          <MenuItem value="10">10 filas</MenuItem>
                          <MenuItem value="20">20 filas</MenuItem>
                          <MenuItem value="50">50 filas</MenuItem>
                          <MenuItem value="100">100 filas</MenuItem>
                        </TextField>
                        <FormHelperText>
                          Número máximo de filas de atendimento
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </StyledPaper>

              <StyledPaper elevation={2}>
                <Box sx={{ p: 1 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configState.allowSignup === "enabled"}
                          name="allowSignup"
                          color="primary"
                          onChange={(e) => handleSwitchChange("allowSignup", e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          {i18n.t("optionsPage.enableRegisterInSignup") || "Permitir registro público"}
                        </Box>
                      }
                    />
                  </FormGroup>
                  <FormHelperText>
                    {i18n.t("optionsPage.enableRegisterInSignupHelp") || "Permite que novos usuários se cadastrem publicamente"}
                  </FormHelperText>
                </Box>
              </StyledPaper>

              <StyledPaper elevation={2}>
                <Box sx={{ p: 1 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configState.sendEmailWhenRegister === "enabled"}
                          name="sendEmailWhenRegister"
                          color="primary"
                          onChange={(e) => handleSwitchChange("sendEmailWhenRegister", e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          {i18n.t("optionsPage.sendEmailInRegister") || "Enviar email no registro"}
                        </Box>
                      }
                    />
                  </FormGroup>
                  <FormHelperText>
                    {i18n.t("optionsPage.sendEmailInRegisterHelp") || "Envia email de confirmação quando novo usuário se registra"}
                  </FormHelperText>
                </Box>
              </StyledPaper>

              <StyledPaper elevation={2}>
                <Box sx={{ p: 1 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configState.sendMessageWhenRegister === "enabled"}
                          name="sendMessageWhenRegister"
                          color="primary"
                          onChange={(e) => handleSwitchChange("sendMessageWhenRegister", e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MessageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          {i18n.t("optionsPage.sendMessageWhenRegiter") || "Enviar mensagem no registro"}
                        </Box>
                      }
                    />
                  </FormGroup>
                  <FormHelperText>
                    {i18n.t("optionsPage.sendMessageWhenRegiterHelp") || "Envia mensagem de boas-vindas quando novo usuário se registra"}
                  </FormHelperText>
                </Box>
              </StyledPaper>
            </React.Fragment>
          )}
        />

        <CategoryDivider>
          <Chip
            icon={<FontAwesomeIcon icon={faTicketAlt} />}
            label={i18n.t("optionsPage.ticketSettings") || "Configurações de Tickets"}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableTagsWhenCloseTicket === "enabled"}
                    name="enableTagsWhenCloseTicket"
                    color="primary"
                    onChange={(e) => handleMutuallyExclusiveOption("enableTagsWhenCloseTicket", e.target.checked ? "enabled" : "disabled")}
                  />
                }
                label={i18n.t("optionsPage.enableTagsWhenCloseTicket") || "Definir etiquetas ao encerrar ticket"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableTagsWhenCloseTicketHelp") || "Permite adicionar etiquetas ao encerrar o ticket"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableTicketHistory === "enabled"}
                    name="enableTicketHistory"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableTicketHistory", e.target.checked)}
                  />
                }
                label="Histórico de tickets"
              />
            </FormGroup>
            <FormHelperText>
              Mantém histórico completo de todos os tickets
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableTicketNotes === "enabled"}
                    name="enableTicketNotes"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableTicketNotes", e.target.checked)}
                  />
                }
                label="Notas em tickets"
              />
            </FormGroup>
            <FormHelperText>
              Permite adicionar notas internas aos tickets
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableTicketTags === "enabled"}
                    name="enableTicketTags"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableTicketTags", e.target.checked)}
                  />
                }
                label="Tags em tickets"
              />
            </FormGroup>
            <FormHelperText>
              Permite categorizar tickets com tags
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableTicketPriority === "enabled"}
                    name="enableTicketPriority"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableTicketPriority", e.target.checked)}
                  />
                }
                label="Prioridade de tickets"
              />
            </FormGroup>
            <FormHelperText>
              Define prioridades para tickets (baixa, normal, alta, urgente)
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Fechamento automático (horas)"
                    value={configState.ticketAutoCloseHours || "24"}
                    size="small"
                    onChange={(e) => handleConfigChange("ticketAutoCloseHours", e.target.value)}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="0">Desabilitado</MenuItem>
                    <MenuItem value="1">1 hora</MenuItem>
                    <MenuItem value="2">2 horas</MenuItem>
                    <MenuItem value="6">6 horas</MenuItem>
                    <MenuItem value="12">12 horas</MenuItem>
                    <MenuItem value="24">24 horas</MenuItem>
                    <MenuItem value="48">48 horas</MenuItem>
                    <MenuItem value="72">72 horas</MenuItem>
                  </TextField>
                  <FormHelperText>
                    Fecha tickets automaticamente após período de inatividade
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.displayProfileImages === "enabled"}
                    name="displayProfileImages"
                    color="primary"
                    onChange={(e) => handleSwitchChange("displayProfileImages", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.displayProfileImages") || "Exibir imagens de perfil"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.displayProfileImagesHelp") || "Mostra as fotos de perfil dos contatos nas conversas"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableTicketValueAndSku === "enabled"}
                    name="enableTicketValueAndSku"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableTicketValueAndSku", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.showSKU") || "Exibir valor e SKU do ticket"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.showSKUHelp") || "Mostra campos de valor e SKU nos tickets"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <CategoryDivider>
          <Chip
            icon={<FontAwesomeIcon icon={faUsers} />}
            label={i18n.t("optionsPage.contactSettings") || "Configurações de Contatos"}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.displayContactInfo === "enabled"}
                    name="displayContactInfo"
                    color="primary"
                    onChange={(e) => handleSwitchChange("displayContactInfo", e.target.checked)}
                    disabled={configState.displayBusinessInfo === "enabled"}
                  />
                }
                label={i18n.t("optionsPage.displayContactInfo") || "Exibir informações de contato"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.displayContactInfoHelp") || "Mostra informações detalhadas do contato"}
              {configState.displayBusinessInfo === "enabled" && (
                <Typography color="error" variant="caption" display="block">
                  {i18n.t("optionsPage.displayContactInfoDisabled") || "Desabilitado pois informações comerciais estão ativas"}
                </Typography>
              )}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.displayBusinessInfo === "enabled"}
                    name="displayBusinessInfo"
                    color="primary"
                    onChange={(e) => handleSwitchChange("displayBusinessInfo", e.target.checked)}
                    disabled={configState.displayContactInfo === "enabled"}
                  />
                }
                label={i18n.t("optionsPage.displayBusinessInfo") || "Exibir informações comerciais"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.displayBusinessInfoHelp") || "Mostra informações comerciais do contato"}
              {configState.displayContactInfo === "enabled" && (
                <Typography color="error" variant="caption" display="block">
                  {i18n.t("optionsPage.displayBusinessInfoDisabled") || "Desabilitado pois informações de contato estão ativas"}
                </Typography>
              )}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableSaveCommonContacts === "enabled"}
                    name="enableSaveCommonContacts"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableSaveCommonContacts", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.enableSaveCommonContacts") || "Salvar contatos frequentes"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableSaveCommonContactsHelp") || "Salva automaticamente contatos que interagem frequentemente"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableContactMerge === "enabled"}
                    name="enableContactMerge"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableContactMerge", e.target.checked)}
                  />
                }
                label="Fusão de contatos"
              />
            </FormGroup>
            <FormHelperText>
              Permite fusão automática de contatos duplicados
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableContactImport === "enabled"}
                    name="enableContactImport"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableContactImport", e.target.checked)}
                  />
                }
                label="Importação de contatos"
              />
            </FormGroup>
            <FormHelperText>
              Permite importar contatos via CSV/Excel
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableContactExport === "enabled"}
                    name="enableContactExport"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableContactExport", e.target.checked)}
                  />
                }
                label="Exportação de contatos"
              />
            </FormGroup>
            <FormHelperText>
              Permite exportar contatos para CSV/Excel
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableContactCustomFields === "enabled"}
                    name="enableContactCustomFields"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableContactCustomFields", e.target.checked)}
                  />
                }
                label="Campos personalizados"
              />
            </FormGroup>
            <FormHelperText>
              Permite criar campos personalizados para contatos
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    fullWidth
                    label={i18n.t("optionsPage.expedient") || "Funcionamento"}
                    value={configState.scheduleType || "disabled"}
                    size="small"
                    onChange={(e) => handleConfigChange("scheduleType", e.target.value)}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="disabled">
                      {i18n.t("optionsPage.buttons.off") || "Desabilitado"}
                    </MenuItem>
                    <MenuItem value="company">
                      {i18n.t("optionsPage.buttons.partner") || "Por empresa"}
                    </MenuItem>
                    <MenuItem value="queue">
                      {i18n.t("optionsPage.buttons.quee") || "Por fila"}
                    </MenuItem>
                  </TextField>
                  <FormHelperText>
                    {i18n.t("optionsPage.expedientHelp") || "Define como funciona o horário de atendimento"}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.settingsTransfTicket === "enabled"}
                    name="settingsTransfTicket"
                    color="primary"
                    onChange={(e) => handleSwitchChange("settingsTransfTicket", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.sendagent") || "Notificar transferência de ticket"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.sendagentHelp") || "Envia notificação quando ticket é transferido para outro agente"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.sendGreetingMessageOneQueues === "enabled"}
                    name="sendGreetingMessageOneQueues"
                    color="primary"
                    onChange={(e) => handleSwitchChange("sendGreetingMessageOneQueues", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.greeatingOneQueue") || "Saudação única por fila"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.greeatingOneQueueHelp") || "Envia apenas uma mensagem de saudação por fila"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    fullWidth
                    label={i18n.t("optionsPage.speedMessage") || "Mensagens rápidas"}
                    value={configState.quickMessages || "company"}
                    size="small"
                    onChange={(e) => handleConfigChange("quickMessages", e.target.value)}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="company">{i18n.t("optionsPage.byCompany") || "Por empresa"}</MenuItem>
                    <MenuItem value="individual">{i18n.t("optionsPage.byUser") || "Por usuário"}</MenuItem>
                  </TextField>
                  <FormHelperText>
                    {i18n.t("optionsPage.speedMessageHelp") || "Define o escopo das mensagens rápidas"}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>
      </Box>
    );
    return GeneralConfigComponent;
  }, [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange,
    handleMutuallyExclusiveOption
  ]);

  // Componente de configurações de integrações - COMPLETO
  const IntegrationsSection = useMemo(() => {
    const IntegrationsComponent = () => (
      <Box>
        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faServer} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
          {i18n.t("optionsPage.integrations") || "Integrações"}
        </SectionTitle>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <WhatsAppIcon sx={{ color: '#25D366', mr: 1 }} />
              <Box ml={1}>WhatsApp API Oficial</Box>
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableOfficialWhatsapp === "enabled"}
                    name="enableOfficialWhatsapp"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableOfficialWhatsapp", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.enableOfficialWhatsapp") || "Habilitar WhatsApp Oficial"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableOfficialWhatsappHelp") || "Ativa o uso da API oficial do WhatsApp Business"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#1877F2', width: 28, height: 28 }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>M</span>
              </Avatar>
              <Box ml={1}>Meta Pixel</Box>
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableMetaPixel === "enabled"}
                    name="enableMetaPixel"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableMetaPixel", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.enableMetaPixel") || "Habilitar Meta Pixel"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableMetaPixelHelp") || "Ativa o rastreamento do Meta Pixel para análise de conversões"}
            </FormHelperText>

            {configState.enableMetaPixel === "enabled" && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {i18n.t("optionsPage.metaPixelSettings") || "Configurações do Meta Pixel"}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      id="metaPixelId"
                      name="metaPixelId"
                      margin="dense"
                      label={i18n.t("optionsPage.metaPixelId") || "ID do Meta Pixel"}
                      variant="outlined"
                      fullWidth
                      value={configState.metaPixelId || ""}
                      onChange={(e) => handleConfigChange("metaPixelId", e.target.value, false)}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <FormHelperText sx={{ mt: 1, mb: 2 }}>
                  {i18n.t("optionsPage.metaPixelIdHelp") || "Informe o ID do seu Meta Pixel"}
                </FormHelperText>
              </Box>
            )}
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faRobot} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
              OpenAI
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    fullWidth
                    label={i18n.t("optionsPage.openaiModel") || "Modelo OpenAI"}
                    value={configState.openAiModel || "gpt-4"}
                    onChange={(e) => handleConfigChange("openAiModel", e.target.value)}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  >
                    {openAiModels.map((model) => (
                      <MenuItem key={model.value} value={model.value}>
                        {model.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FormHelperText>
                    {i18n.t("optionsPage.openaiModelHelp") || "Selecione o modelo da OpenAI para usar"}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configState.enableAudioTranscriptions === "enabled"}
                      name="enableAudioTranscriptions"
                      color="primary"
                      onChange={(e) => handleSwitchChange("enableAudioTranscriptions", e.target.checked)}
                    />
                  }
                  label={i18n.t("optionsPage.enableAudioTranscriptions") || "Ativar transcrição de áudio"}
                />
              </FormGroup>
              <FormHelperText>
                {i18n.t("optionsPage.enableAudioTranscriptionsHelp") || "Ativa a transcrição de áudio utilizando o serviço da OpenAI"}
              </FormHelperText>
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configState.enableOpenAIAssistants === "enabled"}
                      name="enableOpenAIAssistants"
                      color="primary"
                      onChange={(e) => handleSwitchChange("enableOpenAIAssistants", e.target.checked)}
                    />
                  }
                  label="Agentes de IA"
                />
              </FormGroup>
              <FormHelperText>
                Ativa assistentes virtuais inteligentes com OpenAI
              </FormHelperText>
            </Box>

            {configState.enableAudioTranscriptions === "enabled" && (
              <Box sx={{ mt: 2, pl: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      id="openAiKey"
                      name="openAiKey"
                      margin="dense"
                      label={i18n.t("optionsPage.openAiKey") || "Chave da API OpenAI"}
                      variant="outlined"
                      fullWidth
                      value={configState.openAiKey || ""}
                      onChange={(e) => handleConfigChange("openAiKey", e.target.value, false)}
                      size="small"
                      type="password"
                      InputProps={{
                        endAdornment: (
                          <Box>
                            {configState.openAiKey && (
                              <Tooltip title={i18n.t("optionsPage.copyApiKey") || "Copiar chave"}>
                                <FileCopyIcon
                                  sx={{ cursor: 'pointer', ml: 1 }}
                                  onClick={() => {
                                    copyToClipboard(configState.openAiKey);
                                    toast.success(i18n.t("optionsPage.apiKeyCopied") || "Chave copiada com sucesso!");
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <FormHelperText sx={{ mt: 1, mb: 2 }}>
                  {i18n.t("optionsPage.openAiKeyHelp") || "Informe a chave da API OpenAI para realizar a transcrição de áudio"}
                </FormHelperText>
              </Box>
            )}
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableUseOneTicketPerConnection === "enabled"}
                    name="enableUseOneTicketPerConnection"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableUseOneTicketPerConnection", e.target.checked)}
                  />
                }
                label="Um ticket por conexão"
              />
            </FormGroup>
            <FormHelperText>
              Permite apenas um ticket ativo por conexão por vez
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.sendGreetingAccepted === "enabled"}
                    name="sendGreetingAccepted"
                    color="primary"
                    onChange={(e) => handleSwitchChange("sendGreetingAccepted", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.sendanun") || "Enviar saudação quando aceitar ticket"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.sendanunHelp") || "Envia mensagem de saudação automaticamente quando agente aceita um ticket"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.sendQueuePosition === "enabled"}
                    name="sendQueuePosition"
                    color="primary"
                    onChange={(e) => handleSwitchChange("sendQueuePosition", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.sendQueuePosition") || "Enviar posição na fila"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.sendQueuePositionHelp") || "Informa ao cliente sua posição na fila de atendimento"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.settingsUserRandom === "enabled"}
                    name="settingsUserRandom"
                    color="primary"
                    onChange={(e) => handleSwitchChange("settingsUserRandom", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.settingsUserRandom") || "Distribuição aleatória de usuários"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.settingsUserRandomHelp") || "Distribui tickets aleatoriamente entre agentes disponíveis"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.userRating === "enabled"}
                    name="userRating"
                    color="primary"
                    onChange={(e) => handleSwitchChange("userRating", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.calif") || "Habilitar avaliação de atendimento"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.califHelp") || "Permite que clientes avaliem o atendimento recebido"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableReasonWhenCloseTicket === "enabled"}
                    name="enableReasonWhenCloseTicket"
                    color="primary"
                    onChange={(e) => handleMutuallyExclusiveOption("enableReasonWhenCloseTicket", e.target.checked ? "enabled" : "disabled")}
                  />
                }
                label={i18n.t("optionsPage.enableReasonWhenCloseTicket") || "Exigir motivo ao encerrar ticket"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableReasonWhenCloseTicketHelp") || "Obriga o agente a informar um motivo ao encerrar o ticket"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableQueueWhenCloseTicket === "enabled"}
                    name="enableQueueWhenCloseTicket"
                    color="primary"
                    onChange={(e) => handleMutuallyExclusiveOption("enableQueueWhenCloseTicket", e.target.checked ? "enabled" : "disabled")}
                  />
                }
                label={i18n.t("optionsPage.enableQueueWhenCloseTicket") || "Definir fila ao encerrar ticket"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableQueueWhenCloseTicketHelp") || "Permite definir uma fila específica ao encerrar o ticket"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
            <FormHelperText sx={{ mt: 1, mb: 2 }}>
                  Informe o ID do seu Google Analytics (ex: G-XXXXXXXXXX)
                </FormHelperText>
            </FormGroup>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
              Hotjar
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableHotjar === "enabled"}
                    name="enableHotjar"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableHotjar", e.target.checked)}
                  />
                }
                label="Habilitar Hotjar"
              />
            </FormGroup>
            <FormHelperText>
              Ativa o rastreamento do Hotjar para análise de comportamento
            </FormHelperText>

            {configState.enableHotjar === "enabled" && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      id="hotjarId"
                      name="hotjarId"
                      margin="dense"
                      label="ID do Hotjar"
                      variant="outlined"
                      fullWidth
                      value={configState.hotjarId || ""}
                      onChange={(e) => handleConfigChange("hotjarId", e.target.value, false)}
                      size="small"
                      placeholder="1234567"
                    />
                  </Grid>
                </Grid>
                <FormHelperText sx={{ mt: 1, mb: 2 }}>
                  Informe o ID do seu site no Hotjar
                </FormHelperText>
              </Box>
            )}
          </Box>
        </StyledPaper>
      </Box>
    );
    return IntegrationsComponent;
  }, [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange
  ]);

  // Componente de configurações avançadas - COMPLETO
  const AdvancedSection = useMemo(() => {
    const AdvancedComponent = () => (
      <Box>
        <SectionTitle variant="h6">
          <BuildIcon color="primary" />
          {i18n.t("optionsPage.advanced") || "Configurações Avançadas"}
        </SectionTitle>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faFileExport} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
              {i18n.t("optionsPage.downloadSettings") || "Configurações de Download"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label={i18n.t("optionsPage.downloadLimit") || "Limite de Download"}
                    value={configState.downloadLimit || "64"}
                    onChange={(e) => handleConfigChange("downloadLimit", e.target.value)}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  >
                    <MenuItem value="32">32 MB</MenuItem>
                    <MenuItem value="64">64 MB</MenuItem>
                    <MenuItem value="128">128 MB</MenuItem>
                    <MenuItem value="256">256 MB</MenuItem>
                    <MenuItem value="512">512 MB</MenuItem>
                    <MenuItem value="1024">1 GB</MenuItem>
                    <MenuItem value="2048">2 GB</MenuItem>
                  </TextField>
                  <FormHelperText>
                    {i18n.t("optionsPage.downloadLimitHelp") || "Tamanho máximo para download de arquivos"}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Tamanho máximo de arquivo"
                    value={configState.maxFileSize || "10"}
                    onChange={(e) => handleConfigChange("maxFileSize", e.target.value)}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  >
                    <MenuItem value="5">5 MB</MenuItem>
                    <MenuItem value="10">10 MB</MenuItem>
                    <MenuItem value="20">20 MB</MenuItem>
                    <MenuItem value="50">50 MB</MenuItem>
                    <MenuItem value="100">100 MB</MenuItem>
                    <MenuItem value="200">200 MB</MenuItem>
                  </TextField>
                  <FormHelperText>
                    Tamanho máximo para upload de arquivos
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <AssessmentOutlined sx={{ mr: 1, color: theme.palette.primary.main }} />
              {i18n.t("optionsPage.satisfactionSurveyTitle") || "Pesquisa de Satisfação"}
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableSatisfactionSurvey === "enabled"}
                    name="enableSatisfactionSurvey"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableSatisfactionSurvey", e.target.checked)}
                  />
                }
                label={i18n.t("optionsPage.enableSatisfactionSurvey") || "Habilitar pesquisa de satisfação"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableSatisfactionSurveyHelp") || "Envia pesquisa de satisfação após encerramento do ticket"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.callSuport === "enabled"}
                    name="callSuport"
                    color="primary"
                    onChange={(e) => handleSwitchChange("callSuport", e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SupportIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    {i18n.t("optionsPage.callSuport") || "Habilitar suporte"}
                  </Box>
                }
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.callSuportHelp") || "Ativa opções de contato com suporte técnico"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        {configState.callSuport === "enabled" && (
          <OnlyForSuperUser
            yes={() => (
              <StyledPaper elevation={2}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                    <SupportIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    {i18n.t("optionsPage.support") || "Configurações de Suporte"}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        id="wasuport"
                        name="wasuport"
                        label={i18n.t("optionsPage.wasuport") || "WhatsApp Suporte"}
                        size="small"
                        value={configState.waSuportType || ""}
                        onChange={(e) => {
                          if (e.target.value === "" || /^[0-9\b]+$/.test(e.target.value)) {
                            handleConfigChange("waSuportType", e.target.value, true);
                          }
                        }}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <Box mr={1}>
                              <PhoneIcon fontSize="small" color="primary" />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={8}>
                      <TextField
                        id="msgsuporte"
                        name="msgsuporte"
                        label={i18n.t("optionsPage.msgsuport") || "Mensagem de Suporte"}
                        size="small"
                        value={configState.msgSuportType || ""}
                        onChange={(e) => handleConfigChange("msgSuportType", e.target.value, true)}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <Box mr={1}>
                              <MessageIcon fontSize="small" color="primary" />
                            </Box>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </StyledPaper>
            )}
          />
        )}

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
              SMTP
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  id="smtpauth"
                  name="smtpauth"
                  label={i18n.t("optionsPage.smtpServer") || "Servidor SMTP"}
                  size="small"
                  value={configState.smtpauthType || ""}
                  onChange={(e) => handleConfigChange("smtpauthType", e.target.value, true)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  id="usersmtpauth"
                  name="usersmtpauth"
                  label={i18n.t("optionsPage.smtpUser") || "Usuário SMTP"}
                  size="small"
                  value={configState.usersmtpauthType || ""}
                  onChange={(e) => handleConfigChange("usersmtpauthType", e.target.value, true)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  id="clientsecretsmtpauth"
                  name="clientsecretsmtpauth"
                  label={i18n.t("optionsPage.smtpPassword") || "Senha SMTP"}
                  size="small"
                  type="password"
                  value={configState.clientsecretsmtpauthType || ""}
                  onChange={(e) => handleConfigChange("clientsecretsmtpauthType", e.target.value, true)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  id="smtpport"
                  name="smtpport"
                  label={i18n.t("optionsPage.smtpPort") || "Porta SMTP"}
                  size="small"
                  value={configState.smtpPortType || ""}
                  onChange={(e) => handleConfigChange("smtpPortType", e.target.value, true)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
            <FormHelperText>
              {i18n.t("optionsPage.smtpHelp") || "Configure o servidor SMTP para envio de emails"}
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Performance e Cache
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={configState.enableCache === "enabled"}
                        name="enableCache"
                        color="primary"
                        onChange={(e) => handleSwitchChange("enableCache", e.target.checked)}
                      />
                    }
                    label="Habilitar cache"
                  />
                </FormGroup>
                <FormHelperText>
                  Ativa cache para melhorar performance
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Timeout do cache (minutos)"
                    value={configState.cacheTimeoutMinutes || "10"}
                    onChange={(e) => handleConfigChange("cacheTimeoutMinutes", e.target.value)}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  >
                    <MenuItem value="5">5 minutos</MenuItem>
                    <MenuItem value="10">10 minutos</MenuItem>
                    <MenuItem value="15">15 minutos</MenuItem>
                    <MenuItem value="30">30 minutos</MenuItem>
                    <MenuItem value="60">1 hora</MenuItem>
                  </TextField>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableCompression === "enabled"}
                    name="enableCompression"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableCompression", e.target.checked)}
                  />
                }
                label="Compressão de dados"
              />
            </FormGroup>
            <FormHelperText>
              Ativa compressão para reduzir uso de banda
            </FormHelperText>
          </Box>
        </StyledPaper>
      </Box>
    );
    return AdvancedComponent;
  }, [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange
  ]);

  // Componente de recursos - NOVO
  const ResourcesSection = useMemo(() => {
    const ResourcesComponent = () => (
      <Box>
        <SectionTitle variant="h6">
          <TuneIcon color="primary" />
          Recursos do Sistema
        </SectionTitle>

        <CategoryDivider>
          <Chip
            icon={<FontAwesomeIcon icon={faRobot} />}
            label="Chatbot e IA"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableChatbot === "enabled"}
                    name="enableChatbot"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableChatbot", e.target.checked)}
                  />
                }
                label="Habilitar Chatbot"
              />
            </FormGroup>
            <FormHelperText>
              Ativa sistema de chatbot inteligente
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableFlowBuilder === "enabled"}
                    name="enableFlowBuilder"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableFlowBuilder", e.target.checked)}
                  />
                }
                label="Flow Builder"
              />
            </FormGroup>
            <FormHelperText>
              Constructor visual de fluxos de conversa
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableAutoReply === "enabled"}
                    name="enableAutoReply"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableAutoReply", e.target.checked)}
                  />
                }
                label="Respostas automáticas"
              />
            </FormGroup>
            <FormHelperText>
              Sistema de respostas automáticas inteligentes
            </FormHelperText>
          </Box>
        </StyledPaper>

        <CategoryDivider>
          <Chip
            icon={<FontAwesomeIcon icon={faList} />}
            label="Campanhas e Marketing"
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableCampaigns === "enabled"}
                    name="enableCampaigns"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableCampaigns", e.target.checked)}
                  />
                }
                label="Habilitar Campanhas"
              />
            </FormGroup>
            <FormHelperText>
              Sistema completo de campanhas de marketing
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableBulkMessages === "enabled"}
                    name="enableBulkMessages"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableBulkMessages", e.target.checked)}
                  />
                }
                label="Mensagens em massa"
              />
            </FormGroup>
            <FormHelperText>
              Envio de mensagens para múltiplos contatos
            </FormHelperText>
          </Box>
        </StyledPaper>

        <CategoryDivider>
          <Chip
            icon={<AssessmentOutlined />}
            label="Relatórios e Analytics"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableReports === "enabled"}
                    name="enableReports"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableReports", e.target.checked)}
                  />
                }
                label="Relatórios avançados"
              />
            </FormGroup>
            <FormHelperText>
              Sistema completo de relatórios e estatísticas
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableDashboard === "enabled"}
                    name="enableDashboard"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableDashboard", e.target.checked)}
                  />
                }
                label="Dashboard analítico"
              />
            </FormGroup>
            <FormHelperText>
              Dashboard com métricas e KPIs em tempo real
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableAnalytics === "enabled"}
                    name="enableAnalytics"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableAnalytics", e.target.checked)}
                  />
                }
                label="Analytics comportamental"
              />
            </FormGroup>
            <FormHelperText>
              Análise de comportamento e jornada do cliente
            </FormHelperText>
          </Box>
        </StyledPaper>

        <CategoryDivider>
          <Chip
            icon={<FontAwesomeIcon icon={faGears} />}
            label="Recursos Avançados"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableKanban === "enabled"}
                    name="enableKanban"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableKanban", e.target.checked)}
                  />
                }
                label="Kanban de tickets"
              />
            </FormGroup>
            <FormHelperText>
              Visualização em kanban para gestão de tickets
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableInternalChat === "enabled"}
                    name="enableInternalChat"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableInternalChat", e.target.checked)}
                  />
                }
                label="Chat interno"
              />
            </FormGroup>
            <FormHelperText>
              Sistema de chat interno entre agentes
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableAPI === "enabled"}
                    name="enableAPI"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableAPI", e.target.checked)}
                  />
                }
                label="API externa"
              />
            </FormGroup>
            <FormHelperText>
              Acesso via API REST para integrações
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableWebhooks === "enabled"}
                    name="enableWebhooks"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableWebhooks", e.target.checked)}
                  />
                }
                label="Webhooks"
              />
            </FormGroup>
            <FormHelperText>
              Sistema de webhooks para notificações externas
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableCSVImport === "enabled"}
                    name="enableCSVImport"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableCSVImport", e.target.checked)}
                  />
                }
                label="Importação CSV"
              />
            </FormGroup>
            <FormHelperText>
              Importação de dados via arquivos CSV
            </FormHelperText>
          </Box>
        </StyledPaper>
      </Box>
    );
    return ResourcesComponent;
  }, [
    configState,
    handleSwitchChange
  ]);

  // Componente de segurança - NOVO
  const SecuritySection = useMemo(() => {
    const SecurityComponent = () => (
      <Box>
        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
          Segurança e Logs
        </SectionTitle>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Autenticação e Acesso
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableTwoFactor === "enabled"}
                    name="enableTwoFactor"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableTwoFactor", e.target.checked)}
                  />
                }
                label="Autenticação de dois fatores"
              />
            </FormGroup>
            <FormHelperText>
              Ativa 2FA para maior segurança de acesso
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableSessionTimeout === "enabled"}
                    name="enableSessionTimeout"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableSessionTimeout", e.target.checked)}
                  />
                }
                label="Timeout de sessão"
              />
            </FormGroup>
            <FormHelperText>
              Encerra sessões automaticamente por inatividade
            </FormHelperText>

            {configState.enableSessionTimeout === "enabled" && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Timeout (minutos)"
                    value={configState.sessionTimeoutMinutes || "30"}
                    onChange={(e) => handleConfigChange("sessionTimeoutMinutes", e.target.value)}
                    variant="outlined"
                    size="small"
                  >
                    <MenuItem value="15">15 minutos</MenuItem>
                    <MenuItem value="30">30 minutos</MenuItem>
                    <MenuItem value="60">1 hora</MenuItem>
                    <MenuItem value="120">2 horas</MenuItem>
                    <MenuItem value="240">4 horas</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            )}
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableIPWhitelist === "enabled"}
                    name="enableIPWhitelist"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableIPWhitelist", e.target.checked)}
                  />
                }
                label="Lista branca de IPs"
              />
            </FormGroup>
            <FormHelperText>
              Restringe acesso a IPs específicos
            </FormHelperText>

            {configState.enableIPWhitelist === "enabled" && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="IPs permitidos"
                  value={configState.ipWhitelist || ""}
                  onChange={(e) => handleConfigChange("ipWhitelist", e.target.value, false)}
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="192.168.1.1, 10.0.0.1"
                  helperText="Separar múltiplos IPs por vírgula"
                />
              </Box>
            )}
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Logs e Auditoria
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableAuditLog === "enabled"}
                    name="enableAuditLog"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableAuditLog", e.target.checked)}
                  />
                }
                label="Log de auditoria"
              />
            </FormGroup>
            <FormHelperText>
              Registra todas as ações dos usuários
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableAccessLog === "enabled"}
                    name="enableAccessLog"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableAccessLog", e.target.checked)}
                  />
                }
                label="Log de acesso"
              />
            </FormGroup>
            <FormHelperText>
              Registra todos os acessos ao sistema
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableErrorLog === "enabled"}
                    name="enableErrorLog"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableErrorLog", e.target.checked)}
                  />
                }
                label="Log de erros"
              />
            </FormGroup>
            <FormHelperText>
              Registra erros e exceções do sistema
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Retenção de logs (dias)"
                    value={configState.logRetentionDays || "7"}
                    onChange={(e) => handleConfigChange("logRetentionDays", e.target.value)}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  >
                    <MenuItem value="1">1 dia</MenuItem>
                    <MenuItem value="7">7 dias</MenuItem>
                    <MenuItem value="15">15 dias</MenuItem>
                    <MenuItem value="30">30 dias</MenuItem>
                    <MenuItem value="90">90 dias</MenuItem>
                    <MenuItem value="365">1 ano</MenuItem>
                  </TextField>
                  <FormHelperText>
                    Tempo de retenção dos logs no sistema
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Nível de log"
                    value={configState.logLevel || "error"}
                    onChange={(e) => handleConfigChange("logLevel", e.target.value)}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  >
                    <MenuItem value="debug">Debug</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="fatal">Fatal</MenuItem>
                  </TextField>
                  <FormHelperText>
                    Nível mínimo de logs a serem registrados
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Backup e Recuperação
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableAutoBackup === "enabled"}
                    name="enableAutoBackup"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableAutoBackup", e.target.checked)}
                  />
                }
                label="Backup automático"
              />
            </FormGroup>
            <FormHelperText>
              Realiza backups automáticos do sistema
            </FormHelperText>

            {configState.enableAutoBackup === "enabled" && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <TextField
                        select
                        label="Frequência do backup"
                        value={configState.backupFrequency || "daily"}
                        onChange={(e) => handleConfigChange("backupFrequency", e.target.value)}
                        variant="outlined"
                        size="small"
                      >
                        <MenuItem value="hourly">A cada hora</MenuItem>
                        <MenuItem value="daily">Diário</MenuItem>
                        <MenuItem value="weekly">Semanal</MenuItem>
                        <MenuItem value="monthly">Mensal</MenuItem>
                      </TextField>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <TextField
                        select
                        label="Retenção (dias)"
                        value={configState.backupRetentionDays || "30"}
                        onChange={(e) => handleConfigChange("backupRetentionDays", e.target.value)}
                        variant="outlined"
                        size="small"
                      >
                        <MenuItem value="7">7 dias</MenuItem>
                        <MenuItem value="15">15 dias</MenuItem>
                        <MenuItem value="30">30 dias</MenuItem>
                        <MenuItem value="60">60 dias</MenuItem>
                        <MenuItem value="90">90 dias</MenuItem>
                        <MenuItem value="365">1 ano</MenuItem>
                      </TextField>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Notificações de Segurança
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableEmailNotifications === "enabled"}
                    name="enableEmailNotifications"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableEmailNotifications", e.target.checked)}
                  />
                }
                label="Notificações por email"
              />
            </FormGroup>
            <FormHelperText>
              Envia alertas de segurança por email
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableSMSNotifications === "enabled"}
                    name="enableSMSNotifications"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableSMSNotifications", e.target.checked)}
                  />
                }
                label="Notificações por SMS"
              />
            </FormGroup>
            <FormHelperText>
              Envia alertas críticos por SMS
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enablePushNotifications === "enabled"}
                    name="enablePushNotifications"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enablePushNotifications", e.target.checked)}
                  />
                }
                label="Push notifications"
              />
            </FormGroup>
            <FormHelperText>
              Notificações push no navegador
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableDesktopNotifications === "enabled"}
                    name="enableDesktopNotifications"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableDesktopNotifications", e.target.checked)}
                  />
                }
                label="Notificações desktop"
              />
            </FormGroup>
            <FormHelperText>
              Notificações na área de trabalho
            </FormHelperText>
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Personalização Avançada
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableCustomCSS === "enabled"}
                    name="enableCustomCSS"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableCustomCSS", e.target.checked)}
                  />
                }
                label="CSS personalizado"
              />
            </FormGroup>
            <FormHelperText>
              Permite inserir CSS customizado
            </FormHelperText>

            {configState.enableCustomCSS === "enabled" && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="CSS personalizado"
                  value={configState.customCSS || ""}
                  onChange={(e) => handleConfigChange("customCSS", e.target.value, false)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  size="small"
                  placeholder="/* Insira seu CSS aqui */"
                  helperText="CSS será aplicado globalmente no sistema"
                />
              </Box>
            )}
          </Box>
        </StyledPaper>

        <StyledPaper elevation={2}>
          <Box sx={{ p: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={configState.enableWhiteLabel === "enabled"}
                    name="enableWhiteLabel"
                    color="primary"
                    onChange={(e) => handleSwitchChange("enableWhiteLabel", e.target.checked)}
                  />
                }
                label="White Label avançado"
              />
            </FormGroup>
            <FormHelperText>
              Personalização completa da marca
            </FormHelperText>

            {configState.enableWhiteLabel === "enabled" && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nome da empresa"
                      value={configState.companyName || ""}
                      onChange={(e) => handleConfigChange("companyName", e.target.value, false)}
                      variant="outlined"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="URL do logo"
                      value={configState.companyLogo || ""}
                      onChange={(e) => handleConfigChange("companyLogo", e.target.value, false)}
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </StyledPaper>
      </Box>
    );
    return SecurityComponent;
  }, [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange
  ]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={2} sx={{ mb: 3, borderRadius: isMobile ? 3 : 1 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            background: theme.palette.background.default,
            borderRadius: isMobile ? 3 : 1,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          {tabs.map((tab, index) => (
            <StyledTab
              key={index}
              icon={!isMobile ? tab.icon : null}
              label={tab.label}
              iconPosition="start"
              sx={{
                '& .MuiTab-iconWrapper': {
                  marginRight: theme.spacing(1),
                  marginBottom: 0,
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && (
          <StandardTabContent
            title={i18n.t("optionsPage.general") || "Configurações Gerais"}
            description="Configure as opções básicas de funcionamento do sistema"
            icon={React.createElement(SettingsIcon)}
            variant="default"
          >
            <GeneralConfigSection />
          </StandardTabContent>
        )}

        {currentTab === 1 && (
          <StandardTabContent
            title={i18n.t("optionsPage.integrations") || "Integrações"}
            description="Configure as integrações com serviços externos"
            icon={React.createElement(FontAwesomeIcon, { icon: faServer })}
            variant="default"
          >
            <IntegrationsSection />
          </StandardTabContent>
        )}

        {currentTab === 2 && (
          <StandardTabContent
            title={i18n.t("optionsPage.advanced") || "Configurações Avançadas"}
            description="Configure opções avançadas e específicas do sistema"
            icon={React.createElement(BuildIcon)}
            variant="default"
          >
            <AdvancedSection />
          </StandardTabContent>
        )}

        {currentTab === 3 && (
          <StandardTabContent
            title="Recursos do Sistema"
            description="Habilite ou desabilite recursos específicos do sistema"
            icon={React.createElement(TuneIcon)}
            variant="default"
          >
            <ResourcesSection />
          </StandardTabContent>
        )}

        {currentTab === 4 && (
          <StandardTabContent
            title="Segurança e Logs"
            description="Configure opções de segurança, logs e auditoria"
            icon={React.createElement(FontAwesomeIcon, { icon: faDatabase })}
            variant="default"
          >
            <SecuritySection />
          </StandardTabContent>
        )}
      </Box>
    </Box>
  );
};

Options.propTypes = {
  settings: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.any
  })),
  enableReasonWhenCloseTicketChanged: PropTypes.func,
  onSettingChange: PropTypes.func.isRequired,
  pendingChanges: PropTypes.object
};

Options.defaultProps = {
  settings: [],
  enableReasonWhenCloseTicketChanged: () => { },
  pendingChanges: {}
};

export default React.memo(Options);