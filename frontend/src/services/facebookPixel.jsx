import ReactPixel from 'react-facebook-pixel';

const options = {
  autoConfig: true,
  debug: process.env.NODE_ENV !== 'production',
};

let initialized = false;

const FacebookPixelService = {
  /**
   * Inicializa o Facebook Pixel com o ID fornecido
   * @param {string} pixelId - ID do Facebook Pixel
   */
  initialize: (pixelId) => {
    if (!pixelId) return;
    
    // Se já inicializado, revoga o consentimento e limpa a instância
    if (initialized) {
      ReactPixel.revokeConsent();
    }
    
    // Inicializa o pixel com o ID da empresa
    ReactPixel.init(pixelId, {}, options);
    ReactPixel.grantConsent();
    initialized = true;
    
    // Registra pageview inicial
    ReactPixel.pageView();
    
    // Para conformidade com GDPR, poderia ser ajustado para depender de outra configuração
    // ReactPixel.revokeConsent(); // Descomentar se quiser cumprir GDPR por padrão
  },
  
  /**
   * Rastreia evento padrão do Facebook
   * @param {string} eventName - Nome do evento padrão do FB
   * @param {Object} data - Dados adicionais do evento
   */
  trackEvent: (eventName, data = {}) => {
    if (initialized) {
      ReactPixel.track(eventName, data);
    }
  },
  
  /**
   * Rastreia evento customizado
   * @param {string} eventName - Nome do evento customizado
   * @param {Object} data - Dados adicionais do evento
   */
  trackCustomEvent: (eventName, data = {}) => {
    if (initialized) {
      ReactPixel.trackCustom(eventName, data);
    }
  },
  
  /**
   * Registra uma visualização de página
   */
  trackPageView: () => {
    if (initialized) {
      ReactPixel.pageView();
    }
  },
  
  /**
   * Verifica se o pixel está inicializado
   * @returns {boolean} - Status de inicialização
   */
  isInitialized: () => initialized,
  
  /**
   * Concede consentimento para rastreamento (GDPR)
   */
  grantConsent: () => {
    if (initialized) {
      ReactPixel.grantConsent();
    }
  },
  
  /**
   * Revoga consentimento para rastreamento (GDPR)
   */
  revokeConsent: () => {
    if (initialized) {
      ReactPixel.revokeConsent();
    }
  },
};

export default FacebookPixelService;