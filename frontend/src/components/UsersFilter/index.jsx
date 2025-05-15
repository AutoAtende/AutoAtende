import React, { useEffect, useState } from "react";
import { 
  Box, 
  Chip, 
  TextField, 
  Checkbox, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  OutlinedInput,
  ListItemText,
  CircularProgress,
  Typography
} from "@mui/material";
import { Person as PersonIcon, Check as CheckIcon } from "@mui/icons-material";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export function UsersFilter({ onFiltered, initialUsers }) {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (Array.isArray(initialUsers)) {
      const ids = initialUsers.map((user) => user.id);
      setSelectedIds(ids);
    }
  }, [initialUsers]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/users/list`);
      const userList = data.map((u) => ({ id: u.id, name: u.name }));
      setUsers(userList);
    } catch (err) {
      toast.error(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedIds(value);
    onFiltered(value); // Enviar diretamente os IDs
  };

  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      // Desmarcar todos
      setSelectedIds([]);
      onFiltered([]);
    } else {
      // Selecionar todos
      const allIds = users.map(user => user.id);
      setSelectedIds(allIds);
      onFiltered(allIds); // Enviar apenas os IDs
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ minWidth: 120, my: 1 }}>
      <InputLabel id="users-filter-label" sx={{ backgroundColor: 'background.paper', px: 0.5 }}>
        {i18n.t("usersFilter.title") || "Filtrar por usuários"}
      </InputLabel>
      <Select
        labelId="users-filter-label"
        id="users-filter"
        multiple
        value={selectedIds}
        onChange={handleChange}
        input={<OutlinedInput label={i18n.t("usersFilter.title") || "Filtrar por usuários"} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {i18n.t("usersFilter.placeholder") || "Selecione usuários"}
              </Typography>
            ) : selected.length === users.length ? (
              <Chip 
                icon={<PersonIcon />} 
                label={i18n.t("usersFilter.allSelected") || "Todos os usuários"} 
                size="small" 
                color="primary"
              />
            ) : (
              selected.map((id) => {
                const user = users.find((u) => u.id === id);
                return user ? (
                  <Chip
                    key={id}
                    icon={<PersonIcon />}
                    label={user.name}
                    size="small"
                    onDelete={(e) => {
                      e.stopPropagation();
                      const newSelection = selectedIds.filter(selectedId => selectedId !== id);
                      setSelectedIds(newSelection);
                      onFiltered(newSelection); // Enviar apenas IDs
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : null;
              })
            )}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {loading ? (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography>{i18n.t("usersFilter.loading") || "Carregando usuários..."}</Typography>
            </Box>
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={handleSelectAll} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Checkbox
                checked={selectedIds.length === users.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < users.length}
              />
              <ListItemText 
                primary={
                  <Typography fontWeight="medium">
                    {i18n.t("usersFilter.selectAll") || "Selecionar todos"}
                  </Typography>
                } 
              />
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                <Checkbox 
                  checked={selectedIds.includes(user.id)} 
                  icon={<PersonIcon sx={{ opacity: 0.5 }} />}
                  checkedIcon={<PersonIcon color="primary" />}
                />
                <ListItemText primary={user.name} />
              </MenuItem>
            ))}
          </>
        )}
      </Select>
      {selectedIds.length > 0 && (
        <Typography 
          variant="caption" 
          color="primary" 
          sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <CheckIcon sx={{ fontSize: 16 }} />
          {selectedIds.length} {i18n.t("usersFilter.selected") || "usuário(s) selecionado(s)"}
        </Typography>
      )}
    </FormControl>
  );
}

export default UsersFilter;