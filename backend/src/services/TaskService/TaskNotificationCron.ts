import { CronJob } from 'cron';
import { Op } from "sequelize";
import Task from "../../models/Task";
import TaskUser from "../../models/TaskUser";
import User from "../../models/User";
import { getIO } from "../../libs/optimizedSocket";
import { logger } from "../../utils/logger";
import TaskNotificationService from "./TaskNotificationService";

class TaskNotificationCron {
  private static instance: TaskNotificationCron;
  private cronJob: CronJob;
  private isRunning: boolean;

  private constructor() {
    logger.info("[Tarefas] Iniciando serviço de notificações");
    this.isRunning = false;
    try {
      this.cronJob = new CronJob(
        '*/5 * * * *',
        async () => {
          logger.info("[Tarefas] Iniciando verificação agendada de tarefas");
          await this.checkOverdueTasks();
        },
        null,
        false,
        'America/Sao_Paulo'
      );
      logger.info("[Tarefas] Serviço de notificações iniciado com sucesso");
    } catch (error) {
      logger.error("[Tarefas] Erro ao iniciar serviço de notificações:", error);
      throw error;
    }
  }

  public static getInstance(): TaskNotificationCron {
    if (!TaskNotificationCron.instance) {
      logger.info("[Tarefas] Criando nova instância do serviço");
      TaskNotificationCron.instance = new TaskNotificationCron();
    }
    return TaskNotificationCron.instance;
  }

  public start(): void {
    try {
      if (!this.isRunning) {
        logger.info("[Tarefas] Iniciando monitoramento");
        this.cronJob.start();
        this.isRunning = true;
        logger.info("[Tarefas] Monitoramento iniciado com sucesso");
        
        // Executar primeira verificação
        logger.info("[Tarefas] Executando primeira verificação");
        this.checkOverdueTasks().catch(error => {
          logger.error("[Tarefas] Erro na primeira verificação:", error);
        });
      } else {
        logger.info("[Tarefas] Monitoramento já está em execução");
      }
    } catch (error) {
      logger.error("[Tarefas] Erro ao iniciar monitoramento:", error);
      this.isRunning = false;
      throw error;
    }
  }

  public stop(): void {
    try {
      if (this.isRunning) {
        logger.info("[Tarefas] Parando monitoramento");
        this.cronJob.stop();
        this.isRunning = false;
        logger.info("[Tarefas] Monitoramento parado com sucesso");
      } else {
        logger.info("[Tarefas] Monitoramento não está em execução");
      }
    } catch (error) {
      logger.error("[Tarefas] Erro ao parar monitoramento:", error);
      throw error;
    }
  }

  private async checkOverdueTasks(): Promise<void> {
    try {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        logger.debug('Parâmetros de busca:', {
            now: now.toISOString(),
            fiveMinutesAgo: fiveMinutesAgo.toISOString()
        });

        // Adicionar log para debug da query
        const overdueTasks = await Task.findAll({
            where: {
                dueDate: {
                    [Op.and]: [
                        { [Op.lte]: now },
                        { [Op.gte]: fiveMinutesAgo }
                    ]
                },
                done: false,
                notifiedOverdue: false,
                deleted: false // Adicionado filtro para ignorar tarefas excluídas
            },
            logging: (sql) => {
              console.log(`[Sequelize Log]: ${sql}`);
          }
        });
        
        logger.info(`Found ${overdueTasks.length} overdue tasks`);

      const io = getIO();
      if (!io) {
        throw new Error('Socket.io instance not found');
      }

      for (const task of overdueTasks) {
        try {
          const minutesOverdue = Math.floor((now.getTime() - task.dueDate.getTime()) / (1000 * 60));

          // Notifica usuários do grupo
          if (task.taskUsers?.length > 0) {
            for (const taskUser of task.taskUsers) {
              if (taskUser.user) {
                // Notificação via WebSocket
                io.to(`user-${taskUser.user.id}`).emit('task-overdue', {
                  taskId: task.id,
                  title: task.title,
                  dueDate: task.dueDate
                });

                // Notificação via WhatsApp
                await TaskNotificationService.notifyOverdueTask(
                  task,
                  taskUser.user,
                  taskUser.user.companyId,
                  minutesOverdue
                );

                logger.info(`Notification sent to user ${taskUser.user.id} for task ${task.id}`);
              }
            }
          } else if (task.responsible) {
            // Notifica apenas o responsável
            // Notificação via WebSocket
            io.to(`user-${task.responsible.id}`).emit('task-overdue', {
              taskId: task.id,
              title: task.title,
              dueDate: task.dueDate
            });

            // Notificação via WhatsApp
            await TaskNotificationService.notifyOverdueTask(
              task,
              task.responsible,
              task.responsible.companyId,
              minutesOverdue
            );

            logger.info(`Notification sent to responsible ${task.responsible.id} for task ${task.id}`);
          }

          // Marca como notificada
          await Task.update(
            { notifiedOverdue: true },
            { 
              where: { id: task.id }
            }
          );
          
          logger.info(`Task ${task.id} marked as notified`);
        } catch (taskError) {
          logger.error(`Error processing task ${task.id}:`, {
            error: taskError.message,
            stack: taskError.stack,
            task: {
              id: task.id,
              title: task.title,
              responsibleUserId: task.responsibleUserId,
              usersCount: task.taskUsers?.length
            }
          });
        }
      }
    } catch (error) {
      logger.error('Error checking overdue tasks:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

export default TaskNotificationCron;