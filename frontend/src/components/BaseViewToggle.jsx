import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { 
  ViewList as ListIcon, 
  GridView as GridIcon, 
  CalendarMonth as CalendarIcon, 
  ViewKanban as KanbanIcon 
} from '@mui/icons-material';

const ViewToggleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 4,
  '& .MuiToggleButtonGroup-grouped': {
    border: 0,
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: theme.spacing(0.75),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

/**
 * Componente para alternar entre diferentes modos de visualização
 * @param {Object} props - Propriedades do componente
 * @param {string} props.view - Modo de visualização atual ('list', 'grid', 'calendar', 'kanban')
 * @param {function} props.onViewChange - Função chamada quando o modo de visualização é alterado
 * @param {Array} props.availableViews - Lista de modos de visualização disponíveis
 * @param {boolean} props.disabled - Se o componente deve estar desabilitado
 * @returns {React.Component} Componente de alternância de visualização
 */
const BaseViewToggle = ({
  view,
  onViewChange,
  availableViews = ['list', 'grid', 'calendar', 'kanban'],
  disabled = false,
}) => {
  // Mapeia os tipos de visualização para seus respectivos ícones e tooltips
  const viewConfig = {
    list: { icon: <ListIcon fontSize="small" />, tooltip: 'Visualização em Lista' },
    grid: { icon: <GridIcon fontSize="small" />, tooltip: 'Visualização em Grade' },
    calendar: { icon: <CalendarIcon fontSize="small" />, tooltip: 'Visualização em Calendário' },
    kanban: { icon: <KanbanIcon fontSize="small" />, tooltip: 'Visualização Kanban' },
  };

  const handleViewChange = (event, newView) => {
    // Previne a deseleção (quando o usuário clica no botão já selecionado)
    if (newView !== null) {
      onViewChange(newView);
    }
  };

  return (
    <ViewToggleContainer>
      <StyledToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        aria-label="modo de visualização"
        size="small"
        disabled={disabled}
      >
        {availableViews.map((viewType) => {
          const config = viewConfig[viewType];
          return (
            <Tooltip key={viewType} title={config.tooltip}>
              <StyledToggleButton value={viewType} aria-label={config.tooltip}>
                {config.icon}
              </StyledToggleButton>
            </Tooltip>
          );
        })}
      </StyledToggleButtonGroup>
    </ViewToggleContainer>
  );
};

BaseViewToggle.propTypes = {
  view: PropTypes.oneOf(['list', 'grid', 'calendar', 'kanban']).isRequired,
  onViewChange: PropTypes.func.isRequired,
  availableViews: PropTypes.arrayOf(PropTypes.oneOf(['list', 'grid', 'calendar', 'kanban'])),
  disabled: PropTypes.bool,
};

export default BaseViewToggle;