import React, { useState, useEffect, useCallback } from "react";
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
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";

// Componentes de configurações
import Options from "./tabs/Options";
import SchedulesForm from "./tabs/SchedulesForm";
import PlansManager from "./tabs/PlansManager";
import HelpsManager from "./tabs/HelpsManager";
import Whitelabel from "./tabs/Whitelabel";
import PaymentGateway from "./tabs/PaymentGateway";
import Reason from "./tabs/Reason";

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

      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      if (!companyId) {
        throw new Error("ID da empresa não encontrado");
      }
      
      // Única chamada para API que retorna todos os dados necessários
      const { data: responseData } = await api.get(`/settings/full-configuration/${companyId}`);
      
      // Garantir que settings seja sempre um array
      const safeSettings = Array.isArray(responseData?.settings) ? responseData.settings : [];
      
      setData({
        currentUser: responseData?.user || {},
        company: responseData?.company || null,
        schedules: Array.isArray(responseData?.company?.schedules) ? responseData.company.schedules : [],
        settings: safeSettings,
        planConfig: responseData?.planConfig || {}
      });

      // Configurar estados derivados
      const reasonSetting = safeSettings.find(s => s?.key === "enableReasonWhenCloseTicket");
      
      setReasonEnabled(reasonSetting?.value || "disabled");
      setShowWhiteLabel(responseData?.planConfig?.plan?.whiteLabel || false);

    } catch (err) {
      console.error("Erro ao carregar dados da configuração:", err);
      setError(err?.message || "Ocorreu um erro ao carregar as configurações");
      toast.error("Erro ao carregar configurações");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [user?.companyId]);

  // Carregar dados ao iniciar o componente
  useEffect(() => {
    if (user?.companyId) {
      loadAllData();
    }
  }, [loadAllData, user?.companyId]);

  // Manipuladores
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleEnableReasonWhenCloseTicketChanged = (value) => {
    setReasonEnabled(value || "disabled");
    setPendingChanges(prev => ({
      ...prev,
      enableReasonWhenCloseTicket: value
    }));
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
        value: value?.toString() || ""
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
              value: pendingChanges[setting.key]?.toString() || ""
            };
          }
          return setting;
        })
      }));
      
      // Limpar alterações pendentes
      setPendingChanges({});
      
      toast.success(i18n.t("settings.saveSuccess") || "Configurações salvas com sucesso");
      setOpenSnackbar(false);
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      toast.error(i18n.t("settings.saveError") || "Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges]);

  // Manipulador para envio de horários
  const handleSubmitSchedules = async (scheduleData) => {
    setLoading(true);
    try {
      const companyId = data?.company?.id || user?.companyId || localStorage.getItem("companyId");
      
      if (!companyId) {
        throw new Error("ID da empresa não encontrado");
      }
      
      await api.put(`/companies/${companyId}/schedules`, { 
        schedules: scheduleData 
      });
      
      setData(prevData => ({
        ...prevData,
        schedules: Array.isArray(scheduleData) ? scheduleData : []
      }));
      
      toast.success("Horários atualizados com sucesso.");
      
    } catch (e) {
      console.error("Erro ao atualizar horários:", e);
      toast.error(e?.message || "Erro ao atualizar horários");
    } finally {
      setLoading(false);
    }
  };

  // Preparar tabs baseado no usuário e configurações
  const tabs = React.useMemo(() => {
    const baseTabs = [
      { label: i18n.t("settings.tabs.params") || "Configurações", icon: <SettingsIcon /> },
      { label: i18n.t("settings.tabs.schedules") || "Horários", icon: <ScheduleIcon /> }
    ];

    // Adicionar tabs condicionalmente
    if (data.currentUser?.super) {
      baseTabs.push({ label: i18n.t("settings.tabs.plans") || "Planos", icon: <AssignmentIcon /> });
      baseTabs.push({ label: i18n.t("settings.tabs.helps") || "Ajuda", icon: <HelpIcon /> });
    }

    if (showWhiteLabel) {
      baseTabs.push({ label: "Whitelabel", icon: <LabelIcon /> });
    }

    if (data.currentUser?.super) {
      baseTabs.push({ label: "Pagamentos", icon: <PaymentIcon /> });
    }

    if (reasonEnabled === "enabled") {
      baseTabs.push({ label: "Motivos de Encerramento", icon: <ReportProblemIcon /> });
    }

    return baseTabs;
  }, [data.currentUser?.super, showWhiteLabel, reasonEnabled]);

  // Mapear tab string para índice
  const getTabIndex = useCallback((tabName) => {
    const tabMap = {
      options: 0,
      schedules: 1,
      plans: data.currentUser?.super ? 2 : -1,
      helps: data.currentUser?.super ? 3 : -1,
      whitelabel: showWhiteLabel ? (data.currentUser?.super ? 4 : 2) : -1,
      paymentGateway: data.currentUser?.super ? (showWhiteLabel ? 5 : 4) : -1,
      closureReasons: reasonEnabled === "enabled" ? tabs.length - 1 : -1
    };
    return tabMap[tabName] >= 0 ? tabMap[tabName] : 0;
  }, [data.currentUser?.super, showWhiteLabel, reasonEnabled, tabs.length]);

  const getTabName = useCallback((index) => {
    const nameArray = ['options', 'schedules'];
    
    if (data.currentUser?.super) {
      nameArray.push('plans');
      nameArray.push('helps');
    }
    
    if (showWhiteLabel) {
      nameArray.push('whitelabel');
    }
    
    if (data.currentUser?.super) {
      nameArray.push('paymentGateway');
    }
    
    if (reasonEnabled === "enabled") {
      nameArray.push('closureReasons');
    }
    
    return nameArray[index] || 'options';
  }, [data.currentUser?.super, showWhiteLabel, reasonEnabled]);

  const activeTabIndex = getTabIndex(tab);

  const handleStandardTabChange = (event, newValue) => {
    const newTabName = getTabName(newValue);
    setTab(newTabName);
  };

  // Renderização condicional
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Se ainda está carregando ou tem erro, usar layout original
  if (initialLoading || error) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>{i18n.t("settings.title") || "Configurações"}</Title>
        </MainHeader>
        
        <Box sx={{ p: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ m: 2 }}
              action={
                <Button 
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
                </Button>
              }
            >
              {error}
            </Alert>
          )}
          
          {initialLoading && (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              p: 4 
            }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </MainContainer>
    );
  }

  return (
    <StandardPageLayout
      title={i18n.t("settings.title") || "Configurações"}
      subtitle="Configure as opções do sistema, integrações e personalizações"
      tabs={tabs}
      activeTab={activeTabIndex}
      onTabChange={handleStandardTabChange}
      showSearch={false}
    >
      {/* Aba de Configurações Gerais */}
      {tab === "options" && (
        <StandardTabContent
          title={i18n.t("settings.tabs.params") || "Configurações"}
          description="Configure as opções gerais do sistema"
          icon={<SettingsIcon />}
          variant="default"
        >
          <Options 
            settings={Array.isArray(data.settings) ? data.settings : []}
            enableReasonWhenCloseTicketChanged={handleEnableReasonWhenCloseTicketChanged}
            onSettingChange={handleSettingChange}
            pendingChanges={pendingChanges}
          />
        </StandardTabContent>
      )}

      {/* Aba de Horários */}
      {tab === "schedules" && (
        <StandardTabContent
          title={i18n.t("settings.tabs.schedules") || "Horários"}
          description="Configure os horários de funcionamento da empresa"
          icon={<ScheduleIcon />}
          variant="paper"
        >
          <SchedulesForm
            loading={loading}
            onSubmit={handleSubmitSchedules}
            initialValues={Array.isArray(data.schedules) ? data.schedules : []}
            companyId={data.company?.id || user?.companyId}
            labelSaveButton={i18n.t("settings.saveButton") || "Salvar"}
          />
        </StandardTabContent>
      )}

      {/* Aba de Planos */}
      {tab === "plans" && data.currentUser?.super && (
        <StandardTabContent
          title={i18n.t("settings.tabs.plans") || "Planos"}
          description="Gerencie os planos de assinatura do sistema"
          icon={<AssignmentIcon />}
          variant="default"
        >
          <PlansManager />
        </StandardTabContent>
      )}

      {/* Aba de Ajuda */}
      {tab === "helps" && data.currentUser?.super && (
        <StandardTabContent
          title={i18n.t("settings.tabs.helps") || "Ajuda"}
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
          <Whitelabel settings={Array.isArray(data.settings) ? data.settings : []} />
        </StandardTabContent>
      )}

      {/* Aba de Gateway de Pagamento */}
      {tab === "paymentGateway" && data.currentUser?.super && (
        <StandardTabContent
          title="Gateway de Pagamento"
          description="Configure os métodos de pagamento disponíveis"
          icon={<PaymentIcon />}
          variant="paper"
        >
          <PaymentGateway settings={Array.isArray(data.settings) ? data.settings : []} />
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
        <Button
          variant="contained"
          color="primary"
          startIcon={isSaving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
          onClick={handleSaveAllChanges}
          disabled={isSaving}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
            borderRadius: 3,
            minHeight: 48,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 6,
            '&:hover': {
              boxShadow: 8
            }
          }}
        >
          {i18n.t("settings.saveAll") || "Salvar Alterações"}
        </Button>
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