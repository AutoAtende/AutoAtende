'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const statusOptions = [
  { value: 'CONNECTED', label: 'Conectado' },
  { value: 'DISCONNECTED', label: 'Desconectado' },
  { value: 'PAIRING', label: 'Pareando' },
  { value: 'TIMEOUT', label: 'Timeout' },
]

export default function ConnectionsHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchValue.trim()) {
      params.set('search', searchValue.trim())
    } else {
      params.delete('search')
    }
    
    if (selectedStatus) {
      params.set('status', selectedStatus)
    } else {
      params.delete('status')
    }
    
    params.delete('page') // Reset pagination
    
    router.push(`/connections?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setSelectedStatus('')
    router.push('/connections')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900">
              Conexões
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerenciar conexões WhatsApp
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <Button
              size="sm"
              onClick={() => router.push('/connections/new')}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nova Conexão
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`mt-4 space-y-4 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar por nome ou sessão..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Todos os status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={handleSearch}>
              Buscar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}