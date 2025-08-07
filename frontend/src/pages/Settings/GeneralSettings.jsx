import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { useTheme, styled } from "@mui/material/styles";
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
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  Divider,
  Stack,
  Chip,
  Tooltip,
  Avatar
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Tune as TuneIcon,
  Build as BuildIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Support as SupportIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  AssessmentOutlined,
  LocalOffer as TagIcon,
  SettingsApplications as AppSettingsIcon,
  Timeline as TimelineIcon,
  FileCopy as FileCopyIcon,
  WhatsApp as WhatsAppIcon,
  AddToQueue as QueueIcon
} from "@mui/icons-material";
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

import MainContainer from "../../components/MainContainer";

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";

import useAuth from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";
import { copyToClipboard } from "../../helpers/copyToClipboard";

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

// Mapeamento de chaves frontend -> backend
const KEY_MAPPING = {
  'openAiModel': 'openaiModel',
  'smtpauthType': 'smtpauth',
  'usersmtpauthType': 'usersmtpauth',
  'clientsecretsmtpauthType': 'clientsecretsmtpauth',
  'smtpPortType': 'smtpport',
  'waSuportType': 'wasuport',
  'msgSuportType': 'msgsuport',
  'settingsTransfTicket': 'SettingsTransfTicket'
};

// Mapeamento reverso backend -> frontend
const REVERSE_KEY_MAPPING = Object.fromEntries(
  Object.entries(KEY_MAPPING).map(([k, v]) => [v, k])
);

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  margin: theme.spacing(1, 0),
  borderRadius: 12,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 16
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
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

// Componente de Switch Otimizado
const SettingSwitch = React.memo(({
  id,
  label,
  helpText,
  value,
  onChange,
  disabled = false,
  icon
}) => {
  const handleChange = useCallback((event) => {
    onChange(id, event.target.checked ? "enabled" : "disabled");
  }, [id, onChange]);

  return (
    <StyledPaper elevation={2}>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={value === "enabled"}
              onChange={handleChange}
              color="primary"
              disabled={disabled}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {icon}
              <Typography>{label}</Typography>
            </Box>
          }
        />
        {helpText && (
          <FormHelperText sx={{ ml: 4 }}>
            {helpText}
          </FormHelperText>
        )}
      </FormGroup>
    </StyledPaper>
  );
});

SettingSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  icon: PropTypes.node
};

// Componente de Select Otimizado
const SettingSelect = React.memo(({
  id,
  label,
  value,
  options,
  onChange,
  helpText,
  icon,
  gridSize = { xs: 12, sm: 6 }
}) => {
  const handleChange = useCallback((event) => {
    onChange(id, event.target.value);
  }, [id, onChange]);

  return (
    <StyledPaper elevation={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid item {...gridSize}>
          <FormControl fullWidth size="small">
            <TextField
              select
              label={label}
              value={value}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: icon && (
                  <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                    {icon}
                  </Box>
                ),
              }}
            >
              {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </Grid>
      </Grid>
      {helpText && (
        <FormHelperText sx={{ mt: 1, ml: 2 }}>
          {helpText}
        </FormHelperText>
      )}
    </StyledPaper>
  );
});

SettingSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  helpText: PropTypes.string,
  icon: PropTypes.node,
  gridSize: PropTypes.object
};

// Componente de TextField
const SettingTextField = React.memo(({
  id,
  label,
  value,
  onChange,
  helpText,
  icon,
  type = "text",
  gridSize = { xs: 12, sm: 6 },
  validation = null,
  showCopyButton = false
}) => {
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    if (validation && !validation(newValue)) {
      return;
    }
    onChange(id, newValue, false);
  }, [id, onChange, validation]);

  const handleCopy = useCallback(() => {
    if (value) {
      copyToClipboard(value);
      toast.success("Valor copiado com sucesso!");
    }
  }, [value]);

  return (
    <StyledPaper elevation={2}>
      <Grid container spacing={2}>
        <Grid item {...gridSize}>
          <TextField
            id={id}
            name={id}
            label={label}
            type={type}
            value={value || ""}
            onChange={handleChange}
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: icon && (
                <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                  {icon}
                </Box>
              ),
              endAdornment: showCopyButton && value && (
                <Tooltip title="Copiar valor">
                  <FileCopyIcon
                    sx={{ cursor: 'pointer', ml: 1 }}
                    onClick={handleCopy}
                  />
                </Tooltip>
              ),
            }}
          />
        </Grid>
      </Grid>
      {helpText && (
        <FormHelperText sx={{ mt: 1, ml: 2 }}>
          {helpText}
        </FormHelperText>
      )}
    </StyledPaper>
  );
});

SettingTextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  helpText: PropTypes.string,
  icon: PropTypes.node,
  type: PropTypes.string,
  gridSize: PropTypes.object,
  validation: PropTypes.func,
  showCopyButton: PropTypes.bool
};

// Componente Principal
const GeneralSettings = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { getAll, update } = useSettings();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Refs para evitar closures obsoletos
  const settingsRef = useRef(settings);
  const pendingChangesRef = useRef(pendingChanges);

  // Atualizar refs sempre que o estado mudar
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  // Estado inicial das configurações completo
  const getInitialConfigState = useCallback(() => {
    return {
      // Configurações gerais
      openAiModel: "gpt-4",
      enableAudioTranscriptions: "disabled",
      openAiKey: "",
      userRating: "disabled",
      scheduleType: "disabled",
      quickMessages: "company",
      allowSignup: "disabled",
      CheckMsgIsGroup: "disabled",
      sendGreetingAccepted: "disabled",
      settingsTransfTicket: "disabled",
      sendGreetingMessageOneQueues: "enabled",
      downloadLimit: "64",
      maxFileSize: "10",
      sendEmailWhenRegister: "disabled",
      sendMessageWhenRegister: "disabled",
      enableReasonWhenCloseTicket: "disabled",
      enableUseOneTicketPerConnection: "disabled",
      callSuport: "enabled",
      trialExpiration: "7",
      maxConnections: "5",
      maxQueues: "10",
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
      requireQueueOnAccept: "disabled",

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
    };
  }, []);

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      const settingsData = await getAll(companyId);

      // Converter array para objeto com estado inicial como base
      const initialState = getInitialConfigState();
      const settingsObj = { ...initialState };

      if (Array.isArray(settingsData)) {
        settingsData.forEach(setting => {
          if (setting?.key) {
            // Aplicar mapeamento reverso de chaves do backend para frontend
            const frontendKey = REVERSE_KEY_MAPPING[setting.key] || setting.key;

            if (settingsObj.hasOwnProperty(frontendKey)) {
              settingsObj[frontendKey] = String(setting.value || settingsObj[frontendKey] || "");
            }
          }
        });
      }

      console.log("Configurações carregadas:", settingsObj);
      setSettings(settingsObj);
      setPendingChanges({}); // Limpar mudanças pendentes ao recarregar
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, getAll, getInitialConfigState]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handler para mudanças nas configurações - CORRIGIDO
  const handleSettingChange = useCallback((key, value, notifyBackend = true) => {
    console.log(`Alterando configuração: ${key} = ${value}`);
    
    // Atualizar estado local imediatamente
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [key]: value };
      console.log("Novo estado de configurações:", newSettings);
      return newSettings;
    });

    if (notifyBackend) {
      // Aplicar mapeamento de chaves do frontend para backend
      const backendKey = KEY_MAPPING[key] || key;
      
      setPendingChanges(prevChanges => {
        const newChanges = { ...prevChanges, [backendKey]: value };
        console.log("Novas mudanças pendentes:", newChanges);
        return newChanges;
      });

      if (!snackbarOpen) {
        setSnackbarMessage("Alterações pendentes. Clique em Salvar para aplicar.");
        setSnackbarOpen(true);
      }
    }
  }, [snackbarOpen]);

  // Handler para opções mutuamente exclusivas - CORRIGIDO
  const handleMutuallyExclusiveOption = useCallback((enabledKey, value) => {
    if (value === "enabled") {
      const exclusiveOptions = {
        enableQueueWhenCloseTicket: ["enableTagsWhenCloseTicket", "enableReasonWhenCloseTicket"],
        enableTagsWhenCloseTicket: ["enableQueueWhenCloseTicket", "enableReasonWhenCloseTicket"],
        enableReasonWhenCloseTicket: ["enableQueueWhenCloseTicket", "enableTagsWhenCloseTicket"],
        displayContactInfo: ["displayBusinessInfo"],
        displayBusinessInfo: ["displayContactInfo"]
      };

      if (exclusiveOptions[enabledKey]) {
        const optionsToDisable = exclusiveOptions[enabledKey];
        optionsToDisable.forEach(key => {
          const currentSettings = settingsRef.current;
          if (currentSettings[key] === "enabled") {
            handleSettingChange(key, "disabled");
          }
        });

        if (enabledKey.includes("Close")) {
          toast.info("Apenas uma opção de encerramento pode estar ativa");
        }
      }
    }

    handleSettingChange(enabledKey, value);
  }, [handleSettingChange]);

  // Validação para números
  const numberValidation = useCallback((value) => {
    return value === "" || /^[0-9\b]+$/.test(value);
  }, []);

  // Salvar todas as alterações - CORRIGIDO
  const handleSaveAll = useCallback(async () => {
    const currentPendingChanges = pendingChangesRef.current;
    
    if (Object.keys(currentPendingChanges).length === 0) {
      toast.info("Não há alterações para salvar");
      return;
    }

    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");

      console.log("Salvando alterações:", currentPendingChanges);

      // Salvar cada configuração alterada
      const promises = Object.entries(currentPendingChanges).map(([key, value]) => {
        console.log(`Salvando: ${key} = ${value}`);
        return update({ key, value, companyId });
      });

      await Promise.all(promises);

      setPendingChanges({});
      setSnackbarOpen(false);
      toast.success("Configurações salvas com sucesso!");

      // Recarregar para garantir sincronização
      setTimeout(() => {
        loadSettings();
      }, 500);
      
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }, [user?.companyId, update, loadSettings]);

  // Preparar estatísticas
  const stats = useMemo(() => [
    {
      label: `${Object.keys(pendingChanges).length} alterações pendentes`,
      icon: <TuneIcon />,
      color: Object.keys(pendingChanges).length > 0 ? 'warning' : 'default'
    },
    {
      label: user?.super ? "Modo Super Admin" : "Modo Admin",
      icon: <PersonIcon />,
      color: user?.super ? 'secondary' : 'primary'
    }
  ], [pendingChanges, user?.super]);

  if (loading) {
    return (
      <MainContainer>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <StandardPageLayout
      title="Configurações Gerais"
      subtitle="Configure todas as opções e funcionalidades do sistema"
      actions={[
        {
          label: 'Salvar Alterações',
          icon: saving ? <CircularProgress size={20} /> : <SaveIcon />,
          onClick: handleSaveAll,
          variant: 'contained',
          color: 'primary',
          disabled: saving || Object.keys(pendingChanges).length === 0,
          primary: true
        }
      ]}
      showSearch={false}
    >
      <StandardTabContent
        icon={<SettingsIcon />}
        stats={stats}
        variant="default"
      >
        {/* CONFIGURAÇÕES DA EMPRESA - SUPER ADMIN */}
        {user?.super && (
          <>
              <SectionTitle variant="h6">
                <BusinessIcon />
                Configurações da Empresa (Super Admin)
              </SectionTitle>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SettingSelect
                    id="trialExpiration"
                    label={i18n.t("optionsPage.trialExpiration") || "Expiração do Trial"}
                    value={settings.trialExpiration || "7"}
                    options={[
                      { value: "3", label: "3 dias" },
                      { value: "7", label: "7 dias" },
                      { value: "9", label: "9 dias" },
                      { value: "15", label: "15 dias" },
                      { value: "30", label: "30 dias" }
                    ]}
                    onChange={handleSettingChange}
                    helpText={i18n.t("optionsPage.trialExpirationHelp") || "Tempo de duração do período de teste"}
                    icon={<BusinessIcon color="primary" />}
                    gridSize={{ xs: 12 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <SettingSwitch
                    id="allowSignup"
                    label={i18n.t("optionsPage.enableRegisterInSignup") || "Permitir registro público"}
                    value={settings.allowSignup || "disabled"}
                    onChange={handleSettingChange}
                    helpText={i18n.t("optionsPage.enableRegisterInSignupHelp") || "Permite que novos usuários se cadastrem publicamente"}
                    icon={<PersonIcon color="primary" />}
                  />
                </Grid>

                <Grid item xs={12}>
                  <SettingSwitch
                    id="sendEmailWhenRegister"
                    label={i18n.t("optionsPage.sendEmailInRegister") || "Enviar email no registro"}
                    value={settings.sendEmailWhenRegister || "disabled"}
                    onChange={handleSettingChange}
                    helpText={i18n.t("optionsPage.sendEmailInRegisterHelp") || "Envia email de confirmação quando novo usuário se registra"}
                    icon={<EmailIcon color="primary" />}
                  />
                </Grid>

                <Grid item xs={12}>
                  <SettingSwitch
                    id="sendMessageWhenRegister"
                    label={i18n.t("optionsPage.sendMessageWhenRegiter") || "Enviar mensagem no registro"}
                    value={settings.sendMessageWhenRegister || "disabled"}
                    onChange={handleSettingChange}
                    helpText={i18n.t("optionsPage.sendMessageWhenRegiterHelp") || "Envia mensagem de boas-vindas quando novo usuário se registra"}
                    icon={<MessageIcon color="primary" />}
                  />
                </Grid>
              </Grid>

              <CategoryDivider>
                <Chip
                  icon={<FontAwesomeIcon icon={faTicketAlt} />}
                  label="Configurações de Sistema"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'bold', px: 2 }}
                />
                <Divider sx={{ flexGrow: 1, ml: 2 }} />
              </CategoryDivider>
            </>
          )}

        {/* CONFIGURAÇÕES GERAIS */}
        <SectionTitle variant="h6">
          <SettingsIcon />
          Configurações Gerais
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSelect
              id="scheduleType"
              label={i18n.t("optionsPage.expedient") || "Expediente"}
              value={settings.scheduleType || "disabled"}
              options={[
                { value: "disabled", label: i18n.t("optionsPage.buttons.off") || "Desabilitado" },
                { value: "company", label: i18n.t("optionsPage.buttons.partner") || "Por empresa" },
                { value: "queue", label: i18n.t("optionsPage.buttons.quee") || "Por fila" }
              ]}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.expedientHelp") || "Define como o expediente será controlado"}
              gridSize={{ xs: 12, sm: 6 }}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSelect
              id="quickMessages"
              label={i18n.t("optionsPage.speedMessage") || "Mensagens rápidas"}
              value={settings.quickMessages || "company"}
              options={[
                { value: "company", label: i18n.t("optionsPage.byCompany") || "Por empresa" },
                { value: "individual", label: i18n.t("optionsPage.byUser") || "Por usuário" }
              ]}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.speedMessageHelp") || "Define o escopo das mensagens rápidas"}
              gridSize={{ xs: 12, sm: 6 }}
            />
          </Grid>
        </Grid>

        <CategoryDivider>
          <Chip
            icon={<SupportIcon />}
            label={i18n.t("optionsPage.ticketSettings") || "Configurações de Atendimento"}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        {/* CONFIGURAÇÕES DE ATENDIMENTO */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="CheckMsgIsGroup"
              label={i18n.t("optionsPage.ignore") || "Ignorar mensagens de grupos"}
              value={settings.CheckMsgIsGroup || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.ignoreHelp") || "Ignora mensagens recebidas de grupos do WhatsApp"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="sendGreetingAccepted"
              label={i18n.t("optionsPage.sendanun") || "Enviar saudação quando aceitar ticket"}
              value={settings.sendGreetingAccepted || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.sendanunHelp") || "Envia mensagem de saudação automaticamente quando agente aceita um ticket"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="sendQueuePosition"
              label={i18n.t("optionsPage.sendQueuePosition") || "Enviar posição na fila"}
              value={settings.sendQueuePosition || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.sendQueuePositionHelp") || "Informa ao cliente sua posição na fila de atendimento"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="settingsUserRandom"
              label={i18n.t("optionsPage.settingsUserRandom") || "Distribuição aleatória de usuários"}
              value={settings.settingsUserRandom || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.settingsUserRandomHelp") || "Distribui tickets aleatoriamente entre agentes disponíveis"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="userRating"
              label={i18n.t("optionsPage.calif") || "Habilitar avaliação de atendimento"}
              value={settings.userRating || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.califHelp") || "Permite que clientes avaliem o atendimento recebido"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="sendGreetingMessageOneQueues"
              label={i18n.t("optionsPage.greeatingOneQueue") || "Saudação única por fila"}
              value={settings.sendGreetingMessageOneQueues || "enabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.greeatingOneQueueHelp") || "Envia apenas uma mensagem de saudação por fila"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="settingsTransfTicket"
              label={i18n.t("optionsPage.sendagent") || "Notificar transferência de ticket"}
              value={settings.settingsTransfTicket || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.sendagentHelp") || "Envia notificação quando ticket é transferido para outro agente"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableUseOneTicketPerConnection"
              label="Um ticket por conexão"
              value={settings.enableUseOneTicketPerConnection || "disabled"}
              onChange={handleSettingChange}
              helpText="Permite apenas um ticket ativo por conexão por vez"
            />
          </Grid>

          {/* Nova configuração para exigir fila ao aceitar ticket */}
          <Grid item xs={12}>
            <SettingSwitch
              id="requireQueueOnAccept"
              label="Exigir Seleção de Fila ao Aceitar Ticket"
              value={settings.requireQueueOnAccept || "disabled"}
              onChange={handleSettingChange}
              helpText="Quando ativado, exige que o atendente selecione uma fila ao aceitar tickets que não possuem fila definida. Útil para garantir que todos os tickets sejam adequadamente categorizados."
              icon={<QueueIcon color="primary" />}
            />
          </Grid>
        </Grid>

        <CategoryDivider>
          <Chip
            icon={<BuildIcon />}
            label="Configurações de Encerramento de Tickets"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        {/* CONFIGURAÇÕES DE ENCERRAMENTO */}
        <Alert severity="info" sx={{ mb: 2 }}>
          Apenas uma opção de encerramento pode estar ativa por vez
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="enableReasonWhenCloseTicket"
              label={i18n.t("optionsPage.enableReasonWhenCloseTicket") || "Exigir motivo ao encerrar ticket"}
              value={settings.enableReasonWhenCloseTicket || "disabled"}
              onChange={handleMutuallyExclusiveOption}
              helpText={i18n.t("optionsPage.enableReasonWhenCloseTicketHelp") || "Obriga o agente a informar um motivo ao encerrar o ticket"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableQueueWhenCloseTicket"
              label={i18n.t("optionsPage.enableQueueWhenCloseTicket") || "Definir fila ao encerrar ticket"}
              value={settings.enableQueueWhenCloseTicket || "disabled"}
              onChange={handleMutuallyExclusiveOption}
              helpText={i18n.t("optionsPage.enableQueueWhenCloseTicketHelp") || "Permite definir uma fila específica ao encerrar o ticket"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableTagsWhenCloseTicket"
              label={i18n.t("optionsPage.enableTagsWhenCloseTicket") || "Definir etiquetas ao encerrar ticket"}
              value={settings.enableTagsWhenCloseTicket || "disabled"}
              onChange={handleMutuallyExclusiveOption}
              helpText={i18n.t("optionsPage.enableTagsWhenCloseTicketHelp") || "Permite adicionar etiquetas ao encerrar o ticket"}
            />
          </Grid>
        </Grid>

        <CategoryDivider>
          <Chip
            icon={<TuneIcon />}
            label={i18n.t("optionsPage.contactSettings") || "Configurações de Exibição"}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        {/* CONFIGURAÇÕES DE EXIBIÇÃO */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="displayProfileImages"
              label={i18n.t("optionsPage.displayProfileImages") || "Exibir imagens de perfil"}
              value={settings.displayProfileImages || "enabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.displayProfileImagesHelp") || "Mostra as fotos de perfil dos contatos nas conversas"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableTicketValueAndSku"
              label={i18n.t("optionsPage.showSKU") || "Exibir valor e SKU do ticket"}
              value={settings.enableTicketValueAndSku || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.showSKUHelp") || "Mostra campos de valor e SKU nos tickets"}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="displayContactInfo"
              label={i18n.t("optionsPage.displayContactInfo") || "Exibir informações de contato"}
              value={settings.displayContactInfo || "enabled"}
              onChange={handleMutuallyExclusiveOption}
              helpText={i18n.t("optionsPage.displayContactInfoHelp") || "Mostra informações detalhadas do contato"}
              disabled={settings.displayBusinessInfo === "enabled"}
            />
            {settings.displayBusinessInfo === "enabled" && (
              <Typography color="error" variant="caption" sx={{ ml: 4, display: "block" }}>
                {i18n.t("optionsPage.displayContactInfoDisabled") || "Desabilitado pois informações comerciais estão ativas"}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="displayBusinessInfo"
              label={i18n.t("optionsPage.displayBusinessInfo") || "Exibir informações comerciais"}
              value={settings.displayBusinessInfo || "disabled"}
              onChange={handleMutuallyExclusiveOption}
              helpText={i18n.t("optionsPage.displayBusinessInfoHelp") || "Mostra informações comerciais do contato"}
              disabled={settings.displayContactInfo === "enabled"}
            />
            {settings.displayContactInfo === "enabled" && (
              <Typography color="error" variant="caption" sx={{ ml: 4, display: "block" }}>
                {i18n.t("optionsPage.displayBusinessInfoDisabled") || "Desabilitado pois informações de contato estão ativas"}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableSaveCommonContacts"
              label={i18n.t("optionsPage.enableSaveCommonContacts") || "Salvar contatos frequentes"}
              value={settings.enableSaveCommonContacts || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.enableSaveCommonContactsHelp") || "Salva automaticamente contatos que interagem frequentemente"}
            />
          </Grid>
        </Grid>

        <CategoryDivider>
          <Chip
            icon={<FontAwesomeIcon icon={faServer} />}
            label={i18n.t("optionsPage.integrations") || "Integrações"}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        {/* CONFIGURAÇÕES DE INTEGRAÇÕES */}
        <SectionTitle variant="h6">
          <WhatsAppIcon sx={{ color: '#25D366' }} />
          WhatsApp API Oficial
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="enableOfficialWhatsapp"
              label={i18n.t("optionsPage.enableOfficialWhatsapp") || "Habilitar WhatsApp Oficial"}
              value={settings.enableOfficialWhatsapp || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.enableOfficialWhatsappHelp") || "Ativa o uso da API oficial do WhatsApp Business"}
              icon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
            />
          </Grid>
        </Grid>

        <SectionTitle variant="h6">
          <Avatar sx={{ bgcolor: '#1877F2', width: 28, height: 28, mr: 1 }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>M</span>
          </Avatar>
          Meta Pixel
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="enableMetaPixel"
              label={i18n.t("optionsPage.enableMetaPixel") || "Habilitar Meta Pixel"}
              value={settings.enableMetaPixel || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.enableMetaPixelHelp") || "Ativa o rastreamento do Meta Pixel para análise de conversões"}
            />
          </Grid>

          {settings.enableMetaPixel === "enabled" && (
            <Grid item xs={12}>
              <SettingTextField
                id="metaPixelId"
                label={i18n.t("optionsPage.metaPixelId") || "ID do Meta Pixel"}
                value={settings.metaPixelId || ""}
                onChange={handleSettingChange}
                helpText={i18n.t("optionsPage.metaPixelIdHelp") || "Informe o ID do seu Meta Pixel"}
                gridSize={{ xs: 12, sm: 6 }}
              />
            </Grid>
          )}
        </Grid>

        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faRobot} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
          OpenAI
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SettingSelect
              id="openAiModel"
              label={i18n.t("optionsPage.openaiModel") || "Modelo OpenAI"}
              value={settings.openAiModel || "gpt-4"}
              options={openAiModels}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.openaiModelHelp") || "Selecione o modelo da OpenAI para usar"}
              gridSize={{ xs: 12 }}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableAudioTranscriptions"
              label={i18n.t("optionsPage.enableAudioTranscriptions") || "Ativar transcrição de áudio"}
              value={settings.enableAudioTranscriptions || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.enableAudioTranscriptionsHelp") || "Ativa a transcrição de áudio utilizando o serviço da OpenAI"}
            />
          </Grid>

            <Grid item xs={12}>
              <SettingTextField
                id="openAiKey"
                label={i18n.t("optionsPage.openAiKey") || "Chave da API OpenAI"}
                value={settings.openAiKey || ""}
                onChange={handleSettingChange}
                helpText={i18n.t("optionsPage.openAiKeyHelp") || "Informe a chave da API OpenAI para utilizar recursos de IA em atendimentos."}
                type="password"
                showCopyButton={true}
                gridSize={{ xs: 12 }}
              />
            </Grid>
        </Grid>

        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faGears} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
          UPSix Integration
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="enableUPSix"
              label="Habilitar UPSix"
              value={settings.enableUPSix || "disabled"}
              onChange={handleSettingChange}
              helpText="Ativa a integração com UPSix"
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableUPSixWebphone"
              label="Habilitar UPSix Webphone"
              value={settings.enableUPSixWebphone || "disabled"}
              onChange={handleSettingChange}
              helpText="Ativa o webphone UPSix"
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableUPSixNotifications"
              label="Habilitar Notificações UPSix"
              value={settings.enableUPSixNotifications || "disabled"}
              onChange={handleSettingChange}
              helpText="Ativa as notificações do UPSix"
            />
          </Grid>
        </Grid>

        <CategoryDivider>
          <Chip
            icon={<BuildIcon />}
            label={i18n.t("optionsPage.advanced") || "Configurações Avançadas"}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </CategoryDivider>

        {/* CONFIGURAÇÕES AVANÇADAS */}
        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faFileExport} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
          {i18n.t("optionsPage.downloadSettings") || "Configurações de Download"}
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SettingSelect
              id="downloadLimit"
              label={i18n.t("optionsPage.downloadLimit") || "Limite de Download"}
              value={settings.downloadLimit || "64"}
              options={[
                { value: "32", label: "32 MB" },
                { value: "64", label: "64 MB" },
                { value: "128", label: "128 MB" },
                { value: "256", label: "256 MB" },
                { value: "512", label: "512 MB" },
                { value: "1024", label: "1 GB" },
                { value: "2048", label: "2 GB" }
              ]}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.downloadLimitHelp") || "Tamanho máximo para download de arquivos"}
              gridSize={{ xs: 12 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingSelect
              id="maxFileSize"
              label="Tamanho máximo de arquivo"
              value={settings.maxFileSize || "10"}
              options={[
                { value: "5", label: "5 MB" },
                { value: "10", label: "10 MB" },
                { value: "20", label: "20 MB" },
                { value: "50", label: "50 MB" },
                { value: "100", label: "100 MB" },
                { value: "200", label: "200 MB" }
              ]}
              onChange={handleSettingChange}
              helpText="Tamanho máximo para upload de arquivos"
              gridSize={{ xs: 12 }}
            />
          </Grid>
        </Grid>

        <SectionTitle variant="h6">
          <AssessmentOutlined sx={{ mr: 1, color: theme.palette.primary.main }} />
          {i18n.t("optionsPage.satisfactionSurveyTitle") || "Pesquisa de Satisfação"}
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="enableSatisfactionSurvey"
              label={i18n.t("optionsPage.enableSatisfactionSurvey") || "Habilitar pesquisa de satisfação"}
              value={settings.enableSatisfactionSurvey || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.enableSatisfactionSurveyHelp") || "Envia pesquisa de satisfação após encerramento do ticket"}
            />
          </Grid>
        </Grid>

        <SectionTitle variant="h6">
          <SupportIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          {i18n.t("optionsPage.support") || "Configurações de Suporte"}
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="callSuport"
              label={i18n.t("optionsPage.callSuport") || "Habilitar suporte"}
              value={settings.callSuport || "enabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.callSuportHelp") || "Ativa opções de contato com suporte técnico"}
              icon={<SupportIcon color="primary" />}
            />
          </Grid>

          {settings.callSuport === "enabled" && user.super && (
                <>
                  <Grid item xs={12} md={6}>
                    <SettingTextField
                      id="waSuportType"
                      label={i18n.t("optionsPage.wasuport") || "WhatsApp Suporte"}
                      value={settings.waSuportType || ""}
                      onChange={handleSettingChange}
                      helpText="Número do WhatsApp para suporte (apenas números)"
                      icon={<PhoneIcon fontSize="small" color="primary" />}
                      validation={numberValidation}
                      gridSize={{ xs: 12 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <SettingTextField
                      id="msgSuportType"
                      label={i18n.t("optionsPage.msgsuport") || "Mensagem de Suporte"}
                      value={settings.msgSuportType || ""}
                      onChange={handleSettingChange}
                      helpText="Mensagem padrão para contato com suporte"
                      icon={<MessageIcon fontSize="small" color="primary" />}
                      gridSize={{ xs: 12 }}
                    />
                  </Grid>
                </>
          )}
        </Grid>

        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
          Configurações SMTP
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <SettingTextField
              id="smtpauthType"
              label={i18n.t("optionsPage.smtpServer") || "Servidor SMTP"}
              value={settings.smtpauthType || ""}
              onChange={handleSettingChange}
              helpText="Endereço do servidor SMTP"
              gridSize={{ xs: 12 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <SettingTextField
              id="usersmtpauthType"
              label={i18n.t("optionsPage.smtpUser") || "Usuário SMTP"}
              value={settings.usersmtpauthType || ""}
              onChange={handleSettingChange}
              helpText="Nome de usuário para autenticação SMTP"
              gridSize={{ xs: 12 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <SettingTextField
              id="clientsecretsmtpauthType"
              label={i18n.t("optionsPage.smtpPassword") || "Senha SMTP"}
              value={settings.clientsecretsmtpauthType || ""}
              onChange={handleSettingChange}
              helpText="Senha para autenticação SMTP"
              type="password"
              gridSize={{ xs: 12 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <SettingTextField
              id="smtpPortType"
              label={i18n.t("optionsPage.smtpPort") || "Porta SMTP"}
              value={settings.smtpPortType || ""}
              onChange={handleSettingChange}
              helpText="Porta do servidor SMTP (ex: 587, 465)"
              validation={numberValidation}
              gridSize={{ xs: 12 }}
            />
          </Grid>
        </Grid>

        {/* Notificação flutuante */}
        <Snackbar
          open={snackbarOpen && Object.keys(pendingChanges).length > 0}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          action={
            <Button
              color="secondary"
              size="small"
              onClick={handleSaveAll}
              disabled={saving}
            >
              Salvar
            </Button>
          }
        />
      </StandardTabContent>
    </StandardPageLayout>
  );
};

export default GeneralSettings;