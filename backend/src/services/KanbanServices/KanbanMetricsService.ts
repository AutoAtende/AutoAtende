import { Op } from 'sequelize';
import { Sequelize } from "sequelize";
import AppError from '../../errors/AppError';
import KanbanMetric from '../../models/KanbanMetric';
import KanbanCard from '../../models/KanbanCard';
import KanbanLane from '../../models/KanbanLane';
import KanbanBoard from '../../models/KanbanBoard';
import User from '../../models/User';
import { logger } from '../../utils/logger';

interface MetricsRequest {
  companyId: number;
  boardId?: number;
  laneId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  metricType?: string;
}

interface CardMovementData {
  boardId: number;
  fromLaneId: number;
  toLaneId: number;
  timeInLane: number;
  userId?: number;
}

const calculateBoardMetrics = async (params: MetricsRequest): Promise<any> => {
  try {
    const { companyId, boardId, startDate, endDate } = params;

    // Verificar se o quadro existe e pertence à empresa
    if (boardId) {
      const board = await KanbanBoard.findOne({
        where: {
          id: boardId,
          companyId
        }
      });

      if (!board) {
        throw new AppError('Board not found or does not belong to company', 404);
      }
    }

    // Definir período de análise
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30)); // 30 dias atrás como padrão
    const end = endDate || new Date();

    // Convertendo datas para timestamp para operações de comparação no Sequelize (para resolver erros de tipagem)
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();

    // Construir a condição where para os boards
    const boardWhere: any = { companyId };
    if (boardId) {
      boardWhere.id = boardId;
    }

    // 1. Tempo médio em cada lane
    const timeInLaneResults = await KanbanCard.findAll({
      attributes: [
        [Sequelize.literal('lane.id'), 'laneId'],
        [Sequelize.literal('lane.name'), 'laneName'],
        [Sequelize.fn('AVG', Sequelize.col('timeInLane')), 'averageTime'],
        [Sequelize.fn('COUNT', Sequelize.col('KanbanCard.id')), 'cardCount']
      ],
      where: {
        [Op.and]: [
          {
            createdAt: {
              [Op.gte]: start,
              [Op.lte]: end
            }
          },
          { timeInLane: { [Op.not]: null } }
        ]
      },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          attributes: [],
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              attributes: [],
              where: boardWhere
            }
          ]
        }
      ],
      group: ['lane.id', 'lane.name'],
      raw: true
    });

    // 2. Taxa de conversão entre lanes (cards que passaram de uma lane para outra)
    // Esse cálculo é mais complexo e pode exigir dados de histórico de movimentação
    // que não estão disponíveis no modelo atual. Implementação simplificada para demonstração.
    
    // 3. Throughput (cards concluídos por período)
    const completedCardsByDay = await KanbanCard.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('completedAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        completedAt: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          attributes: [],
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              attributes: [],
              where: boardWhere
            }
          ]
        }
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('completedAt'))],
      order: [Sequelize.fn('DATE', Sequelize.col('completedAt'))],
      raw: true
    });

    // 4. Produtividade por usuário
    const userProductivity = await KanbanCard.findAll({
      attributes: [
        [Sequelize.literal('assignedUser.id'), 'userId'],
        [Sequelize.literal('assignedUser.name'), 'userName'],
        [Sequelize.fn('COUNT', Sequelize.col('KanbanCard.id')), 'totalCards'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN "KanbanCard"."completedAt" IS NOT NULL THEN 1 END')), 'completedCards'],
        [Sequelize.fn('AVG', Sequelize.literal('EXTRACT(EPOCH FROM ("KanbanCard"."completedAt" - "KanbanCard"."startedAt")) / 3600')), 'avgCompletionTimeHours']
      ],
      where: {
        [Op.and]: [
          {
            createdAt: {
              [Op.gte]: start,
              [Op.lte]: end
            }
          },
          { assignedUserId: { [Op.not]: null } }
        ]
      },
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: []
        },
        {
          model: KanbanLane,
          as: 'lane',
          attributes: [],
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              attributes: [],
              where: boardWhere
            }
          ]
        }
      ],
      group: ['assignedUser.id', 'assignedUser.name'],
      raw: true
    });

    // 5. Lead time (tempo total desde a criação até a conclusão)
    const leadTime = await KanbanCard.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.literal('EXTRACT(EPOCH FROM ("KanbanCard"."completedAt" - "KanbanCard"."createdAt")) / 3600')), 'avgLeadTimeHours']
      ],
      where: {
        [Op.and]: [
          { completedAt: { [Op.not]: null } },
          { 
            createdAt: { 
              [Op.gte]: start,
              [Op.lte]: end
            } 
          }
        ]
      },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          attributes: [],
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              attributes: [],
              where: boardWhere
            }
          ]
        }
      ],
      raw: true
    });

    // 6. Status dos cards
    const cardsStatus = await KanbanCard.findAll({
      attributes: [
        [Sequelize.literal('lane.id'), 'laneId'],
        [Sequelize.literal('lane.name'), 'laneName'],
        [Sequelize.fn('COUNT', Sequelize.col('KanbanCard.id')), 'count']
      ],
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          attributes: [],
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              attributes: [],
              where: boardWhere
            }
          ]
        }
      ],
      group: ['lane.id', 'lane.name'],
      raw: true
    });

    // Consolidar resultados
    return {
      timeInLane: timeInLaneResults,
      throughput: completedCardsByDay,
      userProductivity,
      leadTime: leadTime.length > 0 ? (leadTime[0] as any).avgLeadTimeHours || 0 : 0,
      cardsStatus
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    logger.error('Error calculating board metrics:', {
      message: errorMessage,
      stack: errorStack,
      params: JSON.stringify(params, (_, v) => v === undefined ? null : v)
    });
    throw new AppError(`Error calculating board metrics: ${errorMessage}`, 500, error);
  }
};

