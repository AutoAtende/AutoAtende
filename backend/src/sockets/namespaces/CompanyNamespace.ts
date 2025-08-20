import { Server as SocketIO, Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { EventBatcher } from '../utils/EventBatcher';

interface CompanyNamespaceConfig {
  maxConnections: number;
  rateLimitPerSecond: number;
  memoryThreshold: number;
}

export class CompanyNamespace {
  private companyId: number;
  private io: SocketIO;
  private eventBatcher: EventBatcher;
  private sockets: Map<string, Socket> = new Map();
  private lastActivity: number = Date.now();
  private config: CompanyNamespaceConfig = {
    maxConnections: 200,
    rateLimitPerSecond: 100,
    memoryThreshold: 50 * 1024 * 1024, // 50MB
  };

  constructor(companyId: number, io: SocketIO, eventBatcher: EventBatcher) {
    this.companyId = companyId;
    this.io = io;
    this.eventBatcher = eventBatcher;
  }

  async initialize(): Promise<void> {
    logger.debug(`Initializing company namespace for company ${this.companyId}`);
    this.lastActivity = Date.now();
  }

  addSocket(socket: Socket): void {
    this.sockets.set(socket.id, socket);
    this.lastActivity = Date.now();
    
    socket.on('disconnect', () => {
      this.removeSocket(socket.id);
    });
  }

  removeSocket(socketId: string): void {
    this.sockets.delete(socketId);
    this.lastActivity = Date.now();
  }

  emit(event: string, data: any): void {
    this.eventBatcher.addEvent(`company:${this.companyId}`, event, data);
  }

  broadcast(event: string, data: any, excludeSocketId?: string): void {
    for (const [socketId, socket] of this.sockets) {
      if (socketId !== excludeSocketId) {
        socket.emit(event, data);
      }
    }
  }

  getConnectionCount(): number {
    return this.sockets.size;
  }

  getLastActivity(): number {
    return this.lastActivity;
  }

  async cleanup(): Promise<void> {
    logger.debug(`Cleaning up company namespace for company ${this.companyId}`);
    
    // Disconnect all sockets
    for (const socket of this.sockets.values()) {
      socket.disconnect(true);
    }
    
    this.sockets.clear();
  }
}