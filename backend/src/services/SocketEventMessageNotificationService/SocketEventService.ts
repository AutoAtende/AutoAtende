import { Server as SocketIO } from 'socket.io';
import { debounce } from '../../utils/helpers';
import { logger } from '../../utils/logger';

interface QueuedEvent {
  room?: string;
  namespace: string;
  event: string;
  data: any;
  timestamp: number;
}

export class SocketEventService {
  private static instance: SocketEventService;
  private io: SocketIO;
  private eventQueues: Map<string, QueuedEvent[]>;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 1000;
  private readonly EVENT_TTL = 5000;

  private readonly NAMESPACES = {
    TICKET: 'ticket',
    CAMPAIGN: 'campaign',
    CONTACT: 'contact',
    QUEUE: 'queue',
    WHATSAPP: 'whatsapp',
    MESSAGE: 'message',
    USER: 'user',
    ANNOUNCEMENT: 'announcement',
    TAG: 'tag',
    CHAT: 'chat',
    WEBHOOK: 'webhook',
    QUICKMESSAGE: 'quickmessage',
    HELP: 'help',
    NOTIFICATION: 'notification',
    MENU_CONFIG: 'menu-config',
    SETTINGS: 'settings',
    REASON: 'reason',
    PAYMENT: 'payment'
  };

  private constructor() {
    this.eventQueues = new Map();
    this.setupPeriodicFlush();
    this.setupEventCleaner();
  }

  public static getInstance(): SocketEventService {
    if (!SocketEventService.instance) {
      SocketEventService.instance = new SocketEventService();
    }
    return SocketEventService.instance;
  }

  public initialize(io: SocketIO): void {
    this.io = io;
    this.setupNamespaces();
  }

  private setupNamespaces(): void {
    if (!this.io) return;

    Object.values(this.NAMESPACES).forEach(namespace => {
      const nsp = this.io.of(`/${namespace}`);
      nsp.on('connection', (socket) => {
        logger.info(`Client connected to ${namespace} namespace`);
        
        socket.on('join-company', (companyId: number) => {
          socket.join(`company-${companyId}-${namespace}`);
          logger.debug(`Socket joined company-${companyId}-${namespace}`);
        });

        socket.on('join-ticket', (ticketId: string) => {
          socket.join(ticketId);
          logger.debug(`Socket joined ticket room ${ticketId}`);
        });

        socket.on('disconnect', () => {
          logger.info(`Client disconnected from ${namespace} namespace`);
        });
      });
    });
  }

  // Ticket Events
  public emitTicketEvent(companyId: number, action: string, ticket: any, userId?: number): void {
    const event = `company-${companyId}-ticket`;
    const data = { action, ticket, ticketId: ticket.id };
    
    // Main channel
    this.queueEvent(companyId, 'TICKET', event, data);
    
    // Status specific channel
    if (ticket.status) {
      this.queueEventToRoom(`company-${companyId}-${ticket.status}`, 'TICKET', event, data);
    }

    // User specific channel
    if (userId) {
      this.queueEventToRoom(`user-${userId}`, 'TICKET', event, data);
    }
  }

  // Campaign Events
  public emitCampaignEvent(companyId: number, action: string, campaign: any): void {
    const event = `company-${companyId}-campaign`;
    this.queueEvent(companyId, 'CAMPAIGN', event, {
      action,
      campaign
    });
  }

  // WhatsApp Events
  public emitWhatsAppEvent(companyId: number, action: string, whatsapp: any): void {
    const event = `company-${companyId}-whatsappSession`;
    this.queueEvent(companyId, 'WHATSAPP', event, {
      action,
      session: whatsapp
    });
  }

  // Message Events
  public emitMessageEvent(companyId: number, action: string, message: any, ticket?: any): void {
    const event = `company-${companyId}-appMessage`;
    const data = { action, message };
    
    this.queueEvent(companyId, 'MESSAGE', event, data);

    if (ticket?.id) {
      this.queueEventToRoom(ticket.id.toString(), 'MESSAGE', event, data);
    }
  }

  // Contact Events
  public emitContactEvent(companyId: number, action: string, contact: any): void {
    const event = `company-${companyId}-contact`;
    this.queueEvent(companyId, 'CONTACT', event, {
      action,
      contact
    });
  }

  // Queue Events
  public emitQueueEvent(companyId: number, action: string, queue: any): void {
    const event = `company-${companyId}-queue`;
    this.queueEvent(companyId, 'QUEUE', event, {
      action,
      queue
    });
  }

