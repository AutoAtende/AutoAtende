import React from "react";
import Skeleton from '@mui/material/Skeleton';
import Paper from "@mui/material/Paper";
import { Box } from "@mui/material";

const ContactDrawerSkeleton = ({ classes }) => {
  return (
    <div className={classes.content}>
      {/* Cabeçalho do contato */}
      <Paper 
        elevation={0}
        square 
        variant="outlined" 
        sx={{
          borderRadius: 2,
          position: 'relative',
          overflow: 'visible',
          mb: 2,
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Skeleton
            animation="wave"
            variant="circular"
            width={80}
            height={80}
            sx={{ mb: 2 }}
          />
          
          <Skeleton animation="wave" height={28} width={180} sx={{ mb: 1 }} />
          <Skeleton animation="wave" height={20} width={120} />
          <Skeleton animation="wave" height={20} width={150} />
        </Box>
      </Paper>
      
      {/* Abas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Skeleton animation="wave" height={48} width="100%" />
      </Box>
      
      {/* Conteúdo */}
      <Paper 
        square 
        elevation={0}
        variant="outlined" 
        sx={{ borderRadius: 2, p: 2, mb: 2 }}
      >
        <Skeleton animation="wave" height={24} width={150} sx={{ mb: 2 }} />
        <Skeleton animation="wave" height={60} width="100%" sx={{ mb: 1 }} />
        <Skeleton animation="wave" height={60} width="100%" sx={{ mb: 1 }} />
        <Skeleton animation="wave" height={60} width="100%" />
      </Paper>
      
      {/* Seção adicional */}
      <Paper 
        square 
        elevation={0}
        variant="outlined" 
        sx={{ borderRadius: 2, p: 2 }}
      >
        <Skeleton animation="wave" height={24} width={150} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton 
            animation="wave" 
            variant="circular"
            width={24} 
            height={24} 
            sx={{ mr: 1 }} 
          />
          <Box sx={{ width: '100%' }}>
            <Skeleton animation="wave" height={20} width="40%" sx={{ mb: 0.5 }} />
            <Skeleton animation="wave" height={16} width="100%" />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton 
            animation="wave" 
            variant="circular"
            width={24} 
            height={24} 
            sx={{ mr: 1 }} 
          />
          <Box sx={{ width: '100%' }}>
            <Skeleton animation="wave" height={20} width="60%" sx={{ mb: 0.5 }} />
            <Skeleton animation="wave" height={16} width="100%" />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Skeleton 
            animation="wave" 
            variant="circular"
            width={24} 
            height={24} 
            sx={{ mr: 1 }} 
          />
          <Box sx={{ width: '100%' }}>
            <Skeleton animation="wave" height={20} width="50%" sx={{ mb: 0.5 }} />
            <Skeleton animation="wave" height={16} width="100%" />
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default ContactDrawerSkeleton;