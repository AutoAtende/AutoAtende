'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface Ticket {
  id: number
  subject: string
  contact: {
    id: number
    name: string
    number: string
    profilePicUrl?: string | null
  }
  user?: {
    id: number
    name: string
  } | null
  queue: {
    id: number
    name: string
    color: string
  }
  status: string
  lastMessage: string
  updatedAt: string
  unreadMessages: number
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
}

interface TicketsListProps {
  tickets: Ticket[]
  pagination: Pagination
}

const statusColors = {
  open: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  open: 'Aberto',
  pending: 'Pendente',
  closed: 'Fechado',
}

export default function TicketsList({ tickets, pagination }: TicketsListProps) {
  if (tickets.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum ticket encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há tickets que correspondam aos filtros aplicados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="py-4">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar do contato */}
                    <div className="flex-shrink-0">
                      {ticket.contact.profilePicUrl ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={ticket.contact.profilePicUrl}
                          alt={ticket.contact.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Informações do ticket */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.contact.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          {ticket.unreadMessages > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ticket.unreadMessages} nova{ticket.unreadMessages > 1 ? 's' : ''}
                            </span>
                          )}
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              statusColors[ticket.status as keyof typeof statusColors]
                            )}
                          >
                            {statusLabels[ticket.status as keyof typeof statusLabels]}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 truncate mt-1">
                        {ticket.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{ticket.contact.number}</span>
                          {ticket.queue && (
                            <span
                              className="px-2 py-1 rounded-full text-white text-xs"
                              style={{ backgroundColor: ticket.queue.color }}
                            >
                              {ticket.queue.name}
                            </span>
                          )}
                          {ticket.user && (
                            <span>Atendido por {ticket.user.name}</span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(ticket.updatedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Mostrando {tickets.length} de {pagination.totalCount} tickets
            </div>
            <div className="flex space-x-2">
              {/* Implementar paginação aqui se necessário */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}