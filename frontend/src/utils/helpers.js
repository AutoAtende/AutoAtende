// utils.js

/**
 * Retorna o primeiro elemento de um array.
 * @param {Array} arr Array de entrada.
 * @returns {*} O primeiro elemento ou undefined se o array estiver vazio.
 */
export const head = (arr) => arr?.[0];

/**
 * Verifica se o valor é null ou undefined.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for null ou undefined, caso contrário, false.
 */
export const isNil = (value) => value === null || value === undefined;

/**
 * Verifica se o valor é null.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for null, caso contrário, false.
 */
export const isNull = (value) => value === null;

/**
 * Remove acentos de uma string.
 * @param {string} str String de entrada.
 * @returns {string} String sem acentos.
 */
export const deburr = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Verifica se o valor é um array.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for um array, caso contrário, false.
 */
export const isArray = (value) => Array.isArray(value);

/**
 * Verifica se o valor é um objeto (e não um array ou null).
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for um objeto, caso contrário, false.
 */
export const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Verifica se o valor está vazio (array, objeto, string, Map ou Set).
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor estiver vazio, caso contrário, false.
 */
export const isEmpty = (value) => {
  if (isArray(value) || typeof value === 'string') return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return true; // Outros tipos são considerados vazios
};

/**
 * Divide um array em pedaços menores.
 * @param {Array} arr Array de entrada.
 * @param {number} size Tamanho de cada pedaço.
 * @returns {Array} Array de arrays com os pedaços.
 */
export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

/**
 * Achata um array em um nível (ou múltiplos níveis, se especificado).
 * @param {Array} arr Array de entrada.
 * @param {number} depth Profundidade de achatamento (padrão: 1).
 * @returns {Array} Array achatado.
 */
export const flatten = (arr, depth = 1) => arr.flat(depth);

/**
 * Cria uma função que executa após um tempo de espera.
 * @param {Function} func Função a ser executada.
 * @param {number} wait Tempo de espera em milissegundos.
 * @returns {Function} Função debounced.
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Retorna a interseção de arrays (valores presentes em todos os arrays).
 * @param {...Array} arrays Arrays de entrada.
 * @returns {Array} Array com os valores comuns.
 */
export const intersection = (...arrays) => {
  const [first, ...rest] = arrays;
  return first.filter((item) => rest.every((arr) => arr.includes(item)));
};

/**
 * Soma os valores de um array com base em uma função de iteração.
 * @param {Array} arr Array de entrada.
 * @param {Function} iteratee Função que retorna o valor a ser somado.
 * @returns {number} Soma dos valores.
 */
export const sumBy = (arr, iteratee) =>
  arr.reduce((sum, item) => sum + iteratee(item), 0);

/**
 * Remove valores duplicados de um array.
 * @param {Array} arr Array de entrada.
 * @returns {Array} Array com valores únicos.
 */
export const uniq = (arr) => [...new Set(arr)];

/**
 * Verifica se um objeto possui uma propriedade.
 * @param {Object} obj Objeto de entrada.
 * @param {string} path Caminho da propriedade.
 * @returns {boolean} true se a propriedade existir, caso contrário, false.
 */
export const has = (obj, path) =>
  Object.prototype.hasOwnProperty.call(obj, path);

/**
 * Verifica se um valor é uma string.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for uma string, caso contrário, false.
 */
export const isString = (value) => typeof value === 'string';

/**
 * Verifica se um valor é um número.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for um número, caso contrário, false.
 */
export const isNumber = (value) => typeof value === 'number' && !isNaN(value);

/**
 * Verifica se um valor é uma função.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for uma função, caso contrário, false.
 */
export const isFunction = (value) => typeof value === 'function';

/**
 * Verifica se um valor é um booleano.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for um booleano, caso contrário, false.
 */
export const isBoolean = (value) => typeof value === 'boolean';

/**
 * Verifica se um valor é uma data válida.
 * @param {*} value Valor a ser verificado.
 * @returns {boolean} true se o valor for uma data válida, caso contrário, false.
 */
export const isDate = (value) =>
  value instanceof Date && !isNaN(value.getTime());

/**
 * Converte um valor para número.
 * @param {*} value Valor a ser convertido.
 * @returns {number} Número convertido ou NaN se a conversão falhar.
 */
export const toNumber = (value) => {
  if (isNumber(value)) return value;
  if (isString(value)) return parseFloat(value);
  return NaN;
};

/**
 * Converte um valor para string.
 * @param {*} value Valor a ser convertido.
 * @returns {string} String convertida.
 */
export const toString = (value) => String(value);

/**
 * Converte um valor para booleano.
 * @param {*} value Valor a ser convertido.
 * @returns {boolean} Booleano convertido.
 */
export const toBoolean = (value) => Boolean(value);

/**
 * Converte um valor para data.
 * @param {*} value Valor a ser convertido.
 * @returns {Date|null} Data convertida ou null se a conversão falhar.
 */
export const toDate = (value) => {
  if (isDate(value)) return value;
  if (isString(value) || isNumber(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
};

/**
 * Retorna o valor padrão se o valor for null ou undefined.
 * @param {*} value Valor a ser verificado.
 * @param {*} defaultValue Valor padrão.
 * @returns {*} O valor original ou o valor padrão.
 */
export const defaultTo = (value, defaultValue) =>
  isNil(value) ? defaultValue : value;

/**
 * Retorna o valor de uma propriedade de um objeto ou um valor padrão.
 * @param {Object} obj Objeto de entrada.
 * @param {string} path Caminho da propriedade.
 * @param {*} defaultValue Valor padrão.
 * @returns {*} O valor da propriedade ou o valor padrão.
 */
export const get = (obj, path, defaultValue) => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (!isObject(result) || !has(result, key)) return defaultValue;
    result = result[key];
  }
  return result ?? defaultValue;
};

/**
 * Recupera valores de um objeto ou array com base em caminhos.
 * @param {Object|Array} object Objeto ou array de entrada.
 * @param {...string|Array} paths Caminhos para acessar os valores.
 * @returns {Array} Array com os valores correspondentes.
 */
export const at = (object, ...paths) => {
  if (paths.length === 1 && Array.isArray(paths[0])) {
    paths = paths[0];
  }

  return paths.map((path) => {
    if (typeof path === 'string') {
      return path.split('.').reduce((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
          return acc[key];
        }
        return undefined;
      }, object);
    }
    if (typeof path === 'number') {
      return object[path];
    }
    return undefined;
  });
};