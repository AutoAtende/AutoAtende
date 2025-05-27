import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  position: 'fixed',
  zIndex: 999,
  top: 0,
  left: 0,
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
});