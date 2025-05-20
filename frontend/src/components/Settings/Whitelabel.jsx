import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useTheme } from '@mui/material/styles';

import {
  Grid,
  Typography,
  Paper,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Popover,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
  useMediaQuery,
  Tooltip,
  Chip,
  Alert,
  IconButton
} from "@mui/material";
import { ChromePicker } from "react-color";
import {
  AttachFile,
  Delete,
  Save,
  Settings,
  Palette,
  Image,
  Info,
  Refresh
} from '@mui/icons-material';
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { styled } from '@mui/material/styles';
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";

// Importações de imagens
import faviconImage from "../../assets/images/Favicon.jpeg";
import logotipoImage from "../../assets/images/Logotipo.jpeg";
import pwaImage from "../../assets/images/PWA.jpeg";
import login_signup from "../../assets/images/login_signup.jpeg";

// Helper para remover pathname
const removePathName = (path) => {
  const regex = /[^/]+\/[^/]+\/(.+)/;
  const match = path.match(regex);
  return match ? match[1] : '';
};

// Helper para capitalização
function capitalizeFirstLetter(string) {
  return string?.charAt(0).toUpperCase() + string?.slice(1) || '';
}

// Componente TabPanel
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

// Constantes
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

// Componentes estilizados
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 72,
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(2),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ColorBox = styled(Box)(({ theme, color }) => ({
  width: '100%',
  height: 48,
  backgroundColor: color || '#ffffff',
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  marginBottom: theme.spacing(1),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  overflow: "hidden",
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
}));

