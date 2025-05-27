import React, { useState, useEffect, useContext, useCallback } from "react";
import { 
  SettingsOutlined,
  ScheduleOutlined,
  AssignmentOutlined,
  HelpOutlined,
  LabelOutlined,
  PaymentOutlined,
  ReportProblemOutlined
} from "@mui/icons-material";

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import SchedulesForm from "../../components/SchedulesForm";
import PlansManager from "./tabs/PlansManager";
import HelpsManager from "./tabs/HelpsManager";
import Options from "./tabs/Options";
import Whitelabel from "./tabs/Whitelabel";
import PaymentGateway from "./tabs/PaymentGateway";
import Reason from "./tabs/Reason";
import StandardEmptyState from "../../components/shared/StandardEmptyState";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanies from "../../hooks/useCompanies";
import useSettings from "../../hooks/useSettings";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import usePlans from "../../hooks/usePlans";
import { useLoading } from "../../hooks/useLoading";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState([]);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState("disabled");
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();
  const { getPlanCompany } = usePlans();
  const { Loading } = useLoading();

  // Memoizar a função de carregamento de dados
  const loadData = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      Loading.turnOn();
      const companyId = localStorage.getItem("companyId");
      
      const [company, settingList, planConfigs] = await Promise.all([
        find(companyId),
        getAllSettings(),
        getPlanCompany(undefined, companyId)
      ]);

      setSchedules(company.schedules || []);
      setSettings(settingList || []);
      setShowWhiteLabel(planConfigs?.plan?.whiteLabel || false);
      
      const reasonSetting = settingList.find(s => s.key === "enableReasonWhenCloseTicket");
      setReasonEnabled(reasonSetting?.value || "disabled");
      
      const scheduleSetting = settingList.find(s => s.key === "scheduleType");
      setSchedulesEnabled(scheduleSetting?.value === "company");
      
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
      Loading.turnOff();
    }
  }, [find, getAllSettings, getPlanCompany, Loading, loading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitSchedules = useCallback(async (data) => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      setSchedules(data);
      await updateSchedules({ id: companyId, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar horários:", error);
      toast.error("Erro ao atualizar horários");
    } finally {
      setLoading(false);
    }
  }, [updateSchedules]);

  const handleScheduleTypeChange = useCallback((value) => {
    setSchedulesEnabled(value === "company");
  }, []);

  const handleReasonChange = useCallback((value) => {
    setReasonEnabled(value || "disabled");
  }, []);

  // Definir as abas disponíveis
  const tabs = [
    {
      label: i18n.t("settings.tabs.params"),
      icon: <SettingsOutlined />
    },
    ...(schedulesEnabled ? [{
      label: i18n.t("settings.tabs.schedules"),
      icon: <ScheduleOutlined />
    }] : []),
    ...(user.super ? [{
      label: i18n.t("settings.tabs.plans"),
      icon: <AssignmentOutlined />
    }] : []),
    ...(user.super ? [{
      label: i18n.t("settings.tabs.helps"),
      icon: <HelpOutlined />
    }] : []),
    ...(showWhiteLabel ? [{
      label: "Whitelabel",
      icon: <LabelOutlined />
    }] : []),
    ...(user.super ? [{
      label: "Pagamentos",
      icon: <PaymentOutlined />
    }] : []),
    ...(reasonEnabled === "enabled" ? [{
      label: "Motivos de Encerramento",
      icon: <ReportProblemOutlined />
    }] : [])
  ];

  const renderTabContent = () => {
    let currentIndex = 0;

    // Aba Parâmetros
    if (activeTab === currentIndex) {
      return (
        <StandardTabContent
          title="Configurações do Sistema"
          description="Configure os parâmetros gerais do sistema"
          icon={<SettingsOutlined />}
          variant="padded"
        >
          <Options 
            settings={settings}
            scheduleTypeChanged={handleScheduleTypeChange}
            enableReasonWhenCloseTicketChanged={handleReasonChange}
          />
        </StandardTabContent>
      );
    }
    currentIndex++;

    // Aba Horários
    if (schedulesEnabled && activeTab === currentIndex) {
      return (
        <StandardTabContent
          title="Horários de Funcionamento"
          description="Configure os horários de atendimento da empresa"
          icon={<ScheduleOutlined />}
          variant="padded"
        >
          <SchedulesForm
            loading={loading}
            onSubmit={handleSubmitSchedules}
            initialValues={schedules}
          />
        </StandardTabContent>
      );
    }
    if (schedulesEnabled) currentIndex++;

    // Aba Planos (Super User)
    if (user.super && activeTab === currentIndex) {
      return (
        <StandardTabContent
          title="Gerenciamento de Planos"
          description="Configure os planos disponíveis no sistema"
          icon={<AssignmentOutlined />}
          variant="padded"
        >
          <OnlyForSuperUser user={user} yes={() => <PlansManager />} />
        </StandardTabContent>
      );
    }
    if (user.super) currentIndex++;

    // Aba Ajudas (Super User)
    if (user.super && activeTab === currentIndex) {
      return (
        <StandardTabContent
          title="Gerenciamento de Ajudas"
          description="Configure os tutoriais e ajudas do sistema"
          icon={<HelpOutlined />}
          variant="padded"
        >
          <OnlyForSuperUser user={user} yes={() => <HelpsManager />} />
        </StandardTabContent>
      );
    }
    if (user.super) currentIndex++;

    // Aba Whitelabel
    if (showWhiteLabel && activeTab === currentIndex) {
      return (
        <StandardTabContent
          title="Personalização da Marca"
          description="Configure a identidade visual do sistema"
          icon={<LabelOutlined />}
          variant="padded"
        >
          <Whitelabel settings={settings} />
        </StandardTabContent>
      );
    }
    if (showWhiteLabel) currentIndex++;

    // Aba Pagamentos (Super User)
    if (user.super && activeTab === currentIndex) {
      return (
        <StandardTabContent
          title="Gateway de Pagamento"
          description="Configure os métodos de pagamento"
          icon={<PaymentOutlined />}
          variant="padded"
        >
          <OnlyForSuperUser user={user} yes={() => <PaymentGateway settings={settings} />} />
        </StandardTabContent>
      );
    }
    if (user.super) currentIndex++;

    // Aba Motivos de Encerramento
    if (reasonEnabled === "enabled" && activeTab === currentIndex) {
      return (
        <StandardTabContent
          title="Motivos de Encerramento"
          description="Configure os motivos disponíveis para encerramento de tickets"
          icon={<ReportProblemOutlined />}
          variant="padded"
        >
          <Reason />
        </StandardTabContent>
      );
    }

    // Estado vazio se nenhuma aba foi encontrada
    return (
      <StandardEmptyState
        type="error"
        title="Aba não encontrada"
        description="A aba selecionada não está disponível."
      />
    );
  };

  return (
    <StandardPageLayout
      title={i18n.t("settings.title")}
      subtitle="Configure os parâmetros e funcionalidades do sistema"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(event, newValue) => setActiveTab(newValue)}
      loading={loading}
      showEmptyState={tabs.length === 0}
      emptyState={
        <StandardEmptyState
          type="default"
          title="Nenhuma configuração disponível"
          description="Não há configurações disponíveis para o seu perfil de usuário."
        />
      }
    >
      {renderTabContent()}
    </StandardPageLayout>
  );
};

export default Settings;