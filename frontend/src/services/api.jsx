import axios from 'axios';
import axiosRetry from 'axios-retry';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const TIMEOUT = 30000; // Reduzido para 30 segundos
const MAX_RETRIES = 3;

const isProduction = process.env.NODE_ENV === 'production';

const createAxiosInstance = (options = {}) => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    ...options,
  });

  // Configuração de retry
  axiosRetry(instance, {
    retries: MAX_RETRIES,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      // Não fazer retry em erros CORS ou problemas de conexão
      if (error.message && error.message.includes('Network Error')) {
        console.error('Possível erro de CORS ou conexão:', error);
        return false;
      }
      
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
             error.response?.status === 429;
    },
    onRetry: (retryCount, error, requestConfig) => {
      console.warn(`Tentativa ${retryCount}/${MAX_RETRIES} para ${requestConfig.url}. Erro: ${error.message}`);
    }
  });

  // Interceptor para lidar com respostas
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('Erro de autenticação: Token inválido ou expirado.');
            break;
          case 403:
            console.error('Acesso negado: Você não tem permissão para este recurso.');
            break;
          case 500:
            console.error('Erro no servidor:', error.response.data?.message || 'Erro interno do servidor');
            break;
          default:
            console.error(`Erro ${error.response.status}:`, error.response.data);
        }
      } else if (error.request) {
        if (error.code === 'ECONNABORTED') {
          console.error(`Timeout excedido (${TIMEOUT}ms):`, error.config.url);
        } else {
          console.error('Sem resposta do servidor. Possíveis causas: CORS, servidor indisponível, problemas de rede.');
        }
      } else {
        console.error('Erro na configuração da requisição:', error.message);
      }

      // Logging em produção
      if (isProduction) {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Criar a instância base sem modificações de token
export const openApi = createAxiosInstance();

// Criar a instância principal com tratamento de token
export const api = createAxiosInstance({ withCredentials: true });

// Adicionar interceptor APENAS para a instância api (não para openApi)
api.interceptors.request.use(
  (config) => {
    // Formatação de token apenas para a instância api
    if (config.headers.Authorization && typeof config.headers.Authorization === 'string') {
      const authHeader = config.headers.Authorization.trim();
      
      // Validar formato do token apenas se estiver presente
      if (authHeader && !authHeader.startsWith('Bearer ') && !authHeader.startsWith('bearer ')) {
        config.headers.Authorization = `Bearer ${authHeader}`;
        console.log('Token corrigido para formato Bearer');
      }
    }
    
    // Log da requisição
    if (!isProduction) {
      console.log(`Enviando requisição: ${config.method?.toUpperCase()} ${config.url}`);
      
      // Log dos dados enviados (sem informações sensíveis)
      if (config.data && !(config.data instanceof FormData)) {
        console.log('Dados enviados:', config.data);
      } else if (config.data instanceof FormData) {
        console.log('Enviando FormData (conteúdo não exibido)');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Erro ao preparar requisição:', error);
    return Promise.reject(error);
  }
);

// Configurações específicas do ambiente de desenvolvimento
if (!isProduction) {
  // Helper para debug de erros
  window.debugApiError = (error) => {
    if (!error) return 'Nenhum erro fornecido';
    
    return {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        timeout: error.config.timeout
      } : 'Configuração não disponível'
    };
  };
  
  console.info('API debugger disponível como window.debugApiError(error)');
}

export default api;