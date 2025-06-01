import React from 'react';
import { alpha, useTheme } from "@mui/material/styles";
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Typography
} from '@mui/material';

const BoardSelector = ({ boards, selectedBoardId, onChange }) => {
  const theme = useTheme();

  if (boards.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhum quadro disponível
      </Typography>
    );
  }

  return (
    <FormControl sx={{ minWidth: 220 }}>
      <InputLabel id="board-selector-label">Selecionar Quadro</InputLabel>
      <Select
        labelId="board-selector-label"
        id="board-selector"
        value={selectedBoardId || ''}
        label="Selecionar Quadro"
        onChange={(e) => onChange(e.target.value)}
      >
        {boards.map((board) => (
          <MenuItem key={board.id} value={board.id}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%',
                  bgcolor: board.color || theme.palette.primary.main,
                  mr: 1 
                }} 
              />
              {board.name}
              {board.isDefault && (
                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  (Padrão)
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default BoardSelector;