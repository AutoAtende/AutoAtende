import React, { useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  InputAdornment,
  Switch,
  Divider,
  Paper,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  useMediaQuery,
  Alert,
  Popover
} from '@mui/material';
import {
  ColorLens as ColorIcon,
  WallpaperOutlined as BackgroundIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Help as HelpIcon,
  Palette as PaletteIcon,
  FormatColorFill as FillIcon,
  Image as ImageIcon,
  AspectRatio as AspectRatioIcon,
  Repeat as RepeatIcon,
  Info as InfoIcon,
  InsertLink as InsertLinkIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { useSpring, animated } from 'react-spring';
import ImageUploader from '../ImageUploader';

const AnimatedPaper = animated(Paper);
const AnimatedBox = animated(Box);

const AppearanceTab = ({ landingPage, setLandingPage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Refs para posicionar os color pickers
  const textColorRef = useRef(null);
  const bgColorRef = useRef(null);
  
  // Estados para controle dos popovers de cores
  const [textColorPickerOpen, setTextColorPickerOpen] = useState(false);
  const [bgColorPickerOpen, setBgColorPickerOpen] = useState(false);
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

  const previewAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 220, friction: 40 }
  });
  
  // Handler para alteração da cor do texto
  const handleTextColorChange = (color) => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        textColor: color.hex
      }
    }));
  };
  
  // Handler para alteração da cor de fundo
  const handleBgColorChange = (color) => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundColor: color.hex
      }
    }));
  };
  
  // Handler para abrir o popover de cor do texto
  const handleOpenTextColorPicker = () => {
    setTextColorPickerOpen(true);
    setBgColorPickerOpen(false);
  };
  
  // Handler para abrir o popover de cor de fundo
  const handleOpenBgColorPicker = () => {
    setBgColorPickerOpen(true);
    setTextColorPickerOpen(false);
  };
  
  // Handler para fechar todos os popovers
  const handleCloseColorPickers = () => {
    setTextColorPickerOpen(false);
    setBgColorPickerOpen(false);
  };
  
  // Handler para alteração da imagem de fundo
  const handleBackgroundImageUpload = (imageUrl) => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundImage: imageUrl
      }
    }));
  };
  
  // Handler para remover a imagem de fundo
  const handleRemoveBackgroundImage = () => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundImage: ''
      }
    }));
  };
  
  // Handler para alteração do posicionamento do fundo
  const handleBgPositionChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundPosition: e.target.value
      }
    }));
  };
  
  // Handler para alteração da repetição do fundo
  const handleBgRepeatChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundRepeat: e.target.checked
      }
    }));
  };
  
  // Handler para alteração do tamanho do fundo
  const handleBgSizeChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundSize: e.target.value
      }
    }));
  };
  
  // Handler para alteração do comportamento do fundo
  const handleBgAttachmentChange = (e) => {
    setLandingPage(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundAttachment: e.target.value
      }
    }));
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
        <PaletteIcon sx={{ mr: 1 }} />
        Aparência
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 500
          }}>
            <ColorIcon sx={{ mr: 1, color: 'primary.main' }} />
            Paleta de Cores
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Cor do Texto
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Box
                      ref={textColorRef}
                      sx={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: landingPage.appearance.textColor,
                        border: `1px solid ${theme.palette.divider}`,
                        mr: 2,
                        cursor: 'pointer'
                      }}
                      onClick={handleOpenTextColorPicker}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontFamily="monospace">
                        {landingPage.appearance.textColor}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={handleOpenTextColorPicker}
                      startIcon={<ColorIcon />}
                      sx={{ ml: 1 }}
                    >
                      Alterar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Cor de Fundo
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Box
                      ref={bgColorRef}
                      sx={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: landingPage.appearance.backgroundColor,
                        border: `1px solid ${theme.palette.divider}`,
                        mr: 2,
                        cursor: 'pointer'
                      }}
                      onClick={handleOpenBgColorPicker}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontFamily="monospace">
                        {landingPage.appearance.backgroundColor}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={handleOpenBgColorPicker}
                      startIcon={<FillIcon />}
                      sx={{ ml: 1 }}
                    >
                      Alterar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Color pickers usando Popover para melhor posicionamento */}
          <Popover
            open={textColorPickerOpen}
            anchorEl={textColorRef.current}
            onClose={handleCloseColorPickers}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box p={1}>
              <SketchPicker 
                color={landingPage.appearance.textColor} 
                onChange={handleTextColorChange}
                disableAlpha={true}
              />
            </Box>
          </Popover>
          
          <Popover
            open={bgColorPickerOpen}
            anchorEl={bgColorRef.current}
            onClose={handleCloseColorPickers}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box p={1}>
              <SketchPicker 
                color={landingPage.appearance.backgroundColor} 
                onChange={handleBgColorChange}
                disableAlpha={true}
              />
            </Box>
          </Popover>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center" fontWeight={500}>
            <BackgroundIcon sx={{ mr: 1, color: 'primary.main' }} />
            Imagem de Fundo
            <Tooltip title="A imagem de fundo pode ser usada para criar designs mais elaborados. Recomendado: 1920x1080px, máximo 2MB.">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: `1px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 1
                }}
              >
                <ImageUploader
                  currentImage={landingPage.appearance.backgroundImage}
                  onImageUpload={handleBackgroundImageUpload}
                  maxSize={2 * 1024 * 1024} // 2MB
                  acceptedTypes={['image/jpeg', 'image/png', 'image/gif']}
                  height={200}
                  landingPageId={landingPage.id}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {landingPage.appearance.backgroundImage ? (
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                  <Alert 
                    severity="success" 
                    variant="outlined"
                    icon={<CheckIcon />}
                    sx={{ mb: 2, width: '100%', borderRadius: 2 }}
                  >
                    <Typography variant="body2">
                      Imagem de fundo definida com sucesso!
                    </Typography>
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemoveBackgroundImage}
                  >
                    Remover Imagem
                  </Button>
                </Box>
              ) : (
                <Alert 
                  severity="info" 
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    Nenhuma imagem de fundo definida. Arraste uma imagem para a área ou clique para selecionar.
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </Grid>
        
        {landingPage.appearance.backgroundImage && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 2, mt: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight={500}>
                  Configurações da Imagem de Fundo
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" margin="normal">
                      <InputLabel>Posicionamento</InputLabel>
                      <Select
                        value={landingPage.appearance.backgroundPosition || 'center'}
                        onChange={handleBgPositionChange}
                        label="Posicionamento"
                        startAdornment={
                          <InputAdornment position="start">
                            <AspectRatioIcon fontSize="small" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="center">Centralizado</MenuItem>
                        <MenuItem value="left">Esquerda</MenuItem>
                        <MenuItem value="right">Direita</MenuItem>
                        <MenuItem value="top">Topo</MenuItem>
                        <MenuItem value="bottom">Base</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" margin="normal">
                      <InputLabel>Tamanho</InputLabel>
                      <Select
                        value={landingPage.appearance.backgroundSize || 'cover'}
                        onChange={handleBgSizeChange}
                        label="Tamanho"
                        startAdornment={
                          <InputAdornment position="start">
                            <ImageIcon fontSize="small" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="cover">Cobrir (cover)</MenuItem>
                        <MenuItem value="contain">Conter (contain)</MenuItem>
                        <MenuItem value="100% 100%">Esticar</MenuItem>
                        <MenuItem value="auto">Original</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" margin="normal">
                      <InputLabel>Comportamento</InputLabel>
                      <Select
                        value={landingPage.appearance.backgroundAttachment || 'scroll'}
                        onChange={handleBgAttachmentChange}
                        label="Comportamento"
                        startAdornment={
                          <InputAdornment position="start">
                            <RepeatIcon fontSize="small" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="scroll">Rolar com a página</MenuItem>
                        <MenuItem value="fixed">Fixo</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={landingPage.appearance.backgroundRepeat || false}
                          onChange={handleBgRepeatChange}
                          color="primary"
                        />
                      }
                      label="Repetir imagem"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={500} sx={{ display: 'flex', alignItems: 'center' }}>
              <VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
              Pré-visualização
            </Typography>
          </Box>
          <AnimatedBox 
            style={previewAnimation}
            sx={{ overflow: 'hidden', borderRadius: 2 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mt: 1,
                minHeight: '200px',
                color: landingPage.appearance.textColor,
                backgroundColor: landingPage.appearance.backgroundColor,
                backgroundImage: landingPage.appearance.backgroundImage ? `url(${landingPage.appearance.backgroundImage})` : 'none',
                backgroundPosition: landingPage.appearance.backgroundPosition || 'center',
                backgroundRepeat: landingPage.appearance.backgroundRepeat ? 'repeat' : 'no-repeat',
                backgroundSize: landingPage.appearance.backgroundSize || 'cover',
                backgroundAttachment: landingPage.appearance.backgroundAttachment || 'scroll',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              <Typography variant="h5" gutterBottom>
                {landingPage.title || 'Título da Página'}
              </Typography>
              <Typography variant="body1">
                Este é um exemplo de como seu texto aparecerá na landing page. 
                Você pode ajustar as cores e o fundo para obter o visual ideal.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                {landingPage.formConfig.buttonText || 'Botão de Exemplo'}
              </Button>
            </Paper>
          </AnimatedBox>
        </Grid>
      </Grid>
    </AnimatedPaper>
  );
};

export default AppearanceTab;