// services/FlowBuilderService/ExecuteInactivityNodeService.ts
import { logger } from "../../utils/logger";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import InactivityNode from "../../models/InactivityNode";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import AppError from "../../errors/AppError";

interface ExecuteInactivityNodeRequest {
  nodeData: any;
  execution: FlowBuilderExecution;
  ticket: Ticket;
  contact: Contact;
  whatsappId: number;
}

interface InactivityNodeResult {
  path: string;
  action: string;
  success: boolean;
  errorMessage?: string;
}

const ExecuteInactivityNodeService = async ({
  nodeData,
  execution,
  ticket,
  contact,
  whatsappId
}: ExecuteInactivityNodeRequest): Promise<InactivityNodeResult> => {
  try {
    logger.info(`[FLOWBUILDER] Executando nó de inatividade para execução ${execution.id}`);
    
    // Buscar configuração específica do nó no banco de dados se existir nodeId
    let inactivityConfig = nodeData?.inactivityConfig || {};
    
    if (nodeData?.nodeId) {
      logger.info(`[FLOWBUILDER] Buscando configuração do nó de inatividade ${nodeData.nodeId}`);
      
      const inactivityNode = await InactivityNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId: execution.companyId
        },
        include: [
          {
            model: Queue,
            as: 'transferQueue',
            attributes: ['id', 'name', 'color']
          }
        ]
      });
      
      if (inactivityNode) {
        logger.info(`[FLOWBUILDER] Configuração encontrada no banco para nó ${nodeData.nodeId}`);
        inactivityConfig = {
          ...inactivityConfig,
          timeoutMinutes: Math.floor(inactivityNode.timeout / 60), // Converter segundos para minutos
          warningTimeoutMinutes: Math.floor((inactivityNode.warningInterval || 60) / 60),
          maxWarnings: inactivityNode.maxWarnings || 2,
          action: inactivityNode.action || 'warning',
          warningMessage: inactivityNode.warningMessage,
          endMessage: inactivityNode.endMessage,
          transferQueueId: inactivityNode.transferQueueId,
          transferMessage: 'Transferindo você para um atendente devido à inatividade.',
          reengageMessage: 'Vamos tentar novamente! Como posso ajudá-lo?',
          useGlobalSettings: false,
          enableCustomTimeout: true,
          detectInactivityOn: 'all'
        };
      }
    }
    
    // Validar configuração baseada na ação
    const validationResult = await validateInactivityConfig(inactivityConfig, execution.companyId);
    
    if (!validationResult.isValid) {
      logger.warn(`[FLOWBUILDER] Configuração inválida para nó de inatividade: ${validationResult.errorMessage}`);
      
      // Retornar erro de configuração
      return {
        path: "timeout",
        action: "config_error",
        success: false,
        errorMessage: validationResult.errorMessage
      };
    }
    
    // Aplicar configuração de inatividade na execução
    const updatedVariables = {
      ...execution.variables,
      __inactivityConfig: {
        timeoutMinutes: inactivityConfig.timeoutMinutes || 5,
        warningTimeoutMinutes: inactivityConfig.warningTimeoutMinutes || 3,
        maxWarnings: inactivityConfig.maxWarnings || 2,
        action: inactivityConfig.action || 'warning',
        warningMessage: inactivityConfig.warningMessage || 'Você ainda está aí? Por favor, responda para continuar.',
        endMessage: inactivityConfig.endMessage || 'Conversa encerrada por inatividade.',
        reengageMessage: inactivityConfig.reengageMessage || 'Vamos tentar novamente! Como posso ajudá-lo?',
        transferQueueId: inactivityConfig.transferQueueId,
        transferMessage: inactivityConfig.transferMessage || 'Transferindo você para um atendente devido à inatividade.',
        useGlobalSettings: inactivityConfig.useGlobalSettings !== false,
        enableCustomTimeout: inactivityConfig.enableCustomTimeout || false,
        detectInactivityOn: inactivityConfig.detectInactivityOn || 'all'
      },
      __inactivityConfigApplied: true,
      __inactivityConfigAppliedAt: new Date().toISOString()
    };
    
    // Atualizar execução com nova configuração
    await execution.update({
      variables: updatedVariables,
      lastInteractionAt: new Date(), // Resetar timestamp para começar monitoramento
      inactivityStatus: 'active', // Garantir que está no estado ativo
      inactivityWarningsSent: 0, // Resetar contador de avisos
      lastWarningAt: null // Limpar último aviso
    });
    
    logger.info(`[FLOWBUILDER] Configuração de inatividade aplicada com sucesso à execução ${execution.id}`);
    logger.info(`[FLOWBUILDER] Ação configurada: ${inactivityConfig.action}, Timeout: ${inactivityConfig.timeoutMinutes}min`);
    
    // Determinar qual caminho seguir baseado na configuração aplicada
    const isDefaultConfig = inactivityConfig.useGlobalSettings !== false && 
                           !inactivityConfig.enableCustomTimeout &&
                           inactivityConfig.action === 'warning';
    
    if (isDefaultConfig) {
      // Configuração padrão - seguir fluxo normal
      return {
        path: "default",
        action: "default_config",
        success: true
      };
    } else {
      // Configuração personalizada aplicada - seguir caminho de configuração aplicada
      return {
        path: "action-executed",
        action: "config_applied",
        success: true
      };
    }
    
  } catch (error) {
    logger.error(`[FLOWBUILDER] Erro ao executar nó de inatividade: ${error.message}`);
    logger.error(`[FLOWBUILDER] Stack trace: ${error.stack}`);
    
    // Em caso de erro, seguir pelo caminho de timeout/erro
    return {
      path: "timeout",
      action: "execution_error",
      success: false,
      errorMessage: error.message
    };
  }
};

