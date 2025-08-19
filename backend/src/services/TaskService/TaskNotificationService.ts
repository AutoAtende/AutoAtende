import Task from "../../models/Task";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import TaskTimeline from "../../models/TaskTimeline";
import TaskUser from "../../models/TaskUser"; 
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import { emitTaskUpdate } from "../../libs/optimizedSocket";
import { Op } from "sequelize";

class TaskNotificationService {
  public static async notifyNewTask(
    task: Task, 
    responsibleUser: User, 
    companyId: number
): Promise<void> {
    try {
        logger.info('Iniciando notificação de nova tarefa:', {
            taskId: task.id,
            userId: responsibleUser.id,
            userProfile: responsibleUser.profile,
            companyId
        });

        // Notificar o responsável pela tarefa
        await this.notifyUser(task, responsibleUser, companyId, 'new_task');

        // Buscar todos os usuários associados à tarefa
        const taskUsers = await TaskUser.findAll({
            where: { taskId: task.id },
            include: [{
                model: User,
                attributes: ['id', 'name', 'number', 'companyId', 'profile']
            }]
        });

        // Notificar cada usuário associado
        for (const taskUser of taskUsers) {
            const user = taskUser.user;
            
            // Evitar notificar o responsável duas vezes
            if (user.id !== responsibleUser.id) {
                await this.notifyUser(task, user, companyId, 'team_member');
            }
        }

    } catch (error) {
        logger.error('Erro ao enviar notificações de tarefa:', {
            error: error.message,
            stack: error.stack,
            taskId: task.id,
            companyId
        });
    }
  }

  // Método auxiliar para notificar um único usuário
  public static async notifyUser(
    task: Task,
    user: User,
    companyId: number,
    notificationType: 'new_task' | 'team_member' | 'overdue'
  ): Promise<void> {
    try {
        if (!user.number || user.number.length === 0 || user.companyId !== companyId) {
            await TaskTimeline.create({
                taskId: task.id,
                action: 'notification_failed',
                userId: user.id,
                details: {
                    reason: !user.number ? 'user_no_whatsapp' : 'invalid_company',
                    companyId,
                    timestamp: new Date()
                }
            });
            return;
        }

        const defaultWhatsapp = await Whatsapp.findOne({
            where: { 
                isDefault: 1, 
                companyId: user.companyId 
            }
        });
        
        let connection = defaultWhatsapp?.status === 'CONNECTED' ? defaultWhatsapp : null;

        if (!connection) {
            connection = await Whatsapp.findOne({
                where: { 
                    status: "CONNECTED", 
                    companyId 
                }
            });
        }

        if (!connection) {
            await TaskTimeline.create({
                taskId: task.id,
                action: 'notification_failed',
                userId: user.id,
                details: {
                    reason: 'no_whatsapp_connection',
                    companyId,
                    timestamp: new Date()
                }
            });
            
            logger.error('No WhatsApp connection available for notification', {
                taskId: task.id,
                userId: user.id,
                companyId
            });
            return;
        }

        const wbot = await getWbot(connection.id);
        const jid = `${user.number}@s.whatsapp.net`;
        
        // Definir a mensagem com base no tipo de notificação
        let messageText = '';
        
        if (notificationType === 'new_task') {
            messageText = `🔔 Nova tarefa atribuída a você:\n\n` +
                `📝 Título: ${task.title}\n` +
                `📋 Descrição: ${task.text || 'Sem descrição'}\n` +
                (task.dueDate ? `⏰ Prazo: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}\n` : '') +
                `\n🔗 Link: ${process.env.FRONTEND_URL}/tasks/${task.id}`;
        } else if (notificationType === 'team_member') {
            messageText = `🔔 Você foi adicionado como membro da equipe de uma tarefa:\n\n` +
                `📝 Título: ${task.title}\n` +
                `📋 Descrição: ${task.text || 'Sem descrição'}\n` +
                (task.dueDate ? `⏰ Prazo: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}\n` : '') +
                `\n🔗 Link: ${process.env.FRONTEND_URL}/tasks/${task.id}`;
        } else if (notificationType === 'overdue') {
            messageText = `⚠️ *TAREFA ATRASADA* ⚠️\n\n` +
                `A seguinte tarefa está atrasada:\n\n` +
                `📝 Título: ${task.title}\n` +
                `📋 Descrição: ${task.text || 'Sem descrição'}\n` +
                `⏰ Prazo: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Não definido'}\n` +
                `\n⚡ Por favor, atualize o status desta tarefa o mais breve possível.\n` +
                `\n🔗 Link: ${process.env.FRONTEND_URL}/tasks/${task.id}`;
        }

        await wbot.sendPresenceUpdate('composing', jid);
        await new Promise(resolve => setTimeout(resolve, 1200));

        const sentMessage = await wbot.sendMessage(jid, {
            text: messageText
        });

        await wbot.sendPresenceUpdate('paused', jid);

        await TaskTimeline.create({
            taskId: task.id,
            action: 'notification_sent',
            userId: user.id,
            details: {
                messageId: sentMessage?.key?.id || null,
                notificationType: 'whatsapp',
                message: messageText,
                sentAt: new Date(),
                companyId,
                whatsappId: connection.id,
                success: true,
                notificationReason: notificationType
            }
        });

        // Emite evento de notificação enviada
        emitTaskUpdate(companyId, {
            type: 'task-notification-sent',
            taskId: task.id,
            userId: user.id,
            notificationType: 'whatsapp'
        });

        logger.info('Task notification sent successfully', {
            taskId: task.id,
            userId: user.id,
            companyId,
            whatsappId: connection.id,
            notificationType
        });
    } catch (error) {
        logger.error('Erro ao enviar notificação para usuário:', {
            error: error.message,
            stack: error.stack,
            taskId: task.id,
            userId: user.id,
            companyId
        });

        await TaskTimeline.create({
            taskId: task.id,
            action: 'notification_failed',
            userId: user.id,
            details: {
                error: error.message,
                timestamp: new Date(),
                notificationType: 'whatsapp',
                companyId
            }
        });

        // Emite evento de falha na notificação
        emitTaskUpdate(companyId, {
            type: 'task-notification-failed',
            taskId: task.id,
            userId: user.id,
            error: error.message
        });
    }
  }

