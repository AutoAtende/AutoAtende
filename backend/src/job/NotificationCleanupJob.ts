import { Queue, Worker } from "bullmq";
import { logger } from "../utils/logger";
import NotificationStateManager from "../helpers/NotificationStateManager";
import moment from "moment";

// Configuração Redis
const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD
};

// Criar a fila com ID único para evitar duplicação
export const notificationCleanupQueue = new Queue("NotificationCleanup", {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 }
  }
});

export const notificationCleanupWorker = new Worker(
  "NotificationCleanup",
  async (job) => {
    const startTime = moment();
    
    // Verificar se já está rodando
    const activeCount = await notificationCleanupQueue.getActiveCount();
    if (activeCount > 1) {
      logger.info("Cleanup job already running, skipping");
      return;
    }

    logger.info("Starting notification cache cleanup");

    try {
      const notificationManager = NotificationStateManager.getInstance();
      notificationManager.clearOldRecords(72);

      const duration = moment().diff(startTime, 'seconds');
      logger.info(`Notification cleanup completed in ${duration}s`);

      return { success: true, duration };
    } catch (error) {
      logger.error("Error in notification cleanup:", error);
      throw error;
    }
  },
  { 
    connection,
    concurrency: 1,
    limiter: {
      max: 1,
      duration: 4 * 60 * 60 * 1000 // Um job a cada 4 horas
    }
  }
);

export const setupNotificationCleanup = async () => {
  // Remove agendamentos existentes para evitar duplicação
  const jobs = await notificationCleanupQueue.getRepeatableJobs();
  for (const job of jobs) {
    await notificationCleanupQueue.removeRepeatableByKey(job.key);
  }

  // Adiciona novo agendamento com ID fixo
  await notificationCleanupQueue.add(
    'cleanup',
    {},
    {
      repeat: {
        every: 4 * 60 * 60 * 1000, // 4 horas
        immediately: false
      },
      jobId: 'notification-cleanup', // ID fixo para evitar duplicação
      removeOnComplete: true
    }
  );

  logger.info('Notification cleanup job scheduled');
};


notificationCleanupWorker.on('completed', (job) => {
  logger.info(`Cleanup job ${job.id} completed successfully`);
});

notificationCleanupWorker.on('failed', (job, error) => {
  logger.error(`Cleanup job ${job?.id} failed:`, error);
});

