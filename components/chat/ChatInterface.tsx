'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Ícones SVG inline
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
)

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
)

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
)

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Mentor Trader Pro. \n\nComo posso ajudá-lo hoje?\n Deseja um código NTSL?\n Precisa de uma estratégia?\n Tem dúvidas sobre trading?\n\nEstou aqui para ajudar!',
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
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Recebi sua mensagem:** "${input}"\n\n**Configuração atual:**\n Nível: ${traderLevel}\n Nome: ${traderName || 'Não informado'}\n\n**Exemplo de código NTSL:**\n\`\`\`\n// Estrategia de Medias Moveis\ninput\n    PeriodoRapida(9);\n    PeriodoLenta(21);\n\nvar\n    mediaRapida, mediaLenta: Float;\n\nbegin\n    mediaRapida := Media(PeriodoRapida, Close);\n    mediaLenta := Media(PeriodoLenta, Close);\n    \n    if mediaRapida > mediaLenta then\n        PaintBar(clGreen)\n    else\n        PaintBar(clRed);\nend;\n\`\`\`\n\n*Esta é uma resposta simulada. Em produção, integrar com API de IA.*`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ' Erro ao processar sua mensagem. Por favor, tente novamente.',
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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white"></span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Mentor Trader Pro</h2>
              <div className="flex items-center space-x-2 text-sm text-purple-100">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {traderLevel}
                </span>
                <span></span>
                <span>NTSL Expert</span>
                {traderName && (
                  <>
                    <span></span>
                    <span className="font-medium">{traderName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm md:text-base">{message.content}</div>
              
              {message.content.includes('```') && (
                <div className="mt-3 space-y-2">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-gray-100 text-xs md:text-sm overflow-x-auto font-mono">
                      {message.content.match(/```[\s\S]*?```/)?.[0].replace(/```/g, '') || ''}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyCode(message.content.match(/```[\s\S]*?```/)?.[0].replace(/```/g, '') || '')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <CopyIcon /> Copiar Código
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
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <DownloadIcon /> Download
                    </button>
                  </div>
                </div>
              )}
              
              <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl p-4 bg-white border border-gray-200 rounded-bl-none">
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
      <div className="border-t border-gray-200 p-4 bg-white">
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
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-md'
            }`}
          >
            <SendIcon />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: João Trader"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Experiência
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'iniciante', label: 'Iniciante' },
                    { value: 'intermediario', label: 'Intermediário' },
                    { value: 'avancado', label: 'Avançado' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setTraderLevel(level.value)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        traderLevel === level.value
                          ? 'ring-2 ring-offset-1'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={traderLevel === level.value ? {
                        backgroundColor: level.value === 'iniciante' ? '#dcfce7' : 
                                        level.value === 'intermediario' ? '#dbeafe' : 
                                        '#f3e8ff',
                        color: level.value === 'iniciante' ? '#166534' : 
                               level.value === 'intermediario' ? '#1e40af' : 
                               '#7c3aed',
                        boxShadow: '0 0 0 2px currentColor'
                      } : {}}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
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
                    alert('Configurações salvas!')
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
