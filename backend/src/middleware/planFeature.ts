import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import Company from "../models/Company";

interface PlanRequest extends Request {
  company?: Company;
}

// Verifica se a funcionalidade está disponível no plano da empresa
const planFeature = (featureName: string) => {
  return async (req: PlanRequest, res: Response, next: NextFunction): Promise<void> => {
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

      // Verificar se a funcionalidade está habilitada no plano
      if (featureName && !plan[featureName]) {
        throw new AppError("ERR_PLAN_FEATURE_DISABLED", 403);
      }

      // Anexar a empresa à requisição para possível uso futuro
      req.company = company;

      return next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "ERR_PLAN_CHECK_FAILED",
        500
      );
    }
  };
};

export default planFeature;