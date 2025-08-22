import { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import UserForm from '@/components/features/UserForm'
import { usersService } from '@/services/users'

export const metadata: Metadata = {
  title: 'Novo Usuário | Fonte',
  description: 'Criar novo usuário do sistema',
}

async function getFormData() {
  try {
    const profiles = await usersService.getProfiles()
    return { profiles }
  } catch (error) {
    console.error('Failed to fetch form data:', error)
    return {
      profiles: ['admin', 'user', 'supervisor'],
    }
  }
}

export default async function NewUserPage() {
  const { profiles } = await getFormData()

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-lg font-medium text-gray-900">
                Novo Usuário
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Preencha os dados do novo usuário
              </p>
            </div>

            <UserForm 
              profiles={profiles}
              mode="create"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}