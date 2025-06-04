import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Button,
  CircularProgress
} from "@mui/material";
import {
  AutoAwesome as AutoIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthContext } from "../../../context/Auth/AuthContext";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import StandardTabContent from "../../../components/shared/StandardTabContent";
import StandardDataTable from "../../../components/shared/StandardDataTable";
import CreateGroupSeriesModal from "./CreateGroupSeriesModal";
import GroupSeriesInfoModal from "./GroupSeriesInfoModal";

const GroupSeriesTab = () => {
  const { user } = useContext(AuthContext);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [whatsappConnections, setWhatsappConnections] = useState([]);

  useEffect(() => {
    fetchSeries();
    checkWhatsAppConnections();
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/group-series");
      setSeries(data);
      
      // Calcular estatísticas globais
      if (data.length > 0) {
        calculateGlobalStats(data);
      }
    } catch (err) {
      toast.error("Erro ao carregar séries de grupos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkWhatsAppConnections = async () => {
    try {
      const { data } = await api.get("/whatsapp");
      const connectedWhatsApps = data.filter(w => w.status === "CONNECTED");
      setWhatsappConnections(connectedWhatsApps);
    } catch (err) {
      console.error("Erro ao verificar conexões WhatsApp:", err);
    }
  };

  const calculateGlobalStats = (seriesData) => {
    const stats = {
      totalSeries: seriesData.length,
      activeSeries: seriesData.filter(s => s.autoCreateEnabled).length,
      totalGroups: 0,
      totalParticipants: 0,
      averageOccupancy: 0
    };

    setGlobalStats(stats);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSeries();
    setRefreshing(false);
  };

  const handleCreateSeries = () => {
    setOpenCreateModal(true);
  };

  const handleEditSeries = (series) => {
    setSelectedSeries(series);
    setOpenCreateModal(true);
  };

  const handleViewSeries = (series) => {
    setSelectedSeries(series);
    setOpenInfoModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setSelectedSeries(null);
    fetchSeries();
  };

  const handleCloseInfoModal = () => {
    setOpenInfoModal(false);
    setSelectedSeries(null);
  };

  const handleToggleAutoCreate = async (series) => {
    try {
      await api.put(`/group-series/${series.id}/toggle-auto-create`, {
        enabled: !series.autoCreateEnabled
      });
      toast.success(
        series.autoCreateEnabled 
          ? "Criação automática desabilitada" 
          : "Criação automática habilitada"
      );
      fetchSeries();
    } catch (err) {
      toast.error(err);
    }
  };

  const handleForceMonitor = async () => {
    try {
      await api.post("/group-series/monitor");
      toast.success("Monitoramento manual iniciado");
    } catch (err) {
      toast.error(err);
    }
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      id: 'name',
      field: 'name',
      label: 'Série',
      render: (series) => (
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{ 
              width: 40,
              height: 40,
              backgroundColor: 'primary.main',
              marginRight: 2 
            }}
          >
            <AutoIcon />
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {series.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {series.baseGroupName}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'status',
      field: 'autoCreateEnabled',
      label: 'Status',
      render: (series) => (
        <Chip
          icon={series.autoCreateEnabled ? <PlayIcon /> : <PauseIcon />}
          label={series.autoCreateEnabled ? "Ativo" : "Pausado"}
          color={series.autoCreateEnabled ? "success" : "default"}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      id: 'connection',
      field: 'whatsapp',
      label: 'Conexão',
      render: (series) => (
        series.whatsapp ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={series.whatsapp.status === "CONNECTED" ? "Conectado" : "Desconectado"}
              size="small" 
              color={series.whatsapp.status === "CONNECTED" ? "success" : "error"} 
              variant="outlined" 
            />
            <Typography variant="body2">
              {series.whatsapp.name}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            N/A
          </Typography>
        )
      )
    },
    {
      id: 'config',
      field: 'maxParticipants',
      label: 'Configuração',
      render: (series) => (
        <Box>
          <Typography variant="body2">
            Max: {series.maxParticipants} participantes
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Limiar: {series.thresholdPercentage}%
          </Typography>
        </Box>
      )
    },
    {
      id: 'landingPage',
      field: 'landingPage',
      label: 'Landing Page',
      render: (series) => (
        series.landingPage ? (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {series.landingPage.title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              /{series.landingPage.slug}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Não vinculada
          </Typography>
        )
      )
    },
    {
      id: 'createdAt',
      field: 'createdAt',
      label: 'Criado em',
      render: (series) => (
        format(new Date(series.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
      )
    }
  ];

  // Ações da tabela
  const getTableActions = (series) => [
    {
      label: "Visualizar",
      icon: <InfoIcon />,
      onClick: () => handleViewSeries(series),
      color: "primary"
    },
    {
      label: series.autoCreateEnabled ? "Pausar" : "Ativar",
      icon: series.autoCreateEnabled ? <PauseIcon /> : <PlayIcon />,
      onClick: () => handleToggleAutoCreate(series),
      color: series.autoCreateEnabled ? "warning" : "success"
    }
  ];

  // Estatísticas para o cabeçalho
  const stats = [];
  if (globalStats) {
    stats.push(
      {
        label: `${globalStats.totalSeries} séries`,
        icon: <AutoIcon />,
        color: 'primary'
      },
      {
        label: `${globalStats.activeSeries} ativas`,
        icon: <CheckIcon />,
        color: 'success'
      }
    );
  }

  // Alertas
  const alerts = [];
  
  if (whatsappConnections.length === 0) {
    alerts.push({
      severity: "warning",
      title: "Nenhuma conexão WhatsApp",
      message: "Para criar séries de grupos automáticos, você precisa ter pelo menos uma conexão WhatsApp ativa."
    });
  }

  if (series.some(s => s.whatsapp?.status !== "CONNECTED")) {
    alerts.push({
      severity: "warning",
      title: "Conexões inativas detectadas",
      message: "Algumas séries estão vinculadas a conexões WhatsApp inativas. Verifique e atualize as configurações."
    });
  }

  // Ações do cabeçalho
  const actions = (
    <Box display="flex" gap={1}>
      <Button
        variant="outlined"
        startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={handleRefresh}
        disabled={refreshing}
      >
        Atualizar
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<TrendingUpIcon />}
        onClick={handleForceMonitor}
      >
        Monitorar Agora
      </Button>
      
      {whatsappConnections.length > 0 && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSeries}
        >
          Nova Série
        </Button>
      )}
    </Box>
  );

  const renderEmptyState = () => (
    <Box textAlign="center" py={6}>
      <AutoIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
      <Typography variant="h5" gutterBottom color="textSecondary">
        Nenhuma série criada ainda
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Crie séries de grupos automáticos para gerenciar grandes volumes de participantes
      </Typography>
      
      {whatsappConnections.length > 0 ? (
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleCreateSeries}
        >
          Criar Primeira Série
        </Button>
      ) : (
        <Alert severity="info" sx={{ mt: 2, maxWidth: 400, mx: "auto" }}>
          Configure uma conexão WhatsApp primeiro para começar
        </Alert>
      )}
    </Box>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={40} />
        </Box>
      );
    }

    if (series.length === 0) {
      return renderEmptyState();
    }

    return (
      <StandardDataTable
        data={series}
        columns={columns}
        loading={loading}
        actions={getTableActions}
        stickyHeader={false}
        size="medium"
        hover={true}
        maxVisibleActions={2}
      />
    );
  };

  return (
    <>
      <StandardTabContent
        title="Séries de Grupos Automáticos"
        description="Gerencie a criação automática de grupos baseada em limites de participantes"
        icon={<AutoIcon />}
        stats={stats}
        alerts={alerts}
        actions={actions}
        variant="default"
      >
        {/* Explicação do Sistema */}
        {series.length === 0 && whatsappConnections.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Como funcionam as Séries de Grupos Automáticos?
              </Typography>
              <Typography variant="body2" component="div">
                • Quando um grupo atinge um determinado número de participantes, um novo grupo é criado automaticamente<br />
                • Novos participantes são sempre direcionados para o grupo com mais espaço disponível<br />
                • Perfeito para landing pages com alto volume de cadastros<br />
                • Totalmente automatizado - sem intervenção manual necessária
              </Typography>
            </Alert>
          </Box>
        )}

        {renderContent()}
      </StandardTabContent>

      {/* Modais */}
      <CreateGroupSeriesModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        series={selectedSeries}
      />

      {selectedSeries && (
        <GroupSeriesInfoModal
          open={openInfoModal}
          onClose={handleCloseInfoModal}
          series={selectedSeries}
          onEdit={handleEditSeries}
          onRefresh={fetchSeries}
        />
      )}
    </>
  );
};

export default GroupSeriesTab;