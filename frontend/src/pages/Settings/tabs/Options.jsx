import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { styled, useTheme } from "@mui/material/styles";
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
  Chip,
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
  Build as BuildIcon,
} from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
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
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { copyToClipboard } from "../../../helpers/copyToClipboard";
import { toast } from "../../../helpers/toast";
import useAuth from "../../../hooks/useAuth";

// ----------------------------------------------------------------------------------
// 1. CONSTANTES (ícones, modelos de OpenAI e componentes estilizados)
// ----------------------------------------------------------------------------------

const openAiModels = [
  { value: "o1-preview", label: "O1 Preview" },
  { value: "o1-mini", label: "O1 Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  borderRadius: 4,
  textTransform: "none",
  fontWeight: 500,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const CategoryDivider = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  width: "100%",
}));

const StyledBadge = styled(Avatar)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

// ----------------------------------------------------------------------------------
// 2. COMPONENTES GENÉRICOS REUTILIZÁVEIS
// ----------------------------------------------------------------------------------

/**
 * OptionSwitch: rende um Switch em uma StyledPaper, com label, helper text e lógica de mudança.
 * Props esperadas:
 *   - id: string que identifica a chave no estado configState
 *   - label: texto (pode ser JSX) a ser exibido ao lado do switch
 *   - helpText: texto de ajuda
 *   - checked: string ("enabled" ou "disabled")
 *   - onChange: callback (id, newValue)
 *   - disabled: boolean que desabilita o controle se true
 *   - mutuallyExclusiveGroup: função (id, newValue) que lida com exclusão mútua (opcional)
 */
const OptionSwitch = React.memo(
  ({
    id,
    label,
    helpText,
    checked,
    onChange,
    disabled = false,
    mutuallyExclusiveGroup = null,
  }) => {
    const handleToggle = useCallback(
      (event) => {
        const novoValor = event.target.checked ? "enabled" : "disabled";
        // Se for opção mutuamente exclusiva, usar a função passada
        if (mutuallyExclusiveGroup) {
          mutuallyExclusiveGroup(id, novoValor);
        } else {
          onChange(id, novoValor);
        }
      },
      [id, onChange, mutuallyExclusiveGroup]
    );

    return (
      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={checked === "enabled"}
                  name={id}
                  color="primary"
                  onChange={handleToggle}
                  disabled={disabled}
                />
              }
              label={<Box sx={{ display: "flex", alignItems: "center" }}>{label}</Box>}
            />
          </FormGroup>
          {helpText && <FormHelperText>{helpText}</FormHelperText>}
        </Box>
      </StyledPaper>
    );
  }
);

OptionSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  helpText: PropTypes.string,
  checked: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  mutuallyExclusiveGroup: PropTypes.func,
};

/**
 * OptionSelect: rende um campo Select (TextField com select) dentro de StyledPaper.
 * Props esperadas:
 *   - id: string que identifica a chave no estado configState
 *   - label: string para o label do TextField
 *   - value: valor atual (string)
 *   - options: array de objetos { value, label } para popular o select
 *   - helpText: texto de ajuda
 *   - onChange: callback(id, newValue)
 *   - disabled: boolean que desabilita o controle se true
 *   - startAdornment: componente JSX a ser exibido antes do campo (ícone), opcional
 */
