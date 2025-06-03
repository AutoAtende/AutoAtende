import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Tab, 
  Tabs, 
  Paper,
  useMediaQuery,
  Tooltip,
  Stack,
  Fade
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components - SEM overflow hidden ou altura fixa
const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // REMOVIDO: height: 100vh, overflow: hidden
  padding: theme.spacing(1, 1.5),
  // Primeira regra: Mobile (xs)
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(3, 4),
  }
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1),
  flexShrink: 0,
  // Mobile first: Começa com column
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(4),
  }
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.375rem',
  lineHeight: 1.3,
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.75rem',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '2rem',
  }
}));

const ActionButtonsContainer = styled(Stack)(({ theme }) => ({
  direction: 'row',
  spacing: 1,
  flexShrink: 0,
  width: '100%',
  // Mobile: botões em stack vertical
  '& > *': {
    minHeight: 44, // Área de toque mínima mobile
  },
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
    flexDirection: 'row',
    '& > *': {
      minHeight: 'auto',
    }
  }
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(1.5),
  flexShrink: 0,
  // Mobile first: 100% width
  [theme.breakpoints.up('sm')]: {
    width: '60%',
    marginBottom: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    width: '50%',
  },
  [theme.breakpoints.up('lg')]: {
    width: '33%',
  }
}));

const TabsContainer = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  borderRadius: 12, // Bordas mais arredondadas no mobile
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
  flexShrink: 0,
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  }
}));

// CORRIGIDO: ContentArea SEM altura fixa ou overflow auto
const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // REMOVIDO: minHeight: 0, overflow: auto - deixa a página rolar naturalmente
  // Scroll customizado (só se necessário)
  '&::-webkit-scrollbar': {
    width: 6,
    [theme.breakpoints.up('sm')]: {
      width: 8,
    }
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: 4,
  }
}));

// Componente de Botão Responsivo Melhorado
const ResponsiveActionButton = ({ 
  label, 
  icon, 
  onClick, 
  variant = "contained", 
  color = "primary",
  disabled = false,
  tooltip,
  fullWidth = false,
  ...props 
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const button = (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      startIcon={!isXs ? icon : null}
      fullWidth={isXs || fullWidth}
      sx={{
        minHeight: isXs ? 44 : 40, // Área de toque mobile
        borderRadius: isXs ? 12 : 8, // Bordas mais arredondadas no mobile
        padding: isXs 
          ? theme.spacing(1.5, 2) 
          : isSm 
            ? theme.spacing(1, 1.5)
            : theme.spacing(1, 2),
        fontSize: isXs ? '0.9rem' : '0.875rem',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: variant === 'contained' && isXs ? 2 : undefined,
        ...(isXs && icon && !label && {
          minWidth: 44,
          padding: theme.spacing(1),
          '& .MuiButton-startIcon': {
            margin: 0
          }
        })
      }}
      {...props}
    >
      {isXs && !label ? icon : label}
    </Button>
  );

  return (isMobile && tooltip) || (isXs && !label) ? (
    <Tooltip title={tooltip || label} arrow placement="top">
      {button}
    </Tooltip>
  ) : button;
};

ResponsiveActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  tooltip: PropTypes.string,
  fullWidth: PropTypes.bool
};

// Componente Principal Melhorado - SEM altura fixa
const StandardPageLayout = ({
  title,
  subtitle,
  actions = [],
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Pesquisar...",
  showSearch = true,
  tabs = [],
  activeTab = 0,
  onTabChange,
  children,
  loading = false,
  emptyState,
  showEmptyState = false,
  containerProps = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <PageContainer {...containerProps}>
      {/* Cabeçalho da Página */}
      <PageHeader>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PageTitle variant="h4" component="h1">
            {title}
          </PageTitle>
          {subtitle && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mt: 0.5,
                fontSize: isXs ? '0.875rem' : '0.9rem',
                lineHeight: 1.4
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions.length > 0 && (
          <ActionButtonsContainer 
            direction={isXs ? "column" : "row"}
            spacing={isXs ? 1 : 1.5}
          >
            {actions.map((action, index) => (
              <ResponsiveActionButton
                key={index}
                label={action.label}
                icon={action.icon}
                onClick={action.onClick}
                variant={action.variant || "contained"}
                color={action.color || "primary"}
                disabled={action.disabled || loading}
                tooltip={action.tooltip}
                fullWidth={isXs && action.primary}
              />
            ))}
          </ActionButtonsContainer>
        )}
      </PageHeader>

      {/* Campo de Pesquisa */}
      {showSearch && (
        <Fade in timeout={300}>
          <SearchContainer>
            <TextField
              fullWidth
              size={isXs ? "medium" : "small"}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: isXs ? 12 : theme.shape.borderRadius,
                '& .MuiOutlinedInput-root': {
                  borderRadius: isXs ? 12 : theme.shape.borderRadius,
                  minHeight: isXs ? 48 : 40,
                },
                '& .MuiInputBase-input': {
                  fontSize: isXs ? '1rem' : '0.875rem',
                }
              }}
            />
          </SearchContainer>
        </Fade>
      )}

      {/* Abas (se fornecidas) */}
      {tabs.length > 0 && (
        <Fade in timeout={400}>
          <TabsContainer>
            <Tabs
              value={activeTab}
              onChange={onTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                backgroundColor: theme.palette.background.paper,
                minHeight: isXs ? 56 : 48,
                '& .MuiTab-root': {
                  minHeight: isXs ? 56 : 48,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: isXs ? '0.9rem' : '0.875rem',
                  minWidth: isXs ? 120 : 90,
                  padding: theme.spacing(1, 2),
                },
                '& .MuiTabs-scrollButtons': {
                  '&.Mui-disabled': {
                    opacity: 0.3
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={!isXs ? tab.icon : null}
                  iconPosition="start"
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      marginRight: theme.spacing(1),
                      marginBottom: 0,
                    }
                  }}
                />
              ))}
            </Tabs>
          </TabsContainer>
        </Fade>
      )}

      {/* Área de Conteúdo - SEM limitação de altura */}
      <ContentArea>
        {showEmptyState && emptyState ? (
          <Fade in timeout={500}>
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              padding: 2
            }}>
              {emptyState}
            </Box>
          </Fade>
        ) : (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%'
            // REMOVIDO: minHeight: 0 - deixa crescer naturalmente
          }}>
            {children}
          </Box>
        )}
      </ContentArea>
    </PageContainer>
  );
};

StandardPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      color: PropTypes.string,
      disabled: PropTypes.bool,
      tooltip: PropTypes.string,
      primary: PropTypes.bool
    })
  ),
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  showSearch: PropTypes.bool,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node
    })
  ),
  activeTab: PropTypes.number,
  onTabChange: PropTypes.func,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  emptyState: PropTypes.node,
  showEmptyState: PropTypes.bool,
  containerProps: PropTypes.object
};

export default StandardPageLayout;