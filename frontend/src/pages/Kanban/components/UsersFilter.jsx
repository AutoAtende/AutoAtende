import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import api from "../../../services/api";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  width: "100%",
  "& .MuiInputBase-root": {
    padding: "2px 8px",
  },
  "& .MuiAutocomplete-tag": {
    margin: "2px",
    maxWidth: "calc(100% - 4px)",
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  maxWidth: "100%",
  "& .MuiChip-label": {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  }
}));

export function UsersFilter({ onFiltered, initialUsers = [] }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (Array.isArray(initialUsers) && initialUsers.length > 0) {
      setSelectedUsers(initialUsers);
    }
  }, [initialUsers]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/list");
      const userList = data.map(user => ({
        id: user.id,
        name: user.name,
        label: user.name // para compatibilidade com o Autocomplete
      }));
      setUsers(userList);
    } catch (err) {
      toast.error(err.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setSelectedUsers(newValue);
    
    // Mantém a compatibilidade com o componente pai esperando apenas os IDs
    const selectedIds = newValue.map(user => user.id);
    onFiltered(selectedIds);
  };

  return (
    <StyledAutocomplete
      multiple
      size="small"
      options={users}
      value={selectedUsers}
      onChange={handleChange}
      loading={loading}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={selectedUsers.length === 0 ? "Selecionar usuários" : ""}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <PersonIcon color="action" sx={{ mr: 1 }} />
                {params.InputProps.startAdornment}
              </>
            )
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <StyledChip
            {...getTagProps({ index })}
            key={option.id}
            label={option.name}
            size="small"
          />
        ))
      }
    />
  );
}

export default UsersFilter;