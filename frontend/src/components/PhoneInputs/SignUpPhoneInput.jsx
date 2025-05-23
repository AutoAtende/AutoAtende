import 'react-international-phone/style.css';
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import React, { useImperativeHandle, useRef } from 'react';
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import PhoneIcon from '@mui/icons-material/Phone';

// Este componente personalizado é usado na página de cadastro
const SignUpPhoneInput = React.forwardRef((props, ref) => {
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
          // Vamos forçar isValid como true para números brasileiros que tenham pelo menos 10 dígitos
          const cleanPhone = data.phone.replace(/\D/g, '');
          const isValid = cleanPhone.length >= 10;
          onChange(data.phone, isValid);
        }
      },
    });

  // Expondo métodos para o componente pai através da ref
  useImperativeHandle(ref, () => ({
    getNumber: () => phone,
    isValidNumber: () => {
      // Implementação simples para validar números brasileiros
      const cleanPhone = phone.replace(/\D/g, '');
      return cleanPhone.length >= 10;
    },
    inputRef: inputRef.current
  }));

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        variant="outlined"
        label={label}
        value={inputValue}
        onChange={handlePhoneValueChange}
        error={Boolean(error)}
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
    </Box>
  );
});

export default SignUpPhoneInput;