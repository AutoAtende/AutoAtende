import { Worker, Job, Queue as BullQueue } from "bullmq";
import { logger } from "../utils/logger";
import Schedule from "../models/Schedule";
import moment from "moment";
import ScheduleMessageHandler from "./handler/ScheduleMessageHandler";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import Tag from "../models/Tag";
import { SendMessage } from "../helpers/SendMessage";
import path from "path";
import { Op } from "sequelize";
import Contact from "../models/Contact";
import { randomValue } from "../queues";
import { getIO } from "../libs/socket";
import formatBody from "../helpers/Mustache";
import { getBullConfig } from "../config/redis";

class SocketUpdateBuffer {
  private updates: Map<number, {
    campaign: any,
    lastUpdate: number
  }> = new Map();
  
  private readonly updateInterval = 3000;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.startUpdateInterval();
  }

  public queueUpdate(campaign: any) {
    this.updates.set(campaign.id, {
      campaign,
      lastUpdate: Date.now()
    });
  }

  private startUpdateInterval() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.processUpdates(), this.updateInterval);
    }
  }

  private processUpdates() {
    const now = Date.now();
    const io = getIO();

    this.updates.forEach((update, campaignId) => {
      if (now - update.lastUpdate >= this.updateInterval) {
        io.to(`company-${update.campaign.companyId}-mainchannel`)
          .emit(`company-${update.campaign.companyId}-campaign`, {
            action: "update",
            record: update.campaign
          });
        this.updates.delete(campaignId);
      }
    });
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

class ScheduledMessageJob {
  private queue: BullQueue;
  private worker: Worker; // Removido o readonly

  private constructor(queue: BullQueue) {
    this.queue = queue;
  }

  public static async create(queue: BullQueue): Promise<ScheduledMessageJob> {
    const instance = new ScheduledMessageJob(queue);
    
    // Configuração assíncrona do worker
    const workerConfig = await getBullConfig();
    
    try {
      // Inicialização da fila no handler
      ScheduleMessageHandler.setQueue(queue);
      global.__scheduleMessageJob = instance;
      logger.info("Fila configurada no ScheduleMessageHandler com sucesso");
    } catch (error) {
      logger.error("Erro crítico ao configurar fila:", error);
    }

    // Criação do worker com configuração resolvida
    instance.worker = new Worker(
      queue.name,
      async (job) => {
        try {
          switch (job.name) {
            case "SendMessage":
              return instance.handleSendScheduledMessage(job);
            case "VerifySchedules":
              return instance.handleVerifySchedules();
            default:
              logger.warn(`Tipo de job desconhecido: ${job.name}`);
          }
        } catch (error) {
          logger.error(`Erro no processamento do job ${job.name}:`, error);
          throw error;
        }
      },
      workerConfig
    );

    instance.setupWorkerListeners();
    return instance;
  }

  private setupWorkerListeners(): void {
    this.worker.on("completed", (job) => {
      logger.info(`Job de mensagem agendada ${job.id} concluído`);
    });

    this.worker.on("failed", (job, error) => {
      logger.error(`Falha no job ${job?.id}:`, error);
    });

    this.worker.on("error", (error) => {
      logger.error("Erro no worker:", error);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`Job ${jobId} parado`);
    });
  }
  public getQueue(): BullQueue {
    return this.queue;
  }

  private async handleVerifySchedules() {
    try {
      const schedules = await Schedule.findAll({
        where: {
          sentAt: null,
          status: "PENDENTE",
          sendAt: {
            [Op.lte]: moment().toDate(),
          }
        },
        include: [{ 
          model: Contact, 
          as: "contact",
          attributes: ["id", "name", "number", "email"]
        }],
        limit: 500
      });

      if (!schedules?.length) {
        return { count: 0 };
      }

      await Schedule.update(
        { status: "AGENDADA" },
        { 
          where: { 
            id: schedules.map(s => s.id) 
          } 
        }
      );

      const queuePromises = schedules.map(schedule =>
        this.queue.add(
          "SendMessage",
          { 
            schedule,
            whatsappId: schedule.whatsappId  // Adicionar explicitamente o whatsappId
          },
          {
            delay: randomValue(1000, 20000),
            removeOnComplete: true,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000
            }
          }
        )
      );

      await Promise.all(queuePromises);
      return { count: schedules.length };

    } catch (error) {
      logger.error("Erro na verificação de agendamentos:", error);
      throw error;
    }
  }

  private async handleSendScheduledMessage(job: Job) {
    const { schedule, whatsappId } = job.data;
    let scheduleRecord: Schedule | null = null;
  
    try {
      logger.info(`Processando agendamento ID ${schedule.id} para contato ${schedule.contact?.name}`);
      
      scheduleRecord = await Schedule.findByPk(schedule.id, {
        include: [{ 
          model: Contact, 
          as: "contact",
          attributes: ["id", "name", "number", "email"]
        }]
      });
  
      if (!scheduleRecord || 
          ["ENVIADA", "CANCELADA"].includes(scheduleRecord.status) || 
          scheduleRecord.sentAt !== null) {
        logger.info(`Agendamento ID ${schedule.id} já processado`);
        return;
      }
  
      await scheduleRecord.update({ status: "PROCESSANDO" });
  
      if (scheduleRecord.daysR !== null && scheduleRecord.campId !== null) {
        await this.handleRecurringMessage(scheduleRecord, schedule);
      } else {
        logger.info(`Enviando mensagem agendada ID ${schedule.id}`);
        await ScheduleMessageHandler.handleSingleMessage({
          id: schedule.id,
          body: schedule.body,
          contact: schedule.contact,
          mediaPath: schedule.mediaPath,
          mediaName: schedule.mediaName,
          companyId: schedule.companyId,
          whatsappId: whatsappId || schedule.whatsappId  // Passando explicitamente o whatsappId
        });
      }
  
      if (scheduleRecord.recurrenceType !== 'none' && scheduleRecord.recurrenceEndDate) {
        await this.handleRecurrence(scheduleRecord);
      }
  
      logger.info(`Agendamento ID ${schedule.id} concluído`);
  
    } catch (error) {
      logger.error(`Erro no agendamento ID ${schedule.id}:`, error);
      if (scheduleRecord) await scheduleRecord.update({ status: "ERRO" });
      throw error;
    }
  }
  
  private async handleRecurringMessage(scheduleRecord: Schedule, schedule: any) {
    const existingSendAt = moment(scheduleRecord.sendAt);
    const companyId = schedule.companyId;
    const whatsapp = await GetDefaultWhatsApp(schedule.companyId);
    const tagId = scheduleRecord.campId;

    if (!tagId) {
      logger.warn(`Tag não definida para agendamento ${scheduleRecord.id}`);
      return;
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      logger.warn(`Tag ${tagId} não encontrada`);
      return;
    }

    try {
      if (tag.mediaPath) {
        await this.sendMediaMessage(whatsapp, schedule, tag, companyId);
      }

      if (tag.rptDays === 0) {
        await scheduleRecord.update({
          sentAt: moment().toDate(),
          status: "ENVIADA"
        });
      } else {
        const newSendAt = existingSendAt
          .add(tag.rptDays, "days")
          .format("YYYY-MM-DD HH:mm");
        
        await scheduleRecord.update({
          sendAt: moment(newSendAt).toDate(),
          status: "PENDENTE"
        });
      }
    } catch (error) {
      logger.error(`Erro em mensagem recorrente ${scheduleRecord.id}:`, error);
      throw error;
    }
  }

  private async handleSingleMessage(scheduleRecord: Schedule, schedule: any) {
    try {
      const whatsapp = await GetDefaultWhatsApp(schedule.companyId);
      let filePath = null;

      if (schedule.mediaPath) {
        filePath = path.resolve(
          __dirname, 
          "..", 
          "..", 
          "public", 
          `company${schedule.companyId}`, 
          schedule.mediaPath
        );
      }

      await SendMessage(whatsapp, {
        number: schedule.contact.number,
        body: formatBody(schedule.body, schedule.contact),
        mediaPath: filePath,
        fileName: schedule.mediaName
      });

      await scheduleRecord.update({
        sentAt: moment().toDate(),
        status: "ENVIADA"
      });
    } catch (error) {
      logger.error(`Erro no envio único ${scheduleRecord.id}:`, error);
      throw error;
    }
  }

  private async handleRecurrence(scheduleRecord: Schedule) {
    try {
      const nextDate = this.calculateNextRecurrence(
        scheduleRecord.sendAt,
        scheduleRecord.recurrenceType
      );

      if (moment(nextDate).isSameOrBefore(scheduleRecord.recurrenceEndDate)) {
        await Schedule.create({
          ...scheduleRecord.get(),
          id: undefined,
          sendAt: nextDate,
          sentAt: null,
          status: "PENDENTE",
          createdAt: undefined,
          updatedAt: undefined
        });
      }
    } catch (error) {
      logger.error(`Erro na recorrência ${scheduleRecord.id}:`, error);
      throw error;
    }
  }

  private async sendMediaMessage(whatsapp: any, schedule: any, tag: any, companyId: number) {
    try {
      if (tag.msgR) {
        await SendMessage(whatsapp, {
          number: schedule.contact.number,
          body: formatBody(tag.msgR, schedule.contact)
        });
      }

      const filePath = path.resolve(
        __dirname,
        "..",
        "..",
        "public",
        `company${companyId}`,
        tag.mediaPath
      );

      await SendMessage(whatsapp, {
        number: schedule.contact.number,
        body: tag.msgR ? formatBody(tag.msgR, schedule.contact) : "",
        mediaPath: filePath
      });
    } catch (error) {
      logger.error('Erro no envio de mídia:', error);
      throw error;
    }
  }

  private calculateNextRecurrence(currentDate: Date, recurrenceType: string): Date {
    const date = moment(currentDate);
    
    const recurrenceMap = {
      'daily': { unit: 'day', value: 1 },
      'weekly': { unit: 'week', value: 1 },
      'biweekly': { unit: 'week', value: 2 },
      'monthly': { unit: 'month', value: 1 },
      'quarterly': { unit: 'month', value: 3 },
      'semiannually': { unit: 'month', value: 6 },
      'yearly': { unit: 'year', value: 1 }
    };

    const recurrence = recurrenceMap[recurrenceType];
    if (recurrence) {
      return date.add(recurrence.value, recurrence.unit as moment.DurationInputArg2).toDate();
    }

    return date.toDate();
  }

  public async cleanup(): Promise<void> {
    try {
      await this.worker.close();
      logger.info("Worker de mensagens agendadas finalizado");
    } catch (error) {
      logger.error("Erro ao finalizar worker:", error);
    }
  }
}

export default ScheduledMessageJob;