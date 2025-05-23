// services/FlowBuilderService/ReengagementService.ts
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import { verifyMessage } from "../WbotServices/MessageListener/Verifiers/VerifyMessage";
import UpdateFlowVariableService from "./UpdateFlowVariableService";
import ExecuteFlowBuilderService from "./ExecuteFlowBuilderService";

interface ReengagementStrategy {
  priority: number;
  condition: (execution: FlowBuilderExecution) => boolean;
  execute: (execution: FlowBuilderExecution, ticket: Ticket) => Promise<boolean>;
}

class ReengagementService {
  private static strategies: ReengagementStrategy[] = [
    // Estratégia para interações de menu
    {
      priority: 1,
      condition: (execution) => {
        return execution.variables && 
               execution.variables.__awaitingResponse && 
               execution.variables.__responseValidation && 
               execution.variables.__responseValidation.inputType === 'menu';
      },
      execute: async (execution, ticket) => {
        const options = execution.variables.__responseValidation.options || [];
        if (!options.length) return false;
        
        // Reenviar o menu com um lembrete
        let message = "Parece que você não respondeu. Aqui estão as opções novamente:\n\n";
        
        options.forEach((option, index) => {
          message += `${index + 1}. ${option.text}\n`;
        });
        
        message += "\nPor favor, digite o número correspondente à sua escolha.";
        
        await ReengagementService.sendMessage(ticket, message);
        
        return true;
      }
    },
    
    // Estratégia para interações de perguntas
    {
      priority: 2,
      condition: (execution) => {
        return execution.variables && 
               execution.variables.__awaitingResponse && 
               execution.variables.__awaitingResponseFor;
      },
      execute: async (execution, ticket) => {
        const variableName = execution.variables.__awaitingResponseFor;
        
        // Extrair a pergunta original das variáveis ou usar um texto genérico
        let originalQuestion = "Por favor, responda à pergunta anterior.";
        
        if (execution.variables.__lastMessage) {
          originalQuestion = `Você ainda não respondeu: "${execution.variables.__lastMessage}"`;
        }
        
        await ReengagementService.sendMessage(ticket, originalQuestion);
        
        return true;
      }
    },
    
    // Estratégia para nó de fluxo travado
    {
      priority: 3,
      condition: (execution) => Boolean(execution.currentNodeId),
      execute: async (execution, ticket) => {
        try {
          // Tentar resetar variáveis de estado travadas
          if (execution.variables.__awaitingResponse) {
            await UpdateFlowVariableService({
              executionId: execution.id,
              variable: "__awaitingResponse",
              value: false,
              companyId: execution.companyId
            });
            
            await UpdateFlowVariableService({
              executionId: execution.id,
              variable: "__awaitingResponseFor",
              value: null,
              companyId: execution.companyId
            });
            
            await UpdateFlowVariableService({
              executionId: execution.id,
              variable: "__responseValidation",
              value: null,
              companyId: execution.companyId
            });
            
            // Adicionar variável de reengajamento
            await UpdateFlowVariableService({
              executionId: execution.id,
              variable: "__reengaged",
              value: true,
              companyId: execution.companyId
            });
            
            await ReengagementService.sendMessage(
              ticket,
              "Vamos continuar de onde paramos."
            );
            
            // Reiniciar execução do fluxo
            await ExecuteFlowBuilderService({
              flowId: execution.flowId,
              contactId: execution.contactId,
              wbotId: ticket.whatsappId,
              companyId: execution.companyId,
              initialNodeId: execution.currentNodeId,
              whatsappId: ticket.whatsappId,
              ticketId: ticket.id
            });
            
            return true;
          }
        } catch (error) {
          logger.error(`[Reengagement] Erro ao tentar reiniciar fluxo: ${error.message}`);
        }
        
        return false;
      }
    },
    
    // Estratégia genérica - último recurso
    {
      priority: 10,
      condition: () => true,
      execute: async (execution, ticket) => {
        await ReengagementService.sendMessage(
          ticket,
          "Percebemos que você ficou um tempo sem interagir. Podemos ajudar com algo?"
        );
        
        return true;
      }
    }
  ];
  
  /**
   * Tenta reengajar um usuário inativo usando a melhor estratégia disponível
   */
  public static async attemptReengagement(
    execution: FlowBuilderExecution,
    ticket: Ticket
  ): Promise<boolean> {
    try {
      logger.info(`[Reengagement] Tentando reengajar usuário para execução ${execution.id}`);
      
      // Ordenar estratégias por prioridade
      const sortedStrategies = [...this.strategies].sort((a, b) => a.priority - b.priority);
      
      // Encontrar e executar a primeira estratégia aplicável
      for (const strategy of sortedStrategies) {
        if (strategy.condition(execution)) {
          logger.info(`[Reengagement] Usando estratégia de prioridade ${strategy.priority}`);
          const success = await strategy.execute(execution, ticket);
          
          if (success) {
            // Marcar timestamp da tentativa de reengajamento
            await execution.update({
              lastWarningAt: new Date(),
              inactivityStatus: 'reengaging'
            });
            
            // Registrar métrica de reengajamento
            await this.registerReengagementMetric(execution, ticket, true);
            
            logger.info(`[Reengagement] Tentativa de reengajamento bem-sucedida`);
            return true;
          }
        }
      }
      
      // Se chegou aqui, nenhuma estratégia funcionou
      logger.warn(`[Reengagement] Nenhuma estratégia de reengajamento aplicável encontrada`);
      await this.registerReengagementMetric(execution, ticket, false);
      return false;
      
    } catch (error) {
      logger.error(`[Reengagement] Erro ao tentar reengajar: ${error.message}`);
      await this.registerReengagementMetric(execution, ticket, false);
      return false;
    }
  }
  
  /**
   * Registra métricas de tentativas de reengajamento para análise
   */
  private static async registerReengagementMetric(
    execution: FlowBuilderExecution,
    ticket: Ticket,
    success: boolean
  ): Promise<void> {
    try {
      // Atualizar variáveis da execução com informações de reengajamento
      const updatedVariables = {
        ...execution.variables,
        __reengagementAttempts: (execution.variables.__reengagementAttempts || 0) + 1,
        __lastReengagementAt: new Date().toISOString(),
        __lastReengagementSuccess: success
      };
      
      await execution.update({ variables: updatedVariables });
      
    } catch (error) {
      logger.error(`[Reengagement] Erro ao registrar métrica: ${error.message}`);
    }
  }
  
/**
   * Envia uma mensagem para o usuário
   */
private static async sendMessage(ticket: Ticket, message: string): Promise<void> {
  try {
    const wbot = await getWbot(ticket.whatsappId);
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      { text: formatBody(message, ticket) }
    );
    
    // Registrar a mensagem no sistema
    await verifyMessage(sentMessage, ticket, ticket.contact);
    
  } catch (error) {
    logger.error(`[Reengagement] Erro ao enviar mensagem: ${error.message}`);
    throw error;
  }
}
}

export default ReengagementService;