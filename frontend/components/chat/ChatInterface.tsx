'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Copy, Download, Settings } from 'lucide-react'
//import { getSystemPrompt } from '../../lib/prompts/systemPrompt'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Mentor Trader Pro. 👋\n\nComo posso ajudá-lo hoje?\n• Deseja um código NTSL?\n• Precisa de uma estratégia?\n• Tem dúvidas sobre trading?\n\nEstou aqui para ajudar!',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [traderLevel, setTraderLevel] = useState('intermediario')
  const [traderName, setTraderName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load config
  useEffect(() => {
    const saved = localStorage.getItem('mentorTraderConfig')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        if (config.traderLevel) setTraderLevel(config.traderLevel)
        if (config.traderName) setTraderName(config.traderName)
      } catch (err) {
        console.error('Erro ao carregar configurações:', err)
      }
    }
  }, [])

  // Save config
  const saveConfig = (level: string, name: string) => {
    const config = { traderLevel: level, traderName: name }
    localStorage.setItem('mentorTraderConfig', JSON.stringify(config))
    setTraderLevel(level)
    setTraderName(name)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

     // const systemPrompt = getSystemPrompt(traderName, traderLevel as any)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Recebi sua mensagem:** "${input}"\n\n**Configuração atual:**\n• Nível: ${traderLevel}\n• Nome: ${traderName || 'Não informado'}\n\n**Exemplo de código NTSL:**\n\`\`\`\n// Estrategia de Medias Moveis\ninput\n    PeriodoRapida(9);\n    PeriodoLenta(21);\n\nvar\n    mediaRapida, mediaLenta: Float;\n\nbegin\n    mediaRapida := Media(PeriodoRapida, Close);\n    mediaLenta := Media(PeriodoLenta, Close);\n    \n    if mediaRapida > mediaLenta then\n        PaintBar(clGreen)\n    else\n        PaintBar(clRed);\nend;\n\`\`\`\n\n*Em produção, esta resposta viria da API da OpenAI com sua chave configurada.*`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => alert('Código copiado!'))
      .catch(() => alert('Erro ao copiar'))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="border-b p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white">🤖</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mentor de Trading</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {traderLevel}
                </span>
                <span>•</span>
                <span>NTSL Expert</span>
                {traderName && (
                  <>
                    <span>•</span>
                    <span className="text-gray-700 font-medium">{traderName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              {message.content.includes('```') && (
                <div className="mt-3 space-y-2">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-gray-100 text-sm overflow-x-auto">
                      {message.content.match(/```[\s\S]*?```/)?.[0].replace(/```/g, '') || ''}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyCode(message.content.match(/```[\s\S]*?```/)?.[0].replace(/```/g, '') || '')}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Copy size={14} /> Copiar Código
                    </button>
                    <button
                      onClick={() => {
                        const code = message.content.match(/```[\s\S]*?```/)?.[0].replace(/```/g, '') || ''
                        const blob = new Blob([code], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'estrategia_ntsl.txt'
                        a.click()
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              )}
              <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Digite sua pergunta sobre trading, estratégias ou código NTSL..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`px-6 rounded-xl flex items-center justify-center gap-2 transition-all ${
              loading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg'
            }`}
          >
            <Send size={20} />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="font-medium">Sugestões:</span>
          {['Criar estratégia de médias móveis', 'Como usar stop loss?', 'Código para RSI', 'Estratégia de reversão'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configurações do Trader</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu Nome (opcional)
                </label>
                <input
                  type="text"
                  value={traderName}
                  onChange={(e) => setTraderName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: João Trader"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Experiência
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'iniciante', label: 'Iniciante', color: 'bg-green-100 text-green-700' },
                    { value: 'intermediario', label: 'Intermediário', color: 'bg-blue-100 text-blue-700' },
                    { value: 'avancado', label: 'Avançado', color: 'bg-purple-100 text-purple-700' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setTraderLevel(level.value)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        traderLevel === level.value
                          ? `${level.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {traderLevel === 'iniciante' && 'Explicações detalhadas e exemplos básicos'}
                  {traderLevel === 'intermediario' && 'Estratégias mais complexas com menos explicações'}
                  {traderLevel === 'avancado' && 'Códigos avançados e otimizações de performance'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    saveConfig(traderLevel, traderName)
                    setShowSettings(false)
                    alert('Configurações salvas com sucesso!')
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}