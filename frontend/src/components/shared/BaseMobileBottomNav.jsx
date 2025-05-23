import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Paper, BottomNavigation, BottomNavigationAction, Fab, Zoom } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const BottomNavPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
  borderRadius: 0,
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 70,
  right: 16,
  zIndex: 1101,
}));

const BaseMobileBottomNav = ({
  value,
  onChange,
  items = [],
  fabIcon = <AddIcon />,
  onFabClick,
  showFab = true,
}) => {
  return (
    <>
      {showFab && (
        <Zoom in={showFab}>
          <FloatingActionButton
            color="primary"
            aria-label="add"
            onClick={onFabClick}
          >
            {fabIcon}
          </FloatingActionButton>
        </Zoom>
      )}
      
      <BottomNavPaper elevation={3}>
        <BottomNavigation
          value={value}
          onChange={onChange}
          showLabels
        >
          {items.map((item, index) => (
            <BottomNavigationAction
              key={index}
              label={item.label}
              icon={item.icon}
              disabled={item.disabled}
            />
          ))}
        </BottomNavigation>
      </BottomNavPaper>
    </>
  );
};

BaseMobileBottomNav.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  fabIcon: PropTypes.node,
  onFabClick: PropTypes.func,
  showFab: PropTypes.bool,
};

export default BaseMobileBottomNav;