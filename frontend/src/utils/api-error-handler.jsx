import { toast } from '../helpers/toast';

/**
 * Função para tratamento padronizado de erros de API
 * 
 * @param {Error} error - Objeto de erro capturado
 * @param {string} defaultMessage - Mensagem padrão caso não consiga extrair do erro
 * @param {boolean} showToast - Se deve mostrar toast com mensagem de erro
 * @returns {string} Mensagem de erro formatada
 */
export const handleApiError = (err, defaultMessage = 'Erro na requisição', showToast = true) => {
  let errorMessage = defaultMessage;

  if (err.response) {
    // Erro com resposta do servidor
    if (err.response.data && err.response.data.error) {
      errorMessage = err.response.data.error;
    } else if (err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    } else {
      errorMessage = `${defaultMessage} (${err.response.status})`;
    }
  } else if (err.request) {
    // Erro sem resposta do servidor
    errorMessage = 'Não foi possível se comunicar com o servidor. Verifique sua conexão.';
  } else {
    // Erro de configuração
    errorMessage = err.message || defaultMessage;
  }

  // Log do erro para depuração
  console.error('API Error:', err);

  // Se o parâmetro showToast for true, mostrar mensagem toast
  if (showToast && window.toast && typeof window.toast.error === 'function') {
    window.toast.error(errorMessage);
  }

  return errorMessage;
};

/**
 * Função para validação de URLs
 * 
 * @param {string} url - URL a ser validada
 * @returns {string|null} Mensagem de erro ou null se válida
 */
export const validateUrl = (url) => {
  if (!url) return "URL é obrigatória";
  try {
    new URL(url);
    return null;
  } catch (e) {
    return "URL inválida";
  }
};

/**
 * Função para validação de nomes de variáveis
 * 
 * @param {string} variableName - Nome da variável a ser validada
 * @returns {string|null} Mensagem de erro ou null se válida
 */
export const validateVariableName = (name) => {
  if (!name) return "Nome da variável é obrigatório";
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
    return "Nome da variável deve começar com letra e conter apenas letras, números e underscore";
  }
  return null;
};

/**
 * Função para formatar erros em formato adequado para campos do Material-UI
 * 
 * @param {Object} errors - Objeto com erros de validação
 * @param {string} fieldName - Nome do campo
 * @returns {Object} Objeto com propriedades error e helperText
 */
export const getFieldErrorProps = (errors, fieldName) => {
  if (!errors || !errors[fieldName]) {
    return { error: false, helperText: '' };
  }
  
  return {
    error: true,
    helperText: errors[fieldName]
  };
};