import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import WebhookNode from "../../models/WebhookNode";
import { logger } from "../../utils/logger";
import axios from "axios";
import crypto from "crypto";

interface ExecuteWebhookNodeParams {
  nodeData: {
    nodeId?: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    retries?: number;
    secretKey?: string;
    variableName?: string;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  executionId: number;
}

const ExecuteWebhookNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  executionId
}: ExecuteWebhookNodeParams): Promise<void> => {
  try {
    logger.info(`Executando nó webhook para ticket ${ticket.id}`);
    
    // Buscar configuração específica do webhook no banco de dados
    let webhookConfig = nodeData;
    
    if (nodeData.nodeId) {
      const webhookNode = await WebhookNode.findOne({
        where: {
          nodeId: nodeData.nodeId,
          companyId
        }
      });
      
      if (webhookNode) {
        webhookConfig = {
          url: webhookNode.url,
          method: webhookNode.method,
          headers: webhookNode.headers,
          body: webhookNode.body,
          timeout: webhookNode.timeout,
          retries: webhookNode.retries,
          secretKey: webhookNode.secretKey,
          variableName: webhookNode.variableName
        };
      }
    }
    
    if (!webhookConfig.url) {
      throw new AppError("URL do webhook não fornecida");
    }
    
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(webhookConfig.method)) {
      throw new AppError("Método HTTP inválido");
    }
    
    // Validar a URL para evitar chamadas a endpoints internos
    const urlObj = new URL(webhookConfig.url);
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(urlObj.hostname)) {
      throw new AppError("Chamadas para localhost ou IPs internos não são permitidas");
    }
    
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }
    
    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'FlowBuilder/1.0',
      ...(webhookConfig.headers || {})
    };
    
    // Preparar dados que serão enviados com substituição de variáveis
    const processVariables = (data: any): any => {
      if (typeof data === 'string') {
        // Substituir variáveis no formato {{variableName}}
        return data.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
          const trimmedVarName = varName.trim();
          return execution.variables[trimmedVarName] !== undefined 
            ? execution.variables[trimmedVarName] 
            : match;
        });
      }
      
      if (Array.isArray(data)) {
        return data.map(item => processVariables(item));
      }
      
      if (data !== null && typeof data === 'object') {
        const processed = {};
        for (const [key, value] of Object.entries(data)) {
          processed[key] = processVariables(value);
        }
        return processed;
      }
      
      return data;
    };
    
    // Preparar payload com variáveis substituídas
    const payload = processVariables({
      ticket: {
        id: ticket.id,
        status: ticket.status,
        queueId: ticket.queueId,
        userId: ticket.userId,
        companyId: ticket.companyId,
        whatsappId: ticket.whatsappId,
        lastMessage: ticket.lastMessage
      },
      contact: {
        id: contact.id,
        name: contact.name,
        number: contact.number,
        email: contact.email
      },
      flowExecution: {
        id: execution.id,
        flowId: execution.flowId,
        variables: execution.variables
      },
      company: {
        id: companyId
      },
      ...(webhookConfig.body || {})
    });
    
    // Se houver chave secreta, adicionar assinatura HMAC
    if (webhookConfig.secretKey) {
      const signature = crypto
        .createHmac('sha256', webhookConfig.secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      headers['X-Signature'] = signature;
    }
    
    // Configurar tempo limite e número de tentativas
    const timeout = webhookConfig.timeout || 10000; // Padrão: 10 segundos
    const maxRetries = webhookConfig.retries || 3; // Padrão: 3 tentativas
    
    // Executar o webhook com retry
    let response;
    let error;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        logger.info(`[Webhook] Tentativa ${retryCount + 1} de ${maxRetries} - URL: ${webhookConfig.url}`);
        
        response = await axios({
          method: webhookConfig.method,
          url: webhookConfig.url,
          headers,
          data: webhookConfig.method !== 'GET' ? payload : undefined,
          params: webhookConfig.method === 'GET' ? payload : undefined,
          timeout,
          validateStatus: (status) => status < 500 // Aceitar status até 499
        });
        
        logger.info(`[Webhook] Sucesso - Status: ${response.status}`);
        break; // Se a requisição for bem-sucedida, sair do loop
      } catch (err) {
        error = err;
        retryCount++;
        
        logger.warn(`[Webhook] Falha na tentativa ${retryCount} - Erro: ${err.message}`);
        
        // Aguardar antes de tentar novamente
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
    
    if (error && !response) {
      logger.error(`Erro ao executar webhook após ${maxRetries} tentativas:`, error);
      throw new AppError(`Erro ao executar webhook: ${error.message}`);
    }
    
    logger.info(`Webhook executado com sucesso para ticket ${ticket.id}`);
    
    // Se houver variável para armazenar o resultado e uma resposta válida, atualizar as variáveis
    if (webhookConfig.variableName && response && response.data) {
      // Limitar tamanho da resposta para evitar sobrecarregar a variável
      let responseData = response.data;
      const MAX_RESPONSE_SIZE = 100 * 1024; // 100KB
      
      if (typeof responseData === 'object') {
        const jsonString = JSON.stringify(responseData);
        if (jsonString.length > MAX_RESPONSE_SIZE) {
          responseData = {
            _truncated: true,
            _size: jsonString.length,
            _message: "Resposta muito grande foi truncada"
          };
        }
      } else if (typeof responseData === 'string' && responseData.length > MAX_RESPONSE_SIZE) {
        responseData = responseData.substring(0, MAX_RESPONSE_SIZE) + '... (truncado)';
      }
      
      const updatedVariables = {
        ...execution.variables,
        [webhookConfig.variableName]: responseData,
        [`${webhookConfig.variableName}_status`]: response.status,
        [`${webhookConfig.variableName}_headers`]: response.headers
      };
      
      await execution.update({
        variables: updatedVariables
      });
      
      logger.info(`Resposta do webhook armazenada na variável ${webhookConfig.variableName}`);
    }
  } catch (error) {
    logger.error(`Erro ao executar nó webhook: ${error.message}`);
    
    // Armazenar o erro na variável se especificada
    if (nodeData.variableName) {
      const execution = await FlowBuilderExecution.findByPk(executionId);
      if (execution) {
        const updatedVariables = {
          ...execution.variables,
          [nodeData.variableName]: null,
          [`${nodeData.variableName}_error`]: error.message,
          [`${nodeData.variableName}_status`]: error.response?.status || 'error'
        };
        
        await execution.update({
          variables: updatedVariables
        });
      }
    }
    
    throw error;
  }
};

export default ExecuteWebhookNodeService;