import { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SettingsNav from '@/components/features/SettingsNav'
import GeneralSettings from '@/components/features/GeneralSettings'

export const metadata: Metadata = {
  title: 'Configurações | Fonte',
  description: 'Configurações do sistema',
}

interface PageProps {
  searchParams: {
    tab?: string
  }
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const activeTab = searchParams.tab || 'general'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-lg font-medium text-gray-900">
              Configurações
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerenciar configurações do sistema
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="flex">
            {/* Navigation */}
            <div className="w-64 border-r border-gray-200">
              <SettingsNav activeTab={activeTab} />
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {activeTab === 'general' && <GeneralSettings />}
              {activeTab === 'appearance' && <div>Configurações de Aparência (Em desenvolvimento)</div>}
              {activeTab === 'notifications' && <div>Configurações de Notificações (Em desenvolvimento)</div>}
              {activeTab === 'security' && <div>Configurações de Segurança (Em desenvolvimento)</div>}
              {activeTab === 'integrations' && <div>Configurações de Integrações (Em desenvolvimento)</div>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}