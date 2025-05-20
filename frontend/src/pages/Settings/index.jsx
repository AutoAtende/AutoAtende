import React, { useState, useEffect, useCallback } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpIcon from '@mui/icons-material/Help';
import LabelIcon from '@mui/icons-material/Label';
import PaymentIcon from '@mui/icons-material/Payment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { Paper, Tabs, Tab, useMediaQuery, Box, Alert } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import Reason from "../../components/Reason";
import TabPanel from "../../components/TabPanel";
import SpeedDialTabs from "../../components/SpeedDialTabs";

import SchedulesForm from "../../components/SchedulesForm";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";
import PaymentGateway from "../../components/Settings/PaymentGateway";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";

import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import usePlans from "../../hooks/usePlans";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
  },
  tab: {
    backgroundColor: theme.palette.options,
    borderRadius: 4,
  },
  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  }
}));

const Settings = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [error, setError] = useState(null);

  // Configurações
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState("disabled");
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);

  // Hooks
  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { settings } = useSettings();
  const { getPlanCompany } = usePlans();

  const isMobile = useMediaQuery('(max-width:600px)');

  // Função para carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = localStorage.getItem("companyId");
      
      // Carregar usuário atual
      const user = await getCurrentUserInfo();
      setCurrentUser(user);
      
      // Buscar company e plano
      const [company, planConfigs] = await Promise.all([
        find(companyId),
        getPlanCompany(undefined, companyId)
      ]);

      setSchedules(company.schedules);
      setShowWhiteLabel(planConfigs.plan.whiteLabel);

      // Extrair configurações necessárias do settings já disponível no hook
      if (Array.isArray(settings)) {
        // Encontrar configurações de horários e motivos de encerramento
        const scheduleTypeSetting = settings.find(s => s.key === "scheduleType");
        const reasonSetting = settings.find(s => s.key === "enableReasonWhenCloseTicket");
        
        // Definir estados baseados nas configurações
        setSchedulesEnabled(scheduleTypeSetting?.value === "company");
        setReasonEnabled(reasonSetting?.value || "disabled");
      }
    } catch (err) {
      console.error("Erro ao carregar dados iniciais:", err);
      setError(err?.message || "Ocorreu um erro ao carregar as configurações");
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserInfo, find, getPlanCompany, settings]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      const companyId = localStorage.getItem("companyId");
      await updateSchedules({ id: companyId, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const handleScheduleTypeChanged = (value) => {
    setSchedulesEnabled(value === "company");
  };

  const handleEnableReasonWhenCloseTicketChanged = (value) => {
    setReasonEnabled(value || "disabled");
  };

  // Definir as ações disponíveis para as abas
  const actions = [
    { icon: <SettingsIcon />, name: i18n.t("settings.tabs.params"), value: "options" },
    { icon: <ScheduleIcon />, name: i18n.t("settings.tabs.schedules"), value: "schedules", condition: schedulesEnabled },
    { icon: <AssignmentIcon />, name: i18n.t("settings.tabs.plans"), value: "plans", condition: currentUser.super },
    { icon: <HelpIcon />, name: i18n.t("settings.tabs.helps"), value: "helps", condition: currentUser.super },
    { icon: <LabelIcon />, name: "Whitelabel", value: "whitelabel", condition: showWhiteLabel },
    { icon: <PaymentIcon />, name: "Pagamentos", value: "paymentGateway", condition: currentUser.super },
    { icon: <ReportProblemIcon />, name: "Motivos de Encerramento", value: "closureReasons", condition: reasonEnabled === "enabled" },
  ].filter(action => action.condition !== false);

  // Renderizar os painéis de abas
  const renderTabPanels = () => (
    <Paper className={classes.paper} elevation={0}>
      <TabPanel className={classes.container} value={tab} name="options">
        <Options 
          settings={settings}
          scheduleTypeChanged={handleScheduleTypeChanged}
          enableReasonWhenCloseTicketChanged={handleEnableReasonWhenCloseTicketChanged}
        />
      </TabPanel>
      
      {schedulesEnabled && (
        <TabPanel className={classes.container} value={tab} name="schedules">
          <SchedulesForm
            loading={loading}
            onSubmit={handleSubmitSchedules}
            initialValues={schedules}
          />
        </TabPanel>
      )}

      {currentUser.super && (
        <>
          <TabPanel className={classes.container} value={tab} name="plans">
            <PlansManager />
          </TabPanel>
          
          <TabPanel className={classes.container} value={tab} name="helps">
            <HelpsManager />
          </TabPanel>
          
          <TabPanel className={classes.container} value={tab} name="paymentGateway">
            <PaymentGateway settings={settings} />
          </TabPanel>
        </>
      )}

      {showWhiteLabel && (
        <TabPanel className={classes.container} value={tab} name="whitelabel">
          <Whitelabel settings={settings} />
        </TabPanel>
      )}

      {reasonEnabled === "enabled" && (
        <TabPanel className={classes.container} value={tab} name="closureReasons">
          <Reason />
        </TabPanel>
      )}
    </Paper>
  );

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} elevation={1}>
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ m: 2 }}
            action={
              <Box 
                component="button" 
                onClick={loadInitialData}
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
        
        {isMobile ? (
          <>
            <SpeedDialTabs actions={actions} onChange={setTab} />
            {renderTabPanels()}
          </>
        ) : (
          <>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              className={classes.tab}
              allowScrollButtonsMobile
            >
              <Tab label={i18n.t("settings.tabs.params")} value="options" />
              {schedulesEnabled && (
                <Tab label={i18n.t("settings.tabs.schedules")} value="schedules" />
              )}
              {currentUser.super && (
                <Tab label={i18n.t("settings.tabs.plans")} value="plans" />
              )}
              {currentUser.super && (
                <Tab label={i18n.t("settings.tabs.helps")} value="helps" />
              )}
              {showWhiteLabel && (
                <Tab label="Whitelabel" value="whitelabel" />
              )}
              {currentUser.super && (
                <Tab label="Pagamentos" value="paymentGateway" />
              )}
              {reasonEnabled === "enabled" && (
                <Tab label="Motivos de Encerramento" value="closureReasons" />
              )}
            </Tabs>
            {renderTabPanels()}
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Settings;