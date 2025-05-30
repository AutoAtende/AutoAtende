import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Divider,
  Breadcrumbs,
  Link,
  Chip,
  useMediaQuery,
  Stack,
  Fade,
  Grow
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components Mobile First
const TabContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // Remove qualquer limitação de altura para permitir crescimento natural
}));

const TabHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  flexShrink: 0, // Não encolhe o header
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2.5),
  },
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(3),
  }
}));

const TabTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '1.125rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  lineHeight: 1.3,
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.25rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.375rem',
  }
}));

const TabDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  marginTop: theme.spacing(0.5),
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.9rem',
  }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // Remove limitações de altura e overflow para permitir crescimento natural
}));

const ContentArea = styled(Box)(({ theme, variant }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // Remove limitações de altura para permitir expansão completa
  ...(variant === 'paper' && {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12, // Mobile first: bordas mais arredondadas
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.08)',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2.5),
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
    }
  }),
  ...(variant === 'padded' && {
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2.5),
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
    }
  })
}));

const StatsContainer = styled(Stack)(({ theme }) => ({
  direction: 'row',
  spacing: 1,
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  // Mobile first: vertical stack
  [theme.breakpoints.down('sm')]: {
    direction: 'column',
    spacing: 0.5,
    '& > *': {
      alignSelf: 'flex-start'
    }
  }
}));

const ActionsContainer = styled(Stack)(({ theme }) => ({
  direction: 'row',
  spacing: 1,
  flexWrap: 'wrap',
  // Mobile first
  [theme.breakpoints.down('sm')]: {
    direction: 'column',
    width: '100%',
    '& > *': {
      minHeight: 44, // Área de toque mínima
    }
  }
}));

// Componente de Estatísticas Melhorado
const TabStats = ({ stats = [] }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  
  if (!stats.length) return null;

  return (
    <StatsContainer spacing={isXs ? 0.5 : 1}>
      {stats.map((stat, index) => (
        <Grow in timeout={300 + (index * 100)} key={index}>
          <Chip
            icon={stat.icon}
            label={stat.label}
            size={isXs ? "medium" : "small"}
            color={stat.color || 'default'}
            variant={stat.variant || 'outlined'}
            sx={{ 
              fontWeight: 500,
              borderRadius: isXs ? 8 : 6,
              height: isXs ? 36 : 32,
              fontSize: isXs ? '0.875rem' : '0.8125rem',
              '& .MuiChip-icon': {
                fontSize: isXs ? '1rem' : '0.875rem'
              },
              '& .MuiChip-label': {
                padding: isXs ? theme.spacing(0, 1) : theme.spacing(0, 0.75)
              }
            }}
          />
        </Grow>
      ))}
    </StatsContainer>
  );
};

// Componente de Navegação Melhorado
const TabBreadcrumbs = ({ items = [] }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  
  if (!items.length) return null;

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="navegação"
      sx={{ 
        fontSize: isXs ? '0.875rem' : '0.8125rem',
        '& .MuiBreadcrumbs-separator': {
          marginX: isXs ? 0.75 : 0.5
        },
        '& .MuiBreadcrumbs-ol': {
          flexWrap: isXs ? 'wrap' : 'nowrap'
        }
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link
              color="inherit"
              href={item.href}
              onClick={item.onClick}
              sx={{ 
                textDecoration: 'none',
                padding: isXs ? theme.spacing(0.5) : 0,
                borderRadius: isXs ? 4 : 0,
                minHeight: isXs ? 32 : 'auto',
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  textDecoration: 'underline',
                  backgroundColor: isXs ? theme.palette.action.hover : 'transparent'
                }
              }}
            >
              {item.label}
            </Link>
          ) : (
            <Typography 
              color="text.primary" 
              fontSize="inherit"
              sx={{
                padding: isXs ? theme.spacing(0.5) : 0,
                fontWeight: isXs ? 500 : 400
              }}
            >
              {item.label}
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Breadcrumbs>
  );
};

