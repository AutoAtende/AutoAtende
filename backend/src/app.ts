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
import { staticCorsMiddleware } from "./middleware/staticCorsMiddleware";

const app = express();
app.set('trust proxy', 1);

// CORS deve vir primeiro
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
    exposedHeaders: ['Content-Length', 'Content-Range', 'Content-Type']
  })
);

// Middleware específico para arquivos estáticos ANTES das rotas
app.use('/public', staticCorsMiddleware, express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Content-Type correto é crucial para ORB
    const ext = path.extname(filePath).toLowerCase();
    switch(ext) {
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.gif':
        res.setHeader('Content-Type', 'image/gif');
        break;
      case '.webp':
        res.setHeader('Content-Type', 'image/webp');
        break;
      default:
        // Deixar o Express detectar automaticamente
        break;
    }
    
    // Headers ORB essenciais
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }
}));

// Rota para verificar arquivos (debug)
app.get('/public/health/:companyId/:type/:filename', (req, res) => {
  const { companyId, type, filename } = req.params;
  const filePath = path.join(__dirname, '..', 'public', `company${companyId}`, type, filename);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({ 
      exists: true, 
      path: `/public/company${companyId}/${type}/${filename}`,
      size: stats.size,
      modified: stats.mtime
    });
  } else {
    res.status(404).json({ 
      exists: false, 
      searchPath: filePath 
    });
  }
});

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));
app.use(compression()); 
app.use(cookieParser());

// Rotas da API
app.use(routes);

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



// Middleware para capturar erros de multer
app.use((err, req, res, next) => {
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

app.use('/public', staticCorsMiddleware, express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1y', // Cache por 1 ano
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Headers específicos por tipo de arquivo
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif)$/)) {
      res.setHeader('Content-Type', 'image/' + path.extname(filePath).slice(1));
    }
  }
}));

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