import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import QueueNode from "../../models/QueueNode";
import Whatsapp from "../../models/Whatsapp";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { getWbot } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import FinishFlowService from "../../services/FlowBuilderService/FinishFlowService";

interface ExecuteQueueNodeParams {
  nodeData: {
    nodeId?: string;
    queueId?: number;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  whatsappId?: number;
  flowExecutionId: number;
}

const ExecuteQueueNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  whatsappId,
  flowExecutionId
}: ExecuteQueueNodeParams): Promise<boolean> => {
  try {
    logger.info(`Executando nó de fila para ticket ${ticket.id}`);
    
    // Usar whatsappId do ticket se não for fornecido
    const whatsappIdToUse = whatsappId || ticket.whatsappId;
    
    // Buscar configuração específica do nó no banco de dados
    let queueConfig = nodeData;
    if (nodeData.nodeId) {
      const queueNode = await QueueNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (queueNode) {
        queueConfig = {
          ...nodeData,
          queueId: queueNode.queueId
        };
      }
    }
    
    if (!queueConfig.queueId) {
      throw new AppError("ID da fila não fornecido");
    }
    
    // Verificar se a fila existe
    const queue = await Queue.findOne({
      where: { id: queueConfig.queueId, companyId }
    });
    
    if (!queue) {
      throw new AppError("Fila não encontrada");
    }
    
    const whatsapp = await Whatsapp.findByPk(whatsappIdToUse);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
    
    // Atualizar o ticket usando o serviço apropriado do AutoAtende
    await UpdateTicketService({
      ticketData: { 
        status: "pending",
        queueId: queue.id,
        userId: null,
        chatbot: false,
        flowExecutionId: null,
        integrationId: null,
        useIntegration: false,
        amountUsedBotQueues: null,
      },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });
    
    // Obter instância do bot
    const wbot = await getWbot(whatsappIdToUse);
    
    // Enviar status de digitando
    await SendPresenceStatus(
      wbot,
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
    );
    
    // Enviar mensagem informando que a solicitação foi recebida
    const sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        text: `Sua solicitação foi adicionada à fila ${queue.name}. Um atendente entrará em contato em breve.`
      }
    );
    
    // Verificar e registrar a mensagem no sistema
    await verifyMessage(sentMessage, ticket, contact);
    
    // Notificar via socket para atualização da interface
    const io = getIO();
    io.to(`company-${companyId}-notification`).emit("ticket", {
      action: "update",
      ticket
    });
    
    logger.info(`Nó de fila executado com sucesso para contato ${contact.id}`);
    
    // Atualizar a execução
    const execution = await FlowBuilderExecution.findByPk(flowExecutionId);
    if (execution) {
      // Atualizar as variáveis com informação do ticket
      const updatedVariables = {
        ...execution.variables,
        __ticket: {
          id: ticket.id,
          status: ticket.status,
          queueId: ticket.queueId
        }
      };
      
      await execution.update({
        variables: updatedVariables,
        status: "completed" // Encerrar fluxo após transferir para a fila
      });

      await FinishFlowService({
        ticketId: ticket.id,
        companyId: ticket.companyId,
        executionId: flowExecutionId,
        ticketStatus: "pending", // Status padrão ao finalizar
        flowStatus: "completed"
      });
    }
    
    // Retornar false para encerrar o fluxo
    return false;
  } catch (error) {
    logger.error(`Erro ao executar nó de fila: ${error.message}`);
    throw error;
  }
};

export default ExecuteQueueNodeService;