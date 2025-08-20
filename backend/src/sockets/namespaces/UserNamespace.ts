import { Server as SocketIO, Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { EventBatcher } from '../utils/EventBatcher';

interface UserNamespaceConfig {
  maxConnections: number;
  sessionTimeout: number;
  notificationBuffer: number;
}

export class UserNamespace {
  private userId: number;
  private io: SocketIO;
  private eventBatcher: EventBatcher;
  private sockets: Map<string, Socket> = new Map();
  private lastActivity: number = Date.now();
  private notificationQueue: any[] = [];
  private config: UserNamespaceConfig = {
    maxConnections: 5,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    notificationBuffer: 50,
  };

  constructor(userId: number, io: SocketIO, eventBatcher: EventBatcher) {
    this.userId = userId;
    this.io = io;
    this.eventBatcher = eventBatcher;
  }

  async initialize(): Promise<void> {
    logger.debug(`Initializing user namespace for user ${this.userId}`);
    this.lastActivity = Date.now();
  }

  addSocket(socket: Socket): void {
    this.sockets.set(socket.id, socket);
    this.lastActivity = Date.now();
    
    socket.on('disconnect', () => {
      this.removeSocket(socket.id);
    });

    // Send any queued notifications
    this.flushNotificationQueue(socket);
  }

  removeSocket(socketId: string): void {
    this.sockets.delete(socketId);
    this.lastActivity = Date.now();
  }

  emit(event: string, data: any): void {
    if (this.sockets.size > 0) {
      this.eventBatcher.addEvent(`user:${this.userId}`, event, data);
    } else {
      // Queue notification if user is offline
      this.queueNotification(event, data);
    }
  }

  broadcast(event: string, data: any, excludeSocketId?: string): void {
    for (const [socketId, socket] of this.sockets) {
      if (socketId !== excludeSocketId) {
        socket.emit(event, data);
      }
    }
  }

  private queueNotification(event: string, data: any): void {
    if (this.notificationQueue.length >= this.config.notificationBuffer) {
      // Remove oldest notification
      this.notificationQueue.shift();
    }
    
    this.notificationQueue.push({
      event,
      data,
      timestamp: Date.now(),
    });
  }

  private flushNotificationQueue(socket: Socket): void {
    if (this.notificationQueue.length === 0) return;

    for (const notification of this.notificationQueue) {
      socket.emit(notification.event, {
        ...notification.data,
        _queued: true,
        _timestamp: notification.timestamp,
      });
    }

    this.notificationQueue = [];
    logger.debug(`Flushed ${this.notificationQueue.length} queued notifications for user ${this.userId}`);
  }

  getConnectionCount(): number {
    return this.sockets.size;
  }

  getLastActivity(): number {
    return this.lastActivity;
  }

  isOnline(): boolean {
    return this.sockets.size > 0;
  }

  async cleanup(): Promise<void> {
    logger.debug(`Cleaning up user namespace for user ${this.userId}`);
    
    // Disconnect all sockets
    for (const socket of this.sockets.values()) {
      socket.disconnect(true);
    }
    
    this.sockets.clear();
    this.notificationQueue = [];
  }
}