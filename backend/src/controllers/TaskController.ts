import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';
import User from '../models/User';
import Task from '../models/Task';
import TaskAttachment from '../models/TaskAttachment';
import TaskTimeline from '../models/TaskTimeline';
import TaskUser from '../models/TaskUser';
import TaskService, { TaskFilterOptions } from '../services/TaskService/taskService';
import TaskNoteService from '../services/TaskService/TaskNoteService';
import TaskAttachmentService from '../services/TaskService/TaskAttachmentService';
import TaskRecurrenceService from '../services/TaskService/TaskRecurrenceService';
import TaskExportService from '../services/TaskService/TaskExportService';
import { getIO } from '../libs/optimizedSocket';

const TaskController = {
  createTask: async (req: Request, res: Response) => {
    try {
      const io = getIO();
  
      const { 
        title, 
        text, 
        dueDate, 
        taskCategoryId, 
        responsibleUserId, 
        done, 
        inProgress, 
        userIds,
        // Adicionando os campos que estavam faltando
        employerId,
        subjectId,
        requesterName,
        requesterEmail,
        isPrivate,
        // Campos de cobrança
        hasCharge,
        chargeValue,
        isPaid,
        paymentDate,
        paymentNotes,
        // Campos de recorrência
        isRecurrent,
        recurrenceType,
        recurrenceEndDate,
        recurrenceCount
      } = req.body;
      
      const companyId = req.user.companyId;
      const createdBy = req.user.id;

      // Validações de entrada
      if (!companyId) {
        return res.status(400).json({ error: 'ID da empresa é obrigatório' });
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Título da tarefa é obrigatório' });
      }

      if (!taskCategoryId || !Number.isInteger(Number(taskCategoryId))) {
        return res.status(400).json({ error: 'ID da categoria da tarefa é inválido' });
      }

      if (dueDate && isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({ error: 'Data de vencimento inválida' });
      }

      if (responsibleUserId && !Number.isInteger(Number(responsibleUserId))) {
        return res.status(400).json({ error: 'ID do responsável inválido' });
      }

      // Validar userIds, se fornecidos
      if (userIds && (!Array.isArray(userIds) || userIds.some(id => !Number.isInteger(Number(id))))) {
        return res.status(400).json({ error: 'Lista de IDs de usuários inválida' });
      }

      // Verificar se o responsibleUserId pertence à mesma empresa
      if (responsibleUserId) {
        const user = await User.findOne({ where: { id: responsibleUserId, companyId } });
        if (!user) {
          return res.status(400).json({ error: 'Usuário responsável não encontrado ou não pertence à empresa' });
        }
      }

      // Verificar se os usuários pertencem à mesma empresa, se fornecidos
      if (userIds && userIds.length > 0) {
        const userCount = await User.count({ 
          where: { 
            id: { [Op.in]: userIds }, 
            companyId 
          } 
        });
        
        if (userCount !== userIds.length) {
          return res.status(400).json({ error: 'Um ou mais usuários não foram encontrados ou não pertencem à empresa' });
        }
      }

      const taskData = {
        title,
        text: text || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        taskCategoryId: Number(taskCategoryId),
        companyId: Number(companyId),
        createdBy: Number(createdBy),
        responsibleUserId: responsibleUserId ? Number(responsibleUserId) : null,
        done: Boolean(done),
        inProgress: Boolean(inProgress),
        // Adicionando os campos que estavam faltando
        employerId: employerId ? Number(employerId) : null,
        subjectId: subjectId ? Number(subjectId) : null,
        requesterName: requesterName || null,
        requesterEmail: requesterEmail || null,
        isPrivate: Boolean(isPrivate),
        // Campos de cobrança
        hasCharge: Boolean(hasCharge),
        chargeValue: chargeValue ? parseFloat(chargeValue) : null,
        isPaid: Boolean(isPaid),
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentNotes: paymentNotes || null,
        // Campos de recorrência
        isRecurrent: Boolean(isRecurrent),
        recurrenceType: recurrenceType || null,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        recurrenceCount: recurrenceCount ? Number(recurrenceCount) : null,
        // Lista de usuários associados
        userIds: userIds ? userIds.map(id => Number(id)) : []
      };
  
      const task = await TaskService.createTask(taskData);

      const createdTask = await TaskService.getTaskById(task.id, companyId);

      return res.status(201).json(createdTask);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return res.status(500).json({ error: 'Erro ao criar a tarefa.', details: error.message });
    }
  },

  getAllTasks: async (req: Request, res: Response) => {
    try {
      if (!req.user?.companyId) {
        return res.status(400).json({ 
          error: 'CompanyId não encontrado', 
          tasks: [], 
          count: 0 
        });
      }
  
      // Verifique se o cliente quer todos os registros
      const showAll = req.query.showAll === 'true';
      
      // Se showAll for true, defina pageSize como um valor grande
      const pageNumber = parseInt(req.query.pageNumber as string) || 1;
      const pageSize = showAll ? 9999 : (parseInt(req.query.pageSize as string) || 10);
      
      // Conversão dos valores da query para garantir tipos corretos
      const filters: TaskFilterOptions = {
        companyId: req.user.companyId,
        offset: (pageNumber - 1) * pageSize,
        limit: pageSize,
        // Converte datas para string ou null
        startDate: req.query.startDate ? String(req.query.startDate) : null,
        endDate: req.query.endDate ? String(req.query.endDate) : null,
        // Tratamento do status
        status: req.query.status ? String(req.query.status) : null,
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : null,
        // Converte userId para number ou null
        userId: req.query.userId ? Number(req.query.userId) : null,
        // Converte search para string ou null
        search: req.query.search ? String(req.query.search) : null,
        // Converte hasAttachments para boolean
        hasAttachments: req.query.hasAttachments === 'true',
        // Converte view e column para string
        view: req.query.view as string,
        column: req.query.column as string,
        // Adicionar mostrar excluídas
        showDeleted: req.query.showDeleted === 'true',
        // Adicionar filtros para tarefas com cobrança e recorrentes
        chargeStatus: req.query.chargeStatus as string,
        isRecurrent: req.query.isRecurrent === 'true',
        // Outros filtros necessários
        includePrivate: req.user.profile === 'admin' || req.user.profile === 'superv',
        currentUserId: Number(req.user.id),
        subjectId: req.query.subjectId ? Number(req.query.subjectId) : null,
        employerId: req.query.employerId ? Number(req.query.employerId) : null
      };
  
      logger.info('Buscando tarefas com filtros:', {
        filters,
        showAll,
        user: req.user.id,
        query: req.query
      });
  
      const { tasks, count } = await TaskService.findWithFilters(filters);
      
      return res.status(200).json({
        tasks,
        count
      });
  
    } catch (error) {
      logger.error('Erro ao buscar tarefas:', {
        message: error.message,
        stack: error.stack,
        user: req.user?.id,
        query: req.query
      });
  
      return res.status(500).json({
        error: 'Erro ao buscar tarefas',
        message: error.message,
        tasks: [],
        count: 0
      });
    }
  },

  getTasksByStatus: async (req: Request, res: Response) => {
    try {
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: 'CompanyId não encontrado' });
      }
      
      const taskStats = await TaskService.getTasksByStatus(companyId);
      
      return res.status(200).json(taskStats);
    } catch (error) {
      logger.error('Erro ao buscar contagem de tarefas por status:', {
        message: error.message,
        stack: error.stack,
        user: req.user?.id
      });
      
      return res.status(500).json({
        error: 'Erro ao buscar contagem de tarefas',
        message: error.message
      });
    }
  },

  getOpenTasksCount: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId;
  
      if (!userId || !companyId) {
        return res.status(400).json({ 
          error: 'Dados do usuário não encontrados',
          count: 0 
        });
      }
  
      const where = {
        companyId,
        done: false,
        [Op.or]: [
          { createdBy: userId },
          { responsibleUserId: userId }
        ]
      };
  
      try {
        const count = await Task.count({ where });
        return res.status(200).json({ count });
      } catch (error) {
        logger.error('Error counting tasks:', {
          error: error.message,
          stack: error.stack,
          userId,
          companyId
        });
        return res.status(500).json({ count: 0 });
      }
    } catch (error) {
      logger.error('Error in getOpenTasksCount:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        companyId: req.user?.companyId
      });
      return res.status(500).json({ count: 0 });
    }
  },

  getTasksStatusCount: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId;
      const now = new Date();
  
      // Busca tarefas vencidas onde o usuário é responsável
      const overdueCount = await Task.count({
        where: {
          companyId,
          done: false,
          dueDate: {
            [Op.lt]: now
          },
          responsibleUserId: userId
        }
      });
  
      // Busca total de tarefas em aberto onde o usuário é responsável
      const openCount = await Task.count({
        where: {
          companyId,
          done: false,
          responsibleUserId: userId
        }
      });
  
      return res.status(200).json({ 
        overdueCount,
        openCount
      });
    } catch (error) {
      logger.error('Error getting tasks status count:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });
      return res.status(500).json({ 
        overdueCount: 0,
        openCount: 0 
      });
    }
  },

  getUserTasks: async (req: Request, res: Response) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      
      // Verifique se o cliente quer todos os registros
      const showAll = req.query.showAll === 'true';
      
      // Obtenha os parâmetros de paginação
      const pageNumber = parseInt(req.query.pageNumber as string) || 1;
      const pageSize = showAll ? 9999 : (parseInt(req.query.pageSize as string) || 10);
    
      // Extrair filtros da query para criar um objeto parcial de TaskFilterOptions
      const filters: Partial<TaskFilterOptions> = {
        chargeStatus: req.query.chargeStatus as string,
        isRecurrent: req.query.isRecurrent === 'true',
        showDeleted: req.query.showDeleted === 'true',
        status: req.query.status as string,
        startDate: req.query.startDate as string || null,
        endDate: req.query.endDate as string || null,
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : null,
        subjectId: req.query.subjectId ? Number(req.query.subjectId) : null,
        employerId: req.query.employerId ? Number(req.query.employerId) : null,
        search: req.query.search as string || null,
        hasAttachments: req.query.hasAttachments === 'true'
      };
    
      const { tasks, count } = await TaskService.getUserTasks(
        Number(companyId),
        Number(userId),
        (Number(pageNumber) - 1) * Number(pageSize),
        Number(pageSize),
        showAll,
        filters // Passando os filtros para o método
      );
    
      return res.status(200).json({
        tasks,
        count
      });
    } catch (error) {
      console.error('[Tarefas] Erro ao buscar tarefas do usuário:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar tarefas do usuário.',
        details: error.message 
      });
    }
  },

  getTaskById: async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const companyId = req.user.companyId;
      const task = await TaskService.getTaskById(Number(taskId), Number(companyId));
      
      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }
      
      return res.status(200).json(task);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar a tarefa.' });
    }
  },

  updateTask: async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const { title, text, dueDate, taskCategoryId, responsibleUserId, done, inProgress, userIds, employerId, subjectId, requesterName, requesterEmail, isPrivate } = req.body;
      const companyId = req.user.companyId;
      const userId = Number(req.user.id);
      const userProfile = req.user.profile;
    
      const task = await TaskService.getTaskById(Number(taskId), Number(companyId));
      
      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }
  
      if (userProfile === 'user' && 
          task.createdBy !== userId && 
          task.responsibleUserId !== userId) {
            return res.status(403).json({ error: 'Sem permissão para atualizar esta tarefa.' });
          }
      
      // Validar userIds, se fornecidos
      if (userIds && (!Array.isArray(userIds) || userIds.some(id => !Number.isInteger(Number(id))))) {
        return res.status(400).json({ error: 'Lista de IDs de usuários inválida' });
      }
  
      // Verificar se os usuários pertencem à mesma empresa, se fornecidos
      if (userIds && userIds.length > 0) {
        const userCount = await User.count({ 
          where: { 
            id: { [Op.in]: userIds }, 
            companyId 
          } 
        });
        
        if (userCount !== userIds.length) {
          return res.status(400).json({ error: 'Um ou mais usuários não foram encontrados ou não pertencem à empresa' });
        }
      }
      
      const oldDone = task.done;
      const oldInProgress = task.inProgress || false;
  
      const updatedTask = await TaskService.updateTask(
        taskId,
        title || task.title,  // Usar valores existentes se não fornecidos
        text || task.text,
        dueDate ? new Date(dueDate) : task.dueDate,
        Number(taskCategoryId || task.taskCategoryId),
        Number(companyId),
        Number(responsibleUserId || task.responsibleUserId),
        done !== undefined ? Boolean(done) : task.done,  // Importante: verificar se done está definido
        inProgress !== undefined ? Boolean(inProgress) : task.inProgress,
        employerId !== undefined ? employerId : task.employerId,
        subjectId !== undefined ? subjectId : task.subjectId,
        requesterName !== undefined ? requesterName : task.requesterName,
        requesterEmail !== undefined ? requesterEmail : task.requesterEmail,
        isPrivate !== undefined ? isPrivate : task.isPrivate,
        userIds ? userIds.map(id => Number(id)) : undefined
      );
  
      // Registrar mudança de status no timeline se houver alteração
      if (oldDone !== Boolean(done) || oldInProgress !== Boolean(inProgress)) {
        let newStatus = '';
        let oldStatus = '';
  
        if (oldDone) {
          oldStatus = 'completed';
        } else if (oldInProgress) {
          oldStatus = 'in_progress';
        } else {
          oldStatus = 'to_do';
        }
  
        if (Boolean(done)) {
          newStatus = 'completed';
        } else if (Boolean(inProgress)) {
          newStatus = 'in_progress';
        } else {
          newStatus = 'to_do';
        }
  
        await TaskTimeline.create({
          taskId: Number(taskId),
          action: 'status_change',
          userId,
          details: { 
            oldStatus,
            newStatus,
            changedBy: userId
          }
        });
  
        // Emitir evento para notificar outros clientes
        const io = getIO();
        io.to(companyId.toString()).emit('task-update', {
          type: 'task-status-updated',
          taskId,
          done: Boolean(done),
          inProgress: Boolean(inProgress),
          updatedBy: userId,
          responsibleUserId: task.responsibleUserId
        });
      }
  
      // Buscar a tarefa atualizada com todas as relações
      const fullUpdatedTask = await TaskService.getTaskById(Number(taskId), Number(companyId));
  
      return res.status(200).json(fullUpdatedTask);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return res.status(500).json({ error: 'Erro ao atualizar a tarefa.', details: error.message });
    }
  },

  deleteTask: async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const userProfile = req.user.profile;

      if (userProfile !== 'admin' && userProfile !== 'superv') {
        return res.status(403).json({ error: 'Apenas administradores podem excluir tarefas.' });
      }

      const result = await TaskService.deleteTask(taskId, Number(companyId), Number(userId));
      if (!result) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }

      return res.status(200).json({ success: true, message: 'Tarefa excluída com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir a tarefa.' });
    }
  },

  getTaskCategories: async (req: Request, res: Response) => {
    try {
      const companyId = req.user.companyId;
      const categories = await TaskService.getTaskCategories(companyId);
  
      if (!categories || categories.length === 0) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }
  
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      logger.error('Erro no controlador de categorias:', error);
      return res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  createTaskCategory: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const companyId = req.user.companyId;
  
      // Validação de entrada
      if (!name) {
        return res.status(400).json({ 
          success: false,
          error: 'Nome da categoria é obrigatório.' 
        });
      }
  
      if (!companyId) {
        return res.status(400).json({ 
          success: false,
          error: 'ID da empresa não encontrado.' 
        });
      }
  
      try {
        const category = await TaskService.createTaskCategory(name, companyId);
        
        return res.status(201).json({
          success: true,
          data: category
        });
      } catch (error) {
        // Erro específico de categoria duplicada
        if (error.message === 'Já existe uma categoria com este nome.') {
          return res.status(400).json({ 
            success: false,
            error: error.message 
          });
        }
        
        // Outros erros
        console.error('Erro ao criar categoria:', error);
        return res.status(500).json({ 
          success: false,
          error: 'Erro ao criar categoria.' 
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao criar categoria:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor.' 
      });
    }
  },
  
  updateTaskCategory: async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.categoryId;
      const { name } = req.body;
      const companyId = req.user.companyId;
  
      if (!categoryId || !name || !companyId) {
        return res.status(400).json({ error: 'ID, nome e companyId são obrigatórios.' });
      }
  
      const category = await TaskService.updateTaskCategory(categoryId, name.trim(), companyId);
      return res.status(200).json(category);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      if (error.message === 'Categoria não encontrada.') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Já existe uma categoria com este nome.') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
    }
  },
  
  deleteTaskCategory: async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.categoryId;
      const companyId = req.user.companyId;
      const result = await TaskService.deleteTaskCategory(categoryId, companyId);
      
      if (!result) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir categoria.' });
    }
  },

  addNote: async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const { taskId } = req.params;
      const userId = Number(req.user.id);

      if (!content?.trim()) {
        return res.status(400).json({ 
          error: 'Conteúdo da nota é obrigatório',
          details: 'O campo de conteúdo não pode estar vazio'
        });
      }

      const note = await TaskNoteService.create({
        content,
        taskId: Number(taskId),
        userId
      });

      return res.status(201).json(note);
    } catch (error) {
      logger.error('Erro ao adicionar nota:', {
        error: error.message,
        stack: error.stack,
        taskId: req.params.taskId,
        userId: req.user.id
      });

      if (error.message.includes('Tarefa não encontrada')) {
        return res.status(404).json({ 
          error: 'Tarefa não encontrada',
          details: error.message
        });
      }

      return res.status(500).json({ 
        error: 'Erro ao adicionar anotação',
        details: error.message
      });
    }
  },

  getNotes: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const notes = await TaskNoteService.findByTaskId(Number(taskId));
      return res.status(200).json(notes);
    } catch (error) {
      logger.error('Erro ao buscar notas:', {
        error: error.message,
        stack: error.stack,
        taskId: req.params.taskId
      });

      if (error.message.includes('Tarefa não encontrada')) {
        return res.status(404).json({ 
          error: 'Tarefa não encontrada',
          details: error.message
        });
      }

      return res.status(500).json({ 
        error: 'Erro ao buscar anotações',
        details: error.message
      });
    }
  },

  updateNote: async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const { taskId, noteId } = req.params;
      const userId = Number(req.user.id);

      if (!content?.trim()) {
        return res.status(400).json({ 
          error: 'Conteúdo da nota é obrigatório',
          details: 'O campo de conteúdo não pode estar vazio'
        });
      }

      if (!noteId) {
        return res.status(400).json({ 
          error: 'ID da nota é obrigatório',
          details: 'O identificador da nota não foi fornecido'
        });
      }

      const updatedNote = await TaskNoteService.update({
        noteId: Number(noteId),
        content: content.trim(),
        userId
      });

      return res.status(200).json(updatedNote);
    } catch (error) {
      logger.error('Erro ao atualizar nota:', {
        error: error.message,
        stack: error.stack,
        taskId: req.params.taskId,
        noteId: req.params.noteId,
        userId: req.user.id
      });

      if (error.message.includes('Nota não encontrada')) {
        return res.status(404).json({ 
          error: 'Nota não encontrada',
          details: error.message
        });
      }

      if (error.message.includes('não tem permissão')) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          details: error.message
        });
      }

      return res.status(500).json({ 
        error: 'Erro ao atualizar nota',
        details: error.message
      });
    }
  },

  deleteNote: async (req: Request, res: Response) => {
    try {
      const { taskId, noteId } = req.params;
      const userId = Number(req.user.id);
  
      if (!noteId) {
        return res.status(400).json({
          error: 'ID da nota é obrigatório',
          details: 'Parâmetro noteId não fornecido'
        });
      }
  
      try {
        const result = await TaskNoteService.delete(Number(noteId), userId);
        
        if (!result) {
          return res.status(404).json({
            error: 'Nota não encontrada',
            details: `Nota com ID ${noteId} não foi encontrada`
          });
        }
  
        return res.status(204).send();
      } catch (error) {
        if (error.message.includes('não tem permissão')) {
          return res.status(403).json({
            error: 'Acesso negado',
            details: error.message
          });
        }
        throw error; // Propaga outros erros para o catch externo
      }
    } catch (error) {
      logger.error('Erro ao deletar nota:', {
        error: error.message,
        stack: error.stack,
        taskId: req.params.taskId,
        noteId: req.params.noteId,
        userId: req.user.id
      });
  
      return res.status(500).json({
        error: 'Erro ao deletar nota',
        details: error.message
      });
    }
  },

  addAttachment: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const uploadedBy = Number(req.user.id);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ 
          error: 'Arquivo não fornecido',
          details: 'É necessário enviar um arquivo'
        });
      }

      const attachment = await TaskAttachmentService.create(file, {
        taskId: Number(taskId),
        uploadedBy
      });

      // Retornar o attachment com as relações necessárias
      const completeAttachment = await TaskAttachment.findByPk(attachment.id, {
        include: [{
          model: User,
          as: 'uploader',
          attributes: ['id', 'name']
        }]
      });

      return res.status(201).json(completeAttachment);
    } catch (error) {
      logger.error('Erro ao adicionar anexo:', {
        error: error.message,
        stack: error.stack,
        taskId: req.params.taskId,
        userId: req.user.id,
        file: req.file?.originalname
      });

      if (error.message.includes('Tarefa não encontrada')) {
        return res.status(404).json({ 
          error: 'Tarefa não encontrada',
          details: error.message
        });
      }

      return res.status(500).json({ 
        error: 'Erro ao adicionar anexo',
        details: error.message
      });
    }
  },

  getAttachments: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const attachments = await TaskAttachmentService.findByTaskId(Number(taskId));
      return res.status(200).json(attachments);
    } catch (error) {
      logger.error('Erro ao buscar anexos:', {
        error: error.message,
        stack: error.stack,
        taskId: req.params.taskId
      });

      if (error.message.includes('Tarefa não encontrada')) {
        return res.status(404).json({ 
          error: 'Tarefa não encontrada',
          details: error.message
        });
      }

      return res.status(500).json({ 
        error: 'Erro ao buscar anexos',
        details: error.message
      });
    }
  },

  deleteAttachment: async (req: Request, res: Response) => {
    try {
      const { taskId, attachmentId } = req.params;
      const userId = Number(req.user.id);

      const result = await TaskAttachmentService.deleteAttachment(
        Number(attachmentId),
        userId
      );

      if (!result) {
        return res.status(404).json({ 
          error: 'Anexo não encontrado',
          details: `Anexo com ID ${attachmentId} não foi encontrado`
        });
      }

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar anexo:', {
        error: error.message,
        stack: error.stack,
        taskId: req.params.taskId,
        attachmentId: req.params.attachmentId,
        userId: req.user.id
      });

      if (error.message.includes('não tem permissão')) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          details: error.message
        });
      }

      return res.status(500).json({ 
        error: 'Erro ao deletar anexo',
        details: error.message
      });
    }
  },

  getTimeline: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const timeline = await TaskService.getTimeline(Number(taskId));
      return res.status(200).json(timeline);
    } catch (error) {
      logger.error('Error getting timeline:', error);
      return res.status(500).json({ error: 'Erro ao buscar timeline.' });
    }
  },

  exportToPDF: async (req: Request, res: Response) => {
    try {
      const { tasks } = req.body;
      await TaskExportService.exportToPDF(tasks, res);
    } catch (error) {
      logger.error('Error in exportToPDF:', error);
      return res.status(500).json({ error: 'Erro ao exportar para PDF.' });
    }
  },
  
  exportToExcel: async (req: Request, res: Response) => {
    try {
      const { tasks } = req.body;
      await TaskExportService.exportToExcel(tasks, res);
    } catch (error) {
      logger.error('Error in exportToExcel:', error);
      return res.status(500).json({ error: 'Erro ao exportar para Excel.' });
    }
  },

  // API para obter todas as tarefas de uma série recorrente
  getRecurrenceSeries: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { companyId } = req.user;

      if (!taskId || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'ID da tarefa e ID da empresa são obrigatórios'
        });
      }

      const tasks = await TaskRecurrenceService.getRecurrenceSeries(
        Number(taskId),
        Number(companyId)
      );

      return res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Erro ao buscar série recorrente:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar série recorrente',
        details: error.message
      });
    }
  },

  // API para atualizar todas as tarefas da série
  updateRecurrenceSeries: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { companyId } = req.user;
      const updateData = req.body;

      if (!taskId || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'ID da tarefa e ID da empresa são obrigatórios'
        });
      }

      const count = await TaskRecurrenceService.updateRecurrenceSeries(
        Number(taskId),
        Number(companyId),
        updateData
      );

      return res.status(200).json({
        success: true,
        message: `${count} tarefas atualizadas com sucesso`
      });
    } catch (error) {
      console.error('Erro ao atualizar série recorrente:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar série recorrente',
        details: error.message
      });
    }
  },

  // API para excluir todas as tarefas da série
  deleteRecurrenceSeries: async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { companyId, id: userId } = req.user;

      if (!taskId || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'ID da tarefa e ID da empresa são obrigatórios'
        });
      }

      const count = await TaskRecurrenceService.deleteRecurrenceSeries(
        Number(taskId),
        Number(companyId),
        Number(userId)
      );

      return res.status(200).json({
        success: true,
        message: `${count} tarefas excluídas com sucesso`
      });
    } catch (error) {
      console.error('Erro ao excluir série recorrente:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao excluir série recorrente',
        details: error.message
      });
    }
  },

  // Métodos para gerenciamento de usuários associados
