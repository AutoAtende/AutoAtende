import { logger } from "../utils/logger";
import moment from "moment";

export class NotificationStateManager {
  private static instance: NotificationStateManager;
  private notificationCache: Map<string, { 
    lastNotification: Date;
    count: number;
  }>;
  
  private constructor() {
    this.notificationCache = new Map();
  }

  public static getInstance(): NotificationStateManager {
    if (!this.instance) {
      this.instance = new NotificationStateManager();
    }
    return this.instance;
  }

  private generateKey(invoiceId: number, companyId: number): string {
    return `invoice_${invoiceId}_company_${companyId}`;
  }

  public async canSendNotification(
    invoiceId: number, 
    companyId: number,
    minIntervalHours: number = 24
  ): Promise<boolean> {
    const key = this.generateKey(invoiceId, companyId);
    const state = this.notificationCache.get(key);
    
    if (!state) {
      return true;
    }

    const hoursSinceLastNotification = 
      (new Date().getTime() - state.lastNotification.getTime()) / (1000 * 60 * 60);
    
    logger.debug(`Hours since last notification for invoice ${invoiceId}: ${hoursSinceLastNotification}`);
    return hoursSinceLastNotification >= minIntervalHours;
  }

  public recordNotification(invoiceId: number, companyId: number): void {
    const key = this.generateKey(invoiceId, companyId);
    const existing = this.notificationCache.get(key);
    
    this.notificationCache.set(key, {
      lastNotification: new Date(),
      count: (existing?.count || 0) + 1
    });

    logger.info(`Recorded notification for invoice ${invoiceId}, total count: ${(existing?.count || 0) + 1}`);
  }

  public clearOldRecords(maxAgeHours: number = 72): void {
    const now = new Date().getTime();
    let cleared = 0;

    for (const [key, value] of this.notificationCache.entries()) {
      const age = (now - value.lastNotification.getTime()) / (1000 * 60 * 60);
      if (age > maxAgeHours) {
        this.notificationCache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info(`Cleared ${cleared} old notification records`);
    }
  }
}

export default NotificationStateManager;