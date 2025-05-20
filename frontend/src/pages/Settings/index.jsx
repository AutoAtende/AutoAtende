import React, { useState, useEffect, useMemo, useCallback } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpIcon from '@mui/icons-material/Help';
import LabelIcon from '@mui/icons-material/Label';
import PaymentIcon from '@mui/icons-material/Payment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import Skeleton from '@mui/material/Skeleton';

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
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import usePlans from "../../hooks/usePlans";

import { useLoading } from "../../hooks/useLoading";

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
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

const Settings = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingModules, setLoadingModules] = useState({
    options: false,
    schedules: false,
    plans: false,
    helps: false,
    whitelabel: false,
    paymentGateway: false,
    closureReasons: false
  });
  const [currentUser, setCurrentUser] = useState({});
  const [error, setError] = useState(null);

  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState("disabled");

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { settings, getAll } = useSettings();
  const { getPlanCompany } = usePlans();
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const { Loading } = useLoading();

  const isMobile = useMediaQuery('(max-width:600px)');

  // Otimizado para evitar renderizações desnecessárias
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      Loading.turnOn();
      setError(null);

      // Carregar dados em paralelo quando possível
      const companyId = localStorage.getItem("companyId");
      
      // Obter informações do usuário atual
      const user = await getCurrentUserInfo();
      setCurrentUser(user);
      
      // Buscar configurações em paralelo
      const [company, settingsData, planConfigs] = await Promise.all([
        find(companyId),
        getAll(companyId),
        getPlanCompany(undefined, companyId)
      ]);

      setSchedules(company.schedules);
      setShowWhiteLabel(planConfigs.plan.whiteLabel);

      // Configurar estados baseados em settings
      if (Array.isArray(settingsData)) {
        const enableReasonSetting = settingsData.find(s => s.key === "enableReasonWhenCloseTicket");
        const scheduleTypeSetting = settingsData.find(s => s.key === "scheduleType");
        
        setReasonEnabled(enableReasonSetting || "disabled");
        setSchedulesEnabled(scheduleTypeSetting === "company");
      }
    } catch (err) {
      console.error("Erro ao carregar dados iniciais:", err);
      setError(err?.message || "Ocorreu um erro ao carregar as configurações");
      toast.error(err?.message || "Erro ao carregar configurações");
    } finally {
      setLoading(false);
      Loading.turnOff();
    }
  }, [find, getCurrentUserInfo, getAll, getPlanCompany, Loading]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    
    // Registrar mudança na tab no analytics ou em logs se necessário
    console.log(`Usuário alterou para a tab: ${newValue}`);
  };

  const handleSubmitSchedules = async (data) => {
    try {
      setLoadingModules(prev => ({ ...prev, schedules: true }));
      setSchedules(data);
      const companyId = localStorage.getItem("companyId");
      await updateSchedules({ id: companyId, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (err) {
      toast.error(err?.message || "Erro ao atualizar horários");
    } finally {
      setLoadingModules(prev => ({ ...prev, schedules: false }));
    }
  };

  const isSuper = useMemo(() => {
    return currentUser.super === true;
  }, [currentUser.super]);

  const handleScheduleTypeChanged = useCallback((value) => {
    setSchedulesEnabled(value === "company");
  }, []);

  const handleEnableReasonWhenCloseTicketChanged = useCallback((value) => {
    setReasonEnabled(value || "disabled");
  }, []);

  // Calcular as ações disponíveis com memoization
  const actions = useMemo(() => {
    const availableActions = [
      { icon: <SettingsIcon />, name: i18n.t("settings.tabs.params"), value: "options" },
      { icon: <ScheduleIcon />, name: i18n.t("settings.tabs.schedules"), value: "schedules", condition: schedulesEnabled },
      { icon: <AssignmentIcon />, name: i18n.t("settings.tabs.plans"), value: "plans", condition: isSuper },
      { icon: <HelpIcon />, name: i18n.t("settings.tabs.helps"), value: "helps", condition: isSuper },
      { icon: <LabelIcon />, name: "Whitelabel", value: "whitelabel", condition: showWhiteLabel },
      { icon: <PaymentIcon />, name: "Pagamentos", value: "paymentGateway", condition: isSuper },
      { icon: <ReportProblemIcon />, name: "Motivos de Encerramento", value: "closureReasons", condition: reasonEnabled === "enabled" },
    ];
    
    return availableActions.filter(action => action.condition !== false);
  }, [schedulesEnabled, isSuper, showWhiteLabel, reasonEnabled]);

  // Componentes preguiçosos carregados apenas quando solicitados
  const renderTabPanels = useCallback(() => (
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
            loading={loadingModules.schedules}
            onSubmit={handleSubmitSchedules}
            initialValues={schedules}
          />
        </TabPanel>
      )}

      {isSuper && (
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
  ), [
    tab, 
    classes.container, 
    classes.paper, 
    settings, 
    handleScheduleTypeChanged, 
    handleEnableReasonWhenCloseTicketChanged, 
    schedulesEnabled, 
    loadingModules.schedules, 
    handleSubmitSchedules, 
    schedules, 
    isSuper, 
    showWhiteLabel, 
    reasonEnabled
  ]);

  // Componente de carregamento
  const renderLoading = () => (
    <Box className={classes.loadingContainer}>
      <Skeleton variant="rectangular" width="100%" height={50} />
      <Skeleton variant="rectangular" width="100%" height={400} />
    </Box>
  );

  // Componente de erro
  const renderError = () => (
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
      {error || "Erro ao carregar as configurações. Tente novamente mais tarde."}
    </Alert>
  );

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} elevation={1}>
        {error && renderError()}
        
        {loading ? renderLoading() : (
          <>
            {isMobile ? (
              <>
                <SpeedDialTabs 
                  actions={actions} 
                  onChange={setTab} 
                  value={tab}
                />
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
                  {isSuper && (
                    <Tab label={i18n.t("settings.tabs.plans")} value="plans" />
                  )}
                  {isSuper && (
                    <Tab label={i18n.t("settings.tabs.helps")} value="helps" />
                  )}
                  {showWhiteLabel && (
                    <Tab label="Whitelabel" value="whitelabel" />
                  )}
                  {isSuper && (
                    <Tab label="Pagamentos" value="paymentGateway" />
                  )}
                  {reasonEnabled === "enabled" && (
                    <Tab label="Motivos de Encerramento" value="closureReasons" />
                  )}
                </Tabs>
                {renderTabPanels()}
              </>
            )}
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Settings;