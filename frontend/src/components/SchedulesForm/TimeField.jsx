import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { 
  TextField, 
  InputAdornment, 
  Tooltip, 
  Box,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { 
  AccessTimeRounded, 
  RestaurantRounded,
  PlayArrowRounded,
  StopRounded
} from "@mui/icons-material";
import { i18n } from "../../translate/i18n";

/**
 * Campo de input para seleção de horário com design otimizado para mobile
 *
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.field - Propriedades do campo do Formik
 * @param {Object} props.meta - Metadados do campo do Formik
 * @param {string} props.label - Texto do label
 * @param {string} props.icon - Tipo de ícone (start|end|lunch)
 * @param {boolean} [props.optional=false] - Se o campo é opcional
 * @returns {React.Component} Campo de tempo formatado
 */
const TimeField = ({ field, meta, label, icon, optional = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [focused, setFocused] = useState(false);

  // Determina o ícone baseado na propriedade icon
  const fieldIcon = useMemo(() => {
    switch(icon) {
      case 'start':
        return <PlayArrowRounded color="primary" />;
      case 'end':
        return <StopRounded color="error" />;
      case 'lunch':
        return <RestaurantRounded color="warning" />;
      default:
        return <AccessTimeRounded color="action" />;
    }
  }, [icon]);

  // Determina a cor do campo baseado no estado
  const getBorderColor = useCallback(() => {
    // Verificação segura para evitar acesso a propriedades de undefined
    const hasSubmitCount = meta?.form?.submitCount !== undefined;
    const submitAttempted = hasSubmitCount ? meta.form.submitCount > 0 : false;
    
    // Erro apenas se houver erro E o campo já tenha sido tocado OU se o usuário tentou submeter o formulário
    if ((meta.touched || submitAttempted) && meta.error) {
      return theme.palette.error.main;
    }
    if (focused) return theme.palette.primary.main;
    return theme.palette.divider;
  }, [focused, meta, theme]);

  // Texto de ajuda para o campo
  const getHelperText = useCallback(() => {
    // Verificação segura para submitCount
    const hasSubmitCount = meta?.form?.submitCount !== undefined;
    const submitAttempted = hasSubmitCount ? meta.form.submitCount > 0 : false;
    
    if ((meta.touched || submitAttempted) && meta.error) {
      return meta.error;
    }
    if (isMobile && optional) {
      return i18n.t("serviceHours.optionalField");
    }
    return " ";
  }, [meta, isMobile, optional]);

  // Handlers para foco e perda de foco
  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback((e) => {
    setFocused(false);
    field.onBlur(e);
  }, [field]);

  // Label responsivo para mobile
  const responsiveLabel = useMemo(() => {
    if (isMobile) {
      return (
        <Tooltip title={label} arrow placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {fieldIcon}
            {optional && <Box component="span" sx={{ ml: 0.5, fontSize: '0.7rem' }}>(Opc)</Box>}
          </Box>
        </Tooltip>
      );
    }
    
    return label + (optional ? ` (${i18n.t("serviceHours.optional")})` : "");
  }, [label, optional, isMobile, fieldIcon]);

  return (
    <TextField
      {...field}
      label={responsiveLabel}
      variant="outlined"
      type="time"
      error={(meta.touched || meta?.form?.submitCount > 0) && Boolean(meta.error)}
      helperText={getHelperText()}
      InputLabelProps={{ 
        shrink: true,
        sx: {
          fontSize: { xs: '0.8rem', md: '0.875rem' }
        }
      }}
      inputProps={{ 
        step: 300,
        'aria-label': label,
        sx: {
          px: { xs: 1, md: 2 },
          py: { xs: 1.5, md: 1.75 },
          fontSize: { xs: '0.9rem', md: '1rem' }
        }
      }}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: getBorderColor(),
            transition: 'border-color 0.2s ease-in-out'
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.light
          }
        },
        '& .MuiFormHelperText-root': {
          margin: 0,
          marginTop: 0.5,
          fontSize: '0.7rem',
          minHeight: '1rem',
          lineHeight: 1.2
        }
      }}
      InputProps={{
        startAdornment: isMobile ? null : (
          <InputAdornment position="start">
            {fieldIcon}
          </InputAdornment>
        ),
        sx: {
          borderRadius: 1.5,
          backgroundColor: theme.palette.background.paper
        }
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

TimeField.propTypes = {
  field: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.oneOf(['start', 'end', 'lunch', 'default']).isRequired,
  optional: PropTypes.bool
};

export default React.memo(TimeField);