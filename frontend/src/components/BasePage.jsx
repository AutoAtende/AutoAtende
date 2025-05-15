// src/components/BasePage/index.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import MainContainer from './MainContainer';
import MainHeader from './MainHeader';
import Title from './Title';

const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
  },
}));

const BasePage = ({
  title,
  headerContent,
  children,
  showTitle = true,
  padding = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <MainContainer>
      <PageContainer>
        <MainHeader>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            gap: 2,
            mt: 2,
            mb: 1,
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            {showTitle && (
              <Title>{title}</Title>
            )}
            
            {headerContent}
          </Box>
        </MainHeader>

        <ContentContainer 
          sx={{ 
            p: padding ? (isMobile ? 1 : 2) : 0,
          }}
        >
          {children}
        </ContentContainer>
      </PageContainer>
    </MainContainer>
  );
};

BasePage.propTypes = {
  title: PropTypes.string,
  headerContent: PropTypes.node,
  children: PropTypes.node,
  showTitle: PropTypes.bool,
  padding: PropTypes.bool,
};

export default BasePage;