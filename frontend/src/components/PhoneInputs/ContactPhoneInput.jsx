// ContactPhoneInput.jsx - Versão corrigida
import 'react-international-phone/style.css';
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useImperativeHandle, useRef } from 'react';
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import PhoneIcon from '@mui/icons-material/Phone';

// Este componente personalizado é usado no modal de contatos
const ContactPhoneInput = React.forwardRef((props, ref) => {
  const {
    value,
    onChange,
    error,
    helperText,
    label,
    required,
    ...restProps
  } = props;

  const inputRef = useRef(null);

  const { inputValue, handlePhoneValueChange, phone, country, setCountry } =
    usePhoneInput({
      defaultCountry: 'br',
      value,
      countries: defaultCountries,
      onChange: (data) => {
        if (onChange) {
          onChange(data.phone, true); // Simplificando a validação
        }
      },
    });

  // Expondo métodos para o componente pai através da ref
  useImperativeHandle(ref, () => ({
    // Método chave: retorna o número SEM o sinal de +
    getNumber: () => {
      // Remove o + e retorna apenas os dígitos
      return phone ? phone.replace(/\D/g, '') : '';
    },
    // Validação simples: número não deve estar vazio
    isValidNumber: () => {
      const digitsOnly = phone ? phone.replace(/\D/g, '') : '';
      return digitsOnly.length >= 8; // Número válido deve ter pelo menos 8 dígitos
    },
    inputRef: inputRef.current,
    debug: () => {
      console.log('ContactPhoneInput Debug:');
      console.log('- phone original:', phone);
      console.log('- phone para API:', phone ? phone.replace(/\D/g, '') : '');
      console.log('- isValid:', phone ? phone.replace(/\D/g, '').length >= 8 : false);
      console.log('- country:', country);
      return true;
    }
  }));

  return (
    <TextField
      variant="outlined"
      label={label}
      value={inputValue}
      onChange={handlePhoneValueChange}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth
      type="tel"
      inputRef={inputRef}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" style={{ marginRight: '2px' }}>
            <PhoneIcon color={error ? "error" : "primary"} sx={{ mr: 1 }} />
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
  );
});

export default ContactPhoneInput;