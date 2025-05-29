import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Chip,
  TextField,
  InputAdornment,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalOffer as TagIcon } from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import { i18n } from '../../../translate/i18n';

// Styled Components seguindo padrão Standard
const TagFilterContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.breakpoints.down('sm') ? 12 : 8,
    minHeight: theme.breakpoints.down('sm') ? 48 : 40,
    backgroundColor: theme.palette.background.paper,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    }
  },
  '& .MuiChip-root': {
    borderRadius: theme.breakpoints.down('sm') ? 8 : 6,
    height: theme.breakpoints.down('sm') ? 28 : 24,
    fontSize: theme.breakpoints.down('sm') ? '0.875rem' : '0.75rem',
    fontWeight: 500,
    margin: theme.spacing(0.25),
  },
  '& .MuiAutocomplete-tag': {
    margin: theme.spacing(0.25),
  },
  '& .MuiAutocomplete-inputRoot': {
    padding: theme.spacing(1, 1.5),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.25, 1.5),
    }
  }
}));

const TagFilterComponent = ({ onFilterChange, size = 'small', placeholder, disabled = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/tags/list');
        setAvailableTags(data || []);
      } catch (err) {
        console.error('Erro ao carregar tags:', err);
        toast.error(i18n.t("contactTagsManager.errors.loadTags") || 'Erro ao carregar tags');
        setAvailableTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagsChange = (event, newTags) => {
    setSelectedTags(newTags);
    // Passa os IDs das tags selecionadas para o componente pai
    onFilterChange(newTags.map(tag => tag.id));
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    if (selectedTags.length === 0) {
      return i18n.t("contacts.filters.selectTags") || "Filtrar por tags";
    }
    return "";
  };

  return (
    <TagFilterContainer>
      <StyledAutocomplete
        multiple
        id="tags-filter"
        options={availableTags}
        getOptionLabel={(option) => option.name || ''}
        value={selectedTags}
        onChange={handleTagsChange}
        loading={loading}
        disabled={disabled}
        size={isMobile ? 'medium' : size}
        limitTags={isMobile ? 2 : 3}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={getPlaceholder()}
            size={isMobile ? 'medium' : size}
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <TagIcon 
                      color="primary" 
                      sx={{ fontSize: isMobile ? '1.25rem' : '1.125rem' }}
                    />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress 
                      color="inherit" 
                      size={isMobile ? 24 : 20}
                      sx={{ mr: 1 }}
                    />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: 400,
              }
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={option.name}
                {...tagProps}
                style={{
                  backgroundColor: option.color || theme.palette.grey[600],
                  color: '#fff',
                  fontWeight: 500,
                }}
                size={isMobile ? "medium" : "small"}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: isMobile ? '1.125rem' : '1rem',
                    '&:hover': {
                      color: '#fff'
                    }
                  }
                }}
              />
            );
          })
        }
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Box
                component="span"
                sx={{
                  width: 14,
                  height: 14,
                  mr: 1.5,
                  borderRadius: '50%',
                  display: 'inline-block',
                  backgroundColor: option.color || theme.palette.grey[600],
                  flexShrink: 0
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : '0.8125rem',
                  fontWeight: 500 
                }}
              >
                {option.name}
              </Typography>
            </li>
          );
        }}
        PopperProps={{
          sx: {
            '& .MuiAutocomplete-paper': {
              borderRadius: isMobile ? 3 : 2,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                : '0 8px 32px rgba(0, 0, 0, 0.12)',
              '& .MuiAutocomplete-option': {
                padding: theme.spacing(1.5, 2),
                minHeight: isMobile ? 48 : 40,
                '&[aria-selected="true"]': {
                  backgroundColor: theme.palette.primary.light + '20',
                },
                '&.Mui-focused': {
                  backgroundColor: theme.palette.action.hover,
                }
              }
            }
          }
        }}
        ChipProps={{
          variant: 'filled',
          sx: {
            fontWeight: 500,
            '& .MuiChip-label': {
              fontSize: isMobile ? '0.875rem' : '0.75rem',
              fontWeight: 500,
            }
          }
        }}
        sx={{
          '& .MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiAutocomplete-inputRoot': {
            paddingRight: theme.spacing(7),
          },
          '& .MuiAutocomplete-clearIndicator': {
            color: theme.palette.action.active,
            padding: theme.spacing(0.5),
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              borderRadius: '50%',
            }
          }
        }}
      />
      
      {!loading && availableTags.length === 0 && (
        <Typography 
          variant="body2" 
          color="textSecondary" 
          align="center"
          sx={{ 
            mt: 1,
            fontSize: isMobile ? '0.875rem' : '0.8125rem',
            fontStyle: 'italic'
          }}
        >
          {i18n.t("contacts.filters.noTagsAvailable") || "Nenhuma tag disponível"}
        </Typography>
      )}

      {selectedTags.length > 0 && (
        <Typography 
          variant="caption" 
          color="textSecondary" 
          sx={{ 
            mt: 0.5,
            fontSize: isMobile ? '0.75rem' : '0.6875rem',
            fontWeight: 500
          }}
        >
          {selectedTags.length === 1 
            ? `1 tag selecionada`
            : `${selectedTags.length} tags selecionadas`
          }
        </Typography>
      )}
    </TagFilterContainer>
  );
};

TagFilterComponent.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium']),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool
};

export default TagFilterComponent;