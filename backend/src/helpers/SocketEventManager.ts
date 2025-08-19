import { getIO } from "../libs/optimizedSocket";
import { logger } from "../utils/logger";

interface EventUpdate {
  action: string;
  record: any;
  timestamp: number;
}

export class SocketEventManager {
  private static instance: SocketEventManager;
  private updates: Map<string, Map<number, EventUpdate>>;
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly bufferTimeMs: number;
  
  private constructor(bufferTimeMs: number = 3000) {
    this.updates = new Map();
    this.bufferTimeMs = bufferTimeMs;
    this.startFlushInterval();
  }

  public static getInstance(bufferTimeMs?: number): SocketEventManager {
    if (!SocketEventManager.instance) {
      SocketEventManager.instance = new SocketEventManager(bufferTimeMs);
    }
    return SocketEventManager.instance;
  }

  private startFlushInterval(): void {
    if (this.flushInterval === null) {
      this.flushInterval = setInterval(() => {
        this.flushUpdates();
      }, this.bufferTimeMs);
    }
  }

  public queueUpdate(companyId: number, entityType: string, update: EventUpdate): void {
    const key = `company-${companyId}-${entityType}`;
    if (!this.updates.has(key)) {
      this.updates.set(key, new Map());
    }
    
    const entityUpdates = this.updates.get(key)!;
    entityUpdates.set(update.record.id, {
      ...update,
      timestamp: Date.now()
    });
  }

  private flushUpdates(): void {
    const io = getIO();
    const now = Date.now();

    this.updates.forEach((entityUpdates, key) => {
      const [companyId] = key.match(/company-(\d+)/)?.slice(1) ?? [];
      if (!companyId) return;

      const updates = Array.from(entityUpdates.values())
        .filter(update => now - update.timestamp >= this.bufferTimeMs);

      if (updates.length > 0) {
        try {
          // Emit batched updates to company's main channel
          io.to(`company-${companyId}-mainchannel`).emit(key, {
            action: 'batchUpdate',
            updates: updates.map(({ action, record }) => ({ action, record }))
          });

          // Clear processed updates
          updates.forEach(update => {
            entityUpdates.delete(update.record.id);
          });

          logger.debug(`Emitted ${updates.length} updates for ${key}`);
        } catch (error) {
          logger.error(`Error emitting socket updates for ${key}:`, error);
        }
      }

      // Clear empty entity maps
      if (entityUpdates.size === 0) {
        this.updates.delete(key);
      }
    });
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.updates.clear();
  }
}