import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'

interface Ticket {
  id: number
  subject: string
  contact: {
    name: string
    number: string
  }
  status: string
  updatedAt: string
}

interface RecentTicketsProps {
  tickets: Ticket[]
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

export default function RecentTickets({ tickets }: RecentTicketsProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Tickets Recentes
          </h3>
          <Link
            href="/tickets"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Ver todos
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum ticket encontrado</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {ticket.contact.name} • {ticket.contact.number}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(ticket.updatedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div>
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}