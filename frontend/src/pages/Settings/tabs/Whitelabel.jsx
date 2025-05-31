import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTheme } from '@mui/material/styles';
import {
  FormControl,
  Grid, 
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Paper,
  Box,
  Card,
  CardContent,
  Popover,
  CircularProgress,
  Button,
  Stack,
  Divider,
  useMediaQuery,
  Tooltip,
  Chip,
  Alert
} from "@mui/material";
import { ChromePicker } from "react-color";
import { 
  AttachFile, 
  Delete, 
  Save, 
  Settings, 
  Palette, 
  Image,
  ColorLens,
  Refresh,
  Info
} from '@mui/icons-material';

import StandardTabContent from "../../../components/Standard/StandardTabContent";
import WhiteLabelHelp from "../../../components/WhitelabelHelp";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import useSettings from "../../../hooks/useSettings";
import ColorModeContext from "../../../layout/themeContext";
import api from "../../../services/api";
import { useLoading } from "../../../hooks/useLoading/";
import { removePathName } from "../../../components/shared/removePathName";
import { i18n } from "../../../translate/i18n.jsx";

// Importações de imagens
import faviconImage from "../../../assets/images/Favicon.jpeg";
import logotipoImage from "../../../assets/images/Logotipo.jpeg";
import pwaImage from "../../../assets/images/PWA.jpeg";
import login_signup from "../../../assets/backgrounds/default.jpeg";

// Constantes
const defaultBackgrounLogin = "";
const defaultBackgoundSignup = "";

