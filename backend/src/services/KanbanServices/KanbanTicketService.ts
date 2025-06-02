import { Op, WhereOptions } from 'sequelize';
import AppError from '../../errors/AppError';
import Ticket from '../../models/Ticket';
import Contact from '../../models/Contact';
import User from '../../models/User';
import Queue from '../../models/Queue';
import Tag from '../../models/Tag';
import { logger } from '../../utils/logger';

interface FindTicketsParams {
  companyId: number;
  queueId?: number;
  status?: string[];
  searchParam?: string;
  users?: number[];
  dateFrom?: string;
  dateTo?: string;
  viewType?: 'active' | 'closed';
}

interface KanbanTicketData {
  id: number;
  uuid: string;
  status: string;
  name?: string;
  value: number;
  sku?: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    id: number;
    name: string;
    number: string;
    profilePicUrl?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  queue?: {
    id: number;
    name: string;
    color: string;
  };
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

const findTicketsForKanban = async (params: FindTicketsParams): Promise<{
  tickets: KanbanTicketData[];
  lanes: Array<{
    id: string;
    name: string;
    color: string;
    tickets: KanbanTicketData[];
  }>;
}> => {
  try {
    const {
      companyId,
      queueId,
      status = ['pending', 'open'],
      searchParam,
      users,
      dateFrom,
      dateTo,
      viewType = 'active'
    } = params;

    // Construir condições where com tipagem adequada
    const whereCondition = {
      companyId,
      // Adiciona os campos que serão usados posteriormente para evitar erros de tipagem
      status: undefined,
      queueId: undefined,
      userId: undefined,
      createdAt: undefined
    };

    // Filtrar por status baseado no viewType
    if (viewType === 'closed') {
      whereCondition.status = 'closed';
    } else {
      whereCondition.status = { [Op.in]: ['pending', 'open'] };
    }

    // Filtrar por fila se especificado
    if (queueId) {
      whereCondition.queueId = queueId;
    }

    // Filtrar por usuários se especificado
    if (users && users.length > 0) {
      whereCondition.userId = { [Op.in]: users };
    }

    // Filtrar por data com tratamento adequado
    if (dateFrom && dateTo) {
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      // Garante que as datas são válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new AppError('Invalid date format. Please use YYYY-MM-DD');
      }
      whereCondition.createdAt = {
        [Op.between]: [startDate.toISOString(), endDate.toISOString()]
      };
    } else if (dateFrom) {
      const startDate = new Date(dateFrom);
      if (isNaN(startDate.getTime())) {
        throw new AppError('Invalid start date format. Please use YYYY-MM-DD');
      }
      whereCondition.createdAt = {
        [Op.gte]: startDate.toISOString()
      };
    } else if (dateTo) {
      const endDate = new Date(dateTo);
      if (isNaN(endDate.getTime())) {
        throw new AppError('Invalid end date format. Please use YYYY-MM-DD');
      }
      whereCondition.createdAt = {
        [Op.lte]: endDate.toISOString()
      };
    }

    // Buscar tickets
    const tickets = await Ticket.findAll({
      where: whereCondition,
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'number', 'profilePicUrl']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: Queue,
          as: 'queue',
          attributes: ['id', 'name', 'color'],
          required: false
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] },
          required: false
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Filtrar por termo de busca se especificado
    let filteredTickets = tickets;
    if (searchParam) {
      const searchTerm = searchParam.toLowerCase();
      filteredTickets = tickets.filter(ticket => 
        ticket.contact?.name?.toLowerCase().includes(searchTerm) ||
        ticket.contact?.number?.includes(searchTerm) ||
        ticket.lastMessage?.toLowerCase().includes(searchTerm) ||
        ticket.value?.toString().includes(searchTerm) ||
        ticket.sku?.toLowerCase().includes(searchTerm)
      );
    }

