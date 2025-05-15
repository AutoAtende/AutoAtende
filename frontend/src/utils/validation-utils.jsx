/**
 * Utilitários para validação de dados em condições do fluxo
 */

/**
 * Valida se uma string é um CPF válido
 * @param {string} cpf - O CPF a ser validado
 * @returns {boolean} - true se o CPF for válido, false caso contrário
 */
export const isValidCPF = (cpf) => {
    if (!cpf) return false;
    
    // Remove caracteres especiais
    cpf = cpf.replace(/[^\d]+/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };
  
  /**
   * Valida se uma string é um CNPJ válido
   * @param {string} cnpj - O CNPJ a ser validado
   * @returns {boolean} - true se o CNPJ for válido, false caso contrário
   */
  export const isValidCNPJ = (cnpj) => {
    if (!cnpj) return false;
    
    // Remove caracteres especiais
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Validação do segundo dígito verificador
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  };
  
  /**
   * Valida se uma string é um email válido
   * @param {string} email - O email a ser validado
   * @returns {boolean} - true se o email for válido, false caso contrário
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    
    // Regex para validação de email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(email);
  };
  
  /**
   * Função para avaliar condições no runtime do fluxo
   * Esta função deve ser usada no executor do fluxo para avaliar os operadores personalizados
   * @param {*} value - O valor a ser avaliado
   * @param {string} operator - O operador da condição
   * @param {*} comparisonValue - O valor de comparação (pode ser ignorado para validadores)
   * @returns {boolean} - Resultado da avaliação da condição
   */
  export const evaluateCondition = (value, operator, comparisonValue) => {
    // Converter para string para manipulação consistente
    const stringValue = String(value || '');
    
    switch(operator) {
      case '==':
        return stringValue === String(comparisonValue);
      case '!=':
        return stringValue !== String(comparisonValue);
      case '>':
        return Number(value) > Number(comparisonValue);
      case '<':
        return Number(value) < Number(comparisonValue);
      case '>=':
        return Number(value) >= Number(comparisonValue);
      case '<=':
        return Number(value) <= Number(comparisonValue);
      case 'contains':
        return stringValue.includes(String(comparisonValue));
      case 'startsWith':
        return stringValue.startsWith(String(comparisonValue));
      case 'endsWith':
        return stringValue.endsWith(String(comparisonValue));
      case 'regex':
        try {
          return new RegExp(comparisonValue).test(stringValue);
        } catch (e) {
          console.error('Expressão regular inválida:', e);
          return false;
        }
      case 'validCPF':
        return isValidCPF(stringValue);
      case 'validCNPJ':
        return isValidCNPJ(stringValue);
      case 'validEmail':
        return isValidEmail(stringValue);
      default:
        return false;
    }
  };