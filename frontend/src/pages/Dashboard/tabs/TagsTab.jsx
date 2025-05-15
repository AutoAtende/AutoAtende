// src/pages/Dashboard/tabs/TagsTab.jsx
import React, { useMemo } from "react";
import {
  Grid,
  Box,
  Typography,
  Chip,
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
  LabelList
} from "recharts";

// Componentes otimizados para mobile
import ResponsiveChart from '../components/ResponsiveChart';
import ResponsiveTable from '../components/ResponsiveTable';
import useResponsive from '../hooks/useResponsive';

const TagsTab = ({ data = {}, touchEnabled = false }) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  
  // Validação inicial dos dados
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Nenhum dado disponível para exibição
        </Typography>
      </Box>
    );
  }

  // Função para garantir que arrays sejam sempre arrays
  const safeArray = (array) => Array.isArray(array) ? array : [];

  // Dados otimizados para visualização mobile
  const chartData = useMemo(() => {
    // Valores padrão para dados ausentes
    const defaultData = {
      mostUsedTags: [],
      tagsByTicketStatus: [],
      tagResolutionTimes: []
    };

    const {
      mostUsedTags = [],
      tagsByTicketStatus = [],
      tagResolutionTimes = []
    } = data || defaultData;

    // Formatar dados para os gráficos com adaptações para mobile
    const processedMostUsedTags = safeArray(mostUsedTags)
      .map(tag => ({
        name: isMobile && tag?.tagName?.length > 12 
          ? tag.tagName.substring(0, 10) + '...' 
          : tag?.tagName || "Sem nome",
        fullName: tag?.tagName || "Sem nome",
        count: tag?.count || 0,
        color: tag?.tagColor || theme.palette.grey[500]
      }))
      .sort((a, b) => b.count - a.count);

    // Dados para o gráfico de tags por status
    const tagsByStatus = safeArray(tagsByTicketStatus).reduce((acc, curr) => {
      const tagName = curr?.tagName || "Sem nome";
      const status = curr?.status || "unknown";
      const count = curr?.count || 0;
      
      if (!acc[tagName]) {
        acc[tagName] = {
          name: isMobile && tagName.length > 12 
            ? tagName.substring(0, 10) + '...' 
            : tagName,
          fullName: tagName,
          color: curr?.tagColor || theme.palette.grey[500],
          total: 0
        };
      }
      
      acc[tagName][status] = count;
      acc[tagName].total += count;
      
      return acc;
    }, {});

    const tagsByStatusData = Object.values(tagsByStatus)
      .sort((a, b) => b.total - a.total)
      .slice(0, isMobile ? 5 : 10);

    // Dados para o gráfico de tempo de resolução por tag
    const processedResolutionTimes = safeArray(tagResolutionTimes)
      .map(tag => ({
        name: isMobile && tag?.tagName?.length > 12 
          ? tag.tagName.substring(0, 10) + '...' 
          : tag?.tagName || "Sem nome",
        fullName: tag?.tagName || "Sem nome",
        avgTime: parseFloat(tag?.avgResolutionTime || 0).toFixed(1),
        color: tag?.tagColor || theme.palette.grey[500]
      }))
      .sort((a, b) => b.avgTime - a.avgTime);

    // Dados detalhados para tabela
    const detailedTagsData = processedMostUsedTags.slice(0, 15).map(tag => {
      const timeData = processedResolutionTimes.find(t => t.fullName === tag.fullName);
      const statusData = tagsByStatusData.find(s => s.fullName === tag.fullName);
      
      // Determinar status predominante
      let predominantStatus = "N/A";
      let maxCount = 0;
      
      if (statusData) {
        const statuses = ["pending", "open", "processing", "closed"];
        statuses.forEach(status => {
          if (statusData[status] && statusData[status] > maxCount) {
            maxCount = statusData[status];
            predominantStatus = status;
          }
        });
      }
      
      return {
        name: tag.name,
        fullName: tag.fullName,
        count: tag.count,
        avgTime: timeData ? timeData.avgTime : 'N/A',
        status: predominantStatus,
        color: tag.color
      };
    });

    return {
      mostUsedTags: processedMostUsedTags,
      tagsByStatusData,
      tagResolutionTimes: processedResolutionTimes,
      detailedTagsData
    };
  }, [data, isMobile, theme.palette.grey]);

  // Customização para tooltip da recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

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
        {payload.map((entry, index) => {
          if (!entry || ['name', 'fullName', 'color', 'total'].includes(entry.dataKey)) {
            return null;
          }

          const statusMap = {
            pending: "Pendente",
            open: "Aberto",
            processing: "Em Atendimento",
            closed: "Resolvido"
          };
          
          const displayName = statusMap[entry.dataKey] || entry.name;
          const color = entry.dataKey === 'avgTime' ? entry.color : 
                         entry.color || (
                           entry.dataKey === 'pending' ? theme.palette.warning.main :
                           entry.dataKey === 'open' ? theme.palette.info.main :
                           entry.dataKey === 'processing' ? theme.palette.secondary.main :
                           entry.dataKey === 'closed' ? theme.palette.success.main :
                           theme.palette.grey[500]
                         );
          
          return (
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
                  backgroundColor: color,
                  mr: 1
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'medium' 
                }}
              >
                {`${displayName}: ${entry.value}`}
              </Typography>
            </Box>
          );
        })}
      </Paper>
    );
  };

  // Colunas para a tabela de tags
  const tagsColumns = [
    { 
      field: 'name', 
      headerName: 'Tag', 
      minWidth: 150,
      renderCell: (value, row) => (
        <Chip 
          label={row?.fullName || 'N/A'} 
          size="small"
          sx={{ 
            bgcolor: row?.color || theme.palette.grey[500],
            color: '#fff',
            fontWeight: 'bold'
          }}
        />
      )
    },
    { 
      field: 'count', 
      headerName: 'Conversas', 
      align: 'right',
      minWidth: 80,
      renderCell: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value || 0}
        </Typography>
      )
    },
    { 
      field: 'avgTime', 
      headerName: 'Tempo Médio', 
      align: 'right',
      minWidth: 120,
      renderCell: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value !== 'N/A' ? `${value} min` : 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status Predominante', 
      align: 'center',
      minWidth: 150,
      renderCell: (value) => {
        const statusMap = {
          pending: { label: "Pendente", color: theme.palette.warning.main },
          open: { label: "Aberto", color: theme.palette.info.main },
          processing: { label: "Em Atendimento", color: theme.palette.secondary.main },
          closed: { label: "Resolvido", color: theme.palette.success.main }
        };
        
        return (
          value !== "N/A" ? (
            <Chip 
              label={statusMap[value]?.label || value} 
              size="small"
              sx={{ 
                bgcolor: statusMap[value]?.color || theme.palette.grey[500],
                color: '#fff',
                fontWeight: 'medium'
              }}
            />
          ) : (
            <Typography variant="body2" color="textSecondary">
              N/A
            </Typography>
          )
        );
      }
    }
  ];

  // Renderização para versão mobile
  const renderTagMobileCard = (row, index, isExpanded) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Chip 
        label={row?.fullName || 'N/A'} 
        size="small"
        sx={{ 
          bgcolor: row?.color || theme.palette.grey[500],
          color: '#fff',
          fontWeight: 'bold'
        }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          {row?.count || 0} tickets
        </Typography>
        
        {row?.status !== "N/A" && (
          <Chip 
            label={
              row.status === 'pending' ? 'Pendente' :
              row.status === 'open' ? 'Aberto' :
              row.status === 'processing' ? 'Em Atend.' :
              row.status === 'closed' ? 'Resolvido' : row.status
            }
            size="small"
            sx={{ 
              bgcolor: 
                row.status === 'pending' ? theme.palette.warning.main :
                row.status === 'open' ? theme.palette.info.main :
                row.status === 'processing' ? theme.palette.secondary.main :
                row.status === 'closed' ? theme.palette.success.main :
                theme.palette.grey[500],
              color: '#fff',
              fontWeight: 'medium',
              height: 20,
              '& .MuiChip-label': {
                fontSize: '0.65rem',
                px: 1
              }
            }}
          />
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1.5 : 2, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Tags Mais Utilizadas"
            height={isMobile ? 250 : 300}
            tabId="tagsTab"
            componentId="mostUsedTagsChart"
          >
            <BarChart
              data={chartData.mostUsedTags.slice(0, isMobile ? 5 : 10)}
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
                {chartData.mostUsedTags.slice(0, isMobile ? 5 : 10).map((entry, index) => (
                  <Cell key={`most-used-cell-${index}`} fill={entry?.color || theme.palette.grey[500]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveChart
            title="Tempo Médio de Resolução por Tag"
            height={isMobile ? 250 : 300}
            tabId="tagsTab"
            componentId="resolutionTimeTagsChart"
          >
            <BarChart
              data={chartData.tagResolutionTimes.slice(0, isMobile ? 5 : 10)}
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
                radius={[0, 4, 4, 0]}
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
                {chartData.tagResolutionTimes.slice(0, isMobile ? 5 : 10).map((entry, index) => (
                  <Cell key={`resolution-cell-${index}`} fill={entry?.color || theme.palette.grey[500]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12}>
          <ResponsiveChart
            title="Tags por Status de Ticket"
            height={isMobile ? 300 : 400}
            tabId="tagsTab"
            componentId="tagsStatusChart"
          >
            <BarChart
              data={chartData.tagsByStatusData}
              margin={{ 
                top: 20, 
                right: isMobile ? 10 : 30, 
                left: isMobile ? 5 : 20, 
                bottom: isMobile ? 70 : 5
              }}
            >
              <XAxis 
                dataKey="name"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 70 : 30}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 25 : 35}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign={isMobile ? "bottom" : "top"}
                height={50}
                wrapperStyle={{ 
                  fontSize: isMobile ? 10 : 12,
                  paddingTop: isMobile ? 20 : 0
                }}
              />
              <Bar 
                dataKey="pending" 
                name="Pendente" 
                stackId="a" 
                fill={theme.palette.warning.main} 
              >
                <LabelList 
                  dataKey="pending" 
                  position="inside" 
                  formatter={(value) => value > 0 ? value : ''}
                  style={{
                    fill: '#fff',
                    fontSize: isMobile ? 9 : 11,
                    fontWeight: 'bold'
                  }}
                />
              </Bar>
              <Bar 
                dataKey="open" 
                name="Aberto" 
                stackId="a" 
                fill={theme.palette.info.main} 
              >
                <LabelList 
                  dataKey="open" 
                  position="inside" 
                  formatter={(value) => value > 0 ? value : ''}
                  style={{
                    fill: '#fff',
                    fontSize: isMobile ? 9 : 11,
                    fontWeight: 'bold'
                  }}
                />
              </Bar>
              <Bar 
                dataKey="processing" 
                name="Em Atendimento" 
                stackId="a" 
                fill={theme.palette.secondary.main} 
              >
                <LabelList 
                  dataKey="processing" 
                  position="inside" 
                  formatter={(value) => value > 0 ? value : ''}
                  style={{
                    fill: '#fff',
                    fontSize: isMobile ? 9 : 11,
                    fontWeight: 'bold'
                  }}
                />
              </Bar>
              <Bar 
                dataKey="closed" 
                name="Resolvido" 
                stackId="a" 
                fill={theme.palette.success.main} 
              >
                <LabelList 
                  dataKey="closed" 
                  position="inside" 
                  formatter={(value) => value > 0 ? value : ''}
                  style={{
                    fill: '#fff',
                    fontSize: isMobile ? 9 : 11,
                    fontWeight: 'bold'
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveChart>
        </Grid>

        <Grid item xs={12}>
          <ResponsiveTable
            title="Detalhamento das Tags"
            columns={tagsColumns}
            data={chartData.detailedTagsData}
            mobileCardComponent={renderTagMobileCard}
            sx={{ height: 'auto' }}
            tabId="tagsTab"
            componentId="tagsDetailTable"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TagsTab;