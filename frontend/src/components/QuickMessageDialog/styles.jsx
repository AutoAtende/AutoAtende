import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

export const PaperContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  padding: '5px',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
  gap: '5px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr'
  }
}));

export const VariableContainer = styled('section')({
  width: '100%',
  marginTop: '6px'
});

export const MessageInfoContainer = styled('section')({
  position: 'relative',
  top: '5px',
  marginBottom: '17px'
});