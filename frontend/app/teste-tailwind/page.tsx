export default function TesteTailwind() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-6">
          ✅ Tailwind CSS Funcionando!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Classes Tailwind Testadas:
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span>Background colors (bg-white, bg-purple-50)</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span>Text styling (text-4xl, font-bold)</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span>Padding/Margin (p-8, mb-6)</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span>Grid layout (grid, grid-cols-1)</span>
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span>Border radius (rounded-xl)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Botões com Tailwind:
            </h2>
            <div className="space-y-4">
              <button className="w-full px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow">
                Botão Primário
              </button>
              <button className="w-full px-6 py-3 bg-purple-800 text-white font-semibold rounded-lg hover:bg-purple-900 transition-colors">
                Botão Secundário
              </button>
              <button className="w-full px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Botão Outline
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 text-white p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Status da Instalação:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-green-600 rounded text-center">✅ Instalado</div>
            <div className="p-3 bg-green-600 rounded text-center">✅ Configurado</div>
            <div className="p-3 bg-green-600 rounded text-center">✅ Importado</div>
            <div className="p-3 bg-green-600 rounded text-center">✅ Funcionando</div>
          </div>
          <p className="mt-4 text-gray-300">
            Se você está vendo estilos, cores e layout, o Tailwind está funcionando!
          </p>
        </div>
      </div>
    </div>
  )
}
