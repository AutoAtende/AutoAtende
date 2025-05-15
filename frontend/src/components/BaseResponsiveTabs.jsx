// src/components/BaseResponsiveTabs/index.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import BaseMobileBottomNav from './BaseMobileBottomNav';

const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const TabPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
}));

const BaseResponsiveTabs = ({
  tabs = [],
  value,
  onChange,
  showTabsOnMobile = false,
  fabIcon,
  onFabClick,
  showFab = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <>
      {(!isMobile || showTabsOnMobile) && (
        <TabsContainer>
          <Tabs
            value={value}
            onChange={onChange}
            aria-label="page tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                disabled={tab.disabled}
              />
            ))}
          </Tabs>
        </TabsContainer>
      )}
      
      {tabs.map((tab, index) => (
        <TabPanel
          key={index}
          role="tabpanel"
          hidden={value !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
        >
          {value === index && tab.content}
        </TabPanel>
      ))}
      
      {isMobile && !showTabsOnMobile && (
        <BaseMobileBottomNav
          value={value}
          onChange={(event, newValue) => onChange(event, newValue)}
          items={tabs.map(tab => ({
            label: tab.label,
            icon: tab.icon,
            disabled: tab.disabled,
          }))}
          fabIcon={fabIcon}
          onFabClick={onFabClick}
          showFab={showFab}
        />
      )}
    </>
  );
};

BaseResponsiveTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      content: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  showTabsOnMobile: PropTypes.bool,
  fabIcon: PropTypes.node,
  onFabClick: PropTypes.func,
  showFab: PropTypes.bool,
};

export default BaseResponsiveTabs;