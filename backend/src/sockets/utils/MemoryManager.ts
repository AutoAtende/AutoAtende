import { logger } from '../../utils/logger';

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  socketRooms: number;
  connections: number;
  lastGC?: number;
}

interface RoomInfo {
  name: string;
  socketIds: Set<string>;
  createdAt: number;
  lastActivity: number;
}

/**
 * Advanced memory manager for Socket.io optimization
 * Tracks and manages memory usage to prevent leaks
 */
export class MemoryManager {
  private memoryThreshold: number;
  private rooms: Map<string, RoomInfo> = new Map();
  private socketRooms: Map<string, Set<string>> = new Map();
  private gcHistory: number[] = [];
  private memoryHistory: MemoryMetrics[] = [];
  
  // Configuration
  private readonly ROOM_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MEMORY_CHECK_INTERVAL = 30 * 1000; // 30 seconds
  private readonly GC_COOLDOWN = 30 * 1000; // 30 seconds between forced GCs
  private readonly MAX_ROOM_IDLE_TIME = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_HISTORY_LENGTH = 100;

  constructor(memoryThreshold: number = 500 * 1024 * 1024) { // 500MB default
    this.memoryThreshold = memoryThreshold;
    this.startMemoryMonitoring();
  }

  /**
   * Track a new room assignment
   */
  trackRoom(roomName: string, socketId: string): void {
    // Track room info
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, {
        name: roomName,
        socketIds: new Set(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
      });
    }

    const room = this.rooms.get(roomName)!;
    room.socketIds.add(socketId);
    room.lastActivity = Date.now();

