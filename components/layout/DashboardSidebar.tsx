'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  Settings,
  TrendingUp,
  Download,
  FileText,
  HelpCircle
} from 'lucide-react'

const navigation = [
  { 
    name: 'Chat', 
    href: '/dashboard/chat', 
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  { 
    name: 'Diário', 
    href: '/dashboard/diary', 
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    name: 'Análises', 
    href: '/dashboard/analytics', 
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    name: 'Configurações', 
    href: '/dashboard/settings', 
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
]

const quickActions = [
  { name: 'Nova Operação', icon: TrendingUp, action: () => alert('Abrir formulário de operação') },
  { name: 'Importar CSV', icon: Download, action: () => alert('Importar do Profit') },
  { name: 'Gerar Relatório', icon: FileText, action: () => alert('Gerar relatório') },
  { name: 'Ajuda', icon: HelpCircle, action: () => alert('Abrir ajuda') },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 bg-white border-r min-h-[calc(100vh-80px)]">
      <div className="p-6">
        {/* Navegação Principal */}
        <nav className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Navegação
          </h3>
          
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? `${item.bgColor} ${item.color} font-medium` 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} className={isActive ? item.color : 'text-gray-400'} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Ações Rápidas
          </h3>
          
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={action.action}
                className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
              >
                <action.icon size={20} className="text-gray-400" />
                <span>{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-2"> Seu Progresso</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Operações</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div className="h-full bg-purple-600 rounded-full w-0"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dias Consecutivos</span>
                <span className="font-semibold">1</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div className="h-full bg-green-600 rounded-full w-1/12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
