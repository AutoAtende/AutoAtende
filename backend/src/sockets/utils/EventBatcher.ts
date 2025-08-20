import { logger } from '../../utils/logger';
import socketManager from '../SocketManager';

interface BatchedEvent {
  id: string;
  type: string;
  room: string;
  data: any;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number;
  compressionThreshold: number;
  maxRetries: number;
  priorityLevels: {
    high: number;    // ms delay
    medium: number;  // ms delay
    low: number;     // ms delay
  };
}

interface CompressionResult {
  compressed: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Advanced event batching system for Socket.io optimization
 * Reduces overhead by batching multiple events and compressing payloads
 */
export class EventBatcher {
  private eventQueue: Map<string, BatchedEvent[]> = new Map();
  private flushTimers: Map<string, NodeJS.Timeout> = new Map();
  private compressionCache: Map<string, any> = new Map();
  private batchStats = {
    totalEvents: 0,
    batchedEvents: 0,
    compressionSavings: 0,
    averageBatchSize: 0,
    flushCount: 0,
  };

  private config: BatchConfig = {
    maxBatchSize: 50,
    flushInterval: 100, // 100ms
    compressionThreshold: 1024, // 1KB
    maxRetries: 3,
    priorityLevels: {
      high: 10,    // 10ms delay
      medium: 50,  // 50ms delay
      low: 200,    // 200ms delay
    },
  };

  constructor(flushInterval?: number) {
    if (flushInterval) {
      this.config.flushInterval = flushInterval;
    }
    this.startBackgroundFlush();
  }

  /**
   * Add event to batch queue
   */
  addEvent(
    room: string,
    eventType: string,
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    const event: BatchedEvent = {
      id: this.generateEventId(),
      type: eventType,
      room,
      data,
      priority,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: this.config.maxRetries,
    };

    // Get or create queue for this room
    if (!this.eventQueue.has(room)) {
      this.eventQueue.set(room, []);
    }

    const queue = this.eventQueue.get(room)!;
    queue.push(event);
    this.batchStats.totalEvents++;

    // Sort by priority and timestamp
    queue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Check if we should flush immediately
    const shouldFlushImmediately = 
      priority === 'high' || 
      queue.length >= this.config.maxBatchSize ||
      this.shouldFlushByDataSize(queue);

    if (shouldFlushImmediately) {
      this.flushRoom(room);
    } else {
      this.scheduleFlush(room, priority);
    }
  }

  /**
   * Add multiple events as a batch
   */
  addEventBatch(
    room: string,
    events: Array<{ type: string; data: any; priority?: 'high' | 'medium' | 'low' }>
  ): void {
    for (const event of events) {
      this.addEvent(room, event.type, event.data, event.priority || 'medium');
    }
  }

  /**
   * Schedule flush for a room based on priority
   */
  private scheduleFlush(room: string, priority: 'high' | 'medium' | 'low'): void {
    // Clear existing timer
    const existingTimer = this.flushTimers.get(room);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer based on priority
    const delay = this.config.priorityLevels[priority];
    const timer = setTimeout(() => {
      this.flushRoom(room);
    }, delay);

    this.flushTimers.set(room, timer);
  }

  /**
   * Flush all events for a specific room
   */
  private async flushRoom(room: string): Promise<void> {
    const queue = this.eventQueue.get(room);
    if (!queue || queue.length === 0) return;

    // Clear flush timer
    const timer = this.flushTimers.get(room);
    if (timer) {
      clearTimeout(timer);
      this.flushTimers.delete(room);
    }

    try {
      // Group events by type for better compression
      const eventGroups = this.groupEventsByType(queue);
      
      // Process each group
      for (const [eventType, events] of eventGroups.entries()) {
        await this.emitBatchedEvents(room, eventType, events);
      }

      // Update statistics
      this.batchStats.batchedEvents += queue.length;
      this.batchStats.flushCount++;
      this.updateAverageBatchSize(queue.length);

      // Clear the queue
      this.eventQueue.set(room, []);

    } catch (error) {
      logger.error(`Error flushing events for room ${room}:`, error);
      
      // Retry failed events
      await this.retryFailedEvents(room, queue);
    }
  }

