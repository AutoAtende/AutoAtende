import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';

interface ConnectionInfo {
  socketId: string;
  socket: Socket;
  userId: number;
  companyId: number;
  connectedAt: number;
  lastActivity: number;
  userAgent?: string;
  ipAddress?: string;
}

interface ConnectionLimits {
  maxConnectionsPerCompany: number;
  maxConnectionsPerUser: number;
  maxTotalConnections?: number;
  inactivityTimeout: number;
}

/**
 * Optimized connection pool for managing Socket.io connections
 * Provides memory-efficient tracking and automatic cleanup
 */
export class ConnectionPool {
  private connections: Map<string, ConnectionInfo> = new Map();
  private companyIndex: Map<number, Set<string>> = new Map();
  private userIndex: Map<number, Set<string>> = new Map();
  private limits: ConnectionLimits;
  
  // Performance tracking
  private totalConnections = 0;
  private peakConnections = 0;
  private connectionHistory: Array<{ timestamp: number; count: number }> = [];
  
  constructor(config: any) {
    this.limits = {
      maxConnectionsPerCompany: config.maxConnectionsPerCompany || 500,
      maxConnectionsPerUser: config.maxConnectionsPerUser || 3,
      maxTotalConnections: config.maxTotalConnections || 10000,
      inactivityTimeout: config.inactivityTimeout || 300000, // 5 minutes
    };
    
    // Track connection metrics over time
    setInterval(() => this.recordConnectionMetrics(), 60000); // Every minute
  }

  /**
   * Check if a new connection is allowed
   */
  canConnect(companyId: number, userId: number): boolean {
    // Check total connections limit
    if (this.limits.maxTotalConnections && this.totalConnections >= this.limits.maxTotalConnections) {
      logger.warn(`Total connection limit reached: ${this.totalConnections}`);
      return false;
    }

    // Check company connections limit
    const companyConnections = this.getCompanyConnections(companyId);
    if (companyConnections.length >= this.limits.maxConnectionsPerCompany) {
      logger.warn(`Company ${companyId} connection limit reached: ${companyConnections.length}`);
      return false;
    }

    // Check user connections limit
    const userConnections = this.getUserConnections(userId);
    if (userConnections.length >= this.limits.maxConnectionsPerUser) {
      logger.warn(`User ${userId} connection limit reached: ${userConnections.length}`);
      return false;
    }

    return true;
  }

  /**
   * Add a new connection to the pool
   */
  addConnection(companyId: number, userId: number, socket: Socket): boolean {
    if (!this.canConnect(companyId, userId)) {
      return false;
    }

    const connectionInfo: ConnectionInfo = {
      socketId: socket.id,
      socket,
      userId,
      companyId,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      userAgent: socket.handshake.headers['user-agent'],
      ipAddress: socket.handshake.address,
    };

    // Add to main connections map
    this.connections.set(socket.id, connectionInfo);

    // Add to company index
    if (!this.companyIndex.has(companyId)) {
      this.companyIndex.set(companyId, new Set());
    }
    this.companyIndex.get(companyId)!.add(socket.id);

    // Add to user index
    if (!this.userIndex.has(userId)) {
      this.userIndex.set(userId, new Set());
    }
    this.userIndex.get(userId)!.add(socket.id);

    this.totalConnections++;
    this.peakConnections = Math.max(this.peakConnections, this.totalConnections);

    logger.debug(`Connection added for user ${userId} in company ${companyId}`, {
      socketId: socket.id,
      totalConnections: this.totalConnections,
      companyConnections: this.getCompanyConnections(companyId).length,
      userConnections: this.getUserConnections(userId).length,
    });

    return true;
  }

