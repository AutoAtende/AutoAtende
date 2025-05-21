import React from 'react';
import { Paper, FormGroup, FormControlLabel, Switch, FormHelperText, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  formHelperText: {
    color: 'gray',
    marginTop: theme.spacing(1),
  }
}));

const UPSixIntegration = ({ 
  enableUPSix, 
  onEnableUPSix,
  enableUPSixWebphone,
  onEnableUPSixWebphone,
  enableUPSixNotifications,
  onEnableUPSixNotifications
}) => {
  const classes = useStyles();

  return (
    <Paper elevation={3} className={classes.paper} variant="outlined">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={enableUPSix === "enabled"}
                  color="primary"
                  onChange={(e) => onEnableUPSix(e.target.checked ? "enabled" : "disabled")}
                />
              }
              label="Habilitar integração com UPSix"
            />
            <FormHelperText className={classes.formHelperText}>
              Ativa ou desativa a integração com o serviço de telefonia UPSix, permitindo recursos de webphone e gravações.
            </FormHelperText>
          </FormGroup>
        </Grid>

        {enableUPSix === "enabled" && (
          <>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableUPSixWebphone === "enabled"}
                      color="primary"
                      onChange={(e) => onEnableUPSixWebphone(e.target.checked ? "enabled" : "disabled")}
                    />
                  }
                  label="Ativar telefonia na tela de atendimento"
                />
                <FormHelperText className={classes.formHelperText}>
                  Habilita o webphone UPSix diretamente na interface de atendimento, permitindo realizar e receber chamadas.
                </FormHelperText>
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableUPSixNotifications === "enabled"}
                      color="primary"
                      onChange={(e) => onEnableUPSixNotifications(e.target.checked ? "enabled" : "disabled")}
                    />
                  }
                  label="Ativar notificações de gravações para admin/supervisor"
                />
                <FormHelperText className={classes.formHelperText}>
                  Envia notificações automáticas para administradores e supervisores quando novas gravações são realizadas.
                </FormHelperText>
              </FormGroup>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};

export default UPSixIntegration;