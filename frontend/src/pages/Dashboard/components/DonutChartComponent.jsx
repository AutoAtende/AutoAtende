import React, { useEffect, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Label } from 'recharts';

// Styled Components
const ChartContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  gap: theme.spacing(4),
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 320,
  },
}));

const ChartWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 240,
  [theme.breakpoints.up('sm')]: {
    width: '60%',
    height: '100%',
  },
}));

const LegendContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: '35%',
    gridTemplateColumns: '1fr',
  },
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

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  payload,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${payload.percentage}%`}
    </text>
  );
};

const DonutChartComponent = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (data && data.length > 0) {
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
      setChartData([]);
    }
  }, [data]);

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

  if (chartData.length === 0) {
    return (
      <ChartContainer>
        <Typography variant="body1" color="text.secondary">
          Nenhum dado disponível
        </Typography>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 60 : 80}
              outerRadius={isMobile ? 85 : 100}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              animationDuration={1000}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="none"
                />
              ))}
              <Label
                value="Total"
                position="center"
                style={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  fill: 'text.secondary',
                }}
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <LegendContainer>
        {chartData.map((entry, index) => (
          <LegendItem key={`legend-${index}`}>
            <LegendColor bgcolor={entry.color} />
            <Box>
              <Typography variant="body2">{entry.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {entry.value} mensagens
              </Typography>
            </Box>
          </LegendItem>
        ))}
      </LegendContainer>
    </ChartContainer>
  );
};

export default DonutChartComponent;