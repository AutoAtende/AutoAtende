import React from 'react';
import 'react-international-phone/style.css';
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormHelperText,
  Box,
} from '@mui/material';
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';

export const LandingPagePhoneInput = ({ 
  value, 
  onChange, 
  label,
  name,
  placeholder,
  required,
  error,
  helperText,
  margin,
  InputProps,
  sx,
  ...restProps 
}) => {
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: 'br', // Brasil como padrão
      value,
      countries: defaultCountries,
      onChange: (data) => {
        // Criar evento sintético para manter compatibilidade com o handler existente
        const syntheticEvent = {
          target: {
            name: name,
            value: data.phone,
            type: 'tel'
          }
        };
        onChange(syntheticEvent);
      },
    });

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <TextField
        variant="outlined"
        label={label}
        placeholder={placeholder || "Número de telefone"}
        value={inputValue}
        onChange={handlePhoneValueChange}
        type="tel"
        name={name}
        inputRef={inputRef}
        required={required}
        error={error}
        margin={margin}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment
              position="start"
              style={{ marginRight: '2px', marginLeft: '-8px' }}
            >
              <Select
                MenuProps={{
                  style: {
                    height: '300px',
                    width: '360px',
                    top: '10px',
                    left: '-34px',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                }}
                sx={{
                  width: 'max-content',
                  // Remove default outline (display only on focus)
                  fieldset: {
                    display: 'none',
                  },
                  '&.Mui-focused:has(div[aria-expanded="false"])': {
                    fieldset: {
                      display: 'block',
                    },
                  },
                  // Update default spacing
                  '.MuiSelect-select': {
                    padding: '8px',
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
                      <FlagImage
                        iso2={country.iso2}
                        style={{ marginRight: '8px' }}
                      />
                      <Typography marginRight="8px">{country.name}</Typography>
                      <Typography color="gray">+{country.dialCode}</Typography>
                    </MenuItem>
                  );
                })}
              </Select>
            </InputAdornment>
          ),
          // Mesclar com InputProps customizados (como ícones de validação)
          ...(InputProps?.endAdornment && {
            endAdornment: InputProps.endAdornment
          }),
        }}
        {...restProps}
      />
      {helperText && (
        <FormHelperText error={error}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};