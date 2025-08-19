import TaskNote from '../../models/TaskNote';
import TaskTimeline from '../../models/TaskTimeline';
import User from '../../models/User';
import Task from '../../models/Task';
import { Transaction } from 'sequelize';
import { logger } from '../../utils/logger';
import { emitTaskUpdate } from '../../libs/optimizedSocket';

class TaskNoteService {
  static async create(data: {
    content: string;
    taskId: number;
    userId: number;
  }, transaction?: Transaction) {
    try {
      if (!data.content?.trim()) {
        throw new Error('Conteúdo da nota não pode estar vazio');
      }

      if (!data.taskId) {
        throw new Error('ID da tarefa é obrigatório');
      }

      if (!data.userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const task = await Task.findByPk(data.taskId);
      if (!task) {
        throw new Error(`Tarefa com ID ${data.taskId} não encontrada`);
      }

      const note = await TaskNote.create(data, { transaction });

      await TaskTimeline.create({
        action: 'note_added',
        taskId: data.taskId,
        userId: data.userId,
        details: { noteId: note.id, content: data.content }
      }, { transaction });

      // Emite evento de atualização
      emitTaskUpdate(task.companyId, {
        type: 'task-note-added',
        taskId: data.taskId,
        noteId: note.id,
        responsibleUserId: task.responsibleUserId
      });

      return note;
    } catch (error) {
      logger.error('Erro ao criar nota:', {
        error: error.message,
        stack: error.stack,
        data
      });
      throw error;
    }
  }

  static async update(data: {
    noteId: number;
    content: string;
    userId: number;
  }, transaction?: Transaction) {
    try {
      if (!data.noteId) {
        throw new Error('ID da nota é obrigatório');
      }

      if (!data.content?.trim()) {
        throw new Error('Conteúdo da nota não pode estar vazio');
      }

      if (!data.userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const note = await TaskNote.findByPk(data.noteId);
      if (!note) {
        throw new Error(`Nota com ID ${data.noteId} não encontrada`);
      }

      const task = await Task.findByPk(note.taskId);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      if (note.userId !== data.userId) {
        throw new Error('Usuário não tem permissão para editar esta nota');
      }

      const previousContent = note.content;

      await note.update({
        content: data.content.trim()
      }, { transaction });

      await TaskTimeline.create({
        action: 'note_updated',
        taskId: note.taskId,
        userId: data.userId,
        details: { 
          noteId: note.id, 
          previousContent,
          newContent: data.content.trim(),
          updateDate: new Date()
        }
      }, { transaction });

      emitTaskUpdate(task.companyId, {
        type: 'task-note-updated',
        taskId: note.taskId,
        noteId: note.id,
        responsibleUserId: task.responsibleUserId
      });

      const updatedNote = await TaskNote.findByPk(note.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }]
      });

      return updatedNote;
    } catch (error) {
      logger.error('Erro ao atualizar nota:', {
        error: error.message,
        stack: error.stack,
        data
      });
      throw error;
    }
  }

  static async delete(noteId: number, userId: number): Promise<boolean> {
    // Obter a instância do sequelize do modelo
    const transaction = await TaskNote.sequelize?.transaction();
    
    try {
      if (!noteId) {
        throw new Error('ID da nota é obrigatório');
      }
  
      const note = await TaskNote.findOne({
        where: { id: noteId },
        include: [{
          model: Task,
          as: 'task', // Adicionar o alias correto
          attributes: ['id', 'companyId']
        }],
        transaction
      });
  
      if (!note) {
        await transaction?.rollback();
        return false;
      }
  
      // Verifica se o usuário é o autor da nota
      if (note.userId !== userId) {
        await transaction?.rollback();
        throw new Error('Usuário não tem permissão para deletar esta nota');
      }
  
      const task = await Task.findByPk(note.taskId);
      if (!task) {
        await transaction?.rollback();
        throw new Error('Tarefa não encontrada');
      }
  
      // Registra no timeline antes de deletar
      await TaskTimeline.create({
        taskId: note.taskId,
        action: 'note_deleted',
        userId,
        details: {
          noteId,
          deletedAt: new Date()
        }
      }, { transaction });
  
      // Deleta a nota
      await note.destroy({ transaction });
  
      // Emite evento de atualização
      emitTaskUpdate(task.companyId, {
        type: 'task-note-deleted',
        taskId: note.taskId,
        noteId: note.id,
        deletedBy: userId
      });
  
      await transaction?.commit();
      return true;
    } catch (error) {
      await transaction?.rollback();
      logger.error('Erro ao deletar nota:', {
        error: error.message,
        stack: error.stack,
        noteId,
        userId
      });
      throw error;
    }
  }

  static async findByTaskId(taskId: number) {
    try {
      if (!taskId) {
        throw new Error('ID da tarefa é obrigatório');
      }

      // Verificar se a tarefa existe
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error(`Tarefa com ID ${taskId} não encontrada`);
      }

      const notes = await TaskNote.findAll({
        where: { taskId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC']] // Corrigido aqui
      });

      return notes;
    } catch (error) {
      logger.error('Erro ao buscar notas:', {
        error: error.message,
        stack: error.stack,
        taskId
      });
      throw error;
    }
  }
}

export default TaskNoteService;