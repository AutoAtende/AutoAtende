import React, { useState, useCallback } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "../../helpers/toast";
import { useSpring, animated } from "react-spring";
import { styled } from '@mui/material/styles';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  SmartToy,
  TextFields,
  Tag,
  Token,
  RecordVoiceOver,
  VolumeUp,
  Key,
  Security,
  Language,
  Chat,
  MessageOutlined,
  Settings
} from "@mui/icons-material";
import { i18n } from "../../translate/i18n";
import QueueSelectSingle from "../QueueSelectSingle";
import api from "../../services/api";
import BaseModal from "../shared/BaseModal";

// Esquema de validação usando Yup
const PromptSchema = Yup.object().shape({
  name: Yup.string()
    .min(5, i18n.t("promptModal.validation.nameTooShort"))
    .max(100, i18n.t("promptModal.validation.nameTooLong"))
    .required(i18n.t("promptModal.validation.nameRequired")),
  prompt: Yup.string()
    .min(50, i18n.t("promptModal.validation.promptTooShort"))
    .required(i18n.t("promptModal.validation.promptRequired")),
  voice: Yup.string()
    .required(i18n.t("promptModal.validation.voiceRequired")),
  maxTokens: Yup.number()
    .required(i18n.t("promptModal.validation.maxTokensRequired")),
  temperature: Yup.number()
    .required(i18n.t("promptModal.validation.temperatureRequired")),
  apiKey: Yup.string()
    .required(i18n.t("promptModal.validation.apiKeyRequired")),
  queueId: Yup.number()
    .required(i18n.t("promptModal.validation.queueRequired")),
  maxMessages: Yup.number()
    .required(i18n.t("promptModal.validation.maxMessagesRequired"))
});

// Componente de campo com animação
const AnimatedFormField = ({ label, name, icon, type = "text", multiline = false, rows = 1, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fieldSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 }
  });

  // Obter mensagem de tooltip baseada no nome do campo
  const getTooltip = useCallback((fieldName) => {
    return i18n.t(`promptModal.tooltips.${fieldName}`);
  }, []);

  return (
    <animated.div style={fieldSpring}>
      <Tooltip title={getTooltip(name)} placement="top">
        <Field
          as={TextField}
          label={label}
          name={name}
          type={type}
          variant="outlined"
          margin="dense"
          fullWidth
          multiline={multiline}
          rows={rows}
          InputProps={{
            startAdornment: icon && (
              <InputAdornment position="start">
                {icon}
              </InputAdornment>
            ),
            ...props.InputProps
          }}
          {...props}
        />
      </Tooltip>
    </animated.div>
  );
};

