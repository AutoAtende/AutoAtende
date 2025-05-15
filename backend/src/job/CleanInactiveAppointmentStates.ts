import { logger } from "../utils/logger";
import ChatbotState from "../models/ChatbotState";
import Ticket from "../models/Ticket";
import { Op } from "sequelize";
import { getWbot } from "../libs/wbot";

const CleanInactiveAppointmentStates = {
  key: "CleanInactiveAppointmentStates",
  options: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  },
  async handle(): Promise<void> {
    try {
      logger.info("[CleanInactiveAppointmentStates] Iniciando limpeza de estados inativos de agendamento");
      
      // Buscar estados expirados
      const expiredStates = await ChatbotState.findAll({
        where: {
          expiresAt: {
            [Op.lt]: new Date() // Busca todos com expiresAt menor que agora
          }
        },
        include: [
          { 
            model: Ticket,
            include: ["contact"] // Garantir que o contato seja incluído na consulta
          }
        ]
      });
      
      logger.info(`[CleanInactiveAppointmentStates] Encontrados ${expiredStates.length} estados inativos para limpeza`);
      
      // Processar cada estado expirado
      for (const state of expiredStates) {
        try {
          // Verificações robustas antes de tentar enviar mensagem
          if (state.ticket && 
              state.ticket.contact && 
              state.ticket.contact.number && 
              state.step !== "done") {
            
            try {
              // Verificar se o WhatsApp está disponível
              const wbot = await getWbot(state.ticket.whatsappId, state.companyId);
              
              if (wbot) {
                // Se o WhatsApp estiver disponível, enviar mensagem
                await wbot.sendMessage(
                  `${state.ticket.contact.number}@${state.ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                  {
                    text: "Seu atendimento de agendamento foi encerrado devido a inatividade. Para iniciar novamente, digite *AGENDA* a qualquer momento."
                  }
                );
                logger.info(`[CleanInactiveAppointmentStates] Mensagem de inatividade enviada para ticket ${state.ticketId}`);
              } else {
                logger.warn(`[CleanInactiveAppointmentStates] Whatsapp não disponível para ticket ${state.ticketId}, pulando notificação`);
              }
            } catch (whatsappError) {
              // Se falhar ao enviar mensagem, apenas registra o erro e continua
              logger.error(`[CleanInactiveAppointmentStates] Erro ao enviar mensagem de inatividade para ticket ${state.ticketId}: ${whatsappError.message}`);
            }
          } else {
            // Registrar o motivo pelo qual a mensagem não foi enviada
            if (!state.ticket) {
              logger.warn(`[CleanInactiveAppointmentStates] Ticket não encontrado para estado ${state.id}, pulando notificação`);
            } else if (!state.ticket.contact) {
              logger.warn(`[CleanInactiveAppointmentStates] Contato não encontrado para ticket ${state.ticketId}, pulando notificação`);
            } else if (!state.ticket.contact.number) {
              logger.warn(`[CleanInactiveAppointmentStates] Número do contato não encontrado para ticket ${state.ticketId}, pulando notificação`);
            } else if (state.step === "done") {
              logger.info(`[CleanInactiveAppointmentStates] Estado ${state.id} já está marcado como 'done', pulando notificação`);
            }
          }
          
          // Excluir o registro do banco independentemente de ter enviado mensagem ou não
          await state.destroy();
          
          logger.info(`[CleanInactiveAppointmentStates] Estado inativo removido para ticket ${state.ticketId}`);
        } catch (stateError) {
          logger.error(`[CleanInactiveAppointmentStates] Erro ao processar estado inativo ${state.id}: ${stateError.message}`);
        }
      }
      
      logger.info("[CleanInactiveAppointmentStates] Limpeza de estados inativos de agendamento concluída");
    } catch (error) {
      logger.error(`[CleanInactiveAppointmentStates] Erro ao executar limpeza de estados inativos: ${error.message}`);
      throw error; // Repassar erro para o BullMQ gerenciar
    }
  }
};

export default CleanInactiveAppointmentStates;