'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ContactsHeaderProps {
  searchQuery?: string
}

export default function ContactsHeader({ searchQuery }: ContactsHeaderProps) {
  const [search, setSearch] = useState(searchQuery || '')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    
    // Reset page to 1 when search changes
    params.delete('page')
    
    router.push(`/contacts?${params.toString()}`)
  }

  const handleNewContact = () => {
    // Em uma implementação real, isso abriria um modal ou navegaria para uma nova página
    console.log('Novo contato')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os seus contatos e grupos
          </p>
        </div>
        <Button onClick={handleNewContact} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit">
            Buscar
          </Button>
        </form>
      </div>
    </div>
  )
}