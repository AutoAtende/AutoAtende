'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { usersService, CreateUserData, UpdateUserData } from '@/services/users'
import { User } from '@/types'

const userSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().default('').min(6, 'Senha deve ter pelo menos 6 caracteres'),
  profile: yup.string().required('Perfil é obrigatório'),
  startWork: yup.string().default(''),
  endWork: yup.string().default(''),
})

interface UserFormProps {
  profiles: string[]
  mode: 'create' | 'edit'
  user?: User
}

type UserFormData = InferType<typeof userSchema>

export default function UserForm({ profiles, mode, user }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      profile: user?.profile || '',
      startWork: user?.startWork || '',
      endWork: user?.endWork || '',
    },
  })

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    
    try {
      if (mode === 'create') {
        if (!data.password || data.password.trim() === '') {
          throw new Error('Senha é obrigatória para criação de usuário')
        }
        const createData: CreateUserData = {
          ...data,
          password: data.password,
        }
        await usersService.createUser(createData)
      } else if (user) {
        const updateData: UpdateUserData = {
          ...data,
        }
        // Only include password if it's provided and not empty
        if (!data.password || data.password.trim() === '') {
          delete updateData.password
        }
        await usersService.updateUser(user.id, updateData)
      }
      
      router.push('/users')
    } catch (error) {
      console.error('Failed to save user:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <Input
            {...register('name')}
            type="text"
            id="name"
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            {...register('email')}
            type="email"
            id="email"
            className="mt-1"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {mode === 'create' ? 'Senha' : 'Nova Senha (deixe em branco para manter)'}
          </label>
          <Input
            {...register('password')}
            type="password"
            id="password"
            className="mt-1"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Perfil */}
        <div>
          <label htmlFor="profile" className="block text-sm font-medium text-gray-700">
            Perfil
          </label>
          <select
            {...register('profile')}
            id="profile"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Selecione um perfil</option>
            {profiles.map((profile) => (
              <option key={profile} value={profile}>
                {profile.charAt(0).toUpperCase() + profile.slice(1)}
              </option>
            ))}
          </select>
          {errors.profile && (
            <p className="mt-1 text-sm text-red-600">{errors.profile.message}</p>
          )}
        </div>

        {/* Horário de trabalho */}
        <div>
          <label htmlFor="startWork" className="block text-sm font-medium text-gray-700">
            Início do Expediente
          </label>
          <Input
            {...register('startWork')}
            type="time"
            id="startWork"
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="endWork" className="block text-sm font-medium text-gray-700">
            Fim do Expediente
          </label>
          <Input
            {...register('endWork')}
            type="time"
            id="endWork"
            className="mt-1"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}