import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  TextField,
  Grid,
  Autocomplete,
  FormControlLabel,
  Switch,
  Avatar,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormHelperText,
  Button
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { 
  PhotoCamera,
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from '../../../helpers/toast';
import { api } from '../../../services/api';
import BaseModal from '../../../components/shared/BaseModal';
import { ensureCompleteImageUrl } from '../../../utils/images';

// Schema de validação com Yup
const validationSchema = yup.object({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: yup
    .string()
    .email('Email inválido')
    .nullable(),
  phone: yup
    .string()
    .nullable()
});

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const ProfissionalModal = ({ open, onClose, professional }) => {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

  // Inicializa formulário com Formik
  const formik = useFormik({
    initialValues: {
      name: professional?.name || '',
      email: professional?.email || '',
      phone: professional?.phone || '',
      description: professional?.description || '',
      profileImage: professional?.profileImage || '',
      userId: professional?.userId || null,
      serviceIds: professional?.services?.map(s => s.id) || [],
      active: professional?.active !== undefined ? professional.active : true
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (professional) {
          await api.put(`/professionals/${professional.id}`, values);
          toast.success('Profissional atualizado com sucesso');
        } else {
          await api.post('/professionals', values);
          toast.success('Profissional criado com sucesso');
        }
        onClose();
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || 'Erro ao salvar profissional'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Carrega dados de serviços e usuários
  const fetchData = useCallback(async () => {
    if (open) {
      setLoadingData(true);
      try {
        const [servicesResponse, usersResponse] = await Promise.all([
          api.get('/services'),
          api.get('/users/list')
        ]);
        
        setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoadingData(false);
      }
    }
  }, [open]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('typeArch', 'professionals')
    formData.append('profileImage', file);
  
    setUploadingImage(true);
    try {
      const { data } = await api.post('/professionals/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      formik.setFieldValue('profileImage', data.url);
      toast.success('Imagem enviada com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  // Função para filtrar os serviços selecionados
  const getSelectedServices = () => {
    if (!Array.isArray(services) || !Array.isArray(formik.values.serviceIds)) {
      return [];
    }
    
    return services.filter(service => 
      formik.values.serviceIds.includes(service.id)
    );
  };

  // Função para encontrar o usuário selecionado
  const getSelectedUser = () => {
    if (!Array.isArray(users) || !formik.values.userId) {
      return null;
    }
    
    return users.find(user => user.id === formik.values.userId) || null;
  };

  // Definindo ações do modal para usar com o BaseModal
  const modalActions = [
    {
      label: 'Cancelar',
      onClick: onClose,
      variant: 'outlined',
      color: 'secondary',
      disabled: loading || uploadingImage,
      icon: <CloseIcon />
    },
    {
      label: professional ? 'Atualizar' : 'Salvar',
      onClick: formik.handleSubmit,
      variant: 'contained',
      color: 'primary',
      disabled: loading || uploadingImage,
      icon: loading ? <CircularProgress size={24} /> : <SaveIcon />
    }
  ];

  const modalTitle = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <PersonIcon color="primary" />
      <Typography variant="h6">
        {professional ? 'Editar Profissional' : 'Novo Profissional'}
      </Typography>
    </Box>
  );

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      actions={modalActions}
      maxWidth="md"
      loading={loadingData}
    >
      <AnimatedBox style={fadeIn} sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}
            >
              <Avatar
                src={formik.values.profileImage}
                alt={formik.values.name || 'Foto do profissional'}
                sx={{ 
                  width: { xs: 120, md: 150 }, 
                  height: { xs: 120, md: 150 }, 
                  mb: 2,
                  border: '1px solid #eee'
                }}
              />
              
              <Button
                component="label"
                variant="outlined"
                startIcon={uploadingImage ? <CircularProgress size={24} /> : <PhotoCamera />}
                disabled={uploadingImage}
                sx={{
                  borderRadius: 8,
                  textTransform: 'none',
                  mb: 1
                }}
              >
                Alterar foto
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </Button>
              
              <Typography variant="caption" color="text.secondary">
                Tamanho recomendado: 300x300 pixels
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Nome"
                  variant="outlined"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="E-mail"
                  variant="outlined"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Telefone"
                  variant="outlined"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Descrição"
                  variant="outlined"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label="informações sobre a descrição"
                          size="small"
                        >
                          <InfoIcon fontSize="small" color="primary" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="serviceIds"
                  options={services || []}
                  getOptionLabel={(option) => option && option.name ? option.name : ''}
                  value={getSelectedServices()}
                  onChange={(_, newValue) => {
                    formik.setFieldValue(
                      'serviceIds', 
                      newValue.map(item => item.id)
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Serviços"
                      variant="outlined"
                      placeholder="Selecione os serviços"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: option.color || '#ccc',
                          mr: 1.5
                        }}
                      />
                      {option.name}
                    </li>
                  )}
                  loading={services.length === 0}
                  loadingText="Carregando serviços..."
                  noOptionsText="Nenhum serviço encontrado"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  id="userId"
                  options={users || []}
                  getOptionLabel={(option) => option && option.name ? option.name : ''}
                  value={getSelectedUser()}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('userId', newValue ? newValue.id : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuário vinculado"
                      variant="outlined"
                      placeholder="Selecione um usuário"
                    />
                  )}
                  loading={users.length === 0}
                  loadingText="Carregando usuários..."
                  noOptionsText="Nenhum usuário encontrado"
                />
                <FormHelperText>
                  Vincular a um usuário do sistema (opcional)
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.active}
                      onChange={(e) => 
                        formik.setFieldValue('active', e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Profissional ativo"
                />
                <FormHelperText>
                  Desative temporariamente sem excluir este profissional
                </FormHelperText>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AnimatedBox>
    </BaseModal>
  );
};

ProfissionalModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  professional: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    description: PropTypes.string,
    profileImage: PropTypes.string,
    userId: PropTypes.number,
    services: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ),
    active: PropTypes.bool
  })
};

ProfissionalModal.defaultProps = {
  professional: null
};

export default ProfissionalModal;