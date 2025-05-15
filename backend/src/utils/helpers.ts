import { Error } from "./errors";

/**
 * Adiciona um timeout a uma Promise
 * @param promise Promise a ser executada
 * @param timeoutMs Tempo máximo de execução em millisegundos
 * @param errorMessage Mensagem de erro customizada (opcional)
 */
export const promiseTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Operation timed out"
): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error("timeout", errorMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle);
    throw error;
  }
};

/**
 * Delay/Sleep por um determinado tempo
 * @param ms Tempo em millisegundos
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retorna um número aleatório entre min e max
 * @param min Valor mínimo
 * @param max Valor máximo
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Retorna um valor com retry em caso de erro
 * @param fn Função a ser executada
 * @param retries Número de tentativas
 * @param retryDelay Delay entre tentativas em millisegundos
 * @param exponential Se true, aplica backoff exponencial
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  retryDelay: number = 1000,
  exponential: boolean = true
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    const delay = exponential 
      ? retryDelay * Math.pow(2, retries - 1)
      : retryDelay;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(fn, retries - 1, retryDelay, exponential);
  }
};

/**
 * Cria um novo objeto com todas as propriedades do objeto original, exceto as especificadas
 * @param obj Objeto de entrada
 * @param keys Chaves a serem omitidas (array de strings)
 * @returns Novo objeto sem as propriedades especificadas
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

/**
 * Sanitiza um número de telefone
 * @param phone Número do telefone
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

/**
 * Formata um número de telefone para o formato do WhatsApp
 * @param phone Número do telefone
 */
export const formatWhatsAppPhone = (phone: string): string => {
  const sanitized = sanitizePhone(phone);
  if (sanitized.length === 13) {
    // Formato internacional completo
    return sanitized;
  }
  // Adiciona código do país (Brasil)
  return `55${sanitized}`;
};

/**
 * Verifica se uma string é um JSON válido
 * @param str String a ser verificada
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Remove caracteres especiais de uma string
 * @param str String a ser limpa
 */
export const removeSpecialCharacters = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9]/g, "");
};

/**
 * Gera um ID único baseado em timestamp e random
 * Útil para IDs temporários no frontend
 */
export const generateTempId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Verifica se um objeto está vazio
 * @param obj Objeto a ser verificado
 */
export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Formata bytes para uma string legível
 * @param bytes Número de bytes
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Trunca um texto com ellipsis
 * @param text Texto a ser truncado
 * @param length Tamanho máximo
 */
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Máscara para números de telefone
 * @param phone Número do telefone
 */
export const phoneMask = (phone: string): string => {
  const numbers = phone.replace(/\D/g, "");
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  return phone;
};

// utils.ts

/**
 * Retorna o primeiro elemento de um array.
 * @param arr Array de entrada.
 * @returns O primeiro elemento ou undefined se o array estiver vazio.
 */
export const head = <T>(arr: T[]): T | undefined => arr?.[0];

/**
 * Verifica se o valor é null ou undefined.
 * @param value Valor a ser verificado.
 * @returns true se o valor for null ou undefined, caso contrário, false.
 */
export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

/**
 * Verifica se o valor é null.
 * @param value Valor a ser verificado.
 * @returns true se o valor for null, caso contrário, false.
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Remove acentos de uma string.
 * @param str String de entrada.
 * @returns String sem acentos.
 */
export const deburr = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Verifica se o valor é um array.
 * @param value Valor a ser verificado.
 * @returns true se o valor for um array, caso contrário, false.
 */
export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

/**
 * Verifica se o valor é um objeto (e não um array ou null).
 * @param value Valor a ser verificado.
 * @returns true se o valor for um objeto, caso contrário, false.
 */
export const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Verifica se o valor está vazio (array, objeto, string, Map ou Set).
 * @param value Valor a ser verificado.
 * @returns true se o valor estiver vazio, caso contrário, false.
 */
export const isEmpty = (value: unknown): boolean => {
  if (isArray(value) || typeof value === 'string') return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return true; // Outros tipos são considerados vazios
};

/**
 * Divide um array em pedaços menores.
 * @param arr Array de entrada.
 * @param size Tamanho de cada pedaço.
 * @returns Array de arrays com os pedaços.
 */
export const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

/**
 * Achata um array em um nível (ou múltiplos níveis, se especificado).
 * @param arr Array de entrada.
 * @param depth Profundidade de achatamento (padrão: 1).
 * @returns Array achatado.
 */
export const flatten = <T>(arr: T[], depth = 1): T[] => {
  return arr.flat(depth) as T[];
};

/**
 * Cria uma função que executa após um tempo de espera.
 * @param func Função a ser executada.
 * @param wait Tempo de espera em milissegundos.
 * @returns Função debounced.
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Retorna a interseção de arrays (valores presentes em todos os arrays).
 * @param arrays Arrays de entrada.
 * @returns Array com os valores comuns.
 */
export const intersection = <T>(...arrays: T[][]): T[] => {
  const [first, ...rest] = arrays;
  return first.filter((item) => rest.every((arr) => arr.includes(item)));
};

/**
 * Soma os valores de um array com base em uma função de iteração.
 * @param arr Array de entrada.
 * @param iteratee Função que retorna o valor a ser somado.
 * @returns Soma dos valores.
 */
