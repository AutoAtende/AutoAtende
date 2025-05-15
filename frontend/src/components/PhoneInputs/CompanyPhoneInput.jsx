import 'react-international-phone/style.css';
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import PhoneIcon from '@mui/icons-material/Phone';

const CompanyPhoneInput = ({ 
  value, 
  onChange, 
  onBlur,
  error, 
  helperText, 
  label, 
  required,
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
          // Passa o número de telefone com formato internacional (E.164)
          onChange({
            target: {
              name: 'phone',
              value: data.phone
            }
          });
        }
      },
    });

  const handleBlur = (e) => {
    if (onBlur) {
      // Passa o evento de blur com o valor formatado
      onBlur({
        target: {
          name: 'phone',
          value: phone
        }
      });
    }
  };

  return (
    <TextField
      variant="outlined"
      label={label}
      value={inputValue}
      onChange={handlePhoneValueChange}
      onBlur={handleBlur}
      error={Boolean(error)}
      helperText={helperText}
      required={required}
      disabled={disabled}
      fullWidth
      type="tel"
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
  );
};

export default CompanyPhoneInput;