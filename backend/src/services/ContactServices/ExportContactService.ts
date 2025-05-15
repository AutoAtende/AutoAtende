import { Response } from 'express';
import Contact from '../../models/Contact';
import ContactCustomField from '../../models/ContactCustomField';
import * as XLSX from 'xlsx';
import { logger } from '../../utils/logger';
import AppError from '../../errors/AppError';

interface ExportOptions {
  type: 'csv' | 'xls';
  isFullContact: boolean;
  companyId: number;
}

export class ExportContactService {
  public async execute({
    type,
    isFullContact,
    companyId
  }: ExportOptions): Promise<Buffer> {
    try {
      logger.info(`Iniciando exportação de contatos. Tipo: ${type}, Empresa: ${companyId}, Modo: ${isFullContact ? 'completo' : 'básico'}`);

      const contacts = await Contact.findAll({
        where: { companyId },
        include: isFullContact ? [{
          model: ContactCustomField,
          as: 'extraInfo'
        }] : [],
        raw: false,
        nest: true
      });

      logger.info(`${contacts.length} contatos encontrados para exportação`);

      // Formata os dados para garantir compatibilidade com importação
      const formattedContacts = contacts.map(contact => {
        const baseData = {
          nome: contact.name || '',
          numero: contact.number || '',
          email: contact.email || ''
        };

        if (!isFullContact) return baseData;

        // Para contatos completos, inclui campos extras como colunas individuais
        const extraFields = {};
        if (contact.extraInfo?.length) {
          contact.extraInfo.forEach(info => {
            // Garante que o nome do campo extra seja válido como coluna
            const fieldName = info.name.trim().replace(/[^\w\s-]/g, '_');
            extraFields[fieldName] = info.value;
          });
        }

        return {
          ...baseData,
          ...extraFields
        };
      });

      let buffer: Buffer;
      switch (type) {
        case 'csv':
          buffer = this.exportToCSV(formattedContacts);
          logger.info('Exportação CSV concluída com sucesso');
          break;
        case 'xls':
          buffer = this.exportToXLS(formattedContacts);
          logger.info('Exportação XLS concluída com sucesso');
          break;
        default:
          throw new AppError('Tipo de exportação inválido');
      }

      return buffer;
    } catch (error) {
      logger.error(`Erro na exportação: ${error.message}`);
      throw new AppError(`Erro ao exportar contatos: ${error.message}`);
    }
  }

  private exportToCSV(contacts: any[]): Buffer {
    try {
      // Identifica todas as colunas, incluindo campos extras
      const allColumns = new Set<string>();
      contacts.forEach(contact => {
        Object.keys(contact).forEach(key => allColumns.add(key));
      });
  
      // Garante que as colunas básicas apareçam primeiro
      const baseColumns = ['nome', 'numero', 'email'];
      const extraColumns = Array.from(allColumns).filter(col => !baseColumns.includes(col));
      const orderedColumns = [...baseColumns, ...extraColumns];
  
      const csvRows = [
        // Cabeçalho com aspas duplas
        orderedColumns.map(col => `"${col}"`).join(';'),
        // Linhas de dados
        ...contacts.map(contact => 
          orderedColumns.map(column => {
            const value = (contact[column] || '').toString().trim();
            // Sempre envolve em aspas duplas, escapando aspas internas
            return `"${value.replace(/"/g, '""')}"`;
          }).join(';')
        )
      ];
  
      // Adiciona BOM para correta identificação de UTF-8 no Excel
      return Buffer.from('\ufeff' + csvRows.join('\n'), 'utf8');
    } catch (error) {
      logger.error(`Erro ao gerar CSV: ${error.message}`);
      throw new AppError('Erro ao gerar arquivo CSV');
    }
  }

  private exportToXLS(contacts: any[]): Buffer {
    try {
      // Cria planilha
      const worksheet = XLSX.utils.json_to_sheet(contacts, {
        header: ['nome', 'numero', 'email', ...Object.keys(contacts[0] || {}).filter(k => !['nome', 'numero', 'email'].includes(k))]
      });

      // Ajusta largura das colunas
      const columnWidths = {};
      XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 }).forEach(row => {
        row.forEach((cell: any, i: number) => {
          const cellString = cell?.toString() || '';
          const columnWidth = cellString.length;
          columnWidths[i] = Math.max(columnWidths[i] || 0, columnWidth);
        });
      });

      worksheet['!cols'] = Object.keys(columnWidths).map(i => ({
        wch: Math.min(Math.max(columnWidths[i], 10), 50) // min 10, max 50 caracteres
      }));

      // Cria workbook e adiciona a planilha
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');

      return XLSX.write(workbook, { 
        type: 'buffer',
        bookType: 'xlsx',
        bookSST: false,
        compression: true
      });
    } catch (error) {
      logger.error(`Erro ao gerar XLS: ${error.message}`);
      throw new AppError('Erro ao gerar arquivo XLS');
    }
  }
}

// Método adicional para exportação completa em JSON (opcional, para backup)
export const ExportFullContactsService = async (
  companyId: number,
  res: Response
): Promise<void> => {
  try {
    logger.info(`Iniciando exportação completa JSON. Empresa: ${companyId}`);

    const contacts = await Contact.findAll({
      where: { companyId },
      include: [{
        model: ContactCustomField,
        as: 'extraInfo'
      }],
      raw: false,
      nest: true
    });

    const exportData = contacts.map(contact => ({
      name: contact.name,
      number: contact.number,
      email: contact.email || '',
      extraInfo: contact.extraInfo || []
    }));

    const jsonContent = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonContent, 'utf8');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="contatos_${companyId}_${Date.now()}.json"`);
    res.setHeader('Content-Length', buffer.length);

    res.end(buffer);
    
    logger.info(`Exportação JSON concluída. ${contacts.length} contatos exportados`);
  } catch (error) {
    logger.error(`Erro na exportação JSON: ${error.message}`);
    throw new AppError(`Erro ao exportar contatos: ${error.message}`);
  }
}