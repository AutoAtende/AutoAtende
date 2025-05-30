import Ticket from "../../models/Ticket";
import Thread from "../../models/Thread";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface TransferRequest {
  ticketId: number;
  companyId: number;
  userId?: number;
  queueId?: number;
  reason?: string;
}

interface TransferResponse {
  success: boolean;
  message: string;
  ticket: Ticket;
}

const TransferFromAssistantService = async ({
  ticketId,
  companyId,
  userId,
  queueId,
  reason = "Transferido do assistente para atendimento humano"
}: TransferRequest): Promise<TransferResponse> => {
  try {
    // Buscar o ticket
    const ticket = await Ticket.findOne({
      where: { 
        id: ticketId, 
        companyId 
      }
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    // Verificar se o ticket está sendo processado por assistente
    if (!ticket.useIntegration) {
      logger.warn({
        ticketId: ticket.id,
        companyId
      }, "Ticket não está usando integração de assistente");
      
      return {
        success: false,
        message: "Ticket não está sendo processado por assistente",
        ticket
      };
    }

    // Log da transferência
    logger.info({
      ticketId: ticket.id,
      companyId,
      fromAssistant: true,
      toUserId: userId,
      toQueueId: queueId,
      reason
    }, "Iniciando transferência do assistente para atendimento humano");

    // Preparar dados para atualização
    const updateData: any = {
      useIntegration: false,
      integrationId: null,
      chatbot: false,
      isBot: false,
      status: userId ? "open" : "pending", // Se tem usuário, abre; senão, fica pendente
      userId: userId || null,
      queueId: queueId || ticket.queueId || null
    };

    // Atualizar o ticket
    await ticket.update(updateData);

    // Buscar thread associada se existir
    const thread = await Thread.findOne({
      where: { ticketId: ticket.id }
    });

    if (thread) {
      logger.info({
        ticketId: ticket.id,
        threadId: thread.threadId
      }, "Thread encontrada - mantendo histórico de conversa");
      
      // Não deletamos a thread para manter o histórico
      // Apenas marcamos que não está mais ativa
    }

    // Recarregar ticket com dados atualizados
    await ticket.reload();

    logger.info({
      ticketId: ticket.id,
      companyId,
      newStatus: ticket.status,
      newUserId: ticket.userId,
      newQueueId: ticket.queueId
    }, "Ticket transferido com sucesso do assistente para atendimento humano");

    return {
      success: true,
      message: "Ticket transferido com sucesso para atendimento humano",
      ticket
    };

  } catch (error) {
    logger.error({
      ticketId,
      companyId,
      error: error.message,
      stack: error.stack
    }, "Erro ao transferir ticket do assistente");

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Erro interno ao transferir ticket do assistente",
      500
    );
  }
};

export default TransferFromAssistantService;