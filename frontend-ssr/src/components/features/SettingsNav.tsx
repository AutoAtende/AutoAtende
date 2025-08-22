'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CogIcon,
  PaintBrushIcon,
  BellIcon,
  ShieldCheckIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline'

interface SettingsNavProps {
  activeTab: string
}

const navigationItems = [
  {
    id: 'general',
    name: 'Geral',
    icon: CogIcon,
    description: 'Configurações básicas do sistema',
  },
  {
    id: 'appearance',
    name: 'Aparência',
    icon: PaintBrushIcon,
    description: 'Temas e personalização',
  },
  {
    id: 'notifications',
    name: 'Notificações',
    icon: BellIcon,
    description: 'Alertas e notificações',
  },
  {
    id: 'security',
    name: 'Segurança',
    icon: ShieldCheckIcon,
    description: 'Senhas e autenticação',
  },
  {
    id: 'integrations',
    name: 'Integrações',
    icon: PuzzlePieceIcon,
    description: 'APIs e serviços externos',
  },
]

export default function SettingsNav({ activeTab }: SettingsNavProps) {
  const router = useRouter()

  const handleTabChange = (tabId: string) => {
    router.push(`/settings?tab=${tabId}`)
  }

  return (
    <nav className="space-y-1 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full group flex items-start px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon
              className={`flex-shrink-0 h-5 w-5 mr-3 ${
                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            <div className="text-left">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {item.description}
              </div>
            </div>
          </button>
        )
      })}
    </nav>
  )
}