// Componente principal
const PromptModal = ({ open, onClose, promptId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("texto");
  const [promptData, setPromptData] = useState({
    name: "",
    prompt: "",
    voice: "texto",
    voiceKey: "",
    voiceRegion: "",
    maxTokens: 100,
    temperature: 1,
    apiKey: "",
    queueId: null,
    maxMessages: 10
  });

  // Buscar dados do prompt se existir ID
  const fetchPromptData = useCallback(async () => {
    if (!promptId) return;
    
    try {
      const { data } = await api.get(`/prompt/${promptId}`);
      setPromptData(data);
      setSelectedVoice(data.voice);
    } catch (err) {
      toast.error(err);
    }
  }, [promptId]);

  // Alternar visibilidade da API Key
  const handleToggleApiKey = useCallback(() => {
    setShowApiKey(prev => !prev);
  }, []);

  // Manipular mudança na seleção de voz
  const handleChangeVoice = useCallback((e) => {
    setSelectedVoice(e.target.value);
  }, []);

  // Resetar estados ao fechar
  const handleClose = useCallback(() => {
    setSelectedVoice("texto");
    onClose();
  }, [onClose]);

  // Salvar prompt
  const handleSavePrompt = useCallback(async (values, { setSubmitting }) => {
    const promptPayload = { ...values, voice: selectedVoice };
    
    if (!values.queueId) {
      toast.error(i18n.t("promptModal.validation.queueRequired"));
      setSubmitting(false);
      return;
    }
    
    try {
      if (promptId) {
        await api.put(`/prompt/${promptId}`, promptPayload);
      } else {
        await api.post("/prompt", promptPayload);
      }
      toast.success(i18n.t("promptModal.success"));
      handleClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [promptId, selectedVoice, handleClose]);

  // Efeito para carregar dados ao abrir o modal
  React.useEffect(() => {
    if (open) {
      fetchPromptData();
    }
  }, [open, fetchPromptData]);

  return (
    <Formik
      initialValues={promptData}
      validationSchema={PromptSchema}
      enableReinitialize
      onSubmit={handleSavePrompt}
    >
      {({ touched, errors, isSubmitting, handleSubmit }) => {
        // Configurar ações para o modal dentro do render props do Formik
        const modalActions = [
          {
            label: i18n.t("promptModal.buttons.cancel"),
            onClick: handleClose,
            color: "secondary",
            variant: "outlined",
          },
          {
            label: promptId 
              ? i18n.t("promptModal.buttons.okEdit") 
              : i18n.t("promptModal.buttons.okAdd"),
            onClick: () => handleSubmit(), // Usar handleSubmit do Formik
            color: "primary",
            variant: "contained",
            disabled: isSubmitting
          }
        ];
        
        return (
          <BaseModal
            open={open}
            onClose={handleClose}
            title={promptId
              ? i18n.t("promptModal.title.edit")
              : i18n.t("promptModal.title.add")
            }
            maxWidth="md"
            helpText={i18n.t("promptModal.helpText")}
            actions={modalActions}
            loading={isSubmitting}
          >
            <Form>
              <AnimatedFormField
                label={i18n.t("promptModal.form.name")}
                name="name"
                icon={<SmartToy color="primary" />}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />

              <AnimatedFormField
                label={i18n.t("promptModal.form.apikey")}
                name="apiKey"
                icon={<Security color="primary" />}
                type={showApiKey ? 'text' : 'password'}
                error={touched.apiKey && Boolean(errors.apiKey)}
                helperText={touched.apiKey && errors.apiKey}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleApiKey} size="large" edge="end">
                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <AnimatedFormField
                label={i18n.t("promptModal.form.prompt")}
                name="prompt"
                icon={<TextFields color="primary" />}
                error={touched.prompt && Boolean(errors.prompt)}
                helperText={touched.prompt && errors.prompt}
                multiline
                rows={isMobile ? 5 : 10}
              />

              <QueueSelectSingle
                name="queueId"
                error={touched.queueId && Boolean(errors.queueId)}
                helperText={touched.queueId && errors.queueId}
              />

              <FormControl fullWidth margin="dense" variant="outlined">
                <Tooltip title={i18n.t("promptModal.tooltips.voice")}>
                  <div>
                    <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                    <Select
                      labelId="voice-select-label"
                      id="voice-select"
                      value={selectedVoice}
                      onChange={handleChangeVoice}
                      label={i18n.t("promptModal.form.voice")}
                      startAdornment={
                        <InputAdornment position="start">
                          <RecordVoiceOver color="primary" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="texto">Texto</MenuItem>
                      <MenuItem value="pt-BR-FranciscaNeural">Francisa</MenuItem>
                      <MenuItem value="pt-BR-AntonioNeural">Antônio</MenuItem>
                      <MenuItem value="pt-BR-BrendaNeural">Brenda</MenuItem>
                      <MenuItem value="pt-BR-DonatoNeural">Donato</MenuItem>
                      <MenuItem value="pt-BR-ElzaNeural">Elza</MenuItem>
                      <MenuItem value="pt-BR-FabioNeural">Fábio</MenuItem>
                      <MenuItem value="pt-BR-GiovannaNeural">Giovanna</MenuItem>
                      <MenuItem value="pt-BR-HumbertoNeural">Humberto</MenuItem>
                      <MenuItem value="pt-BR-JulioNeural">Julio</MenuItem>
                      <MenuItem value="pt-BR-LeilaNeural">Leila</MenuItem>
                      <MenuItem value="pt-BR-LeticiaNeural">Letícia</MenuItem>
                      <MenuItem value="pt-BR-ManuelaNeural">Manuela</MenuItem>
                      <MenuItem value="pt-BR-NicolauNeural">Nicolau</MenuItem>
                      <MenuItem value="pt-BR-ValerioNeural">Valério</MenuItem>
                      <MenuItem value="pt-BR-YaraNeural">Yara</MenuItem>
                    </Select>
                  </div>
                </Tooltip>
              </FormControl>

              <div style={{ display: 'flex', gap: theme.spacing(2), flexWrap: 'wrap' }}>
                <AnimatedFormField
                  label={i18n.t("promptModal.form.voiceKey")}
                  name="voiceKey"
                  icon={<Key color="primary" />}
                  error={touched.voiceKey && Boolean(errors.voiceKey)}
                  helperText={touched.voiceKey && errors.voiceKey}
                  style={{ flex: 1, minWidth: isMobile ? '100%' : '45%' }}
                />

                <AnimatedFormField
                  label={i18n.t("promptModal.form.voiceRegion")}
                  name="voiceRegion"
                  icon={<Language color="primary" />}
                  error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                  helperText={touched.voiceRegion && errors.voiceRegion}
                  style={{ flex: 1, minWidth: isMobile ? '100%' : '45%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: theme.spacing(2), flexWrap: 'wrap' }}>
                <AnimatedFormField
                  label={i18n.t("promptModal.form.temperature")}
                  name="temperature"
                  icon={<Settings color="primary" />}
                  type="number"
                  error={touched.temperature && Boolean(errors.temperature)}
                  helperText={touched.temperature && errors.temperature}
                  style={{ flex: 1, minWidth: isMobile ? '100%' : '30%' }}
                />

                <AnimatedFormField
                  label={i18n.t("promptModal.form.max_tokens")}
                  name="maxTokens"
                  icon={<Token color="primary" />}
                  type="number"
                  error={touched.maxTokens && Boolean(errors.maxTokens)}
                  helperText={touched.maxTokens && errors.maxTokens}
                  style={{ flex: 1, minWidth: isMobile ? '100%' : '30%' }}
                />

                <AnimatedFormField
                  label={i18n.t("promptModal.form.max_messages")}
                  name="maxMessages"
                  icon={<MessageOutlined color="primary" />}
                  type="number"
                  error={touched.maxMessages && Boolean(errors.maxMessages)}
                  helperText={touched.maxMessages && errors.maxMessages}
                  style={{ flex: 1, minWidth: isMobile ? '100%' : '30%' }}
                />
              </div>
            </Form>
          </BaseModal>
        );
      }}
    </Formik>
  );
};

export default PromptModal;