import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

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

const SelectorsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const VariationCell = styled(StyledTableCell)(({ theme, isPositive }) => ({
  color: isPositive ? theme.palette.success.main : theme.palette.error.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

const PercentageCell = styled(StyledTableCell)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 500,
}));

const ComparativeTable = ({ data }) => {
  const [queue1, setQueue1] = useState('');
  const [queue2, setQueue2] = useState('');
  const [comparativeData, setComparativeData] = useState([]);

  useEffect(() => {
    // Inicializar com os dois primeiros itens se disponíveis
    if (data && data.length > 1) {
      setQueue1(data[0].id);
      setQueue2(data[1].id);
    }
  }, [data]);

  useEffect(() => {
    // Preparar dados para comparação
    if (data && data.length > 0 && queue1 && queue2) {
      const queue1Data = data.find(item => item.id === queue1);
      const queue2Data = data.find(item => item.id === queue2);
      
      if (queue1Data && queue2Data) {
        // Calcular variações percentuais
        const messagesVariation = calculateVariation(queue1Data.messages, queue2Data.messages);
        const messagesPercentage1 = calculatePercentage(queue1Data.messages, queue1Data.messages + queue2Data.messages);
        const messagesPercentage2 = calculatePercentage(queue2Data.messages, queue1Data.messages + queue2Data.messages);
        
        const avgTimeArr = convertTimeToMinutes(queue1Data.avgTime, queue2Data.avgTime);
        const timeVariation = calculateVariation(avgTimeArr[1], avgTimeArr[0]); // Invertido pois menor é melhor
        
        const clientsVariation = calculateVariation(queue1Data.clients, queue2Data.clients);
        const clientsPercentage1 = calculatePercentage(queue1Data.clients, queue1Data.clients + queue2Data.clients);
        const clientsPercentage2 = calculatePercentage(queue2Data.clients, queue1Data.clients + queue2Data.clients);
        
        const responseRateArr = convertPercentToNumber(queue1Data.responseRate, queue2Data.responseRate);
        const rateVariation = calculateVariation(responseRateArr[0], responseRateArr[1]);
        const ratePercentage1 = responseRateArr[0];
        const ratePercentage2 = responseRateArr[1];
        
        const firstContactArr = convertTimeToMinutes(queue1Data.firstContact, queue2Data.firstContact);
        const firstContactVariation = calculateVariation(firstContactArr[1], firstContactArr[0]); // Invertido pois menor é melhor
        
        setComparativeData([
          {
            metric: 'Mensagens',
            value1: queue1Data.messages,
            value2: queue2Data.messages,
            percentage1: messagesPercentage1,
            percentage2: messagesPercentage2,
            variation: messagesVariation,
            invertedMetric: false
          },
          {
            metric: 'Tempo médio',
            value1: queue1Data.avgTime,
            value2: queue2Data.avgTime,
            percentage1: null, // Não faz sentido calcular percentual para tempos
            percentage2: null,
            variation: timeVariation,
            invertedMetric: true
          },
          {
            metric: 'Clientes',
            value1: queue1Data.clients,
            value2: queue2Data.clients,
            percentage1: clientsPercentage1,
            percentage2: clientsPercentage2,
            variation: clientsVariation,
            invertedMetric: false
          },
          {
            metric: 'Taxa de resposta',
            value1: queue1Data.responseRate,
            value2: queue2Data.responseRate,
            percentage1: ratePercentage1,
            percentage2: ratePercentage2,
            variation: rateVariation,
            invertedMetric: false
          },
          {
            metric: 'Primeiro contato',
            value1: queue1Data.firstContact,
            value2: queue2Data.firstContact,
            percentage1: null, // Não faz sentido calcular percentual para tempos
            percentage2: null,
            variation: firstContactVariation,
            invertedMetric: true
          }
        ]);
      }
    }
  }, [data, queue1, queue2]);

  // Funções auxiliares
  const calculateVariation = (value1, value2) => {
    if (value1 === 0 || value2 === 0) return 0;
    // Limitar a variação para um máximo de 200% para evitar valores extremos
    const variation = Math.round(((value1 - value2) / value2) * 100);
    return Math.max(Math.min(variation, 200), -200);
  };

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const convertTimeToMinutes = (time1, time2) => {
    const convertTime = (timeStr) => {
      const matches = timeStr.match(/(\d+)m\s+(\d+)s/);
      if (!matches) return 0;
      return parseInt(matches[1]) + parseInt(matches[2]) / 60;
    };
    
    return [convertTime(time1), convertTime(time2)];
  };

  const convertPercentToNumber = (percent1, percent2) => {
    const convertPercent = (percentStr) => {
      const match = percentStr.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    
    return [convertPercent(percent1), convertPercent(percent2)];
  };

  return (
    <>
      <SelectorsContainer>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={queue1}
            onChange={(e) => setQueue1(e.target.value)}
            displayEmpty
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem disabled value="">Setor 1</MenuItem>
            {data && data.map((item) => (
              <MenuItem key={`q1-${item.id}`} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={queue2}
            onChange={(e) => setQueue2(e.target.value)}
            displayEmpty
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem disabled value="">Setor 2</MenuItem>
            {data && data.map((item) => (
              <MenuItem key={`q2-${item.id}`} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </SelectorsContainer>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Métrica</StyledTableHeadCell>
              <StyledTableHeadCell align="right">
                {queue1 && data ? data.find(item => item.id === queue1)?.name : ''}
              </StyledTableHeadCell>
              <StyledTableHeadCell align="right">
                % Setor 1
              </StyledTableHeadCell>
              <StyledTableHeadCell align="right">
                {queue2 && data ? data.find(item => item.id === queue2)?.name : ''}
              </StyledTableHeadCell>
              <StyledTableHeadCell align="right">
                % Setor 2
              </StyledTableHeadCell>
              <StyledTableHeadCell align="right">Variação</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparativeData.map((row, index) => (
              <StyledTableRow key={row.metric} index={index}>
                <StyledTableCell component="th" scope="row">
                  {row.metric}
                </StyledTableCell>
                <StyledTableCell align="right">{row.value1}</StyledTableCell>
                <PercentageCell align="right">
                  {row.percentage1 !== null ? `${row.percentage1}%` : '-'}
                </PercentageCell>
                <StyledTableCell align="right">{row.value2}</StyledTableCell>
                <PercentageCell align="right">
                  {row.percentage2 !== null ? `${row.percentage2}%` : '-'}
                </PercentageCell>
                <VariationCell 
                  align="right" 
                  isPositive={row.variation > 0 && !row.invertedMetric || row.variation < 0 && row.invertedMetric}
                >
                  {row.variation > 0 ? (
                    <>
                      <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                      {`${row.variation}%`}
                    </>
                  ) : (
                    <>
                      <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} />
                      {`${Math.abs(row.variation)}%`}
                    </>
                  )}
                </VariationCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ComparativeTable;