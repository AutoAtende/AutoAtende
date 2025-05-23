import { Job, Queue, Worker } from "bullmq";
import { logger } from "../utils/logger";
import InactivityMonitorService from "../services/FlowBuilderService/InactivityMonitorService";
import CleanupInactiveFlowsService from "../services/FlowBuilderService/CleanupInactiveFlowsService";
import { getBullConfig } from "../config/redis";

interface InactivityJobData {
  type: "monitor" | "cleanup";
  maxInactiveTimeMinutes?: number;
  batchSize?: number;
}

export const inactivityQueue = "inactivity-monitoring";

let inactivityQueueInstance: Queue<InactivityJobData> | null = null;
let inactivityWorkerInstance: Worker<InactivityJobData> | null = null;

// Criação da fila
export const createInactivityQueue = async (): Promise<Queue<InactivityJobData>> => {
  if (inactivityQueueInstance) {
    return inactivityQueueInstance;
  }

  const bullConfig = await getBullConfig();
  
  inactivityQueueInstance = new Queue<InactivityJobData>(inactivityQueue, {
    connection: bullConfig.connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000
      },
      removeOnComplete: 50,
      removeOnFail: 10
    }
  });

  return inactivityQueueInstance;
};

// Worker que processa os jobs de inatividade
export const initInactivityWorker = async (): Promise<Worker<InactivityJobData>> => {
  if (inactivityWorkerInstance) {
    return inactivityWorkerInstance;
  }

  const bullConfig = await getBullConfig();
  
  inactivityWorkerInstance = new Worker<InactivityJobData>(
    inactivityQueue,
    async (job: Job<InactivityJobData>) => {
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
        
        return { success: true, processedAt: new Date().toISOString() };
      } catch (error) {
        logger.error(`[InactivityMonitoringJob] Erro ao processar job: ${error.message}`);
        throw error;
      }
    },
    { 
      connection: bullConfig.connection, 
      concurrency: 1,
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 10 }
    }
  );
  
  inactivityWorkerInstance.on("completed", (job) => {
    logger.info(`[InactivityMonitoringJob] Job concluído: ${job.id}`);
  });
  
  inactivityWorkerInstance.on("failed", (job, error) => {
    logger.error(`[InactivityMonitoringJob] Job falhou: ${job?.id}, erro: ${error.message}`);
  });

  inactivityWorkerInstance.on("error", (error) => {
    logger.error(`[InactivityMonitoringJob] Erro no worker: ${error.message}`);
  });
  
  return inactivityWorkerInstance;
};

// Função para agendar jobs periódicos de monitoramento e limpeza
export const scheduleInactivityJobs = async (
  monitoringIntervalSeconds: number = 60,
  cleanupIntervalMinutes: number = 30,
  maxInactiveTimeMinutes: number = 60
): Promise<Queue<InactivityJobData>> => {
  const queue = await createInactivityQueue();
  
  try {
    // Remover jobs repetíveis antigos para evitar duplicatas
    const repeatableJobs = await queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.name === "regular-monitoring" || job.name === "regular-cleanup") {
        await queue.removeRepeatableByKey(job.key);
        logger.info(`[InactivityMonitoringJob] Job repetível removido: ${job.name}`);
      }
    }
    
    // Agendar job de monitoramento
    await queue.add(
      "regular-monitoring",
      { type: "monitor" },
      {
        repeat: {
          every: monitoringIntervalSeconds * 1000
        },
        removeOnComplete: true,
        removeOnFail: true
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
        },
        removeOnComplete: true,
        removeOnFail: true
      }
    );
    
    logger.info(`[InactivityMonitoringJob] Job de limpeza agendado a cada ${cleanupIntervalMinutes} minutos`);
    
    return queue;
  } catch (error) {
    logger.error(`[InactivityMonitoringJob] Erro ao agendar jobs: ${error.message}`);
    throw error;
  }
};

// Função para obter a fila existente
export const getInactivityQueue = (): Queue<InactivityJobData> | null => {
  return inactivityQueueInstance;
};

// Função para obter o worker existente
export const getInactivityWorker = (): Worker<InactivityJobData> | null => {
  return inactivityWorkerInstance;
};

// Função para limpar recursos
export const cleanupInactivityResources = async (): Promise<void> => {
  try {
    if (inactivityWorkerInstance) {
      await inactivityWorkerInstance.close();
      inactivityWorkerInstance = null;
      logger.info("[InactivityMonitoringJob] Worker fechado");
    }
    
    if (inactivityQueueInstance) {
      await inactivityQueueInstance.close();
      inactivityQueueInstance = null;
      logger.info("[InactivityMonitoringJob] Fila fechada");
    }
  } catch (error) {
    logger.error(`[InactivityMonitoringJob] Erro ao limpar recursos: ${error.message}`);
  }
};