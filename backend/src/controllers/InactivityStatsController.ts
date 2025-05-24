import { Request, Response } from "express";
import { Op, Sequelize, QueryTypes } from "sequelize";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import CleanupInactiveFlowsService from "../services/FlowBuilderService/CleanupInactiveFlowsService";
import ReengagementService from "../services/FlowBuilderService/ReengagementService";
import FlowBuilderExecution from "../models/FlowBuilderExecution";
import FlowBuilder from "../models/FlowBuilder";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";
import sequelize from "../database";

interface DashboardStats {
  totalActiveExecutions: number;
  inactiveExecutions: number;
  warningExecutions: number;
  reengagedToday: number;
  transferredToday: number;
  endedToday: number;
  averageInactivityTime: number;
  reengagementRate: number;
}

interface FilteredExecutionsRequest {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  flowId?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Obter estatísticas do dashboard
export const getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    // Data de hoje para estatísticas diárias
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Consultas para estatísticas principais
    const [
      totalActiveExecutions,
      inactiveExecutions,
      warningExecutions,
      reengagedToday,
      transferredToday,
      endedToday,
      averageInactivityStats,
      reengagementStats
    ] = await Promise.all([
      // Total de execuções ativas
      FlowBuilderExecution.count({
        where: {
          companyId,
          status: 'active'
        }
      }),

      // Execuções inativas
      FlowBuilderExecution.count({
        where: {
          companyId,
          inactivityStatus: 'inactive'
        }
      }),

      // Execuções com avisos
      FlowBuilderExecution.count({
        where: {
          companyId,
          inactivityStatus: 'warning'
        }
      }),

      // Reengajadas hoje
      FlowBuilderExecution.count({
        where: {
          companyId,
          updatedAt: {
            [Op.between]: [today.getTime(), tomorrow.getTime()]
          },
          variables: {
            [Op.and]: [
              Sequelize.literal("variables ? '__reengagementAttempts'"),
              Sequelize.literal("(variables->>'__reengagementAttempts')::int > 0")
            ]
          }
        }
      }),

      // Transferidas hoje
      FlowBuilderExecution.count({
        where: {
          companyId,
          updatedAt: {
            [Op.between]: [today.getTime(), tomorrow.getTime()]
          },
          inactivityReason: {
            [Op.iLike]: '%transferido%'
          }
        }
      }),

      // Encerradas hoje
      FlowBuilderExecution.count({
        where: {
          companyId,
          updatedAt: {
            [Op.between]: [today.getTime(), tomorrow.getTime()]
          },
          status: 'completed',
          inactivityReason: {
            [Op.not]: null
          }
        }
      }),

      // Tempo médio de inatividade
      sequelize.query(`
        SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "lastInteractionAt")) / 60) as "averageMinutes"
        FROM "FlowBuilderExecutions" 
        WHERE "companyId" = :companyId 
          AND "inactivityStatus" = 'inactive'
          AND "lastInteractionAt" IS NOT NULL
      `, {
        replacements: { companyId },
        type: QueryTypes.SELECT
      }),

      // Estatísticas de reengajamento
      sequelize.query(`
        SELECT 
          COUNT(*) FILTER (WHERE variables->>'__lastReengagementSuccess' = 'true') as successful,
          COUNT(*) as total
        FROM "FlowBuilderExecutions" 
        WHERE "companyId" = :companyId 
          AND variables ? '__reengagementAttempts'
          AND (variables->>'__reengagementAttempts')::int > 0
      `, {
        replacements: { companyId },
        type: QueryTypes.SELECT
      })
    ]);

    // Calcular taxa de reengajamento
    const reengagementResult = reengagementStats[0] as any;
    const reengagementRate = reengagementResult?.total > 0 
      ? (Number(reengagementResult.successful) / Number(reengagementResult.total)) * 100
      : 0;

    // Calcular tempo médio de inatividade
    const averageResult = averageInactivityStats[0] as any;
    const averageInactivityTime = averageResult?.averageMinutes || 0;

    const stats: DashboardStats = {
      totalActiveExecutions,
      inactiveExecutions,
      warningExecutions,
      reengagedToday,
      transferredToday,
      endedToday,
      averageInactivityTime: Math.round(Number(averageInactivityTime)),
      reengagementRate: Math.round(reengagementRate * 10) / 10
    };

