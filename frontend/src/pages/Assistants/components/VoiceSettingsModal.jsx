// VoiceSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Slider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Mic as MicIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import { i18n } from '../../../translate/i18n';

const PREFIX = 'VoiceSettingsModal';

const classes = {
  slider: `${PREFIX}-slider`,
  formItem: `${PREFIX}-formItem`
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.formItem}`]: {
    marginBottom: theme.spacing(3)
  }
}));

const VoiceSettingsModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState({
    voiceId: 'nova',
    speed: 1.0,
    enableVoiceResponses: true,
    enableVoiceTranscription: true
  });
  
// VoiceSettingsModal.jsx (continuação)
const voiceOptions = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' }
];

useEffect(() => {
  if (open) {
    fetchVoiceConfig();
  }
}, [open]);

const fetchVoiceConfig = async () => {
  try {
    setLoading(true);
    const { data } = await api.get('/voice/config');
    setVoiceConfig(data);
  } catch (error) {
    console.error('Erro ao carregar configurações de voz:', error);
    toast.error(i18n.t('voiceSettings.toasts.loadError'));
  } finally {
    setLoading(false);
  }
};

const handleChange = (e) => {
  const { name, value, checked } = e.target;
  const newValue = e.target.type === 'checkbox' ? checked : value;
  
  setVoiceConfig(prev => ({
    ...prev,
    [name]: newValue
  }));
};

const handleSliderChange = (name) => (_, value) => {
  setVoiceConfig(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSave = async () => {
  try {
    setSaving(true);
    await api.put('/voice/config', voiceConfig);
    toast.success(i18n.t('voiceSettings.toasts.saveSuccess'));
    onClose();
  } catch (error) {
    console.error('Erro ao salvar configurações de voz:', error);
    toast.error(i18n.t('voiceSettings.toasts.saveError'));
  } finally {
    setSaving(false);
  }
};

if (loading) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

return (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{i18n.t('voiceSettings.title')}</DialogTitle>
    <DialogContent dividers>
      <StyledBox className={classes.formItem}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {i18n.t('voiceSettings.configInfo')}
        </Alert>
      </StyledBox>
      
      <StyledBox className={classes.formItem}>
        <Typography variant="subtitle1" gutterBottom>
          <MicIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {i18n.t('voiceSettings.transcriptionSection')}
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={voiceConfig.enableVoiceTranscription}
              onChange={handleChange}
              name="enableVoiceTranscription"
              color="primary"
            />
          }
          label={i18n.t('voiceSettings.enableTranscription')}
        />
        <Typography variant="caption" color="textSecondary" display="block">
          {i18n.t('voiceSettings.transcriptionHelp')}
        </Typography>
      </StyledBox>
      
      <StyledBox className={classes.formItem}>
        <Typography variant="subtitle1" gutterBottom>
          <VolumeUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {i18n.t('voiceSettings.responsesSection')}
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={voiceConfig.enableVoiceResponses}
              onChange={handleChange}
              name="enableVoiceResponses"
              color="primary"
            />
          }
          label={i18n.t('voiceSettings.enableResponses')}
        />
        <Typography variant="caption" color="textSecondary" display="block">
          {i18n.t('voiceSettings.responsesHelp')}
        </Typography>
      </StyledBox>
      
      {voiceConfig.enableVoiceResponses && (
        <>
          <StyledBox className={classes.formItem}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{i18n.t('voiceSettings.voice')}</InputLabel>
              <Select
                value={voiceConfig.voiceId}
                onChange={handleChange}
                name="voiceId"
                label={i18n.t('voiceSettings.voice')}
              >
                {voiceOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </StyledBox>
          
          <StyledBox className={classes.formItem}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.t('voiceSettings.speed')}: {voiceConfig.speed.toFixed(1)}x
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="caption">0.5x</Typography>
              <Slider
                value={voiceConfig.speed}
                min={0.5}
                max={2.0}
                step={0.1}
                onChange={handleSliderChange('speed')}
                sx={{ mx: 2 }}
              />
              <Typography variant="caption">2.0x</Typography>
            </Box>
          </StyledBox>
        </>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="secondary">
        {i18n.t('voiceSettings.buttons.cancel')}
      </Button>
      <Button
        onClick={handleSave}
        color="primary"
        variant="contained"
        disabled={saving}
        startIcon={saving ? <CircularProgress size={20} /> : null}
      >
        {saving ? i18n.t('voiceSettings.buttons.saving') : i18n.t('voiceSettings.buttons.save')}
      </Button>
    </DialogActions>
  </Dialog>
);
};

export default VoiceSettingsModal;