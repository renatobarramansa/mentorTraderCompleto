'use client'

import DashboardHeader from "../../../components/layout/DashboardHeader"
import DashboardSidebar from "../../../components/layout/DashboardSidebar"
export default function PublicDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Publico</h1>
            <p className="text-gray-600 mb-8">
              Autenticacao removida. Acesso direto permitido.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Chat IA</h3>
                <p className="text-gray-600 mt-2">Acesse o assistente de trading</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Diario</h3>
                <p className="text-gray-600 mt-2">Registre suas operacoes</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Configuracoes</h3>
                <p className="text-gray-600 mt-2">Ajuste suas preferencias</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
