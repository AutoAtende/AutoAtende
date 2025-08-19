import TaskAttachment from '../../models/TaskAttachment';
import TaskTimeline from '../../models/TaskTimeline';
import Task from '../../models/Task';
import User from '../../models/User';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { logger } from '../../utils/logger';
import uploadConfig from '../../config/upload';
import { emitTaskUpdate } from '../../libs/optimizedSocket';

class TaskAttachmentService {
  static readonly MAX_FILE_SIZE = uploadConfig.fileSize || 10 * 1024 * 1024;
  static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  static async create(file: Express.Multer.File, data: { taskId: number; uploadedBy: number }) {
    try {
      if (!file) throw new Error('Nenhum arquivo fornecido');
      if (!data.taskId) throw new Error('ID da tarefa é obrigatório');
      if (!data.uploadedBy) throw new Error('ID do usuário é obrigatório');
  
      const task = await Task.findByPk(data.taskId);
      if (!task) throw new Error(`Tarefa com ID ${data.taskId} não encontrada`);
      
      const companyId = task.companyId;
  
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`Tamanho do arquivo excede o limite de ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }
  
      if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`Tipo de arquivo não permitido. Tipos permitidos: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
      }
  
      // Utilizar o diretório da empresa de acordo com uploadConfig
      const companyDir = path.resolve(uploadConfig.directory, `company${companyId}`);
      if (!fs.existsSync(companyDir)) {
        fs.mkdirSync(companyDir, { recursive: true });
      }
      
      const filename = path.basename(file.path);
      const relativePath = path.join(`company${companyId}`, filename);
  
      const attachment = await TaskAttachment.create({
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        filePath: relativePath,
        taskId: data.taskId,
        uploadedBy: data.uploadedBy,
      });
  
      await TaskTimeline.create({
        action: 'attachment_added',
        taskId: data.taskId,
        userId: data.uploadedBy,
        details: { attachmentId: attachment.id, filename: file.originalname },
      });

      emitTaskUpdate(companyId, {
        type: 'task-attachment-added',
        taskId: data.taskId,
        attachmentId: attachment.id,
        responsibleUserId: task.responsibleUserId
      });
  
      return attachment;
    } catch (error) {
      logger.error('Erro ao criar anexo:', {
        error: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }
  
  static async findByTaskId(taskId: number) {
    try {
      if (!taskId) {
        throw new Error('ID da tarefa é obrigatório');
      }

      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error(`Tarefa com ID ${taskId} não encontrada`);
      }

      const attachments = await TaskAttachment.findAll({
        where: { taskId },
        include: [{
          model: User,
          as: 'uploader',
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC']]
      });

      return attachments;
    } catch (error) {
      logger.error('Erro ao buscar anexos:', {
        error: error.message,
        stack: error.stack,
        taskId
      });
      throw error;
    }
  }

  static async deleteAttachment(attachmentId: number, userId: number) {
    try {
      if (!attachmentId) {
        throw new Error('ID do anexo é obrigatório');
      }

      const attachment = await TaskAttachment.findByPk(attachmentId);
      if (!attachment) {
        throw new Error(`Anexo com ID ${attachmentId} não encontrado`);
      }

      const task = await Task.findByPk(attachment.taskId);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      if (attachment.uploadedBy !== userId) {
        throw new Error('Usuário não tem permissão para deletar este anexo');
      }

      try {
        // Usar o diretório base do uploadConfig para o caminho completo
        const filePath = path.resolve(uploadConfig.directory, attachment.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fsError) {
        logger.error('Erro ao deletar arquivo físico:', {
          error: fsError.message,
          stack: fsError.stack,
          path: attachment.filePath
        });
      }

      await attachment.destroy();

      await TaskTimeline.create({
        action: 'attachment_deleted',
        taskId: attachment.taskId,
        userId,
        details: {
          attachmentId,
          filename: attachment.originalName,
          deletedAt: new Date()
        }
      });

      emitTaskUpdate(task.companyId, {
        type: 'task-attachment-deleted',
        taskId: attachment.taskId,
        attachmentId,
        responsibleUserId: task.responsibleUserId,
        updatedBy: userId
      });

      return true;
    } catch (error) {
      logger.error('Erro ao deletar anexo:', {
        error: error.message,
        stack: error.stack,
        attachmentId,
        userId
      });
      throw error;
    }
  }
}

export default TaskAttachmentService;