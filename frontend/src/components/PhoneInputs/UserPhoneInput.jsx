import 'react-international-phone/style.css';
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormHelperText,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import { Phone } from '@mui/icons-material';

// Este componente personalizado é usado no modal de usuário
const UserPhoneInput = ({ 
  value, 
  onChange, 
  label, 
  error, 
  helperText, 
  disabled,
  onBlur,
  ...restProps 
}) => {
  // Estado para controlar se o usuário já interagiu com o campo
  const [interacted, setInteracted] = useState(false);

  // Resetar o estado de interação quando o valor é redefinido (modal reaberto)
  useEffect(() => {
    if (!value || value === '') {
      setInteracted(false);
    }
  }, [value]);

  const { inputValue, handlePhoneValueChange, phone, isValid, country, setCountry } =
  usePhoneInput({
    defaultCountry: 'br',
    value,
    countries: defaultCountries,
    onChange: (data) => {
      if (onChange) {
        // Se o usuário está digitando, considerar que interagiu com o campo
        if (!interacted && data.phone !== '+55') {
          setInteracted(true);
        }
        
        // Verificar se o campo está vazio - nesse caso, não validar
        if (!data.phone || data.phone.trim() === '' || data.phone === '+55') {
          onChange(data.phone, true); // Campo vazio ou só com código do país é considerado válido
        } else {
          onChange(data.phone, data.isValid);
        }
      }
    },
  });

  // Função de tratamento de blur personalizada
  const handleBlur = (e) => {
    // Marcar o campo como interagido apenas se tiver conteúdo além do código do país
    if (phone && phone !== '+55') {
      setInteracted(true);
    }
    
    // Chamar o onBlur original, se fornecido
    if (onBlur) {
      onBlur(e);
    }
  };

  // Determinar se deve mostrar erro:
  // 1. Apenas se houver um erro explícito OU
  // 2. Se o usuário já interagiu com o campo, tem conteúdo além do código do país, e é inválido
  const showError = Boolean(error) || (interacted && phone && phone !== '+55' && !isValid);
  
  // Mensagem de erro a ser exibida
  const displayHelperText = showError && !error ? 'Número de telefone inválido' : helperText;

  return (
    <>
      <TextField
        variant="outlined"
        label={label}
        value={inputValue}
        onChange={handlePhoneValueChange}
        error={showError}
        fullWidth
        disabled={disabled}
        type="tel"
        onBlur={handleBlur}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" style={{ marginRight: '2px' }}>
              <Phone color={showError ? "error" : "primary"} sx={{ mr: 1 }} />
              <Select
                MenuProps={{
                  style: {
                    height: '300px',
                    width: '360px',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                }}
                sx={{
                  width: 'max-content',
                  fieldset: { display: 'none' },
                  '&.Mui-focused:has(div[aria-expanded="false"])': {
                    fieldset: { display: 'block' },
                  },
                  '.MuiSelect-select': {
                    padding: '4px',
                    paddingRight: '24px !important',
                  },
                  svg: {
                    right: 0,
                  },
                }}
                value={country.iso2}
                onChange={(e) => setCountry(e.target.value)}
                renderValue={(value) => (
                  <FlagImage iso2={value} style={{ display: 'flex' }} />
                )}
                disabled={disabled}
              >
                {defaultCountries.map((c) => {
                  const country = parseCountry(c);
                  return (
                    <MenuItem key={country.iso2} value={country.iso2}>
                      <FlagImage iso2={country.iso2} style={{ marginRight: '8px' }} />
                      <Typography marginRight="8px">{country.name}</Typography>
                      <Typography color="gray">+{country.dialCode}</Typography>
                    </MenuItem>
                  );
                })}
              </Select>
            </InputAdornment>
          ),
        }}
        {...restProps}
      />
      {displayHelperText && <FormHelperText error={showError}>{displayHelperText}</FormHelperText>}
    </>
  );
};

export default UserPhoneInput;