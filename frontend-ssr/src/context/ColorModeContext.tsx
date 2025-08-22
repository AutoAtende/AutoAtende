'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ColorModeContextData {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
  colorMode: {
    toggleColorMode: () => void;
  };
}

interface ColorModeProviderProps {
  children: ReactNode;
}

const ColorModeContext = createContext<ColorModeContextData>({} as ColorModeContextData);

const useColorMode = (): ColorModeContextData => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }
  return context;
};

const ColorModeProvider: React.FC<ColorModeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('colorMode') as 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('colorMode', newMode);
  };

  return (
    <ColorModeContext.Provider
      value={{
        toggleColorMode,
        mode,
        colorMode: {
          toggleColorMode,
        },
      }}
    >
      {children}
    </ColorModeContext.Provider>
  );
};

export { ColorModeContext, ColorModeProvider, useColorMode };