  /**
   * Remove a connection from the pool
   */
  removeConnection(companyId: number, userId: number, socketId: string): boolean {
    const connection = this.connections.get(socketId);
    if (!connection) {
      return false;
    }

    // Remove from main connections map
    this.connections.delete(socketId);

    // Remove from company index
    const companyConnections = this.companyIndex.get(companyId);
    if (companyConnections) {
      companyConnections.delete(socketId);
      if (companyConnections.size === 0) {
        this.companyIndex.delete(companyId);
      }
    }

    // Remove from user index
    const userConnections = this.userIndex.get(userId);
    if (userConnections) {
      userConnections.delete(socketId);
      if (userConnections.size === 0) {
        this.userIndex.delete(userId);
      }
    }

    this.totalConnections--;

    logger.debug(`Connection removed for user ${userId} in company ${companyId}`, {
      socketId,
      duration: Date.now() - connection.connectedAt,
      totalConnections: this.totalConnections,
    });

    return true;
  }

  /**
   * Update last activity timestamp for a connection
   */
  updateLastActivity(companyId: number, userId: number, socketId: string): void {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }

  /**
   * Get all connections for a company
   */
  getCompanyConnections(companyId: number): ConnectionInfo[] {
    const socketIds = this.companyIndex.get(companyId) || new Set();
    return Array.from(socketIds)
      .map(socketId => this.connections.get(socketId))
      .filter((conn): conn is ConnectionInfo => conn !== undefined);
  }

  /**
   * Get all connections for a user
   */
  getUserConnections(userId: number): ConnectionInfo[] {
    const socketIds = this.userIndex.get(userId) || new Set();
    return Array.from(socketIds)
      .map(socketId => this.connections.get(socketId))
      .filter((conn): conn is ConnectionInfo => conn !== undefined);
  }

  /**
   * Get connection by socket ID
   */
  getConnection(socketId: string): ConnectionInfo | undefined {
    return this.connections.get(socketId);
  }

