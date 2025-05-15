import React, { memo } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';

export const HeaderButtons = memo(({ 
  isMobile,
  onSearch, 
  onFilterClick, 
  onExportClick, 
  onNewCompany 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: 1,
        width: isMobile ? '100%' : 'auto'
      }}
    >
      <TextField
        placeholder="Buscar empresas..."
        onChange={(e) => onSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        size="small"
        fullWidth={isMobile}
      />

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          width: isMobile ? '100%' : 'auto'
        }}
      >
        <Button
          variant="outlined"
          onClick={onFilterClick}
          startIcon={<FilterIcon />}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          Filtros
        </Button>

        <Button
          variant="outlined"
          onClick={onExportClick}
          startIcon={<ExportIcon />}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          Exportar
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onNewCompany}
          startIcon={<AddIcon />}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          Nova Empresa
        </Button>
      </Box>
    </Box>
  );
});

export default HeaderButtons;