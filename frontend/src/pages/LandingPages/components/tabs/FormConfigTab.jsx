import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  Paper,
  Chip,
  Badge,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIndicatorIcon,
  CheckCircle as RequiredIcon,
  Assignment as FormIcon,
  ViewList as PositionIcon,
  Title as TitleIcon,
  Send as SendIcon,
  PeopleAlt as PeopleIcon,
  PersonAddDisabled as LimitIcon,
  KeyboardTab as TabIcon,
  Info as InfoIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSpring, animated } from 'react-spring';
import FieldEditorDialog from '../dialogs/FieldEditorDialog';
import { generateRandomString } from '../../../../utils/stringUtils';

const AnimatedPaper = animated(Paper);
const AnimatedListItem = animated(ListItem);

const FormConfigTab = ({ landingPage, setLandingPage, form, setForm }) => {
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const theme = useTheme();

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

  // Efeito para garantir que o formulário tenha os campos padrão
  useEffect(() => {
    if (form.fields.length === 0) {
      // Adicionar campos padrão (nome, email, whatsapp)
      setForm(prev => ({
        ...prev,
        fields: [
          {
            id: `field_${generateRandomString(6)}`,
            name: 'name', // Nome técnico para processamento
            type: 'text',
            label: 'Nome',
            placeholder: 'Digite seu nome',
            required: true,
            order: 0
          },
          {
            id: `field_${generateRandomString(6)}`,
            name: 'email', // Nome técnico para processamento
            type: 'email',
            label: 'E-mail',
            placeholder: 'Digite seu e-mail',
            required: true,
            order: 1
          },
          {
            id: `field_${generateRandomString(6)}`,
            name: 'number', // Nome técnico number para número/telefone
            type: 'phone',
            label: 'WhatsApp',
            placeholder: '+55 XX XXXXX-XXXX',
            required: true,
            order: 2
          }
        ]
      }));
    }
  }, [form.fields.length, setForm]);

  const formFields = form.fields.sort((a, b) => a.order - b.order);

  // Handler para alternar exibição do formulário
  const handleToggleForm = (e) => {
    const showForm = e.target.checked;

    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        showForm
      }
    }));
  };

  // Handler para mudança na posição do formulário
  const handlePositionChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        position: e.target.value
      }
    }));
  };

  // Handler para mudança no título do formulário
  const handleTitleChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        title: e.target.value
      }
    }));

    // Atualizar também o nome do formulário
    setForm(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  // Handler para mudança no texto do botão
  const handleButtonTextChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        buttonText: e.target.value
      }
    }));
  };

  // Handler para mudança na cor do botão
  const handleButtonColorChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        buttonColor: e.target.value
      }
    }));
  };

  // Handler para mudança na cor do input ao focar
  const handleFocusColorChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        focusColor: e.target.value
      }
    }));
  };

  // Handler para alternar limitação de cadastros
  const handleToggleLimitSubmissions = (e) => {
    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        limitSubmissions: e.target.checked
      }
    }));
  };

  // Handler para mudança no limite de cadastros
  const handleMaxSubmissionsChange = (e) => {
    const value = parseInt(e.target.value) || 0;

    setLandingPage(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        maxSubmissions: value
      }
    }));
  };

  // Abrir editor de campo (novo ou edição)
  const handleOpenFieldEditor = (field = null) => {
    setEditingField(field);
    setShowFieldEditor(true);
  };

  // Fechar editor de campo
  const handleCloseFieldEditor = () => {
    setShowFieldEditor(false);
    setEditingField(null);
  };

  // Adicionar ou atualizar um campo
  const handleSaveField = (fieldData) => {
    if (editingField) {
      // Atualizar campo existente
      const updatedFields = form.fields.map(f =>
        f.id === editingField.id ? { ...fieldData, id: editingField.id } : f
      );

      setForm(prev => ({
        ...prev,
        fields: updatedFields
      }));
    } else {
      // Adicionar novo campo
      const newField = {
        ...fieldData,
        id: fieldData.id || `field_${generateRandomString(8)}`,
        order: form.fields.length
      };

      setForm(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }));
    }

    handleCloseFieldEditor();
  };

  // Remover um campo
  const handleDeleteField = (fieldId) => {
    const updatedFields = form.fields.filter(f => f.id !== fieldId);

    // Reordenar campos restantes
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index
    }));

    setForm(prev => ({
      ...prev,
      fields: reorderedFields
    }));
  };

  // Handler para reordenação por arrastar e soltar
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(form.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar ordem
    const updatedFields = items.map((field, index) => ({
      ...field,
      order: index
    }));

    setForm(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  // Função para obter ícone baseado no tipo de campo
  const getFieldTypeIcon = (type) => {
    const icons = {
      text: '🔤',
      email: '📧',
      phone: '📱',
      select: '📋',
      checkbox: '✓',
      radio: '⚪',
      date: '📅'
    };

    return icons[type] || '📄';
  };

  return (
    <AnimatedPaper
      elevation={0}
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%', // Usar altura total do container
        overflow: 'auto', // Habilitar scroll
        display: 'flex',
        flexDirection: 'column'
      }}
      style={fadeIn}
    >
      <Typography variant="h6" gutterBottom sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        color: 'primary.main',
        fontWeight: 600
      }}>
        <FormIcon sx={{ mr: 1 }} />
        Configurações do Formulário
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={landingPage.formConfig.showForm}
                    onChange={handleToggleForm}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="subtitle1">
                    {landingPage.formConfig.showForm ? "Exibir formulário de cadastro" : "Ocultar formulário de cadastro"}
                  </Typography>
                }
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                {landingPage.formConfig.showForm
                  ? "O formulário será exibido na landing page para captura de leads."
                  : "O formulário não será exibido na landing page."}
              </Typography>
            </Box>

            <Chip
              label={landingPage.formConfig.showForm ? "Formulário Ativo" : "Formulário Inativo"}
              color={landingPage.formConfig.showForm ? "primary" : "default"}
              variant={landingPage.formConfig.showForm ? "filled" : "outlined"}
              sx={{ height: 36 }}
            />
          </Box>
        </Grid>

        {landingPage.formConfig.showForm && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Posição do Formulário"
                value={landingPage.formConfig.position}
                onChange={handlePositionChange}
                variant="outlined"
                helperText="Define onde o formulário será exibido na página"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PositionIcon color="action" />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="left">Esquerda</MenuItem>
                <MenuItem value="right">Direita</MenuItem>
                <MenuItem value="center">Centralizado</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título do Formulário"
                value={landingPage.formConfig.title}
                onChange={handleTitleChange}
                variant="outlined"
                helperText="Título que aparecerá acima do formulário"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Texto do Botão"
                value={landingPage.formConfig.buttonText}
                onChange={handleButtonTextChange}
                variant="outlined"
                helperText="Texto que será exibido no botão de envio do formulário"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SendIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={landingPage.formConfig.limitSubmissions}
                      onChange={handleToggleLimitSubmissions}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Limitar cadastros</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Define um limite máximo de submissões do formulário
                      </Typography>
                    </Box>
                  }
                />

                {landingPage.formConfig.limitSubmissions && (
                  <TextField
                    type="number"
                    label="Máximo de cadastros"
                    value={landingPage.formConfig.maxSubmissions || ''}
                    onChange={handleMaxSubmissionsChange}
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 1 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ ml: 2, width: '180px' }}
                  />
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor do Botão"
                type="color"
                value={landingPage.formConfig.buttonColor || theme.palette.primary.main}
                onChange={handleButtonColorChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: landingPage.formConfig.buttonColor || theme.palette.primary.main,
                        border: `1px solid ${theme.palette.divider}`
                      }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor de Destaque dos Campos"
                type="color"
                value={landingPage.formConfig.focusColor || theme.palette.primary.main}
                onChange={handleFocusColorChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: landingPage.formConfig.focusColor || theme.palette.primary.main,
                        border: `1px solid ${theme.palette.divider}`
                      }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Campos do Formulário
                  <Badge
                    badgeContent={form.fields.length}
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenFieldEditor()}
                >
                  Adicionar Campo
                </Button>
              </Box>

              <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <List
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ p: 0 }}
                      >
                        {formFields.length > 0 ? (
                          formFields.map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <AnimatedListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  divider
                                  sx={{
                                    bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                    transition: 'background-color 0.2s ease',
                                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                                    '&:hover': {
                                      bgcolor: 'action.hover'
                                    }
                                  }}
                                >
                                  <Box
                                    {...provided.dragHandleProps}
                                    sx={{ display: 'flex', alignItems: 'center', mr: 1 }}
                                  >
                                    <DragIndicatorIcon color="action" />
                                  </Box>

                                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                    <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                      {getFieldTypeIcon(field.type)}
                                    </Typography>
                                  </Box>

                                  <ListItemText
                                    primary={
                                      <Box display="flex" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight={500}>
                                          {field.label}
                                        </Typography>
                                        {field.required && (
                                          <Tooltip title="Campo obrigatório">
                                            <RequiredIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
                                          </Tooltip>
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Box display="flex" alignItems="center" mt={0.5}>
                                        <Chip
                                          label={field.type}
                                          size="small"
                                          variant="outlined"
                                          color="primary"
                                          sx={{ mr: 1 }}
                                        />
                                        <Tooltip title="Nome técnico para processamento">
                                          <Chip
                                            label={field.name || field.id}
                                            size="small"
                                            variant="outlined"
                                            color="secondary"
                                            sx={{ mr: 1 }}
                                          />
                                        </Tooltip>
                                        {field.placeholder && (
                                          <Typography variant="caption" color="textSecondary">
                                            Placeholder: {field.placeholder}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />

                                  <ListItemSecondaryAction>
                                    <Tooltip title="Editar campo">
                                      <IconButton
                                        edge="end"
                                        color="primary"
                                        onClick={() => handleOpenFieldEditor(field)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Remover campo">
                                      <IconButton
                                        edge="end"
                                        color="error"
                                        onClick={() => handleDeleteField(field.id)}
                                        sx={{ ml: 1 }}
                                        disabled={['name', 'email', 'number'].includes(field.name)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </ListItemSecondaryAction>
                                </AnimatedListItem>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box textAlign="center" py={3}>
                                  <Typography variant="subtitle1" color="textSecondary">
                                    Nenhum campo adicionado
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Clique em 'Adicionar Campo' para começar
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        )}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
              </Paper>

              {formFields.length > 0 && (
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    <strong>Importante:</strong> Os campos Nome (name), E-mail (email) e WhatsApp (number) são campos do sistema
                    e são usados para criar o contato. Os campos adicionais serão salvos como informações extras do contato.
                  </Typography>
                </Alert>
              )}
            </Grid>
          </>
        )}
      </Grid>

      {/* Diálogo de edição de campo */}
      <FieldEditorDialog
        open={showFieldEditor}
        onClose={handleCloseFieldEditor}
        onSave={handleSaveField}
        field={editingField}
      />
    </AnimatedPaper>
  );
};

export default FormConfigTab;