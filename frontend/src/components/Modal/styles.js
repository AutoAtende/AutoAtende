import { styled } from '@mui/material/styles';
import { hexToRgba } from "../../helpers/hexToRgba";

export const Container = styled('div')(({ theme, show, isFull }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100vw',
  height: '113vh',
  background: hexToRgba('#303030', 0.5),
  opacity: 0,
  zIndex: 0,
  visibility: 'hidden',
  transition: '0.3s',
  ...(show && {
    zIndex: 99999,
    opacity: 1,
    visibility: 'visible'
  }),

  '& > div': {
    background: '#ffffff',
    boxShadow: '0px 2px 8px rgba(48, 48, 48, 0.5)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: 'fit-content',
    padding: '32px',
    maxWidth: '90%',
    minWidth: '33%',
    opacity: 1,
    position: 'relative',
    overflowY: 'auto',
    maxHeight: '90%',
    transition: '0.3s',
    transform: 'translate3d(0, -15px, 0)',
    ...(show && {
      transform: 'translate3d(0, 0, 0)'
    }),
    ...(isFull && {
      overflowY: 'hidden !important',
      padding: 0
    }),

    '& > span': {
      position: 'fixed',
      top: '0px',
      right: '0px',
      padding: '16px',
      cursor: 'pointer'
    }
  },

  [theme.breakpoints.down('md')]: {
    '& > div': {
      margin: '0 24px'
    }
  }
}));