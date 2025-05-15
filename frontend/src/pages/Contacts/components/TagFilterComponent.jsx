import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Chip,
  TextField,
  InputAdornment,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import { i18n } from '../../../translate/i18n';

// Componente de Filtro de Tags otimizado
const TagFilterContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const TagFilterComponent = ({ onFilterChange, size = 'small' }) => {
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

  return (
    <TagFilterContainer>
      <Autocomplete
        multiple
        id="tags-filter"
        options={availableTags}
        getOptionLabel={(option) => option.name}
        value={selectedTags}
        onChange={handleTagsChange}
        loading={loading}
        size={size}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={selectedTags.length === 0 ? i18n.t("contacts.filters.selectTags") || "Selecione as tags" : ""}
            size={size}
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <LocalOfferIcon color="primary" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option.name}
              {...getTagProps({ index })}
              style={{
                backgroundColor: option.color || '#666',
                color: '#fff',
                margin: '2px'
              }}
              size="small"
            />
          ))
        }
        renderOption={(props, option) => (
          <li {...props}>
            <Box
              component="span"
              sx={{
                width: 14,
                height: 14,
                mr: 1,
                borderRadius: '50%',
                display: 'inline-block',
                backgroundColor: option.color || '#666'
              }}
            />
            {option.name}
          </li>
        )}
      />
      
      {!loading && availableTags.length === 0 && (
        <Typography variant="body2" color="textSecondary" align="center">
          {i18n.t("contacts.filters.noTagsAvailable") || "Nenhuma tag disponível"}
        </Typography>
      )}
    </TagFilterContainer>
  );
};

export default TagFilterComponent;