'use client'
import './globals.css'
import { Home, MessageSquare, BookOpen, Settings, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardSidebar() {
  const router = useRouter()

  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <TrendingUp size={20} />, label: 'Trading', path: '/trading' },
    { icon: <MessageSquare size={20} />, label: 'Chat IA', path: '/dashboard/chat' },
    { icon: <BookOpen size={20} />, label: 'Diário', path: '/diary' },
    { icon: <Settings size={20} />, label: 'Configurações', path: '/settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navegação
          </h2>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 px-3">
            Modo público — Autenticação desativada
          </p>
        </div>
      </nav>
    </aside>
  )
}
