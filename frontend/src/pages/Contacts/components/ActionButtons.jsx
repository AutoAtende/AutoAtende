import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Menu,
  MenuItem,
  Stack,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as ImportIcon,
  CloudDownload as ExportIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

// Componente de Botão Responsivo seguindo padrão Standard
const ResponsiveActionButton = ({ 
  label, 
  icon, 
  onClick, 
  variant = "contained", 
  color = "primary",
  disabled = false,
  endIcon,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const button = (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      startIcon={!isXs ? icon : null}
      endIcon={!isXs ? endIcon : null}
      fullWidth={isXs}
      sx={{
        minHeight: isXs ? 44 : 40,
        borderRadius: isXs ? 12 : 8,
        fontWeight: 600,
        textTransform: 'none',
        ...(isXs && {
          minWidth: 44,
          padding: theme.spacing(1.5),
          '& .MuiButton-startIcon': {
            margin: 0
          }
        }),
        ...sx
      }}
      {...props}
    >
      {isXs ? icon : label}
    </Button>
  );

  return isXs ? (
    <Tooltip title={label} arrow placement="top">
      {button}
    </Tooltip>
  ) : button;
};

ResponsiveActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  endIcon: PropTypes.node,
  sx: PropTypes.object
};

export const ActionButtons = ({ onImport, onExport, onAdd, onDeleteAll }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [importExportMenuAnchor, setImportExportMenuAnchor] = useState(null);

  const handleAddMenuOpen = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleImportExportMenuOpen = (event) => {
    setImportExportMenuAnchor(event.currentTarget);
  };

  const handleImportExportMenuClose = () => {
    setImportExportMenuAnchor(null);
  };

  return (
    <Stack 
      direction={isXs ? "column" : "row"} 
      spacing={isXs ? 1 : 1.5}
      sx={{ width: isXs ? '100%' : 'auto' }}
    >
      {/* Botão Adicionar/Remover */}
      <ResponsiveActionButton
        label="Adicionar/Remover"
        icon={<AddIcon />}
        onClick={handleAddMenuOpen}
        endIcon={<ArrowDropDownIcon />}
        color="primary"
      />
      
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
        PaperProps={{
          sx: {
            borderRadius: isXs ? 3 : 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            onAdd();
            handleAddMenuClose();
          }}
          sx={{ 
            borderRadius: 1,
            mx: 1,
            my: 0.5,
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AddIcon sx={{ fontSize: '1.125rem' }} />
          Adicionar
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onDeleteAll();
            handleAddMenuClose();
          }}
          sx={{ 
            borderRadius: 1,
            mx: 1,
            my: 0.5,
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'error.main'
          }}
        >
          <DeleteIcon sx={{ fontSize: '1.125rem' }} />
          Excluir Todos
        </MenuItem>
      </Menu>

      {/* Botão Importar/Exportar */}
      <ResponsiveActionButton
        label="Importar/Exportar"
        icon={<ImportIcon />}
        onClick={handleImportExportMenuOpen}
        endIcon={<ArrowDropDownIcon />}
        color="primary"
        variant="outlined"
      />
      
      <Menu
        anchorEl={importExportMenuAnchor}
        open={Boolean(importExportMenuAnchor)}
        onClose={handleImportExportMenuClose}
        PaperProps={{
          sx: {
            borderRadius: isXs ? 3 : 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            onImport();
            handleImportExportMenuClose();
          }}
          sx={{ 
            borderRadius: 1,
            mx: 1,
            my: 0.5,
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <ImportIcon sx={{ fontSize: '1.125rem' }} />
          Importar
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onExport();
            handleImportExportMenuClose();
          }}
          sx={{ 
            borderRadius: 1,
            mx: 1,  
            my: 0.5,
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <ExportIcon sx={{ fontSize: '1.125rem' }} />
          Exportar
        </MenuItem>
      </Menu>
    </Stack>
  );
};

ActionButtons.propTypes = {
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired
};