import XLSX from 'xlsx';
import { Response } from 'express';
import { logger } from "../../utils/logger";
import ContactListItem from "../../models/ContactListItem";

export async function ExportContacts(
  contactListId: number,
  companyId: number,
  res: Response
) {
  try {
    logger.info(`Iniciando exportação de contatos. ContactListId: ${contactListId}, CompanyId: ${companyId}`);

    const contacts = await ContactListItem.findAll({
      where: {
        contactListId,
        companyId
      },
      attributes: ['name', 'number']
    });

    logger.info(`Número de contatos encontrados: ${contacts.length}`);

    // Prepara os dados para o Excel
    const worksheet = XLSX.utils.json_to_sheet(
      contacts.map(contact => ({
        Nome: contact.name,
        Número: contact.number
      }))
    );

    // Cria o workbook e adiciona a worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');

    // Configura o response
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=contatos_${contactListId}.xlsx`
    );

    // Gera o buffer e envia
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    logger.info(`Arquivo de exportação gerado com sucesso`);
    
    return buffer;
  } catch (err) {
    logger.error('Erro durante a exportação de contatos:', err);
    throw err;
  }
}