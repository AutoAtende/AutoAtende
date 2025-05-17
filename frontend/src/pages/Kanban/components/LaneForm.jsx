import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from "@mui/material/styles";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { ColorLens } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';
import api from '../../../services/api';

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

const LaneForm = ({ lane, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db',
    position: 0,
    cardLimit: 0,
    queueId: ''
  });
  const [queues, setQueues] = useState([]);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (lane) {
      setFormData({
        name: lane.name || '',
        description: lane.description || '',
        color: lane.color || '#3498db',
        position: lane.position !== undefined ? lane.position : 0,
        cardLimit: lane.cardLimit || 0,
        queueId: lane.queueId || ''
      });
    }
  }, [lane]);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        setLoadingQueues(true);
        const { data } = await api.get('/queue');
        setQueues(data);
        setLoadingQueues(false);
      } catch (err) {
        console.error(err);
        setLoadingQueues(false);
      }
    };
    
    fetchQueues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleColorChange = (color) => {
    setFormData({
      ...formData,
      color: color
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };



  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            name="name"
            label="Nome da Coluna"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
          
          <TextField
            name="description"
            label="Descrição"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Cor da Coluna
            </Typography>
            <ColorSelector
              value={formData.color}
              onChange={handleColorChange}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="cardLimit"
            label="Limite de Cartões (0 = sem limite)"
            type="number"
            fullWidth
            value={formData.cardLimit}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Setor Associado (opcional)</InputLabel>
            <Select
              name="queueId"
              value={formData.queueId}
              onChange={handleChange}
              label="Setor Associado (opcional)"
              disabled={loadingQueues}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (lane ? 'Atualizar' : 'Adicionar')}
        </Button>
      </Box>
    </form>
  );
};

export default LaneForm;