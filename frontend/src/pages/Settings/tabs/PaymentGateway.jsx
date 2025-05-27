import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Grid,
  FormControl,
  TextField,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert
} from '@mui/material';
import { 
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon
} from '@mui/icons-material';

import useSettings from "../../../hooks/useSettings";
import { toast } from "../../../helpers/toast";
import EfiSettings from "./components/EfiSettings";
import StripeSettings from "./components/StripeSettings";

const PaymentGateway = ({ settings, hideLayout = false }) => {
  const [paymentGateway, setPaymentGateway] = useState("");
  const [loading, setLoading] = useState(false);
  const { update } = useSettings();

  // Carregar configuração inicial
  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const paymentGatewaySetting = settings.find((s) => s.key === "_paymentGateway");
      if (paymentGatewaySetting) {
        setPaymentGateway(paymentGatewaySetting.value || "");
      }
    }
  }, [settings]);

  // Handler para mudança de gateway
  const handleChangePaymentGateway = useCallback(async (value) => {
    setLoading(true);
    try {
      setPaymentGateway(value);
      await update({
        key: "_paymentGateway",
        value,
      });
      toast.success("Gateway de pagamento atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar gateway:", error);
      toast.error("Erro ao atualizar gateway de pagamento");
      setPaymentGateway(paymentGateway); // Reverter em caso de erro
    } finally {
      setLoading(false);
    }
  }, [update, paymentGateway]);

  // Informações dos gateways disponíveis
  const gatewayInfo = {
    efi: {
      name: "Efí (Gerencianet)",
      description: "Gateway brasileiro com PIX, boleto e cartão",
      icon: <BankIcon color="primary" />,
      color: "#00A859"
    },
    stripe: {
      name: "Stripe",
      description: "Gateway internacional com cartão de crédito",
      icon: <CardIcon color="primary" />,
      color: "#635BFF"
    }
  };

  const content = (
    <Box sx={{ 
      height: hideLayout ? 'auto' : '100%',
      overflow: hideLayout ? 'visible' : 'auto',
      p: hideLayout ? 0 : 2,
      ...(hideLayout && {
        '&::-webkit-scrollbar': {
          width: 6
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'divider',
          borderRadius: 3
        }
      })
    }}>
      <Stack spacing={3}>
        {/* Seleção do Gateway */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon color="primary" />
              Selecionar Gateway
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Gateway de Pagamento"
                    value={paymentGateway}
                    onChange={(e) => handleChangePaymentGateway(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    helperText="Escolha o provedor de pagamentos para processar transações"
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 24, height: 24 }} />
                        Nenhum
                      </Box>
                    </MenuItem>
                    
                    {Object.entries(gatewayInfo).map(([key, info]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {info.icon}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {info.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {info.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </Grid>
              
              {paymentGateway && (
                <Grid item xs={12} md={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText',
                      height: 'fit-content'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {gatewayInfo[paymentGateway]?.icon}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {gatewayInfo[paymentGateway]?.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {gatewayInfo[paymentGateway]?.description}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Configurações específicas do gateway */}
        {paymentGateway === "efi" && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Configure suas credenciais do Efí (Gerencianet) abaixo. 
                Você precisará do certificado, Client ID e Client Secret da sua conta.
              </Typography>
            </Alert>
            <EfiSettings settings={settings} />
          </Box>
        )}

        {paymentGateway === "stripe" && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Configure suas credenciais do Stripe abaixo. 
                Você precisará das chaves pública e secreta da sua conta.
              </Typography>
            </Alert>
            <StripeSettings />
          </Box>
        )}

        {!paymentGateway && (
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Nenhum gateway selecionado.</strong><br />
              Selecione um gateway de pagamento para habilitar o processamento de transações no sistema.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Box>
  );

  return content;
};

export default PaymentGateway;