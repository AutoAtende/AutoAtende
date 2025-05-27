import { Queue, Worker, Job } from "bullmq";
import { Op } from "sequelize";
import Company from "../models/Company";
import DashboardCacheService from "../services/DashboardCacheService";
import { logger } from "../utils/logger";
import { getGeneralMonitor } from "../queues";

/**
 * Job para atualizar periodicamente o cache do dashboard
 */
class DashboardCacheJob {
  private dashboardCacheService: DashboardCacheService;
  private queue: Queue;
  private worker: Worker;
  private jobName = "DashboardCacheUpdate";

  /**
   * Cria uma instância do DashboardCacheJob
   * @param queue Fila BullMQ para adicionar os jobs
   * @returns Instância de DashboardCacheJob
   */
  public static async create(queue?: Queue): Promise<DashboardCacheJob> {
    try {
      const instance = new DashboardCacheJob(queue);
      await instance.initialize();
      return instance;
    } catch (error) {
      logger.error("Erro ao criar DashboardCacheJob", { error });
      throw error;
    }
  }

  /**
   * Construtor privado, use o método estático create
   */
  private constructor(queue?: Queue) {
    this.dashboardCacheService = new DashboardCacheService();
    this.queue = queue || getGeneralMonitor();
  }

  /**
   * Inicializa o job
   */
  private async initialize(): Promise<void> {
    try {
      // Registrar o job repetido para executar a cada 30 minutos
      await this.registerRepeatableJob();
      logger.info("Job de atualização do cache do dashboard registrado com sucesso");
    } catch (error) {
      logger.error("Erro ao inicializar DashboardCacheJob", { error });
      throw error;
    }
  }

  /**
   * Registra o job repetido na fila
   */
  private async registerRepeatableJob(): Promise<void> {
    try {
      // Remover jobs repetidos existentes com o mesmo nome
      const existingJobs = await this.queue.getRepeatableJobs();
      const dashboardJobs = existingJobs.filter(job => job.name === this.jobName);
      
      for (const job of dashboardJobs) {
        await this.queue.removeRepeatableByKey(job.key);
        logger.info(`Job repetido removido: ${job.key}`);
      }

      // Adicionar novo job repetido
      await this.queue.add(
        this.jobName,
        { type: "updateAllCompanies" },
        {
          repeat: {
            every: 30 * 60 * 1000 // 30 minutos em milissegundos
          },
          removeOnComplete: { count: 10 },
          removeOnFail: { count: 3 },
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000
          }
        }
      );

      logger.info(`Job repetido ${this.jobName} registrado com sucesso`);
    } catch (error) {
      logger.error("Erro ao registrar job repetido", { error });
      throw error;
    }
  }

  /**
   * Processa o job de atualização do cache
   * @param job Job BullMQ
   */
  public async process(job: Job): Promise<any> {
    try {
      logger.info(`Processando job ${job.id} do tipo ${job.name}`);
      
      const { type, companyId } = job.data;

      if (type === "updateAllCompanies") {
        await this.updateAllCompanies();
      } else if (type === "updateSingleCompany" && companyId) {
        await this.dashboardCacheService.forceUpdateCache(companyId);
        logger.info(`Cache do dashboard atualizado para empresa ${companyId}`);
      } else {
        logger.warn(`Tipo de job desconhecido: ${type}`);
      }

      return { success: true };
    } catch (error) {
      logger.error("Erro ao processar job de atualização do cache", { error, jobId: job.id });
      throw error;
    }
  }

  /**
   * Atualiza o cache para todas as empresas ativas
   */
  private async updateAllCompanies(): Promise<void> {
    try {
      logger.info("Iniciando atualização periódica do cache do dashboard");

      // Buscar todas as empresas ativas
      const companies = await Company.findAll({
        where: {
          status: true
        }
      });

      // Atualizar cache para cada empresa
      for (const company of companies) {
        try {
          await this.dashboardCacheService.forceUpdateCache(company.id);
          logger.info(`Cache do dashboard atualizado para empresa ${company.id}`);
        } catch (error) {
          logger.error(`Erro ao atualizar cache para empresa ${company.id}`, { error });
        }
      }

      // Limpar caches antigos
      await this.dashboardCacheService.cleanupOldCaches();

      logger.info("Atualização periódica do cache do dashboard concluída");
    } catch (error) {
      logger.error("Erro ao executar job de atualização do cache do dashboard", { error });
      throw error;
    }
  }

  /**
   * Executa o job imediatamente para todas as empresas
   */
  public async executeNow(): Promise<void> {
    try {
      logger.info("Executando atualização imediata do cache do dashboard");
      await this.updateAllCompanies();
      logger.info("Atualização imediata do cache do dashboard concluída");
    } catch (error) {
      logger.error("Erro ao executar atualização imediata do cache", { error });
      throw error;
    }
  }

  /**
   * Adiciona um job para atualizar o cache de uma empresa específica
   * @param companyId ID da empresa
   */
  public async addUpdateJob(companyId: number): Promise<void> {
    try {
      await this.queue.add(
        this.jobName,
        { type: "updateSingleCompany", companyId },
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
      logger.info(`Job de atualização do cache adicionado para empresa ${companyId}`);
    } catch (error) {
      logger.error("Erro ao adicionar job de atualização do cache", { error, companyId });
      throw error;
    }
  }
}

// Não exportar uma instância, mas sim a classe
export default DashboardCacheJob;
