import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  '& > img': {
    width: '56px'
  },

  '& > p': {
    fontWeight: 500,
    fontSize: '20px',
    lineHeight: '25px',
    whiteSpace: 'pre-wrap',
    color: '#6A6A6A',
    textAlign: 'center',
    maxWidth: '522px'
  },

  '& > * + *': {
    marginTop: '24px'
  }
});