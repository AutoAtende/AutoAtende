import React from 'react';
import { useField } from 'formik';
import { TextField } from '@mui/material';

export default function DatePickerField(props) {
  const [field, meta, helper] = useField(props);
  const { touched, error } = meta;
  const { setValue } = helper;
  const isError = touched && error && true;
  const { value } = field;
  const { label, variant = "outlined", margin = "dense", fullWidth = true, type = "date", ...otherProps } = props;

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      if (type === 'datetime-local') {
        return date.toISOString().slice(0, 16);
      } else if (type === 'time') {
        return date.toTimeString().slice(0, 5);
      } else {
        return date.toISOString().slice(0, 10);
      }
    } catch {
      return '';
    }
  };

  const handleChange = (event) => {
    const inputValue = event.target.value;
    if (!inputValue) {
      setValue(null);
      return;
    }

    try {
      let dateValue;
      if (type === 'time') {
        // Para time, criar data com a hora de hoje
        const today = new Date();
        const [hours, minutes] = inputValue.split(':');
        dateValue = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      } else {
        dateValue = new Date(inputValue);
      }
      
      if (!isNaN(dateValue.getTime())) {
        setValue(dateValue.toISOString());
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };

  return (
    <TextField
      {...otherProps}
      name={field.name}
      label={label}
      type={type}
      variant={variant}
      margin={margin}
      fullWidth={fullWidth}
      value={formatDateForInput(value)}
      onChange={handleChange}
      error={isError}
      helperText={isError && error}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
}
