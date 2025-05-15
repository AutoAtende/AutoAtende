// src/pages/EmailDashboard/components/LoadingSkeleton.jsx
import React from 'react';
import { 
  Box, 
  Skeleton, 
  Card,
  CardContent,
  Grid,
  Paper,
  Divider
} from '@mui/material';

/**
 * Componente para exibir um esqueleto de carregamento
 * @param {string} type - Tipo de esqueleto a ser exibido ('form', 'list', 'chart', 'detail')
 * @param {number} count - Número de itens a serem exibidos (para listas)
 * @param {boolean} isMobile - Indicador se está em modo mobile
 */
const LoadingSkeleton = ({ type = 'form', count = 3, isMobile = false }) => {
  
  // Renderiza um esqueleto de formulário
  const renderFormSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="30%" height={20} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="20%" height={20} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="25%" height={20} />
      </Box>
      
      <Skeleton variant="rectangular" width="100%" height={50} />
    </Box>
  );
  
  // Renderiza um esqueleto de lista
  const renderListSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={56} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        {Array.from(new Array(count)).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            {isMobile ? (
              <Card variant="outlined" sx={{ mb: 1 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="30%" height={20} />
                </CardContent>
              </Card>
            ) : (
              <Skeleton variant="rectangular" width="100%" height={50} />
            )}
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Skeleton variant="rectangular" width={200} height={36} />
      </Box>
    </Box>
  );
  
  // Renderiza um esqueleto de gráfico
  const renderChartSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.from(new Array(4)).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width="30%" height={30} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={250} />
      </Paper>
    </Box>
  );
  
  // Renderiza um esqueleto de detalhes
  const renderDetailSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={50} />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={30} sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={120} height={32} />
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={24} />
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Box>
            <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={120} />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Skeleton variant="rectangular" width={120} height={40} />
      </Box>
    </Box>
  );
  
  // Renderiza o esqueleto correto com base no tipo
  switch (type) {
    case 'form':
      return renderFormSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'chart':
      return renderChartSkeleton();
    case 'detail':
      return renderDetailSkeleton();
    default:
      return renderFormSkeleton();
  }
};

export default LoadingSkeleton;