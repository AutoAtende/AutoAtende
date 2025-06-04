import { Request, Response } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import GroupMonitoringService from "../services/GroupServices/GroupMonitoringService";
import AutoGroupManagerService from "../services/GroupServices/AutoGroupManagerService";
import Groups from "../models/Groups";
import GroupSeries from "../models/GroupSeries";
import { Op } from "sequelize";

class AdminDashboardController {
  /**
   * Dashboard principal com estatísticas gerais
   */
  async dashboard(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;

      // Obter estatísticas gerais
      const totalSeries = await GroupSeries.count({ where: { companyId } });
      const activeSeries = await GroupSeries.count({ 
        where: { companyId, autoCreateEnabled: true } 
      });

      const totalGroups = await Groups.count({ 
        where: { companyId, isManaged: true } 
      });
      const activeGroups = await Groups.count({ 
        where: { companyId, isManaged: true, isActive: true } 
      });

      // Calcular total de participantes
      const managedGroups = await Groups.findAll({
        where: { companyId, isManaged: true },
        attributes: ['participantsJson', 'maxParticipants']
      });

      const totalParticipants = managedGroups.reduce((sum, group) => {
        return sum + (group.participantsJson ? group.participantsJson.length : 0);
      }, 0);

      const totalCapacity = managedGroups.reduce((sum, group) => {
        return sum + group.maxParticipants;
      }, 0);

      // Grupos próximos da capacidade
      const nearCapacityGroups = managedGroups.filter(group => {
        const occupancy = group.participantsJson 
          ? (group.participantsJson.length / group.maxParticipants) * 100 
          : 0;
        return occupancy >= 90 && occupancy < 100;
      }).length;

      // Grupos cheios
      const fullGroups = managedGroups.filter(group => {
        const occupancy = group.participantsJson 
          ? (group.participantsJson.length / group.maxParticipants) * 100 
          : 0;
        return occupancy >= 100;
      }).length;

      // Status do monitoramento
      const monitoringStatus = GroupMonitoringService.getMonitoringStatus();
      const lastStats = GroupMonitoringService.getLastStats();

      const dashboard = {
        overview: {
          totalSeries,
          activeSeries,
          totalGroups,
          activeGroups,
          totalParticipants,
          totalCapacity,
          occupancyPercentage: totalCapacity > 0 ? (totalParticipants / totalCapacity) * 100 : 0,
          nearCapacityGroups,
          fullGroups
        },
        monitoring: {
          isActive: monitoringStatus.isScheduled,
          isRunning: monitoringStatus.isRunning,
          lastRun: monitoringStatus.lastRun,
          nextRun: monitoringStatus.nextRun,
          lastStats
        },
        recentActivity: await this.getRecentActivity(companyId)
      };

      return res.status(200).json(dashboard);
    } catch (error) {
      logger.error(`Erro ao carregar dashboard: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Executa diagnóstico completo do sistema
   */
  async diagnostic(req: Request, res: Response): Promise<Response> {
    try {
      const diagnostic = await GroupMonitoringService.runDiagnostic();
      return res.status(200).json(diagnostic);
    } catch (error) {
      logger.error(`Erro ao executar diagnóstico: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Executa monitoramento manual
   */
  async runMonitoring(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await GroupMonitoringService.runManualCheck();
      
      return res.status(200).json({
        message: "Monitoramento executado com sucesso",
        stats
      });
    } catch (error) {
      logger.error(`Erro ao executar monitoramento: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Obtém estatísticas detalhadas de todas as séries
   */
  async getAllSeriesStats(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      
      const series = await GroupSeries.findAll({
        where: { companyId },
        order: [['createdAt', 'DESC']]
      });

      const detailedStats = await Promise.all(
        series.map(async (s) => {
          try {
            return await AutoGroupManagerService.getSeriesStats(s.name, companyId);
          } catch (error) {
            logger.error(`Erro ao obter stats da série ${s.name}: ${error.message}`);
            return {
              seriesName: s.name,
              error: error.message,
              totalGroups: 0,
              activeGroups: 0,
              totalParticipants: 0
            };
          }
        })
      );

      return res.status(200).json(detailedStats);
    } catch (error) {
      logger.error(`Erro ao obter estatísticas de séries: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Limpa grupos inativos
   */
  async cleanupInactiveGroups(req: Request, res: Response): Promise<Response> {
    try {
      const cleanedCount = await GroupMonitoringService.cleanupInactiveGroups();
      
      return res.status(200).json({
        message: `${cleanedCount} grupos inativos foram removidos`,
        cleanedCount
      });
    } catch (error) {
      logger.error(`Erro na limpeza de grupos: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Força atualização de metadados de todos os grupos gerenciados
   */
  async forceUpdateAllGroups(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;

      const managedGroups = await Groups.findAll({
        where: { 
          companyId, 
          isManaged: true, 
          isActive: true 
        },
        limit: 20 // Limitar para não sobrecarregar
      });

      let updated = 0;
      const errors: string[] = [];

      for (const group of managedGroups) {
        try {
          // Marcar para atualização forçada
          await group.update({ 
            lastSync: new Date(0) // Data muito antiga para forçar atualização
          });
          updated++;
        } catch (error) {
          errors.push(`Grupo ${group.subject}: ${error.message}`);
        }
      }

      // Executar monitoramento para atualizar os grupos
      setTimeout(() => {
        GroupMonitoringService.runManualCheck().catch(error => {
          logger.error(`Erro na atualização forçada: ${error.message}`);
        });
      }, 1000);

      return res.status(200).json({
        message: `Atualização iniciada para ${updated} grupos`,
        updated,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      logger.error(`Erro ao forçar atualização: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Obtém logs de atividade recente
   */
  async getActivityLogs(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;
      const { limit = 50 } = req.query;

      const recentActivity = await this.getRecentActivity(companyId, Number(limit));

      return res.status(200).json(recentActivity);
    } catch (error) {
      logger.error(`Erro ao obter logs de atividade: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Obtém grupos com problemas
   */
  async getProblematicGroups(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user;

      const problematicGroups = await Groups.findAll({
        where: {
          companyId,
          isManaged: true,
          [Op.or]: [
            // Grupos ativos mas cheios
            {
              isActive: true,
              // Vamos verificar isso na aplicação já que não podemos fazer cálculo direto no SQL
            },
            // Grupos com sync antigo
            {
              lastSync: {
                [Op.lt]: new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
              }
            }
          ]
        },
        order: [['lastSync', 'ASC']]
      });

      // Filtrar grupos com problemas reais
      const filtered = problematicGroups.filter(group => {
        const participantCount = group.participantsJson ? group.participantsJson.length : 0;
        const occupancy = (participantCount / group.maxParticipants) * 100;
        
        // Grupo ativo mas cheio
        if (group.isActive && occupancy >= 100) return true;
        
        // Grupo com sync muito antigo
        const lastSyncAge = new Date().getTime() - new Date(group.lastSync || 0).getTime();
        if (lastSyncAge > 30 * 60 * 1000) return true; // 30 minutos
        
        return false;
      });

      const issues = filtered.map(group => {
        const participantCount = group.participantsJson ? group.participantsJson.length : 0;
        const occupancy = (participantCount / group.maxParticipants) * 100;
        const lastSyncAge = new Date().getTime() - new Date(group.lastSync || 0).getTime();
        
        const problems = [];
        
        if (group.isActive && occupancy >= 100) {
          problems.push("Grupo ativo mas cheio");
        }
        
        if (lastSyncAge > 30 * 60 * 1000) {
          problems.push(`Sync desatualizado (${Math.round(lastSyncAge / 60000)} min)`);
        }

        return {
          id: group.id,
          name: group.subject,
          series: group.groupSeries,
          participantCount,
          maxParticipants: group.maxParticipants,
          occupancy: Math.round(occupancy),
          isActive: group.isActive,
          lastSync: group.lastSync,
          problems
        };
      });

      return res.status(200).json(issues);
    } catch (error) {
      logger.error(`Erro ao obter grupos problemáticos: ${error.message}`);
      throw new AppError(error.message);
    }
  }

  /**
   * Método auxiliar para obter atividade recente
   */
  private async getRecentActivity(companyId: number, limit = 20): Promise<any[]> {
    try {
      // Buscar grupos criados recentemente
      const recentGroups = await Groups.findAll({
        where: { 
          companyId, 
          isManaged: true,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        },
        order: [['createdAt', 'DESC']],
        limit: limit / 2
      });

      // Buscar grupos atualizados recentemente
      const updatedGroups = await Groups.findAll({
        where: { 
          companyId, 
          isManaged: true,
          lastSync: {
            [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // Última hora
          }
        },
        order: [['lastSync', 'DESC']],
        limit: limit / 2
      });

      const activity = [
        ...recentGroups.map(group => ({
          type: 'group_created',
          timestamp: group.createdAt,
          data: {
            groupId: group.id,
            groupName: group.subject,
            series: group.groupSeries,
            participantCount: group.participantsJson ? group.participantsJson.length : 0
          }
        })),
        ...updatedGroups.map(group => ({
          type: 'group_updated',
          timestamp: group.lastSync,
          data: {
            groupId: group.id,
            groupName: group.subject,
            series: group.groupSeries,
            participantCount: group.participantsJson ? group.participantsJson.length : 0,
            occupancy: group.participantsJson 
              ? Math.round((group.participantsJson.length / group.maxParticipants) * 100)
              : 0
          }
        }))
      ];

      // Ordenar por timestamp e limitar
      return activity
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      logger.error(`Erro ao obter atividade recente: ${error.message}`);
      return [];
    }
  }
}

export default new AdminDashboardController();