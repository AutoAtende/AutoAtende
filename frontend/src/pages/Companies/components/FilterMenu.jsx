import React, { memo } from 'react';
import {
  Menu,
  MenuItem
} from '@mui/material';

export const FilterMenu = memo(({ 
  anchorEl, 
  onClose, 
  currentFilter, 
  onFilterChange 
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem 
        onClick={() => onFilterChange('all')}
        selected={currentFilter === 'all'}
      >
        Todos
      </MenuItem>
      <MenuItem 
        onClick={() => onFilterChange('active')}
        selected={currentFilter === 'active'}
      >
        Ativos
      </MenuItem>
      <MenuItem 
        onClick={() => onFilterChange('blocked')}
        selected={currentFilter === 'blocked'}
      >
        Bloqueados
      </MenuItem>
    </Menu>
  );
});

export default FilterMenu;