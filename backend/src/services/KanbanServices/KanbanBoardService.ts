import { Op, Transaction } from 'sequelize';
import AppError from '../../errors/AppError';
import KanbanBoard from '../../models/KanbanBoard';
import KanbanLane from '../../models/KanbanLane';
import User from '../../models/User';
import { logger } from '../../utils/logger';

interface CreateBoardData {
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  defaultView?: 'kanban' | 'list' | 'calendar';
  companyId: number;
  createdBy: number;
}

interface UpdateBoardData {
  name?: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  defaultView?: 'kanban' | 'list' | 'calendar';
  active?: boolean;
}

interface FindParams {
  companyId: number;
  active?: boolean;
  searchParam?: string;
  boardId?: number;
}

const createBoard = async (data: CreateBoardData): Promise<KanbanBoard> => {
  try {
    // Se o novo quadro for definido como padrão, atualize todos os outros para não serem padrão
    if (data.isDefault) {
      await KanbanBoard.update(
        { isDefault: false },
        {
          where: {
            companyId: data.companyId,
            isDefault: true
          }
        }
      );
    }

    const board = await KanbanBoard.create(data);

    // Criar lanes padrão iniciais
    const defaultLanes = [
      {
        name: 'Pendente',
        description: 'Tickets aguardando processamento',
        color: '#f1c40f',
        position: 0,
        boardId: board.id
      },
      {
        name: 'Em Progresso',
        description: 'Tickets em atendimento',
        color: '#3498db',
        position: 1,
        boardId: board.id
      },
      {
        name: 'Concluído',
        description: 'Tickets finalizados',
        color: '#2ecc71',
        position: 2,
        boardId: board.id
      }
    ];

    await KanbanLane.bulkCreate(defaultLanes);

    return board;
  } catch (error) {
    logger.error('Error creating kanban board:', error);
    throw new AppError('Error creating kanban board: ' + error.message);
  }
};

const findBoard = async (boardId: number, companyId: number): Promise<KanbanBoard> => {
  try {
    const board = await KanbanBoard.findOne({
      where: { 
        id: boardId,
        companyId 
      },
      include: [
        {
          model: KanbanLane,
          as: 'lanes',
          order: [['position', 'ASC']]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!board) {
      throw new AppError('Board not found', 404);
    }

    return board;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching kanban board:', error);
    throw new AppError('Error fetching kanban board');
  }
};

const findAllBoards = async ({ 
  companyId, 
  active = true, 
  searchParam = '',
  boardId 
}: FindParams): Promise<KanbanBoard[]> => {
  try {
    const whereCondition: any = {
      companyId
    };

    if (active !== undefined) {
      whereCondition.active = active;
    }

    if (boardId) {
      whereCondition.id = boardId;
    }

    if (searchParam) {
      whereCondition.name = {
        [Op.iLike]: `%${searchParam}%`
      };
    }

    const boards = await KanbanBoard.findAll({
      where: whereCondition,
      include: [
        {
          model: KanbanLane,
          as: 'lanes',
          separate: true,
          order: [['position', 'ASC']]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      order: [
        ['isDefault', 'DESC'],
        ['name', 'ASC']
      ]
    });

    return boards;
  } catch (error) {
    logger.error('Error fetching kanban boards:', error);
    throw new AppError('Error fetching kanban boards');
  }
};

const updateBoard = async (
  boardId: number,
  companyId: number,
  data: UpdateBoardData,
  transaction?: Transaction
): Promise<KanbanBoard> => {
  try {
    const board = await KanbanBoard.findOne({
      where: { 
        id: boardId,
        companyId 
      }
    });

    if (!board) {
      throw new AppError('Board not found', 404);
    }

    // Se o quadro for definido como padrão, atualize todos os outros para não serem padrão
    if (data.isDefault) {
      await KanbanBoard.update(
        { isDefault: false },
        {
          where: {
            companyId,
            isDefault: true,
            id: { [Op.ne]: boardId }
          },
          transaction
        }
      );
    }

    await board.update(data, { transaction });

    // Recarregar o quadro com as lanes
    const updatedBoard = await KanbanBoard.findByPk(boardId, {
      include: [
        {
          model: KanbanLane,
          as: 'lanes',
          separate: true,
          order: [['position', 'ASC']]
        }
      ],
      transaction
    });

    return updatedBoard;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating kanban board:', error);
    throw new AppError('Error updating kanban board');
  }
};

const deleteBoard = async (boardId: number, companyId: number): Promise<void> => {
  try {
    const board = await KanbanBoard.findOne({
      where: { 
        id: boardId,
        companyId 
      }
    });

    if (!board) {
      throw new AppError('Board not found', 404);
    }

    if (board.isDefault) {
      throw new AppError('Cannot delete the default board', 400);
    }

    // Verificar se existem outros quadros ativos
    const otherBoards = await KanbanBoard.count({
      where: {
        companyId,
        id: { [Op.ne]: boardId },
        active: true
      }
    });

    if (otherBoards === 0) {
      throw new AppError('Cannot delete the last active board', 400);
    }

    await board.destroy();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error deleting kanban board:', error);
    throw new AppError('Error deleting kanban board');
  }
};

export default {
  createBoard,
  findBoard,
  findAllBoards,
  updateBoard,
  deleteBoard
};