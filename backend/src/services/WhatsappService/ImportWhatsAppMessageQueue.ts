import { Queue, Worker } from 'bullmq';
import { getIO } from "../../libs/socket";
import { handleMessage } from "../WbotServices/MessageListener/wbotMessageListener";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import Ticket from '../../models/Ticket';
import UpdateTicketService from '../../services/TicketServices/UpdateTicketService';
import { Op } from 'sequelize';
import { add } from 'date-fns';
import { getBullConfig, BullConfig } from "../../config/redis";
import Whatsapp from '../../models/Whatsapp';

// Definir como uma variável que será inicializada posteriormente
let ImportQueue: Queue = null;
let bullConfig: BullConfig = null;
let queueInitialized = false;
let importMessagesWorker: Worker = null;

// Função assíncrona para inicializar a fila
export async function setupImportQueue() {
  try {
    if (queueInitialized) {
      logger.info("ImportQueue já inicializada, ignorando chamada redundante");
      return;
    }

    logger.info("Inicializando ImportQueue...");
    bullConfig = await getBullConfig();
    
    // Apenas criar a fila se a configuração foi carregada com sucesso
    if (bullConfig && bullConfig.connection) {
      ImportQueue = new Queue('importMessages', {
        connection: bullConfig.connection,
        defaultJobOptions: bullConfig.defaultJobOptions
      });
      
      // Criar o worker para processar a fila
      importMessagesWorker = new Worker('importMessages', async (job) => {
        const {
          whatsappId,
          companyId,
          messages,
          batchIndex,
          totalBatches
        } = job.data;

        let processedCount = 0;
        const io = getIO();

        const wbot = await getWbot(whatsappId);
        
        try {
          // Emitir evento inicial de progresso
          io.to(`company-${companyId}-mainchannel`)
            .emit(`importMessages-${companyId}`, {
              action: 'update',
              status: {
                this: 0,
                all: messages.length,
                status: "Running",
                batchInfo: `Lote ${batchIndex+1}/${totalBatches}`
              }
            });
            
          io.to(`company-${companyId}-whatsapp`)
            .emit(`importMessages-${companyId}-${whatsappId}`, {
              action: 'progress',
              status: {
                processed: 0,
                total: messages.length,
                progress: 0,
                batchInfo: `Lote ${batchIndex+1}/${totalBatches}`
              }
            });
          
          for (const message of messages) {
            try {
              await handleMessage(message, wbot, companyId, true, message.key?.remoteJid);
              processedCount++;
              await new Promise(resolve => setTimeout(resolve, 100));

              if (processedCount % 10 === 0 || processedCount === messages.length) {
                io.to(`company-${companyId}-mainchannel`)
                  .emit(`importMessages-${companyId}`, {
                    action: 'update',
                    status: {
                      this: processedCount,
                      all: messages.length,
                      status: "Running",
                      batchInfo: `Lote ${batchIndex+1}/${totalBatches}`
                    }
                  });
                  
                io.to(`company-${companyId}-whatsapp`)
                  .emit(`importMessages-${companyId}-${whatsappId}`, {
                    action: 'progress',
                    status: {
                      processed: processedCount,
                      total: messages.length,
                      progress: Math.round((processedCount / messages.length) * 100),
                      batchInfo: `Lote ${batchIndex+1}/${totalBatches}`
                    }
                  });
              }   
            } catch (err) {
              logger.warn({
                message: "Error processing individual message",
                error: err,
                messageId: message.key?.id
              });
              continue;
            }
          }

          // Se for o último lote, verificar se é necessário fechar tickets importados
          if (batchIndex === totalBatches - 1) {
            const whatsapp = await Whatsapp.findByPk(whatsappId);
            if (whatsapp && whatsapp.closedTicketsPostImported) {
              await closeImportedTickets(whatsappId);
            } else if (whatsapp) {
              // Apenas atualizar o status
              await whatsapp.update({
                statusImportMessages: "renderButtonCloseTickets"
              });
              
              io.to(`company-${companyId}-mainchannel`)
                .emit("importMessages-" + companyId, {
                  action: "refresh"
                });
            }
          }

          return {
            success: true,
            batchIndex,
            processed: processedCount
          };

        } catch (err) {
          logger.error({
            message: "Fatal error in import worker",
            error: err,
            batch: batchIndex
          });
          throw err;
        }
      }, {
        connection: bullConfig.connection,
        removeOnComplete: { count: 5000 },
        removeOnFail: { count: 1000 },
        concurrency: 5
      });

      // Configurar eventos do worker
      importMessagesWorker.on('completed', (job) => {
        logger.info(`Job de importação ${job.id} concluído com sucesso`);
      });

      importMessagesWorker.on('failed', (job, error) => {
        logger.error(`Job de importação ${job?.id} falhou:`, error);
      });
      
      // Configurar limpeza periódica
      ImportQueue.clean(15000, 1000, 'completed');
      ImportQueue.clean(15000, 1000, 'failed');
      
      queueInitialized = true;
      logger.info("ImportQueue e worker inicializados com sucesso");
    } else {
      logger.error("Falha ao obter configuração do Bull. ImportQueue não inicializada.");
    }
  } catch (error) {
    logger.error("Erro ao inicializar ImportQueue:", error);
    throw error;
  }
}

// Função para garantir acesso seguro à fila
export async function getImportQueue(): Promise<Queue> {
  if (!queueInitialized) {
    await setupImportQueue();
  }
  
  if (!ImportQueue) {
    throw new Error("ImportQueue não está inicializada corretamente");
  }
  
  return ImportQueue;
}

export async function closeImportedTickets(whatsappId: number) {
  const pendingTickets = await Ticket.findAll({
    where: {
      status: "pending",
      whatsappId,
      imported: {
        [Op.lt]: add(new Date(), { hours: 5 })
      }
    }
  });

  for (const ticket of pendingTickets) {
    await new Promise(resolve => setTimeout(resolve, 100));
    await UpdateTicketService({
      ticketData: { status: "closed" },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });
  }
  
  // Atualizar o status da conexão após finalizar a importação
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (whatsapp) {
    await whatsapp.update({ statusImportMessages: null });
    
    // Emitir evento para atualizar a interface
    const io = getIO();
    io.to(`company-${whatsapp.companyId}-mainchannel`)
      .emit("importMessages-" + whatsapp.companyId, {
        action: "refresh"
      });
  }
}

// Função para adicionar um job à fila de importação
export async function addImportBatchToQueue(data: {
  whatsappId: number,
  companyId: number,
  messages: any[],
  batchIndex: number,
  totalBatches: number
}, options: any = {}) {
  try {
    const queue = await getImportQueue();
    
    // Valores padrão para as opções caso não sejam fornecidos
    const defaultOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      priority: 5, // Prioridade mais baixa que operações normais
      removeOnComplete: true
    };
    
    // Mesclar opções padrão com as opções fornecidas
    const jobOptions = { ...defaultOptions, ...options };
    
    return await queue.add('importBatch', data, jobOptions);
  } catch (error) {
    logger.error("Erro ao adicionar job à fila de importação:", error);
    throw error;
  }
}

// Função para encerrar o worker se necessário
export async function shutdownImportQueue() {
  try {
    if (importMessagesWorker) {
      await importMessagesWorker.close();
      logger.info("Worker de importação de mensagens encerrado");
    }
    
    // Resetar estado para permitir reinicialização
    queueInitialized = false;
    ImportQueue = null;
    bullConfig = null;
    
    logger.info("ImportQueue fechada com sucesso");
  } catch (error) {
    logger.error("Erro ao encerrar ImportQueue:", error);
  }
}

// Exportar a fila para compatibilidade com código existente
export { ImportQueue };