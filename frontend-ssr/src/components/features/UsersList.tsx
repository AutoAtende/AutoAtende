'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  UserIcon,
  EnvelopeIcon,
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { User } from '@/types'

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
}

interface UsersListProps {
  users: User[]
  pagination: Pagination
}

function getProfileBadgeColor(profile: string) {
  switch (profile.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800'
    case 'supervisor':
      return 'bg-yellow-100 text-yellow-800'
    case 'user':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function UsersList({ users, pagination }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum usuário encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há usuários que correspondam aos critérios de busca.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profilePicUrl ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.profilePicUrl}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProfileBadgeColor(user.profile)}`}>
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      {user.profile.charAt(0).toUpperCase() + user.profile.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? (
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(user.lastLogin), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400">Nunca</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/users/${user.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Editar usuário"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Excluir usuário"
                        onClick={() => {
                          // TODO: Implement delete confirmation modal
                          console.log('Delete user:', user.id)
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Mostrando {users.length} de {pagination.totalCount} usuários
            </div>
            <div className="flex space-x-2">
              {/* TODO: Implementar paginação completa */}
              <span className="text-sm text-gray-500">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}