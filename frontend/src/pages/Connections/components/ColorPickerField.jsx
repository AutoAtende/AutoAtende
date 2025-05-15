// ColorPickerField.jsx - Versão corrigida para MUI v5
import React from 'react';
import { Box, Typography } from '@mui/material';

const ColorPickerField = ({ field, form }) => {
  // Valor padrão caso o field.value seja undefined, null ou inválido
  const defaultColor = "#7367F0"; 
  
  // Validar se o valor atual é uma cor hexadecimal válida
  const isValidHexColor = (color) => {
    return typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };
  
  // Usar o valor atual se for válido, caso contrário usar o padrão
  const currentColor = isValidHexColor(field.value) ? field.value : defaultColor;

  const handleColorChange = (e) => {
    const colorValue = e.target.value;
    // Validar se é uma cor hexadecimal válida antes de atualizar
    if (isValidHexColor(colorValue)) {
      form.setFieldValue(field.name, colorValue);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2">{field.label || "Cor"}</Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <input
          type="color"
          id={field.name}
          name={field.name}
          value={currentColor}
          onChange={handleColorChange}
          style={{ width: '50px', height: '50px', padding: 0, border: 'none' }}
        />
        <input
          type="text"
          value={currentColor}
          onChange={handleColorChange}
          style={{ marginLeft: '10px' }}
        />
      </Box>
    </Box>
  );
};

export default ColorPickerField;