import { Server as SocketIO } from 'socket.io';
import { debounce } from '../utils/helpers';
import { logger } from '../utils/logger';
import Campaign from '../models/Campaign';
import ContactList from '../models/ContactList';

interface QueuedCampaignEvent {
  campaignId: number;
  companyId: number;
  event: string;
  data: any;
  timestamp: number;
}

class CampaignSocketManager {
  private static instance: CampaignSocketManager;
  private io: SocketIO;
  private eventQueues: Map<string, QueuedCampaignEvent[]>;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 1000;
  private readonly EVENT_TTL = 5000;
  private readonly MAX_CONTACTS_PER_CAMPAIGN = 50;

  private constructor() {
    this.eventQueues = new Map();
    this.setupPeriodicFlush();
    this.setupEventCleaner();
  }

  public static getInstance(): CampaignSocketManager {
    if (!CampaignSocketManager.instance) {
      CampaignSocketManager.instance = new CampaignSocketManager();
    }
    return CampaignSocketManager.instance;
  }

  public initialize(io: SocketIO): void {
    this.io = io;
    this.setupNamespace();
  }

  private setupNamespace(): void {
    if (!this.io) return;

    const campaignNamespace = this.io.of('/campaigns');
    
    campaignNamespace.on('connection', (socket) => {
      logger.info('Cliente conectado ao namespace de campanhas');

      socket.on('subscribe', (data: { companyId: number, campaignId: number }) => {
        const room = this.getRoomName(data.companyId, data.campaignId);
        socket.join(room);
        logger.debug(`Socket entrou na sala ${room}`);
      });

      socket.on('unsubscribe', (data: { companyId: number, campaignId: number }) => {
        const room = this.getRoomName(data.companyId, data.campaignId);
        socket.leave(room);
        logger.debug(`Socket saiu da sala ${room}`);
      });

      socket.on('disconnect', () => {
        logger.info('Cliente desconectado do namespace de campanhas');
      });
    });
  }

  private getRoomName(companyId: number, campaignId: number): string {
    return `company-${companyId}-campaign-${campaignId}`;
  }

  public async splitCampaignByContactLimit(campaign: Campaign): Promise<Campaign[]> {
    try {
      if (!campaign.contactListId) {
        return [campaign];
      }

      const contactList = await ContactList.findByPk(campaign.contactListId, {
        include: ['contacts']
      });

      if (!contactList || !contactList.contacts || contactList.contacts.length <= this.MAX_CONTACTS_PER_CAMPAIGN) {
        return [campaign];
      }

      const contacts = contactList.contacts;
      const totalCampaigns = Math.ceil(contacts.length / this.MAX_CONTACTS_PER_CAMPAIGN);
      const campaigns: Campaign[] = [];

      for (let i = 0; i < totalCampaigns; i++) {
        const startIdx = i * this.MAX_CONTACTS_PER_CAMPAIGN;
        const endIdx = startIdx + this.MAX_CONTACTS_PER_CAMPAIGN;
        const campaignContacts = contacts.slice(startIdx, endIdx);

        const newContactList = await ContactList.create({
          name: `${contactList.name}_part_${i + 1}`,
          companyId: campaign.companyId
        });

        await newContactList.$set('contacts', campaignContacts);

        const newCampaign = await Campaign.create({
          ...campaign.toJSON(),
          name: `${campaign.name}_${i + 1}`,
          contactListId: newContactList.id,
          parentCampaignId: campaign.id
        });

        campaigns.push(newCampaign);
      }

      await campaign.update({ status: 'CANCELADA' });
      return campaigns;

    } catch (error) {
      logger.error('Erro ao dividir campanha:', error);
      return [campaign];
    }
  }

  public emitCampaignEvent(companyId: number, campaignId: number, event: string, data: any): void {
    const room = this.getRoomName(companyId, campaignId);
    const queueKey = `${room}-${event}`;
    
    const queuedEvent: QueuedCampaignEvent = {
      campaignId,
      companyId,
      event,
      data,
      timestamp: Date.now()
    };

    this.addToQueue(queueKey, queuedEvent);
  }

  private addToQueue(queueKey: string, event: QueuedCampaignEvent): void {
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
        
        logger.debug(`Lote de ${batch.length} eventos emitido`, {
          queueKey,
          eventTypes: batch.map(e => e.event).join(', ')
        });
      }

      this.eventQueues.set(queueKey, []);
    } catch (error) {
      logger.error('Erro ao processar fila de eventos:', {
        queueKey,
        error: error.message
      });
    }
  }

  private createBatches(events: QueuedCampaignEvent[]): QueuedCampaignEvent[][] {
    const batches: QueuedCampaignEvent[][] = [];
    for (let i = 0; i < events.length; i += this.BATCH_SIZE) {
      batches.push(events.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  private async emitBatch(events: QueuedCampaignEvent[]): Promise<void> {
    if (!this.io) return;

    try {
      events.forEach(event => {
        const room = this.getRoomName(event.companyId, event.campaignId);
        this.io.of('/campaigns').to(room).emit(event.event, event.data);
      });
    } catch (error) {
      logger.error('Erro ao emitir lote:', {
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

export const campaignSocketManager = CampaignSocketManager.getInstance();