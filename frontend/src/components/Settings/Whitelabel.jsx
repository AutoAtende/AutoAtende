import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useMediaQuery } from "@mui/material";
import { BrushOutlined } from "@mui/icons-material";
import { useTheme } from '@mui/material/styles';
import WhiteLabelHelp from "../WhitelabelHelp";

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
  Tab,
  Tabs,
  Card,
  CardContent,
  Popover,
  CircularProgress,
  Button
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { ChromePicker } from "react-color";
import { AttachFile, Delete, Save } from "@mui/icons-material";
import { Settings, Palette, Image } from 'lucide-react';
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext.jsx";
import useSettings from "../../hooks/useSettings";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import { useLoading } from "../../hooks/useLoading/";
import { removePathName } from "./functions/removePathName";
import { i18n } from "../../translate/i18n.jsx";

// Importações de imagens
import faviconImage from "../../assets/images/Favicon.jpeg";
import logotipoImage from "../../assets/images/Logotipo.jpeg";
import pwaImage from "../../assets/images/PWA.jpeg";
import login_signup from "../../assets/images/login_signup.jpeg";

// Suas constantes existentes
const defaultBackgrounLogin = "";
const defaultBackgoundSignup = "";

function capitalizeFirstLetter(string) {
  return string?.charAt(0).toUpperCase() + string?.slice(1) || '';
}

// Componente SplashPreview otimizado com memo
const SplashPreview = React.memo(({ settings, theme }) => {
  // Determinar as cores com base no tema atual
  const isDarkMode = theme.palette.mode === 'dark';
  
  const backgroundColor = isDarkMode 
    ? settings.splashBackgroundDark || '#1C2E36' 
    : settings.splashBackgroundLight || '#ffffff';
    
  const textColor = isDarkMode 
    ? settings.splashTextColorDark || '#ffffff' 
    : settings.splashTextColorLight || '#000000';
  
  const appName = settings.splashAppName || "AutoAtende";
  const slogan = settings.splashSlogan || "Sua plataforma completa de atendimento";
  
  return (
    <Box
      sx={{
        width: "100%",
        height: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: backgroundColor,
        color: textColor,
        borderRadius: 1,
        padding: 2,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <CircularProgress 
        size={40} 
        thickness={4} 
        sx={{ 
          marginBottom: 2,
          color: textColor 
        }} 
      />
      
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: "bold",
          marginBottom: 1
        }}
      >
        {appName}
      </Typography>
      
      <Typography variant="body2">
        {slogan}
      </Typography>
    </Box>
  );
});

