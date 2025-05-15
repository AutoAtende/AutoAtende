import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { 
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Download as DownloadIcon,
  Image as PngIcon,
  Photo as JpegIcon,
  Code as SvgIcon
} from '@mui/icons-material';

/**
 * Componente para download do diagrama como imagem
 * Pode ser integrado na barra de ferramentas do FlowBuilder
 */
const DownloadButton = ({ flowName = 'flow' }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const reactFlowInstance = useReactFlow();
  const [loading, setLoading] = React.useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Função genérica para download
  const downloadImage = useCallback((dataUrl, filename) => {
    const a = document.createElement('a');
    a.setAttribute('download', filename);
    a.setAttribute('href', dataUrl);
    a.click();
    a.remove();
  }, []);

  // Opções de configuração comuns para exportação
  const getExportOptions = () => {
    // Obtenha os nós e calcule a área necessária para a visualização
    if (!reactFlowInstance) return null;
    
    const nodesBounds = reactFlowInstance.getViewport();
    const width = 1920; // Largura padrão para exportação
    const height = 1080; // Altura padrão para exportação
    
    return {
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--mui-palette-background-default') || '#fff',
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${nodesBounds.x}px, ${nodesBounds.y}px) scale(${nodesBounds.zoom})`,
      },
      quality: 0.95,
      skipAutoScale: true,
      pixelRatio: 2
    };
  };

  const handleExportAsPNG = useCallback(() => {
    if (!reactFlowInstance) return;

    setLoading(true);
    const options = getExportOptions();
    
    toPng(document.querySelector('.react-flow__viewport'), options)
      .then((dataUrl) => {
        downloadImage(dataUrl, `${flowName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`);
        setLoading(false);
        handleClose();
      })
      .catch((error) => {
        console.error('Erro ao exportar como PNG:', error);
        setLoading(false);
        handleClose();
      });
  }, [reactFlowInstance, flowName, downloadImage]);

  const handleExportAsJPEG = useCallback(() => {
    if (!reactFlowInstance) return;

    setLoading(true);
    const options = getExportOptions();
    
    toJpeg(document.querySelector('.react-flow__viewport'), options)
      .then((dataUrl) => {
        downloadImage(dataUrl, `${flowName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.jpeg`);
        setLoading(false);
        handleClose();
      })
      .catch((error) => {
        console.error('Erro ao exportar como JPEG:', error);
        setLoading(false);
        handleClose();
      });
  }, [reactFlowInstance, flowName, downloadImage]);

  const handleExportAsSVG = useCallback(() => {
    if (!reactFlowInstance) return;

    setLoading(true);
    const options = getExportOptions();
    
    toSvg(document.querySelector('.react-flow__viewport'), options)
      .then((dataUrl) => {
        downloadImage(dataUrl, `${flowName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.svg`);
        setLoading(false);
        handleClose();
      })
      .catch((error) => {
        console.error('Erro ao exportar como SVG:', error);
        setLoading(false);
        handleClose();
      });
  }, [reactFlowInstance, flowName, downloadImage]);

  // Para integrar com o FlowBuilder, você pode retornar apenas o IconButton
  // para ser usado diretamente na barra de ferramentas
  return (
    <>
      <Tooltip title="Baixar como imagem">
        <IconButton 
          color="primary"
          onClick={handleClick}
          disabled={!reactFlowInstance || loading}
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            minWidth: 180,
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)' 
          }
        }}
      >
        <MenuItem onClick={handleExportAsPNG} disabled={loading}>
          <ListItemIcon>
            <PngIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Baixar como PNG</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleExportAsJPEG} disabled={loading}>
          <ListItemIcon>
            <JpegIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Baixar como JPEG</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleExportAsSVG} disabled={loading}>
          <ListItemIcon>
            <SvgIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Baixar como SVG</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default DownloadButton;

// Para usar este componente no FlowBuilder, você pode integrá-lo na barra de ferramentas superior:
// 
// <Tooltip title="Baixar como imagem">
//   <IconButton 
//     color="primary"
//     onClick={handleDownloadImage}
//     disabled={loading || !reactFlowInstance}
//   >
//     <DownloadIcon />
//   </IconButton>
// </Tooltip>
//
// Ou substituir toda essa parte por:
// <DownloadButton flowName={flowName} />