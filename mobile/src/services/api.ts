import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : 'https://your-production-api.com';

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.initNetworkListener();
    this.loadTokenFromStorage();
  }

  private async loadTokenFromStorage() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
    }
  }

  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await this.clearToken();
        throw new Error('Authentication required');
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ token: string; refreshToken: string }>('/auth/refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Tickets
  async getTickets(params: {
    pageNumber?: number;
    status?: string;
    queueIds?: number[];
    searchParam?: string;
    showAll?: boolean;
    userId?: number;
    withUnreadMessages?: boolean;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return this.request<PaginatedResponse<any>>(`/tickets?${searchParams}`);
  }

  async getTicket(id: number) {
    return this.request<any>(`/tickets/${id}`);
  }

  async updateTicket(id: number, data: any) {
    return this.request<any>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Messages
  async getMessages(ticketId: number, pageNumber: number = 1) {
    return this.request<PaginatedResponse<any>>(`/messages/${ticketId}?pageNumber=${pageNumber}`);
  }

  async sendMessage(ticketId: number, body: string, quotedMsgId?: string) {
    return this.request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ ticketId, body, quotedMsgId }),
    });
  }

  async sendMedia(ticketId: number, mediaData: FormData) {
    const headers = this.getHeaders();
    delete (headers as any)['Content-Type']; // Let fetch set it for FormData

    return this.request<any>('/messages', {
      method: 'POST',
      headers,
      body: mediaData,
    });
  }

  // Contacts
  async getContacts(searchParam?: string, pageNumber?: number) {
    const params = new URLSearchParams();
    if (searchParam) params.append('searchParam', searchParam);
    if (pageNumber) params.append('pageNumber', String(pageNumber));

    return this.request<PaginatedResponse<any>>(`/contacts?${params}`);
  }

  // Quick Messages
  async getQuickMessages() {
    return this.request<any[]>('/quickMessages');
  }

  // Queues
  async getQueues() {
    return this.request<any[]>('/queues');
  }

  // User profile
  async getUserProfile() {
    return this.request<any>('/users/profile');
  }

  // WhatsApp status
  async getWhatsApps() {
    return this.request<any[]>('/whatsapp');
  }

  // Settings
  async getPublicSettings() {
    return this.request<any>('/public-settings');
  }
}

export const apiService = new ApiService();
export default apiService;