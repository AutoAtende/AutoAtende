import Whatsapp from '../../models/Whatsapp';
import Contact from '../../models/Contact';
import ContactCustomField from '../../models/ContactCustomField';
import { getIO } from '../../libs/socket';
import CheckContactNumber from '../../helpers/CheckContactNumber';
import { Transaction, QueryTypes } from 'sequelize';
import sequelize from '../../database';
import * as XLSX from 'xlsx';
import csv from 'csv-parse';
import { getWbot } from '../../libs/wbot';
import { promises as fs } from 'fs';
import { logger } from '../../utils/logger';
import AppError from '../../errors/AppError';
import ShowBaileysService from 'services/BaileysServices/ShowBaileysService';
import axios from 'axios';

// Interfaces para records
interface BaseRecord {
  [key: string]: any;
}

interface ImportRecord extends BaseRecord {
  nome?: string;
  Nome?: string;
  name?: string;
  Name?: string;
  numero?: string;
  Numero?: string;
  number?: string;
  Number?: string;
  email?: string;
  Email?: string;
  'e-mail'?: string;
  'E-mail'?: string;
}

interface CSVRecord extends BaseRecord {
  nome: string;
  numero: string;
  email?: string;
}

// Interface para dados processados
interface ContactData {
  name: string;
  number: string;
  email?: string;
  companyId: number;
  extraInfo?: Record<string, string>;
}

interface ImportOptions {
  type: 'phone' | 'csv' | 'xls';
  file?: Express.Multer.File;
  connectionId?: number;
  isFullContact?: boolean | string;
  companyId: number;
}

interface ImportResult {
  jobId: string;
  totalProcessed: number;
  validContacts: number;
  invalidContacts: number;
}

// Adicione uma função para tratar URLs de imagem
const sanitizeProfilePicUrl = async (url: string): Promise<string> => {
  if (!url) return '';
  
  try {
    // Adiciona timeout de 5 segundos para evitar travamento
    const response = await axios.get(url, {
      timeout: 5000,
      responseType: 'json' // Só verifica se a URL é válida
    });
    
    if (response.status === 200) {
      return url;
    }
    return '';
  } catch (error) {
    logger.warn(`Error checking profile pic URL: ${error.message}`);
    return '';
  }
};

