import axios from "axios";
import { URL } from "url";
import AppError from "../../errors/AppError";

interface TestApiRequestParams {
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  contentType?: string;
  timeout?: number;
  companyId: number;
  authType?: string;
  authUser?: string;
  authPassword?: string;
  authToken?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: string;
}

interface TestApiResponse {
  success: boolean;
  status?: number;
  statusText?: string;
  data?: any;
  headers?: Record<string, string>;
  message?: string;
}

const TestApiRequestService = async ({
  url,
  method,
  headers = {},
  queryParams = {},
  body,
  contentType = "application/json",
  timeout = 10000,
  companyId,
  authType = "none",
  authUser,
  authPassword,
  authToken,
  apiKeyName,
  apiKeyValue,
  apiKeyIn = "header"
}: TestApiRequestParams): Promise<TestApiResponse> => {
  try {
    // Validar a URL
    const urlObj = new URL(url);
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(urlObj.hostname)) {
      throw new AppError("Chamadas para localhost ou IPs internos não são permitidas");
    }

    // Preparar headers
    const requestHeaders: Record<string, string> = { ...headers };

    // Adicionar content-type se não for GET
    if (method !== 'GET' && contentType) {
      requestHeaders['Content-Type'] = contentType;
    }

    // Configurar autenticação
    switch (authType) {
      case 'basic':
        if (authUser && authPassword) {
          const base64Auth = Buffer.from(`${authUser}:${authPassword}`).toString('base64');
          requestHeaders['Authorization'] = `Basic ${base64Auth}`;
        }
        break;
      case 'bearer':
        if (authToken) {
          requestHeaders['Authorization'] = `Bearer ${authToken}`;
        }
        break;
      case 'apiKey':
        if (apiKeyName && apiKeyValue) {
          if (apiKeyIn === 'header') {
            requestHeaders[apiKeyName] = apiKeyValue;
          }
        }
        break;
    }

    // Preparar URL com query params
    let requestUrl = url;
    if (Object.keys(queryParams).length > 0) {
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      requestUrl += requestUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
    }

    // Se for apiKey em query e estiver configurado
    if (authType === 'apiKey' && apiKeyIn === 'query' && apiKeyName && apiKeyValue) {
      const apiKeyParam = `${encodeURIComponent(apiKeyName)}=${encodeURIComponent(apiKeyValue)}`;
      requestUrl += requestUrl.includes('?') ? `&${apiKeyParam}` : `?${apiKeyParam}`;
    }

    // Preparar o corpo da requisição
    let requestBody = body;
    if (method !== 'GET' && contentType === 'application/json' && body) {
      try {
        requestBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (error) {
        // Manter como está se não for possível fazer parse
      }
    }

    // Configuração da requisição
    const requestConfig: any = {
      method,
      url: requestUrl,
      headers: requestHeaders,
      timeout,
      validateStatus: () => true // Aceitar qualquer status para tratarmos manualmente
    };

    // Adicionar corpo se não for GET
    if (method !== 'GET' && requestBody) {
      requestConfig.data = requestBody;
    }

    // Executar a requisição
    const response = await axios(requestConfig);

    // Retornar resultado formatado
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers as Record<string, string>
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Erro desconhecido',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    };
  }
};

export default TestApiRequestService;