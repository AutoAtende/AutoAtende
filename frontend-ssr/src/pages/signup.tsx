'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Link,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CssBaseline,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  styled,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Mail,
  Business,
  LocationOn,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import { useSpring, animated } from '@react-spring/web';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { PublicSettingsContext } from '../context/PublicSettingsContext';
import { toast } from '../helpers/toast';
import { openApi } from '../services/api';

// Styled components
const RootContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  position: 'relative',
  zIndex: 2,
  minHeight: '100vh',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const SectionContainer = styled(Box)<{ signupPosition?: string }>(({ theme, signupPosition = 'right' }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: signupPosition === 'left' 
    ? 'flex-start' 
    : signupPosition === 'center' 
      ? 'center' 
      : 'flex-end',
  padding: theme.spacing(4),
  position: 'relative',
  zIndex: 2,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    justifyContent: 'center',
  },
}));

const FormPaper = styled(Paper)<{ signupPosition?: string }>(({ theme, signupPosition = 'right' }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 900,
  margin: signupPosition === 'center' ? 'auto' : undefined,
  marginLeft: signupPosition === 'left' ? theme.spacing(4) : undefined,
  marginRight: signupPosition === 'right' ? theme.spacing(4) : undefined,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    maxWidth: 'calc(100% - 32px)',
  },
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  backgroundColor: 'transparent',
  '& .MuiStepLabel-label': {
    fontSize: '1rem',
    fontWeight: 500,
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(3),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
}));

const StyledLogo = styled('img')(({ theme }) => ({
  height: theme.spacing(8),
  [theme.breakpoints.down('sm')]: {
    height: theme.spacing(6),
  },
}));

const CopyrightContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  width: '100%',
  maxWidth: 900,
  textAlign: 'center',
}));

const AnimatedBox = animated(Box);

interface Plan {
  id: string;
  name: string;
  users: number;
  connections: number;
  queues: number;
  value: number;
  isVisible: boolean;
}

interface FormValues {
  tipoPessoa: 'F' | 'J';
  documento: string;
  nome: string;
  email: string;
  password: string;
  phone: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  planId: string;
}

// Helper functions
const cpfMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const cnpjMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const cepMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const removeMask = (value: string) => value.replace(/\D/g, '');

const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i-1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i-1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

