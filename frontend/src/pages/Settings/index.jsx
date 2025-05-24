import React, { useState, useEffect } from "react";
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
import { Paper, Tabs, Tab, useMediaQuery } from "@mui/material";
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
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanies from "../../hooks/useCompanies";
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
  }
}));

const Settings = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState("disabled");

 
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();
  const { getPlanCompany } = usePlans();
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const { Loading } = useLoading();

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        Loading.turnOn()
        const companyId = localStorage.getItem("companyId");
        const company = await find(companyId);
        const settingList = await getAllSettings();
        const planConfigs = await getPlanCompany(undefined, companyId);

        setSchedules(company.schedules);
        setSettings(settingList);
        setShowWhiteLabel(planConfigs.plan.whiteLabel);
        setReasonEnabled(settingList.enableReasonWhenCloseTicket?.value || "disabled");
        setSchedulesEnabled(settingList.scheduleType === "company");
      } catch (e) {
        toast.error(e);
      } finally {
        Loading.turnOff()
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return user.super;
  };

  const actions = [
    { icon: <SettingsIcon />, name: i18n.t("settings.tabs.params"), value: "options" },
    { icon: <ScheduleIcon />, name: i18n.t("settings.tabs.schedules"), value: "schedules", condition: schedulesEnabled },
    { icon: <AssignmentIcon />, name: i18n.t("settings.tabs.plans"), value: "plans", condition: isSuper() },
    { icon: <HelpIcon />, name: i18n.t("settings.tabs.helps"), value: "helps", condition: isSuper() },
    { icon: <LabelIcon />, name: "Whitelabel", value: "whitelabel", condition: showWhiteLabel },
    { icon: <PaymentIcon />, name: "Pagamentos", value: "paymentGateway", condition: isSuper() },
    { icon: <ReportProblemIcon />, name: "Motivos de Encerramento", value: "closureReasons", condition: reasonEnabled === "enabled" },
  ].filter(action => action.condition !== false);

  const renderTabPanels = () => (
    <Paper className={classes.paper} elevation={0}>
      <TabPanel className={classes.container} value={tab} name="options">
        <Options 
          settings={settings}
          scheduleTypeChanged={(value) => setSchedulesEnabled(value === "company")}
          enableReasonWhenCloseTicketChanged={(value) => setReasonEnabled(value || "disabled")}
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

      <OnlyForSuperUser user={user} yes={() => (
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
      )} />

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
              scrollButtons
              className={classes.tab}
              allowScrollButtonsMobile
            >
              <Tab label={i18n.t("settings.tabs.params")} value="options" />
              {schedulesEnabled && (
                <Tab label={i18n.t("settings.tabs.schedules")} value="schedules" />
              )}
              {isSuper() && (
                <Tab label={i18n.t("settings.tabs.plans")} value="plans" />
              )}
              {isSuper() && (
                <Tab label={i18n.t("settings.tabs.helps")} value="helps" />
              )}
              {showWhiteLabel && (
                <Tab label="Whitelabel" value="whitelabel" />
              )}
              {isSuper() && (
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