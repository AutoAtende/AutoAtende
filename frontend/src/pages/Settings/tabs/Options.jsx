import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
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
  useMediaQuery,
  Card,
  CardContent,
  Tooltip,
  Stack,
  Divider,
  Alert,
  Avatar,
  Tabs,
  Tab,
  Chip,
  Badge
} from "@mui/material";
import { styled, useTheme, alpha } from '@mui/material/styles';
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Support as SupportIcon,
  FileCopy as FileCopyIcon,
  Refresh as RefreshIcon,
  Delete,
  AssessmentOutlined,
  Person as PersonIcon,
  SettingsApplications as AppSettingsIcon,
  LocalOffer as TagIcon
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRobot, 
  faServer, 
  faEnvelope, 
  faFileExport, 
  faTicketAlt, 
  faUsers, 
  faDatabase,
  faGears,
  faCopy
} from "@fortawesome/free-solid-svg-icons";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";
import useSettings from "../../../hooks/useSettings";
import { toast } from "../../../helpers/toast";
import OnlyForSuperUser from "../../../components/OnlyForSuperUser";
import { copyToClipboard } from "../../../helpers/copyToClipboard";
import { GlobalContext } from "../../../context/GlobalContext";
import { useLoading } from "../../../hooks/useLoading";
import { generateSecureToken } from "../../../helpers/generateSecureToken";
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

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  }
}));

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

