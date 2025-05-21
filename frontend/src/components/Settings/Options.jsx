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
import { i18n } from "../../translate/i18n";
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
import { copyToClipboard } from "../../helpers/copyToClipboard";
import { toast } from "../../helpers/toast";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import { AuthContext } from "../../context/Auth/AuthContext";

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
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  borderRadius: 4,
  textTransform: 'none',
  fontWeight: 500,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const CategoryDivider = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

const StyledBadge = styled(Avatar)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

// Componente principal
const Options = ({ 
  settings, 
  scheduleTypeChanged, 
  enableReasonWhenCloseTicketChanged,
  onSettingChange,
  pendingChanges
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  const [ user ] = useContext(AuthContext);

  // Estado para armazenar configurações
  const [configState, setConfigState] = useState({
    // IA
    openAiModel: "gpt-4",
    enableAudioTranscriptions: "disabled",
    openAiKey: "",

    // Configurações gerais
    userRating: "disabled",
    scheduleType: "disabled",
    quickMessages: i18n.t("optionsPage.byCompany"),
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
    msgSuportType: ""
  });

  // Carregar configurações iniciais
  useEffect(() => {
    if (!Array.isArray(settings) || settings.length === 0) return;

    // Criar um mapa de configurações para acesso rápido
    const settingsMap = {};
    settings.forEach(setting => {
      if (setting && setting.key) {
        settingsMap[setting.key] = setting.value;
      }
    });

    // Atualizar o estado com as configurações carregadas
    setConfigState(prevState => {
      const newState = { ...prevState };

      // Mapear todas as propriedades
      Object.keys(newState).forEach(key => {
        let settingKey = key;
        
        // Mapeamento especial para algumas chaves
        if (key === 'openAiModel') {
          settingKey = 'openaiModel';
        } else if (key === 'smtpauthType') {
          settingKey = 'smtpauth';
        } else if (key === 'usersmtpauthType') {
          settingKey = 'usersmtpauth';
        } else if (key === 'clientsecretsmtpauthType') {
          settingKey = 'clientsecretsmtpauth';
        } else if (key === 'smtpPortType') {
          settingKey = 'smtpport';
        } else if (key === 'waSuportType') {
          settingKey = 'wasuport';
        } else if (key === 'msgSuportType') {
          settingKey = 'msgsuport';
        }
        
        if (settingsMap[settingKey] !== undefined) {
          newState[key] = String(settingsMap[settingKey] || newState[key] || "");
        }
      });

      return newState;
    });
  }, [settings]);

  // Atualizar configuração local e notificar alteração
  const handleConfigChange = (key, value, notifyBackend = true) => {
    // Atualizar estado local
    setConfigState(prev => ({ 
      ...prev, 
      [key]: value 
    }));

    // Mapear para a chave correta do backend se necessário
    let backendKey = key;
    if (key === 'openAiModel') {
      backendKey = 'openaiModel';
    } else if (key === 'smtpauthType') {
      backendKey = 'smtpauth';
    } else if (key === 'usersmtpauthType') {
      backendKey = 'usersmtpauth';
    } else if (key === 'clientsecretsmtpauthType') {
      backendKey = 'clientsecretsmtpauth';
    } else if (key === 'smtpPortType') {
      backendKey = 'smtpport';
    } else if (key === 'waSuportType') {
      backendKey = 'wasuport';
    } else if (key === 'msgSuportType') {
      backendKey = 'msgsuport';
    }

    // Informar alteração para salvar mais tarde
    if (notifyBackend) {
      onSettingChange(backendKey, value);
    }

    // Lidar com callbacks específicos
    if (key === 'scheduleType' && typeof scheduleTypeChanged === 'function') {
      scheduleTypeChanged(value);
    }

    if (key === 'enableReasonWhenCloseTicket' && typeof enableReasonWhenCloseTicketChanged === 'function') {
      enableReasonWhenCloseTicketChanged(value);
    }
  };

  // Manipulador específico para switches
  const handleSwitchChange = (key, checked) => {
    const value = checked ? "enabled" : "disabled";
    handleConfigChange(key, value);
  };

  // Função para configurações mutuamente exclusivas
  const handleMutuallyExclusiveOption = async (enabledKey, value) => {
    // Se estiver habilitando esta opção, tratar as exclusões mútuas
    if (value === "enabled") {
      const exclusiveOptions = {
        enableQueueWhenCloseTicket: ["enableTagsWhenCloseTicket", "enableReasonWhenCloseTicket"],
        enableTagsWhenCloseTicket: ["enableQueueWhenCloseTicket", "enableReasonWhenCloseTicket"],
        enableReasonWhenCloseTicket: ["enableQueueWhenCloseTicket", "enableTagsWhenCloseTicket"]
      };

      // Se a opção tem exclusões
      if (exclusiveOptions[enabledKey]) {
        const optionsToDisable = exclusiveOptions[enabledKey];

        // Desativar as outras opções
        optionsToDisable.forEach(key => {
          if (configState[key] === "enabled") {
            handleConfigChange(key, "disabled");
          }
        });
        
        toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive"));
      }
    }

    handleConfigChange(enabledKey, value);
  };

  // Manipulador de mudança de tabs
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Componente de configurações gerais
  const GeneralConfigSection = useMemo(() => () => (
    <>
      <SectionTitle variant="h6">
        <BusinessIcon color="primary" />
        {i18n.t("optionsPage.general_params")}
      </SectionTitle>

      <OnlyForSuperUser
        yes={() => (
          <>
            <StyledPaper elevation={3}>
              <Box sx={{ p: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <TextField
                        select
                        label={i18n.t("optionsPage.trialExpiration")}
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
                        <MenuItem value="3">3 {i18n.t("optionsPage.days")}</MenuItem>
                        <MenuItem value="7">7 {i18n.t("optionsPage.days")}</MenuItem>
                        <MenuItem value="9">9 {i18n.t("optionsPage.days")}</MenuItem>
                        <MenuItem value="15">15 {i18n.t("optionsPage.days")}</MenuItem>
                        <MenuItem value="30">30 {i18n.t("optionsPage.days")}</MenuItem>
                      </TextField>
                      <FormHelperText>
                        {i18n.t("optionsPage.trialExpirationHelp")}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </StyledPaper>
            <StyledPaper elevation={3}>
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
                        {i18n.t("optionsPage.enableRegisterInSignup")}
                      </Box>
                    }
                  />
                </FormGroup>
                <FormHelperText>
                  {i18n.t("optionsPage.enableRegisterInSignupHelp")}
                </FormHelperText>
              </Box>
            </StyledPaper>
            <StyledPaper elevation={3}>
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
                        {i18n.t("optionsPage.sendEmailInRegister")}
                      </Box>
                    }
                  />
                </FormGroup>
                <FormHelperText>
                  {i18n.t("optionsPage.sendEmailInRegisterHelp")}
                </FormHelperText>
              </Box>
            </StyledPaper>
            <StyledPaper elevation={3}>
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
                        {i18n.t("optionsPage.sendMessageWhenRegiter")}
                      </Box>
                    }
                  />
                </FormGroup>
                <FormHelperText>
                  {i18n.t("optionsPage.sendMessageWhenRegiterHelp")}
                </FormHelperText>
              </Box>
            </StyledPaper>
          </>
        )}
      />

      <CategoryDivider>
        <Chip
          icon={<FontAwesomeIcon icon={faTicketAlt} />}
          label={i18n.t("optionsPage.ticketSettings")}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 'bold', px: 2 }}
        />
        <Divider sx={{ flexGrow: 1, ml: 2 }} />
      </CategoryDivider>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={configState.CheckMsgIsGroup === "enabled"}
                  name="CheckMsgIsGroup"
                  color="primary"
                  onChange={(e) => handleSwitchChange("CheckMsgIsGroup", e.target.checked)}
                />
              }
              label={i18n.t("optionsPage.ignore")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.ignoreHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={configState.SendGreetingAccepted === "enabled"}
                  name="SendGreetingAccepted"
                  color="primary"
                  onChange={(e) => handleSwitchChange("SendGreetingAccepted", e.target.checked)}
                />
              }
              label={i18n.t("optionsPage.sendanun")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.sendanunHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.sendQueuePosition")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.sendQueuePositionHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.settingsUserRandom")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.settingsUserRandomHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.calif")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.califHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      {/* Opções de encerramento de ticket mutuamente exclusivas */}
      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.enableReasonWhenCloseTicket")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableReasonWhenCloseTicketHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.enableQueueWhenCloseTicket")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableQueueWhenCloseTicketHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.enableTagsWhenCloseTicket")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableTagsWhenCloseTicketHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.displayProfileImages")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.displayProfileImagesHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>


      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.showSKU")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.showSKUHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <CategoryDivider>
        <Chip
          icon={<FontAwesomeIcon icon={faUsers} />}
          label={i18n.t("optionsPage.contactSettings")}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 'bold', px: 2 }}
        />
        <Divider sx={{ flexGrow: 1, ml: 2 }} />
      </CategoryDivider>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.displayContactInfo")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.displayContactInfoHelp")}
            {configState.displayBusinessInfo === "enabled" && (
              <Typography color="error" variant="caption" display="block">
                {i18n.t("optionsPage.displayContactInfoDisabled")}
              </Typography>
            )}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.displayBusinessInfo")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.displayBusinessInfoHelp")}
            {configState.displayContactInfo === "enabled" && (
              <Typography color="error" variant="caption" display="block">
                {i18n.t("optionsPage.displayBusinessInfoDisabled")}
              </Typography>
            )}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.enableSaveCommonContacts")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableSaveCommonContactsHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <TextField
                  select
                  fullWidth
                  label={i18n.t("optionsPage.expedient")}
                  value={configState.scheduleType || "disabled"}
                  size="small"
                  onChange={(e) => handleConfigChange("scheduleType", e.target.value)}
                  variant="outlined"
                  margin="normal"
                >
                  <MenuItem value="disabled">
                    {i18n.t("optionsPage.buttons.off")}
                  </MenuItem>
                  <MenuItem value="company">
                    {i18n.t("optionsPage.buttons.partner")}
                  </MenuItem>
                  <MenuItem value="queue">
                    {i18n.t("optionsPage.buttons.quee")}
                  </MenuItem>
                </TextField>
                <FormHelperText>
                  {i18n.t("optionsPage.expedientHelp")}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={configState.SettingsTransfTicket === "enabled"}
                  name="SettingsTransfTicket"
                  color="primary"
                  onChange={(e) => handleSwitchChange("SettingsTransfTicket", e.target.checked)}
                />
              }
              label={i18n.t("optionsPage.sendagent")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.sendagentHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.greeatingOneQueue")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.greeatingOneQueueHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <TextField
                  select
                  fullWidth
                  label={i18n.t("optionsPage.speedMessage")}
                  value={configState.quickMessages || "company"}
                  size="small"
                  onChange={(e) => handleConfigChange("quickMessages", e.target.value)}
                  variant="outlined"
                  margin="normal"
                >
                  <MenuItem value="company">{i18n.t("optionsPage.byCompany")}</MenuItem>
                  <MenuItem value="individual">{i18n.t("optionsPage.byUser")}</MenuItem>
                </TextField>
                <FormHelperText>
                  {i18n.t("optionsPage.speedMessageHelp")}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </>
  ), [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange,
    handleMutuallyExclusiveOption
  ]);

  // Componente de configurações de integrações
  const IntegrationsSection = useMemo(() => () => (
    <>
      <SectionTitle variant="h6">
        <FontAwesomeIcon icon={faServer} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
        {i18n.t("optionsPage.integrations")}
      </SectionTitle>


      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.enableOfficialWhatsapp")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableOfficialWhatsappHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
              label={i18n.t("optionsPage.enableMetaPixel")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableMetaPixelHelp")}
          </FormHelperText>

          {configState.enableMetaPixel === "enabled" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {i18n.t("optionsPage.metaPixelSettings")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    id="metaPixelId"
                    name="metaPixelId"
                    margin="dense"
                    label={i18n.t("optionsPage.metaPixelId")}
                    variant="outlined"
                    fullWidth
                    value={configState.metaPixelId || ""}
                    onChange={(e) => handleConfigChange("metaPixelId", e.target.value, false)}
                    size="small"
                  />
                </Grid>
              </Grid>
              <FormHelperText sx={{ mt: 1, mb: 2 }}>
                {i18n.t("optionsPage.metaPixelIdHelp")}
              </FormHelperText>
            </Box>
          )}
        </Box>
      </StyledPaper>


      <StyledPaper elevation={3}>
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
                  label={i18n.t("optionsPage.openaiModel")}
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
                  {i18n.t("optionsPage.openaiModelHelp")}
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

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
            <StyledBadge>
              <FontAwesomeIcon icon={faServer} size="xs" />
            </StyledBadge>
            <Box ml={1}>UPSix</Box>
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={configState.enableUPSix === "enabled"}
                  name="enableUPSix"
                  color="primary"
                  onChange={(e) => handleSwitchChange("enableUPSix", e.target.checked)}
                />
              }
              label={i18n.t("optionsPage.enableUPSix")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableUPSixHelp")}
          </FormHelperText>

          {configState.enableUPSix === "enabled" && (
            <Box sx={{ mt: 2, pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configState.enableUPSixWebphone === "enabled"}
                      name="enableUPSixWebphone"
                      color="primary"
                      onChange={(e) => handleSwitchChange("enableUPSixWebphone", e.target.checked)}
                    />
                  }
                  label={i18n.t("optionsPage.enableUPSixWebphone")}
                />
              </FormGroup>
              <FormHelperText>
                {i18n.t("optionsPage.enableUPSixWebphoneHelp")}
              </FormHelperText>

              <FormGroup sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configState.enableUPSixNotifications === "enabled"}
                      name="enableUPSixNotifications"
                      color="primary"
                      onChange={(e) => handleSwitchChange("enableUPSixNotifications", e.target.checked)}
                    />
                  }
                  label={i18n.t("optionsPage.enableUPSixNotifications")}
                />
              </FormGroup>
              <FormHelperText>
                {i18n.t("optionsPage.enableUPSixNotificationsHelp")}
              </FormHelperText>
            </Box>
          )}
        </Box>
      </StyledPaper>
    </>
  ), [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange
  ]);

  // Componente de configurações avançadas
  const AdvancedSection = useMemo(() => () => (
    <>
      <SectionTitle variant="h6">
        <BuildIcon color="primary" />
        {i18n.t("optionsPage.advanced")}
      </SectionTitle>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faFileExport} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
            {i18n.t("optionsPage.downloadSettings")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <TextField
                  select
                  label={i18n.t("optionsPage.downloadLimit")}
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
                  {i18n.t("optionsPage.downloadLimitHelp")}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
            <AssessmentOutlined sx={{ mr: 1, color: theme.palette.primary.main }} />
            {i18n.t("optionsPage.satisfactionSurveyTitle")}
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
              label={i18n.t("optionsPage.enableSatisfactionSurvey")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableSatisfactionSurveyHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
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
                  {i18n.t("optionsPage.callSuport")}
                </Box>
              }
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.callSuportHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>

      {configState.callSuport === "enabled" && (
        <OnlyForSuperUser
          yes={() => (
            <StyledPaper elevation={3}>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <SupportIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  {i18n.t("optionsPage.support")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      id="wasuport"
                      name="wasuport"
                      label={i18n.t("optionsPage.wasuport")}
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
                      label={i18n.t("optionsPage.msgsuport")}
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

      <StyledPaper elevation={3}>
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
                label={i18n.t("optionsPage.smtpServer")}
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
                label={i18n.t("optionsPage.smtpUser")}
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
                label={i18n.t("optionsPage.smtpPassword")}
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
                label={i18n.t("optionsPage.smtpPort")}
                size="small"
                value={configState.smtpPortType || ""}
                onChange={(e) => handleConfigChange("smtpPortType", e.target.value, true)}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
          <FormHelperText>
            {i18n.t("optionsPage.smtpHelp")}
          </FormHelperText>
        </Box>
      </StyledPaper>
    </>
  ), [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange
  ]);

  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{ background: theme.palette.background.default, borderRadius: 1 }}
        >
          <StyledTab
            icon={<SettingsIcon />}
            label={i18n.t("optionsPage.general")}
            iconPosition="start"
          />
          <StyledTab
            icon={<FontAwesomeIcon icon={faServer} />}
            label={i18n.t("optionsPage.integrations")}
            iconPosition="start"
          />
          <StyledTab
            icon={<BuildIcon />}
            label={i18n.t("optionsPage.advanced")}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Conteúdo das tabs */}
      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && <GeneralConfigSection />}
        {currentTab === 1 && <IntegrationsSection />}
        {currentTab === 2 && <AdvancedSection />}
      </Box>
    </Box>
  );
};

Options.propTypes = {
  settings: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.any
  })),
  scheduleTypeChanged: PropTypes.func,
  enableReasonWhenCloseTicketChanged: PropTypes.func,
  onSettingChange: PropTypes.func.isRequired,
  pendingChanges: PropTypes.object
};

Options.defaultProps = {
  settings: [],
  scheduleTypeChanged: () => { },
  enableReasonWhenCloseTicketChanged: () => { },
  pendingChanges: {}
};

export default React.memo(Options);
        