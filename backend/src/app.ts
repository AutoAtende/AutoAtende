import "./database";
import "reflect-metadata";
import "express-async-errors";
import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import {logger} from "./utils/logger";
import {getMessageQueue} from "./queues";

if (process.env.DEBUG_TRACE == 'false') {
  console.trace = function () {
    return;
  }
}

const app = express();
app.set('trust proxy', true);

process.on("uncaughtException", err => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
});

app.set("queues", {
  getMessageQueue: () => {
    try {
      return getMessageQueue();
    } catch (error) {
      logger.warn("Fila de mensagens não disponível ainda, será inicializada posteriormente");
      return null;
    }
  }
});

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Cache-Control',
      'Pragma',
      'Expires'
    ],
  })
);

app.use(compression()); 
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));
app.use(cookieParser());

// CRÍTICO: Middleware personalizado para arquivos estáticos ANTES de qualquer rota
app.use("/public", (req: Request, res: Response, next: NextFunction) => {
  try {
    // Headers CORS específicos para arquivos estáticos
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    res.header('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
    
    // Headers de segurança
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    // Responder OPTIONS imediatamente
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Construir caminho completo do arquivo
    const filePath = path.join(uploadConfig.directory, req.path);
    
    // Log da tentativa de acesso
    logger.debug(`[Static] Tentativa de acesso: ${req.method} ${req.originalUrl} -> ${filePath}`);
    
    // Verificar se o arquivo existe
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      logger.info(`[Static] Arquivo encontrado: ${req.originalUrl}`);
      
      // Definir tipo de conteúdo baseado na extensão
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.txt': 'text/plain',
        '.json': 'application/json'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.header('Content-Type', contentType);
      
      // Servir o arquivo
      return res.sendFile(filePath);
    } else {
      logger.warn(`[Static] Arquivo não encontrado: ${req.originalUrl} -> ${filePath}`);
      return res.status(404).json({
        error: 'Arquivo não encontrado',
        path: req.originalUrl
      });
    }
  } catch (error) {
    logger.error(`[Static] Erro ao servir arquivo estático ${req.originalUrl}:`, error);
    return res.status(500).json({
      error: 'Erro interno do servidor ao servir arquivo estático'
    });
  }
});

// Middleware para capturar erros de multer
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    logger.error(`Erro de Multer: ${err.code} - ${err.message}`);
    
    let message = 'Erro no upload de arquivo';
    switch(err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Arquivo muito grande';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Tipo de arquivo não esperado';
        break;
      default:
        message = err.message;
    }
    
    return res.status(400).json({ error: message });
  }
  
  if (err) {
    logger.error(`Erro não tratado em middleware: ${err.message}`);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
  
  next();
});

// IMPORTANTE: As rotas da API vêm DEPOIS dos arquivos estáticos
app.use(routes);

// Middleware para lidar com rotas não encontradas
app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Tratamento de erros global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method
    });
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.statusCode
    });
  }

  logger.error('Erro não tratado:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body
  });

  // Responder com erro 500 e mensagem adequada
  return res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'production' ? 'Ocorreu um erro ao processar sua solicitação' : err.message
  });
});

export default app;