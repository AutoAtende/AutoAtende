import React, { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Box, 
  Typography, 
  Paper,
  Chip,
  Avatar
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  HourglassEmpty as InactivityIcon,
  Notifications as NotificationIcon,
  Stop as StopIcon,
  PersonAdd as TransferIcon,
  Refresh as ReengageIcon,
  Timer as TimerIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const InactivityNode = ({ data, selected }) => {
  const theme = useTheme();
  
  // Cor do nó baseada no tema
  const nodeColor = theme.palette.warning?.main || '#f59e0b';
  const backgroundColor = selected 
    ? alpha(nodeColor, 0.15) 
    : alpha(nodeColor, 0.08);
  const borderColor = selected ? nodeColor : alpha(nodeColor, 0.3);

  // Configuração de inatividade
  const inactivityConfig = data?.inactivityConfig || {};
  const action = inactivityConfig.action || 'warning';
  const timeout = inactivityConfig.timeoutMinutes || 5;
  const useGlobal = inactivityConfig.useGlobalSettings !== false;

  // **NOVA LÓGICA**: Determinar quais handles exibir baseado na configuração
  const handles = useMemo(() => {
    const handlesList = [];
    
    // Handle padrão (sempre presente para fluxo normal)
    handlesList.push({
      id: 'default',
      label: 'Continuar',
      color: theme.palette.success.main,
      position: '30%'
    });

    // Se há configuração específica, adicionar handle de sucesso
    if (!useGlobal || action !== 'warning' || timeout !== 5) {
      handlesList.push({
        id: 'action-executed', 
        label: 'Config. Aplicada',
        color: nodeColor,
        position: '60%'
      });
    }

    // Se a ação pode falhar (ex: transferência sem fila), adicionar handle de erro
    if (action === 'transfer' && !inactivityConfig.transferQueueId) {
      handlesList.push({
        id: 'timeout',
        label: 'Erro Config.',
        color: theme.palette.error.main,
        position: '90%'
      });
    } else if (action === 'transfer' || action === 'reengage') {
      // Para ações que podem falhar
      handlesList.push({
        id: 'timeout',
        label: 'Falha',
        color: theme.palette.error.main,
        position: '90%'
      });
    }

    return handlesList;
  }, [inactivityConfig, useGlobal, action, timeout, nodeColor, theme]);

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
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 2,
        minWidth: 200,
        maxWidth: 250,
        cursor: 'grab',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: nodeColor,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {/* Handle de entrada */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: nodeColor,
          border: `2px solid ${theme.palette.background.paper}`,
          width: 12,
          height: 12,
        }}
      />

      {/* Cabeçalho do nó */}
      <Box sx={{
        p: 1.5,
        backgroundColor: alpha(nodeColor, 0.1),
        borderBottom: `1px solid ${alpha(nodeColor, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: alpha(nodeColor, 0.2),
            color: nodeColor
          }}
        >
          <InactivityIcon fontSize="small" />
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {data?.label || 'Inatividade'}
          </Typography>
        </Box>
      </Box>

      {/* Conteúdo do nó */}
      <Box sx={{ p: 1.5 }}>
        {/* Configuração de tempo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TimerIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          <Typography variant="caption" color="text.secondary">
            {useGlobal ? 'Global' : `${timeout}min`}
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
            label={`${inactivityConfig.maxWarnings} avisos`}
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
          <Chip
            size="small"
            label={inactivityConfig.transferQueueId ? "Fila OK" : "Sem fila"}
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
        )}

        {inactivityConfig.detectInactivityOn && inactivityConfig.detectInactivityOn !== 'all' && (
          <Chip
            size="small"
            label={inactivityConfig.detectInactivityOn === 'questions' ? 'Perguntas' : 'Menus'}
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
      </Box>

      {/* **HANDLES DINÂMICOS** - Renderizar apenas os necessários */}
      {handles.map((handle, index) => (
        <React.Fragment key={handle.id}>
          {/* Handle de saída */}
          <Handle
            type="source"
            position={Position.Bottom}
            id={handle.id}
            style={{
              background: handle.color,
              border: `2px solid ${theme.palette.background.paper}`,
              width: 12,
              height: 12,
              left: handle.position,
              bottom: -6,
              zIndex: 10
            }}
          />
        </React.Fragment>
      ))}

      {/* Indicador de configuração personalizada */}
      {!useGlobal && (
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
            justifyContent: 'center'
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
      )}
    </Paper>
  );
};

export default memo(InactivityNode);