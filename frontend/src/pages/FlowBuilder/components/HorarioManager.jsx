import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  useMediaQuery,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
  Select,
  InputLabel
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HorarioManager = ({ onGroupsUpdated, groups }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [filteredHorarios, setFilteredHorarios] = useState([]);
  const [activeGroupFilter, setActiveGroupFilter] = useState(null);
  const [horarioFormOpen, setHorarioFormOpen] = useState(false);
  const [currentHorario, setCurrentHorario] = useState(null);
  const [errors, setErrors] = useState({});
  const [visibleErrors, setVisibleErrors] = useState(false);
  const [isCreatingHorario, setIsCreatingHorario] = useState(false);
  
  const [horarioForm, setHorarioForm] = useState({
    type: 'day',
    date: format(new Date(), "yyyy-MM-dd"),
    weekdays: [],
    startTime: "08:00",
    endTime: "18:00",
    workedDay: true,
    description: "",
    horarioGroupId: null
  });
  
  // Lista de dias da semana para os checkboxes
  const weekdaysList = [
    { value: 'domingo', label: 'Domingo' },
    { value: 'segunda-feira', label: 'Segunda-feira' },
    { value: 'terça-feira', label: 'Terça-feira' },
    { value: 'quarta-feira', label: 'Quarta-feira' },
    { value: 'quinta-feira', label: 'Quinta-feira' },
    { value: 'sexta-feira', label: 'Sexta-feira' },
    { value: 'sábado', label: 'Sábado' }
  ];
  
  const loadHorarios = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const { data } = await api.get('/horarios');
      
      if (data && Array.isArray(data.horarios)) {
        setHorarios(data.horarios);
        
        if (activeGroupFilter) {
          const filtered = data.horarios.filter(horario => horario.horarioGroupId === activeGroupFilter);
          setFilteredHorarios(filtered);
        } else {
          setFilteredHorarios(data.horarios);
        }
      } else {
        console.warn('Formato de dados inválido na resposta da API de horários');
        setHorarios([]);
        setFilteredHorarios([]);
        toast.warning('A resposta da API não contém horários válidos');
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setHorarios([]);
      setFilteredHorarios([]);
      const errorMessage = error.response?.data?.error || 'Não foi possível carregar a lista de horários';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeGroupFilter, loading]); // Remova outras dependências desnecessárias
  
  // Controle de carregamento apenas quando necessário
  useEffect(() => {
    // Implementação de debounce para evitar múltiplas chamadas
    const debounceTimer = setTimeout(() => {
      loadHorarios();
    }, 300);
    
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [loadHorarios, activeGroupFilter]);
  
  const filterHorariosByGroup = (groupId) => {
    // Converte para número ou null se for string vazia
    const groupIdNumber = groupId === '' ? null : Number(groupId);
    
    if (!groupIdNumber) {
      setFilteredHorarios(horarios);
      setActiveGroupFilter(null);
    } else {
      const filtered = horarios.filter(horario => horario.horarioGroupId === groupIdNumber);
      setFilteredHorarios(filtered);
      setActiveGroupFilter(groupIdNumber);
    }
  };
  
  // Manipuladores para o formulário de horário
  const handleHorarioFormChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    setHorarioForm((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Manipulador para checkboxes de dias da semana
  const handleWeekdayChange = (weekday) => (event) => {
    const isChecked = event.target.checked;
    
    setHorarioForm((prev) => {
      if (isChecked) {
        // Adicionar o dia da semana se não estiver na lista
        return {
          ...prev,
          weekdays: prev.weekdays.includes(weekday) 
            ? prev.weekdays 
            : [...prev.weekdays, weekday]
        };
      } else {
        // Remover o dia da semana da lista
        return {
          ...prev,
          weekdays: prev.weekdays.filter(day => day !== weekday)
        };
      }
    });
  };
  
  const handleOpenHorarioForm = (horario = null) => {
    // Limpar erros
    setErrors({});
    setVisibleErrors(false);
    
    if (horario) {
      setCurrentHorario(horario);
      setHorarioForm({
        type: horario.type || 'day',
        date: horario.date,
        weekdays: horario.weekdays || [],
        startTime: horario.startTime,
        endTime: horario.endTime,
        workedDay: horario.workedDay,
        description: horario.description || '',
        horarioGroupId: horario.horarioGroupId || null
      });
      setIsCreatingHorario(false);
    } else {
      setCurrentHorario(null);
      setHorarioForm({
        type: 'day',
        date: format(new Date(), "yyyy-MM-dd"),
        weekdays: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira'],
        startTime: "08:00",
        endTime: "18:00",
        workedDay: true,
        description: "",
        horarioGroupId: activeGroupFilter || null
      });
      setIsCreatingHorario(true);
    }
    setHorarioFormOpen(true);
  };
  
  const handleCloseHorarioForm = () => {
    setHorarioFormOpen(false);
    setCurrentHorario(null);
    setErrors({});
    setVisibleErrors(false);
  };
  
  // Função para validação do formulário de horário
  const validateHorarioForm = () => {
    const errors = {};
    
    if (!horarioForm.type) {
      errors.type = 'Tipo é obrigatório';
    }
    
    if ((horarioForm.type === 'day' || horarioForm.type === 'specific') && !horarioForm.date) {
      errors.date = 'Data é obrigatória para este tipo de horário';
    }
    
    if (horarioForm.type === 'weekdays' && (!horarioForm.weekdays || horarioForm.weekdays.length === 0)) {
      errors.weekdays = 'Selecione pelo menos um dia da semana';
    }
    
    if (!horarioForm.startTime) {
      errors.startTime = 'Horário inicial é obrigatório';
    }
    
    if (!horarioForm.endTime) {
      errors.endTime = 'Horário final é obrigatório';
    } else if (horarioForm.startTime && horarioForm.endTime <= horarioForm.startTime) {
      errors.endTime = 'O horário final deve ser maior que o horário inicial';
    }
    
    return errors;
  };
  
  const handleSaveHorario = async () => {
    const formErrors = validateHorarioForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setVisibleErrors(true);
      
      // Mostrar toast com resumo dos erros
      toast.error(`Por favor, corrija os seguintes erros: ${Object.values(formErrors).join(', ')}`);
      return;
    }
    
    try {
      setLoading(true);
      
      if (isCreatingHorario) {
        await api.post('/horarios', horarioForm);
        toast.success('Horário criado com sucesso!');
      } else if (currentHorario) {
        await api.put(`/horarios/${currentHorario.id}`, horarioForm);
        toast.success('Horário atualizado com sucesso!');
      }
      
      await loadHorarios();
      if (onGroupsUpdated) {
        onGroupsUpdated();
      }
      handleCloseHorarioForm();
    } catch (error) {
      console.error('Erro ao processar operação de horário:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao processar operação de horário';
      toast.error(errorMessage);
      
      // Mostrar erros de validação se houver
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setVisibleErrors(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteHorario = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        setLoading(true);
        await api.delete(`/horarios/${id}`);
        toast.success('Horário excluído com sucesso!');
        await loadHorarios();
        if (onGroupsUpdated) {
          onGroupsUpdated();
        }
      } catch (error) {
        console.error('Erro ao excluir horário:', error);
        const errorMessage = error.response?.data?.error || 'Erro ao excluir horário';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Adicionar T12:00:00 para garantir que o fuso horário não afete a data
      const date = new Date(`${dateString}T12:00:00`);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };
  
  // Formatar horário
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // Assumindo que timeString está no formato HH:MM:SS
      return timeString.substring(0, 5); // Retorna apenas HH:MM
    } catch (error) {
      console.error('Erro ao formatar hora:', error);
      return timeString;
    }
  };
  
  // Obter nome do grupo pelo ID
  const getGroupNameById = (groupId) => {
    if (!groupId) return '';
    const group = groups?.find(g => g.id === groupId);
    return group ? group.name : '';
  };
  
  // Formatação do tipo de horário
  const formatScheduleType = (type) => {
    const typeMap = {
      'day': 'Dia específico',
      'weekdays': 'Dias da semana',
      'annual': 'Data anual',
      'specific': 'Data específica'
    };
    return typeMap[type] || type;
  };
  
  // Formatação dos dias da semana
  const formatWeekdays = (weekdays) => {
    if (!weekdays || weekdays.length === 0) return '';
    
    const shortNames = {
      'domingo': 'Dom',
      'segunda-feira': 'Seg',
      'terça-feira': 'Ter',
      'quarta-feira': 'Qua',
      'quinta-feira': 'Qui',
      'sexta-feira': 'Sex',
      'sábado': 'Sáb'
    };
    
    return weekdays.map(day => shortNames[day] || day).join(', ');
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          select
          label="Filtrar por Grupo"
          value={activeGroupFilter || ''}
          onChange={(e) => filterHorariosByGroup(e.target.value ? Number(e.target.value) : null)}
          variant="outlined"
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value="">
            <em>Todos os Horários</em>
          </MenuItem>
          {groups && groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </TextField>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenHorarioForm()}
          disabled={loading}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Novo Horário
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredHorarios.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 3, 
          bgcolor: alpha(theme.palette.background.default, 0.5),
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1
        }}>
          <CalendarIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            {activeGroupFilter 
              ? `Nenhum horário cadastrado para este grupo` 
              : `Nenhum horário cadastrado`
            }
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Adicione um novo horário para começar
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenHorarioForm()}
            disabled={loading}
          >
            Adicionar Horário
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          }, 
          gap: 2,
          maxHeight: isMobile ? '100%' : '400px', 
          overflow: 'auto' 
        }}>
          {filteredHorarios.map((horario) => (
            <Paper 
              key={horario.id}
              elevation={2}
              sx={{
                p: 2,
                bgcolor: theme.palette.background.paper,
                borderRadius: 1,
                transition: 'all 0.2s ease',
                borderLeft: horario.workedDay 
                  ? `4px solid ${theme.palette.success.main}` 
                  : `4px solid ${theme.palette.warning.main}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {formatScheduleType(horario.type)}
                </Typography>
                <Box>
                  <Tooltip title="Editar horário" arrow>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenHorarioForm(horario)}
                      color="primary"
                      disabled={loading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir horário" arrow>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteHorario(horario.id)}
                      color="error"
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {(horario.type === 'day' || horario.type === 'specific' || horario.type === 'annual') && (
                <Typography variant="body2">
                  <strong>Data:</strong> {formatDate(horario.date)}
                </Typography>
              )}
              
              {horario.type === 'weekdays' && (
                <Typography variant="body2">
                  <strong>Dias:</strong> {formatWeekdays(horario.weekdays)}
                </Typography>
              )}
              
              <Typography variant="body2">
                <strong>Horário:</strong> {formatTime(horario.startTime)} até {formatTime(horario.endTime)}
              </Typography>
              
              <Typography variant="body2">
                <strong>Tipo:</strong> {horario.workedDay ? 'Dia de trabalho' : 'Dia de folga'}
              </Typography>
              
              {horario.horarioGroupId && (
                <Typography variant="body2">
                  <strong>Grupo:</strong> {getGroupNameById(horario.horarioGroupId)}
                </Typography>
              )}
              
              {horario.description && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  <strong>Descrição:</strong> {horario.description}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}
      
      {/* Modal de criação/edição de horário */}
      <Dialog 
        open={horarioFormOpen} 
        onClose={handleCloseHorarioForm}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {isCreatingHorario ? 'Novo Horário' : 'Editar Horário'}
          <IconButton size="small" onClick={handleCloseHorarioForm}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {visibleErrors && Object.keys(errors).length > 0 && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, mt: 1 }}
            >
              <Typography variant="subtitle2">Por favor, corrija os seguintes erros:</Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                {Object.entries(errors).map(([field, message]) => (
                  <Box component="li" key={field}>
                    <Typography variant="body2">{message}</Typography>
                  </Box>
                ))}
              </Box>
            </Alert>
          )}
          
          <Box sx={{ mt: 1 }}>
            <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>Tipo</FormLabel>
              <RadioGroup
                row
                name="type"
                value={horarioForm.type}
                onChange={handleHorarioFormChange('type')}
              >
                <FormControlLabel value="day" control={<Radio />} label="Dia" />
                <FormControlLabel value="weekdays" control={<Radio />} label="Dias da semana" />
                <FormControlLabel value="annual" control={<Radio />} label="Anual" />
                <FormControlLabel value="specific" control={<Radio />} label="Data específica" />
              </RadioGroup>
            </FormControl>
            
            {/* Campos específicos por tipo */}
            {(horarioForm.type === 'day' || horarioForm.type === 'specific' || horarioForm.type === 'annual') && (
              <TextField
                fullWidth
                label="Data"
                type="date"
                value={horarioForm.date}
                onChange={handleHorarioFormChange('date')}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
            )}
            
            {horarioForm.type === 'weekdays' && (
              <Box sx={{ mb: 2 }}>
                <FormLabel component="legend" sx={{ mb: 1 }}>Dias da Semana</FormLabel>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {weekdaysList.map((day) => (
                    <FormControlLabel
                      key={day.value}
                      control={
                        <Checkbox
                          checked={horarioForm.weekdays.includes(day.value)}
                          onChange={handleWeekdayChange(day.value)}
                          name={day.value}
                        />
                      }
                      label={day.label}
                    />
                  ))}
                </Box>
                {errors.weekdays && (
                  <Typography color="error" variant="caption">
                    {errors.weekdays}
                  </Typography>
                )}
              </Box>
            )}
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="dia-trabalhado-label">Dia trabalhado?</InputLabel>
              <Select
                labelId="dia-trabalhado-label"
                value={horarioForm.workedDay}
                onChange={handleHorarioFormChange('workedDay')}
                label="Dia trabalhado?"
              >
                <MenuItem value={true}>Sim</MenuItem>
                <MenuItem value={false}>Não</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="Hora Inicial"
                type="time"
                value={horarioForm.startTime}
                onChange={handleHorarioFormChange('startTime')}
                error={!!errors.startTime}
                helperText={errors.startTime}
                InputLabelProps={{ shrink: true }}
                required
              />
              
              <TextField
                fullWidth
                label="Hora Final"
                type="time"
                value={horarioForm.endTime}
                onChange={handleHorarioFormChange('endTime')}
                error={!!errors.endTime}
                helperText={errors.endTime}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
            
            <TextField
              select
              fullWidth
              label="Grupo de Horários"
              value={horarioForm.horarioGroupId || ''}
              onChange={handleHorarioFormChange('horarioGroupId')}
              margin="normal"
            >
              <MenuItem value="">
                <em>Nenhum grupo</em>
              </MenuItem>
              {groups && groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name} {group.isDefault ? " (Padrão)" : ""}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Descrição (opcional)"
              multiline
              rows={3}
              value={horarioForm.description}
              onChange={handleHorarioFormChange('description')}
              margin="normal"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={handleCloseHorarioForm} 
            color="inherit" 
            disabled={loading}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveHorario} 
            color="primary" 
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HorarioManager;