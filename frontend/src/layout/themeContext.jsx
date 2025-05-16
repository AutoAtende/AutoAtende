import React from "react";

const ColorModeContext = React.createContext({
    // Funções básicas
    toggleColorMode: () => {},
    setSetting: (key, value) => {},
    
    // Cores do tema
    setPrimaryColorLight: (_) => {},
    setSecondaryColorLight: (_) => {},
    setPrimaryColorDark: (_) => {},
    setSecondaryColorDark: (_) => {},
    setIconColorDark: (_) => {},
    setIconColorLight: (_) => {},
    
    // Logos e imagens
    setAppLogoLight: (_) => {},
    setAppLogoDark: (_) => {},
    setAppLogoFavicon: (_) => {},
    setAppLogoPWAIcon: (_) => {},
    setLoginBackground: (_) => {},
    setSignupBackground: (_) => {},
    
    // Cores do chat
    setChatlistLight: (_) => {},
    setChatlistDark: (_) => {},
    setBoxLeftLight: (_) => {},
    setBoxLeftDark: (_) => {},
    setBoxRightLight: (_) => {},
    setBoxRightDark: (_) => {},
    
    // Configurações do sistema
    setAppName: (_) => {},
    setCopyright: (_) => {},
    setPrivacy: (_) => {},
    setTerms: (_) => {},
    setAllowSignup: (_) => {},
    setTrialExpiration: (_) => {},
    setLoginPosition: (_) => {},
    setSignupPosition: (_) => {}
});

export default ColorModeContext;