    // Track socket's rooms
    if (!this.socketRooms.has(socketId)) {
      this.socketRooms.set(socketId, new Set());
    }
    this.socketRooms.get(socketId)!.add(roomName);
  }

  /**
   * Remove socket from room tracking
   */
  untrackRoom(roomName: string, socketId: string): void {
    const room = this.rooms.get(roomName);
    if (room) {
      room.socketIds.delete(socketId);
      if (room.socketIds.size === 0) {
        this.rooms.delete(roomName);
      }
    }

    const socketRoomSet = this.socketRooms.get(socketId);
    if (socketRoomSet) {
      socketRoomSet.delete(roomName);
      if (socketRoomSet.size === 0) {
        this.socketRooms.delete(socketId);
      }
    }
  }

  /**
   * Clean up all rooms for a socket
   */
  cleanupSocket(socketId: string): void {
    const socketRoomSet = this.socketRooms.get(socketId);
    if (!socketRoomSet) return;

    // Remove socket from all its rooms
    for (const roomName of socketRoomSet) {
      const room = this.rooms.get(roomName);
      if (room) {
        room.socketIds.delete(socketId);
        if (room.socketIds.size === 0) {
          this.rooms.delete(roomName);
        }
      }
    }

    // Remove socket's room tracking
    this.socketRooms.delete(socketId);
  }

  /**
   * Update activity timestamp for a room
   */
  updateRoomActivity(roomName: string): void {
    const room = this.rooms.get(roomName);
    if (room) {
      room.lastActivity = Date.now();
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      socketRooms: this.rooms.size,
      connections: this.socketRooms.size,
      lastGC: this.gcHistory[this.gcHistory.length - 1],
    };
  }

  /**
   * Check if memory usage is critical
   */
  isMemoryCritical(): boolean {
    const current = this.getCurrentMemoryUsage();
    return current.heapUsed > this.memoryThreshold;
  }

  /**
   * Check if forced GC should be performed
   */
  shouldForceGC(): boolean {
    if (!global.gc) return false;
    
    const now = Date.now();
    const lastGC = this.gcHistory[this.gcHistory.length - 1] || 0;
    const timeSinceLastGC = now - lastGC;
    
    return this.isMemoryCritical() && timeSinceLastGC > this.GC_COOLDOWN;
  }

  /**
   * Force garbage collection if available and needed
   */
  forceGarbageCollection(): boolean {
    if (!this.shouldForceGC()) return false;

    try {
      const beforeGC = this.getCurrentMemoryUsage();
      global.gc!();
      const afterGC = this.getCurrentMemoryUsage();
      
      const now = Date.now();
      this.gcHistory.push(now);
      
      // Keep only recent GC history
      if (this.gcHistory.length > 50) {
        this.gcHistory = this.gcHistory.slice(-50);
      }

      const memoryFreed = beforeGC.heapUsed - afterGC.heapUsed;
      logger.info('Forced garbage collection completed', {
        memoryFreed: this.formatBytes(memoryFreed),
        heapBefore: this.formatBytes(beforeGC.heapUsed),
        heapAfter: this.formatBytes(afterGC.heapUsed),
      });

      return true;
    } catch (error) {
      logger.error('Error during forced garbage collection:', error);
      return false;
    }
  }

  /**
   * Perform comprehensive memory cleanup
   */
  performCleanup(): void {
    const startTime = Date.now();
    let cleanedItems = 0;

    try {
      // Clean up idle rooms
      const idleThreshold = Date.now() - this.MAX_ROOM_IDLE_TIME;
      const idleRooms: string[] = [];

      for (const [roomName, room] of this.rooms.entries()) {
        if (room.lastActivity < idleThreshold && room.socketIds.size === 0) {
          idleRooms.push(roomName);
        }
      }

      // Remove idle rooms
      for (const roomName of idleRooms) {
        this.rooms.delete(roomName);
        cleanedItems++;
      }

      // Clean up orphaned socket room references
      const orphanedSockets: string[] = [];
      for (const [socketId, roomSet] of this.socketRooms.entries()) {
        if (roomSet.size === 0) {
          orphanedSockets.push(socketId);
        }
      }

      for (const socketId of orphanedSockets) {
        this.socketRooms.delete(socketId);
        cleanedItems++;
      }

      // Record current memory metrics
      this.recordMemoryMetrics();

      // Force GC if memory is critical
      if (this.isMemoryCritical()) {
        this.forceGarbageCollection();
      }

      const duration = Date.now() - startTime;
      if (cleanedItems > 0) {
        logger.debug(`Memory cleanup completed in ${duration}ms, cleaned ${cleanedItems} items`);
      }

    } catch (error) {
      logger.error('Error during memory cleanup:', error);
    }
  }

  /**
   * Record memory metrics for historical tracking
   */
  private recordMemoryMetrics(): void {
    const metrics = this.getCurrentMemoryUsage();
    this.memoryHistory.push(metrics);

    // Keep only recent history
    if (this.memoryHistory.length > this.MAX_HISTORY_LENGTH) {
      this.memoryHistory = this.memoryHistory.slice(-this.MAX_HISTORY_LENGTH);
    }
  }

  /**
   * Get memory trend analysis
   */
  getMemoryTrend(): {
    current: MemoryMetrics;
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    recommendations: string[];
  } {
    const current = this.getCurrentMemoryUsage();
    const recommendations: string[] = [];

    if (this.memoryHistory.length < 5) {
      return {
        current,
        trend: 'stable',
        changeRate: 0,
        recommendations,
      };
    }

    // Calculate trend over last 5 measurements
    const recent = this.memoryHistory.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const changeRate = (last.heapUsed - first.heapUsed) / first.heapUsed;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (changeRate > 0.05) { // 5% increase
      trend = 'increasing';
      recommendations.push('Memory usage is increasing. Consider cleanup or optimization.');
    } else if (changeRate < -0.05) { // 5% decrease
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    // Add specific recommendations based on metrics
    if (current.heapUsed > this.memoryThreshold * 0.8) {
      recommendations.push('Memory usage is above 80% of threshold. Consider immediate cleanup.');
    }

    if (current.socketRooms > 1000) {
      recommendations.push('High number of socket rooms detected. Review room cleanup logic.');
    }

    if (this.gcHistory.length > 0) {
      const timeSinceLastGC = Date.now() - this.gcHistory[this.gcHistory.length - 1];
      if (timeSinceLastGC > 5 * 60 * 1000) { // 5 minutes
        recommendations.push('No recent garbage collection detected. Consider forcing GC.');
      }
    }

    return {
      current,
      trend,
      changeRate,
      recommendations,
    };
  }

  /**
   * Get detailed memory metrics for monitoring
   */
  getMetrics() {
    const current = this.getCurrentMemoryUsage();
    const trend = this.getMemoryTrend();
    
    // Calculate room statistics
    const roomStats = {
      total: this.rooms.size,
      empty: 0,
      active: 0,
      idle: 0,
    };

    const now = Date.now();
    const idleThreshold = now - this.MAX_ROOM_IDLE_TIME;

    for (const room of this.rooms.values()) {
      if (room.socketIds.size === 0) {
        roomStats.empty++;
      } else if (room.lastActivity < idleThreshold) {
        roomStats.idle++;
      } else {
        roomStats.active++;
      }
    }

    return {
      current,
      trend: trend.trend,
      changeRate: trend.changeRate,
      threshold: this.memoryThreshold,
      thresholdUsage: (current.heapUsed / this.memoryThreshold) * 100,
      isCritical: this.isMemoryCritical(),
      rooms: roomStats,
      connections: this.socketRooms.size,
      gcHistory: this.gcHistory.slice(-10), // Last 10 GCs
      recommendations: trend.recommendations,
      history: this.memoryHistory.slice(-20), // Last 20 measurements
    };
  }

  /**
   * Start memory monitoring background process
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      this.recordMemoryMetrics();
      
      // Check for critical memory usage
      if (this.isMemoryCritical()) {
        logger.warn('Critical memory usage detected', {
          current: this.formatBytes(this.getCurrentMemoryUsage().heapUsed),
          threshold: this.formatBytes(this.memoryThreshold),
        });
        
        // Attempt cleanup
        this.performCleanup();
      }
    }, this.MEMORY_CHECK_INTERVAL);

    // Regular cleanup
    setInterval(() => {
      this.performCleanup();
    }, this.ROOM_CLEANUP_INTERVAL);
  }

  /**
   * Get room information for debugging
   */
  getRoomDebugInfo() {
    const rooms = Array.from(this.rooms.entries()).map(([name, info]) => ({
      name,
      socketCount: info.socketIds.size,
      age: Date.now() - info.createdAt,
      lastActivity: Date.now() - info.lastActivity,
      socketIds: Array.from(info.socketIds),
    }));

    return {
      totalRooms: this.rooms.size,
      totalSockets: this.socketRooms.size,
      rooms: rooms.sort((a, b) => b.socketCount - a.socketCount), // Sort by socket count
    };
  }

  /**
   * Force cleanup of specific room
   */
  forceCleanupRoom(roomName: string): boolean {
    const room = this.rooms.get(roomName);
    if (!room) return false;

    // Remove all socket references
    for (const socketId of room.socketIds) {
      const socketRoomSet = this.socketRooms.get(socketId);
      if (socketRoomSet) {
        socketRoomSet.delete(roomName);
        if (socketRoomSet.size === 0) {
          this.socketRooms.delete(socketId);
        }
      }
    }

    // Remove room
    this.rooms.delete(roomName);
    
    logger.debug(`Forced cleanup of room: ${roomName}`);
    return true;
  }

  /**
   * Format bytes for human-readable output
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Set memory threshold
   */
  setMemoryThreshold(threshold: number): void {
    this.memoryThreshold = threshold;
    logger.info(`Memory threshold updated to ${this.formatBytes(threshold)}`);
  }

  /**
   * Clean up all tracking data
   */
  cleanup(): void {
    this.rooms.clear();
    this.socketRooms.clear();
    this.gcHistory = [];
    this.memoryHistory = [];
    logger.info('Memory manager cleanup completed');
  }
}