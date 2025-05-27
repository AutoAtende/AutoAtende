import IORedis from "ioredis";
import { Job, Queue as BullQueue, Worker } from "bullmq";
import { getBullConfig, getRedisClient, closeRedisConnection, BullConfig } from "./config/redis";
import database from "./database";
import Setting from "./models/Setting";
import { MessageData, SendMessage } from "./helpers/SendMessage";
import Whatsapp from "./models/Whatsapp";
import { logger } from "./utils/logger";
import moment from "moment";
import Contact from "./models/Contact";
import { Op } from "sequelize";
import { getIO } from "./libs/socket";
import User from "./models/User";
import Company from "./models/Company";
import Plan from "./models/Plan";
import Ticket from "./models/Ticket";
import { ClosedAllOpenTickets } from "./services/WbotServices/wbotClosedTickets";
import Invoices from "./models/Invoices";
import { handleMessage } from "./services/WbotServices/MessageListener/wbotMessageListener";
import { verifyCampaignMessageAndCloseTicket } from "./services/WbotServices/MessageListener/Verifiers/VerifyCampaignMessageAndCloseTicket";
import { verifyRecentCampaign } from "./services/WbotServices/MessageListener/Verifiers/VerifyRecentCampaign";
import { handleMsgAck } from "./services/WbotServices/MessageListener/Ack/HandleMsgAck";
import { getWbot } from "./libs/wbot";
import MarkDeleteWhatsAppMessage from "./services/WbotServices/MarkDeleteWhatsAppMessage";
import CampaignJob from "./workers/campaignJob";
import ScheduledMessageJob from "./workers/scheduledMessageJob";
import ScheduleMessageHandler from "./workers/handler/ScheduleMessageHandler";
import InactivityMonitorService from "./services/FlowBuilderService/InactivityMonitorService";
import CleanupInactiveFlowsService from "./services/FlowBuilderService/CleanupInactiveFlowsService";
import DashboardCacheJob from "./jobs/dashboardCacheJob";


let connection: IORedis;
let bullConfig: BullConfig;

async function initializeRedisConnection() {
  connection = await getRedisClient();

  connection.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  connection.on('connect', () => {
    logger.info('Redis connected successfully');
  });
  bullConfig = await getBullConfig();
}

const queueDefaultOptions = {
  defaultJobOptions: {
    removeOnComplete: { count: 5000 },
    removeOnFail: { count: 1000 },
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 5000
    }
  }
};

// Declare global para poder referenciar os workers na limpeza
declare global {
  var __workerRefs: Worker[];
  var __campaignJob: CampaignJob;
  var __scheduleMessageJob: ScheduledMessageJob;
  var __dashboardCacheJob: DashboardCacheJob;
  var __heartbeatTimer: NodeJS.Timeout | null;
  var __healthMonitorTimer: NodeJS.Timeout | null;
}

export let userMonitor: BullQueue;
export let generalMonitor: BullQueue;
export let messageQueue: BullQueue;
export let queueMonitor: BullQueue;
export let scheduleMonitor: BullQueue;
export let campaignQueue: BullQueue;

export function getUserMonitor(): BullQueue {
  if (!userMonitor) {
    throw new Error(
      "Fila UserMonitor não inicializada. Execute startQueueProcess primeiro."
    );
  }
  return userMonitor;
}

export function getGeneralMonitor(): BullQueue {
  if (!generalMonitor) {
    throw new Error(
      "Fila GeneralMonitor não inicializada. Execute startQueueProcess primeiro."
    );
  }
  return generalMonitor;
}

export function getMessageQueue(): BullQueue {
  if (!messageQueue) {
    throw new Error(
      "Fila MessageQueue não inicializada. Execute startQueueProcess primeiro."
    );
  }
  return messageQueue;
}

export function getQueueMonitor(): BullQueue {
  if (!queueMonitor) {
    throw new Error(
      "Fila QueueMonitor não inicializada. Execute startQueueProcess primeiro."
    );
  }
  return queueMonitor;
}

export function getScheduleMonitor(): BullQueue {
  if (!scheduleMonitor) {
    throw new Error(
      "Fila ScheduleMonitor não inicializada. Execute startQueueProcess primeiro."
    );
  }
  return scheduleMonitor;
}

export function getCampaignQueue(): BullQueue {
  if (!campaignQueue) {
    throw new Error(
      "Fila CampaignQueue não inicializada. Execute startQueueProcess primeiro."
    );
  }
  return campaignQueue;
}


const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedCompanies() {
  logger.info("[CompaniesCache] Verificando cache de empresas");

  if (!cache.has('companies') || Date.now() - cache.get('companies').timestamp > CACHE_DURATION) {
    logger.info("[CompaniesCache] Cache expirado ou não encontrado. Buscando empresas no banco de dados");

    try {
      const companies = await Company.findAll({
        where: {
          status: true,
        },
        include: [
          {
            model: Whatsapp,
            attributes: ["id", "name", "status", "timeSendQueue", "sendIdQueue"],
            required: false
          }
        ]
      });

      logger.info(`[CompaniesCache] ${companies.length} empresas encontradas no banco de dados`);
      cache.set('companies', { data: companies, timestamp: Date.now() });
      logger.info("[CompaniesCache] Cache de empresas atualizado com sucesso");
    } catch (error) {
      logger.error("[CompaniesCache] Erro ao buscar empresas no banco de dados:", error);

      if (cache.has('companies')) {
        logger.info("[CompaniesCache] Retornando dados do cache antigo devido ao erro");
        return cache.get('companies').data || [];
      } else {
        logger.info("[CompaniesCache] Nenhum cache antigo disponível. Retornando array vazio");
        return [];
      }
    }
  } else {
    logger.info("[CompaniesCache] Cache de empresas válido encontrado. Retornando dados do cache");
  }

  return cache.get('companies').data;
}

