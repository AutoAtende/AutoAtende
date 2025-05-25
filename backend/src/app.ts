import "./database";
import "reflect-metadata";
import "express-async-errors";
import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import multer from "multer";
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

// IMPORTANTE: Configurar arquivos estáticos ANTES das rotas da API
// Middleware para servir arquivos estáticos por empresa (sem autenticação)
app.use("/public", (req: Request, res: Response, next: NextFunction) => {
  // Configurar headers de cache para arquivos estáticos
  res.header('Cache-Control', 'public, max-age=31557600'); // 1 ano
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  logger.debug(`Servindo arquivo estático: ${req.path}`);
  next();
}, express.static(uploadConfig.directory));

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

// IMPORTANTE: As rotas da API (que incluem middlewares de autenticação) vêm DEPOIS dos arquivos estáticos
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