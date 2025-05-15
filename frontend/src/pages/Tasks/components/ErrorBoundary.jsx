// ErrorBoundary.jsx
import React from 'react';
import { Box, Typography, Button, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    if (this.props.reloadOnError) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  render() {
    if (this.state.hasError) {
      // Utilizaremos um componente funcional para acessar os hooks do Material-UI
      return <ErrorFallback onReset={this.handleReset} error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Componente para renderização do estado de erro
const ErrorFallback = ({ onReset, error }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Paper 
      sx={{ 
        p: isMobile ? 3 : 4, 
        m: isMobile ? 1 : 2,
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 2,
        maxWidth: '100%'
      }}
    >
      <Typography variant={isMobile ? "subtitle1" : "h6"} color="error" gutterBottom>
        Ops! Algo deu errado.
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Ocorreu um erro ao carregar esta seção. Por favor, tente novamente.
      </Typography>
      {process.env.NODE_ENV === 'development' && error && (
        <Box 
          sx={{ 
            mt: 2, 
            mb: 2, 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            overflow: 'auto',
            maxWidth: '100%',
            maxHeight: '200px',
            textAlign: 'left'
          }}
        >
          <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.toString()}
          </Typography>
        </Box>
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={<RefreshIcon />}
        onClick={onReset}
        size={isMobile ? "small" : "medium"}
        sx={{ mt: isMobile ? 1 : 2 }}
      >
        Tentar Novamente
      </Button>
    </Paper>
  );
};

export default ErrorBoundary;