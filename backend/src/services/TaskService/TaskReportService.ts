import { 
  WhereAttributeHash,
  Op,
  Sequelize
} from 'sequelize';
import moment from 'moment';
import Task from '../../models/Task';
import User from '../../models/User';
import TaskNote from '../../models/TaskNote';
import TaskAttachment from '../../models/TaskAttachment';
import { logger } from '../../utils/logger';

// Definir um tipo para o resultado da consulta de tipos de arquivo
interface FileTypeResult {
  mimeType: string;
  count: number;
}

interface WhereOptions extends WhereAttributeHash {
  [key: string]: any;
  [OpSymbol: symbol]: any;
  companyId?: number;
  createdAt?: any;
  dueDate?: any;
  done?: boolean;
}

class TaskReportService {
  static async getTaskStats(filters: {
    startDate?: string | null;
    endDate?: string | null;
    userId?: number | null; 
    status?: string | null;
    companyId: number;
    employerId?: number | null;
  }) {
    const logContext = {
      method: 'getTaskStats',
      filters,
      timestamp: new Date().toISOString()
    };

    try {
      logger.info('Iniciando getTaskStats', logContext);

      const where: WhereOptions = { companyId: filters.companyId };

      // Aplicar filtros de data
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt[Op.gte] = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt[Op.lte] = new Date(filters.endDate);
        }
      }

      // Filtro de usuário
      if (filters.userId) {
        where[Op.or] = [
          { createdBy: filters.userId },
          { responsibleUserId: filters.userId }
        ];
      }

      // Filtro de empresa
      if (filters.employerId) {
        where.employerId = filters.employerId;
      }

      // Filtro de status
      if (filters.status === 'overdue') {
        where.dueDate = { [Op.lt]: new Date() };
        where.done = false;
      } else if (filters.status === 'pending') {
        where.done = false;
      } else if (filters.status === 'completed') {
        where.done = true;
      }

      logger.info('Condições WHERE construídas:', { ...logContext, where });

