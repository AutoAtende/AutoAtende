import React, { useMemo } from 'react';
import { 
  Grid, 
  Typography, 
  Box,
  Paper,
  Divider,
  Tooltip,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
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
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { 
  ConfirmationNumber as TicketIcon, 
  Message as MessageIcon, 
  AccessTime as TimeIcon, 
  Star as StarIcon,
  PersonAdd as PersonAddIcon,
  TouchApp as TouchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

// Componentes otimizados para mobile
import ResponsiveChart from '../components/ResponsiveChart';
import useResponsive from '../hooks/useResponsive';
import { animated, useSpring } from 'react-spring';
import { useDashboardSettings } from '../../../context/DashboardSettingsContext';
import VisibilityToggle from '../components/VisibilityToggle';

const OverviewTab = ({ data = {}, touchEnabled = false }) => {
  const theme = useTheme();
  const { isMobile, isTablet, isLandscape } = useResponsive();
  const { isComponentVisible } = useDashboardSettings();
  
  // Validação inicial dos dados
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 2, height: '100%', overflow: 'auto' }}>
        <Grid container spacing={isMobile ? 2 : 3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={6} sm={6} md={3} key={`skeleton-${i}`}>
              <Skeleton variant="rectangular" height={118} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  // Valores padrão para evitar erros com dados ausentes
  const {
    totalTickets = 0,
    totalMessages = 0,
    averageResolutionTime = 0,
    averageRating = 0,
    newContacts = 0,
    ticketsByStatus = [],
    ticketsByDay = [],
    messagesByDay = []
  } = data;
  
  // Calcular tendências e mudanças percentuais
  const calcTrend = (current, previous) => {
    if (previous === 0) return { value: 0, direction: 'flat' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
    };
  };
  
  // Simular tendências para demonstração - em produção usar dados reais
  const ticketTrend = calcTrend(totalTickets, totalTickets * 0.88);
  const messageTrend = calcTrend(totalMessages, totalMessages * 0.92);
  const timeTrend = calcTrend(averageResolutionTime, averageResolutionTime * 1.05);
  const contactsTrend = calcTrend(newContacts, newContacts * 0.85);
  
  // Preparar dados para gráficos com memoization para otimização
  const chartData = useMemo(() => {
    // Verificar se temos dados para trabalhar
    if (!ticketsByDay || ticketsByDay.length === 0) return [];
    
    // Otimização para telas pequenas - reduzir dados em 50% para melhorar performance
    const dataReductionFactor = isMobile ? 2 : 1;
    
    // Processar os dados para o gráfico de atividade diária
    return ticketsByDay
      .filter((_, i) => i % dataReductionFactor === 0) // Reduzir quantidade de pontos para mobile
      .map(ticketDay => {
        const messageDay = messagesByDay?.find(mDay => mDay?.date === ticketDay?.date) || { count: 0 };
        
        // Formatar data para mostrar apenas dia/mês com validação
        const dateParts = ticketDay?.date?.split('-') || [];
        const formattedDate = dateParts.length >= 3 
          ? `${dateParts[2]}/${dateParts[1]}` 
          : ticketDay.date || '';
        
        return {
          date: formattedDate,
          fullDate: ticketDay.date,
          tickets: ticketDay?.count || 0,
          messages: messageDay?.count || 0
        };
      });
  }, [ticketsByDay, messagesByDay, isMobile]);

  // Dados para gráfico de pizza (status dos tickets) com cores modernas
  const ticketStatusData = useMemo(() => {
    if (!ticketsByStatus || ticketsByStatus.length === 0) {
      return [{ name: 'Sem Dados', value: 1, color: theme.palette.grey[400] }];
    }
    
    const statusMapping = {
      pending: { name: "Pendente", color: theme.palette.warning.main },
      open: { name: "Aberto", color: theme.palette.info.main },
      closed: { name: "Resolvido", color: theme.palette.success.main },
      processing: { name: "Em Atendimento", color: theme.palette.secondary.main }
    };
    
    return ticketsByStatus.map(status => ({
      name: statusMapping[status?.status]?.name || 
        (status?.status ? status.status.charAt(0).toUpperCase() + status.status.slice(1) : 'Desconhecido'),
      value: status?.count || 0,
      color: statusMapping[status?.status]?.color || theme.palette.grey[500]
    }));
  }, [ticketsByStatus, theme]);

  // Cores para os gráficos
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ];

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
            {payload[0]?.payload?.fullDate || label || 'Sem Data'}
          </Typography>
          {payload.map((entry, index) => (
            <Box 
              key={`tooltip-entry-${index}`} 
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
                  color: entry.color,
                  fontWeight: 'medium' 
                }}
              >
                {`${entry.name || 'Valor'}: ${entry.value || 0}`}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Cards altamente estilizados para visão geral
  const AnimatedCard = ({ 
    icon, 
    title, 
    value, 
    color, 
    trend, 
    suffix = "", 
    decimals = 0,
    tabId,
    componentId,
    threshold = 1000 
  }) => {
    const theme = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);
    const { isComponentVisible } = useDashboardSettings();
    
    const visible = isComponentVisible(tabId, componentId);
    
    // Se o componente não estiver visível, não renderize nada
    if (!visible) {
      return null;
    }
    
    // Animações para o valor
    const { number } = useSpring({
      from: { number: 0 },
      to: { number: value || 0 },
      delay: 200,
      config: { 
        tension: 140,
        friction: 20,
        duration: 1500 
      }
    });
    
    // Animações para o card
    const cardAnimation = useSpring({
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0px)',
      boxShadow: isHovered 
        ? '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)' 
        : '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      config: { tension: 300, friction: 10 }
    });
    
    // Determinar cor do ícone de tendência
    const getTrendIcon = () => {
      if (trend?.direction === 'up') return <TrendingUpIcon fontSize="small" />;
      if (trend?.direction === 'down') return <TrendingDownIcon fontSize="small" />;
      return <TrendingFlatIcon fontSize="small" />;
    };
    
    // Determinar cor da tendência (verde para positivo, vermelho para negativo)
    const getTrendColor = () => {
      if (trend?.direction === 'up') return theme.palette.success.main;
      if (trend?.direction === 'down') return theme.palette.error.main;
      return theme.palette.grey[500];
    };
    
    // Cores dinâmicas com base no tema
    const baseColor = theme.palette[color]?.main || theme.palette.primary.main;
    const lightColor = alpha(baseColor, 0.12);
    const gradientColor = `linear-gradient(135deg, ${alpha(baseColor, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`;

    return (
      <animated.div
        style={cardAnimation}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          sx={{
            height: '100%',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${lightColor}`,
            background: gradientColor,
            p: { xs: 1, md: 1.5 },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '50%', 
            height: '100%',
            background: `radial-gradient(circle at top right, ${alpha(baseColor, 0.15)}, transparent 70%)`,
            zIndex: 0
          }} />
          
          <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 1, md: 1.5 }, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar
                sx={{ 
                  bgcolor: alpha(baseColor, 0.2),
                  color: baseColor,
                  width: 48,
                  height: 48
                }}
              >
                {icon}
              </Avatar>
              
              {trend && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: alpha(getTrendColor(), 0.1),
                    color: getTrendColor(),
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 10,
                    height: 'fit-content'
                  }}
                >
                  {getTrendIcon()}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold', 
                      fontSize: '0.75rem',
                      ml: 0.5
                    }}
                  >
                    {trend.value}%
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}>
                <VisibilityToggle 
                  tabId={tabId} 
                  componentId={componentId} 
                  visible={true} 
                />
              </Box>
            </Box>
            
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              color: baseColor,
              mb: 0.5
            }}>
              <animated.span>
                {number.to(num => {
                  // Formatar para números grandes
                  if (num > threshold && decimals === 0) {
                    if (num > 999999) {
                      return `${(num / 1000000).toFixed(1)}M${suffix}`;
                    }
                    if (num > 9999) {
                      return `${(num / 1000).toFixed(1)}K${suffix}`;
                    }
                    return `${Math.floor(num).toLocaleString()}${suffix}`;
                  }
                  return `${num.toFixed(decimals)}${suffix}`;
                })}
              </animated.span>
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {title}
            </Typography>
            
            {/* Barra de progresso na parte inferior */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: '100%', 
              height: 4,
              overflow: 'hidden',
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4
            }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  width: `${Math.min(Math.max((value / (value * 1.5)) * 100, 25), 95)}%`, 
                  bgcolor: baseColor 
                }} 
              />
            </Box>
          </CardContent>
        </Card>
      </animated.div>
    );
  };

  // Renderização adaptativa para telas móveis
  return (
    <Box sx={{ p: isMobile ? 1.5 : 2, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Cards de KPI Aprimorados */}
        <Grid item xs={6} sm={6} md={3}>
          <AnimatedCard
            icon={<TicketIcon />}
            title="Total de Conversas"
            value={totalTickets}
            color="primary"
            trend={ticketTrend}
            tabId="overviewTab"
            componentId="totalTicketsCard"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <AnimatedCard
            icon={<MessageIcon />}
            title="Total de Mensagens"
            value={totalMessages}
            color="secondary"
            trend={messageTrend}
            tabId="overviewTab"
            componentId="totalMessagesCard"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <AnimatedCard
            icon={<TimeIcon />}
            title="Tempo Médio de Resolução (min)"
            value={averageResolutionTime}
            decimals={1}
            color="info"
            trend={{
              ...timeTrend,
              direction: timeTrend.direction === 'up' ? 'down' : timeTrend.direction === 'down' ? 'up' : 'flat'
            }}
            tabId="overviewTab"
            componentId="timeAvgCard"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <AnimatedCard
            icon={<PersonAddIcon />}
            title="Novos Contatos"
            value={newContacts}
            color="warning"
            trend={contactsTrend}
            tabId="overviewTab"
            componentId="newContactsCard"
          />
        </Grid>

        {/* Gráfico de Atividade - Adaptativo para mobile */}
        <Grid item xs={12} md={8}>
          <ResponsiveChart
            title="Atividade Diária"
            height={isMobile ? 250 : 300}
            isEmpty={chartData.length === 0}
            tabId="overviewTab"
            componentId="dailyActivityChart"
          >
            {chartData.length > 0 ? (
              <AreaChart
                data={chartData}
                margin={{ 
                  top: 5, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 0 : 20,
                  bottom: 5 
                }}
              >
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickMargin={5}
                  interval={isMobile ? "preserveStartEnd" : 0}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  width={isMobile ? 25 : 35}
                  tickFormatter={(value) => isMobile && value > 999 ? `${(value/1000).toFixed(1)}k` : value}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: theme.palette.divider, strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: isMobile ? 10 : 12,
                    paddingTop: isMobile ? 5 : 10
                  }}
                  iconSize={isMobile ? 8 : 10}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  name="Conversas"
                  stroke={theme.palette.primary.main}
                  fillOpacity={1}
                  fill="url(#colorTickets)"
                  strokeWidth={2}
                  activeDot={{ r: isMobile ? 4 : 6 }}
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
                </Area>
                <Area
                  type="monotone"
                  dataKey="messages"
                  name="Mensagens"
                  stroke={theme.palette.secondary.main}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                  strokeWidth={2}
                  activeDot={{ r: isMobile ? 4 : 6 }}
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
                </Area>
              </AreaChart>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%'
              }}>
                <Typography variant="body2" color="textSecondary">
                  Nenhum dado disponível para o período selecionado
                </Typography>
              </Box>
            )}
          </ResponsiveChart>
        </Grid>

        {/* Gráfico de Status - Adaptativo para mobile */}
        <Grid item xs={12} md={4}>
          <ResponsiveChart
            title="Status das Conversas"
            height={isMobile ? 250 : 300}
            isEmpty={ticketStatusData.length === 0 || (ticketStatusData.length === 1 && ticketStatusData[0].name === 'Sem Dados')}
            tabId="overviewTab"
            componentId="ticketsStatusChart"
          >
            <PieChart>
              <Pie
                data={ticketStatusData}
                cx="50%"
                cy="50%"
                labelLine={!isMobile} // Remover linhas de label em mobile
                // Label customizado e adaptado para mobile
                label={({ name, value, percent }) => isMobile ? 
                  `${(percent * 100).toFixed(0)}% (${value})` : 
                  `${name}: ${(percent * 100).toFixed(0)}% (${value})`
                }
                outerRadius={isMobile ? 60 : 80}
                innerRadius={isMobile ? 30 : 40}
                paddingAngle={2}
                dataKey="value"
              >
                {ticketStatusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <RechartsTooltip
                content={<CustomTooltip />}
                formatter={(value, name, props) => [`${value} tickets`, name, props]}
              />
            </PieChart>
          </ResponsiveChart>
        </Grid>

        {/* Card de avaliação média */}
        <Grid item xs={12}>
          <ResponsiveChart
            title="Avaliação Média"
            height={isMobile ? 250 : 300}
            tabId="overviewTab"
            componentId="ratingCard"
          >
            <Card 
              sx={{ 
                boxShadow: theme.shadows[3],
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                background: `linear-gradient(145deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
                height: '100%',
                width: '100%'
              }}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3, pb: isMobile ? 2 : 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.warning.main, 0.15),
                      marginRight: 2
                    }}>
                      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant={isMobile ? "body1" : "h6"} 
                        sx={{ fontWeight: 'medium', lineHeight: 1.2 }}
                      >
                        Avaliação Média
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Baseado em {ticketsByStatus.reduce((acc, curr) => acc + (curr.count || 0), 0)} tickets
                      </Typography>
                    </Box>
                  </Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 1, 
                      px: 2,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                    }}
                  >
                    <Typography 
                      variant={isMobile ? "h4" : "h3"} 
                      color="warning.main"
                      fontWeight="bold"
                      sx={{ mr: 1 }}
                    >
                      {averageRating.toFixed(1) || "0.0"}
                    </Typography>
                    <StarIcon sx={{ color: theme.palette.warning.main, fontSize: isMobile ? 28 : 36 }} />
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  mt: 2,
                  mb: 1
                }}>
                  <Box sx={{ flex: 1, mr: 1, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2, position: 'relative', height: 10 }}>
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        bgcolor: theme.palette.warning.main,
                        borderRadius: 2,
                        width: `${(averageRating / 5) * 100}%`,
                        transition: 'width 1s ease-in-out'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                    5.0
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
                  {[1, 2, 3, 4, 5].map(rating => {
                    // Gerar valores de exemplo para a distribuição
                    const ratingData = {
                      1: { count: 12, percent: 2 },
                      2: { count: 34, percent: 6 },
                      3: { count: 87, percent: 15 },
                      4: { count: 243, percent: 42 },
                      5: { count: 205, percent: 35 }
                    };
                    
                    const data = ratingData[rating];
                    
                    return (
                      <Box key={rating} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${100/5}%` }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                          {rating}★
                        </Typography>
                        <Box sx={{ 
                          height: 40, 
                          width: 8, 
                          my: 1,
                          bgcolor: alpha(theme.palette.warning.main, 0.2),
                          borderRadius: 4,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: `${data.percent}%`,
                            bgcolor: theme.palette.warning.main,
                            borderRadius: 4
                          }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {data.count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </ResponsiveChart>
        </Grid>
      </Grid>
      
      {/* Guia de gestos para dispositivos touch */}
      {isMobile && touchEnabled && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 72, 
            left: '50%', 
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
            p: 1,
            px: 2,
            borderRadius: 5,
            boxShadow: theme.shadows[2],
            zIndex: 10
          }}
        >
          <TouchIcon fontSize="small" color="primary" />
          <Typography variant="caption" color="textSecondary">
            Toque para interagir com os gráficos
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OverviewTab;