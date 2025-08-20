import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
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
import {
  Delete,
  Save,
  Palette,
  Image,
  Refresh,
  Settings,
  CloudUpload
} from "@mui/icons-material";

import MainContainer from "../../components/MainContainer";
import StandardPageLayout from "../../components/shared/StandardPageLayout";
import StandardTabContent from "../../components/shared/StandardTabContent";
import { toast } from "../../helpers/toast";
import useAuth from "../../hooks/useAuth";
import useSettings from "../../hooks/useSettings";
import api from "../../services/api";
import ColorModeContext from "../../layout/themeContext";
import ColorPicker from "../../components/ColorPicker";

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

// Configurações de cores
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

// Configurações de imagens
const imageSettings = [
  { key: "appLogoLight", label: "Logotipo para tema claro", default: logotipoImage },
  { key: "appLogoDark", label: "Logotipo para tema escuro", default: logotipoImage },
  { key: "appLogoFavicon", label: "Ícone do FavIcon", default: faviconImage },
  { key: "appLogoPWAIcon", label: "Ícone do PWA", default: pwaImage },
  { key: "loginBackground", label: "Imagem de fundo para tela de login", default: login_signup },
  { key: "signupBackground", label: "Imagem de fundo para tela de cadastro", default: login_signup }
];

// Componente Principal SIMPLIFICADO
const WhitelabelPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { getAll, update } = useSettings();
  const { colorMode } = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Estados básicos
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  
  // Estados para color picker
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [selectedColorKey, setSelectedColorKey] = useState("");
  const [tempColorValue, setTempColorValue] = useState("");
  
  const fileInputRefs = useRef({});

  console.log("🎨 WhitelabelPage - Renderizando");

  // Carregar configurações - SIMPLIFICADO sem useCallback complexo
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔧 Carregando configurações...");
        setLoading(true);
        
        const companyId = user?.companyId || localStorage.getItem("companyId") || "1";
        const settingsData = await getAll(companyId);
        
        console.log("📦 Dados recebidos:", settingsData);
        
        // Converter array para objeto
        const settingsObj = {};
        if (Array.isArray(settingsData)) {
          settingsData.forEach(setting => {
            if (setting?.key) {
              settingsObj[setting.key] = setting.value || "";
            }
          });
        }
        
        // Processar cores
        const newColors = {};
        Object.values(colorSettings).flat().forEach(colorConfig => {
          newColors[colorConfig.key] = settingsObj[colorConfig.key] || colorConfig.default;
        });
        
        // Processar imagens  
        const newImages = {};
        imageSettings.forEach(imgConfig => {
          newImages[imgConfig.key] = settingsObj[imgConfig.key] || "";
        });
        
        // Processar configurações gerais
        const newGeneral = {
          appName: settingsObj.appName || "",
          copyright: settingsObj.copyright || "",
          privacy: settingsObj.privacy || "",
          terms: settingsObj.terms || "",
          loginPosition: settingsObj.loginPosition || "right",
          signupPosition: settingsObj.signupPosition || "right"
        };
        
        console.log("✅ Processado - Cores:", newColors);
        console.log("✅ Processado - Imagens:", newImages);
        console.log("✅ Processado - Geral:", newGeneral);
        
        setColors(newColors);
        setImages(newImages);
        setGeneralSettings(newGeneral);
        
      } catch (error) {
        console.error("❌ Erro ao carregar:", error);
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
        console.log("✅ Carregamento finalizado");
      }
    };

    loadData();
  }, [user?.companyId, getAll]);

  // Handlers simples sem useCallback excessivo
  const handleColorClick = (event, colorKey) => {
    const currentColor = colors[colorKey] || "#000000";
    console.log(`🎨 Abrindo picker: ${colorKey} = ${currentColor}`);
    
    setSelectedColorKey(colorKey);
    setTempColorValue(currentColor);
    setColorPickerAnchor(event.currentTarget);
  };

  // This function is now handled inline in the ColorPicker onChange prop

  const handleColorSave = async () => {
    if (!selectedColorKey || !tempColorValue) {
      console.log("❌ Dados incompletos para salvar cor");
      return;
    }
    
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId") || "1";
      
      console.log(`💾 Salvando: ${selectedColorKey} = ${tempColorValue}`);
      
      await update({ 
        key: selectedColorKey, 
        value: tempColorValue, 
        companyId 
      });
      
      // Atualizar estado local
      setColors(prev => ({
        ...prev,
        [selectedColorKey]: tempColorValue
      }));
      
      // Aplicar ao tema se disponível
      if (colorMode) {
        const setterName = `set${selectedColorKey.charAt(0).toUpperCase() + selectedColorKey.slice(1)}`;
        const setterFunction = colorMode[setterName];
        if (typeof setterFunction === "function") {
          console.log(`🎨 Aplicando ao tema: ${setterName}`);
          setterFunction(tempColorValue);
        }
      }
      
      toast.success("Cor atualizada com sucesso!");
      
      // Fechar picker
      setColorPickerAnchor(null);
      setSelectedColorKey("");
      setTempColorValue("");
      
    } catch (error) {
      console.error("❌ Erro ao salvar cor:", error);
      toast.error("Erro ao salvar cor");
    } finally {
      setSaving(false);
    }
  };

  const handleColorCancel = () => {
    console.log("❌ Cancelando picker");
    setColorPickerAnchor(null);
    setSelectedColorKey("");
    setTempColorValue("");
  };

  const handleGeneralChange = (field, value) => {
    setGeneralSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneralSave = async () => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId") || "1";
      
      console.log("💾 Salvando configurações gerais:", generalSettings);
      
      const promises = Object.entries(generalSettings).map(([key, value]) =>
        update({ key, value, companyId })
      );
      
      await Promise.all(promises);
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleResetColors = async () => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId") || "1";
      
      const defaultColors = {};
      Object.values(colorSettings).flat().forEach(color => {
        defaultColors[color.key] = color.default;
      });
      
      console.log("🔄 Resetando para padrão:", defaultColors);
      
      const promises = Object.entries(defaultColors).map(([key, value]) =>
        update({ key, value, companyId })
      );
      
      await Promise.all(promises);
      
      setColors(defaultColors);
      
      toast.success("Cores restauradas!");
    } catch (error) {
      console.error("❌ Erro ao resetar:", error);
      toast.error("Erro ao resetar cores");
    } finally {
      setSaving(false);
    }
  };

  // Upload de imagem
  const handleImageUpload = async (event, imageKey) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log(`📤 Upload da imagem para ${imageKey}`);
    
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
      
      console.log(`✅ Upload concluído: ${imagePath}`);
      
      // Salvar no banco
      const companyId = user?.companyId || localStorage.getItem("companyId");
      await update({ key: imageKey, value: imagePath, companyId });
      
      // Atualizar estado
      setImages(prevImages => ({
        ...prevImages,
        [imageKey]: imagePath
      }));
      
      // Aplicar ao tema
      if (colorMode) {
        const fullUrl = `${process.env.REACT_APP_BACKEND_URL}/public/${imagePath}`;
        const setterFunction = colorMode[`set${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}`];
        if (typeof setterFunction === "function") {
          setterFunction(fullUrl);
        }
      }
      
      toast.success("Imagem atualizada com sucesso!");
      
      // Limpar input
      if (event.target) {
        event.target.value = "";
      }
      
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setSaving(false);
    }
  };

  // Remover imagem
  const handleImageRemove = async (imageKey) => {
    try {
      setSaving(true);
      const companyId = user?.companyId || localStorage.getItem("companyId");
      
      console.log(`🗑️ Removendo imagem ${imageKey}`);
      
      // Se for background, deletar do servidor
      if (imageKey.includes("Background") && images[imageKey]) {
        const filename = images[imageKey].split("/").pop();
        await api.delete(`/settings/backgrounds/${filename}?companyId=${companyId}`);
      }
      
      // Limpar no banco
      await update({ key: imageKey, value: "", companyId });
      
      // Atualizar estado
      setImages(prevImages => ({
        ...prevImages,
        [imageKey]: ""
      }));
      
      // Limpar no tema
      if (colorMode) {
        const setterFunction = colorMode[`set${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}`];
        if (typeof setterFunction === "function") {
          setterFunction("");
        }
      }
      
      toast.success("Imagem removida com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao remover imagem:", error);
      toast.error("Erro ao remover imagem");
    } finally {
      setSaving(false);
    }
  };

  // Preparar estatísticas
  const stats = [
    {
      label: `${Object.keys(colors).filter(k => colors[k] && colors[k] !== "").length} cores configuradas`,
      icon: <Palette />,
      color: 'primary'
    },
    {
      label: `${Object.keys(images).filter(k => images[k] && images[k] !== "").length} imagens configuradas`,
      icon: <Image />,
      color: 'secondary'
    }
  ];

  if (loading) {
    console.log("⏳ Exibindo loading...");
    return (
      <MainContainer>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  console.log("🎨 Renderizando interface completa");

  return (
    <StandardPageLayout
      title="Personalização Whitelabel"
      subtitle="Configure a aparência, cores, logos e informações do sistema"
      actions={[
        {
          label: 'Salvar Configurações',
          icon: saving ? <CircularProgress size={20} /> : <Save />,
          onClick: handleGeneralSave,
          variant: 'contained',
          color: 'primary',
          disabled: saving,
          primary: true
        }
      ]}
      showSearch={false}
    >
      <StandardTabContent
        icon={<Settings />}
        stats={stats}
        variant="default"
      >
        {/* CONFIGURAÇÕES GERAIS */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main", display: "flex", alignItems: "center", gap: 1 }}>
          <Settings />
          Configurações Gerais
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
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

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', width: '100%' }}>
          <Chip
            icon={<Palette />}
            label="Personalização de Cores"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetColors}
            disabled={saving}
            size="small"
          >
            Restaurar Padrões
          </Button>
        </Box>

        {/* SEÇÃO DE CORES */}
        {Object.entries(colorSettings).map(([groupName, colorConfigs]) => (
          <Box key={groupName} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
              {groupName}
            </Typography>
            <Grid container spacing={2}>
              {colorConfigs.map((colorConfig) => {
                // Preview dinâmico
                const displayColor = (selectedColorKey === colorConfig.key && colorPickerAnchor) 
                  ? tempColorValue 
                  : colors[colorConfig.key] || colorConfig.default;
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={colorConfig.key}>
                    <StyledPaper elevation={2}>
                      <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                        {colorConfig.label}
                      </Typography>
                      <ColorBox
                        sx={{ backgroundColor: displayColor }}
                        onClick={(e) => handleColorClick(e, colorConfig.key)}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "white", 
                            textShadow: "0 0 2px rgba(0,0,0,0.8)",
                            fontWeight: 500
                          }}
                        >
                          {displayColor}
                        </Typography>
                      </ColorBox>
                    </StyledPaper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', width: '100%' }}>
          <Chip
            icon={<Image />}
            label="Logos e Imagens"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', px: 2 }}
          />
          <Divider sx={{ flexGrow: 1, ml: 2 }} />
        </Box>

        {/* SEÇÃO DE IMAGENS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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

        {/* Color Picker Popover */}
        <Popover
          open={Boolean(colorPickerAnchor)}
          anchorEl={colorPickerAnchor}
          onClose={handleColorCancel}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 2 }}>
            <ColorPicker
              value={tempColorValue}
              onChange={(newColor) => {
                console.log(`🎨 Mudança de cor: ${newColor}`);
                setTempColorValue(newColor);
              }}
              label="Cor Selecionada"
              fullWidth={true}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleColorCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleColorSave} 
                disabled={saving || !tempColorValue}
              >
                {saving ? <CircularProgress size={20} /> : "Aplicar"}
              </Button>
            </Stack>
          </Box>
        </Popover>
      </StandardTabContent>
    </StandardPageLayout>
  );
};

export default WhitelabelPage;