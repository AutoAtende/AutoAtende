import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useTheme } from '@mui/material/styles';
import {
  FormControl,
  Grid, 
  TextField,
  Typography,
  IconButton,
  Paper,
  Box,
  Card,
  CardContent,
  Popover,
  Button,
  Stack,
  Divider,
  useMediaQuery,
  Tooltip,
  Alert,
  CircularProgress
} from "@mui/material";
import { ChromePicker } from "react-color";
import { 
  AttachFile, 
  Delete, 
  Save, 
  Palette, 
  Image,
  Refresh,
  Info
} from '@mui/icons-material';

import BaseButton from "../../../components/shared/BaseButton";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import useSettings from "../../../hooks/useSettings";
import ColorModeContext from "../../../layout/themeContext";
import api from "../../../services/api";
import { useLoading } from "../../../hooks/useLoading";
import { i18n } from "../../../translate/i18n";

// Configurações das cores do tema
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
  primaryColorLight: "Cor Primária (Claro)",
  secondaryColorLight: "Cor Secundária (Claro)",
  primaryColorDark: "Cor Primária (Escuro)",
  secondaryColorDark: "Cor Secundária (Escuro)",
  iconColorLight: "Cor do Ícone (Claro)",
  iconColorDark: "Cor do Ícone (Escuro)",
  chatlistLight: "Fundo Chat (Claro)",
  chatlistDark: "Fundo Chat (Escuro)",
  boxLeftLight: "Mensagens Recebidas (Claro)",
  boxLeftDark: "Mensagens Recebidas (Escuro)",
  boxRightLight: "Mensagens Enviadas (Claro)",
  boxRightDark: "Mensagens Enviadas (Escuro)",
};