  /**
   * Get all active connections
   */
  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get inactive connections (for cleanup)
   */
  getInactiveConnections(inactiveThreshold: number): ConnectionInfo[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.lastActivity < inactiveThreshold);
  }

  /**
   * Get connections by company that are older than threshold
   */
  getStaleConnections(companyId: number, ageThreshold: number): ConnectionInfo[] {
    return this.getCompanyConnections(companyId)
      .filter(conn => conn.connectedAt < ageThreshold);
  }

  /**
   * Force disconnect inactive connections
   */
  disconnectInactiveConnections(): number {
    const inactiveThreshold = Date.now() - this.limits.inactivityTimeout;
    const inactiveConnections = this.getInactiveConnections(inactiveThreshold);
    
    let disconnectedCount = 0;
    for (const connection of inactiveConnections) {
      try {
        connection.socket.disconnect(true);
        this.removeConnection(connection.companyId, connection.userId, connection.socketId);
        disconnectedCount++;
      } catch (error) {
        logger.error(`Error disconnecting inactive socket ${connection.socketId}:`, error);
      }
    }

    if (disconnectedCount > 0) {
      logger.info(`Disconnected ${disconnectedCount} inactive connections`);
    }

    return disconnectedCount;
  }

  /**
   * Get connection metrics for monitoring
   */
  getMetrics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Calculate active connections by time ranges
    const recentConnections = Array.from(this.connections.values())
      .filter(conn => conn.connectedAt > oneHourAgo);

    // Group connections by company
    const connectionsByCompany = new Map<number, number>();
    for (const [companyId, socketIds] of this.companyIndex.entries()) {
      connectionsByCompany.set(companyId, socketIds.size);
    }

    // Get connection duration statistics
    const durations = Array.from(this.connections.values())
      .map(conn => now - conn.connectedAt);
    
    const avgDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0;

    return {
      total: this.totalConnections,
      peak: this.peakConnections,
      companies: this.companyIndex.size,
      users: this.userIndex.size,
      recentConnections: recentConnections.length,
      avgDuration,
      connectionsByCompany: Object.fromEntries(connectionsByCompany),
      limits: this.limits,
      history: this.connectionHistory.slice(-60), // Last hour
    };
  }

  /**
   * Get detailed statistics for a specific company
   */
  getCompanyMetrics(companyId: number) {
    const connections = this.getCompanyConnections(companyId);
    const now = Date.now();
    
    const userConnections = new Map<number, number>();
    let totalDuration = 0;
    let oldestConnection = now;
    let newestConnection = 0;

    for (const conn of connections) {
      // Count connections per user
      const userCount = userConnections.get(conn.userId) || 0;
      userConnections.set(conn.userId, userCount + 1);
      
      // Duration statistics
      totalDuration += now - conn.connectedAt;
      oldestConnection = Math.min(oldestConnection, conn.connectedAt);
      newestConnection = Math.max(newestConnection, conn.connectedAt);
    }

    return {
      companyId,
      totalConnections: connections.length,
      uniqueUsers: userConnections.size,
      avgDuration: connections.length > 0 ? totalDuration / connections.length : 0,
      oldestConnectionAge: oldestConnection < now ? now - oldestConnection : 0,
      newestConnectionAge: newestConnection > 0 ? now - newestConnection : 0,
      connectionsPerUser: Object.fromEntries(userConnections),
    };
  }

  /**
   * Check if pool is approaching capacity limits
   */
  isNearCapacity(): boolean {
    const totalLimit = this.limits.maxTotalConnections || Infinity;
    const usagePercent = (this.totalConnections / totalLimit) * 100;
    return usagePercent > 80; // Alert when above 80%
  }

  /**
   * Get current capacity usage
   */
  getCapacityUsage() {
    const totalLimit = this.limits.maxTotalConnections || Infinity;
    return {
      current: this.totalConnections,
      limit: totalLimit,
      percentage: (this.totalConnections / totalLimit) * 100,
      isNearCapacity: this.isNearCapacity(),
    };
  }

  /**
   * Record connection metrics for historical tracking
   */
  private recordConnectionMetrics(): void {
    const now = Date.now();
    this.connectionHistory.push({
      timestamp: now,
      count: this.totalConnections,
    });

    // Keep only last 24 hours of data
    const dayAgo = now - (24 * 60 * 60 * 1000);
    this.connectionHistory = this.connectionHistory.filter(
      entry => entry.timestamp > dayAgo
    );
  }

  /**
   * Get total number of connections
   */
  getTotalConnections(): number {
    return this.totalConnections;
  }

  /**
   * Clean up all connections and indexes
   */
  cleanup(): void {
    // Disconnect all sockets
    for (const connection of this.connections.values()) {
      try {
        connection.socket.disconnect(true);
      } catch (error) {
        logger.error(`Error disconnecting socket ${connection.socketId}:`, error);
      }
    }

    // Clear all data structures
    this.connections.clear();
    this.companyIndex.clear();
    this.userIndex.clear();
    this.connectionHistory = [];
    this.totalConnections = 0;
    this.peakConnections = 0;

    logger.info('Connection pool cleanup completed');
  }

  /**
   * Validate pool integrity (for debugging)
   */
  validateIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if indexes match connections
    let indexTotal = 0;
    for (const socketIds of this.companyIndex.values()) {
      indexTotal += socketIds.size;
      for (const socketId of socketIds) {
        if (!this.connections.has(socketId)) {
          errors.push(`Company index has orphaned socket ID: ${socketId}`);
        }
      }
    }

    let userIndexTotal = 0;
    for (const socketIds of this.userIndex.values()) {
      userIndexTotal += socketIds.size;
      for (const socketId of socketIds) {
        if (!this.connections.has(socketId)) {
          errors.push(`User index has orphaned socket ID: ${socketId}`);
        }
      }
    }

    // Check if totals match
    if (indexTotal !== this.totalConnections) {
      errors.push(`Company index total (${indexTotal}) doesn't match connection count (${this.totalConnections})`);
    }

    if (userIndexTotal !== this.totalConnections) {
      errors.push(`User index total (${userIndexTotal}) doesn't match connection count (${this.totalConnections})`);
    }

    if (this.connections.size !== this.totalConnections) {
      errors.push(`Connections map size (${this.connections.size}) doesn't match total count (${this.totalConnections})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}