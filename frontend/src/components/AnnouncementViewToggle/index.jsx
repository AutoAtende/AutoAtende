import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const AnnouncementViewToggle = ({ view, onViewChange }) => {
  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={(e, newView) => newView && onViewChange(newView)}
      aria-label="view mode"
      size="small"
      className="bg-white rounded-lg shadow-sm"
    >
      <ToggleButton value="list" aria-label="list view">
        <Tooltip title="List View">
          <ViewListIcon />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="card" aria-label="card view">
        <Tooltip title="Card View">
          <ViewModuleIcon />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default AnnouncementViewToggle;