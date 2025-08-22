'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const settingsSchema = yup.object({
  companyName: yup.string().required('Nome da empresa é obrigatório'),
  timezone: yup.string().required('Fuso horário é obrigatório'),
  language: yup.string().required('Idioma é obrigatório'),
  businessHoursStart: yup.string().required('Horário de início é obrigatório'),
  businessHoursEnd: yup.string().required('Horário de fim é obrigatório'),
  maxTicketsPerUser: yup.number().min(1, 'Deve ser pelo menos 1').required('Campo obrigatório'),
  ticketAutoClose: yup.number().min(0, 'Deve ser 0 ou maior').required('Campo obrigatório'),
  enableLogs: yup.boolean().required(),
  enableNotifications: yup.boolean().required(),
})

type SettingsFormData = {
  companyName: string
  timezone: string
  language: string
  businessHoursStart: string
  businessHoursEnd: string
  maxTicketsPerUser: number
  ticketAutoClose: number
  enableLogs: boolean
  enableNotifications: boolean
}

// Mock data - in real app this would come from API
const defaultSettings: SettingsFormData = {
  companyName: 'Fonte Atendimento',
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  businessHoursStart: '08:00',
  businessHoursEnd: '18:00',
  maxTicketsPerUser: 10,
  ticketAutoClose: 24,
  enableLogs: true,
  enableNotifications: true,
}

const timezones = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
]

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'es-ES', label: 'Español (España)' },
]

export default function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: yupResolver(settingsSchema),
    defaultValues: defaultSettings,
  })

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true)
    setSaveSuccess(false)
    
    try {
      // TODO: Send data to API
      console.log('Saving settings:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Configurações Gerais
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure as informações básicas do sistema
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Informações da Empresa
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Nome da Empresa
              </label>
              <Input
                {...register('companyName')}
                type="text"
                id="companyName"
                className="mt-1"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Fuso Horário
              </label>
              <select
                {...register('timezone')}
                id="timezone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {errors.timezone && (
                <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Idioma
              </label>
              <select
                {...register('language')}
                id="language"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              {errors.language && (
                <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Horário de Funcionamento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="businessHoursStart" className="block text-sm font-medium text-gray-700">
                Horário de Início
              </label>
              <Input
                {...register('businessHoursStart')}
                type="time"
                id="businessHoursStart"
                className="mt-1"
              />
              {errors.businessHoursStart && (
                <p className="mt-1 text-sm text-red-600">{errors.businessHoursStart.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessHoursEnd" className="block text-sm font-medium text-gray-700">
                Horário de Fim
              </label>
              <Input
                {...register('businessHoursEnd')}
                type="time"
                id="businessHoursEnd"
                className="mt-1"
              />
              {errors.businessHoursEnd && (
                <p className="mt-1 text-sm text-red-600">{errors.businessHoursEnd.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Configurações de Tickets
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxTicketsPerUser" className="block text-sm font-medium text-gray-700">
                Máximo de Tickets por Usuário
              </label>
              <Input
                {...register('maxTicketsPerUser', { valueAsNumber: true })}
                type="number"
                id="maxTicketsPerUser"
                min="1"
                className="mt-1"
              />
              {errors.maxTicketsPerUser && (
                <p className="mt-1 text-sm text-red-600">{errors.maxTicketsPerUser.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="ticketAutoClose" className="block text-sm font-medium text-gray-700">
                Auto-fechar Tickets (horas)
              </label>
              <Input
                {...register('ticketAutoClose', { valueAsNumber: true })}
                type="number"
                id="ticketAutoClose"
                min="0"
                className="mt-1"
                placeholder="0 = nunca fechar automaticamente"
              />
              <p className="mt-1 text-xs text-gray-500">
                0 para nunca fechar automaticamente
              </p>
              {errors.ticketAutoClose && (
                <p className="mt-1 text-sm text-red-600">{errors.ticketAutoClose.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Configurações do Sistema
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('enableLogs')}
                type="checkbox"
                id="enableLogs"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableLogs" className="ml-2 block text-sm text-gray-900">
                Habilitar logs do sistema
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register('enableNotifications')}
                type="checkbox"
                id="enableNotifications"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                Habilitar notificações do sistema
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          {saveSuccess && (
            <div className="flex items-center text-green-600 text-sm">
              ✓ Configurações salvas com sucesso!
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading || !isDirty}
            className="min-w-[120px]"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  )
}