import { Job, Queue, Worker } from "bullmq";
import { logger } from "../utils/logger";
import InactivityMonitorService from "../services/FlowBuilderService/InactivityMonitorService";
import CleanupInactiveFlowsService from "../services/FlowBuilderService/CleanupInactiveFlowsService";
import { redisConfig } from "../config/redis";
import Redis from "ioredis";

interface InactivityJobData {
  type: "monitor" | "cleanup";
  maxInactiveTimeMinutes?: number;
  batchSize?: number;
}

export const inactivityQueue = "inactivity-monitoring";

// Criação da fila
export const createInactivityQueue = () => {
  const connection = new Redis(redisConfig);
  return new Queue<InactivityJobData>(inactivityQueue, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000
      },
      removeOnComplete: true
    }
  });
};

// Worker que processa os jobs de inatividade
export const initInactivityWorker = () => {
  const connection = new Redis(redisConfig);
  const worker = new Worker<InactivityJobData>(
    inactivityQueue,
    async (job) => {
      logger.info(`[InactivityMonitoringJob] Processando job: ${job.id}, tipo: ${job.data.type}`);
      
      try {
        switch (job.data.type) {
          case "monitor":
            // Executar monitoramento de inatividade
            await InactivityMonitorService.checkInactiveExecutions();
            logger.info(`[InactivityMonitoringJob] Monitoramento de inatividade concluído`);
            break;
            
          case "cleanup":
            // Executar limpeza de fluxos inativos
            const maxInactiveTimeMinutes = job.data.maxInactiveTimeMinutes || 60;
            const batchSize = job.data.batchSize || 100;
            
            const stats = await CleanupInactiveFlowsService.cleanupInactiveFlows(
              maxInactiveTimeMinutes,
              batchSize
            );
            
            logger.info(`[InactivityMonitoringJob] Limpeza concluída: ${JSON.stringify(stats)}`);
            break;
            
          default:
            logger.warn(`[InactivityMonitoringJob] Tipo de job desconhecido: ${job.data.type}`);
            break;
        }
        
        return true;
      } catch (error) {
        logger.error(`[InactivityMonitoringJob] Erro ao processar job: ${error.message}`);
        throw error;
      }
    },
    { connection, concurrency: 1 }
  );
  
  worker.on("completed", (job) => {
    logger.info(`[InactivityMonitoringJob] Job concluído: ${job.id}`);
  });
  
  worker.on("failed", (job, error) => {
    logger.error(`[InactivityMonitoringJob] Job falhou: ${job?.id}, erro: ${error.message}`);
  });
  
  return worker;
};

// Função para agendar jobs periódicos de monitoramento e limpeza
export const scheduleInactivityJobs = async (
  monitoringIntervalSeconds: number = 60,
  cleanupIntervalMinutes: number = 30,
  maxInactiveTimeMinutes: number = 60
) => {
  const queue = createInactivityQueue();
  
  // Remover jobs antigos
  await queue.obliterate({ force: true });
  
  // Agendar job de monitoramento
  await queue.add(
    "regular-monitoring",
    { type: "monitor" },
    {
      repeat: {
        every: monitoringIntervalSeconds * 1000
      }
    }
  );
  
  logger.info(`[InactivityMonitoringJob] Job de monitoramento agendado a cada ${monitoringIntervalSeconds} segundos`);
  
  // Agendar job de limpeza
  await queue.add(
    "regular-cleanup",
    { 
      type: "cleanup",
      maxInactiveTimeMinutes,
      batchSize: 100
    },
    {
      repeat: {
        every: cleanupIntervalMinutes * 60 * 1000
      }
    }
  );
  
  logger.info(`[InactivityMonitoringJob] Job de limpeza agendado a cada ${cleanupIntervalMinutes} minutos`);
  
  return queue;
};