const recordCardMovement = async (data: CardMovementData, companyId: number): Promise<void> => {
  try {
    // Verificar se o quadro pertence à empresa
    const board = await KanbanBoard.findOne({
      where: {
        id: data.boardId,
        companyId
      }
    });

    if (!board) {
      throw new AppError('Board not found or does not belong to company', 404);
    }

    // Salvar métricas de tempo na lane
    await KanbanMetric.create({
      metricType: 'time_in_lane',
      value: data.timeInLane,
      metricData: {
        fromLaneId: data.fromLaneId,
        toLaneId: data.toLaneId
      },
      startDate: new Date(),
      endDate: new Date(),
      companyId,
      boardId: data.boardId,
      laneId: data.fromLaneId,
      userId: data.userId
    });

    // Calcular e atualizar taxa de conversão para a lane de origem
    // Este é um cálculo simplificado para demonstração
    // Na implementação real, deve considerar um período maior
    const fromLaneCards = await KanbanCard.count({
      where: {
        laneId: data.fromLaneId
      },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          attributes: [],
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { id: data.boardId }
            }
          ]
        }
      ]
    });

    const movedCards = await KanbanCard.count({
      where: {
        laneId: { [Op.ne]: data.fromLaneId },
        metadata: {
          previousLaneId: data.fromLaneId
        }
      },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          attributes: [],
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { id: data.boardId }
            }
          ]
        }
      ]
    });

    const conversionRate = fromLaneCards > 0 ? (movedCards / fromLaneCards) : 0;

    await KanbanMetric.create({
      metricType: 'conversion_rate',
      value: conversionRate,
      metricData: {
        fromLaneId: data.fromLaneId,
        toLaneId: data.toLaneId,
        totalCards: fromLaneCards,
        movedCards
      },
      startDate: new Date(),
      endDate: new Date(),
      companyId,
      boardId: data.boardId,
      laneId: data.fromLaneId
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    logger.error('Error recording card movement metrics:', {
      message: errorMessage,
      stack: errorStack,
      data: JSON.stringify(data, (_, v) => v === undefined ? null : v),
      companyId
    });
    // Don't throw error to not break the main flow
    // Just log the error for monitoring
  }
};

export default {
  calculateBoardMetrics,
  recordCardMovement
};