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
  Alert
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
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRobot, 
  faServer, 
  faEnvelope, 
  faFileExport, 
  faTicketAlt, 
  faUsers, 
  faDatabase 
} from "@fortawesome/free-solid-svg-icons";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import StandardTabContent from "../../../components/shared/StandardTabContent";
import BaseButton from "../../../components/shared/BaseButton";
import StandardModal from "../../../components/shared/StandardModal";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";
import useSettings from "../../../hooks/useSettings";
import { toast } from "../../../helpers/toast";
import OnlyForSuperUser from "../../../components/OnlyForSuperUser";
import { copyToClipboard } from "../../../helpers/copyToClipboard";
import { GlobalContext } from "../../../context/GlobalContext";
import { useLoading } from "../../../hooks/useLoading";

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

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SettingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const Options = ({ settings, scheduleTypeChanged, enableReasonWhenCloseTicketChanged }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const { update } = useSettings();
  const { setMakeRequestSettings } = useContext(GlobalContext);
  const { Loading } = useLoading();

  // Estado consolidado das configurações
  const [configSettings, setConfigSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Carregar configurações de forma otimizada
  const loadSettings = useCallback(() => {
    if (!Array.isArray(settings) || settings.length === 0) return;

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Configurações padrão
    const defaultSettings = {
      // IA
      openaiModel: "gpt-4",
      enableAudioTranscriptions: "disabled",
      openAiKey: "",
      
      // Geral
      userRating: "disabled",
      scheduleType: "disabled",
      quickMessages: "company",
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
      initialPage: "login",
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
      enableGroupTool: "disabled",
      enableMessageRules: "disabled",
      enableMetaPixel: "disabled",
      metaPixelId: "",
      
      // SMTP
      smtpauth: "",
      usersmtpauth: "",
      clientsecretsmtpauth: "",
      smtpport: "",
      
      // Suporte
      wasuport: "",
      msgsuport: ""
    };

    setConfigSettings({ ...defaultSettings, ...settingsMap });
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Função genérica para atualizar configurações
  const updateSetting = useCallback(async (key, value) => {
    try {
      await update({ key, value });
      setConfigSettings(prev => ({ ...prev, [key]: value }));
      setMakeRequestSettings(Math.random());
      toast.success(i18n.t("optionsPage.successMessage"));
      setHasChanges(false);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      toast.error("Erro ao salvar configuração");
      return false;
    }
  }, [update, setMakeRequestSettings]);

  // Handlers específicos com validações
  const handleToggleSetting = useCallback((key, callback) => async (checked) => {
    const value = checked ? "enabled" : "disabled";
    const success = await updateSetting(key, value);
    if (success && callback) {
      callback(value);
    }
  }, [updateSetting]);

  const handleTextSetting = useCallback((key) => async (event) => {
    const value = event.target.value;
    setConfigSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSaveTextSetting = useCallback((key) => async () => {
    await updateSetting(key, configSettings[key]);
  }, [updateSetting, configSettings]);

  // Handlers específicos para configurações especiais
  const handleExclusiveToggle = useCallback((keys, activeKey) => async (checked) => {
    if (checked) {
      const promises = keys.map(key => 
        key === activeKey 
          ? updateSetting(key, "enabled")
          : updateSetting(key, "disabled")
      );
      
      await Promise.all(promises);
      
      // Callbacks específicos
      if (activeKey === "enableReasonWhenCloseTicket" && enableReasonWhenCloseTicketChanged) {
        enableReasonWhenCloseTicketChanged("enabled");
      }
      
      toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive"));
    } else {
      await updateSetting(activeKey, "disabled");
      if (activeKey === "enableReasonWhenCloseTicket" && enableReasonWhenCloseTicketChanged) {
        enableReasonWhenCloseTicketChanged("disabled");
      }
    }
  }, [updateSetting, enableReasonWhenCloseTicketChanged]);

  // Seções das configurações
  const sections = useMemo(() => [
    {
      title: "Configurações Gerais",
      icon: <BusinessIcon />,
      component: "general"
    },
    {
      title: "Integrações",
      icon: <FontAwesomeIcon icon={faServer} />,
      component: "integrations"
    },
    {
      title: "Configurações Avançadas", 
      icon: <BuildIcon />,
      component: "advanced"
    }
  ], []);

  // Componente de configuração geral
  const GeneralSettings = useMemo(() => (
    <Grid container spacing={3}>
      {/* Configurações da Empresa */}
      <Grid item xs={12}>
        <SectionTitle variant="h6">
          <BusinessIcon />
          Configurações da Empresa
        </SectionTitle>
        
        <OnlyForSuperUser user={user} yes={() => (
          <Stack spacing={2}>
            <SettingRow>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Período de Trial"
                  value={configSettings.trialExpiration || "3"}
                  onChange={(e) => updateSetting("trialExpiration", e.target.value)}
                  size="small"
                >
                  <MenuItem value="3">3 dias</MenuItem>
                  <MenuItem value="7">7 dias</MenuItem>
                  <MenuItem value="15">15 dias</MenuItem>
                  <MenuItem value="30">30 dias</MenuItem>
                </TextField>
                <FormHelperText>Define o período de teste para novas empresas</FormHelperText>
              </FormControl>
            </SettingRow>

            <SettingRow>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Página Inicial"
                  value={configSettings.initialPage || "login"}
                  onChange={(e) => updateSetting("initialPage", e.target.value)}
                  size="small"
                >
                  <MenuItem value="home">Página Principal</MenuItem>
                  <MenuItem value="login">Página de Login</MenuItem>
                </TextField>
                <FormHelperText>Define qual página é exibida ao acessar o sistema</FormHelperText>
              </FormControl>
            </SettingRow>
          </Stack>
        )} />
      </Grid>

      {/* Configurações de Tickets */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faTicketAlt} />
          Configurações de Tickets
        </SectionTitle>
        
        <Stack spacing={2}>
          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.CheckMsgIsGroup === "enabled"}
                  onChange={(e) => updateSetting("CheckMsgIsGroup", e.target.checked ? "enabled" : "disabled")}
                />
              }
              label="Ignorar mensagens de grupos"
            />
            <FormHelperText>Quando ativado, mensagens de grupos não geram tickets</FormHelperText>
          </SettingRow>

          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.userRating === "enabled"}
                  onChange={(e) => updateSetting("userRating", e.target.checked ? "enabled" : "disabled")}
                />
              }
              label="Avaliação de atendimento"
            />
            <FormHelperText>Permite que clientes avaliem o atendimento recebido</FormHelperText>
          </SettingRow>

          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.enableReasonWhenCloseTicket === "enabled"}
                  onChange={handleExclusiveToggle(
                    ['enableReasonWhenCloseTicket', 'enableQueueWhenCloseTicket', 'enableTagsWhenCloseTicket'],
                    'enableReasonWhenCloseTicket'
                  )}
                />
              }
              label="Solicitar motivo ao encerrar ticket"
            />
            <FormHelperText>Obriga informar um motivo ao fechar o ticket</FormHelperText>
          </SettingRow>

          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.enableQueueWhenCloseTicket === "enabled"}
                  onChange={handleExclusiveToggle(
                    ['enableReasonWhenCloseTicket', 'enableQueueWhenCloseTicket', 'enableTagsWhenCloseTicket'],
                    'enableQueueWhenCloseTicket'
                  )}
                />
              }
              label="Definir fila ao encerrar ticket"
            />
            <FormHelperText>Permite definir uma fila ao fechar o ticket</FormHelperText>
          </SettingRow>

          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.enableTagsWhenCloseTicket === "enabled"}
                  onChange={handleExclusiveToggle(
                    ['enableReasonWhenCloseTicket', 'enableQueueWhenCloseTicket', 'enableTagsWhenCloseTicket'],
                    'enableTagsWhenCloseTicket'
                  )}
                />
              }
              label="Definir etiquetas ao encerrar ticket"
            />
            <FormHelperText>Permite adicionar etiquetas ao fechar o ticket</FormHelperText>
          </SettingRow>
        </Stack>
      </Grid>

      {/* Configurações de Contatos */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faUsers} />
          Configurações de Contatos
        </SectionTitle>
        
        <Stack spacing={2}>
          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.displayContactInfo === "enabled"}
                  onChange={(e) => updateSetting("displayContactInfo", e.target.checked ? "enabled" : "disabled")}
                  disabled={configSettings.displayBusinessInfo === "enabled"}
                />
              }
              label="Exibir informações do contato"
            />
            <FormHelperText>
              Mostra informações detalhadas do contato na interface
              {configSettings.displayBusinessInfo === "enabled" && (
                <Typography color="error" variant="caption" display="block">
                  Desabilitado porque "Exibir info empresarial" está ativo
                </Typography>
              )}
            </FormHelperText>
          </SettingRow>

          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.displayBusinessInfo === "enabled"}
                  onChange={(e) => updateSetting("displayBusinessInfo", e.target.checked ? "enabled" : "disabled")}
                  disabled={configSettings.displayContactInfo === "enabled"}
                />
              }
              label="Exibir informações empresariais"
            />
            <FormHelperText>
              Mostra informações empresariais em vez de informações pessoais
              {configSettings.displayContactInfo === "enabled" && (
                <Typography color="error" variant="caption" display="block">
                  Desabilitado porque "Exibir info do contato" está ativo
                </Typography>
              )}
            </FormHelperText>
          </SettingRow>

          <SettingRow>
            <FormControlLabel
              control={
                <Switch
                  checked={configSettings.enableSaveCommonContacts === "enabled"}
                  onChange={(e) => updateSetting("enableSaveCommonContacts", e.target.checked ? "enabled" : "disabled")}
                />
              }
              label="Salvar contatos comuns automaticamente"
            />
            <FormHelperText>Salva automaticamente contatos que interagem com frequência</FormHelperText>
          </SettingRow>
        </Stack>
      </Grid>
    </Grid>
  ), [configSettings, user, updateSetting, handleExclusiveToggle]);

  // Componente de integrações
  const IntegrationsSettings = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionTitle variant="h6">
          <FontAwesomeIcon icon={faServer} />
          Integrações Disponíveis
        </SectionTitle>

        <Stack spacing={3}>
          {/* WhatsApp API Oficial */}
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WhatsAppIcon sx={{ color: '#25D366', mr: 2 }} />
                <Typography variant="h6">WhatsApp API Oficial</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={configSettings.enableOfficialWhatsapp === "enabled"}
                    onChange={(e) => updateSetting("enableOfficialWhatsapp", e.target.checked ? "enabled" : "disabled")}
                  />
                }
                label="Habilitar API Oficial do WhatsApp"
              />
              <FormHelperText>
                Permite usar a API oficial do WhatsApp para envio de mensagens
              </FormHelperText>
            </CardContent>
          </StyledCard>

          {/* OpenAI */}
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FontAwesomeIcon icon={faRobot} style={{ marginRight: 16, color: theme.palette.primary.main }} />
                <Typography variant="h6">OpenAI</Typography>
              </Box>
              
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Modelo OpenAI"
                    value={configSettings.openaiModel || "gpt-4"}
                    onChange={(e) => updateSetting("openaiModel", e.target.value)}
                    size="small"
                  >
                    {openAiModels.map((model) => (
                      <MenuItem key={model.value} value={model.value}>
                        {model.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FormHelperText>Selecione o modelo de IA para processamento</FormHelperText>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={configSettings.enableAudioTranscriptions === "enabled"}
                      onChange={(e) => updateSetting("enableAudioTranscriptions", e.target.checked ? "enabled" : "disabled")}
                    />
                  }
                  label="Transcrição de áudio"
                />
                <FormHelperText>Ativa transcrição automática de mensagens de áudio</FormHelperText>

                {configSettings.enableAudioTranscriptions === "enabled" && (
                  <Box sx={{ pl: 2, borderLeft: 2, borderColor: 'primary.main' }}>
                    <TextField
                      fullWidth
                      label="Chave da API OpenAI"
                      type="password"
                      value={configSettings.openAiKey || ""}
                      onChange={handleTextSetting("openAiKey")}
                      onBlur={handleSaveTextSetting("openAiKey")}
                      size="small"
                      InputProps={{
                        endAdornment: configSettings.openAiKey && (
                          <Tooltip title="Copiar chave">
                            <IconButton
                              size="small"
                              onClick={() => {
                                copyToClipboard(configSettings.openAiKey);
                                toast.success("Chave copiada!");
                              }}
                            >
                              <FileCopyIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                    <FormHelperText>
                      Informe a chave da API OpenAI para transcrição de áudio
                    </FormHelperText>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </StyledCard>

          {/* Meta Pixel */}
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    bgcolor: '#1877F2', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 2,
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  M
                </Box>
                <Typography variant="h6">Meta Pixel</Typography>
              </Box>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configSettings.enableMetaPixel === "enabled"}
                      onChange={(e) => updateSetting("enableMetaPixel", e.target.checked ? "enabled" : "disabled")}
                    />
                  }
                  label="Habilitar Meta Pixel"
                />
                <FormHelperText>Ativa o tracking do Meta Pixel para análise de conversões</FormHelperText>

                {configSettings.enableMetaPixel === "enabled" && (
                  <TextField
                    fullWidth
                    label="ID do Meta Pixel"
                    value={configSettings.metaPixelId || ""}
                    onChange={handleTextSetting("metaPixelId")}
                    onBlur={handleSaveTextSetting("metaPixelId")}
                    size="small"
                    placeholder="123456789012345"
                  />
                )}
              </Stack>
            </CardContent>
          </StyledCard>
        </Stack>
      </Grid>
    </Grid>
  ), [configSettings, updateSetting, handleTextSetting, handleSaveTextSetting, theme]);

  // Componente de configurações avançadas
  const AdvancedSettings = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionTitle variant="h6">
          <BuildIcon />
          Configurações Avançadas
        </SectionTitle>

        <Stack spacing={3}>
          {/* Pesquisa de Satisfação */}
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pesquisa de Satisfação</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={configSettings.enableSatisfactionSurvey === "enabled"}
                    onChange={(e) => updateSetting("enableSatisfactionSurvey", e.target.checked ? "enabled" : "disabled")}
                  />
                }
                label="Habilitar pesquisa de satisfação"
              />
              <FormHelperText>
                Envia automaticamente pesquisa de satisfação após o encerramento do ticket
              </FormHelperText>
            </CardContent>
          </StyledCard>

          {/* Suporte */}
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SupportIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6">Suporte</Typography>
              </Box>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configSettings.callSuport === "enabled"}
                      onChange={(e) => updateSetting("callSuport", e.target.checked ? "enabled" : "disabled")}
                    />
                  }
                  label="Habilitar opções de suporte"
                />
                <FormHelperText>Exibe opções de contato com o suporte do sistema</FormHelperText>

                {configSettings.callSuport === "enabled" && (
                  <OnlyForSuperUser user={user} yes={() => (
                    <Box sx={{ pl: 2, borderLeft: 2, borderColor: 'primary.main' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="WhatsApp do Suporte"
                            value={configSettings.wasuport || ""}
                            onChange={handleTextSetting("wasuport")}
                            onBlur={handleSaveTextSetting("wasuport")}
                            size="small"
                            InputProps={{
                              startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Mensagem do Suporte"
                            value={configSettings.msgsuport || ""}
                            onChange={handleTextSetting("msgsuport")}
                            onBlur={handleSaveTextSetting("msgsuport")}
                            size="small"
                            InputProps={{
                              startAdornment: <MessageIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )} />
                )}
              </Stack>
            </CardContent>
          </StyledCard>

          {/* SMTP */}
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 16, color: theme.palette.primary.main }} />
                <Typography variant="h6">Configurações SMTP</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Servidor SMTP"
                    value={configSettings.smtpauth || ""}
                    onChange={handleTextSetting("smtpauth")}
                    onBlur={handleSaveTextSetting("smtpauth")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Usuário SMTP"
                    value={configSettings.usersmtpauth || ""}
                    onChange={handleTextSetting("usersmtpauth")}
                    onBlur={handleSaveTextSetting("usersmtpauth")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Senha SMTP"
                    type="password"
                    value={configSettings.clientsecretsmtpauth || ""}
                    onChange={handleTextSetting("clientsecretsmtpauth")}
                    onBlur={handleSaveTextSetting("clientsecretsmtpauth")}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Porta SMTP"
                    value={configSettings.smtpport || ""}
                    onChange={handleTextSetting("smtpport")}
                    onBlur={handleSaveTextSetting("smtpport")}
                    size="small"
                  />
                </Grid>
              </Grid>
              <FormHelperText sx={{ mt: 1 }}>
                Configure o servidor SMTP para envio de e-mails do sistema
              </FormHelperText>
            </CardContent>
          </StyledCard>

          {/* Limite de Download */}
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FontAwesomeIcon icon={faFileExport} style={{ marginRight: 16, color: theme.palette.primary.main }} />
                <Typography variant="h6">Limite de Download</Typography>
              </Box>
              
              <FormControl>
                <TextField
                  select
                  label="Limite de download de arquivos"
                  value={configSettings.downloadLimit || "64"}
                  onChange={(e) => updateSetting("downloadLimit", e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
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
                  Define o tamanho máximo para download de arquivos
                </FormHelperText>
              </FormControl>
            </CardContent>
          </StyledCard>
        </Stack>
      </Grid>
    </Grid>
  ), [configSettings, updateSetting, handleTextSetting, handleSaveTextSetting, user, theme]);

  const renderContent = () => {
    switch (activeSection) {
      case 0:
        return GeneralSettings;
      case 1:
        return IntegrationsSettings;
      case 2:
        return AdvancedSettings;
      default:
        return GeneralSettings;
    }
  };

  if (!settings || settings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Carregando configurações...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Navegação por seções */}
      <Paper sx={{ mb: 3 }}>
        <Stack direction={isMobile ? "column" : "row"} spacing={0}>
          {sections.map((section, index) => (
            <BaseButton
              key={index}
              variant={activeSection === index ? "contained" : "text"}
              onClick={() => setActiveSection(index)}
              icon={section.icon}
              fullWidth={isMobile}
              sx={{ 
                borderRadius: 0,
                flexGrow: 1,
                justifyContent: isMobile ? "flex-start" : "center"
              }}
            >
              {section.title}
            </BaseButton>
          ))}
        </Stack>
      </Paper>

      {/* Conteúdo da seção ativa */}
      <Box>
        {renderContent()}
      </Box>

      {/* Indicador de alterações não salvas */}
      {hasChanges && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Você tem alterações não salvas. Elas serão salvas automaticamente ao sair do campo.
          </Typography>
        </Alert>
      )}
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
  scheduleTypeChanged: () => {},
  enableReasonWhenCloseTicketChanged: () => {}
};

export default React.memo(Options);