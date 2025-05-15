import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Stack
} from '@mui/material';
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import DeleteForever from "@mui/icons-material/DeleteForeverOutlined";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export const ActionButtons = ({ onImport, onExport, onAdd, onDeleteAll }) => {
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
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddMenuOpen}
        endIcon={<ArrowDropDownIcon />}
        size="small"
      >
        Adicionar/Remover
      </Button>
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
      >
        <MenuItem onClick={() => {
          onAdd();
          handleAddMenuClose();
        }}>
          <AddBoxOutlinedIcon sx={{ mr: 1 }} />
          Adicionar
        </MenuItem>
        <MenuItem onClick={() => {
          onDeleteAll();
          handleAddMenuClose();
        }}>
          <DeleteForever sx={{ mr: 1 }} />
          Excluir Todos
        </MenuItem>
      </Menu>

      <Button
        variant="contained"
        color="primary"
        onClick={handleImportExportMenuOpen}
        endIcon={<ArrowDropDownIcon />}
        size="small"
      >
        Importar/Exportar
      </Button>
      <Menu
        anchorEl={importExportMenuAnchor}
        open={Boolean(importExportMenuAnchor)}
        onClose={handleImportExportMenuClose}
      >
        <MenuItem onClick={() => {
          onImport();
          handleImportExportMenuClose();
        }}>
          <CloudUploadIcon sx={{ mr: 1 }} />
          Importar
        </MenuItem>
        <MenuItem onClick={() => {
          onExport();
          handleImportExportMenuClose();
        }}>
          <CloudDownloadIcon sx={{ mr: 1 }} />
          Exportar
        </MenuItem>
      </Menu>
    </Stack>
  );
};