import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import { alpha, useTheme } from "@mui/material/styles";

const ColorSelector = ({ value, onChange }) => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39', 
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
      {colors.map((color) => (
        <Box
          key={color}
          onClick={() => onChange(color)}
          sx={{
            width: 30,
            height: 30,
            bgcolor: color,
            border: value === color ? '2px solid black' : '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        />
      ))}
    </Box>
  );
};

const BoardSettingsModal = ({ board, onSave, onDelete, loading = false }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: theme.palette.primary.main,
    isDefault: false,
    defaultView: 'kanban',
    active: true
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (board) {
      setFormData({
        name: board.name || '',
        description: board.description || '',
        color: board.color || theme.palette.primary.main,
        isDefault: !!board.isDefault,
        defaultView: board.defaultView || 'kanban',
        active: board.active !== undefined ? board.active : true
      });
    } else {
      // Reset form for new board
      setFormData({
        name: '',
        description: '',
        color: theme.palette.primary.main,
        isDefault: false,
        defaultView: 'kanban',
        active: true
      });
    }
  }, [board, theme.palette.primary.main]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prevData => ({
      ...prevData,
      color
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    if (onDelete) {
      onDelete();
    }
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="name"
              label="Nome do Quadro"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
            
            <TextField
              name="description"
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
            
            <FormControl fullWidth margin="normal" disabled={loading}>
              <InputLabel>Visualização Padrão</InputLabel>
              <Select
                name="defaultView"
                value={formData.defaultView}
                onChange={handleChange}
                label="Visualização Padrão"
              >
                <MenuItem value="kanban">Kanban</MenuItem>
                <MenuItem value="list">Lista</MenuItem>
                <MenuItem value="calendar">Calendário</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cor do Quadro
              </Typography>
              <ColorSelector
                value={formData.color}
                onChange={handleColorChange}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  disabled={loading}
                />
              }
              label="Definir como quadro padrão"
              sx={{ mt: 2, display: 'block' }}
            />
            
            {board && (
              <FormControlLabel
                control={
                  <Switch
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    disabled={loading}
                  />
                }
                label="Ativo"
                sx={{ mt: 1, display: 'block' }}
              />
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formData.name.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Salvando...' : (board && board.id ? 'Atualizar' : 'Criar')}
          </Button>
        </Box>
      </form>
      
      {board && onDelete && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="error">
              Zona de Perigo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A exclusão do quadro removerá todas as colunas e cartões associados. Esta ação não pode ser desfeita.
            </Typography>
            
            {!confirmDelete ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteClick}
                disabled={loading}
              >
                Excluir Quadro
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteClick}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                  {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelDelete}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default BoardSettingsModal;