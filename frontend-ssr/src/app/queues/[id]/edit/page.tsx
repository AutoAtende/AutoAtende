import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import QueueForm from '@/components/features/QueueForm'
import { queuesService } from '@/services/queues'

export const metadata: Metadata = {
  title: 'Editar Fila | Fonte',
  description: 'Editar dados da fila',
}

interface PageProps {
  params: {
    id: string
  }
}

async function getQueueData(id: number) {
  try {
    const queue = await queuesService.getQueueById(id)
    return queue
  } catch (error) {
    console.error('Failed to fetch queue data:', error)
    return null
  }
}

export default async function EditQueuePage({ params }: PageProps) {
  const queueId = parseInt(params.id)
  
  if (isNaN(queueId)) {
    notFound()
  }

  const queue = await getQueueData(queueId)
  
  if (!queue) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-lg font-medium text-gray-900">
                Editar Fila
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Alterar dados da fila "{queue.queue}"
              </p>
            </div>

            <QueueForm 
              mode="edit"
              queue={queue}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}