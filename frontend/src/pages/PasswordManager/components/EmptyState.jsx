import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  VpnKey as KeyIcon,
  Add as AddIcon
} from '@mui/icons-material';

const EmptyState = ({ onCreateNew }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}
    >
      <KeyIcon
        sx={{
          fontSize: { xs: 48, sm: 64 },
          color: 'primary.main',
          opacity: 0.7,
          mb: 2
        }}
      />
      
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        align="center"
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        Nenhuma senha encontrada
      </Typography>
      
      <Typography
        variant="body1"
        align="center" 
        color="text.secondary"
        sx={{ maxWidth: '500px', mb: 4 }}
      >
        Não há senhas cadastradas para os filtros selecionados.
        {isMobile ? '' : ' Você pode adicionar uma nova senha ou ajustar os critérios de busca.'}
      </Typography>
      
      <Button
        variant="contained"
        size={isMobile ? 'medium' : 'large'}
        startIcon={<AddIcon />}
        onClick={onCreateNew}
        disableElevation
        sx={{
          borderRadius: '28px',
          px: { xs: 3, sm: 4 },
          py: { xs: 1, sm: 1.5 },
          boxShadow: theme.shadows[2],
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          }
        }}
      >
        Adicionar Nova Senha
      </Button>
    </Paper>
  );
};

EmptyState.propTypes = {
  onCreateNew: PropTypes.func.isRequired
};

export default EmptyState;