import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                 Mentor Trader Pro
              </h1>
              <p className="text-purple-100">
                Assistente especializado em trading e programação NTSL
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                   Análise Técnica
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                   Código NTSL
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                   IA Integrada
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                 Recursos
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2"></span>
                  <span className="text-gray-700">Geração de código NTSL</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2"></span>
                  <span className="text-gray-700">Estratégias de trading</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2"></span>
                  <span className="text-gray-700">Análise técnica</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2"></span>
                  <span className="text-gray-700">Gestão de risco</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2"></span>
                  <span className="text-gray-700">Explicações detalhadas</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-3">
                 Dicas Rápidas
              </h3>
              <div className="space-y-2 text-sm">
                <p> Use "Criar estratégia de médias móveis" para código NTSL</p>
                <p> Pergunte sobre indicadores técnicos</p>
                <p> Configure seu nível de experiência nas configurações</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                 Tecnologias
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Next.js 14
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Tailwind CSS
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  TypeScript
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  React 18
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                   Chat com o Mentor
                </h2>
                <div className="text-sm text-gray-600">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    Online
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Converse com o assistente IA especializado em trading. Peça códigos NTSL, 
                estratégias, explicações técnicas e muito mais.
              </p>
            </div>

            {/* Chat Interface Component */}
            <ChatInterface />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>
            Mentor Trader Pro  Assistente especializado em trading e programação NTSL
          </p>
          <p className="mt-2">
            Para uso educacional  Não são dadas recomendações de investimento
          </p>
        </div>
      </main>
    </div>
  );
}
