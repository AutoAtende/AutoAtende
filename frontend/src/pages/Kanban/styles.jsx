import { styled } from '@mui/material/styles';
import { Paper, Box, Card, IconButton } from '@mui/material';

// Container principal do Kanban
export const KanbanContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary
}));

// Containers de Filtro
export const FilterContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary
}));

export const FilterFields = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  flexWrap: 'wrap',
  width: '100%',
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    
    '& > *': {
      width: '100%'
    }
  }
}));

export const FilterButtons = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginLeft: 'auto',
  
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1)
  }
}));

export const IconButtonWrapper = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  padding: theme.spacing(1),
  borderRadius: '50%',
  transition: 'all 0.2s',
  backgroundColor: active ? theme.palette.action.selected : 'transparent',
  
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75),
  }
}));

// Container para o campo de pesquisa
export const SearchInputWrapper = styled(Box)(({ theme }) => ({
  flex: '1 1 auto',
  minWidth: '250px',
  
  [theme.breakpoints.down('sm')]: {
    width: '100%'
  }
}));

export const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  outline: 'none',
  maxWidth: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  color: theme.palette.text.primary,
  
  [theme.breakpoints.down('sm')]: {
    width: '95%',
    padding: theme.spacing(2)
  }
}));

// Estilos do Board (react-trello)
export const BoardStyles = {
  Container: styled('div')(({ theme }) => ({
    '& .smooth-dnd-container': {
      minHeight: '75vh',
      maxHeight: '75vh',
    },
    
    '& .react-trello-lane': {
      width: '350px',
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
      
      [theme.breakpoints.down('sm')]: {
        width: '280px'
      }
    },
    
    '& .react-trello-lane-title': {
      fontSize: '11px !important',
      fontWeight: 'bold !important',
      color: `${theme.palette.text.primary} !important`,
    },
    
    '& .react-trello-card': {
      width: '100% !important',
      maxWidth: '100% !important',
      minWidth: '100% !important',
      backgroundColor: `${theme.palette.background.paper} !important`,
      color: `${theme.palette.text.primary} !important`,
      boxShadow: `${theme.shadows[2]} !important`,
      borderRadius: `${theme.shape.borderRadius}px !important`,
    },
    
    '& .react-trello-board': {
      minHeight: '90vh',
      maxHeight: '90vh',
      backgroundColor: `${theme.palette.background.default} !important`,
      
      '& header': {
        backgroundColor: 'transparent !important',
      },
      
      [theme.breakpoints.down('sm')]: {
        minHeight: '85vh',
        maxHeight: '85vh'
      }
    },
    
    '& .smooth-dnd-container.vertical': {
      overflow: 'auto',
      scrollbarWidth: 'thin',
      width: '330px',
      scrollbarColor: theme.palette.mode === 'dark' ? 
        `${theme.palette.primary.main} ${theme.palette.background.paper}` : 
        `rgb(146, 146, 146) ${theme.palette.background.paper}`,
      backgroundColor: theme.palette.background.default,
      
      [theme.breakpoints.down('sm')]: {
        width: '260px'
      },
      
      '&::-webkit-scrollbar': {
        width: '6px'
      },
      
      '&::-webkit-scrollbar-track': {
        backgroundColor: theme.palette.mode === 'dark' ? 
          theme.palette.background.paper : 
          '#f1f1f1'
      },
      
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? 
          theme.palette.primary.main : 
          '#888'
      }
    },
    
    '& section > header > span': {
      color: '#fff !important',
      width: '100% !important',
      padding: '10px',
      textAlign: 'center',
      fontWeight: '400 !important',
      fontSize: '25px !important',
      borderRadius: '10px',
      
      [theme.breakpoints.down('sm')]: {
        fontSize: '20px !important',
        padding: '8px'
      }
    },
    
    // Cards
    '& .react-trello-card > header': {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: '8px',
      color: `${theme.palette.text.primary} !important`,
    },
    
    '& .react-trello-card > div': {
      color: `${theme.palette.text.primary} !important`,
      padding: '10px',
    }
  }))
};

// Estilos dos Cards
export const KanbanCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  
  '& .card-header': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    
    '& .avatar': {
      width: 40,
      height: 40,
      borderRadius: '50%',
      marginRight: theme.spacing(1)
    }
  },
  
  '& .card-content': {
    padding: theme.spacing(1),
    
    '& .contact-info': {
      marginBottom: theme.spacing(1)
    },
    
    '& .message': {
      marginBottom: theme.spacing(1)
    },
    
    '& .tags': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing(0.5)
    }
  },
  
  '& .card-actions': {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.divider}`,
  }
}));

// Estilos para o Empty State
export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 'calc(100vh - 200px)',
  gap: theme.spacing(2),
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.default,
  
  '& .MuiSvgIcon-root': {
    fontSize: 48,
    color: theme.palette.action.disabled
  }
}));

// Estilos para componentes específicos do InfoModal
export const InfoModalContainer = styled(Box)(({ theme }) => ({
  '& .info-section': {
    marginBottom: theme.spacing(2),
    
    '& strong': {
      color: theme.palette.primary.main
    }
  },
  
  '& .close-button': {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1)
  }
}));

// Helpers e utilitários de estilo
export const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: '1px'
};