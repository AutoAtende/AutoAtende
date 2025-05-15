import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import PropTypes from 'prop-types';
import { Box, Typography, Button, Collapse, IconButton, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { animated, useSpring } from 'react-spring';

const ErrorContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(-45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  userSelect: 'none',
  color: 'white',
}));

const LogoContainer = styled(Box)({
  position: 'relative',
  width: 120,
  height: 120,
  margin: '0 auto',
  marginBottom: 24,
});

const LogoBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'white',
  borderRadius: 24,
  transform: 'rotate(-10deg)',
  boxShadow: theme.shadows[4],
}));

const LogoIcon = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ErrorPage = ({ errorMessage, errorDetails, onReload, deviceInfo }) => {
  const history = useHistory();
  const [showDetails, setShowDetails] = useState(false);
  
  const fadeAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 500 },
  });

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleBackToDashboard = () => {
    history.push("/");
  };


  return (
    <ErrorContainer>
      <animated.div style={fadeAnimation}>
        <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', px: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Algo deu errado!
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
            }}
          >
            {errorMessage || 'Um erro inesperado ocorreu. Tente recarregar a página ou retorne ao painel.'}
          </Typography>

          {/* Botões de ação */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBackToDashboard}
            >
              Voltar ao painel
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={onReload}
            >
              Recarregar Página
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              component={Link}
              href="/suporte"
              target="_blank"
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Contatar Suporte
            </Button>
          </Box>

          {/* Detalhes do erro e do dispositivo */}
          {errorDetails && (
            <Box sx={{ mt: 4 }}>
              <Button 
                onClick={toggleDetails} 
                startIcon={showDetails ? <ChevronUp /> : <ChevronDown />}
                variant="text"
                color="inherit"
                sx={{ color: 'white' }}
              >
                {showDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
              </Button>
              <Collapse in={showDetails}>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    textAlign: 'left',
                    overflow: 'auto',
                    maxHeight: 300,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Detalhes Técnicos
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace'
                    }}
                  >
                    {JSON.stringify(errorDetails, null, 2)}
                  </Typography>

                  {deviceInfo && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Informações do Dispositivo
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace'
                        }}
                      >
                        {JSON.stringify(deviceInfo, null, 2)}
                      </Typography>
                    </>
                  )}
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      </animated.div>
    </ErrorContainer>
  );
};

ErrorPage.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  errorDetails: PropTypes.object,           
  onReload: PropTypes.func.isRequired,      
  deviceInfo: PropTypes.object,
};

export default ErrorPage;