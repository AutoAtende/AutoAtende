import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { getJwtConfig } from '../../config/auth';
import { logger } from '../../utils/logger';
import User from '../../models/User';

interface SocketUserData {
  userId: number;
  companyId: number;
  profile: string;
  isSuper: boolean;
  lastActivity: number;
  connectionTime: number;
}

/**
 * Optimized authentication middleware for Socket.io
 * Handles JWT validation, user verification, and rate limiting
 */
export const authMiddleware = () => {
  // Cache for recently validated tokens to reduce DB queries
  const tokenCache = new Map<string, { user: SocketUserData; expiry: number }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  // Rate limiting per IP
  const ipAttempts = new Map<string, { count: number; resetTime: number }>();
  const MAX_ATTEMPTS_PER_IP = 20;
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

  return async (socket: Socket, next: (err?: Error) => void) => {
    const startTime = Date.now();
    
    try {
      const { token } = socket.handshake.query;
      const clientIp = socket.handshake.address;
      
      // Validate token presence
      if (!token || typeof token !== 'string') {
        logger.warn(`[Auth] Missing token from IP ${clientIp}`);
        return next(new Error('Authentication token required'));
      }

      // Check rate limiting
      const now = Date.now();
      const ipData = ipAttempts.get(clientIp);
      
      if (ipData) {
        if (now > ipData.resetTime) {
          // Reset window
          ipAttempts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        } else if (ipData.count >= MAX_ATTEMPTS_PER_IP) {
          logger.warn(`[Auth] Rate limit exceeded for IP ${clientIp}`);
          return next(new Error('Too many authentication attempts'));
        } else {
          ipData.count++;
        }
      } else {
        ipAttempts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }

      // Check token cache first
      const cacheKey = `${token}_${clientIp}`;
      const cached = tokenCache.get(cacheKey);
      
      if (cached && cached.expiry > now) {
        socket.data.user = cached.user;
        logger.debug(`[Auth] Cache hit for user ${cached.user.userId}`);
        return next();
      }

      // Validate JWT token
      const jwtConfig = await getJwtConfig();
      let decoded: any;
      
      try {
        decoded = verify(token, jwtConfig.secret);
      } catch (jwtError) {
        logger.warn(`[Auth] Invalid JWT token from IP ${clientIp}:`, jwtError.message);
        return next(new Error('Invalid authentication token'));
      }

      // Check token expiration
      if (decoded.exp && decoded.exp < Math.floor(now / 1000)) {
        logger.warn(`[Auth] Expired token from IP ${clientIp}`);
        return next(new Error('Authentication token expired'));
      }

      // Validate required fields
      if (!decoded.id || !decoded.companyId) {
        logger.warn(`[Auth] Invalid token payload from IP ${clientIp}`);
        return next(new Error('Invalid token data'));
      }

      // Verify user exists and is active
      const user = await User.findOne({
        where: {
          id: decoded.id,
          companyId: decoded.companyId,
        },
        attributes: ['id', 'name', 'email', 'profile', 'companyId', 'super', 'tokenVersion'],
      });

      if (!user) {
        logger.warn(`[Auth] User not found for token from IP ${clientIp}: userId=${decoded.id}`);
        return next(new Error('User not found or inactive'));
      }

      // Verify token version if available
      if (user.tokenVersion !== undefined && decoded.tokenVersion !== undefined && 
          user.tokenVersion !== decoded.tokenVersion) {
        logger.warn(`[Auth] Token version mismatch for user ${user.id}`);
        return next(new Error('Token version invalid'));
      }

      // Verify company ID matches
      if (user.companyId !== decoded.companyId) {
        logger.warn(`[Auth] Company ID mismatch for user ${user.id}: token=${decoded.companyId}, user=${user.companyId}`);
        return next(new Error('Invalid company association'));
      }

      // Create user data
      const userData: SocketUserData = {
        userId: user.id,
        companyId: user.companyId,
        profile: user.profile,
        isSuper: user.super || false,
        lastActivity: now,
        connectionTime: now,
      };

      // Cache the validated token
      tokenCache.set(cacheKey, {
        user: userData,
        expiry: now + CACHE_TTL,
      });

      // Cleanup old cache entries periodically
      if (tokenCache.size > 1000) {
        for (const [key, value] of tokenCache.entries()) {
          if (value.expiry < now) {
            tokenCache.delete(key);
          }
        }
      }

      // Store user data in socket
      socket.data.user = userData;

      // Update user online status (non-blocking)
      user.update({ online: true }).catch(error => {
        logger.warn(`[Auth] Failed to update online status for user ${user.id}:`, error.message);
      });

      // Clear rate limiting for successful auth
      ipAttempts.delete(clientIp);

      const authDuration = Date.now() - startTime;
      logger.debug(`[Auth] Successful authentication for user ${user.id} (${authDuration}ms)`, {
        userId: user.id,
        companyId: user.companyId,
        profile: user.profile,
        ip: clientIp,
        cached: !!cached,
      });

      next();

    } catch (error) {
      const authDuration = Date.now() - startTime;
      logger.error(`[Auth] Authentication error (${authDuration}ms):`, error);
      return next(new Error('Authentication failed'));
    }
  };
};

/**
 * Cleanup function for auth middleware
 */
export const cleanupAuthCache = () => {
  // This would be called by the main socket manager during cleanup
  logger.info('[Auth] Cleaning up authentication cache');
};