'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { clsx } from 'clsx'

interface TicketsFilterProps {
  currentStatus?: string
}

const filters = [
  { label: 'Todos', value: '' },
  { label: 'Abertos', value: 'open' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Fechados', value: 'closed' },
]

export default function TicketsFilter({ currentStatus }: TicketsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    
    // Reset page to 1 when filter changes
    params.delete('page')
    
    router.push(`/tickets?${params.toString()}`)
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              (currentStatus || '') === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}