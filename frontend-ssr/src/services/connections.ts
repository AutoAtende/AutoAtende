import api from './api'

export interface Connection {
  id: number
  name: string
  session: string
  qrcode?: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING' | 'TIMEOUT'
  battery?: number
  plugged?: boolean
  isDefault: boolean
  retries: number
  greetingMessage?: string
  farewellMessage?: string
  queueIds: number[]
  createdAt: string
  updatedAt: string
}

export interface ConnectionsParams {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface ConnectionsResponse {
  connections: Connection[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
}

export interface CreateConnectionData {
  name: string
  greetingMessage?: string
  farewellMessage?: string
  isDefault?: boolean
  queueIds?: number[]
}

export interface UpdateConnectionData {
  name?: string
  greetingMessage?: string
  farewellMessage?: string
  isDefault?: boolean
  queueIds?: number[]
}

export const connectionsService = {
  // Listar conexões
  async getConnections(params: ConnectionsParams = {}): Promise<ConnectionsResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append('searchParam', params.search)
    if (params.status) searchParams.append('status', params.status)
    if (params.page) searchParams.append('pageNumber', params.page.toString())
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    
    const response = await api.get(`/whatsapp?${searchParams.toString()}`)
    return response.data
  },

  // Buscar conexão por ID
  async getConnectionById(id: number): Promise<Connection> {
    const response = await api.get(`/whatsapp/${id}`)
    return response.data
  },

  // Criar conexão
  async createConnection(data: CreateConnectionData): Promise<Connection> {
    const response = await api.post('/whatsapp', data)
    return response.data
  },

  // Atualizar conexão
  async updateConnection(id: number, data: UpdateConnectionData): Promise<Connection> {
    const response = await api.put(`/whatsapp/${id}`, data)
    return response.data
  },

  // Deletar conexão
  async deleteConnection(id: number): Promise<void> {
    await api.delete(`/whatsapp/${id}`)
  },

  // Reiniciar conexão
  async restartConnection(id: number): Promise<void> {
    await api.post(`/whatsapp/${id}/restart`)
  },

  // Desconectar
  async disconnectConnection(id: number): Promise<void> {
    await api.post(`/whatsapp/${id}/disconnect`)
  },

  // Obter QR Code
  async getQRCode(id: number): Promise<{ qrcode: string }> {
    const response = await api.get(`/whatsapp/${id}/qrcode`)
    return response.data
  },
}