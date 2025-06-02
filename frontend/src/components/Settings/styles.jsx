import { Box, Card, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';

export const TabStyled = styled(Tab)`
    @media (max-width: 767px) {
        font-size: 10px;
    }
`;

export const TextFieldWebhookN8N = styled("section")` // Alterado para styled("section")
    margin-top: 12px;
`;

export const GroupButton = styled("section")``; // Alterado para styled("section")

export const StyledContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: '100%',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  minWidth: 160,
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '1rem',
  padding: '12px 24px',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '& .MuiTab-wrapper': {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
  },
}));

export const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
  }
}));
