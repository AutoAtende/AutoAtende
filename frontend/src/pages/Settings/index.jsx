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
import { Paper, Tabs, Tab, useMediaQuery, Box, Alert, CircularProgress } from "@mui/material";
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
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
  },
}));

const Settings = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({});
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);

  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState("disabled");
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { settings } = useSettings();
  const { getPlanCompany } = usePlans();

  const isMobile = useMediaQuery('(max-width:600px)');
  
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = localStorage.getItem("companyId");
      
      const now = new Date().getTime();
      const cachedUserData = localStorage.getItem('cached_user_data');
      const cachedCompanyData = localStorage.getItem('cached_company_data');
      const cachedPlanData = localStorage.getItem('cached_plan_data');
      
      let user, userFromCache = false;
      let companyData, companyFromCache = false;
      let planConfigs, planFromCache = false;
      
      if (cachedUserData) {
        const parsedCache = JSON.parse(cachedUserData);
        if (now - parsedCache.timestamp < 300000) {
          user = parsedCache.data;
          userFromCache = true;
        }
      }
      
      if (cachedCompanyData) {
        const parsedCache = JSON.parse(cachedCompanyData);
        if (now - parsedCache.timestamp < 300000) {
          companyData = parsedCache.data;
          companyFromCache = true;
        }
      }
      
      if (cachedPlanData) {
        const parsedCache = JSON.parse(cachedPlanData);
        if (now - parsedCache.timestamp < 300000) {
          planConfigs = parsedCache.data;
          planFromCache = true;
        }
      }
      
      const promises = [];
      
      if (!userFromCache) {
        promises.push(getCurrentUserInfo().then(data => {
          user = data;
          localStorage.setItem('cached_user_data', JSON.stringify({
            timestamp: now,
            data
          }));
        }));
      }
      
      if (!companyFromCache) {
        promises.push(find(companyId).then(data => {
          companyData = data;
          localStorage.setItem('cached_company_data', JSON.stringify({
            timestamp: now,
            data
          }));
        }));
      }
      
      if (!planFromCache) {
        promises.push(getPlanCompany(undefined, companyId).then(data => {
          planConfigs = data;
          localStorage.setItem('cached_plan_data', JSON.stringify({
            timestamp: now,
            data
          }));
        }));
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      
      setCurrentUser(user);
      setCompany(companyData);
      setSchedules(companyData.schedules);
      setShowWhiteLabel(planConfigs.plan.whiteLabel);

      if (Array.isArray(settings)) {
        const scheduleTypeSetting = settings.find(s => s.key === "scheduleType");
        const reasonSetting = settings.find(s => s.key === "enableReasonWhenCloseTicket");
        
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
      
      const companyId = company?.id || localStorage.getItem("companyId");
      
      await updateSchedules({ id: companyId, schedules: data });
      toast.success("Horários atualizados com sucesso.");
      
      const cachedCompanyData = localStorage.getItem('cached_company_data');
      if (cachedCompanyData) {
        const parsedCache = JSON.parse(cachedCompanyData);
        parsedCache.data.schedules = data;
        localStorage.setItem('cached_company_data', JSON.stringify(parsedCache));
      }
    } catch (e) {
      toast.error(e?.message || "Erro ao atualizar horários");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTypeChanged = (value) => {
    setSchedulesEnabled(value === "company");
  };

  const handleEnableReasonWhenCloseTicketChanged = (value) => {
    setReasonEnabled(value || "disabled");
  };

  const actions = [
    { icon: <SettingsIcon />, name: i18n.t("settings.tabs.params"), value: "options" },
    { icon: <ScheduleIcon />, name: i18n.t("settings.tabs.schedules"), value: "schedules", condition: schedulesEnabled },
    { icon: <AssignmentIcon />, name: i18n.t("settings.tabs.plans"), value: "plans", condition: currentUser.super },
    { icon: <HelpIcon />, name: i18n.t("settings.tabs.helps"), value: "helps", condition: currentUser.super },
    { icon: <LabelIcon />, name: "Whitelabel", value: "whitelabel", condition: showWhiteLabel },
    { icon: <PaymentIcon />, name: "Pagamentos", value: "paymentGateway", condition: currentUser.super },
    { icon: <ReportProblemIcon />, name: "Motivos de Encerramento", value: "closureReasons", condition: reasonEnabled === "enabled" },
  ].filter(action => action.condition !== false);

  const isShowingContent = !loading && !error;

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
        
        {loading && (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        )}
        
        {isShowingContent && (
          <>
            {isMobile ? (
              <>
                <SpeedDialTabs actions={actions} onChange={setTab} />
                <Paper className={classes.paper} elevation={0}>
                  <TabPanel className={classes.container} value={tab} name="options">
                    <Options 
                      settings={settings}
                      scheduleTypeChanged={handleScheduleTypeChanged}
                      enableReasonWhenCloseTicketChanged={handleEnableReasonWhenCloseTicketChanged}
                    />
                  </TabPanel>
                  
                  <TabPanel className={classes.container} value={tab} name="schedules">
                    {schedulesEnabled && (
                      <SchedulesForm
                        loading={loading}
                        onSubmit={handleSubmitSchedules}
                        initialValues={schedules}
                      />
                    )}
                  </TabPanel>

                  <TabPanel className={classes.container} value={tab} name="plans">
                    {currentUser.super && <PlansManager />}
                  </TabPanel>
                  
                  <TabPanel className={classes.container} value={tab} name="helps">
                    {currentUser.super && <HelpsManager />}
                  </TabPanel>
                  
                  <TabPanel className={classes.container} value={tab} name="paymentGateway">
                    {currentUser.super && <PaymentGateway settings={settings} />}
                  </TabPanel>

                  <TabPanel className={classes.container} value={tab} name="whitelabel">
                    {showWhiteLabel && <Whitelabel settings={settings} />}
                  </TabPanel>

                  <TabPanel className={classes.container} value={tab} name="closureReasons">
                    {reasonEnabled === "enabled" && <Reason />}
                  </TabPanel>
                </Paper>
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
                
                <Paper className={classes.paper} elevation={0}>
                  <TabPanel className={classes.container} value={tab} name="options">
                    <Options 
                      settings={settings}
                      scheduleTypeChanged={handleScheduleTypeChanged}
                      enableReasonWhenCloseTicketChanged={handleEnableReasonWhenCloseTicketChanged}
                    />
                  </TabPanel>
                  
                  <TabPanel className={classes.container} value={tab} name="schedules">
                    {schedulesEnabled && (
                      <SchedulesForm
                        loading={loading}
                        onSubmit={handleSubmitSchedules}
                        initialValues={schedules}
                        companyId={companyId}
                        labelSaveButton={i18n.t("settings.saveButton")}
                      />
                    )}
                  </TabPanel>

                  <TabPanel className={classes.container} value={tab} name="plans">
                    {currentUser.super && <PlansManager />}
                  </TabPanel>
                  
                  <TabPanel className={classes.container} value={tab} name="helps">
                    {currentUser.super && <HelpsManager />}
                  </TabPanel>
                  
                  <TabPanel className={classes.container} value={tab} name="paymentGateway">
                    {currentUser.super && <PaymentGateway settings={settings} />}
                  </TabPanel>

                  <TabPanel className={classes.container} value={tab} name="whitelabel">
                    {showWhiteLabel && <Whitelabel settings={settings} />}
                  </TabPanel>

                  <TabPanel className={classes.container} value={tab} name="closureReasons">
                    {reasonEnabled === "enabled" && <Reason />}
                  </TabPanel>
                </Paper>
              </>
            )}
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Settings;