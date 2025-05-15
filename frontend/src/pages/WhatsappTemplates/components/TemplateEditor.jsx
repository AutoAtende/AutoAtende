import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Button,
  Stack,
  FormHelperText,
  Tooltip,
  AppBar,
  Toolbar,
  Switch,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
  Reply as ReplyIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatStrikethrough as FormatStrikethroughIcon,
  Code as CodeIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoCameraBack as VideoIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { toast } from '../../../helpers/toast';
import api from '../../../services/api';

const AnimatedBox = animated(Box);

const SUPPORTED_LANGUAGES = [
  { code: "pt_BR", name: "Português (Brasil)" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" }
];

const CATEGORIES = [
  { 
    value: "UTILITY", 
    label: "Utilitário",
    description: "Modelos que facilitam conversas sobre uma transação já realizada ou em andamento. Incluem confirmações, visualizações de status e notificações de pós-venda."
  },
  { 
    value: "MARKETING", 
    label: "Marketing",
    description: "Modelos para promoções, ofertas, novidades ou qualquer chamada para novas conversas."
  },
  { 
    value: "AUTHENTICATION", 
    label: "Autenticação",
    description: "Modelos para envio de códigos de verificação e autenticação."
  }
];

const BUTTON_TYPES = [
  { value: "QUICK_REPLY", label: "Resposta Rápida" },
  { value: "URL", label: "Visitar website" },
  { value: "PHONE_NUMBER", label: "Ligar" }
];

const MAX_CHARS = {
  header: 60,
  body: 1024,
  footer: 60,
  buttonText: 25
};

const TemplateEditor = ({ open, onClose, template, mode }) => {
  const [formData, setFormData] = useState({
    name: "",
    language: "pt_BR",
    category: "",
    headerEnabled: false,
    headerType: "text",
    headerContent: {
      text: "",
      media: null
    },
    body: "",
    bodyExample: [],
    footer: "",
    footerEnabled: false,
    buttons: [],
    buttonsEnabled: false,
    restrictToGroups: false,
    groups: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCategoryTooltip, setShowCategoryTooltip] = useState(false);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 400 }
  });

  useEffect(() => {
    if (template && (mode === "edit" || mode === "view")) {
      const headerEnabled = !!template.header;
      let headerType = "text";
      let headerContent = { text: "", media: null };

      if (template.header) {
        if (template.header.type === "TEXT") {
          headerType = "text";
          headerContent.text = template.header.text;
        } else {
          headerType = template.header.type.toLowerCase();
          headerContent.media = template.header.media;
        }
      }

      setFormData({
        ...template,
        headerEnabled,
        headerType,
        headerContent,
        footerEnabled: !!template.footer,
        buttonsEnabled: template.buttons?.length > 0,
        buttons: template.buttons || [],
        restrictToGroups: template.groups?.length > 0,
        groups: template.groups || []
      });
    }
  }, [template, mode]);

  const handleHeaderTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      headerType: type,
      headerContent: {
        text: "",
        media: null
      }
    }));
    setErrors(prev => ({ ...prev, header: undefined }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const maxSizes = {
      image: 5, // 5MB
      video: 16, // 16MB
      document: 100 // 100MB
    };

    const fileType = formData.headerType;
    const fileSize = file.size / (1024 * 1024); // Convert to MB

    if (fileSize > maxSizes[fileType]) {
      setErrors(prev => ({
        ...prev,
        header: `Arquivo muito grande. Máximo permitido: ${maxSizes[fileType]}MB`
      }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData);

      setFormData(prev => ({
        ...prev,
        headerContent: {
          ...prev.headerContent,
          media: {
            id: response.data.id,
            filename: file.name,
            type: file.type,
            url: response.data.url
          }
        }
      }));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        header: "Erro ao fazer upload do arquivo"
      }));
      toast.error('Erro ao fazer upload do arquivo');
    }
  };

  const handleAddButton = () => {
    if (formData.buttons.length < 3) {
      setFormData(prev => ({
        ...prev,
        buttons: [...prev.buttons, {
          type: "QUICK_REPLY",
          text: "",
          value: ""
        }]
      }));
    }
  };

  const handleRemoveButton = (index) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

  const handleButtonChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) => 
        i === index ? { ...button, [field]: value } : button
      )
    }));
    
    if (errors[`buttons.${index}.${field}`]) {
      setErrors(prev => ({ ...prev, [`buttons.${index}.${field}`]: undefined }));
    }
  };

  const handleFormatText = (format) => {
    const input = document.getElementById('body-input');
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = formData.body;

    let prefix = '';
    let suffix = '';

    switch (format) {
      case 'bold':
        prefix = '*';
        suffix = '*';
        break;
      case 'italic':
        prefix = '_';
        suffix = '_';
        break;
      case 'strikethrough':
        prefix = '~';
        suffix = '~';
        break;
      case 'code':
        prefix = '```';
        suffix = '```';
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
    setFormData(prev => ({ ...prev, body: newText }));
  };

  const handleAddVariable = (field) => {
    const input = document.getElementById(`${field}-input`);
    if (!input) return;

    const cursorPos = input.selectionStart;
    const currentText = formData[field];
    const nextVarNumber = (currentText.match(/{{[0-9]+}}/g) || []).length + 1;
    
    const newText = 
      currentText.substring(0, cursorPos) + 
      `{{${nextVarNumber}}}` + 
      currentText.substring(cursorPos);
    
    setFormData(prev => ({ ...prev, [field]: newText }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.category) newErrors.category = "Categoria é obrigatória";
    if (!formData.body) newErrors.body = "Corpo da mensagem é obrigatório";

    if (formData.headerEnabled && formData.headerType === "text" && !formData.headerContent.text) {
      newErrors.header = "Texto do cabeçalho é obrigatório";
    }

    if (formData.buttonsEnabled) {
      formData.buttons.forEach((button, index) => {
        if (!button.text) {
          newErrors[`buttons.${index}.text`] = "Texto do botão é obrigatório";
        }
        if (button.type === "URL" && !button.url) {
          newErrors[`buttons.${index}.url`] = "URL é obrigatória";
        }
        if (button.type === "PHONE_NUMBER" && !button.phone_number) {
          newErrors[`buttons.${index}.phone_number`] = "Número de telefone é obrigatório";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    try {
      setLoading(true);

      const templateData = {
        name: formData.name,
        language: formData.language,
        category: formData.category,
        header: formData.headerEnabled ? {
          type: formData.headerType.toUpperCase(),
          ...(formData.headerType === "text" 
            ? { text: formData.headerContent.text }
            : { media: formData.headerContent.media }
          )
        } : null,
        body: formData.body,
        footer: formData.footerEnabled ? formData.footer : null,
        buttons: formData.buttonsEnabled ? formData.buttons : [],
        groups: formData.restrictToGroups ? formData.groups : []
      };

      if (mode === "edit") {
        await api.put(`/templates/${template.id}`, templateData);
        toast.success("Template atualizado com sucesso!");
      } else {
        await api.post("/templates", templateData);
        toast.success("Template criado com sucesso!");
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao salvar o template");
    } finally {
      setLoading(false);
    }
  };

  const renderHeaderField = () => {
    if (!formData.headerEnabled) return null;

    switch (formData.headerType) {
      case "text":
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              id="header-input"
              multiline
              rows={2}
              fullWidth
              value={formData.headerContent.text}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                headerContent: { ...prev.headerContent, text: e.target.value }
              }))}
              placeholder="Digite o texto do cabeçalho"
              disabled={mode === "view"}
              error={!!errors.header}
              helperText={errors.header || `${formData.headerContent.text.length}/${MAX_CHARS.header} caracteres`}
              InputProps={{
                endAdornment: (
                  <Button
                    size="small"
                    onClick={() => handleAddVariable('headerContent.text')}
                    disabled={mode === "view"}
                  >
                    + Adicionar variável
                  </Button>
                )
              }}
            />
          </Box>
        );

      case "image":
      case "video":
      case "document":
        return (
          <Box sx={{ mt: 2 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: mode === "view" ? 'default' : 'pointer'
              }}
              onClick={() => {
                if (mode !== "view") {
                  document.getElementById('file-upload').click();
                }
              }}
            >
              {formData.headerContent.media ? (
                <Box>
                  {formData.headerType === "image" && (
                    <img
                      src={formData.headerContent.media.url}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 200 }}
                    />
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formData.headerContent.media.filename}
                  </Typography>
                  {mode !== "view" && (
                    <Button
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({
                          ...prev,
                          headerContent: { ...prev.headerContent, media: null }
                        }));
                      }}
                    >
                      Remover arquivo
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  {formData.headerType === "image" && <ImageIcon sx={{ fontSize: 48 }} />}
                  {formData.headerType === "video" && <VideoIcon sx={{ fontSize: 48 }} />}
                  {formData.headerType === "document" && <DocumentIcon sx={{ fontSize: 48 }} />}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Clique para fazer upload de {
                      formData.headerType === "image" ? "imagem" :
                      formData.headerType === "video" ? "vídeo" :
                      "documento"
                    }
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formData.headerType === "image" && "Formatos: JPG, PNG, WEBP - Máx: 5MB"}
                    {formData.headerType === "video" && "Formatos: MP4, MOV - Máx: 16MB"}
                    {formData.headerType === "document" && "Formatos: PDF, DOC - Máx: 100MB"}
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                id="file-upload"
                hidden
                accept={
                  formData.headerType === "image" ? "image/*" :
                  formData.headerType === "video" ? "video/*" :
                  ".pdf,.doc,.docx"
                }
                onChange={(e) => handleFileUpload(e.target.files[0])}
                disabled={mode === "view"}
              />
            </Paper>
            {errors.header && (
              <FormHelperText error>{errors.header}</FormHelperText>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth 
      maxWidth="lg"
      PaperProps={{
        sx: { 
          height: '90vh',
          m: 2
        }
      }}
    >
      <AppBar position="relative" color="primary" elevation={0} sx={{ 
        borderBottom: '1px solid #e0e0e0',
        bgcolor: 'background.paper'
      }}>
        <Toolbar>
          <Stack direction="row" spacing={1} alignItems="center">
            <WhatsAppIcon color="primary" />
            <Typography variant="h6">
              {mode === "edit" ? "Editar Template" : mode === "view" ? "Visualizar Template" : "Novo Template"}
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
        {/* Formulário */}
        <Box sx={{ 
          flex: '1 1 60%', 
          p: 3,
          overflowY: 'auto',
          borderRight: '1px solid #e0e0e0'
        }}>
          <Stack spacing={3}>
            {/* Nome e Idioma */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Nome"
                name="name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={mode === "view"}
                error={!!errors.name}
                helperText={errors.name}
              />
              
              <FormControl fullWidth error={!!errors.language}>
                <InputLabel>Idioma</InputLabel>
                <Select
                  value={formData.language}
                  label="Idioma"
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  disabled={mode === "view"}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.language && (
                  <FormHelperText>{errors.language}</FormHelperText>
                )}
              </FormControl>
            </Stack>

            {/* Categoria */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selecione a categoria
              </Typography>
              <Stack spacing={1}>
                {CATEGORIES.map((cat) => (
                  <Paper
                    key={cat.value}
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: mode === "view" ? 'default' : 'pointer',
                      bgcolor: formData.category === cat.value ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: mode !== "view" ? 'action.hover' : undefined
                      }
                    }}
                    onClick={() => {
                      if (mode !== "view") {
                        setFormData(prev => ({ ...prev, category: cat.value }));
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Radio
                        checked={formData.category === cat.value}
                        disabled={mode === "view"}
                      />
                      <Box>
                        <Typography variant="subtitle2">{cat.label}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {cat.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              {errors.category && (
                <FormHelperText error>{errors.category}</FormHelperText>
              )}
            </Box>

            {/* Cabeçalho */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Cabeçalho</Typography>
                <Switch
                  checked={formData.headerEnabled}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    headerEnabled: e.target.checked,
                    headerContent: { text: "", media: null }
                  }))}
                  disabled={mode === "view"}
                />
              </Stack>
              
              {formData.headerEnabled && (
                <>
                  <RadioGroup
                    row
                    value={formData.headerType}
                    onChange={(e) => handleHeaderTypeChange(e.target.value)}
                  >
                    <FormControlLabel 
                      value="text" 
                      control={<Radio disabled={mode === "view"} />} 
                      label="Texto" 
                    />
                    <FormControlLabel 
                      value="image" 
                      control={<Radio disabled={mode === "view"} />} 
                      label="Imagem" 
                    />
                    <FormControlLabel 
                      value="video" 
                      control={<Radio disabled={mode === "view"} />} 
                      label="Vídeo" 
                    />
                    <FormControlLabel 
                      value="document" 
                      control={<Radio disabled={mode === "view"} />} 
                      label="Documento" 
                    />
                  </RadioGroup>
                  {renderHeaderField()}
                </>
              )}
            </Box>

            {/* Corpo da mensagem */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Corpo da mensagem
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small"
                      onClick={() => handleFormatText('bold')}
                      disabled={mode === "view"}
                    >
                      <FormatBoldIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleFormatText('italic')}
                      disabled={mode === "view"}
                    >
                      <FormatItalicIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleFormatText('strikethrough')}
                      disabled={mode === "view"}
                    >
                      <FormatStrikethroughIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleFormatText('code')}
                      disabled={mode === "view"}
                    >
                      <CodeIcon />
                    </IconButton>
                  </Stack>
                </Box>
                <TextField
                  id="body-input"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Digite o texto da mensagem"
                  disabled={mode === "view"}
                  error={!!errors.body}
                  helperText={errors.body || `${formData.body.length}/${MAX_CHARS.body} caracteres`}
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        onClick={() => handleAddVariable('body')}
                        disabled={mode === "view"}
                      >
                        + Adicionar variável
                      </Button>
                    )
                  }}
                />
              </Stack>
            </Box>

            {/* Rodapé */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Rodapé</Typography>
                <Switch
                  checked={formData.footerEnabled}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    footerEnabled: e.target.checked,
                    footer: ""
                  }))}
                  disabled={mode === "view"}
                />
              </Stack>
              
              {formData.footerEnabled && (
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  value={formData.footer}
                  onChange={(e) => setFormData(prev => ({ ...prev, footer: e.target.value }))}
                  placeholder="Digite o texto do rodapé"
                  disabled={mode === "view"}
                  error={!!errors.footer}
                  helperText={`${formData.footer.length}/${MAX_CHARS.footer} caracteres`}
                />
              )}
            </Box>

            {/* Botões */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Botões</Typography>
                <Switch
                  checked={formData.buttonsEnabled}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    buttonsEnabled: e.target.checked,
                    buttons: []
                  }))}
                  disabled={mode === "view"}
                />
              </Stack>
              
              {formData.buttonsEnabled && (
                <Stack spacing={2}>
                  {formData.buttons.map((button, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                          <FormControl fullWidth>
                            <InputLabel>Tipo de botão</InputLabel>
                            <Select
                              value={button.type}
                              label="Tipo de botão"
                              onChange={(e) => handleButtonChange(index, 'type', e.target.value)}
                              disabled={mode === "view"}
                            >
                              {BUTTON_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <TextField
                            label="Texto do botão"
                            fullWidth
                            value={button.text}
                            onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                            error={!!errors[`buttons.${index}.text`]}
                            helperText={errors[`buttons.${index}.text`] || 
                              `${button.text.length}/${MAX_CHARS.buttonText} caracteres`}
                            disabled={mode === "view"}
                          />
                          
                          {button.type === "URL" && (
                            <TextField
                              label="URL"
                              fullWidth
                              value={button.url || ''}
                              onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
                              error={!!errors[`buttons.${index}.url`]}
                              helperText={errors[`buttons.${index}.url`]}
                              disabled={mode === "view"}
                            />
                          )}
                          
                          {button.type === "PHONE_NUMBER" && (
                            <TextField
                              label="Número de telefone"
                              fullWidth
                              value={button.phone_number || ''}
                              onChange={(e) => handleButtonChange(index, 'phone_number', e.target.value)}
                              error={!!errors[`buttons.${index}.phone_number`]}
                              helperText={errors[`buttons.${index}.phone_number`]}
                              disabled={mode === "view"}
                            />
                          )}
                          
                          {mode !== "view" && (
                            <IconButton 
                              color="error" 
                              onClick={() => handleRemoveButton(index)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                  
                  {mode !== "view" && formData.buttons.length < 3 && (
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddButton}
                      fullWidth
                      variant="outlined"
                    >
                      Adicionar botão
                    </Button>
                  )}
                </Stack>
              )}
            </Box>

            {/* Restrição de grupos */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">
                  Exibir apenas para times e grupos específicos
                  <Tooltip title="Restrinja o acesso deste template para times ou grupos específicos">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Switch
                  checked={formData.restrictToGroups}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    restrictToGroups: e.target.checked,
                    groups: []
                  }))}
                  disabled={mode === "view"}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Preview */}
        <Box sx={{ 
          flex: '1 1 40%', 
          p: 3,
          bgcolor: '#f5f5f5',
          overflowY: 'auto'
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            center: 0,
            gap: 1
          }}>
            <WhatsAppIcon fontSize="small" color="primary" />
            Preview
          </Typography>

          {/* Container da Preview */}
          <Box sx={{
            bgcolor: '#e5ddd5',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            height: 'calc(100% - 40px)',
            borderRadius: 1,
            p: 2,
            position: 'relative'
          }}>
            <Box sx={{
              bgcolor: '#fff',
              borderRadius: '7.5px',
              p: 2,
              maxWidth: '80%',
              boxShadow: '0 1px 0.5px rgba(0,0,0,.13)',
              marginLeft: 'auto',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: '-8px',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '0 8px 8px 0',
                borderColor: 'transparent #fff transparent transparent'
              }
            }}>
              {/* Cabeçalho do Preview */}
              {formData.headerEnabled && (
                <>
                  {formData.headerType === 'text' && formData.headerContent.text && (
                    <Typography variant="body1" gutterBottom>
                      {formData.headerContent.text}
                    </Typography>
                  )}
                  {formData.headerType === 'image' && formData.headerContent.media && (
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={formData.headerContent.media.url}
                        alt="Preview"
                        style={{ 
                          width: '100%', 
                          maxHeight: 200, 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    </Box>
                  )}
                  {formData.headerType === 'video' && formData.headerContent.media && (
                    <Box sx={{ 
                      mb: 2, 
                      bgcolor: '#000',
                      borderRadius: '4px',
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <VideoIcon sx={{ fontSize: 48, color: '#fff' }} />
                    </Box>
                  )}
                  {formData.headerType === 'document' && formData.headerContent.media && (
                    <Box sx={{ 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: '4px'
                    }}>
                      <DocumentIcon />
                      <Typography variant="body2" noWrap>
                        {formData.headerContent.media.filename}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {/* Corpo do Preview */}
              {formData.body && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    '& code': {
                      bgcolor: '#f5f5f5',
                      p: 0.5,
                      borderRadius: 1,
                      fontFamily: 'monospace'
                    }
                  }}
                >
                  {formData.body}
                </Typography>
              )}

              {/* Rodapé do Preview */}
              {formData.footerEnabled && formData.footer && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1, 
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}
                >
                  {formData.footer}
                </Typography>
              )}

              {/* Botões do Preview */}
              {formData.buttonsEnabled && formData.buttons.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {formData.buttons.map((button, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      fullWidth
                      size="small"
                      startIcon={
                        button.type === "URL" ? <LinkIcon /> :
                        button.type === "PHONE_NUMBER" ? <PhoneIcon /> :
                        <ReplyIcon />
                      }
                      sx={{
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        bgcolor: '#fff',
                        borderColor: 'primary.main',
                        '&:hover': {
                          bgcolor: '#f5f5f5',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      {button.text}
                    </Button>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Ações */}
      <AppBar 
        position="relative" 
        color="primary" 
        elevation={0}
        sx={{ 
          top: 'auto', 
          bottom: 0,
          borderTop: '1px solid #e0e0e0',
          bgcolor: 'background.paper'
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          {mode !== "view" && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<WhatsAppIcon />}
            >
              {mode === "edit" ? "Atualizar" : "Criar template"}
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Dialog>
  );
};

export default TemplateEditor;