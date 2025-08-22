import { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import QueueForm from '@/components/features/QueueForm'

export const metadata: Metadata = {
  title: 'Nova Fila | Fonte',
  description: 'Criar nova fila de atendimento',
}

export default async function NewQueuePage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-lg font-medium text-gray-900">
                Nova Fila
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Preencha os dados da nova fila de atendimento
              </p>
            </div>

            <QueueForm mode="create" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}