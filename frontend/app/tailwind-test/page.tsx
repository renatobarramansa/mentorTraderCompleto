export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho com cores Tailwind PURAS */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl">
          <h1 className="text-4xl font-bold text-white text-center mb-4">
            🎨 TESTE TAILWIND CSS
          </h1>
          <p className="text-purple-100 text-center">
            Se você ver cores e estilos abaixo, o Tailwind está funcionando!
          </p>
        </div>

        {/* Grid de testes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1 - Cores básicas */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cores Tailwind</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-100 text-red-800 rounded-lg">
                <span>bg-red-100</span>
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-100 text-green-800 rounded-lg">
                <span>bg-green-100</span>
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-100 text-blue-800 rounded-lg">
                <span>bg-blue-100</span>
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>

          {/* Card 2 - Tipografia */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Tipografia</h2>
            <div className="space-y-2">
              <p className="text-xs">text-xs - Pequeno</p>
              <p className="text-sm">text-sm - Menor</p>
              <p className="text-base">text-base - Normal</p>
              <p className="text-lg font-medium">text-lg - Grande</p>
              <p className="text-xl font-semibold">text-xl - Extra Grande</p>
              <p className="text-2xl font-bold">text-2xl - Título</p>
            </div>
          </div>

          {/* Card 3 - Espaçamento */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-6 rounded-xl shadow-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Espaçamento & Bordas</h2>
            <div className="space-y-4">
              <div className="p-2 bg-white/20 rounded">p-2 rounded</div>
              <div className="p-4 bg-white/20 rounded-lg">p-4 rounded-lg</div>
              <div className="p-6 bg-white/20 rounded-xl">p-6 rounded-xl</div>
              <button className="w-full py-3 px-4 bg-white text-cyan-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Botão Teste
              </button>
            </div>
          </div>
        </div>

        {/* Barra de status */}
        <div className="bg-gray-800 text-white p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-center">STATUS DO TAILWIND</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-green-600 p-3 rounded text-center text-sm">✅ Instalado</div>
            <div className="bg-green-600 p-3 rounded text-center text-sm">✅ Configurado</div>
            <div className="bg-green-600 p-3 rounded text-center text-sm">✅ CSS Carregado</div>
            <div className="bg-yellow-500 p-3 rounded text-center text-sm">⌛ Processando</div>
          </div>
          <p className="mt-4 text-center text-gray-300 text-sm">
            <strong>DICA:</strong> Inspecione esta página (F12) e veja se as classes Tailwind aparecem no HTML
          </p>
        </div>

        {/* Instruções de debug */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Se NÃO estiver formatado:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. Aperte F12 → Elements → Procure por "class=" no HTML</li>
            <li>2. Veja se as classes Tailwind (bg-purple-600, p-6, etc) estão no HTML</li>
            <li>3. Verifique Console (F12) por erros</li>
            <li>4. Olhe borda verde ao redor da página (indica CSS carregado)</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
