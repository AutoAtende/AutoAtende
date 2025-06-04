import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { useTheme, styled } from "@mui/material/styles";
import {
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  CircularProgress,
  useMediaQuery,
  Tooltip,
  Chip,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from "@mui/material";
import { ChromePicker } from "react-color";
import {
  AttachFile,
  Delete,
  Save,
  Palette,
  Image,
  ColorLens,
  Refresh,
  Settings,
  ContentCopy,
  CloudUpload,
  Visibility
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import { toast } from "../../helpers/toast";
import useAuth from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import api from "../../services/api";
import ColorModeContext from "../../layout/themeContext";

// Importações de imagens padrão
import faviconImage from "../../assets/images/Favicon.jpeg";
import logotipoImage from "../../assets/images/Logotipo.jpeg";
import pwaImage from "../../assets/images/PWA.jpeg";
import login_signup from "../../assets/backgrounds/default.jpeg";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
  }
}));

const ColorBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 80,
  borderRadius: 8,
  border: `2px solid ${theme.palette.divider}`,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[4]
  }
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 200,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
  position: "relative",
  "& img": {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain"
  }
}));

// Configurações
const colorSettings = {
  "Cores do Tema": [
    { key: "primaryColorLight", label: "Cor Primária Modo Claro", default: "#2196f3" },
    { key: "secondaryColorLight", label: "Cor Secundária Modo Claro", default: "#f50057" },
    { key: "primaryColorDark", label: "Cor Primária Modo Escuro", default: "#90caf9" },
    { key: "secondaryColorDark", label: "Cor Secundária Modo Escuro", default: "#f48fb1" }
  ],
  "Cores dos Ícones": [
    { key: "iconColorLight", label: "Cor do Ícone Modo Claro", default: "#424242" },
    { key: "iconColorDark", label: "Cor do Ícone Modo Escuro", default: "#e0e0e0" }
  ],
  "Cores do Chat": [
    { key: "chatlistLight", label: "Fundo Chat Interno Modo Claro", default: "#f5f5f5" },
    { key: "chatlistDark", label: "Fundo Chat Interno Modo Escuro", default: "#303030" },
    { key: "boxLeftLight", label: "Mensagens de Outros Modo Claro", default: "#e0e0e0" },
    { key: "boxLeftDark", label: "Mensagens de Outros Modo Escuro", default: "#424242" },
    { key: "boxRightLight", label: "Mensagens do Usuário Modo Claro", default: "#dcf8c6" },
    { key: "boxRightDark", label: "Mensagens do Usuário Modo Escuro", default: "#056162" }
  ]
};

const imageSettings = [
  { key: "appLogoLight", label: "Logotipo para tema claro", default: logotipoImage },
  { key: "appLogoDark", label: "Logotipo para tema escuro", default: logotipoImage },
  { key: "appLogoFavicon", label: "Ícone do FavIcon", default: faviconImage },
  { key: "appLogoPWAIcon", label: "Ícone do PWA", default: pwaImage },
  { key: "loginBackground", label: "Imagem de fundo para tela de login", default: login_signup },
  { key: "signupBackground", label: "Imagem de fundo para tela de cadastro", default: login_signup }
];

