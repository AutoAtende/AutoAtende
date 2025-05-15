import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import Company from "../models/Company";
import Assistant from "../models/Assistant";
import AssistantFile from "../models/AssistantFile";

interface AssistantsRequest extends Request {
  company?: Company;
  contentLimit?: number;
  currentContentUsage?: number;
  remainingContent?: number;
}

// Verifica o limite de conteúdo para assistentes OpenAI
const checkOpenAIAssistantsLimit = async (req: AssistantsRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Verificar se o recurso está habilitado
    if (!plan.useOpenAIAssistants) {
      throw new AppError("ERR_OPENAI_ASSISTANTS_DISABLED", 403);
    }

    // Limite de conteúdo em MB
    const contentLimit = plan.openAIAssistantsContentLimit || 100; // Default: 100 MB
    
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

    // Anexar informações à requisição
    req.company = company;
    req.contentLimit = contentLimit;
    req.currentContentUsage = currentContentUsage;
    req.remainingContent = remainingContent;

    // Se for uma requisição de upload para treinamento, verificar se tem espaço suficiente
    if (req.method === 'POST' && req.url.includes('/assistants') && req.files) {
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
      if (uploadSize > remainingContent) {
        throw new AppError("ERR_ASSISTANTS_CONTENT_LIMIT_EXCEEDED", 403);
      }
    }

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "ERR_ASSISTANTS_CONTENT_CHECK_FAILED",
      500
    );
  }
};

export default checkOpenAIAssistantsLimit;