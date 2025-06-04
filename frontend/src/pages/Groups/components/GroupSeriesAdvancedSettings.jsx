import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  FormGroup,
  TextField,
  Button,
  Divider,
  Alert,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  AutoAwesome as AutoIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import BaseModal from "../../../components/shared/BaseModal";
import StandardTabContent from "../../../components/shared/StandardTabContent";

const GroupSeriesAdvancedSettings = ({ open, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Configurações de Monitoramento
    monitoring: {
      enabled: true,
      interval: 5, // minutos
      maxRetries: 3,
      timeoutMs: 30000,
      enableEmailAlerts: false,
      enableWebhookAlerts: false,
      webhookUrl: "",
      emailRecipients: []
    },
    
    // Configurações de Performance
    performance: {
      batchSize: 10,
      concurrentOperations: 3,
      rateLimitPerMinute: 60,
      cacheEnabled: true,
      cacheExpiryMinutes: 15
    },
    
    // Configurações de Segurança
    security: {
      maxGroupsPerSeries: 50,
      requireAdminApproval: false,
      allowCrossSeriesTransfer: false,
      enableAuditLog: true,
      maxParticipantsGlobal: 10000
    },
    
    // Configurações de Backup e Recuperação
    backup: {
      enableAutoBackup: true,
      backupInterval: 24, // horas
      retentionDays: 30,
      includeParticipantData: true
    }
  });

  const [originalSettings, setOriginalSettings] = useState(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Em produção, carregar configurações do backend
      // const { data } = await api.get("/group-series/settings");
      // setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    } catch (err) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // await api.put("/group-series/settings", settings);
      toast.success("Configurações salvas com sucesso!");
      setHasChanges(false);
      onSave?.(settings);
      onClose();
    } catch (err) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setHasChanges(false);
    setShowResetDialog(false);
    toast.info("Configurações restauradas");
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm("Há alterações não salvas. Deseja realmente sair?")) {
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const renderMonitoringSettings = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6">
            Configurações de Monitoramento
          </Typography>
        </Box>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.monitoring.enabled}
                onChange={(e) => handleSettingChange('monitoring', 'enabled', e.target.checked)}
              />
            }
            label="Habilitar monitoramento automático"
          />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Intervalo de Verificação: {settings.monitoring.interval} minutos
            </Typography>
            <Slider
              value={settings.monitoring.interval}
              onChange={(e, value) => handleSettingChange('monitoring', 'interval', value)}
              min={1}
              max={60}
              step={1}
              marks={[
                { value: 1, label: '1min' },
                { value: 5, label: '5min' },
                { value: 15, label: '15min' },
                { value: 30, label: '30min' },
                { value: 60, label: '1h' }
              ]}
              disabled={!settings.monitoring.enabled}
            />
          </Box>
          
          <TextField
            label="Máximo de Tentativas"
            type="number"
            value={settings.monitoring.maxRetries}
            onChange={(e) => handleSettingChange('monitoring', 'maxRetries', parseInt(e.target.value))}
            size="small"
            sx={{ mb: 2 }}
            disabled={!settings.monitoring.enabled}
          />
          
          <TextField
            label="Timeout (ms)"
            type="number"
            value={settings.monitoring.timeoutMs}
            onChange={(e) => handleSettingChange('monitoring', 'timeoutMs', parseInt(e.target.value))}
            size="small"
            sx={{ mb: 2 }}
            disabled={!settings.monitoring.enabled}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.monitoring.enableEmailAlerts}
                onChange={(e) => handleSettingChange('monitoring', 'enableEmailAlerts', e.target.checked)}
              />
            }
            label="Alertas por Email"
            disabled={!settings.monitoring.enabled}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.monitoring.enableWebhookAlerts}
                onChange={(e) => handleSettingChange('monitoring', 'enableWebhookAlerts', e.target.checked)}
              />
            }
            label="Alertas via Webhook"
            disabled={!settings.monitoring.enabled}
          />
          
          {settings.monitoring.enableWebhookAlerts && (
            <TextField
              label="URL do Webhook"
              value={settings.monitoring.webhookUrl}
              onChange={(e) => handleSettingChange('monitoring', 'webhookUrl', e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
              placeholder="https://seu-webhook.com/alerts"
            />
          )}
        </FormGroup>
      </CardContent>
    </Card>
  );

  const renderPerformanceSettings = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SpeedIcon color="primary" />
          <Typography variant="h6">
            Configurações de Performance
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tamanho do Lote"
              type="number"
              value={settings.performance.batchSize}
              onChange={(e) => handleSettingChange('performance', 'batchSize', parseInt(e.target.value))}
              size="small"
              fullWidth
              helperText="Grupos processados por vez"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Operações Simultâneas"
              type="number"
              value={settings.performance.concurrentOperations}
              onChange={(e) => handleSettingChange('performance', 'concurrentOperations', parseInt(e.target.value))}
              size="small"
              fullWidth
              helperText="Máximo de operações paralelas"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Rate Limit (por minuto)"
              type="number"
              value={settings.performance.rateLimitPerMinute}
              onChange={(e) => handleSettingChange('performance', 'rateLimitPerMinute', parseInt(e.target.value))}
              size="small"
              fullWidth
              helperText="Operações máximas por minuto"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Cache Expiry (minutos)"
              type="number"
              value={settings.performance.cacheExpiryMinutes}
              onChange={(e) => handleSettingChange('performance', 'cacheExpiryMinutes', parseInt(e.target.value))}
              size="small"
              fullWidth
              disabled={!settings.performance.cacheEnabled}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.performance.cacheEnabled}
                  onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
                />
              }
              label="Habilitar Cache"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">
            Configurações de Segurança
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Máximo de Grupos por Série"
              type="number"
              value={settings.security.maxGroupsPerSeries}
              onChange={(e) => handleSettingChange('security', 'maxGroupsPerSeries', parseInt(e.target.value))}
              size="small"
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Máximo de Participantes Global"
              type="number"
              value={settings.security.maxParticipantsGlobal}
              onChange={(e) => handleSettingChange('security', 'maxParticipantsGlobal', parseInt(e.target.value))}
              size="small"
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.requireAdminApproval}
                    onChange={(e) => handleSettingChange('security', 'requireAdminApproval', e.target.checked)}
                  />
                }
                label="Exigir aprovação do administrador para novas séries"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.allowCrossSeriesTransfer}
                    onChange={(e) => handleSettingChange('security', 'allowCrossSeriesTransfer', e.target.checked)}
                  />
                }
                label="Permitir transferência entre séries"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.enableAuditLog}
                    onChange={(e) => handleSettingChange('security', 'enableAuditLog', e.target.checked)}
                  />
                }
                label="Habilitar log de auditoria"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderBackupSettings = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <RestoreIcon color="primary" />
          <Typography variant="h6">
            Backup e Recuperação
          </Typography>
        </Box>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.backup.enableAutoBackup}
                onChange={(e) => handleSettingChange('backup', 'enableAutoBackup', e.target.checked)}
              />
            }
            label="Habilitar backup automático"
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Intervalo de Backup (horas)"
                type="number"
                value={settings.backup.backupInterval}
                onChange={(e) => handleSettingChange('backup', 'backupInterval', parseInt(e.target.value))}
                size="small"
                fullWidth
                disabled={!settings.backup.enableAutoBackup}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Retenção (dias)"
                type="number"
                value={settings.backup.retentionDays}
                onChange={(e) => handleSettingChange('backup', 'retentionDays', parseInt(e.target.value))}
                size="small"
                fullWidth
                disabled={!settings.backup.enableAutoBackup}
              />
            </Grid>
          </Grid>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.backup.includeParticipantData}
                onChange={(e) => handleSettingChange('backup', 'includeParticipantData', e.target.checked)}
              />
            }
            label="Incluir dados dos participantes no backup"
            disabled={!settings.backup.enableAutoBackup}
            sx={{ mt: 1 }}
          />
        </FormGroup>
      </CardContent>
    </Card>
  );

  const modalActions = [
    {
      label: "Cancelar",
      onClick: handleClose,
      variant: "outlined",
      color: "secondary"
    },
    {
      label: "Restaurar",
      onClick: () => setShowResetDialog(true),
      variant: "outlined",
      color: "warning",
      icon: <RestoreIcon />,
      disabled: !hasChanges
    },
    {
      label: loading ? "Salvando..." : "Salvar",
      onClick: handleSave,
      variant: "contained",
      color: "primary",
      icon: <SaveIcon />,
      disabled: loading || !hasChanges
    }
  ];

  return (
    <>
      <BaseModal
        open={open}
        onClose={handleClose}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            Configurações Avançadas
          </Box>
        }
        actions={modalActions}
        maxWidth="lg"
      >
        <StandardTabContent variant="default">
          {hasChanges && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Você tem alterações não salvas. Não esqueça de salvar antes de sair.
              </Typography>
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              {renderMonitoringSettings()}
            </Grid>
            
            <Grid item xs={12} lg={6}>
              {renderPerformanceSettings()}
            </Grid>
            
            <Grid item xs={12} lg={6}>
              {renderSecuritySettings()}
            </Grid>
            
            <Grid item xs={12} lg={6}>
              {renderBackupSettings()}
            </Grid>
          </Grid>
          
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Algumas alterações podem afetar o desempenho do sistema. 
              Teste as configurações em um ambiente de desenvolvimento antes de aplicar em produção.
            </Typography>
          </Alert>
        </StandardTabContent>
      </BaseModal>

      {/* Dialog de Confirmação para Reset */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Restaurar Configurações</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja restaurar todas as configurações para os valores originais?
            Todas as alterações não salvas serão perdidas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReset} 
            color="warning" 
            variant="contained"
            startIcon={<RestoreIcon />}
          >
            Restaurar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupSeriesAdvancedSettings;