import { Op, Transaction, WhereOptions } from 'sequelize';
import AppError from '../../errors/AppError';
import KanbanCard from '../../models/KanbanCard';
import KanbanLane from '../../models/KanbanLane';
import KanbanBoard from '../../models/KanbanBoard';
import Ticket from '../../models/Ticket';
import User from '../../models/User';
import Contact from '../../models/Contact';
import Tag from '../../models/Tag';
import { logger } from '../../utils/logger';
import { getIO } from "../../libs/socket";
import KanbanChecklistItem from '../../models/KanbanChecklistItem';
import database from '../../database';


interface CreateCardData {
  title?: string;
  description?: string;
  priority?: number;
  dueDate?: Date;
  laneId: number;
  assignedUserId?: number;
  contactId?: number;
  ticketId?: number;
  value?: number;
  sku?: string;
  tags?: Tag[];
  metadata?: any;
  companyId: number;
}

interface UpdateCardData {
  title?: string;
  description?: string;
  priority?: number;
  dueDate?: Date;
  laneId?: number;
  assignedUserId?: number;
  contactId?: number;
  ticketId?: number;
  value?: number;
  sku?: string;
  tags?: Tag[];
  metadata?: any;
  isArchived?: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  timeInLane?: number;
}

interface FindCardsParams {
  companyId: number;
  boardId?: number;
  laneId?: number;
  assignedUserId?: number;
  searchParam?: string;
  showArchived?: boolean;
  ticketId?: number;
  contactId?: number;
  tags?: number[];
  startDueDate?: Date;
  endDueDate?: Date;
  priority?: number[];
  isBlocked?: boolean;
}

const createCard = async (data: CreateCardData): Promise<KanbanCard> => {
  const { laneId, companyId, ...cardData } = data;
  
  try {
    // Verificar se a lane existe e pertence à empresa
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

    // Verificar limite de cards na lane
    if (lane.cardLimit > 0) {
      const cardsCount = await KanbanCard.count({
        where: { laneId }
      });

      if (cardsCount >= lane.cardLimit) {
        throw new AppError(`Lane card limit (${lane.cardLimit}) reached`, 400);
      }
    }

    // Verificar usuário atribuído
    if (data.assignedUserId) {
      const user = await User.findOne({
        where: {
          id: data.assignedUserId,
          companyId
        }
      });

      if (!user) {
        throw new AppError('Assigned user not found or does not belong to company', 404);
      }
    }

    // Verificar contato
    if (data.contactId) {
      const contact = await Contact.findOne({
        where: {
          id: data.contactId,
          companyId
        }
      });

      if (!contact) {
        throw new AppError('Contact not found or does not belong to company', 404);
      }
    }

    // Verificar ticket
    if (data.ticketId) {
      const ticket = await Ticket.findOne({
        where: {
          id: data.ticketId,
          companyId
        }
      });

      if (!ticket) {
        throw new AppError('Ticket not found or does not belong to company', 404);
      }

      // Se o ticket for informado mas o title não, usar o contactId como título
      if (!cardData.title && ticket.contact) {
        cardData.title = ticket.contact.name || `Ticket #${ticket.id}`;
      }
    }

    const card = await KanbanCard.create({
      ...cardData,
      laneId,
      startedAt: new Date() // Registrar quando o card iniciou
    });

    // Recarregar o card com as relações
    const createdCard = await KanbanCard.findByPk(card.id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email', 'profilePic', 'color']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['id', 'status', 'unreadMessages']
        }
      ]
    });

    return createdCard;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error creating kanban card:', error);
    throw new AppError('Error creating kanban card: ' + error.message);
  }
};

const findCard = async (cardId: number, companyId: number): Promise<KanbanCard> => {
  try {
    const card = await KanbanCard.findOne({
      where: { id: cardId },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { companyId }
            }
          ]
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email', 'profilePic', 'color']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['id', 'status', 'unreadMessages']
        },
        {
          model: KanbanChecklistItem,
          as: 'checklistItems',
          include: [
            {
              model: User,
              as: 'assignedUser',
              attributes: ['id', 'name']
            },
            {
              model: User,
              as: 'checkedByUser',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!card) {
      throw new AppError('Card not found or does not belong to company', 404);
    }

    return card;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching kanban card:', error);
    throw new AppError('Error fetching kanban card');
  }
};

const findCards = async (params: FindCardsParams): Promise<{ cards: KanbanCard[], count: number }> => {
  try {
    const {
      companyId,
      boardId,
      laneId,
      assignedUserId,
      searchParam,
      showArchived = false,
      ticketId,
      contactId,
      tags,
      startDueDate,
      endDueDate,
      priority,
      isBlocked
    } = params;

    // Construir a condição where para os cards
    const cardWhere: WhereOptions = {};
    
    // Filtrar por lane ou board
    if (laneId) {
      cardWhere.laneId = laneId;
    }
    
    // Filtrar por ticket
    if (ticketId) {
      cardWhere.ticketId = ticketId;
    }
    
    // Filtrar por contato
    if (contactId) {
      cardWhere.contactId = contactId;
    }
    
    // Filtrar por usuário atribuído
    if (assignedUserId) {
      cardWhere.assignedUserId = assignedUserId;
    }
    
    // Filtrar por arquivados
    if (!showArchived) {
      cardWhere.isArchived = false;
    }
    
    // Filtrar por prioridade
    if (priority && priority.length > 0) {
      cardWhere.priority = { [Op.in]: priority };
    }
    
    // Filtrar por bloqueados
    if (isBlocked !== undefined) {
      cardWhere.isBlocked = isBlocked;
    }
    
    // Filtrar por data de vencimento
    if (startDueDate && endDueDate) {
      cardWhere.dueDate = {
        [Op.between]: [startDueDate.getTime(), endDueDate.getTime()]
      };
    } else if (startDueDate) {
      cardWhere.dueDate = {
        [Op.gte]: startDueDate.getTime()
      };
    } else if (endDueDate) {
      cardWhere.dueDate = {
        [Op.lte]: endDueDate.getTime()
      };
    }
    
    // Filtrar por tags
    if (tags && tags.length > 0) {
      const andConditions: any[] = tags.map(tagId => ({
        tags: {
          [Op.contains]: [{ id: tagId }]
        }
      }));
      cardWhere[Op.and as any] = andConditions;
    }
    
    // Filtrar por termo de busca
    if (searchParam) {
      const orConditions: any[] = [
        { title: { [Op.iLike]: `%${searchParam}%` } },
        { description: { [Op.iLike]: `%${searchParam}%` } },
        { sku: { [Op.iLike]: `%${searchParam}%` } }
      ];
      cardWhere[Op.or as any] = orConditions;
    }

    // Construir a condição where para as lanes
    const laneWhere: WhereOptions = {};
    
    if (boardId) {
      laneWhere.boardId = boardId;
    }

    // Construir a condição where para o quadro
    const boardWhere = {
      companyId
    };

    // Contar total de cards
    const count = await KanbanCard.count({
      where: cardWhere,
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          where: laneWhere,
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: boardWhere
            }
          ]
        }
      ]
    });

    // Buscar cards com includes
    const cards = await KanbanCard.findAll({
      where: cardWhere,
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          where: laneWhere,
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: boardWhere
            }
          ]
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email', 'profilePic', 'color']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['id', 'status', 'unreadMessages']
        },
        {
          model: KanbanChecklistItem,
          as: 'checklistItems',
          attributes: ['id', 'description', 'checked', 'required']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    return { cards, count };
  } catch (error) {
    logger.error('Error fetching kanban cards:', error);
    throw new AppError('Error fetching kanban cards');
  }
};

