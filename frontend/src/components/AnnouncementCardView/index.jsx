import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  IconButton, 
  Chip,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DOMPurify from 'dompurify';
import moment from 'moment';

const AnnouncementCardView = ({ 
  announcements, 
  onEdit, 
  onDelete, 
  handleShowAnnouncementDialog 
}) => {
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
            className="h-full flex flex-col transition-shadow duration-300 hover:shadow-lg"
            onClick={() => handleShowAnnouncementDialog(announcement)}
          >
            {announcement.mediaPath && (
              <CardMedia
                component="img"
                height="140"
                image={getMediaPath(announcement.mediaPath, announcement.companyId)}
                alt={announcement.mediaName}
                className="h-40 object-cover"
              />
            )}
            <CardContent className="flex-grow">
              <Box className="flex justify-between items-start mb-2">
                <Typography variant="h6" component="h2" className="font-medium">
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
                className="mb-2"
              >
                {moment(announcement.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(announcement.text.slice(0, 150) + '...')
                }}
              />
            </CardContent>
            <Box className="flex justify-end p-2 bg-gray-50">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(announcement);
                }}
                className="mr-1"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(announcement);
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AnnouncementCardView;