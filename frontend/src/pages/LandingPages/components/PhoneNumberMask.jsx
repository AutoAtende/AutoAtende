import React from 'react';
import PropTypes from 'prop-types';
import { IMaskInput } from 'react-imask';
import { TextField } from '@mui/material';

// Componente para aplicar máscara em inputs de telefone/whatsapp
const PhoneNumberMask = React.forwardRef(function PhoneNumberMask(props, ref) {
  const { onChange, name, ...other } = props;
  
  return (
    <IMaskInput
      {...other}
      mask="+{55} 00 00000-0000"
      definitions={{
        '#': /[1-9]/,
        '0': /[0-9]/
      }}
      inputRef={ref}
      onAccept={(value) => {
        onChange({ target: { name, value } });
      }}
      overwrite
    />
  );
});

PhoneNumberMask.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

// Componente de TextField com máscara para telefone
export const PhoneTextField = ({ label, value, onChange, name, placeholder, required, error, helperText, ...props }) => {
  return (
    <TextField
      fullWidth
      label={label}
      value={value || ''}
      onChange={onChange}
      name={name}
      placeholder={placeholder || '+55 XX XXXXX-XXXX'}
      required={required}
      error={error}
      helperText={helperText}
      InputProps={{
        inputComponent: PhoneNumberMask,
      }}
      {...props}
    />
  );
};

// Exporta tanto o componente de máscara quanto o TextField pronto
export default PhoneNumberMask;