// AnnouncementCardView.jsx (refatorado)
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  Chip,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DOMPurify from 'dompurify';
import moment from 'moment';
import BaseButton from '../../components/BaseButton';
import BaseEmptyState from '../../components/BaseEmptyState';

const AnnouncementCardView = ({ 
  announcements, 
  onEdit, 
  onDelete, 
  handleShowAnnouncementDialog 
}) => {
  if (!announcements || announcements.length === 0) {
    return (
      <BaseEmptyState 
        icon={<EditIcon fontSize="large" />}
        title="Nenhum anúncio encontrado"
        message="Não foram encontrados anúncios com os critérios informados."
        buttonText="Adicionar anúncio"
        onAction={() => onEdit(null)}
      />
    );
  }

  const getMediaPath = (filename, companyId) => {
    return `${process.env.REACT_APP_BACKEND_URL}/public/company${companyId}/${filename}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'default';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Alta';
      case 2: return 'Média';
      case 3: return 'Baixa';
      default: return 'Baixa';
    }
  };

  return (
    <Grid container spacing={3}>
      {announcements.map((announcement) => (
        <Grid item xs={12} sm={6} md={4} key={announcement.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              },
              cursor: 'pointer'
            }}
            onClick={() => handleShowAnnouncementDialog(announcement)}
          >
            {announcement.mediaPath && (
              <CardMedia
                component="img"
                height="140"
                image={getMediaPath(announcement.mediaPath, announcement.companyId)}
                alt={announcement.mediaName}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                  {announcement.title}
                </Typography>
                <Chip 
                  label={getPriorityLabel(announcement.priority)}
                  color={getPriorityColor(announcement.priority)}
                  size="small"
                />
              </Box>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ mb: 1 }}
              >
                {moment(announcement.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(announcement.text.slice(0, 150) + '...')
                }}
              />
            </CardContent>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              p: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <BaseButton
                variant="text"
                color="primary"
                size="small"
                startIcon={<EditIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(announcement);
                }}
                sx={{ mr: 1 }}
              >
                Editar
              </BaseButton>
              <BaseButton
                variant="text"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(announcement);
                }}
              >
                Excluir
              </BaseButton>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AnnouncementCardView;