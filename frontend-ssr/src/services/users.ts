import api from './api'
import { User } from '@/types'

export interface UsersParams {
  search?: string
  profile?: string
  page?: number
  pageSize?: number
}

export interface UsersResponse {
  users: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  profile: string
  startWork?: string
  endWork?: string
  allTicket?: string
  defaultTheme?: string
  defaultMenu?: string
  queueIds?: number[]
  whatsappIds?: number[]
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  profile?: string
  startWork?: string
  endWork?: string
  allTicket?: string
  defaultTheme?: string
  defaultMenu?: string
  queueIds?: number[]
  whatsappIds?: number[]
}

export const usersService = {
  // Listar usuários
  async getUsers(params: UsersParams = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append('searchParam', params.search)
    if (params.profile) searchParams.append('profile', params.profile)
    if (params.page) searchParams.append('pageNumber', params.page.toString())
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    
    const response = await api.get(`/users?${searchParams.toString()}`)
    return response.data
  },

  // Buscar usuário por ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Criar usuário
  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data)
    return response.data
  },

  // Atualizar usuário
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  // Deletar usuário
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  // Buscar perfis disponíveis
  async getProfiles(): Promise<string[]> {
    const response = await api.get('/users/profiles')
    return response.data
  },
}