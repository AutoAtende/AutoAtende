import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import FlowBuilderExecution from "../../models/FlowBuilderExecution";
import ApiNode from "../../models/ApiNode";
import { logger } from "../../utils/logger";
import axios from "axios";
import crypto from "crypto";
import { URL } from "url";

interface ExecuteApiNodeParams {
  nodeData: {
    id?: number;
    nodeId?: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
    contentType?: string;
    timeout?: number;
    retries?: number;
    responseVariable?: string;
    statusVariable?: string;
    successCondition?: string;
    successExpression?: string;
    useResponseFilter?: boolean;
    responseFilterPath?: string;
    parseVariables?: boolean;
    paramsFromVariables?: boolean;
    paramsVariable?: string;
    storeErrorResponse?: boolean;
    authType?: string;
    authUser?: string;
    authPassword?: string;
    authToken?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyIn?: string;
  };
  ticket: Ticket;
  contact: Contact;
  companyId: number;
  executionId: number;
}

const ExecuteApiNodeService = async ({
  nodeData,
  ticket,
  contact,
  companyId,
  executionId
}: ExecuteApiNodeParams): Promise<{
  success: boolean;
  variables: Record<string, any>;
}> => {
  try {
    logger.info(`Executando nó API para ticket ${ticket.id}`);
    
    if (!nodeData.url) {
      throw new AppError("URL da API não fornecida");
    }
    
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(nodeData.method)) {
      throw new AppError("Método HTTP inválido");
    }
    
    // Validar a URL para evitar chamadas a endpoints internos
    const urlObj = new URL(nodeData.url);
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(urlObj.hostname)) {
      throw new AppError("Chamadas para localhost ou IPs internos não são permitidas");
    }
    
    // Buscar configuração específica do nó API no banco de dados se nodeId for fornecido
    const apiNode = await ApiNode.findOne({
      where: {
        nodeId: nodeData.nodeId || nodeData.id, // Adiciona suporte para 'id' também
        companyId
      }
    });
    
    // Se existir o nó no banco, utilizar suas configurações
    const apiConfig = apiNode ? {
      url: apiNode.url,
      method: apiNode.method,
      headers: apiNode.headers,
      queryParams: apiNode.queryParams,
      body: apiNode.body,
      contentType: apiNode.contentType,
      timeout: apiNode.timeout,
      retries: apiNode.retries,
      responseVariable: apiNode.responseVariable,
      statusVariable: apiNode.statusVariable,
      successCondition: apiNode.successCondition,
      successExpression: apiNode.successExpression,
      useResponseFilter: apiNode.useResponseFilter,
      responseFilterPath: apiNode.responseFilterPath,
      parseVariables: apiNode.parseVariables,
      paramsFromVariables: apiNode.paramsFromVariables,
      paramsVariable: apiNode.paramsVariable,
      storeErrorResponse: apiNode.storeErrorResponse,
      authType: apiNode.authType,
      authUser: apiNode.authUser,
      authPassword: apiNode.authPassword,
      authToken: apiNode.authToken,
      apiKeyName: apiNode.apiKeyName,
      apiKeyValue: apiNode.apiKeyValue,
      apiKeyIn: apiNode.apiKeyIn
    } : nodeData;
    
    // Obter execução atual do fluxo
    const execution = await FlowBuilderExecution.findOne({
      where: { id: executionId, companyId, status: "active" }
    });
    
    if (!execution) {
      throw new AppError("Execução de fluxo não encontrada ou não está ativa");
    }
    
    // Preparar URL com parâmetros de query
    let requestUrl = apiConfig.url;
    let combinedQueryParams = { ...apiConfig.queryParams };
    
    // Adicionar parâmetros da variável se configurado
    if (apiConfig.paramsFromVariables && apiConfig.paramsVariable && execution.variables[apiConfig.paramsVariable]) {
      try {
        const additionalParams = typeof execution.variables[apiConfig.paramsVariable] === 'object' 
          ? execution.variables[apiConfig.paramsVariable] 
          : JSON.parse(execution.variables[apiConfig.paramsVariable]);
        
        combinedQueryParams = { ...combinedQueryParams, ...additionalParams };
      } catch (error) {
        logger.error(`Erro ao processar parâmetros da variável ${apiConfig.paramsVariable}:`, error);
      }
    }
    
    // Construir a query string
    if (Object.keys(combinedQueryParams).length > 0) {
      const queryString = Object.entries(combinedQueryParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      requestUrl += requestUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
    }
    
    // Preparar headers
    const requestHeaders: Record<string, string> = { 
      ...(apiConfig.headers || {})
    };
    
    // Adicionar content-type se não for GET
    if (apiConfig.method !== 'GET' && apiConfig.contentType) {
      requestHeaders['Content-Type'] = apiConfig.contentType;
    }
    
    // Configurar autenticação
    switch (apiConfig.authType) {
      case 'basic':
        if (apiConfig.authUser && apiConfig.authPassword) {
          const base64Auth = Buffer.from(`${apiConfig.authUser}:${apiConfig.authPassword}`).toString('base64');
          requestHeaders['Authorization'] = `Basic ${base64Auth}`;
        }
        break;
      case 'bearer':
        if (apiConfig.authToken) {
          requestHeaders['Authorization'] = `Bearer ${apiConfig.authToken}`;
        }
        break;
      case 'apiKey':
        if (apiConfig.apiKeyName && apiConfig.apiKeyValue) {
          if (apiConfig.apiKeyIn === 'header') {
            requestHeaders[apiConfig.apiKeyName] = apiConfig.apiKeyValue;
          } else if (apiConfig.apiKeyIn === 'query') {
            // Adicionar à URL se for query parameter
            const apiKeyParam = `${encodeURIComponent(apiConfig.apiKeyName)}=${encodeURIComponent(apiConfig.apiKeyValue)}`;
            requestUrl += requestUrl.includes('?') ? `&${apiKeyParam}` : `?${apiKeyParam}`;
          }
        }
        break;
    }
    
    // Preparar o corpo da requisição com substituição de variáveis
    let requestBody = apiConfig.body;
    
    if (apiConfig.method !== 'GET' && apiConfig.parseVariables && apiConfig.body && typeof apiConfig.body === 'string') {
      // Substituir variáveis no formato ${variável}
      requestBody = apiConfig.body.replace(/\${([^}]+)}/g, (match, variable) => {
        // Adicionar informações do ticket também
        if (variable === 'ticket.id') return ticket.id;
        if (variable === 'ticket.status') return ticket.status;
        if (variable === 'ticket.contactId') return ticket.contactId;
        if (variable === 'contact.name') return contact.name;
        if (variable === 'contact.number') return contact.number;
        
        return execution.variables[variable] !== undefined 
          ? execution.variables[variable] 
          : match;
      });
      
      // Se for JSON, tentar parsear
      if (apiConfig.contentType === 'application/json') {
        try {
          requestBody = JSON.parse(requestBody);
        } catch (error) {
          logger.error('Erro ao parsear corpo JSON com variáveis:', error);
        }
      }
    } else if (apiConfig.method !== 'GET' && apiConfig.contentType === 'application/json' && apiConfig.body) {
      // Para JSON sem substituição de variáveis, ainda precisamos parsear
      try {
        requestBody = typeof apiConfig.body === 'string' ? JSON.parse(apiConfig.body) : apiConfig.body;
      } catch (error) {
        logger.error('Erro ao parsear corpo JSON:', error);
      }
    }
    
    // Configuração da requisição
    const requestConfig = {
      method: apiConfig.method,
      url: requestUrl,
      headers: requestHeaders,
      timeout: apiConfig.timeout || 10000
    };
    
    // Adicionar corpo se não for GET
    if (apiConfig.method !== 'GET' && requestBody) {
      requestConfig['data'] = requestBody;
    }
    
    // Função para realizar a requisição com retries
    const executeRequest = async (retryCount = 0) => {
      try {
        const response = await axios(requestConfig);
        return response;
      } catch (error) {
        if (retryCount < (apiConfig.retries - 1)) {
          // Esperar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return executeRequest(retryCount + 1);
        }
        throw error;
      }
    };
    
    // Executar a requisição
    let response;
    let isSuccess = false;
    let errorObj = null;
    
    try {
      response = await executeRequest();
      
      // Verificar condição de sucesso
      if (apiConfig.successCondition === 'custom' && apiConfig.successExpression) {
        // Avaliar expressão personalizada
        const evalContext = {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers
          }
        };
        
        try {
          // Usar Function em vez de eval para maior segurança e escopo isolado
          isSuccess = new Function('response', `return (${apiConfig.successExpression})`)(evalContext.response);
        } catch (evalError) {
          logger.error('Erro ao avaliar expressão de sucesso:', evalError);
          isSuccess = false;
        }
      } else {
        // Condição padrão: status 2xx
        isSuccess = response.status >= 200 && response.status < 300;
      }
    } catch (error) {
      errorObj = error;
      isSuccess = false;
      
      // Configurar response se houver error.response disponível
      if (error.response && apiConfig.storeErrorResponse) {
        response = error.response;
      }
    }
    
    // Processar e armazenar resultados nas variáveis da sessão
    const updatedVariables = { ...execution.variables };
    
    if (response && apiConfig.responseVariable) {
      let responseData = response.data;
      
      // Aplicar filtro se configurado
      if (apiConfig.useResponseFilter && apiConfig.responseFilterPath && responseData) {
        try {
          // Implementação básica de JSONPath
          const extractValue = (obj, path) => {
            if (!path || !obj) return obj;
            
            // Remover $ inicial se presente
            path = path.startsWith('$.') ? path.substring(2) : path;
            
            const segments = path.split('.');
            let current = obj;
            
            for (const segment of segments) {
              // Verificar se é um acesso de array como items[0]
              const arrayMatch = segment.match(/^(.+)\[(\d+)\]$/);
              
              if (arrayMatch) {
                const arrayName = arrayMatch[1];
                const arrayIndex = parseInt(arrayMatch[2]);
                
                if (!current[arrayName] || !Array.isArray(current[arrayName])) {
                  return undefined;
                }
                
                current = current[arrayName][arrayIndex];
              } else {
                current = current[segment];
              }
              
              if (current === undefined) {
                return undefined;
              }
            }
            
            return current;
          };
          
          const filteredValue = extractValue(responseData, apiConfig.responseFilterPath);
          if (filteredValue !== undefined) {
            responseData = filteredValue;
          }
        } catch (error) {
          logger.error('Erro ao aplicar filtro JSONPath:', error);
        }
      }
      
      // Limitar tamanho da resposta para evitar sobrecarregar a variável
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
      
      updatedVariables[apiConfig.responseVariable] = responseData;
    }
    
    // Armazenar o código de status se configurado
    if (apiConfig.statusVariable) {
      updatedVariables[apiConfig.statusVariable] = response ? response.status : (errorObj?.response?.status || 0);
    }
    
    // Armazenar informação se a operação foi bem-sucedida
    updatedVariables.__lastApiResult = isSuccess;
    
    // Atualizar variáveis na execução
    await execution.update({
      variables: updatedVariables
    });
    
    // Registro de log
    logger.info(`Execução de nó API para ticket ${ticket.id}: ${isSuccess ? 'Sucesso' : 'Falha'} - ${apiConfig.method} ${apiConfig.url}`);
    
    return {
      success: isSuccess,
      variables: updatedVariables
    };
  } catch (error) {
    logger.error(`Erro ao executar nó API: ${error.message}`);
    throw error;
  }
};

export default ExecuteApiNodeService;