  // User Events
  public emitUserEvent(companyId: number, action: string, user: any): void {
    const event = `company-${companyId}-user`;
    this.queueEvent(companyId, 'USER', event, {
      action,
      user
    });
  }

  // Settings Events
  public emitSettingsEvent(companyId: number, action: string, setting: any): void {
    const event = `company-${companyId}-settings`;
    this.queueEvent(companyId, 'SETTINGS', event, {
      action,
      setting
    });
  }

  // Chat Events
  public emitChatEvent(companyId: number, action: string, chat: any, userId?: number): void {
    const event = `company-${companyId}-chat`;
    const data = { action, chat };

    this.queueEvent(companyId, 'CHAT', event, data);
    
    if (userId) {
      this.queueEventToRoom(`user-${userId}`, 'CHAT', event, data);
    }
  }

  // Notification Events
  public emitNotification(companyId: number, userId: number, notification: any): void {
    const event = `company-${companyId}-notification`;
    this.queueEventToRoom(`user-${userId}`, 'NOTIFICATION', event, notification);
  }

  // Base methods for queuing events
  private getQueueKey(namespace: string, event: string): string {
    return `${namespace}-${event}`;
  }

  public queueEvent(companyId: number, namespace: string, event: string, data: any): void {
    const queueKey = this.getQueueKey(namespace, event);
    const queuedEvent: QueuedEvent = {
      namespace: `/company-${companyId}-mainchannel`,
      event,
      data,
      timestamp: Date.now()
    };

    this.addToQueue(queueKey, queuedEvent);
  }

  public queueEventToRoom(room: string, namespace: string, event: string, data: any): void {
    const queueKey = this.getQueueKey(namespace, event);
    const queuedEvent: QueuedEvent = {
      room,
      namespace: `/${namespace}`,
      event,
      data,
      timestamp: Date.now()
    };

    this.addToQueue(queueKey, queuedEvent);
  }

  private addToQueue(queueKey: string, event: QueuedEvent): void {
    if (!this.eventQueues.has(queueKey)) {
      this.eventQueues.set(queueKey, []);
    }

    this.eventQueues.get(queueKey).push(event);
    this.debouncedFlushQueue(queueKey);
  }

  private debouncedFlushQueue = debounce((queueKey: string) => {
    this.flushQueue(queueKey);
  }, 100);

  private async flushQueue(queueKey: string): Promise<void> {
    if (!this.io || !this.eventQueues.has(queueKey)) return;

    try {
      const events = this.eventQueues.get(queueKey);
      if (!events || events.length === 0) return;

      const batches = this.createBatches(events);
      
      for (const batch of batches) {
        if (batch.length === 0) continue;

        await this.emitBatch(batch);
        
        logger.debug(`Emitted batch of ${batch.length} events`, {
          queueKey,
          eventTypes: batch.map(e => e.event).join(', ')
        });
      }

      this.eventQueues.set(queueKey, []);
    } catch (error) {
      logger.error('Error flushing event queue:', {
        queueKey,
        error: error.message
      });
    }
  }

  private createBatches(events: QueuedEvent[]): QueuedEvent[][] {
    const batches: QueuedEvent[][] = [];
    for (let i = 0; i < events.length; i += this.BATCH_SIZE) {
      batches.push(events.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  private async emitBatch(events: QueuedEvent[]): Promise<void> {
    if (!this.io) return;

    try {
      events.forEach(event => {
        if (event.room) {
          // Emit to specific room
          this.io.to(event.room).emit(event.event, event.data);
        } else {
          // Emit to namespace
          this.io.of(event.namespace).emit(event.event, event.data);
        }
      });
    } catch (error) {
      logger.error('Error emitting batch:', {
        error: error.message,
        eventCount: events.length
      });
    }
  }

  private setupPeriodicFlush(): void {
    setInterval(() => {
      this.eventQueues.forEach((_, queueKey) => {
        this.flushQueue(queueKey);
      });
    }, this.FLUSH_INTERVAL);
  }

  private setupEventCleaner(): void {
    setInterval(() => {
      const now = Date.now();
      this.eventQueues.forEach((events, queueKey) => {
        const validEvents = events.filter(
          event => now - event.timestamp <= this.EVENT_TTL
        );
        this.eventQueues.set(queueKey, validEvents);
      });
    }, this.EVENT_TTL);
  }
}

export const socketEventService = SocketEventService.getInstance();