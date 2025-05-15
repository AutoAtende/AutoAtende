import { Queue } from "bullmq";
import { logger } from "../../utils/logger";
import Schedule from "../../models/Schedule";
import moment from "moment";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { SendMessage } from "../../helpers/SendMessage";
import path from "path";
import Contact from "../../models/Contact";
import formatBody from "../../helpers/Mustache";
import AppError from "../../errors/AppError";
import { Op } from "sequelize";
import Whatsapp from "../../models/Whatsapp";

interface ScheduleData {
  id: number;
  body: string;
  contact: Contact;
  mediaPath?: string;
  mediaName?: string;
  companyId: number;
  whatsappId?: number;
}

class ScheduleMessageHandler {
  private queue: Queue; // Adicione essa propriedade

  // Adicione um construtor para inicializar a fila
  constructor(queue?: Queue) {
    if (queue) {
      this.queue = queue;
    }
  }

  // Método para definir a fila após a inicialização (caso necessário)
  public setQueue(queue: Queue): void {
    this.queue = queue;
  }

  private async validateSchedule(schedule: Schedule): Promise<void> {
    if (!schedule) {
      throw new AppError("Agendamento não encontrado");
    }

    if (!schedule.contact) {
      throw new AppError("Contato não encontrado no agendamento");
    }

    if (!schedule.body) {
      throw new AppError("Corpo da mensagem não definido");
    }

    if (schedule.status === "ENVIADA") {
      throw new AppError("Agendamento já foi enviado");
    }

    if (schedule.status === "CANCELADA") {
      throw new AppError("Agendamento está cancelado");
    }
  }

  private async getWhatsAppInstance(companyId: number, whatsappId?: number) {
    try {
      let whatsapp;
      
      if (whatsappId) {
        // Busca a conexão específica se for fornecida
        whatsapp = await Whatsapp.findOne({
          where: {
            id: whatsappId,
            companyId,
            status: "CONNECTED"
          }
        });
      }
      
      // Se não encontrou ou não foi fornecido o ID, busca a conexão padrão
      if (!whatsapp) {
        whatsapp = await GetDefaultWhatsApp(companyId);
      }
      
      if (!whatsapp) {
        throw new AppError("Nenhuma conexão WhatsApp disponível");
      }
      
      return whatsapp;
    } catch (error) {
      logger.error(`Erro ao obter instância do WhatsApp: ${error}`);
      throw new AppError("Falha ao obter conexão WhatsApp");
    }
  }

  private async prepareMediaPath(schedule: Schedule): Promise<string | null> {
    if (!schedule.mediaPath) return null;

    try {
      const mediaPath = path.resolve(
        __dirname,
        "..",
        "..",
        "public",
        `company${schedule.companyId}`,
        schedule.mediaPath
      );
      return mediaPath;
    } catch (error) {
      logger.error(`Erro ao preparar caminho da mídia: ${error}`);
      throw new AppError("Falha ao processar arquivo de mídia");
    }
  }

  public async handleSingleMessage(scheduleData: ScheduleData): Promise<void> {
    const { id, companyId, whatsappId } = scheduleData;
    
    try {
      logger.info(`Iniciando processamento de mensagem agendada ID: ${id}`);
      
      // Recupera registro atualizado do banco
      const schedule = await Schedule.findByPk(id, {
        include: [{ 
          model: Contact, 
          as: "contact",
          attributes: ["id", "name", "number", "email"]
        }]
      });
  
      // Validações iniciais
      await this.validateSchedule(schedule);
      
      // Obtém instância do WhatsApp (específica ou padrão)
      const whatsapp = await this.getWhatsAppInstance(companyId, whatsappId || schedule.whatsappId);
      
      // Prepara caminho da mídia se existir
      const mediaPath = await this.prepareMediaPath(schedule);

      // Formata o corpo da mensagem
      const formattedBody = formatBody(schedule.body, schedule.contact);

      logger.info(`Preparando envio para contato: ${schedule.contact.number} via conexão: ${whatsapp.name}`);

      // Envia a mensagem
      await SendMessage(whatsapp, {
        number: schedule.contact.number,
        body: formattedBody,
        mediaPath: mediaPath,
        fileName: schedule.mediaName
      });

      // Atualiza status do agendamento
      await schedule.update({
        sentAt: moment().toDate(),
        status: "ENVIADA"
      });

      logger.info(`Mensagem agendada ${id} enviada com sucesso via conexão: ${whatsapp.name}`);

    } catch (error) {
      logger.error(`Erro no processamento da mensagem agendada ${id}:`, error);
      
      // Se for um erro conhecido, mantém a mensagem original
      if (error instanceof AppError) {
        throw error;
      }
      
      // Para outros erros, padroniza a mensagem
      throw new AppError("Falha no processamento da mensagem agendada");
    }
  }

