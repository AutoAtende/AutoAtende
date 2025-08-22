'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { InferType } from 'yup'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { queuesService, CreateQueueData, UpdateQueueData, Queue } from '@/services/queues'

const queueSchema = yup.object({
  queue: yup.string().required('Nome da fila é obrigatório'),
  greetingMessage: yup.string().default(''),
  outOfHoursMessage: yup.string().default(''),
  color: yup.string().required('Cor é obrigatória'),
  orderQueue: yup.number().min(1, 'Ordem deve ser maior que 0').required('Ordem é obrigatória'),
  isActive: yup.boolean().default(true),
})

interface QueueFormProps {
  mode: 'create' | 'edit'
  queue?: Queue
}

type QueueFormData = InferType<typeof queueSchema>

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

export default function QueueForm({ mode, queue }: QueueFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QueueFormData>({
    resolver: yupResolver(queueSchema),
    defaultValues: {
      queue: queue?.queue || '',
      greetingMessage: queue?.greetingMessage || '',
      outOfHoursMessage: queue?.outOfHoursMessage || '',
      color: queue?.color || '#3B82F6',
      orderQueue: queue?.orderQueue || 1,
      isActive: queue?.isActive ?? true,
    },
  })

  const selectedColor = watch('color')

  const onSubmit = async (data: QueueFormData) => {
    setIsLoading(true)
    
    try {
      if (mode === 'create') {
        const createData: CreateQueueData = {
          ...data,
        }
        await queuesService.createQueue(createData)
      } else if (queue) {
        const updateData: UpdateQueueData = {
          ...data,
        }
        await queuesService.updateQueue(queue.id, updateData)
      }
      
      router.push('/queues')
    } catch (error) {
      console.error('Failed to save queue:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {/* Nome da Fila */}
        <div>
          <label htmlFor="queue" className="block text-sm font-medium text-gray-700">
            Nome da Fila
          </label>
          <Input
            {...register('queue')}
            type="text"
            id="queue"
            className="mt-1"
            placeholder="Ex: Suporte, Vendas, Atendimento Geral"
          />
          {errors.queue && (
            <p className="mt-1 text-sm text-red-600">{errors.queue.message}</p>
          )}
        </div>

        {/* Cor */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Cor da Fila
          </label>
          <div className="mt-2 flex items-center space-x-3">
            {/* Color preview */}
            <div
              className="w-8 h-8 rounded-full border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            
            {/* Color picker */}
            <Input
              {...register('color')}
              type="color"
              id="color"
              className="w-16 h-8 p-1 border rounded"
            />
            
            {/* Predefined colors */}
            <div className="flex space-x-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                />
              ))}
            </div>
          </div>
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
          )}
        </div>

        {/* Ordem */}
        <div>
          <label htmlFor="orderQueue" className="block text-sm font-medium text-gray-700">
            Ordem de Exibição
          </label>
          <Input
            {...register('orderQueue', { valueAsNumber: true })}
            type="number"
            id="orderQueue"
            min="1"
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Define a ordem em que a fila aparecerá na lista
          </p>
          {errors.orderQueue && (
            <p className="mt-1 text-sm text-red-600">{errors.orderQueue.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            {...register('isActive')}
            type="checkbox"
            id="isActive"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Fila ativa
          </label>
        </div>

        {/* Mensagem de Boas-vindas */}
        <div>
          <label htmlFor="greetingMessage" className="block text-sm font-medium text-gray-700">
            Mensagem de Boas-vindas
          </label>
          <textarea
            {...register('greetingMessage')}
            id="greetingMessage"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Mensagem enviada quando o usuário entra na fila..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Opcional. Será enviada automaticamente quando o usuário for direcionado para esta fila.
          </p>
        </div>

        {/* Mensagem Fora do Horário */}
        <div>
          <label htmlFor="outOfHoursMessage" className="block text-sm font-medium text-gray-700">
            Mensagem Fora do Horário
          </label>
          <textarea
            {...register('outOfHoursMessage')}
            id="outOfHoursMessage"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Mensagem enviada quando não há atendentes online..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Opcional. Será enviada quando não houver atendentes disponíveis nesta fila.
          </p>
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
          {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Fila' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}