  /**
   * Group events by type for better batching
   */
  private groupEventsByType(events: BatchedEvent[]): Map<string, BatchedEvent[]> {
    const groups = new Map<string, BatchedEvent[]>();
    
    for (const event of events) {
      if (!groups.has(event.type)) {
        groups.set(event.type, []);
      }
      groups.get(event.type)!.push(event);
    }
    
    return groups;
  }

  /**
   * Emit batched events with compression
   */
  private async emitBatchedEvents(
    room: string,
    eventType: string,
    events: BatchedEvent[]
  ): Promise<void> {
    try {
      const io = socketManager.getIO();
      
      if (events.length === 1) {
        // Single event - emit directly
        const event = events[0];
        io.to(room).emit(eventType, event.data);
        return;
      }

      // Multiple events - batch them
      const batchData = {
        type: 'batch',
        eventType,
        events: events.map(e => ({
          id: e.id,
          data: e.data,
          timestamp: e.timestamp,
        })),
        batchId: this.generateBatchId(),
        timestamp: Date.now(),
        room,
      };

      // Compress if necessary
      const compressionResult = await this.compressIfNeeded(batchData);
      const finalData = compressionResult.compressed ? 
        { ...batchData, compressed: true, compressionRatio: compressionResult.compressionRatio } : 
        batchData;

      // Emit the batched event
      io.to(room).emit('batched_events', finalData);

      // Update compression statistics
      if (compressionResult.compressed) {
        this.batchStats.compressionSavings += 
          compressionResult.originalSize - compressionResult.compressedSize;
      }

      logger.debug(`Batched ${events.length} events for room ${room}`, {
        eventType,
        compressed: compressionResult.compressed,
        originalSize: compressionResult.originalSize,
        finalSize: compressionResult.compressed ? compressionResult.compressedSize : compressionResult.originalSize,
      });

    } catch (error) {
      logger.error(`Error emitting batched events for room ${room}:`, error);
      throw error;
    }
  }

  /**
   * Compress data if it exceeds threshold
   */
  private async compressIfNeeded(data: any): Promise<CompressionResult> {
    try {
      const jsonString = JSON.stringify(data);
      const originalSize = Buffer.byteLength(jsonString, 'utf8');
      
      if (originalSize < this.config.compressionThreshold) {
        return {
          compressed: false,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 1,
        };
      }

      // Use Node.js built-in zlib for compression
      const zlib = require('zlib');
      const compressed = zlib.gzipSync(jsonString, {
        level: 6, // Good balance of speed and compression
        windowBits: 15,
        memLevel: 8,
      });

      const compressedSize = compressed.length;
      const compressionRatio = originalSize / compressedSize;

      // Only use compression if it saves significant space
      if (compressionRatio > 1.2) { // At least 20% savings
        return {
          compressed: true,
          originalSize,
          compressedSize,
          compressionRatio,
        };
      }

      return {
        compressed: false,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
      };

    } catch (error) {
      logger.error('Error during compression:', error);
      return {
        compressed: false,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
      };
    }
  }

  /**
   * Retry failed events
   */
  private async retryFailedEvents(room: string, events: BatchedEvent[]): Promise<void> {
    const retryableEvents: BatchedEvent[] = [];
    
    for (const event of events) {
      if (event.retries < event.maxRetries) {
        event.retries++;
        retryableEvents.push(event);
      } else {
        logger.error(`Event ${event.id} exceeded max retries and will be dropped`, {
          room,
          type: event.type,
          retries: event.retries,
        });
      }
    }

    if (retryableEvents.length > 0) {
      // Add retryable events back to queue with delay
      setTimeout(() => {
        const queue = this.eventQueue.get(room) || [];
        queue.unshift(...retryableEvents); // Add to front for priority
        this.eventQueue.set(room, queue);
        this.scheduleFlush(room, 'high'); // Retry with high priority
      }, 1000); // 1 second delay
    }
  }

