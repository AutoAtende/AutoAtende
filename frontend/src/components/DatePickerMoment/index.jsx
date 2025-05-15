import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import TextField from "@mui/material/TextField";

export const DatePickerMoment = ({ 
  label, 
  value, 
  onChange, 
  width = '20ch' 
}) => {
  const handleDateChange = (date) => {
    onChange(moment(date).format('YYYY-MM-DD'));
  };

  return (
    <DatePicker
      id="datePicker-input"
      label={label}
      value={value ? moment(value, 'YYYY-MM-DD') : null}
      format="DD/MM/YYYY"
      onChange={handleDateChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={label}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ width }}
        />
      )}
    />
  );
};

export default DatePickerMoment;