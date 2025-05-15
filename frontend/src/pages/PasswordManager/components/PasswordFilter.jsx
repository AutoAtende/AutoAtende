import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Autocomplete,
  TextField,
  InputAdornment,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  GetApp as ExportIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useEmployers } from '../../../hooks/useEmployers';
import { useTags } from '../../../hooks/useTags';

const PasswordFilter = ({
  selectedEmployer,
  selectedTag,
  onEmployerChange,
  onTagChange,
  onExport,
  isLoading
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [employerSearch, setEmployerSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [localSelectedEmployer, setLocalSelectedEmployer] = useState(null);
  const [localSelectedTag, setLocalSelectedTag] = useState(null);

  const { 
    data: employersData, 
    isLoading: isLoadingEmployers 
  } = useEmployers(employerSearch);

  const { 
    data: tagsData, 
    isLoading: isLoadingTags 
  } = useTags(tagSearch);

  // Garante que employers e tags sejam arrays válidos
  const employers = Array.isArray(employersData?.employers) ? employersData.employers.filter(Boolean) : [];
  const tags = Array.isArray(tagsData) ? tagsData.filter(Boolean) : [];

  // Atualiza os valores locais quando as props mudam
  useEffect(() => {
    // Encontra o empregador selecionado de forma segura
    const foundEmployer = employers.find(emp => emp?.id === selectedEmployer) || null;
    setLocalSelectedEmployer(foundEmployer);
  }, [selectedEmployer, employers]);

  useEffect(() => {
    // Encontra a tag selecionada de forma segura
    const foundTag = tags.find(tag => tag?.id === selectedTag) || null;
    setLocalSelectedTag(foundTag);
  }, [selectedTag, tags]);

  // Funções seguras para lidar com valores nulos/undefined
  const handleEmployerChange = (_, newValue) => {
    if (typeof onEmployerChange === 'function') {
      onEmployerChange(newValue?.id || '');
    }
  };

  const handleTagChange = (_, newValue) => {
    if (typeof onTagChange === 'function') {
      onTagChange(newValue?.id || '');
    }
  };

  const handleClearEmployer = () => {
    if (typeof onEmployerChange === 'function') {
      onEmployerChange('');
    }
  };

  const handleClearTag = () => {
    if (typeof onTagChange === 'function') {
      onTagChange(null);
    }
  };

  const handleExport = () => {
    if (!selectedEmployer || typeof onExport !== 'function') {
      return;
    }
    onExport(selectedEmployer);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3, 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: theme.shape.borderRadius
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <Autocomplete
            options={employers}
            getOptionLabel={(option) => {
              if (!option || typeof option !== 'object') return '';
              return option.name || '';
            }}
            value={localSelectedEmployer}
            onChange={handleEmployerChange}
            loading={isLoadingEmployers}
            onInputChange={(_, newInputValue) => setEmployerSearch(newInputValue)}
            isOptionEqualToValue={(option, value) => {
              if (!option && !value) return true;
              if (!option || !value) return false;
              return option.id === value.id;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filtrar por Empresa"
                variant="outlined"
                size="small"
                disabled={isLoading}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Autocomplete
            options={tags}
            getOptionLabel={(option) => {
              if (!option || typeof option !== 'object') return '';
              return option.name || '';
            }}
            value={localSelectedTag}
            onChange={handleTagChange}
            loading={isLoadingTags}
            onInputChange={(_, newInputValue) => setTagSearch(newInputValue)}
            isOptionEqualToValue={(option, value) => {
              if (!option && !value) return true;
              if (!option || !value) return false;
              return option.id === value.id;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filtrar por Tag"
                variant="outlined"
                size="small"
                disabled={isLoading}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {isLoadingTags ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : localSelectedTag ? (
                        <Fade in={!!localSelectedTag}>
                          <InputAdornment position="end">
                            <Tooltip title="Limpar seleção">
                              <IconButton
                                size="small"
                                onClick={handleClearTag}
                                edge="end"
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        </Fade>
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            fullWidth
            disabled={!selectedEmployer || isLoading}
            sx={{
              height: '40px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }
            }}
          >
            {isMobile ? 'Exportar' : 'Exportar Senhas'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

PasswordFilter.propTypes = {
  selectedEmployer: PropTypes.string,
  selectedTag: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onEmployerChange: PropTypes.func,
  onTagChange: PropTypes.func,
  onExport: PropTypes.func,
  isLoading: PropTypes.bool
};

PasswordFilter.defaultProps = {
  selectedEmployer: '',
  selectedTag: null,
  onEmployerChange: () => {},
  onTagChange: () => {},
  onExport: () => {},
  isLoading: false
};

export default PasswordFilter;