import OpenAI from "openai";
import Assistant from "../../models/Assistant";
import Thread from "../../models/Thread";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  ticketId: number;
  companyId: number;
}

const ManageThreadService = async ({ 
  ticketId, 
  companyId 
}: Request): Promise<Thread> => {
  try {
    // Verificar se o ticket existe e está associado à empresa correta
    const ticket = await Ticket.findOne({
      where: { id: ticketId },
      include: [
        {
          model: Queue,
          where: { companyId }
        }
      ]
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado ou não pertence à empresa", 404);
    }

    // Verificar se existe um assistente associado à fila do ticket
    const assistant = await Assistant.findOne({
      where: { 
        queueId: ticket.queueId,
        active: true
      }
    });

    if (!assistant) {
      throw new AppError("Nenhum assistente ativo encontrado para esta fila", 404);
    }

    // Verificar se já existe uma thread para este ticket
    let thread = await Thread.findOne({
      where: { ticketId }
    });

    // Se não existir, criar uma nova thread
    if (!thread) {
      const openai = new OpenAI({
        apiKey: assistant.openaiApiKey,
      });

      // Criar thread na OpenAI
      const openaiThread = await openai.beta.threads.create();

      // Criar registro local da thread
      thread = await Thread.create({
        threadId: openaiThread.id,
        ticketId
      });

      logger.info({
        ticketId,
        threadId: thread.id,
        openaiThreadId: openaiThread.id
      }, "Nova thread criada com sucesso");
    }

    return thread;
  } catch (error) {
    logger.error({
      ticketId,
      companyId,
      error: error.message,
      stack: error.stack
    }, "Erro ao gerenciar thread");

    if (error instanceof AppError) throw error;

    throw new AppError(
      "Erro ao gerenciar thread. Por favor, tente novamente.",
      500
    );
  }
};

export default ManageThreadService;