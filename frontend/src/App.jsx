import React, { useState, useEffect, useMemo, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ptBR } from "@mui/material/locale";
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider
} from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import ColorModeContext from "./layout/themeContext";
import useSettings from "./hooks/useSettings";
import Favicon from "react-favicon";
import api from "./services/api";

import "./styles.css";
import Routes from "./routes";
import useAuth from "./hooks/useAuth";
import './pages/MessageRules';
import { LoadingProvider } from "./hooks/useLoading";
import { ModalProvider } from "./hooks/useModal";
import { GlobalContextProvider } from "./context/GlobalContext";
import { ActiveWhatsappProvider } from "./context/ActiveWhatsappContext";
import { PublicSettingsProvider } from "./context/PublicSettingsContext";
import { usePublicSettings } from "./context/PublicSettingsContext";

const queryClient = new QueryClient();

// Componente para tema, separado para evitar re-renderizações desnecessárias
const ThemedApp = () => {
  const [locale, setLocale] = useState();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(
    preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light"
  );
  const [activeWhatsapp] = useState("default");
  const [themeSettings, setThemeSettings] = useState({});
  const { isAuth, user } = useAuth();
  const { getAll } = useSettings();
  const { publicSettings } = usePublicSettings();
  
  // Função auxiliar para aplicar as configurações ao tema
  const setSetting = useCallback((key, value) => {
    setThemeSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Efeito para carregar as configurações quando usuário autenticado
  useEffect(() => {
    const companyId = user?.companyId || localStorage.getItem("companyId") || "1";
    let isMounted = true;
    
    // Apenas carregar configurações privadas quando autenticado
    if (isAuth) {
      getAll(companyId)
        .then(allSettings => {
          if (!isMounted) return;
          
          // Processar as configurações
          if (!allSettings || !Array.isArray(allSettings)) return;

          const processedSettings = {};
          
          allSettings.forEach((setting) => {
            if (!setting || !setting.key || !setting.value) return;

            if (setting.key === "appName" && setting.value) {
              document.title = setting.value;
            }

            // Processamento de URLs para imagens
            if (setting.key && (setting.key.includes("Logo") || setting.key.includes("Background"))) {
              processedSettings[setting.key] = 
                process.env.REACT_APP_BACKEND_URL + "/public/" + setting.value;
            } else if (setting.key) {
              processedSettings[setting.key] = setting.value;
            }
          });

          setThemeSettings(prevState => ({
            ...prevState,
            ...processedSettings
          }));
        })
        .catch(error => {
          console.error("Erro ao carregar configurações:", error);
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuth, user?.companyId, getAll]);
  
  // Incorporar configurações públicas quando não autenticado
  useEffect(() => {
    if (!isAuth && publicSettings) {
      // Aplicar as configurações públicas ao tema
      setThemeSettings(prevState => ({
        ...prevState,
        ...publicSettings
      }));
      
      // Se tiver configuração de nome da aplicação, atualiza o título
      if (publicSettings.appName) {
        document.title = publicSettings.appName;
      }
    }
    
    // Configuração do idioma
    const i18nlocale = localStorage.getItem("language");
    if (i18nlocale) {
      const browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);
      if (browserLocale === "ptBR") {
        setLocale(ptBR);
      }
    }
  }, [isAuth, publicSettings]);

  // Efeito para salvar preferência de tema no localStorage
  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode || "light");
  }, [mode]);

  // Funções para modificação do tema
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      iconColorLight: themeSettings.iconColorLight || "#0693E3", 
      iconColorDark: themeSettings.iconColorDark || "#39ACE7",
      setPrimaryColorLight: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#0000FF";
        }
        setSetting("primaryColorLight", color);
      },
      setSecondaryColorLight: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#0000FF";
        }
        setSetting("secondaryColorLight", color);
      },
      setPrimaryColorDark: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#39ACE7";
        }
        setSetting("primaryColorDark", color);
      },
      setSecondaryColorDark: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#39ACE7";
        }
        setSetting("secondaryColorDark", color);
      },
      setIconColorLight: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#0693E3";
        }
        setSetting("iconColorLight", color);
      },
      setIconColorDark: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#39ACE7";
        }
        setSetting("iconColorDark", color);
      },
      setChatlistLight: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#eeeeee";
        }
        setSetting("chatlistLight", color);
      },
      setChatlistDark: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#1C2E36";
        }
        setSetting("chatlistDark", color);
      },
      setBoxLeftLight: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#39ACE7";
        }
        setSetting("boxLeftLight", color);
      },
      setBoxLeftDark: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#39ACE7";
        }
        setSetting("boxLeftDark", color);
      },
      setBoxRightLight: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#39ACE7";
        }
        setSetting("boxRightLight", color);
      },
      setBoxRightDark: (color) => {
        if (!color || !color.startsWith("#")) {
          color = "#39ACE7";
        }
        setSetting("boxRightDark", color);
      },
      setAppLogoLight: (file) => {
        setSetting("appLogoLight", file);
      },
      setAppLogoDark: (file) => {
        setSetting("appLogoDark", file);
      },
      setAppLogoFavicon: (file) => {
        setSetting("appLogoFavicon", file);
      },
      setAppLogoPWAIcon: (file) => {
        setSetting("appLogoPWAIcon", file);
      },
      setAppName: (name) => {
        setSetting("appName", name);
      },
      setLoginPosition: (position) => {
        setSetting("loginPosition", position);
      },
      setSignupPosition: (position) => {
        setSetting("signupPosition", position);
      },
      setLoginBackground: (file) => {
        setSetting("loginBackground", file);
      },
      setSignupBackground: (file) => {
        setSetting("signupBackground", file);
      },
      setNumberOfSupport: (number) => {
        setSetting("numberOfSupport", number);
      },
      setCopyright: (text) => {
        setSetting("copyright", text);
      },
      setPrivacy: (url) => {
        setSetting("privacy", url);
      },
      setTerms: (url) => {
        setSetting("terms", url);
      },
      setTrialExpiration: (date) => {
        setSetting("trialExpiration", date);
      },
      setSetting,
    }),
    [themeSettings, setSetting]
  );

  // Criação do tema
  const theme = useMemo(
    () =>
      createTheme(
        {
          scrollbarStyles: {
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor:
                mode === "light"
                  ? themeSettings?.primaryColorLight || "#0000FF"
                  : themeSettings?.primaryColorDark || "#39ACE7",
            },
          },
          scrollbarStylesSoft: {
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor:
                mode === "light" ? "#00bfff" : "#fff !important",
              borderRadius: "8px",
            },
          },
          button: {
            color:
              mode === "light"
                ? themeSettings?.primaryColorLight || "#0000FF"
                : themeSettings?.primaryColorDark || "#39ACE7",
          },
          buttonIcon: {
            color:
              mode === "light"
                ? themeSettings?.primaryColorLight || "#0000FF"
                : themeSettings?.primaryColorDark || "#39ACE7",
          },

          palette: {
            mode: mode || "light",
            primary: {
              main:
                mode === "light"
                  ? themeSettings?.primaryColorLight || "#0000FF"
                  : themeSettings?.primaryColorDark || "#39ACE7",
            },
            secondary: {
              main:
                mode === "light"
                  ? themeSettings?.secondaryColorLight || "#0000FF"
                  : themeSettings?.secondaryColorDark || "#39ACE7",
            },
            success: {
              main: '#4caf50',
              light: '#81c784',
              dark: '#388e3c',
              contrastText: '#fff'
            },
            error: {
              main: '#f44336',
              light: '#e57373',
              dark: '#d32f2f',
              contrastText: '#fff'
            },
            warning: {
              main: '#ff9800',
              light: '#ffb74d',
              dark: '#f57c00',
              contrastText: '#fff'
            },
            info: {
              main: '#2196f3',
              light: '#64b5f6',
              dark: '#1976d2',
              contrastText: '#fff'
            },
            grey: {
              50: '#fafafa',
              100: '#f5f5f5',
              200: '#eeeeee',
              300: '#e0e0e0',
              400: '#bdbdbd',
              500: '#9e9e9e',
              600: '#757575',
              700: '#616161',
              800: '#424242',
              900: '#212121',
              A100: '#d5d5d5',
              A200: '#aaaaaa',
              A400: '#303030',
              A700: '#616161'
            },
            textPrimary:
              mode === "light"
                ? themeSettings?.primaryColorLight || "#0000FF"
                : themeSettings?.primaryColorDark || "#39ACE7",
            borderPrimary:
              mode === "light"
                ? themeSettings?.primaryColorLight || "#0000FF"
                : themeSettings?.primaryColorDark || "#39ACE7",
            dark: { main: mode === "light" ? "#1C2E36" : "#ffffff " },
            light: { main: mode === "light" ? "#F3F3F3" : "#1C2E36" },
            tabHeaderBackground: mode === "light" ? "#FFFFFF" : "#1C2E36", 
            optionsBackground: mode === "light" ? "#F1F5F5" : "#0F1B20", 
            chatlist:
              mode === "light"
                ? themeSettings?.chatlistLight || "#eeeeee"
                : themeSettings?.chatlistDark || "#1C2E36", 
            boxRight:
              mode === "light"
                ? themeSettings?.boxRightLight || "#39ACE7"
                : themeSettings?.boxRightDark || "#39ACE7", 
            boxLeft:
              mode === "light"
                ? themeSettings?.boxLeftLight || "#39ACE7"
                : themeSettings?.boxLeftDark || "#39ACE7", 
            boxchatlist: mode === "light" ? "#ededed" : "#1C2E36", 
            messageIcons: mode === "light" ? "ff0378" : "#F3F3F3",
            inputBackground: mode === "light" ? "#FFFFFF" : "#1C2E36", 
            options: mode === "light" ? "#FFFFFF" : "#1C2E36", 
            fontecor:
              mode === "light"
                ? themeSettings?.primaryColorLight || "#0000FF"
                : themeSettings?.primaryColorDark || "#39ACE7",

            iconColor:
              mode === "light"
                ? themeSettings?.iconColorLight || "#0693E3"
                : themeSettings?.iconColorDark || "#39ACE7",

            fancyBackground: mode === "light" ? "#F1F5F5" : "#0F1B20", 
            bordabox: mode === "light" ? "#F1F5F5" : "#0F1B20", 
            newmessagebox: mode === "light" ? "#F1F5F5" : "#0F1B20", 
            inputdigita: mode === "light" ? "#FFFFFF" : "#1C2E36", 
            contactdrawer: mode === "light" ? "#fff" : "#1C2E36",
            announcements: mode === "light" ? "#ededed" : "#1C2E36",
            login: mode === "light" ? "#fff" : "#1C1C1C",
            announcementspopover: mode === "light" ? "#fff" : "#1C2E36",
            boxlist: mode === "light" ? "#ededed" : "#1C2E36",
            total: mode === "light" ? "#fff" : "#1C2E36",
            barraSuperior:
              mode === "light"
                ? themeSettings?.primaryColorLight || "#0000FF"
                : "linear-gradient(to right, #31363d, #000000, #31363d)", 
            boxticket: mode === "light" ? "#EEE" : "#1C2E36",
            campaigntab: mode === "light" ? "#ededed" : "#1C2E36",
            corTextobarra: mode === "light" ? "#0F1B20" : "#FFFFFF",
            corTextosuporte: mode === "light" ? "#0F1B20" : "#FFFFFF",
            barraLateral:
              mode === "light"
                ? "linear-gradient(to right, #F1F5F5, #FFFFFF, #F1F5F5)"
                : "linear-gradient(to right, #0F1B20, #0F1B20, #0F1B20)", 
            fundologoLateral:
              mode === "light"
                ? "linear-gradient(to right, #0F1B20, #0F1B20, #0F1B20)"
                : "linear-gradient(to right, #0F1B20, #0F1B20, #0F1B20)", 
            listaInterno: mode === "light" ? "#E7ECEE" : "#2E4C59",
            corIconesbarra: mode === "light" ? "#1C2E36" : "#00bfff",

            background: {
              default: mode === "light" ? "#FFFFFF" : "#0F1B20",
              paper: mode === "light" ? "#FFFFFF" : "#1C2E36",
            },
            splash: {
              background: mode === "light" 
                ? themeSettings?.splashBackgroundLight || "#ffffff"
                : themeSettings?.splashBackgroundDark || "#1C2E36",
              textColor: mode === "light"
                ? themeSettings?.splashTextColorLight || "#000000"
                : themeSettings?.splashTextColorDark || "#ffffff",
              appName: themeSettings?.splashAppName || "AutoAtende",
              slogan: themeSettings?.splashSlogan || "Sua plataforma completa de atendimento",
            }, 
          },
          mode,
          calculatedLogoLight: () => {
            if (themeSettings?.appLogoLight) {
              return themeSettings?.appLogoLight;
            }
            return "assets/vector/logo.svg"; // Retornar logo padrão se não definido
          },

          calculatedLogoDark: () => {
            if (themeSettings?.appLogoDark) {
              return themeSettings?.appLogoDark;
            }
            return "assets/vector/logo-dark.svg"; // Retornar logo padrão se não definido
          },

          ...themeSettings,
        },
        locale
      ),
    [locale, themeSettings, mode]
  );

  return (
    <>
      <Favicon
        url={
          themeSettings?.appLogoFavicon
            ? themeSettings.appLogoFavicon
            : "assets/vector/favicon.svg"
        }
      />
      <ColorModeContext.Provider value={{ colorMode }}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <ActiveWhatsappProvider value={{ activeWhatsapp }}>
              <Routes />
            </ActiveWhatsappProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </ColorModeContext.Provider>
    </>
  );
};

const App = () => {
  return (
    <PublicSettingsProvider>
      <LoadingProvider>
        <GlobalContextProvider>
          <ModalProvider>
            <QueryClientProvider client={queryClient}>
                <ThemedApp />
            </QueryClientProvider>
          </ModalProvider>
        </GlobalContextProvider>
      </LoadingProvider>
    </PublicSettingsProvider>
  );
};

export default App;