import React from 'react';
import { 
  TextField, 
  IconButton, 
  Grid, 
  InputAdornment,
  Tooltip 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { i18n } from '../../translate/i18n';

const EmployerCustomField = ({ field, index, handleChangeField, handleRemoveField }) => {
  return (
    <Grid container spacing={2} alignItems="center" mb={1}>
      <Grid item xs={5}>
        <TextField
          size="small"
          name="name"
          label={i18n.t("employerModal.form.customField.name")}
          value={field.name}
          onChange={(e) => handleChangeField(index, "name", e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          size="small"
          name="value"
          label={i18n.t("employerModal.form.customField.value")}
          value={field.value}
          onChange={(e) => handleChangeField(index, "value", e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Grid>
      <Grid item xs={1}>
        <Tooltip title={i18n.t("employerModal.buttons.removeField")}>
          <IconButton 
            color="secondary" 
            onClick={() => handleRemoveField(index)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export default EmployerCustomField;