import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
  Switch,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Input,
  Badge,
  Alert,
  useTheme,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Label as LabelIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { generateRandomString } from '../../../../utils/stringUtils';
import BaseModal from '../../../../components/BaseModal';
import { PhoneTextField } from '../PhoneNumberMask';

const FieldTypes = [
  { value: 'text', label: 'Texto', icon: '🔤' },
  { value: 'email', label: 'E-mail', icon: '📧' },
  { value: 'phone', label: 'Telefone', icon: '📱' },
  { value: 'select', label: 'Seleção', icon: '📋' },
  { value: 'checkbox', label: 'Caixa de Seleção', icon: '✓' },
  { value: 'radio', label: 'Opções Múltiplas', icon: '⚪' },
  { value: 'date', label: 'Data', icon: '📅' }
];

const ValidationRules = {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  phone: /^\+?[0-9\s\-()]{8,20}$/,
  text: /.+/,
  date: /.+/
};

const AnimatedBox = animated(Box);

const FieldEditorDialog = ({ open, onClose, onSave, field }) => {
  const [fieldData, setFieldData] = useState({
    id: '',
    name: '', // Novo campo para nome personalizado
    type: 'text',
    label: '',
    placeholder: '',
    required: true,
    options: [],
    validation: '',
    order: 0
  });
  
  const [newOption, setNewOption] = useState('');
  const [errors, setErrors] = useState({});
  const theme = useTheme();
  
  // Animações
  const fadeIn = useSpring({
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(20px)',
    config: { tension: 280, friction: 60 }
  });
  
  // Inicializar com dados do campo, se for edição
  useEffect(() => {
    if (field) {
      setFieldData({
        ...field,
        options: field.options || [],
        name: field.name || field.id // Use o name se existir, ou o id como fallback
      });
    } else {
      // Reset para valores padrão se for um novo campo
      const newId = generateRandomString(8);
      setFieldData({
        id: `field_${newId}`,
        name: `field_${newId}`,
        type: 'text',
        label: '',
        placeholder: '',
        required: true,
        options: [],
        validation: '',
        order: 0
      });
    }
    
    setErrors({});
    setNewOption('');
  }, [field, open]);
  
  // Handler para mudanças em campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo alterado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Atualizar automaticamente o nome do campo quando o rótulo for alterado
  useEffect(() => {
    // Só atualiza o nome se for um campo novo e o usuário não tiver definido manualmente
    if (!field && fieldData.label && !fieldData.customNameSet) {
      // Converte o rótulo para um formato de nome de campo (snake_case)
      const generatedName = fieldData.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      if (generatedName) {
        setFieldData(prev => ({
          ...prev,
          name: generatedName
        }));
      }
    }
  }, [fieldData.label, field, fieldData.customNameSet]);
  
  // Handler para quando o usuário edita manualmente o nome do campo
  const handleNameChange = (e) => {
    const value = e.target.value;
    
    // Formatar como identificador válido (somente letras, números e underscore)
    const formattedValue = value.replace(/[^a-z0-9_]/gi, '');
    
    setFieldData(prev => ({
      ...prev,
      name: formattedValue,
      customNameSet: true // Marca que o usuário definiu manualmente
    }));
    
    // Limpar erro
    if (errors.name) {
      setErrors(prev => ({
        ...prev,
        name: null
      }));
    }
  };
  
  // Handler para mudança na opção "required"
  const handleRequiredChange = (e) => {
    setFieldData(prev => ({
      ...prev,
      required: e.target.checked
    }));
  };
  
  // Handler para adicionar opção (para campos select, checkbox, radio)
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    setFieldData(prev => ({
      ...prev,
      options: [...prev.options, newOption.trim()]
    }));
    
    setNewOption('');
    
    // Limpar erro de opções se existir
    if (errors.options) {
      setErrors(prev => ({
        ...prev,
        options: null
      }));
    }
  };
  
  // Handler para remover opção
  const handleRemoveOption = (index) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };
  
  // Validar formulário antes de salvar
  const validateForm = () => {
    const newErrors = {};
    
    if (!fieldData.label.trim()) {
      newErrors.label = 'O rótulo do campo é obrigatório';
    }
    
    if (!fieldData.name.trim()) {
      newErrors.name = 'O nome do campo é obrigatório';
    }
    
    if (['select', 'checkbox', 'radio'].includes(fieldData.type) && fieldData.options.length === 0) {
      newErrors.options = 'Adicione pelo menos uma opção';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handler para salvar o campo
  const handleSave = () => {
    if (validateForm()) {
      // Atualizar o id do campo para ficar igual ao nome (para compatibilidade)
      const updatedFieldData = {
        ...fieldData,
        id: fieldData.name // Usar o name como id
      };
      onSave(updatedFieldData);
    }
  };
  
  // Handler para tecla Enter no campo de nova opção
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  // Ações para o Modal
  const modalActions = [
    {
      label: "Cancelar",
      onClick: onClose,
      variant: "outlined",
      color: "inherit"
    },
    {
      label: "Salvar",
      onClick: handleSave,
      variant: "contained",
      color: "primary",
      icon: <CheckCircleIcon />
    }
  ];
  
  // Renderizar campo adequado baseado no tipo selecionado
  const renderFieldPreview = () => {
    switch (fieldData.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={fieldData.label || "Rótulo do Campo"}
            placeholder={fieldData.placeholder}
            disabled
            required={fieldData.required}
            margin="normal"
            variant="outlined"
            InputProps={{
              style: {
                borderColor: theme.palette.primary.main
              }
            }}
          />
        );
      case 'email':
        return (
          <TextField
            fullWidth
            type="email"
            label={fieldData.label || "E-mail"}
            placeholder={fieldData.placeholder}
            disabled
            required={fieldData.required}
            margin="normal"
            variant="outlined"
            InputProps={{
              style: {
                borderColor: theme.palette.primary.main
              }
            }}
          />
        );
      case 'phone':
        return (
          <PhoneTextField
            label={fieldData.label || "Telefone"}
            placeholder={fieldData.placeholder}
            value=""
            onChange={() => {}}
            name="phone-preview"
            required={fieldData.required}
            margin="normal"
            disabled
            InputProps={{
              style: {
                borderColor: theme.palette.primary.main
              }
            }}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth margin="normal" disabled>
            <InputLabel>{fieldData.label || "Seleção"}</InputLabel>
            <Select
              label={fieldData.label || "Seleção"}
              placeholder={fieldData.placeholder}
              disabled
              required={fieldData.required}
              InputProps={{
                style: {
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              {fieldData.options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'checkbox':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {fieldData.label || "Caixa de Seleção"}
              {fieldData.required && <span style={{ color: theme.palette.error.main }}> *</span>}
            </Typography>
            {fieldData.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={<Switch disabled />}
                label={option}
                sx={{ display: 'block', mb: 1 }}
              />
            ))}
          </Box>
        );
      case 'radio':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {fieldData.label || "Opções Múltiplas"}
              {fieldData.required && <span style={{ color: theme.palette.error.main }}> *</span>}
            </Typography>
            {fieldData.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={<input type="radio" disabled />}
                label={option}
                sx={{ display: 'block', mb: 1 }}
              />
            ))}
          </Box>
        );
      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={fieldData.label || "Data"}
            placeholder={fieldData.placeholder}
            disabled
            required={fieldData.required}
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              style: {
                borderColor: theme.palette.primary.main
              }
            }}
          />
        );
      default:
        return (
          <TextField
            fullWidth
            label={fieldData.label || "Campo"}
            placeholder={fieldData.placeholder}
            disabled
            required={fieldData.required}
            margin="normal"
            variant="outlined"
            InputProps={{
              style: {
                borderColor: theme.palette.primary.main
              }
            }}
          />
        );
    }
  };
  
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={field ? 'Editar Campo' : 'Adicionar Novo Campo'}
      actions={modalActions}
    >
      <AnimatedBox style={fadeIn}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Tipo de Campo</InputLabel>
              <Select
                name="type"
                value={fieldData.type}
                onChange={handleChange}
                label="Tipo de Campo"
              >
                {FieldTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body1" sx={{ mr: 1, fontSize: '1.2rem' }}>
                        {type.icon}
                      </Typography>
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rótulo do Campo"
              name="label"
              value={fieldData.label}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={!!errors.label}
              helperText={errors.label || 'Texto que aparecerá acima do campo'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LabelIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>

          {/* NOVO CAMPO - Nome do campo para processamento */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome do Campo (ID)"
              name="name"
              value={fieldData.name}
              onChange={handleNameChange}
              variant="outlined"
              margin="normal"
              error={!!errors.name}
              helperText={errors.name || 'Identificador único usado para processar os dados do formulário'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              required
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              O nome do campo deve ser único e será usado para identificar os dados no processamento do formulário.
              Use apenas letras, números e underscore (_).
            </Alert>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Placeholder"
              name="placeholder"
              value={fieldData.placeholder}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              helperText="Texto de exemplo dentro do campo (opcional)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={fieldData.required}
                  onChange={handleRequiredChange}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Campo obrigatório</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Se ativado, o usuário precisará preencher este campo
                  </Typography>
                </Box>
              }
            />
          </Grid>
          
          {/* Opções para campos select, checkbox e radio */}
          {['select', 'checkbox', 'radio'].includes(fieldData.type) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Opções
                </Typography>
                <Badge
                  badgeContent={fieldData.options.length}
                  color="primary"
                  sx={{ ml: 1 }}
                />
                <Tooltip title="Adicione as opções que o usuário poderá escolher">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  label="Nova opção"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  variant="outlined"
                  onKeyPress={handleKeyPress}
                  error={!!errors.options}
                  helperText={errors.options}
                  placeholder="Digite e pressione Enter para adicionar"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddOption}
                  disabled={!newOption.trim()}
                  startIcon={<AddIcon />}
                  sx={{ ml: 1, height: '56px' }}
                >
                  Adicionar
                </Button>
              </Box>
              
              <Box>
                {fieldData.options.length > 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    bgcolor: 'background.default'
                  }}>
                    {fieldData.options.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        onDelete={() => handleRemoveOption(index)}
                        color="primary"
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Alert 
                    severity="info" 
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  >
                    <Typography variant="body2">
                      Nenhuma opção adicionada. Adicione pelo menos uma opção.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Grid>
          )}
          
          {/* Validação personalizada para campos específicos */}
          {['text', 'email', 'phone'].includes(fieldData.type) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Validação personalizada (opcional)"
                name="validation"
                value={fieldData.validation}
                onChange={handleChange}
                variant="outlined"
                margin="normal"
                helperText={
                  fieldData.type === 'email' 
                    ? 'Padrão de e-mail será aplicado automaticamente' 
                    : fieldData.type === 'phone' 
                      ? 'Padrão de telefone será aplicado automaticamente'
                      : 'Expressão regular ou regra de validação (opcional)'
                }
                disabled={['email', 'phone'].includes(fieldData.type)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}
          
          {/* Visualização do campo */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Pré-visualização
            </Typography>
            <Box 
              sx={{ 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2,
                bgcolor: 'background.paper'
              }}
            >
              {renderFieldPreview()}
            </Box>
          </Grid>
        </Grid>
      </AnimatedBox>
    </BaseModal>
  );
};

export default FieldEditorDialog;