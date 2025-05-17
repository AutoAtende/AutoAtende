import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Styled Components
const ChartContainer = styled(Box)(({ theme }) => ({
  height: 240,
  width: '100%',
  position: 'relative',
}));

const BarChartComponent = ({ data }) => {
  // Processar dados para o formato esperado pelo Recharts
  const chartData = data.map(item => ({
    date: item.date.split('-')[2] + '/' + item.date.split('-')[1], // Formatar data como DD/MM
    count: item.count
  }));

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#555' }}
          />
          <YAxis 
            hide 
            domain={[0, 'dataMax + 20']}
          />
          <Tooltip 
            formatter={(value) => [`${value} mensagens`, 'Quantidade']}
            labelFormatter={(value) => `Data: ${value}`}
            contentStyle={{
              borderRadius: 4,
              border: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              padding: 10,
            }}
          />
          <Bar 
            dataKey="count" 
            fill="#1976d2" 
            radius={[3, 3, 0, 0]}
            barSize={30}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default BarChartComponent;