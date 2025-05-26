import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Paper, Typography, IconButton, Avatar, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Code as CodeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { i18n } from "../../../../translate/i18n";

const BaseFlowNode = ({
  id,
  nodeType, // Tipo do nó para determinar a cor
  type,     // Texto a ser exibido como título
  data,
  selected,
  icon: Icon,
  canDuplicate = true,
  canDelete = true,
  canEdit = true,
  children,
  handles = {
    source: { enabled: true, position: Position.Bottom },
    target: { enabled: true, position: Position.Top }
  },
  additionalHandles = [],
  onDuplicate,
  onDelete,
  onEdit,
  noContent = false,
  isTerminal = false, // Propriedade para definir se é um nó terminal
  color = null
}) => {
  const theme = useTheme();
  // Determinar a cor com base no tipo de nó
  const nodeColor = color || "#388bef";

  // Função para gerar descrições legíveis para os handles
  const getHandleDescription = (handle) => {
    // Gerar descrição específica baseada no tipo
    if (handle.id === 'default' || !handle.id) {
      return i18n.t('flowBuilder.outputs.default', 'Padrão');
    }

    if (handle.id === 'action-executed') {
      return 'Configuração Aplicada';
    }
    
    if (handle.id === 'timeout') {
      return 'Erro/Timeout';
    }

    if (handle.id === 'error') {
      return i18n.t('flowBuilder.outputs.error', 'Erro');
    }

    if (handle.id === 'validation-error') {
      return i18n.t('flowBuilder.outputs.validationError', 'Erro de validação');
    }

    // Verifica se é um handle de condição
    if (handle.id?.startsWith('condition-') && handle.data?.condition) {
      return handle.data.condition.description || 
        `${i18n.t('flowBuilder.outputs.condition', 'Condição')}: ${handle.data.condition.value}`;
    }

    // Verifica se é um handle de menu
    if (handle.id?.startsWith('menu-option-') && handle.data?.option) {
      return handle.data.option.text || 
        `${i18n.t('flowBuilder.outputs.option', 'Opção')} ${handle.id.split('-').pop()}`;
    }

    // Verifica se é um handle de opção de pergunta
    if (handle.id?.startsWith('option-') && handle.data?.option) {
      return handle.data.option.text || 
        `${i18n.t('flowBuilder.outputs.option', 'Opção')} ${handle.id.split('-').pop()}`;
    }

    // Handle genérico
    return `${i18n.t('flowBuilder.outputs.output', 'Saída')} ${handle.id}`;
  };

  // Função para obter cor para um handle específico
  const getHandleColor = (handle) => {
    if (handle.id === 'default' || !handle.id) {
      return theme.palette.info.main;
    }
    
    if (handle.id === 'error' || handle.id === 'validation-error' || 
        (handle.data && handle.data.type === 'error')) {
      return theme.palette.error.main; // Vermelho para erros
    }
    
    // Cores específicas por tipo de nó e handle
    if (handle.id?.startsWith('condition-')) {
      return theme.palette.warning.main;
    }
    
    if (handle.id?.startsWith('option-') || handle.id?.startsWith('menu-option-') ||
        (handle.data && handle.data.type === 'success')) {
      return theme.palette.success.main; // Verde para opções corretas
    }
    
    return nodeColor;
  };

  // Calcular espaçamento entre handles com base na quantidade
  const calculateHandlePosition = (index, total) => {
    // Se for o menuNode, começamos mais acima e diminuímos o espaçamento para caber mais opções
    if (nodeType === 'menu') {
      // Começar em 20% do topo e distribuir uniformemente com menos espaço
      const startPosition = 20;
      const endPosition = 80;
      const availableSpace = endPosition - startPosition;
      
      // Se tiver até 3 opções, usa espaçamento normal
      if (total <= 3) {
        return startPosition + (availableSpace / Math.max(total, 1)) * index;
      }
      
      // Para mais de 3 opções, reduz o espaçamento
      return startPosition + (availableSpace / Math.max(total, 1)) * index;
    }
    
    // Para outros tipos de nós, mantém a lógica anterior com pequenos ajustes
    if (total <= 3) {
      return 30 + (index * 20); // 30%, 50%, 70%
    }
    
    // Para muitas saídas, distribui uniformemente
    return 20 + ((60) / (total - 1 || 1)) * index;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'visible',
        width: { xs: 180, sm: 220 },
        border: `2px solid ${nodeColor}`,
        borderTopLeftRadius: '8px',  
        borderTopRightRadius: '8px', 
        boxShadow: selected ? 3 : 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: nodeColor,
          color: '#ffffff',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: '6px', 
          borderTopRightRadius: '6px',
          overflow: 'hidden', // Impede que o conteúdo estoure o cabeçalho
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}> {/* Adicionando minWidth: 0 para permitir truncamento */}
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: alpha('#fff', 0.2),
              color: '#fff',
              flexShrink: 0, // Impede que o avatar encolha
            }}
          >
            {Icon && <Icon fontSize="small" style={{ fontSize: '14px' }} />}
          </Avatar>
          <Typography 
            variant="body2" 
            fontWeight={600} 
            noWrap 
            sx={{ 
              fontSize: '0.85rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'calc(100% - 60px)' // Deixa espaço para os botões
            }}
            title={data?.label || i18n.t(`flowBuilder.nodes.${nodeType}`, type)} // Adiciona tooltip nativo
          >
            {data?.label || i18n.t(`flowBuilder.nodes.${nodeType}`, type)}
          </Typography>
        </Box>

        {/* Botões de ação padronizados - agora com flexShrink para não encolherem */}
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          {canDuplicate && (
            <IconButton
              size="small"
              title={i18n.t('flowBuilder.actions.duplicate')}
              sx={{
                backgroundColor: alpha('#fff', 0.2), // Usando alpha para deixar mais coerente
                color: '#ffffff',
                width: 20,
                height: 20,
                minWidth: 20,
                minHeight: 20,
                p: 0,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.3),
                },
              }}
              onClick={onDuplicate}
            >
              <DuplicateIcon fontSize="small" style={{ fontSize: '12px' }} />
            </IconButton>
          )}

          {canDelete && (
            <IconButton
              size="small"
              title={i18n.t('flowBuilder.actions.delete')}
              sx={{
                backgroundColor: alpha('#fff', 0.2), // Usando alpha para deixar mais coerente
                color: '#ffffff',
                width: 20,
                height: 20,
                minWidth: 20,
                minHeight: 20,
                p: 0,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.3),
                },
              }}
              onClick={onDelete}
            >
              <DeleteIcon fontSize="small" style={{ fontSize: '12px' }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Content - Opcional para Start e End nodes */}
      {!noContent && (
        <Box sx={{ p: 1.5 }}>
          {children}
        </Box>
      )}

      {/* Pontos de conexão com marcadores visuais */}
      {/* Handle de entrada (topo) */}
      {handles.target?.enabled && (
        <>
          {/* Ponto de conexão de entrada */}
          <Handle
            type="target"
            position={handles.target.position}
            style={{
              background: theme.palette.background.paper,
              border: `2px solid ${nodeColor}`,
              width: 12,
              height: 12,
              top: -6,
              zIndex: 10
            }}
          />
        </>
      )}

      {/* Handle de saída padrão (fundo) */}
      {handles.source?.enabled && !isTerminal && (
        <>
          {/* Ponto de conexão de saída */}
          <Handle
            type="source"
            position={handles.source.position}
            id="default"
            style={{
              background: theme.palette.background.paper,
              border: `2px solid ${nodeColor}`,
              width: 12,
              height: 12,
              bottom: -6,
              zIndex: 10
            }}
          />
        </>
      )}

      {/* Handles adicionais - sempre à direita */}
      {!isTerminal && additionalHandles.map((handle, index) => {
        const handleColor = getHandleColor(handle);
        const totalHandles = additionalHandles.length;
        
        // Calcular a posição vertical baseada no índice e número total de saídas
        const topPercentage = calculateHandlePosition(index, totalHandles);
        
        return (
          <React.Fragment key={`handle-${handle.id || index}`}>
            {/* Ponto de conexão adicional - sempre Position.Right */}
            <Handle
              type={handle.type || "source"}
              position={Position.Right}
              id={handle.id || `handle-${index}`}
              style={{
                background: theme.palette.background.paper,
                border: `2px solid ${handleColor}`,
                width: 12,
                height: 12,
                right: -6,
                top: `${topPercentage}%`,
                zIndex: 10
              }}
              data={handle.data}
            />
          </React.Fragment>
        );
      })}

      {/* Indicador de nó terminal */}
      {isTerminal && (
        <Tooltip title={i18n.t('flowBuilder.nodes.terminalNodeHint', 'Este é um nó terminal - o fluxo encerra aqui')} placement="bottom">
          <Box
            sx={{
              position: 'absolute',
              bottom: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              fontSize: '0.65rem',
              fontWeight: 'bold',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              border: `1px solid ${theme.palette.error.dark}`,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <InfoIcon sx={{ fontSize: '0.75rem' }} />
            {i18n.t('flowBuilder.nodes.terminal', 'Terminal')}
          </Box>
        </Tooltip>
      )}
    </Paper>
  );
};

export default memo(BaseFlowNode);