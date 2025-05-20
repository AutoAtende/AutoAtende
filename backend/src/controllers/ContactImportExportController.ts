import { Request, Response } from "express";
import { ImportContactService } from "../services/ContactServices/ImportContactService";
import { ExportContactService } from "../services/ContactServices/ExportContactService";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import ContactEmployer from "../models/ContactEmployer";
import ContactPosition from "../models/ContactPosition";
import { Op } from "sequelize";
import EmployerPosition from "../models/EmployerPosition";
import { v4 as uuidv4 } from 'uuid';

interface MappingFields {
  name: string;
  number: string;
  email?: string;
  company?: string;
  position?: string;
}

interface ExtraFieldMappings {
  [key: string]: string;
}

// Função autônoma para processar importações com mapeamentos
async function processImportWithMappings(
  jobId: string,
  type: string,
  file: Express.Multer.File,
  companyId: number,
  isFullContact: boolean,
  mappings: MappingFields,
  extraFieldMappings?: ExtraFieldMappings
): Promise<void> {
  const io = getIO();
  let totalProcessed = 0;
  let validCount = 0;
  let errorCount = 0;
  const errors = [];

  // Emitir progresso inicial
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

  try {
    // Lê o arquivo
    const fileData = await readFile(file, type);
    
    if (!fileData || fileData.length === 0) {
      throw new Error("Arquivo vazio ou inválido");
    }

    // Processa os registros em lotes para melhor performance
    const batchSize = 50;
    const totalBatches = Math.ceil(fileData.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batch = fileData.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
      
      // Emitir progresso por lote
      const percentage = Math.round(((batchIndex) / totalBatches) * 100);
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
        jobId,
        action: "progress",
        data: {
          percentage,
          message: `Processando lote ${batchIndex + 1} de ${totalBatches}...`,
          processed: totalProcessed,
          valid: validCount,
          invalid: errorCount
        }
      });

      // Processa cada registro no lote
      for (const record of batch) {
        try {
          // Extrair dados com base no mapeamento
          if (!mappings.name || !mappings.number) {
            throw new Error("Mapeamento de campos obrigatórios não definido");
          }

          const name = record[mappings.name]?.toString().trim();
          const number = record[mappings.number]?.toString().trim().replace(/\D/g, "");
          
          // Verificações básicas
          if (!name || !number) {
            errorCount++;
            continue;
          }

          // Preparar dados do contato
          const contactData: any = {
            name,
            number,
            email: mappings.email ? record[mappings.email]?.toString().trim() : '',
            companyId
          };

          // Processa empresa, se mapeada
          let employerId = null;
          if (mappings.company && record[mappings.company]) {
            const companyName = record[mappings.company].toString().trim();
            if (companyName) {
              // Busca ou cria a empresa
              const [employer] = await ContactEmployer.findOrCreate({
                where: { 
                  name: companyName,
                  companyId 
                },
                defaults: { 
                  name: companyName,
                  companyId 
                }
              });
              employerId = employer.id;
              contactData.employerId = employerId;
            }
          }

          // Processa cargo, se mapeado
          if (mappings.position && record[mappings.position]) {
            const positionName = record[mappings.position].toString().trim();
            if (positionName) {
              // Busca ou cria o cargo
              const [position] = await ContactPosition.findOrCreate({
                where: { name: positionName },
                defaults: { name: positionName }
              });
              
              contactData.positionId = position.id;
              
              // Se tiver empresa, cria relação entre empresa e cargo
              if (employerId) {
                await EmployerPosition.findOrCreate({
                  where: {
                    employerId,
                    positionId: position.id,
                    companyId
                  },
                  defaults: {
                    employerId,
                    positionId: position.id,
                    companyId
                  }
                });
              }
            }
          }
          
          // Verifica se o contato já existe
          const [contact, created] = await Contact.findOrCreate({
            where: { 
              number: contactData.number,
              companyId
            },
            defaults: contactData
          });

          // Se o contato já existia, atualiza os dados
          if (!created) {
            await contact.update({
              name: contactData.name || contact.name,
              email: contactData.email || contact.email,
              employerId: contactData.employerId !== undefined ? contactData.employerId : contact.employerId,
              positionId: contactData.positionId !== undefined ? contactData.positionId : contact.positionId
            });
          }

          // Se for contato completo e tiver campos extras
          if (isFullContact && extraFieldMappings && Object.keys(extraFieldMappings).length > 0) {
            // Processa cada campo extra
            for (const [fieldKey, headerName] of Object.entries(extraFieldMappings)) {
              if (headerName && record[headerName]) {
                const fieldName = fieldKey.replace('extraField', '');
                const fieldValue = record[headerName].toString().trim();
                
                if (fieldValue) {
                  // Busca ou cria o campo personalizado
                  await ContactCustomField.findOrCreate({
                    where: {
                      contactId: contact.id,
                      name: fieldName,
                      companyId
                    },
                    defaults: {
                      contactId: contact.id,
                      name: fieldName,
                      value: fieldValue,
                      companyId
                    }
                  });
                }
              }
            }
          }

          validCount++;
        } catch (error) {
          logger.error(`Erro ao processar registro: ${error.message}`, { record });
          errors.push({
            message: `Erro ao processar registro: ${error.message}`,
            details: JSON.stringify(record)
          });
          errorCount++;
        }
        
        totalProcessed++;
      }
    }

    // Emite evento de conclusão
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
      jobId,
      action: "complete",
      data: {
        message: `Importação concluída! ${validCount} contatos importados.`,
        total: totalProcessed,
        successful: validCount,
        failed: errorCount,
        errors: errors.slice(0, 50) // Limita a quantidade de erros retornados
      }
    });
    
    logger.info({
      message: "Importação concluída",
      companyId,
      jobId,
      total: totalProcessed,
      successful: validCount,
      failed: errorCount
    });
    
  } catch (error) {
    logger.error({
      message: "Erro na importação",
      companyId,
      jobId,
      error: error.message
    });
    
    // Emite evento de erro - GARANTIR QUE ISSO SEMPRE SEJA EXECUTADO
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
      jobId,
      action: "error",
      error: error.message
    });
  }
}

