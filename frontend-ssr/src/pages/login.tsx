'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Link,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  CssBaseline,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  styled,
  Slide,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Mail, 
  Lock, 
  Visibility, 
  VisibilityOff,
  Send as SendIcon,
  Key as KeyIcon,
  RestartAlt as RestartAltIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material';
import { useSpring, animated } from '@react-spring/web';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { AuthContext } from '../context/Auth/AuthContext';
import { ColorModeContext } from '../context/ColorModeContext';
import { PublicSettingsContext } from '../context/PublicSettingsContext';
import { toast } from '../helpers/toast';
import { openApi } from '../services/api';

const AnimatedPaper = animated(Paper);
const AnimatedDialog = animated(Dialog);

const FloatingFormContainer = styled(Paper)<{ loginPosition?: string }>(({ theme, loginPosition = 'right' }) => ({
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  boxShadow: theme.shadows[10],
  width: '100%',
  maxWidth: 450,
  marginLeft: loginPosition === 'left' ? theme.spacing(4) : 0,
  marginRight: loginPosition === 'right' ? theme.spacing(4) : 0,
  margin: loginPosition === 'center' ? '0 auto' : undefined,
  transition: 'all 0.3s ease-out',
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(1),
    borderRadius: theme.shape.borderRadius * 2,
  },
}));

const FooterContainer = styled(Box)<{ loginPosition?: string }>(({ theme, loginPosition = 'right' }) => ({
  width: '100%',
  maxWidth: 450,
  textAlign: 'center',
  marginTop: theme.spacing(3),
  marginLeft: loginPosition === 'left' ? theme.spacing(4) : 0,
  marginRight: loginPosition === 'right' ? theme.spacing(4) : 0,
  margin: loginPosition === 'center' ? theme.spacing(3, 'auto', 0) : undefined,
  
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(3, 1, 1),
  },
}));

const ThemeToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 2,
  color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
  },
}));

