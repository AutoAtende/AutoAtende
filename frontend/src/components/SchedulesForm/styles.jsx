/**
 * Estilos compartilhados para componentes do SchedulesForm
 * Utiliza a abordagem sx prop do MUI 5
 */

/**
 * Estilos para o componente Card
 * @param {Object} theme - Tema do MUI
 * @param {boolean} hasErrors - Se há erros no card
 * @returns {Object} Estilos para o componente Card
 */
export const cardStyles = (theme, hasErrors = false) => ({
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 2,
    position: "relative",
    overflow: "hidden",
    border: hasErrors ? `1px solid ${theme.palette.error.main}` : "none",
    transition: "all 0.2s ease-in-out",
    '&:active': {
      transform: 'scale(0.99)',
    }
  });
  
  /**
   * Estilos para o header do card
   * @returns {Object} Estilos para o header do card
   */
  export const cardHeaderStyles = {
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    mb: 2
  };
  
  /**
   * Estilos para o título do dia da semana
   * @param {Object} theme - Tema do MUI
   * @returns {Object} Estilos para o título do dia da semana
   */
  export const dayTitleStyles = (theme) => ({
    display: "flex", 
    alignItems: "center",
    '& .MuiSvgIcon-root': {
      mr: 1,
      color: theme.palette.primary.main,
      fontSize: { xs: '1.5rem', md: '1.75rem' }
    },
    '& .MuiTypography-root': {
      fontWeight: 600,
      fontSize: { xs: '1.1rem', md: '1.3rem' }
    }
  });
  
  /**
   * Estilos para o botão de expansão
   * @param {Object} theme - Tema do MUI
   * @returns {Object} Estilos para o botão de expansão
   */
  export const expandButtonStyles = (theme) => ({
    '&:active': {
      backgroundColor: theme.palette.action.selected,
    }
  });
  
  /**
   * Estilos para o campo de horário
   * @param {Object} theme - Tema do MUI
   * @param {boolean} isFocused - Se o campo está focado
   * @param {boolean} hasError - Se o campo tem erro
   * @returns {Object} Estilos para o campo de horário
   */
  export const timeFieldStyles = (theme, isFocused, hasError) => ({
    width: '100%',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: hasError 
          ? theme.palette.error.main 
          : isFocused 
            ? theme.palette.primary.main 
            : theme.palette.divider,
        transition: 'border-color 0.2s ease-in-out'
      },
      '&:hover fieldset': {
        borderColor: hasError 
          ? theme.palette.error.main 
          : theme.palette.primary.light
      },
      '&.Mui-focused fieldset': {
        borderColor: hasError 
          ? theme.palette.error.main 
          : theme.palette.primary.main,
        borderWidth: 2
      }
    },
    '& .MuiFormHelperText-root': {
      margin: 0,
      marginTop: 0.5,
      fontSize: '0.7rem',
      minHeight: '1rem',
      lineHeight: 1.2
    },
    '& .MuiInputBase-root': {
      borderRadius: 1.5,
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper
      }
    },
    '& .MuiInputBase-input': {
      px: { xs: 1, md: 2 },
      py: { xs: 1.5, md: 1.75 },
      fontSize: { xs: '0.9rem', md: '1rem' }
    },
    '& .MuiInputLabel-root': {
      fontSize: { xs: '0.8rem', md: '0.875rem' }
    }
  });
  
  /**
   * Estilos para o botão de salvar
   * @returns {Object} Estilos para o botão de salvar
   */
  export const saveButtonStyles = {
    px: { xs: 4, md: 6 },
    py: { xs: 1.5, md: 2 },
    minWidth: { xs: '60%', sm: '40%', md: '30%' },
    borderRadius: 2,
    fontSize: { xs: '0.9rem', md: '1rem' },
    boxShadow: 3,
    '&:hover': {
      boxShadow: 5,
    },
    '&:active': {
      transform: 'scale(0.98)',
    }
  };
  
  /**
   * Estilos para o container de mensagens de erro
   * @returns {Object} Estilos para o container de mensagens de erro
   */
  export const errorContainerStyles = {
    mt: 2, 
    p: 1.5, 
    bgcolor: 'error.light', 
    borderRadius: 1,
    color: 'error.contrastText'
  };