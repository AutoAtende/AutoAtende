// styles.js
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const FilterButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  '& .MuiButtonBase-root': {
    whiteSpace: 'nowrap'
  }
}));

export const TableContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  backgroundColor: 'rgb(244 244 244 / 53%)',
  borderRadius: '5px',
  padding: theme.spacing(2),
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.barraSuperior,
    '& .MuiTableCell-root': {
      color: '#fff'
    }
  }
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4)
}));

export const SearchContainer = styled(Box)(({ theme }) => ({
  width: '45%',
  '& .MuiInputBase-root': {
    width: '100%'
  }
}));