const validateCNPJ = (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size += 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

const Signup: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { publicSettings } = useContext(PublicSettingsContext);

  const [activeStep, setActiveStep] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFieldFocused, setIsPasswordFieldFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semNumero, setSemNumero] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'F' | 'J'>('F');
  const [cepLoading, setCepLoading] = useState(false);

  const initialValues: FormValues = {
    tipoPessoa: 'F',
    documento: '',
    nome: '',
    email: '',
    password: '',
    phone: '',
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    logradouro: '',
    numero: '',
    complemento: '',
    planId: '',
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    tipoPessoa: Yup.string()
      .required('Campo obrigatório')
      .oneOf(['F', 'J'], 'Tipo de pessoa inválido'),
    
    documento: Yup.string()
      .required('Campo obrigatório')
      .test('documento-valido', 'Documento inválido', function(value) {
        if (!value) return false;
        const { tipoPessoa } = this.parent;
        const cleanValue = removeMask(value);
        
        if (tipoPessoa === 'F') {
          return validateCPF(cleanValue);
        } else {
          return validateCNPJ(cleanValue);
        }
      }),
    
    nome: Yup.string()
      .required('Campo obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    
    email: Yup.string()
      .email('Email inválido')
      .required('Campo obrigatório'),
    
    phone: Yup.string()
      .required('Campo obrigatório')
      .min(10, 'Telefone deve ter no mínimo 10 dígitos'),
    
    cep: Yup.string()
      .required('Campo obrigatório')
      .test('cep-valido', 'CEP inválido', function(value) {
        if (!value) return false;
        const cleanCEP = removeMask(value);
        return cleanCEP.length === 8;
      }),
    
    estado: Yup.string().required('Campo obrigatório'),
    cidade: Yup.string().required('Campo obrigatório'),
    bairro: Yup.string().required('Campo obrigatório'),
    logradouro: Yup.string().required('Campo obrigatório'),
    numero: Yup.string().when('semNumero', {
      is: false,
      then: (schema) => schema.required('Campo obrigatório'),
      otherwise: (schema) => schema
    }),
    complemento: Yup.string(),
    planId: Yup.string().required('Campo obrigatório'),
    
    password: Yup.string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .matches(/[0-9]/, 'Senha deve conter pelo menos um número')
      .matches(/[@$!%*?&]/, 'Senha deve conter pelo menos um caractere especial')
      .required('Campo obrigatório'),
  });

  const allowSignup = publicSettings?.allowSignup === 'enabled';
  const copyright = publicSettings?.copyright || '';
  const terms = publicSettings?.terms || '';
  const privacy = publicSettings?.privacy || '';
  const signupPosition = publicSettings?.signupPosition || 'right';
  const signupBackground = publicSettings?.signupBackground || '';

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data } = await openApi.get('/public/plans');
        setPlans(data.filter((plan: Plan) => plan.isVisible));
      } catch (err) {
        console.error('Error loading plans:', err);
        toast.error('Erro ao carregar planos');
      }
    };
    loadPlans();
  }, []);

  const buscarEndereco = async (cep: string, formikProps: any) => {
    try {
      const cepLimpo = removeMask(cep);
      
      if (cepLimpo.length !== 8) {
        toast.error('CEP inválido');
        return null;
      }
      
      setCepLoading(true);
      
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.ok) {
        toast.error('Erro ao buscar endereço');
        return null;
      }
      
      const data = await response.json();
      
      if (data.erro) {
        toast.error('CEP não encontrado');
        return null;
      }
      
      if (!data.localidade || !data.uf) {
        toast.error('Endereço incompleto');
        return null;
      }
      
      const updatedValues = {
        ...formikProps.values,
        estado: data.uf,
        cidade: data.localidade,
        bairro: data.bairro || 'Centro',
        logradouro: data.logradouro || '',
        complemento: data.complemento || formikProps.values.complemento,
        cep,
      };
      
      await formikProps.setValues(updatedValues, false);
      
      toast.success(`Endereço encontrado: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
      
    } catch (err) {
      console.error('Error fetching address:', err);
      toast.error('Erro ao buscar endereço');
    } finally {
      setCepLoading(false);
    }
  };

  const handleNext = async (formikProps: any) => {
    const errors = await formikProps.validateForm();
    
    let fieldsToCheck: string[] = [];
    
    if (activeStep === 0) {
      fieldsToCheck = ['tipoPessoa', 'documento', 'nome', 'email', 'phone'];
    } else if (activeStep === 1) {
      fieldsToCheck = ['cep', 'estado', 'cidade', 'bairro', 'logradouro'];
      if (!semNumero) fieldsToCheck.push('numero');
    } else if (activeStep === 2) {
      fieldsToCheck = ['password', 'planId'];
      if (!aceitouTermos) {
        toast.error('Você deve aceitar os termos de uso');
        return;
      }
    }
    
    const hasErrors = fieldsToCheck.some(field => errors[field]);
    
    if (hasErrors) {
      const touchedFields: Record<string, boolean> = {};
      fieldsToCheck.forEach(field => {
        touchedFields[field] = true;
      });
      formikProps.setTouched({
        ...formikProps.touched,
        ...touchedFields
      });
      toast.error('Verifique os campos obrigatórios');
      return;
    }
    
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>, formikProps: any) => {
    const maskedValue = tipoPessoa === 'F' 
      ? cpfMask(e.target.value) 
      : cnpjMask(e.target.value);
  
    formikProps.setFieldValue('documento', maskedValue, false);
  };

  const handleSignUp = async (values: FormValues, { setSubmitting }: any) => {
    if (!aceitouTermos) {
      toast.error('Você deve aceitar os termos de uso');
      setSubmitting(false);
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      const cleanData = {
        name: values.nome,
        phone: removeMask(values.phone),
        email: values.email,
        password: values.password,
        planId: values.planId,
        cnpj: removeMask(values.documento),
        razaosocial: values.tipoPessoa === 'J' ? values.nome : null,
        cep: removeMask(values.cep),
        estado: values.estado,
        cidade: values.cidade,
        bairro: values.bairro,
        logradouro: values.logradouro,
        numero: semNumero ? 'S/N' : values.numero,
        complemento: values.complemento
      };
  
      await openApi.post('/companies/cadastro', cleanData);
      
      toast.success('Cadastro realizado com sucesso! Redirecionando...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error signing up:', err);
      const errorMsg = err.response?.data?.error || 'Erro ao realizar cadastro';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Step content renderers
  const renderPersonDataStep = (formikProps: any) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            name="tipoPessoa"
            value={formikProps.values.tipoPessoa}
            onChange={(e) => {
              const newTipo = e.target.value as 'F' | 'J';
              formikProps.setFieldValue('tipoPessoa', newTipo);
              setTipoPessoa(newTipo);
              formikProps.setFieldValue('documento', '');
              formikProps.setFieldValue('nome', '');
            }}
          >
            <FormControlLabel 
              value="F" 
              control={<Radio />} 
              label="Pessoa Física" 
            />
            <FormControlLabel 
              value="J" 
              control={<Radio />} 
              label="Pessoa Jurídica" 
            />
          </RadioGroup>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          variant="outlined"
          fullWidth
          id="documento"
          name="documento"
          label={tipoPessoa === 'F' ? 'CPF' : 'CNPJ'}
          value={formikProps.values.documento}
          onChange={(e) => handleDocumentoChange(e, formikProps)}
          onBlur={formikProps.handleBlur}
          error={formikProps.touched.documento && Boolean(formikProps.errors.documento)}
          helperText={formikProps.touched.documento && formikProps.errors.documento}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Business sx={{ color: theme.palette.primary.main }}/>
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="nome"
          name="nome"
          label={tipoPessoa === 'F' ? 'Nome Completo' : 'Razão Social'}
          error={formikProps.touched.nome && Boolean(formikProps.errors.nome)}
          helperText={formikProps.touched.nome && formikProps.errors.nome}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="email"
          name="email"
          label="Email"
          type="email"
          error={formikProps.touched.email && Boolean(formikProps.errors.email)}
          helperText={formikProps.touched.email && formikProps.errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail sx={{ color: theme.palette.primary.main }}/>
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="phone"
          name="phone"
          label="Telefone"
          error={formikProps.touched.phone && Boolean(formikProps.errors.phone)}
          helperText={formikProps.touched.phone && formikProps.errors.phone}
        />
      </Grid>
    </Grid>
  );

  const renderAddressStep = (formikProps: any) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TextField
          variant="outlined"
          fullWidth
          id="cep"
          name="cep"
          label="CEP"
          value={formikProps.values.cep}
          onChange={async (e) => {
            const maskedValue = cepMask(e.target.value);
            await formikProps.setFieldValue('cep', maskedValue, false);
            
            if (maskedValue.length === 9) {
              await buscarEndereco(maskedValue, formikProps);
            }
          }}
          onBlur={formikProps.handleBlur}
          error={formikProps.touched.cep && Boolean(formikProps.errors.cep)}
          helperText={formikProps.touched.cep && formikProps.errors.cep}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn sx={{ color: theme.palette.primary.main }}/>
              </InputAdornment>
            ),
            endAdornment: cepLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={24} />
              </InputAdornment>
            ) : null,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="estado"
          name="estado"
          label="Estado"
          error={formikProps.touched.estado && Boolean(formikProps.errors.estado)}
          helperText={formikProps.touched.estado && formikProps.errors.estado}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="cidade"
          name="cidade"
          label="Cidade"
          error={formikProps.touched.cidade && Boolean(formikProps.errors.cidade)}
          helperText={formikProps.touched.cidade && formikProps.errors.cidade}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="bairro"
          name="bairro"
          label="Bairro"
          error={formikProps.touched.bairro && Boolean(formikProps.errors.bairro)}
          helperText={formikProps.touched.bairro && formikProps.errors.bairro}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="logradouro"
          name="logradouro"
          label="Logradouro"
          error={formikProps.touched.logradouro && Boolean(formikProps.errors.logradouro)}
          helperText={formikProps.touched.logradouro && formikProps.errors.logradouro}
        />
      </Grid>
      
      <Grid item xs={9}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="numero"
          name="numero"
          label="Número"
          disabled={semNumero}
          error={formikProps.touched.numero && Boolean(formikProps.errors.numero)}
          helperText={formikProps.touched.numero && formikProps.errors.numero}
        />
      </Grid>
      
      <Grid item xs={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={semNumero}
              onChange={(e) => setSemNumero(e.target.checked)}
              color="primary"
            />
          }
          label="Sem número"
        />
      </Grid>
      
      <Grid item xs={12}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="complemento"
          name="complemento"
          label="Complemento"
        />
      </Grid>
    </Grid>
  );

  const renderAccessStep = (formikProps: any) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          name="password"
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          id="password"
          error={formikProps.touched.password && Boolean(formikProps.errors.password)}
          helperText={formikProps.touched.password && formikProps.errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: theme.palette.primary.main }}/>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? 
                    <VisibilityOff sx={{ color: theme.palette.primary.main }}/> : 
                    <Visibility sx={{ color: theme.palette.primary.main }}/>
                  }
                </IconButton>
              </InputAdornment>
            ),
          }}
          onFocus={() => setIsPasswordFieldFocused(true)}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            formikProps.handleBlur(e);
            if (!e.target.value) {
              setIsPasswordFieldFocused(false);
            }
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            formikProps.handleChange(e);
            setPasswordStrength(calculatePasswordStrength(e.target.value));
          }}
        />
        
        {isPasswordFieldFocused && (
          <>
            <Box sx={{ mt: 1, mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(passwordStrength / 5) * 100}
                sx={{
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      passwordStrength <= 2
                        ? theme.palette.error.main
                        : passwordStrength <= 4
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                  },
                }}
              />
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {passwordStrength <= 2 && 'Senha fraca'}
                {passwordStrength > 2 && passwordStrength <= 4 && 'Senha média'}
                {passwordStrength > 4 && 'Senha forte'}
              </Typography>
            </Box>
          </>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <FormControl
          fullWidth
          variant="outlined"
          error={formikProps.touched.planId && Boolean(formikProps.errors.planId)}
        >
          <InputLabel>Plano</InputLabel>
          <Field
            as={Select}
            name="planId"
            label="Plano"
            id="planId"
          >
            {plans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.name} - Usuários: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.value}
              </MenuItem>
            ))}
          </Field>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Aceito os{' '}
              <Link href={terms} target="_blank" sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}>
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href={privacy} target="_blank" sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}>
                Política de Privacidade
              </Link>
            </Typography>
          }
        />
      </Grid>
    </Grid>
  );

  const steps = [
    {
      label: 'Dados Pessoais',
      content: renderPersonDataStep,
    },
    {
      label: 'Endereço',
      content: renderAddressStep,
    },
    {
      label: 'Acesso',
      content: renderAccessStep,
    },
  ];

  // Animations
  const rightAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(50px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    delay: 400,
  });

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 600,
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundImage: `url(${signupBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <CssBaseline />
      <RootContainer>
        <ContentContainer sx={{ 
          justifyContent: 
            signupPosition === 'left' 
              ? 'flex-start' 
              : signupPosition === 'center' 
                ? 'center' 
                : 'flex-end' 
        }}>
          <SectionContainer component={AnimatedBox} style={rightAnimation} signupPosition={signupPosition}>
            <FormPaper signupPosition={signupPosition}>
              <LogoContainer>
                <StyledLogo
                  src="/logo.png"
                  alt="Logo"
                />
              </LogoContainer>

              <Typography component="h1" variant="h5" align="center" gutterBottom>
                Criar Conta
              </Typography>

              {allowSignup ? (
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSignUp}
                  validateOnChange={false}
                  validateOnBlur={true}
                >
                  {(formikProps) => (
                    <Form>
                      <StyledStepper activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                          <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                            <StepContent>
                              {step.content(formikProps)}
                              <ButtonContainer>
                                <Button
                                  disabled={index === 0}
                                  onClick={handleBack}
                                  startIcon={<NavigateBefore />}
                                >
                                  Voltar
                                </Button>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={
                                    index === steps.length - 1 
                                      ? formikProps.handleSubmit 
                                      : () => handleNext(formikProps)
                                  }
                                  disabled={isSubmitting}
                                  endIcon={index === steps.length - 1 ? undefined : <NavigateNext />}
                                >
                                  {index === steps.length - 1 ? (
                                    isSubmitting ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="button" sx={{ mr: 1 }}>
                                          Cadastrando...
                                        </Typography>
                                        <CircularProgress
                                          size={24}
                                          sx={{
                                            color: 'inherit',
                                          }}
                                        />
                                      </Box>
                                    ) : (
                                      'Cadastrar'
                                    )
                                  ) : (
                                    'Próximo'
                                  )}
                                </Button>
                              </ButtonContainer>
                            </StepContent>
                          </Step>
                        ))}
                      </StyledStepper>
                    </Form>
                  )}
                </Formik>
              ) : (
                <Typography variant="body1" align="center">
                  Cadastro não disponível no momento
                </Typography>
              )}
            </FormPaper>

            <CopyrightContainer component={AnimatedBox} style={fadeIn}>
              <Typography variant="body2" color="textSecondary" align="center">
                {`Copyright © ${new Date().getFullYear()} ${copyright}`}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                align="center" 
                sx={{ mt: 0.5 }}
              >
                Este site é protegido pelo Google reCAPTCHA
              </Typography>
            </CopyrightContainer>
          </SectionContainer>
        </ContentContainer>
      </RootContainer>
    </Box>
  );
};

export default Signup;