    return res.status(200).json(stats);
  } catch (error) {
    logger.error(`[DashboardStats] Erro ao obter estatísticas: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Obter execuções filtradas
export const getFilteredExecutions = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    flowId,
    sortBy = 'lastInteractionAt',
    sortOrder = 'desc'
  } = req.query as FilteredExecutionsRequest;

  try {
    // Construir filtros
    const whereConditions: any = { companyId };

    // Filtro por status
    if (status !== 'all') {
      if (status === 'active') {
        whereConditions.status = 'active';
      } else if (status === 'warning') {
        whereConditions.inactivityStatus = 'warning';
      } else if (status === 'inactive') {
        whereConditions.inactivityStatus = 'inactive';
      } else if (status === 'ended') {
        whereConditions.status = 'completed';
      }
    }

    // Filtro por fluxo
    if (flowId && flowId !== 'all' && typeof flowId === 'string') {
      whereConditions.flowId = Number(flowId);
    }

    // Filtro de busca
    const includeConditions: any[] = [
      {
        model: Contact,
        as: 'contact',
        attributes: ['id', 'name', 'number', 'email'],
        where: search ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { number: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined,
        required: !!search
      },
      {
        model: FlowBuilder,
        as: 'flow',
        attributes: ['id', 'name'],
        where: search ? {
          name: { [Op.iLike]: `%${search}%` }
        } : undefined,
        required: false
      }
    ];

    // Ordenação - corrigir referências de colunas
    const orderBy: any[] = [];
    if (sortBy === 'lastActivity') {
      orderBy.push(['lastInteractionAt', sortOrder]);
    } else if (sortBy === 'startedAt') {
      orderBy.push(['createdAt', sortOrder]);
    } else if (sortBy === 'durationMinutes') {
      orderBy.push([
        Sequelize.literal(`EXTRACT(EPOCH FROM (COALESCE("updatedAt", NOW()) - "createdAt")) / 60`),
        sortOrder
      ]);
    } else if (sortBy === 'warningsSent') {
      orderBy.push(['inactivityWarningsSent', sortOrder]);
    } else {
      // Para outros casos, usar a coluna diretamente
      orderBy.push([sortBy, sortOrder]);
    }

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);

    // Buscar execuções
    const { count, rows: executions } = await FlowBuilderExecution.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      order: orderBy,
      limit: Number(limit),
      offset,
      attributes: {
        include: [
          [
            Sequelize.literal(`EXTRACT(EPOCH FROM (COALESCE("updatedAt", NOW()) - "createdAt")) / 60`),
            'durationMinutes'
          ],
          [
            Sequelize.literal(`EXTRACT(EPOCH FROM (COALESCE("updatedAt", NOW()) - COALESCE("lastInteractionAt", "createdAt"))) / 60`),
            'inactiveMinutes'
          ]
        ]
      }
    });

    // Formatar execuções
    const formattedExecutions = executions.map(execution => ({
      id: execution.id,
      status: execution.status,
      inactivityStatus: execution.inactivityStatus,
      startedAt: execution.createdAt,
      lastActivity: execution.lastInteractionAt,
      durationMinutes: Math.round(Number(execution.get('durationMinutes'))),
      inactiveMinutes: Math.round(Number(execution.get('inactiveMinutes'))),
      warningsSent: execution.inactivityWarningsSent || 0,
      reengagementAttempts: execution.variables?.__reengagementAttempts || 0,
      contact: execution.contact,
      flow: execution.flow,
      currentNode: {
        id: execution.currentNodeId,
        label: execution.currentNodeId // Simplificado
      },
      variables: execution.variables
    }));

    return res.status(200).json({
      executions: formattedExecutions,
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error) {
    logger.error(`[FilteredExecutions] Erro ao obter execuções: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Obter lista de fluxos
export const getFlowsList = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    const flows = await FlowBuilder.findAll({
      where: { companyId },
      attributes: ['id', 'name', 'active'],
      order: [['name', 'ASC']]
    });

    return res.status(200).json(flows);
  } catch (error) {
    logger.error(`[FlowsList] Erro ao obter lista de fluxos: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Reengajar execução
export const reengageExecution = async (req: Request, res: Response): Promise<Response> => {
  const { executionId } = req.params;
  const { companyId } = req.user;
  
  try {
    // Buscar execução
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId },
      include: [
        {
          model: Contact,
          as: 'contact'
        }
      ]
    });

    if (!execution) {
      return res.status(404).json({ error: "Execução não encontrada" });
    }

    // Buscar ticket relacionado
    const ticket = await Ticket.findOne({
      where: {
        contactId: execution.contactId,
        status: ['open', 'pending'],
        companyId
      },
      include: [
        {
          model: Contact,
          as: 'contact'
        }
      ]
    });

    if (!ticket) {
      return res.status(400).json({ error: "Ticket não encontrado ou não está ativo" });
    }

    // Tentar reengajar
    const success = await ReengagementService.attemptReengagement(execution, ticket);

    if (success) {
      // Notificar via WebSocket
      const io = getIO();
      io.to(`company-${companyId}-notification`).emit("flowExecution", {
        action: "reengage",
        executionId: execution.id,
        success: true
      });

      return res.status(200).json({
        success: true,
        message: "Tentativa de reengajamento enviada com sucesso"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Não foi possível reengajar esta execução"
      });
    }
  } catch (error) {
    logger.error(`[ReengageExecution] Erro ao reengajar execução: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Limpeza geral de execuções inativas
export const cleanupAllInactiveExecutions = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { maxInactiveTimeMinutes = 60, batchSize = 100 } = req.body;
  
  try {
    // Validar parâmetros
    const maxTime = parseInt(maxInactiveTimeMinutes);
    const limit = parseInt(batchSize);
    
    if (isNaN(maxTime) || maxTime < 5) {
      throw new AppError("Tempo máximo de inatividade inválido. Mínimo: 5 minutos.");
    }
    
    if (isNaN(limit) || limit < 1 || limit > 500) {
      throw new AppError("Tamanho de lote inválido. Deve estar entre 1 e 500.");
    }
    
    // Executar limpeza
    const stats = await CleanupInactiveFlowsService.cleanupInactiveFlows(maxTime, limit);
    
    // Notificar via WebSocket
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("inactivity:cleanup", {
      status: "completed",
      stats
    });
    
    return res.status(200).json({
      message: "Limpeza de execuções inativas concluída",
      cleaned: stats.completedExecutions,
      errors: stats.erroredExecutions,
      ticketsUpdated: stats.ticketsUpdated
    });
  } catch (error) {
    logger.error(`[CleanupAll] Erro na limpeza geral: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Configurações de inatividade por fluxo
export const getFlowInactivitySettings = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;
  
  try {
    const flow = await FlowBuilder.findOne({
      where: { id: flowId, companyId },
      attributes: [
        'id', 'name', 'generalInactivityTimeout', 'questionInactivityTimeout',
        'menuInactivityTimeout', 'inactivityAction', 'inactivityWarningMessage',
        'inactivityEndMessage', 'inactivityTransferQueueId', 'maxInactivityWarnings',
        'warningInterval'
      ]
    });

    if (!flow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }

    const settings = {
      enabled: true,
      defaultTimeoutMinutes: Math.floor((flow.generalInactivityTimeout || 300) / 60),
      defaultWarningTimeoutMinutes: Math.floor((flow.questionInactivityTimeout || 180) / 60),
      defaultMaxWarnings: flow.maxInactivityWarnings || 2,
      defaultAction: flow.inactivityAction || 'warning',
      defaultWarningMessage: flow.inactivityWarningMessage || 'Você ainda está aí? Por favor, responda para continuar.',
      defaultEndMessage: flow.inactivityEndMessage || 'Conversa encerrada por inatividade.',
      defaultReengageMessage: 'Vamos tentar novamente! Como posso ajudá-lo?',
      defaultTransferMessage: 'Transferindo você para um atendente devido à inatividade.',
      cleanupInactiveAfterHours: 24,
      enableAutoCleanup: true,
      trackInactivityMetrics: true
    };

    return res.status(200).json(settings);
  } catch (error) {
    logger.error(`[FlowInactivitySettings] Erro ao obter configurações: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const updateFlowInactivitySettings = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;
  const settings = req.body;
  
  try {
    const flow = await FlowBuilder.findOne({
      where: { id: flowId, companyId }
    });

    if (!flow) {
      return res.status(404).json({ error: "Fluxo não encontrado" });
    }

    // Atualizar configurações do fluxo
    await flow.update({
      generalInactivityTimeout: (settings.defaultTimeoutMinutes || 5) * 60,
      questionInactivityTimeout: (settings.defaultWarningTimeoutMinutes || 3) * 60,
      menuInactivityTimeout: (settings.defaultWarningTimeoutMinutes || 3) * 60,
      inactivityAction: settings.defaultAction || 'warning',
      inactivityWarningMessage: settings.defaultWarningMessage,
      inactivityEndMessage: settings.defaultEndMessage,
      maxInactivityWarnings: settings.defaultMaxWarnings || 2,
      warningInterval: 60
    });

    return res.status(200).json({
      message: "Configurações de inatividade atualizadas com sucesso"
    });
  } catch (error) {
    logger.error(`[UpdateFlowInactivitySettings] Erro ao atualizar configurações: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getActiveExecutionsByFlow = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;
  
  try {
    const executions = await FlowBuilderExecution.findAll({
      where: {
        flowId,
        companyId,
        status: 'active'
      },
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'number']
        }
      ],
      order: [['lastInteractionAt', 'DESC']],
      limit: 50
    });

    const formattedExecutions = executions.map(execution => ({
      id: execution.id,
      inactivityStatus: execution.inactivityStatus,
      startedAt: execution.createdAt,
      lastActivity: execution.lastInteractionAt,
      contact: execution.contact,
      currentNode: {
        id: execution.currentNodeId,
        label: execution.currentNodeId
      }
    }));

    return res.status(200).json(formattedExecutions);
  } catch (error) {
    logger.error(`[ActiveExecutionsByFlow] Erro ao obter execuções ativas: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getFlowInactivityStats = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;
  
  try {
    const stats = await CleanupInactiveFlowsService.collectInactivityStats();
    
    // Filtrar estatísticas por fluxo específico se necessário
    const flowSpecificStats = {
      ...stats,
      // Adicionar lógica específica do fluxo aqui se necessário
    };

    return res.status(200).json(flowSpecificStats);
  } catch (error) {
    logger.error(`[FlowInactivityStats] Erro ao obter estatísticas do fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const cleanupFlowInactiveExecutions = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;
  
  try {
    // Implementar limpeza específica do fluxo
    const result = await sequelize.query(`
      UPDATE "FlowBuilderExecutions" 
      SET status = 'completed', 
          "inactivityStatus" = 'inactive',
          "inactivityReason" = 'Limpeza manual do fluxo'
      WHERE "flowId" = :flowId 
        AND "companyId" = :companyId 
        AND status = 'active'
        AND "lastInteractionAt" < NOW() - INTERVAL '1 hour'
      RETURNING id
    `, {
      replacements: { flowId, companyId },
      type: QueryTypes.UPDATE
    });

    const cleanedCount = Array.isArray(result[1]) ? result[1].length : 0;

    return res.status(200).json({
      message: "Limpeza do fluxo concluída",
      cleaned: cleanedCount
    });
  } catch (error) {
    logger.error(`[CleanupFlowInactive] Erro na limpeza do fluxo: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Obter estatísticas existentes (compatibilidade)
export const getInactivityStats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    const stats = await CleanupInactiveFlowsService.collectInactivityStats();
    return res.status(200).json(stats);
  } catch (error) {
    logger.error(`[InactivityStats] Erro ao obter estatísticas: ${error.message}`);
    throw new AppError(error.message);
  }
};

// Forçar limpeza de inatividade (compatibilidade)
export const forceInactivityCleanup = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { maxInactiveTimeMinutes, batchSize } = req.body;
  
  try {
    const maxTime = maxInactiveTimeMinutes ? parseInt(maxInactiveTimeMinutes) : 60;
    const limit = batchSize ? parseInt(batchSize) : 100;
    
    if (isNaN(maxTime) || maxTime < 5) {
      throw new AppError("Tempo máximo de inatividade inválido. Mínimo: 5 minutos.");
    }
    
    if (isNaN(limit) || limit < 1 || limit > 500) {
      throw new AppError("Tamanho de lote inválido. Deve estar entre 1 e 500.");
    }
    
    const stats = await CleanupInactiveFlowsService.cleanupInactiveFlows(maxTime, limit);
    
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("inactivity:cleanup", {
      status: "completed",
      stats
    });
    
    return res.status(200).json({
      message: "Limpeza de inatividade iniciada com sucesso",
      stats
    });
  } catch (error) {
    logger.error(`[InactivityStats] Erro ao forçar limpeza: ${error.message}`);
    throw new AppError(error.message);
  }
};

export default {
  getDashboardStats,
  getFilteredExecutions,
  getFlowsList,
  reengageExecution,
  cleanupAllInactiveExecutions,
  getFlowInactivitySettings,
  updateFlowInactivitySettings,
  getActiveExecutionsByFlow,
  getFlowInactivityStats,
  cleanupFlowInactiveExecutions,
  getInactivityStats,
  forceInactivityCleanup
};