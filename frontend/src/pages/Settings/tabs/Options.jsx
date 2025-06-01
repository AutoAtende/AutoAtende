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

import AuthContext from "../../../context/Auth/AuthContext";
import OnlyForSuperUser from "../../../components/OnlyForSuperUser";
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
  const [user] = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);

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
    // Verificação robusta dos dados
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      console.warn("Settings não é um array válido:", settings);
      return;
    }

    try {
      // Criar um mapa de configurações para acesso rápido
      const settingsMap = {};
      settings.forEach(setting => {
        if (setting && setting.key) {
          settingsMap[setting.key] = setting.value;
        }
      });

      // Atualizar o estado com as configurações carregadas
      setConfigState(prevState => {
        const newState = Object.assign({}, prevState);

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
    } catch (error) {
      console.error("Erro ao processar configurações:", error);
    }
  }, [settings]);

  // Atualizar configuração local e notificar alteração
  const handleConfigChange = (key, value, notifyBackend = true) => {
    // Atualizar estado local
    setConfigState(prev => {
      const newState = {};
      Object.keys(prev).forEach(k => {
        newState[k] = k === key ? value : prev[k];
      });
      return newState;
    });

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
        let hasDisabled = false;

        // Desativar as outras opções
        optionsToDisable.forEach(key => {
          if (configState[key] === "enabled") {
            hasDisabled = true;
            handleConfigChange(key, "disabled");
          }
        });

        if (hasDisabled) {
          toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive"));
        }
      }
    }

    handleConfigChange(enabledKey, value);
  };

// Manipulador de mudança de tabs
const handleTabChange = (event, newValue) => {
  setCurrentTab(newValue);
};

// Preparar tabs
const tabs = [
  { label: i18n.t("optionsPage.general") || "Configurações Gerais", icon: <SettingsIcon /> },
  { label: i18n.t("optionsPage.integrations") || "Integrações", icon: <FontAwesomeIcon icon={faServer} /> },
  { label: i18n.t("optionsPage.advanced") || "Avançado", icon: <BuildIcon /> }
];

// Componente de configurações gerais
const GeneralConfigSection = useMemo(() => () => (
  <Box>
    <SectionTitle variant="h6">
      <BusinessIcon color="primary" />
      {i18n.t("optionsPage.general_params") || "Parâmetros Gerais"}
    </SectionTitle>

    <OnlyForSuperUser
      yes={() => (
        <>
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
        </>
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
                checked={configState.CheckMsgIsGroup === "enabled"}
                name="CheckMsgIsGroup"
                color="primary"
                onChange={(e) => handleSwitchChange("CheckMsgIsGroup", e.target.checked)}
              />
            }
            label={i18n.t("optionsPage.ignore") || "Ignorar mensagens de grupos"}
          />
        </FormGroup>
        <FormHelperText>
          {i18n.t("optionsPage.ignoreHelp") || "Ignora mensagens recebidas de grupos do WhatsApp"}
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

    {/* Opções de encerramento de ticket mutuamente exclusivas */}
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
), [
  configState,
  theme,
  handleSwitchChange,
  handleConfigChange,
  handleMutuallyExclusiveOption
]);

// Componente de configurações de integrações
const IntegrationsSection = useMemo(() => () => (
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
              label={i18n.t("optionsPage.enableUPSix") || "Habilitar UPSix"}
            />
          </FormGroup>
          <FormHelperText>
            {i18n.t("optionsPage.enableUPSixHelp") || "Ativa a integração com o sistema de telefonia UPSix"}
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
                  label={i18n.t("optionsPage.enableUPSixWebphone") || "Habilitar Webphone"}
                />
              </FormGroup>
              <FormHelperText>
                {i18n.t("optionsPage.enableUPSixWebphoneHelp") || "Ativa o webphone na interface de atendimento"}
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
                  label={i18n.t("optionsPage.enableUPSixNotifications") || "Habilitar Notificações"}
                />
              </FormGroup>
              <FormHelperText>
                {i18n.t("optionsPage.enableUPSixNotificationsHelp") || "Ativa notificações das chamadas UPSix"}
              </FormHelperText>
            </Box>
          )}
        </Box>
      </StyledPaper>
    </Box>
  ), [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange
  ]);

  // Componente de configurações avançadas
  const AdvancedSection = useMemo(() => () => (
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
    </Box>
  ), [
    configState,
    theme,
    handleSwitchChange,
    handleConfigChange
  ]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Navegação por Tabs */}
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

      {/* Conteúdo das tabs usando StandardTabContent */}
      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && (
          <StandardTabContent
            title={i18n.t("optionsPage.general") || "Configurações Gerais"}
            description="Configure as opções básicas de funcionamento do sistema"
            icon={<SettingsIcon />}
            variant="default"
          >
            <GeneralConfigSection />
          </StandardTabContent>
        )}

        {currentTab === 1 && (
          <StandardTabContent
            title={i18n.t("optionsPage.integrations") || "Integrações"}
            description="Configure as integrações com serviços externos"
            icon={<FontAwesomeIcon icon={faServer} />}
            variant="default"
          >
            <IntegrationsSection />
          </StandardTabContent>
        )}

        {currentTab === 2 && (
          <StandardTabContent
            title={i18n.t("optionsPage.advanced") || "Configurações Avançadas"}
            description="Configure opções avançadas e específicas do sistema"
            icon={<BuildIcon />}
            variant="default"
          >
            <AdvancedSection />
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