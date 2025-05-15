import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { i18n } from "../../translate/i18n";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado por ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          p={4}
          textAlign="center"
        >
          <Typography variant="h5" color="error" gutterBottom>
            {i18n.t('chat.errors.boundaryTitle')}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {i18n.t('chat.errors.boundaryDescription')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReload}
            sx={{ mt: 2 }}
          >
            {i18n.t('chat.reload')}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;