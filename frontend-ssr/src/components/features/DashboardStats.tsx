import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

interface StatsData {
  totalTickets: number
  openTickets: number
  closedTickets: number
  avgResponseTime: string
}

interface DashboardStatsProps {
  stats: StatsData
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statsConfig = [
    {
      name: 'Total de Tickets',
      value: stats.totalTickets.toLocaleString(),
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Tickets Abertos',
      value: stats.openTickets.toString(),
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Tickets Fechados',
      value: stats.closedTickets.toLocaleString(),
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Tempo Médio de Resposta',
      value: stats.avgResponseTime,
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
        <div
          key={stat.name}
          className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
        >
          <dt>
            <div className={`absolute ${stat.color} rounded-md p-3`}>
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 truncate">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  )
}