import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  AutoAwesome as AutoIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import BaseModal from "../../../components/shared/BaseModal";
import BaseResponsiveTabs from "../../../components/shared/BaseResponsiveTabs";
import BaseButton from "../../../components/shared/BaseButton";

const GroupSeriesInfoModal = ({ open, onClose, series, onEdit, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeInviteLink, setActiveInviteLink] = useState("");

  useEffect(() => {
    if (open && series) {
      loadStats();
      loadActiveInviteLink();
    }
  }, [open, series]);

  const loadStats = async () => {
    if (!series) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/group-series/${series.id}`);
      setStats(response.data.stats);
    } catch (err) {
      toast.error("Erro ao carregar estatísticas da série");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveInviteLink = async () => {
    if (!series) return;
    
    try {
      const response = await api.get(`/group-series/${series.name}/invite-link`);
      setActiveInviteLink(response.data.inviteLink);
    } catch (err) {
      // Silently fail - not critical
      console.log("No active invite link available");
    }
  };

  const handleToggleAutoCreate = async () => {
    setToggleLoading(true);
    try {
      await api.put(`/group-series/${series.id}/toggle-auto-create`, {
        enabled: !series.autoCreateEnabled
      });
      toast.success(
        series.autoCreateEnabled 
          ? "Criação automática desabilitada" 
          : "Criação automática habilitada"
      );
      onRefresh();
    } catch (err) {
      toast.error(err);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleCreateNextGroup = async () => {
    setCreatingGroup(true);
    try {
      await api.post(`/group-series/${series.name}/create-next`);
      toast.success("Novo grupo criado com sucesso!");
      loadStats();
      loadActiveInviteLink();
    } catch (err) {
      toast.error(err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(activeInviteLink);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/group-series/${series.id}`);
      toast.success("Série removida com sucesso!");
      setConfirmDelete(false);
      onClose();
      onRefresh();
    } catch (err) {
      toast.error(err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderOverviewTab = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (!stats) {
      return (
        <Alert severity="error">
          Erro ao carregar estatísticas da série
        </Alert>
      );
    }

    const occupancyPercentage = stats.totalCapacity > 0 
      ? (stats.totalParticipants / stats.totalCapacity) * 100 
      : 0;

    return (
      <Box>
        <Grid container spacing={3}>
          {/* Cards de Estatísticas */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {stats.totalGroups}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Grupos Criados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {stats.totalParticipants}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total de Participantes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {stats.activeGroups}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Grupos Ativos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {occupancyPercentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ocupação Geral
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Informações da Série */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Configurações da Série
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Nome da Série
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {series.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Nome Base dos Grupos
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {series.baseGroupName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Máximo por Grupo
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {series.maxParticipants} participantes
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Limiar de Criação
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {series.thresholdPercentage}%
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Chip
                      icon={series.autoCreateEnabled ? <PlayIcon /> : <PauseIcon />}
                      label={series.autoCreateEnabled ? "Ativo" : "Pausado"}
                      color={series.autoCreateEnabled ? "success" : "default"}
                      variant="outlined"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={series.autoCreateEnabled}
                          onChange={handleToggleAutoCreate}
                          disabled={toggleLoading}
                          size="small"
                        />
                      }
                      label="Criação Automática"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Grupo Ativo Atual */}
          {stats.activeGroup && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Grupo Ativo Atual
                  </Typography>
                  {activeInviteLink && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={handleCopyInviteLink}
                    >
                      Copiar Link
                    </Button>
                  )}
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="body1" fontWeight="medium">
                    {stats.activeGroup.name}
                  </Typography>
                  <Chip
                    label={`${stats.activeGroup.participantCount}/${stats.activeGroup.maxParticipants}`}
                    color={stats.activeGroup.isNearCapacity ? "warning" : "success"}
                    variant="outlined"
                  />
                </Box>
                
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Ocupação
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stats.activeGroup.occupancyPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.activeGroup.occupancyPercentage}
                    color={stats.activeGroup.isNearCapacity ? "warning" : "primary"}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {stats.activeGroup.isNearCapacity && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Este grupo está próximo da capacidade máxima. 
                      {series.autoCreateEnabled 
                        ? " Um novo grupo será criado automaticamente em breve."
                        : " Considere criar um novo grupo manualmente."
                      }
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  startIcon={creatingGroup ? <CircularProgress size={20} /> : <AddIcon />}
                  onClick={handleCreateNextGroup}
                  disabled={creatingGroup}
                  size="small"
                >
                  {creatingGroup ? "Criando..." : "Criar Próximo Grupo"}
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderGroupsTab = () => {
    if (loading || !stats) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <List>
          {stats.groups.map((group) => (
            <ListItem key={group.id}>
              <ListItemIcon>
                <GroupIcon color={group.isActive ? "primary" : "disabled"} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1">
                      {group.name}
                    </Typography>
                    {group.isActive && (
                      <Chip label="Ativo" size="small" color="success" />
                    )}
                    {group.isFull && (
                      <Chip label="Cheio" size="small" color="error" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {group.participantCount}/{group.maxParticipants} participantes
                      ({group.occupancyPercentage.toFixed(1)}%)
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Criado em {format(new Date(group.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </Typography>
                    <Box mt={1}>
                      <LinearProgress
                        variant="determinate"
                        value={group.occupancyPercentage}
                        color={group.occupancyPercentage >= 90 ? "warning" : "primary"}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                {group.inviteLink && (
                  <Tooltip title="Copiar link de convite">
                    <IconButton
                      edge="end"
                      onClick={() => {
                        navigator.clipboard.writeText(group.inviteLink);
                        toast.success("Link copiado!");
                      }}
                    >
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {stats.groups.length === 0 && (
          <Box textAlign="center" py={4}>
            <GroupIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Nenhum grupo criado ainda
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Clique em "Criar Próximo Grupo" para começar
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNextGroup}
              disabled={creatingGroup}
            >
              Criar Primeiro Grupo
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const modalActions = [
    {
      label: "Fechar",
      onClick: onClose,
      variant: "outlined",
      color: "secondary",
      icon: <CloseIcon />
    },
    {
      label: "Editar",
      onClick: () => onEdit(series),
      variant: "outlined",
      color: "primary",
      icon: <EditIcon />
    },
    {
      label: "Atualizar",
      onClick: loadStats,
      variant: "outlined",
      color: "primary",
      disabled: loading,
      icon: loading ? <CircularProgress size={20} /> : <RefreshIcon />
    },
    {
      label: "Remover",
      onClick: () => setConfirmDelete(true),
      variant: "contained",
      color: "error",
      icon: <DeleteIcon />
    }
  ];

  const tabsConfig = [
    {
      label: "Visão Geral",
      icon: <TrendingUpIcon />,
      content: renderOverviewTab()
    },
    {
      label: "Grupos",
      icon: <GroupIcon />,
      content: renderGroupsTab()
    }
  ];

  return (
    <>
      <BaseModal
        open={open}
        onClose={onClose}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <AutoIcon />
            {series?.name}
          </Box>
        }
        actions={modalActions}
        maxWidth="lg"
      >
        <BaseResponsiveTabs
          tabs={tabsConfig}
          value={activeTab}
          onChange={handleTabChange}
          showTabsOnMobile={true}
        />
      </BaseModal>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Tem certeza que deseja remover a série "{series?.name}"?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Esta ação irá desabilitar o gerenciamento automático dos grupos,
            mas os grupos existentes permanecerão no WhatsApp.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Remover Série
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupSeriesInfoModal;