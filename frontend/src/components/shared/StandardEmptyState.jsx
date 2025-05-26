import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  Fade,
  Stack
} from '@mui/material';
import {
  Inbox as InboxIcon,
  SearchOff as SearchOffIcon,
  ErrorOutline as ErrorIcon,
  CloudOff as CloudOffIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Styled Components Mobile First
const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
  minHeight: '250px',
  width: '100%',
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
    minHeight: '300px',
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
    minHeight: '350px',
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8),
    minHeight: '400px',
  }
}));

const IconContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
  '& svg': {
    fontSize: '3rem',
    // Mobile first
    [theme.breakpoints.up('sm')]: {
      fontSize: '3.5rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '4rem',
    }
  }
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  maxWidth: '320px',
  margin: '0 auto',
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    maxWidth: '400px',
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: '480px',
  }
}));

const ActionsContainer = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(3),
  width: '100%',
  maxWidth: '280px',
  // Mobile first
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(4),
    maxWidth: '320px',
  }
}));

// Ícones pré-definidos para diferentes tipos de estado vazio
const EmptyStateIcons = {
  default: InboxIcon,
  search: SearchOffIcon,
  error: ErrorIcon,
  offline: CloudOffIcon,
  inbox: InboxIcon
};

// Mensagens pré-definidas para diferentes contextos
const EmptyStateMessages = {
  default: {
    title: 'Nenhum item encontrado',
    description: 'Não há dados para exibir no momento. Verifique os filtros aplicados ou adicione novos itens.'
  },
  search: {
    title: 'Nenhum resultado encontrado',
    description: 'Não encontramos nada que corresponda à sua pesquisa. Tente usar termos diferentes ou verificar a ortografia.'
  },
  error: {
    title: 'Erro ao carregar dados',
    description: 'Ocorreu um problema ao carregar as informações. Tente novamente em alguns instantes.'
  },
  offline: {
    title: 'Sem conexão',
    description: 'Verifique sua conexão com a internet e tente novamente.'
  },
  tickets: {
    title: 'Nenhum ticket encontrado',
    description: 'Não há tickets cadastrados no momento. Crie um novo ticket para começar.'
  },
  campanhas: {
    title: 'Nenhuma campanha encontrada',
    description: 'Não há campanhas cadastradas. Crie uma nova campanha para começar a enviar mensagens.'
  },
  contatos: {
    title: 'Nenhum contato encontrado',
    description: 'Sua lista de contatos está vazia. Importe contatos ou adicione manualmente.'
  },
  usuarios: {
    title: 'Nenhum usuário encontrado',
    description: 'Não há usuários cadastrados no sistema.'
  },
  filas: {
    title: 'Nenhuma fila encontrada',
    description: 'Não há filas de atendimento configuradas. Crie uma nova fila para organizar os atendimentos.'
  },
  etiquetas: {
    title: 'Nenhuma etiqueta encontrada',
    description: 'Não há etiquetas cadastradas. Crie etiquetas para organizar seus tickets.'
  },
  horarios: {
    title: 'Nenhum horário configurado',
    description: 'Não há horários de funcionamento configurados para esta empresa.'
  },
  mensagens: {
    title: 'Nenhuma mensagem encontrada',
    description: 'Não há mensagens nesta conversa ainda.'
  }
};

// Ações pré-definidas para diferentes contextos
const EmptyStateActions = {
  default: {
    primary: { label: 'Adicionar Item', icon: <AddIcon /> },
    secondary: { label: 'Atualizar', icon: <RefreshIcon /> }
  },
  search: {
    secondary: { label: 'Limpar Filtros', icon: <RefreshIcon /> }
  },
  error: {
    primary: { label: 'Tentar Novamente', icon: <RefreshIcon /> }
  },
  tickets: {
    primary: { label: 'Novo Ticket', icon: <AddIcon /> }
  },
  campanhas: {
    primary: { label: 'Nova Campanha', icon: <AddIcon /> }
  },
  contatos: {
    primary: { label: 'Adicionar Contato', icon: <AddIcon /> },
    secondary: { label: 'Importar Contatos', icon: <AddIcon /> }
  },
  usuarios: {
    primary: { label: 'Novo Usuário', icon: <AddIcon /> }
  },
  filas: {
    primary: { label: 'Nova Fila', icon: <AddIcon /> }
  },
  etiquetas: {
    primary: { label: 'Nova Etiqueta', icon: <AddIcon /> }
  }
};

