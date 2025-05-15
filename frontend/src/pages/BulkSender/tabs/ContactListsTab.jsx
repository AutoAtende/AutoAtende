// ContactListsTab.jsx (versão atualizada)
import React, { useState, useEffect, useCallback, useContext } from "react";
import { styled, useTheme } from '@mui/material/styles';
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";

// Material UI
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  CircularProgress,
  Collapse,
  Divider,
  Card,
  CardContent,
  useMediaQuery
} from "@mui/material";

// Icons
import {
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from "@mui/icons-material";

// Componentes
import TableRowSkeleton from "../../../components/TableRowSkeleton";
import EmptyState from "../../../components/EmptyState";
import ContactListManager from "./ContactListManager";

// API
import api from "../../../services/api";

const ContactListsTab = ({ searchParam = "", onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const companyId = user?.companyId;
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [contactLists, setContactLists] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [expandedList, setExpandedList] = useState(null);

  // Fetch das listas de contatos
  const fetchContactLists = useCallback(async () => {
    const searchTerm = searchParam || localSearch;
    
    try {
      setLoading(true);
      const { data } = await api.get("/contact-lists/", {
        params: { 
          searchParam: searchTerm, 
          pageNumber,
          companyId 
        },
      });
      
      setContactLists(data.records || []);
      setHasMore(data.hasMore);
    } catch (err) {
      toast.error(i18n.t("contactLists.toasts.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [searchParam, localSearch, pageNumber, companyId]);

  // Efeito para buscar listas quando os parâmetros mudam
  useEffect(() => {
    fetchContactLists();
  }, [fetchContactLists]);

  // Socket para atualizações em tempo real
  useEffect(() => {
    if (!companyId) return;
    
    const socket = socketManager.GetSocket(companyId);
    if (!socket) return;
    
    const handleContactListUpdate = (data) => {
      if (!data) return;
      
      if (data.action === "update" || data.action === "create") {
        setContactLists(prevLists => {
          const index = prevLists.findIndex(list => list.id === data.record.id);
          if (index !== -1) {
            const newLists = [...prevLists];
            newLists[index] = data.record;
            return newLists;
          } else {
            return [data.record, ...prevLists];
          }
        });
      } else if (data.action === "delete") {
        setContactLists(prevLists => 
          prevLists.filter(list => list.id !== parseInt(data.id))
        );
        if (expandedList === parseInt(data.id)) {
          setExpandedList(null);
        }
      }
    };

    socket.on(`company-${companyId}-ContactList`, handleContactListUpdate);

    return () => {
      socket.off(`company-${companyId}-ContactList`, handleContactListUpdate);
    };
  }, [companyId, socketManager, expandedList]);

  // Handlers
  const handleLocalSearch = (e) => {
    setLocalSearch(e.target.value);
    setPageNumber(1);
  };

  const handleExpandList = (listId) => {
    setExpandedList(expandedList === listId ? null : listId);
  };

  // Renderizar conteúdo vazio
  if (!loading && contactLists.length === 0) {
    return (
      <Box sx={{ p: 0, height: '100%' }}>
        <EmptyState
          type="contactLists"
          title={i18n.t("contactLists.empty.title")}
          message={i18n.t("contactLists.empty.message")}
          buttonText={i18n.t("contactLists.buttons.add")}
          onCreateNew={() => onEdit(null)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {!searchParam && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder={i18n.t("contactLists.searchPlaceholder")}
            value={localSearch}
            onChange={handleLocalSearch}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
      )}

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        ...theme.scrollbarStyles
      }}>
        {loading && contactLists.length === 0 ? (
          <Paper 
            variant="outlined"
            sx={{ p: 2, display: 'flex', justifyContent: 'center' }}
          >
            <CircularProgress size={24} />
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {contactLists.map((list) => (
              <Card key={list.id} variant="outlined">
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                  onClick={() => handleExpandList(list.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={500}>
                        {list.name}
                      </Typography>
                      <Chip 
                        label={list.contactsCount || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title={i18n.t("contactLists.buttons.edit")}>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(list);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("contactLists.buttons.delete")}>
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(list);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {expandedList === list.id ? 
                        <ExpandLessIcon /> : 
                        <ExpandMoreIcon />
                      }
                    </Box>
                  </Box>
                  
                  <Collapse in={expandedList === list.id}>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                      <ContactListManager 
                        contactListId={list.id}
                        onSuccess={fetchContactLists}
                      />
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
            
            {loading && contactLists.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ContactListsTab;