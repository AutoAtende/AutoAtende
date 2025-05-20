import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { toast } from '../../../helpers/toast';
import api from '../../../services/api';
import { AuthContext } from '../../../context/Auth/AuthContext';
// Importação do componente de telefone personalizado
import CompanyPhoneInput from '../../../components/PhoneInputs/CompanyPhoneInput';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  phone: Yup.string().required('Telefone é obrigatório'),
  planId: Yup.number().required('Plano é obrigatório'),
  dueDate: Yup.date().required('Vencimento é obrigatório'),
  recurrence: Yup.string().required('Recorrência é obrigatória'),
  urlPBX: Yup.string(),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  document: Yup.string()
});

export default function CompanyForm({ open, onClose, initialData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const { user } = useContext(AuthContext);

  // Carregar planos disponíveis
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data } = await api.get('/plans/list');
        setPlans(data);
      } catch (error) {
        toast.error('Erro ao carregar planos');
        console.error(error);
      }
    };

    if (open) {
      loadPlans();
    }
  }, [open]);

  // Inicialização do Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      planId: '',
      dueDate: '',
      recurrence: 'MENSAL',
      email: '',
      urlPBX: '',
      ...initialData
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Garantir que o telefone está no formato internacional
        const formattedValues = {
          ...values,
          phone: values.phone.startsWith('+') 
            ? values.phone 
            : `+${values.phone.replace(/\D/g, '')}` // Adiciona o + se não existir
        };

        if (initialData) {
          await api.put(`/companies/${initialData.id}`, formattedValues);
          toast.success('Empresa atualizada com sucesso!');
        } else {
          await api.post('/companies', formattedValues);
          toast.success('Empresa criada com sucesso!');
        }

        // Fechar o modal e atualizar o componente pai
        onClose();
        if (onSuccess) {
          onSuccess(); // Atualiza o componente pai
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.error || 'Erro ao salvar empresa');
      } finally {
        setLoading(false);
      }
    }
  });

  // Atualizar os valores do Formik quando initialData mudar
  useEffect(() => {
    if (initialData) {
      formik.setValues({
        name: initialData.name || '',
        phone: initialData.phone || '',
        planId: initialData.planId || initialData.plan?.id || '',
        dueDate: initialData.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : '',
        recurrence: initialData.recurrence || 'MENSAL',
        urlPBX: initialData.urlPBX || '', // Será preenchido se existir
        email: initialData.email || '',
      }, false);
    } else {
      formik.resetForm();
    }
  }, [initialData]);

  // Verifica disponibilidade do email
  const checkEmail = async (email) => {
    if (!email) return;

    try {
      const { data } = await api.get(`/companies/check-email/${email}`);
      if (data.exists && (!initialData || initialData.email !== email)) {
        formik.setFieldError('email', 'Email já está em uso');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Verifica disponibilidade do telefone
  const checkPhone = async (phone) => {
    if (!phone) return;
    
    try {
      // Remove todos os não-dígitos para verificação
      const phoneDigits = phone.replace(/\D/g, '');
      const { data } = await api.get(`/companies/check-phone/${phoneDigits}`);
      
      if (data.exists && (!initialData || initialData.phone !== phone)) {
        formik.setFieldError('phone', 'Telefone já está em uso');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {initialData ? 'Editar Empresa' : 'Nova Empresa'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Campos obrigatórios */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Nome da Empresa *"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Substituição do TextField padrão pelo CompanyPhoneInput */}
              <CompanyPhoneInput
                name="phone"
                label="Telefone *"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  checkPhone(e.target.value);
                }}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.planId && Boolean(formik.errors.planId)}>
                <InputLabel>Plano *</InputLabel>
                <Select
                  name="planId"
                  value={formik.values.planId}
                  onChange={formik.handleChange}
                  disabled={loading}
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                name="dueDate"
                label="Vencimento *"
                value={formik.values.dueDate}
                onChange={formik.handleChange}
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                helperText={formik.touched.dueDate && formik.errors.dueDate}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Recorrência *</InputLabel>
                <Select
                  name="recurrence"
                  value={formik.values.recurrence}
                  onChange={formik.handleChange}
                  disabled={loading}
                >
                  <MenuItem value="MENSAL">Mensal</MenuItem>
                  <MenuItem value="BIMESTRAL">Bimestral</MenuItem>
                  <MenuItem value="TRIMESTRAL">Trimestral</MenuItem>
                  <MenuItem value="SEMESTRAL">Semestral</MenuItem>
                  <MenuItem value="ANUAL">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="urlPBX"
                label="URL PBX"
                value={formik.values.urlPBX}
                onChange={formik.handleChange}
                error={formik.touched.urlPBX && Boolean(formik.errors.urlPBX)}
                helperText={formik.touched.urlPBX && formik.errors.urlPBX}
                disabled={loading}
              />
            </Grid>

            {/* Campos opcionais */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  checkEmail(e.target.value);
                }}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : initialData ? (
              'Atualizar'
            ) : (
              'Criar'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}