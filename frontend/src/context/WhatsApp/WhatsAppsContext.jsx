import React, { createContext, useCallback, useMemo, useState } from "react";
import api from "../../services/api";
import { toast } from "../../helpers/toast";

// Criando um valor padrão para o contexto
const defaultValue = {
  whatsApps: [],
  loading: true,
  fetchWhatsApps: () => {},
};

export const WhatsAppsContext = createContext(defaultValue);

export const WhatsAppsProvider = ({ children }) => {
  const [whatsApps, setWhatsApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWhatsApps = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/whatsapp");//
      setWhatsApps(data);
    } catch (error) {
      console.error("Error fetching whatsapps:", error);
      toast.error("Erro ao carregar conexões");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    whatsApps,
    loading,
    fetchWhatsApps
  }), [whatsApps, loading, fetchWhatsApps]);

  return (
    <WhatsAppsContext.Provider value={value}>
      {children}
    </WhatsAppsContext.Provider>
  );
};

// Exportando um hook personalizado para usar o contexto
export const useWhatsAppsContext = () => {
  const context = React.useContext(WhatsAppsContext);
  if (context === undefined) {
    throw new Error('useWhatsAppsContext must be used within a WhatsAppsProvider');
  }
  return context;
};