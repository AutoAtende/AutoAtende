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
  Box,
  Button,
  Typography,
  CircularProgress,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CompareArrows } from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import { useDashboardContext } from '../context/DashboardContext';

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
  flexWrap: 'wrap',
  alignItems: 'center',
}));

const CompareButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  height: 40,
  marginLeft: theme.spacing(1),
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

const ProspectionTable = ({ data, compareMode = false }) => {
  const { queues } = useDashboardContext();
  const [queue1, setQueue1] = useState('');
  const [queue2, setQueue2] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    // Inicializar com as duas primeiras filas, se disponíveis
    if (queues && queues.length > 2) {
      setQueue1(queues[1].id);
      setQueue2(queues[2].id);
    }
  }, [queues]);

  const handleCompare = async () => {
    if (!queue1 || !queue2) {
      toast.error('Selecione dois setores para comparar');
      return;
    }

    if (queue1 === queue2) {
      toast.error('Selecione dois setores diferentes para comparação');
      return;
    }

    setLoading(true);
    setIsComparing(true);

    try {
      // Obter dados de cada usuário nos setores selecionados
      const results = await Promise.all(
        data.map(async (user) => {
          try {
            const response = await api.get('/dashboard/user-queues-comparison', {
              params: {
                userId: user.id,
                queue1,
                queue2
              }
            });
            
            return {
              id: user.id,
              name: user.name,
              queue1: {
                id: response.data.queue1.id,
                name: response.data.queue1.name,
                clients: response.data.queue1.clients || 0,
                messages: response.data.queue1.messages || 0
              },
              queue2: {
                id: response.data.queue2.id,
                name: response.data.queue2.name,
                clients: response.data.queue2.clients || 0,
                messages: response.data.queue2.messages || 0
              },
              totals: {
                clients: response.data.totals.clients || 0,
                messages: response.data.totals.messages || 0
              },
              // Manter o campo de desempenho do data original
              performance: user.performance
            };
          } catch (error) {
            console.error(`Erro ao buscar dados para usuário ${user.id}:`, error);
            // Retornar dados vazios em caso de erro
            return {
              id: user.id,
              name: user.name,
              queue1: { id: queue1, name: getQueueName(queue1), clients: 0, messages: 0 },
              queue2: { id: queue2, name: getQueueName(queue2), clients: 0, messages: 0 },
              totals: { clients: 0, messages: 0 },
              performance: user.performance
            };
          }
        })
      );
      
      setComparisonData(results);
    } catch (error) {
      console.error('Erro ao comparar setores:', error);
      toast.error('Erro ao comparar setores');
      setIsComparing(false);
    } finally {
      setLoading(false);
    }
  };

  const resetComparison = () => {
    setIsComparing(false);
    setComparisonData([]);
  };

  const getQueueName = (queueId) => {
    const queue = queues.find(q => q.id === queueId);
    return queue ? queue.name : 'Desconhecido';
  };

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
    <>
      {compareMode && (
        <SelectorsContainer>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={queue1}
              onChange={(e) => setQueue1(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.9rem' }}
            >
              <MenuItem disabled value="">Setor 1</MenuItem>
              {queues && queues.slice(1).map((queue) => (
                <MenuItem key={`q1-${queue.id}`} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={queue2}
              onChange={(e) => setQueue2(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.9rem' }}
            >
              <MenuItem disabled value="">Setor 2</MenuItem>
              {queues && queues.slice(1).map((queue) => (
                <MenuItem key={`q2-${queue.id}`} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {!isComparing ? (
            <CompareButton 
              startIcon={<CompareArrows />} 
              onClick={handleCompare}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Comparar Setores'}
            </CompareButton>
          ) : (
            <CompareButton 
              onClick={resetComparison}
              color="secondary"
            >
              Voltar
            </CompareButton>
          )}
        </SelectorsContainer>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !isComparing && (
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
      )}

      {!loading && isComparing && comparisonData.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Agente</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Contatos (Total)</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Contatos em {getQueueName(queue1)}</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Contatos em {getQueueName(queue2)}</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Mensagens (Total)</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Mensagens em {getQueueName(queue1)}</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Mensagens em {getQueueName(queue2)}</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonData.map((row, index) => (
                <StyledTableRow key={row.id} index={index}>
                  <StyledTableCell component="th" scope="row">
                    {row.name}
                  </StyledTableCell>
                  <StyledTableCell align="right">{row.totals.clients}</StyledTableCell>
                  <StyledTableCell align="right">{row.queue1.clients}</StyledTableCell>
                  <StyledTableCell align="right">{row.queue2.clients}</StyledTableCell>
                  <StyledTableCell align="right">{row.totals.messages}</StyledTableCell>
                  <StyledTableCell align="right">{row.queue1.messages}</StyledTableCell>
                  <StyledTableCell align="right">{row.queue2.messages}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default ProspectionTable;