import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import AttendantNode from "../../models/AttendantNode";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { getIO } from "../../libs/socket";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import { getWbot } from "../../libs/wbot";
import { SendPresenceStatus } from "../../helpers/SendPresenceStatus";
import { logger } from "../../utils/logger";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";

interface ExecuteAttendantNodeParams {
  nodeData: {
    nodeId?: string;
    assignmentType: string;
    assignedUserId?: number;
    queueId?: number;
    timeoutSeconds?: number;
    endFlowFlag?: boolean;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  whatsappId?: number;
  flowExecutionId: number;
}

const ExecuteAttendantNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  whatsappId,
  flowExecutionId
}: ExecuteAttendantNodeParams): Promise<boolean> => {
  try {
    logger.info(`Executando nó de atendente para ticket ${ticket.id}`);
    
    // Usar whatsappId do ticket se não for fornecido
    const whatsappIdToUse = whatsappId || ticket.whatsappId;
    
    // Buscar configuração específica do nó no banco de dados
    let attendantConfig = nodeData;
    if (nodeData.nodeId) {
      const attendantNode = await AttendantNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (attendantNode) {
        attendantConfig = {
          ...nodeData,
          assignmentType: attendantNode.assignmentType,
          assignedUserId: attendantNode.assignedUserId,
          queueId: attendantNode.queueId,
          timeoutSeconds: attendantNode.timeoutSeconds,
          endFlowFlag: attendantNode.endFlowFlag
        };
      }
    }
    
    const whatsapp = await Whatsapp.findByPk(whatsappIdToUse);
    
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
    
    // Buscar a fila se especificada
    let queue = null;
    if (attendantConfig.queueId) {
      queue = await Queue.findByPk(attendantConfig.queueId);
    }
    
    // Se for atribuição manual e tiver um usuário especificado
    if (attendantConfig.assignmentType === 'manual' && attendantConfig.assignedUserId) {
      const user = await User.findByPk(attendantConfig.assignedUserId);
      
      if (!user) {
        throw new AppError("Usuário atendente não encontrado");
      }
      
      // Obter instância do bot
      const wbot = await getWbot(whatsappIdToUse);
      
      // Verificar se o usuário está online
      if (!user.online) {
        // Enviar status de digitando
        await SendPresenceStatus(
          wbot,
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
        );
        
        // Enviar mensagem informando que o atendente não está disponível
        const notAvailableMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: "O atendente selecionado não está disponível no momento. Por favor, aguarde até que alguém possa lhe atender."
          }
        );
        
        // Verificar e registrar a mensagem no sistema
        await verifyMessage(notAvailableMessage, ticket, contact);
        
        // Colocar o ticket na fila se especificada, mesmo que o atendente esteja offline
        if (queue) {
          await UpdateTicketService({
            ticketData: { 
              status: "pending",
              userId: null,
              queueId: queue.id 
            },
            ticketId: ticket.id,
            companyId: ticket.companyId
          });
        }
      } else {
        // Atualizar o ticket usando o serviço apropriado
        await UpdateTicketService({
          ticketData: { 
            status: "open",
            userId: user.id,
            queueId: queue ? queue.id : ticket.queueId,
            flowExecutionId: null,
            flowExecution: null,
            appointmentMode: false,
            useIntegration: false,
            integrationId: null,
            chatbot: false,
            amountUsedBotQueues: 0,
          },
          ticketId: ticket.id,
          companyId: ticket.companyId
        });
        
        // Enviar status de digitando
        await SendPresenceStatus(
          wbot,
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
        );
        
        // Mensagem personalizada com informação da fila
        let welcomeText = `Você agora está sendo atendido por ${user.name}.`;
        if (queue) {
          welcomeText += ` Você está na fila "${queue.name}".`;
        }
        welcomeText += " Como posso ajudar?";
        
        // Enviar mensagem informando que o atendente assumiu a conversa
        const welcomeMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: welcomeText
          }
        );
        
        // Verificar e registrar a mensagem no sistema
        await verifyMessage(welcomeMessage, ticket, contact);
      }
    } else if (attendantConfig.assignmentType === 'auto') {
      // Determinar a fila para atribuição automática
      const queueId = queue ? queue.id : ticket.queueId;
      
      // Atualizar o ticket para pendente
      await UpdateTicketService({
        ticketData: { 
          status: "pending", 
          userId: null,
          queueId,
          flowExecutionId: null,
          flowExecution: null,
          appointmentMode: false,
          useIntegration: false,
          integrationId: null,
          chatbot: false,
          amountUsedBotQueues: 0,
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
      
      // Mensagem personalizada com informação da fila
      let pendingText = "Sua solicitação foi recebida.";
      if (queue) {
        pendingText += ` Você está na fila "${queue.name}".`;
      }
      pendingText += " Um atendente entrará em contato em breve.";
      
      // Enviar mensagem informando que a solicitação foi recebida
      //const pendingMessage = await wbot.sendMessage(
      //  `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      //  {
      //    text: pendingText
      //  }
      //);
      
      // Verificar e registrar a mensagem no sistema
      //await verifyMessage(pendingMessage, ticket, contact);
    }
    
    // Notificar via socket para atualização da interface
    const io = getIO();
    io.to(`company-${companyId}-notification`).emit("ticket", {
      action: "update",
      ticket
    });
    
    logger.info(`Nó de atendente executado com sucesso para contato ${contact.id}`);
    
    // Atualizar a execução
    const execution = await FlowBuilderExecution.findByPk(flowExecutionId);
    if (execution) {
      // Atualizar as variáveis com informação do ticket
      const updatedVariables = {
        ...execution.variables,
        __ticket: {
          id: ticket.id,
          status: ticket.status,
          userId: ticket.userId,
          queueId: ticket.queueId,
          flowExecutionId: ticket.flowExecutionId,
          flowExecution: ticket.flowExecution,
          appointmentMode: ticket.appointmentMode,
          useIntegration: ticket.useIntegration,
          integrationId: ticket.integrationId,
          chatbot: ticket.chatbot,
          amountUsedBotQueues: ticket.amountUsedBotQueues,
        }
      };
      
      await execution.update({
        variables: updatedVariables
      });

      await execution.reload();
    }
    
    // Se a flag endFlowFlag estiver true, retornar false para encerrar o fluxo
    return !attendantConfig.endFlowFlag;
  } catch (error) {
    logger.error(`Erro ao executar nó de atendente: ${error.message}`);
    throw error;
  }
};

export default ExecuteAttendantNodeService;