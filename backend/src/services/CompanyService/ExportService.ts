import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Company from '../../models/Company';
import { Readable } from 'stream';

// Função auxiliar para converter stream em buffer
const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

export const exportToPdf = async (companies: Company[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      doc.fontSize(16).text('Relatório de Empresas', { align: 'center' });
      doc.moveDown();

      companies.forEach(company => {
        doc.fontSize(12).text(`Nome: ${company.name}`);
        doc.fontSize(10).text(`Email: ${company.email}`);
        doc.fontSize(10).text(`Status: ${company.status ? 'Ativo' : 'Bloqueado'}`);
        doc.fontSize(10).text(`Plano: ${company.plan?.name || 'N/A'}`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const exportToExcel = async (companies: Company[]): Promise<Buffer> => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Empresas');

    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Plano', key: 'plan', width: 20 },
      { header: 'Criado em', key: 'createdAt', width: 20 }
    ];

    companies.forEach(company => {
      worksheet.addRow({
        name: company.name,
        email: company.email,
        status: company.status ? 'Ativo' : 'Bloqueado',
        plan: company.plan?.name || 'N/A',
        createdAt: format(new Date(company.createdAt), 'dd/MM/yyyy', { locale: ptBR })
      });
    });

    const buffer = await workbook.xlsx.writeBuffer() as Buffer;
    return buffer;
  } catch (error) {
    throw new Error(`Erro ao gerar arquivo Excel: ${error.message}`);
  }
};

// Função para determinar o tipo de exportação
export const exportCompanies = async (
  companies: Company[], 
  format: 'pdf' | 'excel'
): Promise<{ buffer: Buffer; mimeType: string; filename: string }> => {
  try {
    if (format === 'pdf') {
      const buffer = await exportToPdf(companies);
      return {
        buffer,
        mimeType: 'application/pdf',
        filename: 'empresas.pdf'
      };
    } else {
      const buffer = await exportToExcel(companies);
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'empresas.xlsx'
      };
    }
  } catch (error) {
    throw new Error(`Erro na exportação: ${error.message}`);
  }
};