    // Formatar dados dos tickets
    const formattedTickets: KanbanTicketData[] = filteredTickets.map(ticket => ({
      id: ticket.id,
      uuid: ticket.uuid,
      status: ticket.status,
      name: ticket.name || `Ticket #${ticket.id}`,
      value: ticket.value || 0,
      sku: ticket.sku,
      lastMessage: ticket.lastMessage || '',
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      contact: {
        id: ticket.contact.id,
        name: ticket.contact.name,
        number: ticket.contact.number,
        profilePicUrl: ticket.contact.profilePicUrl
      },
      user: ticket.user ? {
        id: ticket.user.id,
        name: ticket.user.name,
        email: ticket.user.email
      } : undefined,
      queue: ticket.queue ? {
        id: ticket.queue.id,
        name: ticket.queue.name,
        color: ticket.queue.color
      } : undefined,
      tags: ticket.tags ? ticket.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })) : []
    }));

    // Criar lanes baseadas no status dos tickets
    const lanes = [];

    if (viewType === 'active') {
      // Lane para tickets pendentes
      const pendingTickets = formattedTickets.filter(t => t.status === 'pending');
      lanes.push({
        id: 'pending',
        name: 'Aguardando Atendimento',
        color: '#f39c12',
        tickets: pendingTickets
      });

      // Lane para tickets em atendimento
      const openTickets = formattedTickets.filter(t => t.status === 'open');
      lanes.push({
        id: 'open',
        name: 'Em Atendimento',
        color: '#3498db',
        tickets: openTickets
      });

      // Lanes por tags (apenas para tickets ativos)
      const allTags = Array.from(
        new Set(
          formattedTickets
            .filter(t => t.status !== 'closed')
            .flatMap(t => t.tags)
            .map(tag => JSON.stringify(tag))
        )
      ).map(tagStr => JSON.parse(tagStr));

      allTags.forEach(tag => {
        const tagTickets = formattedTickets.filter(t => 
          t.status !== 'closed' && 
          t.tags.some(tt => tt.id === tag.id)
        );
        
        if (tagTickets.length > 0) {
          lanes.push({
            id: `tag-${tag.id}`,
            name: tag.name,
            color: tag.color || '#95a5a6',
            tickets: tagTickets
          });
        }
      });

      // Lane para tickets sem tags (Em aberto)
      const ticketsWithoutTags = formattedTickets.filter(t => 
        t.status !== 'closed' && 
        (!t.tags || t.tags.length === 0)
      );
      
      if (ticketsWithoutTags.length > 0) {
        lanes.unshift({
          id: 'no-tags',
          name: 'Em Aberto',
          color: '#30a0f9',
          tickets: ticketsWithoutTags
        });
      }
    } else {
      // Para tickets fechados, apenas uma lane
      lanes.push({
        id: 'closed',
        name: 'Tickets Fechados',
        color: '#2ecc71',
        tickets: formattedTickets
      });
    }

    return {
      tickets: formattedTickets,
      lanes
    };

  } catch (error) {
    logger.error('Erro ao buscar tickets para Kanban:', error);
    throw new AppError('Erro ao buscar tickets para Kanban');
  }
};

const moveTicketToLane = async (
  ticketId: number,
  targetLaneId: string,
  companyId: number
): Promise<void> => {
  try {
    const ticket = await Ticket.findOne({
      where: { id: ticketId, companyId }
    });

    if (!ticket) {
      throw new AppError('Ticket não encontrado', 404);
    }

    // Mapear lane para status
    let newStatus = ticket.status;
    
    if (targetLaneId === 'pending') {
      newStatus = 'pending';
    } else if (targetLaneId === 'open') {
      newStatus = 'open';
    } else if (targetLaneId === 'closed') {
      newStatus = 'closed';
    } else if (targetLaneId.startsWith('tag-')) {
      // Se foi movido para uma tag, manter status atual mas atualizar tags
      const tagId = parseInt(targetLaneId.replace('tag-', ''));
      
      // Remover todas as tags atuais
      await ticket.$set('tags', []);
      
      // Adicionar nova tag
      const tag = await Tag.findByPk(tagId);
      if (tag) {
        await ticket.$add('tags', [tag]);
      }
      
      return;
    } else if (targetLaneId === 'no-tags') {
      // Se foi movido para "Em aberto", remover todas as tags
      await ticket.$set('tags', []);
      return;
    }

    // Atualizar status se necessário
    if (newStatus !== ticket.status) {
      await ticket.update({ status: newStatus });
    }

  } catch (error) {
    logger.error('Erro ao mover ticket no Kanban:', error);
    throw new AppError('Erro ao mover ticket no Kanban');
  }
};

export default {
  findTicketsForKanban,
  moveTicketToLane
};