  public async handleVerifySchedules() {
    logger.info("Verificando agendamentos pendentes");
    try {
      // Verificar se a fila está inicializada
      if (!this.queue) {
        logger.warn("Fila não inicializada no ScheduleMessageHandler. Tentando recuperar...");
        
        // Tentativa de recuperação da fila via global
        if (global.__scheduleMessageJob) {
          try {
            const recoveredQueue = global.__scheduleMessageJob.getQueue();
            if (recoveredQueue) {
              this.setQueue(recoveredQueue);
              logger.info("Fila recuperada do contexto global com sucesso");
            } else {
              throw new Error("Fila recuperada é inválida");
            }
          } catch (recoveryError) {
            logger.error("Falha ao recuperar fila do contexto global:", recoveryError);
            
            // Segunda tentativa: tentando obter do scheduleMonitor
            try {
              const queueModule = require("../../queues");
              if (queueModule && queueModule.scheduleMonitor) {
                this.setQueue(queueModule.scheduleMonitor);
                logger.info("Fila recuperada do módulo de filas com sucesso");
              } else {
                throw new Error("Não foi possível recuperar fila do módulo");
              }
            } catch (secondRecoveryError) {
              logger.error("Falha na segunda tentativa de recuperação:", secondRecoveryError);
              throw new Error("Não foi possível obter referência à fila de agendamentos");
            }
          }
        } else {
          // Mesma tentativa alternativa se a global não estiver disponível
          try {
            const queueModule = require("../../queues");
            if (queueModule && queueModule.scheduleMonitor) {
              this.setQueue(queueModule.scheduleMonitor);
              logger.info("Fila recuperada do módulo de filas com sucesso");
            } else {
              throw new Error("Não foi possível recuperar fila do módulo");
            }
          } catch (secondRecoveryError) {
            logger.error("Falha ao recuperar fila do módulo:", secondRecoveryError);
            throw new Error("Não foi possível obter referência à fila de agendamentos");
          }
        }
      }
      
      const schedules = await Schedule.findAll({
        where: {
          sentAt: null,
          status: "PENDENTE",
          sendAt: {
            [Op.lte]: moment().add(1, 'minute').toDate(),
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
        logger.info("Nenhum agendamento pendente encontrado");
        return { count: 0 };
      }
  
      logger.info(`Encontrados ${schedules.length} agendamentos pendentes`);
  
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
            whatsappId: schedule.whatsappId 
          },
          {
            delay: 1000, // Reduzir o delay para 1 segundo
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
      logger.info(`${schedules.length} agendamentos adicionados à fila para processamento`);
      return { count: schedules.length };

    } catch (error) {
      logger.error("Erro ao processar agendamentos:", error);
      
      // Log detalhado para diagnóstico
      if (error instanceof Error) {
        logger.error(`Detalhes do erro: ${error.message}`);
        logger.error(`Stack trace: ${error.stack}`);
      }
      
      throw error;
    }
  }

  public hasQueue(): boolean {
    return this.queue !== undefined && this.queue !== null;
  }
}

// Exportar uma instância da classe
export default new ScheduleMessageHandler();