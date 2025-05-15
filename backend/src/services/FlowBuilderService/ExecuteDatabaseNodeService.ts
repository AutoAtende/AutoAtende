import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import ExecuteDatabaseOperationService from "./ExecuteDatabaseOperationService";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import ShowTicketService from "../TicketServices/ShowTicketService";
import ShowContactService from "../ContactServices/ShowContactService";
import FinishFlowService from "./FinishFlowService";

interface ExecuteDatabaseNodeParams {
  nodeData: {
    nodeId: string;
    isTerminal?: boolean; // Propriedade para indicar se o nó é terminal
  };
  ticketId: number;
  contactId: number;
  companyId: number;
  executionId: number;
  whatsappId?: number;
}

const ExecuteDatabaseNodeService = async ({
  nodeData,
  ticketId,
  contactId,
  companyId,
  executionId,
  whatsappId
}: ExecuteDatabaseNodeParams): Promise<boolean> => {
  try {
    logger.info(`Executando nó de banco de dados para ticket ${ticketId}`);
    
    // Obter ticket e contato
    const ticket = await ShowTicketService(ticketId, companyId);
    const contact = await ShowContactService(contactId, companyId);
    
    if (!ticket || !contact) {
      throw new AppError("Ticket ou contato não encontrado");
    }
    
    if (!nodeData.nodeId) {
      throw new AppError("ID do nó não fornecido", 400);
    }
    
    // Executar a operação no banco de dados
    const result = await ExecuteDatabaseOperationService({
      nodeId: nodeData.nodeId,
      companyId,
      executionId,
      variables: {} // Variáveis da execução são obtidas dentro do serviço
    });
    
    logger.info(`Nó de banco de dados executado com sucesso para ticket ${ticketId}`);
    
    // Se o nó for configurado como terminal, finalizar o fluxo
    if (nodeData.isTerminal) {
      // Usar o serviço unificado FinishFlowService para finalizar o fluxo
      await FinishFlowService({
        ticketId,
        companyId,
        executionId,
        ticketStatus: "pending", // Status padrão ao finalizar
        flowStatus: "completed"
      });
      
      // Retorna false para indicar que o fluxo não deve continuar
      return false;
    }
    
    // Retorna true se a operação foi bem-sucedida e o fluxo deve continuar
    return result.success;
  } catch (error) {
    logger.error(`Erro ao executar nó de banco de dados: ${error.message}`);
    throw error;
  }
};

export default ExecuteDatabaseNodeService;