import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Chip,
  Avatar,
  Rating,
  Paper,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList
} from "recharts";
import { 
  ArrowUpward as ArrowUpwardIcon, 
  ArrowDownward as ArrowDownwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

import VisibilityToggle from "../components/VisibilityToggle";

// Componentes otimizados para mobile
import ResponsiveChart from '../components/ResponsiveChart';
import ResponsiveTable from '../components/ResponsiveTable';
import useResponsive from '../hooks/useResponsive';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';
import { stringToColor } from "../utils/stringToColor";
import api from "../../../services/api";

const UsersTab = ({ data, touchEnabled = false, currentDates }) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { isComponentVisible } = useDashboardSettings();

  if (!data) {
    return null;
  }

  // Estados
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userQueueData, setUserQueueData] = useState([]);
  const [loadingUserQueueData, setLoadingUserQueueData] = useState(false);
  const [totalsData, setTotalsData] = useState(null);

  // Função para buscar dados do usuário por fila
  const fetchUserQueueData = useCallback(async () => {
    if (!selectedUserId) return;
    
    setLoadingUserQueueData(true);
    try {
      // Usar datas padrão caso currentDates não esteja disponível
      const startDate = currentDates?.startDate || new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      const endDate = currentDates?.endDate || new Date();
      
      const { data } = await api.get(`/dashboard/user-queue-metrics/${selectedUserId}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      // Calcular totais para percentuais
      const totalTickets = data.reduce((sum, queue) => sum + queue.tickets, 0);
      const totalMessages = data.reduce((sum, queue) => sum + queue.messages, 0);
      
      // Adicionar percentuais e outros dados calculados
      const enrichedData = data.map(queue => ({
        ...queue,
        ticketsPercentage: totalTickets > 0 ? queue.tickets / totalTickets : 0,
        messagesPercentage: totalMessages > 0 ? queue.messages / totalMessages : 0,
        messagesPerTicket: queue.tickets > 0 ? queue.messages / queue.tickets : 0
      }));
      
      // Adicionar linha de totais
      const totalsRow = {
        queueId: 'total',
        queueName: 'Total',
        queueColor: theme.palette.info.main,
        tickets: totalTickets,
        messages: totalMessages,
        ticketsPercentage: 1,
        messagesPercentage: 1,
        isTotal: true
      };
      
      setUserQueueData(enrichedData);
      setTotalsData(totalsRow);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário por fila:", error);
    } finally {
      setLoadingUserQueueData(false);
    }
  }, [selectedUserId, currentDates, theme.palette.info.main]);

  // Efeito para buscar dados quando o usuário muda
  useEffect(() => {
    if (selectedUserId) {
      fetchUserQueueData();
    }
  }, [selectedUserId, fetchUserQueueData]);

  // Manipulador de mudança para o select de usuário
  const handleUserChange = (event) => {
    setSelectedUserId(event.target.value);
  };

  // Definindo as colunas para a tabela de métricas por fila
  const userQueueColumns = [
    {
      field: 'queueName',
      headerName: 'Fila/Setor',
      minWidth: 180,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: row.queueColor,
              mr: 1
            }}
          />
          <Typography variant="body2" fontWeight="medium">
            {value || 'Sem nome'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'tickets',
      headerName: 'Tickets',
      align: 'right',
      minWidth: 110,
      renderCell: (value, row) => {
        const percentage = row.ticketsPercentage || 0;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={value || 0}
              size="small"
              sx={{
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                fontWeight: 'bold',
                minWidth: 50,
                mb: 0.5
              }}
            />
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end' 
            }}>
              <Box
                sx={{
                  width: `${Math.min(percentage * 100, 100)}%`,
                  height: 4,
                  borderRadius: 1,
                  bgcolor: theme.palette.primary.main,
                  mr: 1,
                  minWidth: 8,
                }}
              />
              <Typography variant="caption" color="textSecondary">
                {percentage > 0 ? `${(percentage * 100).toFixed(1)}%` : '-'}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'messages',
      headerName: 'Mensagens',
      align: 'right',
      minWidth: 120,
      renderCell: (value, row) => {
        const percentage = row.messagesPercentage || 0;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={value || 0}
              size="small"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: '#fff',
                fontWeight: 'bold',
                minWidth: 60,
                mb: 0.5
              }}
            />
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end' 
            }}>
              <Box
                sx={{
                  width: `${Math.min(percentage * 100, 100)}%`,
                  height: 4,
                  borderRadius: 1,
                  bgcolor: theme.palette.secondary.main,
                  mr: 1,
                  minWidth: 8,
                }}
              />
              <Typography variant="caption" color="textSecondary">
                {percentage > 0 ? `${(percentage * 100).toFixed(1)}%` : '-'}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'messagesPerTicket',
      headerName: 'Msgs/Ticket',
      align: 'right',
      minWidth: 110,
      renderCell: (value, row) => {
        const ratio = row.tickets > 0 ? (row.messages / row.tickets).toFixed(1) : '0.0';
        // Definir cores com base na eficiência
        const isHighEfficiency = parseFloat(ratio) >= 4.0;
        const isLowEfficiency = parseFloat(ratio) <= 1.5;
        const color = isHighEfficiency ? theme.palette.success.main : 
                     isLowEfficiency ? theme.palette.error.main : 
                     theme.palette.warning.main;
        
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography 
              variant="body2" 
              fontWeight="medium" 
              sx={{ 
                color,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {ratio}
              {isHighEfficiency && (
                <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}>
                  <ArrowUpwardIcon sx={{ fontSize: 16, color: 'inherit' }} />
                </Box>
              )}
              {isLowEfficiency && (
                <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}>
                  <ArrowDownwardIcon sx={{ fontSize: 16, color: 'inherit' }} />
                </Box>
              )}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {isHighEfficiency ? 'Alta eficiência' : 
               isLowEfficiency ? 'Baixa eficiência' : 'Média'}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'efficiency',
      headerName: 'Eficiência',
      align: 'center',
      minWidth: 120,
      renderCell: (value, row) => {
        // Calcular um índice de eficiência com base em mensagens por ticket
        const ratio = row.tickets > 0 ? (row.messages / row.tickets) : 0;
        const efficiency = Math.min(Math.max((ratio / 5) * 100, 0), 100); // Normalizado para 0-100%
        
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '80%', bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
              <Box
                sx={{
                  width: `${efficiency}%`,
                  bgcolor: efficiency > 70 ? theme.palette.success.main :
                          efficiency > 40 ? theme.palette.warning.main :
                          theme.palette.error.main,
                  height: 8,
                  borderRadius: 1,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              {efficiency.toFixed(0)}%
            </Typography>
          </Box>
        );
      }
    }
  ];

  // Renderização mobile para tabela de filas
  const renderUserQueueMobileCard = (row, index, isExpanded) => {
    const ticketsPercentage = row.ticketsPercentage || 0;
    const messagesPercentage = row.messagesPercentage || 0;
    const ratio = row.tickets > 0 ? (row.messages / row.tickets).toFixed(1) : '0.0';
    
    // Determinar eficiência
    const isHighEfficiency = parseFloat(ratio) >= 4.0;
    const isLowEfficiency = parseFloat(ratio) <= 1.5;
    const efficiencyColor = isHighEfficiency ? theme.palette.success.main : 
                           isLowEfficiency ? theme.palette.error.main : 
                           theme.palette.warning.main;
    
    return (
      <Box sx={{ width: '100%', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: row.queueColor,
                mr: 1.5
              }}
            />
            <Typography variant="body1" fontWeight="medium">
              {row.queueName}
            </Typography>
          </Box>
          
          <Chip
            label={`${ratio} msg/ticket`}
            size="small"
            sx={{
              bgcolor: alpha(efficiencyColor, 0.1),
              color: efficiencyColor,
              fontWeight: 'bold',
              borderColor: efficiencyColor,
              borderWidth: 1,
              borderStyle: 'solid'
            }}
          />
        </Box>
        
        <Box sx={{ px: 1 }}>
          {/* Barra de tickets */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ width: 70 }}>
              Tickets:
            </Typography>
            <Box sx={{ flexGrow: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, mr: 1 }}>
              <Box
                sx={{
                  width: `${Math.min(ticketsPercentage * 100, 100)}%`,
                  bgcolor: theme.palette.primary.main,
                  height: 8,
                  borderRadius: 1,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mr: 1 }}>
                {row.tickets}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ({ticketsPercentage > 0 ? `${(ticketsPercentage * 100).toFixed(1)}%` : '-'})
              </Typography>
            </Box>
          </Box>
          
          {/* Barra de mensagens */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ width: 70 }}>
              Mensagens:
            </Typography>
            <Box sx={{ flexGrow: 1, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 1, mr: 1 }}>
              <Box
                sx={{
                  width: `${Math.min(messagesPercentage * 100, 100)}%`,
                  bgcolor: theme.palette.secondary.main,
                  height: 8,
                  borderRadius: 1,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mr: 1 }}>
                {row.messages}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ({messagesPercentage > 0 ? `${(messagesPercentage * 100).toFixed(1)}%` : '-'})
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  // Dados otimizados para visualização mobile
  const chartData = useMemo(() => {
    // Formatar os dados para os gráficos com adaptações para mobile
    const ticketsPerUserData = data.ticketsPerUser
      .sort((a, b) => b.count - a.count)
      .slice(0, isMobile ? 5 : 10)
      .map(user => ({
        name: isMobile && user.userName.length > 15
          ? user.userName.substring(0, 12) + '...'
          : user.userName || "Desconhecido",
        fullName: user.userName,
        tickets: user.count,
        profile: user.userProfile
      }));

    const messagesPerUserData = data.messagesPerUser
      .sort((a, b) => b.count - a.count)
      .slice(0, isMobile ? 5 : 10)
      .map(user => ({
        name: isMobile && user.userName.length > 15
          ? user.userName.substring(0, 12) + '...'
          : user.userName || "Desconhecido",
        fullName: user.userName,
        messages: user.count,
        color: stringToColor(user.userName || "Desconhecido")
      }));

    const avgResolutionTimeData = data.avgResolutionTimePerUser
      .sort((a, b) => parseFloat(b.avgTime) - parseFloat(a.avgTime))
      .slice(0, isMobile ? 5 : 10)
      .map(user => ({
        name: isMobile && user.userName.length > 15
          ? user.userName.substring(0, 12) + '...'
          : user.userName || "Desconhecido",
        fullName: user.userName,
        avgTime: parseFloat(user.avgTime || 0).toFixed(1),
        color: stringToColor(user.userName || "Desconhecido")
      }));

    // Dados para gráfico de avaliação
    const ratingsPerUserData = data.ratingsPerUser
      .filter(user => user.count >= 5) // Apenas usuários com pelo menos 5 avaliações
      .sort((a, b) => parseFloat(b.avgRate) - parseFloat(a.avgRate))
      .slice(0, 10)
      .map(user => ({
        name: isMobile && user.userName.length > 15
          ? user.userName.substring(0, 12) + '...'
          : user.userName || "Desconhecido",
        fullName: user.userName,
        rating: parseFloat(user.avgRate || 0).toFixed(1),
        count: user.count,
        color: stringToColor(user.userName || "Desconhecido")
      }));

    // Dados para distribuição de avaliações
    const ratingDistributionData = Array.from({ length: 5 }, (_, i) => {
      const rateData = data.ratingDistribution.find(r => parseInt(r.rate) === i + 1);
      return {
        rating: i + 1,
        count: rateData ? parseInt(rateData.count) : 0,
        color: [
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.success.light,
          theme.palette.success.main
        ][i]
      };
    });

    // Dados combinados para tabela de desempenho
    const combinedUserData = ticketsPerUserData.map(user => {
      const messageData = messagesPerUserData.find(m => m.fullName === user.fullName);
      const timeData = avgResolutionTimeData.find(t => t.fullName === user.fullName);
      const ratingData = ratingsPerUserData.find(r => r.fullName === user.fullName);

      return {
        name: user.name,
        fullName: user.fullName,
        profile: user.profile || "Operador",
        tickets: user.tickets,
        messages: messageData?.messages || 0,
        avgTime: timeData?.avgTime || '-',
        rating: ratingData ? parseFloat(ratingData.rating) : 0,
        ratingCount: ratingData?.count || 0,
        color: stringToColor(user.fullName || "Desconhecido")
      };
    }).slice(0, isMobile ? 5 : 8);

    return {
      ticketsPerUserData,
      messagesPerUserData,
      avgResolutionTimeData,
      ratingsPerUserData,
      ratingDistributionData,
      combinedUserData
    };
  }, [data, isMobile, theme.palette]);

  // Customização para tooltip da recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            maxWidth: 250
          }}
        >
          <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
            {payload[0]?.payload?.fullName || label}
          </Typography>
          {payload.map((entry, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: index === payload.length - 1 ? 0 : 0.5
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  mr: 1
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'medium'
                }}
              >
                {`${entry.name}: ${entry.value}`}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Colunas para a tabela de usuários
  const performanceColumns = [
    {
      field: 'name',
      headerName: 'Atendente',
      minWidth: 180,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: row.color,
              width: 32,
              height: 32,
              mr: 1,
              fontSize: '0.875rem'
            }}
          >
            {row.fullName.split(' ').map(n => n.charAt(0)).join('')}
          </Avatar>
          <Typography variant="body2" fontWeight="medium">
            {row.fullName}
          </Typography>
        </Box>
      )
    },
    {
      field: 'profile',
      headerName: 'Perfil',
      align: 'center',
      minWidth: 120,
      renderCell: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === 'admin' ? theme.palette.error.main :
              value === 'superv' ? theme.palette.warning.main :
                theme.palette.info.main,
            color: '#fff',
            fontWeight: 'medium'
          }}
        />
      )
    },
    {
      field: 'tickets',
      headerName: 'Tickets',
      align: 'right',
      minWidth: 80,
      renderCell: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      )
    },
    {
      field: 'messages',
      headerName: 'Mensagens',
      align: 'right',
      minWidth: 100,
      renderCell: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      )
    },
    {
      field: 'avgTime',
      headerName: 'Tempo Médio',
      align: 'right',
      minWidth: 110,
      renderCell: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value} {value !== '-' ? 'min' : ''}
        </Typography>
      )
    },
    {
      field: 'rating',
      headerName: 'Avaliação',
      align: 'center',
      minWidth: 150,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Rating
            value={value}
            precision={0.5}
            readOnly
            size="small"
          />
          {row.ratingCount > 0 && (
            <Typography variant="caption" sx={{ ml: 1 }}>
              ({row.ratingCount})
            </Typography>
          )}
        </Box>
      )
    }
  ];

  // Renderização para versão mobile
  const renderUserMobileCard = (row, index, isExpanded) => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{
            bgcolor: row.color,
            width: 40,
            height: 40,
            mr: 2,
            fontSize: '1rem'
          }}
        >
          {row.fullName.split(' ').map(n => n.charAt(0)).join('')}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight="medium">
            {row.fullName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Chip
              label={row.profile}
              size="small"
              sx={{
                bgcolor: row.profile === 'admin' ? theme.palette.error.main :
                  row.profile === 'superv' ? theme.palette.warning.main :
                    theme.palette.info.main,
                color: '#fff',
                fontWeight: 'medium',
                height: 20,
                '& .MuiChip-label': {
                  fontSize: '0.7rem',
                  px: 1
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {row.tickets} tickets
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ml: 1, textAlign: 'right' }}>
          <Rating
            value={row.rating}
            precision={0.5}
            readOnly
            size="small"
          />
          <Typography variant="caption" color="text.secondary" display="block">
            {row.avgTime} {row.avgTime !== '-' ? 'min' : ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  return (
    <Box sx={{ p: isMobile ? 1.5 : 2, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              height: '100%',
              borderRadius: 1,
              boxShadow: theme.shadows[2],
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            elevation={1}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: isMobile ? 1.5 : 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{ fontWeight: isMobile ? 'medium' : 'bold' }}
              >
                Estatísticas por Fila/Setor
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityToggle
                  tabId="usersTab"
                  componentId="userQueueMetricsTable"
                  visible={true}
                />
              </Box>
            </Box>

            <Box sx={{ p: isMobile ? 1.5 : 2, flexGrow: 1 }}>
              <FormControl
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{ mb: 2 }}
              >
                <InputLabel>Selecione um Atendente</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={handleUserChange}
                  label="Selecione um Atendente"
                >
                  <MenuItem value="">
                    <em>Selecione um atendente</em>
                  </MenuItem>
                  {data.ticketsPerUser?.map((user) => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.userName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {loadingUserQueueData ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : selectedUserId ? (
                userQueueData.length > 0 ? (
                  <Box sx={{ height: 'calc(100% - 80px)', overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {userQueueColumns.map((column) => (
                            <TableCell
                              key={column.field}
                              align={column.align || 'left'}
                              sx={{
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                backgroundColor: theme.palette.background.paper
                              }}
                            >
                              {column.headerName}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userQueueData.map((row, index) => (
                          <TableRow 
                            key={index}
                            sx={{
                              '&:nth-of-type(even)': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                              },
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.07),
                              }
                            }}
                          >
                            {userQueueColumns.map((column) => (
                              <TableCell
                                key={column.field}
                                align={column.align || 'left'}
                              >
                                {column.renderCell ?
                                  column.renderCell(row[column.field], row) :
                                  row[column.field]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        
                        {/* Linha de totais */}
                        {totalsData && (
                          <TableRow sx={{ 
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            fontWeight: 'bold'
                          }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                Total
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={totalsData.tickets}
                                size="small"
                                sx={{
                                  bgcolor: theme.palette.primary.dark,
                                  color: '#fff',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={totalsData.messages}
                                size="small"
                                sx={{
                                  bgcolor: theme.palette.secondary.dark,
                                  color: '#fff',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {totalsData.tickets > 0 ? (totalsData.messages / totalsData.tickets).toFixed(1) : '0.0'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="bold">
                                -
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Nenhum dado encontrado para este atendente
                    </Typography>
                  </Box>
                )
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Selecione um atendente para visualizar suas estatísticas por fila
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Tickets por Atendente"
            height={isMobile ? 250 : 350}
            tabId="usersTab"
            componentId="ticketsPerUserChart"
          >
            <BarChart
              data={chartData.ticketsPerUserData}
              margin={{
                top: 5,
                right: isMobile ? 10 : 30,
                left: isMobile ? 5 : 20,
                bottom: 5
              }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 25 : 35}
              />
              <RechartsTooltip
                formatter={(value) => [`${value} tickets`, 'Quantidade']}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="tickets"
                name="Tickets Atendidos"
                fill={theme.palette.primary.main}
                radius={[4, 4, 0, 0]}
                barSize={isMobile ? 15 : 30}
              >
                <LabelList
                  dataKey="tickets"
                  position="top"
                  formatter={(value) => value}
                  style={{
                    fill: theme.palette.text.secondary,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 'medium'
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Mensagens por Atendente"
            height={isMobile ? 250 : 350}
            tabId="usersTab"
            componentId="messagesPerUserChart"
          >
            <BarChart
              data={chartData.messagesPerUserData}
              margin={{
                top: 5,
                right: isMobile ? 10 : 30,
                left: isMobile ? 5 : 20,
                bottom: 5
              }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 25 : 35}
              />
              <RechartsTooltip
                formatter={(value) => [`${value} mensagens`, 'Quantidade']}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="messages"
                name="Mensagens Enviadas"
                fill={theme.palette.secondary.main}
                radius={[4, 4, 0, 0]}
                barSize={isMobile ? 15 : 30}
              >
                <LabelList
                  dataKey="messages"
                  position="top"
                  formatter={(value) => value}
                  style={{
                    fill: theme.palette.text.secondary,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 'medium'
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Tempo Médio de Resolução"
            height={isMobile ? 250 : 350}
            tabId="usersTab"
            componentId="resolutionTimePerUserChart"
          >
            <BarChart
              data={chartData.avgResolutionTimeData}
              layout="vertical"
              margin={{
                top: 5,
                right: isMobile ? 15 : 30,
                left: isMobile ? 5 : 20,
                bottom: 5
              }}
            >
              <XAxis
                type="number"
                unit=" min"
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={isMobile ? 100 : 120}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <RechartsTooltip
                formatter={(value) => [`${value} minutos`, 'Tempo Médio']}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="avgTime"
                name="Tempo Médio"
                fill={theme.palette.warning.main}
                radius={[0, 4, 4, 0]}
                barSize={isMobile ? 15 : 30}
              >
                <LabelList
                  dataKey="avgTime"
                  position="right"
                  formatter={(value) => value}
                  style={{
                    fill: theme.palette.text.secondary,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 'medium'
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              height: '100%',
              borderRadius: 1,
              boxShadow: theme.shadows[2],
              overflow: 'hidden'
            }}
            elevation={1}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: isMobile ? 1.5 : 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{ fontWeight: isMobile ? 'medium' : 'bold' }}
              >
                Avaliações dos Atendentes
              </Typography>
            </Box>

            <Box sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Distribuição de Avaliações
              </Typography>

              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 2,
                mt: 1,
                px: isMobile ? 1 : 2
              }}>
                {chartData.ratingDistributionData.map((item) => (
                  <Box
                    key={item.rating}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: `${100 / 5}%`
                    }}
                  >
                    <Box sx={{
                      height: Math.max(20, (item.count / Math.max(...chartData.ratingDistributionData.map(d => d.count))) * 50),
                      width: isMobile ? 16 : 24,
                      backgroundColor: item.color,
                      borderRadius: '3px',
                      mb: 1
                    }} />
                    <Typography variant={isMobile ? "caption" : "body1"} color="textPrimary" fontWeight="medium">
                      {item.count}
                    </Typography>
                    <Rating value={item.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Melhores Avaliações
              </Typography>

              <Box sx={{ mt: 1 }}>
                {chartData.ratingsPerUserData.slice(0, isMobile ? 3 : 5).map((user, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      ...(index < (isMobile ? 2 : 4) && {
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      })
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          mr: 1,
                          bgcolor: stringToColor(user.fullName),
                          fontSize: '0.75rem'
                        }}
                      >
                        {user.fullName.split(' ').map(n => n.charAt(0)).join('')}
                      </Avatar>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          maxWidth: isMobile ? 100 : 150
                        }}
                      >
                        {user.fullName}
                      </Typography>
                    </Box>

                    <Rating
                      value={parseFloat(user.rating)}
                      precision={0.5}
                      readOnly
                      size="small"
                    />

                    <Chip
                      label={user.count}
                      size="small"
                      sx={{
                        ml: 1,
                        bgcolor: COLORS[index % COLORS.length],
                        color: '#fff',
                        fontWeight: 'bold',
                        minWidth: 40
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <ResponsiveTable
            title="Desempenho Geral dos Atendentes"
            columns={performanceColumns}
            data={chartData.combinedUserData}
            mobileCardComponent={renderUserMobileCard}
            sx={{ height: 'auto' }}
            tabId="usersTab"
            componentId="performanceTable"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsersTab;