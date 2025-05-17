import { Request, Response } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import DashboardSettingsService from "../services/DashboardSettingsService";

class DashboardSettingsController {
  private dashboardSettingsService: DashboardSettingsService;

  constructor() {
    this.dashboardSettingsService = new DashboardSettingsService();
  }

  public getSettings = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    
    try {
      logger.info("Iniciando getSettings", { companyId });
      
      const settings = await this.dashboardSettingsService.getSettings(companyId);
      
      return res.status(200).json(settings);
    } catch (error) {
      logger.error("Erro em getSettings", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public updateSettings = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const settings = req.body;
    
    try {
      logger.info("Iniciando updateSettings", { companyId, settings });
      
      if (!settings || typeof settings !== 'object') {
        throw new AppError("Formato de configurações inválido", 400);
      }
      
      const updatedSettings = await this.dashboardSettingsService.updateSettings(
        companyId,
        settings
      );
      
      return res.status(200).json(updatedSettings);
    } catch (error) {
      logger.error("Erro em updateSettings", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public updateComponentVisibility = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { componentVisibility } = req.body;
    
    try {
      logger.info("Iniciando updateComponentVisibility", { companyId, componentVisibility });
      
      if (!componentVisibility || typeof componentVisibility !== 'object') {
        throw new AppError("Formato de configurações de visibilidade inválido", 400);
      }
      
      const updatedSettings = await this.dashboardSettingsService.updateComponentVisibility(
        companyId,
        componentVisibility
      );
      
      return res.status(200).json(updatedSettings);
    } catch (error) {
      logger.error("Erro em updateComponentVisibility", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };

  public resetSettings = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    
    try {
      logger.info("Iniciando resetSettings", { companyId });
      
      const defaultSettings = await this.dashboardSettingsService.resetSettings(companyId);
      
      return res.status(200).json(defaultSettings);
    } catch (error) {
      logger.error("Erro em resetSettings", { error });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

export default DashboardSettingsController;