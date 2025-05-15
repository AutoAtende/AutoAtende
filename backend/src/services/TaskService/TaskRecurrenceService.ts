import Task from '../../models/Task';
import User from '../../models/User';
import TaskCategory from '../../models/TaskCategory';
import Contact from '../../models/Contact';
import TaskSubject from '../../models/TaskSubject';
import TaskService from './taskService';
import TaskTimeline from '../../models/TaskTimeline';
import { logger } from '../../utils/logger';
import moment from 'moment';
import { Op } from 'sequelize';
import { emitTaskUpdate } from "../../libs/socket";

class TaskRecurrenceService {
  // Array de includes padrão para as consultas
  private static getDefaultIncludes() {
    return [
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
        model: Contact,
        as: 'contact',
        attributes: ['id', 'name', 'number', 'email'],
        required: false
      },
      {
        model: TaskSubject,
        as: 'subject',
        attributes: ['id', 'name'],
        required: false
      }
    ];
  }

  // Função para criar uma nova instância de tarefa recorrente
  public static async createRecurrentTask(parentTaskId: number): Promise<Task | null> {
    try {
      // Buscar a tarefa pai
      const parentTask = await Task.findByPk(parentTaskId, {
        include: [
          { model: Task, as: 'childTasks' }
        ]
      });

      if (!parentTask || !parentTask.isRecurrent) {
        logger.warn('Tentativa de criar tarefa recorrente para tarefa não recorrente', { parentTaskId });
        return null;
      }

      // Verificar se a recorrência já atingiu o limite
      if (parentTask.recurrenceCount && 
          parentTask.childTasks && 
          parentTask.childTasks.length >= parentTask.recurrenceCount) {
        logger.info('Limite de recorrências atingido', { 
          parentTaskId, 
          recurrenceCount: parentTask.recurrenceCount,
          currentCount: parentTask.childTasks.length
        });
        
        // Registrar na timeline que o limite foi atingido
        await TaskTimeline.create({
          taskId: parentTask.id,
          action: 'recurrence_limit_reached',
          userId: parentTask.createdBy,
          details: {
            recurrenceCount: parentTask.recurrenceCount,
            currentCount: parentTask.childTasks.length,
            timestamp: new Date()
          }
        });
        
        return null;
      }

      // Verificar se já passou da data final
      if (parentTask.recurrenceEndDate && 
          moment(parentTask.recurrenceEndDate).isBefore(moment())) {
        logger.info('Data final de recorrência já passou', { 
          parentTaskId, 
          recurrenceEndDate: parentTask.recurrenceEndDate 
        });
        
        // Registrar na timeline que a data final foi atingida
        await TaskTimeline.create({
          taskId: parentTask.id,
          action: 'recurrence_end_date_reached',
          userId: parentTask.createdBy,
          details: {
            recurrenceEndDate: parentTask.recurrenceEndDate,
            timestamp: new Date()
          }
        });
        
        return null;
      }

      // Calcular a próxima data com base no tipo de recorrência
      const nextDate = parentTask.calculateNextOccurrence();
      if (!nextDate) {
        logger.error('Erro ao calcular próxima ocorrência', { parentTaskId });
        return null;
      }

      // Criar uma cópia da tarefa original
      const newTaskData = {
        title: parentTask.title,
        text: parentTask.text,
        // Definir explicitamente a data de vencimento usando o nextDate calculado
        dueDate: nextDate,  // Certifique-se de que nextDate é uma data válida
        taskCategoryId: parentTask.taskCategoryId,
        companyId: parentTask.companyId,
        createdBy: parentTask.createdBy,
        responsibleUserId: parentTask.responsibleUserId,
        done: false,
        inProgress: false,
        employerId: parentTask.employerId,
        subjectId: parentTask.subjectId,
        requesterName: parentTask.requesterName,
        requesterEmail: parentTask.requesterEmail,
        isPrivate: parentTask.isPrivate,
        // Campos de recorrência
        isRecurrent: false, // Tarefa filha não é recorrente
        parentTaskId: parentTask.id // Referência à tarefa pai
      };

      // Criar a nova tarefa
      const newTask = await TaskService.createTask(newTaskData);

      // Atualizar a próxima data de ocorrência na tarefa pai
      await parentTask.update({
        nextOccurrenceDate: nextDate
      });

      // Registrar na timeline da tarefa pai
      await TaskTimeline.create({
        taskId: parentTask.id,
        action: 'recurrence_created',
        userId: parentTask.createdBy,
        details: { 
          childTaskId: newTask.id,
          nextOccurrenceDate: nextDate,
          recurrenceType: parentTask.recurrenceType
        }
      });

      // Emitir evento
      emitTaskUpdate(parentTask.companyId, {
        type: 'task-recurrence-created',
        parentTaskId: parentTask.id,
        childTaskId: newTask.id,
        nextOccurrenceDate: nextDate,
        responsibleUserId: parentTask.responsibleUserId
      });

      return newTask;
    } catch (error) {
      logger.error('Erro ao criar tarefa recorrente', {
        error: error.message,
        parentTaskId
      });
      return null;
    }
  }

// Na função generateDueTasks do arquivo TaskRecurrenceService.ts, adicionar o filtro deleted: false
public static async generateDueTasks(): Promise<number> {
  try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar tarefas recorrentes que devem gerar novas instâncias hoje
      const dueTasks = await Task.findAll({
          where: {
              isRecurrent: true,
              deleted: false, // Adicionar filtro para ignorar tarefas excluídas
              [Op.and]: [ // Usar Op.and para combinar as condições
                  {
                      [Op.or]: [
                          // Não tem nextOccurrenceDate definida ainda
                          { nextOccurrenceDate: null },
                          // Ou a próxima ocorrência é hoje ou antes
                          {
                              nextOccurrenceDate: {
                                  [Op.lt]: tomorrow
                              }
                          }
                      ]
                  },
                  {
                      [Op.or]: [
                          // E não tem data final ou a data final é no futuro
                          { recurrenceEndDate: null },
                          { recurrenceEndDate: { [Op.gt]: today } }
                      ]
                  }
              ]
          }
      });

      logger.info(`Gerando tarefas recorrentes: ${dueTasks.length} tarefas encontradas`);

      // Contador de tarefas criadas
      let createdCount = 0;

      // Registrar na timeline o início da geração em massa
      await TaskTimeline.create({
          action: 'recurrence_batch_generation_started',
          details: {
              tasksCount: dueTasks.length,
              startedAt: new Date()
          }
      });

      // Gerar novas instâncias
      for (const task of dueTasks) {
        logger.info(`Gerando tarefa recorrente para tarefa pai ${task.id}`, {
          recurrenceType: task.recurrenceType,
          dueDate: task.dueDate,
          nextOccurrenceDate: task.nextOccurrenceDate
        });
        
        const nextDate = task.calculateNextOccurrence();
        logger.info(`Próxima data calculada: ${nextDate}`);
        
        const newTask = await this.createRecurrentTask(task.id);
        
        if (newTask) {
          logger.info(`Tarefa recorrente criada com ID ${newTask.id} e data de vencimento ${newTask.dueDate}`);
          createdCount++;
        } else {
          logger.warn(`Falha ao criar tarefa recorrente para tarefa pai ${task.id}`);
        }
      }

      // Registrar na timeline o fim da geração em massa
      await TaskTimeline.create({
          action: 'recurrence_batch_generation_completed',
          details: {
              tasksCount: dueTasks.length,
              createdCount,
              completedAt: new Date()
          }
      });

      logger.info(`${createdCount} tarefas recorrentes criadas com sucesso`);
      return createdCount;
  } catch (error) {
      logger.error('Erro ao gerar tarefas recorrentes', {
          error: error.message
      });
      
      // Registrar erro na timeline
      await TaskTimeline.create({
          action: 'recurrence_batch_generation_error',
          details: {
              error: error.message,
              timestamp: new Date()
          }
      });
      
      return 0;
  }
}

  // Função para buscar todas as ocorrências de uma série recorrente
  public static async getRecurrenceSeries(taskId: number, companyId: number): Promise<Task[]> {
    try {
      // Primeiro, verificar se é uma tarefa filha ou pai
      const task = await Task.findOne({
        where: { id: taskId, companyId }
      });

      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      // Se for uma tarefa filha, buscar a pai
      const parentId = task.parentTaskId || task.id;

      // Registrar na timeline
      await TaskTimeline.create({
        taskId: parentId,
        action: 'recurrence_series_accessed',
        userId: task.responsibleUserId || task.createdBy,
        details: {
          accessedAt: new Date(),
          accessedViaTaskId: taskId
        }
      });

      // Buscar todas as tarefas da série (pai e filhas)
      const tasks = await Task.findAll({
        where: {
          [Op.or]: [
            { id: parentId },
            { parentTaskId: parentId }
          ],
          companyId
        },
        order: [['dueDate', 'ASC']],
        include: this.getDefaultIncludes()
      });

      return tasks;
    } catch (error) {
      logger.error('Erro ao buscar série recorrente', {
        error: error.message,
        taskId,
        companyId
      });
      throw error;
    }
  }

  // Função para editar todas as tarefas da série
  public static async updateRecurrenceSeries(
    taskId: number, 
    companyId: number, 
    updateData: any
  ): Promise<number> {
    try {
      // Primeiro, verificar se é uma tarefa filha ou pai
      const task = await Task.findOne({
        where: { id: taskId, companyId }
      });

      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      // Se for uma tarefa filha, buscar a pai
      const parentId = task.parentTaskId || task.id;

      // Remover campos que não devem ser atualizados em massa
      const safeUpdateData = { ...updateData };
      delete safeUpdateData.id;
      delete safeUpdateData.createdAt;
      delete safeUpdateData.updatedAt;
      delete safeUpdateData.dueDate; // Manter as datas de vencimento específicas

      // Registrar na timeline
      await TaskTimeline.create({
        taskId: parentId,
        action: 'recurrence_series_updated',
        userId: updateData.userId || task.responsibleUserId || task.createdBy,
        details: {
          updatedFields: Object.keys(safeUpdateData),
          updatedAt: new Date(),
          updatedViaTaskId: taskId
        }
      });

      // Atualizar todas as tarefas da série
      const result = await Task.update(safeUpdateData, {
        where: {
          [Op.or]: [
            { id: parentId },
            { parentTaskId: parentId }
          ],
          companyId
        }
      });

      // Emitir evento
      emitTaskUpdate(companyId, {
        type: 'task-recurrence-series-updated',
        taskId: parentId,
        updatedFields: Object.keys(safeUpdateData),
        updatedBy: updateData.userId || task.responsibleUserId || task.createdBy,
        responsibleUserId: task.responsibleUserId
      });

      return result[0]; // Número de registros atualizados
    } catch (error) {
      logger.error('Erro ao atualizar série recorrente', {
        error: error.message,
        taskId,
        companyId
      });
      throw error;
    }
  }

  // Função para deletar todas as tarefas da série
  public static async deleteRecurrenceSeries(
    taskId: number, 
    companyId: number,
    userId: number
  ): Promise<number> {
    try {
      // Primeiro, verificar se é uma tarefa filha ou pai
      const task = await Task.findOne({
        where: {
          id: taskId,
          companyId
        }
      });
  
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }
  
      // Se for uma tarefa filha, buscar a pai
      const parentId = task.parentTaskId || task.id;
      
      // Buscar todas as tarefas que serão marcadas como deletadas
      const tasksToDelete = await Task.findAll({
        where: {
          [Op.or]: [
            { id: parentId },
            { parentTaskId: parentId }
          ],
          companyId
        },
        attributes: ['id']
      });
      
      const taskIds = tasksToDelete.map(t => t.id);
  
      // Registrar na timeline global
      await TaskTimeline.create({
        action: 'recurrence_series_deleted',
        userId: userId,
        details: {
          parentTaskId: parentId,
          deletedTaskIds: taskIds,
          deletedAt: new Date(),
          deletedBy: userId,
          deletedViaTaskId: taskId
        }
      });
  
      // Marcar todas as tarefas como deletadas (exclusão lógica)
      const count = await Task.update(
        { 
          deleted: true,
          deletedAt: new Date(),
          deletedBy: userId
        },
        {
          where: {
            [Op.or]: [
              { id: parentId },
              { parentTaskId: parentId }
            ],
            companyId
          }
        }
      );
  
      // Emitir evento
      emitTaskUpdate(companyId, {
        type: 'task-recurrence-series-deleted',
        taskId: parentId,
        deletedCount: count[0],
        deletedBy: userId
      });
  
      return count[0];
    } catch (error) {
      logger.error('Erro ao excluir série recorrente:', {
        error: error.message,
        stack: error.stack,
        taskId,
        companyId
      });
      throw error;
    }
  }
}

export default TaskRecurrenceService;