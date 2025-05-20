/**
 * Converte uma string para um formato slug adequado para URLs
 * @param str String a ser convertida
 * @returns String no formato slug
 */
export const slugify = (str) => {
  if (!str) return '';
  
  return str
    .toString()
    .normalize('NFD') // Normaliza acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Espaços para hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres não alfanuméricos
    .replace(/--+/g, '-') // Remove hífens múltiplos
    .replace(/^-+/, '') // Remove hífens do início
    .replace(/-+$/, ''); // Remove hífens do final
};

/**
 * Sanitiza conteúdo HTML para prevenir XSS, preservando tags e elementos comuns usados no Bootstrap
 * @param html Conteúdo HTML a ser sanitizado
 * @returns HTML sanitizado
 */
export const sanitizeHtml = (html: string) => {
  if (!html) return '';
  
  return html;
};
/**
 * Gera uma string aleatória para uso em identificadores únicos
 * @param length Comprimento da string (padrão: 8)
 * @returns String aleatória
 */
export const generateRandomString = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Gera um slug único baseado em um título
 * @param title Título a ser convertido em slug
 * @returns Slug único
 */
export const generateUniqueSlug = (title) => {
  if (!title) return generateRandomString(8);
  
  const baseSlug = slugify(title);
  const uniqueId = Date.now().toString(36).slice(-4);
  
  return baseSlug ? `${baseSlug}-${uniqueId}` : uniqueId;
};

/**
 * Valida um número de telefone no formato internacional
 * @param phone Número de telefone a ser validado
 * @returns Boolean indicando se o formato é válido
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Permite formatos como +55 11 99999-9999 ou +551199999999
  const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Formata um número de telefone aplicando máscara
 * @param phone Número de telefone a ser formatado
 * @returns Número formatado
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove tudo exceto números
  const numbers = phone.replace(/\D/g, '');
  
  // Se for número internacional
  if (numbers.length > 10) {
    // Adiciona o código do país com +
    const countryCode = numbers.slice(0, 2);
    const areaCode = numbers.slice(2, 4);
    const firstPart = numbers.slice(4, 9);
    const lastPart = numbers.slice(9, 13);
    
    if (lastPart.length > 0) {
      return `+${countryCode} ${areaCode} ${firstPart}-${lastPart}`;
    }
    return `+${countryCode} ${areaCode} ${firstPart}`;
  }
  
  // Formato nacional
  const areaCode = numbers.slice(0, 2);
  const firstPart = numbers.slice(2, 7);
  const lastPart = numbers.slice(7, 11);
  
  if (lastPart.length > 0) {
    return `(${areaCode}) ${firstPart}-${lastPart}`;
  }
  return `(${areaCode}) ${firstPart}`;
};