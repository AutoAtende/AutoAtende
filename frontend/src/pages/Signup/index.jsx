import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "../../helpers/toast";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import {
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
  Box,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormHelperText,
  CircularProgress,
  styled,
  Radio,
  RadioGroup,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  Lock,
  Mail,
  Business,
  LocationOn,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";
import { useSpring, animated } from "@react-spring/web";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import { usePublicSettings } from "../../context/PublicSettingsContext";
import { cpfMask, cnpjMask, cepMask } from "../../helpers/masks";
import { removeMask } from "../../helpers/removeMask";
import SignUpPhoneInput from "../../components/PhoneInputs/SignUpPhoneInput";

// Componentes estilizados com MUI 5
const RootContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  position: "relative",
  zIndex: 2,
  minHeight: "100vh",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const SectionContainer = styled(Box)(({ theme, position = "right" }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: position === "left" 
    ? "flex-start" 
    : position === "center" 
      ? "center" 
      : "flex-end",
  padding: theme.spacing(4),
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
    justifyContent: "center",
  },
}));

const FormPaper = styled(Paper)(({ theme, position = "right" }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 900,
  margin: position === "center" ? "auto" : undefined,
  marginLeft: position === "left" ? theme.spacing(4) : undefined,
  marginRight: position === "right" ? theme.spacing(4) : undefined,
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    maxWidth: "calc(100% - 32px)",
  },
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  backgroundColor: "transparent",
  "& .MuiStepLabel-label": {
    fontSize: "1rem",
    fontWeight: 500,
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginTop: theme.spacing(3),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(4),
}));

const StyledLogo = styled("img")(({ theme }) => ({
  height: theme.spacing(8),
  [theme.breakpoints.down("sm")]: {
    height: theme.spacing(6),
  },
}));

const CopyrightContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  width: "100%",
  maxWidth: 900,
  textAlign: "center",
}));

const AnimatedBox = animated(Box);

// Helper function to check repeated sequences
const isRepeatedSequence = (value) => {
  if (!value || typeof value !== 'string' || value.length < 3) return false;
  const cleanValue = value.replace(/\D/g, '');
  
  // Check for repeated sequences (e.g., 000000, 111111)
  const firstChar = cleanValue[0];
  const isAllSame = cleanValue.split('').every(char => char === firstChar);
  
  // Check for sequential numbers (e.g., 123456, 654321)
  const isSequential = (() => {
    if (cleanValue.length < 4) return false;
    let isAscending = true;
    let isDescending = true;
    
    for (let i = 1; i < cleanValue.length; i++) {
      if (parseInt(cleanValue[i]) !== parseInt(cleanValue[i-1]) + 1) {
        isAscending = false;
      }
      if (parseInt(cleanValue[i]) !== parseInt(cleanValue[i-1]) - 1) {
        isDescending = false;
      }
    }
    
    return isAscending || isDescending;
  })();
  
  return isAllSame || isSequential;
};

// CPF validation function
const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Checksum validation
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

