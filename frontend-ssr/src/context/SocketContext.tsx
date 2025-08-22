'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextData {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: number[]
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<number[]>([])
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080', {
        transports: ['websocket', 'polling'],
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id,
        },
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        console.log('Socket connected:', newSocket.id)
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
        console.log('Socket disconnected')
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      // User presence events
      newSocket.on('userOnline', (userId: number) => {
        setOnlineUsers(prev => Array.from(new Set([...prev, userId])))
      })

      newSocket.on('userOffline', (userId: number) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId))
      })

      newSocket.on('onlineUsers', (users: number[]) => {
        setOnlineUsers(users)
      })

      // Real-time events for components
      newSocket.on('ticket:update', (ticket) => {
        window.dispatchEvent(new CustomEvent('ticketUpdate', { detail: ticket }))
      })

      newSocket.on('ticket:new', (ticket) => {
        window.dispatchEvent(new CustomEvent('ticketNew', { detail: ticket }))
      })

      newSocket.on('message:new', (message) => {
        window.dispatchEvent(new CustomEvent('messageNew', { detail: message }))
      })

      newSocket.on('contact:update', (contact) => {
        window.dispatchEvent(new CustomEvent('contactUpdate', { detail: contact }))
      })

      newSocket.on('whatsapp:session', (session) => {
        window.dispatchEvent(new CustomEvent('whatsappSession', { detail: session }))
      })

      newSocket.on('whatsapp:qrcode', (qrcode) => {
        window.dispatchEvent(new CustomEvent('whatsappQRCode', { detail: qrcode }))
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
        setOnlineUsers([])
      }
    }
  }, [isAuthenticated, user])

  const joinRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('joinRoom', room)
      console.log('Joined room:', room)
    }
  }

  const leaveRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('leaveRoom', room)
      console.log('Left room:', room)
    }
  }

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      onlineUsers, 
      joinRoom, 
      leaveRoom 
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}