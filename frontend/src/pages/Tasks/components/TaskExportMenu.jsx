import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import moment from 'moment';

const TaskExportMenu = ({ anchorEl, open, onClose, tasks, filters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  
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
  
  const handleExport = async (format) => {
    try {
      setLoading(true);
      setLoadingType(format);
      
      if (format === 'print') {
        handlePrint();
        return;
      }
      
      const formattedTasks = formatTasksForExport();
      
      if (formattedTasks.length === 0) {
        toast.info(i18n.t('tasks.export.noData') || 'Nenhuma tarefa para exportar');
        setLoading(false);
        setLoadingType(null);
        onClose();
        return;
      }
      
      const endpoint = format === 'pdf' ? '/task/export/pdf' : '/task/export/excel';
      
      const response = await api.post(endpoint, {
        tasks: formattedTasks,
        filters
      }, { responseType: 'blob' });
      
      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tarefas-${moment().format('YYYY-MM-DD-HH-mm')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(i18n.t('tasks.export.success') || 'Exportação concluída com sucesso');
    } catch (err) {
      console.error('Erro ao exportar:', err);
      toast.error(i18n.t('tasks.export.error') || 'Erro ao exportar');
    } finally {
      setLoading(false);
      setLoadingType(null);
      onClose();
    }
  };
  
  const handlePrint = () => {
    try {
      // Preparar os dados para impressão
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        toast.error('Bloqueador de pop-ups impediu a impressão. Por favor, permita pop-ups para este site.');
        onClose();
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
              word-break: break-word;
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
    onClose();
  };
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: isMobile ? 150 : 200
        }
      }}
    >
      <MenuItem onClick={() => handleExport('pdf')} disabled={loading}>
        <ListItemIcon>
          {loading && loadingType === 'pdf' ? <CircularProgress size={20} /> : <PdfIcon fontSize="small" />}
        </ListItemIcon>
        <ListItemText>PDF</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleExport('excel')} disabled={loading}>
        <ListItemIcon>
          {loading && loadingType === 'excel' ? <CircularProgress size={20} /> : <ExcelIcon fontSize="small" />}
        </ListItemIcon>
        <ListItemText>Excel</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleExport('print')} disabled={loading}>
        <ListItemIcon>
          {loading && loadingType === 'print' ? <CircularProgress size={20} /> : <PrintIcon fontSize="small" />}
        </ListItemIcon>
        <ListItemText>{i18n.t("buttons.print") || 'Imprimir'}</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default TaskExportMenu;