SplashPreview.displayName = 'SplashPreview';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  tabPanel: {
    marginTop: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    height: "100%",
  },
  formControl: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  colorPicker: {
    marginTop: theme.spacing(2),
  },
  previewBox: {
    marginBottom: theme.spacing(2),
    width: "100%",
    height: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  smallPreviewImage: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  uploadInput: {
    display: "none",
  },
  backgroundPreviewBox: {
    marginBottom: theme.spacing(2),
    width: "100%",
    height: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
  },
  backgroundPreviewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  colorPreview: {
    width: 42,
    height: 42,
    borderRadius: theme.shape.borderRadius,
    border: `2px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  colorPickerPopover: {
    position: 'absolute',
    zIndex: 2,
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  tabIcon: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
    },
  },
  saveButton: {
    marginTop: theme.spacing(2),
  }
}));

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

// Adicione esta constante para as opções de cores do Splash
const splashColorOptions = [
  { key: 'splashBackgroundLight', label: 'Cor de Fundo - Modo Claro' },
  { key: 'splashBackgroundDark', label: 'Cor de Fundo - Modo Escuro' },
  { key: 'splashTextColorLight', label: 'Cor do Texto - Modo Claro' },
  { key: 'splashTextColorDark', label: 'Cor do Texto - Modo Escuro' }
];

function Whitelabel({ settings }) {
  const classes = useStyles();
  // Estados e hooks
  const { colorMode } = useContext(ColorModeContext);
  const { user } = useContext(AuthContext);
  const { update } = useSettings();
  const { Loading } = useLoading();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);
  const [settingsLoaded, setSettingsLoaded] = useState({});
  const [selectedColorKey, setSelectedColorKey] = useState(themeColors[0]);
  const [selectedColorValue, setSelectedColorValue] = useState("");
  const [appName, setAppName] = useState("");
  const [copyright, setCopyright] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [terms, setTerms] = useState("");
  
  // Estados para os formulários que devem ser salvos apenas quando explicitamente solicitado
  const [generalForm, setGeneralForm] = useState({
    appName: "",
    copyright: "",
    privacy: "",
    terms: ""
  });
  
  const [splashForm, setSplashForm] = useState({
    splashAppName: "",
    splashSlogan: ""
  });
  
  const [selectedSplashColor, setSelectedSplashColor] = useState({
    key: 'splashBackgroundLight',
    value: '',
    label: 'Cor de Fundo - Modo Claro'
  });
  
  // Separação dos estados de colorPicker
  const [themeColorPickerAnchor, setThemeColorPickerAnchor] = useState(null);
  const [splashColorPickerAnchor, setSplashColorPickerAnchor] = useState(null);
  
  // Estado para indicar se há alterações não salvas
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState({
    general: false,
    colors: false,
    splash: false,
    logos: false
  });
  
  // Estado para controlar loading por seção
  const [loadingStates, setLoadingStates] = useState({
    general: false,
    colors: false,
    splash: false,
    logos: false
  });

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
  }, []);
  
  const updateSettingsLoaded = useCallback((key, value) => {
    if (isMounted.current) {
      setSettingsLoaded(prev => ({ ...prev, [key]: value }));
    }
  }, []);

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
          
          await update({ key, value });
          
          if (isMounted.current) {
              // Atualizar o estado localmente em uma única operação
              setSettingsLoaded(prev => ({ ...prev, [key]: value }));
              
              // Atualizar estados específicos se necessário
              if (key === 'privacy') setPrivacy(value);
              if (key === 'terms') setTerms(value);
              if (key === 'appName') setAppName(value);
              if (key === 'copyright') setCopyright(value);
              
              // Atualizar o tema apenas para a chave específica
              if (themeColors.includes(key) || key.startsWith('splash')) {
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
          
          toast.success(i18n.t("whiteLabel.updateSuccess"));
      } catch (error) {
          console.error("Erro ao salvar configuração:", error);
          toast.error(i18n.t("whiteLabel.updateError"));
      } finally {
          if (section && isMounted.current) {
              setLoadingForSection(section, false);
          }
      }
  },
  [update, settingsLoaded, colorMode, setLoadingForSection]
);

// Adicione esta nova função para atualizar o cache
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
  
  const handleColorChange = useCallback(
    (color) => {
      if (!color) return;
      const newColor = color.hex;
      setSelectedColorValue(newColor);
      // Marca que há alterações não salvas
      setHasUnsavedChanges(prev => ({...prev, colors: true}));
    },
    []
  );
  
  // Função para salvar cores do tema
  const saveThemeColor = useCallback(() => {
    if (selectedColorKey && selectedColorValue) {
      handleSaveSetting(selectedColorKey, selectedColorValue, 'colors');
    }
  }, [selectedColorKey, selectedColorValue, handleSaveSetting]);

  const handleColorKeyChange = useCallback(
    (event) => {
      const newColorKey = event.target.value;
      setSelectedColorKey(newColorKey);
      setSelectedColorValue(settingsLoaded[newColorKey] || "");
      setHasUnsavedChanges(prev => ({...prev, colors: false})); // Resetar alterações ao mudar a cor selecionada
    },
    [settingsLoaded]
  );

  const getImagePath = useCallback((imageKey, imagePath, companyId) => {
    // Verificar se o caminho já é uma URL completa
    if (!imagePath) {
      return getImageDefaultByImageKey(imageKey);
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `${process.env.REACT_APP_BACKEND_URL}/public/${imagePath}`;
  }, []);

  // Função otimizada para fazer upload de imagens de fundo
  const uploadBackground = useCallback(
    async (e, page) => {
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", page);

      try {
        setLoadingForSection('logos', true);
        const response = await api.post("/settings/background", formData);
        const backgroundUrl = response.data;
        
        if (isMounted.current) {
          updateSettingsLoaded(`${page}Background`, backgroundUrl);
          await handleSaveSetting(`${page}Background`, backgroundUrl);
          toast.success(i18n.t("whiteLabel.backgroundUpdateSuccess"));
        }
      } catch (err) {
        if (isMounted.current) {
          toast.error(i18n.t("whiteLabel.backgroundUploadError"));
        }
      } finally {
        if (isMounted.current) {
          setLoadingForSection('logos', false);
        }
      }
    },
    [handleSaveSetting, updateSettingsLoaded, setLoadingForSection]
  );

  // Função otimizada para excluir imagens de fundo
  const deleteBackground = useCallback(
    async (filename, imageKey) => {
      if (!filename) return;
      
      filename = removePathName(filename);
      try {
        setLoadingForSection('logos', true);
        await api.delete(`/settings/backgrounds/${filename}`);
        
        if (isMounted.current) {
          if (imageKey === "loginBackground") {
            updateSettingsLoaded("loginBackground", "");
            await handleSaveSetting("loginBackground", "");
          }
          if (imageKey === "signupBackground") {
            updateSettingsLoaded("signupBackground", "");
            await handleSaveSetting("signupBackground", "");
          }
          toast.success(i18n.t("whitelabel.success.backgroundUpdated"));
        }
      } catch (err) {
        if (isMounted.current) {
          toast.error(i18n.t("whitelabel.success.backgroundDeleteError"));
        }
      } finally {
        if (isMounted.current) {
          setLoadingForSection('logos', false);
        }
      }
    },
    [updateSettingsLoaded, handleSaveSetting, setLoadingForSection]
  );

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
  }, []);
  
  // Funções para o seletor de cores do tema
  const handleThemeColorPickerOpen = useCallback((event, colorType) => {
    setSelectedColorKey(colorType);
    setSelectedColorValue(settingsLoaded[colorType] || '');
    setThemeColorPickerAnchor(event.currentTarget);
  }, [settingsLoaded]);
  
  const handleThemeColorPickerClose = useCallback(() => {
    setThemeColorPickerAnchor(null);
  }, []);
  
  // Funções para o seletor de cores do splash
  const handleSplashColorPickerOpen = useCallback((event) => {
    setSplashColorPickerAnchor(event.currentTarget);
  }, []);
  
  const handleSplashColorPickerClose = useCallback(() => {
    setSplashColorPickerAnchor(null);
  }, []);
  
  // Função otimizada para fazer upload de logos
  const uploadLogo = useCallback(
    async (e, mode) => {
      if (!e.target.files || e.target.files.length === 0) return;
  
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
  
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
  
          toast.success(i18n.t("whitelabel.success.logoUpdated"));
        }
      } catch (err) {
        if (isMounted.current) {
          console.error("Erro no upload:", err);
          toast.error(i18n.t("whitelabel.error.logoUploadFailed"));
        }
      } finally {
        if (isMounted.current) {
          setLoadingForSection('logos', false);
        }
      }
    },
    [colorMode, handleSaveSetting, updateSettingsLoaded, setLoadingForSection]
  );

  const handleSplashColorChange = useCallback((color) => {
    if (!color) return;
    const newColor = color.hex;
    setSelectedSplashColor(prev => ({ ...prev, value: newColor }));
    setHasUnsavedChanges(prev => ({...prev, splash: true}));
  }, []);
  
  // Função para salvar cores do splash
  const saveSplashColor = useCallback(() => {
    if (selectedSplashColor.key && selectedSplashColor.value) {
      handleSaveSetting(selectedSplashColor.key, selectedSplashColor.value, 'splash');
    }
  }, [selectedSplashColor, handleSaveSetting]);
  
  // Função auxiliar para obter imagens padrão
  const getImageDefaultByImageKey = useCallback((imageKey) => {
    if (imageKey === "appLogoLight") return logotipoImage;
    if (imageKey === "appLogoDark") return logotipoImage;
    if (imageKey === "appLogoFavicon") return faviconImage;
    if (imageKey === "appLogoPWAIcon") return pwaImage;
    if (imageKey === "loginBackground") return login_signup;
    if (imageKey === "signupBackground") return login_signup;
    return null;
  }, []);
  
  // Implementação de função auxiliar para aplicar configurações ao tema de uma vez
  const applySettingsToTheme = useCallback((settings, companyId) => {
    if (!settings || !colorMode) return;
    
    // Aplica as cores ao tema
    themeColors.forEach((colorKey) => {
      const colorValue = settings[colorKey];
      if (colorValue && colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(colorKey)}`];
        if (typeof setterFunction === 'function') {
          setterFunction(colorValue);
        }
      }
    });

    // Aplica as configurações do splash ao tema
    splashColorOptions.forEach((option) => {
      const colorValue = settings[option.key];
      if (colorValue && colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(option.key)}`];
        if (typeof setterFunction === 'function') {
          setterFunction(colorValue);
        }
      }
    });

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

        // Configurações padrão caso não existam
        const defaultSettings = {
          splashBackgroundLight: '#ffffff',
          splashBackgroundDark: '#1C2E36',
          splashTextColorLight: '#000000',
          splashTextColorDark: '#ffffff',
          splashAppName: 'AutoAtende',
          splashSlogan: 'Sua plataforma completa de atendimento'
        };

        // Mescla as configurações salvas com as padrão
        const mergedSettings = {
          ...defaultSettings,
          ...initialSettings
        };

        if (isMounted.current) {
          // Atualiza todos os estados em uma única operação
          setSettingsLoaded(mergedSettings);
          setSelectedColorValue(mergedSettings[themeColors[0]] || '');
          
          // Inicializa os formulários com os valores carregados
          setGeneralForm({
            appName: mergedSettings.appName || '',
            copyright: mergedSettings.copyright || '',
            privacy: mergedSettings.privacy || '',
            terms: mergedSettings.terms || ''
          });
          
          setSplashForm({
            splashAppName: mergedSettings.splashAppName || '',
            splashSlogan: mergedSettings.splashSlogan || ''
          });
          
          // Mantém os estados individuais para compatibilidade
          setAppName(mergedSettings.appName || '');
          setCopyright(mergedSettings.copyright || '');
          setPrivacy(mergedSettings.privacy || '');
          setTerms(mergedSettings.terms || '');
          
          setSelectedSplashColor(prev => ({
            ...prev,
            value: mergedSettings[prev.key] || ''
          }));

          // Aplicar as configurações ao tema apenas uma vez
          applySettingsToTheme(mergedSettings, user?.companyId);
          
          // Marcar como inicializado
          settingsInitialized.current = true;
        }
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error);
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
    
    // Atualiza também os estados individuais para compatibilidade
    if (name === 'appName') setAppName(value);
    if (name === 'copyright') setCopyright(value);
    if (name === 'privacy') setPrivacy(value);
    if (name === 'terms') setTerms(value);
    
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
      handleSaveSetting('terms', generalForm.terms, 'general')
    ])
      .then(() => {
        setHasUnsavedChanges(prev => ({...prev, general: false}));
        toast.success(i18n.t("whiteLabel.updateSuccess"));
      })
      .catch((error) => {
        console.error('Erro ao salvar configurações gerais:', error);
        toast.error(i18n.t("whiteLabel.updateError"));
      })
      .finally(() => {
        setLoadingForSection('general', false);
      });
  }, [generalForm, handleSaveSetting, setLoadingForSection]);
  
  // Funções para o formulário splash
  const handleSplashFormChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Atualiza o estado do formulário
    setSplashForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Atualiza também settingsLoaded para o preview
    updateSettingsLoaded(name, value);
    
    // Marca que há alterações não salvas
    setHasUnsavedChanges(prev => ({...prev, splash: true}));
  }, [updateSettingsLoaded]);
  
// Função para salvar configurações do splash
const saveSplashSettings = useCallback(() => {
  setLoadingForSection('splash', true);
  
  Promise.all([
    handleSaveSetting('splashAppName', splashForm.splashAppName, 'splash'),
    handleSaveSetting('splashSlogan', splashForm.splashSlogan, 'splash'),
    saveSplashColor()
  ])
    .then(() => {
      setHasUnsavedChanges(prev => ({...prev, splash: false}));
      toast.success(i18n.t("whiteLabel.updateSuccess"));
    })
    .catch((error) => {
      console.error('Erro ao salvar configurações do splash:', error);
      toast.error(i18n.t("whiteLabel.updateError"));
    })
    .finally(() => {
      setLoadingForSection('splash', false);
    });
}, [splashForm, handleSaveSetting, saveSplashColor, setLoadingForSection]);

// Componentes otimizados com useMemo
const renderGeneralSettings = useMemo(
  () => (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Nome do sistema"
                variant="outlined"
                name="appName"
                value={generalForm.appName}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Copyright"
                variant="outlined"
                name="copyright"
                value={generalForm.copyright}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Link da Política de Privacidade"
                variant="outlined"
                name="privacy"
                value={generalForm.privacy}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Link dos Termos de uso"
                variant="outlined"
                name="terms"
                value={generalForm.terms}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
        </Grid>
        {loadingStates.general && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!hasUnsavedChanges.general || loadingStates.general}
            onClick={saveGeneralSettings}
            startIcon={<Save />}
            className={classes.saveButton}
          >
            Salvar Alterações
          </Button>
        </Box>
      </CardContent>
    </Card>
  ),
  [
    generalForm, 
    classes.formControl,
    classes.saveButton,
    loadingStates.general,
    hasUnsavedChanges.general,
    handleGeneralFormChange,
    saveGeneralSettings
  ]
);

const renderColorSettings = useMemo(
  () => (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl className={classes.formControl}>
              <InputLabel>Escolha a cor para personalizar</InputLabel>
              <Select value={selectedColorKey} onChange={handleColorKeyChange}>
                {themeColors.map((colorKey) => (
                  <MenuItem key={colorKey} value={colorKey}>
                    {colorLabels[colorKey]}
                  </MenuItem>
                ))}
                </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                className={classes.colorPreview}
                sx={{ backgroundColor: selectedColorValue }}
                onClick={(e) => handleThemeColorPickerOpen(e, selectedColorKey)}
              />
              <Typography>
                {selectedColorValue || 'Nenhuma cor selecionada'}
              </Typography>
            </Box>
            {themeColorPickerAnchor && (
              <>
                <Box
                  className={classes.backdrop}
                  onClick={handleThemeColorPickerClose}
                />
                <Box className={classes.colorPickerPopover}>
                  <ChromePicker
                    color={selectedColorValue}
                    onChange={handleColorChange}
                    disableAlpha
                  />
                </Box>
              </>
            )}
          </Grid>
        </Grid>
        {loadingStates.colors && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!hasUnsavedChanges.colors || loadingStates.colors}
            onClick={saveThemeColor}
            startIcon={<Save />}
            className={classes.saveButton}
          >
            Salvar Alterações
          </Button>
        </Box>
      </CardContent>
    </Card>
  ),
  [
    classes,
    selectedColorKey,
    selectedColorValue,
    handleColorKeyChange,
    handleColorChange,
    themeColorPickerAnchor,
    loadingStates.colors,
    hasUnsavedChanges.colors,
    handleThemeColorPickerOpen,
    handleThemeColorPickerClose,
    saveThemeColor
  ]
);

const renderSplashSettings = useMemo(
  () => (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Nome do Sistema na Tela de Carregamento"
                variant="outlined"
                name="splashAppName"
                value={splashForm.splashAppName}
                onChange={handleSplashFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Slogan na Tela de Carregamento"
                variant="outlined"
                name="splashSlogan"
                value={splashForm.splashSlogan}
                onChange={handleSplashFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl className={classes.formControl}>
              <InputLabel>Escolha a cor para personalizar</InputLabel>
              <Select
                value={selectedSplashColor.key}
                onChange={(e) => {
                  const option = splashColorOptions.find(opt => opt.key === e.target.value);
                  if (option) {
                    setSelectedSplashColor({
                      key: e.target.value,
                      value: settingsLoaded[e.target.value] || '',
                      label: option.label
                    });
                    setHasUnsavedChanges(prev => ({...prev, splash: false})); // Resetar alterações ao mudar a cor
                  }
                }}
              >
                {splashColorOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                className={classes.colorPreview}
                sx={{ backgroundColor: settingsLoaded[selectedSplashColor.key] }}
                onClick={handleSplashColorPickerOpen}
              />
              <Typography>
                {settingsLoaded[selectedSplashColor.key] || 'Nenhuma cor selecionada'}
              </Typography>
            </Box>
            {splashColorPickerAnchor && (
              <>
                <Box
                  className={classes.backdrop}
                  onClick={handleSplashColorPickerClose}
                />
                <Box className={classes.colorPickerPopover}>
                  <ChromePicker
                    color={settingsLoaded[selectedSplashColor.key]}
                    onChange={handleSplashColorChange}
                    disableAlpha
                  />
                </Box>
              </>
            )}
          </Grid>
        </Grid>
        {loadingStates.splash && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!hasUnsavedChanges.splash || loadingStates.splash}
            onClick={saveSplashSettings}
            startIcon={<Save />}
            className={classes.saveButton}
          >
            Salvar Alterações
          </Button>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Preview da Tela de Carregamento
          </Typography>
          <SplashPreview 
            settings={settingsLoaded}
            theme={theme} 
          />
        </Box>
      </CardContent>
    </Card>
  ),
  [
    classes,
    splashForm,
    settingsLoaded,
    selectedSplashColor,
    handleSplashColorChange,
    handleSplashFormChange,
    splashColorPickerAnchor,
    theme,
    loadingStates.splash,
    hasUnsavedChanges.splash,
    saveSplashSettings,
    handleSplashColorPickerOpen,
    handleSplashColorPickerClose
  ]
);

// Renderização otimizada para logos e fundos
const renderLogosAndBackgrounds = useMemo(
  () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Logos, Ícones e Imagens de Fundo
        </Typography>
        <Grid container spacing={3}>
          {imageFiles.map((imageKey) => {
            const imagePath = settingsLoaded[imageKey]
              ? `${process.env.REACT_APP_BACKEND_URL}/public/${settingsLoaded[imageKey]}`
              : getImageDefaultByImageKey(imageKey);
              
            return (
              <Grid item xs={12} sm={6} md={4} key={imageKey}>
                <Typography variant="subtitle1" gutterBottom>
                  {imageLabels[imageKey]}
                </Typography>
                <Box
                  className={
                    imageKey.includes("Background")
                      ? classes.backgroundPreviewBox
                      : classes.previewBox
                  }
                >
                  {imagePath && (
                    <img
                      src={imagePath}
                      alt={imageLabels[imageKey]}
                      className={
                        imageKey === "appLogoFavicon" ||
                        imageKey === "appLogoPWAIcon"
                          ? classes.smallPreviewImage
                          : imageKey.includes("Background")
                          ? classes.backgroundPreviewImage
                          : classes.previewImage
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getImageDefaultByImageKey(imageKey) || '';
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <input
                    type="file"
                    id={`upload-${imageKey}-button`}
                    className={classes.uploadInput}
                    onChange={(e) =>
                      imageKey.includes("Background")
                        ? uploadBackground(e, imageKey.replace("Background", ""))
                        : uploadLogo(e, imageKey)
                    }
                    accept="image/*"
                  />
                  <label htmlFor={`upload-${imageKey}-button`}>
                    <IconButton component="span" color="primary">
                      <AttachFile />
                    </IconButton>
                  </label>
                  {settingsLoaded[imageKey] && (
                    <IconButton
                      onClick={() =>
                        imageKey.includes("Background")
                          ? deleteBackground(settingsLoaded[imageKey], imageKey)
                          : handleSaveSetting(imageKey, "", "logos")
                      }
                      color="secondary"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
        {loadingStates.logos && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </CardContent>
    </Card>
  ),
  [
    classes,
    settingsLoaded,
    uploadLogo,
    uploadBackground,
    deleteBackground,
    handleSaveSetting,
    loadingStates.logos,
    getImageDefaultByImageKey
  ]
);

// Render principal com otimizações
return (
  <div className={classes.root}>
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab
          icon={<Settings className={classes.tabIcon} />}
          label={!isMobile && "Configurações Gerais"}
          iconPosition="start"
        />
        <Tab
          icon={<Palette className={classes.tabIcon} />}
          label={!isMobile && "Cores"}
          iconPosition="start"
        />
        <Tab
          icon={<BrushOutlined className={classes.tabIcon} />}
          label={!isMobile && "Tela de Carregamento"}
          iconPosition="start"
        />
        <Tab
          icon={<AttachFile className={classes.tabIcon} />}
          label={!isMobile && "Logos e Imagens"}
          iconPosition="start"
        />
      </Tabs>
    </Box>

    <TabPanel value={selectedTab} index={0}>
      {renderGeneralSettings}
    </TabPanel>

    <TabPanel value={selectedTab} index={1}>
      {renderColorSettings}
    </TabPanel>

    <TabPanel value={selectedTab} index={2}>
      {renderSplashSettings}
    </TabPanel>

    <TabPanel value={selectedTab} index={3}>
      {renderLogosAndBackgrounds}
    </TabPanel>

    {selectedTab === 0 && (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <WhiteLabelHelp />
          </CardContent>
        </Card>
      </Box>
    )}
  </div>
);
}

export default React.memo(Whitelabel);