import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Slider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AutoAwesome as AutoIcon,
  Group as GroupIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import BaseModal from "../../../components/shared/BaseModal";
import BaseResponsiveTabs from "../../../components/shared/BaseResponsiveTabs";

const CreateGroupSeriesModal = ({ open, onClose, series = null }) => {
  const [loading, setLoading] = useState(false);
  const [whatsappConnections, setWhatsappConnections] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    baseGroupName: "",
    description: "",
    maxParticipants: 256,
    thresholdPercentage: 95,
    whatsappId: "",
    landingPageId: "",
    createFirstGroup: true,
    autoCreateEnabled: true
  });

  const isEditing = !!series;

  useEffect(() => {
    if (open) {
      loadInitialData();
      if (isEditing) {
        loadSeriesData();
      }
    }
  }, [open, series]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [whatsappResponse, landingPagesResponse] = await Promise.all([
        api.get("/whatsapp"),
        api.get("/landing-pages")
      ]);
      
      const connectedWhatsApps = whatsappResponse.data.filter(w => w.status === "CONNECTED");
      setWhatsappConnections(connectedWhatsApps);
      setLandingPages(landingPagesResponse.data.data || []);
    } catch (err) {
      toast.error("Erro ao carregar dados iniciais");
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSeriesData = () => {
    if (series) {
      setFormData({
        name: series.name || "",
        baseGroupName: series.baseGroupName || "",
        description: series.description || "",
        maxParticipants: series.maxParticipants || 256,
        thresholdPercentage: series.thresholdPercentage || 95,
        whatsappId: series.whatsappId || "",
        landingPageId: series.landingPageId || "",
        createFirstGroup: false, // Não criar primeiro grupo ao editar
        autoCreateEnabled: series.autoCreateEnabled !== false
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      baseGroupName: "",
      description: "",
      maxParticipants: 256,
      thresholdPercentage: 95,
      whatsappId: "",
      landingPageId: "",
      createFirstGroup: true,
      autoCreateEnabled: true
    });
    setErrors({});
    setActiveTab(0);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome da série é obrigatório";
    }
    
    if (!formData.baseGroupName.trim()) {
      newErrors.baseGroupName = "Nome base do grupo é obrigatório";
    }
    
    if (!formData.whatsappId) {
      newErrors.whatsappId = "Conexão WhatsApp é obrigatória";
    }
    
    if (formData.maxParticipants < 10 || formData.maxParticipants > 1024) {
      newErrors.maxParticipants = "Máximo de participantes deve estar entre 10 e 1024";
    }
    
    if (formData.thresholdPercentage < 50 || formData.thresholdPercentage > 99) {
      newErrors.thresholdPercentage = "Limiar deve estar entre 50% e 99%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/group-series/${series.id}`, formData);
        toast.success("Série atualizada com sucesso!");
      } else {
        await api.post("/group-series", formData);
        toast.success("Série criada com sucesso!");
      }
      
      handleClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderBasicInfoTab = () => (
    <Box>
      <TextField
        label="Nome da Série"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        fullWidth
        margin="normal"
        error={Boolean(errors.name)}
        helperText={errors.name || "Identificador único para a série de grupos"}
        disabled={loading}
        placeholder="Ex: landing-vendas-2024"
      />
      
      <TextField
        label="Nome Base do Grupo"
        value={formData.baseGroupName}
        onChange={(e) => handleInputChange('baseGroupName', e.target.value)}
        fullWidth
        margin="normal"
        error={Boolean(errors.baseGroupName)}
        helperText={errors.baseGroupName || "Nome que será usado para todos os grupos da série"}
        disabled={loading}
        placeholder="Ex: Vendas Premium"
      />
      
      <TextField
        label="Descrição"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        fullWidth
        multiline
        rows={3}
        margin="normal"
        helperText="Descrição que será aplicada a todos os grupos da série"
        disabled={loading}
        placeholder="Descrição do grupo..."
      />
      
      <FormControl fullWidth margin="normal" error={Boolean(errors.whatsappId)}>
        <InputLabel>Conexão WhatsApp</InputLabel>
        <Select
          value={formData.whatsappId}
          onChange={(e) => handleInputChange('whatsappId', e.target.value)}
          label="Conexão WhatsApp"
          disabled={loading || loadingData}
        >
          {whatsappConnections.map((conn) => (
            <MenuItem key={conn.id} value={conn.id}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={conn.status} 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
                {conn.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {errors.whatsappId || "Conexão WhatsApp que será usada para criar os grupos"}
        </FormHelperText>
      </FormControl>

      <Autocomplete
        options={landingPages}
        getOptionLabel={(option) => option.title}
        value={landingPages.find(lp => lp.id === formData.landingPageId) || null}
        onChange={(event, newValue) => {
          handleInputChange('landingPageId', newValue ? newValue.id : "");
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Landing Page (Opcional)"
            margin="normal"
            helperText="Landing page associada a esta série"
            disabled={loading || loadingData}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Box>
              <Typography variant="body1">{option.title}</Typography>
              <Typography variant="caption" color="textSecondary">
                /{option.slug}
              </Typography>
            </Box>
          </li>
        )}
      />
    </Box>
  );

  const renderConfigTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Configurações de Gerenciamento
      </Typography>
      
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Máximo de Participantes por Grupo
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {formData.maxParticipants} participantes
        </Typography>
        <Slider
          value={formData.maxParticipants}
          onChange={(e, value) => handleInputChange('maxParticipants', value)}
          min={10}
          max={1024}
          step={1}
          marks={[
            { value: 50, label: '50' },
            { value: 256, label: '256' },
            { value: 512, label: '512' },
            { value: 1024, label: '1024' }
          ]}
          disabled={loading}
          sx={{ mt: 2 }}
        />
        <FormHelperText>
          Número máximo de participantes por grupo antes de criar um novo
        </FormHelperText>
      </Box>

      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Limiar para Criação (%): {formData.thresholdPercentage}%
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Criar novo grupo quando atingir esta porcentagem de ocupação
        </Typography>
        <Slider
          value={formData.thresholdPercentage}
          onChange={(e, value) => handleInputChange('thresholdPercentage', value)}
          min={50}
          max={99}
          step={1}
          marks={[
            { value: 50, label: '50%' },
            { value: 70, label: '70%' },
            { value: 85, label: '85%' },
            { value: 95, label: '95%' },
            { value: 99, label: '99%' }
          ]}
          disabled={loading}
          sx={{ mt: 2 }}
        />
        <FormHelperText>
          Com {formData.maxParticipants} participantes, novo grupo será criado aos {Math.round(formData.maxParticipants * formData.thresholdPercentage / 100)} participantes
        </FormHelperText>
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.autoCreateEnabled}
              onChange={(e) => handleInputChange('autoCreateEnabled', e.target.checked)}
              disabled={loading}
            />
          }
          label="Criação Automática Habilitada"
        />
        <FormHelperText>
          Se desabilitado, grupos precisarão ser criados manualmente
        </FormHelperText>
      </Box>

      {!isEditing && (
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.createFirstGroup}
                onChange={(e) => handleInputChange('createFirstGroup', e.target.checked)}
                disabled={loading}
              />
            }
            label="Criar Primeiro Grupo Imediatamente"
          />
          <FormHelperText>
            Se habilitado, o primeiro grupo da série será criado automaticamente
          </FormHelperText>
        </Box>
      )}

      {formData.autoCreateEnabled && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Como funciona:</strong><br />
            • Quando um grupo atingir {formData.thresholdPercentage}% de ocupação, um novo grupo será criado automaticamente<br />
            • O grupo anterior permanecerá ativo até atingir 100% de ocupação<br />
            • Novos participantes serão direcionados sempre para o grupo ativo com mais espaço
          </Typography>
        </Alert>
      )}
    </Box>
  );

  const modalActions = [
    {
      label: "Cancelar",
      onClick: handleClose,
      variant: "outlined",
      color: "secondary",
      disabled: loading,
      icon: <CancelIcon />
    },
    {
      label: loading ? "Salvando..." : isEditing ? "Atualizar Série" : "Criar Série",
      onClick: handleSave,
      variant: "contained",
      color: "primary",
      disabled: loading || loadingData,
      icon: loading ? <CircularProgress size={20} /> : <SaveIcon />
    }
  ];

  const tabsConfig = [
    {
      label: "Informações Básicas",
      icon: <GroupIcon />,
      content: renderBasicInfoTab()
    },
    {
      label: "Configurações",
      icon: <SettingsIcon />,
      content: renderConfigTab()
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <AutoIcon />
          {isEditing ? "Editar Série de Grupos" : "Nova Série de Grupos"}
        </Box>
      }
      actions={modalActions}
      loading={loading}
      maxWidth="md"
    >
      {loadingData ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : whatsappConnections.length === 0 ? (
        <Alert severity="warning">
          <Typography variant="body1" gutterBottom>
            Nenhuma conexão WhatsApp ativa encontrada
          </Typography>
          <Typography variant="body2">
            Para criar séries de grupos, você precisa ter pelo menos uma conexão WhatsApp conectada.
          </Typography>
        </Alert>
      ) : (
        <BaseResponsiveTabs
          tabs={tabsConfig}
          value={activeTab}
          onChange={handleTabChange}
          showTabsOnMobile={true}
        />
      )}
    </BaseModal>
  );
};

export default CreateGroupSeriesModal;