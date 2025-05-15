import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  Typography,
  Button,
  Autocomplete,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Collapse,
  Paper,
  Card,
  CardContent,
  Stack,
  styled,
  Badge
} from '@mui/material';
import { 
  FilterList,
  Search,
  ExpandMore,
  ExpandLess,
  CalendarMonth,
  Person,
  FormatListBulleted,
  LocalOffer,
  Domain,
  ClearAll,
  FilterAltOff
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";

// Componente estilizado para os chips de filtro
const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  '& .MuiChip-label': {
    fontWeight: 500,
  },
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}));

// Badge para indicar filtros ativos
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    fontSize: 12,
  },
}));

const FilterPanel = ({ filters, onFilterChange, users, queues }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(!isMobile);
  
  // Estado para opções de filtro
  const [tags, setTags] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Função para carregar tags e employers
  const loadFiltersData = async () => {
    try {
      // Carregar tags
      const { data: tagsData } = await api.get('/tags/list');
      setTags(tagsData || []);

      // Carregar employers
      const { data: employersResponse } = await api.get('/employers');
      setEmployers(employersResponse.employers || []);
    } catch (err) {
      console.error('Erro ao carregar tags:', err);
    }
  };
  
  // Carregar opções de filtro ao montar o componente
  useEffect(() => {
    loadFiltersData();
  }, []);
  
  // Função para lidar com mudanças nos filtros
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange(name, value);
  };
  
  // Função para lidar com mudanças nas datas
  const handleDateChange = (name, date) => {
    if (!date) return;
    
    // Converter para formato ISO e pegar apenas a data (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    onFilterChange(name, formattedDate);
  };
  
  // Função para lidar com mudanças em múltiplos valores (tags, filas)
  const handleMultiChange = (name, value) => {
    onFilterChange(name, value);
  };
  
  // Função para limpar filtros
  const handleClearFilters = () => {
    onFilterChange('userId', '');
    onFilterChange('queueIds', []);
    onFilterChange('tagIds', []);
    onFilterChange('status', '');
    onFilterChange('employerId', '');
    onFilterChange('searchParam', '');
  };
  
  // Opções de status
  const statusOptions = [
    { value: '', label: i18n.t('reports.filters.allStatus') },
    { value: 'open', label: i18n.t('reports.filters.statusOpen') },
    { value: 'pending', label: i18n.t('reports.filters.statusPending') },
    { value: 'closed', label: i18n.t('reports.filters.statusClosed') }
  ];

  // Calcular quantos filtros estão ativos
  useEffect(() => {
    let count = 0;
    if (filters.userId) count++;
    if (filters.queueIds && filters.queueIds.length > 0) count++;
    if (filters.tagIds && filters.tagIds.length > 0) count++;
    if (filters.status) count++;
    if (filters.employerId) count++;
    if (filters.searchParam) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Renderizar tags de filtros ativos para visualização rápida
  const renderActiveFiltersTags = () => {
    const activeTags = [];
    
    if (filters.userId) {
      const user = users.find(u => u.id === filters.userId);
      if (user) {
        activeTags.push(
          <FilterChip
            key="user"
            size="small"
            icon={<Person fontSize="small" />}
            label={user.name}
            color="primary"
            onDelete={() => onFilterChange('userId', '')}
          />
        );
      }
    }
    
    if (filters.status) {
      const statusColors = {
        open: 'success',
        pending: 'warning',
        closed: 'error'
      };
      
      const statusMap = {
        open: i18n.t('reports.filters.statusOpen'),
        pending: i18n.t('reports.filters.statusPending'),
        closed: i18n.t('reports.filters.statusClosed')
      };
      
      activeTags.push(
        <FilterChip
          key="status"
          size="small"
          label={statusMap[filters.status] || filters.status}
          color={statusColors[filters.status] || 'default'}
          onDelete={() => onFilterChange('status', '')}
        />
      );
    }
    
    if (filters.queueIds && filters.queueIds.length > 0) {
      if (filters.queueIds.length === 1) {
        const queue = queues.find(q => q.id === filters.queueIds[0]);
        if (queue) {
          activeTags.push(
            <FilterChip
              key="queue"
              size="small"
              icon={<FormatListBulleted fontSize="small" />}
              label={queue.name}
              style={{ backgroundColor: queue.color, color: '#fff' }}
              onDelete={() => onFilterChange('queueIds', [])}
            />
          );
        }
      } else {
        activeTags.push(
          <FilterChip
            key="queues"
            size="small"
            icon={<FormatListBulleted fontSize="small" />}
            label={`${filters.queueIds.length} ${i18n.t('reports.filters.queues')}`}
            color="primary"
            onDelete={() => onFilterChange('queueIds', [])}
          />
        );
      }
    }
    
    if (filters.tagIds && filters.tagIds.length > 0) {
      if (filters.tagIds.length === 1) {
        const tag = tags.find(t => t.id === filters.tagIds[0]);
        if (tag) {
          activeTags.push(
            <FilterChip
              key="tag"
              size="small"
              icon={<LocalOffer fontSize="small" />}
              label={tag.name}
              style={{ backgroundColor: tag.color, color: '#fff' }}
              onDelete={() => onFilterChange('tagIds', [])}
            />
          );
        }
      } else {
        activeTags.push(
          <FilterChip
            key="tags"
            size="small"
            icon={<LocalOffer fontSize="small" />}
            label={`${filters.tagIds.length} ${i18n.t('reports.filters.tags')}`}
            color="primary"
            onDelete={() => onFilterChange('tagIds', [])}
          />
        );
      }
    }
    
    if (filters.employerId) {
      const employer = employers.find(e => e.id === Number(filters.employerId));
      if (employer) {
        activeTags.push(
          <FilterChip
            key="employer"
            size="small"
            icon={<Domain fontSize="small" />}
            label={employer.name}
            color="primary"
            onDelete={() => onFilterChange('employerId', '')}
          />
        );
      }
    }
    
    if (filters.searchParam) {
      activeTags.push(
        <FilterChip
          key="search"
          size="small"
          icon={<Search fontSize="small" />}
          label={filters.searchParam}
          color="primary"
          onDelete={() => onFilterChange('searchParam', '')}
        />
      );
    }
    
    return activeTags;
  };
  
  return (
    <Card 
      elevation={3} 
      sx={{ 
        width: '100%', 
        overflow: 'visible',
        borderRadius: 2,
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            flexWrap: 'wrap'
          }}
        >
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: { xs: 1, sm: 0 }
            }}
          >
            <StyledBadge badgeContent={activeFiltersCount || null} color="primary">
              <FilterList sx={{ mr: 1, color: theme.palette.primary.main }} />
            </StyledBadge>
            {i18n.t('reports.filters.title')}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeFiltersCount > 0 && (
              <Tooltip title={i18n.t('reports.filters.clearFilters')}>
                <IconButton 
                  size="small"
                  color="primary"
                  onClick={handleClearFilters}
                  sx={{ 
                    backgroundColor: theme.palette.action.hover,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    }
                  }}
                >
                  <FilterAltOff fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title={expanded ? i18n.t('reports.filters.collapse') : i18n.t('reports.filters.expand')}>
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                color="primary"
                sx={{ 
                  backgroundColor: theme.palette.action.hover,
                  '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                  }
                }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Área de chips para filtros ativos */}
        {activeFiltersCount > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              mt: 1, 
              mb: expanded ? 2 : 0,
              mx: -0.5,
              py: 1
            }}
          >
            {renderActiveFiltersTags()}
          </Box>
        )}
        
        <Collapse in={expanded}>
          <Divider sx={{ mb: 3, mt: activeFiltersCount > 0 ? 0 : 2 }} />
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.text.secondary
                  }}
                >
                  <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
                  {i18n.t('reports.filters.period')}
                </Typography>
                <Grid container spacing={2}>
                  {/* Período de datas */}
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label={i18n.t('reports.filters.startDate')}
                      value={filters.startDate ? new Date(filters.startDate) : null}
                      onChange={(date) => handleDateChange('startDate', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="outlined"
                          size="small"
                          margin="dense"
                        />
                      )}
                      maxDate={new Date(filters.endDate)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label={i18n.t('reports.filters.endDate')}
                      value={filters.endDate ? new Date(filters.endDate) : null}
                      onChange={(date) => handleDateChange('endDate', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="outlined"
                          size="small"
                          margin="dense"
                        />
                      )}
                      minDate={new Date(filters.startDate)}
                      maxDate={new Date()}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.text.secondary
                  }}
                >
                  <FilterList fontSize="small" sx={{ mr: 1 }} />
                  {i18n.t('reports.filters.filterBy')}
                </Typography>
                <Grid container spacing={2}>
                  {/* Status */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" margin="dense">
                      <InputLabel>{i18n.t('reports.filters.status')}</InputLabel>
                      <Select
                        name="status"
                        value={filters.status || ''}
                        onChange={handleChange}
                        label={i18n.t('reports.filters.status')}
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Usuário */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" margin="dense">
                      <InputLabel>{i18n.t('reports.filters.user')}</InputLabel>
                      <Select
                        name="userId"
                        value={filters.userId || ''}
                        onChange={handleChange}
                        label={i18n.t('reports.filters.user')}
                      >
                        <MenuItem value="">{i18n.t('reports.filters.allUsers')}</MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Employer */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" margin="dense">
                      <InputLabel>{i18n.t('reports.filters.employer')}</InputLabel>
                      <Select
                        name="employerId"
                        value={filters.employerId || ''}
                        onChange={handleChange}
                        label={i18n.t('reports.filters.employer')}
                      >
                        <MenuItem value="">{i18n.t('reports.filters.allEmployers')}</MenuItem>
                        {employers.map((employer) => (
                          <MenuItem key={employer.id} value={employer.id}>
                            {employer.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Pesquisa por texto */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      margin="dense"
                      variant="outlined"
                      name="searchParam"
                      label={i18n.t('reports.filters.search')}
                      value={filters.searchParam || ''}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <Search color="action" sx={{ mr: 1, fontSize: 20 }} />,
                      }}
                    />
                  </Grid>
                
                  {/* Filas */}
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      multiple
                      options={queues}
                      getOptionLabel={(option) => option.name || ''}
                      value={queues.filter(queue => (filters.queueIds || []).includes(queue.id))}
                      onChange={(event, newValue) => {
                        handleMultiChange('queueIds', newValue.map(queue => queue.id));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          margin="dense"
                          variant="outlined"
                          label={i18n.t('reports.filters.queues')}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={option.id}
                            label={option.name}
                            {...getTagProps({ index })}
                            style={{ backgroundColor: option.color, color: '#fff' }}
                            size="small"
                          />
                        ))
                      }
                    />
                  </Grid>
                  
                  {/* Tags */}
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      multiple
                      options={tags}
                      getOptionLabel={(option) => option.name || ''}
                      value={tags.filter(tag => (filters.tagIds || []).includes(tag.id))}
                      onChange={(event, newValue) => {
                        handleMultiChange('tagIds', newValue.map(tag => tag.id));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          margin="dense"
                          variant="outlined"
                          label={i18n.t('reports.filters.tags')}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={option.id}
                            label={option.name}
                            {...getTagProps({ index })}
                            style={{ backgroundColor: option.color, color: '#fff' }}
                            size="small"
                          />
                        ))
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Botão limpar filtros */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearAll />}
                    onClick={handleClearFilters}
                    disabled={activeFiltersCount === 0}
                    sx={{
                      borderRadius: 4,
                      px: 3
                    }}
                  >
                    {i18n.t('reports.filters.clearFilters')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;