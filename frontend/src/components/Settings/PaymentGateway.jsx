import React, { useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { Box } from "@mui/material";
import useSettings from "../../hooks/useSettings";
import { toast } from "../../helpers/toast";
import makeStyles from '@mui/styles/makeStyles';
import EfiSettings from "../PaymentGateways/Efi/EfiSettings";
import StripeSettings from "../PaymentGateways/Stripe/StripeSettings";

const useStyles = makeStyles((_) => ({
  fieldContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

export default function PaymentGateway(props) {
  const { settings } = props;
  const classes = useStyles();
  const [paymentGateway, setPaymentGateway] = useState("");

  const { update } = useSettings();

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const paymentGatewaySetting = settings.find((s) => s.key === "_paymentGateway");
      if (paymentGatewaySetting) {
        setPaymentGateway(paymentGatewaySetting.value);
      }
    }
  }, [settings]);

  async function handleChangePaymentGateway(value) {
    setPaymentGateway(value);
    await update({
      key: "_paymentGateway",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
  }

  return (
    <>
      <Grid spacing={3} container>
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.fieldContainer}>
            <InputLabel id="paymentgateway-label">Payment Gateway</InputLabel>
            <Select
              labelId="paymentgateway-label"
              value={paymentGateway}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={async (e) => {
                handleChangePaymentGateway(e.target.value);
              }}
            >
              <MenuItem value={""}>Nenhum</MenuItem>
              <MenuItem value={"efi"}>Efí</MenuItem>
              <MenuItem value={"stripe"}>Stripe</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      { paymentGateway === "efi" && 
        <EfiSettings settings={settings} />
      }
      {
        paymentGateway === "stripe" && 
        <StripeSettings settings={settings} />
      }
    </>
  );
}