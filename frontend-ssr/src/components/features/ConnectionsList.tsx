'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DevicePhoneMobileIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  QrCodeIcon,
  Battery0Icon,
  WifiIcon,
  StarIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline'
import { Connection, connectionsService } from '@/services/connections'
import Button from '@/components/ui/Button'

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
}

interface ConnectionsListProps {
  connections: Connection[]
  pagination: Pagination
}

function getStatusColor(status: string) {
  switch (status) {
    case 'CONNECTED':
      return 'bg-green-100 text-green-800'
    case 'DISCONNECTED':
      return 'bg-red-100 text-red-800'
    case 'PAIRING':
      return 'bg-yellow-100 text-yellow-800'
    case 'TIMEOUT':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'CONNECTED':
      return 'Conectado'
    case 'DISCONNECTED':
      return 'Desconectado'
    case 'PAIRING':
      return 'Pareando'
    case 'TIMEOUT':
      return 'Timeout'
    default:
      return status
  }
}

export default function ConnectionsList({ connections, pagination }: ConnectionsListProps) {
  const [loadingAction, setLoadingAction] = useState<number | null>(null)
  const [showQRCode, setShowQRCode] = useState<number | null>(null)
  const [qrCodeData, setQRCodeData] = useState<string | null>(null)

  const handleRestart = async (connectionId: number) => {
    setLoadingAction(connectionId)
    try {
      await connectionsService.restartConnection(connectionId)
      // TODO: Refresh page or update state
      window.location.reload()
    } catch (error) {
      console.error('Failed to restart connection:', error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDisconnect = async (connectionId: number) => {
    setLoadingAction(connectionId)
    try {
      await connectionsService.disconnectConnection(connectionId)
      // TODO: Refresh page or update state
      window.location.reload()
    } catch (error) {
      console.error('Failed to disconnect connection:', error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleShowQRCode = async (connectionId: number) => {
    try {
      const response = await connectionsService.getQRCode(connectionId)
      setQRCodeData(response.qrcode)
      setShowQRCode(connectionId)
    } catch (error) {
      console.error('Failed to get QR code:', error)
    }
  }

  if (connections.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma conexão encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há conexões que correspondam aos critérios de busca.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {/* Connection Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      connection.status === 'CONNECTED' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <DevicePhoneMobileIcon className={`h-6 w-6 ${
                        connection.status === 'CONNECTED' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>

                  {/* Connection Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {connection.name}
                      </h3>
                      {connection.isDefault && (
                        <StarIcon className="h-4 w-4 text-yellow-500" title="Conexão padrão" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Sessão: {connection.session}
                    </p>
                    <div className="mt-1 text-xs text-gray-500">
                      Criado {formatDistanceToNow(new Date(connection.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                  <WifiIcon className="h-3 w-3 mr-1" />
                  {getStatusText(connection.status)}
                </span>
              </div>

              {/* Battery and Connection Info */}
              {connection.status === 'CONNECTED' && (
                <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                  {connection.battery !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Battery0Icon className="h-3 w-3" />
                      <span>{connection.battery}%</span>
                      {connection.plugged && (
                        <span className="text-green-600">⚡</span>
                      )}
                    </div>
                  )}
                  {connection.retries > 0 && (
                    <span>Tentativas: {connection.retries}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex space-x-2">
                  {/* QR Code */}
                  {connection.status !== 'CONNECTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowQRCode(connection.id)}
                      className="flex items-center"
                    >
                      <QrCodeIcon className="h-3 w-3 mr-1" />
                      QR Code
                    </Button>
                  )}

                  {/* Restart */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestart(connection.id)}
                    disabled={loadingAction === connection.id}
                    className="flex items-center"
                  >
                    <ArrowPathIcon className={`h-3 w-3 mr-1 ${loadingAction === connection.id ? 'animate-spin' : ''}`} />
                    Reiniciar
                  </Button>

                  {/* Connect/Disconnect */}
                  {connection.status === 'CONNECTED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      disabled={loadingAction === connection.id}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <StopIcon className="h-3 w-3 mr-1" />
                      Desconectar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestart(connection.id)}
                      disabled={loadingAction === connection.id}
                      className="flex items-center text-green-600 hover:text-green-700"
                    >
                      <PlayIcon className="h-3 w-3 mr-1" />
                      Conectar
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/connections/${connection.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                    title="Editar conexão"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                    title="Excluir conexão"
                    onClick={() => {
                      // TODO: Implement delete confirmation modal
                      console.log('Delete connection:', connection.id)
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              {(connection.greetingMessage || connection.farewellMessage) && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
                  {connection.greetingMessage && (
                    <div>
                      <span className="font-medium text-gray-700">Saudação:</span>
                      <p className="text-gray-600 truncate">{connection.greetingMessage}</p>
                    </div>
                  )}
                  {connection.farewellMessage && (
                    <div>
                      <span className="font-medium text-gray-700">Despedida:</span>
                      <p className="text-gray-600 truncate">{connection.farewellMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* QR Code Modal */}
        {showQRCode && qrCodeData && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  QR Code para Conexão
                </h3>
                <div className="mb-4">
                  <img 
                    src={qrCodeData} 
                    alt="QR Code" 
                    className="mx-auto max-w-full h-auto"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Escaneie este código com o WhatsApp para conectar
                </p>
                <Button
                  onClick={() => {
                    setShowQRCode(null)
                    setQRCodeData(null)
                  }}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Mostrando {connections.length} de {pagination.totalCount} conexões
            </div>
            <div className="flex space-x-2">
              {/* TODO: Implementar paginação completa */}
              <span className="text-sm text-gray-500">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}