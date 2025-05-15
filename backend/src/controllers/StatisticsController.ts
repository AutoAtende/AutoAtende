import { Request, Response } from 'express';
import { getIO } from "../libs/socket";
import DashTicketsAndTimes from "../services/StatisticsService/DashTicketsAndTimes";
import DashTicketsChannels from "../services/StatisticsService/DashTicketsChannels";
import DashTicketsEvolutionByPeriod from "../services/StatisticsService/DashTicketsEvolutionByPeriod";
import DashTicketsPerUsersDetail from "../services/StatisticsService/DashTicketsPerUsersDetail";
import DashTicketsQueue from "../services/StatisticsService/DashTicketsQueue";
import StatisticsPerUser from "../services/StatisticsService/StatisticsPerUsers";
import Contact from "../models/Contact";
import { Op, Sequelize } from "sequelize";
import { logger } from "../utils/logger";
import moment from 'moment';

interface StatisticsRequestBody {
  startDate: string;
  endDate: string;
  userId?: number | number[];
  status?: string[];
  state?: string;
}

interface StatisticsResponse {
  ticketsAndTimes: {
    total_attendances: number;
    open_tickets: number;
    pending_tickets: number;
    average_response_time: number;
    new_contacts: number;
  };
  ticketsChannels: Array<{
    name: string;
    value: number;
    percentage: string;
  }>;
  ticketsEvolution: Array<{
    date: string;
    count: number;
  }>;
  ticketsPerUsers: Array<{
    email: string;
    name: string;
    open_tickets: number;
    pending_tickets: number;
    resolved_tickets: number;
    total_tickets: number;
    average_response_time: number;
  }>;
  contactsCount: number;
  contactsByState: {
    [key: string]: {
      count: number;
    };
  };
}

const dddsByState = {
  AC: ["68"], AL: ["82"], AP: ["96"], AM: ["92", "97"], BA: ["71", "73", "74", "75", "77"],
  CE: ["85", "88"], DF: ["61"], ES: ["27", "28"], GO: ["62", "64"], MA: ["98", "99"],
  MT: ["65", "66"], MS: ["67"], MG: ["31", "32", "33", "34", "35", "37", "38"],
  PA: ["91", "93", "94"], PB: ["83"], PR: ["41", "42", "43", "44", "45", "46"],
  PE: ["81", "87"], PI: ["86", "89"], RJ: ["21", "22", "24"], RN: ["84"], RS: ["51", "53", "54", "55"],
  RO: ["69"], RR: ["95"], SC: ["47", "48", "49"], SP: ["11", "12", "13", "14", "15", "16", "17", "18", "19"],
  SE: ["79"], TO: ["63"]
};

const validateDates = (startDate: string, endDate: string) => {
  const start = moment(startDate);
  const end = moment(endDate);

  if (!start.isValid()) {
    throw new Error('Invalid start date');
  }

  if (!end.isValid()) {
    throw new Error('Invalid end date');
  }

  if (start.isAfter(end)) {
    throw new Error('Start date cannot be after end date');
  }

  return {
    startDate: start.format('YYYY-MM-DD HH:mm:ss'),
    endDate: end.format('YYYY-MM-DD HH:mm:ss')
  };
};

export const getAllStatistics = async (req: Request, res: Response): Promise<Response> => {
  try {
    let { startDate, endDate, userId, status, state } = req.body as StatisticsRequestBody;
    const { companyId } = req.user;

    // Verifique se a variável é definida e numérica
    userId = userId ? Array.isArray(userId) ? userId.map(id => Number(id)) : Number(userId) : null;
    const numericCompanyId = companyId ? Number(companyId) : null;

    if (numericCompanyId === null || isNaN(numericCompanyId)) {
      return res.status(400).json({
        error: 'Invalid company ID',
        details: 'Company ID must be a valid number'
      });
    }

    // Validação das datas
    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({
        error: 'Invalid date format',
        details: 'Please provide valid dates'
      });
    }

    const formattedStartDate = start.format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = end.format('YYYY-MM-DD HH:mm:ss');

    const [
      ticketsAndTimes,
      ticketsChannels,
      ticketsEvolution,
      ticketsPerUsers,
      ticketsQueue
    ] = await Promise.all([
      DashTicketsAndTimes({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        companyId: numericCompanyId || null,
        userId
      }),
      DashTicketsChannels({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        companyId: numericCompanyId || null,
        userId
      }),
      DashTicketsEvolutionByPeriod({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        companyId: numericCompanyId || null,
        userId
      }),
      DashTicketsPerUsersDetail({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        companyId: numericCompanyId || null,
        userId
      }),
      DashTicketsQueue({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        companyId: numericCompanyId || null,
        userId
      })
    ]);

    let contactsCount = 0;
    try {
      if (state && dddsByState[state]) {
        contactsCount = await Contact.count({
          where: {
            companyId: numericCompanyId,
            number: {
              [Op.regexp]: `^55(${dddsByState[state].join('|')})`
            }
          }
        });
      } else {
        contactsCount = await Contact.count({ 
          where: { companyId: numericCompanyId } 
        });
      }
    } catch (error) {
      logger.error('Error counting contacts:', error);
      contactsCount = 0;
    }

    const response = {
      ticketsAndTimes,
      ticketsChannels,
      ticketsEvolution,
      ticketsPerUsers,
      ticketsQueue,
      contactsCount,
      contactsByState: await getContactsByState(numericCompanyId)
    };

    return res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllStatistics:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};

const getContactsByState = async (companyId: number) => {
  try {
    const contactsByState = await Contact.findAll({
      where: { companyId },
      attributes: [
        [
          Sequelize.fn('SUBSTRING', Sequelize.col('number'), 3, 2),
          'ddd'
        ],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('SUBSTRING', Sequelize.col('number'), 3, 2)],
      raw: true
    });

    return Object.entries(dddsByState).reduce((acc, [state, ddds]) => {
      acc[state] = {
        count: contactsByState
          .filter(c => ddds.includes(c['ddd'] as string))
          .reduce((sum, c) => sum + parseInt(c['count'] as string), 0)
      };
      return acc;
    }, {} as { [key: string]: { count: number } });
  } catch (error) {
    logger.error('Error getting contacts by state:', error);
    return {};
  }
};

export const getTicketsPerUsersDetail = async (req: Request, res: Response): Promise<Response> => {
  const { startDate, endDate, userId } = req.body;
  const { companyId } = req.user;
  
  try {
    const data = await DashTicketsPerUsersDetail({
      startDate,
      endDate,
      companyId,
      userId: Array.isArray(userId) ? userId[0] : userId
    });
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching tickets per users detail:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketsQueue = async (req: Request, res: Response): Promise<Response> => {
  const { startDate, endDate, userId } = req.body;
  const { companyId } = req.user;
  
  try {
    const data = await DashTicketsQueue({
      startDate,
      endDate,
      companyId,
      userId: Array.isArray(userId) ? userId[0] : userId
    });
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching tickets queue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContacts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { state } = req.query;

    let whereCondition: any = { companyId };
    
    if (state && dddsByState[state as string]) {
      whereCondition.number = {
        [Op.regexp]: `^55(${dddsByState[state as string].join('|')})`
      };
    }

    const contacts = await Contact.findAll({
      where: whereCondition,
      attributes: ['id', 'name', 'number', 'email']
    });

    return res.status(200).json(contacts);
  } catch (error) {
    logger.error('Error fetching contacts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStatisticsPerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate } = req.query;
    const { companyId } = req.user;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const statistics = await StatisticsPerUser({
      startDate: startDate as string,
      endDate: endDate as string,
      companyId: companyId || null
    });

    return res.status(200).json(statistics);
  } catch (error) {
    logger.error('Error fetching statistics per user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketsQueues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const ticketsQueue = await DashTicketsQueue({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      companyId: companyId || null
    });

    return res.status(200).json(ticketsQueue);
  } catch (error) {
    logger.error('Error fetching tickets queues:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketsAndTimes = async (req: Request, res: Response): Promise<Response> => {
  const { startDate, endDate, userId } = req.body;
  const { companyId } = req.user;
  
  try {
    const data = await DashTicketsAndTimes({
      startDate,
      endDate,
      companyId: companyId || null,
      userId: Array.isArray(userId) ? userId[0] : userId
    });
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching tickets and times:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketsChannels = async (req: Request, res: Response): Promise<Response> => {
  const { startDate, endDate, userId } = req.body;
  const { companyId } = req.user;
  
  try {
    const data = await DashTicketsChannels({
      startDate,
      endDate,
      companyId: companyId || null,
      userId: Array.isArray(userId) ? userId[0] : userId
    });
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching tickets channels:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketsEvolution = async (req: Request, res: Response): Promise<Response> => {
  const { startDate, endDate, userId } = req.body;
  const { companyId } = req.user;
  
  try {
    const data = await DashTicketsEvolutionByPeriod({
      startDate,
      endDate,
      companyId: companyId || null,
      userId: Array.isArray(userId) ? userId[0] : userId
    });
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching tickets evolution:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getAllStatistics,
  getTicketsAndTimes,
  getTicketsChannels,
  getTicketsEvolution, // Renomeando para manter consistência com a rota
  getTicketsPerUsersDetail,
  getTicketsQueue,
  getContacts,
  getStatisticsPerUser,
  getTicketsQueues
};