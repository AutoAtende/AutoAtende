import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import { head } from "../utils/helpers";
import { removeFilePublicFolder } from "../helpers/removeFilePublicFolder";
import AppError from "../errors/AppError";
import { ImportXLSContactsService } from "../services/ContactServices/ImportXLSContactsService";

// Interface para o status do job de importação
interface ImportJob {
  id: string;
  companyId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed: number;
  total: number;
  valid: number;
  invalid: number;
  error?: string;
}

// Mapa para armazenar o status dos jobs de importação
const importJobs = new Map<string, ImportJob>();

// Limpa jobs antigos (mais de 24h)
setInterval(() => {
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  importJobs.forEach((job, id) => {
    if (job.status === 'completed' || job.status === 'failed') {
      importJobs.delete(id);
    }
  });
}, 60 * 60 * 1000); // Roda a cada hora

/** @description Importação via arquivo .XLSX */
// ContactImportController.ts
export const uploadContacts = async (request: Request, response: Response) => {
  const { companyId } = request.user;
  const files = request.files as Express.Multer.File[];
  const file = head(files);

  try {
    if (!files || !file) {
      throw new AppError("Nenhum arquivo foi enviado", 400);
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
      throw new AppError("Formato de arquivo inválido. Por favor, envie um arquivo .xlsx ou .xls", 400);
    }

    const jobId = uuidv4();
    
    const importJob: ImportJob = {
      id: jobId,
      companyId,
      status: 'pending',
      processed: 0,
      total: 0,
      valid: 0,
      invalid: 0
    };
    
    importJobs.set(jobId, importJob);

    // Retorna imediatamente com o ID do job
    response.status(202).json({
      status: "accepted",
      message: "Importação iniciada",
      jobId
    });

    // Processa a importação em background
    const io = getIO();
    
    try {
      importJob.status = 'processing';
      
      const progressCallback = (processed: number, total: number, valid: number, invalid: number) => {
        importJob.processed = processed;
        importJob.total = total;
        importJob.valid = valid;
        importJob.invalid = invalid;
        
        io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-upload-contacts`, {
          action: "progress",
          jobId,
          progress: {
            processed,
            total,
            valid,
            invalid
          }
        });
      };

      const result = await ImportXLSContactsService(companyId, file, progressCallback);

      importJob.status = 'completed';
      importJob.valid = result.whatsappValids.length;
      importJob.invalid = result.whatsappInValids.length;

      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-upload-contacts`, {
        action: "complete",
        jobId,
        result: {
          validContacts: result.whatsappValids.length,
          invalidContacts: result.whatsappInValids.length
        }
      });

    } catch (error) {
      importJob.status = 'failed';
      importJob.error = error.message;

      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-upload-contacts`, {
        action: "error",
        jobId,
        error: error.message
      });
      
      throw error;
    }

  } catch (error) {
    if (file?.path) {
      await removeFilePublicFolder(file.path);
    }
    
    if (error instanceof AppError) {
      return response.status(error.statusCode).json({ error: error.message });
    }

    return response.status(500).json({ 
      error: "Erro interno ao iniciar importação" 
    });
  }
};

// Nova rota para consultar status do job
export const getImportStatus = async (request: Request, response: Response) => {
  const { jobId } = request.params;
  const { companyId } = request.user;

  const job = importJobs.get(jobId);

  if (!job) {
    return response.status(404).json({
      error: "Job não encontrado"
    });
  }

  if (job.companyId !== companyId) {
    return response.status(403).json({
      error: "Acesso não autorizado a este job"
    });
  }

  return response.json({
    status: job.status,
    processed: job.processed,
    total: job.total,
    valid: job.valid,
    invalid: job.invalid,
    error: job.error
  });
};