async function handleVerifyQueue(job) {
  logger.info("Iniciando busca por tickets perdidos nas filas");
  try {
    logger.info("Buscando empresas no cache");
    const companies = await getCachedCompanies();
    logger.info(`${companies.length} empresas encontradas no cache`);

    const updatePromises = [];

    for (const company of companies) {
      logger.info(`Processando empresa com ID ${company.id}`);
      for (const whatsapp of company.whatsapps) {
        logger.info(`Verificando WhatsApp com ID ${whatsapp.id} da empresa ${company.id}`);

        if (whatsapp.status !== "CONNECTED") {
          logger.info(`WhatsApp com ID ${whatsapp.id} não está CONECTADO. Pulando...`);
          continue;
        }

        const moveQueue = whatsapp.timeSendQueue;
        const moveQueueId = whatsapp.sendIdQueue;

        if (moveQueue > 0 && !isNaN(moveQueueId) && Number.isInteger(moveQueueId)) {
          logger.info(`Configurações de fila encontradas para WhatsApp ${whatsapp.id}: moveQueue = ${moveQueue}, moveQueueId = ${moveQueueId}`);

          const tempoPassado = moment().subtract(moveQueue, "minutes").utc().format();
          logger.info(`Buscando tickets atualizados antes de ${tempoPassado}`);

          const tickets = await Ticket.findAll({
            where: {
              status: "pending",
              queueId: null,
              companyId: company.id,
              whatsappId: whatsapp.id,
              updatedAt: {
                [Op.lt]: tempoPassado
              }
            },
            include: [
              {
                model: Contact,
                as: "contact",
                attributes: ["id", "name", "number", "email", "profilePicUrl"],
                include: ["extraInfo"]
              },
              {
                model: Whatsapp,
                as: "whatsapp",
                attributes: ["id", "name"]
              }
            ]
          });

          logger.info(`${tickets.length} tickets perdidos encontrados para WhatsApp ${whatsapp.id}`);
          for (const ticket of tickets) {
            logger.info(`Atualizando ticket perdido com ID ${ticket.id} para a fila ${moveQueueId}`);
            updatePromises.push(
              ticket.update({ queueId: moveQueueId })
                .then(() => {
                  const io = getIO();
                  io.emit(`company-${company.id}-ticket`, {
                    action: "update",
                    ticket,
                    ticketId: ticket.id
                  });
                  logger.info(`Ticket perdido atualizado: ${ticket.id} - Empresa: ${company.id}`);
                })
                .catch(error => {
                  logger.error(`Erro ao atualizar ticket ${ticket.id}:`, error);
                })
            );
          }
        } else {
          logger.info(`Configurações de fila inválidas ou não encontradas para WhatsApp ${whatsapp.id}`);
        }
      }
    }

    logger.info("Aguardando conclusão de todas as atualizações de tickets");
    await Promise.all(updatePromises);
    logger.info("Todas as atualizações de tickets foram concluídas");
  } catch (error) {
    logger.error("Erro em handleVerifyQueue:", error);
    throw error;
  }
}

async function handleCloseTicketsAutomatic() {
  try {
    const companies = await Company.findAll({
      where: { status: true }
    });
    
    await Promise.all(companies.map(c => ClosedAllOpenTickets(c.id)));
  } catch (error) {
    logger.error("Error in handleCloseTicketsAutomatic:", error);
    throw error;
  }
}

async function handleLoginStatus() {
  try {
    const thresholdTime = new Date();
    thresholdTime.setMinutes(thresholdTime.getMinutes() - 5);

    await User.update(
      { online: false },
      {
        where: {
          updatedAt: { [Op.lt]: thresholdTime },
          online: true,
        },
      }
    );
  } catch (error) {
    logger.error("Error in handleLoginStatus:", error);
    throw error;
  }
}