// Componente de Alerta Melhorado
const TabAlert = ({ 
  severity = 'info', 
  title, 
  message, 
  action,
  dismissible = false,
  onDismiss,
  sx = {}
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  
  const icons = {
    info: <InfoIcon fontSize="small" />,
    warning: <WarningIcon fontSize="small" />,
    error: <ErrorIcon fontSize="small" />,
    success: <SuccessIcon fontSize="small" />
  };

  return (
    <Fade in timeout={400}>
      <Alert
        severity={severity}
        icon={icons[severity]}
        action={action}
        onClose={dismissible ? onDismiss : undefined}
        sx={{
          borderRadius: isXs ? 12 : 8,
          fontSize: isXs ? '0.875rem' : '0.8125rem',
          '& .MuiAlert-message': {
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            width: '100%'
          },
          '& .MuiAlert-action': {
            alignItems: isXs ? 'flex-start' : 'center',
            paddingTop: isXs ? theme.spacing(0.5) : 0
          },
          ...sx
        }}
      >
        {title && (
          <Typography 
            variant="subtitle2" 
            component="div" 
            gutterBottom
            sx={{ 
              fontSize: isXs ? '0.9rem' : '0.875rem',
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
        )}
        {message && (
          <Typography 
            variant="body2"
            sx={{ 
              fontSize: isXs ? '0.875rem' : '0.8125rem',
              lineHeight: 1.5
            }}
          >
            {message}
          </Typography>
        )}
      </Alert>
    </Fade>
  );
};

// Componente Principal Melhorado
const StandardTabContent = ({
  title,
  description,
  icon,
  breadcrumbs = [],
  stats = [],
  alerts = [],
  actions,
  variant = 'default', // 'default', 'paper', 'padded'
  loading = false,
  children,
  contentProps = {},
  headerProps = {},
  emptyState,
  showEmptyState = false
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <TabContainer>
      {/* Cabeçalho da Aba - só exibe se tem conteúdo para mostrar */}
      {(title || description || breadcrumbs.length > 0 || stats.length > 0 || actions) && (
        <TabHeader {...headerProps}>
          {/* Navegação (Breadcrumbs) */}
          <TabBreadcrumbs items={breadcrumbs} />

          {/* Título e Ações */}
          {(title || actions) && (
            <Box
              display="flex"
              flexDirection={isXs ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems={isXs ? 'stretch' : 'flex-start'}
              gap={2}
            >
              <Box flex={1} sx={{ minWidth: 0 }}>
                {title && (
                  <Fade in timeout={200}>
                    <TabTitle>
                      {icon && icon}
                      {title}
                    </TabTitle>
                  </Fade>
                )}
                {description && (
                  <Fade in timeout={300}>
                    <TabDescription>
                      {description}
                    </TabDescription>
                  </Fade>
                )}
                <TabStats stats={stats} />
              </Box>

              {actions && (
                <Fade in timeout={400}>
                  <ActionsContainer spacing={isXs ? 1 : 1.5}>
                    {React.Children.map(actions, (action, index) => 
                      React.cloneElement(action, {
                        key: index,
                        fullWidth: isXs,
                        sx: {
                          minHeight: isXs ? 44 : 'auto',
                          borderRadius: isXs ? 12 : 8,
                          ...action.props.sx
                        }
                      })
                    )}
                  </ActionsContainer>
                </Fade>
              )}
            </Box>
          )}

          {/* Alertas */}
          {alerts.map((alert, index) => (
            <TabAlert
              key={index}
              severity={alert.severity}
              title={alert.title}
              message={alert.message}
              action={alert.action}
              dismissible={alert.dismissible}
              onDismiss={alert.onDismiss}
              sx={alert.sx}
            />
          ))}

          {/* Divisor */}
          {(title || description || breadcrumbs.length > 0 || alerts.length > 0) && (
            <Divider sx={{ 
              mt: 1,
              mx: isXs ? -1 : 0
            }} />
          )}
        </TabHeader>
      )}

      {/* Área de Conteúdo */}
      <ContentWrapper>
        <ContentArea variant={variant} {...contentProps}>
          {showEmptyState && emptyState ? (
            <Fade in timeout={500}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: theme.spacing(2),
                minHeight: '200px',
                width: '100%'
              }}>
                {emptyState}
              </Box>
            </Fade>
          ) : (
            children
          )}
        </ContentArea>
      </ContentWrapper>
    </TabContainer>
  );
};

StandardTabContent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func
    })
  ),
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      color: PropTypes.string,
      variant: PropTypes.string
    })
  ),
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
      title: PropTypes.string,
      message: PropTypes.string,
      action: PropTypes.node,
      dismissible: PropTypes.bool,
      onDismiss: PropTypes.func,
      sx: PropTypes.object
    })
  ),
  actions: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'paper', 'padded']),
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  contentProps: PropTypes.object,
  headerProps: PropTypes.object,
  emptyState: PropTypes.node,
  showEmptyState: PropTypes.bool
};

export default StandardTabContent;