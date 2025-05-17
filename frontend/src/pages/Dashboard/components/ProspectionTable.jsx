import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '12px',
  fontSize: '0.9rem',
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: '12px',
  fontSize: '0.9rem',
  fontWeight: 500,
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.secondary,
  borderBottom: 'none',
}));

const StyledTableRow = styled(TableRow)(({ theme, index }) => ({
  backgroundColor: index % 2 === 1 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let backgroundColor = 'rgba(244, 67, 54, 0.1)';
  let color = '#c62828';

  if (status === 'Alto') {
    backgroundColor = 'rgba(76, 175, 80, 0.1)';
    color = '#087f23';
  } else if (status === 'Médio') {
    backgroundColor = 'rgba(255, 152, 0, 0.1)';
    color = '#e65100';
  }

  return {
    backgroundColor,
    color,
    fontSize: '0.75rem',
    fontWeight: 500,
    borderRadius: '10px',
    padding: '4px 8px',
  };
});

const ProspectionTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180 }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum dado de prospecção disponível
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableHeadCell>Agente</StyledTableHeadCell>
            <StyledTableHeadCell align="center">Clientes</StyledTableHeadCell>
            <StyledTableHeadCell align="center">Mensagens</StyledTableHeadCell>
            <StyledTableHeadCell align="right">Desempenho</StyledTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <StyledTableRow key={row.id} index={index}>
              <StyledTableCell component="th" scope="row">
                {row.name}
              </StyledTableCell>
              <StyledTableCell align="center">{row.clients}</StyledTableCell>
              <StyledTableCell align="center">{row.messages}</StyledTableCell>
              <StyledTableCell align="right">
                <StatusChip 
                  label={row.performance}
                  status={row.performance}
                  size="small"
                />
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProspectionTable;