import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { MemoryManager } from '../utils/MemoryManager';

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

export function memoryMiddleware(memoryManager: MemoryManager) {
  return (socket: Socket, next: (err?: Error) => void) => {
    try {
      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
      
      // Get memory threshold from manager
      const thresholdMB = memoryManager.getThreshold() / 1024 / 1024;
      
      // Check if we're approaching memory limits
      if (heapUsedMB > thresholdMB * 0.9) { // 90% of threshold
        logger.warn(`High memory usage detected: ${heapUsedMB.toFixed(2)}MB used`);
        
        // Trigger cleanup
        memoryManager.performCleanup();
        
        // If still over threshold, reject new connections
        if (heapUsedMB > thresholdMB) {
          logger.error(`Memory threshold exceeded: ${heapUsedMB.toFixed(2)}MB > ${thresholdMB.toFixed(2)}MB`);
          return next(new Error('Server memory threshold exceeded. Please try again later.'));
        }
      }
      
      // Track connection memory
      memoryManager.trackConnection(socket.id, {
        timestamp: Date.now(),
        memorySnapshot: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers,
        }
      });
      
      // Add memory cleanup on disconnect
      socket.on('disconnect', () => {
        memoryManager.untrackConnection(socket.id);
      });
      
      next();
      
    } catch (error) {
      logger.error('Error in memory middleware:', error);
      next(new Error('Memory monitoring error'));
    }
  };
}