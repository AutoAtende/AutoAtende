import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  FormControlLabel,
  Paper,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  FilterAltOff as FilterAltOffIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { AuthContext } from "../../../context/Auth/AuthContext";
import { toast } from "../../../helpers/toast";

const StyledFilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  '& .MuiAutocomplete-root': {
    width: '100%'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
  },
}));

const StyledChip = styled(Chip)(({ theme, chipcolor }) => ({
  backgroundColor: chipcolor || theme.palette.grey[300],
  color: chipcolor ? theme.palette.getContrastText(chipcolor) : theme.palette.text.primary,
  textShadow: chipcolor ? '1px 1px 1px rgba(0, 0, 0, 0.3)' : 'none',
  '&.MuiChip-outlined': {
    borderColor: 'transparent'
  },
  margin: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    height: '24px',
  },
}));

const TaskFilters = ({ filters, onFilterChange, loading, onApplyFilters, categories }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [searchText, setSearchText] = useState(filters?.search || '');
  const [filtersChanged, setFiltersChanged] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [employers, setEmployers] = useState([]);
  const [expanded, setExpanded] = useState(true); // Controla o accordion em telas pequenas

  // Carregar usuários
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const { data } = await api.get('/users/list');
      const usersArray = Array.isArray(data) ? data : [];
      const filteredUsers = usersArray.filter(user => user && typeof user === 'object').map(user => ({
        id: user.id,
        name: user.name,
        profile: user.profile
      }));

      setUsers(filteredUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(i18n.t("tasks.filters.loadError") || 'Erro ao carregar dados de filtro');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Carregar empresas
  const loadEmployers = useCallback(async () => {
    try {
      const response = await api.get('/employers/list');
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setEmployers(response.data);
        } else if (response.data.employers && Array.isArray(response.data.employers)) {
          setEmployers(response.data.employers);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  }, []);

  // Efeito para carregar usuários e empresas na montagem
  useEffect(() => {
    loadUsers();
    loadEmployers();
  }, [loadUsers, loadEmployers]);

  // Atualizar o estado local quando os filtros externos mudarem
  useEffect(() => {
    // Compara apenas se ambos são objetos reais
    if (filters && typeof filters === 'object') {
      const filtersStr = JSON.stringify(filters);
      const localFiltersStr = JSON.stringify(localFilters);
      
      if (filtersStr !== localFiltersStr) {
        setLocalFilters({...filters});
        setSearchText(filters.search || '');
        setFiltersChanged(false);
      }
    }
  }, [filters]);
  
  // Função que será chamada apenas quando o usuário explicitamente
  // aplicar os filtros clicando no botão
  const applyFilters = useCallback(() => {
    if (filtersChanged && typeof onFilterChange === 'function') {
      onFilterChange(localFilters);
      if (typeof onApplyFilters === 'function') {
        onApplyFilters();
      }
      setFiltersChanged(false);
    }
  }, [localFilters, onFilterChange, onApplyFilters, filtersChanged]);

  const handleFilterChange = useCallback((field, value) => {
    if (!field) return;
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setFiltersChanged(true);
  }, []);

  const handleSearchChange = useCallback((event) => {
    if (!event || !event.target) return;
    
    const value = event.target.value;
    setSearchText(value);
    handleFilterChange('search', value);
  }, [handleFilterChange]);

  const handleUserChange = useCallback((event) => {
    if (!event || !event.target) return;
    handleFilterChange('userId', event.target.value);
  }, [handleFilterChange]);

  const handleStatusChange = useCallback((event) => {
    if (!event || !event.target) return;
    handleFilterChange('status', event.target.value);
  }, [handleFilterChange]);

  const handleCategoryChange = useCallback((event) => {
    if (!event || !event.target) return;
    handleFilterChange('categoryId', event.target.value);
  }, [handleFilterChange]);

  const handleEmployerChange = useCallback((event) => {
    if (!event || !event.target) return;
    handleFilterChange('employerId', event.target.value);
  }, [handleFilterChange]);

  const handleDateChange = useCallback((field) => (event) => {
    if (!event || !event.target) return;
    handleFilterChange(field, event.target.value);
  }, [handleFilterChange]);

  const handleAttachmentsChange = useCallback((event) => {
    if (!event || !event.target) return;
    handleFilterChange('hasAttachments', event.target.checked);
  }, [handleFilterChange]);

  const handleChargeStatusChange = useCallback((event) => {
    if (!event || !event.target) return;
    handleFilterChange('chargeStatus', event.target.value);
  }, [handleFilterChange]);

  const handleRecurrentChange = useCallback((event) => {
    if (!event || !event.target) return;
    handleFilterChange('isRecurrent', event.target.checked);
  }, [handleFilterChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      startDate: '',
      endDate: '',
      status: '',
      userId: '',
      categoryId: '',
      hasAttachments: false,
      chargeStatus: '',
      isRecurrent: false,
      employerId: ''
    };
    setLocalFilters(clearedFilters);
    setSearchText('');
    
    if (typeof onFilterChange === 'function') {
      onFilterChange(clearedFilters);
      if (typeof onApplyFilters === 'function') {
        setTimeout(onApplyFilters, 100);
      }
    }
    
    setFiltersChanged(false);
  }, [onFilterChange, onApplyFilters]);

  // Verificar se há filtros ativos
  const hasActiveFilters = useCallback(() => {
    if (!localFilters) return false;
    
    return Object.values(localFilters).some(value =>
      value !== '' && value !== false && value !== undefined && value !== null
    );
  }, [localFilters]);

  const handleRetry = useCallback(() => {
    loadUsers();
    loadEmployers();
  }, [loadUsers, loadEmployers]);

  // Alternar o estado do accordion
  const toggleAccordion = () => {
    setExpanded(!expanded);
  };

  if (error) {
    return (
      <Paper elevation={2}>
        <Box p={2}>
          <Alert
            severity="error"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleRetry}
              >
                <RefreshIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Box>
      </Paper>
    );
  }

  // Renderizar como accordion em telas pequenas
  if (isMobile) {
    return (
      <Paper elevation={2} sx={{ mb: 2 }}>
        <Accordion expanded={expanded} onChange={toggleAccordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="filter-panel-content"
            id="filter-panel-header"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <FilterListIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                {i18n.t('tasks.filters.title') || 'Filtros'}
                {hasActiveFilters() && (
                  <Chip
                    size="small"
                    label={i18n.t('tasks.filters.active') || 'Ativos'}
                    color="primary"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Typography>
              {hasActiveFilters() && (
                <Tooltip title={i18n.t('buttons.clearFilters') || 'Limpar Filtros'}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                  >
                    <FilterAltOffIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <StyledFilterContainer>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label={i18n.t('tasks.startDate') || 'Data Inicial'}
                      value={localFilters.startDate || ''}
                      onChange={handleDateChange('startDate')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label={i18n.t('tasks.endDate') || 'Data Final'}
                      value={localFilters.endDate || ''}
                      onChange={handleDateChange('endDate')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{i18n.t("tasks.employer") || 'Empresa'}</InputLabel>
                      <Select
                        value={localFilters.employerId || ''}
                        onChange={handleEmployerChange}
                        label={i18n.t("tasks.employer") || 'Empresa'}
                        disabled={loading}
                      >
                        <MenuItem value="">
                          <em>{i18n.t("tasks.allEmployers") || 'Todas'}</em>
                        </MenuItem>
                        {Array.isArray(employers) && employers.map((employer) => (
                          employer && employer.id ? (
                            <MenuItem key={employer.id} value={employer.id}>
                              {employer.name}
                            </MenuItem>
                          ) : null
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{i18n.t("tasks.responsible") || 'Responsável'}</InputLabel>
                      <Select
                        value={localFilters.userId || ''}
                        onChange={handleUserChange}
                        label={i18n.t("tasks.responsible") || 'Responsável'}
                        disabled={loadingUsers}
                      >
                        <MenuItem value="">
                          <em>{i18n.t("tasks.allUsers") || 'Todos'}</em>
                        </MenuItem>
                        {Array.isArray(users) && users.map((user) => (
                          user && user.id ? (
                            <MenuItem key={user.id} value={user.id}>
                              {`${user.name}${user.profile === 'admin' ? ' (Admin)' :
                                user.profile === 'superv' ? ' (Supervisor)' : ''}`}
                            </MenuItem>
                          ) : null
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{i18n.t("tasks.category") || 'Categoria'}</InputLabel>
                      <Select
                        value={localFilters.categoryId || ''}
                        onChange={handleCategoryChange}
                        label={i18n.t("tasks.category") || 'Categoria'}
                        disabled={loading}
                      >
                        <MenuItem value="">
                          <em>{i18n.t("tasks.allCategories") || 'Todas'}</em>
                        </MenuItem>
                        {Array.isArray(categories) && categories.map((category) => (
                          category && category.id ? (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ) : null
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{i18n.t('tasks.status.title') || 'Status'}</InputLabel>
                      <Select
                        value={localFilters.status || ''}
                        onChange={handleStatusChange}
                        label={i18n.t('tasks.status.title') || 'Status'}
                      >
                        <MenuItem value="">
                          <em>{i18n.t('tasks.allStatuses') || 'Todos'}</em>
                        </MenuItem>
                        <MenuItem value="true">{i18n.t('tasks.status.completed') || 'Concluída'}</MenuItem>
                        <MenuItem value="false">{i18n.t('tasks.status.pending') || 'Pendente'}</MenuItem>
                        <MenuItem value="inProgress">{i18n.t('tasks.status.inProgress') || 'Em Progresso'}</MenuItem>
                        <MenuItem value="overdue">{i18n.t('tasks.status.overdue') || 'Atrasada'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{i18n.t('tasks.filters.charges') || 'Cobranças'}</InputLabel>
                      <Select
                        value={localFilters.chargeStatus || ''}
                        onChange={handleChargeStatusChange}
                        label={i18n.t('tasks.filters.charges') || 'Cobranças'}
                      >
                        <MenuItem value="">
                          <em>{i18n.t('tasks.allOptions') || 'Todas'}</em>
                        </MenuItem>
                        <MenuItem value="with">
                          {i18n.t('tasks.filters.withCharges') || 'Com Cobranças'}
                        </MenuItem>
                        <MenuItem value="paid">
                          {i18n.t('tasks.filters.paid') || 'Pagas'}
                        </MenuItem>
                        <MenuItem value="pending">
                          {i18n.t('tasks.filters.pending') || 'Pendentes'}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={localFilters.hasAttachments || false}
                          onChange={handleAttachmentsChange}
                          size="small"
                        />
                      }
                      label={i18n.t('tasks.filters.hasAttachments') || 'Apenas com anexos'}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={localFilters.isRecurrent || false}
                          onChange={handleRecurrentChange}
                          size="small"
                        />
                      }
                      label={i18n.t('tasks.filters.recurrent') || 'Somente tarefas recorrentes'}
                    />
                  </Grid>

                  {/* Botões de ação */}
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={applyFilters}
                      disabled={!filtersChanged}
                      startIcon={<FilterListIcon />}
                      fullWidth
                    >
                      {i18n.t('buttons.applyFilters') || 'Aplicar Filtros'}
                    </Button>
                  </Grid>
                  
                  {hasActiveFilters() && (
                    <Grid item xs={12}>
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        onClick={clearFilters}
                        startIcon={<ClearIcon />}
                        fullWidth
                      >
                        {i18n.t('buttons.clearFilters') || 'Limpar Filtros'}
                      </Button>
                    </Grid>
                  )}
                </Grid>

                {/* Chips de filtros ativos */}
                {hasActiveFilters() && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5, 
                    mt: 2,
                    maxHeight: '120px',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.divider,
                      borderRadius: '4px',
                    },
                  }}>
                    {/* Renderizar chips para filtros ativos */}
                    {/* Os chips são os mesmos do layout para desktop */}
                  </Box>
                )}
</StyledFilterContainer>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ mb: 2 }}>
      <Box p={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <StyledFilterContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterListIcon color="primary" />
              <Typography variant="subtitle1" sx={{ flex: 1 }}>
                {i18n.t('tasks.filters.title') || 'Filtros'}
              </Typography>
              {hasActiveFilters() && (
                <Tooltip title={i18n.t('buttons.clearFilters') || 'Limpar Filtros'}>
                  <IconButton size="small" onClick={clearFilters}>
                    <FilterAltOffIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={i18n.t('tasks.startDate') || 'Data Inicial'}
                  value={localFilters.startDate || ''}
                  onChange={handleDateChange('startDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={i18n.t('tasks.endDate') || 'Data Final'}
                  value={localFilters.endDate || ''}
                  onChange={handleDateChange('endDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{i18n.t("tasks.employer") || 'Empresa'}</InputLabel>
                  <Select
                    value={localFilters.employerId || ''}
                    onChange={handleEmployerChange}
                    label={i18n.t("tasks.employer") || 'Empresa'}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>{i18n.t("tasks.allEmployers") || 'Todas'}</em>
                    </MenuItem>
                    {Array.isArray(employers) && employers.map((employer) => (
                      employer && employer.id ? (
                        <MenuItem key={employer.id} value={employer.id}>
                          {employer.name}
                        </MenuItem>
                      ) : null
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{i18n.t("tasks.responsible") || 'Responsável'}</InputLabel>
                  <Select
                    value={localFilters.userId || ''}
                    onChange={handleUserChange}
                    label={i18n.t("tasks.responsible") || 'Responsável'}
                    disabled={loadingUsers}
                  >
                    <MenuItem value="">
                      <em>{i18n.t("tasks.allUsers") || 'Todos'}</em>
                    </MenuItem>
                    {Array.isArray(users) && users.map((user) => (
                      user && user.id ? (
                        <MenuItem key={user.id} value={user.id}>
                          {`${user.name}${user.profile === 'admin' ? ' (Admin)' :
                            user.profile === 'superv' ? ' (Supervisor)' : ''}`}
                        </MenuItem>
                      ) : null
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{i18n.t("tasks.category") || 'Categoria'}</InputLabel>
                  <Select
                    value={localFilters.categoryId || ''}
                    onChange={handleCategoryChange}
                    label={i18n.t("tasks.category") || 'Categoria'}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>{i18n.t("tasks.allCategories") || 'Todas'}</em>
                    </MenuItem>
                    {Array.isArray(categories) && categories.map((category) => (
                      category && category.id ? (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ) : null
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{i18n.t('tasks.status.title') || 'Status'}</InputLabel>
                  <Select
                    value={localFilters.status || ''}
                    onChange={handleStatusChange}
                    label={i18n.t('tasks.status.title') || 'Status'}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.allStatuses') || 'Todos'}</em>
                    </MenuItem>
                    <MenuItem value="true">{i18n.t('tasks.status.completed') || 'Concluída'}</MenuItem>
                    <MenuItem value="false">{i18n.t('tasks.status.pending') || 'Pendente'}</MenuItem>
                    <MenuItem value="inProgress">{i18n.t('tasks.status.inProgress') || 'Em Progresso'}</MenuItem>
                    <MenuItem value="overdue">{i18n.t('tasks.status.overdue') || 'Atrasada'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{i18n.t('tasks.filters.charges') || 'Cobranças'}</InputLabel>
                  <Select
                    value={localFilters.chargeStatus || ''}
                    onChange={handleChargeStatusChange}
                    label={i18n.t('tasks.filters.charges') || 'Cobranças'}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.allOptions') || 'Todas'}</em>
                    </MenuItem>
                    <MenuItem value="with">
                      {i18n.t('tasks.filters.withCharges') || 'Com Cobranças'}
                    </MenuItem>
                    <MenuItem value="paid">
                      {i18n.t('tasks.filters.paid') || 'Pagas'}
                    </MenuItem>
                    <MenuItem value="pending">
                      {i18n.t('tasks.filters.pending') || 'Pendentes'}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localFilters.hasAttachments || false}
                      onChange={handleAttachmentsChange}
                      size="small"
                    />
                  }
                  label={i18n.t('tasks.filters.hasAttachments') || 'Apenas com anexos'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localFilters.isRecurrent || false}
                      onChange={handleRecurrentChange}
                      size="small"
                    />
                  }
                  label={i18n.t('tasks.filters.recurrent') || 'Somente tarefas recorrentes'}
                />
              </Grid>
            </Grid>

            {/* Botão de aplicar filtros */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={applyFilters}
                disabled={!filtersChanged}
                startIcon={<FilterListIcon />}
              >
                {i18n.t('buttons.applyFilters') || 'Aplicar Filtros'}
              </Button>
            </Box>

            {hasActiveFilters() && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {localFilters.startDate && (
                  <StyledChip
                    label={`${i18n.t('tasks.from') || 'De'}: ${localFilters.startDate}`}
                    onDelete={() => handleFilterChange('startDate', '')}
                    size="small"
                  />
                )}

                {localFilters.endDate && (
                  <StyledChip
                    label={`${i18n.t('tasks.to') || 'Até'}: ${localFilters.endDate}`}
                    onDelete={() => handleFilterChange('endDate', '')}
                    size="small"
                  />
                )}

                {localFilters.status && (
                  <StyledChip
                    label={
                      localFilters.status === 'true' 
                        ? i18n.t('tasks.status.completed') || 'Concluída'
                        : localFilters.status === 'false'
                          ? i18n.t('tasks.status.pending') || 'Pendente'
                          : localFilters.status === 'inProgress'
                            ? i18n.t('tasks.status.inProgress') || 'Em Progresso'
                            : i18n.t('tasks.status.overdue') || 'Atrasada'
                    }
                    onDelete={() => handleFilterChange('status', '')}
                    size="small"
                  />
                )}

                {localFilters.userId && (
                  <StyledChip
                    label={Array.isArray(users) && users.find(u => u && u.id === localFilters.userId)?.name || ''}
                    onDelete={() => handleFilterChange('userId', '')}
                    size="small"
                  />
                )}

                {localFilters.categoryId && (
                  <StyledChip
                    label={Array.isArray(categories) && categories.find(c => c && c.id === localFilters.categoryId)?.name || ''}
                    onDelete={() => handleFilterChange('categoryId', '')}
                    size="small"
                  />
                )}

                {localFilters.employerId && (
                  <StyledChip
                    label={`${i18n.t('tasks.employer') || 'Empresa'}: ${
                      Array.isArray(employers) && employers.find(e => e && e.id === localFilters.employerId)?.name || ''
                    }`}
                    onDelete={() => handleFilterChange('employerId', '')}
                    size="small"
                  />
                )}

                {localFilters.hasAttachments && (
                  <StyledChip
                    label={i18n.t('tasks.withAttachments') || 'Com anexos'}
                    onDelete={() => handleFilterChange('hasAttachments', false)}
                    size="small"
                  />
                )}

                {localFilters.chargeStatus && (
                  <StyledChip
                    label={
                      localFilters.chargeStatus === 'with'
                        ? i18n.t('tasks.filters.withCharges') || 'Com Cobranças'
                        : localFilters.chargeStatus === 'paid'
                          ? i18n.t('tasks.filters.paid') || 'Pagas'
                          : i18n.t('tasks.filters.pending') || 'Pendentes'
                    }
                    onDelete={() => handleFilterChange('chargeStatus', '')}
                    size="small"
                  />
                )}

                {localFilters.isRecurrent && (
                  <StyledChip
                    label={i18n.t('tasks.filters.recurrent') || 'Tarefas recorrentes'}
                    onDelete={() => handleFilterChange('isRecurrent', false)}
                    size="small"
                  />
                )}
              </Box>
            )}
          </StyledFilterContainer>
        )}
      </Box>
    </Paper>
  );
};

export default TaskFilters;