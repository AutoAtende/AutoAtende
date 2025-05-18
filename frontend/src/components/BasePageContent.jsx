import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import BaseEmptyState from './BaseEmptyState';

const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  padding: theme.spacing(4),
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
}));

/**
 * Componente base para o conteúdo da página com suporte a diferentes visualizações
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.loading - Se o conteúdo está sendo carregado
 * @param {boolean} props.empty - Se não há conteúdo para exibir
 * @param {Object} props.emptyProps - Propriedades para o estado vazio
 * @param {React.ReactNode} props.children - Conteúdo da página
 * @param {number} props.elevation - Elevação do papel
 * @param {string} props.variant - Variante do papel
 * @param {string} props.view - Modo de visualização ('list', 'grid', 'calendar', 'kanban')
 * @param {Object} props.viewComponents - Componentes para cada tipo de visualização
 * @param {Object} props.viewProps - Propriedades para cada tipo de visualização
 * @returns {React.Component} Componente de conteúdo da página
 */
const BasePageContent = ({
  loading = false,
  empty = false,
  emptyProps = {},
  children,
  elevation = 0,
  variant = "outlined",
  view = "list",
  viewComponents = {},
  viewProps = {},
}) => {
  if (loading) {
    return (
      <ContentWrapper>
        <ContentPaper elevation={elevation} variant={variant}>
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        </ContentPaper>
      </ContentWrapper>
    );
  }
  
  if (empty) {
    return (
      <ContentWrapper>
        <BaseEmptyState {...emptyProps} />
      </ContentWrapper>
    );
  }

  // Se um componente específico para a visualização atual foi fornecido,
  // renderiza-o com suas propriedades específicas
  if (viewComponents[view]) {
    const ViewComponent = viewComponents[view];
    const props = viewProps[view] || {};
    
    return (
      <ContentWrapper>
        <ContentPaper elevation={elevation} variant={variant}>
          <ViewComponent {...props} />
        </ContentPaper>
      </ContentWrapper>
    );
  }
  
  // Caso contrário, renderiza o conteúdo padrão (children)
  return (
    <ContentWrapper>
      <ContentPaper elevation={elevation} variant={variant}>
        {children}
      </ContentPaper>
    </ContentWrapper>
  );
};

BasePageContent.propTypes = {
  loading: PropTypes.bool,
  empty: PropTypes.bool,
  emptyProps: PropTypes.shape({
    icon: PropTypes.node,
    title: PropTypes.string,
    message: PropTypes.string,
    buttonText: PropTypes.string,
    onAction: PropTypes.func,
    showButton: PropTypes.bool,
  }),
  children: PropTypes.node,
  elevation: PropTypes.number,
  variant: PropTypes.string,
  view: PropTypes.oneOf(['list', 'grid', 'calendar', 'kanban']),
  viewComponents: PropTypes.objectOf(PropTypes.elementType),
  viewProps: PropTypes.objectOf(PropTypes.object),
};

export default BasePageContent;