async function handleInvoiceAndCompanyStatus() {
  logger.info("[QUEUES.TS/FATURAS] Iniciando gestão de faturas e status das empresas");

  const transaction = await database.transaction();

  try {
    // Buscar a configuração global de dias de teste
    const trialSetting = await Setting.findOne({
      where: { 
        companyId: 1, 
        key: "trialExpiration" 
      },
      transaction
    });
    
    const trialDays = trialSetting ? parseInt(trialSetting.value, 10) : 7;
    logger.info(`[QUEUES.TS/FATURAS] Período de teste configurado: ${trialDays} dias`);

    // Buscar empresas ativas
    const companies = await Company.findAll({
      where: { 
        id: { [Op.ne]: 1 },
        status: true 
      },
      include: [{ model: Plan, as: 'plan' }],
      transaction
    });

    const currentDate = moment();
    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();

    for (const company of companies) {
      logger.info(`[QUEUES.TS/FATURAS] Processando empresa ID ${company.id}`);
      
      // Verificar se a empresa está em período de teste
      const creationDate = moment(company.createdAt);
      const trialEndDate = moment(creationDate).add(trialDays, 'days');
      
      if (currentDate.isBefore(trialEndDate)) {
        logger.info(`[QUEUES.TS/FATURAS] Empresa ${company.id} ainda está em período de teste até ${trialEndDate.format('DD/MM/YYYY')}`);
        continue;
      }

      // Verificar se já existe fatura para o mês atual
      const firstDayOfMonth = moment().startOf('month');
      const lastDayOfMonth = moment().endOf('month');
      
      const existingInvoiceThisMonth = await Invoices.findOne({
        where: {
          companyId: company.id,
          dueDate: {
            [Op.between]: [firstDayOfMonth.toDate().getTime(), lastDayOfMonth.toDate().getTime()]
          }
        },
        transaction
      });

      if (existingInvoiceThisMonth) {
        logger.info(`[QUEUES.TS/FATURAS] Empresa ${company.id} já possui fatura para o mês ${currentMonth + 1}/${currentYear}`);
        continue;
      }

      const dueDate = moment(company.dueDate);
      // Definir data de vencimento
      const diaVencimento = dueDate.date().toString() ? parseInt(dueDate.date().toString(), 10) : 10;
      let dataVencimento = moment()
        .date(diaVencimento)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0);

      // Se o dia de vencimento já passou neste mês, criar para o próximo mês
      if (dataVencimento.isBefore(moment())) {
        dataVencimento.add(1, 'month');
      }

      // Criar nova fatura
      try {
        const novaFatura = await Invoices.create({
          detail: `Plano: ${company.plan?.name || 'Padrão'}`,
          status: 'open',
          value: company.plan?.value || 0,
          dueDate: dataVencimento.toDate(),
          companyId: company.id
        }, { transaction });

        logger.info(`[QUEUES.TS/FATURAS] Nova fatura ${novaFatura.id} criada para empresa ${company.id} com vencimento em ${dataVencimento.format('DD/MM/YYYY')}`);
      } catch (error) {
        logger.error(`[QUEUES.TS/FATURAS] Erro ao criar fatura para empresa ${company.id}:`, error);
      }
    }

    await transaction.commit();
    logger.info("[QUEUES.TS/FATURAS] Gestão de faturas e status das empresas concluída com sucesso");
  } catch (error) {
    await transaction.rollback();
    logger.error("[QUEUES.TS/FATURAS] Erro durante gestão de faturas e status:", error);
    throw error;
  }
}
async function handleMessageJob(job) {
  const { data } = job;
  const messages = data.messages;
  const companyId = data.companyId;

  try {
    const wbot = await getWbot(data.whatsappId, companyId);

    for (const message of messages) {
      await handleMessage(message, wbot, companyId);
      await verifyRecentCampaign(message, companyId);
      await verifyCampaignMessageAndCloseTicket(message, companyId);
      if (message.key.remoteJid?.endsWith("@g.us")) {
        await handleMsgAck(message, 2);
      }
    }
  } catch (error) {
    logger.error("Error in handleMessageJob:", error);
    throw error;
  }
}

async function handleInactivityMonitoring(job) {
  logger.info("Iniciando monitoramento de inatividade de fluxos");
  try {
    // Executar monitoramento de inatividade
    await InactivityMonitorService.checkInactiveExecutions();
    logger.info("Monitoramento de inatividade concluído com sucesso");
  } catch (error) {
    logger.error("Erro no monitoramento de inatividade:", error);
    throw error;
  }
}

async function handleInactivityCleanup(job) {
  logger.info("Iniciando limpeza de fluxos inativos");
  try {
    // Parâmetros padrão para limpeza
    const maxInactiveTimeMinutes = 60; // 1 hora
    const batchSize = 100;
    
    // Executar limpeza de fluxos inativos
    const stats = await CleanupInactiveFlowsService.cleanupInactiveFlows(
      maxInactiveTimeMinutes,
      batchSize
    );
    
    logger.info(`Limpeza de fluxos inativos concluída: ${JSON.stringify(stats)}`);
  } catch (error) {
    logger.error("Erro na limpeza de fluxos inativos:", error);
    throw error;
  }
}

async function messageUpdateJob(job) {
  const { data } = job;
  const companyId = data.companyId;
  const messageUpdate = data.messageUpdate;
  const whatsappId = data.whatsappId;

  try {
    const wbot = await getWbot(whatsappId, companyId);

    for (const message of messageUpdate) {
      try {
        await (wbot as any).readMessages([message.key]);
        const msgUp = { ...messageUpdate };
        if (msgUp['0']?.update.messageStubType === 1 && msgUp['0']?.key.remoteJid !== 'status@broadcast') {
          await MarkDeleteWhatsAppMessage(msgUp['0']?.key.remoteJid, null, msgUp['0']?.key.id, companyId);
        }
        await handleMsgAck(message, message.update.status);
      } catch (msgError) {
        logger.error(`Error processing message update:`, msgError);
        // Continue com as próximas mensagens mesmo com erro
      }
    }
  } catch (error) {
    logger.error("Error in messageUpdateJob:", error);
    throw error;
  }
}

