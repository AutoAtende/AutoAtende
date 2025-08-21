import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import DashboardSettings from "../../models/DashboardSettings";
import { logger } from "../../utils/logger";
import { ComponentVisibility } from "../../models/DashboardSettings";

interface DashboardSettingsData {
  defaultDateRange?: number;
  defaultQueue?: string;
  componentVisibility?: ComponentVisibility;
  [key: string]: any;
}

class DashboardSettingsService {
  private defaultSettings: DashboardSettingsData = {
    defaultDateRange: 7,
    defaultQueue: 'all',
    componentVisibility: {
        messagesCard: true,
  responseTimeCard: true,
  clientsCard: true,
  messagesByDayChart: true,
  messagesByUserChart: true,
  comparativeTable: true,
  prospectionTable: true
    }
  };

  public async getSettings(companyId: number): Promise<DashboardSettingsData> {
    try {
      // Verificar se a empresa existe
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError("Empresa não encontrada", 404);
      }

      // Buscar configurações do dashboard
      const settings = await DashboardSettings.findOne({
        where: { companyId }
      });

      // Se não existir, retorna as configurações padrão
      if (!settings) {
        // Criar configurações padrão para a empresa
        await this.createDefaultSettings(companyId);
        return this.defaultSettings;
      }

      // Retornar configurações
      return {
        defaultDateRange: settings.defaultDateRange,
        defaultQueue: settings.defaultQueue,
        componentVisibility: settings.componentVisibility
      };
    } catch (error) {
      logger.error("Erro ao buscar configurações do dashboard", {
        companyId,
        error
      });
      throw error;
    }
  }

  public async updateSettings(
    companyId: number,
    settings: DashboardSettingsData
  ): Promise<DashboardSettingsData> {
    try {
      // Verificar se a empresa existe
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError("Empresa não encontrada", 404);
      }

      // Buscar configurações do dashboard
      let dashboardSettings = await DashboardSettings.findOne({
        where: { companyId }
      });

      // Se não existir, cria as configurações padrão
      if (!dashboardSettings) {
        dashboardSettings = await this.createDefaultSettings(companyId);
      }

      // Atualizar configurações
      const currentComponentVisibility: ComponentVisibility = dashboardSettings.componentVisibility;
      const newComponentVisibility: ComponentVisibility = settings.componentVisibility;

      await dashboardSettings.update({
        defaultDateRange: settings.defaultDateRange !== undefined ? 
          settings.defaultDateRange : dashboardSettings.defaultDateRange,
        defaultQueue: settings.defaultQueue !== undefined ? 
          settings.defaultQueue : dashboardSettings.defaultQueue,
        componentVisibility: settings.componentVisibility !== undefined ? 
          { ...currentComponentVisibility, ...newComponentVisibility } : 
          currentComponentVisibility
      });

      // Forçar save após atualização
      await dashboardSettings.save();

      // Retornar configurações atualizadas
      return {
        defaultDateRange: dashboardSettings.defaultDateRange,
        defaultQueue: dashboardSettings.defaultQueue,
        componentVisibility: dashboardSettings.componentVisibility
      };
    } catch (error) {
      logger.error("Erro ao atualizar configurações do dashboard", {
        companyId,
        settings,
        error
      });
      throw error;
    }
  }

  public async updateComponentVisibility(
    companyId: number,
    componentVisibility: ComponentVisibility
  ): Promise<DashboardSettingsData> {
    try {
      // Verificar se a empresa existe
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError("Empresa não encontrada", 404);
      }

      // Buscar configurações do dashboard
      let dashboardSettings = await DashboardSettings.findOne({
        where: { companyId }
      });

      // Se não existir, cria as configurações padrão
      if (!dashboardSettings) {
        dashboardSettings = await this.createDefaultSettings(companyId);
      }

      // Atualizar visibilidade dos componentes
      const currentVisibility = dashboardSettings.componentVisibility || {};

      await dashboardSettings.update({
        componentVisibility: {
          ...currentVisibility,
          ...componentVisibility
        }
      });

      // Forçar save após atualização
      await dashboardSettings.save();

      // Retornar configurações atualizadas
      return {
        defaultDateRange: dashboardSettings.defaultDateRange,
        defaultQueue: dashboardSettings.defaultQueue,
        componentVisibility: dashboardSettings.componentVisibility
      };
    } catch (error) {
      logger.error("Erro ao atualizar visibilidade de componentes", {
        companyId,
        componentVisibility,
        error
      });
      throw error;
    }
  }

  public async resetSettings(companyId: number): Promise<DashboardSettingsData> {
    try {
      // Verificar se a empresa existe
      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError("Empresa não encontrada", 404);
      }

      // Buscar configurações do dashboard
      let dashboardSettings = await DashboardSettings.findOne({
        where: { companyId }
      });

      // Se existir, atualiza para os valores padrão
      if (dashboardSettings) {
        await dashboardSettings.update(this.defaultSettings);
        await dashboardSettings.save();
      } else {
        // Se não existir, cria as configurações padrão
        dashboardSettings = await this.createDefaultSettings(companyId);
      }

      // Retornar configurações padrão
      return {
        defaultDateRange: dashboardSettings.defaultDateRange,
        defaultQueue: dashboardSettings.defaultQueue,
        componentVisibility: dashboardSettings.componentVisibility
      };
    } catch (error) {
      logger.error("Erro ao resetar configurações do dashboard", {
        companyId,
        error
      });
      throw error;
    }
  }

  private async createDefaultSettings(companyId: number): Promise<DashboardSettings> {
    try {
      const dashboardSettings = new DashboardSettings();
      dashboardSettings.companyId = companyId;
      dashboardSettings.defaultDateRange = this.defaultSettings.defaultDateRange || 7;
      dashboardSettings.defaultQueue = this.defaultSettings.defaultQueue || 'all';
      dashboardSettings.componentVisibility = this.defaultSettings.componentVisibility || {
        messagesCard: true,
        responseTimeCard: true,
        clientsCard: true,
        messagesByDayChart: true,
        messagesByUserChart: true,
        comparativeTable: true,
        prospectionTable: true
      };
      
      await dashboardSettings.save();
      return dashboardSettings;
    } catch (error) {
      logger.error("Erro ao criar configurações padrão do dashboard", {
        companyId,
        error
      });
      throw error;
    }
  }
}

export default DashboardSettingsService;