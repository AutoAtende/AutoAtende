import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  AccessTime as ClockIcon,
  SendToMobileOutlined as PaperPlaneIcon,
  People as UsersIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';

// Styled Components
const CardContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.5),
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s',
  height: '100%',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const CardTitle = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1.25),
  display: 'flex',
  alignItems: 'center',
}));

const CardTitleIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1.25),
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
}));

const CardValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 500,
  color: theme.palette.primary.main,
}));

const CardSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.625),
}));

const CardFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1.25),
  fontSize: '0.85rem',
}));

const CardTrendUp = styled(Box)(({ theme }) => ({
  color: theme.palette.success.main,
  display: 'flex',
  alignItems: 'center',
}));

const CardTrendDown = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  display: 'flex',
  alignItems: 'center',
}));

// Helper para seleção dinâmica do ícone
const getIcon = (iconName) => {
  switch (iconName) {
    case 'clock':
      return <ClockIcon />;
    case 'paper-plane':
      return <PaperPlaneIcon />;
    case 'users':
      return <UsersIcon />;
    default:
      return <PaperPlaneIcon />;
  }
};

const DashboardCard = ({ icon, title, value, subtitle, trend, trendText, invertTrend = false }) => {
  // Determinar se a tendência é positiva (considerando a inversão se necessário)
  const isPositiveTrend = invertTrend ? trend < 0 : trend > 0;
  
  return (
    <CardContainer>
      <CardTitle>
        <CardTitleIcon>
          {getIcon(icon)}
        </CardTitleIcon>
        {title}
      </CardTitle>
      <CardValue variant="h2">{value}</CardValue>
      <CardSubtitle variant="body2">{subtitle}</CardSubtitle>
      <CardFooter>
        {isPositiveTrend ? (
          <CardTrendUp>
            <ArrowUpIcon fontSize="small" sx={{ mr: 0.5 }} />
            {trendText}
          </CardTrendUp>
        ) : (
          <CardTrendDown>
            <ArrowDownIcon fontSize="small" sx={{ mr: 0.5 }} />
            {trendText}
          </CardTrendDown>
        )}
      </CardFooter>
    </CardContainer>
  );
};

export default DashboardCard;