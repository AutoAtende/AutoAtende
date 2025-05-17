// AnnouncementTableView.jsx (refatorado)
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Typography, 
  Chip, 
  Box
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DOMPurify from 'dompurify';
import moment from 'moment';
import BaseButton from '../../../components/BaseButton';
import BaseEmptyState from '../../../components/BaseEmptyState';

const AnnouncementTableView = ({ 
  announcements, 
  onEdit, 
  onDelete, 
  onView 
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

  const truncateText = (text, maxLength = 100) => {
    const sanitized = DOMPurify.sanitize(text).replace(/<[^>]*>/g, '');
    if (sanitized.length <= maxLength) return sanitized;
    return sanitized.substring(0, maxLength) + '...';
  };

  return (
    <Box sx={{ 
      width: '100%', 
      overflow: 'auto'
    }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Título</TableCell>
            <TableCell>Prioridade</TableCell>
            <TableCell>Conteúdo</TableCell>
            <TableCell>Data de criação</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body1">{announcement.title}</Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={getPriorityLabel(announcement.priority)}
                  color={getPriorityColor(announcement.priority)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {truncateText(announcement.text)}
                </Typography>
              </TableCell>
              <TableCell>
                {moment(announcement.createdAt).format('DD/MM/YYYY HH:mm')}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <BaseButton
                    variant="text"
                    color="primary"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => onView(announcement)}
                    sx={{ mr: 1 }}
                  >
                    Visualizar
                  </BaseButton>
                  <BaseButton
                    variant="text"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(announcement)}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </BaseButton>
                  <BaseButton
                    variant="text"
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => onDelete(announcement)}
                  >
                    Excluir
                  </BaseButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AnnouncementTableView;