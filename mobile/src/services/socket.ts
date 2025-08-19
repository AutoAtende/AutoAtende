import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { SocketTicketEvent, SocketMessageEvent, SocketPresenceEvent } from '../types';

const SOCKET_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : 'https://your-production-api.com';

export type SocketEventCallback<T = any> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private eventListeners: Map<string, Set<SocketEventCallback>> = new Map();
  private companyId: number | null = null;
  private userId: number | null = null;

  async initialize(token: string, companyId: number, userId: number) {
    this.token = token;
    this.companyId = companyId;
    this.userId = userId;
    
    await this.connect();
    this.setupNetworkListener();
  }

  private async connect() {
    if (this.socket?.connected) {
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        query: {
          token: this.token,
        },
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupSocketEventListeners();
      
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  private setupSocketEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket_connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('socket_disconnected', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('socket_connection_failed', { error: error.message });
      }
    });

    this.socket.on('connection_established', (data) => {
      console.log('Connection established:', data);
      this.setupCompanyRooms();
    });

    // Ticket events
    this.socket.on(`company-${this.companyId}-ticket`, (data: SocketTicketEvent) => {
      this.emit('ticket_update', data);
    });

    // Message events
    this.socket.on(`company-${this.companyId}-appMessage`, (data: SocketMessageEvent) => {
      this.emit('message_update', data);
    });

    // Presence events (typing, recording)
    this.socket.on(`company-${this.companyId}-presence`, (data: SocketPresenceEvent) => {
      this.emit('presence_update', data);
    });

    // WhatsApp session events
    this.socket.on(`company-${this.companyId}-whatsappSession`, (data) => {
      this.emit('whatsapp_session_update', data);
    });

    // Contact events
    this.socket.on(`company-${this.companyId}-contact`, (data) => {
      this.emit('contact_update', data);
    });

    // User events
    this.socket.on(`user-${this.userId}`, (data) => {
      this.emit('user_update', data);
    });

    // Task events
    this.socket.on('task-update', (data) => {
      this.emit('task_update', data);
    });

    // Notification count events
    this.socket.on('notificationCountResult', (data) => {
      this.emit('notification_count_update', data);
    });

    // Ping/Pong for connection health
    this.socket.on('ping', (data) => {
      this.socket?.emit('pong', { ...data, clientTime: new Date() });
    });
  }

  private setupCompanyRooms() {
    if (!this.socket || !this.companyId) return;

    // Join notification room
    this.socket.emit('joinNotification');
    
    // Request initial notification count
    this.socket.emit('getNotificationCount');
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isConnected) {
        // Network restored, try to reconnect
        this.connect();
      }
    });
  }

  // Event subscription methods
  on<T = any>(event: string, callback: SocketEventCallback<T>) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off<T = any>(event: string, callback: SocketEventCallback<T>) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit<T = any>(event: string, data: T) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Ticket room management
  joinTicketRoom(ticketId: number) {
    this.socket?.emit('joinChatBox', ticketId.toString());
  }

  leaveTicketRoom(ticketId: number) {
    this.socket?.emit('leaveChatBox', ticketId.toString());
  }

  // Presence management
  setTyping(ticketId: number, isTyping: boolean) {
    this.socket?.emit('typing', { ticketId, status: isTyping });
  }

  setRecording(ticketId: number, isRecording: boolean) {
    this.socket?.emit('recording', { ticketId, status: isRecording });
  }

  // Notification management
  clearNotifications() {
    this.socket?.emit('clearNotifications');
  }

  markTicketAsRead(ticketId: number) {
    this.socket?.emit('markTicketAsRead', { ticketId });
  }

  requestNotificationCount() {
    this.socket?.emit('getNotificationCount');
  }

  // WhatsApp status
  requestWhatsAppStatus(whatsAppId: number) {
    this.socket?.emit('requestWhatsAppStatus', { whatsAppId });
  }

  // Connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }

  // Reconnect
  async reconnect() {
    this.disconnect();
    if (this.token && this.companyId && this.userId) {
      await this.connect();
    }
  }
}

export const socketService = new SocketService();
export default socketService;