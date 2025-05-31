
import { logger } from "../../utils/logger";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import Ticket from "../../models/Ticket";

interface FinishAssistantParams {
  ticketId: number;
  companyId: number;
  assistantId: string;
  ticketStatus?: string;
}

const FinishAssistantService = async ({
  ticketId,
  companyId,
  assistantId,
  ticketStatus = "pending"
}: FinishAssistantParams): Promise<void> => {
  try {
    logger.info({
      ticketId,
      companyId,
      assistantId,
      ticketStatus
    }, "Finalizando processamento do assistente");

    // Verificar se o ticket existe
    const ticket = await Ticket.findOne({
      where: {
        id: ticketId,
        companyId
      }
    });

    if (!ticket) {
      logger.warn(`Ticket ${ticketId} não encontrado ao finalizar assistente`);
      return;
    }

    // Verificar se o ticket realmente estava sendo processado por este assistente
    if (ticket.integrationId !== Number(assistantId) || !ticket.useIntegration) {
      logger.warn({
        ticketId,
        currentIntegrationId: ticket.integrationId,
        expectedAssistantId: assistantId,
        useIntegration: ticket.useIntegration
      }, "Ticket não estava sendo processado por este assistente");
      return;
    }

    // 1. Atualizar o ticket para limpar todos os campos relacionados ao assistente
    // Seguindo exatamente o padrão do FinishFlowService
    await UpdateTicketService({
      ticketData: {
        status: ticketStatus,
        appointmentMode: false,
        flowExecutionId: null,
        useIntegration: false,
        integrationId: null,
        chatbot: false,
        amountUsedBotQueues: 0,
        promptId: null,
      },
      ticketId,
      companyId
    });

    logger.info({
      ticketId,
      assistantId,
      finalStatus: ticketStatus
    }, "Assistente finalizado com sucesso");

  } catch (error) {
    logger.error({
      ticketId,
      assistantId,
      error: error.message,
      stack: error.stack
    }, "Erro ao finalizar processamento do assistente");

    // Tentar finalizar mesmo com erro (fallback)
    try {
      await UpdateTicketService({
        ticketData: {
          status: ticketStatus,
          useIntegration: false,
          chatbot: false,
          promptId: null,
          amountUsedBotQueues: 0,
          integrationId: null,
          appointmentMode: false,
        },
        ticketId,
        companyId
      });

      logger.info({
        ticketId,
        assistantId
      }, "Assistente finalizado via fallback após erro");

    } catch (updateError) {
      logger.error({
        ticketId,
        assistantId,
        error: updateError.message
      }, "Erro crítico ao finalizar assistente - ticket pode ficar travado");
    }
  }
};

export default FinishAssistantService;