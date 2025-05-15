// TaskBoardFilter.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Typography,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Autocomplete,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../../../context/Auth/AuthContext';
import { i18n } from '../../../../translate/i18n';
import api from '../../../../services/api';

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const FilterChipsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const TaskBoardFilter = ({ filters, onFilterChange, categories }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  // Carregar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users/list');
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Atualizar filtros quando houver mudanças
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters, onFilterChange]);

  // Manipuladores de filtros
  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      startDate: '',
      endDate: '',
      status: '',
      userId: '',
      categoryId: '',
      hasAttachments: false
    });
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = () => {
    return Object.values(localFilters).some(value => 
      value !== '' && value !== false && value !== undefined && value !== null
    );
  };

  return (
    <FilterContainer elevation={1}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {i18n.t('tasks.kanban.filters')}
        </Typography>
        {hasActiveFilters() && (
          <Tooltip title={i18n.t('tasks.kanban.clearFilters')}>
            <IconButton size="small" onClick={handleClearFilters}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={2}>
        {/* Pesquisa por texto */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            label={i18n.t('tasks.search')}
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </Grid>

        {/* Filtro por período */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label={i18n.t('tasks.startDate')}
            value={localFilters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label={i18n.t('tasks.endDate')}
            value={localFilters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Filtro por categoria */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>{i18n.t('tasks.category')}</InputLabel>
            <Select
              value={localFilters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              label={i18n.t('tasks.category')}
            >
              <MenuItem value="">
                <em>{i18n.t('tasks.allCategories')}</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filtro por responsável */}
        {user.profile !== 'user' && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{i18n.t('tasks.responsible')}</InputLabel>
              <Select
                value={localFilters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                label={i18n.t('tasks.responsible')}
              >
// TaskBoardFilter.jsx (continuação)
               <MenuItem value="">
                 <em>{i18n.t('tasks.allUsers')}</em>
               </MenuItem>
               {users.map((user) => (
                 <MenuItem key={user.id} value={user.id}>
                   {user.name}
                 </MenuItem>
               ))}
             </Select>
           </FormControl>
         </Grid>
       )}

       {/* Filtro por status */}
       <Grid item xs={12} sm={6} md={4}>
         <FormControl fullWidth size="small">
           <InputLabel>{i18n.t('tasks.status.title')}</InputLabel>
           <Select
             value={localFilters.status || ''}
             onChange={(e) => handleFilterChange('status', e.target.value)}
             label={i18n.t('tasks.status.title')}
           >
             <MenuItem value="">
               <em>{i18n.t('tasks.allStatuses')}</em>
             </MenuItem>
             <MenuItem value="pending">{i18n.t('tasks.status.pending')}</MenuItem>
             <MenuItem value="completed">{i18n.t('tasks.status.completed')}</MenuItem>
             <MenuItem value="overdue">{i18n.t('tasks.status.overdue')}</MenuItem>
           </Select>
         </FormControl>
       </Grid>
     </Grid>

     {/* Chips para filtros ativos */}
     {hasActiveFilters() && (
       <FilterChipsContainer>
         {localFilters.search && (
           <Chip
             label={`${i18n.t('tasks.search')}: ${localFilters.search}`}
             onDelete={() => handleFilterChange('search', '')}
             size="small"
           />
         )}

         {localFilters.startDate && (
           <Chip
             label={`${i18n.t('tasks.startDate')}: ${localFilters.startDate}`}
             onDelete={() => handleFilterChange('startDate', '')}
             size="small"
           />
         )}

         {localFilters.endDate && (
           <Chip
             label={`${i18n.t('tasks.endDate')}: ${localFilters.endDate}`}
             onDelete={() => handleFilterChange('endDate', '')}
             size="small"
           />
         )}

         {localFilters.categoryId && (
           <Chip
             label={`${i18n.t('tasks.category')}: ${
               categories.find((c) => c.id === localFilters.categoryId)?.name || ''
             }`}
             onDelete={() => handleFilterChange('categoryId', '')}
             size="small"
           />
         )}

         {localFilters.userId && (
           <Chip
             label={`${i18n.t('tasks.responsible')}: ${
               users.find((u) => u.id === localFilters.userId)?.name || ''
             }`}
             onDelete={() => handleFilterChange('userId', '')}
             size="small"
           />
         )}

         {localFilters.status && (
           <Chip
             label={`${i18n.t('tasks.status.title')}: ${i18n.t(`tasks.status.${localFilters.status}`)}`}
             onDelete={() => handleFilterChange('status', '')}
             size="small"
           />
         )}
       </FilterChipsContainer>
     )}
   </FilterContainer>
 );
};

export default TaskBoardFilter;