// CNPJ validation function
const validateCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Checksum validation
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size += 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const SignUp = () => {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { publicSettings } = usePublicSettings();

  const [activeStep, setActiveStep] = useState(0);

  const [plans, setPlans] = useState([]);
  const { list: listPlans } = usePlans();

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFieldFocused, setIsPasswordFieldFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semNumero, setSemNumero] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState('F');
  const [phoneError, setPhoneError] = useState("");
  const phoneInputRef = useRef(null);
  const [cepLoading, setCepLoading] = useState(false);

  const initialValues = {
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

  // Validation schema with i18n translations
  const validationSchema = Yup.object().shape({
    tipoPessoa: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .oneOf(['F', 'J'], i18n.t("signup.validation.required")),
    
    documento: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .test('documento-valido', i18n.t("signup.validation.documento.invalido"), function(value) {
        if (!value) return false;
        const { tipoPessoa } = this.parent;
        const cleanValue = removeMask(value);
        
        // Check if it's a repeated sequence
        if (isRepeatedSequence(cleanValue)) 
          return this.createError({ message: i18n.t("signup.validation.documento.sequencia") });
        
        if (tipoPessoa === 'F') {
          return validateCPF(cleanValue) || 
            this.createError({ message: i18n.t("signup.validation.invalidDocument") });
        } else {
          return validateCNPJ(cleanValue) || 
            this.createError({ message: i18n.t("signup.validation.invalidDocument") });
        }
      }),
    
    nome: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .min(3, i18n.t("signup.validation.nome.min"))
      .test('nome-valido', i18n.t("signup.validation.nome.completo"), function(value) {
        if (!value) return false;
        
        // Check if it contains at least two words (first and last name)
        if (value.trim().split(/\s+/).filter(word => word.length > 1).length < 2) {
          return this.createError({ message: i18n.t("signup.validation.nome.completo") });
        }
        
        // Check if it has too many repeated characters
        if (/(.)\1{3,}/.test(value)) {
          return this.createError({ message: i18n.t("signup.validation.nome.repetido") });
        }
        
        return true;
      }),
    
    email: Yup.string()
      .email(i18n.t("signup.validation.emailExists"))
      .required(i18n.t("signup.validation.required"))
      .test('email-valido', i18n.t("signup.validation.email.dominio"), function(value) {
        if (!value) return false;
        
        // Additional email validations
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
        
        // Check common domains
        const domain = value.split('@')[1];
        const validDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'uol.com.br', 'bol.com.br', 'terra.com.br'];
        const commonTLDs = ['.com', '.com.br', '.org', '.net', '.edu', '.gov.br', '.org.br'];
        
        const hasTLD = commonTLDs.some(tld => domain.endsWith(tld));
        
        if (!hasTLD && !validDomains.includes(domain)) {
          return this.createError({ message: i18n.t("signup.validation.email.dominio") });
        }
        
        return true;
      }),
    
    phone: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .test('phone-valido', i18n.t("signup.validation.phone.invalido"), function(value) {
        if (!value) return false;
        
        // Remove formatting
        const cleanPhone = value.replace(/\D/g, '');
        
        // Check if it's a repeated sequence
        if (isRepeatedSequence(cleanPhone)) 
          return this.createError({ message: i18n.t("signup.validation.phone.sequencia") });
        
        // Check valid DDD
        const ddd = cleanPhone.substring(0, 2);
        const validDDDs = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
        
        if (!validDDDs.includes(ddd)) {
          return this.createError({ message: i18n.t("signup.validation.phone.ddd") });
        }
        
        return true;
      }),
    
    cep: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .test('cep-valido', i18n.t("signup.validation.cep.invalido"), function(value) {
        if (!value) return false;
        
        const cleanCEP = removeMask(value);
        
        // Check size
        if (cleanCEP.length !== 8) 
          return this.createError({ message: i18n.t("signup.validation.cep.invalido") });
        
        // Check if it's a repeated sequence
        if (isRepeatedSequence(cleanCEP)) 
          return this.createError({ message: i18n.t("signup.validation.cep.sequencia") });
        
        return true;
      }),
    
    estado: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .test('estado-valido', i18n.t("signup.validation.endereco.estadoInvalido"), function(value) {
        if (!value) return false;
        
        // List of Brazilian states
        const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
        
        return estados.includes(value.toUpperCase()) || 
          this.createError({ message: i18n.t("signup.validation.endereco.estadoInvalido") });
      }),
    
    cidade: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .min(2, i18n.t("signup.validation.endereco.cidadeMin"))
      .test('cidade-valida', i18n.t("signup.validation.endereco.cidadeMin"), function(value) {
        if (!value) return false;
        
        // IMPORTANTE: Aceitar valores preenchidos via API de CEP
        const { cep } = this.parent;
        if (cep && cep.length === 9) {
          return true; // Sempre aceitar valores preenchidos pelo CEP
        }
        
        // Validação normal para entradas manuais
        if (value.length < 2 || isRepeatedSequence(value)) 
          return this.createError({ message: i18n.t("signup.validation.endereco.cidadeMin") });
        
        return true;
      }),
    
    bairro: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .min(2, i18n.t("signup.validation.endereco.bairroMin"))
      .test('bairro-valido', i18n.t("signup.validation.endereco.bairroMin"), function(value) {
        if (!value) return false;
        
        // Aceitar "Centro" como valor padrão mesmo quando preenchido automaticamente
        if (value === "Centro") return true;
        
        // IMPORTANTE: Aceitar valores preenchidos via API de CEP
        const { cep } = this.parent;
        if (cep && cep.length === 9) {
          return true; // Sempre aceitar valores preenchidos pelo CEP
        }
        
        // Validação normal para entradas manuais
        if (value.length < 2 || isRepeatedSequence(value)) 
          return this.createError({ message: i18n.t("signup.validation.endereco.bairroMin") });
        
        // Cross-field validation
        const { cidade } = this.parent;
        if (cidade && value === cidade) 
          return this.createError({ message: i18n.t("signup.validation.endereco.bairroCidade") });
        
        return true;
      }),
    
    logradouro: Yup.string()
      .required(i18n.t("signup.validation.required"))
      .min(3, i18n.t("signup.validation.endereco.logradouroMin"))
      .test('logradouro-valido', i18n.t("signup.validation.endereco.logradouroMin"), function(value) {
        if (!value) return false;
        
        // Ignorar validação detalhada para campos preenchidos automaticamente via CEP
        const { cep } = this.parent;
        if (cep && cep.length === 9) return true;
        
        // Ser mais flexível com logradouros curtos preenchidos via API
        if (value.length >= 3) return true;
        
        // Check if the street has at least 3 characters and isn't a repeated sequence
        if (value.length < 3 || isRepeatedSequence(value)) 
          return this.createError({ message: i18n.t("signup.validation.endereco.logradouroMin") });
        
        // Cross-field validations
        const { bairro, cidade } = this.parent;
        if (bairro && value === bairro) 
          return this.createError({ message: i18n.t("signup.validation.endereco.logradouroBairro") });
        
        if (cidade && value === cidade) 
          return this.createError({ message: i18n.t("signup.validation.endereco.logradouroCidade") });
        
        return true;
      }),
    
    numero: Yup.string()
      .when("semNumero", {
        is: false,
        then: Yup.string()
          .required(i18n.t("signup.validation.required"))
          .test('numero-valido', i18n.t("signup.validation.numero.zeros"), function(value) {
            if (!value) return false;
            
            // Check if it's just zeros
            if (/^0+$/.test(value)) 
              return this.createError({ message: i18n.t("signup.validation.numero.zeros") });
            
            return true;
          })
      }),
    
    complemento: Yup.string(),
    
    planId: Yup.string()
      .required(i18n.t("signup.validation.required")),
    
    password: Yup.string()
      .min(8, i18n.t("signup.validation.password.length"))
      .matches(/[a-z]/, i18n.t("signup.validation.password.lowercase"))
      .matches(/[A-Z]/, i18n.t("signup.validation.password.uppercase"))
      .matches(/[0-9]/, i18n.t("signup.validation.password.number"))
      .matches(/[@$!%*?&]/, i18n.t("signup.validation.password.special"))
      .required(i18n.t("signup.validation.required"))
      .test('senha-forte', i18n.t("signup.validation.password.comum"), function(value) {
        if (!value) return false;
        
        // Check common/weak passwords
        const weakPasswords = ['password', 'senha123', '12345678', 'abcd1234', 'qwerty123'];
        if (weakPasswords.includes(value.toLowerCase())) 
          return this.createError({ message: i18n.t("signup.validation.password.comum") });
        
        // Check repeated sequences
        if (isRepeatedSequence(value)) 
          return this.createError({ message: i18n.t("signup.validation.password.sequencia") });
        
        // Check if it contains user information
        const { nome, email } = this.parent;
        if (nome && value.toLowerCase().includes(nome.toLowerCase().split(' ')[0])) {
          return this.createError({ message: i18n.t("signup.validation.password.contemNome") });
        }
        
        if (email && value.toLowerCase().includes(email.split('@')[0])) {
          return this.createError({ message: i18n.t("signup.validation.password.contemEmail") });
        }
        
        return true;
      }),
  });

  const allowSignup = publicSettings.allowSignup === "enabled";
  const copyright = publicSettings.copyright || "";
  const terms = publicSettings.terms || "";
  const privacy = publicSettings.privacy || "";
  const signupPosition = publicSettings.signupPosition || "right";
  const signupBackground = publicSettings.signupBackground ? publicSettings.signupBackground : "";

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const allPlans = await listPlans();
        setPlans(allPlans.filter((plan) => plan.isVisible));
      } catch (err) {
        toast.error(i18n.t("signup.toasts.error"));
        console.error(err);
      }
    };
    loadSettings();
  }, [listPlans]);

  const buscarDadosCNPJ = async (cnpj) => {
    try {
      const cnpjLimpo = removeMask(cnpj);
      if (cnpjLimpo.length === 14) {
        const { data } = await openApi.get(`/companies/apicnpj/${cnpjLimpo}`);
        return data.nome;
      }
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("signup.toasts.errorDocument"));
    }
    return "";
  };

  // Função melhorada para buscar endereço com melhor tratamento do CEP
  const buscarEndereco = async (cep, formikProps) => {
    try {
      const cepLimpo = removeMask(cep);
      
      // Garantir que o CEP tenha 8 dígitos
      if (cepLimpo.length !== 8) {
        console.log("CEP inválido: deve ter 8 dígitos", cepLimpo);
        toast.error(i18n.t("signup.toasts.invalidCEP"));
        return null;
      }
      
      setCepLoading(true);
      
      // Imprimir CEP para verificar se está completo
      console.log("Consultando CEP:", cepLimpo);
      
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      // Verificar se a resposta é bem-sucedida
      if (!response.ok) {
        console.log("Erro na resposta da API de CEP:", response.status);
        toast.error(`${i18n.t("signup.toasts.errorAddress")} (${response.status})`);
        return null;
      }
      
      const data = await response.json();
      console.log("Dados retornados pela API de CEP:", data);
      
      // Verificar erro explícito da API de CEP
      if (data.erro) {
        console.log("CEP não encontrado");
        toast.error(i18n.t("signup.toasts.cepNotFound"));
        return null;
      }
      
      // Verificar se retornou dados básicos
      if (!data.localidade || !data.uf) {
        console.log("Endereço incompleto retornado pela API");
        toast.error(i18n.t("signup.toasts.incompleteAddress"));
        return null;
      }
      
      // Garantir que nenhum campo esteja vazio com valores padrão quando necessário
      const enderecoNormalizado = {
        ...data,
        bairro: data.bairro || "Centro", // Valor padrão caso esteja vazio
        logradouro: data.logradouro || "",
        complemento: data.complemento || ""
      };
      
      // NOVO: Atualização em um único passo para evitar problemas de validação
      // e perda de caracteres do CEP
      try {
        // 1. Primeiro, vamos criar um objeto com todos os valores atualizados
        const updatedValues = {
          ...formikProps.values,
          estado: enderecoNormalizado.uf,
          cidade: enderecoNormalizado.localidade,
          bairro: enderecoNormalizado.bairro,
          logradouro: enderecoNormalizado.logradouro,
          complemento: enderecoNormalizado.complemento || formikProps.values.complemento
        };
        
        // 2. Importante: Mantenha o CEP com a formatação (não use o cepLimpo)
        // Isso evita que o campo de CEP perca caracteres
        updatedValues.cep = cep;
        
        // 3. Atualize todos os valores de uma vez só
        await formikProps.setValues(updatedValues, false);
        
        // 4. Importante: Desative temporariamente a validação
        // Remover erros específicos dos campos preenchidos automaticamente
        const newErrors = {...formikProps.errors};
        delete newErrors.estado;
        delete newErrors.cidade;
        delete newErrors.bairro;
        delete newErrors.logradouro;
        formikProps.setErrors(newErrors);
        
        // 5. Marque os campos como "touched" apenas após um breve atraso
        // para garantir que os valores estejam totalmente atualizados
        setTimeout(() => {
          formikProps.setTouched({
            ...formikProps.touched,
            estado: true,
            cidade: true,
            bairro: true,
            logradouro: true
          });
        }, 300);
        
        // 6. Mensagem de sucesso mais detalhada
        toast.success(
          i18n.t("signup.toasts.addressFound") + ": " + 
          enderecoNormalizado.logradouro + ", " + enderecoNormalizado.bairro + ", " + 
          enderecoNormalizado.localidade + " - " + enderecoNormalizado.uf
        );
      } catch (error) {
        console.error("Erro ao atualizar formulário:", error);
        toast.error(i18n.t("signup.errors.formUpdateFailed"));
      }
      
      console.log("Endereço normalizado:", enderecoNormalizado);
      return enderecoNormalizado;
    } catch (err) {
      console.error("Erro na consulta de CEP:", err);
      toast.error(i18n.t("signup.toasts.errorAddress"));
      return null;
    } finally {
      setCepLoading(false);
    }
  };

  const validateEmail = async (email, setFieldError) => {
    try {
      const emailExists = await openApi.get(`/companies/check-email/${email}`);
      if (emailExists.data.exists) {
        setFieldError("email", i18n.t("signup.validation.emailExists"));
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      return true;
    }
  };

  const validatePhone = async (phone, setFieldError) => {
    try {
      // Remove the '+' and spaces before sending to the API
      const cleanPhone = removeMask(phone);
      const phoneExists = await openApi.get(`/companies/check-phone/${cleanPhone}`);
      
      if (phoneExists.data.exists) {
        setFieldError("phone", i18n.t("signup.validation.phoneExists"));
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      return true;
    }
  };

  const validateCurrentStep = async (formikProps, step) => {
    try {
      // Adicionar delay para garantir que a validação ocorra após atualizações de campo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Logs para depuração
      if (step === 1) {
        console.log("Validando passo de endereço...");
        console.log("Valores atuais:", formikProps.values);
      }
      
      // Atualizar o formulário antes de validar (importante para campos preenchidos automaticamente)
      if (step === 1) {
        // Se temos um CEP válido, ignorar alguns erros de validação de endereço
        if (formikProps.values.cep && formikProps.values.cep.length === 9) {
          console.log("CEP válido detectado, relaxando validações de endereço");
          
          // Verificar se os campos foram preenchidos automaticamente com valores válidos
          const contemDados = 
            formikProps.values.estado && 
            formikProps.values.cidade && 
            formikProps.values.bairro && 
            formikProps.values.logradouro;
            
          if (contemDados) {
            console.log("Campos de endereço preenchidos automaticamente, ignorando validações");
            return { hasErrors: false, fieldErrors: {} };
          }
        }
      }
      
      // Validar todos os campos
      const errors = await formikProps.validateForm();
      console.log("Erros da validação:", errors);
      
      const touchedFields = {};
      let hasErrors = false;
      
      // Step 0: Personal data fields
      if (step === 0) {
        const fieldsToCheck = ['tipoPessoa', 'documento', 'nome', 'email', 'phone'];
        fieldsToCheck.forEach(field => {
          touchedFields[field] = true;
          if (errors[field]) {
            hasErrors = true;
            console.log(`Erro no campo ${field}:`, errors[field]);
          }
        });
        
        // Special validation for phone
        if (phoneError) {
          hasErrors = true;
        }
      } 
      // Step 1: Address fields
      else if (step === 1) {
        const fieldsToCheck = ['cep', 'estado', 'cidade', 'bairro', 'logradouro'];
        
        // Log para depuração
        console.log("Valores dos campos de endereço:", {
          cep: formikProps.values.cep,
          estado: formikProps.values.estado,
          cidade: formikProps.values.cidade,
          bairro: formikProps.values.bairro,
          logradouro: formikProps.values.logradouro
        });
        
        fieldsToCheck.forEach(field => {
          touchedFields[field] = true;
          if (errors[field]) {
            hasErrors = true;
            console.log(`Erro no campo de endereço ${field}:`, errors[field]);
          }
        });
        
        // Validate number only if "semNumero" is false
        if (!semNumero) {
          touchedFields['numero'] = true;
          if (errors['numero']) {
            hasErrors = true;
            console.log("Erro no campo numero:", errors['numero']);
          }
        }
      } 
      // Step 2: Access fields
      else if (step === 2) {
        const fieldsToCheck = ['password', 'planId'];
        fieldsToCheck.forEach(field => {
          touchedFields[field] = true;
          if (errors[field]) {
            hasErrors = true;
            console.log(`Erro no campo ${field}:`, errors[field]);
          }
        });
        
        // Validate terms
        if (!aceitouTermos) {
          hasErrors = true;
          toast.error(i18n.t("signup.validation.terms"));
        }
      }
      
      // Mark relevant fields as touched to show validation errors
      formikProps.setTouched({
        ...formikProps.touched,
        ...touchedFields
      });
      
      return { hasErrors, fieldErrors: errors };
    } catch (err) {
      console.error("Error validating step:", err);
      return { hasErrors: true, fieldErrors: {} };
    }
  };

  // Function to focus the first field with error
  const focusFirstErrorField = (formikProps, step) => {
    // Focus priority based on step
    let fieldsToCheck = [];
    
    if (step === 0) {
      fieldsToCheck = ['documento', 'nome', 'email', 'phone'];
    } else if (step === 1) {
      fieldsToCheck = ['cep', 'estado', 'cidade', 'bairro', 'logradouro', 'numero'];
    } else if (step === 2) {
      fieldsToCheck = ['password', 'planId'];
    }
    
    // Find the first field with error
    for (const field of fieldsToCheck) {
      if (formikProps.errors[field] || (field === 'phone' && phoneError)) {
        const element = document.getElementById(field);
        if (element) {
          element.focus();
          return true;
        }
      }
    }
    
    return false;
  };

  const handleNext = async (formikProps) => {
    try {
      // Mostrar feedback visual de validação
      toast.info(i18n.t("signup.toasts.validatingFields"));
      
      // Aguardar pequeno delay para garantir que todas as atualizações de campo foram concluídas
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validar formulário completo antes de verificar o passo atual
      await formikProps.validateForm();
      
      // Validar current step
      const { hasErrors, fieldErrors } = await validateCurrentStep(formikProps, activeStep);
      
      // Se estamos na etapa de endereço, vamos fazer verificações adicionais
      if (activeStep === 1) {
        console.log("Valores na etapa de endereço:", formikProps.values);
        console.log("Erros na etapa de endereço:", fieldErrors);
        
        // Verificar se os campos obrigatórios estão preenchidos
        const camposObrigatorios = ['estado', 'cidade', 'bairro', 'logradouro'];
        const camposVazios = [];
        
        camposObrigatorios.forEach(campo => {
          if (!formikProps.values[campo] || formikProps.values[campo].trim() === '') {
            camposVazios.push(i18n.t(`signup.form.${campo}`));
            formikProps.setFieldError(campo, i18n.t("signup.validation.required"));
          }
        });
        
        if (camposVazios.length > 0) {
          toast.error(i18n.t("signup.errors.missingFields") + ": " + camposVazios.join(', '));
          return;
        }
        
        // Verificar se o número é obrigatório
        if (!semNumero && (!formikProps.values.numero || formikProps.values.numero.trim() === '')) {
          formikProps.setFieldError('numero', i18n.t("signup.validation.required"));
          toast.error(i18n.t("signup.errors.numeroRequired"));
          return;
        }
      }
      
      if (hasErrors) {
        const focusado = focusFirstErrorField(formikProps, activeStep);
        
        // Mensagem de erro mais específica baseada no passo atual
        if (activeStep === 0) {
          toast.error(i18n.t("signup.errors.verificarDadosPessoais"));
        } else if (activeStep === 1) {
          toast.error(i18n.t("signup.errors.verificarEndereco"));
        } else {
          toast.error(i18n.t("signup.errors.verificarAcesso"));
        }
        return;
      }
      
      // Se estamos na etapa 0 (dados pessoais), garantir validação do telefone
      if (activeStep === 0 && phoneInputRef.current) {
        const phoneNumber = phoneInputRef.current.getNumber();
        formikProps.setFieldValue('phone', phoneNumber);
        
        // Check phone format
        if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
          setPhoneError(i18n.t("signup.validation.phone.invalido"));
          formikProps.setFieldError('phone', i18n.t("signup.validation.phone.invalido"));
          document.getElementById('phone')?.focus();
          toast.error(i18n.t("signup.errors.phoneInvalid"));
          return;
        }
        
        // Verificar se o telefone já existe - com indicador visual
        toast.info(i18n.t("signup.toasts.checkingPhone"));
        
        try {
          // Check if phone already exists
          const isPhoneValid = await validatePhone(phoneNumber, formikProps.setFieldError);
          
          if (!isPhoneValid) {
            document.getElementById('phone')?.focus();
            toast.error(i18n.t("signup.errors.phoneExists"));
            return;
          }
        } catch (error) {
          toast.error(i18n.t("signup.errors.errorCheckingPhone"));
          return;
        }
      }
      
      // Avançar para o próximo passo com mensagem de sucesso
      toast.success(i18n.t("signup.toasts.stepCompleted"));
      setActiveStep(prevStep => prevStep + 1);
    } catch (error) {
      console.error("Erro ao avançar para o próximo passo:", error);
      toast.error(i18n.t("signup.errors.verificarCampos"));
    }
  };

  const handleDocumentoChange = async (e, formikProps) => {
    const { setFieldValue, setFieldTouched } = formikProps;
    const maskedValue = tipoPessoa === 'F' 
      ? cpfMask(e.target.value) 
      : cnpjMask(e.target.value);
  
    await setFieldValue('documento', maskedValue, false);
    setFieldTouched('documento', true, false);
    
    if (tipoPessoa === 'J' && maskedValue.length === 18) {
      try {
        const razaoSocial = await buscarDadosCNPJ(maskedValue);
        if (razaoSocial) {
          await setFieldValue('nome', razaoSocial, false);
          setFieldTouched('nome', true, false);
        }
      } catch (err) {
        console.error(err);
        toast.error(i18n.t("signup.toasts.errorDocument"));
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSignUp = async (values, { setSubmitting, setFieldError }) => {
    if (!aceitouTermos) {
      toast.error(i18n.t("signup.validation.terms"));
      setSubmitting(false);
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      // Mostrar feedback visual de envio
      toast.info(i18n.t("signup.toasts.submitting"));
  
      // Final validation before sending
      const { hasErrors } = await validateCurrentStep({ 
        validateForm: () => validationSchema.validate(values, { abortEarly: false })
          .then(() => ({}))
          .catch(err => {
            const errors = {};
            err.inner.forEach(e => {
              errors[e.path] = e.message;
            });
            return errors;
          }),
        setTouched: () => {},
        errors: {}
      }, 2);
      
      if (hasErrors) {
        toast.error(i18n.t("signup.errors.verificarCampos"));
        setIsSubmitting(false);
        setSubmitting(false);
        return;
      }
  
      // Format phone number: remove '+' and spaces
      let phoneNumber = values.phone;
      if (phoneInputRef.current) {
        phoneNumber = phoneInputRef.current.getNumber();
      }
      
      // Clean the phone number
      phoneNumber = phoneNumber.replace(/^\+/, '').replace(/\D/g, '');
  
      const cleanData = {
        name: values.nome,
        phone: phoneNumber,
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
  
      console.log('Data being sent:', cleanData);
  
      const response = await openApi.post('/companies/cadastro', cleanData);
      
      // Mensagem de sucesso mais detalhada
      toast.success(i18n.t("signup.toasts.success") + ". " + i18n.t("signup.toasts.redirecting"));
      
      // Redirecionar após pequeno delay para mostrar mensagem
      setTimeout(() => {
        history.push('/login');
      }, 2000);
      
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      
      const errorMsg = err.response?.data?.error || i18n.t("signup.toasts.error");
      
      // Tratar erros específicos
      if (err.response?.status === 409) {
        // Conflito - recurso já existe
        toast.error(i18n.t("signup.errors.alreadyExists"));
      } else if (err.response?.status === 400) {
        // Erro de validação
        toast.error(i18n.t("signup.errors.validationFailed") + ": " + errorMsg);
      } else if (err.response?.status === 500) {
        // Erro interno do servidor
        toast.error(i18n.t("signup.errors.serverError"));
      } else {
        // Erro genérico
        toast.error(errorMsg);
      }
      
      // Definir erros de campo específicos
      if (err.response?.data?.validation) {
        Object.keys(err.response.data.validation).forEach(key => {
          setFieldError(key, err.response.data.validation[key]);
        });
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Renderização do conteúdo de cada passo
  const renderPersonDataStep = (formikProps) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            name="tipoPessoa"
            value={formikProps.values.tipoPessoa}
            onChange={(e) => {
              const newTipo = e.target.value;
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
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="documento"
          name="documento"
          label={tipoPessoa === 'F' ? "CPF" : "CNPJ"}
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
          label={tipoPessoa === 'F' ? "Nome Completo" : "Razão Social"}
          value={formikProps.values.nome}
          onChange={formikProps.handleChange}
          onBlur={formikProps.handleBlur}
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
          label={i18n.t("signup.form.email")}
          error={formikProps.touched.email && Boolean(formikProps.errors.email)}
          helperText={formikProps.touched.email && formikProps.errors.email}
          onBlur={async (e) => {
            formikProps.handleBlur(e);
            if (e.target.value) {
              await validateEmail(e.target.value, formikProps.setFieldError);
            }
          }}
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
        <SignUpPhoneInput
          ref={phoneInputRef}
          name="phone"
          label={i18n.t("signup.form.phone")}
          value={formikProps.values.phone}
          onChange={(phone, isValid) => {
            formikProps.setFieldValue('phone', phone, false);

            // Show error immediately if phone is invalid
            if (!isValid && phone) {
              setPhoneError(i18n.t("signup.validation.invalidPhone"));
            } else {
              setPhoneError("");
            }
          }}
          onBlur={async (e) => {
            formikProps.setFieldTouched('phone', true, false);
            
            // Check if the number already exists in the database
            if (phoneInputRef.current && phoneInputRef.current.getNumber) {
              const phoneNumber = phoneInputRef.current.getNumber();
              await validatePhone(phoneNumber, formikProps.setFieldError);
            }
          }}
          error={formikProps.touched.phone && (Boolean(formikProps.errors.phone) || Boolean(phoneError))}
          helperText={formikProps.touched.phone && (formikProps.errors.phone || phoneError)}
          required
        />
        {/* Help message for the user */}
        <Typography variant="caption" color="textSecondary">
          Informe o número com DDD (Ex: (11) 98765-4321)
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            {i18n.t("signup.buttons.loginText")}{" "}
            <Link component={RouterLink} to="/login" sx={{ 
              color: theme.palette.secondary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}>
              {i18n.t("signup.buttons.login")}
            </Link>
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              component={RouterLink}
              to="/login"
              startIcon={<NavigateBefore />}
            >
              {i18n.t("signup.buttons.backToLogin")}
            </Button>
            <Button
              variant="text"
              size="small"
              component={RouterLink}
              to="/forgot-password"
              color="secondary"
            >
              {i18n.t("signup.buttons.forgotPassword")}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );

  const renderAddressStep = (formikProps) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="cep"
          name="cep"
          label={i18n.t("signup.form.cep")}
          value={formikProps.values.cep}
          onChange={async (e) => {
            const maskedValue = cepMask(e.target.value);
            
            // Atualizar primeiro o valor no formulário sem validar
            await formikProps.setFieldValue("cep", maskedValue, false);
            
            // Verificar comprimento exato para consulta de CEP
            if (maskedValue.length === 9) {
              try {
                setCepLoading(true);
                toast.info(i18n.t("signup.toasts.fetchingAddress"));
                
                // Passar formikProps diretamente para a função buscarEndereco
                await buscarEndereco(maskedValue, formikProps);
                
              } catch (error) {
                console.error("Erro ao buscar endereço:", error);
                toast.error(i18n.t("signup.toasts.errorAddress"));
              } finally {
                setCepLoading(false);
              }
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    size={24} 
                    sx={{ 
                      width: 24, 
                      marginRight: 1,
                      color: theme.palette.primary.main 
                    }}
                  />
                </Box>
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
          label={i18n.t("signup.form.estado")}
          onBlur={formikProps.handleBlur}
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
          label={i18n.t("signup.form.cidade")}
          onBlur={formikProps.handleBlur}
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
          label={i18n.t("signup.form.bairro")}
          onBlur={formikProps.handleBlur}
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
          label={i18n.t("signup.form.logradouro")}
          onBlur={formikProps.handleBlur}
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
          label={i18n.t("signup.form.numero")}
          disabled={semNumero}
          onBlur={formikProps.handleBlur}
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
          label={i18n.t("signup.form.noNumber")}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          id="complemento"
          name="complemento"
          label="Complemento"
          value={formikProps.values.complemento}
          onChange={formikProps.handleChange}
          onBlur={formikProps.handleBlur}
          error={formikProps.touched.complemento && Boolean(formikProps.errors.complemento)}
          helperText={formikProps.touched.complemento && formikProps.errors.complemento}
        />
      </Grid>
    </Grid>
  );

  const renderAccessStep = (formikProps) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Field
          as={TextField}
          variant="outlined"
          fullWidth
          name="password"
          label={i18n.t("signup.form.password")}
          type={showPassword ? "text" : "password"}
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
          onBlur={(e) => {
            formikProps.handleBlur(e);
            if (!e.target.value) {
              setIsPasswordFieldFocused(false);
            }
          }}
          onChange={(e) => {
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
                  "& .MuiLinearProgress-bar": {
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
                {passwordStrength <= 2 && i18n.t("signup.passwordStrength.weak")}
                {passwordStrength > 2 && passwordStrength <= 4 && i18n.t("signup.passwordStrength.medium")}
                {passwordStrength > 4 && i18n.t("signup.passwordStrength.strong")}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {i18n.t("signup.validation.password.requirements")}:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • {i18n.t("signup.validation.password.length")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • {i18n.t("signup.validation.password.lowercase")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • {i18n.t("signup.validation.password.uppercase")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • {i18n.t("signup.validation.password.number")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • {i18n.t("signup.validation.password.special")}
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
          <InputLabel>{i18n.t("signup.form.plan")}</InputLabel>
          <Field
            as={Select}
            name="planId"
            label={i18n.t("signup.form.plan")}
            id="planId"
          >
            {plans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.name} - {i18n.t("signup.form.users")}: {plan.users} - WhatsApp: {plan.connections} - {i18n.t("signup.form.queues")}: {plan.queues} - R$ {plan.value}
                </MenuItem>
            ))}
          </Field>
          {formikProps.touched.planId && formikProps.errors.planId && (
            <Typography variant="caption" color="error">
              {formikProps.errors.planId}
            </Typography>
          )}
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
              {i18n.t("signup.form.acceptTerms")}{" "}
              <Link href={terms} target="_blank" sx={{
                color: theme.palette.secondary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}>
                {i18n.t("signup.form.terms")}
              </Link>{" "}
              {i18n.t("signup.form.and")}{" "}
              <Link href={privacy} target="_blank" sx={{
                color: theme.palette.secondary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}>
                {i18n.t("signup.form.privacy")}
              </Link>
            </Typography>
          }
        />
      </Grid>
    </Grid>
  );

  // Definição dos passos
  const steps = [
    {
      label: i18n.t("signup.steps.person"),
      content: renderPersonDataStep,
    },
    {
      label: i18n.t("signup.steps.address"),
      content: renderAddressStep,
    },
    {
      label: i18n.t("signup.steps.access"),
      content: renderAccessStep,
    },
  ];

  // Animações
  const leftAnimation = useSpring({
    from: { opacity: 0, transform: "translateX(-50px)" },
    to: { opacity: 1, transform: "translateX(0)" },
    delay: 200,
  });

  const rightAnimation = useSpring({
    from: { opacity: 0, transform: "translateX(50px)" },
    to: { opacity: 1, transform: "translateX(0)" },
    delay: 400,
  });

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 600,
  });

  // Componente principal
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        backgroundImage: `url(${signupBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <CssBaseline />
      <RootContainer>
        <ContentContainer sx={{ 
          justifyContent: 
            signupPosition === "left" 
              ? "flex-start" 
              : signupPosition === "center" 
                ? "center" 
                : "flex-end" 
        }}>
          <SectionContainer component={AnimatedBox} style={rightAnimation} position={signupPosition}>
            <FormPaper position={signupPosition}>
              {/* Logo centralizada em todas as etapas */}
              <LogoContainer>
                <StyledLogo
                  src={theme.calculatedLogoLight?.() || "/logo.png"}
                  alt="Logo"
                />
              </LogoContainer>

              <Typography component="h1" variant="h5" align="center" gutterBottom>
                {i18n.t("signup.title")}
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
                                  {i18n.t("signup.buttons.back")}
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
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography variant="button" sx={{ mr: 1 }}>
                                          {i18n.t("signup.form.loading")}
                                        </Typography>
                                        <CircularProgress
                                          size={24}
                                          sx={{
                                            color: "inherit",
                                          }}
                                        />
                                      </Box>
                                    ) : (
                                      i18n.t("signup.buttons.submit")
                                    )
                                  ) : (
                                    i18n.t("signup.buttons.next")
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
                  {i18n.t("signup.unavailable")}
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
                Este site é protegido pelo reCAPTCHA Enterprise e pela{" "}
                <Link 
                  href={privacy} 
                  target="_blank" 
                  sx={{
                    color: theme.palette.secondary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {i18n.t("signup.form.privacy")}
                </Link>{" "}
                e{" "}
                <Link 
                  href={terms} 
                  target="_blank" 
                  sx={{
                    color: theme.palette.secondary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {i18n.t("signup.form.terms")}
                </Link>{" "}
                do Google
              </Typography>
            </CopyrightContainer>
          </SectionContainer>
        </ContentContainer>
      </RootContainer>
    </Box>
  );
};

export default SignUp;