'use client'

import { signOut, useSession } from 'next-auth/react'
import { Bell, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function DashboardHeader() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-xl text-white"></span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mentor Trader</h1>
                {session?.user?.traderLevel && (
                  <span className="text-xs text-purple-600 font-medium">
                    Nível: {session.user.traderLevel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar operações, estratégias..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="hidden md:block h-6 w-px bg-gray-300" />

            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || 'Trader'}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.email || 'usuario@exemplo.com'}
                </p>
              </div>
              
              <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(session?.user?.name?.[0] || 'T').toUpperCase()}
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg hidden md:block"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
