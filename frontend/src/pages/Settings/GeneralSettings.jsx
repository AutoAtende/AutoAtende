import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
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
  Chip
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
  CheckCircle as CheckIcon
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import useAuth from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  borderRadius: 12,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
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
  icon 
}) => {
  const handleChange = useCallback((event) => {
    onChange(id, event.target.value);
  }, [id, onChange]);

  return (
    <StyledPaper elevation={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
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
  icon: PropTypes.node
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

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      const settingsData = await getAll(companyId);
      
      // Converter array para objeto
      const settingsObj = {};
      if (Array.isArray(settingsData)) {
        settingsData.forEach(setting => {
          if (setting?.key) {
            settingsObj[setting.key] = setting.value || "";
          }
        });
      }
      
      setSettings(settingsObj);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, getAll]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handler para mudanças nas configurações
  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setPendingChanges(prev => ({ ...prev, [key]: value }));
    
    if (!snackbarOpen) {
      setSnackbarMessage("Alterações pendentes. Clique em Salvar para aplicar.");
      setSnackbarOpen(true);
    }
  }, [snackbarOpen]);

  // Salvar todas as alterações
  const handleSaveAll = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info("Não há alterações para salvar");
      return;
    }

    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      // Salvar cada configuração alterada
      const promises = Object.entries(pendingChanges).map(([key, value]) =>
        update({ key, value, companyId })
      );
      
      await Promise.all(promises);
      
      setPendingChanges({});
      setSnackbarOpen(false);
      toast.success("Configurações salvas com sucesso!");
      
      // Recarregar para garantir sincronização
      await loadSettings();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }, [pendingChanges, user?.companyId, update, loadSettings]);

  // Preparar estatísticas
  const stats = [
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
  ];

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
      subtitle="Configure as opções gerais do sistema"
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
        title="Parâmetros do Sistema"
        description="Configure o comportamento e funcionalidades do sistema"
        icon={<SettingsIcon />}
        stats={stats}
        variant="default"
      >
        {/* Configurações Gerais */}
        <SectionTitle variant="h6">
          <BusinessIcon />
          Configurações da Empresa
        </SectionTitle>
        
        <Grid container spacing={2}>
          {user?.super && (
            <>
              <Grid item xs={12}>
                <SettingSelect
                  id="trialExpiration"
                  label={i18n.t("optionsPage.trialExpiration")}
                  value={settings.trialExpiration || "7"}
                  options={[
                    { value: "3", label: "3 dias" },
                    { value: "7", label: "7 dias" },
                    { value: "15", label: "15 dias" },
                    { value: "30", label: "30 dias" }
                  ]}
                  onChange={handleSettingChange}
                  helpText={i18n.t("optionsPage.trialExpirationHelp")}
                  icon={<BusinessIcon color="primary" />}
                />
              </Grid>

              <Grid item xs={12}>
                <SettingSwitch
                  id="allowSignup"
                  label={i18n.t("optionsPage.enableRegisterInSignup")}
                  value={settings.allowSignup || "disabled"}
                  onChange={handleSettingChange}
                  helpText={i18n.t("optionsPage.enableRegisterInSignupHelp")}
                  icon={<PersonIcon color="primary" />}
                />
              </Grid>

              <Grid item xs={12}>
                <SettingSwitch
                  id="sendEmailWhenRegister"
                  label={i18n.t("optionsPage.sendEmailInRegister")}
                  value={settings.sendEmailWhenRegister || "disabled"}
                  onChange={handleSettingChange}
                  helpText={i18n.t("optionsPage.sendEmailInRegisterHelp")}
                  icon={<EmailIcon color="primary" />}
                />
              </Grid>

              <Grid item xs={12}>
                <SettingSwitch
                  id="sendMessageWhenRegister"
                  label={i18n.t("optionsPage.sendMessageWhenRegiter")}
                  value={settings.sendMessageWhenRegister || "disabled"}
                  onChange={handleSettingChange}
                  helpText={i18n.t("optionsPage.sendMessageWhenRegiterHelp")}
                  icon={<MessageIcon color="primary" />}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <SettingSelect
              id="scheduleType"
              label={i18n.t("optionsPage.expedient")}
              value={settings.scheduleType || "disabled"}
              options={[
                { value: "disabled", label: i18n.t("optionsPage.buttons.off") },
                { value: "company", label: i18n.t("optionsPage.buttons.partner") },
                { value: "queue", label: i18n.t("optionsPage.buttons.quee") }
              ]}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.expedientHelp")}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Configurações de Atendimento */}
        <SectionTitle variant="h6">
          <SupportIcon />
          Configurações de Atendimento
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="CheckMsgIsGroup"
              label={i18n.t("optionsPage.ignore")}
              value={settings.CheckMsgIsGroup || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.ignoreHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="sendQueuePosition"
              label={i18n.t("optionsPage.sendQueuePosition")}
              value={settings.sendQueuePosition || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.sendQueuePositionHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="settingsUserRandom"
              label={i18n.t("optionsPage.settingsUserRandom")}
              value={settings.settingsUserRandom || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.settingsUserRandomHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="userRating"
              label={i18n.t("optionsPage.calif")}
              value={settings.userRating || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.califHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="sendGreetingMessageOneQueues"
              label={i18n.t("optionsPage.greeatingOneQueue")}
              value={settings.sendGreetingMessageOneQueues || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.greeatingOneQueueHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="SettingsTransfTicket"
              label={i18n.t("optionsPage.sendagent")}
              value={settings.SettingsTransfTicket || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.sendagentHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSelect
              id="quickMessages"
              label={i18n.t("optionsPage.speedMessage")}
              value={settings.quickMessages || "individual"}
              options={[
                { value: "company", label: i18n.t("optionsPage.byCompany") },
                { value: "individual", label: i18n.t("optionsPage.byUser") }
              ]}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.speedMessageHelp")}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Configurações de Encerramento */}
        <SectionTitle variant="h6">
          <BuildIcon />
          Configurações de Encerramento de Tickets
        </SectionTitle>

        <Alert severity="info" sx={{ mb: 2 }}>
          Apenas uma opção de encerramento pode estar ativa por vez
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="enableReasonWhenCloseTicket"
              label={i18n.t("optionsPage.enableReasonWhenCloseTicket")}
              value={settings.enableReasonWhenCloseTicket || "disabled"}
              onChange={(key, value) => {
                if (value === "enabled") {
                  handleSettingChange("enableQueueWhenCloseTicket", "disabled");
                  handleSettingChange("enableTagsWhenCloseTicket", "disabled");
                }
                handleSettingChange(key, value);
              }}
              helpText={i18n.t("optionsPage.enableReasonWhenCloseTicketHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableQueueWhenCloseTicket"
              label={i18n.t("optionsPage.enableQueueWhenCloseTicket")}
              value={settings.enableQueueWhenCloseTicket || "disabled"}
              onChange={(key, value) => {
                if (value === "enabled") {
                  handleSettingChange("enableReasonWhenCloseTicket", "disabled");
                  handleSettingChange("enableTagsWhenCloseTicket", "disabled");
                }
                handleSettingChange(key, value);
              }}
              helpText={i18n.t("optionsPage.enableQueueWhenCloseTicketHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableTagsWhenCloseTicket"
              label={i18n.t("optionsPage.enableTagsWhenCloseTicket")}
              value={settings.enableTagsWhenCloseTicket || "disabled"}
              onChange={(key, value) => {
                if (value === "enabled") {
                  handleSettingChange("enableReasonWhenCloseTicket", "disabled");
                  handleSettingChange("enableQueueWhenCloseTicket", "disabled");
                }
                handleSettingChange(key, value);
              }}
              helpText={i18n.t("optionsPage.enableTagsWhenCloseTicketHelp")}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Configurações de Exibição */}
        <SectionTitle variant="h6">
          <TuneIcon />
          Configurações de Exibição
        </SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SettingSwitch
              id="displayProfileImages"
              label={i18n.t("optionsPage.displayProfileImages")}
              value={settings.displayProfileImages || "enabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.displayProfileImagesHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableTicketValueAndSku"
              label={i18n.t("optionsPage.showSKU")}
              value={settings.enableTicketValueAndSku || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.showSKUHelp")}
            />
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="displayContactInfo"
              label={i18n.t("optionsPage.displayContactInfo")}
              value={settings.displayContactInfo || "enabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.displayContactInfoHelp")}
              disabled={settings.displayBusinessInfo === "enabled"}
            />
            {settings.displayBusinessInfo === "enabled" && (
              <Typography color="error" variant="caption" sx={{ ml: 4, display: "block" }}>
                {i18n.t("optionsPage.displayContactInfoDisabled")}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="displayBusinessInfo"
              label={i18n.t("optionsPage.displayBusinessInfo")}
              value={settings.displayBusinessInfo || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.displayBusinessInfoHelp")}
              disabled={settings.displayContactInfo === "enabled"}
            />
            {settings.displayContactInfo === "enabled" && (
              <Typography color="error" variant="caption" sx={{ ml: 4, display: "block" }}>
                {i18n.t("optionsPage.displayBusinessInfoDisabled")}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <SettingSwitch
              id="enableSaveCommonContacts"
              label={i18n.t("optionsPage.enableSaveCommonContacts")}
              value={settings.enableSaveCommonContacts || "disabled"}
              onChange={handleSettingChange}
              helpText={i18n.t("optionsPage.enableSaveCommonContactsHelp")}
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