// Função auxiliar para validar configuração de inatividade
const validateInactivityConfig = async (
  config: any, 
  companyId: number
): Promise<{ isValid: boolean; errorMessage?: string }> => {
  try {
    // Validar timeouts
    if (config.timeoutMinutes && (config.timeoutMinutes < 1 || config.timeoutMinutes > 60)) {
      return {
        isValid: false,
        errorMessage: "Timeout deve estar entre 1 e 60 minutos"
      };
    }
    
    if (config.warningTimeoutMinutes && config.timeoutMinutes && 
        config.warningTimeoutMinutes >= config.timeoutMinutes) {
      return {
        isValid: false,
        errorMessage: "Timeout de aviso deve ser menor que o timeout principal"
      };
    }
    
    // Validar número máximo de avisos
    if (config.maxWarnings && (config.maxWarnings < 1 || config.maxWarnings > 5)) {
      return {
        isValid: false,
        errorMessage: "Máximo de avisos deve estar entre 1 e 5"
      };
    }
    
    // Validar ação de transferência
    if (config.action === 'transfer' && config.transferQueueId) {
      const queue = await Queue.findOne({
        where: { 
          id: config.transferQueueId, 
          companyId 
        }
      });
      
      if (!queue) {
        return {
          isValid: false,
          errorMessage: "Fila de transferência não encontrada ou não pertence à empresa"
        };
      }
    }
    
    // Validar ação de transferência sem fila
    if (config.action === 'transfer' && !config.transferQueueId) {
      return {
        isValid: false,
        errorMessage: "Ação de transferência requer uma fila de destino"
      };
    }
    
    // Validar mensagens obrigatórias
    if (config.action === 'warning' && !config.warningMessage?.trim()) {
      return {
        isValid: false,
        errorMessage: "Mensagem de aviso é obrigatória para ação de aviso"
      };
    }
    
    if (config.action === 'end' && !config.endMessage?.trim()) {
      logger.warn(`[FLOWBUILDER] Mensagem de encerramento não definida, usando padrão`);
    }
    
    return { isValid: true };
    
  } catch (error) {
    logger.error(`[FLOWBUILDER] Erro ao validar configuração de inatividade: ${error.message}`);
    return {
      isValid: false,
      errorMessage: `Erro na validação: ${error.message}`
    };
  }
};

export default ExecuteInactivityNodeService;