function Whitelabel({ settings }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { colorMode } = useContext(ColorModeContext);
  const { user } = useContext(AuthContext);

  // Estados
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedColorKey, setSelectedColorKey] = useState(themeColors[0]);
  const [selectedColorValue, setSelectedColorValue] = useState("");
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null);
  const [loading, setLoading] = useState({
    initial: true,
    general: false,
    colors: false,
    logos: false
  });
  const [error, setError] = useState(null);

  // Estados para configurações
  const [settingsMap, setSettingsMap] = useState({});
  const [generalForm, setGeneralForm] = useState({
    appName: "",
    copyright: "",
    privacy: "",
    terms: "",
    loginPosition: "right",
    signupPosition: "right"
  });
  const [themeColorValues, setThemeColorValues] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState({
    general: false,
    colors: false,
    logos: false
  });

  // Carregar configurações iniciais
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(prevState => ({ ...prevState, initial: true }));
        setError(null);

        if (!Array.isArray(settings) || settings.length === 0) {
          setError("Não foi possível carregar as configurações");
          return;
        }

        // Criar mapa de configurações
        const newSettingsMap = {};
        const newThemeColorValues = {};

        settings.forEach(setting => {
          if (setting && setting.key) {
            newSettingsMap[setting.key] = setting.value;

            // Processar cores do tema
            if (themeColors.includes(setting.key)) {
              newThemeColorValues[setting.key] = setting.value;
            }
          }
        });

        // Atualizar estados
        setSettingsMap(newSettingsMap);
        setThemeColorValues(newThemeColorValues);

        // Preencher formulário geral
        setGeneralForm({
          appName: newSettingsMap.appName || "",
          copyright: newSettingsMap.copyright || "",
          privacy: newSettingsMap.privacy || "",
          terms: newSettingsMap.terms || "",
          loginPosition: newSettingsMap.loginPosition || "right",
          signupPosition: newSettingsMap.signupPosition || "right"
        });

        // Aplicar configurações ao tema
        applySettingsToTheme(newSettingsMap, newThemeColorValues);
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
        setError("Erro ao carregar configurações. Por favor, tente novamente.");
      } finally {
        setLoading(prevState => ({ ...prevState, initial: false }));
      }
    };

    loadSettings();
  }, [settings, colorMode]);

  // Aplicar configurações ao tema
  const applySettingsToTheme = useCallback((settings, colors) => {
    // Aplicar cores ao tema
    Object.entries(colors).forEach(([key, value]) => {
      if (value && colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(key)}`];
        if (typeof setterFunction === 'function') {
          setterFunction(value);
        }
      }
    });

    // Aplicar imagens
    imageFiles.forEach((imageKey) => {
      if (settings[imageKey] && colorMode) {
        const setterFunction = colorMode[`set${capitalizeFirstLetter(imageKey)}`];
        if (typeof setterFunction === 'function') {
          const imagePath = getImagePath(imageKey, settings[imageKey]);
          setterFunction(imagePath);
        }
      }
    });
  }, [colorMode]);

  // Função para obter caminho da imagem
  const getImagePath = useCallback((imageKey, imagePath) => {
    if (!imagePath) {
      return getImageDefaultByImageKey(imageKey);
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `${process.env.REACT_APP_BACKEND_URL}/public/${imagePath}`;
  }, []);

  // Obter imagem padrão por chave
  const getImageDefaultByImageKey = useCallback((imageKey) => {
    if (imageKey === "appLogoLight") return logotipoImage;
    if (imageKey === "appLogoDark") return logotipoImage;
    if (imageKey === "appLogoFavicon") return faviconImage;
    if (imageKey === "appLogoPWAIcon") return pwaImage;
    if (imageKey === "loginBackground") return login_signup;
    if (imageKey === "signupBackground") return login_signup;
    return null;
  }, []);

  // Manipuladores
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleGeneralFormChange = (e) => {
    const { name, value } = e.target;
    setGeneralForm(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(prev => ({ ...prev, general: true }));
  };

  const handleColorPickerOpen = (event, colorKey) => {
    setSelectedColorKey(colorKey);
    setSelectedColorValue(themeColorValues[colorKey] || settingsMap[colorKey] || '');
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchorEl(null);
  };

  const handleColorChange = (color) => {
    if (!color) return;
    const newColor = color.hex;
    setSelectedColorValue(newColor);
    setHasUnsavedChanges(prev => ({ ...prev, colors: true }));
  };

  // Função para salvar configuração
  const saveSetting = async (key, value, section) => {
    try {
      setLoading(prev => ({ ...prev, [section]: true }));

      await api.put(`/settings/${key}`, {
        value
      }, {
        params: { companyId: user.companyId }
      });

      // Atualizar estado local
      setSettingsMap(prev => ({ ...prev, [key]: value }));

      // Se for cor do tema, atualizar também o estado de cores
      if (themeColors.includes(key)) {
        setThemeColorValues(prev => ({ ...prev, [key]: value }));
        // Aplicar ao tema
        const setterFunction = colorMode[`set${capitalizeFirstLetter(key)}`];
        if (typeof setterFunction === 'function') {
          setterFunction(value);
        }
      }

      return true;
    } catch (error) {
      console.error(`Erro ao salvar configuração ${key}:`, error);
      toast.error(`Erro ao salvar ${key}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  // Salvar cor selecionada
  const saveSelectedColor = async () => {
    if (selectedColorKey && selectedColorValue) {
      const success = await saveSetting(selectedColorKey, selectedColorValue, 'colors');
      if (success) {
        handleColorPickerClose();
        toast.success("Cor atualizada com sucesso");
        setHasUnsavedChanges(prev => ({ ...prev, colors: false }));
      }
    }
  };

  // Salvar configurações gerais
  const saveGeneralSettings = async () => {
    try {
      setLoading(prev => ({ ...prev, general: true }));

      const promises = [
        saveSetting('appName', generalForm.appName, 'general'),
        saveSetting('copyright', generalForm.copyright, 'general'),
        saveSetting('privacy', generalForm.privacy, 'general'),
        saveSetting('terms', generalForm.terms, 'general'),
        saveSetting('loginPosition', generalForm.loginPosition, 'general'),
        saveSetting('signupPosition', generalForm.signupPosition, 'general')
      ];

      await Promise.all(promises);
      
      toast.success("Configurações gerais atualizadas com sucesso");
      setHasUnsavedChanges(prev => ({ ...prev, general: false }));
    } catch (error) {
      console.error("Erro ao salvar configurações gerais:", error);
      toast.error("Erro ao salvar configurações gerais");
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  // Salvar todas as cores de uma vez
  const saveAllThemeColors = async () => {
    try {
      setLoading(prev => ({ ...prev, colors: true }));
      
      const promises = Object.entries(themeColorValues).map(([key, value]) => 
        saveSetting(key, value, null)
      );
      
      await Promise.all(promises);
      
      toast.success("Todas as cores atualizadas com sucesso");
      setHasUnsavedChanges(prev => ({ ...prev, colors: false }));
    } catch (error) {
      console.error("Erro ao salvar todas as cores:", error);
      toast.error("Erro ao salvar todas as cores");
    } finally {
      setLoading(prev => ({ ...prev, colors: false }));
    }
  };

  // Restaurar cores padrão
  const resetToDefaultColors = async () => {
    try {
      setLoading(prev => ({ ...prev, colors: true }));
      
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
      
      setThemeColorValues(defaultColors);
      
      const promises = Object.entries(defaultColors).map(([key, value]) => 
        saveSetting(key, value, null)
      );
      
      await Promise.all(promises);
      
      toast.success("Cores resetadas para os valores padrão");
      setHasUnsavedChanges(prev => ({ ...prev, colors: false }));
    } catch (error) {
      console.error("Erro ao restaurar cores padrão:", error);
      toast.error("Erro ao restaurar cores padrão");
    } finally {
      setLoading(prev => ({ ...prev, colors: false }));
    }
  };

  // Upload de logo
  const uploadLogo = async (e, mode) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("companyId", user.companyId.toString());
    formData.append("typeArch", "logo");

    try {
      setLoading(prev => ({ ...prev, logos: true }));
      const response = await api.post("/settings/logo", formData);
      const logoUrl = response.data;

      // Atualizar estado local
      setSettingsMap(prev => ({ ...prev, [mode]: logoUrl }));

      // Construir URL completa
      const fullUrl = `${process.env.REACT_APP_BACKEND_URL}/public/${logoUrl}`;

      // Atualizar ColorMode
      const setterFunction = colorMode[`set${capitalizeFirstLetter(mode)}`];
      if (typeof setterFunction === "function") {
        setterFunction(fullUrl);
      }

      // Salvar no backend
      await saveSetting(mode, logoUrl, 'logos');

      toast.success("Logo atualizado com sucesso");
    } catch (error) {
      console.error("Erro no upload de logo:", error);
      toast.error("Erro ao fazer upload do logo");
    } finally {
      setLoading(prev => ({ ...prev, logos: false }));
    }
  };

  // Upload de imagem de fundo
  const uploadBackground = async (e, page) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("page", page);
    formData.append("companyId", user.companyId.toString());
    formData.append("typeArch", "background");

    try {
      setLoading(prev => ({ ...prev, logos: true }));
      const response = await api.post("/settings/background", formData);
      const backgroundUrl = response.data;

      // Atualizar estado local
      setSettingsMap(prev => ({ ...prev, [`${page}Background`]: backgroundUrl }));

      // Salvar no backend
      await saveSetting(`${page}Background`, backgroundUrl, 'logos');

      toast.success("Imagem de fundo atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload da imagem de fundo:", error);
      toast.error("Erro ao fazer upload da imagem de fundo");
    } finally {
      setLoading(prev => ({ ...prev, logos: false }));
    }
  };

  // Excluir imagem de fundo
  const deleteBackground = async (filename, imageKey) => {
    if (!filename) return;

    try {
      setLoading(prev => ({ ...prev, logos: true }));

      // Remover caminho do nome do arquivo
      const filenameOnly = removePathName(filename);

      await api.delete(`/settings/backgrounds/${filenameOnly}?companyId=${user.companyId}`);

      // Atualizar estado local
      setSettingsMap(prev => ({ ...prev, [imageKey]: "" }));

      // Salvar no backend
      await saveSetting(imageKey, "", 'logos');

      toast.success("Imagem de fundo removida com sucesso");
    } catch (error) {
      console.error("Erro ao excluir imagem de fundo:", error);
      toast.error("Erro ao excluir imagem de fundo");
    } finally {
      setLoading(prev => ({ ...prev, logos: false }));
    }
  };

  // Renderização condicional para carregamento inicial
  if (loading.initial) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Renderização condicional para erro
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // Componentes memorizados para otimização

  // Componente de configurações gerais
  const GeneralSettingsSection = (
    <StyledCard>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <TextField
                label="Nome do sistema"
                variant="outlined"
                name="appName"
                value={generalForm.appName}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <TextField
                label="Copyright"
                variant="outlined"
                name="copyright"
                value={generalForm.copyright}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </FormControl>
          </Grid>

          {/* Posicionamento dos formulários */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="login-position-label">Posição do Formulário de Login</InputLabel>
              <Select
                labelId="login-position-label"
                id="loginPosition"
                name="loginPosition"
                value={generalForm.loginPosition || 'right'}
                onChange={handleGeneralFormChange}
                label="Posição do Formulário de Login"
                sx={{ mb: 2 }}
              >
                <MenuItem value="left">Esquerda</MenuItem>
                <MenuItem value="center">Centro</MenuItem>
                <MenuItem value="right">Direita</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="signup-position-label">Posição do Formulário de Cadastro</InputLabel>
              <Select
                labelId="signup-position-label"
                id="signupPosition"
                name="signupPosition"
                value={generalForm.signupPosition || 'right'}
                onChange={handleGeneralFormChange}
                label="Posição do Formulário de Cadastro"
                sx={{ mb: 2 }}
              >
                <MenuItem value="left">Esquerda</MenuItem>
                <MenuItem value="center">Centro</MenuItem>
                <MenuItem value="right">Direita</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <TextField
                label="Link da Política de Privacidade"
                variant="outlined"
                name="privacy"
                value={generalForm.privacy}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <TextField
                label="Link dos Termos de uso"
                variant="outlined"
                name="terms"
                value={generalForm.terms}
                onChange={handleGeneralFormChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </FormControl>
          </Grid>
        </Grid>
        
        {loading.general && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!hasUnsavedChanges.general || loading.general}
            onClick={saveGeneralSettings}
            startIcon={<Save />}
            sx={{ mt: 2 }}
          >
            Salvar Alterações
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );

  // Componente de configurações de cores
  const ColorSettingsSection = (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Personalização de Cores do Tema
          </Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Restaurar cores padrão">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Refresh />}
                onClick={resetToDefaultColors}
                disabled={loading.colors}
                size="small"
              >
                {isMobile ? "" : "Restaurar Padrões"}
              </Button>
            </Tooltip>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={saveAllThemeColors}
              disabled={!hasUnsavedChanges.colors || loading.colors}
              size="small"
            >
              {isMobile ? "" : "Salvar Todas as Cores"}
            </Button>
          </Stack>
        </Box>

        {loading.colors && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Layout em grupos para melhor visualização */}
        {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
          <Box key={groupName} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {groupName}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {colorKeys.map((colorKey) => (
                <Grid item xs={6} sm={4} md={3} key={colorKey}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'center',
                        mb: 1,
                        fontSize: '0.75rem',
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {colorLabels[colorKey]}
                    </Typography>

                    <ColorBox
                      color={themeColorValues[colorKey] || settingsMap[colorKey] || '#ffffff'}
                      onClick={(e) => handleColorPickerOpen(e, colorKey)}
                    />

                    <Chip
                      label={themeColorValues[colorKey] || settingsMap[colorKey] || 'Não definido'}
                      size="small"
                      sx={{
                        width: '100%',
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </CardContent>

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
            boxShadow: 4
          }
        }}
      >
        <Box sx={{ width: 220 }}>
          <Typography variant="subtitle2" gutterBottom>
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
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={saveSelectedColor}
              disabled={!selectedColorValue || loading.colors}
            >
              Aplicar
            </Button>
          </Box>
        </Box>
      </Popover>
    </StyledCard>
  );

  // Componente de imagens e logos
  const ImagesAndLogosSection = (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Logos, Ícones e Imagens de Fundo
        </Typography>
        
        {loading.logos && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, mb: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        <Grid container spacing={3}>
          {imageFiles.map((imageKey) => {
            const imagePath = settingsMap[imageKey]
              ? `${process.env.REACT_APP_BACKEND_URL}/public/${settingsMap[imageKey]}`
              : getImageDefaultByImageKey(imageKey);

            const isBackground = imageKey.includes("Background");
            const imageHeight = isBackground ? 200 : 100;

            return (
              <Grid item xs={12} sm={6} md={4} key={imageKey}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {imageLabels[imageKey]}
                    </Typography>
                    
                    <ImagePreviewBox sx={{ height: imageHeight }}>
                      {imagePath && (
                        <img
                          src={imagePath}
                          alt={imageLabels[imageKey]}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: imageKey === "appLogoFavicon" || imageKey === "appLogoPWAIcon" ? 48 : "auto",
                            height: imageKey === "appLogoFavicon" || imageKey === "appLogoPWAIcon" ? 48 : "auto",
                            objectFit: isBackground ? "cover" : "contain"
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImageDefaultByImageKey(imageKey) || '';
                          }}
                        />
                      )}
                    </ImagePreviewBox>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <input
                        type="file"
                        id={`upload-${imageKey}-button`}
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          isBackground
                            ? uploadBackground(e, imageKey.replace("Background", ""))
                            : uploadLogo(e, imageKey)
                        }
                        accept="image/*"
                      />
                      <label htmlFor={`upload-${imageKey}-button`}>
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<AttachFile />}
                          size="small"
                          disabled={loading.logos}
                        >
                          Upload
                        </Button>
                      </label>
                      
                      {settingsMap[imageKey] && (
                        <Button
                          onClick={() =>
                            isBackground
                              ? deleteBackground(settingsMap[imageKey], imageKey)
                              : saveSetting(imageKey, "", "logos")
                          }
                          color="error"
                          variant="outlined"
                          startIcon={<Delete />}
                          size="small"
                          disabled={loading.logos}
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
      </CardContent>
    </StyledCard>
  );

  // Componente de ajuda
  const HelpSection = (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Info color="primary" sx={{ mr: 1, mt: 0.3 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            Ajuda - Personalização do Sistema
          </Typography>
        </Box>
        
        <Typography variant="body2" paragraph>
          Esta seção permite personalizar a aparência do sistema de acordo com a identidade visual da sua empresa.
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom>
          Guia rápido:
        </Typography>
        
        <Box component="ul" sx={{ pl: 2 }}>
          <Box component="li" sx={{ mb: 0.5 }}>
            <Typography variant="body2">
              <strong>Configurações Gerais:</strong> Altere o nome do sistema, direitos autorais e links importantes.
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 0.5 }}>
            <Typography variant="body2">
              <strong>Cores:</strong> Personalize as cores do tema, incluindo modo claro e escuro.
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 0.5 }}>
            <Typography variant="body2">
              <strong>Logos e Imagens:</strong> Faça upload de logotipos e imagens de fundo para personalizar o sistema.
            </Typography>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Lembre-se de clicar em "Salvar" após fazer alterações em cada seção.
          </Typography>
        </Alert>
      </CardContent>
    </StyledCard>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ mb: 3 }}>
        <StyledTabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <StyledTab
            icon={<Settings />}
            label={!isMobile ? "Configurações Gerais" : ""}
            iconPosition="start"
          />
          <StyledTab
            icon={<Palette />}
            label={!isMobile ? "Cores" : ""}
            iconPosition="start"
          />
          <StyledTab
            icon={<Image />}
            label={!isMobile ? "Logos e Imagens" : ""}
            iconPosition="start"
          />
        </StyledTabs>
      </Paper>

      <TabPanel value={selectedTab} index={0}>
        {GeneralSettingsSection}
        {HelpSection}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {ColorSettingsSection}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {ImagesAndLogosSection}
      </TabPanel>
    </Box>
  );
}

export default React.memo(Whitelabel);