import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  useMediaQuery, 
  useTheme,
  Avatar,
  Typography
} from "@mui/material";
import { 
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Assignment as PlansIcon,
  Help as HelpIcon,
  AccessTime as SchedulesIcon,
  ReportProblem as ReasonIcon,
  Palette as WhitelabelIcon
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faServer } from "@fortawesome/free-solid-svg-icons";

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import { AuthContext } from "../../context/Auth/AuthContext";
import useSettings from "../../hooks/useSettings";
import { toast } from "../../helpers/toast";

// Importar os componentes das abas
import Options from "./Options";
import PaymentGateway from "./PaymentGateway";
import PlansManager from "./PlansManager";
import HelpsManager from "./HelpsManager";
import SchedulesForm from "./SchedulesForm";
import Reason from "./Reason";
import Whitelabel from "./Whitelabel";

// Componente TabPanel para renderizar o conteúdo das abas
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Configuração das abas
const getTabsConfig = (user) => {
  const baseTabs = [
    {
      label: "Configurações Gerais",
      icon: <SettingsIcon />,
      component: Options,
      requiresSuper: false
    },
    {
      label: "Gateway de Pagamento", 
      icon: <PaymentIcon />,
      component: PaymentGateway,
      requiresSuper: true
    },
    {
      label: "Planos",
      icon: <PlansIcon />,
      component: PlansManager,
      requiresSuper: true
    },
    {
      label: "Ajudas",
      icon: <HelpIcon />,
      component: HelpsManager,
      requiresSuper: false
    },
    {
      label: "Horários",
      icon: <SchedulesIcon />,
      component: SchedulesForm,
      requiresSuper: false
    },
    {
      label: "Motivos",
      icon: <ReasonIcon />,
      component: Reason,
      requiresSuper: false
    },
    {
      label: "Whitelabel",
      icon: <WhitelabelIcon />,
      component: Whitelabel,
      requiresSuper: false
    }
  ];

  // Filtrar abas baseado no perfil do usuário
  return baseTabs.filter(tab => {
    if (tab.requiresSuper) {
      return user?.super === true;
    }
    return true;
  });
};

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const { getAll: getAllSettings, update } = useSettings();
  
  // Estados
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // Configuração das abas baseada no usuário
  const tabsConfig = useMemo(() => getTabsConfig(user), [user]);

  // Carregar configurações iniciais
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const settingsData = await getAllSettings();
      setSettings(settingsData || []);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [getAllSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handler para mudança de aba
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // Handler para alterações de configurações
  const handleSettingChange = useCallback(async (key, value) => {
    try {
      // Marcar como alteração pendente
      setPendingChanges(prev => ({
        ...prev,
        [key]: value
      }));

      // Atualizar configuração
      await update({ key, value });
      
      // Atualizar lista local de configurações
      setSettings(prev => {
        const newSettings = [...prev];
        const existingIndex = newSettings.findIndex(s => s.key === key);
        
        if (existingIndex >= 0) {
          newSettings[existingIndex] = { ...newSettings[existingIndex], value };
        } else {
          newSettings.push({ key, value });
        }
        
        return newSettings;
      });

      // Remover da lista de alterações pendentes
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });

    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      toast.error("Erro ao salvar configuração");
    }
  }, [update]);

  // Handler específico para mudança de enableReasonWhenCloseTicket
  const handleEnableReasonWhenCloseTicketChanged = useCallback((value) => {
    // Lógica específica para esta configuração se necessário
    console.log("EnableReasonWhenCloseTicket alterado:", value);
  }, []);

  // Preparar estatísticas
  const stats = useMemo(() => [
    {
      label: `${settings.length} configurações`,
      icon: <SettingsIcon />,
      color: 'primary'
    },
    {
      label: user?.super ? 'Acesso completo' : 'Acesso básico',
      icon: user?.super ? (
        <Avatar sx={{ 
          bgcolor: 'success.main', 
          width: 24, 
          height: 24,
          fontSize: '0.875rem'
        }}>
          S
        </Avatar>
      ) : (
        <Avatar sx={{ 
          bgcolor: 'info.main', 
          width: 24, 
          height: 24,
          fontSize: '0.875rem'
        }}>
          U
        </Avatar>
      ),
      color: user?.super ? 'success' : 'info'
    }
  ], [settings.length, user?.super]);

  // Função para renderizar o componente da aba atual
  const renderCurrentTabContent = useCallback(() => {
    const currentTabConfig = tabsConfig[currentTab];
    if (!currentTabConfig) return null;

    const Component = currentTabConfig.component;
    
    // Props específicas por componente
    const getComponentProps = () => {
      const baseProps = { settings };
      
      switch (Component) {
        case Options:
          return {
            ...baseProps,
            enableReasonWhenCloseTicketChanged: handleEnableReasonWhenCloseTicketChanged,
            onSettingChange: handleSettingChange,
            pendingChanges
          };
        
        case PaymentGateway:
        case Whitelabel:
          return baseProps;
        
        case SchedulesForm:
          return {
            loading,
            onSubmit: (data) => {
              console.log("Horários salvos:", data);
              toast.success("Horários salvos com sucesso!");
            }
          };
          
        case PlansManager:
        case HelpsManager:
        case Reason:
        default:
          return {};
      }
    };

    return (
      <Component {...getComponentProps()} />
    );
  }, [
    currentTab, 
    tabsConfig, 
    settings, 
    loading,
    handleSettingChange,
    handleEnableReasonWhenCloseTicketChanged,
    pendingChanges
  ]);

  return (
    <StandardPageLayout
      title="Configurações do Sistema"
      subtitle="Gerencie todas as configurações e personalizações do sistema"
      stats={stats}
      showSearch={false}
    >
      {/* Navegação por Tabs */}
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: isMobile ? 3 : 1,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              minHeight: isMobile ? 64 : 48,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: isMobile ? '0.875rem' : '0.9rem',
              '&.Mui-selected': {
                fontWeight: 600
              }
            }
          }}
        >
          {tabsConfig.map((tab, index) => (
            <Tab
              key={index}
              icon={!isMobile ? tab.icon : null}
              label={tab.label}
              iconPosition="start"
              id={`settings-tab-${index}`}
              aria-controls={`settings-tabpanel-${index}`}
              sx={{
                '& .MuiTab-iconWrapper': {
                  marginRight: theme.spacing(1),
                  marginBottom: 0,
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Conteúdo das tabs */}
      <Box sx={{ position: 'relative' }}>
        {tabsConfig.map((_, index) => (
          <TabPanel key={index} value={currentTab} index={index}>
            {currentTab === index && renderCurrentTabContent()}
          </TabPanel>
        ))}
      </Box>
    </StandardPageLayout>
  );
};

export default Settings;