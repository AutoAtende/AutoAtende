import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../context/Auth/AuthContext";
import { SocketContext } from "../context/Socket/SocketContext";
import api from "../services/api";
import { toast } from "../helpers/toast";

/**
 * Hook para gerenciar séries de grupos
 */
export const useGroupSeries = () => {
  const { user } = useContext(AuthContext);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/group-series");
      setSeries(data);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao carregar séries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSeries = useCallback(async (seriesData) => {
    try {
      const { data } = await api.post("/group-series", seriesData);
      setSeries(prev => [data, ...prev]);
      toast.success("Série criada com sucesso!");
      return data;
    } catch (err) {
      toast.error(err);
      throw err;
    }
  }, []);

  const updateSeries = useCallback(async (seriesId, updates) => {
    try {
      const { data } = await api.put(`/group-series/${seriesId}`, updates);
      setSeries(prev => 
        prev.map(s => s.id === seriesId ? { ...s, ...data } : s)
      );
      toast.success("Série atualizada com sucesso!");
      return data;
    } catch (err) {
      toast.error(err);
      throw err;
    }
  }, []);

  const deleteSeries = useCallback(async (seriesId) => {
    try {
      await api.delete(`/group-series/${seriesId}`);
      setSeries(prev => prev.filter(s => s.id !== seriesId));
      toast.success("Série removida com sucesso!");
    } catch (err) {
      toast.error(err);
      throw err;
    }
  }, []);

  const toggleAutoCreate = useCallback(async (seriesId, enabled) => {
    try {
      await api.put(`/group-series/${seriesId}/toggle-auto-create`, { enabled });
      setSeries(prev => 
        prev.map(s => s.id === seriesId ? { ...s, autoCreateEnabled: enabled } : s)
      );
      toast.success(`Criação automática ${enabled ? 'habilitada' : 'desabilitada'}`);
    } catch (err) {
      toast.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  return {
    series,
    loading,
    error,
    refetch: fetchSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    toggleAutoCreate
  };
};

/**
 * Hook para monitorar uma série específica em tempo real
 */
export const useGroupSeriesMonitor = (seriesName) => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);

  const fetchStats = useCallback(async () => {
    if (!seriesName) return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/group-series/${seriesName}/stats`);
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    } finally {
      setLoading(false);
    }
  }, [seriesName]);

  useEffect(() => {
    if (!seriesName || !user?.companyId) return;

    const socket = socketManager.GetSocket(user.companyId);
    
    if (socket) {
      const handleSeriesUpdate = (data) => {
        if (data.series === seriesName || data.seriesName === seriesName) {
          // Adicionar evento em tempo real
          setLiveEvents(prev => [
            {
              id: Date.now(),
              timestamp: new Date(),
              type: data.action,
              data: data
            },
            ...prev.slice(0, 9) // Manter apenas os 10 últimos
          ]);
          
          // Recarregar estatísticas
          fetchStats();
        }
      };

      socket.on("auto-group-created", handleSeriesUpdate);
      socket.on("auto-group-deactivated", handleSeriesUpdate);
      socket.on("group-series", handleSeriesUpdate);

      // Carregar dados iniciais
      fetchStats();

      return () => {
        socket.off("auto-group-created", handleSeriesUpdate);
        socket.off("auto-group-deactivated", handleSeriesUpdate);
        socket.off("group-series", handleSeriesUpdate);
      };
    }
  }, [seriesName, user?.companyId, socketManager, fetchStats]);

  return {
    stats,
    loading,
    liveEvents,
    refetch: fetchStats
  };
};

/**
 * Hook para obter link de convite ativo de uma série
 */
export const useActiveInviteLink = (seriesName) => {
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInviteLink = useCallback(async () => {
    if (!seriesName) {
      setInviteLink("");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/group-series/${seriesName}/invite-link`);
      setInviteLink(data.inviteLink);
    } catch (err) {
      setError(err.message);
      setInviteLink("");
    } finally {
      setLoading(false);
    }
  }, [seriesName]);

  const copyToClipboard = useCallback(() => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Link copiado para a área de transferência!");
      return true;
    }
    return false;
  }, [inviteLink]);

  const createNextGroup = useCallback(async () => {
    if (!seriesName) return null;
    
    try {
      const { data } = await api.post(`/group-series/${seriesName}/create-next`);
      await fetchInviteLink(); // Atualizar link após criar novo grupo
      toast.success("Novo grupo criado com sucesso!");
      return data;
    } catch (err) {
      toast.error(err);
      throw err;
    }
  }, [seriesName, fetchInviteLink]);

  useEffect(() => {
    fetchInviteLink();
  }, [fetchInviteLink]);

  return {
    inviteLink,
    loading,
    error,
    copyToClipboard,
    createNextGroup,
    refetch: fetchInviteLink
  };
};

