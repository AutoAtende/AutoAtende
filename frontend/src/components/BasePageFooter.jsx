// src/components/BasePageFooter/index.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, TablePagination, useMediaQuery, useTheme } from '@mui/material';
import BaseButton from './BaseButton';

const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'flex-end',
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const BasePageFooter = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  showPagination = true,
  actions = [],
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <FooterContainer>
      {children}
      
      <ActionsContainer>
        {actions.map((action, index) => (
          <BaseButton
            key={index}
            variant={action.variant || "outlined"}
            color={action.color || "primary"}
            onClick={action.onClick}
            startIcon={action.icon}
            disabled={action.disabled}
            size={isMobile ? "small" : "medium"}
          >
            {action.label}
          </BaseButton>
        ))}
      </ActionsContainer>
      
      {showPagination && (
        <PaginationContainer>
          <TablePagination
            component="div"
            count={count || 0}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage={isMobile ? "" : "Itens por página:"}
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count}`
            }
          />
        </PaginationContainer>
      )}
    </FooterContainer>
  );
};

BasePageFooter.propTypes = {
  count: PropTypes.number,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  showPagination: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      color: PropTypes.string,
      disabled: PropTypes.bool,
      icon: PropTypes.node,
    })
  ),
  children: PropTypes.node,
};

export default BasePageFooter;