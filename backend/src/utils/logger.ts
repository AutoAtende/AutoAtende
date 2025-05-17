/**
 * @file logger.ts
 * @description Configuração centralizada de logging para o sistema AutoAtende
 * 
 * Este módulo configura e exporta uma instância do logger Pino personalizada para
 * o ambiente de desenvolvimento e produção do AutoAtende. O logger implementa:
 * - Formatação amigável em desenvolvimento com pino-pretty
 * - Log para arquivo em ambiente de produção
 * - Redação de informações sensíveis (senhas, tokens)
 * - Serialização padrão de erros
 * - Timestamp formatado no fuso horário brasileiro
 * - Captura de contexto estruturado com child loggers
 */

import pino from 'pino';
import { format } from 'date-fns-tz';
import { join } from 'path';
import fs from 'fs';

// Constantes de configuração
const ENV = {
  /** Ambiente atual da aplicação */
  NODE_ENV: process.env.NODE_ENV || 'development',
  /** Nível de log configurado (debug, info, warn, error, fatal) */
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  /** Diretório para armazenamento de logs */
  LOG_DIR: process.env.LOG_DIR || join(__dirname, 'logs'),
  /** Formato de timestamp personalizado */
  TIMESTAMP_FORMAT: 'dd-MM-yyyy HH:mm:ss',
  /** Timezone para formatação de data/hora */
  TIMEZONE: 'America/Sao_Paulo'
};

/**
 * Verifica se estamos em ambiente de produção
 */
const isProduction = ENV.NODE_ENV === 'production';

/**
 * Garante que o diretório de logs existe em produção
 */
if (isProduction && !fs.existsSync(ENV.LOG_DIR)) {
  fs.mkdirSync(ENV.LOG_DIR, { recursive: true });
}

/**
 * Função de timestamp personalizada para o formato brasileiro
 * @returns {string} String formatada para o timestamp do log
 */
const customTimestamp = () => 
  `,"time":"${format(new Date(), ENV.TIMESTAMP_FORMAT, { timeZone: ENV.TIMEZONE })}"`;

/**
 * Caminhos de dados sensíveis que serão redactados nos logs
 */
const sensitiveDataPaths = [
  'password', 
  '*.password', 
  '*.token', 
  'access_token',
  'body.password',
  'headers.authorization',
  'user.senha',
  'data.senhaTemporaria'
];

/**
 * Configurações para o transport usado em desenvolvimento (pino-pretty)
 */
const devTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    levelFirst: true,
    translateTime: `SYS:${ENV.TIMESTAMP_FORMAT}`,
    ignore: "pid,hostname",
    messageFormat: '{if reqId} [ReqID: {reqId}]{end} {msg}'
  }
};

/**
 * Configurações para o transport usado em produção (file)
 */
const prodTransport = {
  targets: [
    {
      // Log completo para arquivo
      target: 'pino/file',
      options: {
        destination: join(ENV.LOG_DIR, 'app.log'),
        mkdir: true
      },
      level: 'info'
    },
    {
      // Log separado apenas para erros
      target: 'pino/file',
      options: {
        destination: join(ENV.LOG_DIR, 'error.log'),
        mkdir: true
      },
      level: 'error'
    }
  ]
};

/**
 * Configurações do Pino logger
 */
const loggerOptions: pino.LoggerOptions = {
  level: ENV.LOG_LEVEL,
  // Usamos o transport condicional aqui - correto
  transport: isProduction ? prodTransport : devTransport,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  },
  redact: {
    paths: sensitiveDataPaths,
    censor: '**REDACTED**'
  },
  timestamp: customTimestamp,
  // Mixin para adicionar informações extras em cada log
  mixin(_context, _level) {
    return { 
      app: 'AutoAtende',
      env: ENV.NODE_ENV,
    };
  }
};

/**
 * Instância principal do logger
 */
const logger = pino(loggerOptions);

// Log inicial quando o logger é criado
logger.info({
  message: 'Logger inicializado',
  level: ENV.LOG_LEVEL,
  production: isProduction
});

/**
 * Criador de child loggers específicos para módulos
 * @param module Nome do módulo que está utilizando o logger
 * @param context Informações adicionais de contexto (opcional)
 * @returns Child logger configurado com o contexto do módulo 
 */
export function createModuleLogger(module: string, context: Record<string, any> = {}) {
  return logger.child({
    module,
    ...context
  });
}

/**
 * Helper para criar loggers específicos para requisições HTTP
 * @param req Objeto de requisição express
 * @returns Child logger com contexto da requisição
 */
export function createRequestLogger(req: any) {
  const reqId = req.id || req.headers['x-request-id'] || generateRequestId();
  
  return logger.child({
    reqId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress
  });
}

/**
 * Gera um ID único para requisições
 * @returns String com ID de requisição
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export { logger };