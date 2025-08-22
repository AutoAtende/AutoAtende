import { Suspense } from 'react'
import { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import UsersHeader from '@/components/features/UsersHeader'
import UsersList from '@/components/features/UsersList'
import { usersService } from '@/services/users'

export const metadata: Metadata = {
  title: 'Usuários | Fonte',
  description: 'Gerenciar usuários do sistema',
}

interface PageProps {
  searchParams: {
    search?: string
    profile?: string
    page?: string
  }
}

async function getUsersData(searchParams: PageProps['searchParams']) {
  try {
    const params = {
      search: searchParams.search,
      profile: searchParams.profile,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      pageSize: 20,
    }

    return await usersService.getUsers(params)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    // Return empty data as fallback
    return {
      users: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasMore: false,
      },
    }
  }
}

async function getProfilesData() {
  try {
    return await usersService.getProfiles()
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return ['admin', 'user', 'supervisor']
  }
}

export default async function UsersPage({ searchParams }: PageProps) {
  const [usersData, profiles] = await Promise.all([
    getUsersData(searchParams),
    getProfilesData(),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <UsersHeader profiles={profiles} />
        
        <Suspense fallback={<LoadingSpinner />}>
          <UsersList 
            users={usersData.users} 
            pagination={usersData.pagination}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

// Revalidate every 30 seconds
export const revalidate = 30