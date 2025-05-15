// src/components/BasePageContent/index.jsx
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

const BasePageContent = ({
  loading = false,
  empty = false,
  emptyProps = {},
  children,
  elevation = 0,
  variant = "outlined",
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
};

export default BasePageContent;