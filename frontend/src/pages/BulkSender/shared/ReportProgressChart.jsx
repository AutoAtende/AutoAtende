import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";

// Material UI
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    useMediaQuery,
} from '@mui/material';

// Charts
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

// Componente estilizado
const ChartContainer = styled(Box)(({ theme }) => ({
    height: 350,
    marginTop: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const CHART_TYPES = {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
};

const ReportProgressChart = ({
    title,
    data = [],
    loading = false,
    type = CHART_TYPES.LINE,
    dataKeys = [],
    colors = [],
    allowChangeType = true,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [chartType, setChartType] = useState(type);

    // Usar cores do tema se não forem fornecidas
    const chartColors = colors.length > 0
        ? colors
        : [
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.info.main,
            theme.palette.error.main,
        ];

    // Acompanhar mudanças no tipo passado por props
    useEffect(() => {
        setChartType(type);
    }, [type]);

    // Handler para mudança de tipo de gráfico
    const handleChangeChartType = (event) => {
        setChartType(event.target.value);
    };

    // Renderizar gráfico com base no tipo
    const renderChart = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!data || data.length === 0) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="textSecondary">
                        {i18n.t("reports.noData")}
                    </Typography>
                </Box>
            );
        }

        switch (chartType) {
            case CHART_TYPES.BAR:
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            barSize={isMobile ? 10 : 20}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                style={{ fontSize: '0.75rem' }}
                                tick={{ fill: theme.palette.text.secondary }}
                            />
                            <YAxis
                                style={{ fontSize: '0.75rem' }}
                                tick={{ fill: theme.palette.text.secondary }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 4,
                                }}
                            />
                            <Legend />
                            {dataKeys.map((key, index) => (
                                <Bar
                                    key={key.dataKey}
                                    dataKey={key.dataKey}
                                    name={key.name || key.dataKey}
                                    fill={chartColors[index % chartColors.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case CHART_TYPES.PIE:
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={isMobile ? 70 : 100}
                                    innerRadius={isMobile ? 30 : 40}
                                    label={({ name, value, percent }) => {
                                        // Exibir label apenas para valores maiores que 0
                                        if (percent * 100 < 1) return null;
                                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                                    }}
                                    dataKey={dataKeys[0]?.dataKey || 'value'}
                                    nameKey="name"
                                >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 4,
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case CHART_TYPES.LINE:
            default:
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                style={{ fontSize: '0.75rem' }}
                                tick={{ fill: theme.palette.text.secondary }}
                            />
                            <YAxis
                                style={{ fontSize: '0.75rem' }}
                                tick={{ fill: theme.palette.text.secondary }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 4,
                                }}
                            />
                            <Legend />
                            {dataKeys.map((key, index) => (
                                <Line
                                    key={key.dataKey}
                                    type="monotone"
                                    dataKey={key.dataKey}
                                    name={key.name || key.dataKey}
                                    stroke={chartColors[index % chartColors.length]}
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <StyledCard variant="outlined">
            <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                        {title}
                    </Typography>

                    {allowChangeType && (
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="chart-type-label">
                                {i18n.t("reports.chartType")}
                            </InputLabel>
                            <Select
                                labelId="chart-type-label"
                                id="chart-type"
                                value={chartType}
                                onChange={handleChangeChartType}
                                label={i18n.t("reports.chartType")}
                            >
                                <MenuItem value={CHART_TYPES.LINE}>{i18n.t("reports.chartTypes.line")}</MenuItem>
                                <MenuItem value={CHART_TYPES.BAR}>{i18n.t("reports.chartTypes.bar")}</MenuItem>
                                <MenuItem value={CHART_TYPES.PIE}>{i18n.t("reports.chartTypes.pie")}</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </Box>

                <ChartContainer>
                    {renderChart()}
                </ChartContainer>
            </CardContent>
        </StyledCard>
    );
};

export default ReportProgressChart;