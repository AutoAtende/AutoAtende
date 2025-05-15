import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import AssistantsHelpModal from './AssistantsHelpModal';

const AssistantsHelpButton = () => {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const handleOpenHelpModal = () => {
    setHelpModalOpen(true);
  };

  const handleCloseHelpModal = () => {
    setHelpModalOpen(false);
  };

  return (
    <>
      <Tooltip title={i18n.t('assistants.buttons.help')} arrow>
        <IconButton
          color="primary"
          onClick={handleOpenHelpModal}
          size="large"
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>

      <AssistantsHelpModal 
        open={helpModalOpen} 
        onClose={handleCloseHelpModal} 
      />
    </>
  );
};

export default AssistantsHelpButton;