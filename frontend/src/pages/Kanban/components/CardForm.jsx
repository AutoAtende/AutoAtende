import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from "@mui/material/styles";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Autocomplete,
  Chip,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  Person as PersonIcon,
  Tag as TagIcon,
  ContactPhone as ContactIcon,
  Message as MessageIcon,
  Lock as LockIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { toast } from "../../../helpers/toast";
import useAuth from "../../../hooks/useAuth";
import api from "../../../services/api";

const CardForm = ({ card, onSubmit, loading, companyId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 0,
    dueDate: null,
    laneId: '',
    assignedUserId: '',
    contactId: '',
    ticketId: '',
    value: '',
    sku: '',
    tags: [],
    isBlocked: false,
    blockReason: ''
  });
  
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingData, setLoadingData] = useState({
    users: false,
    contacts: false,
    tickets: false,
    tags: false
  });
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [ticketSearchTerm, setTicketSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        priority: card.priority !== undefined ? card.priority : 0,
        dueDate: card.dueDate ? new Date(card.dueDate) : null,
        laneId: card.laneId || '',
        assignedUserId: card.assignedUserId || '',
        contactId: card.contactId || '',
        ticketId: card.ticketId || '',
        value: card.value || '',
        sku: card.sku || '',
        tags: card.tags || [],
        isBlocked: card.isBlocked || false,
        blockReason: card.blockReason || ''
      });
      
      if (card.contactId) {
        fetchContact(card.contactId);
      }
      if (card.ticketId) {
        fetchTicket(card.ticketId);
      }
    }
    
    fetchUsers();
    fetchTags();
  }, [card, companyId]);

  const fetchUsers = async () => {
    try {
      setLoadingData(prev => ({ ...prev, users: true }));
      const { data } = await api.request({
        url: '/users/list',
        method: 'get'
      });
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoadingData(prev => ({ ...prev, users: false }));
    }
  };

  const fetchTags = async () => {
    try {
      setLoadingData(prev => ({ ...prev, tags: true }));
      const { data } = await api.request({
        url: '/tags/list',
        method: 'get'
      });
      setTags(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar tags");
    } finally {
      setLoadingData(prev => ({ ...prev, tags: false }));
    }
  };

  const fetchContact = async (contactId) => {
    if (!contactId) return;
    
    try {
      setLoadingData(prev => ({ ...prev, contacts: true }));
      const { data } = await api.request({
        url: `/contacts/${contactId}`,
        method: 'get'
      });
      setContacts([data]);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar contato");
    } finally {
      setLoadingData(prev => ({ ...prev, contacts: false }));
    }
  };

  const fetchTicket = async (ticketId) => {
    if (!ticketId) return;
    
    try {
      setLoadingData(prev => ({ ...prev, tickets: true }));
      const { data } = await api.request({
        url: `/tickets/${ticketId}`,
        method: 'get'
      });
      setTickets([data]);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar ticket");
    } finally {
      setLoadingData(prev => ({ ...prev, tickets: false }));
    }
  };

  const searchContacts = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) return;
    
    try {
      setLoadingData(prev => ({ ...prev, contacts: true }));
      const { data } = await api.request({
        url: '/contacts',
        method: 'get',
        params: { searchParam: searchTerm }
      });
      setContacts(data.contacts || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar contatos");
    } finally {
      setLoadingData(prev => ({ ...prev, contacts: false }));
    }
  };

  const searchTickets = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) return;
    
    try {
      setLoadingData(prev => ({ ...prev, tickets: true }));
      const { data } = await api.request({
        url: '/tickets',
        method: 'get',
        params: { searchParam: searchTerm }
      });
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar tickets");
    } finally {
      setLoadingData(prev => ({ ...prev, tickets: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleContactSearchChange = (e, value) => {
    setContactSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value && value.length >= 3) {
      setSearchTimeout(setTimeout(() => {
        searchContacts(value);
      }, 500));
    }
  };

  const handleTicketSearchChange = (e, value) => {
    setTicketSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value && value.length >= 3) {
      setSearchTimeout(setTimeout(() => {
        searchTickets(value);
      }, 500));
    }
  };

  const handleDueDateChange = (date) => {
    setFormData(prevData => ({
      ...prevData,
      dueDate: date
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setFormData(prevData => ({
      ...prevData,
      tags: newValue
    }));
  };

  const handleContactChange = (e, value) => {
    setFormData(prevData => ({
      ...prevData,
      contactId: value ? value.id : ''
    }));
  };

  const handleTicketChange = (e, value) => {
    setFormData(prevData => ({
      ...prevData,
      ticketId: value ? value.id : '',
      contactId: value && value.contact ? value.contact.id : prevData.contactId
    }));
    
    if (value && value.contact) {
      setContacts([value.contact]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              name="title"
              label="Título"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
            
            <TextField
              name="description"
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" disabled={loading}>
                  <InputLabel>Prioridade</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Prioridade"
                    startAdornment={<PriorityIcon sx={{ mr: 1 }} />}
                  >
                    <MenuItem value={0}>Normal</MenuItem>
                    <MenuItem value={1}>Alta</MenuItem>
                    <MenuItem value={2}>Urgente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mt: 2 }}>
                  <DateTimePicker
                    label="Data de Vencimento"
                    value={formData.dueDate}
                    onChange={handleDueDateChange}
                    disabled={loading}
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Autocomplete
              options={tags}
              multiple
              value={formData.tags}
              onChange={handleTagsChange}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <TagIcon sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index });
                  return (
                    <Chip
                      key={option.id}
                      label={option.name}
                      {...tagProps}
                      style={{
                        backgroundColor: option.color || undefined,
                        color: option.color ? '#fff' : undefined
                      }}
                      size="small"
                    />
                  );
                })
              }
              loading={loadingData.tags}
            />
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="isBlocked"
                    checked={formData.isBlocked}
                    onChange={handleChange}
                    disabled={loading}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LockIcon sx={{ mr: 1, color: 'error.main' }} />
                    <Typography>Bloquear Cartão</Typography>
                  </Box>
                }
              />
              
              {formData.isBlocked && (
                <TextField
                  name="blockReason"
                  label="Motivo do Bloqueio"
                  fullWidth
                  value={formData.blockReason}
                  onChange={handleChange}
                  margin="normal"
                  required={formData.isBlocked}
                  disabled={loading}
                />
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal" disabled={loading}>
              <InputLabel>Responsável</InputLabel>
              <Select
                name="assignedUserId"
                value={formData.assignedUserId}
                onChange={handleChange}
                label="Responsável"
                startAdornment={<PersonIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Autocomplete
              options={contacts}
              value={contacts.find(c => c.id === formData.contactId) || null}
              onChange={handleContactChange}
              getOptionLabel={(option) => `${option.name} (${option.number})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Contato"
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleContactSearchChange(e, e.target.value)}
                  value={contactSearchTerm}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <ContactIcon sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingData.contacts ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
            
            <Autocomplete
              options={tickets}
              value={tickets.find(t => t.id === formData.ticketId) || null}
              onChange={handleTicketChange}
              getOptionLabel={(option) => `Ticket #${option.id}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ticket"
                  fullWidth
                  margin="normal"
                  onChange={(e) => handleTicketSearchChange(e, e.target.value)}
                  value={ticketSearchTerm}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <MessageIcon sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingData.tickets ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <TextField
              name="value"
              label="Valor"
              type="number"
              fullWidth
              value={formData.value}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
              }}
            />
            
            <TextField
              name="sku"
              label="SKU/Referência"
              fullWidth
              value={formData.sku}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formData.title.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Salvando...' : (card && card.id ? 'Atualizar' : 'Adicionar')}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CardForm;