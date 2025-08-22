import { Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardStats from '@/components/features/DashboardStats'
import RecentTickets from '@/components/features/RecentTickets'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Função para buscar dados do dashboard no servidor
async function getDashboardData() {
  try {
    // Em produção, isso seria uma chamada para sua API
    // Por enquanto, retornamos dados mockados
    return {
      stats: {
        totalTickets: 1250,
        openTickets: 45,
        closedTickets: 1205,
        avgResponseTime: '2.5h',
      },
      recentTickets: [
        {
          id: 1,
          subject: 'Problema com sistema',
          contact: { name: 'João Silva', number: '5511999999999' },
          status: 'open',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          subject: 'Dúvida sobre produto',
          contact: { name: 'Maria Santos', number: '5511888888888' },
          status: 'pending',
          updatedAt: new Date().toISOString(),
        },
      ],
    }
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    throw error
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral do seu sistema de atendimento
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <DashboardStats stats={data.stats} />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <RecentTickets tickets={data.recentTickets} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

// Opcional: Configuração de revalidação para ISR
export const revalidate = 60 // Revalida a cada 60 segundos