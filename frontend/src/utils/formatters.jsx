/**
 * Formata valores monetários em BRL
 * @param {number} value - Valor a ser formatado
 * @param {Object} options - Opções de formatação
 * @param {boolean} options.compact - Se deve usar formato compacto (ex: 1M, 1K)
 * @param {number} options.decimals - Número de casas decimais
 * @returns {string} - Valor formatado
 */
export const formatCurrency = (value, options = {}) => {
    const {
      compact = false,
      decimals = 2
    } = options;
  
    if (typeof value !== 'number') {
      return 'R$ 0,00';
    }
  
    try {
      if (compact) {
        if (value >= 1000000000) {
          return `R$ ${(value / 1000000000).toFixed(1)}B`;
        }
        if (value >= 1000000) {
          return `R$ ${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
          return `R$ ${(value / 1000).toFixed(1)}K`;
        }
      }
  
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } catch (error) {
      console.error('Error formatting currency:', error);
      return 'R$ 0,00';
    }
  };
  
  /**
   * Formata números com separadores de milhar e opções de formato compacto
   * @param {number} value - Valor a ser formatado
   * @param {Object} options - Opções de formatação
   * @param {boolean} options.compact - Se deve usar formato compacto (ex: 1M, 1K)
   * @param {number} options.decimals - Número de casas decimais
   * @param {string} options.unit - Unidade a ser anexada ao número
   * @returns {string} - Valor formatado
   */
  export const formatNumber = (value, options = {}) => {
    const {
      compact = false,
      decimals = 0,
      unit = ''
    } = options;
  
    if (typeof value !== 'number') {
      return '0';
    }
  
    try {
      if (compact) {
        if (value >= 1000000000) {
          return `${(value / 1000000000).toFixed(1)}B${unit}`;
        }
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M${unit}`;
        }
        if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K${unit}`;
        }
      }
  
      const formatted = value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
  
      return `${formatted}${unit}`;
    } catch (error) {
      console.error('Error formatting number:', error);
      return '0';
    }
  };
  
  /**
   * Formata percentuais
   * @param {number} value - Valor a ser formatado
   * @param {Object} options - Opções de formatação
   * @param {number} options.decimals - Número de casas decimais
   * @returns {string} - Valor formatado
   */
  export const formatPercentage = (value, options = {}) => {
    const { decimals = 1 } = options;
  
    if (typeof value !== 'number') {
      return '0%';
    }
  
    try {
      return `${value.toFixed(decimals)}%`;
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return '0%';
    }
  };
  
  /**
   * Formata tempos em formato legível
   * @param {number} minutes - Minutos a serem formatados
   * @returns {string} - Tempo formatado
   */
  export const formatDuration = (minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) {
      return '0min';
    }
  
    try {
      if (minutes < 60) {
        return `${Math.round(minutes)}min`;
      }
  
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
  
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
  
      return `${hours}h ${remainingMinutes}min`;
    } catch (error) {
      console.error('Error formatting duration:', error);
      return '0min';
    }
  };
  
  export default {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatDuration
  };