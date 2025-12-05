export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
           Mentor Trader Pro
        </h1>
        <p className="text-gray-600 mb-6">
          Sistema funcionando com Next.js 14 e Tailwind CSS
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold"></span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Next.js 14</h3>
                <p className="text-sm text-gray-600">Framework React instalado</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold"></span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Tailwind CSS v3</h3>
                <p className="text-sm text-gray-600">
                  Se esta caixa tem cores, o Tailwind está funcionando!
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold"></span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Próximo Passo</h3>
                <p className="text-sm text-gray-600">
                  Adicione o componente ChatInterface
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            Para usar o chat, crie: <code>components/chat/ChatInterface.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}
