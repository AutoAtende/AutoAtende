import {
  Op, Model, WhereAttributeHash,
  Sequelize
} from 'sequelize';
import Task from '../../models/Task';
import TaskCategory from '../../models/TaskCategory';
import TaskNote from '../../models/TaskNote';
import TaskAttachment from '../../models/TaskAttachment';
import TaskUser from '../../models/TaskUser';
import User from '../../models/User';
import TaskTimeline from '../../models/TaskTimeline';
import ContactEmployer from '../../models/ContactEmployer';
import TaskSubject from '../../models/TaskSubject';
import { emitTaskUpdate } from "../../libs/optimizedSocket";
import { logger } from '../../utils/logger';
import TaskNotificationService from './TaskNotificationService';

interface CreateTaskData {
  title: string;
  text: string;
  dueDate: Date | null;
  taskCategoryId: number;
  companyId: number;
  createdBy: number;
  responsibleUserId?: number;
  done: boolean;
  inProgress?: boolean;
  // Novos campos
  employerId?: number | null;
  subjectId?: number | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
  isPrivate?: boolean;
  // Campos de cobrança
  hasCharge?: boolean;
  chargeValue?: number | null;
  isPaid?: boolean;
  paymentDate?: Date | null;
  paymentNotes?: string | null;
  // Campos de recorrência
  isRecurrent?: boolean;
  recurrenceType?: string | null;
  recurrenceEndDate?: Date | null;
  recurrenceCount?: number | null;
  parentTaskId?: number | null;
  // Campo para grupo de usuários
  userIds?: number[];
}

export interface TaskFilterOptions {
  companyId: number;
  offset: number;
  limit: number;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  userId: number | null;
  categoryId?: number | null;
  subjectId?: number | null;
  employerId?: number | null;
  search: string | null;
  hasAttachments: boolean;
  view?: string;
  column?: string;
  showAll?: boolean;
  includePrivate?: boolean;
  currentUserId?: number;
  showDeleted?: boolean;
  chargeStatus?: string | null;
  isRecurrent?: boolean;
}

const defaultInclude: any[] = [
  { 
    model: TaskCategory,
    as: 'taskCategory',
    attributes: ['id', 'name']
  },
  { 
    model: User,
    as: 'creator',
    attributes: ['id', 'name']
  },
  { 
    model: User,
    as: 'responsible',
    attributes: ['id', 'name'],
    required: false,
  },
  {
    model: ContactEmployer,
    as: 'employer',
    attributes: ['id', 'name'],
    required: false
  },
  {
    model: TaskSubject,
    as: 'subject',
    attributes: ['id', 'name'],
    required: false
  },
  {
    model: User,
    as: 'users',
    attributes: ['id', 'name'],
    through: {
      attributes: []
    },
    required: false
  }
];