// Componente Principal
const WhitelabelPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { getAll, update } = useSettings();
  const { colorMode } = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [colors, setColors] = useState({});
  const [images, setImages] = useState({});
  const [generalSettings, setGeneralSettings] = useState({
    appName: "",
    copyright: "",
    privacy: "",
    terms: "",
    loginPosition: "right",
    signupPosition: "right"
  });
  
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [selectedColorKey, setSelectedColorKey] = useState("");
  const [selectedColorValue, setSelectedColorValue] = useState("");
  
  const fileInputRefs = useRef({});
  
  // Refs para evitar closures obsoletos
  const colorsRef = useRef(colors);
  const imagesRef = useRef(images);
  const generalSettingsRef = useRef(generalSettings);

  // Atualizar refs sempre que o estado mudar
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    generalSettingsRef.current = generalSettings;
  }, [generalSettings]);

  // Carregar configurações - CORRIGIDO
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      const settingsData = await getAll(companyId);
      
      console.log("Dados recebidos do servidor:", settingsData);
      
      // Converter array para objeto
      const settingsObj = {};
      if (Array.isArray(settingsData)) {
        settingsData.forEach(setting => {
          if (setting?.key) {
            settingsObj[setting.key] = setting.value || "";
          }
        });
      }
      
      console.log("Settings convertidas:", settingsObj);
      
      // Separar configurações por tipo
      const newColors = {};
      const newImages = {};
      const newGeneral = {
        appName: "",
        copyright: "",
        privacy: "",
        terms: "",
        loginPosition: "right",
        signupPosition: "right"
      };
      
      // Aplicar valores padrão para cores
      Object.values(colorSettings).flat().forEach(colorConfig => {
        newColors[colorConfig.key] = colorConfig.default;
      });
      
      Object.entries(settingsObj).forEach(([key, value]) => {
        // Cores
        if (Object.values(colorSettings).flat().some(c => c.key === key)) {
          newColors[key] = value || newColors[key]; // Manter padrão se valor vazio
          
          // Aplicar cor ao tema imediatamente
          const setterFunction = colorMode[`set${key.charAt(0).toUpperCase() + key.slice(1)}`];
          if (typeof setterFunction === "function") {
            console.log(`Aplicando cor ${key}: ${value || newColors[key]}`);
            setterFunction(value || newColors[key]);
          }
        }
        // Imagens
        else if (imageSettings.some(img => img.key === key)) {
          newImages[key] = value;
          
          // Aplicar imagem ao tema
          const imagePath = value ? `${process.env.REACT_APP_BACKEND_URL}/public/${value}` : "";
          const setterFunction = colorMode[`set${key.charAt(0).toUpperCase() + key.slice(1)}`];
          if (typeof setterFunction === "function") {
            console.log(`Aplicando imagem ${key}: ${imagePath}`);
            setterFunction(imagePath);
          }
        }
        // Configurações gerais
        else if (["appName", "copyright", "privacy", "terms", "loginPosition", "signupPosition"].includes(key)) {
          newGeneral[key] = value;
        }
      });
      
      console.log("Cores finais:", newColors);
      console.log("Imagens finais:", newImages);
      console.log("Configurações gerais finais:", newGeneral);
      
      setColors(newColors);
      setImages(newImages);
      setGeneralSettings(newGeneral);
      setSettings(settingsObj);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, getAll, colorMode]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handlers de cores - CORRIGIDO
  const handleColorClick = useCallback((event, colorKey) => {
    const currentColors = colorsRef.current;
    const currentColor = currentColors[colorKey];
    
    console.log(`Abrindo picker para ${colorKey}, cor atual: ${currentColor}`);
    
    setSelectedColorKey(colorKey);
    setSelectedColorValue(currentColor || "");
    setColorPickerAnchor(event.currentTarget);
  }, []);

  const handleColorChange = useCallback((color) => {
    console.log("Cor alterada no picker:", color.hex);
    setSelectedColorValue(color.hex);
  }, []);

  const handleColorSave = useCallback(async () => {
    if (!selectedColorKey || !selectedColorValue) {
      console.log("Chave ou valor da cor não definidos");
      return;
    }
    
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      console.log(`Salvando cor ${selectedColorKey}: ${selectedColorValue}`);
      
      // Salvar no backend
      await update({ key: selectedColorKey, value: selectedColorValue, companyId });
      
      // Atualizar estado local IMEDIATAMENTE
      setColors(prevColors => {
        const newColors = { ...prevColors, [selectedColorKey]: selectedColorValue };
        console.log("Estado de cores atualizado:", newColors);
        return newColors;
      });
      
      // Aplicar ao tema IMEDIATAMENTE
      const setterFunction = colorMode[`set${selectedColorKey.charAt(0).toUpperCase() + selectedColorKey.slice(1)}`];
      if (typeof setterFunction === "function") {
        console.log(`Aplicando cor ao tema: ${selectedColorKey} = ${selectedColorValue}`);
        setterFunction(selectedColorValue);
      }
      
      toast.success("Cor atualizada com sucesso!");
      setColorPickerAnchor(null);
      setSelectedColorKey("");
      setSelectedColorValue("");
      
    } catch (error) {
      console.error("Erro ao salvar cor:", error);
      toast.error("Erro ao salvar cor");
    } finally {
      setSaving(false);
    }
  }, [selectedColorKey, selectedColorValue, user?.companyId, update, colorMode]);

  // Resetar cores para padrão - CORRIGIDO
  const handleResetColors = useCallback(async () => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      const defaultColors = {};
      Object.values(colorSettings).flat().forEach(color => {
        defaultColors[color.key] = color.default;
      });
      
      console.log("Resetando cores para padrões:", defaultColors);
      
      // Salvar todas as cores padrão
      const promises = Object.entries(defaultColors).map(([key, value]) =>
        update({ key, value, companyId })
      );
      
      await Promise.all(promises);
      
      // Atualizar estado e tema IMEDIATAMENTE
      setColors(defaultColors);
      
      Object.entries(defaultColors).forEach(([key, value]) => {
        const setterFunction = colorMode[`set${key.charAt(0).toUpperCase() + key.slice(1)}`];
        if (typeof setterFunction === "function") {
          console.log(`Resetando cor no tema: ${key} = ${value}`);
          setterFunction(value);
        }
      });
      
      toast.success("Cores restauradas para o padrão!");
    } catch (error) {
      console.error("Erro ao resetar cores:", error);
      toast.error("Erro ao resetar cores");
    } finally {
      setSaving(false);
    }
  }, [user?.companyId, update, colorMode]);

  // Upload de imagem - CORRIGIDO
  const handleImageUpload = useCallback(async (event, imageKey) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log(`Fazendo upload da imagem para ${imageKey}`);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", user?.companyId?.toString() || "");
    
    try {
      setSaving(true);
      let endpoint = "";
      
      if (imageKey.includes("Background")) {
        formData.append("page", imageKey.replace("Background", ""));
        endpoint = "/settings/background";
      } else {
        formData.append("mode", imageKey);
        endpoint = "/settings/logo";
      }
      
      const { data } = await api.post(endpoint, formData);
      const imagePath = data;
      
      console.log(`Upload concluído, caminho: ${imagePath}`);
      
      // Salvar no banco
      const companyId = user?.companyId || localStorage.getItem("companyId");
      await update({ key: imageKey, value: imagePath, companyId });
      
      // Atualizar estado IMEDIATAMENTE
      setImages(prevImages => {
        const newImages = { ...prevImages, [imageKey]: imagePath };
        console.log("Estado de imagens atualizado:", newImages);
        return newImages;
      });
      
      // Aplicar ao tema IMEDIATAMENTE
      const fullUrl = `${process.env.REACT_APP_BACKEND_URL}/public/${imagePath}`;
      const setterFunction = colorMode[`set${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}`];
      if (typeof setterFunction === "function") {
        console.log(`Aplicando imagem ao tema: ${imageKey} = ${fullUrl}`);
        setterFunction(fullUrl);
      }
      
      toast.success("Imagem atualizada com sucesso!");
      
      // Limpar input
      if (event.target) {
        event.target.value = "";
      }
      
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setSaving(false);
    }
  }, [user?.companyId, update, colorMode]);

  // Remover imagem - CORRIGIDO
  const handleImageRemove = useCallback(async (imageKey) => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      const currentImages = imagesRef.current;
      
      console.log(`Removendo imagem ${imageKey}`);
      
      // Se for background, deletar do servidor
      if (imageKey.includes("Background") && currentImages[imageKey]) {
        const filename = currentImages[imageKey].split("/").pop();
        await api.delete(`/settings/backgrounds/${filename}?companyId=${companyId}`);
      }
      
      // Limpar no banco
      await update({ key: imageKey, value: "", companyId });
      
      // Atualizar estado IMEDIATAMENTE
      setImages(prevImages => {
        const newImages = { ...prevImages, [imageKey]: "" };
        console.log("Estado de imagens após remoção:", newImages);
        return newImages;
      });
      
      // Limpar no tema IMEDIATAMENTE
      const setterFunction = colorMode[`set${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}`];
      if (typeof setterFunction === "function") {
        console.log(`Removendo imagem do tema: ${imageKey}`);
        setterFunction("");
      }
      
      toast.success("Imagem removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast.error("Erro ao remover imagem");
    } finally {
      setSaving(false);
    }
  }, [user?.companyId, update, colorMode]);

  // Salvar configurações gerais - CORRIGIDO
  const handleGeneralSave = useCallback(async () => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      const currentGeneral = generalSettingsRef.current;
      
      console.log("Salvando configurações gerais:", currentGeneral);
      
      const promises = Object.entries(currentGeneral).map(([key, value]) =>
        update({ key, value, companyId })
      );
      
      await Promise.all(promises);
      
      toast.success("Configurações gerais salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações gerais:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }, [user?.companyId, update]);

  // Handler para mudanças nas configurações gerais
  const handleGeneralChange = useCallback((field, value) => {
    console.log(`Alterando configuração geral: ${field} = ${value}`);
    setGeneralSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Preparar estatísticas
  const stats = useMemo(() => [
    {
      label: `${Object.keys(colors).filter(k => colors[k]).length} cores personalizadas`,
      icon: <Palette />,
      color: 'primary'
    },
    {
      label: `${Object.keys(images).filter(k => images[k]).length} imagens configuradas`,
      icon: <Image />,
      color: 'secondary'
    }
  ], [colors, images]);

  if (loading) {
    return (
      <MainContainer>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <StandardPageLayout
      title="Personalização Whitelabel"
      subtitle="Configure a aparência, cores, logos e informações do sistema"
      showSearch={false}
    >
      {/* Configurações Gerais */}
      <StandardTabContent
        variant="default"
        actions={
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            onClick={handleGeneralSave}
            disabled={saving}
          >
            Salvar Configurações
          </Button>
        }
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Sistema"
              value={generalSettings.appName}
              onChange={(e) => handleGeneralChange('appName', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Copyright"
              value={generalSettings.copyright}
              onChange={(e) => handleGeneralChange('copyright', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Posição do Formulário de Login</InputLabel>
              <Select
                value={generalSettings.loginPosition}
                onChange={(e) => handleGeneralChange('loginPosition', e.target.value)}
                label="Posição do Formulário de Login"
              >
                <MenuItem value="left">Esquerda</MenuItem>
                <MenuItem value="center">Centro</MenuItem>
                <MenuItem value="right">Direita</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Posição do Formulário de Cadastro</InputLabel>
              <Select
                value={generalSettings.signupPosition}
                onChange={(e) => handleGeneralChange('signupPosition', e.target.value)}
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
              fullWidth
              label="Link da Política de Privacidade"
              value={generalSettings.privacy}
              onChange={(e) => handleGeneralChange('privacy', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Link dos Termos de Uso"
              value={generalSettings.terms}
              onChange={(e) => handleGeneralChange('terms', e.target.value)}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </StandardTabContent>

      {/* Personalização de Cores */}
      <StandardTabContent
        variant="default"
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetColors}
            disabled={saving}
          >
            Restaurar Padrões
          </Button>
        }
      >
        {Object.entries(colorSettings).map(([groupName, colorConfigs]) => (
          <Box key={groupName} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
              {groupName}
            </Typography>
            <Grid container spacing={2}>
              {colorConfigs.map((colorConfig) => {
                const currentColor = colors[colorConfig.key] || colorConfig.default;
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={colorConfig.key}>
                    <StyledPaper elevation={2}>
                      <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                        {colorConfig.label}
                      </Typography>
                      <ColorBox
                        sx={{ backgroundColor: currentColor }}
                        onClick={(e) => handleColorClick(e, colorConfig.key)}
                      >
                        <Typography variant="caption" sx={{ color: "white", textShadow: "0 0 2px rgba(0,0,0,0.5)" }}>
                          {currentColor}
                        </Typography>
                      </ColorBox>
                    </StyledPaper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        {/* Color Picker Popover */}
        <Popover
          open={Boolean(colorPickerAnchor)}
          anchorEl={colorPickerAnchor}
          onClose={() => {
            setColorPickerAnchor(null);
            setSelectedColorKey("");
            setSelectedColorValue("");
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 2 }}>
            <ChromePicker
              color={selectedColorValue}
              onChange={handleColorChange}
              disableAlpha
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setColorPickerAnchor(null);
                  setSelectedColorKey("");
                  setSelectedColorValue("");
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleColorSave} 
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} /> : "Aplicar"}
              </Button>
            </Stack>
          </Box>
        </Popover>
      </StandardTabContent>

      {/* Logos e Imagens */}
      <StandardTabContent variant="default">
        <Grid container spacing={3}>
          {imageSettings.map((imgConfig) => {
            const currentImage = images[imgConfig.key]
              ? `${process.env.REACT_APP_BACKEND_URL}/public/${images[imgConfig.key]}`
              : imgConfig.default;
              
            return (
              <Grid item xs={12} sm={6} md={4} key={imgConfig.key}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      {imgConfig.label}
                    </Typography>
                    <ImagePreviewBox sx={{ mb: 2 }}>
                      {currentImage && (
                        <img
                          src={currentImage}
                          alt={imgConfig.label}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = imgConfig.default;
                          }}
                        />
                      )}
                    </ImagePreviewBox>
                    <Stack direction="row" spacing={1}>
                      <input
                        type="file"
                        ref={(el) => fileInputRefs.current[imgConfig.key] = el}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(e, imgConfig.key)}
                        accept="image/*"
                      />
                      <Button
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => fileInputRefs.current[imgConfig.key]?.click()}
                        size="small"
                        fullWidth
                        disabled={saving}
                      >
                        {saving ? <CircularProgress size={16} /> : "Upload"}
                      </Button>
                      {images[imgConfig.key] && (
                        <IconButton
                          color="error"
                          onClick={() => handleImageRemove(imgConfig.key)}
                          disabled={saving}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </StandardTabContent>
    </StandardPageLayout>
  );
};

export default WhitelabelPage;