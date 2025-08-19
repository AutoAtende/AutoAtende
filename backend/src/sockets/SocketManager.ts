import { Server as SocketIO, Socket } from 'socket.io';
import { Server } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { verify } from "jsonwebtoken";
import compression from 'compression';
import { logger } from "../utils/logger";
import { getJwtConfig } from "../config/auth";
import { getRedisClient } from "../config/redis";

import { MemoryManager } from './utils/MemoryManager';
import { ConnectionPool } from './utils/ConnectionPool';
import { PerformanceMetrics } from './utils/PerformanceMetrics';
import { EventBatcher } from './utils/EventBatcher';
import { CompanyNamespace } from './namespaces/CompanyNamespace';
import { UserNamespace } from './namespaces/UserNamespace';
import { OptimizedEventHandler } from './events/OptimizedEventHandler';

// Middleware imports
import { authMiddleware } from './middleware/AuthMiddleware';
import { rateLimitMiddleware } from './middleware/RateLimitMiddleware';
import { memoryMiddleware } from './middleware/MemoryMiddleware';
import { compressionMiddleware } from './middleware/CompressionMiddleware';

interface SocketUserData {
  userId: number;
  companyId: number;
  profile: string;
  isSuper: boolean;
  lastActivity: number;
  connectionTime: number;
}

interface OptimizedSocketConfig {
  maxConnectionsPerCompany: number;
  maxConnectionsPerUser: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  cleanupInterval: number;
  compressionThreshold: number;
  batchingInterval: number;
  memoryThreshold: number;
}

class OptimizedSocketManager {
  private io: SocketIO | null = null;
  private redisAdapter: any = null;
  private memoryManager: MemoryManager;
  private connectionPool: ConnectionPool;
  private performanceMetrics: PerformanceMetrics;
  private eventBatcher: EventBatcher;
  private companyNamespaces: Map<number, CompanyNamespace> = new Map();
  private userNamespaces: Map<number, UserNamespace> = new Map();
  private eventHandler: OptimizedEventHandler;
  
  // Cleanup intervals
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryMonitorInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  
  private config: OptimizedSocketConfig = {
    maxConnectionsPerCompany: 500,
    maxConnectionsPerUser: 3,
    heartbeatInterval: 25000,
    heartbeatTimeout: 60000,
    cleanupInterval: 300000, // 5 minutes
    compressionThreshold: 1024, // 1KB
    batchingInterval: 100, // 100ms
    memoryThreshold: 500 * 1024 * 1024, // 500MB
  };

  constructor() {
    this.memoryManager = new MemoryManager(this.config.memoryThreshold);
    this.connectionPool = new ConnectionPool(this.config);
    this.performanceMetrics = new PerformanceMetrics();
    this.eventBatcher = new EventBatcher(this.config.batchingInterval);
    this.eventHandler = new OptimizedEventHandler();
  }

  /**
   * Initialize optimized Socket.io server
   */
  async initialize(httpServer: Server): Promise<SocketIO> {
    try {
      logger.info('Initializing optimized Socket.io server...');

      // Create Socket.io instance with optimized configuration
      this.io = new SocketIO(httpServer, {
        pingTimeout: this.config.heartbeatTimeout,
        pingInterval: this.config.heartbeatInterval,
        transports: ['websocket', 'polling'],
        compression: true,
        allowEIO3: false, // Force Socket.io v4
        
        cors: {
          credentials: true,
          origin: process.env.FRONTEND_URL,
          methods: ["GET", "POST"],
          allowedHeaders: ["Authorization", "Content-Type"]
        },
        
        // Performance optimizations
        connectTimeout: 30000,
        httpCompression: {
          threshold: this.config.compressionThreshold,
          chunkSize: 1024,
          windowBits: 13,
          level: 6,
          concurrency: 16,
        },
        
        // Memory optimizations
        maxHttpBufferSize: 1e6, // 1MB max message size
        
        // Connection optimizations
        perMessageDeflate: {
          threshold: 1024,
          zlibDeflateOptions: {
            windowBits: 13,
          }
        }
      });

      // Setup Redis adapter for horizontal scaling
      await this.setupRedisAdapter();
      
      // Setup middleware stack
      this.setupMiddleware();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Start background processes
      this.startBackgroundProcesses();
      
      logger.info('Optimized Socket.io server initialized successfully');
      return this.io;
      
    } catch (error) {
      logger.error('Failed to initialize Socket.io server:', error);
      throw error;
    }
  }

  /**
   * Setup Redis adapter for scaling
   */
  private async setupRedisAdapter() {
    try {
      const redisClient = await getRedisClient();
      const pubClient = redisClient.duplicate();
      const subClient = redisClient.duplicate();
      
      await Promise.all([
        pubClient.connect(),
        subClient.connect()
      ]);
      
      this.redisAdapter = createAdapter(pubClient, subClient, {
        key: 'socket.io',
        requestsTimeout: 5000,
      });
      
      this.io!.adapter(this.redisAdapter);
      
      logger.info('Redis adapter configured for Socket.io scaling');
    } catch (error) {
      logger.error('Failed to setup Redis adapter:', error);
      throw error;
    }
  }