const OptionSelect = React.memo(
  ({
    id,
    label,
    value,
    options,
    helpText,
    onChange,
    disabled = false,
    startAdornment = null,
  }) => {
    const handleSelectChange = useCallback(
      (event) => {
        onChange(id, event.target.value);
      },
      [id, onChange]
    );

    return (
      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <TextField
                  select
                  label={label}
                  value={value}
                  size="small"
                  onChange={handleSelectChange}
                  variant="outlined"
                  margin="normal"
                  disabled={disabled}
                  InputProps={{
                    startAdornment: startAdornment ? <Box mr={1}>{startAdornment}</Box> : null,
                  }}
                >
                  {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                {helpText && <FormHelperText>{helpText}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    );
  }
);

OptionSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  helpText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  startAdornment: PropTypes.node,
};

/**
 * OptionTextField: rende um TextField simples dentro de StyledPaper, útil para entradas de texto/palavra-chave ou JSON.
 * Props esperadas:
 *   - id: string que identifica a chave no estado configState
 *   - label: label do TextField
 *   - value: valor atual (string)
 *   - helpText: texto de ajuda (opcional)
 *   - onChange: callback(id, newValue)
 *   - type: tipo do input ("text", "password", etc.)
 *   - disabled: boolean (opcional)
 *   - multiline: boolean se multiline true (opcional)
 *   - rows: número de linhas quando multiline for true (opcional)
 *   - inputProps: objeto adicional para InputProps (opcional)
 */
const OptionTextField = React.memo(
  ({
    id,
    label,
    value,
    helpText,
    onChange,
    type = "text",
    disabled = false,
    multiline = false,
    rows = 1,
    inputProps = {},
  }) => {
    const handleTextChange = useCallback(
      (event) => {
        onChange(id, event.target.value);
      },
      [id, onChange]
    );

    return (
      <StyledPaper elevation={3}>
        <Box sx={{ p: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id={id}
                name={id}
                label={label}
                size="small"
                fullWidth
                margin="normal"
                variant="outlined"
                value={value}
                onChange={handleTextChange}
                type={type}
                disabled={disabled}
                multiline={multiline}
                rows={rows}
                InputProps={inputProps}
              />
            </Grid>
          </Grid>
          {helpText && <FormHelperText sx={{ mt: 1, mb: 2 }}>{helpText}</FormHelperText>}
        </Box>
      </StyledPaper>
    );
  }
);

OptionTextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  inputProps: PropTypes.object,
};

// ----------------------------------------------------------------------------------
// 3. DEFINIÇÃO DOS DADOS DE CONFIGURAÇÃO (ARRAYS DE OBJETOS POR SEÇÃO)
// ----------------------------------------------------------------------------------

/**
 * Cada objeto de configuração possui:
 *   - id: chave no estado configState
 *   - label: rótulo (JSX ou string)
 *   - helpText: string
 *   - type: "switch" | "select" | "text"
 *   - options: somente para selects (array {value, label})
 *   - disabledIf: função(state) que retorna boolean (opcional)
 *   - mutuallyExclusiveGroup: array de ids de exclusão mútua (opcional)
 *   - startAdornment: componente JSX para TextField ou Select (opcional)
 *   - extraFields: array de subcampos condicionais (opcional)
 *   - multiline / rows: para campos de texto multilinha (opcional)
 */

const GENERAL_OPTIONS = (theme, configState) => [
  // Seção IA / OpenAI — Mantém exemplo, pode ser movida para INTEGRATION_OPTIONS se preferir
  {
    id: "openAiModel",
    label: i18n.t("optionsPage.openaiModel"),
    type: "select",
    options: openAiModels,
    helpText: i18n.t("optionsPage.openaiModelHelp"),
    disabledIf: () => false,
    startAdornment: null,
  },
  {
    id: "enableAudioTranscriptions",
    label:
      i18n.t("optionsPage.enableAudioTranscriptions") || "Ativar transcrição de áudio",
    type: "switch",
    helpText:
      i18n.t("optionsPage.enableAudioTranscriptionsHelp") ||
      "Ativa a transcrição de áudio utilizando o serviço da OpenAI",
    disabledIf: () => false,
  },
  {
    id: "openAiKey",
    label: i18n.t("optionsPage.openAiKey") || "Chave da API OpenAI",
    type: "text",
    helpText:
      i18n.t("optionsPage.openAiKeyHelp") ||
      "Informe a chave da API OpenAI para realizar a transcrição de áudio",
    disabledIf: (state) => state.enableAudioTranscriptions !== "enabled",
    inputProps: {
      type: "password",
      endAdornment: (
        <Box>
          {configState.openAiKey && (
            <Tooltip
              title={i18n.t("optionsPage.copyApiKey") || "Copiar chave"}
            >
              <FileCopyIcon
                sx={{ cursor: "pointer", ml: 1 }}
                onClick={() => {
                  copyToClipboard(configState.openAiKey);
                  toast.success(
                    i18n.t("optionsPage.apiKeyCopied") ||
                      "Chave copiada com sucesso!"
                  );
                }}
              />
            </Tooltip>
          )}
        </Box>
      ),
    },
  },

  // ---------- Configurações Gerais (superusuário) ----------
  {
    id: "trialExpiration",
    label: i18n.t("optionsPage.trialExpiration"),
    type: "select",
    options: [
      { value: "3", label: `3 ${i18n.t("optionsPage.days")}` },
      { value: "7", label: `7 ${i18n.t("optionsPage.days")}` },
      { value: "9", label: `9 ${i18n.t("optionsPage.days")}` },
      { value: "15", label: `15 ${i18n.t("optionsPage.days")}` },
      { value: "30", label: `30 ${i18n.t("optionsPage.days")}` },
    ],
    helpText: i18n.t("optionsPage.trialExpirationHelp"),
    disabledIf: () => false,
    startAdornment: (
      <FontAwesomeIcon
        icon={faBuilding}
        style={{ color: theme.palette.primary.main }}
      />
    ),
    onlyForSuperUser: true,
  },
  {
    id: "allowSignup",
    label: (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        {i18n.t("optionsPage.enableRegisterInSignup")}
      </Box>
    ),
    type: "switch",
    helpText: i18n.t("optionsPage.enableRegisterInSignupHelp"),
    disabledIf: () => false,
    onlyForSuperUser: true,
  },
  {
    id: "sendEmailWhenRegister",
    label: (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        {i18n.t("optionsPage.sendEmailInRegister")}
      </Box>
    ),
    type: "switch",
    helpText: i18n.t("optionsPage.sendEmailInRegisterHelp"),
    disabledIf: () => false,
    onlyForSuperUser: true,
  },
  {
    id: "sendMessageWhenRegister",
    label: (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <MessageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        {i18n.t("optionsPage.sendMessageWhenRegiter")}
      </Box>
    ),
    type: "switch",
    helpText: i18n.t("optionsPage.sendMessageWhenRegiterHelp"),
    disabledIf: () => false,
    onlyForSuperUser: true,
  },

  {
    id: "CheckMsgIsGroup",
    label: i18n.t("optionsPage.ignore"),
    type: "switch",
    helpText: i18n.t("optionsPage.ignoreHelp"),
    disabledIf: () => false,
  },
  {
    id: "sendQueuePosition",
    label: i18n.t("optionsPage.sendQueuePosition"),
    type: "switch",
    helpText: i18n.t("optionsPage.sendQueuePositionHelp"),
    disabledIf: () => false,
  },
  {
    id: "settingsUserRandom",
    label: i18n.t("optionsPage.settingsUserRandom"),
    type: "switch",
    helpText: i18n.t("optionsPage.settingsUserRandomHelp"),
    disabledIf: () => false,
  },
  {
    id: "userRating",
    label: i18n.t("optionsPage.calif"),
    type: "switch",
    helpText: i18n.t("optionsPage.califHelp"),
    disabledIf: () => false,
  },

  // Opções de encerramento de ticket mutuamente exclusivas
  {
    id: "enableReasonWhenCloseTicket",
    label: i18n.t("optionsPage.enableReasonWhenCloseTicket"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableReasonWhenCloseTicketHelp"),
    disabledIf: () => false,
    mutuallyExclusiveGroup: [
      "enableQueueWhenCloseTicket",
      "enableTagsWhenCloseTicket",
    ],
  },
  {
    id: "enableQueueWhenCloseTicket",
    label: i18n.t("optionsPage.enableQueueWhenCloseTicket"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableQueueWhenCloseTicketHelp"),
    disabledIf: () => false,
    mutuallyExclusiveGroup: [
      "enableReasonWhenCloseTicket",
      "enableTagsWhenCloseTicket",
    ],
  },
  {
    id: "enableTagsWhenCloseTicket",
    label: i18n.t("optionsPage.enableTagsWhenCloseTicket"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableTagsWhenCloseTicketHelp"),
    disabledIf: () => false,
    mutuallyExclusiveGroup: [
      "enableReasonWhenCloseTicket",
      "enableQueueWhenCloseTicket",
    ],
  },

  {
    id: "displayProfileImages",
    label: i18n.t("optionsPage.displayProfileImages"),
    type: "switch",
    helpText: i18n.t("optionsPage.displayProfileImagesHelp"),
    disabledIf: () => false,
  },
  {
    id: "enableTicketValueAndSku",
    label: i18n.t("optionsPage.showSKU"),
    type: "switch",
    helpText: i18n.t("optionsPage.showSKUHelp"),
    disabledIf: () => false,
  },

  {
    id: "displayContactInfo",
    label: i18n.t("optionsPage.displayContactInfo"),
    type: "switch",
    helpText: `${i18n.t("optionsPage.displayContactInfoHelp")}`,
    disabledIf: (state) => state.displayBusinessInfo === "enabled",
    extraDisplay: (state) =>
      state.displayBusinessInfo === "enabled" ? (
        <Typography color="error" variant="caption" display="block">
          {i18n.t("optionsPage.displayContactInfoDisabled")}
        </Typography>
      ) : null,
  },
  {
    id: "displayBusinessInfo",
    label: i18n.t("optionsPage.displayBusinessInfo"),
    type: "switch",
    helpText: `${i18n.t("optionsPage.displayBusinessInfoHelp")}`,
    disabledIf: (state) => state.displayContactInfo === "enabled",
    extraDisplay: (state) =>
      state.displayContactInfo === "enabled" ? (
        <Typography color="error" variant="caption" display="block">
          {i18n.t("optionsPage.displayBusinessInfoDisabled")}
        </Typography>
      ) : null,
  },
  {
    id: "enableSaveCommonContacts",
    label: i18n.t("optionsPage.enableSaveCommonContacts"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableSaveCommonContactsHelp"),
    disabledIf: () => false,
  },
  {
    id: "scheduleType",
    label: i18n.t("optionsPage.expedient"),
    type: "select",
    options: [
      { value: "disabled", label: i18n.t("optionsPage.buttons.off") },
      { value: "company", label: i18n.t("optionsPage.buttons.partner") },
      { value: "queue", label: i18n.t("optionsPage.buttons.quee") },
    ],
    helpText: i18n.t("optionsPage.expedientHelp"),
    disabledIf: () => false,
  },
  {
    id: "SettingsTransfTicket",
    label: i18n.t("optionsPage.sendagent"),
    type: "switch",
    helpText: i18n.t("optionsPage.sendagentHelp"),
    disabledIf: () => false,
  },
  {
    id: "sendGreetingMessageOneQueues",
    label: i18n.t("optionsPage.greeatingOneQueue"),
    type: "switch",
    helpText: i18n.t("optionsPage.greeatingOneQueueHelp"),
    disabledIf: () => false,
  },
  {
    id: "quickMessages",
    label: i18n.t("optionsPage.speedMessage"),
    type: "select",
    options: [
      { value: "company", label: i18n.t("optionsPage.byCompany") },
      { value: "individual", label: i18n.t("optionsPage.byUser") },
    ],
    helpText: i18n.t("optionsPage.speedMessageHelp"),
    disabledIf: () => false,
  },
];

/**
 * INTEGRATION_OPTIONS: configuração de integrações (WhatsApp, Meta Pixel, UPSix, Kanban etc.)
 */
const INTEGRATION_OPTIONS = (theme, configState) => [
  // Seção WhatsApp API Oficial
  {
    id: "enableOfficialWhatsapp",
    label: i18n.t("optionsPage.enableOfficialWhatsapp"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableOfficialWhatsappHelp"),
    disabledIf: () => false,
    sectionTitle: {
      icon: <WhatsAppIcon sx={{ color: "#25D366", mr: 1 }} />,
      text: "WhatsApp API Oficial",
    },
  },

  // Seção Meta Pixel
  {
    id: "enableMetaPixel",
    label: i18n.t("optionsPage.enableMetaPixel"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableMetaPixelHelp"),
    disabledIf: () => false,
    sectionTitle: {
      icon: (
        <Avatar sx={{ bgcolor: "#1877F2", width: 28, height: 28 }}>
          <span style={{ fontWeight: "bold", fontSize: "14px", color: "white" }}>
            M
          </span>
        </Avatar>
      ),
      text: "Meta Pixel",
    },
    extraField: {
      id: "metaPixelId",
      label: i18n.t("optionsPage.metaPixelId"),
      type: "text",
      helpText: i18n.t("optionsPage.metaPixelIdHelp"),
      disabledIf: (state) => state.enableMetaPixel !== "enabled",
    },
  },

  // Seção OpenAI (mover para cá, se julgar mais coerente)
  {
    id: "openAiModel",
    label: i18n.t("optionsPage.openaiModel"),
    type: "select",
    options: openAiModels,
    helpText: i18n.t("optionsPage.openaiModelHelp"),
    disabledIf: () => false,
    sectionTitle: {
      icon: (
        <FontAwesomeIcon
          icon={faRobot}
          style={{ marginRight: "8px", color: theme.palette.primary.main }}
        />
      ),
      text: "OpenAI",
    },
  },
  {
    id: "enableAudioTranscriptions",
    label:
      i18n.t("optionsPage.enableAudioTranscriptions") || "Ativar transcrição de áudio",
    type: "switch",
    helpText:
      i18n.t("optionsPage.enableAudioTranscriptionsHelp") ||
      "Ativa a transcrição de áudio utilizando o serviço da OpenAI",
    disabledIf: () => false,
  },
  {
    id: "openAiKey",
    label: i18n.t("optionsPage.openAiKey") || "Chave da API OpenAI",
    type: "text",
    helpText:
      i18n.t("optionsPage.openAiKeyHelp") ||
      "Informe a chave da API OpenAI para realizar a transcrição de áudio",
    disabledIf: (state) => state.enableAudioTranscriptions !== "enabled",
    inputProps: {
      type: "password",
      endAdornment: (
        <Box>
          {configState.openAiKey && (
            <Tooltip
              title={i18n.t("optionsPage.copyApiKey") || "Copiar chave"}
            >
              <FileCopyIcon
                sx={{ cursor: "pointer", ml: 1 }}
                onClick={() => {
                  copyToClipboard(configState.openAiKey);
                  toast.success(
                    i18n.t("optionsPage.apiKeyCopied") ||
                      "Chave copiada com sucesso!"
                  );
                }}
              />
            </Tooltip>
          )}
        </Box>
      ),
    },
  },

  // Seção UPSix
  {
    id: "enableUPSix",
    label: i18n.t("optionsPage.enableUPSix"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableUPSixHelp"),
    disabledIf: () => false,
    sectionTitle: {
      icon: <FontAwesomeIcon icon={faServer} size="xs" />,
      text: "UPSix",
    },
    extraFields: [
      {
        id: "enableUPSixWebphone",
        label: i18n.t("optionsPage.enableUPSixWebphone"),
        type: "switch",
        helpText: i18n.t("optionsPage.enableUPSixWebphoneHelp"),
        disabledIf: (state) => state.enableUPSix !== "enabled",
      },
      {
        id: "enableUPSixNotifications",
        label: i18n.t("optionsPage.enableUPSixNotifications"),
        type: "switch",
        helpText: i18n.t("optionsPage.enableUPSixNotificationsHelp"),
        disabledIf: (state) => state.enableUPSix !== "enabled",
      },
    ],
  },

  // ---------- NOVAS CONFIGURAÇÕES DE KANBAN ----------
  {
    id: "kanban_auto_create_cards",
    label: "Criar cartões automaticamente no Kanban",
    type: "switch",
    helpText:
      "Habilita a criação automática de cartões no Kanban ao criar tickets",
    disabledIf: () => false,
    sectionTitle: {
      icon: (
        <FontAwesomeIcon
          icon={faList}
          style={{ marginRight: "8px", color: theme.palette.primary.main }}
        />
      ),
      text: "Kanban",
    },
  },
  {
    id: "kanban_auto_sync_status",
    label: "Sincronizar status automaticamente com o Kanban",
    type: "switch",
    helpText:
      "Sincroniza automaticamente o status dos tickets com o quadro Kanban",
    disabledIf: () => false,
  },
  {
    id: "kanban_default_board_id",
    label: "ID padrão do quadro Kanban",
    type: "text",
    helpText:
      "Informe o ID do quadro Kanban que será utilizado por padrão",
    disabledIf: () => false,
  },
  {
    id: "kanban_lane_status_mapping",
    label: "Mapeamento de status para colunas do Kanban",
    type: "text",
    helpText:
      "JSON de mapeamento de status de ticket para colunas do Kanban",
    disabledIf: () => false,
    multiline: true,
    rows: 4,
  },
  {
    id: "kanban_auto_archive_closed",
    label: "Arquivar automaticamente tickets fechados no Kanban",
    type: "switch",
    helpText:
      "Arquiva automaticamente os cartões quando o ticket for fechado",
    disabledIf: () => false,
  },
];

/**
 * ADVANCED_OPTIONS: configurações avançadas (Download, Pesquisa de Satisfação, Suporte, SMTP, etc.)
 */
const ADVANCED_OPTIONS = (theme, configState) => [
  {
    id: "downloadLimit",
    label: i18n.t("optionsPage.downloadLimit"),
    type: "select",
    options: [
      { value: "32", label: "32 MB" },
      { value: "64", label: "64 MB" },
      { value: "128", label: "128 MB" },
      { value: "256", label: "256 MB" },
      { value: "512", label: "512 MB" },
      { value: "1024", label: "1 GB" },
      { value: "2048", label: "2 GB" },
    ],
    helpText: i18n.t("optionsPage.downloadLimitHelp"),
    disabledIf: () => false,
    sectionTitle: {
      icon: <AssessmentOutlined sx={{ mr: 1, color: theme.palette.primary.main }} />,
      text: i18n.t("optionsPage.satisfactionSurveyTitle"),
    },
  },
  {
    id: "enableSatisfactionSurvey",
    label: i18n.t("optionsPage.enableSatisfactionSurvey"),
    type: "switch",
    helpText: i18n.t("optionsPage.enableSatisfactionSurveyHelp"),
    disabledIf: () => false,
  },
  {
    id: "callSuport",
    label: (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <SupportIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        {i18n.t("optionsPage.callSuport")}
      </Box>
    ),
    type: "switch",
    helpText: i18n.t("optionsPage.callSuportHelp"),
    disabledIf: () => false,
    extraFields: [
      {
        id: "waSuportType",
        label: i18n.t("optionsPage.wasuport"),
        type: "text",
        helpText: null,
        disabledIf: (state) => state.callSuport !== "enabled",
        inputProps: {
          startAdornment: (
            <Box mr={1}>
              <PhoneIcon fontSize="small" color="primary" />
            </Box>
          ),
          inputProps: { pattern: "[0-9]*" },
        },
        onlyForSuperUser: true,
      },
      {
        id: "msgSuportType",
        label: i18n.t("optionsPage.msgsuport"),
        type: "text",
        helpText: null,
        disabledIf: (state) => state.callSuport !== "enabled",
        inputProps: {
          startAdornment: (
            <Box mr={1}>
              <MessageIcon fontSize="small" color="primary" />
            </Box>
          ),
        },
        onlyForSuperUser: true,
      },
    ],
  },
  {
    id: "smtpauthType",
    label: i18n.t("optionsPage.smtpServer"),
    type: "text",
    helpText: null,
    disabledIf: () => false,
    onlyForSuperUser: true,
  },
  {
    id: "usersmtpauthType",
    label: i18n.t("optionsPage.smtpUser"),
    type: "text",
    helpText: null,
    disabledIf: () => false,
    onlyForSuperUser: true,
  },
  {
    id: "clientsecretsmtpauthType",
    label: i18n.t("optionsPage.smtpPassword"),
    type: "text",
    helpText: null,
    disabledIf: () => false,
    onlyForSuperUser: true,
    inputProps: { type: "password" },
  },
  {
    id: "smtpPortType",
    label: i18n.t("optionsPage.smtpPort"),
    type: "text",
    helpText: i18n.t("optionsPage.smtpHelp"),
    disabledIf: () => false,
    onlyForSuperUser: true,
  },
];

// ----------------------------------------------------------------------------------
// 4. COMPONENTE PRINCIPAL: Options
// ----------------------------------------------------------------------------------

const Options = ({
  settings,
  scheduleTypeChanged,
  enableReasonWhenCloseTicketChanged,
  onSettingChange,
  pendingChanges,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentTab, setCurrentTab] = useState(0);

  // Estado local que armazena todos os valores de configuração
  const [configState, setConfigState] = useState({
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
    metaPixelId: "",

    // NOVAS CONFIGURAÇÕES DE KANBAN
    kanban_auto_create_cards: "disabled",
    kanban_auto_sync_status: "enabled",
    kanban_default_board_id: "",
    kanban_lane_status_mapping: JSON.stringify(
      {
        Pendente: "pending",
        Novo: "pending",
        "Em Atendimento": "open",
        "Em Progresso": "open",
        Aberto: "open",
        "Aguardando Cliente": "pending",
        "Aguardando Resposta": "pending",
        Resolvido: "closed",
        Finalizado: "closed",
        "Concluído": "closed",
        Fechado: "closed",
      },
      null,
      2
    ),
    kanban_auto_archive_closed: "enabled",

    // SMTP
    smtpauthType: "",
    usersmtpauthType: "",
    clientsecretsmtpauthType: "",
    smtpPortType: "",

    // Suporte
    waSuportType: "",
    msgSuportType: "",
  });

  // --------------------------------------------------------------------------------
  // carregamento inicial de 'settings' vindas do backend
  // --------------------------------------------------------------------------------
  useEffect(() => {
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      console.warn("Settings não é um array válido:", settings);
      return;
    }

    try {
      const settingsMap = {};
      settings.forEach((setting) => {
        if (setting && setting.key) {
          settingsMap[setting.key] = setting.value;
        }
      });

      setConfigState((prevState) => {
        const newState = { ...prevState };
        Object.keys(newState).forEach((key) => {
          let settingKey = key;
          if (key === "openAiModel") settingKey = "openaiModel";
          else if (key === "smtpauthType") settingKey = "smtpauth";
          else if (key === "usersmtpauthType") settingKey = "usersmtpauth";
          else if (key === "clientsecretsmtpauthType")
            settingKey = "clientsecretsmtpauth";
          else if (key === "smtpPortType") settingKey = "smtpport";
          else if (key === "waSuportType") settingKey = "wasuport";
          else if (key === "msgSuportType") settingKey = "msgsuport";

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

  // --------------------------------------------------------------------------------
  // função helper para notificar backend sobre mudanças, mapeando chaves especiais
  // --------------------------------------------------------------------------------
  const notifyBackend = useCallback(
    (key, value) => {
      let backendKey = key;
      if (key === "openAiModel") backendKey = "openaiModel";
      else if (key === "smtpauthType") backendKey = "smtpauth";
      else if (key === "usersmtpauthType") backendKey = "usersmtpauth";
      else if (key === "clientsecretsmtpauthType")
        backendKey = "clientsecretsmtpauth";
      else if (key === "smtpPortType") backendKey = "smtpport";
      else if (key === "waSuportType") backendKey = "wasuport";
      else if (key === "msgSuportType") backendKey = "msgsuport";

      onSettingChange(backendKey, value);

      if (
        key === "scheduleType" &&
        typeof scheduleTypeChanged === "function"
      ) {
        scheduleTypeChanged(value);
      }
      if (
        key === "enableReasonWhenCloseTicket" &&
        typeof enableReasonWhenCloseTicketChanged === "function"
      ) {
        enableReasonWhenCloseTicketChanged(value);
      }
    },
    [onSettingChange, scheduleTypeChanged, enableReasonWhenCloseTicketChanged]
  );

  // --------------------------------------------------------------------------------
  // handleConfigChange: atualiza estado local e notifica backend
  // --------------------------------------------------------------------------------
  const handleConfigChange = useCallback(
    (id, newValue) => {
      setConfigState((prev) => ({ ...prev, [id]: newValue }));
      notifyBackend(id, newValue);
    },
    [notifyBackend]
  );

  // --------------------------------------------------------------------------------
  // handleMutuallyExclusive: garante que apenas uma opção mutualmente exclusiva esteja habilitada
  // --------------------------------------------------------------------------------
  const handleMutuallyExclusive = useCallback(
    (id, newValue, exclusiveList) => {
      if (newValue === "enabled" && Array.isArray(exclusiveList)) {
        exclusiveList.forEach((otherId) => {
          if (configState[otherId] === "enabled") {
            handleConfigChange(otherId, "disabled");
          }
        });
        toast.info(i18n.t("optionsPage.onlyOneCloseOptionActive"));
      }
      handleConfigChange(id, newValue);
    },
    [configState, handleConfigChange]
  );

  // --------------------------------------------------------------------------------
  // renderiza cada seção dinamicamente, baseado no array de configuração
  // --------------------------------------------------------------------------------
  const renderOptions = useCallback(
    (optionsArray) => {
      return optionsArray.map((opt) => {
        // Se o campo for apenas para superusuário, verificar antes de renderizar
        if (opt.onlyForSuperUser && !user.super) return null;

        const disabled = typeof opt.disabledIf === "function" ? opt.disabledIf(configState) : false;
        const commonProps = {
          id: opt.id,
          label: opt.label,
          helpText: opt.helpText || "",
          checked: configState[opt.id],
          value: configState[opt.id],
          onChange: handleConfigChange,
          disabled,
        };

        // Se tiver sectionTitle, renderizamos um divisor com ícone e texto
        const hasSectionTitle = !!opt.sectionTitle;
        const SectionHeader = hasSectionTitle ? (
          <CategoryDivider key={`divider-${opt.id}`}>
            {opt.sectionTitle.icon}
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {opt.sectionTitle.text}
            </Typography>
          </CategoryDivider>
        ) : null;

        // Caso haja campos extras (ex: subcampos dentro de uma seção expandida)
        if (opt.extraFields && Array.isArray(opt.extraFields)) {
          return (
            <Box key={opt.id}>
              {SectionHeader}
              {/* Renderiza o campo principal */}
              {opt.type === "switch" && (
                <OptionSwitch
                  {...commonProps}
                  mutuallyExclusiveGroup={
                    opt.mutuallyExclusiveGroup
                      ? (id, val) => handleMutuallyExclusive(id, val, opt.mutuallyExclusiveGroup)
                      : null
                  }
                />
              )}
              {opt.type === "select" && (
                <OptionSelect
                  {...commonProps}
                  options={opt.options}
                  startAdornment={opt.startAdornment || null}
                />
              )}
              {/* Subcampos internos, somente se o principal estiver habilitado */}
              {opt.extraFields
                .filter((sub) =>
                  typeof sub.disabledIf === "function" ? !sub.disabledIf(configState) : true
                )
                .map((sub) => {
                  const subDisabled =
                    typeof sub.disabledIf === "function" ? sub.disabledIf(configState) : false;
                  const subProps = {
                    id: sub.id,
                    label: sub.label,
                    helpText: sub.helpText || "",
                    checked: configState[sub.id],
                    value: configState[sub.id],
                    onChange: handleConfigChange,
                    disabled: subDisabled,
                  };
                  if (sub.type === "switch") {
                    return <OptionSwitch key={sub.id} {...subProps} />;
                  }
                  if (sub.type === "text") {
                    return (
                      <OptionTextField
                        key={sub.id}
                        {...subProps}
                        type={sub.inputProps?.type || "text"}
                        multiline={sub.multiline || false}
                        rows={sub.rows || 1}
                        inputProps={sub.inputProps || {}}
                      />
                    );
                  }
                  // outros tipos de subcampos podem ser adicionados aqui
                  return null;
                })}
            </Box>
          );
        }

        // Se houver campo extra independente (ex: metaPixelId, openAiKey)
        if (opt.extraField) {
          return (
            <Box key={opt.id}>
              {SectionHeader}
              {opt.type === "switch" && (
                <OptionSwitch
                  {...commonProps}
                  mutuallyExclusiveGroup={
                    opt.mutuallyExclusiveGroup
                      ? (id, val) => handleMutuallyExclusive(id, val, opt.mutuallyExclusiveGroup)
                      : null
                  }
                />
              )}
              {opt.type === "select" && (
                <OptionSelect
                  {...commonProps}
                  options={opt.options}
                  startAdornment={opt.startAdornment || null}
                />
              )}
              {/* Renderiza o campo extra, somente se habilitado */}
              {opt.id === "enableMetaPixel" && configState.enableMetaPixel === "enabled" && (
                <OptionTextField
                  id={opt.extraField.id}
                  label={opt.extraField.label}
                  value={configState[opt.extraField.id] || ""}
                  onChange={handleConfigChange}
                  helpText={opt.extraField.helpText}
                  disabled={false}
                />
              )}
            </Box>
          );
        }

        // Campo simples (sem extras, sem subcampos)
        return (
          <Box key={opt.id}>
            {SectionHeader}
            {opt.type === "switch" && (
              <OptionSwitch
                {...commonProps}
                mutuallyExclusiveGroup={
                  opt.mutuallyExclusiveGroup
                    ? (id, val) => handleMutuallyExclusive(id, val, opt.mutuallyExclusiveGroup)
                    : null
                }
              />
            )}
            {opt.type === "select" && (
              <OptionSelect
                {...commonProps}
                options={opt.options}
                startAdornment={opt.startAdornment || null}
              />
            )}
            {opt.type === "text" && (
              <OptionTextField
                {...commonProps}
                type={opt.inputProps?.type || "text"}
                multiline={opt.multiline || false}
                rows={opt.rows || 1}
                inputProps={opt.inputProps || {}}
              />
            )}
          </Box>
        );
      });
    },
    [configState, handleConfigChange, handleMutuallyExclusive, user.super]
  );

  // --------------------------------------------------------------------------------
  // renderização das abas (tabs) com as seções correspondentes
  // --------------------------------------------------------------------------------
  const GeneralConfigSection = useMemo(() => {
    return () => (
      <>
        <SectionTitle variant="h6">
          <BusinessIcon color="primary" />
          {i18n.t("optionsPage.general_params")}
        </SectionTitle>
        {renderOptions(GENERAL_OPTIONS(theme, configState))}
      </>
    );
  }, [renderOptions, theme, configState]);

  const IntegrationsSection = useMemo(() => {
    return () => (
      <>
        <SectionTitle variant="h6">
          <FontAwesomeIcon
            icon={faServer}
            style={{ marginRight: "8px", color: theme.palette.primary.main }}
          />
          {i18n.t("optionsPage.integrations")}
        </SectionTitle>
        {renderOptions(INTEGRATION_OPTIONS(theme, configState))}
      </>
    );
  }, [renderOptions, theme, configState]);

  const AdvancedSection = useMemo(() => {
    return () => (
      <>
        <SectionTitle variant="h6">
          <BuildIcon color="primary" />
          {i18n.t("optionsPage.advanced")}
        </SectionTitle>
        {renderOptions(ADVANCED_OPTIONS(theme, configState))}
      </>
    );
  }, [renderOptions, theme, configState]);

  // --------------------------------------------------------------------------------
  // mudança de aba
  // --------------------------------------------------------------------------------
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

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

      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && <GeneralConfigSection />}
        {currentTab === 1 && <IntegrationsSection />}
        {currentTab === 2 && <AdvancedSection />}
      </Box>
    </Box>
  );
};

Options.propTypes = {
  settings: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.any,
    })
  ),
  scheduleTypeChanged: PropTypes.func,
  enableReasonWhenCloseTicketChanged: PropTypes.func,
  onSettingChange: PropTypes.func.isRequired,
  pendingChanges: PropTypes.object,
};

Options.defaultProps = {
  settings: [],
  scheduleTypeChanged: () => {},
  enableReasonWhenCloseTicketChanged: () => {},
  pendingChanges: {},
};

export default React.memo(Options);