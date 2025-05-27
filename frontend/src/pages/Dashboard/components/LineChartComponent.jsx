import React from 'react';
import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 1.5,
          border: '1px solid #ccc',
          borderRadius: 1,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={`item-${index}`}
            variant="body2"
            sx={{ color: entry.color, display: 'flex', alignItems: 'center', mb: 0.5 }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 10,
                height: 10,
                backgroundColor: entry.color,
                marginRight: 1,
                borderRadius: '50%',
              }}
            />
            {entry.name}: {entry.value.toLocaleString()}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const LineChartComponent = ({ data, dataKeys = [], xAxisKey = 'mes', height = 300 }) => {
  // Definir cores para as linhas
  const colors = ['#1976d2', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0'];

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key.dataKey}
              type="monotone"
              dataKey={key.dataKey}
              name={key.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartComponent;
