import AppError from "../../errors/AppError";
import axios, { AxiosRequestConfig, Method, AxiosResponse, AxiosError } from "axios";
import { logger } from "../../utils/logger";

interface TestWebhookRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | string | number | boolean | null;
  timeout?: number;
  companyId: number;
}

interface TestWebhookResponse {
  success: boolean;
  status?: number;
  data?: unknown;
  headers?: Record<string, string>;
  message?: string;
}

const TestWebhookNodeService = async ({
  url,
  method,
  headers,
  body,
  timeout = 10000,
  companyId
}: TestWebhookRequest): Promise<TestWebhookResponse> => {
  try {
    // Validar URL
    if (!url) {
      throw new AppError("URL é obrigatória");
    }

    try {
      new URL(url);
    } catch (e) {
      throw new AppError("URL inválida");
    }

    // Validar método
    const validMethods: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const upperMethod = method.toUpperCase() as Method;
    
    if (!validMethods.includes(upperMethod)) {
      throw new AppError("Método HTTP inválido");
    }

    // Validar se URL não aponta para localhost ou IPs internos
    const urlObj = new URL(url);
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(urlObj.hostname)) {
      throw new AppError("Chamadas para localhost ou IPs internos não são permitidas");
    }

    // Preparar configuração da requisição
    const config: AxiosRequestConfig = {
      method: upperMethod,
      url,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlowBuilder/1.0',
        ...(headers || {})
      },
      timeout,
      validateStatus: (status) => status < 500 // Aceitar status até 499
    };

    // Adicionar body se não for GET
    if (config.method !== 'GET' && body) {
      config.data = body;
    }

    logger.info(`[TestWebhook] Testando webhook - Método: ${config.method}, URL: ${url}`);

    // Fazer a requisição
    const response: AxiosResponse = await axios(config);

    logger.info(`[TestWebhook] Resposta recebida - Status: ${response.status}`);

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>
    };

  } catch (error) {
    const err = error as Error | AxiosError;
    logger.error(`[TestWebhook] Erro ao testar webhook: ${err.message}`);
    
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // Erro de resposta do servidor
        return {
          success: false,
          status: err.response.status,
          message: `Erro ${err.response.status}: ${err.response.statusText}`,
          data: err.response.data,
          headers: err.response.headers as Record<string, string>
        };
      } else if (err.request) {
        // Requisição foi feita mas não houve resposta
        return {
          success: false,
          message: "Sem resposta do servidor. Verifique se a URL está acessível.",
          data: null,
          headers: null
        };
      }
    }
    
    // Erro ao configurar a requisição ou outro tipo de erro
    return {
      success: false,
      message: err.message || "Erro ao configurar requisição",
      data: null,
      headers: null
    };
  }
};

export default TestWebhookNodeService;