const colorGroups = {
  "Cores Principais": [
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
  appLogoLight: "Logo (Tema Claro)",
  appLogoDark: "Logo (Tema Escuro)",
  appLogoFavicon: "Favicon",
  appLogoPWAIcon: "Ícone PWA",
  loginBackground: "Fundo da Tela de Login",
  signupBackground: "Fundo da Tela de Cadastro",
};

// Imagens padrão - URLs de fallback
const defaultImages = {
  appLogoLight: "/assets/default-logo-light.png",
  appLogoDark: "/assets/default-logo-dark.png",
  appLogoFavicon: "/favicon.ico",
  appLogoPWAIcon: "/assets/default-pwa-icon.png",
  loginBackground: "/assets/default-login-bg.jpg",
  signupBackground: "/assets/default-signup-bg.jpg",
};

function capitalizeFirstLetter(string) {
  return string?.charAt(0).toUpperCase() + string?.slice(1) || '';
}

const Whitelabel = ({ settings = [], hideLayout = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { colorMode } = useContext(ColorModeContext);
  const { user } = useContext(AuthContext);
  const { update } = useSettings();
  const { Loading } = useLoading();
  
  // Estados consolidados
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Estados das configurações
  const [generalSettings, setGeneralSettings] = useState({
    appName: "",
    copyright: "",
    privacy: "",
    terms: ""
  });
  
  const [colorSettings, setColorSettings] = useState({});
  const [imageSettings, setImageSettings] = useState({});
  
  // Estados do color picker
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorKey, setSelectedColorKey] = useState("");
  
  // Estados de alterações
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar configurações iniciais - CORRIGIDO
  const loadSettings = useCallback(() => {
    if (!Array.isArray(settings)) {
      console.warn('Settings is not an array:', settings);
      setInitialized(true);
      return;
    }

    try {
      const settingsMap = settings.reduce((acc, setting) => {
        if (setting && setting.key) {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {});

      // Configurações gerais
      setGeneralSettings({
        appName: settingsMap.appName || "",
        copyright: settingsMap.copyright || "",
        privacy: settingsMap.privacy || "",
        terms: settingsMap.terms || ""
      });

      // Configurações de cores
      const colors = {};
      themeColors.forEach(colorKey => {
        colors[colorKey] = settingsMap[colorKey] || "";
      });
      setColorSettings(colors);

      // Configurações de imagens
      const images = {};
      imageFiles.forEach(imageKey => {
        images[imageKey] = settingsMap[imageKey] || "";
      });
      setImageSettings(images);

      // Aplicar cores ao tema se disponível
      if (colorMode) {
        themeColors.forEach(colorKey => {
          const colorValue = settingsMap[colorKey];
          if (colorValue) {
            const setterFunction = colorMode[`set${capitalizeFirstLetter(colorKey)}`];
            if (typeof setterFunction === 'function') {
              setterFunction(colorValue);
            }
          }
        });

        // Aplicar imagens ao tema se disponível
        imageFiles.forEach(imageKey => {
          const imageValue = settingsMap[imageKey];
          if (imageValue) {
            const setterFunction = colorMode[`set${capitalizeFirstLetter(imageKey)}`];
            if (typeof setterFunction === 'function') {
              const imagePath = getImagePath(imageKey, imageValue);
              setterFunction(imagePath);
            }
          }
        });
      }

      setInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setInitialized(true);
    }
  }, [settings, colorMode]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Função para salvar configuração individual
  const saveSetting = useCallback(async (key, value) => {
    try {
      await update({ key, value });
      toast.success("Configuração atualizada com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
      return false;
    }
  }, [update]);

  // Função para obter caminho da imagem
  const getImagePath = useCallback((imageKey, imagePath) => {
    if (!imagePath) {
      return getDefaultImage(imageKey);
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `${process.env.REACT_APP_BACKEND_URL}/public/${imagePath}`;
  }, []);

  // Função para obter imagens padrão
  const getDefaultImage = useCallback((imageKey) => {
    return defaultImages[imageKey] || null;
  }, []);

  // Handlers para configurações gerais
  const handleGeneralChange = useCallback((key) => (event) => {
    const value = event.target.value;
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const saveGeneralSettings = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all(
        Object.entries(generalSettings).map(([key, value]) => 
          saveSetting(key, value)
        )
      );
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Erro ao salvar configurações gerais:", error);
    } finally {
      setLoading(false);
    }
  }, [generalSettings, saveSetting]);

  // Handlers para cores
  const handleColorPickerOpen = useCallback((event, colorKey) => {
    setSelectedColorKey(colorKey);
    setSelectedColor(colorSettings[colorKey] || '#ffffff');
    setColorPickerAnchor(event.currentTarget);
  }, [colorSettings]);

  const handleColorPickerClose = useCallback(() => {
    setColorPickerAnchor(null);
  }, []);

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color.hex);
  }, []);

  const saveSelectedColor = useCallback(async () => {
    if (!selectedColorKey || !selectedColor) return;

    const success = await saveSetting(selectedColorKey, selectedColor);
    if (success) {
      setColorSettings(prev => ({ ...prev, [selectedColorKey]: selectedColor }));
      
      // Aplicar ao tema
      if (colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(selectedColorKey)}`];
        if (typeof setterFunction === 'function') {
          setterFunction(selectedColor);
        }
      }
    }
    
    handleColorPickerClose();
  }, [selectedColorKey, selectedColor, saveSetting, colorMode, handleColorPickerClose]);

  const resetColorsToDefault = useCallback(async () => {
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
    
    setLoading(true);
    try {
      await Promise.all(
        Object.entries(defaultColors).map(([key, value]) => 
          saveSetting(key, value)
        )
      );
      
      setColorSettings(defaultColors);
      
      // Aplicar ao tema
      if (colorMode) {
        Object.entries(defaultColors).forEach(([key, value]) => {
          const setterFunction = colorMode[`set${capitalizeFirstLetter(key)}`];
          if (typeof setterFunction === 'function') {
            setterFunction(value);
          }
        });
      }
      
      toast.success("Cores restauradas para o padrão");
    } catch (error) {
      console.error("Erro ao restaurar cores:", error);
      toast.error("Erro ao restaurar cores");
    } finally {
      setLoading(false);
    }
  }, [saveSetting, colorMode]);

  // Handlers para imagens
  const uploadImage = useCallback(async (event, imageKey) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    
    if (imageKey.includes("Background")) {
      formData.append("page", imageKey.replace("Background", ""));
    } else {
      formData.append("mode", imageKey);
    }

    setLoading(true);
    try {
      const endpoint = imageKey.includes("Background") ? "/settings/background" : "/settings/logo";
      const response = await api.post(endpoint, formData);
      const imageUrl = response.data;
      
      // Salvar configuração
      await saveSetting(imageKey, imageUrl);
      
      // Atualizar estado local
      setImageSettings(prev => ({ ...prev, [imageKey]: imageUrl }));
      
      // Aplicar ao tema
      if (colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(imageKey)}`];
        if (typeof setterFunction === 'function') {
          const fullUrl = getImagePath(imageKey, imageUrl);
          setterFunction(fullUrl);
        }
      }
      
      toast.success("Imagem atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setLoading(false);
    }
  }, [saveSetting, colorMode, getImagePath]);

  const deleteImage = useCallback(async (imageKey) => {
    setLoading(true);
    try {
      await saveSetting(imageKey, "");
      setImageSettings(prev => ({ ...prev, [imageKey]: "" }));
      
      // Aplicar imagem padrão ao tema
      if (colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(imageKey)}`];
        if (typeof setterFunction === 'function') {
          setterFunction(getDefaultImage(imageKey));
        }
      }
      
      toast.success("Imagem removida com sucesso");
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast.error("Erro ao remover imagem");
    } finally {
      setLoading(false);
    }
  }, [saveSetting, colorMode, getDefaultImage]);

  // Seções da interface
  const sections = useMemo(() => [
    { title: "Configurações Gerais", icon: <Info /> },
    { title: "Cores do Tema", icon: <Palette /> },
    { title: "Logos e Imagens", icon: <Image /> }
  ], []);

  // Renderização das configurações gerais
  const renderGeneralSettings = useMemo(() => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Configurações Gerais</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Sistema"
              value={generalSettings.appName}
              onChange={handleGeneralChange("appName")}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Copyright"
              value={generalSettings.copyright}
              onChange={handleGeneralChange("copyright")}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Link da Política de Privacidade"
              value={generalSettings.privacy}
              onChange={handleGeneralChange("privacy")}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Link dos Termos de Uso"
              value={generalSettings.terms}
              onChange={handleGeneralChange("terms")}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <BaseButton
            variant="contained"
            onClick={saveGeneralSettings}
            disabled={!hasUnsavedChanges || loading}
            icon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            Salvar Alterações
          </BaseButton>
        </Box>
      </CardContent>
    </Card>
  ), [generalSettings, hasUnsavedChanges, loading, handleGeneralChange, saveGeneralSettings]);

  // Renderização das configurações de cores
  const renderColorSettings = useMemo(() => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Cores do Tema</Typography>
        <BaseButton
          variant="outlined"
          onClick={resetColorsToDefault}
          disabled={loading}
          icon={<Refresh />}
        >
          Restaurar Padrão
        </BaseButton>
      </Box>

      <Card>
        <CardContent>
          {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
            <Box key={groupName} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {groupName}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {colorKeys.map((colorKey) => (
                  <Grid item xs={6} sm={4} md={3} key={colorKey}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 1, 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={(e) => handleColorPickerOpen(e, colorKey)}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 60,
                          backgroundColor: colorSettings[colorKey] || '#ffffff',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          mb: 1
                        }}
                      />
                      <Typography variant="caption" display="block" textAlign="center">
                        {colorLabels[colorKey]}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        display="block" 
                        textAlign="center"
                        sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                      >
                        {colorSettings[colorKey] || 'Não definido'}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Color Picker */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={handleColorPickerClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {colorLabels[selectedColorKey]}
          </Typography>
          <ChromePicker
            color={selectedColor}
            onChange={handleColorChange}
            disableAlpha
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleColorPickerClose}>
              Cancelar
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              onClick={saveSelectedColor}
              disabled={!selectedColor}
            >
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Box>
  ), [
    colorSettings, 
    colorPickerAnchor, 
    selectedColor, 
    selectedColorKey, 
    loading,
    handleColorPickerOpen,
    handleColorPickerClose,
    handleColorChange,
    saveSelectedColor,
    resetColorsToDefault
  ]);

  // Renderização das configurações de imagens
  const renderImageSettings = useMemo(() => (
    <Box>
      <Typography variant="h6" gutterBottom>Logos e Imagens</Typography>
      <Grid container spacing={3}>
        {imageFiles.map((imageKey) => {
          const imagePath = imageSettings[imageKey] 
            ? getImagePath(imageKey, imageSettings[imageKey])
            : getDefaultImage(imageKey);
            
          return (
            <Grid item xs={12} sm={6} md={4} key={imageKey}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {imageLabels[imageKey]}
                  </Typography>
                  
                  <Box
                    sx={{
                      mb: 2,
                      width: "100%",
                      height: imageKey.includes("Background") ? 120 : 80,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: 'background.default'
                    }}
                  >
                    {imagePath && (
                      <img
                        src={imagePath}
                        alt={imageLabels[imageKey]}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: imageKey.includes("Background") ? "cover" : "contain"
                        }}
                        onError={(e) => {
                          e.target.src = getDefaultImage(imageKey);
                        }}
                      />
                    )}
                  </Box>
                  
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <input
                      type="file"
                      id={`upload-${imageKey}`}
                      style={{ display: 'none' }}
                      onChange={(e) => uploadImage(e, imageKey)}
                      accept="image/*"
                    />
                    <label htmlFor={`upload-${imageKey}`}>
                      <BaseButton
                        component="span"
                        variant="outlined"
                        size="small"
                        icon={<AttachFile />}
                        disabled={loading}
                      >
                        Upload
                      </BaseButton>
                    </label>
                    
                    {imageSettings[imageKey] && (
                      <BaseButton
                        variant="outlined"
                        color="error"
                        size="small"
                        icon={<Delete />}
                        onClick={() => deleteImage(imageKey)}
                        disabled={loading}
                      >
                        Remover
                      </BaseButton>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  ), [imageSettings, loading, uploadImage, deleteImage, getImagePath, getDefaultImage]);

  const renderContent = () => {
    switch (activeSection) {
      case 0:
        return renderGeneralSettings;
      case 1:
        return renderColorSettings;
      case 2:
        return renderImageSettings;
      default:
        return renderGeneralSettings;
    }
  };

  // Loading inicial
  if (!initialized) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 300,
        width: '100%'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Carregando configurações...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      width: '100%'
    }}>
      {/* Navegação por seções */}
      <Paper sx={{ mb: 3, flexShrink: 0 }}>
        <Stack direction={isMobile ? "column" : "row"} spacing={0}>
          {sections.map((section, index) => (
            <BaseButton
              key={index}
              variant={activeSection === index ? "contained" : "text"}
              onClick={() => setActiveSection(index)}
              icon={section.icon}
              fullWidth={isMobile}
              sx={{ 
                borderRadius: 0,
                flexGrow: 1,
                justifyContent: isMobile ? "flex-start" : "center"
              }}
            >
              {section.title}
            </BaseButton>
          ))}
        </Stack>
      </Paper>

      {/* Conteúdo da seção ativa */}
      <Box sx={{ 
        flex: 1,
        width: '100%'
      }}>
        {renderContent()}
      </Box>

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
          }}
        >
          <Card sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography>Processando...</Typography>
            </Stack>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Whitelabel);