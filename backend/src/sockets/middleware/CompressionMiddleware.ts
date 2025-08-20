import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';

interface CompressionConfig {
  threshold: number;
  algorithm: 'gzip' | 'deflate';
  level: number;
}

export function compressionMiddleware(threshold: number = 1024) {
  const config: CompressionConfig = {
    threshold,
    algorithm: 'gzip',
    level: 6, // Balanced compression level
  };

  return (socket: Socket, next: (err?: Error) => void) => {
    try {
      // Store compression config in socket data
      socket.data.compression = {
        enabled: true,
        threshold: config.threshold,
        algorithm: config.algorithm,
        level: config.level,
      };
      
      // Override emit to apply compression
      const originalEmit = socket.emit.bind(socket);
      
      socket.emit = function(event: string, ...args: any[]) {
        try {
          // Calculate payload size
          const payload = JSON.stringify(args);
          const payloadSize = Buffer.byteLength(payload, 'utf8');
          
          // Apply compression if payload exceeds threshold
          if (payloadSize > config.threshold) {
            const zlib = require('zlib');
            
            try {
              const compressed = zlib.gzipSync(payload, {
                level: config.level,
                windowBits: 15,
                memLevel: 8,
              });
              
              const compressionRatio = payloadSize / compressed.length;
              
              // Only use compression if it provides significant savings
              if (compressionRatio > 1.2) { // At least 20% savings
                logger.debug(`Compressing payload: ${payloadSize} -> ${compressed.length} bytes (${compressionRatio.toFixed(2)}x)`);
                
                // Send compressed data with metadata
                return originalEmit('compressed_data', {
                  event,
                  compressed: true,
                  data: compressed.toString('base64'),
                  originalSize: payloadSize,
                  compressedSize: compressed.length,
                  algorithm: config.algorithm,
                });
              }
            } catch (compressionError) {
              logger.error('Compression failed, sending uncompressed:', compressionError);
            }
          }
          
          // Send uncompressed
          return originalEmit(event, ...args);
          
        } catch (error) {
          logger.error('Error in compression emit override:', error);
          return originalEmit(event, ...args);
        }
      };
      
      next();
      
    } catch (error) {
      logger.error('Error in compression middleware:', error);
      next(new Error('Compression setup error'));
    }
  };
}