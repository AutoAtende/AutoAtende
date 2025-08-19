import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Ticket, Message, OfflineTicket, OfflineMessage } from '../types';
import apiService from './api';
import socketService from './socket';

interface OfflineQueue {
  id: string;
  type: 'message' | 'ticket_update' | 'media_upload';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineService {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private offlineQueue: OfflineQueue[] = [];
  
  private readonly STORAGE_KEYS = {
    OFFLINE_TICKETS: 'offline_tickets',
    OFFLINE_MESSAGES: 'offline_messages',
    OFFLINE_QUEUE: 'offline_queue',
    LAST_SYNC: 'last_sync',
  };

  async initialize() {
    await this.loadOfflineData();
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        // Network restored, start sync
        this.syncOfflineData();
      }
    });
  }

  private async loadOfflineData() {
    try {
      const queueData = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_QUEUE);
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }

  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_QUEUE, 
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Ticket Management
  async cacheTickets(tickets: Ticket[]) {
    try {
      const offlineTickets: OfflineTicket[] = tickets.map(ticket => ({
        ...ticket,
        _offline: false,
        _lastSync: Date.now(),
      }));

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_TICKETS,
        JSON.stringify(offlineTickets)
      );
    } catch (error) {
      console.error('Error caching tickets:', error);
    }
  }

  async getCachedTickets(): Promise<OfflineTicket[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_TICKETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached tickets:', error);
      return [];
    }
  }

  async updateCachedTicket(ticketId: number, updates: Partial<Ticket>) {
    try {
      const cachedTickets = await this.getCachedTickets();
      const ticketIndex = cachedTickets.findIndex(t => t.id === ticketId);
      
      if (ticketIndex >= 0) {
        cachedTickets[ticketIndex] = {
          ...cachedTickets[ticketIndex],
          ...updates,
          _lastSync: Date.now(),
        };
        
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.OFFLINE_TICKETS,
          JSON.stringify(cachedTickets)
        );
      }
    } catch (error) {
      console.error('Error updating cached ticket:', error);
    }
  }

  // Message Management
  async cacheMessages(ticketId: number, messages: Message[]) {
    try {
      const key = `${this.STORAGE_KEYS.OFFLINE_MESSAGES}_${ticketId}`;
      const offlineMessages: OfflineMessage[] = messages.map(message => ({
        ...message,
        _offline: false,
        _pending: false,
        _tempId: message.id,
      }));

      await AsyncStorage.setItem(key, JSON.stringify(offlineMessages));
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  }

  async getCachedMessages(ticketId: number): Promise<OfflineMessage[]> {
    try {
      const key = `${this.STORAGE_KEYS.OFFLINE_MESSAGES}_${ticketId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  }

  async addOfflineMessage(ticketId: number, message: Omit<Message, 'id'>): Promise<OfflineMessage> {
    try {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const offlineMessage: OfflineMessage = {
        ...message,
        id: tempId,
        _offline: true,
        _pending: true,
        _tempId: tempId,
      };

      // Add to cached messages
      const cachedMessages = await this.getCachedMessages(ticketId);
      cachedMessages.push(offlineMessage);
      
      const key = `${this.STORAGE_KEYS.OFFLINE_MESSAGES}_${ticketId}`;
      await AsyncStorage.setItem(key, JSON.stringify(cachedMessages));

      // Add to sync queue
      await this.addToQueue('message', {
        ticketId,
        message: {
          ...message,
          tempId,
        },
      });

      return offlineMessage;
    } catch (error) {
      console.error('Error adding offline message:', error);
      throw error;
    }
  }

  // Queue Management
  private async addToQueue(type: OfflineQueue['type'], data: any) {
    const queueItem: OfflineQueue = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineQueue.push(queueItem);
    await this.saveOfflineQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncOfflineData();
    }
  }

  // Sync Operations
  async syncOfflineData() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('Starting offline data sync...');

    try {
      // Process queue items
      for (const item of [...this.offlineQueue]) {
        try {
          await this.processQueueItem(item);
          
          // Remove from queue on success
          this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          
          // Increment retry count
          const queueItem = this.offlineQueue.find(q => q.id === item.id);
          if (queueItem) {
            queueItem.retryCount++;
            
            // Remove items that have failed too many times
            if (queueItem.retryCount >= 3) {
              this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
              console.warn(`Removing queue item ${item.id} after 3 failed attempts`);
            }
          }
        }
      }

      await this.saveOfflineQueue();
      await this.updateLastSyncTime();
      
      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Error during offline sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processQueueItem(item: OfflineQueue) {
    switch (item.type) {
      case 'message':
        await this.syncOfflineMessage(item);
        break;
      case 'ticket_update':
        await this.syncTicketUpdate(item);
        break;
      case 'media_upload':
        await this.syncMediaUpload(item);
        break;
      default:
        console.warn(`Unknown queue item type: ${item.type}`);
    }
  }

  private async syncOfflineMessage(item: OfflineQueue) {
    const { ticketId, message } = item.data;
    
    try {
      const response = await apiService.sendMessage(
        ticketId,
        message.body,
        message.quotedMsgId
      );

      if (response.success) {
        // Update cached messages with real message ID
        const cachedMessages = await this.getCachedMessages(ticketId);
        const messageIndex = cachedMessages.findIndex(m => m._tempId === message.tempId);
        
        if (messageIndex >= 0) {
          cachedMessages[messageIndex] = {
            ...response.data,
            _offline: false,
            _pending: false,
            _tempId: message.tempId,
          };
          
          const key = `${this.STORAGE_KEYS.OFFLINE_MESSAGES}_${ticketId}`;
          await AsyncStorage.setItem(key, JSON.stringify(cachedMessages));
        }
      }
    } catch (error) {
      console.error('Error syncing offline message:', error);
      throw error;
    }
  }

  private async syncTicketUpdate(item: OfflineQueue) {
    const { ticketId, updates } = item.data;
    
    try {
      const response = await apiService.updateTicket(ticketId, updates);
      
      if (response.success) {
        await this.updateCachedTicket(ticketId, response.data);
      }
    } catch (error) {
      console.error('Error syncing ticket update:', error);
      throw error;
    }
  }

  private async syncMediaUpload(item: OfflineQueue) {
    const { ticketId, mediaData } = item.data;
    
    try {
      const response = await apiService.sendMedia(ticketId, mediaData);
      
      if (response.success) {
        // Update cached messages
        const cachedMessages = await this.getCachedMessages(ticketId);
        cachedMessages.push({
          ...response.data,
          _offline: false,
          _pending: false,
          _tempId: response.data.id,
        });
        
        const key = `${this.STORAGE_KEYS.OFFLINE_MESSAGES}_${ticketId}`;
        await AsyncStorage.setItem(key, JSON.stringify(cachedMessages));
      }
    } catch (error) {
      console.error('Error syncing media upload:', error);
      throw error;
    }
  }

  private async updateLastSyncTime() {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LAST_SYNC,
        JSON.stringify({ timestamp: Date.now() })
      );
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
      return data ? JSON.parse(data).timestamp : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Public API
  async sendMessageOffline(ticketId: number, body: string, quotedMsgId?: string): Promise<OfflineMessage> {
    const message = {
      body,
      ack: 0,
      read: false,
      fromMe: true,
      timestamp: Date.now(),
      ticketId,
      quotedMsgId,
    };

    return this.addOfflineMessage(ticketId, message);
  }

  async updateTicketOffline(ticketId: number, updates: Partial<Ticket>) {
    await this.updateCachedTicket(ticketId, updates);
    await this.addToQueue('ticket_update', { ticketId, updates });
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  getPendingQueueCount(): number {
    return this.offlineQueue.length;
  }

  async clearOfflineData() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_TICKETS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_QUEUE),
        AsyncStorage.removeItem(this.STORAGE_KEYS.LAST_SYNC),
      ]);

      // Clear message caches (this is a simplified approach)
      const keys = await AsyncStorage.getAllKeys();
      const messageKeys = keys.filter(key => key.startsWith(this.STORAGE_KEYS.OFFLINE_MESSAGES));
      await AsyncStorage.multiRemove(messageKeys);

      this.offlineQueue = [];
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }
}

export const offlineService = new OfflineService();
export default offlineService;