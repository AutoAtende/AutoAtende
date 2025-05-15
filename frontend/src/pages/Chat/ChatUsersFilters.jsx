import React, { useEffect, useState, useContext, useCallback } from "react";
import { 
  FormControl, 
  FormHelperText,
  Select, 
  MenuItem, 
  Checkbox,
  InputLabel,
  OutlinedInput,
  Box,
  Chip,
  ListItemText,
  CircularProgress,
  Button
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

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

export function ChatUsersFilters({ 
  onFiltered, 
  initialSelectedUsers = [], 
  error = false, 
  helperText, 
  disabled = false,
  open = false 
}) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  // Função para carregar usuários usando a mesma lógica de outras partes do sistema
  const loadUsers = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setLoadError(null);
      
      console.log("Iniciando carregamento de usuários para o chat");
      
      const usersResponse = await api.get('/users/list');
      console.log('Resposta da API users:', usersResponse?.data);
      
      let usersData = [];
      if (usersResponse && usersResponse.data) {
        if (Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data;
        } else if (usersResponse.data.users && Array.isArray(usersResponse.data.users)) {
          usersData = usersResponse.data.users;
        }
      }
      
      // Filtra o usuário atual e formata para o padrão esperado
      const userList = usersData
        .filter(u => u.id !== currentUser.id)
        .map(u => ({ 
          id: u.id, 
          name: u.name 
        }));
      
      console.log(`Usuários processados: ${userList.length}`);
      setUsers(userList);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      const errorMessage = err.response?.data?.error || err.message || i18n.t("chat.errors.loadUsersFailed");
      setLoadError(errorMessage);
      toast.error(i18n.t("chat.errors.loadUsersFailed"));
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, loading]);

  // Carrega usuários quando o modal é aberto
  useEffect(() => {
    if (open && users.length === 0 && !loading) {
      loadUsers();
    }
  }, [open, users.length, loading, loadUsers]);

  // Inicializa usuários selecionados
  useEffect(() => {
    if (initialSelectedUsers?.length > 0) {
      setSelectedUsers(initialSelectedUsers);
    } else {
      setSelectedUsers([]);
    }
  }, [initialSelectedUsers]);

  // Handler para seleção de usuários
  const handleChange = useCallback((event) => {
    const selectedIds = event.target.value;
    const newSelectedUsers = users.filter(user => 
      selectedIds.includes(user.id)
    );
    setSelectedUsers(newSelectedUsers);
    onFiltered(newSelectedUsers);
  }, [users, onFiltered]);

  return (
    <FormControl 
      fullWidth 
      error={error}
      disabled={disabled || loading}
    >
      <InputLabel id="chat-users-select-label">
        {i18n.t("chat.selectUsers")}
      </InputLabel>
      <Select
        labelId="chat-users-select-label"
        multiple
        value={selectedUsers.map(u => u.id)}
        onChange={handleChange}
        input={<OutlinedInput label={i18n.t("chat.selectUsers")} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const user = users.find(u => u.id === value);
              return user ? (
                <Chip 
                  key={value} 
                  label={user.name} 
                  size="small"
                />
              ) : null;
            })}
          </Box>
        )}
        MenuProps={MenuProps}
        startAdornment={loading && 
          <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
        }
      >
        {loading ? (
          <MenuItem disabled>
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              <ListItemText primary={i18n.t('chat.loadingUsers')} />
            </Box>
          </MenuItem>
        ) : users.length === 0 ? (
          <MenuItem disabled>
            {loadError || i18n.t('chat.noUsersAvailable')}
            {loadError && (
              <Button 
                onClick={loadUsers} 
                size="small" 
                startIcon={<RefreshIcon />}
                sx={{ ml: 2 }}
              >
                {i18n.t('chat.tryAgain')}
              </Button>
            )}
          </MenuItem>
        ) : (
          users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              <Checkbox 
                checked={selectedUsers.some(u => u.id === user.id)} 
              />
              <ListItemText primary={user.name} />
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

export default React.memo(ChatUsersFilters);