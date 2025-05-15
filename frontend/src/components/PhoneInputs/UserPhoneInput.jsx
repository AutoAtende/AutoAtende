// src/components/PhoneInputs/UserPhoneInput.jsx
import 'react-international-phone/style.css';
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormHelperText,
} from '@mui/material';
import React from 'react';
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
  ...restProps 
}) => {
  const { inputValue, handlePhoneValueChange, phone, isValid, country, setCountry } =
  usePhoneInput({
    defaultCountry: 'br',
    value,
    countries: defaultCountries,
    onChange: (data) => {
      if (onChange) {
        // Verificar se o campo está vazio - nesse caso, não validar
        if (!data.phone || data.phone.trim() === '') {
          onChange(data.phone, true); // Campo vazio é sempre considerado válido
        } else {
          onChange(data.phone, data.isValid);
        }
      }
    },
  });

  // Determinar se deve mostrar erro - apenas se houver um valor e for inválido
  const showError = Boolean(error) && phone && phone.trim() !== '' && !isValid;

  return (
    <>
      <TextField
        variant="outlined"
        label={label}
        value={inputValue}
        onChange={handlePhoneValueChange}
        error={showError} // Usar a lógica ajustada de exibição de erro
        fullWidth
        disabled={disabled}
        type="tel"
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
      {helperText && <FormHelperText error={showError}>{helperText}</FormHelperText>}
    </>
  );
};

export default UserPhoneInput;