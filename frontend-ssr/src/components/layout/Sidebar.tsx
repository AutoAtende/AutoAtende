'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useAuth } from '@/context/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tickets', href: '/tickets', icon: ChatBubbleLeftRightIcon },
  { name: 'Contatos', href: '/contacts', icon: UsersIcon },
  { name: 'Conexões', href: '/connections', icon: PhoneIcon },
  { name: 'Usuários', href: '/users', icon: UserGroupIcon },
  { name: 'Filas', href: '/queues', icon: DocumentTextIcon },
  { name: 'Relatórios', href: '/reports', icon: ChartBarIcon },
  { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={clsx('lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 z-50 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div className="w-14 flex-shrink-0" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-gray-900 pt-5">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </>
  )

  function SidebarContent() {
    return (
      <>
        <div className="flex shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-white">AutoAtende</h1>
        </div>
        <div className="mt-5 flex flex-1 flex-col">
          <nav className="flex-1 space-y-1 px-2 pb-4">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* User section */}
        <div className="flex shrink-0 bg-gray-800 p-4">
          <div className="group block w-full">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <button
                  onClick={signOut}
                  className="text-xs font-medium text-gray-300 hover:text-white"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}