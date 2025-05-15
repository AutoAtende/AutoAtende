import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { toast } from '../../../helpers/toast';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import moment from 'moment';

const TaskExport = ({ tasks, filters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = (event) => {
    if (tasks.length === 0) {
      toast.info(i18n.t("tasks.export.noData") || "Nenhuma tarefa para exportar");
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatTasksForExport = () => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return [];
    }
    
    return tasks.map(task => ({
      'ID': task.id,
      'Título': task.title,
      'Descrição': task.text || '',
      'Status': task.done ? 'Concluída' : 'Pendente',
      'Responsável': task.responsible?.name || '-',
      'Categoria': task.taskCategory?.name || '-',
      'Data de Vencimento': task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY HH:mm') : '-',
      'Criado por': task.creator?.name || '-',
      'Criado em': moment(task.createdAt).format('DD/MM/YYYY HH:mm'),
      'Atualizado em': moment(task.updatedAt).format('DD/MM/YYYY HH:mm')
    }));
  };

  const exportToPDF = async () => {
    try {
      setLoading(true);
      const formattedTasks = formatTasksForExport();
      
      if (formattedTasks.length === 0) {
        toast.info(i18n.t("tasks.export.noData") || "Nenhuma tarefa para exportar");
        setLoading(false);
        handleClose();
        return;
      }
      
      const response = await api.post('/task/export/pdf', {
        tasks: formattedTasks,
        filters
      }, { responseType: 'blob' });

      // Verificar se a resposta é um blob válido
      if (!(response.data instanceof Blob)) {
        throw new Error('Resposta inválida do servidor');
      }

      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tarefas-${moment().format('YYYY-MM-DD-HH-mm')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(i18n.t("tasks.export.success") || 'Exportação concluída com sucesso');
    } catch (err) {
      console.error('Erro ao exportar para PDF:', err);
      toast.error(i18n.t("tasks.export.error") || 'Erro ao exportar');
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const formattedTasks = formatTasksForExport();
      
      if (formattedTasks.length === 0) {
        toast.info(i18n.t("tasks.export.noData") || "Nenhuma tarefa para exportar");
        setLoading(false);
        handleClose();
        return;
      }
      
      const response = await api.post('/task/export/excel', {
        tasks: formattedTasks,
        filters
      }, { responseType: 'blob' });

      // Verificar se a resposta é um blob válido
      if (!(response.data instanceof Blob)) {
        throw new Error('Resposta inválida do servidor');
      }

      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tarefas-${moment().format('YYYY-MM-DD-HH-mm')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(i18n.t("tasks.export.success") || 'Exportação concluída com sucesso');
    } catch (err) {
      console.error('Erro ao exportar para Excel:', err);
      toast.error(i18n.t("tasks.export.error") || 'Erro ao exportar');
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handlePrint = () => {
    try {
      // Preparar os dados para impressão
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        toast.error('Bloqueador de pop-ups impediu a impressão. Por favor, permita pop-ups para este site.');
        handleClose();
        return;
      }
      
      // Definir as colunas a serem impressas
      const columns = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Título' },
        { key: 'status', label: 'Status' },
        { key: 'dueDate', label: 'Data de Vencimento' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'category', label: 'Categoria' }
      ];
      
      // Preparar os dados formatados para impressão
      const printData = tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.done ? 'Concluída' : 'Pendente',
        dueDate: task.dueDate ? moment(task.dueDate).format('DD/MM/YYYY') : '-',
        responsible: task.responsible?.name || '-',
        category: task.taskCategory?.name || '-'
      }));
      
      // Criar o conteúdo HTML para impressão com responsividade
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lista de Tarefas - ${moment().format('DD/MM/YYYY')}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif;
              padding: 15px;
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td { 
              padding: 8px; 
              text-align: left; 
              border-bottom: 1px solid #ddd;
              font-size: 12px;
            }
            th { 
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
            }
            .footer { 
              margin-top: 20px; 
              text-align: center; 
              font-size: 12px; 
            }
            .print-buttons {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-top: 20px;
            }
            .print-buttons button {
              padding: 8px 16px;
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            }
            .print-buttons button.close {
              background-color: #f44336;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
              th, td { font-size: 10px; padding: 5px; }
            }
            @media screen and (max-width: 600px) {
              th, td { font-size: 10px; padding: 5px; }
              .header h1 { font-size: 18px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Tarefas</h1>
            <p>Data: ${moment().format('DD/MM/YYYY HH:mm')}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${printData.map(row => `
                <tr>
                  ${columns.map(col => `<td>${row[col.key]}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Total de tarefas: ${printData.length}</p>
          </div>
          
          <div class="no-print print-buttons">
            <button onclick="window.print()">Imprimir</button>
            <button class="close" onclick="window.close()">Fechar</button>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Dar tempo para carregar antes de chamar a impressão automática
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
      
    } catch (err) {
      console.error('Erro ao preparar impressão:', err);
      toast.error('Erro ao preparar impressão');
    }
    handleClose();
  };

  return (
    <>
      {isMobile ? (
        <IconButton
          color="primary"
          size="small"
          onClick={handleClick}
          disabled={loading || tasks.length === 0}
          aria-label={i18n.t("buttons.export") || 'Exportar'}
        >
          {loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        </IconButton>
      ) : (
        <Tooltip title={tasks.length === 0 ? 'Nenhuma tarefa para exportar' : 'Exportar'}>
          <span>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
              onClick={handleClick}
              disabled={loading || tasks.length === 0}
              size="small"
            >
              {i18n.t("buttons.export") || 'Exportar'}
            </Button>
          </span>
        </Tooltip>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: isMobile ? 150 : 200
          }
        }}
      >
        <MenuItem onClick={exportToPDF} disabled={loading}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={exportToExcel} disabled={loading}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excel</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handlePrint} disabled={loading}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{i18n.t("buttons.print") || 'Imprimir'}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default TaskExport;