export const sumBy = <T>(arr: T[], iteratee: (item: T) => number): number =>
  arr.reduce((sum, item) => sum + iteratee(item), 0);

/**
 * Remove valores duplicados de um array.
 * @param arr Array de entrada.
 * @returns Array com valores únicos.
 */
export const uniq = <T>(arr: T[]): T[] => [...new Set(arr)];

/**
 * Verifica se um objeto possui uma propriedade.
 * @param obj Objeto de entrada.
 * @param path Caminho da propriedade.
 * @returns true se a propriedade existir, caso contrário, false.
 */
export const has = (obj: Record<string, unknown>, path: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, path);

/**
 * Verifica se um valor é uma string.
 * @param value Valor a ser verificado.
 * @returns true se o valor for uma string, caso contrário, false.
 */
export const isString = (value: unknown): value is string =>
  typeof value === 'string';

/**
 * Verifica se um valor é um número.
 * @param value Valor a ser verificado.
 * @returns true se o valor for um número, caso contrário, false.
 */
export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

/**
 * Verifica se um valor é uma função.
 * @param value Valor a ser verificado.
 * @returns true se o valor for uma função, caso contrário, false.
 */
export const isFunction = (value: unknown): value is Function =>
  typeof value === 'function';

/**
 * Verifica se um valor é um booleano.
 * @param value Valor a ser verificado.
 * @returns true se o valor for um booleano, caso contrário, false.
 */
export const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';

/**
 * Verifica se um valor é uma data válida.
 * @param value Valor a ser verificado.
 * @returns true se o valor for uma data válida, caso contrário, false.
 */
export const isDate = (value: unknown): value is Date =>
  value instanceof Date && !isNaN(value.getTime());

/**
 * Converte um valor para número.
 * @param value Valor a ser convertido.
 * @returns Número convertido ou NaN se a conversão falhar.
 */
export const toNumber = (value: unknown): number => {
  if (isNumber(value)) return value;
  if (isString(value)) return parseFloat(value);
  return NaN;
};

/**
 * Converte um valor para string.
 * @param value Valor a ser convertido.
 * @returns String convertida.
 */
export const toString = (value: unknown): string => String(value);

/**
 * Converte um valor para booleano.
 * @param value Valor a ser convertido.
 * @returns Booleano convertido.
 */
export const toBoolean = (value: unknown): boolean => Boolean(value);

/**
 * Converte um valor para data.
 * @param value Valor a ser convertido.
 * @returns Data convertida ou null se a conversão falhar.
 */
export const toDate = (value: unknown): Date | null => {
  if (isDate(value)) return value;
  if (isString(value) || isNumber(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
};

/**
 * Retorna o valor padrão se o valor for null ou undefined.
 * @param value Valor a ser verificado.
 * @param defaultValue Valor padrão.
 * @returns O valor original ou o valor padrão.
 */
export const defaultTo = <T>(value: T, defaultValue: T): T =>
  isNil(value) ? defaultValue : value;

/**
 * Retorna o valor de uma propriedade de um objeto ou um valor padrão.
 * @param obj Objeto de entrada.
 * @param path Caminho da propriedade.
 * @param defaultValue Valor padrão.
 * @returns O valor da propriedade ou o valor padrão.
 */
export const get = (
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown,
): unknown => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (!isObject(result) || !has(result, key)) return defaultValue;
    result = result[key] as Record<string, unknown>;
  }
  return result ?? defaultValue;
};


/**
 * Formata número para uso no WhatsApp (Baileys)
 * @param {string} phoneNumber - Número de telefone
 * @returns {string} - Número formatado sem '+' e com código do país quando necessário
 */
export const formatPhoneForWhatsApp = (phoneNumber: string) => {
  console.log(`Número original: ${phoneNumber}`);
  
  // Remove todos os caracteres não numéricos
  const cleaned = phoneNumber.replace(/\D/g, '');
  console.log(`Número limpo: ${cleaned}`);
  
  // Verifica se já é um número internacional
  const isInternational = /^(?!0|55)\d{1,3}/.test(cleaned);
  console.log(`É internacional? ${isInternational}`);
  
  if (isInternational) {
    console.log(`Retornando número internacional limpo: ${cleaned}`);
    return cleaned;
  }
  
  // Verifica se é um número brasileiro
  const isBrazilianNumber = () => {
    const length = cleaned.length;
    console.log(`Tamanho do número: ${length}`);
    
    // Com 55: 55 + DDD (2) + número (8 ou 9) = 12 ou 13 dígitos
    if (cleaned.startsWith('55')) {
      console.log('Começa com 55 - verificando se tem 12 ou 13 dígitos');
      return length === 12 || length === 13;
    }
    // Sem 55: DDD (2) + número (8 ou 9) = 10 ou 11 dígitos
    console.log('Não começa com 55 - verificando se tem 10 ou 11 dígitos');
    return length === 10 || length === 11;
  };
  
  if (isBrazilianNumber()) {
    console.log('É número brasileiro');
    // Adiciona 55 se não tiver
    if (!cleaned.startsWith('55')) {
      const result = '55' + cleaned;
      console.log(`Adicionando 55: ${result}`);
      return result;
    }
    console.log(`Já tem 55: ${cleaned}`);
    return cleaned; // Já tem 55, retorna como está
  }
  
  console.log(`Não é internacional nem brasileiro - retornando limpo: ${cleaned}`);
  return cleaned;
}