async function handleSendMessage(job) {
  logger.info("[SendMessageJob] Iniciando processamento do job de envio de mensagem");

  try {
    const { data } = job;
    logger.info("[SendMessageJob] Dados do job recebidos:", JSON.stringify(data));

    logger.info(`[SendMessageJob] Buscando WhatsApp com ID ${data.whatsappId}`);
    const whatsapp = await Whatsapp.findByPk(data.whatsappId);

    if (!whatsapp) {
      logger.error("[SendMessageJob] WhatsApp não identificado");
      throw new Error("Whatsapp not identified");
    }
    logger.info("[SendMessageJob] WhatsApp encontrado com sucesso:", JSON.stringify(whatsapp));

    const messageData: MessageData = data.data;
    logger.info("[SendMessageJob] Dados da mensagem recebidos:", JSON.stringify(messageData));

    logger.info("[SendMessageJob] Iniciando envio da mensagem");
    await SendMessage(whatsapp, messageData);
    logger.info("[SendMessageJob] Mensagem enviada com sucesso");
  } catch (error) {
    logger.error("[SendMessageJob] Erro no processamento do job de envio de mensagem:", error);
    throw error;
  }
}

// Função auxiliar para verificar e corrigir jobs travados
async function checkAndFixStalledJobs(queue) {
  try {
    const activeJobs = await queue.getJobs(['active']);
    let fixedCount = 0;
    
    // Verificar cada job ativo
    for (const job of activeJobs) {
      // Verificar se o job está travado (com base no timestamp)
      const processedOn = job.processedOn;
      const now = Date.now();
      
      // Se o job está sendo processado há mais de 5 minutos, pode estar travado
      if (processedOn && (now - processedOn) > 5 * 60 * 1000) {
        try {
          // Tentar mover para waiting (para ser reprocessado)
          await job.moveToWaiting();
          fixedCount++;
          logger.info(`Job travado ${job.id} recuperado com sucesso`);
        } catch (moveError) {
          logger.error(`Erro ao recuperar job travado ${job.id}:`, moveError);
        }
      }
    }
    
    return fixedCount;
  } catch (error) {
    logger.error(`Erro ao verificar jobs travados:`, error);
    return 0;
  }
}

// Função para limpar e configurar os jobs repetíveis de forma robusta
const cleanupAndSetupRepeatableJobs = async (repeatableJobs) => {
  // Limpar jobs existentes para evitar duplicação
  for (const jobConfig of repeatableJobs) {
    try {
      // Pausa a fila temporariamente para evitar disputa durante a limpeza
      await jobConfig.queue.pause();
      
      logger.info(`Limpando jobs repetíveis existentes para ${jobConfig.name}...`);
      const existingJobs = await jobConfig.queue.getRepeatableJobs();
      
      // Remove jobs com o mesmo nome em paralelo
      const removalPromises = existingJobs
        .filter(job => job.name === jobConfig.name)
        .map(job => jobConfig.queue.removeRepeatableByKey(job.key)
          .catch(err => {
            logger.warn(`Erro ao remover job repetível ${job.key}: ${err.message}`);
            return false;
          })
        );
      
      await Promise.allSettled(removalPromises);
      logger.info(`Jobs repetíveis existentes para ${jobConfig.name} removidos`);
      
      // Resume a fila
      await jobConfig.queue.resume();
      
      // Pequena pausa entre cada fila para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logger.warn(`Erro ao limpar jobs repetíveis para ${jobConfig.name}:`, error);
      // Resume a fila mesmo em caso de erro
      try {
        await jobConfig.queue.resume();
      } catch (err) {
        logger.error(`Erro ao resumir fila após falha na limpeza:`, err);
      }
    }
  }

  // Adicionar os jobs novamente com um intervalo entre eles
  for (const [index, job] of repeatableJobs.entries()) {
    try {
      // Pequeno delay progressivo para evitar todos começarem juntos
      const staggerDelay = index * 2000;
      await new Promise(resolve => setTimeout(resolve, staggerDelay));
      
      await job.queue.add(
        job.name,
        {},
        {
          repeat: { 
            every: job.every,
            immediately: false // Não executar imediatamente ao adicionar
          },
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        }
      );
      logger.info(`Job ${job.name} adicionado com sucesso (delay: ${staggerDelay}ms)`);
    } catch (error) {
      logger.error(`Erro ao adicionar job repetível ${job.name}:`, error);
    }
  }
};

// Adicionar heartbeat para manter os locks vivos
const setupHeartbeat = (workers: Worker[]) => {
  const heartbeatInterval = setInterval(async () => {
    try {
      await connection.ping(); // Manter conexão ativa
      workers.forEach((worker) => {
        if (!worker.isRunning()) {
          logger.warn(`Reiniciando worker ${worker.name}`);
          worker.run().catch(err => 
            logger.error(`Erro ao reiniciar worker: ${err}`)
          );
        }
      });
    } catch (err) {
      logger.error("Falha no heartbeat global:", err);
    }
  }, 15000); // Heartbeat a cada 15 segundos

  // Guardar referência global
  global.__heartbeatTimer = heartbeatInterval;
  
  // Função para limpar o intervalo quando necessário
  return () => {
    clearInterval(heartbeatInterval);
    global.__heartbeatTimer = null;
  };
};

