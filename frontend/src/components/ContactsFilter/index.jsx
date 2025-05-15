import React, { useEffect, useState } from "react";
import { TextField, Autocomplete, Chip } from "@mui/material";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

export function ContactsFilter({ onFiltered, initialContacts = [] }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(initialContacts);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await loadContacts();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedContacts(initialContacts);
  }, [initialContacts]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/contacts/list`);
      setContacts(data);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setSelectedContacts(newValue);
    onFiltered(newValue);
  };

  return (
    <div className="w-full">
      <Autocomplete
        multiple
        options={contacts}
        value={selectedContacts}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        loading={loading}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={selectedContacts.length === 0 ? "Contatos" : ""}
            className="w-full"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option.id}
              label={option.name}
              {...getTagProps({ index })}
              className="m-1"
            />
          ))
        }
      />
    </div>
  );
}