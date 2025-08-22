'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { openApi } from '../services/api';

interface PublicSettings {
  allowSignup?: string;
  copyright?: string;
  terms?: string;
  privacy?: string;
  loginPosition?: string;
  loginBackground?: string;
  [key: string]: any;
}

interface PublicSettingsContextData {
  publicSettings: PublicSettings;
  publicSettingsLoading: boolean;
  fetchPublicSettings: () => Promise<void>;
}

interface PublicSettingsProviderProps {
  children: ReactNode;
}

const PublicSettingsContext = createContext<PublicSettingsContextData>({} as PublicSettingsContextData);

const usePublicSettings = (): PublicSettingsContextData => {
  const context = useContext(PublicSettingsContext);
  if (!context) {
    throw new Error('usePublicSettings must be used within a PublicSettingsProvider');
  }
  return context;
};

const PublicSettingsProvider: React.FC<PublicSettingsProviderProps> = ({ children }) => {
  const [publicSettings, setPublicSettings] = useState<PublicSettings>({});
  const [publicSettingsLoading, setPublicSettingsLoading] = useState(true);

  const fetchPublicSettings = async (): Promise<void> => {
    try {
      setPublicSettingsLoading(true);
      const { data } = await openApi.get('/public-settings');
      setPublicSettings(data);
    } catch (error) {
      console.error('Error fetching public settings:', error);
      // Set default values if API fails
      setPublicSettings({
        allowSignup: 'enabled',
        copyright: 'Fonte',
        terms: '',
        privacy: '',
        loginPosition: 'right',
        loginBackground: '',
      });
    } finally {
      setPublicSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSettings();
  }, []);

  return (
    <PublicSettingsContext.Provider
      value={{
        publicSettings,
        publicSettingsLoading,
        fetchPublicSettings,
      }}
    >
      {children}
    </PublicSettingsContext.Provider>
  );
};

export { PublicSettingsContext, PublicSettingsProvider, usePublicSettings };