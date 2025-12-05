'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [traderLevel, setTraderLevel] = useState('intermediario')
  const [traderName, setTraderName] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSave = () => {
    localStorage.setItem('mentorTraderConfig', JSON.stringify({
      traderLevel,
      traderName,
      notifications,
      darkMode
    }))
    alert('Configurações salvas!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900"> Configurações</h1>
        <p className="text-gray-600 mt-2">
          Personalize sua experiência no Mentor Trader
        </p>
      </div>

      <div className="bg-white rounded-xl shadow divide-y">
        {/* Perfil */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4"> Perfil</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Trader
              </label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Trading
              </label>
              <select
                value={traderLevel}
                onChange={(e) => setTraderLevel(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="iniciante"> Iniciante</option>
                <option value="intermediario"> Intermediário</option>
                <option value="avancado"> Avançado</option>
                <option value="profissional"> Profissional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4"> Preferências</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificações</p>
                <p className="text-sm text-gray-600">Receba alertas importantes</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications ? 'bg-purple-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Modo Escuro</p>
                <p className="text-sm text-gray-600">Tema escuro para melhor visualização</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-gray-900' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="p-6">
          <div className="flex justify-end space-x-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
