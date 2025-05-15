import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const ContactsDebug = ({ metrics }) => {
  const [processedData, setProcessedData] = useState(null);

  useEffect(() => {
    if (metrics?.contactMetrics?.byState) {
      setProcessedData(metrics.contactMetrics.byState);
      console.log('Métricas de contatos recebidas:', metrics.contactMetrics);
    }
  }, [metrics]);

  if (!metrics) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando métricas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Debug: Dados de Contatos por Estado
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">
          Total de Contatos: {metrics.contactMetrics?.total || 0}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Distribuição por Estado:
        </Typography>
        {processedData && Object.entries(processedData).map(([state, data]) => (
          <Box key={state} sx={{ mb: 1 }}>
            <Typography>
              {state}: {data.count || 0} contatos
            </Typography>
          </Box>
        ))}
      </Box>

      {!processedData && (
        <Typography color="error">
          Nenhum dado de contato por estado encontrado
        </Typography>
      )}
    </Box>
  );
};

export default ContactsDebug;