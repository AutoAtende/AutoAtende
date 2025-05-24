import React, { memo, useMemo } from 'react';
import { Position } from '@xyflow/react';
import { 
  Box, 
  Typography,
  Chip,
  Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  HourglassEmpty as InactivityIcon,
  Notifications as NotificationIcon,
  Stop as StopIcon,
  PersonAdd as TransferIcon,
  Refresh as ReengageIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const InactivityNode = ({ id, data, selected }) => {
  const theme = useTheme();
  const nodeColor = theme.palette.warning?.main || '#f59e0b';
  
  // Configuração de inatividade
  const inactivityConfig = data?.inactivityConfig || {};
  const action = inactivityConfig.action || 'warning';
  const timeout = inactivityConfig.timeoutMinutes || 5;
  const useGlobal = inactivityConfig.useGlobalSettings !== false;

  // Determinar quais handles exibir baseado na configuração
  const additionalHandles = useMemo(() => {
    const handlesList = [];
    
    // Handle padrão (sempre presente para fluxo normal)
    handlesList.push({
      id: 'default',
      type: 'source',
      position: Position.Bottom,
      data: { label: 'Continuar', type: 'success' }
    });

    // Se há configuração específica, adicionar handle de sucesso
    if (!useGlobal || action !== 'warning' || timeout !== 5) {
      handlesList.push({
        id: 'action-executed', 
        type: 'source',
        position: Position.Bottom,
        data: { label: 'Config. Aplicada', type: 'warning' }
      });
    }

    // Se a ação pode falhar (ex: transferência sem fila), adicionar handle de erro
    if (action === 'transfer' && !inactivityConfig.transferQueueId) {
      handlesList.push({
        id: 'timeout',
        type: 'source',
        position: Position.Bottom,
        data: { label: 'Erro Config.', type: 'error' }
      });
    } else if (action === 'transfer' || action === 'reengage') {
      // Para ações que podem falhar
      handlesList.push({
        id: 'timeout',
        type: 'source',
        position: Position.Bottom,
        data: { label: 'Falha', type: 'error' }
      });
    }

    return handlesList;
  }, [inactivityConfig, useGlobal, action, timeout]);

  // Obter ícone baseado na ação configurada
  const getActionIcon = (action) => {
    const iconProps = { fontSize: 'small', sx: { color: nodeColor } };
    switch (action) {
      case 'warning':
        return <NotificationIcon {...iconProps} />;
      case 'end':
        return <StopIcon {...iconProps} />;
      case 'transfer':
        return <TransferIcon {...iconProps} />;
      case 'reengage':
        return <ReengageIcon {...iconProps} />;
      default:
        return <InactivityIcon {...iconProps} />;
    }
  };

  // Obter texto da ação
  const getActionText = (action) => {
    switch (action) {
      case 'warning':
        return 'Avisar';
      case 'end':
        return 'Encerrar';
      case 'transfer':
        return 'Transferir';
      case 'reengage':
        return 'Reengajar';
      default:
        return 'Detectar';
    }
  };

  return (
    <BaseFlowNode
      id={id}
      nodeType="inactivity"
      type={i18n.t('flowBuilder.nodes.inactivity')}
      data={data}
      selected={selected}
      icon={InactivityIcon}
      color={nodeColor}
      additionalHandles={additionalHandles}
      handles={{
        source: { enabled: false }, // Desabilitamos o handle source padrão pois usamos os adicionais
        target: { enabled: true, position: Position.Top }
      }}
    >
      {/* Configuração de tempo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TimerIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
        <Typography variant="caption" color="text.secondary">
          {useGlobal ? i18n.t('flowBuilder.inactivity.globalSettings') : `${timeout}min`}
        </Typography>
      </Box>

      {/* Ação configurada */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getActionIcon(action)}
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {getActionText(action)}
        </Typography>
      </Box>

      {/* Detalhes adicionais */}
      {action === 'warning' && inactivityConfig.maxWarnings && (
        <Chip
          size="small"
          label={`${inactivityConfig.maxWarnings} ${i18n.t('flowBuilder.inactivity.warnings')}`}
          variant="outlined"
          sx={{ 
            borderColor: alpha(nodeColor, 0.3),
            color: nodeColor,
            fontSize: '0.7rem',
            height: 20
          }}
        />
      )}

      {action === 'transfer' && (
        <Tooltip title={inactivityConfig.transferQueueId ? i18n.t('flowBuilder.inactivity.queueConfigured') : i18n.t('flowBuilder.inactivity.noQueue')}>
          <Chip
            size="small"
            label={inactivityConfig.transferQueueId ? i18n.t('flowBuilder.inactivity.queueOk') : i18n.t('flowBuilder.inactivity.noQueue')}
            variant="outlined"
            sx={{ 
              borderColor: alpha(
                inactivityConfig.transferQueueId ? theme.palette.success.main : theme.palette.error.main, 
                0.3
              ),
              color: inactivityConfig.transferQueueId ? theme.palette.success.main : theme.palette.error.main,
              fontSize: '0.7rem',
              height: 20
            }}
          />
        </Tooltip>
      )}

      {inactivityConfig.detectInactivityOn && inactivityConfig.detectInactivityOn !== 'all' && (
        <Chip
          size="small"
          label={inactivityConfig.detectInactivityOn === 'questions' ? 
            i18n.t('flowBuilder.inactivity.questionsOnly') : 
            i18n.t('flowBuilder.inactivity.menusOnly')}
          variant="filled"
          sx={{ 
            bgcolor: alpha(nodeColor, 0.1),
            color: nodeColor,
            fontSize: '0.7rem',
            height: 20,
            mt: 0.5
          }}
        />
      )}

      {/* Indicador de configuração personalizada */}
      {!useGlobal && (
        <Tooltip title={i18n.t('flowBuilder.inactivity.customConfiguration')}>
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: theme.palette.info.main,
              border: `2px solid ${theme.palette.background.paper}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '8px',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              C
            </Typography>
          </Box>
        </Tooltip>
      )}
    </BaseFlowNode>
  );
};

export default memo(InactivityNode);