const Options = ({ settings, enableReasonWhenCloseTicketChanged }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const { update } = useSettings();
  const { setMakeRequestSettings } = useContext(GlobalContext);
  const { Loading } = useLoading();

  // Estados locais para armazenar configurações
  const [currentTab, setCurrentTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Configurações da IA
  const [openAiModel, setOpenAiModel] = useState("gpt-4");
  const [enableAudioTranscriptions, setEnableAudioTranscriptions] = useState("disabled");
  const [openAiKey, setOpenAiKey] = useState("");

  // Configurações gerais
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [quickMessages, setQuickMessages] = useState("company");
  const [allowSignup, setAllowSignup] = useState("disabled");
  const [CheckMsgIsGroup, setCheckMsgIsGroup] = useState("disabled");
  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("disabled");
  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("disabled");
  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("enabled");
  const [apiToken, setApiToken] = useState("");
  const [downloadLimit, setDownloadLimit] = useState("64");
  const [enableGLPI, setEnableGLPI] = useState("disabled");
  const [sendEmailWhenRegister, setSendEmailWhenRegister] = useState("disabled");
  const [sendMessageWhenRegister, setSendMessageWhenRegister] = useState("disabled");
  const [enableReasonWhenCloseTicket, setEnableReasonWhenCloseTicket] = useState("disabled");
  const [enableUseOneTicketPerConnection, setEnableUseOneTicketPerConnection] = useState("disabled");
  const [callSuport, setCallSuport] = useState("enabled");
  const [trialExpiration, setTrialExpiration] = useState("3");
  const [displayContactInfo, setDisplayContactInfo] = useState("enabled");
  const [enableTicketValueAndSku, setEnableTicketValueAndSku] = useState("disabled");
  const [sendQueuePosition, setSendQueuePosition] = useState("disabled");
  const [settingsUserRandom, setSettingsUserRandom] = useState("disabled");
  const [displayBusinessInfo, setDisplayBusinessInfo] = useState("disabled");
  const [initialPage, setInitialPage] = useState("login");
  const [enableSaveCommonContacts, setEnableSaveCommonContacts] = useState("disabled");
  const [displayProfileImages, setDisplayProfileImages] = useState("enabled");
  const [enableQueueWhenCloseTicket, setEnableQueueWhenCloseTicket] = useState("disabled");
  const [enableTagsWhenCloseTicket, setEnableTagsWhenCloseTicket] = useState("disabled");
  const [enableSatisfactionSurvey, setEnableSatisfactionSurvey] = useState("disabled");

  // Integrações
  const [enableUPSix, setEnableUPSix] = useState("disabled");
  const [enableUPSixWebphone, setEnableUPSixWebphone] = useState("disabled");
  const [enableUPSixNotifications, setEnableUPSixNotifications] = useState("disabled");
  const [enableOfficialWhatsapp, setEnableOfficialWhatsapp] = useState("disabled");
  const [enableMetaPixel, setEnableMetaPixel] = useState("disabled");
  const [metaPixelId, setMetaPixelId] = useState('');

  // SMTP
  const [smtpauthType, setUrlSmtpauthType] = useState("");
  const [usersmtpauthType, setUserSmtpauthType] = useState("");
  const [clientsecretsmtpauthType, setClientSecrectSmtpauthType] = useState("");
  const [smtpPortType, setSmtpPortType] = useState("");

  // Suporte
  const [waSuportType, setWaSuportType] = useState("");
  const [msgSuportType, setMsgSuportType] = useState("");

  // Efeito de animação para os switches
  const switchAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { tension: 300, friction: 20 }
  });

  // Carregar configurações quando o componente for montado
  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const loadSettings = () => {
        // Configurações da IA
        const openaiModelSetting = settings.find((s) => s.key === "openaiModel");
        if (openaiModelSetting) setOpenAiModel(openaiModelSetting?.value || "gpt-4");

        const enableAudioTranscriptionsSetting = settings.find((s) => s.key === "enableAudioTranscriptions");
        if (enableAudioTranscriptionsSetting) setEnableAudioTranscriptions(enableAudioTranscriptionsSetting?.value || "disabled");

        const openAiKeySetting = settings.find((s) => s.key === "openAiKey");
        if (openAiKeySetting) setOpenAiKey(openAiKeySetting?.value || "");

        // Integrações
        loadIntegrationSettings();

        // Configurações gerais
        loadGeneralSettings();
      };

      loadSettings();
    }
  }, [settings]);

  // Função auxiliar para carregar configurações de integração
  const loadIntegrationSettings = () => {
    const enableQueueWhenCloseTicket = settings.find(s => s.key === "enableQueueWhenCloseTicket");
    if (enableQueueWhenCloseTicket) setEnableQueueWhenCloseTicket(enableQueueWhenCloseTicket?.value || "disabled");

    const enableTagsWhenCloseTicket = settings.find(s => s.key === "enableTagsWhenCloseTicket");
    if (enableTagsWhenCloseTicket) setEnableTagsWhenCloseTicket(enableTagsWhenCloseTicket?.value || "disabled");

    const enableSatisfactionSurveySetting = settings.find((s) => s.key === "enableSatisfactionSurvey");
    if (enableSatisfactionSurveySetting) setEnableSatisfactionSurvey(enableSatisfactionSurveySetting?.value || "disabled");

    const displayProfileImages = settings.find((s) => s.key === "displayProfileImages");
    if (displayProfileImages) {
      setDisplayProfileImages(displayProfileImages?.value || "enabled");
    }

    const enableMetaPixelSetting = settings.find((s) => s.key === "enableMetaPixel");
    if (enableMetaPixelSetting) setEnableMetaPixel(enableMetaPixelSetting?.value || "disabled");

    const metaPixelIdSetting = settings.find((s) => s.key === "metaPixelId");
    if (metaPixelIdSetting) setMetaPixelId(metaPixelIdSetting?.value || "");

    const enableOfficialWhatsappSetting = settings.find((s) => s.key === "enableOfficialWhatsapp");
    if (enableOfficialWhatsappSetting) setEnableOfficialWhatsapp(enableOfficialWhatsappSetting?.value || "disabled");



    const enableUPSix = settings.find((s) => s.key === "enableUPSix");
    if (enableUPSix) setEnableUPSix(enableUPSix?.value || "disabled");

    const enableUPSixWebphone = settings.find((s) => s.key === "enableUPSixWebphone");
    if (enableUPSixWebphone) setEnableUPSixWebphone(enableUPSixWebphone?.value || "disabled");

    const enableUPSixNotifications = settings.find((s) => s.key === "enableUPSixNotifications");
    if (enableUPSixNotifications) setEnableUPSixNotifications(enableUPSixNotifications?.value || "disabled");

    const enableSaveCommonContactsSetting = settings.find((s) => s.key === "enableSaveCommonContacts");
    if (enableSaveCommonContactsSetting) setEnableSaveCommonContacts(enableSaveCommonContactsSetting?.value || "disabled");
  };

  // Função auxiliar para carregar configurações gerais
  const loadGeneralSettings = () => {
    const initialPageSetting = settings.find((s) => s.key === "initialPage");
    if (initialPageSetting) setInitialPage(initialPageSetting?.value || "login");

    const sendQueuePosition = settings.find((s) => s.key === "sendQueuePosition");
    if (sendQueuePosition) setSendQueuePosition(sendQueuePosition?.value || "disabled");

    const settingsUserRandom = settings.find((s) => s.key === "settingsUserRandom");
    if (settingsUserRandom) setSettingsUserRandom(settingsUserRandom?.value || "disabled");

    const displayBusinessInfo = settings.find((s) => s.key === "displayBusinessInfo");
    if (displayBusinessInfo) setDisplayBusinessInfo(displayBusinessInfo?.value || "disabled");

    const enableReasonWhenCloseTicket = settings.find(s => s.key === "enableReasonWhenCloseTicket");
    if (enableReasonWhenCloseTicket) setEnableReasonWhenCloseTicket(enableReasonWhenCloseTicket?.value || "disabled");

    const quickMessages = settings.find((s) => s.key === "quickMessages");
    if (quickMessages) setQuickMessages(quickMessages?.value || "company");

    const sendEmailSetting = settings.find(s => s.key === "sendEmailWhenRegister");
    if (sendEmailSetting) setSendEmailWhenRegister(sendEmailSetting?.value || "disabled");

    const sendMessageSetting = settings.find(s => s.key === "sendMessageWhenRegister");
    if (sendMessageSetting) setSendMessageWhenRegister(sendMessageSetting?.value || "disabled");

    const userRating = settings.find((s) => s.key === "userRating");
    if (userRating) setUserRating(userRating?.value || "disabled");

    const scheduleType = settings.find((s) => s.key === "scheduleType");
    if (scheduleType) setScheduleType(scheduleType?.value || "disabled");

    const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
    if (CheckMsgIsGroup) setCheckMsgIsGroup(CheckMsgIsGroup?.value || "disabled");

    const downloadLimit = settings.find((s) => s.key === "downloadLimit");
    if (downloadLimit) setDownloadLimit(downloadLimit?.value || "64");

    const enableTicketValueAndSku = settings.find((s) => s.key === "enableTicketValueAndSku");
    if (enableTicketValueAndSku) setEnableTicketValueAndSku(enableTicketValueAndSku?.value || "disabled");

    const SendGreetingAccepted = settings.find((s) => s.key === "sendGreetingAccepted");
    if (SendGreetingAccepted) setSendGreetingAccepted(SendGreetingAccepted?.value || "disabled");

    const SettingsTransfTicket = settings.find((s) => s.key === "sendMsgTransfTicket");
    if (SettingsTransfTicket) setSettingsTransfTicket(SettingsTransfTicket?.value || "disabled");

    const allowSignup = settings.find((s) => s.key === "allowSignup");
    if (allowSignup) setAllowSignup(allowSignup?.value || "disabled");

    const sendGreetingMessageOneQueues = settings.find((s) => s.key === "sendGreetingMessageOneQueues");
    if (sendGreetingMessageOneQueues) setSendGreetingMessageOneQueues(sendGreetingMessageOneQueues?.value || "enabled");

    const callSuport = settings.find((s) => s.key === "callSuport");
    if (callSuport) setCallSuport(callSuport?.value || "enabled");

    const displayContactInfo = settings.find((s) => s.key === "displayContactInfo");
    if (displayContactInfo) setDisplayContactInfo(displayContactInfo?.value || "enabled");

    const trialExpiration = settings.find((s) => s.key === "trialExpiration");
    if (trialExpiration) setTrialExpiration(trialExpiration?.value || "3");

    const enableUseOneTicketPerConnection = settings.find((s) => s.key === "enableUseOneTicketPerConnection");
    if (enableUseOneTicketPerConnection) setEnableUseOneTicketPerConnection(enableUseOneTicketPerConnection?.value || "disabled");

    const smtpauthType = settings.find((s) => s.key === "smtpauth");
    if (smtpauthType) setUrlSmtpauthType(smtpauthType?.value || "");

    const usersmtpauthType = settings.find((s) => s.key === "usersmtpauth");
    if (usersmtpauthType) setUserSmtpauthType(usersmtpauthType?.value || "");

    const clientsecretsmtpauthType = settings.find((s) => s.key === "clientsecretsmtpauth");
    if (clientsecretsmtpauthType) setClientSecrectSmtpauthType(clientsecretsmtpauthType?.value || "");

    const smtpPortType = settings.find((s) => s.key === "smtpport");
    if (smtpPortType) setSmtpPortType(smtpPortType?.value || "");

    const waSuportType = settings.find((s) => s.key === "wasuport");
    if (waSuportType) setWaSuportType(waSuportType?.value || "");

    const msgSuportType = settings.find((s) => s.key === "msgsuport");
    if (msgSuportType) setMsgSuportType(msgSuportType?.value || "");
  };

  // Função genérica para atualizar configurações - CORRIGIDA
  const updateSetting = async (key, value) => {
    try {
      setHasChanges(true);
      await update({ key, value });
      toast.success(i18n.t("optionsPage.successMessage"));
      setMakeRequestSettings(Math.random());
      return true;
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      toast.error("Erro ao atualizar configuração");
      return false;
    }
  };

  // Handlers otimizados para evitar re-renders - CORRIGIDOS
  const handleEnableAudioTranscriptions = useCallback(async (value) => {
    setEnableAudioTranscriptions(value);
    await updateSetting("enableAudioTranscriptions", value);
  }, []);

  const handleChangeOpenAiKey = useCallback(async (value) => {
    setOpenAiKey(value);
    await updateSetting("openAiKey", value);
  }, []);

  const onHandleSaveOpenAiKey = useCallback(async () => {
    try {
      Loading.turnOn();
      await handleChangeOpenAiKey(openAiKey);
      toast.success("Chave OpenAI salva com sucesso");
    } catch (error) {
      toast.error(error);
    } finally {
      Loading.turnOff();
    }
  }, [openAiKey, handleChangeOpenAiKey, Loading]);

  // Handler para OpenAI Model - CORRIGIDO
  const handleOpenAiModel = useCallback(async (value) => {
    setOpenAiModel(value);
    await updateSetting("openaiModel", value);
  }, []);

  // Handler para Trial Expiration - CORRIGIDO
  const handleTrialExpiration = useCallback(async (value) => {
    setTrialExpiration(value);
    await updateSetting("trialExpiration", value);
  }, []);

  // Handler para Initial Page - CORRIGIDO
  const handleInitialPage = useCallback(async (value) => {
    setInitialPage(value);
    await updateSetting("initialPage", value);
  }, []);

  // Handler para Quick Messages - CORRIGIDO
  const handleQuickMessages = useCallback(async (value) => {
    setQuickMessages(value);
    await updateSetting("quickMessages", value);
  }, []);


  // Handler para Download Limit - CORRIGIDO
  const handleDownloadLimit = useCallback(async (value) => {
    setDownloadLimit(value);
    await updateSetting("downloadLimit", value);
  }, []);

  const handleDisplayProfileImages = async (value) => {
    setDisplayProfileImages(value);
    await updateSetting("displayProfileImages", value);
  };

  const handleEnableSatisfactionSurvey = async (value) => {
    setEnableSatisfactionSurvey(value);
    await updateSetting("enableSatisfactionSurvey", value);
  };

  const handleEnableSaveCommonContacts = async (value) => {
    setEnableSaveCommonContacts(value);
    await updateSetting("enableSaveCommonContacts", value);
  };

  const handleEnableUseOneTicketPerConnection = async (value) => {
    setEnableUseOneTicketPerConnection(value);
    await updateSetting("enableUseOneTicketPerConnection", value);
  };

  // Handlers para configurações exclusivas de fechamento de ticket
  const handleEnableQueueWhenCloseTicket = async (value) => {
    setEnableQueueWhenCloseTicket(value);
    await updateSetting("enableQueueWhenCloseTicket", value);

    if (value === "enabled") {
      if (enableTagsWhenCloseTicket === "enabled") {
        setEnableTagsWhenCloseTicket("disabled");
        await updateSetting("enableTagsWhenCloseTicket", "disabled");
      }
      if (enableReasonWhenCloseTicket === "enabled") {
        setEnableReasonWhenCloseTicket("disabled");
        await updateSetting("enableReasonWhenCloseTicket", "disabled");
        if (typeof enableReasonWhenCloseTicketChanged === "function") {
          enableReasonWhenCloseTicketChanged("disabled");
        }
      }
      toast.info("Apenas uma opção de fechamento pode estar ativa por vez");
    }
  };

  const handleEnableTagsWhenCloseTicket = async (value) => {
    setEnableTagsWhenCloseTicket(value);
    await updateSetting("enableTagsWhenCloseTicket", value);

    if (value === "enabled") {
      if (enableQueueWhenCloseTicket === "enabled") {
        setEnableQueueWhenCloseTicket("disabled");
        await updateSetting("enableQueueWhenCloseTicket", "disabled");
      }
      if (enableReasonWhenCloseTicket === "enabled") {
        setEnableReasonWhenCloseTicket("disabled");
        await updateSetting("enableReasonWhenCloseTicket", "disabled");
        if (typeof enableReasonWhenCloseTicketChanged === "function") {
          enableReasonWhenCloseTicketChanged("disabled");
        }
      }
      toast.info("Apenas uma opção de fechamento pode estar ativa por vez");
    }
  };

  const handleEnableReasonWhenCloseTicket = async (value) => {
    setEnableReasonWhenCloseTicket(value);
    await updateSetting("enableReasonWhenCloseTicket", value);

    if (value === "enabled") {
      if (enableQueueWhenCloseTicket === "enabled") {
        setEnableQueueWhenCloseTicket("disabled");
        await updateSetting("enableQueueWhenCloseTicket", "disabled");
      }
      if (enableTagsWhenCloseTicket === "enabled") {
        setEnableTagsWhenCloseTicket("disabled");
        await updateSetting("enableTagsWhenCloseTicket", "disabled");
      }
      toast.info("Apenas uma opção de fechamento pode estar ativa por vez");
    }

    if (typeof enableReasonWhenCloseTicketChanged === "function") {
      enableReasonWhenCloseTicketChanged(value);
    }
  };

  // Demais handlers (mantendo todos os originais)
  const handleDisplayBusinessInfo = async (value) => {
    setDisplayBusinessInfo(value);
    await updateSetting("displayBusinessInfo", value);
  };

  const handleEnableMetaPixel = async (value) => {
    setEnableMetaPixel(value);
    await updateSetting("enableMetaPixel", value);
  };

  const handleChangeMetaPixelId = async (value) => {
    setMetaPixelId(value);
    await updateSetting("metaPixelId", value);
  };

  const onHandleSaveMetaPixelId = async () => {
    try {
      Loading.turnOn();
      await handleChangeMetaPixelId(metaPixelId);
      toast.success("Meta Pixel ID salvo com sucesso");
    } catch (error) {
      toast.error(error);
    } finally {
      Loading.turnOff();
    }
  };

  const handleEnableUPSix = async (value) => {
    setEnableUPSix(value);
    await updateSetting("enableUPSix", value);
  };

  const handleEnableUPSixWebphone = async (value) => {
    setEnableUPSixWebphone(value);
    await updateSetting("enableUPSixWebphone", value);
  };

  const handleEnableUPSixNotifications = async (value) => {
    setEnableUPSixNotifications(value);
    await updateSetting("enableUPSixNotifications", value);
  };

  

  const handleEnableOfficialWhatsapp = async (value) => {
    setEnableOfficialWhatsapp(value);
    await updateSetting("enableOfficialWhatsapp", value);
  };

  const handleSendEmailWhenRegister = async (value) => {
    setSendEmailWhenRegister(value);
    await updateSetting("sendEmailWhenRegister", value);
  };

  const handleSendMessageWhenRegister = async (value) => {
    setSendMessageWhenRegister(value);
    await updateSetting("sendMessageWhenRegister", value);
  };

  const handleSendQueuePosition = async (value) => {
    setSendQueuePosition(value);
    await updateSetting("sendQueuePosition", value);
  };

  const handleSettingsUserRandom = async (value) => {
    setSettingsUserRandom(value);
    await updateSetting("settingsUserRandom", value);
  };

  const handleChangeUserRating = async (value) => {
    setUserRating(value);
    await updateSetting("userRating", value);
  };

  const handleAllowSignup = async (value) => {
    setAllowSignup(value);
    await updateSetting("allowSignup", value);
  };

  const handleGroupType = async (value) => {
    setCheckMsgIsGroup(value);
    await updateSetting("CheckMsgIsGroup", value);
  };

  const handleSendGreetingAccepted = async (value) => {
    setSendGreetingAccepted(value);
    await updateSetting("sendGreetingAccepted", value);
  };

  const handleSettingsTransfTicket = async (value) => {
    setSettingsTransfTicket(value);
    await updateSetting("sendMsgTransfTicket", value);
  };

  const handleChangeWaSuport = async (value) => {
    setWaSuportType(value);
    await updateSetting("wasuport", value);
  };

  const handleChangeMsgSuport = async (value) => {
    setMsgSuportType(value);
    await updateSetting("msgsuport", value);
  };

  const handleSendGreetingMessageOneQueues = async (value) => {
    setSendGreetingMessageOneQueues(value);
    await updateSetting("sendGreetingMessageOneQueues", value);
  };

  const handleCallSuport = async (value) => {
    setCallSuport(value);
    await updateSetting("callSuport", value);
  };

  const handleDisplayContactInfo = async (value) => {
    setDisplayContactInfo(value);
    await updateSetting("displayContactInfo", value);
  };

  const handleEnableTicketValueAndSku = async (value) => {
    setEnableTicketValueAndSku(value);
    await updateSetting("enableTicketValueAndSku", value);
  };

  const handleChangeUrlSmtpauth = async (value) => {
    setUrlSmtpauthType(value);
    await updateSetting("smtpauth", value);
  };

  const handleChangeUserSmptauth = async (value) => {
    setUserSmtpauthType(value);
    await updateSetting("usersmtpauth", value);
  };

  const handleChangeClientSecrectSmtpauth = async (value) => {
    setClientSecrectSmtpauthType(value);
    await updateSetting("clientsecretsmtpauth", value);
  };

  const handleChangeSmtpPort = async (value) => {
    setSmtpPortType(value);
    await updateSetting("smtpport", value);
  };

  // Função para salvar todas as configurações
  const saveAllSettings = async () => {
    try {
      Loading.turnOn();
      toast.success("Todas as configurações foram salvas");
      setHasChanges(false);
    } catch (error) {
      toast.error(error);
    } finally {
      Loading.turnOff();
    }
  };

  // Handler para mudança de tabs
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Componente de configurações gerais
  const GeneralConfigSection = () => (
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
                        value={trialExpiration}
                        size="small"
                        onChange={(e) => handleTrialExpiration(e.target.value)}
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
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <TextField
                        select
                        fullWidth
                        label={i18n.t("optionsPage.initialPage")}
                        value={initialPage}
                        size="small"
                        onChange={(e) => handleInitialPage(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <Box mr={1}>
                              <AppSettingsIcon fontSize="small" color="primary" />
                            </Box>
                          ),
                        }}
                      >
                        <MenuItem value="home">{i18n.t("optionsPage.homePage")}</MenuItem>
                        <MenuItem value="login">{i18n.t("optionsPage.loginPage")}</MenuItem>
                      </TextField>
                      <FormHelperText>
                        {i18n.t("optionsPage.initialPageHelp")}
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
                        checked={allowSignup === "enabled"}
                        name="allowSignup"
                        color="primary"
                        onChange={(e) => handleAllowSignup(e.target.checked ? "enabled" : "disabled")}
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
                        checked={sendEmailWhenRegister === "enabled"}
                        name="sendEmailWhenRegister"
                        color="primary"
                        onChange={(e) => handleSendEmailWhenRegister(e.target.checked ? "enabled" : "disabled")}
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
                        checked={sendMessageWhenRegister === "enabled"}
                        name="sendMessageWhenRegister"
                        color="primary"
                        onChange={(e) => handleSendMessageWhenRegister(e.target.checked ? "enabled" : "disabled")}
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
                  checked={CheckMsgIsGroup === "enabled"}
                  name="CheckMsgIsGroup"
                  color="primary"
                  onChange={(e) => handleGroupType(e.target.checked ? "enabled" : "disabled")}
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
                  checked={enableUseOneTicketPerConnection === "enabled"}
                  name="enableUseOneTicketPerConnection"
                  color="primary"
                  onChange={(e) => handleEnableUseOneTicketPerConnection(e.target.checked ? "enabled" : "disabled")}
                />
              }
              label="Um ticket por conexão"
            />
          </FormGroup>
          <FormHelperText>
            Permite apenas um ticket ativo por conexão
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
                  checked={SendGreetingAccepted === "enabled"}
                  name="SendGreetingAccepted"
                  color="primary"
                  onChange={(e) => handleSendGreetingAccepted(e.target.checked ? "enabled" : "disabled")}
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
                  checked={sendQueuePosition === "enabled"}
                  name="sendQueuePosition"
                  color="primary"
                  onChange={(e) => handleSendQueuePosition(e.target.checked ? "enabled" : "disabled")}
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
                  checked={settingsUserRandom === "enabled"}
                  name="settingsUserRandom"
                  color="primary"
                  onChange={(e) => handleSettingsUserRandom(e.target.checked ? "enabled" : "disabled")}
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
                  checked={userRating === "enabled"}
                  name="userRating"
                  color="primary"
                  onChange={(e) => handleChangeUserRating(e.target.checked ? "enabled" : "disabled")}
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
                  checked={enableReasonWhenCloseTicket === "enabled"}
                  name="enableReasonWhenCloseTicket"
                  color="primary"
                  onChange={(e) => handleEnableReasonWhenCloseTicket(e.target.checked ? "enabled" : "disabled")}
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
                  checked={enableQueueWhenCloseTicket === "enabled"}
                  name="enableQueueWhenCloseTicket"
                  color="primary"
                  onChange={(e) => handleEnableQueueWhenCloseTicket(e.target.checked ? "enabled" : "disabled")}
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
                  checked={enableTagsWhenCloseTicket === "enabled"}
                  name="enableTagsWhenCloseTicket"
                  color="primary"
                  onChange={(e) => handleEnableTagsWhenCloseTicket(e.target.checked ? "enabled" : "disabled")}
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
                  checked={displayProfileImages === "enabled"}
                  name="displayProfileImages"
                  color="primary"
                  onChange={(e) =>
                    handleDisplayProfileImages(e.target.checked ? "enabled" : "disabled")
                  }
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
                  checked={enableTicketValueAndSku === "enabled"}
                  name="enableTicketValueAndSku"
                  color="primary"
                  onChange={(e) => handleEnableTicketValueAndSku(e.target.checked ? "enabled" : "disabled")}
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
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={displayContactInfo === "enabled"}
                  name="displayContactInfo"
                  color="primary"
                  onChange={(e) => handleDisplayContactInfo(e.target.checked ? "enabled" : "disabled")}
                  disabled={displayBusinessInfo === "enabled"}
                />
              }
              label={i18n.t("optionsPage.displayContactInfo")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.displayContactInfoHelp")}
            {displayBusinessInfo === "enabled" && (
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
                  checked={displayBusinessInfo === "enabled"}
                  name="displayBusinessInfo"
                  color="primary"
                  onChange={(e) => handleDisplayBusinessInfo(e.target.checked ? "enabled" : "disabled")}
                  disabled={displayContactInfo === "enabled"}
                />
              }
              label={i18n.t("optionsPage.displayBusinessInfo")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.displayBusinessInfoHelp")}
            {displayContactInfo === "enabled" && (
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
                  checked={enableSaveCommonContacts === "enabled"}
                  name="enableSaveCommonContacts"
                  color="primary"
                  onChange={(e) => handleEnableSaveCommonContacts(e.target.checked ? "enabled" : "disabled")}
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
          <FormGroup>
            <FormControlLabel
              control={
                <AnimatedSwitch
                  style={switchAnimation}
                  checked={SettingsTransfTicket === "enabled"}
                  name="SettingsTransfTicket"
                  color="primary"
                  onChange={(e) => handleSettingsTransfTicket(e.target.checked ? "enabled" : "disabled")}
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
                  checked={sendGreetingMessageOneQueues === "enabled"}
                  name="sendGreetingMessageOneQueues"
                  color="primary"
                  onChange={(e) => handleSendGreetingMessageOneQueues(e.target.checked ? "enabled" : "disabled")}
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
                  value={quickMessages}
                  size="small"
                  onChange={(e) => handleQuickMessages(e.target.value)}
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
  );

  // Componente de configurações de integrações
  const IntegrationsSection = () => (
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
                  checked={enableOfficialWhatsapp === "enabled"}
                  name="enableOfficialWhatsapp"
                  color="primary"
                  onChange={(e) => handleEnableOfficialWhatsapp(e.target.checked ? "enabled" : "disabled")}
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
                  checked={enableMetaPixel === "enabled"}
                  name="enableMetaPixel"
                  color="primary"
                  onChange={(e) => handleEnableMetaPixel(e.target.checked ? "enabled" : "disabled")}
                />
              }
              label={i18n.t("optionsPage.enableMetaPixel")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableMetaPixelHelp")}
          </FormHelperText>

          {enableMetaPixel === "enabled" && (
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
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
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
              >
                {i18n.t("optionsPage.saveMetaPixelSettings")}
              </Button>
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
                  value={openAiModel}
                  onChange={(e) => handleOpenAiModel(e.target.value)}
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
                    checked={enableAudioTranscriptions === "enabled"}
                    name="enableAudioTranscriptions"
                    color="primary"
                    onChange={(e) => handleEnableAudioTranscriptions(e.target.checked ? "enabled" : "disabled")}
                  />
                }
                label={i18n.t("optionsPage.enableAudioTranscriptions") || "Ativar transcrição de áudio"}
              />
            </FormGroup>
            <FormHelperText>
              {i18n.t("optionsPage.enableAudioTranscriptionsHelp") || "Ativa a transcrição de áudio utilizando o serviço da OpenAI"}
            </FormHelperText>
          </Box>

          {enableAudioTranscriptions === "enabled" && (
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
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    size="small"
                    type="password"
                    InputProps={{
                      endAdornment: (
                        <Box>
                          {openAiKey && (
                            <Tooltip title={i18n.t("optionsPage.copyApiKey") || "Copiar chave"}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  copyToClipboard(openAiKey);
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
              >
                {i18n.t("optionsPage.saveOpenAiKey") || "Salvar chave da API"}
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
                  checked={enableUPSix === "enabled"}
                  name="enableUPSix"
                  color="primary"
                  onChange={(e) => handleEnableUPSix(e.target.checked ? "enabled" : "disabled")}
                />
              }
              label={i18n.t("optionsPage.enableUPSix")}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableUPSixHelp")}
          </FormHelperText>

          {enableUPSix === "enabled" && (
            <Box sx={{ mt: 2, pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <AnimatedSwitch
                      style={switchAnimation}
                      checked={enableUPSixWebphone === "enabled"}
                      name="enableUPSixWebphone"
                      color="primary"
                      onChange={(e) => handleEnableUPSixWebphone(e.target.checked ? "enabled" : "disabled")}
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
                      checked={enableUPSixNotifications === "enabled"}
                      name="enableUPSixNotifications"
                      color="primary"
                      onChange={(e) => handleEnableUPSixNotifications(e.target.checked ? "enabled" : "disabled")}
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
  );

  // Componente de configurações avançadas
  const AdvancedSection = () => (
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
                  value={downloadLimit}
                  onChange={(e) => handleDownloadLimit(e.target.value)}
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
                  checked={enableSatisfactionSurvey === "enabled"}
                  name="enableSatisfactionSurvey"
                  color="primary"
                  onChange={(e) => handleEnableSatisfactionSurvey(e.target.checked ? "enabled" : "disabled")}
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
                  checked={callSuport === "enabled"}
                  name="callSuport"
                  color="primary"
                  onChange={(e) => handleCallSuport(e.target.checked ? "enabled" : "disabled")}
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

      {callSuport === "enabled" && (
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
                      value={waSuportType}
                      onChange={(e) => {
                        if (e.target.value === "" || /^[0-9\b]+$/.test(e.target.value)) {
                          setWaSuportType(e.target.value);
                        }
                      }}
                      onBlur={() => handleChangeWaSuport(waSuportType)}
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
                      value={msgSuportType}
                      onChange={(e) => setMsgSuportType(e.target.value)}
                      onBlur={() => handleChangeMsgSuport(msgSuportType)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.target.blur();
                        }
                      }}
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
                value={smtpauthType}
                onChange={(e) => setUrlSmtpauthType(e.target.value)}
                onBlur={() => handleChangeUrlSmtpauth(smtpauthType)}
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
                value={usersmtpauthType}
                onChange={(e) => setUserSmtpauthType(e.target.value)}
                onBlur={() => handleChangeUserSmptauth(usersmtpauthType)}
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
                value={clientsecretsmtpauthType}
                onChange={(e) => setClientSecrectSmtpauthType(e.target.value)}
                onBlur={() => handleChangeClientSecrectSmtpauth(clientsecretsmtpauthType)}
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
                value={smtpPortType}
                onChange={(e) => setSmtpPortType(e.target.value)}
                onBlur={() => handleChangeSmtpPort(smtpPortType)}
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
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <SaveButton
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveAllSettings}
          disabled={!hasChanges}
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
  enableReasonWhenCloseTicketChanged: PropTypes.func
};

Options.defaultProps = {
  settings: [],
  enableReasonWhenCloseTicketChanged: () => { }
};

export default Options;