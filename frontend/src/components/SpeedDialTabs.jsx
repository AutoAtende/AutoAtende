import React, { useState } from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Box from '@mui/material/Box';

const SpeedDialTabs = ({ actions, onChange }) => {
  const [open, setOpen] = useState(false);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClick = (value) => {
    onChange(value);
    handleClose();
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 1000,
      '& .MuiSpeedDial-root': {
        position: 'absolute',
        bottom: 16,
        right: 16,
      }
    }}>
      <SpeedDial
        ariaLabel="Settings navigation"
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
        FabProps={{
          sx: {
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.value}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleClick(action.value)}
            FabProps={{
              sx: {
                bgcolor: 'background.paper',
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default SpeedDialTabs;