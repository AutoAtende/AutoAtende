// src/pages/Dashboard/tabs/QueuesTab.jsx
import React, { useState, useMemo } from "react";
import {
  Grid,
  Box,
  Typography,
  Chip,
  Rating,
  LinearProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText
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

// Componentes otimizados para mobile
import ResponsiveChart from '../components/ResponsiveChart';
import ResponsiveTable from '../components/ResponsiveTable';
import useResponsive from '../hooks/useResponsive';

const QueuesTab = ({ data, touchEnabled = false }) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  
  if (!data) {
    return null;
  }

  // Dados otimizados para visualização mobile
  const chartData = useMemo(() => {
    // Formatar dados para os gráficos com adaptações para mobile
    const ticketsByQueue = data.ticketsByQueue.map(queue => ({
      name: isMobile && queue.queueName.length > 15 
        ? queue.queueName.substring(0, 12) + '...' 
        : queue.queueName || "Sem fila",
      fullName: queue.queueName || "Sem fila",
      count: queue.count,
      color: queue.queueColor || theme.palette.grey[500]
    }));

    const queueWaitTimes = data.queueWaitTimes.map(queue => ({
      name: isMobile && queue.queueName.length > 15 
        ? queue.queueName.substring(0, 12) + '...' 
        : queue.queueName || "Sem fila",
      fullName: queue.queueName || "Sem fila",
      waitTime: parseFloat(queue.avgWaitTime || 0).toFixed(1),
      color: queue.queueColor || theme.palette.grey[500]
    })).sort((a, b) => b.waitTime - a.waitTime);

    const queueResolutionTimes = data.queueResolutionTimes.map(queue => ({
      name: isMobile && queue.queueName.length > 15 
        ? queue.queueName.substring(0, 12) + '...' 
        : queue.queueName || "Sem fila",
      fullName: queue.queueName || "Sem fila",
      resolutionTime: parseFloat(queue.avgResolutionTime || 0).toFixed(1),
      color: queue.queueColor || theme.palette.grey[500]
    })).sort((a, b) => b.resolutionTime - a.resolutionTime);

    const queueRatings = data.queueRatings.map(queue => ({
      name: isMobile && queue.queueName.length > 15 
        ? queue.queueName.substring(0, 12) + '...' 
        : queue.queueName || "Sem fila",
      fullName: queue.queueName || "Sem fila",
      rating: parseFloat(queue.avgRate || 0).toFixed(1),
      count: queue.count,
      color: queue.queueColor || theme.palette.grey[500]
    })).sort((a, b) => b.rating - a.rating);

    // Dados para gráfico radar de performance de filas
    const topQueuesForRadar = ticketsByQueue
      .sort((a, b) => b.count - a.count)
      .slice(0, isMobile ? 3 : 5)
      .map(queue => {
        const waitTimeData = queueWaitTimes.find(q => q.fullName === queue.fullName);
        const resolutionTimeData = queueResolutionTimes.find(q => q.fullName === queue.fullName);
        const ratingData = queueRatings.find(q => q.fullName === queue.fullName);
        
        return {
          name: queue.name,
          fullName: queue.fullName,
          tickets: queue.count,
          waitTime: waitTimeData ? parseFloat(waitTimeData.waitTime) : 0,
          resolutionTime: resolutionTimeData ? parseFloat(resolutionTimeData.resolutionTime) : 0,
          rating: ratingData ? parseFloat(ratingData.rating) : 0,
          color: queue.color
        };
      });

    // Normalizar os dados para o radar chart (escala de 0-100)
    const maxTickets = Math.max(...topQueuesForRadar.map(q => q.tickets), 1);
    const maxWaitTime = Math.max(...topQueuesForRadar.map(q => q.waitTime), 1);
    const maxResolutionTime = Math.max(...topQueuesForRadar.map(q => q.resolutionTime), 1);
    
    const normalizedRadarData = topQueuesForRadar.map(queue => ({
      name: queue.name,
      fullName: queue.fullName,
      // Inverter a escala para métricas onde menor é melhor
      'Velocidade de Atendimento': 100 - ((queue.waitTime / maxWaitTime) * 100) || 0,
      'Velocidade de Resolução': 100 - ((queue.resolutionTime / maxResolutionTime) * 100) || 0,
      'Volume de Conversas': (queue.tickets / maxTickets) * 100 || 0,
      'Satisfação': (queue.rating / 5) * 100 || 0,
      color: queue.color
    }));

    return {
      ticketsByQueue,
      queueWaitTimes,
      queueResolutionTimes,
      queueRatings,
      normalizedRadarData
    };
  }, [data, isMobile, theme.palette.grey]);

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

  // Radar Chart Tooltip customizado
  const RadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      // Encontrar o nome da fila a partir do payload
      const queueName = payload[0]?.payload?.fullName || '';
      
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 1.5, 
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            maxWidth: 300
          }}
        >
          <Typography variant="subtitle2" color="text.primary" gutterBottom>
            {queueName}
          </Typography>
          
          {payload.map((entry, index) => {
            // Ignorar o campo 'name' e 'fullName'
            if (entry.dataKey === 'name' || entry.dataKey === 'fullName' || entry.dataKey === 'color') {
              return null;
            }
            
            let value = entry.value;
            let suffix = '%';
            
            // Converter métricas para formato mais amigável
            if (entry.dataKey === 'Velocidade de Atendimento' || entry.dataKey === 'Velocidade de Resolução') {
              suffix = '% (maior é melhor)';
            }
            
            return (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5
                }}
              >
                <Box
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: entry.stroke,
                    mr: 1
                  }}
                />
                <Typography variant="body2" color="text.primary">
                  {`${entry.dataKey}: ${Math.round(value)}${suffix}`}
                </Typography>
              </Box>
            );
          })}
        </Paper>
      );
    }
    
    return null;
  };

  // Colunas para a tabela de avaliações
  const ratingColumns = [
    { 
      field: 'name', 
      headerName: 'Fila', 
      minWidth: 150,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: row.color,
              mr: 1
            }}
          />
          <Typography variant="body2" fontWeight="medium">
            {row.fullName}
          </Typography>
        </Box>
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
            value={parseFloat(value)} 
            precision={0.5} 
            readOnly 
            size="small" 
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({value})
          </Typography>
        </Box>
      )
    },
    { 
      field: 'count', 
      headerName: 'Qtd. Avaliações', 
      align: 'right',
      renderCell: (value, row) => (
        <Chip 
          label={value} 
          size="small"
          sx={{ 
            bgcolor: row.color,
            color: '#fff',
            fontWeight: 'bold'
          }}
        />
      )
    }
  ];

  // Renderização para versão mobile
  const renderQueueRatingMobileCard = (row, index, isExpanded) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: row.color,
            mr: 1.5
          }}
        />
        <Typography variant="body1" fontWeight="medium">
          {row.fullName}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Rating 
          value={parseFloat(row.rating)} 
          precision={0.5} 
          readOnly 
          size="small" 
        />
        <Chip 
          label={row.count} 
          size="small"
          sx={{ 
            ml: 1,
            bgcolor: row.color,
            color: '#fff',
            fontWeight: 'bold',
            minWidth: 40
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1.5 : 2, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Conversas por Fila"
            height={isMobile ? 250 : 300}
            tabId="queuesTab"
            componentId="ticketsQueueChart"
          >
            <BarChart
              data={chartData.ticketsByQueue.sort((a, b) => b.count - a.count)}
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
                dataKey="count" 
                name="Conversas" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  formatter={(value) => value}
                  style={{
                    fill: theme.palette.text.secondary,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 'medium'
                  }}
                />
                {chartData.ticketsByQueue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Tempo Médio de Espera por Fila"
            height={isMobile ? 250 : 300}
            tabId="queuesTab"
            componentId="waitTimeChart"
          >
            <BarChart
              data={chartData.queueWaitTimes}
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
                dataKey="waitTime" 
                name="Tempo de Espera" 
                radius={[0, 4, 4, 0]}
              >
                <LabelList 
                  dataKey="waitTime" 
                  position="right" 
                  formatter={(value) => value}
                  style={{
                    fill: theme.palette.text.secondary,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 'medium'
                  }}
                />
                {chartData.queueWaitTimes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Tempo Médio de Resolução por Fila"
            height={isMobile ? 250 : 300}
            tabId="queuesTab"
            componentId="queueResolutionTimeChart"
          >
            <BarChart
              data={chartData.queueResolutionTimes}
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
                dataKey="resolutionTime" 
                name="Tempo de Resolução" 
                radius={[0, 4, 4, 0]}
              >
                <LabelList 
                  dataKey="resolutionTime" 
                  position="right" 
                  formatter={(value) => value}
                  style={{
                    fill: theme.palette.text.secondary,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 'medium'
                  }}
                />
                {chartData.queueResolutionTimes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveTable
            title="Avaliação Média por Fila"
            columns={ratingColumns}
            data={chartData.queueRatings}
            mobileCardComponent={renderQueueRatingMobileCard}
            sx={{ height: isMobile ? 250 : 300 }}
            tabId="queuesTab"
            componentId="queueRatingsTable"
          />
        </Grid>

        <Grid item xs={12}>
          <ResponsiveChart
            title="Análise Comparativa de Filas"
            height={isMobile ? 300 : 400}
            tabId="queuesTab"
            componentId="queueAnalysisChart"
          >
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="80%" 
              data={chartData.normalizedRadarData}
            >
              <PolarGrid 
                gridType={isMobile ? "circle" : "polygon"}
                stroke={alpha(theme.palette.text.secondary, 0.3)}
              />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fontSize: isMobile ? 10 : 12, fill: theme.palette.text.primary }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickCount={5}
              />
              
              {/* Renderiza apenas algumas métricas mais importantes em dispositivos móveis */}
              {(isMobile ? [
                'Velocidade de Atendimento',
                'Satisfação'
              ] : [
                'Velocidade de Atendimento',
                'Velocidade de Resolução',
                'Volume de Conversas',
                'Satisfação'
              ]).map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={theme.palette[['primary', 'secondary', 'success', 'warning'][index % 4]].main}
                  fill={theme.palette[['primary', 'secondary', 'success', 'warning'][index % 4]].main}
                  fillOpacity={0.6}
                >
                  <LabelList 
                    dataKey={key} 
                    position="top" 
                    formatter={(value) => `${Math.round(value)}%`}
                    style={{
                      fill: theme.palette.text.primary,
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 'medium'
                    }}
                  />
                </Radar>
              ))}
              
              <Legend 
                wrapperStyle={{ 
                  fontSize: isMobile ? 10 : 12,
                  bottom: -10
                }}
                iconSize={isMobile ? 8 : 10}
              />
              <RechartsTooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveChart>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QueuesTab;