getTaskUsers: async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const companyId = req.user.companyId;
    
    // Validar entrada
    if (!taskId || isNaN(Number(taskId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID da tarefa inválido' 
      });
    }
    
    // Verificar se a tarefa existe e pertence à empresa
    const task = await TaskService.getTaskById(Number(taskId), Number(companyId));
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tarefa não encontrada' 
      });
    }
    
    // Obter usuários associados à tarefa
    const users = await TaskService.getTaskUsers(Number(taskId));
    
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Erro ao buscar usuários da tarefa:', {
      error: error.message,
      stack: error.stack,
      taskId: req.params.taskId,
      userId: req.user.id
    });
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar usuários associados à tarefa',
      details: error.message
    });
  }
},

addTaskUsers: async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { userIds } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    
    // Validar entrada
    if (!taskId || isNaN(Number(taskId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID da tarefa inválido' 
      });
    }
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Lista de IDs de usuários é obrigatória e não pode estar vazia' 
      });
    }
    
    // Verificar se todos os userIds são números válidos
    if (userIds.some(id => !Number.isInteger(Number(id)))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Lista contém IDs de usuários inválidos' 
      });
    }
    
    // Verificar se a tarefa existe e pertence à empresa
    const task = await TaskService.getTaskById(Number(taskId), Number(companyId));
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tarefa não encontrada' 
      });
    }
    
    // Verificar se os usuários existem e pertencem à empresa
    const userCount = await User.count({
      where: {
        id: { [Op.in]: userIds.map(id => Number(id)) },
        companyId: Number(companyId)
      }
    });
    
    if (userCount !== userIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Um ou mais usuários não foram encontrados ou não pertencem à empresa'
      });
    }
    
    // Adicionar usuários à tarefa
    const result = await TaskService.addTaskUsers(
      Number(taskId),
      userIds.map(id => Number(id)),
      Number(userId)
    );
    
    return res.status(200).json({
      success: true,
      message: `${result.added} usuários adicionados com sucesso`,
      data: result.users
    });
  } catch (error) {
    logger.error('Erro ao adicionar usuários à tarefa:', {
      error: error.message,
      stack: error.stack,
      taskId: req.params.taskId,
      userId: req.user.id,
      userIds: req.body.userIds
    });
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao adicionar usuários à tarefa',
      details: error.message
    });
  }
},