      // Buscar contagens de status
      logger.info('Iniciando contagens de status', logContext);
      const [totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
        Task.count({ where }),
        Task.count({ where: { ...where, done: true } }),
        Task.count({ where: { ...where, done: false } }),
        Task.count({
          where: {
            ...where,
            done: false,
            dueDate: { [Op.lt]: new Date() }
          }
        })
      ]);

      logger.info('Contagens obtidas:', {
        ...logContext,
        counts: { totalTasks, completedTasks, pendingTasks, overdueTasks }
      });

      // Buscar dados detalhados
      logger.info('Iniciando busca de dados detalhados', logContext);
      const [weeklyProgress, statusDistribution, userPerformance, attachmentStats] = 
        await Promise.all([
          this.getWeeklyProgress(where),
          this.getStatusDistribution(where),
          this.getUserPerformance(where),
          this.getAttachmentStats(where)
        ]);

      const result = {
        summary: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks
        },
        weeklyProgress,
        statusDistribution,
        userPerformance,
        attachmentStats
      };

      logger.info('getTaskStats concluído com sucesso', {
        ...logContext,
        summaryData: result.summary
      });

      return result;

    } catch (error) {
      logger.error('Erro em getTaskStats:', {
        ...logContext,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        errorDetails: error.parent?.detail || error.original?.detail,
        sequelizeError: error.sql || null
      });
      throw error;
    }
  }

  private static async getWeeklyProgress(where: WhereOptions) {
    try {
      const results = await Task.findAll({
        where: { ...where, done: true },
        attributes: [
          [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('count', Sequelize.col('id')), 'count']
        ],
        group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'ASC']],
        raw: true
      });
  
      const weeklyProgress = results.map((r: any) => ({
        date: moment(r.date).format('YYYY-MM-DD'),
        count: parseInt(r.count, 10)
      }));
  
      const formattedResult = {
        labels: weeklyProgress.map(r => moment(r.date).format('DD/MM')),
        data: weeklyProgress.map(r => r.count)
      };

      return formattedResult;
    } catch (error) {
      logger.error('Erro em getWeeklyProgress:', {
        errorMessage: error.message,
        errorStack: error.stack,
        where
      });
      return { labels: [], data: [] };
    }
  }

  private static async getStatusDistribution(where: WhereOptions) {
    try {
      const startOfDay = moment().startOf('day').toDate();
      const endOfDay = moment().endOf('day').toDate();
      
      const [total, pending, inProgress, completed, overdueToday] = await Promise.all([
        Task.count({ where }),
        Task.count({ where: { ...where, done: false } }),
        Task.count({ where: { ...where, done: false, responsibleUserId: { [Op.ne]: null } } }),
        Task.count({ where: { ...where, done: true } }),
        Task.count({
          where: {
            ...where,
            done: false,
            dueDate: {
              [Op.gte]: startOfDay,
              [Op.lte]: endOfDay
            }
          }
        })
      ]);

      return {
        total,
        pending,
        inProgress,
        completed,
        overdueToday
      };
    } catch (error) {
      logger.error('Erro em getStatusDistribution:', {
        errorMessage: error.message,
        errorStack: error.stack,
        where
      });
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdueToday: 0
      };
    }
  }

  private static async getUserPerformance(where: WhereOptions) {
    try {
      // Primeiro buscar os usuários
      const users = await User.findAll({
        where: { companyId: where.companyId },
        attributes: ['id', 'name']
      });
  
      // Corrigindo a interface: em vez de estender User, criar uma interface separada
      interface UserWithTasks {
        id: number;
        name: string;
        responsibleTasks: Task[];
      }
  
      // Depois buscar as tarefas para cada usuário
      const tasksPromises = users.map(async user => {
        const tasks = await Task.findAll({
          where: {
            ...where,
            responsibleUserId: user.id
          },
          attributes: ['id', 'done', 'dueDate']
        });
  
        // Construir o objeto manualmente em vez de estender
        const userResult: UserWithTasks = {
          id: user.id,
          name: user.name,
          responsibleTasks: tasks
        };
        
        return userResult;
      });
  
      const usersWithTasks = await Promise.all(tasksPromises);
  
      const performance = {
        users: usersWithTasks.map(u => u.name),
        assigned: usersWithTasks.map(u => u.responsibleTasks.length),
        completed: usersWithTasks.map(u => 
          u.responsibleTasks.filter(t => t.done).length),
        overdue: usersWithTasks.map(u => 
          u.responsibleTasks.filter(t => 
            !t.done && t.dueDate && moment(t.dueDate).isBefore(moment())
          ).length)
      };
  
      return performance;
    } catch (error) {
      logger.error('Erro em getUserPerformance:', {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          sql: error.sql,
          where: where,
          details: error.parent?.detail || error.original?.detail
        }
      });
      
      return {
        users: [],
        assigned: [],
        completed: [],
        overdue: []
      };
    }
  }
  
  private static async getAttachmentStats(where: WhereOptions) {
    try {
      // Contar tarefas com anexos
      const tasksWithAttachments = await Task.count({
        where,
        include: [{
          model: TaskAttachment,
          required: true
        }],
        distinct: true
      });

      // Contar tarefas com notas
      const tasksWithNotes = await Task.count({
        where,
        include: [{
          model: TaskNote,
          required: true
        }],
        distinct: true
      });

      // Agrupar tipos de arquivo
      const fileTypes = await TaskAttachment.findAll({
        attributes: [
          'mimeType',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        include: [{
          model: Task,
          where,
          attributes: []
        }],
        group: ['mimeType'],
        raw: true
      }) as unknown as FileTypeResult[];

      return {
        withAttachments: tasksWithAttachments,
        withNotes: tasksWithNotes,
        fileTypes: fileTypes.map(type => ({
          type: type.mimeType,
          count: type.count
        }))
      };
    } catch (error) {
      logger.error('Erro em getAttachmentStats:', {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          sql: error.sql,
          where: where,
          details: error.parent?.detail || error.original?.detail
        }
      });

      return {
        withAttachments: 0,
        withNotes: 0,
        fileTypes: []
      };
    }
  }
}

export default TaskReportService;