  /**
   * Setup optimized middleware stack
   */
  private setupMiddleware() {
    if (!this.io) return;

    // Performance monitoring middleware
    this.io.use((socket, next) => {
      const startTime = Date.now();
      socket.data.connectionStart = startTime;
      this.performanceMetrics.incrementConnections();
      next();
    });

    // Memory management middleware
    this.io.use(memoryMiddleware(this.memoryManager));
    
    // Authentication middleware
    this.io.use(authMiddleware());
    
    // Rate limiting middleware
    this.io.use(rateLimitMiddleware(this.connectionPool));
    
    // Compression middleware
    this.io.use(compressionMiddleware(this.config.compressionThreshold));
  }

  /**
   * Setup optimized event handlers
   */
  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', async (socket: Socket) => {
      try {
        await this.handleConnection(socket);
      } catch (error) {
        logger.error('Error handling socket connection:', error);
        socket.disconnect(true);
      }
    });

    this.io.on('connect_error', (error) => {
      logger.error('Socket connection error:', error);
      this.performanceMetrics.incrementErrors();
    });
  }

  /**
   * Handle individual socket connection with optimizations
   */
  private async handleConnection(socket: Socket) {
    const userData = socket.data.user as SocketUserData;
    
    if (!userData?.userId || !userData?.companyId) {
      logger.warn('Invalid user data in socket connection');
      socket.disconnect(true);
      return;
    }

    const userId = userData.userId;
    const companyId = userData.companyId;

    // Check connection limits
    if (!this.connectionPool.canConnect(companyId, userId)) {
      logger.warn(`Connection limit exceeded for user ${userId} in company ${companyId}`);
      socket.emit('connection_error', { error: 'Connection limit exceeded' });
      socket.disconnect(true);
      return;
    }

    // Register connection
    this.connectionPool.addConnection(companyId, userId, socket);
    
    // Setup company namespace if needed
    await this.ensureCompanyNamespace(companyId);
    
    // Setup user namespace if needed
    await this.ensureUserNamespace(userId);
    
    // Join optimized rooms
    await this.joinOptimizedRooms(socket, userData);
    
    // Setup socket event handlers
    this.setupSocketEvents(socket, userData);
    
    // Emit connection confirmation
    socket.emit('connection_established', {
      userId,
      companyId,
      timestamp: new Date(),
      status: 'connected',
      serverMetrics: this.performanceMetrics.getBasicMetrics()
    });
    
    logger.info(`Optimized connection established for user ${userId} in company ${companyId}`, {
      connectionTime: Date.now() - userData.connectionTime,
      activeConnections: this.connectionPool.getTotalConnections()
    });
  }

  /**
   * Ensure company namespace exists and is optimized
   */
  private async ensureCompanyNamespace(companyId: number) {
    if (!this.companyNamespaces.has(companyId)) {
      const namespace = new CompanyNamespace(companyId, this.io!, this.eventBatcher);
      await namespace.initialize();
      this.companyNamespaces.set(companyId, namespace);
    }
  }

  /**
   * Ensure user namespace exists and is optimized
   */
  private async ensureUserNamespace(userId: number) {
    if (!this.userNamespaces.has(userId)) {
      const namespace = new UserNamespace(userId, this.io!, this.eventBatcher);
      await namespace.initialize();
      this.userNamespaces.set(userId, namespace);
    }
  }

  /**
   * Join rooms with memory optimization
   */
  private async joinOptimizedRooms(socket: Socket, userData: SocketUserData) {
    const { userId, companyId, profile } = userData;
    
    // Essential rooms only
    const rooms = [
      `company:${companyId}`,
      `user:${userId}`,
    ];

    // Add conditional rooms based on profile
    if (profile === 'admin' || profile === 'superv') {
      rooms.push(`company:${companyId}:admin`);
    }

    // Join rooms efficiently
    for (const room of rooms) {
      socket.join(room);
      this.memoryManager.trackRoom(room, socket.id);
    }
  }

  /**
   * Setup socket event handlers with optimizations
   */
  private setupSocketEvents(socket: Socket, userData: SocketUserData) {
    const { userId, companyId } = userData;

    // Optimized event handlers using the event handler class
    this.eventHandler.setupHandlers(socket, userData, {
      connectionPool: this.connectionPool,
      performanceMetrics: this.performanceMetrics,
      eventBatcher: this.eventBatcher,
      memoryManager: this.memoryManager
    });

    // Connection maintenance
    socket.on('ping', (data) => {
      socket.emit('pong', { ...data, serverTime: Date.now() });
      this.connectionPool.updateLastActivity(companyId, userId, socket.id);
    });

    // Disconnect handler with cleanup
    socket.on('disconnect', async (reason) => {
      await this.handleDisconnect(socket, userData, reason);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error);
      this.performanceMetrics.incrementErrors();
    });
  }

  /**
   * Handle socket disconnection with proper cleanup
   */
  private async handleDisconnect(socket: Socket, userData: SocketUserData, reason: string) {
    const { userId, companyId } = userData;
    
    try {
      // Remove from connection pool
      this.connectionPool.removeConnection(companyId, userId, socket.id);
      
      // Clean up rooms
      this.memoryManager.cleanupSocket(socket.id);
      
      // Update user status
      await this.updateUserStatus(userId, false);
      
      // Clean up namespaces if no more connections
      await this.cleanupNamespaces(companyId, userId);
      
      logger.info(`User ${userId} disconnected from company ${companyId}`, {
        reason,
        duration: Date.now() - userData.connectionTime,
        remainingConnections: this.connectionPool.getCompanyConnections(companyId).length
      });
      
    } catch (error) {
      logger.error(`Error during disconnect cleanup for user ${userId}:`, error);
    }
  }

  /**
   * Start background processes for maintenance
   */
  private startBackgroundProcesses() {
    // Cleanup process
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);

    // Memory monitoring
    this.memoryMonitorInterval = setInterval(() => {
      this.memoryManager.performCleanup();
    }, 60000); // Every minute

    // Metrics collection
    this.metricsInterval = setInterval(() => {
      this.performanceMetrics.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  /**
   * Perform periodic cleanup
   */
  private async performCleanup() {
    try {
      logger.debug('Starting periodic Socket.io cleanup...');
      
      // Clean up inactive connections
      const inactiveThreshold = Date.now() - (5 * 60 * 1000); // 5 minutes
      const inactiveConnections = this.connectionPool.getInactiveConnections(inactiveThreshold);
      
      for (const { companyId, userId, socketId } of inactiveConnections) {
        const socket = this.io?.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
          logger.debug(`Disconnected inactive socket ${socketId} for user ${userId}`);
        }
      }
      
      // Clean up empty namespaces
      await this.cleanupEmptyNamespaces();
      
      // Force garbage collection if available
      if (global.gc && this.memoryManager.shouldForceGC()) {
        global.gc();
        logger.debug('Forced garbage collection');
      }
      
      logger.debug(`Cleanup completed. Active connections: ${this.connectionPool.getTotalConnections()}`);
      
    } catch (error) {
      logger.error('Error during periodic cleanup:', error);
    }
  }

  /**
   * Clean up empty namespaces to free memory
   */
  private async cleanupEmptyNamespaces() {
    // Clean up company namespaces
    for (const [companyId, namespace] of this.companyNamespaces.entries()) {
      if (this.connectionPool.getCompanyConnections(companyId).length === 0) {
        await namespace.cleanup();
        this.companyNamespaces.delete(companyId);
        logger.debug(`Cleaned up empty company namespace ${companyId}`);
      }
    }

    // Clean up user namespaces
    for (const [userId, namespace] of this.userNamespaces.entries()) {
      if (this.connectionPool.getUserConnections(userId).length === 0) {
        await namespace.cleanup();
        this.userNamespaces.delete(userId);
        logger.debug(`Cleaned up empty user namespace ${userId}`);
      }
    }
  }

  /**
   * Clean up specific namespaces
   */
  private async cleanupNamespaces(companyId: number, userId: number) {
    // Check if company has no more connections
    if (this.connectionPool.getCompanyConnections(companyId).length === 0) {
      const namespace = this.companyNamespaces.get(companyId);
      if (namespace) {
        await namespace.cleanup();
        this.companyNamespaces.delete(companyId);
      }
    }

    // Check if user has no more connections
    if (this.connectionPool.getUserConnections(userId).length === 0) {
      const namespace = this.userNamespaces.get(userId);
      if (namespace) {
        await namespace.cleanup();
        this.userNamespaces.delete(userId);
      }
    }
  }

  /**
   * Update user online status
   */
  private async updateUserStatus(userId: number, online: boolean) {
    try {
      // Import User model dynamically to avoid circular dependencies
      const { default: User } = await import('../models/User');
      await User.update({ online }, { where: { id: userId } });
    } catch (error) {
      logger.error(`Error updating user status for ${userId}:`, error);
    }
  }

  /**
   * Get optimized Socket.io instance
   */
  getIO(): SocketIO {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }
    return this.io;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      performance: this.performanceMetrics.getAllMetrics(),
      memory: this.memoryManager.getMetrics(),
      connections: this.connectionPool.getMetrics(),
      namespaces: {
        companies: this.companyNamespaces.size,
        users: this.userNamespaces.size
      }
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('Shutting down optimized Socket.io server...');
    
    // Clear intervals
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.memoryMonitorInterval) clearInterval(this.memoryMonitorInterval);
    if (this.metricsInterval) clearInterval(this.metricsInterval);
    
    // Clean up namespaces
    for (const namespace of this.companyNamespaces.values()) {
      await namespace.cleanup();
    }
    for (const namespace of this.userNamespaces.values()) {
      await namespace.cleanup();
    }
    
    // Disconnect all sockets
    if (this.io) {
      this.io.disconnectSockets(true);
      this.io.close();
    }
    
    // Final cleanup
    this.connectionPool.cleanup();
    this.memoryManager.cleanup();
    
    logger.info('Socket.io server shutdown complete');
  }
}

// Singleton instance
export const socketManager = new OptimizedSocketManager();
export default socketManager;