// Adicionar monitoramento de saúde das filas
const setupQueueHealthMonitor = (queues) => {
  const monitorInterval = setInterval(async () => {
    try {
      // Verificar a saúde de cada fila
      for (const queue of queues) {
        try {
          const jobCounts = await queue.getJobCounts();
          const waitingCount = jobCounts.waiting || 0;
          const activeCount = jobCounts.active || 0;
          const delayedCount = jobCounts.delayed || 0;
          const failedCount = jobCounts.failed || 0;
          
          logger.debug(`Fila ${queue.name}: waiting=${waitingCount}, active=${activeCount}, delayed=${delayedCount}, failed=${failedCount}`);
          
          // Se tiver muitos jobs falhados, podemos limpar automaticamente
          if (failedCount > 100) {
            logger.warn(`Fila ${queue.name} tem ${failedCount} jobs falhados. Limpando...`);
            await queue.clean(0, 1000, 'failed');
          }
          
          // Se tiver muitos jobs travados, podemos tentar recuperá-los
          if (activeCount > 50) {
            logger.warn(`Fila ${queue.name} tem muitos jobs ativos (${activeCount}). Verificando travados...`);
            const stalledCount = await checkAndFixStalledJobs(queue);
            if (stalledCount > 0) {
              logger.info(`Recuperados ${stalledCount} jobs travados da fila ${queue.name}`);
            }
          }
          
        } catch (queueError) {
          logger.error(`Erro ao verificar saúde da fila ${queue.name}:`, queueError);
        }
      }
    } catch (error) {
      logger.error(`Erro no monitoramento de saúde das filas:`, error);
    }
  }, 2 * 60 * 1000); // Executar a cada 2 minutos
  
  // Guardar referência global
  global.__healthMonitorTimer = monitorInterval;
  
  return () => {
    clearInterval(monitorInterval);
    global.__healthMonitorTimer = null;
  };
};

