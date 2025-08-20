import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { ConnectionPool } from '../utils/ConnectionPool';
import { PerformanceMetrics } from '../utils/PerformanceMetrics';
import { EventBatcher } from '../utils/EventBatcher';
import { MemoryManager } from '../utils/MemoryManager';

interface SocketUserData {
  userId: number;
  companyId: number;
  profile: string;
  isSuper: boolean;
  lastActivity: number;
  connectionTime: number;
}

interface EventHandlerDependencies {
  connectionPool: ConnectionPool;
  performanceMetrics: PerformanceMetrics;
  eventBatcher: EventBatcher;
  memoryManager: MemoryManager;
}

export class OptimizedEventHandler {
  private eventStats = {
    totalEvents: 0,
    eventsByType: new Map<string, number>(),
    errors: 0,
    processingTimes: [] as number[],
  };

  setupHandlers(
    socket: Socket, 
    userData: SocketUserData, 
    dependencies: EventHandlerDependencies
  ): void {
    const { connectionPool, performanceMetrics, eventBatcher, memoryManager } = dependencies;
    const { userId, companyId } = userData;

    // Join user status room
    socket.on('join_user_status', () => {
      socket.join(`user_status:${userId}`);
      this.trackEvent('join_user_status');
    });

    // Join ticket room
    socket.on('join_ticket', (ticketId: number) => {
      if (ticketId && typeof ticketId === 'number') {
        socket.join(`ticket:${ticketId}`);
        logger.debug(`User ${userId} joined ticket room ${ticketId}`);
        this.trackEvent('join_ticket');
      }
    });

    // Leave ticket room
    socket.on('leave_ticket', (ticketId: number) => {
      if (ticketId && typeof ticketId === 'number') {
        socket.leave(`ticket:${ticketId}`);
        logger.debug(`User ${userId} left ticket room ${ticketId}`);
        this.trackEvent('leave_ticket');
      }
    });

    // Join queue room
    socket.on('join_queue', (queueId: number) => {
      if (queueId && typeof queueId === 'number') {
        socket.join(`queue:${queueId}`);
        logger.debug(`User ${userId} joined queue room ${queueId}`);
        this.trackEvent('join_queue');
      }
    });

    // Leave queue room
    socket.on('leave_queue', (queueId: number) => {
      if (queueId && typeof queueId === 'number') {
        socket.leave(`queue:${queueId}`);
        logger.debug(`User ${userId} left queue room ${queueId}`);
        this.trackEvent('leave_queue');
      }
    });

    // User typing indicator
    socket.on('user_typing', (data: { ticketId: number; isTyping: boolean }) => {
      if (data?.ticketId && typeof data.isTyping === 'boolean') {
        eventBatcher.addEvent(
          `ticket:${data.ticketId}`,
          'user_typing',
          {
            userId,
            userName: userData.profile,
            isTyping: data.isTyping,
            timestamp: Date.now(),
          },
          'high'
        );
        this.trackEvent('user_typing');
      }
    });

    // Message read status
    socket.on('message_read', (data: { messageId: number; ticketId: number }) => {
      if (data?.messageId && data?.ticketId) {
        eventBatcher.addEvent(
          `ticket:${data.ticketId}`,
          'message_read',
          {
            messageId: data.messageId,
            userId,
            timestamp: Date.now(),
          },
          'medium'
        );
        this.trackEvent('message_read');
      }
    });

    // User online status
    socket.on('update_user_status', async (status: 'online' | 'away' | 'busy') => {
      try {
        if (['online', 'away', 'busy'].includes(status)) {
          // Update in database
          const { default: User } = await import('../../models/User');
          await User.update({ online: status === 'online' }, { where: { id: userId } });

          // Broadcast to company
          eventBatcher.addEvent(
            `company:${companyId}`,
            'user_status_updated',
            {
              userId,
              status,
              timestamp: Date.now(),
            },
            'low'
          );
          
          this.trackEvent('update_user_status');
        }
      } catch (error) {
        logger.error(`Error updating user status for ${userId}:`, error);
        this.eventStats.errors++;
      }
    });

    // Heartbeat/keepalive
    socket.on('heartbeat', () => {
      connectionPool.updateLastActivity(companyId, userId, socket.id);
      socket.emit('heartbeat_ack', { timestamp: Date.now() });
      this.trackEvent('heartbeat');
    });

    // Request server metrics
    socket.on('request_metrics', () => {
      if (userData.isSuper || userData.profile === 'admin') {
        socket.emit('server_metrics', {
          performance: performanceMetrics.getBasicMetrics(),
          memory: memoryManager.getMetrics(),
          connections: connectionPool.getMetrics(),
          events: this.getEventStats(),
        });
        this.trackEvent('request_metrics');
      }
    });

    // Error handling
    socket.on('client_error', (error: any) => {
      logger.error(`Client error from user ${userId}:`, error);
      performanceMetrics.incrementErrors();
      this.eventStats.errors++;
    });

    // Generic room management
    socket.on('join_room', (roomName: string) => {
      if (this.isValidRoomName(roomName, companyId)) {
        socket.join(roomName);
        logger.debug(`User ${userId} joined room ${roomName}`);
        this.trackEvent('join_room');
      }
    });

    socket.on('leave_room', (roomName: string) => {
      if (this.isValidRoomName(roomName, companyId)) {
        socket.leave(roomName);
        logger.debug(`User ${userId} left room ${roomName}`);
        this.trackEvent('leave_room');
      }
    });

    // Batch event acknowledgment
    socket.on('batch_ack', (batchId: string) => {
      logger.debug(`Received batch acknowledgment for ${batchId} from user ${userId}`);
      this.trackEvent('batch_ack');
    });
  }

  private trackEvent(eventType: string): void {
    const startTime = Date.now();
    
    this.eventStats.totalEvents++;
    const currentCount = this.eventStats.eventsByType.get(eventType) || 0;
    this.eventStats.eventsByType.set(eventType, currentCount + 1);
    
    // Track processing time (simplified)
    const processingTime = Date.now() - startTime;
    this.eventStats.processingTimes.push(processingTime);
    
    // Keep only last 1000 processing times
    if (this.eventStats.processingTimes.length > 1000) {
      this.eventStats.processingTimes = this.eventStats.processingTimes.slice(-1000);
    }
  }

  private isValidRoomName(roomName: string, companyId: number): boolean {
    // Validate room name to prevent unauthorized access
    const validPrefixes = [
      `company:${companyId}`,
      `queue:`,
      `ticket:`,
      `user:`,
    ];
    
    return validPrefixes.some(prefix => roomName.startsWith(prefix));
  }

  getEventStats() {
    const avgProcessingTime = this.eventStats.processingTimes.length > 0
      ? this.eventStats.processingTimes.reduce((a, b) => a + b, 0) / this.eventStats.processingTimes.length
      : 0;

    return {
      totalEvents: this.eventStats.totalEvents,
      eventsByType: Object.fromEntries(this.eventStats.eventsByType),
      errors: this.eventStats.errors,
      averageProcessingTime: avgProcessingTime,
      recentProcessingTimes: this.eventStats.processingTimes.slice(-10),
    };
  }

  reset(): void {
    this.eventStats = {
      totalEvents: 0,
      eventsByType: new Map<string, number>(),
      errors: 0,
      processingTimes: [],
    };
  }
}