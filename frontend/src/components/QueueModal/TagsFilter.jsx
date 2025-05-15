import React, { useEffect, useState } from "react";
import { TextField, Autocomplete, Chip } from "@mui/material";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

export function TagsFilter({ onFiltered, initialTags = [] }) {
  const [tags, setTags] = useState([]);
  const [selecteds, setSelecteds] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);

  // Carrega as tags iniciais quando o componente monta
  useEffect(() => {
    setMounted(true);
    loadTags();
    
    return () => {
      setMounted(false);
    };
  }, []);

  // Efeito para atualizar as tags selecionadas quando initialTags mudar
  useEffect(() => {
    if (!mounted) return;
    
    if (initialTags && initialTags.length > 0 && tags.length > 0) {
      // Mapeia os IDs para os objetos de tag completos
      const selectedTags = tags.filter(tag => 
        initialTags.includes(tag.id)
      );
      setSelecteds(selectedTags);
    } else {
      setSelecteds([]);
    }
  }, [initialTags, tags, mounted]);

  const loadTags = async () => {
    if (!mounted) return;
    
    try {
      setLoading(true);
      const { data } = await api.get(`/tags/list`);
      if (mounted) {
        setTags(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar tags:", err);
      if (mounted) {
        toast.error(i18n.t("queueModal.toasts.tagsError"));
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const handleChange = (event, newValue) => {
    if (!mounted) return;
    
    const validValues = Array.isArray(newValue) ? newValue : [];
    setSelecteds(validValues);
    if (typeof onFiltered === 'function') {
      onFiltered(validValues);
    }
  };

  return (
    <div className="w-full">
      <Autocomplete
        multiple
        options={tags}
        value={selecteds}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        loading={loading}
        getOptionLabel={(option) => option?.name || ''}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={selecteds.length === 0 ? i18n.t("queueModal.form.tags") : ""}
            className="w-full"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option?.id || index}
              label={option?.name || ''}
              {...getTagProps({ index })}
              className="m-1"
            />
          ))
        }
      />
    </div>
  );
}