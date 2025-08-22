import api from './api'
import { Ticket } from '@/types'

export interface TicketsParams {
  status?: string
  queue?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface TicketsResponse {
  tickets: Ticket[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
}

export const ticketsService = {
  // Listar tickets
  async getTickets(params: TicketsParams = {}): Promise<TicketsResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.status) searchParams.append('status', params.status)
    if (params.queue) searchParams.append('queueId', params.queue)
    if (params.search) searchParams.append('searchParam', params.search)
    if (params.page) searchParams.append('pageNumber', params.page.toString())
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    
    const response = await api.get(`/tickets?${searchParams.toString()}`)
    return response.data
  },

  // Buscar ticket por ID
  async getTicketById(id: number): Promise<Ticket> {
    const response = await api.get(`/tickets/${id}`)
    return response.data
  },

  // Atualizar status do ticket
  async updateTicketStatus(id: number, status: string): Promise<Ticket> {
    const response = await api.put(`/tickets/${id}`, { status })
    return response.data
  },

  // Aceitar ticket
  async acceptTicket(id: number, userId?: number): Promise<Ticket> {
    const response = await api.put(`/tickets/${id}/accept`, { userId })
    return response.data
  },

  // Transferir ticket
  async transferTicket(id: number, queueId?: number, userId?: number): Promise<Ticket> {
    const response = await api.put(`/tickets/${id}/transfer`, {
      queueId,
      userId,
    })
    return response.data
  },

  // Enviar mensagem
  async sendMessage(ticketId: number, message: {
    body: string
    fromMe: boolean
    read: boolean
    quotedMsg?: any
    media?: File
  }): Promise<any> {
    const formData = new FormData()
    
    formData.append('body', message.body)
    formData.append('fromMe', message.fromMe.toString())
    formData.append('read', message.read.toString())
    
    if (message.quotedMsg) {
      formData.append('quotedMsg', JSON.stringify(message.quotedMsg))
    }
    
    if (message.media) {
      formData.append('media', message.media)
    }
    
    const response = await api.post(`/messages/${ticketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },
}