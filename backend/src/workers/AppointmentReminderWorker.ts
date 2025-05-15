import { Worker, Job } from "bullmq";
import { logger } from "../utils/logger";
import { getMessageQueue } from "../queues";
import Appointment, { AppointmentStatus } from "../models/Appointment";
import Professional from "../models/Professional";
import Service from "../models/Service";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";
import Ticket from "../models/Ticket";
import ScheduleSettings from "../models/ScheduleSettings";
import { Op } from "sequelize";
import moment from "moment";
import "moment/locale/pt-br";
import formatBody from "../helpers/Mustache";

moment.locale('pt-br');

class AppointmentReminderWorker {
  private static worker: Worker;

  static async start() {
    logger.info("[APPOINTMENT_REMINDERS] Iniciando worker de lembretes de agendamentos");
    
    this.worker = new Worker(
      "AppointmentReminders",
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
          password: process.env.REDIS_PASSWORD
        },
        concurrency: 5
      }
    );
    
    this.worker.on("completed", (job) => {
      logger.info(`[APPOINTMENT_REMINDERS] Job ${job.id} concluído com sucesso`);
    });
    
    this.worker.on("failed", (job, error) => {
      logger.error(`[APPOINTMENT_REMINDERS] Job ${job.id} falhou: ${error.message}`);
    });
    
    // Agendar a verificação diária de lembretes
    await this.scheduleReminderCheck();
    
    logger.info("[APPOINTMENT_REMINDERS] Worker de lembretes de agendamentos iniciado");
  }

  static async stop() {
    if (this.worker) {
      await this.worker.close();
      logger.info("[APPOINTMENT_REMINDERS] Worker de lembretes de agendamentos parado");
    }
  }

  private static async scheduleReminderCheck() {
    // Agendar para executar todos os dias às 09:00
    const now = moment();
    const nextRun = moment().startOf('day').add(9, 'hours');
    
    if (now.isAfter(nextRun)) {
      nextRun.add(1, 'day');
    }
    
    const delay = nextRun.diff(now);
    
    // Agendar job para verificação diária de lembretes
    const queue = getMessageQueue();
    await queue.add(
      "CheckAppointmentReminders",
      {},
      {
        delay,
        repeat: {
          pattern: "0 9 * * *" // Executar todos os dias às 09:00
        },
        removeOnComplete: true
      }
    );
    
    logger.info(`[APPOINTMENT_REMINDERS] Próxima verificação de lembretes agendada para ${nextRun.format("DD/MM/YYYY HH:mm:ss")}`);
  }

  private static async processJob(job: Job) {
    try {
      // Verificar tipo de job
      if (job.name === "CheckAppointmentReminders") {
        await this.checkDailyReminders();
      } else if (job.name === "SendAppointmentReminder") {
        await this.sendReminder(job.data);
      }
    } catch (error) {
      logger.error(`[APPOINTMENT_REMINDERS] Erro ao processar job ${job.id}: ${error.message}`);
      throw error;
    }
  }

  private static async checkDailyReminders() {
    logger.info("[APPOINTMENT_REMINDERS] Verificando agendamentos para envio de lembretes");
    
    try {
      // Buscar agendamentos confirmados para amanhã
      const tomorrow = moment().add(1, 'day').startOf('day');
      const endOfTomorrow = moment(tomorrow).endOf('day');
      
      const appointments = await Appointment.findAll({
        where: {
          scheduledAt: {
            [Op.between]: [tomorrow.toDate(), endOfTomorrow.toDate()] as unknown as [number, number]
          },
          status: AppointmentStatus.CONFIRMED,
          reminderSent: false
        },
        include: [
          { model: Professional },
          { model: Service },
          { model: Contact },
          { model: Ticket }
        ]
      });
      
      logger.info(`[APPOINTMENT_REMINDERS] Encontrados ${appointments.length} agendamentos para envio de lembretes`);
      
      // Agendar lembretes para cada agendamento
      for (const appointment of appointments) {
        const queue = getMessageQueue();
        await queue.add(
          "SendAppointmentReminder",
          {
            appointmentId: appointment.id,
            companyId: appointment.companyId
          },
          {
            removeOnComplete: true
          }
        );
      }
      
      logger.info("[APPOINTMENT_REMINDERS] Lembretes agendados com sucesso");
      
    } catch (error) {
      logger.error(`[APPOINTMENT_REMINDERS] Erro ao verificar lembretes diários: ${error.message}`);
      throw error;
    }
  }

  private static async sendReminder(data: { appointmentId: number; companyId: number }) {
    const { appointmentId, companyId } = data;
    
    try {
      // Buscar o agendamento com todas as associações
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          companyId,
          status: AppointmentStatus.CONFIRMED,
          reminderSent: false
        },
        include: [
          { model: Professional },
          { model: Service },
          { model: Contact },
          { model: Ticket }
        ]
      });
      
      if (!appointment) {
        logger.warn(`[APPOINTMENT_REMINDERS] Agendamento ${appointmentId} não encontrado ou não elegível para lembrete`);
        return;
      }
      
      // Obter configurações de lembretes
      const settings = await ScheduleSettings.findOne({
        where: { companyId }
      });
      
      if (!settings) {
        logger.warn(`[APPOINTMENT_REMINDERS] Configurações de agendamento não encontradas para a empresa ${companyId}`);
        return;
      }
      
      // Obter a conexão WhatsApp padrão
      const whatsapp = await Whatsapp.findOne({
        where: {
          companyId,
          isDefault: true
        }
      });
      
      if (!whatsapp) {
        logger.warn(`[APPOINTMENT_REMINDERS] Conexão WhatsApp padrão não encontrada para a empresa ${companyId}`);
        return;
      }
      
      // Formatar a mensagem de lembrete
      const scheduledAt = moment(appointment.scheduledAt);
      
      let reminderMessage = settings.reminderMessage || 
        `Olá {name}! Lembrete do seu agendamento para amanhã.\n\nServiço: {service}\nProfissional: {professional}\nData: {date}\nHorário: {time}\n\nAguardamos sua presença!`;
      
      // Substituir variáveis na mensagem
      reminderMessage = reminderMessage
        .replace(/{name}/g, appointment.contact.name)
        .replace(/{service}/g, appointment.service.name)
        .replace(/{professional}/g, appointment.professional.name)
        .replace(/{date}/g, scheduledAt.format("DD/MM/YYYY"))
        .replace(/{time}/g, scheduledAt.format("HH:mm"));
      
      // Enviar mensagem de lembrete
      const messageQueue = getMessageQueue();
      await messageQueue.add("SendMessage", {
        whatsappId: whatsapp.id,
        data: {
          number: appointment.contact.number,
          body: formatBody(reminderMessage, appointment.ticket)
        }
      });
      
      // Marcar lembrete como enviado
      await appointment.update({
        reminderSent: true
      });
      
      logger.info(`[APPOINTMENT_REMINDERS] Lembrete enviado com sucesso para o agendamento ${appointmentId}`);
      
    } catch (error) {
      logger.error(`[APPOINTMENT_REMINDERS] Erro ao enviar lembrete para o agendamento ${appointmentId}: ${error.message}`);
      throw error;
    }
  }
}

export default AppointmentReminderWorker;