const updateCard = async (
  cardId: number,
  companyId: number,
  data: UpdateCardData,
  transaction?: Transaction
): Promise<KanbanCard> => {
  try {
    const card = await KanbanCard.findOne({
      where: { id: cardId },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { companyId }
            }
          ]
        }
      ]
    });

    if (!card) {
      throw new AppError('Card not found or does not belong to company', 404);
    }

    // Se mudar a lane, validar e calcular o tempo na lane atual
    if (data.laneId && data.laneId !== card.laneId) {
      // Verificar se a nova lane pertence ao mesmo quadro
      const newLane = await KanbanLane.findOne({
        where: { id: data.laneId },
        include: [
          {
            model: KanbanBoard,
            as: 'board',
            where: { id: card.lane.board.id }
          }
        ]
      });

      if (!newLane) {
        throw new AppError('New lane not found or does not belong to the same board', 404);
      }

      // Verificar limite de cards na lane de destino
      if (newLane.cardLimit > 0) {
        const cardsCount = await KanbanCard.count({
          where: { laneId: newLane.id }
        });

        if (cardsCount >= newLane.cardLimit) {
          throw new AppError(`Destination lane card limit (${newLane.cardLimit}) reached`, 400);
        }
      }

      // Calcular o tempo passado na lane atual
      const now = new Date();
      const timeInLane = Math.floor((now.getTime() - (card.startedAt || card.createdAt).getTime()) / 1000); // em segundos
      
      // Atualizar timeInLane e reiniciar startedAt
      data.timeInLane = timeInLane;
      card.startedAt = now;
    }

    await card.update(data, { transaction });

    // Recarregar o card com as relações atualizadas
    const updatedCard = await KanbanCard.findByPk(cardId, {
      include: [
        {
          model: KanbanLane,
          as: 'lane'
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email', 'profilePic', 'color']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['id', 'status', 'unreadMessages']
        },
        {
          model: KanbanChecklistItem,
          as: 'checklistItems',
          include: [
            {
              model: User,
              as: 'assignedUser',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      transaction
    });

    return updatedCard;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating kanban card:', error);
    throw new AppError('Error updating kanban card');
  }
};

const deleteCard = async (cardId: number, companyId: number): Promise<void> => {
  try {
    const card = await KanbanCard.findOne({
      where: { id: cardId },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { companyId }
            }
          ]
        }
      ]
    });

    if (!card) {
      throw new AppError('Card not found or does not belong to company', 404);
    }

    // Se o card tiver um ticket associado, não excluir, apenas arquivar
    if (card.ticketId) {
      await card.update({ isArchived: true });
      return;
    }

    await card.destroy();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error deleting kanban card:', error);
    throw new AppError('Error deleting kanban card');
  }
};

const moveCard = async (
  cardId: number, 
  targetLaneId: number, 
  companyId: number, 
  userId: number
): Promise<KanbanCard> => {
  const t = await database.transaction();
  
  try {
    const card = await KanbanCard.findOne({
      where: { id: cardId },
      include: [
        {
          model: KanbanLane,
          as: 'lane',
          include: [
            {
              model: KanbanBoard,
              as: 'board',
              where: { companyId }
            }
          ]
        }
      ],
      transaction: t
    });

    if (!card) {
      throw new AppError('Card not found or does not belong to company', 404);
    }

    // Não mover se já estiver na lane de destino
    if (card.laneId === targetLaneId) {
      await t.rollback();
      return card;
    }

    // Verificar se a lane de destino existe e pertence ao mesmo quadro
    const targetLane = await KanbanLane.findOne({
      where: { 
        id: targetLaneId,
        boardId: card.lane.boardId 
      },
      transaction: t
    });

    if (!targetLane) {
      throw new AppError('Target lane not found or does not belong to the same board', 404);
    }

    // Verificar limite de cards na lane de destino
    if (targetLane.cardLimit > 0) {
      const cardsCount = await KanbanCard.count({
        where: { laneId: targetLaneId },
        transaction: t
      });

      if (cardsCount >= targetLane.cardLimit) {
        throw new AppError(`Destination lane card limit (${targetLane.cardLimit}) reached`, 400);
      }
    }

    // Calcular o tempo passado na lane atual
    const now = new Date();
    const startedAt = card.startedAt || card.createdAt;
    const timeInLane = Math.floor((now.getTime() - startedAt.getTime()) / 1000); // em segundos

    // Atualizar o card
    await card.update(
      {
        laneId: targetLaneId,
        timeInLane,
        startedAt: now // Reiniciar o contador de tempo para a nova lane
      },
      { transaction: t }
    );

    // Se o card tem um ticket associado, enviar uma notificação via socket
    if (card.ticketId) {
      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit(`kanban-card-moved`, {
        cardId: card.id,
        ticketId: card.ticketId,
        fromLaneId: card.laneId,
        toLaneId: targetLaneId,
        movedBy: userId
      });
    }

    // Recarregar o card com as relações atualizadas
    const updatedCard = await KanbanCard.findByPk(cardId, {
      include: [
        {
          model: KanbanLane,
          as: 'lane'
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email', 'profilePic', 'color']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['id', 'status', 'unreadMessages']
        },
        {
          model: KanbanChecklistItem,
          as: 'checklistItems'
        }
      ],
      transaction: t
    });

    await t.commit();
    return updatedCard;
  } catch (error) {
    await t.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error moving kanban card:', error);
    throw new AppError('Error moving kanban card');
  }
};

export default {
  createCard,
  findCard,
  findCards,
  updateCard,
  deleteCard,
  moveCard
};