import React, { useEffect, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell, Tooltip } from 'recharts';

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

const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {`${value} mensagens`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const DonutChartComponent = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (data && data.length > 0) {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const processedData = data.map((item, index) => ({
        ...item,
        percentage: Math.round((item.value / total) * 100),
        color: COLORS[index % COLORS.length]
      }));
      setChartData(processedData);
    } else {
      setChartData([]);
    }
  }, [data]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 60 : 80}
              outerRadius={isMobile ? 85 : 100}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              label={renderCustomizedLabel}
              labelLine={false}
              onMouseEnter={onPieEnter}
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
      </ChartWrapper>

      <LegendContainer>
        {chartData.map((entry, index) => (
          <LegendItem key={`legend-${index}`}>
            <LegendColor bgcolor={entry.color} />
            <Box>
              <Typography variant="body2">{entry.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {entry.value} mensagens ({entry.percentage}%)
              </Typography>
            </Box>
          </LegendItem>
        ))}
      </LegendContainer>
    </ChartContainer>
  );
};

export default DonutChartComponent;