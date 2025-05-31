import React, { useState, useEffect, useCallback, useContext } from "react";
import { styled } from '@mui/material/styles';
import {
  Box,
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
import StandardPageLayout from "../../components/Standard/StandardPageLayout";
import StandardTabContent from "../../components/Standard/StandardTabContent";
import useAuth from "../../hooks/useAuth";
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
  borderRadius: 12,
  minHeight: 48,
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: theme.shadows[4],
  '&:hover': {
    boxShadow: theme.shadows[6]
  }
}));

const Settings = () => {
  // Estados
  const { user } = useAuth();
  const [tab, setTab] = useState("options");
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [data, setData] = useState({
    currentUser: {},
    company: null,
    schedules: [],
    settings: [],
    planConfig: {}
  });
  const [reasonEnabled, setReasonEnabled] = useState("disabled");
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Função principal para carregar todos os dados necessários
  const loadAllData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const companyId = user.companyId || localStorage.getItem("companyId");
      
      // Única chamada para API que retorna todos os dados necessários
      const { data } = await api.get(`/settings/full-configuration/${companyId}`);
      
      // Garantir que settings seja sempre um array
      const safeSettings = Array.isArray(data.settings) ? data.settings : [];
      
      setData({
        currentUser: data.user,
        company: data.company,
        schedules: data.company?.schedules || [],
        settings: safeSettings,
        planConfig: data.planConfig
      });

      // Configurar estados derivados
      const reasonSetting = safeSettings.find(s => s.key === "enableReasonWhenCloseTicket");
      
      setReasonEnabled(reasonSetting?.value || "disabled");
      setShowWhiteLabel(data.planConfig?.plan?.whiteLabel || false);

      // Armazenar dados em cache local
      storeDataInCache({
        user: data.user,
        company: data.company,
        settings: safeSettings,
        planConfig: data.planConfig
      });

    } catch (err) {
      console.error("Erro ao carregar dados da configuração:", err);
      setError(err?.message || "Ocorreu um erro ao carregar as configurações");
      toast.error("Erro ao carregar configurações");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [user.companyId]);

  // Armazenar dados em cache local para otimização
  const storeDataInCache = useCallback((dataToCache) => {
    const now = new Date().getTime();
    
    if (dataToCache.user) {
      localStorage.setItem('cached_user_data', JSON.stringify({
        timestamp: now,
        data: dataToCache.user
      }));
    }
    
    if (dataToCache.company) {
      localStorage.setItem('cached_company_data', JSON.stringify({
        timestamp: now,
        data: dataToCache.company
      }));
    }
    
    if (dataToCache.planConfig) {
      localStorage.setItem('cached_plan_data', JSON.stringify({
        timestamp: now,
        data: dataToCache.planConfig
      }));
    }
  }, []);

  // Carregar dados ao iniciar o componente
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Manipuladores
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
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
      setData(prevData => ({
        ...prevData,
        settings: prevData.settings.map(setting => {
          if (pendingChanges[setting.key] !== undefined) {
            return {
              ...setting, 
              value: pendingChanges[setting.key].toString()
            };
          }
          return setting;
        })
      }));
      
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
  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      const companyId = data?.company?.id || localStorage.getItem("companyId");
      
      await api.put(`/companies/${companyId}/schedules`, { 
        schedules: data 
      });
      
      setData(prevData => ({
        ...prevData,
        schedules: data
      }));
      
      toast.success("Horários atualizados com sucesso.");
      
      // Atualizar cache
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

  // Preparar tabs
  const tabs = [
    { label: i18n.t("settings.tabs.params"), icon: <SettingsIcon /> },
    ...[{ label: i18n.t("settings.tabs.schedules"), icon: <ScheduleIcon /> }],
    ...(data.currentUser.super ? [{ label: i18n.t("settings.tabs.plans"), icon: <AssignmentIcon /> }] : []),
    ...(data.currentUser.super ? [{ label: i18n.t("settings.tabs.helps"), icon: <HelpIcon /> }] : []),
    ...(showWhiteLabel ? [{ label: "Whitelabel", icon: <LabelIcon /> }] : []),
    ...(data.currentUser.super ? [{ label: "Pagamentos", icon: <PaymentIcon /> }] : []),
    ...(reasonEnabled === "enabled" ? [{ label: "Motivos de Encerramento", icon: <ReportProblemIcon /> }] : []),
  ];

  // Mapear tab string para índice
  const getTabIndex = (tabName) => {
    const tabMap = {
      options: 0,
      schedules: 1,
      plans: 2,
      helps: 3,
      whitelabel: 4,
      paymentGateway: 5,
      closureReasons: 6
    };
    return tabMap[tabName] !== -1 ? tabMap[tabName] : 0;
  };

  const getTabName = (index) => {
    const nameMap = [
      'options',
      'schedules',
      'plans',
      'helps',
      'whitelabel',
      'paymentGateway',
      'closureReasons'
    ];
    return nameMap[index] || 'options';
  };

  const activeTabIndex = getTabIndex(tab);

  const handleStandardTabChange = (event, newValue) => {
    const newTabName = getTabName(newValue);
    setTab(newTabName);
  };

  // Renderização condicional
  const isShowingContent = !initialLoading && !error;
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Se ainda está carregando ou tem erro, usar layout original
  if (initialLoading || error) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>{i18n.t("settings.title")}</Title>
        </MainHeader>
        
        <Box sx={{ p: 2 }}>
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
        </Box>
      </MainContainer>
    );
  }

  return (
    <StandardPageLayout
      title={i18n.t("settings.title")}
      subtitle="Configure as opções do sistema, integrações e personalizações"
      tabs={tabs}
      activeTab={activeTabIndex}
      onTabChange={handleStandardTabChange}
      showSearch={false}
    >
      {/* Aba de Configurações Gerais */}
      {tab === "options" && (
        <StandardTabContent
          title={i18n.t("settings.tabs.params")}
          description="Configure as opções gerais do sistema"
          icon={<SettingsIcon />}
          variant="default"
        >
          <Options 
            settings={data.settings}
            scheduleTypeChanged={handleScheduleTypeChanged}
            enableReasonWhenCloseTicketChanged={handleEnableReasonWhenCloseTicketChanged}
            onSettingChange={handleSettingChange}
            pendingChanges={pendingChanges}
          />
        </StandardTabContent>
      )}

      {/* Aba de Horários */}
      {tab === "schedules" && (
        <StandardTabContent
          title={i18n.t("settings.tabs.schedules")}
          description="Configure os horários de funcionamento da empresa"
          icon={<ScheduleIcon />}
          variant="paper"
        >
          <SchedulesForm
            loading={loading}
            onSubmit={handleSubmitSchedules}
            initialValues={data.schedules}
            companyId={data.company?.id}
            labelSaveButton={i18n.t("settings.saveButton")}
          />
        </StandardTabContent>
      )}

      {/* Aba de Planos */}
      {tab === "plans" && user.super && (
        <StandardTabContent
          title={i18n.t("settings.tabs.plans")}
          description="Gerencie os planos de assinatura do sistema"
          icon={<AssignmentIcon />}
          variant="default"
        >
          <PlansManager />
        </StandardTabContent>
      )}

      {/* Aba de Ajuda */}
      {tab === "helps" && user.super && (
        <StandardTabContent
          title={i18n.t("settings.tabs.helps")}
          description="Configure as mensagens de ajuda e documentação"
          icon={<HelpIcon />}
          variant="default"
        >
          <HelpsManager />
        </StandardTabContent>
      )}

      {/* Aba de Whitelabel */}
      {tab === "whitelabel" && showWhiteLabel && (
        <StandardTabContent
          title="Whitelabel"
          description="Personalize a aparência e marca do sistema"
          icon={<LabelIcon />}
          variant="default"
        >
          <Whitelabel settings={data.settings} />
        </StandardTabContent>
      )}

      {/* Aba de Gateway de Pagamento */}
      {tab === "paymentGateway" && user.super && (
        <StandardTabContent
          title="Gateway de Pagamento"
          description="Configure os métodos de pagamento disponíveis"
          icon={<PaymentIcon />}
          variant="paper"
        >
          <PaymentGateway settings={data.settings} />
        </StandardTabContent>
      )}

      {/* Aba de Motivos de Encerramento */}
      {tab === "closureReasons" && reasonEnabled === "enabled" && (
        <StandardTabContent
          title="Motivos de Encerramento"
          description="Configure os motivos disponíveis para encerramento de tickets"
          icon={<ReportProblemIcon />}
          variant="paper"
        >
          <Reason />
        </StandardTabContent>
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
          {i18n.t("settings.saveAll") || "Salvar Alterações"}
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
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Salvar
          </Button>
        }
      />
    </StandardPageLayout>
  );
};

export default Settings;