/**
 * Hook para gerenciar notificações de grupos automáticos
 */
export const useGroupSeriesNotifications = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Max 50
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!user?.companyId) return;

    const socket = socketManager.GetSocket(user.companyId);
    
    if (socket) {
      const handleGroupCreated = (data) => {
        addNotification({
          type: "group_created",
          title: "Novo Grupo Criado",
          message: `${data.newGroup.name} foi criado na série ${data.series}`,
          severity: "success",
          data: data
        });
      };

      const handleGroupDeactivated = (data) => {
        addNotification({
          type: "group_deactivated",
          title: "Grupo Desativado",
          message: `${data.group.name} foi desativado (capacidade esgotada)`,
          severity: "warning",
          data: data
        });
      };

      const handleMonitoringError = (data) => {
        if (data.stats?.errors?.length > 0) {
          addNotification({
            type: "monitoring_error",
            title: "Erro no Monitoramento",
            message: `${data.stats.errors.length} erro(s) detectado(s)`,
            severity: "error",
            data: data
          });
        }
      };

      socket.on("auto-group-created", handleGroupCreated);
      socket.on("auto-group-deactivated", handleGroupDeactivated);
      socket.on("group-monitoring-stats", handleMonitoringError);

      return () => {
        socket.off("auto-group-created", handleGroupCreated);
        socket.off("auto-group-deactivated", handleGroupDeactivated);
        socket.off("group-monitoring-stats", handleMonitoringError);
      };
    }
  }, [user?.companyId, socketManager, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};

/**
 * Hook para validações de séries de grupos
 */
export const useGroupSeriesValidation = () => {
  const validateSeriesData = useCallback((data) => {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = "Nome da série é obrigatório";
    }
    
    if (!data.baseGroupName?.trim()) {
      errors.baseGroupName = "Nome base do grupo é obrigatório";
    }
    
    if (!data.whatsappId) {
      errors.whatsappId = "Conexão WhatsApp é obrigatória";
    }
    
    if (data.maxParticipants < 10 || data.maxParticipants > 1024) {
      errors.maxParticipants = "Máximo de participantes deve estar entre 10 e 1024";
    }
    
    if (data.thresholdPercentage < 50 || data.thresholdPercentage > 99) {
      errors.thresholdPercentage = "Limiar deve estar entre 50% e 99%";
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const validateSeriesName = useCallback(async (name, excludeId = null) => {
    try {
      const { data } = await api.post("/group-series/validate-name", { 
        name, 
        excludeId 
      });
      return data.available;
    } catch (err) {
      return false;
    }
  }, []);

  return {
    validateSeriesData,
    validateSeriesName
  };
};

/**
 * Hook para estatísticas globais do sistema
 */
export const useGroupSeriesGlobalStats = () => {
  const [stats, setStats] = useState({
    totalSeries: 0,
    activeSeries: 0,
    totalGroups: 0,
    totalParticipants: 0,
    averageOccupancy: 0,
    groupsCreatedToday: 0,
    seriesNearCapacity: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Em produção, seria um endpoint específico
      const [seriesResponse] = await Promise.all([
        api.get("/group-series")
      ]);
      
      const series = seriesResponse.data;
      
      // Calcular estatísticas
      const calculatedStats = {
        totalSeries: series.length,
        activeSeries: series.filter(s => s.autoCreateEnabled).length,
        totalGroups: Math.floor(Math.random() * 100) + 50, // Simulado
        totalParticipants: Math.floor(Math.random() * 5000) + 1000, // Simulado
        averageOccupancy: Math.floor(Math.random() * 40) + 60, // Simulado
        groupsCreatedToday: Math.floor(Math.random() * 10), // Simulado
        seriesNearCapacity: Math.floor(Math.random() * 3) // Simulado
      };
      
      setStats(calculatedStats);
    } catch (err) {
      console.error("Erro ao carregar estatísticas globais:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};