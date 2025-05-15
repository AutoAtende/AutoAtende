import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import AppError from "../errors/AppError";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import Company from "../models/Company";

interface StorageRequest extends Request {
  company?: Company;
  storageLimit?: number;
  currentStorageUsage?: number;
  remainingStorage?: number;
}

// Verifica o limite de armazenamento da empresa
const checkStorageLimit = async (req: StorageRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Obter o ID da empresa a partir do token
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError("ERR_COMPANY_NOT_FOUND", 404);
    }

    // Obter a empresa
    const company = await Company.findByPk(companyId);

    if (!company) {
      throw new AppError("ERR_COMPANY_NOT_FOUND", 404);
    }

    // Obter o plano da empresa
    const plan = await ShowPlanService(company.planId);

    if (!plan) {
      throw new AppError("ERR_PLAN_NOT_FOUND", 404);
    }

    // Limite de armazenamento em MB
    const storageLimit = plan.storageLimit || 500; // Default: 500 MB
    
    // Calcular o uso atual de armazenamento
    const publicFolderPath = path.resolve(__dirname, "..", "..", "public", companyId.toString());
    let currentStorageUsage = 0;

    // Verificar se a pasta existe
    if (fs.existsSync(publicFolderPath)) {
      // Função recursiva para calcular o tamanho total
      const calculateSize = (directoryPath: string): number => {
        let totalSize = 0;
        const files = fs.readdirSync(directoryPath);
        
        for (const file of files) {
          const filePath = path.join(directoryPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            totalSize += stats.size;
          } else if (stats.isDirectory()) {
            totalSize += calculateSize(filePath);
          }
        }
        
        return totalSize;
      };
      
      const totalSizeBytes = calculateSize(publicFolderPath);
      currentStorageUsage = totalSizeBytes / (1024 * 1024); // Converter para MB
    }

    // Calcular armazenamento restante
    const remainingStorage = storageLimit - currentStorageUsage;

    // Anexar informações à requisição
    req.company = company;
    req.storageLimit = storageLimit;
    req.currentStorageUsage = currentStorageUsage;
    req.remainingStorage = remainingStorage;

    // Se for uma requisição de upload, verificar se tem espaço suficiente
    if (req.method === 'POST' && req.url.includes('/upload') && req.files) {
      let uploadSize = 0;
      
      // Calcular tamanho total dos arquivos sendo enviados
      if (Array.isArray(req.files)) {
        uploadSize = req.files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
      } else if (req.files && typeof req.files === 'object') {
        uploadSize = Object.values(req.files).reduce((acc, fileArray) => {
          return acc + fileArray.reduce((sum, file) => sum + file.size, 0);
        }, 0) / (1024 * 1024);
      }

      // Verificar se tem espaço suficiente
      if (uploadSize > remainingStorage) {
        throw new AppError("ERR_STORAGE_LIMIT_EXCEEDED", 403);
      }
    }

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "ERR_STORAGE_CHECK_FAILED",
      500
    );
  }
};

export default checkStorageLimit;