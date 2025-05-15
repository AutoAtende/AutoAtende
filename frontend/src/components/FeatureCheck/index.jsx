import React, { useEffect, useState } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Typography 
} from '@mui/material';
import usePlans from '../../hooks/usePlans';
import { i18n } from "../../translate/i18n";

// Componente para verificar se um recurso específico está disponível
const FeatureCheck = ({ 
  featureName,      // Nome do recurso a ser verificado
  children,         // Componente a ser renderizado se o recurso estiver disponível
  fallback,         // Componente opcional a ser renderizado se o recurso não estiver disponível
  alertTitle,       // Título personalizado para o alerta de recurso não disponível
  alertMessage,     // Mensagem personalizada para o alerta de recurso não disponível
  hideAlert = false // Se true, não mostra o alerta, apenas o fallback (se fornecido)
}) => {
  const { hasFeature } = usePlans();
  const [hasAccess, setHasAccess] = useState(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    const checkFeature = async () => {
      const result = await hasFeature(featureName);
      setHasAccess(result);
    };
    
    checkFeature();
  }, [featureName, hasFeature]);

  // Enquanto verifica o acesso, mostra um indicador de carregamento
  if (hasAccess === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Se tem acesso ao recurso, renderiza o componente filho
  if (hasAccess) {
    return children;
  }

  // Se não tem acesso e tem um componente de fallback, renderiza-o
  if (fallback && hideAlert) {
    return fallback;
  }

  // Mensagens padrão
  const defaultAlertTitle = alertTitle || i18n.t("features.notAvailableTitle");
  const defaultAlertMessage = alertMessage || i18n.t("features.notAvailableMessage", { feature: featureName });

  // Se não tem acesso e não tem fallback ou hideAlert é false, mostra alerta
  return (
    <>
      <Alert 
        severity="warning" 
        sx={{ marginBottom: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => setShowUpgradeDialog(true)}
          >
            {i18n.t("features.upgradeButton")}
          </Button>
        }
      >
        <AlertTitle>{defaultAlertTitle}</AlertTitle>
        {defaultAlertMessage}
      </Alert>
      
      {fallback || null}
      
      <Dialog open={showUpgradeDialog} onClose={() => setShowUpgradeDialog(false)}>
        <DialogTitle>{i18n.t("features.upgradeDialogTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {i18n.t("features.upgradeDialogMessage", { feature: featureName })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpgradeDialog(false)} color="primary">
            {i18n.t("features.upgradeDialogCancel")}
          </Button>
          <Button 
            onClick={() => {
              // Aqui você pode adicionar uma lógica para redirecionar para uma página de upgrade
              // Por exemplo: history.push('/upgrade');
              setShowUpgradeDialog(false);
            }} 
            variant="contained" 
            color="primary"
          >
            {i18n.t("features.upgradeDialogConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeatureCheck;