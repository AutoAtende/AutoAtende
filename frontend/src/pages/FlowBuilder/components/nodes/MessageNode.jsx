import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Tooltip } from '@mui/material';
import { 
  Chat as ChatIcon,
  Image as ImageIcon,
  AudioFile as AudioFileIcon,
  VideoFile as VideoFileIcon,
  Description as DocumentIcon,
  LocationOn as LocationIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const MessageNode = ({ id, data, selected }) => {
  const messageType = data.messageType || 'text';
  const reactFlowInstance = useReactFlow();
  
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    reactFlowInstance.deleteElements({ nodes: [{ id }] });
  }, [id, reactFlowInstance]);
  
  const handleDuplicate = useCallback((event) => {
    event.stopPropagation();
    
    // Clonar o nó atual
    const position = reactFlowInstance.getNode(id).position;
    const newNode = {
      id: `message_${Date.now()}`,
      type: 'messageNode',
      position: {
        x: position.x + 20,
        y: position.y + 20
      },
      data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.message')} (${i18n.t('flowBuilder.actions.duplicate')})` }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [id, data, reactFlowInstance]);
  
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    // Lógica para abrir o drawer de edição do nó
    console.log('Edit node', id);
  }, [id]);
  
  // Ícone baseado no tipo de mensagem
  const getMessageTypeIcon = () => {
    switch (messageType) {
      case 'text': return ChatIcon;
      case 'image': return ImageIcon;
      case 'audio': return AudioFileIcon;
      case 'video': return VideoFileIcon;
      case 'document': return DocumentIcon;
      case 'location': return LocationIcon;
      default: return ChatIcon;
    }
  };
  
  // Componente de conteúdo baseado no tipo de mensagem
  const renderContent = () => {
    switch (messageType) {
      case 'text':
        return (
          <Tooltip title={data.message || i18n.t('flowBuilder.messages.noContent')} placement="top">
            <Box 
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: 1,
                p: 1,
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '32px',
                mb: 1
              }}
            >
              {data.message || i18n.t('flowBuilder.messages.noContent')}
            </Box>
          </Tooltip>
        );
        
      case 'image':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
            {data.mediaUrl ? (
              <Box 
                sx={{
                  height: '60px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 1,
                  mb: 0.5,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={data.mediaUrl} 
                  alt={i18n.t('flowBuilder.preview')} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 4
                  }} 
                />
              </Box>
            ) : (
              <Box 
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 1,
                  p: 1,
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  mb: 0.5
                }}
              >
                <ImageIcon fontSize="small" sx={{ mr: 0.5 }} />
                {i18n.t('flowBuilder.messages.noImage')}
              </Box>
            )}
            
            {data.caption && (
              <Tooltip title={data.caption} placement="top">
                <Typography 
                  variant="caption" 
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 1,
                    p: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '0.7rem'
                  }}
                >
                  {i18n.t('flowBuilder.properties.caption')}: {data.caption}
                </Typography>
              </Tooltip>
            )}
          </Box>
        );
        
      case 'audio':
      case 'video':
      case 'document':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
            <Box 
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: 1,
                p: 1,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 0.5
              }}
            >
              {messageType === 'audio' ? (
                <AudioFileIcon fontSize="small" />
              ) : messageType === 'video' ? (
                <VideoFileIcon fontSize="small" />
              ) : (
                <DocumentIcon fontSize="small" />
              )}
              {data.filename || (data.mediaUrl ? data.mediaUrl.split('/').pop() : `${i18n.t(`flowBuilder.messageTypes.${messageType}`)} ${i18n.t('flowBuilder.messages.uploaded')}`)}
            </Box>
            
            {data.caption && (
              <Tooltip title={data.caption} placement="top">
                <Typography 
                  variant="caption" 
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 1,
                    p: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '0.7rem'
                  }}
                >
                  {i18n.t('flowBuilder.properties.caption')}: {data.caption}
                </Typography>
              </Tooltip>
            )}
          </Box>
        );
        
      case 'location':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
            <Box 
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: 1,
                p: 1,
                fontSize: '0.75rem',
                mb: 0.5
              }}
            >
              <Typography variant="caption" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon fontSize="inherit" />
                {data.locationName || i18n.t('flowBuilder.nodes.location')}
              </Typography>
              {data.latitude && data.longitude && (
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  {data.latitude}, {data.longitude}
                </Typography>
              )}
            </Box>
            
            {data.address && (
              <Tooltip title={data.address} placement="top">
                <Typography 
                  variant="caption" 
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 1,
                    p: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '0.7rem'
                  }}
                >
                  {i18n.t('flowBuilder.properties.address')}: {data.address}
                </Typography>
              </Tooltip>
            )}
          </Box>
        );
        
      default:
        return (
          <Box 
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 1,
              p: 1,
              fontSize: '0.75rem',
              mb: 1
            }}
          >
            {i18n.t('flowBuilder.messages.unsupportedType')}
          </Box>
        );
    }
  };

  // Tipo de mensagem indicador
  const MessageTypeIndicator = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5,
      bgcolor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 1,
      py: 0.5,
      px: 1,
      alignSelf: 'flex-start',
      fontSize: '0.7rem'
    }}>
      {React.createElement(getMessageTypeIcon(), { style: { fontSize: '14px' } })}
      <Typography variant="caption">
        {i18n.t(`flowBuilder.messageTypes.${messageType}`, messageType)}
      </Typography>
    </Box>
  );
  
  return (
    <BaseFlowNode
      id={id}
      nodeType="message"
      type={i18n.t('flowBuilder.nodes.message')}
      data={data}
      selected={selected}
      icon={getMessageTypeIcon()}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
    >
      {renderContent()}
      <MessageTypeIndicator />
      
      {/* Informação sobre saídas */}
      <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed`, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          ↳ Este nó tem 1 saída:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Box component="span" sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'info.main'
          }} />
          <Typography variant="caption">
            {i18n.t('flowBuilder.outputs.default')} ({i18n.t('flowBuilder.outputs.below')})
          </Typography>
        </Box>
      </Box>
    </BaseFlowNode>
  );
};

export default memo(MessageNode);