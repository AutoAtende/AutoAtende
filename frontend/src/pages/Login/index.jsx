import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
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
} from "@mui/material";
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
} from "@mui/icons-material";
import { AuthContext } from "../../context/Auth/AuthContext";
import useSettings from "../../hooks/useSettings";
import { i18n } from "../../translate/i18n";
import { useSpring, animated } from "@react-spring/web";
import { toast } from "../../helpers/toast";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { openApi } from "../../services/api";
import ColorModeContext from "../../layout/themeContext";

const AnimatedPaper = animated(Paper);
const AnimatedDialog = animated(Dialog);

const FloatingFormContainer = styled(Paper)(({ theme, position = 'right' }) => ({
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  boxShadow: theme.shadows[10],
  width: '100%',
  maxWidth: 450,
  marginLeft: position === 'left' ? theme.spacing(4) : 0,
  marginRight: position === 'right' ? theme.spacing(4) : 0,
  margin: position === 'center' ? '0 auto' : undefined,
  transition: 'all 0.3s ease-out',
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(1),
    borderRadius: theme.shape.borderRadius * 2,
  },
}));

const FooterContainer = styled(Box)(({ theme, position = 'right' }) => ({
  width: '100%',
  maxWidth: 450,
  textAlign: 'center',
  marginTop: theme.spacing(3),
  marginLeft: position === 'left' ? theme.spacing(4) : 0,
  marginRight: position === 'right' ? theme.spacing(4) : 0,
  margin: position === 'center' ? theme.spacing(3, 'auto', 0) : undefined,
  
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

// Novo styled component para os links
const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const Login = () => {
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getPublicSetting } = useSettings();
  const { handleLogin } = useContext(AuthContext);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginPosition, setLoginPosition] = useState("right"); // Posição padrão

  const [user, setUser] = useState({
    email: localStorage.getItem("email") || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [allowSignup, setAllowSignup] = useState(false);
  const [terms, setTerms] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [copyright, setCopyright] = useState("");
  const [loginBackground, setLoginBackground] = useState("");

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

  useEffect(() => {
    getPublicSetting("allowSignup").then((data) => setAllowSignup(data === "enabled"));
    getPublicSetting("copyright").then((data) => data && setCopyright(data));
    getPublicSetting("terms").then((data) => data && setTerms(data));
    getPublicSetting("privacy").then((data) => data && setPrivacy(data));
    getPublicSetting("loginPosition").then((data) => data && setLoginPosition(data));
    getPublicSetting("loginBackground").then((data) => {
      if (data) {
        setLoginBackground(`${process.env.REACT_APP_BACKEND_URL}/public/${data}`);
      }
    });
  }, [getPublicSetting]);

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

  const initialForgotPasswordValues = {
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(i18n.t("forgotPassword.invalidEmail"))
      .required(i18n.t("forgotPassword.requiredEmail")),
    ...(resetStep === 2 && {
      token: Yup.string()
        .required(i18n.t("forgotPassword.requiredToken"))
        .min(6, i18n.t("forgotPassword.invalidToken")),
      newPassword: Yup.string()
        .required(i18n.t("forgotPassword.requiredPassword"))
        .min(8, i18n.t("forgotPassword.minPassword"))
        .matches(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
          i18n.t("forgotPassword.passwordRequirements")
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], i18n.t("forgotPassword.passwordMatch"))
        .required(i18n.t("forgotPassword.requiredConfirmPassword")),
    }),
  });

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    
    // Se desmarcar "lembrar-me", remover os dados armazenados
    if (!isChecked) {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("email");
    } else {
      // Se marcar "lembrar-me", apenas define a flag
      localStorage.setItem("rememberMe", "true");
      // O email será salvo apenas após o login bem-sucedido
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginData = {
        ...user,
        email: user.email.toLowerCase()
      };
  
      await handleLogin(loginData);
  
      // Após login bem-sucedido, salvar o email apenas se "lembrar-me" estiver ativado
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("email", loginData.email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("email");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || i18n.t("login.invalidCredentials");
      toast.error(errorMsg);
    }
  };

  const handleSendResetEmail = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);
      const response = await openApi.post("/email/forgot/request", { 
        email: values.email.toLowerCase().trim() 
      });
  
      if (response.data.success) {
        toast.success(i18n.t("forgotPassword.emailSent"));
        setResetStep(2);
      } else {
        toast.error(response.data.error || i18n.t("forgotPassword.emailError"));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || 
        i18n.t("forgotPassword.emailError")
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);
      await openApi.post("/email/forgot/reset", {
        email: values.email,
        token: values.token,
        password: values.newPassword,
      });
      toast.success(i18n.t("forgotPassword.resetSuccess"));
      handleCloseForgotPassword();
    } catch (error) {
      toast.error(i18n.t("forgotPassword.resetError"));
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Função para determinar a justificação com base na posição configurada
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
        {/* Container principal que agora agrupa tanto o formulário quanto o rodapé */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: loginPosition === 'center' ? 'center' : 'flex-start',
          width: '100%',
          maxWidth: 450
        }}>
          {/* Formulário de login */}
          <FloatingFormContainer position={loginPosition}>
            {/* Botão de alternar tema */}
            <ThemeToggleButton 
              onClick={handleToggleTheme} 
              size="small"
              aria-label={theme.palette.mode === 'dark' ? i18n.t("login.switchToLightMode") : i18n.t("login.switchToDarkMode")}
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon sx={{ color: theme.palette.primary.main }}/> : <Brightness4Icon sx={{ color: theme.palette.primary.main }}/>}
            </ThemeToggleButton>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={500}>
                <img
                  src={theme.calculatedLogoLight()}
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
                label={i18n.t("login.form.email")}
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
                label={i18n.t("login.form.password")}
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
                        {showPassword ? <Visibility sx={{ color: theme.palette.primary.main }}/> : <VisibilityOff sx={{ color: theme.palette.primary.main }}/>}
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
                  label={i18n.t("login.rememberMe")}
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
                  {i18n.t("login.forgotPassword")}
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
                {i18n.t("login.buttons.submit")}
              </BounceButton>

              {allowSignup && (
                <Slide direction="up" in timeout={1000}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    component={RouterLink}
                    to="/signup"
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    {i18n.t("login.buttons.register")}
                  </Button>
                </Slide>
              )}
            </form>
          </FloatingFormContainer>

          {/* Rodapé - agora com o mesmo alinhamento e largura do formulário */}
          <Fade in timeout={1200}>
            <FooterContainer position={loginPosition}>
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
            ? i18n.t("forgotPassword.title")
            : i18n.t("forgotPassword.resetTitle")
          }
        </DialogTitle>

        <Formik
          initialValues={initialForgotPasswordValues}
          validationSchema={validationSchema}
          onSubmit={resetStep === 1 ? handleSendResetEmail : handleResetPassword}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  label={i18n.t("forgotPassword.email")}
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
                      label={i18n.t("forgotPassword.token")}
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
                      label={i18n.t("forgotPassword.newPassword")}
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
                      label={i18n.t("forgotPassword.confirmPassword")}
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
                  {i18n.t("forgotPassword.cancel")}
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
                      ? i18n.t("forgotPassword.sendEmail")
                      : i18n.t("forgotPassword.resetPassword")
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