removeTaskUser: async (req: Request, res: Response) => {
  try {
    const { taskId, userId: userToRemoveId } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    
    // Validar entrada
    if (!taskId || isNaN(Number(taskId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID da tarefa inválido' 
      });
    }
    
    if (!userToRemoveId || isNaN(Number(userToRemoveId))) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID do usuário inválido' 
      });
    }
    
    // Verificar se a tarefa existe e pertence à empresa
    const task = await TaskService.getTaskById(Number(taskId), Number(companyId));
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tarefa não encontrada' 
      });
    }
    
    // Verificar se o usuário a ser removido está associado à tarefa
    const taskUser = await TaskUser.findOne({
      where: {
        taskId: Number(taskId),
        userId: Number(userToRemoveId)
      }
    });
    
    if (!taskUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não está associado a esta tarefa'
      });
    }
    
    // Remover usuário da tarefa
    const removed = await TaskService.removeTaskUser(
      Number(taskId),
      Number(userToRemoveId),
      Number(userId)
    );
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Não foi possível remover o usuário da tarefa'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Usuário removido da tarefa com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao remover usuário da tarefa:', {
      error: error.message,
      stack: error.stack,
      taskId: req.params.taskId,
      userId: req.user.id,
      userToRemoveId: req.params.userId
    });
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao remover usuário da tarefa',
      details: error.message
    });
  }
}

};

export default TaskController;