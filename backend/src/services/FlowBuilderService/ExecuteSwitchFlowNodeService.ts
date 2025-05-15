import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import FlowBuilder from "../../models/FlowBuilder";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import SwitchFlowNode from "../../models/SwitchFlowNode"; // Importar o modelo
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import ExecuteFlowBuilderService from "./ExecuteFlowBuilderService";

interface ExecuteSwitchFlowNodeParams {
  nodeData: {
    nodeId?: string;
    targetFlowId: number;
    transferVariables: boolean;
  };
  contact: Contact;
  ticket: Ticket;
  companyId: number;
  executionId: number;
}

const ExecuteSwitchFlowNodeService = async ({
  nodeData,
  contact,
  ticket,
  companyId,
  executionId
}: ExecuteSwitchFlowNodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó de troca de fluxo para ticket ${ticket.id}`);
    
    // Buscar configuração específica do nó de troca no banco de dados
    let switchConfig = nodeData;
    if (nodeData.nodeId) {
      const switchNode = await SwitchFlowNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (switchNode) {
        switchConfig = {
          ...nodeData,
          targetFlowId: switchNode.targetFlowId,
          transferVariables: switchNode.transferVariables
        };
      }
    }
    
    if (!switchConfig.targetFlowId) {
      throw new AppError("ID do fluxo destino não fornecido");
    }
    
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }

    // Verificar se o fluxo não está redirecionando para si mesmo (loop)
    if (execution.flowId === switchConfig.targetFlowId) {
      logger.warn(`Tentativa de redirecionamento para o próprio fluxo (${execution.flowId})`);
      // Opcionalmente lançar um erro
      // throw new AppError("Não é permitido redirecionar para o mesmo fluxo");
    }
    
    // Verificar se o fluxo destino existe
    const targetFlow = await FlowBuilder.findOne({
      where: { id: switchConfig.targetFlowId, companyId }
    });
    
    if (!targetFlow) {
      throw new AppError("Fluxo destino não encontrado");
    }
    
    // Encerrar a execução atual
    await execution.update({
      status: "completed",
      errorMessage: "Fluxo redirecionado para " + targetFlow.name
    });
    
    logger.info(`Fluxo ${execution.flowId} encerrado, redirecionando para fluxo ${targetFlow.id}`);
    
    // Variáveis iniciais para o novo fluxo
    let initialVariables: Record<string, any> = {};
    
    // Se a transferência de variáveis estiver ativada, copiar variáveis do fluxo atual
    if (switchConfig.transferVariables) {
      // Garantir que execution.variables seja um objeto
      const currentVariables = execution.variables || {};
      
      // Copiar as variáveis, excluindo as de controle interno
      Object.keys(currentVariables).forEach(key => {
        if (!key.startsWith('__')) {
          initialVariables[key] = currentVariables[key];
        }
      });

      // Adicionar informações do fluxo anterior
      initialVariables.__previousFlow = {
        id: execution.flowId,
        executionId: execution.id
      };
    }
    
    // Iniciar o novo fluxo usando o ExecuteFlowBuilderService
    await ExecuteFlowBuilderService({
      flowId: targetFlow.id,
      contactId: contact.id,
      wbotId: ticket.whatsappId,
      companyId,
      initialVariables,
      ticketId: ticket.id // Passar o ticket atual
    });
    
    logger.info(`Nó de troca de fluxo executado com sucesso para ticket ${ticket.id}`);
  } catch (error) {
    logger.error(`Erro ao executar nó de troca de fluxo: ${error.message}`);
    throw error;
  }
};

export default ExecuteSwitchFlowNodeService;