  /**
   * Check if queue should be flushed based on data size
   */
  private shouldFlushByDataSize(queue: BatchedEvent[]): boolean {
    const totalSize = queue.reduce((size, event) => {
      return size + JSON.stringify(event.data).length;
    }, 0);
    
    return totalSize > this.config.compressionThreshold * 2; // 2KB threshold
  }

  /**
   * Start background flush process
   */
  private startBackgroundFlush(): void {
    setInterval(() => {
      this.flushAllRooms();
    }, this.config.flushInterval * 2); // Fallback flush every 200ms
  }

  /**
   * Flush all rooms (fallback mechanism)
   */
  private flushAllRooms(): void {
    const rooms = Array.from(this.eventQueue.keys());
    for (const room of rooms) {
      const queue = this.eventQueue.get(room);
      if (queue && queue.length > 0) {
        // Check if oldest event is too old
        const oldestEvent = queue[queue.length - 1]; // Events are sorted, oldest is last
        const age = Date.now() - oldestEvent.timestamp;
        
        if (age > this.config.flushInterval * 3) { // 300ms max age
          this.flushRoom(room);
        }
      }
    }
  }

  /**
   * Emit event immediately (bypass batching)
   */
  emitImmediate(room: string, eventType: string, data: any): void {
    try {
      const io = socketManager.getIO();
      io.to(room).emit(eventType, data);
      
      logger.debug(`Immediate emit to room ${room}`, { eventType });
    } catch (error) {
      logger.error(`Error in immediate emit to room ${room}:`, error);
    }
  }

  /**
   * Force flush all pending events
   */
  async flushAll(): Promise<void> {
    const rooms = Array.from(this.eventQueue.keys());
    const flushPromises = rooms.map(room => this.flushRoom(room));
    await Promise.all(flushPromises);
  }

  /**
   * Get batching statistics
   */
  getStats() {
    const queueStats = Array.from(this.eventQueue.entries()).map(([room, queue]) => ({
      room,
      pendingEvents: queue.length,
      oldestEvent: queue.length > 0 ? Math.min(...queue.map(e => e.timestamp)) : null,
      priorities: {
        high: queue.filter(e => e.priority === 'high').length,
        medium: queue.filter(e => e.priority === 'medium').length,
        low: queue.filter(e => e.priority === 'low').length,
      },
    }));

    return {
      ...this.batchStats,
      config: this.config,
      activeRooms: this.eventQueue.size,
      totalPendingEvents: Array.from(this.eventQueue.values())
        .reduce((total, queue) => total + queue.length, 0),
      queueStats,
      compressionSavingsPercentage: this.batchStats.totalEvents > 0 
        ? (this.batchStats.compressionSavings / (this.batchStats.totalEvents * 100)) * 100
        : 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Event batcher configuration updated', { config: this.config });
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Update average batch size statistic
   */
  private updateAverageBatchSize(currentBatchSize: number): void {
    const totalBatches = this.batchStats.flushCount;
    const currentAverage = this.batchStats.averageBatchSize;
    
    this.batchStats.averageBatchSize = 
      ((currentAverage * (totalBatches - 1)) + currentBatchSize) / totalBatches;
  }

  /**
   * Clear all queues and timers
   */
  cleanup(): void {
    // Clear all timers
    for (const timer of this.flushTimers.values()) {
      clearTimeout(timer);
    }
    this.flushTimers.clear();

    // Clear queues
    this.eventQueue.clear();
    this.compressionCache.clear();

    // Reset statistics
    this.batchStats = {
      totalEvents: 0,
      batchedEvents: 0,
      compressionSavings: 0,
      averageBatchSize: 0,
      flushCount: 0,
    };

    logger.info('Event batcher cleanup completed');
  }
}