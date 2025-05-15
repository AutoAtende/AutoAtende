import React, { useEffect, useState } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import { toast } from "../../../helpers/toast";
import api from "../../../services/api";
import PropTypes from "prop-types";
import { i18n } from "../../../translate/i18n";

export function ScheduleContactSelect({ onFiltered, initialContact = null }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(initialContact);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      await loadContacts();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedContact(initialContact);
  }, [initialContact]);

  // Efeito para carregar contatos baseados na busca com debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        loadContacts(searchQuery);
      }
    }, 500); // 500ms de debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const loadContacts = async (searchParam = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(`/contacts/list`, {
        params: { searchParam }
      });
      setContacts(data);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("schedules.contactSelectError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setSelectedContact(newValue);
    onFiltered(newValue);  // Passa o objeto completo do contato
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    setSearchQuery(newInputValue);
  };

  // Função para formatar o nome do contato com o número entre parênteses
  const formatOptionLabel = (option) => {
    if (!option) return "";
    
    // Se o nome for igual ao número ou não existir, mostrar apenas o número
    if (!option.name || option.name === option.number) {
      return option.number;
    }
    
    // Caso contrário, mostrar nome e número entre parênteses
    return `${option.name} (${option.number})`;
  };

  return (
    <Autocomplete
      options={contacts}
      value={selectedContact}
      onChange={handleChange}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      getOptionLabel={(option) => formatOptionLabel(option)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      loading={loading}
      loadingText={i18n.t("schedules.loadingContacts")}
      noOptionsText={i18n.t("schedules.noContactsFound")}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={!selectedContact ? i18n.t("schedules.selectContact") : ""}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            }
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} style={{ wordBreak: "break-word" }}>
          {formatOptionLabel(option)}
        </li>
      )}
      ListboxProps={{
        style: { maxHeight: '40vh' }
      }}
    />
  );
}

ScheduleContactSelect.propTypes = {
  onFiltered: PropTypes.func.isRequired,
  initialContact: PropTypes.object
};

export default ScheduleContactSelect;