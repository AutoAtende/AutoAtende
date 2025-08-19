import { logger } from "../../utils/logger";
import { getIO } from "../../libs/optimizedSocket";
import Groups from "../../models/Groups";
import AutoGroupManagerService from "./AutoGroupManagerService"; //feito
import cron from "node-cron";

interface MonitoringStats {
  totalSeriesChecked: number;
  groupsCreated: number;
  groupsDeactivated: number;
  errors: string[];
  lastRun: Date;
}

class GroupMonitoringService {
  private static isRunning = false;
  private static cronJob: cron.ScheduledTask | null = null;
  private static stats: MonitoringStats = {
    totalSeriesChecked: 0,
    groupsCreated: 0,
    groupsDeactivated: 0,
    errors: [],
    lastRun: new Date()
  };

  /**
   * Inicia o monitoramento automático com cron job
   */
  static startMonitoring(): void {
    if (this.cronJob) {
      logger.warn("[GroupMonitoring] Monitoramento já está em execução");
      return;
    }

    // Executar a cada 5 minutos
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      if (!this.isRunning) {
        await this.runMonitoring();
      }
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });

    logger.info("[GroupMonitoring] Monitoramento automático iniciado (execução a cada 5 minutos)");
  }

  /**
   * Para o monitoramento automático
   */
  static stopMonitoring(): void {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
      logger.info("[GroupMonitoring] Monitoramento automático parado");
    }
  }

  /**
   * Executa uma verificação manual
   */
  static async runManualCheck(): Promise<MonitoringStats> {
    logger.info("[GroupMonitoring] Executando verificação manual");
    return await this.runMonitoring();
  }

  /**
   * Executa o monitoramento
   */
  private static async runMonitoring(): Promise<MonitoringStats> {
    if (this.isRunning) {
      logger.warn("[GroupMonitoring] Monitoramento já está em execução, aguardando conclusão");
      return this.stats;
    }

    this.isRunning = true;
    const startTime = new Date();

    // Reset stats
    this.stats = {
      totalSeriesChecked: 0,
      groupsCreated: 0,
      groupsDeactivated: 0,
      errors: [],
      lastRun: startTime
    };

    try {
      logger.info("[GroupMonitoring] Iniciando monitoramento de grupos gerenciados");

      // Executar monitoramento principal
      await AutoGroupManagerService.monitorAndCreateGroups();

      // Verificar grupos que precisam ser desativados
      await this.checkGroupsToDeactivate();

      // Atualizar contadores de participantes
      await this.updateParticipantCounts();

      const duration = new Date().getTime() - startTime.getTime();
      logger.info(`[GroupMonitoring] Monitoramento concluído em ${duration}ms. Estatísticas:`, this.stats);

      // Emitir estatísticas via socket para todas as empresas
      this.emitMonitoringStats();

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro durante monitoramento: ${error.message}`);
      this.stats.errors.push(`Erro geral: ${error.message}`);
    } finally {
      this.isRunning = false;
    }

    return this.stats;
  }

  /**
   * Verifica grupos que precisam ser desativados por estarem cheios
   */
  private static async checkGroupsToDeactivate(): Promise<void> {
    try {
      const fullGroups = await Groups.findAll({
        where: {
          isManaged: true,
          isActive: true
        }
      });

      for (const group of fullGroups) {
        if (group.isFull()) {
          await group.update({ isActive: false });
          this.stats.groupsDeactivated++;
          
          logger.info(`[GroupMonitoring] Grupo ${group.subject} desativado (cheio: ${group.getCurrentParticipantCount()}/${group.maxParticipants})`);

          // Emitir evento para a empresa específica
          const io = getIO();
          io.to(`company-${group.companyId}-mainchannel`).emit("auto-group-deactivated", {
            action: "group_deactivated",
            group: {
              id: group.id,
              name: group.subject,
              participantCount: group.getCurrentParticipantCount(),
              maxParticipants: group.maxParticipants,
              series: group.groupSeries
            }
          });
        }
      }

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro ao verificar grupos para desativação: ${error.message}`);
      this.stats.errors.push(`Erro na desativação: ${error.message}`);
    }
  }

  /**
   * Atualiza contadores de participantes dos grupos gerenciados
   */
  private static async updateParticipantCounts(): Promise<void> {
    try {
      const managedGroups = await Groups.findAll({
        where: {
          isManaged: true,
          isActive: true
        },
        limit: 50 // Limitar para não sobrecarregar
      });

      logger.info(`[GroupMonitoring] Atualizando contadores de ${managedGroups.length} grupos gerenciados`);

      // Atualizar em lotes para não sobrecarregar
      const batchSize = 10;
      for (let i = 0; i < managedGroups.length; i += batchSize) {
        const batch = managedGroups.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (group) => {
            try {
              // AutoGroupManagerService já tem um método privado para isso
              // Vamos atualizá-lo apenas se necessário
              const lastSyncAge = new Date().getTime() - new Date(group.lastSync || 0).getTime();
              const fiveMinutes = 5 * 60 * 1000;
              
              if (lastSyncAge > fiveMinutes) {
                // Método será chamado pelo AutoGroupManagerService.monitorAndCreateGroups()
                logger.debug(`[GroupMonitoring] Grupo ${group.subject} precisa de atualização de metadados`);
              }
            } catch (error) {
              logger.error(`[GroupMonitoring] Erro ao atualizar grupo ${group.id}: ${error.message}`);
              this.stats.errors.push(`Erro no grupo ${group.subject}: ${error.message}`);
            }
          })
        );

        // Pequena pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro ao atualizar contadores: ${error.message}`);
      this.stats.errors.push(`Erro na atualização: ${error.message}`);
    }
  }

  /**
   * Emite estatísticas do monitoramento via socket
   */
  private static emitMonitoringStats(): void {
    try {
      const io = getIO();
      
      // Emitir para canal global de monitoramento
      io.emit("group-monitoring-stats", {
        action: "monitoring_completed",
        stats: this.stats,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro ao emitir estatísticas: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas do último monitoramento
   */
  static getLastStats(): MonitoringStats {
    return { ...this.stats };
  }

  /**
   * Verifica se o monitoramento está em execução
   */
  static isMonitoringRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Obtém status do cron job
   */
  static getMonitoringStatus(): {
    isScheduled: boolean;
    isRunning: boolean;
    lastRun: Date;
    nextRun?: Date;
  } {
    return {
      isScheduled: !!this.cronJob,
      isRunning: this.isRunning,
      lastRun: this.stats.lastRun,
      nextRun: this.cronJob ? new Date(Date.now() + 5 * 60 * 1000) : undefined // Aproximação
    };
  }

  /**
   * Força a verificação de uma série específica
   */
  static async checkSpecificSeries(seriesName: string, companyId: number): Promise<void> {
    try {
      logger.info(`[GroupMonitoring] Verificação manual da série ${seriesName} para empresa ${companyId}`);

      const activeGroup = await AutoGroupManagerService.getActiveGroupForSeries(seriesName, companyId);
      
      if (!activeGroup) {
        throw new Error(`Nenhum grupo ativo encontrado para série ${seriesName}`);
      }

      // Atualizar metadados do grupo
      await Groups.update(
        { lastSync: new Date() },
        { where: { id: activeGroup.id } }
      );

      // Verificar se precisa criar próximo grupo
      if (activeGroup.shouldCreateNextGroup()) {
        const newGroup = await AutoGroupManagerService.forceCreateNextGroup(seriesName, companyId);
        
        logger.info(`[GroupMonitoring] Novo grupo criado para série ${seriesName}: ${newGroup.subject}`);
        
        // Emitir evento
        const io = getIO();
        io.to(`company-${companyId}-mainchannel`).emit("auto-group-created", {
          action: "series_check_created",
          series: seriesName,
          newGroup: {
            id: newGroup.id,
            name: newGroup.subject,
            inviteLink: newGroup.inviteLink
          }
        });
      }

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro na verificação da série ${seriesName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de todas as séries ativas
   */
  static async getAllSeriesStats(): Promise<any[]> {
    try {
      const GroupSeries = require("../../models/GroupSeries").default;
      
      const allSeries = await GroupSeries.findAll({
        where: { autoCreateEnabled: true }
      });

      const stats = await Promise.all(
        allSeries.map(async (series: any) => {
          try {
            return await AutoGroupManagerService.getSeriesStats(series.name, series.companyId);
          } catch (error) {
            logger.error(`[GroupMonitoring] Erro ao obter stats da série ${series.name}: ${error.message}`);
            return {
              seriesName: series.name,
              companyId: series.companyId,
              error: error.message
            };
          }
        })
      );

      return stats;

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro ao obter estatísticas de todas as séries: ${error.message}`);
      return [];
    }
  }

  /**
   * Realiza limpeza de grupos antigos e inativos
   */
  static async cleanupInactiveGroups(): Promise<number> {
    try {
      logger.info("[GroupMonitoring] Iniciando limpeza de grupos inativos");

      // Buscar grupos inativos há mais de 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const inactiveGroups = await Groups.findAll({
        where: {
          isManaged: true,
          isActive: false,
          updatedAt: {
            [require('sequelize').Op.lt]: thirtyDaysAgo
          }
        }
      });

      let cleanedCount = 0;

      for (const group of inactiveGroups) {
        try {
          // Verificar se realmente está vazio ou com poucos participantes
          const participantCount = group.getCurrentParticipantCount();
          
          if (participantCount <= 5) { // Apenas bot e poucos usuários
            await group.destroy();
            cleanedCount++;
            logger.info(`[GroupMonitoring] Grupo inativo removido: ${group.subject} (${participantCount} participantes)`);
          }

        } catch (error) {
          logger.error(`[GroupMonitoring] Erro ao limpar grupo ${group.id}: ${error.message}`);
        }
      }

      logger.info(`[GroupMonitoring] Limpeza concluída: ${cleanedCount} grupos removidos`);
      return cleanedCount;

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro na limpeza de grupos inativos: ${error.message}`);
      return 0;
    }
  }

  /**
   * Executa diagnóstico completo do sistema de grupos
   */
  static async runDiagnostic(): Promise<any> {
    try {
      logger.info("[GroupMonitoring] Executando diagnóstico completo");

      const GroupSeries = require("../../models/GroupSeries").default;
      
      const diagnostic = {
        timestamp: new Date(),
        totalSeries: 0,
        activeSeries: 0,
        totalManagedGroups: 0,
        activeGroups: 0,
        fullGroups: 0,
        nearCapacityGroups: 0,
        totalParticipants: 0,
        averageOccupancy: 0,
        seriesDetails: [] as any[],
        issues: [] as string[]
      };

      // Contar séries
      diagnostic.totalSeries = await GroupSeries.count();
      diagnostic.activeSeries = await GroupSeries.count({
        where: { autoCreateEnabled: true }
      });

      // Contar grupos gerenciados
      diagnostic.totalManagedGroups = await Groups.count({
        where: { isManaged: true }
      });

      diagnostic.activeGroups = await Groups.count({
        where: { isManaged: true, isActive: true }
      });

      // Buscar todos os grupos gerenciados para análise detalhada
      const managedGroups = await Groups.findAll({
        where: { isManaged: true }
      });

      let totalOccupancy = 0;
      let totalParticipants = 0;

      for (const group of managedGroups) {
        const participantCount = group.getCurrentParticipantCount();
        const occupancy = group.getCurrentOccupancyPercentage();
        
        totalParticipants += participantCount;
        totalOccupancy += occupancy;

        if (group.isFull()) {
          diagnostic.fullGroups++;
        }

        if (group.isNearCapacity() && !group.isFull()) {
          diagnostic.nearCapacityGroups++;
        }

        // Verificar problemas
        if (group.isActive && group.isFull()) {
          diagnostic.issues.push(`Grupo ${group.subject} está cheio mas ainda ativo`);
        }

        if (!group.isActive && !group.isFull() && group.getCurrentOccupancyPercentage() < 90) {
          diagnostic.issues.push(`Grupo ${group.subject} foi desativado prematuramente`);
        }
      }

      diagnostic.totalParticipants = totalParticipants;
      diagnostic.averageOccupancy = managedGroups.length > 0 ? totalOccupancy / managedGroups.length : 0;

      // Obter detalhes das séries
      const allSeries = await GroupSeries.findAll();
      
      for (const series of allSeries) {
        try {
          const stats = await AutoGroupManagerService.getSeriesStats(series.name, series.companyId);
          diagnostic.seriesDetails.push(stats);
        } catch (error) {
          diagnostic.issues.push(`Erro ao obter stats da série ${series.name}: ${error.message}`);
        }
      }

      logger.info("[GroupMonitoring] Diagnóstico concluído", diagnostic);
      return diagnostic;

    } catch (error) {
      logger.error(`[GroupMonitoring] Erro no diagnóstico: ${error.message}`);
      throw error;
    }
  }
}

export default GroupMonitoringService;