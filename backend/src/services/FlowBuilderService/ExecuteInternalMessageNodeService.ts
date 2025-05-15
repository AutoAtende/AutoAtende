import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import InternalMessageNode from "../../models/InternalMessageNode";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import { logger } from "../../utils/logger";
import { v4 as uuidv4 } from "uuid";
import formatBody from "../../helpers/Mustache";
import { getIO } from "../../libs/socket";
import { notifyUpdate } from "../TicketServices/UpdateTicketService";
import CreateMessageService from "../MessageServices/CreateMessageService";

interface ExecuteInternalMessageNodeParams {
  nodeData: {
    nodeId?: string;
    message?: string;
    selectedVariable?: string;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  executionId: number;
}

const ExecuteInternalMessageNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  executionId
}: ExecuteInternalMessageNodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó de mensagem interna para ticket ${ticket.id}, nodeId: ${nodeData.nodeId}`);
    
    // Buscar configuração específica do nó no banco de dados
    let internalMessageConfig = nodeData;
    if (nodeData.nodeId) {
      const internalMessageNode = await InternalMessageNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      logger.info(`Configuração do nó ${nodeData.nodeId} encontrada: ${internalMessageNode ? 'Sim' : 'Não'}`);
      
      if (internalMessageNode) {
        internalMessageConfig = {
          ...nodeData,
          message: internalMessageNode.message,
          selectedVariable: internalMessageNode.selectedVariable
        };
        
        logger.info(`Mensagem carregada do banco: "${internalMessageNode.message?.substring(0, 30)}..."`);
      }
    }
    
    // Verificar se há mensagem configurada
    if (!internalMessageConfig.message) {
      logger.warn(`Nó de mensagem interna ${nodeData.nodeId} não possui mensagem configurada`);
      return;
    }
    
    // Buscar a execução atual do fluxo para ter acesso às variáveis
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }
    
    // Formatar a mensagem substituindo variáveis pelos valores correspondentes
    let formattedMessage = internalMessageConfig.message;
    
    // Usar o ticket para formatar mensagem com Mustache
    formattedMessage = formatBody(formattedMessage, ticket);

          const messageId = uuidv4();
    
    // Criar e salvar a mensagem interna no banco de dado
          const message = await CreateMessageService({
            messageData: {
              id: messageId,
              ticketId: Number(ticket.id),
              body: formattedMessage || "",
              contactId: ticket.contactId, // SEMPRE vinculado ao contato
              fromMe: true,
              read: true,
              internalMessage: true, // Flag para controle visual
            },
            ticket,
            companyId,
            internalMessage: true
          });
        
    
        const io = getIO();
        notifyUpdate(io, ticket, ticket.id, companyId);

    
    logger.info(`Mensagem interna criada com sucesso para o ticket ${ticket.id}`);
    
    // Atualizar as variáveis da execução com a referência à mensagem interna
    if (execution) {
      const updatedVariables = {
        ...execution.variables,
        __lastInternalMessage: {
          id: message.id,
          body: formattedMessage,
          timestamp: Date.now()
        }
      };
      
      await execution.update({
        variables: updatedVariables
      });

      await execution.reload();
    }
  } catch (error) {
    logger.error(`Erro ao executar nó de mensagem interna: ${error.message}`);
    throw error;
  }
};

export default ExecuteInternalMessageNodeService;