// Função auxiliar para ler arquivos
async function readFile(file: Express.Multer.File, type: string): Promise<any[]> {
  // Implementação da leitura de CSV, XLS, etc.
  const { parse } = await import('papaparse');
  const XLSX = await import('xlsx');
  const fs = await import('fs');
  
  return new Promise((resolve, reject) => {
    try {
      if (type === 'csv') {
        // Ler CSV com PapaParse
        fs.readFile(file.path, { encoding: 'utf-8' }, (err, fileContent) => {
          if (err) {
            return reject(new Error(`Erro ao ler arquivo: ${err.message}`));
          }
          
          parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            delimiter: ';', // Define o separador como ponto e vírgula
            complete: (results) => {
              resolve(results.data);
            },
            error: (error) => {
              reject(new Error(`Erro ao analisar CSV: ${error.message}`));
            }
          });
        });
      } else if (type === 'xls') {
        // Ler XLS/XLSX com SheetJS
        try {
          const workbook = XLSX.readFile(file.path);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Erro ao processar arquivo Excel: ${error.message}`));
        }
      } else {
        reject(new Error("Tipo de arquivo não suportado"));
      }
    } catch (error) {
      reject(new Error(`Erro ao processar arquivo: ${error.message}`));
    }
  });
}

// Método auxiliar para enviar atualizações de progresso via socket
function emitProgress(companyId: number, jobId: string, percentage: number, message: string, processed: number = 0, valid: number = 0, invalid: number = 0) {
  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
    jobId,
    action: "progress",
    data: {
      percentage,
      message,
      processed,
      valid,
      invalid
    }
  });
}

// Controlador como funções independentes, não como classe
export async function importContacts(req: Request, res: Response): Promise<Response> {
  const { type, isFullContact } = req.body;
  const connectionId = req.body.connectionId ? parseInt(req.body.connectionId) : undefined;
  let metadata = null;
  
  try {
    if (req.body.metadata) {
      metadata = JSON.parse(req.body.metadata);
    }
  } catch (error) {
    logger.warn("Failed to parse metadata JSON", { error: error.message });
  }
  
  const { companyId } = req.user;
  const file = req.file;
  const jobId = uuidv4(); // Gera um ID único para o job de importação

  try {
    logger.info({
      message: "Iniciando importação de contatos",
      companyId,
      type,
      isFullContact: !!isFullContact,
      connectionId,
      hasMetadata: !!metadata
    });

    if (!type) {
      throw new AppError("Tipo de importação não especificado");
    }

    if (type !== 'phone' && !file) {
      throw new AppError("Arquivo não fornecido");
    }

    // Caso seja importação do novo modal com arquivo CSV ou XLS
    if ((type === 'csv' || type === 'xls') && metadata && metadata.mappings) {
      // Inicia o processo de importação em background
      
      // Emitir evento inicial para o cliente saber que iniciou
      const io = getIO();
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
      
      // Modificar para processar de forma não bloqueante mas garantir que eventos sejam emitidos
      processImportWithMappings(
        jobId,
        type,
        file,
        companyId,
        isFullContact === 'true',
        metadata.mappings,
        metadata.extraFieldMappings
      ).catch(error => {
        logger.error(`Erro ao processar importação: ${error.message}`);
        
        // Garantir emissão de erro em caso de falha
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
          jobId,
          action: "error",
          error: error.message
        });
      });
      
      // Retorna imediatamente com o ID do job
      return res.status(200).json({
        message: 'Importação iniciada com sucesso',
        jobId
      });
    }
    
    // Caso contrário, usa o serviço de importação padrão
    const importService = new ImportContactService();
    const result = await importService.execute({
      type,
      file,
      connectionId,
      isFullContact: isFullContact === 'true',
      companyId
    });

    logger.info({
      message: "Importação iniciada com sucesso",
      companyId,
      jobId: result.jobId
    });

    return res.status(200).json({
      message: 'Importação iniciada com sucesso',
      jobId: result.jobId
    });
  } catch (error) {
    logger.error({
      message: "Erro ao iniciar importação",
      companyId,
      error: error.message
    });

    throw new AppError(error.message);
  }
}

export async function exportContacts(req: Request, res: Response): Promise<Response> {
  const { type, isFullContact = false } = req.body;
  const { companyId } = req.user;

  try {
    logger.info({
      message: "Iniciando exportação de contatos",
      companyId,
      type,
      isFullContact
    });

    if (!type) {
      throw new AppError("Tipo de exportação não especificado");
    }

    if (type !== 'csv' && type !== 'xls') {
      throw new AppError("Tipo de exportação inválido");
    }

    const exportService = new ExportContactService();
    const buffer = await exportService.execute({
      type,
      isFullContact,
      companyId
    });

    const filename = `contatos_${companyId}_${new Date().getTime()}.${type}`;
    
    res.setHeader('Content-Type', type === 'csv' 
      ? 'text/csv' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    logger.info({
      message: "Exportação concluída com sucesso",
      companyId,
      filename
    });

    return res.send(buffer);
  } catch (error) {
    logger.error({
      message: "Erro ao realizar exportação",
      companyId,
      error: error.message
    });

    throw new AppError(error.message);
  }
}

export async function checkImportStatus(req: Request, res: Response): Promise<Response> {
  const { jobId } = req.params;
  const { companyId } = req.user;

  try {
    logger.info({
      message: "Verificando status da importação",
      companyId,
      jobId
    });

    // Retorna status em processamento
    const io = getIO();
    const status = {
      jobId,
      status: 'processing',
      progress: 0
    };

    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact-import`, {
      action: 'status',
      data: status
    });

    return res.json(status);
  } catch (error) {
    logger.error({
      message: "Erro ao verificar status da importação",
      companyId,
      jobId,
      error: error.message
    });

    throw new AppError(error.message);
  }
}

// Exporta as funções diretamente, não como classe
export default {
  import: importContacts,
  export: exportContacts,
  checkImportStatus
};