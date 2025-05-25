import axios from 'axios';
import axiosRetry from 'axios-retry';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const TIMEOUT = 120000;
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
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
    },
  });

  // Interceptor para lidar com respostas
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('Unauthorized access.');
            break;
          case 403:
            console.error('Forbidden access.');
            break;
          case 500:
            console.error('Internal server error.');
            break;
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // Logging melhorado em produção
      if (isProduction) {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createAxiosInstance({ withCredentials: true });
export const openApi = createAxiosInstance();

// Configurações específicas do ambiente de desenvolvimento
if (!isProduction) {
  const logConfig = (config) => {
    const { method, url, data, headers } = config;
    console.log(`Request: ${method?.toUpperCase()} ${url}`);
    if (data) console.log('Data:', data);
    console.log('Headers:', headers);
    return config;
  };

  api.interceptors.request.use(logConfig);
  openApi.interceptors.request.use(logConfig);

  const logResponse = (response) => {
    console.log(`Response: ${response.status} ${response.config.url}`);
    console.log('Data:', response.data);
    return response;
  };

  api.interceptors.response.use(logResponse);
  openApi.interceptors.response.use(logResponse);
}

export default api;