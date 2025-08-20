import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { ConnectionPool } from '../utils/ConnectionPool';

interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxRequestsPerMinute: number;
  blockDuration: number; // in milliseconds
  whitelist?: string[];
}

interface RateLimitData {
  requests: number[];
  blocked: boolean;
  blockUntil: number;
}

export function rateLimitMiddleware(connectionPool: ConnectionPool) {
  const rateLimitMap = new Map<string, RateLimitData>();
  
  const config: RateLimitConfig = {
    maxRequestsPerSecond: 10,
    maxRequestsPerMinute: 300,
    blockDuration: 60000, // 1 minute
  };

  return (socket: Socket, next: (err?: Error) => void) => {
    try {
      const clientId = socket.handshake.address || socket.id;
      const now = Date.now();
      
      // Get or create rate limit data for this client
      let rateLimitData = rateLimitMap.get(clientId);
      if (!rateLimitData) {
        rateLimitData = {
          requests: [],
          blocked: false,
          blockUntil: 0,
        };
        rateLimitMap.set(clientId, rateLimitData);
      }
      
      // Check if client is currently blocked
      if (rateLimitData.blocked && now < rateLimitData.blockUntil) {
        const timeLeft = Math.ceil((rateLimitData.blockUntil - now) / 1000);
        logger.warn(`Rate limit block active for ${clientId}, ${timeLeft}s remaining`);
        return next(new Error(`Rate limit exceeded. Try again in ${timeLeft} seconds.`));
      }
      
      // Reset block if time has passed
      if (rateLimitData.blocked && now >= rateLimitData.blockUntil) {
        rateLimitData.blocked = false;
        rateLimitData.requests = [];
      }
      
      // Clean old requests (older than 1 minute)
      const oneMinuteAgo = now - 60000;
      rateLimitData.requests = rateLimitData.requests.filter(time => time > oneMinuteAgo);
      
      // Add current request
      rateLimitData.requests.push(now);
      
      // Check per-second limit
      const oneSecondAgo = now - 1000;
      const requestsInLastSecond = rateLimitData.requests.filter(time => time > oneSecondAgo).length;
      
      if (requestsInLastSecond > config.maxRequestsPerSecond) {
        rateLimitData.blocked = true;
        rateLimitData.blockUntil = now + config.blockDuration;
        
        logger.warn(`Rate limit exceeded for ${clientId}: ${requestsInLastSecond} requests in last second`);
        return next(new Error('Rate limit exceeded: too many requests per second'));
      }
      
      // Check per-minute limit
      if (rateLimitData.requests.length > config.maxRequestsPerMinute) {
        rateLimitData.blocked = true;
        rateLimitData.blockUntil = now + config.blockDuration;
        
        logger.warn(`Rate limit exceeded for ${clientId}: ${rateLimitData.requests.length} requests in last minute`);
        return next(new Error('Rate limit exceeded: too many requests per minute'));
      }
      
      next();
      
    } catch (error) {
      logger.error('Error in rate limit middleware:', error);
      next(new Error('Internal rate limiting error'));
    }
  };
}