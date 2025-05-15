import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  TextField,
  Box,
  IconButton,
  InputAdornment,
  Autocomplete,
  Grid,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Web as WebIcon,
  Apps as AppsIcon,
  Person as PersonIcon,
  ViewHeadline as NotesIcon,
  LocalOffer as TagIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from '../../../helpers/toast';

// Componente para transição do modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PasswordForm = ({
  open,
  onClose,
  onSubmit,
  employers,
  tags,
  initialData,
  isEditing,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const primaryColor = theme.palette.primary.main;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData || {
      employerId: '',
      application: '',
      url: '',
      username: '',
      password: '',
      notes: '',
      tag: ''
    }
  });

  React.useEffect(() => {
    if (open) {
      reset(initialData || {
        employerId: '',
        application: '',
        url: '',
        username: '',
        password: '',
        notes: '',
        tag: ''
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      toast.success('Senha salva com sucesso!');
      onClose();
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar a senha.");
      console.error('Erro ao salvar:', error);
    }
  };

  // Tooltip texts
  const tooltips = {
    employer: 'Selecione a empresa relacionada a esta senha',
    application: 'Digite o nome do sistema, aplicativo ou site',
    url: 'Digite o endereço web completo, incluindo https://',
    username: 'Digite o nome de usuário ou e-mail utilizado',
    password: 'Digite a senha. Utilize uma senha forte com letras, números e símbolos',
    tag: 'Opcional: categorize a senha para facilitar buscas futuras',
    notes: 'Adicione informações extras sobre esta senha'
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: '8px',
          overflow: 'hidden'
        }
      }}
    >
      {/* Cabeçalho do modal */}
      <DialogTitle 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2
        }}
      >
        <Typography variant="h6" component="div">
          {isEditing ? 'Editar Senha' : 'Nova Senha'}
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="fechar"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 1 }}>
        <form id="password-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Controller
              name="employerId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Tooltip 
                  title={tooltips.employer}
                  placement="top-start"
                  arrow
                >
                  <Autocomplete
                    options={employers}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={(_, newValue) => onChange(newValue?.id || '')}
                    value={employers.find(emp => emp.id === value) || null}
                    disabled={isEditing}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Empresa"
                        error={!!errors.employerId}
                        helperText={errors.employerId?.message}
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <BusinessIcon color="primary" fontSize="small" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    fullWidth
                  />
                </Tooltip>
              )}
            />

            {/* Grid para Aplicação e Tag na mesma linha */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="application"
                  control={control}
                  render={({ field }) => (
                    <Tooltip
                      title={tooltips.application}
                      placement="top-start"
                      arrow
                    >
                      <TextField
                        {...field}
                        label="Nome da Aplicação"
                        error={!!errors.application}
                        helperText={errors.application?.message}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AppsIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Tooltip>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="tag"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Tooltip
                      title={tooltips.tag}
                      placement="top-start"
                      arrow
                    >
                      <Autocomplete
                        options={tags}
                        getOptionLabel={(option) => option.name || ''}
                        onChange={(_, newValue) => onChange(newValue?.id || '')}
                        value={tags.find(tag => tag.id === value) || null}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Tag"
                            error={!!errors.tag}
                            helperText={errors.tag?.message}
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <TagIcon color="primary" fontSize="small" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        fullWidth
                      />
                    </Tooltip>
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Tooltip
                  title={tooltips.url}
                  placement="top-start"
                  arrow
                >
                  <TextField
                    {...field}
                    label="URL"
                    error={!!errors.url}
                    helperText={errors.url?.message}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WebIcon color="primary" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Tooltip>
              )}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Tooltip
                      title={tooltips.username}
                      placement="top-start"
                      arrow
                    >
                      <TextField
                        {...field}
                        label="Nome de Usuário"
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Tooltip>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: 'Senha é obrigatória' }}
                  render={({ field }) => (
                    <Tooltip
                      title={tooltips.password}
                      placement="top-start"
                      arrow
                    >
                      <TextField
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        label="Senha *"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                                aria-label={showPassword ? 'esconder senha' : 'mostrar senha'}
                              >
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Tooltip>
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Tooltip
                  title={tooltips.notes}
                  placement="top-start"
                  arrow
                >
                  <TextField
                    {...field}
                    label="Notas"
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <NotesIcon color="primary" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Tooltip>
              )}
            />
          </Box>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          startIcon={<CancelIcon />}
          disabled={isSubmitting}
          size="small"
          variant="outlined"
          sx={{ borderRadius: '4px' }}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          form="password-form" 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          disabled={isSubmitting}
          size="small"
          sx={{ borderRadius: '4px' }}
        >
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PasswordForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  employers: PropTypes.array,
  tags: PropTypes.array,
  initialData: PropTypes.object,
  isEditing: PropTypes.bool
};

PasswordForm.defaultProps = {
  open: false,
  employers: [],
  tags: [],
  initialData: null,
  isEditing: false
};

export default PasswordForm;