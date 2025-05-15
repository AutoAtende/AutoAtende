import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import BaseButton from './BaseButton';

// Componentes estilizados com adaptação para tema claro/escuro
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    margin: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      maxHeight: '100%',
      maxWidth: '100%',
      borderRadius: 0,
    },
  },
}));

const StyledDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

// Ajuste no componente BaseModal.jsx
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(5),
  paddingTop: theme.spacing(5),
  marginTop: theme.spacing(2), 
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  gap: theme.spacing(1),
  // Garantir adaptação ao tema escuro
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const TitleText = styled(Typography)(({ theme, isMobile }) => ({
  flex: 1,
  ...(isMobile ? theme.typography.subtitle1 : theme.typography.h6),
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const BaseModal = ({
  open,
  onClose,
  title,
  children,
  actions = [],
  maxWidth = 'md',
  helpText,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderActionButtons = () => {
    return actions.map((action, index) => (
      <BaseButton
        key={index}
        onClick={action.onClick}
        variant={action.variant || 'contained'}
        color={action.color || 'primary'}
        disabled={loading || action.disabled}
        startIcon={action.icon}
        size={isMobile ? 'small' : 'medium'}
      >
        {action.label}
      </BaseButton>
    ));
  };

  return (
    <StyledDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={isMobile}
    >
      <StyledDialogTitle>
        <TitleText isMobile={isMobile} variant={isMobile ? "subtitle1" : "h6"}>
          {title}
        </TitleText>
        <IconContainer>
          {helpText && (
            <Tooltip title={helpText}>
              <IconButton
                size="small"
                aria-label="ajuda"
                onClick={(e) => e.preventDefault()}
                sx={{ color: 'primary.contrastText' }}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            size="small"
            aria-label="fechar"
            onClick={onClose}
            disabled={loading}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </IconContainer>
      </StyledDialogTitle>

      <StyledDialogContent>
        {children}
      </StyledDialogContent>

      {actions.length > 0 && (
        <StyledDialogActions>
          {renderActionButtons()}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

BaseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.node
  })),
  maxWidth: PropTypes.string,
  helpText: PropTypes.string,
  loading: PropTypes.bool
};

// Aplicar memo para evitar re-renderizações desnecessárias
export default React.memo(BaseModal);