// Componente Principal
const StandardEmptyState = ({
  type = 'default',
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  actions = [],
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'default', // 'default', 'outlined', 'minimal'
  customContent,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));

  // Definir configurações baseadas no tipo
  const typeConfig = EmptyStateMessages[type] || EmptyStateMessages.default;
  const typeActions = EmptyStateActions[type] || EmptyStateActions.default;
  const TypeIcon = EmptyStateIcons[type] || EmptyStateIcons.default;

  // Definir tamanhos baseados na prop size e breakpoint
  const getSizes = () => {
    const sizes = {
      small: {
        icon: isXs ? '2rem' : '2.5rem',
        title: isXs ? '1rem' : '1.125rem',
        description: '0.875rem',
        minHeight: isXs ? '180px' : '200px',
        padding: theme.spacing(2, 1)
      },
      medium: {
        icon: isXs ? '3rem' : isSm ? '3.5rem' : '4rem',
        title: isXs ? '1.125rem' : isSm ? '1.25rem' : '1.375rem',
        description: isXs ? '0.875rem' : '0.9rem',
        minHeight: isXs ? '250px' : isSm ? '300px' : '350px',
        padding: theme.spacing(isXs ? 3 : isSm ? 4 : 6)
      },
      large: {
        icon: isXs ? '3.5rem' : isSm ? '4rem' : '5rem',
        title: isXs ? '1.25rem' : isSm ? '1.375rem' : '1.5rem',
        description: isXs ? '0.9rem' : '1rem',
        minHeight: isXs ? '300px' : isSm ? '350px' : '450px',
        padding: theme.spacing(isXs ? 4 : isSm ? 6 : 8)
      }
    };
    return sizes[size] || sizes.medium;
  };

  const sizes = getSizes();

  // Definir estilos baseados na variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          border: `2px dashed ${theme.palette.divider}`,
          borderRadius: theme.spacing(2),
          backgroundColor: theme.palette.background.default
        };
      case 'minimal':
        return {
          backgroundColor: 'transparent'
        };
      default:
        return {
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.spacing(1)
        };
    }
  };

  // Preparar ações
  const allActions = [];
  
  if (primaryAction || typeActions.primary) {
    allActions.push({
      ...typeActions.primary,
      ...primaryAction,
      variant: 'contained',
      primary: true
    });
  }
  
  if (secondaryAction || typeActions.secondary) {
    allActions.push({
      ...typeActions.secondary,
      ...secondaryAction,
      variant: 'outlined',
      primary: false
    });
  }
  
  allActions.push(...actions);

  return (
    <Fade in timeout={500}>
      <EmptyStateContainer
        sx={{
          minHeight: sizes.minHeight,
          padding: sizes.padding,
          ...getVariantStyles(),
          ...sx
        }}
        {...props}
      >
        <ContentContainer>
          {/* Ícone */}
          <IconContainer>
            {icon || <TypeIcon sx={{ fontSize: sizes.icon }} />}
          </IconContainer>

          {/* Título */}
          <Typography
            variant="h6"
            component="h3"
            color="text.primary"
            gutterBottom
            sx={{
              fontSize: sizes.title,
              fontWeight: 600,
              marginBottom: theme.spacing(1)
            }}
          >
            {title || typeConfig.title}
          </Typography>

          {/* Descrição */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: sizes.description,
              lineHeight: 1.6,
              marginBottom: theme.spacing(2)
            }}
          >
            {description || typeConfig.description}
          </Typography>

          {/* Conteúdo Customizado */}
          {customContent && (
            <Box sx={{ mb: 2 }}>
              {customContent}
            </Box>
          )}

          {/* Ações */}
          {allActions.length > 0 && (
            <ActionsContainer
              direction={isXs ? "column" : "row"}
              spacing={isXs ? 1.5 : 2}
              justifyContent="center"
              alignItems="center"
            >
              {allActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'contained'}
                  color={action.color || 'primary'}
                  size={isXs ? 'large' : 'medium'}
                  startIcon={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  fullWidth={isXs && action.primary}
                  sx={{
                    minHeight: isXs ? 44 : 40,
                    borderRadius: isXs ? 3 : 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    ...(action.primary && {
                      boxShadow: isXs ? 2 : 1
                    }),
                    ...action.sx
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </ActionsContainer>
          )}
        </ContentContainer>
      </EmptyStateContainer>
    </Fade>
  );
};

StandardEmptyState.propTypes = {
  type: PropTypes.oneOf([
    'default', 'search', 'error', 'offline', 'tickets', 'campanhas', 
    'contatos', 'usuarios', 'filas', 'etiquetas', 'horarios', 'mensagens'
  ]),
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    color: PropTypes.string,
    sx: PropTypes.object
  }),
  secondaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    color: PropTypes.string,
    sx: PropTypes.object
  }),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.node,
      variant: PropTypes.string,
      color: PropTypes.string,
      disabled: PropTypes.bool,
      primary: PropTypes.bool,
      sx: PropTypes.object
    })
  ),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'outlined', 'minimal']),
  customContent: PropTypes.node,
  sx: PropTypes.object
};

export default StandardEmptyState;