export async function startQueueProcess() {
  logger.info("[StartQueueProcess] Iniciando o processamento das filas");

  try {
    await initializeRedisConnection();
    logger.info("[StartQueueProcess] Conexão com Redis estabelecida");

    userMonitor = new BullQueue("UserMonitor", { connection: bullConfig.connection, ...queueDefaultOptions });
    generalMonitor = new BullQueue("GeneralMonitor", { connection: bullConfig.connection, ...queueDefaultOptions });
    messageQueue = new BullQueue("MessageQueue", { connection: bullConfig.connection, ...queueDefaultOptions });
    queueMonitor = new BullQueue("QueueMonitor", { connection: bullConfig.connection, ...queueDefaultOptions });
    scheduleMonitor = new BullQueue("ScheduleMonitor", { connection: bullConfig.connection, ...queueDefaultOptions });
    campaignQueue = new BullQueue("CampaignQueue", { connection: bullConfig.connection, ...queueDefaultOptions });

    // Configuração otimizada para workers
    const defaultWorkerConfig = {
      connection: bullConfig.connection,
      removeOnComplete: { count: 5000 },
      removeOnFail: { count: 1000 },
      lockDuration: 120000, // 2 minutos para evitar locks prematuras
      stalledInterval: 120000, // 2 minutos para verificação
      maxStalledCount: 3,
      drainDelay: 10,
      skipLockRenewal: false,       // Importante: NÃO pular renovação de locks
    };

    logger.info("[StartQueueProcess] Configuração padrão dos workers definida");

    // Criar uma referência para todos os workers para poder encerrá-los adequadamente
    const workers = [];

    const generalWorker = new Worker(
      generalMonitor.name,
      async (job: Job) => {
        try {
          logger.info(`[StartQueueProcess] Processando job ${job.name} no generalWorker`);
          switch (job.name) {
            case "CloseTicketsAutomatic":
              return handleCloseTicketsAutomatic();
            case "InvoiceCreate":
              return handleInvoiceAndCompanyStatus();
            case "InactivityMonitoring":
              return handleInactivityMonitoring(job);
            case "InactivityCleanup":
              return handleInactivityCleanup(job);
            case "DashboardCacheUpdate":
              // Obter a instância do DashboardCacheJob do contexto global
              if (global.__dashboardCacheJob) {
                return global.__dashboardCacheJob.process(job);
              } else {
                logger.warn("DashboardCacheJob não inicializado, ignorando job");
                return { success: false, error: "DashboardCacheJob não inicializado" };
              }
            default:
              logger.warn(`[StartQueueProcess] Tipo de job desconhecido: ${job.name}`);
          }
        } catch (error) {
          logger.error(`[StartQueueProcess] Erro no generalWorker: ${error}`);
          throw error;
        }
      },
      {
        ...defaultWorkerConfig,
        concurrency: 5,
      }
    );
    workers.push(generalWorker);

    logger.info("[StartQueueProcess] Worker geral (generalWorker) criado");

    const messageWorker = new Worker(
      messageQueue.name,
      async (job) => {
        try {
          logger.info(`[StartQueueProcess] Processando job ${job.name} no messageWorker`);
          switch (job.name) {
            case "HandleMessageJob":
              return handleMessageJob(job);
            case "MessageUpdateJob":
              return messageUpdateJob(job);
            case "SendMessage":
              return handleSendMessage(job);
            default:
              logger.warn(`[StartQueueProcess] Tipo de job de mensagem desconhecido: ${job.name}`);
          }
        } catch (error) {
          logger.error(`[StartQueueProcess] Erro no messageWorker: ${error}`);
          throw error;
        }
      },
      {
        ...defaultWorkerConfig,
        concurrency: 100,
      }
    );
    workers.push(messageWorker);

    logger.info("[StartQueueProcess] Worker de mensagens (messageWorker) criado");

    const queueWorker = new Worker(
      queueMonitor.name,
      async (job: Job) => {
        try {
          logger.info(`[StartQueueProcess] Processando job ${job.name} no queueWorker`);
          if (job.name === "VerifyQueueStatus") {
            return handleVerifyQueue(job);
          }
        } catch (error) {
          logger.error(`[StartQueueProcess] Erro no queueWorker: ${error}`);
          throw error;
        }
      },
      {
        ...defaultWorkerConfig,
        concurrency: 5,
      }
    );
    workers.push(queueWorker);

    logger.info("[StartQueueProcess] Worker de filas (queueWorker) criado");

    const userWorker = new Worker(
      userMonitor.name,
      async (job: Job) => {
        try {
          logger.info(`[StartQueueProcess] Processando job ${job.name} no userWorker`);
          if (job.name === "VerifyLoginStatus") {
            return handleLoginStatus();
          }
        } catch (error) {
          logger.error(`[StartQueueProcess] Erro no userWorker: ${error}`);
          throw error;
        }
      },
      {
        ...defaultWorkerConfig,
        concurrency: 5,
      }
    );
    workers.push(userWorker);

    logger.info("[StartQueueProcess] Worker de usuários (userWorker) criado");

    const scheduleWorker = new Worker(
      scheduleMonitor.name,
      async (job: Job) => {
        try {
          logger.info(`[StartQueueProcess] Processando job ${job.name} no scheduleWorker`);
          if (job.name === "VerifySchedules") {
            return ScheduleMessageHandler.handleVerifySchedules();
          }
        } catch (error) {
          logger.error(`[StartQueueProcess] Erro no scheduleWorker: ${error}`);
          throw error;
        }
      },
      {
        ...defaultWorkerConfig,
        concurrency: 10,
      }
    );
    workers.push(scheduleWorker);

    // Salvar a referência dos workers no global scope para limpeza adequada
    global.__workerRefs = workers;

    // Configuração dos jobs repetíveis
    const repeatableJobs = [
      {
        queue: userMonitor,
        name: "VerifyLoginStatus",
        every: 60000 * 5,
        timeout: 30000
      },
      {
        queue: generalMonitor,
        name: "CloseTicketsAutomatic",
        every: 60 * 1000 * 5,
        timeout: 60000
      },
      {
        queue: generalMonitor,
        name: "InvoiceCreate",
        every: 60 * 1000 * 30,
        timeout: 300000
      },
      {
        queue: campaignQueue,
        name: "VerifyCampaigns",
        every: 60 * 1000 * 5,
        timeout: 60000
      },
      {
        queue: scheduleMonitor,
        name: "VerifySchedules",
        every: 60 * 1000, // A cada 1 minuto
        timeout: 30000
      },
      {
        queue: queueMonitor,
        name: "VerifyQueueStatus",
        every: 60 * 1000 * 2,
        timeout: 30000
      },
      {
        queue: generalMonitor,
        name: "InactivityMonitoring",
        every: 60 * 1000, // A cada 1 minuto
        timeout: 30000
      },
      {
        queue: generalMonitor,
        name: "InactivityCleanup", 
        every: 30 * 60 * 1000, // A cada 30 minutos
        timeout: 120000
      },
      {
        queue: generalMonitor,
        name: "DashboardCacheUpdate",
        every: 30 * 60 * 1000, // A cada 30 minutos
        timeout: 300000 // 5 minutos de timeout
      }
    ];

    logger.info("[StartQueueProcess] Configurando jobs repetíveis");

    // Usar a implementação robusta de limpeza e configuração de jobs repetíveis
    await cleanupAndSetupRepeatableJobs(repeatableJobs);
    
    // Iniciar trabalhadores especializados
    logger.info("[StartQueueProcess] Iniciando CampaignJob");

    try {
      const campaignJob = await CampaignJob.create(campaignQueue).catch(error => {
        logger.error("[StartQueueProcess] Erro ao criar CampaignJob:", error);
        throw error;
      });
      
      if (!campaignJob) {
        throw new Error("[StartQueueProcess] CampaignJob não foi criado corretamente");
      }
      
      global.__campaignJob = campaignJob;
      logger.info("[StartQueueProcess] CampaignJob inicializado com sucesso");

      logger.info("[StartQueueProcess] Iniciando ScheduledMessageJob");
      const scheduleMessageJob = await ScheduledMessageJob.create(scheduleMonitor).catch(error => {
        logger.error("[StartQueueProcess] Erro ao criar ScheduledMessageJob:", error);
        throw error;
      });
      
      if (!scheduleMessageJob) {
        throw new Error("[StartQueueProcess] ScheduledMessageJob não foi criado corretamente");
      }
      
      // IMPORTANTE: Configurar a fila EXPLICITAMENTE para garantir que esteja correta
      try {
        ScheduleMessageHandler.setQueue(scheduleMonitor);
        logger.info("Fila configurada explicitamente no ScheduleMessageHandler");
      } catch (error) {
        logger.error("Erro ao configurar fila no ScheduleMessageHandler:", error);
        // Continue mesmo com erro na configuração da fila
      }
      
      // Confirmar a configuração global
      global.__scheduleMessageJob = scheduleMessageJob;
      logger.info("[StartQueueProcess] ScheduledMessageJob inicializado com sucesso");
      
      // Inicializar DashboardCacheJob
      logger.info("[StartQueueProcess] Iniciando DashboardCacheJob");
      try {
        const dashboardCacheJob = await DashboardCacheJob.create(generalMonitor);
        if (!dashboardCacheJob) {
          throw new Error("[StartQueueProcess] DashboardCacheJob não foi criado corretamente");
        }
        global.__dashboardCacheJob = dashboardCacheJob;
        logger.info("[StartQueueProcess] DashboardCacheJob inicializado com sucesso");
      } catch (dashboardError) {
        logger.error("[StartQueueProcess] Erro ao inicializar DashboardCacheJob:", dashboardError);
        // Continuar mesmo com erro na inicialização do DashboardCacheJob
      }
    } catch (workerError) {
      logger.error("[StartQueueProcess] Erro crítico na inicialização dos workers especializados:", workerError);
      // Propagar o erro para que seja tratado corretamente
      throw workerError;
    }
    
    // Configurar listeners para todos os workers
    workers.forEach((worker, index) => {
      worker.on("completed", job => {
        logger.debug(`Job ${job.id} concluído com sucesso no worker ${index}`);
      });
      
      worker.on("failed", (job, err) => {
        logger.error(`Job ${job?.id} falhou no worker ${index} com erro: ${err.message}`);
      });
      
      worker.on("error", err => {
        logger.error(`Erro no worker ${index}: ${err.message}`);
      });
      
      worker.on("stalled", jobId => {
        logger.warn(`Job ${jobId} está parado (stalled) no worker ${index}`);
      });
    });
    
    // Implementar heartbeat para manter locks vivos
    const stopHeartbeat = setupHeartbeat(workers);
    
    // Implementar monitoramento de saúde das filas
    const stopHealthMonitor = setupQueueHealthMonitor([
      userMonitor, generalMonitor, messageQueue, queueMonitor, scheduleMonitor, campaignQueue
    ]);
    
    // Verificar e retomar filas pausadas
    const queues = [userMonitor, generalMonitor, messageQueue, queueMonitor, scheduleMonitor, campaignQueue];
    for (const queue of queues) {
      const isPaused = await queue.isPaused();
      if (isPaused) {
        logger.info(`[StartQueueProcess] Fila ${queue.name} está pausada, retomando...`);
        await queue.resume();
      }
    }
    
    logger.info("[StartQueueProcess] Inicialização das filas concluída com sucesso");
    
    return {
      workers,
      campaignJob: global.__campaignJob,
      scheduleMessageJob: global.__scheduleMessageJob,
      dashboardCacheJob: global.__dashboardCacheJob,
      stopHeartbeat,
      stopHealthMonitor
    };
    
  } catch (error) {
    logger.error("[StartQueueProcess] Erro crítico durante inicialização das filas:", error);
    throw error; // Propagar o erro para tratamento adequado em nível superior
  }
}

