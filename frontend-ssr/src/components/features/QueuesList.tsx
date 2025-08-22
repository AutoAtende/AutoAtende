'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  QueueListIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'
import { Queue } from '@/services/queues'

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
}

interface QueuesListProps {
  queues: Queue[]
  pagination: Pagination
}

export default function QueuesList({ queues, pagination }: QueuesListProps) {
  if (queues.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <QueueListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma fila encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há filas que correspondam aos critérios de busca.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-4">
          {queues
            .sort((a, b) => a.orderQueue - b.orderQueue)
            .map((queue) => (
              <div
                key={queue.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Drag Handle */}
                    <div className="cursor-move">
                      <Bars3Icon className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* Color Indicator */}
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: queue.color }}
                    />

                    {/* Queue Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {queue.queue}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          queue.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {queue.isActive ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500">
                        Ordem: {queue.orderQueue} • 
                        Criado {formatDistanceToNow(new Date(queue.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/queues/${queue.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                      title="Editar fila"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                      title="Excluir fila"
                      onClick={() => {
                        // TODO: Implement delete confirmation modal
                        console.log('Delete queue:', queue.id)
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Queue Messages */}
                {(queue.greetingMessage || queue.outOfHoursMessage) && (
                  <div className="mt-3 pl-9 space-y-2">
                    {queue.greetingMessage && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Mensagem de Boas-vindas:</span>
                        <p className="text-gray-600 mt-1 truncate">{queue.greetingMessage}</p>
                      </div>
                    )}
                    {queue.outOfHoursMessage && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Mensagem Fora do Horário:</span>
                        <p className="text-gray-600 mt-1 truncate">{queue.outOfHoursMessage}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Associated Items */}
                <div className="mt-3 pl-9 flex flex-wrap gap-4 text-xs text-gray-500">
                  {queue.users && queue.users.length > 0 && (
                    <span>{queue.users.length} usuário(s)</span>
                  )}
                  {queue.whatsapps && queue.whatsapps.length > 0 && (
                    <span>{queue.whatsapps.length} conexão(ões)</span>
                  )}
                  {queue.chatbots && queue.chatbots.length > 0 && (
                    <span>{queue.chatbots.length} chatbot(s)</span>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Mostrando {queues.length} de {pagination.totalCount} filas
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