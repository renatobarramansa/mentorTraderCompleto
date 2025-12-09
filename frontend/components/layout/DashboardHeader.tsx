'use client'
import './globals.css'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardHeader() {
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Usuário padrão (sem autenticação)
  const user = {
    name: 'Visitante Trader',
    email: 'visitante@mentortrader.com',
    traderLevel: 'Convidado'
  }

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none lg:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span className="sr-only">Abrir menu lateral</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5" />
              </div>
              <input
                className="block w-full h-full pl-8 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none sm:text-sm"
                placeholder="Buscar operações, estratégias..."
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center md:ml-6">
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Notificações</span>
            <Bell className="h-6 w-6" />
          </button>

          <div className="ml-3 relative">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
                <p className="text-xs text-purple-600 font-medium">
                  Nível: {user.traderLevel}
                </p>
              </div>

              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