// Melhorar a função de shutdown para limpar recursos adequadamente
export async function shutdownQueues() {
  logger.info("Iniciando o desligamento do sistema de filas");
  
  try {
    // Parar o monitoramento de saúde
    if (global.__healthMonitorTimer) {
      clearInterval(global.__healthMonitorTimer);
      global.__healthMonitorTimer = null;
      logger.info("Monitoramento de saúde das filas parado com sucesso");
    }
    
    // Parar o heartbeat
    if (global.__heartbeatTimer) {
      clearInterval(global.__heartbeatTimer);
      global.__heartbeatTimer = null;
      logger.info("Heartbeat de locks parado com sucesso");
    }
    
    // Fechar trabalhadores
    if (global.__workerRefs) {
      logger.info(`Encerrando ${global.__workerRefs.length} workers...`);
      const workerClosePromises = global.__workerRefs.map(async (worker, index) => {
        try {
          // Primeiro pausar, depois fechar
          try {
            await worker.pause();
            logger.info(`Worker ${index} pausado com sucesso`);
          } catch (pauseError) {
            logger.warn(`Erro ao pausar worker ${index}, continuando com fechamento:`, pauseError);
          }
          
          // Pequena pausa para garantir que os jobs ativos sejam concluídos
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await worker.close(true); // true = fechar forçadamente
          logger.info(`Worker ${index} encerrado com sucesso`);
        } catch (workerError) {
          logger.error(`Erro ao encerrar worker ${index}:`, workerError);
        }
      });
      
      await Promise.allSettled(workerClosePromises);
    }
    
    // Encerrar CampaignJob
    if (global.__campaignJob) {
      logger.info("Encerrando CampaignJob...");
      try {
        await global.__campaignJob.cleanup();
        logger.info("CampaignJob encerrado com sucesso");
      } catch (campaignError) {
        logger.error("Erro ao encerrar CampaignJob:", campaignError);
      }
    }
    
    // Encerrar ScheduledMessageJob
    if (global.__scheduleMessageJob) {
      logger.info("Encerrando ScheduledMessageJob...");
      try {
        await global.__scheduleMessageJob.cleanup();
        logger.info("ScheduledMessageJob encerrado com sucesso");
      } catch (scheduleError) {
        logger.error("Erro ao encerrar ScheduledMessageJob:", scheduleError);
      }
    }
    
    // Limpar jobs incompletos para evitar processamento duplicado na próxima inicialização
    try {
      logger.info("Limpando jobs incompletos das filas...");
      const queues = [userMonitor, generalMonitor, messageQueue, queueMonitor, scheduleMonitor, campaignQueue];
      const cleanupPromises = queues.map(async queue => {
        try {
          await queue.clean(0, 500, 'active');
          await queue.clean(0, 500, 'wait');
          logger.info(`Jobs incompletos da fila ${queue.name} limpos com sucesso`);
        } catch (cleanupError) {
          logger.error(`Erro ao limpar jobs da fila ${queue.name}:`, cleanupError);
        }
      });
      
      await Promise.allSettled(cleanupPromises);
    } catch (cleanupError) {
      logger.error("Erro ao limpar jobs incompletos:", cleanupError);
    }
    
    // Fechar conexão Redis
    if (connection) {
      logger.info("Fechando conexão Redis...");
      try {
        await connection.quit();
        logger.info("Conexão Redis fechada com sucesso");
      } catch (redisError) {
        logger.error("Erro ao fechar conexão Redis:", redisError);
        try {
          // Forçar desconexão em caso de erro
          connection.disconnect();
          logger.info("Redis desconectado forçadamente");
        } catch (forceError) {
          logger.error("Erro ao forçar desconexão do Redis:", forceError);
        }
      }
    }
    
    logger.info("Sistema de filas encerrado com sucesso");
  } catch (err) {
    logger.error("Erro durante o desligamento do sistema de filas:", err);
    // Forçar encerramento após tempo limite de 5 segundos
    setTimeout(() => {
      logger.warn("Forçando encerramento do sistema após timeout");
      process.exit(1);
    }, 5000);
  }
}

