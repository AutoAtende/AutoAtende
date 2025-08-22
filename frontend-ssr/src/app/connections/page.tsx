import { Suspense } from 'react'
import { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ConnectionsHeader from '@/components/features/ConnectionsHeader'
import ConnectionsList from '@/components/features/ConnectionsList'
import { connectionsService } from '@/services/connections'

export const metadata: Metadata = {
  title: 'Conexões | Fonte',
  description: 'Gerenciar conexões WhatsApp',
}

interface PageProps {
  searchParams: {
    search?: string
    status?: string
    page?: string
  }
}

async function getConnectionsData(searchParams: PageProps['searchParams']) {
  try {
    const params = {
      search: searchParams.search,
      status: searchParams.status,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      pageSize: 20,
    }

    return await connectionsService.getConnections(params)
  } catch (error) {
    console.error('Failed to fetch connections:', error)
    // Return empty data as fallback
    return {
      connections: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasMore: false,
      },
    }
  }
}

export default async function ConnectionsPage({ searchParams }: PageProps) {
  const connectionsData = await getConnectionsData(searchParams)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ConnectionsHeader />
        
        <Suspense fallback={<LoadingSpinner />}>
          <ConnectionsList 
            connections={connectionsData.connections} 
            pagination={connectionsData.pagination}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

// Revalidate every 15 seconds for real-time status updates
export const revalidate = 15