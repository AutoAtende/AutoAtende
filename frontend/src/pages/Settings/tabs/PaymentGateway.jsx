import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import {
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Paper,
  Alert
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';

import useSettings from "../../hooks/useSettings";
import { toast } from "../../helpers/toast";
import StandardTabContent from "../../components/Standard/StandardTabContent";
import EfiSettings from "./components/EfiSettings";
import StripeSettings from "./components/StripeSettings";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 12px rgba(0, 0, 0, 0.4)' 
    : '0 2px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 16px rgba(0, 0, 0, 0.5)' 
      : '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 16
  }
}));

const GatewayCard = styled(Box)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: selected 
    ? theme.palette.primary.light + '0A' 
    : theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '05',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    borderRadius: 16
  }
}));

const PaymentGateway = ({ settings }) => {
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
  const handleChangePaymentGateway = async (value) => {
    try {
      setLoading(true);
      setPaymentGateway(value);
      
      await update({
        key: "_paymentGateway",
        value,
      });
      
      toast.success("Gateway de pagamento atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar gateway:", error);
      toast.error("Erro ao atualizar gateway de pagamento.");
      // Reverter em caso de erro
      const previousSetting = settings.find((s) => s.key === "_paymentGateway");
      setPaymentGateway(previousSetting?.value || "");
    } finally {
      setLoading(false);
    }
  };

  // Opções de gateway disponíveis
  const gatewayOptions = [
    {
      value: "",
      label: "Nenhum",
      description: "Desabilitar gateway de pagamento",
      icon: <PaymentIcon />,
      color: "default"
    },
    {
      value: "efi",
      label: "Efí (Gerencianet)",
      description: "Gateway nacional com PIX, boleto e cartão",
      icon: <BankIcon />,
      color: "primary"
    },
    {
      value: "stripe",
      label: "Stripe",
      description: "Gateway internacional com cartão de crédito",
      icon: <CreditCardIcon />,
      color: "secondary"
    }
  ];

  // Estatísticas para o header
  const stats = [
    {
      label: paymentGateway ? `Gateway: ${gatewayOptions.find(g => g.value === paymentGateway)?.label}` : "Nenhum gateway ativo",
      icon: <PaymentIcon />,
      color: paymentGateway ? 'success' : 'default'
    }
  ];

  return (
    <StandardTabContent
      title="Gateway de Pagamento"
      description="Configure o processador de pagamentos para cobranças automáticas"
      icon={<PaymentIcon />}
      stats={stats}
      variant="default"
    >
      <Box sx={{ mb: 4 }}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mb: 3 
          }}>
            <PaymentIcon color="primary" />
            Selecionar Gateway de Pagamento
          </Typography>

          {/* Seleção via Grid de Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {gatewayOptions.map((option) => (
              <Grid item xs={12} sm={6} md={4} key={option.value}>
                <GatewayCard
                  selected={paymentGateway === option.value}
                  onClick={() => !loading && handleChangePaymentGateway(option.value)}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    {React.cloneElement(option.icon, { 
                      color: paymentGateway === option.value ? 'primary' : 'action',
                      sx: { mr: 1 }
                    })}
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={paymentGateway === option.value ? 600 : 500}
                      color={paymentGateway === option.value ? 'primary' : 'text.primary'}
                    >
                      {option.label}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}
                  >
                    {option.description}
                  </Typography>
                </GatewayCard>
              </Grid>
            ))}
          </Grid>

          {/* Seleção via Dropdown (alternativa) */}
          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Ou selecione via dropdown:
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="paymentgateway-label">Gateway de Pagamento</InputLabel>
                  <Select
                    labelId="paymentgateway-label"
                    value={paymentGateway}
                    label="Gateway de Pagamento"
                    onChange={(e) => handleChangePaymentGateway(e.target.value)}
                    disabled={loading}
                  >
                    {gatewayOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box display="flex" alignItems="center">
                          {React.cloneElement(option.icon, { 
                            sx: { mr: 1, fontSize: '1.2rem' } 
                          })}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>
      </Box>

      {/* Alert informativo */}
      {!paymentGateway && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Nenhum gateway selecionado:</strong> As funcionalidades de cobrança automática estarão desabilitadas. 
            Selecione um gateway para ativar pagamentos no sistema.
          </Typography>
        </Alert>
      )}

      {/* Configurações específicas do gateway selecionado */}
      {paymentGateway === "efi" && (
        <StandardTabContent
          title="Configurações do Efí (Gerencianet)"
          description="Configure as credenciais e opções do gateway Efí"
          icon={<BankIcon />}
          variant="paper"
        >
          <EfiSettings settings={settings} />
        </StandardTabContent>
      )}

      {paymentGateway === "stripe" && (
        <StandardTabContent
          title="Configurações do Stripe"
          description="Configure as credenciais e opções do gateway Stripe"
          icon={<CreditCardIcon />}
          variant="paper"
        >
          <StripeSettings settings={settings} />
        </StandardTabContent>
      )}

      {/* Informações adicionais sobre gateways */}
      {paymentGateway && (
        <Box sx={{ mt: 4 }}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Informações do Gateway Selecionado
            </Typography>
            
            {paymentGateway === "efi" && (
              <Box>
                <Typography variant="body2" paragraph>
                  <strong>Efí (Gerencianet)</strong> é um gateway de pagamento brasileiro que oferece:
                </Typography>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><Typography variant="body2">PIX instantâneo</Typography></li>
                  <li><Typography variant="body2">Boleto bancário</Typography></li>
                  <li><Typography variant="body2">Cartão de crédito</Typography></li>
                  <li><Typography variant="body2">Transferência bancária</Typography></li>
                </ul>
              </Box>
            )}

            {paymentGateway === "stripe" && (
              <Box>
                <Typography variant="body2" paragraph>
                  <strong>Stripe</strong> é um gateway de pagamento internacional que oferece:
                </Typography>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><Typography variant="body2">Cartão de crédito internacional</Typography></li>
                  <li><Typography variant="body2">Cartões de débito</Typography></li>
                  <li><Typography variant="body2">Wallets digitais (Apple Pay, Google Pay)</Typography></li>
                  <li><Typography variant="body2">Transferências bancárias (ACH)</Typography></li>
                </ul>
              </Box>
            )}
          </StyledPaper>
        </Box>
      )}
    </StandardTabContent>
  );
};

PaymentGateway.propTypes = {
  settings: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.any
    })
  )
};

PaymentGateway.defaultProps = {
  settings: []
};

export default PaymentGateway;