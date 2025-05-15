import React, { useEffect, useState } from "react";
import { 
  TextField, 
  Autocomplete, 
  Chip, 
  CircularProgress,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import { 
  LocalOffer as TagIcon, 
  Check as CheckIcon,
  CheckBoxOutlineBlank,
  CheckBox
} from "@mui/icons-material";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

export function TagsFilter({ onFiltered, initialTags }) {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (Array.isArray(initialTags)) {
      setSelectedTags(initialTags);
    }
  }, [initialTags]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tags/list`);
      setTags(data);
    } catch (err) {
      toast.error(err.message || i18n.t("tagsFilter.error") || "Erro ao carregar tags");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setSelectedTags(newValue);
    onFiltered(newValue);
  };

  const handleSelectAll = () => {
    if (selectedTags.length === tags.length) {
      // Desmarcar todos
      setSelectedTags([]);
      onFiltered([]);
    } else {
      // Selecionar todos
      setSelectedTags(tags);
      onFiltered(tags);
    }
  };

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <Autocomplete
        multiple
        options={tags}
        value={selectedTags}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        loading={loading}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            label={i18n.t("tagsFilter.title") || "Filtrar por tags"}
            placeholder={selectedTags.length === 0 ? i18n.t("tagsFilter.placeholder") || "Selecione tags" : ""}
            InputProps={{
              ...params.InputProps,
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
              key={option.id}
              label={option.name}
              {...getTagProps({ index })}
              icon={<TagIcon />}
              size="small"
              sx={{
                backgroundColor: option.color || undefined,
                color: option.color ? '#fff' : undefined,
                '& .MuiChip-deleteIcon': {
                  color: option.color ? 'rgba(255, 255, 255, 0.7)' : undefined,
                  '&:hover': {
                    color: option.color ? '#fff' : undefined,
                  },
                },
              }}
              onDelete={(e) => {
                const props = getTagProps({ index });
                if (props.onDelete) {
                  props.onDelete(e);
                }
              }}
            />
          ))
        }
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TagIcon 
                sx={{ 
                  color: option.color || 'action.active',
                  fontSize: 20 
                }} 
              />
              <Typography>{option.name}</Typography>
            </Box>
          </li>
        )}
        filterOptions={(options, state) => {
          const filtered = options.filter(option =>
            option.name.toLowerCase().includes(state.inputValue.toLowerCase())
          );
          
          // Adiciona opção "Selecionar todos" se o menu estiver aberto
          if (isOpen && filtered.length === tags.length && state.inputValue === '') {
            return [
              {
                id: 'select-all',
                name: selectedTags.length === tags.length 
                  ? i18n.t("tagsFilter.deselectAll") || "Desmarcar todos"
                  : i18n.t("tagsFilter.selectAll") || "Selecionar todos",
                isSelectAll: true
              },
              ...filtered
            ];
          }
          
          return filtered;
        }}
        onChange={(event, newValue) => {
          // Verifica se o usuário clicou em "Selecionar todos"
          const selectAllOption = newValue.find(option => option.isSelectAll);
          if (selectAllOption) {
            handleSelectAll();
            return;
          }
          
          setSelectedTags(newValue);
          onFiltered(newValue);
        }}
        sx={{
          '& .MuiAutocomplete-tag': {
            margin: '2px'
          }
        }}
      />
      
      {selectedTags.length > 0 && (
        <Typography 
          variant="caption" 
          color="primary" 
          sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <CheckIcon sx={{ fontSize: 16 }} />
          {selectedTags.length} {i18n.t("tagsFilter.selected") || "tag(s) selecionada(s)"}
        </Typography>
      )}
    </Box>
  );
}

export default TagsFilter;