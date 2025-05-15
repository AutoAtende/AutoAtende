import React, { memo } from 'react';
import {
  Menu,
  MenuItem
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';

export const ExportMenu = memo(({ anchorEl, onClose, onExport }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem onClick={() => onExport('pdf')}>
        <PdfIcon sx={{ mr: 1 }} />
        Exportar PDF
      </MenuItem>
      <MenuItem onClick={() => onExport('excel')}>
        <ExcelIcon sx={{ mr: 1 }} />
        Exportar Excel
      </MenuItem>
    </Menu>
  );
});

export default ExportMenu;