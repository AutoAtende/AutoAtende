import { Op, Transaction } from 'sequelize';
import AppError from '../../errors/AppError';
import KanbanLane from '../../models/KanbanLane';
import KanbanBoard from '../../models/KanbanBoard';
import Queue from '../../models/Queue';
import { logger } from '../../utils/logger';
import database from '../../database';
import { Sequelize } from 'sequelize';

interface CreateLaneData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  position?: number;
  cardLimit?: number;
  boardId: number;
  queueId?: number;
  companyId: number;
}

interface UpdateLaneData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  position?: number;
  cardLimit?: number;
  queueId?: number;
  active?: boolean;
}

interface ReorderLanesParams {
  boardId: number;
  companyId: number;
  lanes: { id: number; position: number }[];
}

const createLane = async (data: CreateLaneData): Promise<KanbanLane> => {
  const { boardId, companyId, position, ...laneData } = data;
  
  try {
    // Verificar se o quadro existe e pertence à empresa
    const board = await KanbanBoard.findOne({
      where: {
        id: boardId,
        companyId
      }
    });

    if (!board) {
      throw new AppError('Board not found or does not belong to company', 404);
    }

    let finalPosition: number;
    
    // Se a posição não for especificada, colocar no final
    if (position === undefined) {
      const maxPosition = await KanbanLane.max('position', {
        where: { boardId }
      }) as number;
      
      finalPosition = (maxPosition !== null) ? maxPosition + 1 : 0;
    } else {
      // Se uma posição específica for solicitada, reorganizar as lanes existentes
      await KanbanLane.update(
        { position: Sequelize.literal('position + 1') },
        {
          where: {
            boardId,
            position: { [Op.gte]: position }
          }
        }
      );
      
      finalPosition = position;
    }

    // Verificar queue se fornecida
    if (data.queueId) {
      const queue = await Queue.findOne({
        where: {
          id: data.queueId,
          companyId
        }
      });

      if (!queue) {
        throw new AppError('Queue not found or does not belong to company', 404);
      }
    }

    const lane = await KanbanLane.create({
      ...laneData,
      position: finalPosition,
      boardId
    });

    return lane;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error creating kanban lane:', error);
    throw new AppError('Error creating kanban lane: ' + error.message);
  }
};

const findLane = async (laneId: number, companyId: number): Promise<KanbanLane> => {
  try {
    const lane = await KanbanLane.findOne({
      where: { id: laneId },
      include: [
        {
          model: KanbanBoard,
          as: 'board',
          where: { companyId }
        },
        {
          model: Queue,
          as: 'queue',
          attributes: ['id', 'name', 'color']
        }
      ]
    });

    if (!lane) {
      throw new AppError('Lane not found', 404);
    }

    return lane;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching kanban lane:', error);
    throw new AppError('Error fetching kanban lane');
  }
};

const updateLane = async (
  laneId: number,
  companyId: number,
  data: UpdateLaneData,
  transaction?: Transaction
): Promise<KanbanLane> => {
  try {
    const lane = await KanbanLane.findOne({
      where: { id: laneId },
      include: [
        {
          model: KanbanBoard,
          as: 'board',
          where: { companyId }
        }
      ]
    });

    if (!lane) {
      throw new AppError('Lane not found or does not belong to company', 404);
    }

    // Se a posição estiver mudando, reorganizar as lanes
    if (data.position !== undefined && data.position !== lane.position) {
      // Verificar se a posição está dentro dos limites
      const lanesCount = await KanbanLane.count({
        where: { boardId: lane.boardId }
      });

      if (data.position < 0 || data.position >= lanesCount) {
        throw new AppError(`Position must be between 0 and ${lanesCount - 1}`, 400);
      }

      // Reorganizar as outras lanes
      if (data.position > lane.position) {
        // Movendo para a direita
        await KanbanLane.update(
          { position: Sequelize.literal('position - 1') },
          {
            where: {
              boardId: lane.boardId,
              position: { [Op.gt]: lane.position, [Op.lte]: data.position }
            },
            transaction
          }
        );
      } else {
        // Movendo para a esquerda
        await KanbanLane.update(
          { position: Sequelize.literal('position + 1') },
          {
            where: {
              boardId: lane.boardId,
              position: { [Op.gte]: data.position, [Op.lt]: lane.position }
            },
            transaction
          }
        );
      }
    }

    // Verificar queue se fornecida
    if (data.queueId) {
      const queue = await Queue.findOne({
        where: {
          id: data.queueId,
          companyId
        }
      });

      if (!queue) {
        throw new AppError('Queue not found or does not belong to company', 404);
      }
    }

    await lane.update(data, { transaction });

    // Recarregar a lane com as relações atualizadas
    const updatedLane = await KanbanLane.findByPk(laneId, {
      include: [
        {
          model: Queue,
          as: 'queue',
          attributes: ['id', 'name', 'color']
        }
      ],
      transaction
    });

    return updatedLane;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating kanban lane:', error);
    throw new AppError('Error updating kanban lane');
  }
};

const deleteLane = async (laneId: number, companyId: number): Promise<void> => {
  const t = await database.transaction();
  
  try {
    const lane = await KanbanLane.findOne({
      where: { id: laneId },
      include: [
        {
          model: KanbanBoard,
          as: 'board',
          where: { companyId }
        }
      ]
    });

    if (!lane) {
      throw new AppError('Lane not found or does not belong to company', 404);
    }

    // Verificar se é a última lane do quadro
    const lanesCount = await KanbanLane.count({
      where: { boardId: lane.boardId }
    });

    if (lanesCount <= 1) {
      throw new AppError('Cannot delete the last lane in a board', 400);
    }

    // Obter a posição da lane a ser excluída
    const position = lane.position;

    // Excluir a lane
    await lane.destroy({ transaction: t });

    // Reorganizar as posições das lanes restantes
    await KanbanLane.update(
      { position: Sequelize.literal('position - 1') },
      {
        where: {
          boardId: lane.boardId,
          position: { [Op.gt]: position }
        },
        transaction: t
      }
    );

    await t.commit();
  } catch (error) {
    await t.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error deleting kanban lane:', error);
    throw new AppError('Error deleting kanban lane');
  }
};

const reorderLanes = async ({ boardId, companyId, lanes }: ReorderLanesParams): Promise<void> => {
  const t = await database.transaction();
  
  try {
    // Verificar se o quadro existe e pertence à empresa
    const board = await KanbanBoard.findOne({
      where: {
        id: boardId,
        companyId
      }
    });

    if (!board) {
      throw new AppError('Board not found or does not belong to company', 404);
    }

    // Verificar se todas as lanes pertencem ao quadro
    const existingLanes = await KanbanLane.findAll({
      where: {
        boardId,
        id: lanes.map(l => l.id)
      }
    });

    if (existingLanes.length !== lanes.length) {
      throw new AppError('One or more lanes do not belong to the specified board', 400);
    }

    // Atualizar as posições
    for (const lane of lanes) {
      await KanbanLane.update(
        { position: lane.position },
        {
          where: { id: lane.id },
          transaction: t
        }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error reordering kanban lanes:', error);
    throw new AppError('Error reordering kanban lanes');
  }
};

export default {
  createLane,
  findLane,
  updateLane,
  deleteLane,
  reorderLanes
};