'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  UserIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

interface Contact {
  id: number
  name: string
  number: string
  email?: string | null
  profilePicUrl?: string | null
  isGroup: boolean
  tags: string[]
  lastMessage?: string
  lastMessageAt?: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
}

interface ContactsListProps {
  contacts: Contact[]
  pagination: Pagination
}

export default function ContactsList({ contacts, pagination }: ContactsListProps) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum contato encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há contatos que correspondam aos critérios de busca.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {contact.profilePicUrl ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={contact.profilePicUrl}
                      alt={contact.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      {contact.isGroup ? (
                        <UserGroupIcon className="h-5 w-5 text-gray-600" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {contact.name}
                    </p>
                    {contact.isGroup && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Grupo
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                    <PhoneIcon className="h-3 w-3" />
                    <span className="truncate">{contact.number}</span>
                  </div>

                  {contact.email && (
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                      <EnvelopeIcon className="h-3 w-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {contact.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {contact.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{contact.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Last message */}
                  {contact.lastMessage && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 truncate">
                        {contact.lastMessage}
                      </p>
                      {contact.lastMessageAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(contact.lastMessageAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Mostrando {contacts.length} de {pagination.totalCount} contatos
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