import React, { useState, useEffect, useCallback, useContext } from "react";
import { styled } from '@mui/material/styles';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  useMediaQuery,
  Alert,
  CircularProgress,
  Button,
  Typography,
  Snackbar
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpIcon from '@mui/icons-material/Help';
import LabelIcon from '@mui/icons-material/Label';
import PaymentIcon from '@mui/icons-material/Payment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SaveIcon from '@mui/icons-material/Save';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import TabPanel from "../../components/TabPanel";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";

// Componentes de configurações
import Options from "../../components/Settings/Options";
import SchedulesForm from "../../components/SchedulesForm";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Whitelabel from "../../components/Settings/Whitelabel";
import PaymentGateway from "../../components/Settings/PaymentGateway";
import Reason from "../../components/Reason";

// Componente para telas móveis
import SpeedDialTabs from "../../components/SpeedDialTabs";

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) return [value];
  return [];
};

// Estilos
const StyledMainPaper = styled(Paper)(({ theme }) => ({
  ...theme.scrollbarStyles,
  overflowY: "scroll",
  flex: 1,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: 4,
  marginBottom: theme.spacing(2)
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme.scrollbarStyles,
  overflowY: "scroll",
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  width: "100%",
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),
}));

const SaveAllButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1100,
}));

const Settings = () => {
  // Estados
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("options");
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [data, setData] = useState({
    currentUser: {},
    company: null,
    schedules: [], // Garantir que comece como array
    settings: [],  // Garantir que comece como array
    planConfig: {}
  });
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState("disabled");
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Hooks
  const isMobile = useMediaQuery('(max-width:600px)');

  // Função principal para carregar todos os dados necessários
  const loadAllData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const companyId = user.companyId || localStorage.getItem("companyId");

      const { data: apiData } = await api.get(`/settings/full-configuration/${companyId}`);

      // Garantir que todos os arrays sejam válidos
      const safeSettings = ensureArray(apiData.settings);
      const safeSchedules = ensureArray(apiData.company?.schedules);

      setData({
        currentUser: apiData.user || {},
        company: apiData.company || null,
        schedules: safeSchedules,
        settings: safeSettings,
        planConfig: apiData.planConfig || {}
      });

      // Configurar estados derivados
      const scheduleTypeSetting = safeSettings.find(s => s.key === "scheduleType");
      const reasonSetting = safeSettings.find(s => s.key === "enableReasonWhenCloseTicket");

      setSchedulesEnabled(scheduleTypeSetting?.value === "company");
      setReasonEnabled(reasonSetting?.value || "disabled");
      setShowWhiteLabel(apiData.planConfig?.whiteLabel || false);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(err?.response?.data?.message || err.message || "Erro ao carregar configurações");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [user]);

  // Carregar dados ao iniciar o componente
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Manipuladores
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleScheduleTypeChanged = (value) => {
    setSchedulesEnabled(value === "company");
    setPendingChanges({
      ...pendingChanges,
      scheduleType: value
    });
  };

  const handleEnableReasonWhenCloseTicketChanged = (value) => {
    setReasonEnabled(value || "disabled");
    setPendingChanges({
      ...pendingChanges,
      enableReasonWhenCloseTicket: value
    });
  };

  // Adicionar configuração às alterações pendentes
  const handleSettingChange = useCallback((key, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));

    // Mostra indicador visual de alterações pendentes
    setSnackbarMessage("Alterações pendentes. Clique em Salvar para aplicar.");
    setOpenSnackbar(true);
  }, []);

  // Salvar todas as alterações pendentes
  const handleSaveAllChanges = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info("Não há alterações para salvar");
      return;
    }

    try {
      setIsSaving(true);

      // Agrupar todas as alterações para enviar em uma única requisição
      const settingsToUpdate = Object.entries(pendingChanges).map(([key, value]) => ({
        key,
        value: value.toString()
      }));

      await api.post("/settings/batch-update", {
        settings: settingsToUpdate
      });

      // Atualizar configurações locais
      setData(prevData => {
        const updatedSettings = ensureArray(prevData.settings).map(setting => {
          if (pendingChanges[setting.key] !== undefined) {
            return {
              ...setting,
              value: pendingChanges[setting.key].toString()
            };
          }
          return setting;
        });

        return {
          ...prevData,
          settings: updatedSettings
        };
      });

      // Limpar alterações pendentes
      setPendingChanges({});

      toast.success(i18n.t("settings.saveSuccess"));
      setOpenSnackbar(false);
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      toast.error(i18n.t("settings.saveError"));
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges]);

  // Manipulador para envio de horários
  const handleSubmitSchedules = async (scheduleData) => {
    if (!scheduleData) {
      toast.error("Dados de horários inválidos");
      return;
    }

    setLoading(true);
    try {
      const companyId = data?.company?.id || user.companyId || localStorage.getItem("companyId");

      await api.put(`/companies/${companyId}/schedules`, {
        schedules: scheduleData
      });

      setData(prevData => ({
        ...prevData,
        schedules: scheduleData
      }));

      toast.success("Horários atualizados com sucesso.");

      // Atualizar cache
      try {
        const cachedCompanyDataString = localStorage.getItem('cached_company_data');
        if (cachedCompanyDataString) {
          const parsedCache = JSON.parse(cachedCompanyDataString);
          parsedCache.data.schedules = scheduleData;
          localStorage.setItem('cached_company_data', JSON.stringify(parsedCache));
        }
      } catch (cacheError) {
        console.error("Erro ao atualizar cache de horários:", cacheError);
      }
    } catch (e) {
      console.error("Erro ao atualizar horários:", e);
      toast.error(e?.message || "Erro ao atualizar horários");
    } finally {
      setLoading(false);
    }
  };

  // Montar ações para SpeedDial em modo mobile
  const actions = [
    { icon: <SettingsIcon />, name: i18n.t("settings.tabs.params"), value: "options" },
    schedulesEnabled && { icon: <ScheduleIcon />, name: i18n.t("settings.tabs.schedules"), value: "schedules" },
    data.currentUser.super && { icon: <AssignmentIcon />, name: i18n.t("settings.tabs.plans"), value: "plans" },
    data.currentUser.super && { icon: <HelpIcon />, name: i18n.t("settings.tabs.helps"), value: "helps" },
    showWhiteLabel && { icon: <LabelIcon />, name: "Whitelabel", value: "whitelabel" },
    data.currentUser.super && { icon: <PaymentIcon />, name: "Pagamentos", value: "paymentGateway" },
    reasonEnabled === "enabled" && { icon: <ReportProblemIcon />, name: "Motivos de Encerramento", value: "closureReasons" },
  ].filter(Boolean); // Remove valores falsy (false, undefined, etc)

  // Renderização condicional
  const isShowingContent = !initialLoading && !error;
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>

      <StyledMainPaper elevation={1}>
        {error && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ m: 2 }}
            action={
              <Box
                component="button"
                onClick={loadAllData}
                sx={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  p: 1
                }}
              >
                Tentar novamente
              </Box>
            }
          >
            {error}
          </Alert>
        )}

        {initialLoading && (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        )}

        {isShowingContent && (
          <>
            {isMobile ? (
              <>
                <SpeedDialTabs actions={actions} onChange={setTab} />
                <StyledPaper elevation={0}>
                  <TabPanel className="container" value={tab} name="options">
                    <Options
                      settings={ensureArray(data.settings)}
                      scheduleTypeChanged={handleScheduleTypeChanged}
                      enableReasonWhenCloseTicketChanged={handleEnableReasonWhenCloseTicketChanged}
                      onSettingChange={handleSettingChange}
                      pendingChanges={pendingChanges}
                    />
                  </TabPanel>

                  <TabPanel value={tab} name="schedules">
                    {schedulesEnabled && data.schedules && Array.isArray(data.schedules) && (
                      <SchedulesForm
                        loading={loading}
                        onSubmit={handleSubmitSchedules}
                        initialValues={data.schedules}
                      />
                    )}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="plans">
                    {data.currentUser.super && <PlansManager />}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="helps">
                    {data.currentUser.super && <HelpsManager />}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="paymentGateway">
                    {data.currentUser.super && (
                      <PaymentGateway settings={ensureArray(data.settings)} />
                    )}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="whitelabel">
                    {showWhiteLabel && (
                      <Whitelabel settings={ensureArray(data.settings)} />
                    )}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="closureReasons">
                    {reasonEnabled === "enabled" && <Reason />}
                  </TabPanel>
                </StyledPaper>
              </>
            ) : (
              <>
                <StyledTabs
                  value={tab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  <Tab label={i18n.t("settings.tabs.params")} value="options" />
                  {schedulesEnabled && (
                    <Tab label={i18n.t("settings.tabs.schedules")} value="schedules" />
                  )}
                  {data.currentUser.super && (
                    <Tab label={i18n.t("settings.tabs.plans")} value="plans" />
                  )}
                  {data.currentUser.super && (
                    <Tab label={i18n.t("settings.tabs.helps")} value="helps" />
                  )}
                  {showWhiteLabel && (
                    <Tab label="Whitelabel" value="whitelabel" />
                  )}
                  {data.currentUser.super && (
                    <Tab label="Pagamentos" value="paymentGateway" />
                  )}
                  {reasonEnabled === "enabled" && (
                    <Tab label="Motivos de Encerramento" value="closureReasons" />
                  )}
                </StyledTabs>

                <StyledPaper elevation={0}>
                  <TabPanel className="container" value={tab} name="options">
                    <Options
                      settings={ensureArray(data.settings)}
                      scheduleTypeChanged={handleScheduleTypeChanged}
                      enableReasonWhenCloseTicketChanged={handleEnableReasonWhenCloseTicketChanged}
                      onSettingChange={handleSettingChange}
                      pendingChanges={pendingChanges}
                    />
                  </TabPanel>

                  <TabPanel value={tab} name="schedules">
                    {schedulesEnabled && data.schedules && Array.isArray(data.schedules) && (
                      <SchedulesForm
                        loading={loading}
                        onSubmit={handleSubmitSchedules}
                        initialValues={data.schedules}
                      />
                    )}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="plans">
                    {data.currentUser.super && <PlansManager />}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="helps">
                    {data.currentUser.super && <HelpsManager />}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="paymentGateway">
                    {data.currentUser.super && (
                      <PaymentGateway settings={ensureArray(data.settings)} />
                    )}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="whitelabel">
                    {showWhiteLabel && (
                      <Whitelabel settings={ensureArray(data.settings)} />
                    )}
                  </TabPanel>

                  <TabPanel className="container" value={tab} name="closureReasons">
                    {reasonEnabled === "enabled" && <Reason />}
                  </TabPanel>
                </StyledPaper>
              </>
            )}

            {/* Botão para salvar alterações pendentes */}
            {hasPendingChanges && (
              <SaveAllButton
                variant="contained"
                color="primary"
                startIcon={isSaving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
                onClick={handleSaveAllChanges}
                disabled={isSaving}
              >
                {i18n.t("settings.saveAll")}
              </SaveAllButton>
            )}

            {/* Notificação de alterações pendentes */}
            <Snackbar
              open={openSnackbar && hasPendingChanges}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
              message={snackbarMessage}
              action={
                <Button
                  color="secondary"
                  size="small"
                  onClick={handleSaveAllChanges}
                  disabled={isSaving}
                >
                  Salvar
                </Button>
              }
            />
          </>
        )}
      </StyledMainPaper>
    </MainContainer>
  );
};

export default Settings;