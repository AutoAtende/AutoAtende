// Core types for mobile app
export interface User {
  id: number;
  name: string;
  email: string;
  profile: 'admin' | 'user' | 'superv';
  companyId: number;
  online: boolean;
  queues: Queue[];
  allTicket: boolean;
}

export interface Company {
  id: number;
  name: string;
  status: boolean;
  dueDate: string;
  planId: number;
}

export interface Contact {
  id: number;
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  isGroup: boolean;
  disableBot: boolean;
}

export interface Ticket {
  id: number;
  uuid: string;
  status: 'open' | 'pending' | 'closed';
  unreadMessages: number;
  lastMessage: string;
  lastMessageAt: string;
  contactId: number;
  userId?: number;
  queueId?: number;
  whatsappId: number;
  companyId: number;
  contact: Contact;
  user?: User;
  queue?: Queue;
  whatsapp: Whatsapp;
  isGroup: boolean;
  chatbot: boolean;
}

export interface Message {
  id: string;
  body: string;
  ack: number;
  read: boolean;
  fromMe: boolean;
  mediaUrl?: string;
  mediaType?: string;
  timestamp: number;
  ticketId: number;
  contactId?: number;
  quotedMsgId?: string;
  quotedMsg?: Message;
}

export interface Queue {
  id: number;
  name: string;
  color: string;
  greetingMessage?: string;
  companyId: number;
  orderQueue: number;
}

export interface Whatsapp {
  id: number;
  name: string;
  status: 'CONNECTED' | 'PAIRING' | 'DISCONNECTED' | 'TIMEOUT';
  qrcode?: string;
  number?: string;
  battery?: number;
  plugged?: boolean;
  companyId: number;
}

export interface QuickMessage {
  id: number;
  shortcode: string;
  message: string;
  companyId: number;
  userId?: number;
  mediaPath?: string;
  mediaName?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  records: T[];
  count: number;
  hasMore: boolean;
}

// Socket event types
export interface SocketTicketEvent {
  action: 'update' | 'create' | 'delete' | 'updateUnread';
  ticket: Ticket;
  ticketId?: number;
}

export interface SocketMessageEvent {
  action: 'create' | 'update';
  message: Message;
}

export interface SocketPresenceEvent {
  ticketId: number;
  presence: 'composing' | 'recording' | 'available';
}

// Push notification types
export interface PushNotificationData {
  type: 'new_message' | 'new_ticket' | 'ticket_assigned';
  ticketId?: number;
  messageId?: string;
  title: string;
  body: string;
}

// Offline storage types
export interface OfflineTicket extends Ticket {
  _offline: boolean;
  _lastSync: number;
}

export interface OfflineMessage extends Message {
  _offline: boolean;
  _pending: boolean;
  _tempId: string;
}