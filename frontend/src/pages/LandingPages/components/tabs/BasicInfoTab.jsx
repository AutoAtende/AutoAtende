import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment,
  Typography,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { 
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Public as PublicIcon,
  EditOff as EditOffIcon
} from '@mui/icons-material';
import { AuthContext } from '../../../../context/Auth/AuthContext';
import { useSnackbar } from 'notistack';
import { useSpring, animated } from 'react-spring';
import useDebounced from '../../../../hooks/useDebounced';
import { slugify, generateUniqueSlug } from '../../../../utils/stringUtils';

const AnimatedPaper = animated(Paper);

const BasicInfoTab = ({ landingPage, setLandingPage, checkSlugAvailability, isNew }) => {
  const [slug, setSlug] = useState(landingPage.slug || '');
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!landingPage.slug);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuth, user } = useContext(AuthContext);
  const companyId = localStorage.getItem("companyId") ? localStorage.getItem("companyId") : user.companyId;
  
  // Usando debounce para não verificar o slug a cada digito
  const debouncedSlug = useDebounced(slug, 500);
  
  // Animações
  const paperAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

    // Animações com react-spring
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });
  
  // Efeito para verificar disponibilidade do slug
  useEffect(() => {
    const checkSlug = async () => {
      // Não fazer verificação se o slug estiver vazio ou muito curto
      if (!debouncedSlug || debouncedSlug.length < 1) {
        console.log('[checkSlug] Slug vazio ou muito curto, ignorando verificação');
        setSlugAvailable(null);
        return;
      }
      
      // Garantir que apenas caracteres válidos sejam enviados
      const validatedSlug = slugify(debouncedSlug);
      console.log(`[checkSlug] Slug original: "${debouncedSlug}", Slug validado: "${validatedSlug}"`);
      
      // Se o slug não for válido após a validação, não enviar requisição
      if (!validatedSlug) {
        console.log('[checkSlug] Slug inválido após validação');
        setSlugAvailable(false);
        return;
      }
      
      try {
        console.log(`[checkSlug] Iniciando verificação para slug: "${validatedSlug}"`);
        setCheckingSlug(true);
        const available = await checkSlugAvailability(validatedSlug);
        console.log(`[checkSlug] Resposta da API: disponível = ${available}`);
        setSlugAvailable(available);
        setCheckingSlug(false);
        
        // Atualizar landingPage se o slug estiver disponível
        if (available) {
          console.log(`[checkSlug] Atualizando state com slug disponível: "${validatedSlug}"`);
          setLandingPage(prev => ({
            ...prev,
            slug: validatedSlug
          }));
        }
      } catch (error) {
        console.error('[checkSlug] Erro ao verificar slug:', error);
        // CORREÇÃO: Não assumir automaticamente que está indisponível
        setSlugAvailable(null); 
        setCheckingSlug(false);
        // Notificar o usuário sobre o erro
        enqueueSnackbar('Erro ao verificar disponibilidade do slug. Tente novamente.', 
          { variant: 'error' });
      }
    };
    
    // Atraso adicional para evitar chamadas desnecessárias
    const timer = setTimeout(() => {
      checkSlug();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [debouncedSlug, checkSlugAvailability, setLandingPage, enqueueSnackbar]);
  
  // Gerar slug a partir do título
  useEffect(() => {
    if (autoGenerateSlug && landingPage.title) {
      // Usar função melhorada para gerar slugs
      const uniqueSlug = generateUniqueSlug(landingPage.title);
      setSlug(uniqueSlug);
    }
  }, [landingPage.title, autoGenerateSlug]);
  
  // Handler para alteração de título
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setLandingPage(prev => ({
      ...prev,
      title: newTitle
    }));
  };
  
  // Handler para alteração de slug
  const handleSlugChange = (e) => {
    const newSlug = slugify(e.target.value);
    setSlug(newSlug);
    setAutoGenerateSlug(false);
  };
  
  // Handler para alteração de status ativo
  const handleActiveChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      active: e.target.checked
    }));
  };
  
  // Renderizar indicador de disponibilidade de slug
  const renderSlugStatus = () => {
    if (checkingSlug) {
      return <CircularProgress size={20} />;
    }
    
    if (slugAvailable === null) {
      return null;
    }
    
    if (slugAvailable) {
      return <CheckIcon sx={{ color: 'success.main' }} />;
    }
    
    return <CloseIcon sx={{ color: 'error.main' }} />;
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
        <InfoIcon sx={{ mr: 1 }} />
        Informações Básicas
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Título da Página"
            value={landingPage.title}
            onChange={handleTitleChange}
            variant="outlined"
            required
            placeholder="Ex: Webinar de Marketing Digital"
            helperText="O título será exibido na aba do navegador e em compartilhamentos"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PublicIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="URL da Página (Slug)"
            value={slug}
            onChange={handleSlugChange}
            variant="outlined"
            required
            error={slugAvailable === false}
            helperText={
              slugAvailable === false
                ? "Esta URL já está em uso. Por favor, escolha outra."
                : "A URL amigável que será usada para acessar sua página"
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>
                  {window.location.origin}/l/{companyId}/
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {renderSlugStatus()}
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={autoGenerateSlug}
                onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                color="primary"
              />
            }
            label="Gerar URL automaticamente a partir do título"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              bgcolor: 'background.neutral', 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              URL completa da sua landing page:
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
  <LinkIcon color="primary" sx={{ mr: 1 }} />
  <Typography 
    variant="body1"
    component="pre"
    sx={{ 
      bgcolor: 'background.paper',
      p: 1.5,
      borderRadius: 1,
      fontFamily: 'monospace',
      flex: 1,
      overflowX: 'auto'
    }}
  >
    {`${window.location.origin}/l/${companyId}/${landingPage.slug || '(definir-url)'}`}
  </Typography>
</Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={landingPage.active}
                    onChange={handleActiveChange}
                    color="success"
                  />
                }
                label={
                  <Typography variant="subtitle1">
                    {landingPage.active ? "Página ativa" : "Página inativa"}
                  </Typography>
                }
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                {landingPage.active 
                  ? "Sua página está publicada e acessível ao público."
                  : "Sua página está em modo rascunho e só ficará visível após ativação."}
              </Typography>
            </Box>
            
            <Chip 
              icon={landingPage.active ? <CheckIcon /> : <EditOffIcon />}
              label={landingPage.active ? "Publicada" : "Rascunho"}
              color={landingPage.active ? "success" : "default"}
              variant={landingPage.active ? "filled" : "outlined"}
              sx={{ height: 36 }}
            />
          </Box>
        </Grid>
        
        {!isNew && (
          <Grid item xs={12} mt={2}>
            <Alert 
              severity="info" 
              variant="outlined"
              icon={<InfoIcon />}
              sx={{ borderRadius: 2 }}
            >
              Esta página foi criada em {new Date(landingPage.createdAt).toLocaleDateString()} 
              {landingPage.updatedAt && landingPage.updatedAt !== landingPage.createdAt && 
                ` e atualizada pela última vez em ${new Date(landingPage.updatedAt).toLocaleDateString()}`
              }.
            </Alert>
          </Grid>
        )}
      </Grid>
    </AnimatedPaper>
  );
};

export default BasicInfoTab;