  public static async notifyOverdueTask(
    task: Task,
    responsibleUser: User,
    companyId: number,
    minutesOverdue: number
  ): Promise<void> {
    try {
      if (task.done) {
        logger.info('Task already completed, skipping overdue notification', {
          taskId: task.id,
          userId: responsibleUser.id
        });
        return;
      }

      // Notificar o responsável pela tarefa
      await this.notifyUser(task, responsibleUser, companyId, 'overdue');

      // Buscar todos os usuários associados à tarefa
      const taskUsers = await TaskUser.findAll({
          where: { taskId: task.id },
          include: [{
              model: User,
              attributes: ['id', 'name', 'number', 'companyId', 'profile']
          }]
      });

      // Notificar cada usuário associado
      for (const taskUser of taskUsers) {
          const user = taskUser.user;
          
          // Evitar notificar o responsável duas vezes
          if (user.id !== responsibleUser.id) {
              await this.notifyUser(task, user, companyId, 'overdue');
          }
      }

      // Atualizar o status de notificação da tarefa
      await task.update({
          notifiedOverdue: true,
          lastNotificationSent: new Date()
      });

      // Registrar no timeline
      await TaskTimeline.create({
          taskId: task.id,
          action: 'overdue_notifications_sent',
          userId: responsibleUser.id,
          details: {
              minutesOverdue,
              sentAt: new Date(),
              notificationType: 'whatsapp'
          }
      });

    } catch (error) {
      logger.error('Error sending overdue task notifications', {
        error: error.message,
        taskId: task.id,
        companyId
      });

      await TaskTimeline.create({
        taskId: task.id,
        action: 'overdue_notification_failed',
        userId: responsibleUser.id,
        details: {
          error: error.message,
          timestamp: new Date(),
          notificationType: 'whatsapp',
          companyId
        }
      });

      // Emite evento de falha na notificação de atraso
      emitTaskUpdate(companyId, {
        type: 'task-overdue-notification-failed',
        taskId: task.id,
        responsibleUserId: responsibleUser.id,
        error: error.message
      });
    }
  }
}

export default TaskNotificationService;