const TaskService = {
  createTask: async (taskData: CreateTaskData): Promise<Task> => {
    const transaction = await Task.sequelize?.transaction();
    try {
      const taskToCreate = {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        responsibleUserId: taskData.responsibleUserId,
        inProgress: taskData.inProgress || false,
        isPrivate: taskData.isPrivate || false,
        // Garantir que os novos campos também sejam incluídos
        employerId: taskData.employerId || null,
        subjectId: taskData.subjectId || null,
        requesterName: taskData.requesterName || null,
        requesterEmail: taskData.requesterEmail || null,
        // Campos de cobrança
        hasCharge: taskData.hasCharge || false,
        chargeValue: taskData.chargeValue || null,
        isPaid: taskData.isPaid || false,
        paymentDate: taskData.paymentDate || null,
        paymentNotes: taskData.paymentNotes || null,
        // Campos de recorrência
        isRecurrent: taskData.isRecurrent || false,
        recurrenceType: taskData.recurrenceType || null,
        recurrenceEndDate: taskData.recurrenceEndDate || null,
        recurrenceCount: taskData.recurrenceCount || null,
        parentTaskId: taskData.parentTaskId || null
      };
    
      const task = await Task.create(taskToCreate, { transaction });

      // Associar usuários à tarefa, se fornecidos
      if (taskData.userIds && Array.isArray(taskData.userIds) && taskData.userIds.length > 0) {
        const taskUserData = taskData.userIds.map(userId => ({
          taskId: task.id,
          userId: Number(userId)
        }));
        
        await TaskUser.bulkCreate(taskUserData, { transaction });
        
        // Registrar na timeline
        await TaskTimeline.create({
          taskId: task.id,
          action: 'users_associated',
          userId: taskData.createdBy,
          details: {
            userIds: taskData.userIds,
            associatedAt: new Date()
          }
        }, { transaction });
      }
  
      // Registro básico na timeline
      await TaskTimeline.create({
        taskId: task.id,
        action: 'task_created',
        userId: taskData.createdBy,
        details: { 
          title: task.title,
          responsibleUserId: taskData.responsibleUserId,
          inProgress: task.inProgress,
          employerId: task.employerId,
          subjectId: task.subjectId,
          isPrivate: task.isPrivate,
          requesterName: task.requesterName,
          requesterEmail: task.requesterEmail
        }
      }, { transaction });
      
      // Registros adicionais na timeline, específicos para cada tipo de campo especial
      
      // Se a tarefa tem empresa cliente associada
      if (task.employerId) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'employer_associated',
          userId: taskData.createdBy,
          details: {
            employerId: task.employerId,
            associatedAt: new Date()
          }
        }, { transaction });
      }
      
      // Se a tarefa tem assunto associado
      if (task.subjectId) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'subject_associated',
          userId: taskData.createdBy,
          details: {
            subjectId: task.subjectId,
            associatedAt: new Date()
          }
        }, { transaction });
      }
      
      // Se a tarefa tem cobrança
      if (task.hasCharge) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'charge_created',
          userId: taskData.createdBy,
          details: {
            chargeValue: task.chargeValue,
            isPaid: task.isPaid,
            createdAt: new Date()
          }
        }, { transaction });
      }
      
      // Se a tarefa é recorrente
      if (task.isRecurrent) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'recurrence_configured',
          userId: taskData.createdBy,
          details: {
            recurrenceType: task.recurrenceType,
            recurrenceEndDate: task.recurrenceEndDate,
            recurrenceCount: task.recurrenceCount,
            configuredAt: new Date()
          }
        }, { transaction });
      }
      
      // Se a tarefa é filha de outra (parte de uma série recorrente)
      if (task.parentTaskId) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'recurrence_child_created',
          userId: taskData.createdBy,
          details: {
            parentTaskId: task.parentTaskId,
            createdAt: new Date()
          }
        }, { transaction });
      }
  
      await transaction?.commit();
  
      emitTaskUpdate(taskData.companyId, {
        type: 'task-created',
        taskId: task.id,
        responsibleUserId: task.responsibleUserId,
        createdBy: taskData.createdBy,
        userIds: taskData.userIds
      });
  
      return task;
    } catch (error) {
      await transaction?.rollback();
      logger.error('Error creating task:', {
        message: error.message,
        stack: error.stack,
        taskData: taskData,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Erro ao criar a tarefa: ${error.message}`);
    }
  },

  updateTask: async (
    taskId: string,
    title: string,
    text: string,
    dueDate: Date | null,
    taskCategoryId: number,
    companyId: number,
    responsibleUserId: number,
    done: boolean,
    inProgress: boolean = false,
    employerId?: number,
    subjectId?: number,
    requesterName?: string,
    requesterEmail?: string,
    isPrivate?: boolean,
    userIds?: number[]
  ): Promise<Task> => {
    const transaction = await Task.sequelize?.transaction();
    try {
      const where = { 
        id: taskId,
        companyId: companyId
      };

      const task = await Task.findOne({
        where,
        transaction
      });

      if (!task) {
        await transaction?.rollback();
        throw new Error('Tarefa não encontrada');
      }

      // Armazenar valores antigos para o registro da timeline
      const oldTask = {
        title: task.title,
        text: task.text,
        dueDate: task.dueDate,
        taskCategoryId: task.taskCategoryId,
        responsibleUserId: task.responsibleUserId,
        done: task.done,
        inProgress: task.inProgress,
        employerId: task.employerId,
        subjectId: task.subjectId,
        requesterName: task.requesterName,
        requesterEmail: task.requesterEmail,
        isPrivate: task.isPrivate
      };

      // Se a tarefa estiver marcada como concluída, inProgress deve ser false
      if (done) {
        inProgress = false;
      }

      const updatedTask = await task.update({
        title: title.trim(),
        text: text.trim(),
        dueDate: dueDate,
        taskCategoryId: taskCategoryId,
        responsibleUserId: responsibleUserId,
        done,
        inProgress,
        employerId: employerId || null,
        subjectId: subjectId || null,
        requesterName: requesterName?.trim() || null,
        requesterEmail: requesterEmail?.trim() || null,
        isPrivate: isPrivate || false
      }, { transaction });

      // Atualizar usuários associados, se fornecidos
      if (userIds && Array.isArray(userIds)) {
        // Remover associações existentes
        await TaskUser.destroy({
          where: { taskId: Number(taskId) },
          transaction
        });
        
        // Criar novas associações
        if (userIds.length > 0) {
          const taskUserData = userIds.map(userId => ({
            taskId: Number(taskId),
            userId: Number(userId)
          }));
          
          await TaskUser.bulkCreate(taskUserData, { transaction });
          
          // Registrar na timeline
          await TaskTimeline.create({
            taskId: task.id,
            action: 'users_updated',
            userId: responsibleUserId,
            details: {
              userIds: userIds,
              updatedAt: new Date()
            }
          }, { transaction });
        }
      }

      // Criar registro na timeline para a atualização geral
      await TaskTimeline.create({
        taskId: task.id,
        action: 'task_updated',
        userId: responsibleUserId, // Assumindo que o responsável é quem atualizou
        details: {
          updatedFields: Object.keys(updatedTask.changed()),
          updatedAt: new Date()
        }
      }, { transaction });

      // Verificar mudanças específicas e adicionar registros específicos na timeline

      // Mudança de status
      if (oldTask.done !== done || oldTask.inProgress !== inProgress) {
        let newStatus = done ? 'completed' : (inProgress ? 'in_progress' : 'to_do');
        let oldStatus = oldTask.done ? 'completed' : (oldTask.inProgress ? 'in_progress' : 'to_do');

        await TaskTimeline.create({
          taskId: task.id,
          action: 'status_changed',
          userId: responsibleUserId,
          details: {
            oldStatus,
            newStatus,
            changedAt: new Date()
          }
        }, { transaction });
      }

      // Mudança de responsável
      if (oldTask.responsibleUserId !== responsibleUserId) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'responsible_changed',
          userId: responsibleUserId,
          details: {
            oldResponsibleId: oldTask.responsibleUserId,
            newResponsibleId: responsibleUserId,
            changedAt: new Date()
          }
        }, { transaction });
      }

      // Mudança de empresa cliente
      if (oldTask.employerId !== employerId) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'employer_changed',
          userId: responsibleUserId,
          details: {
            oldEmployerId: oldTask.employerId,
            newEmployerId: employerId,
            changedAt: new Date()
          }
        }, { transaction });
      }

      // Mudança de assunto
      if (oldTask.subjectId !== subjectId) {
        await TaskTimeline.create({
          taskId: task.id,
          action: 'subject_changed',
          userId: responsibleUserId,
          details: {
            oldSubjectId: oldTask.subjectId,
            newSubjectId: subjectId,
            changedAt: new Date()
          }
        }, { transaction });
      }

      await transaction?.commit();

      // Emitir evento para atualização em tempo real
      emitTaskUpdate(companyId, {
        type: 'task-updated',
        taskId: taskId,
        done: done,
        inProgress: inProgress,
        responsibleUserId: responsibleUserId,
        employerId: employerId,
        subjectId: subjectId,
        userIds: userIds
      });

      return updatedTask;
    } catch (error) {
      await transaction?.rollback();
      logger.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId: string, companyId: number, userId: number): Promise<boolean> => {
    const transaction = await Task.sequelize?.transaction();
    try {
      const where = { 
        id: taskId,
        companyId: companyId
      };

      const task = await Task.findOne({
        where,
        transaction
      });

      if (!task) {
        await transaction?.rollback();
        return false;
      }

      // Em vez de excluir, marcamos como deletada
      await task.update({ 
        deleted: true,
        deletedAt: new Date(),
        deletedBy: userId 
      }, { transaction });

      // Registrar exclusão na timeline
      await TaskTimeline.create({
        action: 'task_deleted',
        taskId: task.id,
        userId: userId,
        details: {
          taskId: task.id,
          title: task.title,
          companyId,
          deletedAt: new Date(),
          deletedBy: userId
        }
      }, { transaction });

      await transaction?.commit();

      emitTaskUpdate(companyId, {
        type: 'task-deleted',
        taskId: taskId,
        deletedBy: userId
      });

      return true;
    } catch (error) {
      await transaction?.rollback();
      logger.error('Error deleting task:', error);
      throw error;
    }
  },

  getDeletedTasks: async (companyId: number, options: any = {}): Promise<{ tasks: Task[], count: number }> => {
    try {
      const findOptions: any = {
        where: { 
          companyId, 
          deleted: true 
        },
        include: [
          ...defaultInclude,
          {
            model: User,
            as: 'deletedByUser',
            attributes: ['id', 'name']
          }
        ],
        order: [['deletedAt', 'DESC']],
        ...options
      };
      
      const { count, rows } = await Task.findAndCountAll(findOptions);
      
      return {
        tasks: rows,
        count
      };
    } catch (error) {
      logger.error('Error getting deleted tasks:', error);
      throw error;
    }
  },

  findWithFilters: async (filters: TaskFilterOptions): Promise<{ tasks: Task[], count: number }> => {
    try {
      const { 
        companyId, 
        offset, 
        limit, 
        startDate, 
        endDate, 
        status, 
        categoryId,
        subjectId,
        employerId,
        userId, 
        search, 
        hasAttachments,
        view,
        column,
        showAll,
        includePrivate,
        currentUserId,
        showDeleted,
        chargeStatus,
        isRecurrent
      } = filters;
      
      // Configurar as opções de paginação
      const findOptions: any = {
        where: { 
          companyId
        },
        include: [
          {
            model: User,
            as: 'responsible',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          },
          {
            model: TaskCategory,
            as: 'taskCategory',
            attributes: ['id', 'name']
          },
          {
            model: TaskNote,
            as: 'notes',
            required: false,
            separate: true
          },
          {
            model: TaskAttachment,
            as: 'attachments',
            required: false,
            separate: true
          },
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: TaskSubject,
            as: 'subject',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            },
            required: false
          }
        ],
        order: [['updatedAt', 'DESC']]
      };

      // Aplicar filtro de tarefas excluídas
      if (showDeleted) {
        findOptions.where.deleted = true;
      } else {
        findOptions.where.deleted = false;
      }
      
      // Aplicar paginação apenas se não estiver exibindo todas as tarefas
      if (!showAll) {
        findOptions.offset = offset;
        findOptions.limit = limit;
      }
      
      // Tratamento para privacidade
      if (!includePrivate && currentUserId) {
        findOptions.where = {
          ...findOptions.where,
          [Op.or]: [
            { isPrivate: false },
            { isPrivate: true, createdBy: currentUserId }
          ]
        };
      }
      
      // Aplicar filtros adicionais
      // Filtro por data
      if (startDate) {
        findOptions.where.createdAt = {
          ...findOptions.where.createdAt,
          [Op.gte]: new Date(startDate)
        };
      }
      
      if (endDate) {
        findOptions.where.createdAt = {
          ...findOptions.where.createdAt,
          [Op.lte]: new Date(endDate)
        };
      }
      
      // Filtro por status
      if (status) {
        if (status === 'true' || status === 'completed') {
          findOptions.where.done = true;
        } else if (status === 'false' || status === 'pending') {
          findOptions.where.done = false;
          // Garante que não estamos mostrando tarefas em progresso na aba de pendentes
          findOptions.where.inProgress = false;
        } else if (status === 'inProgress') {
          findOptions.where.done = false;
          findOptions.where.inProgress = true;
        } else if (status === 'overdue') {
          findOptions.where.done = false;
          findOptions.where.dueDate = {
            [Op.lt]: new Date()
          };
        }
      }
      
      // Filtro por responsável
      if (userId) {
        findOptions.where.responsibleUserId = userId;
      }
      
      // Filtro por categoria
      if (categoryId) {
        findOptions.where.taskCategoryId = Number(categoryId);
      }
      
      // Filtro por assunto
      if (subjectId) {
        findOptions.where.subjectId = Number(subjectId);
      }
      
      // Filtro por empresa cliente
      if (employerId) {
        findOptions.where.employerId = Number(employerId);
      }
      
      // Filtro para tarefas com cobrança
      if (chargeStatus === 'paid') {
        findOptions.where.hasCharge = true;
        findOptions.where.isPaid = true;
      } else if (chargeStatus === 'pending') {
        findOptions.where.hasCharge = true;
        findOptions.where.isPaid = false;
      }
      
      // Filtro para tarefas recorrentes
      if (isRecurrent === true) {
        findOptions.where.isRecurrent = true;
      }
      
      // Filtro por texto
      if (search) {
        findOptions.where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { text: { [Op.iLike]: `%${search}%` } },
          { requesterName: { [Op.iLike]: `%${search}%` } },
          { requesterEmail: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Filtro por anexos
      if (hasAttachments) {
        findOptions.include = findOptions.include.filter(inc => inc.as !== 'attachments');
        findOptions.include.push({
          model: TaskAttachment,
          as: 'attachments',
          required: true
        });
      }
      
      // Ordenação personalizada
      if (view && column) {
        switch (column) {
          case 'title':
            findOptions.order = [['title', view === 'ASC' ? 'ASC' : 'DESC']];
            break;
          case 'dueDate':
            findOptions.order = [['dueDate', view === 'ASC' ? 'ASC' : 'DESC']];
            break;
          case 'status':
            findOptions.order = [['done', view === 'ASC' ? 'ASC' : 'DESC']];
            break;
          case 'category':
            findOptions.order = [
              [{ model: TaskCategory, as: 'taskCategory' }, 'name', view === 'ASC' ? 'ASC' : 'DESC']
            ];
            break;
          case 'responsible':
            findOptions.order = [
              [{ model: User, as: 'responsible' }, 'name', view === 'ASC' ? 'ASC' : 'DESC']
            ];
            break;
          case 'created':
            findOptions.order = [['createdAt', view === 'ASC' ? 'ASC' : 'DESC']];
            break;
          case 'subject':
            findOptions.order = [
              [{ model: TaskSubject, as: 'subject' }, 'name', view === 'ASC' ? 'ASC' : 'DESC']
            ];
            break;
          case 'employer':
            findOptions.order = [
              [{ model: ContactEmployer, as: 'employer' }, 'name', view === 'ASC' ? 'ASC' : 'DESC']
            ];
            break;
          default:
            findOptions.order = [['updatedAt', 'DESC']];
            break;
        }
      }
      
      // Executar a consulta
      const { count, rows } = await Task.findAndCountAll(findOptions);
      
      return {
        tasks: rows,
        count
      };
    } catch (error) {
      logger.error('Error in findWithFilters:', {
        error: error.message,
        stack: error.stack,
        filters
      });
      throw error;
    }
  },

  getUserTasks: async (companyId: number, userId: number, offset: number, limit: number, showAll: boolean = false, filters: Partial<TaskFilterOptions> = {}) => {
    try {
      const whereClause: any = {
        companyId,
        [Op.or]: [
          { createdBy: userId },
          { responsibleUserId: userId }
        ]
      };

      // Aplicar filtro de tarefas excluídas
      if (filters.showDeleted) {
        whereClause.deleted = true;
      } else {
        whereClause.deleted = false;
      }

      // Filtro por status
      if (filters.status) {
        if (filters.status === 'true' || filters.status === 'completed') {
          whereClause.done = true;
        } else if (filters.status === 'false' || filters.status === 'pending') {
          whereClause.done = false;
          whereClause.inProgress = false;
        } else if (filters.status === 'inProgress') {
          whereClause.done = false;
          whereClause.inProgress = true;
        }
      }

      // Filtro para tarefas com cobrança
      if (filters.chargeStatus === 'paid') {
        whereClause.hasCharge = true;
        whereClause.isPaid = true;
      } else if (filters.chargeStatus === 'pending') {
        whereClause.hasCharge = true;
        whereClause.isPaid = false;
      }
      
      // Filtro para tarefas recorrentes
      if (filters.isRecurrent === true) {
        whereClause.isRecurrent = true;
      }
    
      const findOptions: any = {
        where: whereClause,
        include: [
          {
            model: User,
            as: 'responsible',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          },
          {
            model: TaskCategory,
            as: 'taskCategory',
            attributes: ['id', 'name']
          },
          {
            model: TaskNote,
            as: 'notes',
            required: false,
            separate: true
          },
          {
            model: TaskAttachment,
            as: 'attachments',
            required: false,
            separate: true
          },
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: TaskSubject,
            as: 'subject',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            },
            required: false
          }
        ],
        order: [['updatedAt', 'DESC']]
      };
      
      if (!showAll) {
        findOptions.offset = offset;
        findOptions.limit = limit;
      }
      
      const { count, rows } = await Task.findAndCountAll(findOptions);
      
      return {
        tasks: rows,
        count
      };
    } catch (error) {
      console.error('Error in getUserTasks:', error);
      throw error;
    }
  },

  getTaskById: async (taskId: number, companyId: number, userId?: number): Promise<Task | null> => {
    try {
      if (!taskId || isNaN(taskId)) {
        logger.warn('Tentativa de busca de tarefa com ID inválido', { taskId });
        return null;
      }
      
      const where: any = { 
        id: taskId,
        companyId: companyId 
      };

      // Se um userId foi fornecido, verificar privacidade
      if (userId) {
        const user = await User.findByPk(userId);
        
        // Se não for admin/superv, verificar privacidade
        if (user && user.profile !== 'admin' && user.profile !== 'superv') {
          where[Op.or] = [
            { isPrivate: false },
            { isPrivate: true, createdBy: userId }
          ];
        }
      }

      const task = await Task.findOne({
        where,
        include: [
          ...defaultInclude,
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: TaskSubject,
            as: 'subject',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'paymentRegisteredBy',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      });
      
      if (!task) {
        logger.warn(`Tarefa com ID ${taskId} não encontrada para empresa ${companyId}`);
      }
      
      return task;
    } catch (error) {
      logger.error('Error getting task by id:', {
        message: error.message,
        stack: error.stack,
        taskId,
        companyId,
        userId
      });
      throw error;
    }
  },

  getTasksByStatus: async (companyId: number): Promise<any> => {
    try {
      const [
        totalTasks, 
        completedTasks, 
        pendingTasks, 
        inProgressTasks,
        paidTasks,
        unpaidTasks,
        recurrentTasks,
        deletedTasks
      ] = await Promise.all([
        Task.count({ 
          where: { companyId, deleted: false }
        }),
        Task.count({ 
          where: { 
            companyId,
            done: true,
            deleted: false
          } 
        }),
        Task.count({ 
          where: { 
            companyId,
            done: false,
            inProgress: false,
            deleted: false
          } 
        }),
        Task.count({ 
          where: { 
            companyId,
            done: false,
            inProgress: true,
            deleted: false
          } 
        }),
        Task.count({
          where: {
            companyId,
            hasCharge: true,
            isPaid: true,
            deleted: false
          }
        }),
        Task.count({
          where: {
            companyId,
            hasCharge: true,
            isPaid: false,
            deleted: false
          }
        }),
        Task.count({
          where: {
            companyId,
            isRecurrent: true,
            deleted: false
          }
        }),
        Task.count({
          where: {
            companyId,
            deleted: true
          }
        })
      ]);
  
      return {
        all: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        paid: paidTasks,
        unpaid: unpaidTasks,
        recurrent: recurrentTasks,
        deleted: deletedTasks
      };
    } catch (error) {
      logger.error('Error getting tasks by status:', error);
      throw error;
    }
  },

  getTaskCategories: async (companyId: number): Promise<TaskCategory[] | null> => {
    try {
      const where = { companyId };
  
      const categories = await TaskCategory.findAll({
        where,
        order: [['name', 'ASC']]
      });
  
      if (categories.length === 0) {
        logger.info(`Nenhuma categoria encontrada para companyId: ${companyId}`);
        return [];
      }
      
      return categories;
    } catch (error) {
      logger.error('Erro ao buscar categorias:', error);
      throw new Error('Erro interno ao buscar categorias'); 
    }
  },

  createTaskCategory: async (name: string, companyId: number): Promise<TaskCategory> => {
    try {
      if (!name || !companyId) {
        throw new Error('Nome e companyId são obrigatórios.');
      }

      const normalizedName = name.trim().toLowerCase();
      
      const existingCategories = await TaskCategory.findAll({
        where: { companyId }
      });

      const duplicate = existingCategories.find(
        cat => cat.name.trim().toLowerCase() === normalizedName
      );

      if (duplicate) {
        throw new Error('Já existe uma categoria com este nome.');
      }

      const category = await TaskCategory.create({ 
        name: name.trim(),
        companyId: companyId
      });

      return category;
    } catch (error) {
      logger.error('Error creating task category:', error);
      throw error;
    }
  },

  updateTaskCategory: async (categoryId: string, name: string, companyId: number): Promise<TaskCategory> => {
    try {
      if (!categoryId || !name || !companyId) {
        throw new Error('ID, nome e companyId são obrigatórios.');
      }
  
      const where = { 
        id: categoryId,
        companyId: companyId
      };

      const category = await TaskCategory.findOne({
        where
      });
  
      if (!category) {
        throw new Error('Categoria não encontrada.');
      }
  
      const existingCategoryWhere = { 
        name: name.trim(),
        companyId: companyId,
        id: { [Op.ne]: categoryId }
      };

      const existingCategory = await TaskCategory.findOne({
        where: existingCategoryWhere
      });
  
      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome.');
      }
  
      category.name = name.trim();
      await category.save();
      
      return category;
    } catch (error) {
      logger.error('Error updating task category:', error);
      throw error;
    }
  },

  deleteTaskCategory: async (categoryId: string, companyId: number): Promise<boolean> => {
    const transaction = await TaskCategory.sequelize?.transaction();
    try {
      const where = { 
        id: categoryId,
        companyId: companyId
      };

      const category = await TaskCategory.findOne({
        where,
        transaction
      });

      if (!category) {
        await transaction?.rollback();
        return false;
      }

      const tasksCount = await Task.count({
        where: { taskCategoryId: categoryId },
        transaction
      });

      if (tasksCount > 0) {
        throw new Error('Não é possível excluir uma categoria que possui tarefas.');
      }

      await category.destroy({ transaction });
      await transaction?.commit();
      return true;
    } catch (error) {
      await transaction?.rollback();
      logger.error('Error deleting task category:', error);
      throw error;
    }
  },

  getTimeline: async (taskId: number): Promise<TaskTimeline[]> => {
    try {
      const where = { taskId };

      const timeline = await TaskTimeline.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return timeline;
    } catch (error) {
      logger.error('Error getting task timeline:', error);
      throw error;
    }
  },

  getTasksByEmployer: async (employerId: number, companyId: number, userId?: number): Promise<Task[]> => {
    try {
      if (!employerId || !companyId) {
        throw new Error('ID da empresa e ID da empresa do sistema são obrigatórios');
      }
      
      // Verificar se a empresa existe e pertence à empresa do sistema
      const employer = await ContactEmployer.findOne({
        where: {
          id: employerId,
          companyId
        }
      });
      
      if (!employer) {
        throw new Error('Empresa não encontrada');
      }
      
      const whereClause: any = {
        employerId,
        companyId
      };
      
      // Se um userId foi fornecido, verificar privacidade
      if (userId) {
        const user = await User.findByPk(userId);
        
        // Se não for admin/superv, verificar privacidade
        if (user && user.profile !== 'admin' && user.profile !== 'superv') {
          whereClause[Op.or] = [
            { isPrivate: false },
            { isPrivate: true, createdBy: userId }
          ];
        }
      }
      
      const tasks = await Task.findAll({
        where: whereClause,
        include: defaultInclude,
        order: [['createdAt', 'DESC']]
      });
      
      return tasks;
    } catch (error) {
      logger.error('Error getting tasks by employer:', error);
      throw error;
    }
  },
  
  // Método para buscar as estatísticas de tarefas por empresa
  getTaskStatsByEmployer: async (employerId: number, companyId: number): Promise<any> => {
    try {
      if (!employerId || !companyId) {
        throw new Error('ID da empresa e ID da empresa do sistema são obrigatórios');
      }
      
      // Verificar se a empresa existe e pertence à empresa do sistema
      const employer = await ContactEmployer.findOne({
        where: {
          id: employerId,
          companyId
        }
      });
      
      if (!employer) {
        throw new Error('Empresa não encontrada');
      }
      
      const whereClause = {
        employerId,
        companyId
      };
      
      // Buscar estatísticas
      const [totalTasks, completedTasks, pendingTasks, overdueNow] = await Promise.all([
        Task.count({ where: whereClause }),
        Task.count({ where: { ...whereClause, done: true } }),
        Task.count({ where: { ...whereClause, done: false } }),
        Task.count({
          where: {
            ...whereClause,
            done: false,
            dueDate: { [Op.lt]: new Date() }
          }
        })
      ]);
      
      // Buscar assuntos mais frequentes
      const subjectStats = await Task.findAll({
        attributes: [
          'subjectId',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          ...whereClause,
          subjectId: { [Op.ne]: null }
        },
        include: [{
          model: TaskSubject,
          as: 'subject',
          attributes: ['name']
        }],
        group: ['subjectId', 'subject.id', 'subject.name'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
        limit: 5
      });
      
      return {
        employerInfo: {
          id: employer.id,
          name: employer.name
        },
        stats: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueNow
        },
        topSubjects: subjectStats.map(s => ({
          id: s.subjectId,
          name: s.subject?.name || 'Sem assunto',
          count: parseInt((s as any).getDataValue('count'), 10)
        }))
      };
    } catch (error) {
      logger.error('Error getting task stats by employer:', error);
      throw error;
    }
  },
  // Métodos para gerenciamento de usuários associados a tarefas
getTaskUsers: async (taskId: number): Promise<User[]> => {
  try {
    const taskUsers = await TaskUser.findAll({
      where: { taskId },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'profile', 'companyId', 'color'],
      }]
    });
    
    // Extrair os dados dos usuários do resultado
    const users = taskUsers.map(taskUser => taskUser.user);
    
    return users;
  } catch (error) {
    logger.error('Error getting task users:', {
      error: error.message,
      stack: error.stack,
      taskId
    });
    throw error;
  }
},

addTaskUsers: async (taskId: number, userIds: number[], actionUserId: number): Promise<{ added: number, users: User[] }> => {
  const transaction = await TaskUser.sequelize?.transaction();
  try {
    // Primeiro, verificar quais usuários já estão associados para evitar duplicidades
    const existingAssociations = await TaskUser.findAll({
      where: {
        taskId,
        userId: { [Op.in]: userIds }
      },
      transaction
    });
    
    const existingUserIds = existingAssociations.map(assoc => assoc.userId);
    
    // Filtrar apenas os usuários que ainda não estão associados
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));
    
    if (newUserIds.length === 0) {
      await transaction?.commit();
      // Buscar os usuários para retornar
      const users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'name', 'email', 'profile', 'companyId', 'color']
      });
      
      return { added: 0, users };
    }
    
    // Criar os novos registros de associação
    const taskUserData = newUserIds.map(userId => ({
      taskId,
      userId
    }));
    
    await TaskUser.bulkCreate(taskUserData, { transaction });
    
    // Buscar os usuários para referência
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'name', 'email', 'profile', 'companyId', 'color'],
      transaction
    });
    
    // Registrar na timeline
    await TaskTimeline.create({
      taskId,
      action: 'users_added',
      userId: actionUserId,
      details: {
        userIds: newUserIds,
        addedAt: new Date(),
        addedBy: actionUserId
      }
    }, { transaction });
    
    // Obter a tarefa para as notificações
    const task = await Task.findByPk(taskId, { transaction });
    
    await transaction?.commit();
    
    // Emitir evento para atualização em tempo real
    emitTaskUpdate(task.companyId, {
      type: 'task-users-added',
      taskId,
      userIds: newUserIds,
      addedBy: actionUserId
    });
    
    // Notificar os novos usuários - fazer de forma assíncrona para não bloquear a resposta
    for (const userId of newUserIds) {
      const user = users.find(u => u.id === userId);
      if (user) {
        TaskNotificationService.notifyUser(task, user, task.companyId, 'team_member')
          .catch(err => {
            logger.error('Error notifying user about task assignment:', {
              error: err.message,
              taskId,
              userId
            });
          });
      }
    }
    
    return { 
      added: newUserIds.length, 
      users 
    };
  } catch (error) {
    await transaction?.rollback();
    logger.error('Error adding users to task:', {
      error: error.message,
      stack: error.stack,
      taskId,
      userIds,
      actionUserId
    });
    throw error;
  }
},

removeTaskUser: async (taskId: number, userToRemoveId: number, actionUserId: number): Promise<boolean> => {
  const transaction = await TaskUser.sequelize?.transaction();
  try {
    // Verificar se o registro existe
    const taskUser = await TaskUser.findOne({
      where: {
        taskId,
        userId: userToRemoveId
      },
      transaction
    });
    
    if (!taskUser) {
      await transaction?.rollback();
      return false;
    }
    
    // Obter a tarefa para as notificações
    const task = await Task.findByPk(taskId, { transaction });
    
    // Excluir a associação
    await taskUser.destroy({ transaction });
    
    // Registrar na timeline
    await TaskTimeline.create({
      taskId,
      action: 'user_removed',
      userId: actionUserId,
      details: {
        removedUserId: userToRemoveId,
        removedAt: new Date(),
        removedBy: actionUserId
      }
    }, { transaction });
    
    await transaction?.commit();
    
    // Emitir evento para atualização em tempo real
    emitTaskUpdate(task.companyId, {
      type: 'task-user-removed',
      taskId,
      userId: userToRemoveId,
      removedBy: actionUserId
    });
    
    return true;
  } catch (error) {
    await transaction?.rollback();
    logger.error('Error removing user from task:', {
      error: error.message,
      stack: error.stack,
      taskId,
      userToRemoveId,
      actionUserId
    });
    throw error;
  }
}
};

export default TaskService;