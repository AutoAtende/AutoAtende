import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// Styled Components
const ChartContainer = styled(Box)(({ theme }) => ({
  height: 240,
  width: '100%',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LegendContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 20,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.25),
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
}));

const LegendColor = styled(Box)(({ theme, bgcolor }) => ({
  width: 15,
  height: 15,
  borderRadius: 3,
  backgroundColor: bgcolor,
  marginRight: theme.spacing(1),
}));

// Cores para o gráfico
const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

const DonutChartComponent = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    // Processar dados ou usar dados de exemplo
    if (data && data.length > 0) {
      // Calcular percentuais
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const processedData = data.map((item, index) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        percentage: Math.round((item.value / total) * 100),
        color: COLORS[index % COLORS.length]
      }));
      setChartData(processedData);
    } else {
      // Dados de exemplo
      setChartData([
        { id: 1, name: 'João', value: 32, percentage: 32, color: COLORS[0] },
        { id: 2, name: 'Maria', value: 28, percentage: 28, color: COLORS[1] },
        { id: 3, name: 'Pedro', value: 18, percentage: 18, color: COLORS[2] },
        { id: 4, name: 'Ana', value: 12, percentage: 12, color: COLORS[3] },
        { id: 5, name: 'Outros', value: 10, percentage: 10, color: COLORS[4] },
      ]);
    }
  }, [data]);

  // Componente customizado para o tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 1, 
          boxShadow: 1,
          borderRadius: 1 
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.value} mensagens ({data.percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="40%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <LegendContainer>
        {chartData.map((entry, index) => (
          <LegendItem key={`legend-${index}`}>
            <LegendColor bgcolor={entry.color} />
            {entry.name} ({entry.percentage}%)
          </LegendItem>
        ))}
      </LegendContainer>
    </ChartContainer>
  );
};

export default DonutChartComponent;