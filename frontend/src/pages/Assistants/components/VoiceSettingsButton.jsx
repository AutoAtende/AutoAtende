// VoiceSettingsButton.jsx
import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import VoiceSettingsModal from './VoiceSettingsModal';

const VoiceSettingsButton = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Tooltip title="Configurações de Voz">
        <IconButton
          color="primary"
          onClick={handleOpenModal}
          size="large"
        >
          <VolumeUpIcon />
        </IconButton>
      </Tooltip>

      <VoiceSettingsModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default VoiceSettingsButton;