const BounceButton = styled(Button)(({ theme }) => ({
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)'
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordFormData {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const Login = () => {
  const theme = useTheme();
  const router = useRouter();
  const { colorMode } = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { publicSettings, publicSettingsLoading } = useContext(PublicSettingsContext);
  const { handleLogin } = useContext(AuthContext);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem('rememberMe') === 'true'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get settings directly from settings object
  const allowSignup = publicSettings?.allowSignup === 'enabled';
  const copyright = publicSettings?.copyright || '';
  const terms = publicSettings?.terms || '';
  const privacy = publicSettings?.privacy || '';
  const loginPosition = publicSettings?.loginPosition || 'right';
  const loginBackground = publicSettings?.loginBackground || '';

  const [user, setUser] = useState<LoginFormData>({
    email: localStorage.getItem('email') || '',
    password: '',
  });

  // Spring animations
  const formAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 200, friction: 20 }
  });

  const bgAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 200
  });

  const handleToggleTheme = () => {
    colorMode.toggleColorMode();
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setResetStep(1);
  };

  const initialForgotPasswordValues: ForgotPasswordFormData = {
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Email inválido')
      .required('Email é obrigatório'),
    ...(resetStep === 2 && {
      token: Yup.string()
        .required('Token é obrigatório')
        .min(6, 'Token inválido'),
      newPassword: Yup.string()
        .required('Senha é obrigatória')
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .matches(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
          'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Senhas não coincidem')
        .required('Confirmação de senha é obrigatória'),
    }),
  });

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    
    if (!isChecked) {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('email');
    } else {
      localStorage.setItem('rememberMe', 'true');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginData = {
        ...user,
        email: user.email.toLowerCase()
      };
  
      await handleLogin(loginData);
  
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('email', loginData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('email');
      }

      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Credenciais inválidas';
      toast.error(errorMsg);
    }
  };

  const handleSendResetEmail = async (values: ForgotPasswordFormData, { setSubmitting }: any) => {
    try {
      setIsSubmitting(true);
      const response = await openApi.post('/email/forgot/request', { 
        email: values.email.toLowerCase().trim() 
      });
  
      if (response.data.success) {
        toast.success('Email enviado com sucesso');
        setResetStep(2);
      } else {
        toast.error(response.data.error || 'Erro ao enviar email');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 
        'Erro ao enviar email'
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (values: ForgotPasswordFormData, { setSubmitting }: any) => {
    try {
      setIsSubmitting(true);
      await openApi.post('/email/forgot/reset', {
        email: values.email,
        token: values.token,
        password: values.newPassword,
      });
      toast.success('Senha resetada com sucesso');
      handleCloseForgotPassword();
    } catch (error) {
      toast.error('Erro ao resetar senha');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const getJustifyContent = () => {
    switch(loginPosition) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
      default:
        return 'flex-end';
    }
  };

  if (publicSettingsLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: getJustifyContent(),
        background: `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: isMobile ? 2 : 4,
      }}
    >
      <CssBaseline />

      <AnimatedPaper
        style={{
          ...formAnimation,
          backgroundColor: 'transparent',
          boxShadow: 'none'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: loginPosition === 'center' ? 'center' : 'flex-start',
          width: '100%',
          maxWidth: 450
        }}>
          <FloatingFormContainer loginPosition={loginPosition}>
            <ThemeToggleButton 
              onClick={handleToggleTheme} 
              size="small"
              aria-label={theme.palette.mode === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            >
              {theme.palette.mode === 'dark' ? 
                <Brightness7Icon sx={{ color: theme.palette.primary.main }}/> : 
                <Brightness4Icon sx={{ color: theme.palette.primary.main }}/>
              }
            </ThemeToggleButton>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={500}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{
                    height: isMobile ? 48 : 64,
                    marginBottom: theme.spacing(3),
                  }}
                />
              </Zoom>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="Email"
                name="email"
                value={user.email}
                onChange={handleChangeInput}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail sx={{ color: theme.palette.primary.main }}/>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                label="Senha"
                name="password"
                value={user.password}
                onChange={handleChangeInput}
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
                          <Visibility sx={{ color: theme.palette.primary.main }}/> : 
                          <VisibilityOff sx={{ color: theme.palette.primary.main }}/>
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1,
                mb: 2
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      color="primary"
                    />
                  }
                  label="Lembrar-me"
                />
                
                <Link
                  onClick={handleForgotPassword}
                  sx={{
                    cursor: 'pointer',
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  Esqueci minha senha
                </Link>
              </Box>

              <BounceButton
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                size="large"
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 2,
                  fontWeight: 600
                }}
              >
                Entrar
              </BounceButton>

              {allowSignup && (
                <Slide direction="up" in timeout={1000}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => router.push('/signup')}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    Criar conta
                  </Button>
                </Slide>
              )}
            </form>
          </FloatingFormContainer>

          <Fade in timeout={1200}>
            <FooterContainer loginPosition={loginPosition}>
              <Typography variant="body2" color="textSecondary" align="center">
                {`Copyright © ${new Date().getFullYear()} ${copyright}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: "0.5rem" }}>
                This site is protected by reCAPTCHA Enterprise and the Google{" "}
                <StyledLink href={privacy} target="_blank">
                  Privacy Policy
                </StyledLink>{" "}
                and{" "}
                <StyledLink href={terms} target="_blank">
                  Terms of Service
                </StyledLink>
              </Typography>
            </FooterContainer>
          </Fade>
        </Box>
      </AnimatedPaper>

      <AnimatedDialog
        open={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 3,
            p: 2,
            width: isMobile ? '100%' : 450,
            mx: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          color: 'primary.main',
          fontWeight: 600
        }}>
          {resetStep === 1 
            ? 'Esqueci minha senha'
            : 'Redefinir senha'
          }
        </DialogTitle>

        <Formik
          initialValues={initialForgotPasswordValues}
          validationSchema={validationSchema}
          onSubmit={resetStep === 1 ? handleSendResetEmail : handleResetPassword}
        >
          {({ values, errors, touched, handleChange, handleBlur }: any) => (
            <Form>
              <DialogContent>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={resetStep === 2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                {resetStep === 2 && (
                  <>
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      label="Token"
                      name="token"
                      value={values.token}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.token && Boolean(errors.token)}
                      helperText={touched.token && errors.token}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      type={showPassword ? 'text' : 'password'}
                      label="Nova senha"
                      name="newPassword"
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      type={showPassword ? 'text' : 'password'}
                      label="Confirmar senha"
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </>
                )}
              </DialogContent>

              <DialogActions sx={{ 
                justifyContent: 'space-between',
                px: 3,
                pb: 3
              }}>
                <Button
                  onClick={handleCloseForgotPassword}
                  variant="outlined"
                  color="secondary"
                  startIcon={<RestartAltIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Cancelar
                </Button>

                <Box sx={{ position: 'relative' }}>
                  <BounceButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={<SendIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    {resetStep === 1
                      ? 'Enviar email'
                      : 'Redefinir senha'
                    }
                  </BounceButton>
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        mt: -1.5,
                        ml: -1.5,
                      }}
                    />
                  )}
                </Box>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </AnimatedDialog>
    </Box>
  );
};

export default Login;