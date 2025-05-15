// Substitua o conteúdo do arquivo CustomEdge.jsx
import React, { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { useTheme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { IconButton, Box } from '@mui/material';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  sourceHandle,
  selected
}) => {
  const theme = useTheme();
  
  // Determinar a cor com base no handle de origem
  let edgeColor = theme.palette.grey[400];
  
  if (sourceHandle) {
    // Se o handle tiver uma propriedade data com tipo
    if (sourceHandle.data && sourceHandle.data.type) {
      if (sourceHandle.data.type === 'error') {
        edgeColor = theme.palette.error.main; // Vermelho para erros
      } else if (sourceHandle.data.type === 'success') {
        edgeColor = theme.palette.success.main; // Verde para sucesso
      }
    }
    // Caso contrário, verificamos pelo ID
    else if (typeof sourceHandle === 'string') {
      if (sourceHandle === 'error' || sourceHandle === 'validation-error') {
        edgeColor = theme.palette.error.main; // Vermelho para erros
      } else if (sourceHandle.startsWith('condition-')) {
        edgeColor = theme.palette.warning.main; // Laranja para condições
      } else if (sourceHandle.startsWith('option-') || sourceHandle.startsWith('menu-option-')) {
        edgeColor = theme.palette.success.main; // Verde para opções
      }
    }
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const handleEdgeRemove = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (data && typeof data.onEdgeRemove === 'function') {
      data.onEdgeRemove(id);
    }
  };

  return (
    <>
      {/* Linha pontilhada e com animação */}
      <path
        id={id}
        style={{
          stroke: selected ? theme.palette.primary.main : edgeColor,
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: '5, 5', // Cria o efeito pontilhado
          transition: 'stroke 0.2s, stroke-width 0.2s',
          ...style,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Adicionando a animação via estilo inline */}
      <style>
        {`
          .react-flow__edge-path {
            stroke-dasharray: 5, 5;
            animation: dashAnimation 30s linear infinite;
          }
          
          @keyframes dashAnimation {
            to {
              stroke-dashoffset: -1000;
            }
          }
        `}
      </style>
      
      {/* Caminho transparente para melhor detecção de clique */}
      <path
        d={edgePath}
        strokeWidth={10}
        stroke="transparent"
        fill="none"
        style={{ pointerEvents: 'all' }}
      />
      
      {/* Botão de remoção */}
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 10,
            backgroundColor: theme.palette.error.main,
            color: '#fff',
            width: 20,
            height: 20,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
            }
          }}
          onClick={handleEdgeRemove}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </Box>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(CustomEdge);