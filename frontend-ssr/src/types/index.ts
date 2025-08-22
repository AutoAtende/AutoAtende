// User types
export interface User {
  id: number
  name: string
  email: string
  profile: string
  profilePicUrl?: string
  online?: boolean
  lastLogin?: string
  startWork?: string
  endWork?: string
  allTicket?: string
  defaultTheme?: string
  defaultMenu?: string
  createdAt: string
  updatedAt: string
}

// Ticket types
export interface Ticket {
  id: number
  uuid: string
  status: 'open' | 'pending' | 'closed'
  unreadMessages: number
  lastMessage?: string
  lastMessageAt?: string
  contactId: number
  userId?: number
  queueId?: number
  contact: Contact
  user?: User
  queue?: Queue
  messages?: Message[]
  createdAt: string
  updatedAt: string
}

// Contact types
export interface Contact {
  id: number
  name: string
  number: string
  email?: string
  profilePicUrl?: string
  isGroup: boolean
  tags: string[]
  lastMessage?: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

// Message types
export interface Message {
  id: number
  body: string
  fromMe: boolean
  read: boolean
  mediaType?: string
  mediaUrl?: string
  quotedMsg?: any
  ticketId: number
  contactId: number
  userId?: number
  createdAt: string
  updatedAt: string
}

// Queue types
export interface Queue {
  id: number
  queue: string
  greetingMessage?: string
  outOfHoursMessage?: string
  color: string
  orderQueue: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Dashboard types
export interface DashboardStats {
  totalTickets: number
  openTickets: number
  pendingTickets: number
  closedTickets: number
  totalContacts: number
  totalUsers: number
  averageResponseTime: number
  satisfactionRate: number
}

export interface DashboardData {
  stats: DashboardStats
  recentTickets: Ticket[]
  topAgents: User[]
  chartData: {
    tickets: Array<{ date: string; open: number; closed: number }>
    responseTime: Array<{ date: string; time: number }>
  }
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

// Common types
export type Status = 'loading' | 'success' | 'error' | 'idle'

export interface SelectOption {
  value: string | number
  label: string
}