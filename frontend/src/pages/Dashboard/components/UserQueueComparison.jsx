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
  CircularProgress
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

const UserQueueComparison = () => {
  const { queues, users, dateRange } = useDashboardContext();
  const [selectedUser, setSelectedUser] = useState('');
  const [queue1, setQueue1] = useState('');
  const [queue2, setQueue2] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inicializar com o primeiro usuário e as duas primeiras filas, se disponíveis
    if (users && users.length > 1 && queues && queues.length > 2) {
      // Pegar o primeiro usuário real (pular o 'Todos os Agentes')
      setSelectedUser(users[1].id);
      // Pegar as duas primeiras filas reais (pular 'Todos')
      setQueue1(queues[1].id);
      setQueue2(queues[2].id);
    }
  }, [users, queues]);

  const handleCompare = async () => {
    if (!selectedUser || !queue1 || !queue2) {
      toast.error('Selecione um usuário e dois setores para comparar');
      return;
    }

    if (queue1 === queue2) {
      toast.error('Selecione dois setores diferentes para comparação');
      return;
    }

    setLoading(true);
    try {
      // Calcular datas para o filtro
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - dateRange);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await api.get('/dashboard/user-queues-comparison', {
        params: {
          userId: selectedUser,
          queue1,
          queue2,
          startDate: startDateStr,
          endDate: endDateStr
        }
      });

      setComparisonData(response.data);
    } catch (error) {
      console.error('Erro ao buscar comparativo:', error);
      toast.error('Não foi possível obter os dados comparativos');
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value, total) => {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Desconhecido';
  };

  const getQueueName = (queueId) => {
    const queue = queues.find(q => q.id === queueId);
    return queue ? queue.name : 'Desconhecido';
  };

  return (
    <>
      <SelectorsContainer>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            displayEmpty
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem disabled value="">Selecione um usuário</MenuItem>
            {users && users.slice(1).map((user) => (
              <MenuItem key={`user-${user.id}`} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
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
        
        <CompareButton 
          startIcon={<CompareArrows />} 
          onClick={handleCompare}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Comparar'}
        </CompareButton>
      </SelectorsContainer>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !comparisonData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography variant="body1" color="text.secondary">
            Selecione um usuário e dois setores para comparar o desempenho
          </Typography>
        </Box>
      )}

      {!loading && comparisonData && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell colSpan={7}>
                  Comparativo de {getUserName(comparisonData.user.id)} entre setores
                </StyledTableHeadCell>
              </TableRow>
              <TableRow>
                <StyledTableHeadCell>Categoria</StyledTableHeadCell>
                <StyledTableHeadCell align="right">Total</StyledTableHeadCell>
                <StyledTableHeadCell align="right">{getQueueName(comparisonData.queue1.id)}</StyledTableHeadCell>
                <StyledTableHeadCell align="right">%</StyledTableHeadCell>
                <StyledTableHeadCell align="right">{getQueueName(comparisonData.queue2.id)}</StyledTableHeadCell>
                <StyledTableHeadCell align="right">%</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow index={0}>
                <StyledTableCell component="th" scope="row">Contatos</StyledTableCell>
                <StyledTableCell align="right">{comparisonData.totals.clients}</StyledTableCell>
                <StyledTableCell align="right">{comparisonData.queue1.clients}</StyledTableCell>
                <StyledTableCell align="right">{getPercentage(comparisonData.queue1.clients, comparisonData.totals.clients)}</StyledTableCell>
                <StyledTableCell align="right">{comparisonData.queue2.clients}</StyledTableCell>
                <StyledTableCell align="right">{getPercentage(comparisonData.queue2.clients, comparisonData.totals.clients)}</StyledTableCell>
              </StyledTableRow>
              <StyledTableRow index={1}>
                <StyledTableCell component="th" scope="row">Mensagens</StyledTableCell>
                <StyledTableCell align="right">{comparisonData.totals.messages}</StyledTableCell>
                <StyledTableCell align="right">{comparisonData.queue1.messages}</StyledTableCell>
                <StyledTableCell align="right">{getPercentage(comparisonData.queue1.messages, comparisonData.totals.messages)}</StyledTableCell>
                <StyledTableCell align="right">{comparisonData.queue2.messages}</StyledTableCell>
                <StyledTableCell align="right">{getPercentage(comparisonData.queue2.messages, comparisonData.totals.messages)}</StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default UserQueueComparison;