export async function cleanupQueues() {
  logger.info("Cleaning up queues");
  const queues = [userMonitor, generalMonitor, messageQueue, queueMonitor, scheduleMonitor, campaignQueue];

  try {
    const cleanupPromises = queues.map(async queue => {
      try {
        // Limpar as filas com opções mais robustas
        await queue.clean(0, 3000, 'delayed');
        await queue.clean(0, 3000, 'wait');
        await queue.clean(0, 3000, 'active');
        await queue.clean(0, 3000, 'completed');
        await queue.clean(0, 3000, 'failed');
        logger.info(`Fila ${queue.name} limpa com sucesso`);
      } catch (queueError) {
        logger.error(`Erro ao limpar fila ${queue.name}:`, queueError);
      }
    });

    await Promise.allSettled(cleanupPromises);
    logger.info("Queue cleanup completed successfully");
  } catch (err) {
    logger.error("Error during queue cleanup:", err);
    throw err;
  }
}

export function parseToMilliseconds(seconds: number) {
  return seconds * 1000;
}

export async function sleep(seconds: number) {
  logger.info(
    `Sleep of ${seconds} seconds started: ${moment().format("HH:mm:ss")}`
  );
  return new Promise(resolve => {
    setTimeout(() => {
      logger.info(
        `Sleep of ${seconds} seconds finished: ${moment().format(
          "HH:mm:ss"
        )}`
      );
      resolve(true);
    }, parseToMilliseconds(seconds));
  });
}

export function randomValue(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Melhorar tratamento de erros globais
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Tentar recuperar se for um erro relacionado ao Redis ou filas
  if (reason instanceof Error) {
    const errorMessage = reason.message.toLowerCase();
    if (
      errorMessage.includes('redis') || 
      errorMessage.includes('lock') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('stalled')
    ) {
      logger.warn('Detectado erro relacionado a Redis ou filas. Tentando recuperação automática...');
      
      // Tentar limpar filas e reiniciar em caso de problemas graves
      try {
        cleanupQueues().catch(err => logger.error('Falha na limpeza de recuperação:', err));
      } catch (recoveryError) {
        logger.error('Falha na tentativa de recuperação automática:', recoveryError);
      }
    }
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  
  // Verificar se o erro é recuperável
  const errorMessage = error.message.toLowerCase();
  if (
    errorMessage.includes('redis') || 
    errorMessage.includes('lock') || 
    errorMessage.includes('connection') ||
    errorMessage.includes('stalled')
  ) {
    logger.warn('Detectado erro fatal relacionado a Redis ou filas. Tentando medidas de emergência...');
    
    // Em caso de erro fatal, tentar salvar o que for possível antes de encerrar
    try {
      shutdownQueues().finally(() => {
        logger.error('Encerrando aplicação devido a erro irrecuperável após tentativa de limpeza');
        // Encerrar com delay para permitir logs serem salvos
        setTimeout(() => process.exit(1), 3000);
      });
    } catch (finalError) {
      logger.error('Falha na tentativa final de limpeza:', finalError);
      // Encerrar com delay para permitir logs serem salvos
      setTimeout(() => process.exit(1), 3000);
    }
  }
});