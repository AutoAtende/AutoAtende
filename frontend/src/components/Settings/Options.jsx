import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import {
  Grid,
  Paper,
  FormControl,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Switch,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Tabs,
  Tab,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Stack,
  Badge,
  Chip,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { i18n } from "../../translate/i18n";
import useSettings from "../../hooks/useSettings";
import { toast } from "../../helpers/toast";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth";
import {
  Delete,
  Settings as SettingsIcon,
  AssessmentOutlined,
  Save as SaveIcon,
  Build as BuildIcon,
  BusinessCenter as BusinessIcon,
  Tune as TuneIcon,
  LocalOffer as TagIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Support as SupportIcon,
  SettingsApplications as AppSettingsIcon,
  Timeline as TimelineIcon,
  CheckCircleOutline as CheckIcon,
  FileCopy as FileCopyIcon
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faGears, faRobot, faServer, faEnvelope, faList, faFileExport, faTicketAlt, faUsers, faBuilding, faDatabase } from "@fortawesome/free-solid-svg-icons";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { copyToClipboard } from "../../helpers/copyToClipboard";
import { useContext } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { useLoading } from "../../hooks/useLoading";
import { useSpring, animated } from "react-spring";

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
  margin: theme.spacing(0.5, 0, 0.5, 0),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const AnimatedSwitch = animated(Switch);

const StyledTab = styled(Tab)(({ theme }) => ({
  borderRadius: 4,
  textTransform: 'none',
  fontWeight: 500,
}));

const SaveButton = styled(Button)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  zIndex: 1100,
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(1),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const CategoryDivider = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

// Componente principal
const Options = ({ settings, scheduleTypeChanged, enableReasonWhenCloseTicketChanged }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { update } = useSettings();
  const { user } = useAuth();
  const { setMakeRequestSettings } = useContext(GlobalContext);
  const { Loading } = useLoading();

  // Estado consolidado para todas as configurações
  const [configs, setConfigs] = useState({
    // Configurações da IA
    openAiModel: "gpt-4",
    enableAudioTranscriptions: "disabled",
    openAiKey: "",

    // Configurações gerais
    userRating: "disabled",
    scheduleType: "disabled",
    quickMessages: i18n.t("optionsPage.byCompany"),
    allowSignup: "disabled",
    CheckMsgIsGroup: "disabled",
    SendGreetingAccepted: "disabled",
    SettingsTransfTicket: "disabled",
    sendGreetingMessageOneQueues: "enabled",
    apiToken: "",
    downloadLimit: "64",
    sendEmailWhenRegister: "disabled",
    sendMessageWhenRegister: "disabled",
    enableReasonWhenCloseTicket: "disabled",
    enableUseOneTicketPerConnection: "disabled",
    callSuport: "enabled",
    trialExpiration: false,
    displayContactInfo: "enabled",
    enableTicketValueAndSku: false,
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

  // Estados de UI
  const [currentTab, setCurrentTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSections, setLoadingSections] = useState({
    general: false,
    integrations: false,
    advanced: false,
    openai: false,
    meta: false
  });

  // Efeito de animação para os switches
  const switchAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { tension: 300, friction: 20 }
  });

  // Utilidade para atualizar um campo específico de configuração
  const setConfigField = useCallback((field, value) => {
    setConfigs(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  }, []);

  // Utilitário para atualizar seções de loading
  const setLoadingSection = useCallback((section, isLoading) => {
    setLoadingSections(prev => ({
      ...prev,
      [section]: isLoading
    }));
  }, []);

  // Função para atualizar configuração no servidor
  const updateSetting = useCallback(async (key, value) => {
    try {
      await update({ key, value });
      setMakeRequestSettings(Math.random());
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar configuração ${key}:`, error);
      toast.error(i18n.t("optionsPage.errorMessage"));
      return false;
    }
  }, [update, setMakeRequestSettings]);

  // Carregar configurações quando o componente for montado
  useEffect(() => {
    const loadSettings = () => {
      if (!Array.isArray(settings) || settings.length === 0) return;

      const newConfigs = { ...configs };
      let updated = false;

      settings.forEach((setting) => {
        if (setting.key && setting.key in newConfigs) {
          newConfigs[setting.key] = setting.value;
          updated = true;
        }
      });

      if (updated) {
        setConfigs(newConfigs);
      }
    };

    loadSettings();
  }, [settings]);

  // Handlers genéricos para cada tipo de configuração
  const handleSwitchChange = useCallback((field) => async (e) => {
    const value = e.target.checked ? "enabled" : "disabled";
    setConfigField(field, value);

    // Casos especiais com exclusão mútua
    if (field === "enableReasonWhenCloseTicket" && value === "enabled") {
      if (configs.enableQueueWhenCloseTicket === "enabled") {
        setConfigField("enableQueueWhenCloseTicket", "disabled");
        await updateSetting("enableQueueWhenCloseTicket", "disabled");
      }
      if (configs.enableTagsWhenCloseTicket === "enabled") {
        setConfigField("enableTagsWhenCloseTicket", "disabled");
        await updateSetting("enableTagsWhenCloseTicket", "disabled");
      }
      toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive"));
    } else if (field === "enableQueueWhenCloseTicket" && value === "enabled") {
      if (configs.enableReasonWhenCloseTicket === "enabled") {
        setConfigField("enableReasonWhenCloseTicket", "disabled");
        await updateSetting("enableReasonWhenCloseTicket", "disabled");
        if (typeof enableReasonWhenCloseTicketChanged === "function") {
          enableReasonWhenCloseTicketChanged("disabled");
        }
      }
      if (configs.enableTagsWhenCloseTicket === "enabled") {
        setConfigField("enableTagsWhenCloseTicket", "disabled");
        await updateSetting("enableTagsWhenCloseTicket", "disabled");
      }
      toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive"));
    } else if (field === "enableTagsWhenCloseTicket" && value === "enabled") {
      if (configs.enableReasonWhenCloseTicket === "enabled") {
        setConfigField("enableReasonWhenCloseTicket", "disabled");
        await updateSetting("enableReasonWhenCloseTicket", "disabled");
        if (typeof enableReasonWhenCloseTicketChanged === "function") {
          enableReasonWhenCloseTicketChanged("disabled");
        }
      }
      if (configs.enableQueueWhenCloseTicket === "enabled") {
        setConfigField("enableQueueWhenCloseTicket", "disabled");
        await updateSetting("enableQueueWhenCloseTicket", "disabled");
      }
      toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive"));
    }

    // Callback para mudanças de scheduleType
    if (field === "scheduleType") {
      if (typeof scheduleTypeChanged === "function") {
        scheduleTypeChanged(value);
      }
    }

    // Callback para enableReasonWhenCloseTicket
    if (field === "enableReasonWhenCloseTicket") {
      if (typeof enableReasonWhenCloseTicketChanged === "function") {
        enableReasonWhenCloseTicketChanged(value);
      }
    }
  }, [configs, setConfigField, updateSetting, enableReasonWhenCloseTicketChanged, scheduleTypeChanged]);

  const handleSelectChange = useCallback((field) => (e) => {
    setConfigField(field, e.target.value);
  }, [setConfigField]);

  const handleInputChange = useCallback((field) => (e) => {
    setConfigField(field, e.target.value);
  }, [setConfigField]);

  // Handlers específicos quando necessário
  const handleEnableAudioTranscriptions = useCallback(async (e) => {
    const value = e.target.checked ? "enabled" : "disabled";
    setConfigField("enableAudioTranscriptions", value);
  }, [setConfigField]);

  // Função para salvar todas as configurações de uma vez
  const saveAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      Loading.turnOn();

      // Criar array de promessas para todas as atualizações
      const updatePromises = Object.entries(configs).map(([key, value]) =>
        updateSetting(key, value)
      );

      await Promise.all(updatePromises);

      setHasChanges(false);
      toast.success(i18n.t("optionsPage.successMessage"));
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error(i18n.t("optionsPage.errorMessage"));
    } finally {
      setLoading(false);
      Loading.turnOff();
    }
  }, [configs, updateSetting, Loading]);

  // Salvar configuração específica de OpenAI Key
  const onHandleSaveOpenAiKey = useCallback(async () => {
    try {
      setLoadingSection('openai', true);
      const success = await updateSetting("openAiKey", configs.openAiKey);
      if (success) {
        toast.success(i18n.t("optionsPage.openAiKeySuccess"));
      }
    } catch (error) {
      toast.error(error.message || i18n.t("optionsPage.errorMessage"));
    } finally {
      setLoadingSection('openai', false);
    }
  }, [configs.openAiKey, updateSetting, setLoadingSection]);

  // Salvar configuração específica de Meta Pixel ID
  const onHandleSaveMetaPixelId = useCallback(async () => {
    try {
      setLoadingSection('meta', true);
      const success = await updateSetting("metaPixelId", configs.metaPixelId);
      if (success) {
        toast.success(i18n.t("optionsPage.successMessage"));
      }
    } catch (error) {
      toast.error(error.message || i18n.t("optionsPage.errorMessage"));
    } finally {
      setLoadingSection('meta', false);
    }
  }, [configs.metaPixelId, updateSetting, setLoadingSection]);

  // Handler para mudança de tabs
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // Componente de configurações gerais memoizado
  const GeneralConfigSection = useMemo(() => (
    <>
      <SectionTitle variant="h6">
        <BusinessIcon color="primary" />
        {i18n.t("optionsPage.general_params")}
      </SectionTitle>

      <OnlyForSuperUser
        user={user}
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
                        value={configs.trialExpiration || "3"}
                        size="small"
                        onChange={handleSelectChange("trialExpiration")}
                        variant="outlined"
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <Box mr={1}>
                              <TagIcon fontSize="small" color="primary" />
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
                      <AnimatedSwitch
                        style={switchAnimation}
                        checked={configs.allowSignup === "enabled"}
                        name="allowSignup"
                        color="primary"
                        onChange={handleSwitchChange("allowSignup")}
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
                      <AnimatedSwitch
                        style={switchAnimation}
                        checked={configs.sendEmailWhenRegister === "enabled"}
                        name="sendEmailWhenRegister"
                        color="primary"
                        onChange={handleSwitchChange("sendEmailWhenRegister")}
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
                      <AnimatedSwitch
                        style={switchAnimation}
                        checked={configs.sendMessageWhenRegister === "enabled"}
                        name="sendMessageWhenRegister"
                        color="primary"
                        onChange={handleSwitchChange("sendMessageWhenRegister")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.CheckMsgIsGroup === "enabled"}
                  name="CheckMsgIsGroup"
                  color="primary"
                  onChange={handleSwitchChange("CheckMsgIsGroup")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.SendGreetingAccepted === "enabled"}
                  name="SendGreetingAccepted"
                  color="primary"
                  onChange={handleSwitchChange("SendGreetingAccepted")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.sendQueuePosition === "enabled"}
                  name="sendQueuePosition"
                  color="primary"
                  onChange={handleSwitchChange("sendQueuePosition")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.settingsUserRandom === "enabled"}
                  name="settingsUserRandom"
                  color="primary"
                  onChange={handleSwitchChange("settingsUserRandom")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.userRating === "enabled"}
                  name="userRating"
                  color="primary"
                  onChange={handleSwitchChange("userRating")}
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

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableReasonWhenCloseTicket === "enabled"}
                  name="enableReasonWhenCloseTicket"
                  color="primary"
                  onChange={handleSwitchChange("enableReasonWhenCloseTicket")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableQueueWhenCloseTicket === "enabled"}
                  name="enableQueueWhenCloseTicket"
                  color="primary"
                  onChange={handleSwitchChange("enableQueueWhenCloseTicket")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableTagsWhenCloseTicket === "enabled"}
                  name="enableTagsWhenCloseTicket"
                  color="primary"
                  onChange={handleSwitchChange("enableTagsWhenCloseTicket")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.displayProfileImages === "enabled"}
                  name="displayProfileImages"
                  color="primary"
                  onChange={handleSwitchChange("displayProfileImages")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableTicketValueAndSku === "enabled"}
                  name="enableTicketValueAndSku"
                  color="primary"
                  onChange={handleSwitchChange("enableTicketValueAndSku")}
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
            <FormControlLabel control={
              <AnimatedSwitch
                style={switchAnimation}
                checked={configs.displayContactInfo === "enabled"}
                name="displayContactInfo"
                color="primary"
                onChange={handleSwitchChange("displayContactInfo")}
                disabled={configs.displayBusinessInfo === "enabled"}
              />
            }
              label={i18n.t("optionsPage.displayContactInfo")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.displayContactInfoHelp")}
            {configs.displayBusinessInfo === "enabled" && (
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.displayBusinessInfo === "enabled"}
                  name="displayBusinessInfo"
                  color="primary"
                  onChange={handleSwitchChange("displayBusinessInfo")}
                  disabled={configs.displayContactInfo === "enabled"}
                />
              }
              label={i18n.t("optionsPage.displayBusinessInfo")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.displayBusinessInfoHelp")}
            {configs.displayContactInfo === "enabled" && (
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableSaveCommonContacts === "enabled"}
                  name="enableSaveCommonContacts"
                  color="primary"
                  onChange={handleSwitchChange("enableSaveCommonContacts")}
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
                  value={configs.scheduleType}
                  size="small"
                  onChange={handleSelectChange("scheduleType")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.SettingsTransfTicket === "enabled"}
                  name="SettingsTransfTicket"
                  color="primary"
                  onChange={handleSwitchChange("SettingsTransfTicket")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.sendGreetingMessageOneQueues === "enabled"}
                  name="sendGreetingMessageOneQueues"
                  color="primary"
                  onChange={handleSwitchChange("sendGreetingMessageOneQueues")}
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
                  value={configs.quickMessages}
                  size="small"
                  onChange={handleSelectChange("quickMessages")}
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
    configs,
    theme,
    user,
    switchAnimation,
    handleSwitchChange,
    handleSelectChange
  ]);

  // Componente de configurações de integrações memoizado
  const IntegrationsSection = useMemo(() => (
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableOfficialWhatsapp === "enabled"}
                  name="enableOfficialWhatsapp"
                  color="primary"
                  onChange={handleSwitchChange("enableOfficialWhatsapp")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableMetaPixel === "enabled"}
                  name="enableMetaPixel"
                  color="primary"
                  onChange={handleSwitchChange("enableMetaPixel")}
                />
              }
              label={i18n.t("optionsPage.enableMetaPixel")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableMetaPixelHelp")}
          </FormHelperText>

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
                  value={configs.metaPixelId}
                  onChange={handleInputChange("metaPixelId")}
                  size="small"
                />
              </Grid>
            </Grid>
            <FormHelperText sx={{ mt: 1, mb: 2 }}>
              {i18n.t("optionsPage.metaPixelIdHelp")}
            </FormHelperText>
            <Button
              onClick={onHandleSaveMetaPixelId}
              startIcon={<SaveIcon />}
              variant="contained"
              size="small"
              color="primary"
              disabled={loadingSections.meta}
            >
              {loadingSections.meta ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                i18n.t("optionsPage.saveMetaPixelSettings")
              )}
            </Button>
          </Box>
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
                  value={configs.openAiModel}
                  onChange={handleSelectChange("openAiModel")}
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
                  <AnimatedSwitch
                    style={switchAnimation}
                    checked={configs.enableAudioTranscriptions === "enabled"}
                    name="enableAudioTranscriptions"
                    color="primary"
                    onChange={handleEnableAudioTranscriptions}
                  />
                }
                label={i18n.t("optionsPage.enableAudioTranscriptions") || "Ativar transcrição de áudio"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableAudioTranscriptionsHelp") || "Ativa a transcrição de áudio utilizando o serviço da OpenAI"}
            </FormHelperText>
          </Box>

          {configs.enableAudioTranscriptions === "enabled" && (
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
                    value={configs.openAiKey}
                    onChange={handleInputChange("openAiKey")}
                    size="small"
                    type="password"
                    InputProps={{
                      endAdornment: (
                        <Box>
                          {configs.openAiKey && (
                            <Tooltip title={i18n.t("optionsPage.copyApiKey") || "Copiar chave"}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  copyToClipboard(configs.openAiKey);
                                  toast.success(i18n.t("optionsPage.apiKeyCopied") || "Chave copiada com sucesso!");
                                }}
                              >
                                <FileCopyIcon />
                              </IconButton>
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
              <Button
                onClick={onHandleSaveOpenAiKey}
                startIcon={<SaveIcon />}
                variant="contained"
                size="small"
                color="primary"
                disabled={loadingSections.openai}
              >
                {loadingSections.openai ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  i18n.t("optionsPage.saveOpenAiKey") || "Salvar chave da API"
                )}
              </Button>
            </Box>
          )}
        </Box>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
            >
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 28, height: 28 }}>
                <FontAwesomeIcon icon={faServer} size="xs" />
              </Avatar>
            </StyledBadge>
            <Box ml={1}>UPSix</Box>
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableUPSix === "enabled"}
                  name="enableUPSix"
                  color="primary"
                  onChange={handleSwitchChange("enableUPSix")}
                />
              }
              label={i18n.t("optionsPage.enableUPSix")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableUPSixHelp")}
          </FormHelperText>

          {configs.enableUPSix === "enabled" && (
            <Box sx={{ mt: 2, pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <AnimatedSwitch
                      style={switchAnimation}
                      checked={configs.enableUPSixWebphone === "enabled"}
                      name="enableUPSixWebphone"
                      color="primary"
                      onChange={handleSwitchChange("enableUPSixWebphone")}
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
                    <AnimatedSwitch
                      style={switchAnimation}
                      checked={configs.enableUPSixNotifications === "enabled"}
                      name="enableUPSixNotifications"
                      color="primary"
                      onChange={handleSwitchChange("enableUPSixNotifications")}
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
    configs,
    theme,
    switchAnimation,
    handleSwitchChange,
    handleInputChange,
    handleSelectChange,
    handleEnableAudioTranscriptions,
    onHandleSaveOpenAiKey,
    onHandleSaveMetaPixelId,
    loadingSections.openai,
    loadingSections.meta
  ]);

  // Componente de configurações avançadas memoizado
  const AdvancedSection = useMemo(() => (
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
                  value={configs.downloadLimit}
                  onChange={handleSelectChange("downloadLimit")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.enableSatisfactionSurvey === "enabled"}
                  name="enableSatisfactionSurvey"
                  color="primary"
                  onChange={handleSwitchChange("enableSatisfactionSurvey")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={configs.callSuport === "enabled"}
                  name="callSuport"
                  color="primary"
                  onChange={handleSwitchChange("callSuport")}
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

      {configs.callSuport === "enabled" && (
        <OnlyForSuperUser
          user={user}
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
                      value={configs.waSuportType}
                      onChange={handleInputChange("waSuportType")}
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
                      value={configs.msgSuportType}
                      onChange={handleInputChange("msgSuportType")}
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
                value={configs.smtpauthType}
                onChange={handleInputChange("smtpauthType")}
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
                value={configs.usersmtpauthType}
                onChange={handleInputChange("usersmtpauthType")}
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
                value={configs.clientsecretsmtpauthType}
                onChange={handleInputChange("clientsecretsmtpauthType")}
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
                value={configs.smtpPortType}
                onChange={handleInputChange("smtpPortType")}
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
    configs,
    theme,
    user,
    switchAnimation,
    handleSwitchChange,
    handleInputChange,
    handleSelectChange
  ]);

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <SaveButton
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
          onClick={saveAllSettings}
          disabled={!hasChanges || loading}
        >
          {i18n.t("optionsPage.saveAll")}
        </SaveButton>
      </Box>

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
        {currentTab === 0 && GeneralConfigSection}
        {currentTab === 1 && IntegrationsSection}
        {currentTab === 2 && AdvancedSection}
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
  enableReasonWhenCloseTicketChanged: PropTypes.func
};

Options.defaultProps = {
  settings: [],
  scheduleTypeChanged: () => { },
  enableReasonWhenCloseTicketChanged: () => { }
};

// Memo para evitar renderizações desnecessárias
export default React.memo(Options);