import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, TextField, InputAdornment, useMediaQuery, useTheme } from '@mui/material';
import { GridView, ViewList, Search as SearchIcon } from '@mui/icons-material';
import BaseButton from './BaseButton';

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 200,
  maxWidth: 400,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    width: '100%',
  },
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'flex-end',
  },
}));

const BasePageHeader = ({
  onSearch,
  searchValue,
  searchPlaceholder = "Pesquisar...",
  showSearch = true,
  actions = [],
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <HeaderContainer>
      {showSearch && (
        <SearchContainer>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </SearchContainer>
      )}
      
      {children}
      
      <ActionsContainer>
        {actions.map((action, index) => (
          <BaseButton
            key={index}
            variant={action.variant || "contained"}
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
    </HeaderContainer>
  );
};

BasePageHeader.propTypes = {
  onSearch: PropTypes.func,
  searchValue: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  showSearch: PropTypes.bool,
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

export default BasePageHeader;