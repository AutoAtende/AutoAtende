import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { logger } from '../../utils/logger';

import Task from '../../models/Task';
import User from '../../models/User';
import TaskCategory from '../../models/TaskCategory';
import path from 'path';
import fs from 'fs';
import uploadConfig from '../../config/upload';
import TaskTimeline from '../../models/TaskTimeline';
import { Op } from 'sequelize';

interface ExportTask {
  ID: number;
  Título: string;
  Descrição: string;
  Status: string;
  Responsável: string;
  Categoria: string;
  'Data de Vencimento': string;
  'Criado por': string;
  'Criado em': string;
  'Atualizado em': string;
}

class TaskExportService {
  public static async exportToPDF(tasks: ExportTask[], res: Response, companyId?: number): Promise<void> {
    try {
      logger.info('Iniciando exportação para PDF', { tasksCount: tasks.length, companyId });
      const doc = new PDFDocument({ margin: 30 });

      // Verificar se o diretório da empresa existe
      if (companyId) {
        const companyDir = path.resolve(uploadConfig.directory, `company${companyId}`);
        if (!fs.existsSync(companyDir)) {
          fs.mkdirSync(companyDir, { recursive: true });
          logger.info(`Diretório da empresa criado: ${companyDir}`);
        }
        
        // Criar subdiretório para relatórios se não existir
        const reportsDir = path.resolve(companyDir, 'reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
          logger.info(`Diretório de relatórios criado: ${reportsDir}`);
        }
      }

      // Configuração do cabeçalho
      doc.fontSize(20).text('Relatório de Tarefas', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'right' });
      doc.moveDown();

      // Tabela
      const table = {
        headers: Object.keys(tasks[0] || {}),
        rows: tasks.map(task => Object.values(task))
      };

      // Define larguras das colunas dinamicamente
      const pageWidth = doc.page.width - 60;
      const columnWidths = [];
      
      // Determina a largura total disponível e a quantidade de colunas
      const totalColumns = table.headers.length;
      const defaultColumnWidth = Math.floor(pageWidth / totalColumns);
      
      // Ajusta as larguras das colunas baseado no conteúdo
      for (let i = 0; i < totalColumns; i++) {
        const header = table.headers[i];
        const maxContentLength = Math.max(
          header.length,
          ...table.rows.map(row => String(row[i] || '').length)
        );
        
        // Ajusta a largura com base no conteúdo, com um mínimo e máximo
        columnWidths[i] = Math.min(
          Math.max(defaultColumnWidth, maxContentLength * 5),
          pageWidth / 3
        );
      }

      // Cabeçalhos
      let yPosition = 150;
      doc.font('Helvetica-Bold');
      doc.fontSize(10);

      // Desenha linha de cabeçalho
      doc.lineWidth(1);
      doc.moveTo(30, yPosition - 10).lineTo(doc.page.width - 30, yPosition - 10).stroke();

      let xPosition = 30;
      table.headers.forEach((header, i) => {
        doc.text(header, xPosition, yPosition, {
          width: columnWidths[i],
          align: 'left'
        });
        xPosition += columnWidths[i];
      });

      yPosition += 20;
      doc.lineWidth(1);
      doc.moveTo(30, yPosition - 10).lineTo(doc.page.width - 30, yPosition - 10).stroke();

      // Linhas
      doc.font('Helvetica');
      table.rows.forEach((row) => {
        // Verifica se precisa adicionar uma nova página
        if (yPosition > doc.page.height - 50) {
          doc.addPage();
          yPosition = 50;
          
          // Redesenha cabeçalho na nova página
          doc.font('Helvetica-Bold');
          doc.lineWidth(1);
          doc.moveTo(30, yPosition - 10).lineTo(doc.page.width - 30, yPosition - 10).stroke();
          
          xPosition = 30;
          table.headers.forEach((header, i) => {
            doc.text(header, xPosition, yPosition, {
              width: columnWidths[i],
              align: 'left'
            });
            xPosition += columnWidths[i];
          });
          
          yPosition += 20;
          doc.lineWidth(1);
          doc.moveTo(30, yPosition - 10).lineTo(doc.page.width - 30, yPosition - 10).stroke();
          doc.font('Helvetica');
        }
        
        xPosition = 30;
        
        row.forEach((cell, i) => {
          const cellContent = String(cell || '');
          
          // Trunca texto muito longo
          const maxLength = 30;
          const displayText = cellContent.length > maxLength 
            ? cellContent.substring(0, maxLength) + '...' 
            : cellContent;
          
          doc.text(displayText, xPosition, yPosition, {
            width: columnWidths[i],
            align: 'left'
          });
          xPosition += columnWidths[i];
        });

        yPosition += 20;
        
        // Adiciona linha separadora entre os registros
        if (yPosition < doc.page.height - 50) {
          doc.lineWidth(0.5);
          doc.strokeColor('#cccccc');
          doc.moveTo(30, yPosition - 10).lineTo(doc.page.width - 30, yPosition - 10).stroke();
          doc.strokeColor('#000000');
        }
      });

      // Adiciona rodapé com o número da página
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8);
        doc.text(
          `Página ${i + 1} de ${totalPages}`,
          30,
          doc.page.height - 30,
          { align: 'center' }
        );
      }

      // Salvar uma cópia no servidor se tiver companyId
      if (companyId) {
        const fileName = `tarefas_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
        const filePath = path.resolve(uploadConfig.directory, `company${companyId}`, 'reports', fileName);
        
        const writeStream = fs.createWriteStream(filePath);
        const docCopy = new PDFDocument({ margin: 30 });
        docCopy.pipe(writeStream);
        
        // Replica o conteúdo para a cópia salva
        docCopy.fontSize(20).text('Relatório de Tarefas', { align: 'center' });
        docCopy.moveDown();
        docCopy.fontSize(10).text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'right' });
        docCopy.moveDown();
        
        // Conteúdo da tabela (simplificado)
        docCopy.fontSize(10).text('Conteúdo do relatório salvo no servidor', { align: 'center' });
        docCopy.moveDown();
        docCopy.end();
        
        // Registra na timeline
        try {
          await TaskTimeline.create({
            action: 'report_generated',
            details: {
              reportType: 'PDF',
              fileName,
              tasksCount: tasks.length,
              generatedAt: new Date(),
              filePath: `/public/company${companyId}/reports/${fileName}`
            }
          });
          logger.info(`Relatório PDF salvo e registrado: ${filePath}`);
        } catch (timelineError) {
          logger.error('Erro ao registrar geração de relatório na timeline:', timelineError);
        }
      }

      // Configuração da resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=tarefas.pdf`);

      doc.pipe(res);
      doc.end();
      logger.info('Exportação para PDF concluída com sucesso');

    } catch (error) {
      logger.error('Erro ao exportar tarefas para PDF:', {
        error: error.message,
        stack: error.stack,
        tasksCount: tasks?.length
      });
      throw error;
    }
  }

  public static async exportToExcel(tasks: ExportTask[], res: Response, companyId?: number): Promise<void> {
    try {
      logger.info('Iniciando exportação para Excel', { tasksCount: tasks.length, companyId });
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'AutoAtende';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet('Tarefas', {
        properties: {
          tabColor: { argb: '3498DB' }
        }
      });

      // Adiciona cabeçalhos
      worksheet.columns = Object.keys(tasks[0] || {}).map(header => ({
        header,
        key: header,
        width: Math.max(15, header.length + 2)
      }));

      // Adiciona dados
      worksheet.addRows(tasks);

      // Formata os cabeçalhos
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3498DB' }
      };
      headerRow.alignment = { horizontal: 'center' };
      
      // Formata as células de conteúdo
      for (let i = 2; i <= tasks.length + 1; i++) {
        const row = worksheet.getRow(i);
        
        // Alterna cores de fundo para melhor legibilidade
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF' }
        };
        
        // Formata a coluna de status
        const statusCell = row.getCell('Status');
        if (statusCell.value === 'Concluída') {
          statusCell.font = { color: { argb: '27AE60' } };
        } else if (statusCell.value === 'Atrasada') {
          statusCell.font = { color: { argb: 'E74C3C' } };
        }
        
        // Ajusta alinhamento de datas
        const dueDateCell = row.getCell('Data de Vencimento');
        dueDateCell.alignment = { horizontal: 'center' };
        
        const createdAtCell = row.getCell('Criado em');
        createdAtCell.alignment = { horizontal: 'center' };
        
        const updatedAtCell = row.getCell('Atualizado em');
        updatedAtCell.alignment = { horizontal: 'center' };
      }

      // Adicionar filtros
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: worksheet.columns.length }
      };

      // Ajustar largura das colunas com base no conteúdo
      worksheet.columns.forEach(column => {
        const maxLength = [
          column.header?.length || 0,
          ...worksheet.getColumn(column.key).values
            .filter(value => value !== null)
            .map(value => String(value).length)
        ].reduce((max, length) => Math.max(max, length), 0);
        
        column.width = Math.min(maxLength + 2, 50);
      });

      // Congelar linha de cabeçalho
      worksheet.views = [
        { state: 'frozen', ySplit: 1, activeCell: 'A2' }
      ];

      // Salvar uma cópia no servidor se tiver companyId
      if (companyId) {
        const fileName = `tarefas_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
        const filePath = path.resolve(uploadConfig.directory, `company${companyId}`, 'reports', fileName);
        
        // Criar diretório se não existir
        const reportsDir = path.resolve(uploadConfig.directory, `company${companyId}`, 'reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
          logger.info(`Diretório de relatórios criado: ${reportsDir}`);
        }
        
        await workbook.xlsx.writeFile(filePath);
        logger.info(`Arquivo Excel salvo: ${filePath}`);
        
        // Registra na timeline
        try {
          await TaskTimeline.create({
            action: 'report_generated',
            details: {
              reportType: 'Excel',
              fileName,
              tasksCount: tasks.length,
              generatedAt: new Date(),
              filePath: `/public/company${companyId}/reports/${fileName}`
            }
          });
          logger.info(`Relatório Excel salvo e registrado: ${filePath}`);
        } catch (timelineError) {
          logger.error('Erro ao registrar geração de relatório na timeline:', timelineError);
        }
      }

      // Configuração da resposta
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=tarefas.xlsx'
      );

      await workbook.xlsx.write(res);
      logger.info('Exportação para Excel concluída com sucesso');

    } catch (error) {
      logger.error('Erro ao exportar tarefas para Excel:', {
        error: error.message,
        stack: error.stack,
        tasksCount: tasks?.length
      });
      throw error;
    }
  }
  
  public static async generateTasksForExport(
    companyId: number,
    filters: any = {}
  ): Promise<ExportTask[]> {
    try {
      logger.info('Gerando dados de tarefas para exportação', {
        companyId,
        filters
      });
      
      // Prepara consulta com filtros
      const whereClause: any = {
        companyId,
        deleted: false // Ignora tarefas excluídas
      };
      
      // Aplicar filtros adicionais
      if (filters.status === 'completed') {
        whereClause.done = true;
      } else if (filters.status === 'pending') {
        whereClause.done = false;
      } else if (filters.status === 'overdue') {
        whereClause.done = false;
        whereClause.dueDate = { [Op.lt]: new Date() };
      }
      
      if (filters.startDate && filters.endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
        };
      } else if (filters.startDate) {
        whereClause.createdAt = { [Op.gte]: new Date(filters.startDate) };
      } else if (filters.endDate) {
        whereClause.createdAt = { [Op.lte]: new Date(filters.endDate) };
      }
      
      if (filters.userId) {
        whereClause.responsibleUserId = filters.userId;
      }
      
      if (filters.categoryId) {
        whereClause.taskCategoryId = filters.categoryId;
      }
      
      if (filters.employerId) {
        whereClause.employerId = filters.employerId;
      }
      
      if (filters.subjectId) {
        whereClause.subjectId = filters.subjectId;
      }
      
      // Buscar tarefas com relacionamentos
      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          { 
            model: User,
            as: 'responsible',
            attributes: ['id', 'name']
          },
          { 
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          },
          { 
            model: TaskCategory,
            as: 'taskCategory',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 1000 // Limita quantidade para evitar problemas de memória
      });
      
      // Transforma dados para o formato de exportação
      const exportTasks: ExportTask[] = tasks.map(task => {
        let status = 'Pendente';
        if (task.done) {
          status = 'Concluída';
        } else if (task.inProgress) {
          status = 'Em Progresso';
        } else if (task.dueDate && new Date(task.dueDate) < new Date()) {
          status = 'Atrasada';
        }
        
        const formatDate = (date: Date | null | undefined) => {
          if (!date) return '';
          return new Date(date).toLocaleDateString('pt-BR');
        };
        
        return {
          ID: task.id,
          Título: task.title,
          Descrição: task.text || '',
          Status: status,
          Responsável: task.responsible?.name || '',
          Categoria: task.taskCategory?.name || '',
          'Data de Vencimento': formatDate(task.dueDate),
          'Criado por': task.creator?.name || '',
          'Criado em': formatDate(task.createdAt),
          'Atualizado em': formatDate(task.updatedAt)
        };
      });
      
      logger.info(`Dados para exportação gerados com sucesso: ${exportTasks.length} tarefas`);
      return exportTasks;
      
    } catch (error) {
      logger.error('Erro ao gerar dados para exportação:', {
        error: error.message,
        stack: error.stack,
        companyId,
        filters
      });
      throw error;
    }
  }
}

export default TaskExportService;