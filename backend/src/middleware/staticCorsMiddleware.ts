import { Request, Response, NextFunction } from 'express';

export const staticCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Headers CORS para arquivos estáticos
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    res.header('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
    
    // Headers de segurança
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };