import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import { MicOff as MicOffIcon } from '@mui/icons-material';
import { i18n } from '../../translate/i18n';

const MicrophonePermissionModal = ({ open, onClose }) => {
  const handleOpenSettings = () => {
    // No Chrome, o usuário deve ir para chrome://settings/content/microphone
    // No Firefox, about:preferences#privacy
    // Como não podemos abrir essas URLs, instruímos o usuário
    alert(i18n.t('micPermission.openSettingsManually'));
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{i18n.t('micPermission.title')}</DialogTitle>
      <DialogContent>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          py={2}
        >
          <MicOffIcon 
            color="error" 
            style={{ fontSize: 60, marginBottom: 16 }} 
          />
          <Typography variant="body1" align="center" paragraph>
            {i18n.t('micPermission.description')}
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            {i18n.t('micPermission.instructions')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t('micPermission.cancel')}
        </Button>
        <Button onClick={handleOpenSettings} color="primary" variant="contained">
          {i18n.t('micPermission.openSettings')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MicrophonePermissionModal;