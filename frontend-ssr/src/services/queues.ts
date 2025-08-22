import api from './api'

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
  chatbots?: any[]
  whatsapps?: any[]
  users?: any[]
}

export interface QueuesParams {
  search?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface QueuesResponse {
  queues: Queue[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
}

export interface CreateQueueData {
  queue: string
  greetingMessage?: string
  outOfHoursMessage?: string
  color: string
  orderQueue?: number
  isActive?: boolean
  chatbotIds?: number[]
  whatsappIds?: number[]
  userIds?: number[]
}

export interface UpdateQueueData {
  queue?: string
  greetingMessage?: string
  outOfHoursMessage?: string
  color?: string
  orderQueue?: number
  isActive?: boolean
  chatbotIds?: number[]
  whatsappIds?: number[]
  userIds?: number[]
}

export const queuesService = {
  // Listar filas
  async getQueues(params: QueuesParams = {}): Promise<QueuesResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append('searchParam', params.search)
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
    if (params.page) searchParams.append('pageNumber', params.page.toString())
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    
    const response = await api.get(`/queue?${searchParams.toString()}`)
    return response.data
  },

  // Buscar fila por ID
  async getQueueById(id: number): Promise<Queue> {
    const response = await api.get(`/queue/${id}`)
    return response.data
  },

  // Criar fila
  async createQueue(data: CreateQueueData): Promise<Queue> {
    const response = await api.post('/queue', data)
    return response.data
  },

  // Atualizar fila
  async updateQueue(id: number, data: UpdateQueueData): Promise<Queue> {
    const response = await api.put(`/queue/${id}`, data)
    return response.data
  },

  // Deletar fila
  async deleteQueue(id: number): Promise<void> {
    await api.delete(`/queue/${id}`)
  },

  // Reordenar filas
  async reorderQueues(queues: { id: number; orderQueue: number }[]): Promise<void> {
    await api.put('/queue/reorder', { queues })
  },
}