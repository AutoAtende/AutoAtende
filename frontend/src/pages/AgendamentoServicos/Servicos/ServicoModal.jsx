import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment,
  Box,
  Autocomplete,
  CircularProgress,
  Typography,
  FormHelperText,
  IconButton,
  Tooltip
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import {
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Spa as SpaIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from '../../../helpers/toast';
import { api } from '../../../services/api';
import BaseModal from '../../../components/shared/BaseModal';

// Schema de validação com Yup
const validationSchema = yup.object({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  duration: yup
    .number()
    .required('Duração é obrigatória')
    .min(5, 'Duração mínima de 5 minutos')
    .integer('Duração deve ser um número inteiro'),
  price: yup
    .number()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
});

// Componente AnimatedBox para animações
const AnimatedBox = animated(Box);

const ServicoModal = ({ open, onClose, service }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [professionals, setProfessionals] = useState([]);
const [selectedProfessionals, setSelectedProfessionals] = useState([]);


useEffect(() => {
  // Carregar todos os profissionais disponíveis
  const fetchProfessionals = async () => {
    setLoadingData(true);
    try {
      const { data } = await api.get('/professionals', { params: { active: true } });
      
      // Tratamento robusto dos dados
      let professionalsData = [];
      if (Array.isArray(data)) {
        professionalsData = data;
      } else if (data && Array.isArray(data.records)) {
        professionalsData = data.records;
      } else if (data && typeof data === 'object') {
        // Se for um objeto único
        professionalsData = [data];
      }
      
      setProfessionals(professionalsData);
      
      // Se estiver editando um serviço existente, carrega os profissionais associados
      if (service && service.id) {
        const { data: serviceData } = await api.get(`/services/${service.id}`);
        
        if (serviceData && Array.isArray(serviceData.professionals)) {
          const professionalIds = serviceData.professionals.map(p => p.id);
          setSelectedProfessionals(professionalsData.filter(p => professionalIds.includes(p.id)));
          formik.setFieldValue('professionalIds', professionalIds);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      toast.error('Erro ao carregar profissionais');
    } finally {
      setLoadingData(false);
    }
  };
  
  fetchProfessionals();
}, [service]);

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

// Inicializa formulário com Formik
const formik = useFormik({
  initialValues: {
    name: service?.name || '',
    description: service?.description || '',
    duration: service?.duration || 60,
    price: service?.price || '',
    color: service?.color || '#3f51b5',
    active: service?.active !== undefined ? service.active : true,
    professionalIds: []
  },
  validationSchema: validationSchema,
  enableReinitialize: true,
  onSubmit: async (values) => {
    setLoading(true);
    try {
      if (service) {
        await api.put(`/services/${service.id}`, values);
        toast.success('Serviço atualizado com sucesso');
      } else {
        await api.post('/services', values);
        toast.success('Serviço criado com sucesso');
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Erro ao salvar serviço'
      );
    } finally {
      setLoading(false);
    }
  },
});

// Componente seletor de cor customizado
const ColorSelector = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <TextField
        fullWidth
        value={formik.values.color}
        onChange={(e) => formik.setFieldValue('color', e.target.value)}
        label="Cor (código hex)"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component="div"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px',
                  backgroundColor: formik.values.color,
                  border: '1px solid rgba(0,0,0,0.1)',
                  mr: 1,
                }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box
                component="input"
                type="color"
                value={formik.values.color}
                onChange={(e) => formik.setFieldValue('color', e.target.value)}
                sx={{
                  width: 36,
                  height: 36,
                  border: 'none',
                  borderRadius: '4px',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label="Selecionar cor"
              />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

// Definindo ações do modal para usar com o BaseModal
const modalActions = [
  {
    label: 'Cancelar',
    onClick: onClose,
    variant: 'outlined',
    color: 'secondary',
    disabled: loading,
    icon: <CloseIcon />
  },
  {
    label: service ? 'Atualizar' : 'Salvar',
    onClick: formik.handleSubmit,
    variant: 'contained',
    color: 'primary',
    disabled: loading,
    icon: loading ? <CircularProgress size={24} /> : <SaveIcon />
  }
];

const modalTitle = (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <SpaIcon color="primary" />
    <Typography variant="h6">
      {service ? 'Editar Serviço' : 'Novo Serviço'}
    </Typography>
  </Box>
);

return (
  <BaseModal
    open={open}
    onClose={onClose}
    title={modalTitle}
    actions={modalActions}
    maxWidth="sm"
    loading={loadingData}
  >
    <AnimatedBox style={fadeIn} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: formik.values.color || '#ccc',
                mr: 2,
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
            <Typography variant="subtitle1">
              {formik.values.name || 'Novo serviço'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Nome do serviço"
            variant="outlined"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SpaIcon fontSize="small" color="primary" />
                </InputAdornment>
              )
            }}
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
                  <Tooltip title="Descreva detalhes sobre o serviço, como o que está incluso" arrow>
                    <IconButton size="small">
                      <InfoIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="duration"
            name="duration"
            label="Duração (minutos)"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
            value={formik.values.duration}
            onChange={formik.handleChange}
            error={formik.touched.duration && Boolean(formik.errors.duration)}
            helperText={formik.touched.duration && formik.errors.duration}
            required
            inputProps={{
              min: 5,
              step: 5,
            }}
          />
          <FormHelperText>
            Tempo necessário para realizar o serviço
          </FormHelperText>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="price"
            name="price"
            label="Preço"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
            value={formik.values.price}
            onChange={formik.handleChange}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
            inputProps={{
              min: 0,
              step: 0.01,
            }}
          />
          <FormHelperText>
            Valor cobrado pelo serviço
          </FormHelperText>
        </Grid>

        <Grid item xs={12}>
  <Autocomplete
    multiple
    id="professionalIds"
    options={professionals || []}
    getOptionLabel={(option) => option && option.name ? option.name : ''}
    value={selectedProfessionals}
    onChange={(_, newValue) => {
      setSelectedProfessionals(newValue);
      formik.setFieldValue(
        'professionalIds', 
        newValue.map(item => item.id)
      );
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Profissionais"
        variant="outlined"
        placeholder="Selecione os profissionais"
      />
    )}
    renderOption={(props, option) => (
      <li {...props} key={option.id}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {option.profileImage && (
            <Box
              component="img"
              src={option.profileImage}
              alt={option.name}
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                mr: 1.5,
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          {option.name}
        </Box>
      </li>
    )}
    loading={loadingData}
    loadingText="Carregando profissionais..."
    noOptionsText="Nenhum profissional encontrado"
  />
  <FormHelperText>
    Associe este serviço aos profissionais que irão oferecê-lo
  </FormHelperText>
</Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" gutterBottom>
            Cor do serviço
          </Typography>
          <ColorSelector />
          <FormHelperText>
            Cor para identificação visual do serviço
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
            label="Serviço ativo"
          />
          <FormHelperText>
            Desative temporariamente sem excluir este serviço
          </FormHelperText>
        </Grid>
      </Grid>
    </AnimatedBox>
  </BaseModal>
);
};

ServicoModal.propTypes = {
open: PropTypes.bool.isRequired,
onClose: PropTypes.func.isRequired,
service: PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  duration: PropTypes.number,
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  active: PropTypes.bool,
  professionals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  )
})
};

ServicoModal.defaultProps = {
service: null
};

export default ServicoModal;