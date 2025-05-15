import { styled } from '@mui/material/styles';
import { Box, Button, Typography } from '@mui/material';

export const Container = styled(Box)(({ theme }) => ({
  '& footer': {
    marginTop: 30,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',

    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      '& .checkout-buttons': {
        display: 'flex',
        flexDirection: 'column-reverse',
        width: '100%',

        '& button': {
          width: '100%',
          marginTop: 16,
          marginLeft: 0,
        },
      },
    },

    '& button': {
      marginLeft: 16,
    },
  },
}));

export const Total = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',

  '& span': {
    color: '#333',
    fontWeight: 'bold',
  },

  '& strong': {
    color: '#333',
    fontSize: '28px',
    marginLeft: '5px',
  },

  [theme.breakpoints.down('md')]: {
    minWidth: '100%',
    justifyContent: 'space-between',
  },
}));

export const SuccessContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  '& > h2': {
    textAlign: 'center',
  },

  '& > svg': {
    marginTop: 16,
  },

  '& > span': {
    marginTop: 24,
    textAlign: 'center',
  },

  '& > p, & strong': {
    marginTop: 8,
    fontSize: '9px',
    color: '#999',
  },

  '& .copy-button': {
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center',
    userSelect: 'none',
    minHeight: '56px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    color: '#000',
    outline: 'none',
    marginTop: 16,
    width: 256,
    fontWeight: 600,
    textTransform: 'uppercase',
    border: 'none',

    '& > span': {
      marginRight: 8,
    },
  },
});

export const CheckoutWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '0 auto 0',
  maxWidth: 1110,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '50px 95px',
  background: '#fff',

  [theme.breakpoints.down('md')]: {
    padding: '16px 24px',
  },
}));