export class ImportContactService {
  public async execute({
    type,
    file,
    connectionId,
    isFullContact,
    companyId
  }: ImportOptions): Promise<ImportResult> {
    const jobId = `import-${Date.now()}`;
    // Converte isFullContact para boolean de forma segura
    const isFullContactBool = isFullContact === true || isFullContact === 'true';
  
    try {
      switch (type) {
        case 'phone':
          return await this.importFromPhone(connectionId, companyId, jobId);
        case 'csv':
          return await this.importFromCSV(file, isFullContactBool, companyId, jobId);
        case 'xls':
          return await this.importFromXLS(file, isFullContactBool, companyId, jobId);
        default:
          throw new AppError('Tipo de importação inválido');
      }
    } catch (error) {
      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "error",
        error: error.message
      });
      throw error;
    }
  }

  private async importFromPhone(
    connectionId: number,
    companyId: number,
    jobId: string
  ): Promise<ImportResult> {
    const io = getIO();
    let totalProcessed = 0;
    let validContacts = 0;
    let invalidContacts = 0;
  
    try {
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "progress",
        data: { 
          percentage: 0, 
          message: "Iniciando importação...",
          processed: 0,
          valid: 0,
          invalid: 0
        }
      });
  
      const whatsappInstance = await Whatsapp.findOne({
        where: { id: connectionId, companyId }
      });
  
      if (!whatsappInstance) {
        throw new AppError('Conexão não encontrada');
      }
  
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "progress",
        data: { 
          percentage: 25,
          message: "Obtendo contatos do WhatsApp...",
          processed: 0,
          valid: 0,
          invalid: 0
        }
      });
  
      const baileys = await ShowBaileysService(whatsappInstance.id);
      if (!baileys?.contacts) {
        throw new AppError('Nenhum contato encontrado para importar');
      }
  
      const contacts = JSON.parse(baileys.contacts);
      const validContactsList = contacts.filter(contact => 
        contact.id && 
        contact.id !== "status@broadcast" && 
        !contact.id.includes("g.us")
      ).map(contact => ({
        number: contact.id.replace(/[^\d]/g, ""),
        name: contact.notify || contact.name || '',
        companyId
      }));
  
      totalProcessed = validContactsList.length;
      validContacts = validContactsList.length;
  
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "progress",
        data: { 
          percentage: 50,
          message: "Salvando contatos...",
          processed: totalProcessed,
          valid: validContacts,
          invalid: invalidContacts
        }
      });
  
      const transaction = await sequelize.transaction();
  
      try {
        await sequelize.query(`
          CREATE TEMP TABLE temp_contacts (
            number VARCHAR(255),
            name VARCHAR(255),
            company_id INTEGER
          ) ON COMMIT DROP
        `, { transaction });
  
        if (validContactsList.length > 0) {
          const values = validContactsList
            .map(c => `('${c.number}', '${c.name.replace(/'/g, "''")}', ${companyId})`)
            .join(',');
  
          await sequelize.query(`
            INSERT INTO temp_contacts (number, name, company_id)
            VALUES ${values}
          `, { transaction });
        }
  
          // No método importFromPhone, substitua a query de inserção por:
          await sequelize.query(`
            INSERT INTO "Contacts" (number, name, "companyId", "createdAt", "updatedAt")
            SELECT DISTINCT ON (t.number, t.company_id) 
              t.number,
              t.name,
              t.company_id,
              NOW(),
              NOW()
            FROM temp_contacts t
            ON CONFLICT (number, "companyId")
            DO UPDATE SET
              name = EXCLUDED.name,
              "updatedAt" = NOW()
            WHERE "Contacts".name <> EXCLUDED.name
          `, { transaction });
  
        await transaction.commit();
  
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
          jobId,
          action: "complete",
          data: {
            message: `Importação concluída! ${validContacts} contatos importados.`,
            totalProcessed,
            validContacts,
            invalidContacts
          }
        });
  
        return {
          jobId,
          totalProcessed,
          validContacts,
          invalidContacts
        };
  
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
  
    } catch (error) {
      logger.error('Erro na importação:', error);
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "error",
        error: error.message
      });
      throw error;
    }
  }

  private async importFromCSV(
    file: Express.Multer.File,
    isFullContact: boolean,
    companyId: number,
    jobId: string
  ): Promise<ImportResult> {
    const io = getIO();
    let totalProcessed = 0;
    let validContacts = 0;
    let invalidContacts = 0;
  
    try {
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "progress",
        data: { 
          percentage: 0,
          message: "Iniciando importação do CSV...",
          processed: 0,
          valid: 0,
          invalid: 0
        }
      });
  
      const fileContent = await fs.readFile(file.path, { encoding: 'utf-8' });
  
      return new Promise((resolve, reject) => {
        csv.parse(fileContent, {
          delimiter: ';',
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
          quote: '"',
          escape: '"',
          relax_column_count: true,
          relax_quotes: true,
          encoding: 'utf-8'
        }, async (err, records: ImportRecord[]) => {
          if (err) {
            reject(new AppError(`Erro ao processar CSV: ${err.message}`));
            return;
          }
  
          const transaction = await sequelize.transaction();
  
          try {
            await sequelize.query(`
              CREATE TEMP TABLE temp_contacts (
                number VARCHAR(255),
                name VARCHAR(255),
                email VARCHAR(255),
                company_id INTEGER
                ${isFullContact ? ',extra_info JSONB' : ''}
              ) ON COMMIT DROP
            `, { transaction });
  
            const totalRecords = records.length;
            
            for (let i = 0; i < records.length; i++) {
              const record = records[i];
              const percentage = Math.round((i / totalRecords) * 100);
              
              try {
                // Remove aspas extras e espaços dos valores
                const numberValue = (record.numero || record.Numero || record.number || record.Number || '').toString().trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                const nameValue = (record.nome || record.Nome || record.name || record.Name || '').toString().trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                const emailValue = (record.email || record.Email || record['e-mail'] || record['E-mail'] || '').toString().trim().replace(/^"|"$/g, '').replace(/""/g, '"');
  
                if (!nameValue || !numberValue) {
                  invalidContacts++;
                  continue;
                }
  
                const number = await CheckContactNumber(String(numberValue), companyId);
                
                if (number.exists) {
                  const contactData: ContactData = {
                    name: nameValue,
                    number: number.jid.replace(/\D/g, ""),
                    email: emailValue || undefined,
                    companyId
                  };
  
                  if (isFullContact) {
                    const extraInfo: Record<string, string> = {};
                    Object.entries(record).forEach(([key, value]) => {
                      const lowerKey = key.toLowerCase();
                      if (!['nome', 'numero', 'email', 'number', 'name'].includes(lowerKey)) {
                        // Limpa e processa valores dos campos extras
                        const cleanValue = String(value).trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                        extraInfo[key] = cleanValue;
                      }
                    });
                    contactData.extraInfo = extraInfo;
                  }
  
                  await sequelize.query(`
                    INSERT INTO temp_contacts (number, name, email, company_id${isFullContact ? ', extra_info' : ''})
                    VALUES ($1, $2, $3, $4${isFullContact ? ', $5' : ''})
                  `, { 
                    bind: isFullContact ? 
                      [contactData.number, contactData.name, contactData.email, companyId, contactData.extraInfo] :
                      [contactData.number, contactData.name, contactData.email, companyId],
                    transaction 
                  });
  
                  validContacts++;
                } else {
                  invalidContacts++;
                }
  
                totalProcessed++;
  
                if (i % 10 === 0 || i === records.length - 1) {
                  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
                    jobId,
                    action: "progress",
                    data: { 
                      percentage,
                      message: "Processando contatos...",
                      processed: totalProcessed,
                      valid: validContacts,
                      invalid: invalidContacts
                    }
                  });
                }
              } catch (error) {
                logger.error(`Erro ao processar linha ${i + 1}:`, error);
                invalidContacts++;
              }
            }
  
            // Insere os contatos processados
            await sequelize.query(`
              INSERT INTO "Contacts" (number, name, email, "companyId", "createdAt", "updatedAt")
              SELECT 
                t.number,
                t.name,
                t.email,
                t.company_id,
                NOW(),
                NOW()
              FROM temp_contacts t
              ON CONFLICT (number, "companyId")
              DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                "updatedAt" = NOW()
              RETURNING id, number
            `, { transaction });
  
            // Se for importação completa, processa os campos extras
            if (isFullContact) {
              await sequelize.query(`
                INSERT INTO "ContactCustomFields" ("contactId", name, value, "createdAt", "updatedAt")
                SELECT 
                  c.id,
                  key,
                  value,
                  NOW(),
                  NOW()
                FROM temp_contacts t
                JOIN "Contacts" c ON c.number = t.number AND c."companyId" = t.company_id,
                jsonb_each_text(t.extra_info) AS fields(key, value)
                ON CONFLICT ("contactId", name)
                DO UPDATE SET
                  value = EXCLUDED.value,
                  "updatedAt" = NOW()
              `, { transaction });
            }
  
            await transaction.commit();
  
            io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
              jobId,
              action: "complete",
              data: {
                message: `Importação concluída! ${validContacts} contatos importados.`,
                totalProcessed,
                validContacts,
                invalidContacts
              }
            });
  
            resolve({
              jobId,
              totalProcessed,
              validContacts,
              invalidContacts
            });
  
          } catch (error) {
            await transaction.rollback();
            reject(error);
          }
        });
      });
  
    } catch (error) {
      logger.error('Erro na importação CSV:', error);
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "error",
        error: error.message
      });
      throw error;
    } finally {
      await fs.unlink(file.path).catch(err => 
        logger.error(`Erro ao remover arquivo temporário: ${err.message}`)
      );
    }
  }
  
  private async importFromXLS(
    file: Express.Multer.File,
    isFullContact: boolean,
    companyId: number,
    jobId: string
  ): Promise<ImportResult> {
    const io = getIO();
    let totalProcessed = 0;
    let validContacts = 0;
    let invalidContacts = 0;
  
    try {
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "progress",
        data: { 
          progress: 0,
          message: "Iniciando importação da planilha...",
          details: {
            processed: 0,
            valid: 0,
            invalid: 0
          }
        }
      });
  
      const workbook = XLSX.readFile(file.path);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json<ImportRecord>(worksheet);
  
      const transaction = await sequelize.transaction();
  
      try {
        await sequelize.query(`
          CREATE TEMP TABLE temp_contacts (
            number VARCHAR(255),
            name VARCHAR(255),
            email VARCHAR(255),
            company_id INTEGER
            ${isFullContact ? ',extra_info JSONB' : ''}
          ) ON COMMIT DROP
        `, { transaction });
  
        const totalRecords = records.length;
  
        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const percentage = Math.round((i / totalRecords) * 100);
  
          try {
            const numberValue = record.numero || record.Numero || record.number || record.Number;
            const nameValue = record.nome || record.Nome || record.name || record.Name;
            const emailValue = record.email || record.Email || record['e-mail'] || record['E-mail'];
  
            if (!nameValue || !numberValue) {
              invalidContacts++;
              continue;
            }
  
            const number = await CheckContactNumber(String(numberValue), companyId);
            
            if (number.exists) {
              const contactData: ContactData = {
                name: String(nameValue).trim(),
                number: number.jid.replace(/\D/g, ""),
                email: emailValue ? String(emailValue).trim() : undefined,
                companyId
              };
  
              if (isFullContact) {
                const extraInfo: Record<string, string> = {};
                Object.entries(record).forEach(([key, value]) => {
                  const lowerKey = key.toLowerCase();
                  if (!['nome', 'numero', 'email', 'number', 'name'].includes(lowerKey)) {
                    extraInfo[key] = String(value);
                  }
                });
                contactData.extraInfo = extraInfo;
              }
  
              await sequelize.query(`
                INSERT INTO temp_contacts (number, name, email, company_id${isFullContact ? ', extra_info' : ''})
                VALUES ($1, $2, $3, $4${isFullContact ? ', $5' : ''})
              `, { 
                bind: isFullContact ? 
                  [contactData.number, contactData.name, contactData.email, companyId, contactData.extraInfo] :
                  [contactData.number, contactData.name, contactData.email, companyId],
                transaction 
              });
  
              validContacts++;
            } else {
              invalidContacts++;
            }
  
            totalProcessed++;
  
            if (i % 10 === 0) {
              io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
                jobId,
                action: "progress",
                data: { 
                  percentage,
                  message: "Processando contatos...",
                  processed: totalProcessed,
                  valid: validContacts,
                  invalid: invalidContacts
                }
              });
            }
          } catch (error) {
            logger.error(`Erro ao processar linha ${i + 1}:`, error);
            invalidContacts++;
          }
        }
  
        await sequelize.query(`
          INSERT INTO "Contacts" (number, name, email, "companyId", "createdAt", "updatedAt")
          SELECT 
            t.number,
            t.name,
            t.email,
            t.company_id,
            NOW(),
            NOW()
          FROM temp_contacts t
          ON CONFLICT (number, "companyId")
          DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            "updatedAt" = NOW()
        `, { transaction });
  
        if (isFullContact) {
          await sequelize.query(`
            INSERT INTO "ContactCustomFields" ("contactId", name, value, "createdAt", "updatedAt")
            SELECT 
              c.id,
              key,
              value,
              NOW(),
              NOW()
            FROM temp_contacts t
            JOIN "Contacts" c ON c.number = t.number AND c."companyId" = t.company_id,
            jsonb_each_text(t.extra_info) AS fields(key, value)
            ON CONFLICT ("contactId", name)
            DO UPDATE SET
              value = EXCLUDED.value,
              "updatedAt" = NOW()
          `, { transaction });
        }
  
        await transaction.commit();
  
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
          jobId,
          action: "complete",
          data: {
            message: `Importação concluída! ${validContacts} contatos importados.`,
            totalProcessed,
            validContacts,
            invalidContacts
          }
        });
  
        return {
          jobId,
          totalProcessed,
          validContacts,
          invalidContacts
        };
  
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
  
    } catch (error) {
      logger.error('Erro na importação XLS:', error);
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "error",
        error: error.message
      });
      throw error;
    } finally {
      await fs.unlink(file.path).catch(err => 
        logger.error(`Erro ao remover arquivo temporário: ${err.message}`)
      );
    }
  }

}