function capitalizeFirstLetter(string) {
  return string?.charAt(0).toUpperCase() + string?.slice(1) || '';
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`whitelabel-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const themeColors = [
  "primaryColorLight",
  "secondaryColorLight",
  "primaryColorDark",
  "secondaryColorDark",
  "iconColorLight",
  "iconColorDark",
  "chatlistLight",
  "chatlistDark",
  "boxLeftLight",
  "boxLeftDark",
  "boxRightLight",
  "boxRightDark",
];

const colorLabels = {
  primaryColorLight: "Cor Primária Modo Claro",
  secondaryColorLight: "Cor Secundária Modo Claro",
  primaryColorDark: "Cor Primária Modo Escuro",
  secondaryColorDark: "Cor Secundária Modo Escuro",
  iconColorLight: "Cor do Ícone Modo Claro",
  iconColorDark: "Cor do Ícone Modo Escuro",
  chatlistLight: "Fundo Chat Interno Modo Claro",
  chatlistDark: "Fundo Chat Interno Modo Escuro",
  boxLeftLight: "Mensagens de Outros Modo Claro",
  boxLeftDark: "Mensagens de Outros Modo Escuro",
  boxRightLight: "Mensagens do Usuário Modo Claro",
  boxRightDark: "Mensagens do Usuário Modo Escuro",
};

// Agrupamentos de cores para uma melhor organização visual
const colorGroups = {
  "Cores do Tema": [
    "primaryColorLight", 
    "secondaryColorLight", 
    "primaryColorDark", 
    "secondaryColorDark"
  ],
  "Cores dos Ícones": [
    "iconColorLight", 
    "iconColorDark"
  ],
  "Cores do Chat": [
    "chatlistLight", 
    "chatlistDark", 
    "boxLeftLight", 
    "boxLeftDark", 
    "boxRightLight", 
    "boxRightDark"
  ]
};

const imageFiles = [
  "appLogoLight",
  "appLogoDark",
  "appLogoFavicon",
  "appLogoPWAIcon",
  "loginBackground",
  "signupBackground",
];

const imageLabels = {
  appLogoLight: "Logotipo para tema claro",
  appLogoDark: "Logotipo para tema escuro",
  appLogoFavicon: "Icone do FavIcon",
  appLogoPWAIcon: "Ícone do PWA",
  loginBackground: "Imagem de fundo para tela de login",
  signupBackground: "Imagem de fundo para tela de cadastro",
};

function Whitelabel({ settings }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados e hooks
  const { colorMode } = useContext(ColorModeContext);
  const { user } = useContext(AuthContext);
  const { update } = useSettings();
  const { Loading } = useLoading();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [settingsLoaded, setSettingsLoaded] = useState({});
  const [selectedColorKey, setSelectedColorKey] = useState(themeColors[0]);
  const [selectedColorValue, setSelectedColorValue] = useState("");
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null);

  
  // Estados para os formulários que devem ser salvos apenas quando explicitamente solicitado
  const [generalForm, setGeneralForm] = useState({
    appName: "",
    copyright: "",
    privacy: "",
    terms: "",
    loginPosition: "right",
    signupPosition: "right"
  });
  
  // Estado para indicar se há alterações não salvas
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState({
    general: false,
    colors: false,
    logos: false
  });
  
  // Estado para controlar loading por seção
  const [loadingStates, setLoadingStates] = useState({
    general: false,
    colors: false,
    logos: false
  });

  // Estado para armazenar cores do tema
  const [themeColorValues, setThemeColorValues] = useState({});

  // Referência para rastrear se o componente ainda está montado
  const isMounted = useRef(true);
  const settingsInitialized = useRef(false);

  // Função para atualizar o estado de loading de uma seção
  const setLoadingForSection = useCallback((section, isLoading) => {
    if (isMounted.current) {
      setLoadingStates(prev => ({
        ...prev,
        [section]: isLoading
      }));
    }
  }, []);

  // Limpar efeitos quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Limpar objetos URL para evitar vazamentos de memória
      imageFiles.forEach(imageKey => {
        if (settingsLoaded[imageKey] && settingsLoaded[imageKey].startsWith('blob:')) {
          URL.revokeObjectURL(settingsLoaded[imageKey]);
        }
      });
    };
  }, [settingsLoaded]);
  
  const updateSettingsLoaded = useCallback((key, value) => {
    if (isMounted.current) {
      setSettingsLoaded(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  // Atualiza o estado de cores do tema
  const updateThemeColorValues = useCallback((key, value) => {
    if (isMounted.current) {
      setThemeColorValues(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  // Função para obter imagem padrão
  const getImageDefaultByImageKey = (imageKey) => {
    if (imageKey === "appLogoLight") return logotipoImage;
    if (imageKey === "appLogoDark") return logotipoImage;
    if (imageKey === "appLogoFavicon") return faviconImage;
    if (imageKey === "appLogoPWAIcon") return pwaImage;
    if (imageKey === "loginBackground") return login_signup;
    if (imageKey === "signupBackground") return login_signup;
    return null;
  };

  // Função para construir caminho da imagem
  const getImagePath = (imageKey, imagePath, companyId) => {
    // Verificar se o caminho já é uma URL completa
    if (!imagePath) {
      return getImageDefaultByImageKey(imageKey);
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Construir URL específica para a empresa
    return `${process.env.REACT_APP_BACKEND_URL}/public/${imagePath}`;
  };

  const handleSaveSetting = useCallback(
    async (key, value, section = null) => {
      // Evitar requisições desnecessárias se o valor não mudou
      if (settingsLoaded[key] === value) {
        return;
      }
      
      try {
        if (section) {
          setLoadingForSection(section, true);
        }
        
        await update({ key, value, companyId: user.companyId });
        
        if (isMounted.current) {
          // Atualizar o estado localmente em uma única operação
          setSettingsLoaded(prev => ({ ...prev, [key]: value }));
          
          // Atualizar o tema apenas para a chave específica
          if (themeColors.includes(key)) {
            updateThemeColorValues(key, value);
            const setterFunction = colorMode[`set${capitalizeFirstLetter(key)}`];
            if (typeof setterFunction === 'function') {
              setterFunction(value);
            }
          }
          
          // Atualizar o cache no localStorage
          updateSettingsCache(key, value);
          
          // Resetar flag de alterações não salvas para esta seção
          if (section) {
            setHasUnsavedChanges(prev => ({
              ...prev, 
              [section]: false
            }));
          }
        }
        
        toast.success(i18n.t("whiteLabel.updateSuccess") || "Configuração salva com sucesso");
      } catch (error) {
        console.error("Erro ao salvar configuração:", error);
        toast.error(i18n.t("whiteLabel.updateError") || "Erro ao salvar configuração");
      } finally {
        if (section && isMounted.current) {
          setLoadingForSection(section, false);
        }
      }
    },
    [update, settingsLoaded, colorMode, setLoadingForSection, updateThemeColorValues, user.companyId]
  );

  // Função para atualizar o cache
  const updateSettingsCache = useCallback((key, value) => {
    try {
      const companyId = user?.companyId;
      if (!companyId) return;
      
      const cacheKey = `whitelabel_settings_${companyId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        cache.settings[key] = value;
        cache.timestamp = new Date().getTime(); // Atualiza o timestamp
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      } else {
        // Se não existir cache, cria um novo com esta configuração
        const settingsObj = { [key]: value };
        const cacheData = {
          timestamp: new Date().getTime(),
          settings: settingsObj
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Erro ao atualizar cache de configurações:', error);
    }
  }, [user?.companyId]);
  
  // Função para abrir o color picker
  const handleColorPickerOpen = useCallback((event, colorKey) => {
    setSelectedColorKey(colorKey);
    setSelectedColorValue(themeColorValues[colorKey] || settingsLoaded[colorKey] || '');
    setColorPickerAnchorEl(event.currentTarget);
  }, [themeColorValues, settingsLoaded]);
  
  // Função para fechar o color picker
  const handleColorPickerClose = useCallback(() => {
    setColorPickerAnchorEl(null);
  }, []);
  
  // Função para alterar cor no color picker
  const handleColorChange = useCallback((color) => {
    if (!color) return;
    const newColor = color.hex;
    setSelectedColorValue(newColor);
    // Marca que há alterações não salvas
    setHasUnsavedChanges(prev => ({...prev, colors: true}));
  }, []);
  
  // Função para salvar a cor selecionada
  const saveSelectedColor = useCallback(() => {
    if (selectedColorKey && selectedColorValue) {
      updateThemeColorValues(selectedColorKey, selectedColorValue);
      handleSaveSetting(selectedColorKey, selectedColorValue, 'colors');
      handleColorPickerClose();
    }
  }, [selectedColorKey, selectedColorValue, handleSaveSetting, handleColorPickerClose, updateThemeColorValues]);
  
  // Função para salvar todas as cores de uma vez
  const saveAllThemeColors = useCallback(async () => {
    try {
      setLoadingForSection('colors', true);
      
      // Cria um array de promises para todas as operações de salvamento
      const savePromises = Object.entries(themeColorValues).map(([key, value]) => 
        handleSaveSetting(key, value, null)
      );
      
      await Promise.all(savePromises);
      
      setHasUnsavedChanges(prev => ({...prev, colors: false}));
      toast.success(i18n.t("whiteLabel.updateSuccess") || "Todas as cores salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar todas as cores:", error);
      toast.error(i18n.t("whiteLabel.updateError") || "Erro ao salvar as cores");
    } finally {
      setLoadingForSection('colors', false);
    }
  }, [themeColorValues, handleSaveSetting, setLoadingForSection]);

  // Função para restaurar as cores padrão
  const resetToDefaultColors = useCallback(async () => {
    // Valores padrão para as cores do tema
    const defaultColors = {
      primaryColorLight: "#2196f3",
      secondaryColorLight: "#f50057",
      primaryColorDark: "#90caf9",
      secondaryColorDark: "#f48fb1",
      iconColorLight: "#424242",
      iconColorDark: "#e0e0e0",
      chatlistLight: "#f5f5f5",
      chatlistDark: "#303030",
      boxLeftLight: "#e0e0e0",
      boxLeftDark: "#424242",
      boxRightLight: "#dcf8c6",
      boxRightDark: "#056162"
    };
    
    try {
      setLoadingForSection('colors', true);
      
      // Atualiza os estados locais primeiro
      setThemeColorValues(defaultColors);
      
      // Cria um array de promises para todas as operações de salvamento
      const savePromises = Object.entries(defaultColors).map(([key, value]) => 
        handleSaveSetting(key, value, null)
      );
      
      await Promise.all(savePromises);
      
      setHasUnsavedChanges(prev => ({...prev, colors: false}));
      toast.success(i18n.t("whiteLabel.resetSuccess") || "Cores restauradas aos padrões");
    } catch (error) {
      console.error("Erro ao restaurar cores padrão:", error);
      toast.error(i18n.t("whiteLabel.resetError") || "Erro ao restaurar cores");
    } finally {
      setLoadingForSection('colors', false);
    }
  }, [handleSaveSetting, setLoadingForSection]);

  // Função otimizada para fazer upload de imagens de fundo
  const uploadBackground = useCallback(
    async (e, page) => {
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", page);
      formData.append("companyId", user.companyId.toString());
      try {
        setLoadingForSection('logos', true);
        const response = await api.post("/settings/background", formData);
        const backgroundUrl = response.data;
        
        if (isMounted.current) {
          updateSettingsLoaded(`${page}Background`, backgroundUrl);
          await handleSaveSetting(`${page}Background`, backgroundUrl);
          toast.success(i18n.t("whiteLabel.backgroundUpdateSuccess") || "Imagem de fundo atualizada");
        }
      } catch (err) {
        if (isMounted.current) {
          toast.error(i18n.t("whiteLabel.backgroundUploadError") || "Erro ao fazer upload da imagem");
        }
      } finally {
        if (isMounted.current) {
          setLoadingForSection('logos', false);
        }
      }
    },
    [handleSaveSetting, updateSettingsLoaded, setLoadingForSection, user.companyId]
  );

  // Função otimizada para excluir imagens de fundo
  const deleteBackground = useCallback(
    async (filename, imageKey) => {
      if (!filename) return;
      
      filename = removePathName(filename);
      try {
        setLoadingForSection('logos', true);
        await api.delete(`/settings/backgrounds/${filename}?companyId=${user.companyId}`);
        
        if (isMounted.current) {
          if (imageKey === "loginBackground") {
            updateSettingsLoaded("loginBackground", "");
            await handleSaveSetting("loginBackground", "");
          }
          if (imageKey === "signupBackground") {
            updateSettingsLoaded("signupBackground", "");
            await handleSaveSetting("signupBackground", "");
          }
          toast.success(i18n.t("whitelabel.success.backgroundUpdated") || "Imagem removida com sucesso");
        }
      } catch (err) {
        if (isMounted.current) {
          toast.error(i18n.t("whitelabel.success.backgroundDeleteError") || "Erro ao remover imagem");
        }
      } finally {
        if (isMounted.current) {
          setLoadingForSection('logos', false);
        }
      }
    },
    [updateSettingsLoaded, handleSaveSetting, setLoadingForSection, user.companyId]
  );

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
  }, []);

  // Função otimizada para fazer upload de logos
  const uploadLogo = useCallback(
    async (e, mode) => {
      if (!e.target.files || e.target.files.length === 0) return;
  
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      formData.append("companyId", user.companyId.toString());
  
      try {
        setLoadingForSection('logos', true);
        const response = await api.post("/settings/logo", formData);
        const logoUrl = response.data;
  
        if (isMounted.current) {
          updateSettingsLoaded(mode, logoUrl);
  
          // Construir URL completa
          const fullUrl = `${process.env.REACT_APP_BACKEND_URL}/public/${logoUrl}`;
  
          // Atualizar ColorMode
          const setterFunction = colorMode[`set${capitalizeFirstLetter(mode)}`];
          if (typeof setterFunction === "function") {
            setterFunction(fullUrl);
          }
  
          // Salvar configuração
          await handleSaveSetting(mode, logoUrl);
  
          toast.success(i18n.t("whitelabel.success.logoUpdated") || "Logo atualizado com sucesso");
        }
      } catch (err) {
        if (isMounted.current) {
          console.error("Erro no upload:", err);
          toast.error(i18n.t("whitelabel.error.logoUploadFailed") || "Erro ao fazer upload do logo");
        }
      } finally {
        if (isMounted.current) {
          setLoadingForSection('logos', false);
        }
      }
    },
    [colorMode, handleSaveSetting, updateSettingsLoaded, setLoadingForSection, user.companyId]
  );
  
  // Implementação de função auxiliar para aplicar configurações ao tema de uma vez
  const applySettingsToTheme = useCallback((settings, companyId) => {
    if (!settings || !colorMode) return;

    // Criar uma cópia das cores do tema para o estado
    const themeColorsCopy = {};
    
    // Aplica as cores ao tema
    themeColors.forEach((colorKey) => {
      const colorValue = settings[colorKey];
      themeColorsCopy[colorKey] = colorValue || '';
      
      if (colorValue && colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(colorKey)}`];
        if (typeof setterFunction === 'function') {
          setterFunction(colorValue);
        }
      }
    });

    // Atualiza o estado das cores do tema
    setThemeColorValues(themeColorsCopy);

    // Aplica as imagens
    imageFiles.forEach((imageKey) => {
      if (settings[imageKey] && colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(imageKey)}`];
        if (typeof setterFunction === 'function') {
          const imagePath = getImagePath(
            imageKey,
            settings[imageKey],
            companyId
          );
          setterFunction(imagePath);
        }
      }
    });
  }, [colorMode, getImagePath]);

  // Carregar configurações otimizado
  const fetchUserAndInitializeSettings = useCallback(async () => {
    if (settingsInitialized.current || !isMounted.current) return;
    
    try {
      Loading.turnOn();

      if (Array.isArray(settings) && settings.length) {
        const initialSettings = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});

        // Mescla as configurações salvas com as padrão
        const mergedSettings = {
          ...initialSettings
        };

        if (isMounted.current) {
          // Atualiza todos os estados em uma única operação
          setSettingsLoaded(mergedSettings);
          
          // Inicializa os formulários com os valores carregados
          setGeneralForm({
            appName: mergedSettings.appName || '',
            copyright: mergedSettings.copyright || '',
            privacy: mergedSettings.privacy || '',
            terms: mergedSettings.terms || '',
            loginPosition: mergedSettings.loginPosition || 'right',
            signupPosition: mergedSettings.signupPosition || 'right'
          });

          // Aplicar as configurações ao tema apenas uma vez
          applySettingsToTheme(mergedSettings, user?.companyId);
          
          // Marcar como inicializado
          settingsInitialized.current = true;
        }
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message || "Erro ao carregar configurações");
      }
    } finally {
      if (isMounted.current) {
        Loading.turnOff();
      }
    }
  }, [settings, Loading, applySettingsToTheme, user]);

  // useEffect corrigido para evitar loops
  useEffect(() => {
    fetchUserAndInitializeSettings();
  }, [fetchUserAndInitializeSettings]);

  // Funções para o formulário geral
  const handleGeneralFormChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Atualiza o estado do formulário
    setGeneralForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marca que há alterações não salvas
    setHasUnsavedChanges(prev => ({...prev, general: true}));
  }, []);
  
  // Função para salvar configurações gerais
  const saveGeneralSettings = useCallback(() => {
    setLoadingForSection('general', true);
    
    Promise.all([
      handleSaveSetting('appName', generalForm.appName, 'general'),
      handleSaveSetting('copyright', generalForm.copyright, 'general'),
      handleSaveSetting('privacy', generalForm.privacy, 'general'),
      handleSaveSetting('terms', generalForm.terms, 'general'),
      handleSaveSetting('loginPosition', generalForm.loginPosition, 'general'),
      handleSaveSetting('signupPosition', generalForm.signupPosition, 'general') 
    ])
      .then(() => {
        setHasUnsavedChanges(prev => ({...prev, general: false}));
        toast.success(i18n.t("whiteLabel.updateSuccess") || "Configurações salvas com sucesso");
      })
      .catch((error) => {
        console.error('Erro ao salvar configurações gerais:', error);
        toast.error(i18n.t("whiteLabel.updateError") || "Erro ao salvar configurações");
      })
      .finally(() => {
        setLoadingForSection('general', false);
      });
  }, [generalForm, handleSaveSetting, setLoadingForSection]);

  // Preparar estatísticas
  const stats = useMemo(() => {
    const activeConfigs = [];
    
    if (generalForm.appName) {
      activeConfigs.push({
        label: `App: ${generalForm.appName}`,
        icon: <Settings />,
        color: 'primary'
      });
    }
    
    const activeColors = Object.keys(themeColorValues).filter(key => themeColorValues[key]).length;
    if (activeColors > 0) {
      activeConfigs.push({
        label: `${activeColors} cores personalizadas`,
        icon: <Palette />,
        color: 'secondary'
      });
    }
    
    const activeImages = imageFiles.filter(key => settingsLoaded[key]).length;
    if (activeImages > 0) {
      activeConfigs.push({
        label: `${activeImages} imagens configuradas`,
        icon: <Image />,
        color: 'success'
      });
    }
    
    return activeConfigs;
  }, [generalForm.appName, themeColorValues, settingsLoaded]);

  // Preparar tabs
  const tabs = [
    { label: "Configurações Gerais", icon: <Settings /> },
    { label: "Cores", icon: <Palette /> },
    { label: "Logos e Imagens", icon: <Image /> }
  ];

  // Componentes otimizados com useMemo
  const renderGeneralSettings = useMemo(
    () => (
      <StandardTabContent
        title="Configurações Gerais"
        description="Configure informações básicas e aparência do sistema"
        icon={<Settings />}
        variant="paper"
        actions={
          <Button
            variant="contained"
            color="primary"
            disabled={!hasUnsavedChanges.general || loadingStates.general}
            onClick={saveGeneralSettings}
            startIcon={loadingStates.general ? <CircularProgress size={20} /> : <Save />}
            sx={{ 
              borderRadius: isMobile ? 3 : 2,
              minHeight: isMobile ? 48 : 40
            }}
          >
            Salvar Alterações
          </Button>
        }
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nome do sistema"
              variant="outlined"
              name="appName"
              value={generalForm.appName}
              onChange={handleGeneralFormChange}
              fullWidth
              size={isMobile ? "medium" : "small"}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Copyright"
              variant="outlined"
              name="copyright"
              value={generalForm.copyright}
              onChange={handleGeneralFormChange}
              fullWidth
              size={isMobile ? "medium" : "small"}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size={isMobile ? "medium" : "small"}>
              <InputLabel>Posição do Formulário de Login</InputLabel>
              <Select
                name="loginPosition"
                value={generalForm.loginPosition || 'right'}
                onChange={handleGeneralFormChange}
                label="Posição do Formulário de Login"
              >
                <MenuItem value="left">Esquerda</MenuItem>
                <MenuItem value="center">Centro</MenuItem>
                <MenuItem value="right">Direita</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size={isMobile ? "medium" : "small"}>
              <InputLabel>Posição do Formulário de Cadastro</InputLabel>
              <Select
                name="signupPosition"
                value={generalForm.signupPosition || 'right'}
                onChange={handleGeneralFormChange}
                label="Posição do Formulário de Cadastro"
              >
                <MenuItem value="left">Esquerda</MenuItem>
                <MenuItem value="center">Centro</MenuItem>
                <MenuItem value="right">Direita</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Link da Política de Privacidade"
              variant="outlined"
              name="privacy"
              value={generalForm.privacy}
              onChange={handleGeneralFormChange}
              fullWidth
              size={isMobile ? "medium" : "small"}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Link dos Termos de uso"
              variant="outlined"
              name="terms"
              value={generalForm.terms}
              onChange={handleGeneralFormChange}
              fullWidth
              size={isMobile ? "medium" : "small"}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>

        {hasUnsavedChanges.general && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicá-las.
          </Alert>
        )}
      </StandardTabContent>
    ),
    [
      generalForm, 
      loadingStates.general,
      hasUnsavedChanges.general,
      handleGeneralFormChange,
      saveGeneralSettings,
      isMobile
    ]
  );

  // Interface melhorada para seleção de cores
  const renderColorSettings = useMemo(
    () => (
      <StandardTabContent
        title="Personalização de Cores"
        description="Customize as cores do tema para combinar com sua marca"
        icon={<ColorLens />}
        variant="paper"
        actions={
          <Stack direction={isMobile ? "column" : "row"} spacing={1}>
            <Button 
              variant="outlined" 
              color="secondary" 
              startIcon={<Refresh />}
              onClick={resetToDefaultColors}
              disabled={loadingStates.colors}
              size={isMobile ? "large" : "medium"}
              sx={{ borderRadius: isMobile ? 3 : 2 }}
            >
              {isMobile ? "Restaurar" : "Restaurar Padrões"}
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={loadingStates.colors ? <CircularProgress size={20} /> : <Save />}
              onClick={saveAllThemeColors}
              disabled={loadingStates.colors}
              size={isMobile ? "large" : "medium"}
              sx={{ borderRadius: isMobile ? 3 : 2 }}
            >
              {isMobile ? "Salvar" : "Salvar Todas as Cores"}
            </Button>
          </Stack>
        }
      >
        {/* Layout em grupos para melhor visualização */}
        {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
          <Box key={groupName} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              {groupName}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {colorKeys.map((colorKey) => (
                <Grid item xs={6} sm={4} md={3} key={colorKey}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      transition: 'all 0.2s',
                      borderRadius: isMobile ? 3 : 2,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: 'center',
                        mb: 2,
                        fontSize: '0.75rem',
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {colorLabels[colorKey]}
                    </Typography>
                    
                    <Box
                      sx={{
                        width: '100%',
                        height: isMobile ? 56 : 48,
                        backgroundColor: themeColorValues[colorKey] || settingsLoaded[colorKey] || '#ffffff',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        mb: 2,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                      onClick={(e) => handleColorPickerOpen(e, colorKey)}
                    />
                    
                    <Chip 
                      label={themeColorValues[colorKey] || settingsLoaded[colorKey] || 'Não definido'} 
                      size="small"
                      sx={{ 
                        width: '100%', 
                        fontSize: '0.7rem', 
                        height: 28,
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {hasUnsavedChanges.colors && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            Você tem alterações de cores não salvas. Use o botão "Salvar Todas as Cores" para aplicá-las.
          </Alert>
        )}
        
        {/* Color Picker Popover */}
        <Popover
          open={Boolean(colorPickerAnchorEl)}
          anchorEl={colorPickerAnchorEl}
          onClose={handleColorPickerClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            '& .MuiPopover-paper': {
              p: 2,
              boxShadow: 6,
              borderRadius: 2
            }
          }}
        >
          <Box sx={{ width: 220 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              {colorLabels[selectedColorKey]}
            </Typography>
            <ChromePicker
              color={selectedColorValue}
              onChange={handleColorChange}
              disableAlpha
              styles={{
                default: {
                  picker: {
                    width: '100%',
                    boxShadow: 'none',
                    fontFamily: theme.typography.fontFamily
                  }
                }
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleColorPickerClose}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                onClick={saveSelectedColor}
                disabled={!selectedColorValue}
                sx={{ borderRadius: 2 }}
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </Popover>
      </StandardTabContent>
    ),
    [
      theme,
      colorPickerAnchorEl,
      selectedColorKey,
      selectedColorValue,
      themeColorValues,
      settingsLoaded,
      loadingStates.colors,
      hasUnsavedChanges.colors,
      handleColorPickerOpen,
      handleColorPickerClose,
      handleColorChange,
      saveSelectedColor,
      saveAllThemeColors,
      resetToDefaultColors,
      isMobile
    ]
  );

  // Renderização otimizada para logos e fundos
  const renderLogosAndBackgrounds = useMemo(
    () => (
      <StandardTabContent
        title="Logos, Ícones e Imagens de Fundo"
        description="Personalize as imagens e logos do sistema"
        icon={<Image />}
        variant="paper"
      >
        <Grid container spacing={3}>
          {imageFiles.map((imageKey) => {
            const imagePath = settingsLoaded[imageKey]
              ? `${process.env.REACT_APP_BACKEND_URL}/public/${settingsLoaded[imageKey]}`
              : getImageDefaultByImageKey(imageKey);
              
            return (
              <Grid item xs={12} sm={6} md={4} key={imageKey}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%',
                    borderRadius: isMobile ? 3 : 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      {imageLabels[imageKey]}
                    </Typography>
                    <Box
                      sx={{
                        mb: 2,
                        width: "100%",
                        height: imageKey.includes("Background") ? 200 : 100,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        overflow: "hidden",
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                      }}
                    >
                      {imagePath && (
                        <img
                          src={imagePath}
                          alt={imageLabels[imageKey]}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: imageKey === "appLogoFavicon" || imageKey === "appLogoPWAIcon" ? 48 : "auto",
                            height: imageKey === "appLogoFavicon" || imageKey === "appLogoPWAIcon" ? 48 : "auto",
                            objectFit: imageKey.includes("Background") ? "cover" : "contain"
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImageDefaultByImageKey(imageKey) || '';
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        id={`upload-${imageKey}-button`}
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          imageKey.includes("Background")
                            ? uploadBackground(e, imageKey.replace("Background", ""))
                            : uploadLogo(e, imageKey)
                        }
                        accept="image/*"
                      />
                      <label htmlFor={`upload-${imageKey}-button`} style={{ flex: 1 }}>
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<AttachFile />}
                          size={isMobile ? "medium" : "small"}
                          fullWidth
                          sx={{ borderRadius: isMobile ? 2 : 1.5 }}
                        >
                          Upload
                        </Button>
                      </label>
                      {settingsLoaded[imageKey] && (
                        <Button
                          onClick={() =>
                            imageKey.includes("Background")
                              ? deleteBackground(settingsLoaded[imageKey], imageKey)
                              : handleSaveSetting(imageKey, "", "logos")
                          }
                          color="error"
                          variant="outlined"
                          startIcon={<Delete />}
                          size={isMobile ? "medium" : "small"}
                          sx={{ borderRadius: isMobile ? 2 : 1.5 }}
                        >
                          Remover
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        {loadingStates.logos && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress size={32} />
          </Box>
        )}
      </StandardTabContent>
    ),
    [
      theme,
      settingsLoaded,
      uploadLogo,
      uploadBackground,
      deleteBackground,
      handleSaveSetting,
      loadingStates.logos,
      getImageDefaultByImageKey,
      isMobile
    ]
  );

  // Renderiza mensagem de ajuda informativa
  const renderHelpSection = useMemo(() => (
    <StandardTabContent
      title="Ajuda e Documentação"
      description="Informações sobre personalização e uso do sistema"
      icon={<Info />}
      variant="paper"
    >
      <WhiteLabelHelp />
    </StandardTabContent>
  ), []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header com estatísticas */}
      <StandardTabContent
        title="Personalização do Sistema (Whitelabel)"
        description="Configure a aparência, cores, logos e informações do sistema"
        icon={<Palette />}
        stats={stats}
        variant="default"
      >
        {/* Navegação por Tabs */}
        <Paper elevation={2} sx={{ mb: 3, borderRadius: isMobile ? 3 : 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', overflowX: 'auto' }}>
              {tabs.map((tab, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedTab(index)}
                  startIcon={!isMobile ? tab.icon : null}
                  variant={selectedTab === index ? "contained" : "text"}
                  sx={{
                    m: 1,
                    minHeight: isMobile ? 48 : 40,
                    borderRadius: isMobile ? 2 : 1.5,
                    whiteSpace: 'nowrap',
                    fontWeight: selectedTab === index ? 600 : 500
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Conteúdo das tabs */}
        <Box sx={{ mt: 2 }}>
          <TabPanel value={selectedTab} index={0}>
            {renderGeneralSettings}
            {renderHelpSection}
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            {renderColorSettings}
          </TabPanel>

          <TabPanel value={selectedTab} index={2}>
            {renderLogosAndBackgrounds}
          </TabPanel>
        </Box>
      </StandardTabContent>
    </Box>
  );
}

Whitelabel.propTypes = {
  settings: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.any
    })
  )
};

Whitelabel.defaultProps = {
  settings: []
};

export default React.memo(Whitelabel);