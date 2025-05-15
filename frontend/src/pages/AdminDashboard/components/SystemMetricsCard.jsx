import React from 'react';
import { useSpring, animated, config } from 'react-spring';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  LinearProgress,
  Tooltip,
  IconButton,
  useMediaQuery
} from '@mui/material';
import {
  Memory,
  Storage,
  Speed,
  InfoOutlined,
  Warning
} from '@mui/icons-material';

const AnimatedProgress = ({ value, color }) => {
  const props = useSpring({
    from: { width: 0 },
    to: { width: value },
    config: config.molasses
  });

  return (
    <animated.div
      style={{
        ...props,
        backgroundColor: color,
        height: 8,
        borderRadius: 4
      }}
    />
  );
};

const MetricProgressBar = ({ title, value, maxValue, icon: Icon, color, unit = '%', warning = 90 }) => {
  const theme = useTheme();
  const percentage = (value / maxValue) * 100;

  const animatedValue = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: config.molasses
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Icon sx={{ color: theme.palette[color].main, mr: 1 }} />
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        {percentage > warning && (
          <Tooltip title="Alto uso de recursos">
            <Warning sx={{ ml: 1, color: theme.palette.warning.main }} />
          </Tooltip>
        )}
      </Box>
      
      <Box display="flex" alignItems="center" mb={0.5}>
        <Box sx={{ flexGrow: 1, mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: theme.palette[color].main
              }
            }}
          />
        </Box>
        <Box minWidth={50}>
          <Typography variant="body2" color="textSecondary">
            <animated.span>
              {animatedValue.number.to(n => `${n.toFixed(1)}${unit}`)}
            </animated.span>
          </Typography>
        </Box>
      </Box>

      <Typography variant="caption" color="textSecondary">
        {`${maxValue}${unit} total`}
      </Typography>
    </Box>
  );
};

const SystemMetricsCard = ({ metrics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!metrics) return null;

  const { cpu, memory } = metrics;
  const memoryTotal = Math.round(memory.total / (1024 * 1024 * 1024)); // Convert to GB
  const memoryUsed = Math.round(memory.used / (1024 * 1024 * 1024));

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Métricas do Sistema
          </Typography>
          <Tooltip title="Monitoramento em tempo real dos recursos do sistema">
            <IconButton size="small">
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MetricProgressBar
              title="CPU"
              value={cpu.usage}
              maxValue={100}
              icon={Memory}
              color="primary"
              warning={85}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: -2, mb: 2 }}>
              {`${cpu.cores} cores - ${cpu.model}`}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricProgressBar
              title="Memória"
              value={memoryUsed}
              maxValue={memoryTotal}
              icon={Storage}
              color="secondary"
              unit="GB"
              warning={90}
            />
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Speed sx={{ color: theme.palette.success.main }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Status do Sistema
                </Typography>
                <Typography variant="body1" color="success.main">
                  Operando Normalmente
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SystemMetricsCard;