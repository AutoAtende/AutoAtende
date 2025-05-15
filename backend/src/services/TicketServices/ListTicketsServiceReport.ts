import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Contact from "../../models/Contact";
import TicketTraking from "../../models/TicketTraking";
import Reason from "../../models/Reason";

export interface DashboardData {
  tickets: any[];
  totalTickets: any;
}

export interface Params {
  searchParam?: string;
  contactId?: number;
  whatsappId?: number[];
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  queueIds?: number[];
  tags?: number[];
  users?: number[];
  userId?: string;
  reasonId?: string;
  ticketId?: string;
}

export default async function ListTicketsServiceReport(
  companyId: string | number,
  params: Params,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardData> {
  const offset = (page - 1) * pageSize;

  // Safely parse numeric values
  const parsedCompanyId = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
  const parsedContactId = params.contactId ? parseInt(String(params.contactId), 10) : undefined;
  const parsedWhatsappIds = Array.isArray(params.whatsappId) 
    ? params.whatsappId.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id))
    : [];
  const parsedQueueIds = Array.isArray(params.queueIds)
    ? params.queueIds.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id))
    : [];
  const parsedUserIds = Array.isArray(params.users)
    ? params.users.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id))
    : [];

  // Build where conditions
  const whereConditions: any = {
    companyId: parsedCompanyId,
  };

  if (params.dateFrom) {
    whereConditions.createdAt = {
      ...whereConditions.createdAt,
      [Op.gte]: new Date(`${params.dateFrom} 00:00:00`)
    };
  }

  if (params.dateTo) {
    whereConditions.createdAt = {
      ...whereConditions.createdAt,
      [Op.lte]: new Date(`${params.dateTo} 23:59:59`)
    };
  }

  if (parsedWhatsappIds.length > 0) {
    whereConditions.whatsappId = { [Op.in]: parsedWhatsappIds };
  }

  if (parsedUserIds.length > 0) {
    whereConditions.userId = { [Op.in]: parsedUserIds };
  }

  if (parsedQueueIds.length > 0) {
    whereConditions['$ticket.queueId$'] = { [Op.in]: parsedQueueIds };
  }

  if (parsedContactId) {
    whereConditions['$ticket.contactId$'] = parsedContactId;
  }

  if (params.ticketId) {
    whereConditions['$ticket.id$'] = parseInt(params.ticketId, 10);
  }

  if (params.status && params.status.length > 0) {
    whereConditions['$ticket.status$'] = { [Op.in]: params.status };
  }

  if (params.reasonId) {
    whereConditions.reasonId = parseInt(params.reasonId, 10);
  }

  try {
    const tickets = await TicketTraking.findAll({
      where: whereConditions,
      include: [
        {
          model: Ticket,
          as: 'ticket',
          required: true,
          attributes: [
            'id',
            'status',
            'lastMessage',
            'uuid',
            'queueId',
            'userId',
            'contactId'
          ],
          include: [
            { 
              model: Contact,
              as: 'contact',
              attributes: ['name']
            },
            {
              model: Queue,
              as: 'queue',
              attributes: ['name'],
              required: false
            }
          ]
        },
        { 
          model: Whatsapp,
          as: 'whatsapp',
          attributes: ['name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
          required: false,
          include: [
            { 
              model: Whatsapp,
              as: 'whatsapp',
              attributes: ['id', 'name', 'status']
            }
          ]
        },
        {
          model: Reason,
          as: 'reason',
          attributes: ['name'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset
    });

    const totalTickets = await TicketTraking.count({
      where: whereConditions,
      include: [
        {
          model: Ticket,
          as: 'ticket',
          required: true,
          where: {
            ...(parsedQueueIds.length > 0 && { queueId: { [Op.in]: parsedQueueIds } }),
            ...(params.status && { status: params.status }),
            ...(parsedContactId && { contactId: parsedContactId })
          }
        }
      ],
      distinct: true
    });

    return { tickets, totalTickets };
  } catch (error) {
    console.error("ListTicketsServiceReport Error:", error);
    throw error;
  }
}