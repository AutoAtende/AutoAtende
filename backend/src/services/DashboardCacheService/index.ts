import { Op } from "sequelize";
import DashboardCache from "../../models/DashboardCache";
import DashboardService from "../DashboardService";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import { Queue } from "bullmq";
import { getGeneralMonitor } from "../../queues";

// Tempo de expiração do cache em minutos
const CACHE_EXPIRATION_TIME = {
  overview: 60, // 1 hora
  queues: 60,
  contacts: 120, // 2 horas
  agentProspection: 60,
  queuesComparison: 60,
  userQueuesComparison: 60,
  monthlyMessages: 120, // 2 horas
  monthlyTickets: 120 // 2 horas
};

class DashboardCacheService {
  private dashboardService: DashboardService;
  private queue: Queue;

  constructor() {
    this.dashboardService = new DashboardService();
    
    // Usar a fila generalMonitor existente
    try {
      this.queue = getGeneralMonitor();
    } catch (error) {
      logger.error("Erro ao obter fila generalMonitor", { error });
      // Continuar mesmo sem a fila, os métodos irão gerar os dados em tempo real
    }
  }

  /**
   * Busca dados do cache ou gera novos se necessário
   */
  public async getCachedData(
    companyId: number,
    type: string,
    queueId?: number,
    startDate?: Date,
    endDate?: Date,
    userId?: number,
    queue1?: number,
    queue2?: number
  ): Promise<any> {
    try {
      logger.info("Buscando dados em cache", { companyId, type, queueId, startDate, endDate });

      // Construir condições de busca
      const whereCondition: any = {
        companyId,
        type
      };

      // Adicionar condições específicas baseadas no tipo
      if (type === "queues" && queueId) {
        whereCondition.queueId = queueId;
      }

      if (startDate && endDate) {
        // Buscar cache com datas exatas ou aproximadas
        whereCondition.startDate = {
          [Op.between]: [
            new Date(startDate.getTime() - 1000 * 60 * 60), // 1 hora antes
            new Date(startDate.getTime() + 1000 * 60 * 60)  // 1 hora depois
          ]
        };
        whereCondition.endDate = {
          [Op.between]: [
            new Date(endDate.getTime() - 1000 * 60 * 60),
            new Date(endDate.getTime() + 1000 * 60 * 60)
          ]
        };
      }

      // Buscar cache existente
      const cacheEntry = await DashboardCache.findOne({
        where: whereCondition,
        order: [["updatedAt", "DESC"]]
      });

      // Se encontrou cache válido e não está em processamento
      if (
        cacheEntry && 
        !cacheEntry.isProcessing && 
        this.isCacheValid(cacheEntry.updatedAt, type)
      ) {
        logger.info("Cache encontrado e válido", { cacheId: cacheEntry.id });
        return cacheEntry.data;
      }

      // Se não encontrou cache válido ou está expirado, gerar dados em tempo real
      // e agendar atualização em background
      const realTimeData = await this.generateRealTimeData(
        companyId, 
        type, 
        queueId, 
        startDate, 
        endDate,
        userId,
        queue1,
        queue2
      );

      // Agendar atualização do cache em background
      if (this.queue) {
        try {
          await this.queue.add(
            "DashboardCacheUpdate",
            {
              type: "updateSingleCompany",
              companyId,
              dashboardType: type,
              queueId,
              startDate,
              endDate,
              userId,
              queue1,
              queue2
            },
            {
              removeOnComplete: true,
              removeOnFail: { count: 3 },
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 5000
              }
            }
          );
          logger.info("Job de atualização de cache agendado", { companyId, type });
        } catch (error) {
          logger.error("Erro ao agendar job de atualização de cache", { error });
          // Continuar mesmo sem agendar o job
        }
      }

      return realTimeData;
    } catch (error) {
      logger.error("Erro ao buscar dados em cache", { error, companyId, type });
      throw new AppError("Erro ao buscar dados do dashboard", 500);
    }
  }

  /**
   * Verifica se o cache ainda é válido com base no tempo de expiração
   */
  private isCacheValid(updatedAt: Date, type: string): boolean {
    const expirationMinutes = CACHE_EXPIRATION_TIME[type as keyof typeof CACHE_EXPIRATION_TIME] || 60;
    const expirationTime = new Date(updatedAt.getTime() + expirationMinutes * 60 * 1000);
    return expirationTime > new Date();
  }

  /**
   * Gera dados em tempo real usando o serviço de dashboard original
   */
  private async generateRealTimeData(
    companyId: number,
    type: string,
    queueId?: number,
    startDate?: Date,
    endDate?: Date,
    userId?: number,
    queue1?: number,
    queue2?: number
  ): Promise<any> {
    try {
      logger.info("Gerando dados em tempo real", { companyId, type });
      
      let data;

      switch (type) {
        case "overview":
          data = await this.dashboardService.getOverviewMetrics(companyId, startDate, endDate);
          break;
        case "queues":
          data = await this.dashboardService.getQueuesMetrics(companyId, startDate, endDate, queueId);
          break;
        case "contacts":
          data = await this.dashboardService.getContactsByState(companyId);
          break;
        case "agentProspection":
          data = await this.dashboardService.getAgentProspection(companyId, "semana");
          break;
        case "queuesComparison":
          if (!queue1 || !queue2) {
            throw new AppError("Parâmetros queue1 e queue2 são obrigatórios", 400);
          }
          data = await this.dashboardService.getQueuesComparison(companyId, queue1, queue2);
          break;
        case "userQueuesComparison":
          if (!userId || !queue1 || !queue2) {
            throw new AppError("Parâmetros userId, queue1 e queue2 são obrigatórios", 400);
          }
          data = await this.dashboardService.getUserQueuesComparison(
            companyId, 
            userId, 
            queue1, 
            queue2, 
            startDate, 
            endDate
          );
          break;
        case "monthlyMessages":
          data = await this.dashboardService.getMonthlyMessagesData(companyId, startDate, endDate);
          break;
        case "monthlyTickets":
          data = await this.dashboardService.getMonthlyTicketsData(companyId, startDate, endDate);
          break;
        default:
          throw new AppError(`Tipo de dashboard inválido: ${type}`, 400);
      }

      return data;
    } catch (error) {
      logger.error("Erro ao gerar dados em tempo real", { error, companyId, type });
      throw error;
    }
  }

  /**
   * Atualiza os dados do cache em background
   */
  private async updateCacheData(
    companyId: number,
    type: string,
    queueId?: number,
    startDate?: Date,
    endDate?: Date,
    userId?: number,
    queue1?: number,
    queue2?: number
  ): Promise<void> {
    try {
      logger.info("Iniciando atualização de cache", { companyId, type });

      // Construir condições de busca
      const whereCondition: any = {
        companyId,
        type
      };

      if (type === "queues" && queueId) {
        whereCondition.queueId = queueId;
      }

      if (startDate && endDate) {
        whereCondition.startDate = {
          [Op.between]: [
            new Date(startDate.getTime() - 1000 * 60 * 60),
            new Date(startDate.getTime() + 1000 * 60 * 60)
          ]
        };
        whereCondition.endDate = {
          [Op.between]: [
            new Date(endDate.getTime() - 1000 * 60 * 60),
            new Date(endDate.getTime() + 1000 * 60 * 60)
          ]
        };
      }

      // Buscar ou criar entrada de cache
      let cacheEntry = await DashboardCache.findOne({ where: whereCondition });

      if (!cacheEntry) {
        cacheEntry = await DashboardCache.create({
          companyId,
          type,
          queueId: queueId || null,
          startDate: startDate || null,
          endDate: endDate || null,
          data: {},
          isProcessing: true
        });
      } else {
        // Marcar como em processamento
        await cacheEntry.update({ isProcessing: true });
      }

      // Gerar dados atualizados
      const data = await this.generateRealTimeData(
        companyId, 
        type, 
        queueId, 
        startDate, 
        endDate,
        userId,
        queue1,
        queue2
      );

      // Atualizar cache com novos dados
      await cacheEntry.update({
        data,
        isProcessing: false,
        startDate: startDate || null,
        endDate: endDate || null
      });

      logger.info("Cache atualizado com sucesso", { 
        cacheId: cacheEntry.id,
        type,
        companyId
      });
    } catch (error) {
      // Em caso de erro, marcar cache como não processando
      const cacheEntry = await DashboardCache.findOne({ 
        where: { 
          companyId, 
          type,
          ...(type === "queues" && queueId ? { queueId } : {})
        } 
      });

      if (cacheEntry) {
        await cacheEntry.update({ isProcessing: false });
      }

      logger.error("Erro ao atualizar cache", { error, companyId, type });
      throw error;
    }
  }

  /**
   * Força atualização do cache para uma empresa
   */
  public async forceUpdateCache(companyId: number): Promise<void> {
    try {
      logger.info("Forçando atualização de cache para empresa", { companyId });

      // Buscar todos os caches da empresa
      const caches = await DashboardCache.findAll({
        where: { companyId }
      });

      // Se não houver caches, atualizar os tipos padrão
      if (caches.length === 0) {
        await this.updateCacheData(companyId, "overview");
        await this.updateCacheData(companyId, "queues");
        await this.updateCacheData(companyId, "contacts");
        await this.updateCacheData(companyId, "agentProspection");
        logger.info("Caches padrão criados para empresa", { companyId });
        return;
      }

      // Atualizar cada cache existente
      for (const cache of caches) {
        await this.updateCacheData(
          companyId,
          cache.type,
          cache.queueId,
          cache.startDate,
          cache.endDate
        );
      }

      logger.info("Atualização de cache concluída para empresa", { companyId });
    } catch (error) {
      logger.error("Erro ao forçar atualização de cache", { error, companyId });
      throw new AppError("Erro ao atualizar cache do dashboard", 500);
    }
  }

  /**
   * Limpa caches antigos ou inválidos
   */
  public async cleanupOldCaches(): Promise<void> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Remover caches não acessados nas últimas 24 horas
      await DashboardCache.destroy({
        where: {
          updatedAt: {
            [Op.lt]: oneDayAgo
          }
        }
      });

      logger.info("Limpeza de caches antigos concluída");
    } catch (error) {
      logger.error("Erro ao limpar caches antigos", { error });
    }
  }
}

export default DashboardCacheService;
