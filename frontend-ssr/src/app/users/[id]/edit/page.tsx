import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import UserForm from '@/components/features/UserForm'
import { usersService } from '@/services/users'

export const metadata: Metadata = {
  title: 'Editar Usuário | Fonte',
  description: 'Editar dados do usuário',
}

interface PageProps {
  params: {
    id: string
  }
}

async function getUserData(id: number) {
  try {
    const [user, profiles] = await Promise.all([
      usersService.getUserById(id),
      usersService.getProfiles(),
    ])
    
    return { user, profiles }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return null
  }
}

export default async function EditUserPage({ params }: PageProps) {
  const userId = parseInt(params.id)
  
  if (isNaN(userId)) {
    notFound()
  }

  const data = await getUserData(userId)
  
  if (!data) {
    notFound()
  }

  const { user, profiles } = data

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-lg font-medium text-gray-900">
                Editar Usuário
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Alterar dados de {user.name}
              </p>
            </div>

            <UserForm 
              profiles={profiles}
              mode="edit"
              user={user}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}