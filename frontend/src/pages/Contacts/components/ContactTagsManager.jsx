import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Chip,
  Autocomplete,
  TextField,
  CircularProgress,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  LocalOffer as TagIcon,
  Add as AddIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";

// Styled Components com padrão Standard
const TagsContainer = styled(Paper)(({ theme, simplified }) => ({
  padding: simplified ? theme.spacing(2) : theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.breakpoints.down('sm') ? 12 : 8,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main + '40',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  }
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.breakpoints.down('sm') ? 12 : 8,
    minHeight: theme.breakpoints.down('sm') ? 48 : 40,
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
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    }
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

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  textAlign: 'center',
  minHeight: 120,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    minHeight: 100,
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  minHeight: 80
}));

// Componente de Loading Skeleton
const TagsSkeleton = ({ count = 3 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          width={isMobile ? 80 : 60}
          height={isMobile ? 28 : 24}
          sx={{ borderRadius: isMobile ? 2 : 1.5 }}
        />
      ))}
    </Stack>
  );
};

TagsSkeleton.propTypes = {
  count: PropTypes.number
};

// Componente de Estado Vazio
const EmptyTagsState = ({ simplified }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Fade in timeout={500}>
      <EmptyStateContainer>
        <TagIcon 
          sx={{ 
            fontSize: isMobile ? 32 : 40, 
            color: 'text.secondary', 
            mb: 1,
            opacity: 0.6
          }} 
        />
        <Typography 
          variant={isMobile ? "body2" : "body1"}
          color="textSecondary"
          sx={{ 
            fontWeight: 500,
            mb: simplified ? 0 : 0.5
          }}
        >
          {i18n.t("contactTagsManager.noTags") || "Nenhuma tag selecionada"}
        </Typography>
        {!simplified && (
          <Typography 
            variant="caption" 
            color="textSecondary"
            sx={{ opacity: 0.8 }}
          >
            Adicione tags para organizar este contato
          </Typography>
        )}
      </EmptyStateContainer>
    </Fade>
  );
};

EmptyTagsState.propTypes = {
  simplified: PropTypes.bool
};

const ContactTagsManager = ({ 
  contactId, 
  readOnly = false, 
  onChange, 
  simplified = false,
  size = 'medium',
  placeholder 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState(null);

  const effectiveSize = isMobile ? 'medium' : size;

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      setError(null);
      const { data } = await api.get('/tags/list');
      setAvailableTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar tags:', err);
      const errorMessage = err.response?.data?.message || err.message || i18n.t("contactTagsManager.errors.loadTags");
      setError(errorMessage);
      toast.error(errorMessage);
      setAvailableTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchContactTags = async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/contacts/${contactId}/tags`);
      const tags = Array.isArray(data) ? data : [];
      setSelectedTags(tags);
      if (onChange) {
        onChange(tags);
      }
    } catch (err) {
      console.error('Erro ao carregar tags do contato:', err);
      const errorMessage = err.response?.data?.message || err.message || i18n.t("contactTagsManager.errors.loadContactTags");
      setError(errorMessage);
      toast.error(errorMessage);
      setSelectedTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (contactId) {
      fetchContactTags();
    } else {
      setSelectedTags([]);
    }
  }, [contactId]);

  const handleTagsChange = async (_, newTags) => {
    if (readOnly || !contactId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tagIds = Array.isArray(newTags) ? newTags.map(tag => tag.id).filter(Boolean) : [];
      
      const { data } = await api.post(`/contacts/${contactId}/tags`, {
        tagIds
      });
      
      const updatedTags = Array.isArray(data.tags) ? data.tags : [];
      setSelectedTags(updatedTags);
      
      if (onChange) {
        onChange(updatedTags);
      }
      
      toast.success(i18n.t("contactTagsManager.success.updated") || "Tags atualizadas com sucesso");
    } catch (err) {
      console.error('Erro ao atualizar tags:', err);
      const errorMessage = err.response?.data?.message || err.message || i18n.t("contactTagsManager.errors.updateTags");
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reverter para o estado anterior
      fetchContactTags();
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (readOnly) return "";
    
    if (selectedTags.length === 0) {
      return i18n.t("contactTagsManager.selectTags") || "Selecionar tags...";
    }
    return "";
  };

  // Loading inicial
  if (loading && selectedTags.length === 0) {
    return (
      <TagsContainer simplified={simplified}>
        <LoadingContainer>
          <CircularProgress size={isMobile ? 24 : 20} />
        </LoadingContainer>
      </TagsContainer>
    );
  }

  // Estado de erro
  if (error && selectedTags.length === 0) {
    return (
      <TagsContainer simplified={simplified}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ 
            borderRadius: isMobile ? 2 : 1,
            fontSize: isMobile ? '0.875rem' : '0.8125rem'
          }}
        >
          {error}
        </Alert>
      </TagsContainer>
    );
  }

  return (
    <TagsContainer simplified={simplified} variant="outlined">
      {loading && selectedTags.length === 0 ? (
        <TagsSkeleton count={3} />
      ) : (
        <Box>
          {!readOnly ? (
            <StyledAutocomplete
              multiple
              id="contact-tags"
              options={availableTags}
              getOptionLabel={(option) => option?.name || ''}
              value={selectedTags}
              onChange={handleTagsChange}
              loading={loadingTags}
              disabled={readOnly || loading}
              size={effectiveSize}
              limitTags={isMobile ? 2 : 3}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={getPlaceholder()}
                  size={effectiveSize}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <TagIcon 
                          color="primary" 
                          sx={{ 
                            mr: 1,
                            fontSize: isMobile ? '1.25rem' : '1.125rem' 
                          }}
                        />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingTags ? (
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
              noOptionsText={
                <Typography variant="body2" color="textSecondary">
                  {loadingTags ? "Carregando..." : "Nenhuma tag disponível"}
                </Typography>
              }
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
          ) : (
            // Modo somente leitura - exibir apenas as tags
            selectedTags.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size={isMobile ? "medium" : "small"}
                    style={{
                      backgroundColor: tag.color || theme.palette.grey[600],
                      color: '#fff',
                      fontWeight: 500,
                    }}
                    sx={{
                      '& .MuiChip-label': {
                        fontSize: isMobile ? '0.875rem' : '0.75rem',
                        fontWeight: 500,
                      }
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyTagsState simplified={simplified} />
            )
          )}
          
          {/* Status das tags selecionadas */}
          {!readOnly && selectedTags.length > 0 && !simplified && (
            <Typography 
              variant="caption" 
              color="textSecondary" 
              sx={{ 
                mt: 1,
                display: 'block',
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

          {/* Estado vazio quando não há tags mas não é readonly */}
          {!readOnly && selectedTags.length === 0 && !loading && (
            <EmptyTagsState simplified={simplified} />
          )}
        </Box>
      )}
    </TagsContainer>
  );
};

ContactTagsManager.propTypes = {
  contactId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  simplified: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  placeholder: PropTypes.string
};

export default ContactTagsManager;