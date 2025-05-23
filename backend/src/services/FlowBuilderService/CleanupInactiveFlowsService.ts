// services/FlowBuilderService/CleanupInactiveFlowsService.ts
import { Op, Sequelize } from "sequelize";
import { logger } from "../../utils/logger";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import FlowBuilder from "../../models/FlowBuilder";
import Ticket from "../../models/Ticket";
import FinishFlowService from "./FinishFlowService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import sequelize from "../../database";

interface CleanupStats {
  totalExecutions: number;
  completedExecutions: number;
  erroredExecutions: number;
  ticketsUpdated: number;
}

class CleanupInactiveFlowsService {
  /**
   * Finaliza execuções de fluxo inativas com base em regras configuráveis
   */
  public static async cleanupInactiveFlows(
    maxInactiveTimeMinutes: number = 60,
    batchSize: number = 100
  ): Promise<CleanupStats> {
    // Estatísticas para retorno
    const stats: CleanupStats = {
      totalExecutions: 0,
      completedExecutions: 0,
      erroredExecutions: 0,
      ticketsUpdated: 0
    };
    
    const transaction = await sequelize.transaction();
    
    try {
      logger.info(`[CleanupInactiveFlows] Iniciando limpeza de fluxos inativos (max inativo: ${maxInactiveTimeMinutes} minutos)`);
      
      // Calcular data limite para inatividade
      const cutoffDate = new Date();
      cutoffDate.setMinutes(cutoffDate.getMinutes() - maxInactiveTimeMinutes);
      
      // Buscar execuções ativas com última atualização anterior ao limite
      const inactiveExecutions = await FlowBuilderExecution.findAll({
        where: {
          status: "active",
          updatedAt: {
            [Op.lt]: cutoffDate
          }
        },
        include: [
          {
            model: FlowBuilder,
            as: "flow"
          }
        ],
        limit: batchSize,
        transaction
      });
      
      stats.totalExecutions = inactiveExecutions.length;
      logger.info(`[CleanupInactiveFlows] Encontradas ${stats.totalExecutions} execuções inativas`);
      
      // Processar cada execução inativa
      for (const execution of inactiveExecutions) {
        try {
          // Buscar ticket associado
          const ticket = await Ticket.findOne({
            where: {
              flowExecutionId: execution.id
            },
            transaction
          });
          
          if (ticket) {
            // Finalizar o fluxo
            await FinishFlowService({
              ticketId: ticket.id,
              companyId: ticket.companyId,
              executionId: execution.id,
              ticketStatus: "pending",
              flowStatus: "completed"
            });
            
            // Atualizar TicketTracking
            const ticketTraking = await FindOrCreateATicketTrakingService({
              ticketId: ticket.id,
              companyId: ticket.companyId,
              whatsappId: ticket.whatsappId,
              transaction
            });
            
            await ticketTraking.update({
              lastFlowExectionId: execution.id,
              lastFlowExectionAt: new Date(),
              lastFlowExectionStatus: "completed_inactive"
            }, { transaction });
            
            stats.ticketsUpdated++;
          } else {
            // Se não tem ticket, apenas marcar como concluído
            await execution.update({
              status: "completed",
              inactivityStatus: "inactive",
              inactivityReason: "Finalizado por inatividade automática"
            }, { transaction });
          }
          
          stats.completedExecutions++;
          
        } catch (executionError) {
          logger.error(`[CleanupInactiveFlows] Erro ao processar execução ${execution.id}: ${executionError.message}`);
          
          // Marcar com erro em vez de deixar ativa
          await execution.update({
            status: "error",
            errorMessage: `Erro na limpeza automática: ${executionError.message}`
          }, { transaction });
          
          stats.erroredExecutions++;
        }
      }
      
      // Commit da transação
      await transaction.commit();
      
      logger.info(`[CleanupInactiveFlows] Limpeza concluída: ${stats.completedExecutions} fluxos finalizados, ${stats.erroredExecutions} com erro`);
      return stats;
      
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      logger.error(`[CleanupInactiveFlows] Erro na limpeza de fluxos inativos: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Coleta estatísticas sobre inatividade para análise
   */
  public static async collectInactivityStats(): Promise<any> {
    try {
      const stats = {
        activeExecutions: 0,
        inactiveExecutions: 0,
        warningState: 0,
        reengagingState: 0,
        inactiveState: 0,
        reengagementSuccess: 0,
        reengagementFailure: 0,
        avgInactiveTimeMinutes: 0
      };
      
      // Contar execuções ativas
      stats.activeExecutions = await FlowBuilderExecution.count({
        where: { status: "active" }
      });
      
      // Contar execuções inativas
      stats.inactiveExecutions = await FlowBuilderExecution.count({
        where: { inactivityStatus: "inactive" }
      });
      
      // Contar por estado de inatividade
      stats.warningState = await FlowBuilderExecution.count({
        where: { inactivityStatus: "warning" }
      });
      
      stats.reengagingState = await FlowBuilderExecution.count({
        where: { inactivityStatus: "reengaging" }
      });
      
      stats.inactiveState = await FlowBuilderExecution.count({
        where: { inactivityStatus: "inactive" }
      });
      
      // Contar sucessos e falhas de reengajamento
      const reengagementAttempts = await FlowBuilderExecution.findAll({
        where: {
          // Usar o operador @> para verificar se o JSON contém a chave __reengagementAttempts
          // e se seu valor é maior que 0
          [Op.and]: [
            // Verificar se a chave existe
            Sequelize.literal("variables ? '__reengagementAttempts'"),
            // Verificar se o valor é maior que 0
            Sequelize.literal("(variables->>'__reengagementAttempts')::int > 0")
          ]
        },
        attributes: ['id', 'variables']
      });
      
      reengagementAttempts.forEach(exec => {
        if (exec.variables.__lastReengagementSuccess) {
          stats.reengagementSuccess++;
        } else {
          stats.reengagementFailure++;
        }
      });
      
      // Calcular tempo médio de inatividade
      const inactiveExecutions = await FlowBuilderExecution.findAll({
        where: { inactivityStatus: "inactive" },
        attributes: ['updatedAt', 'lastInteractionAt']
      });
      
      if (inactiveExecutions.length > 0) {
        let totalMinutes = 0;
        
        inactiveExecutions.forEach(exec => {
          const lastInteraction = exec.lastInteractionAt || exec.updatedAt;
          const inactiveTime = (exec.updatedAt.getTime() - lastInteraction.getTime()) / (1000 * 60);
          totalMinutes += inactiveTime;
        });
        
        stats.avgInactiveTimeMinutes = totalMinutes / inactiveExecutions.length;
      }
      
      return stats;
      
    } catch (error) {
      logger.error(`[CleanupInactiveFlows] Erro ao coletar estatísticas: ${error.message}`);
      throw error;
    }
  }
}

export default CleanupInactiveFlowsService;