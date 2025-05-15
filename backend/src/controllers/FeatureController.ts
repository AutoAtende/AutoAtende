import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import AppError from "../errors/AppError";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import Company from "../models/Company";
import Assistant from "../models/Assistant";
import AssistantFile from "../models/AssistantFile";

// Endpoint para obter recursos do plano
export const getPlanFeatures = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = req.user.companyId;
    
    // Obter a empresa
    const company = await Company.findByPk(companyId);
    
    if (!company) {
      throw new AppError("ERR_COMPANY_NOT_FOUND", 404);
    }
    
    // Obter o plano
    const plan = await ShowPlanService(company.planId);
    
    if (!plan) {
      throw new AppError("ERR_PLAN_NOT_FOUND", 404);
    }
    
    // Retornar os recursos disponíveis
    return res.status(200).json({
      useCampaigns: plan.useCampaigns,
      useKanban: plan.useKanban,
      useOpenAi: plan.useOpenAi,
      useIntegrations: plan.useIntegrations,
      useSchedules: plan.useSchedules,
      useInternalChat: plan.useInternalChat,
      useExternalApi: plan.useExternalApi,
      useEmail: plan.useEmail,
      useOpenAIAssistants: plan.useOpenAIAssistants,
      useFlowBuilder: plan.useFlowBuilder,
      useAPIOfficial: plan.useAPIOfficial,
      useChatBotRules: plan.useChatBotRules,
      storageLimit: plan.storageLimit || 500,
      openAIAssistantsContentLimit: plan.openAIAssistantsContentLimit || 100
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_PLAN_FEATURES_FAILED", 500);
  }
};

// Endpoint para obter informações de armazenamento
export const getStorageInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = req.user.companyId;
    
    // Obter a empresa
    const company = await Company.findByPk(companyId);
    
    if (!company) {
      throw new AppError("ERR_COMPANY_NOT_FOUND", 404);
    }
    
    // Obter o plano
    const plan = await ShowPlanService(company.planId);
    
    if (!plan) {
      throw new AppError("ERR_PLAN_NOT_FOUND", 404);
    }
    
    // Limite de armazenamento em MB
    const storageLimit = plan.storageLimit || 500;
    
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
    
    return res.status(200).json({
      limit: storageLimit,
      used: currentStorageUsage,
      remaining: remainingStorage
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_STORAGE_INFO_FAILED", 500);
  }
};

// Endpoint para obter informações de conteúdo dos assistentes
export const getAssistantsContentInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = req.user.companyId;
    
    // Obter a empresa
    const company = await Company.findByPk(companyId);
    
    if (!company) {
      throw new AppError("ERR_COMPANY_NOT_FOUND", 404);
    }
    
    // Obter o plano
    const plan = await ShowPlanService(company.planId);
    
    if (!plan) {
      throw new AppError("ERR_PLAN_NOT_FOUND", 404);
    }
    
    // Limite de conteúdo em MB
    const contentLimit = plan.openAIAssistantsContentLimit || 100;
    
    // Calcular o uso atual de conteúdo
    let currentContentUsage = 0;
    
    try {
      // Buscar todos os assistentes da empresa com seus arquivos
      const assistants = await Assistant.findAll({
        where: { companyId },
        include: [{ model: AssistantFile }]
      });
      
      // Somar o tamanho dos arquivos de cada assistente
      currentContentUsage = assistants.reduce((total, assistant) => {
        // Se o assistente tiver arquivos, somamos o tamanho de cada um
        if (assistant.files && assistant.files.length > 0) {
          const filesSize = assistant.files.reduce((sum, file) => {
            // Verificar se o arquivo tem a propriedade size
            return sum + (file.size ? file.size / (1024 * 1024) : 0); // Converter bytes para MB
          }, 0);
          
          return total + filesSize;
        }
        
        return total;
      }, 0);
    } catch (error) {
      console.error("Erro ao calcular uso de conteúdo dos assistentes:", error);
    }
    
    // Calcular conteúdo restante
    const remainingContent = contentLimit - currentContentUsage;
    
    return res.status(200).json({
      limit: contentLimit,
      used: currentContentUsage,
      remaining: remainingContent
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_ASSISTANTS_CONTENT_INFO_FAILED", 500);
  }
};