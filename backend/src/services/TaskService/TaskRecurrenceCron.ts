import { CronJob } from 'cron';
import TaskRecurrenceService from './TaskRecurrenceService';
import TaskTimeline from '../../models/TaskTimeline';
import { logger } from '../../utils/logger';
import { emitTaskUpdate } from "../../libs/socket";

class TaskRecurrenceCron {
  private static instance: TaskRecurrenceCron;
  private cronJob: CronJob;
  private isRunning: boolean; // Novo estado interno

  private constructor() {
    logger.info("[Tarefas] Iniciando serviço de tarefas recorrentes");
    this.isRunning = false;
    try {
      // Executar todos os dias à meia-noite
      this.cronJob = new CronJob(
        '0 0 * * *',
        async () => {
          logger.info("[Tarefas] Iniciando geração de tarefas recorrentes");
          await this.generateRecurrentTasks();
        },
        null,
        false,
        'America/Sao_Paulo'
      );
      logger.info("[Tarefas] Serviço de tarefas recorrentes iniciado com sucesso");
      
      // Registrar no timeline que o serviço foi iniciado
      TaskTimeline.create({
        action: 'recurrence_cron_started',
        details: {
          startedAt: new Date(),
          cronPattern: '0 0 * * *',
          timezone: 'America/Sao_Paulo'
        }
      }).catch(err => {
        logger.error("[Tarefas] Erro ao registrar início do serviço de recorrência na timeline:", err);
      });
      
    } catch (error) {
      logger.error("[Tarefas] Erro ao iniciar serviço de tarefas recorrentes:", error);
      throw error;
    }
  }

  public static getInstance(): TaskRecurrenceCron {
    if (!TaskRecurrenceCron.instance) {
      logger.info("[Tarefas] Criando nova instância do serviço de recorrência");
      TaskRecurrenceCron.instance = new TaskRecurrenceCron();
    }
    return TaskRecurrenceCron.instance;
  }

  public start(): void {
    try {
      if (!this.isRunning) { // Alterado para usar estado interno
        logger.info("[Tarefas] Iniciando cronograma de tarefas recorrentes");
        this.cronJob.start();
        this.isRunning = true; // Atualiza estado
        logger.info("[Tarefas] Cronograma iniciado com sucesso");
        
        // Registrar no timeline
        TaskTimeline.create({
          action: 'recurrence_scheduler_started',
          details: {
            startedAt: new Date()
          }
        }).catch(err => {
          logger.error("[Tarefas] Erro ao registrar início do cronograma na timeline:", err);
        });
        
        // Executar uma vez na inicialização
        logger.info("[Tarefas] Executando primeira verificação de tarefas recorrentes");
        this.generateRecurrentTasks().catch(error => {
          logger.error("[Tarefas] Erro na primeira verificação:", error);
        });
      } else {
        logger.info("[Tarefas] Cronograma já está em execução");
      }
    } catch (error) {
      logger.error("[Tarefas] Erro ao iniciar cronograma:", error);
      this.isRunning = false; // Garante estado consistente em caso de erro
      throw error;
    }
  }

  public stop(): void {
    try {
      if (this.isRunning) { // Alterado para usar estado interno
        logger.info("[Tarefas] Parando cronograma de tarefas recorrentes");
        this.cronJob.stop();
        this.isRunning = false; // Atualiza estado
        logger.info("[Tarefas] Cronograma parado com sucesso");
        
        // Registrar no timeline
        TaskTimeline.create({
          action: 'recurrence_scheduler_stopped',
          details: {
            stoppedAt: new Date()
          }
        }).catch(err => {
          logger.error("[Tarefas] Erro ao registrar parada do cronograma na timeline:", err);
        });
      } else {
        logger.info("[Tarefas] Cronograma não está em execução");
      }
    } catch (error) {
      logger.error("[Tarefas] Erro ao parar cronograma:", error);
      throw error;
    }
  }

  private async generateRecurrentTasks(): Promise<void> {
    try {
      // Registrar início da geração no timeline
      await TaskTimeline.create({
        action: 'recurrence_generation_started',
        details: {
          startedAt: new Date()
        }
      });
      
      const count = await TaskRecurrenceService.generateDueTasks();
      logger.info(`[Tarefas] ${count} tarefas recorrentes foram geradas`);
      
      // Registrar conclusão da geração no timeline
      await TaskTimeline.create({
        action: 'recurrence_generation_completed',
        details: {
          tasksGenerated: count,
          completedAt: new Date()
        }
      });
      
      // Emitir evento para o frontend
      try {
        emitTaskUpdate(0, { // 0 é um placeholder, emissor global
          type: 'task-recurrence-batch-generated',
          tasksGenerated: count,
          timestamp: new Date()
        });
      } catch (emitError) {
        logger.error('[Tarefas] Erro ao emitir evento de geração de tarefas recorrentes:', emitError);
      }
      
    } catch (error) {
      logger.error('[Tarefas] Erro ao gerar tarefas recorrentes:', error);
      
      // Registrar erro no timeline
      await TaskTimeline.create({
        action: 'recurrence_generation_error',
        details: {
          error: error.message,
          timestamp: new Date()
        }
      });
      
      throw error;
    }
  }
}

export default TaskRecurrenceCron;